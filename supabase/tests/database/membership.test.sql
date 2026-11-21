begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(54);

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('5db87197-0d49-4ef5-92ba-64b6f046af01', 'spec-admin@example.test', now(), '{}'),
  ('5db87197-0d49-4ef5-92ba-64b6f046af02', 'unconfirmed@example.test', null, '{}'),
  ('5db87197-0d49-4ef5-92ba-64b6f046af03', 'first-applicant@example.test', now(), '{"role":"admin"}'),
  ('5db87197-0d49-4ef5-92ba-64b6f046af04', 'second-applicant@example.test', now(), '{}'),
  ('5db87197-0d49-4ef5-92ba-64b6f046af05', 'rejected-applicant@example.test', now(), '{}');

create temp table request_ids (name text primary key, id uuid not null);
grant select, insert on request_ids to authenticated;
grant select on request_ids to service_role;

create temp table claimed_mail (
  id uuid, recipient text, template text, idempotency_key text, encrypted_payload text,
  attempts integer, request_id uuid, locale text, lease_id uuid, full_name text, requested_role text,
  user_id uuid, applicant_email text
);
grant select, insert on claimed_mail to service_role;

select throws_ok($$select private.provision_admin('absent@example.test')$$, '22023',
  'Exactly one Auth identity is required', 'provisioning requires an existing identity');
select throws_ok($$select private.provision_admin('unconfirmed@example.test')$$, '22023',
  'A confirmed Auth identity is required', 'provisioning requires email confirmation');
insert into auth.users (id, email, email_confirmed_at, is_sso_user) values
  ('5db87197-0d49-4ef5-92ba-64b6f046af06', 'SECOND-APPLICANT@example.test', now(), true);
select throws_ok($$select private.provision_admin('second-applicant@example.test')$$, '22023',
  'Exactly one Auth identity is required', 'provisioning refuses an ambiguous normalized email');
select is(private.provision_admin('SPEC-ADMIN@example.test'), '5db87197-0d49-4ef5-92ba-64b6f046af01'::uuid,
  'a confirmed user can be provisioned as admin');
select is(private.provision_admin('spec-admin@example.test'), '5db87197-0d49-4ef5-92ba-64b6f046af01'::uuid,
  're-running provisioning preserves the existing admin');
select throws_ok($$select private.provision_admin('first-applicant@example.test')$$, '23505', null,
  'provisioning rejects a second admin');

set local role anon;
select throws_ok('select user_id from public.memberships', '42501', null, 'anon cannot query memberships');
select throws_ok($$select public.create_registration_request('editor', 'Anon', 'es')$$, '42501', null,
  'anon cannot create a request');
reset role;

set local role authenticated;
set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af02';
select throws_ok($$select public.create_registration_request('editor', 'Unconfirmed', 'es')$$, '42501',
  'Registration requires a confirmed applicant', 'an unconfirmed identity cannot request membership');

set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af03';
select throws_ok($$select public.create_registration_request('admin', 'Applicant', 'es')$$, '22023',
  'Invalid registration details', 'a member cannot request admin');
insert into request_ids values ('first', public.create_registration_request('editor', 'First Applicant', 'es'));
select is(public.create_registration_request('revisor', 'Different Name', 'en'),
  (select id from request_ids where name = 'first'), 'repeat registration returns the original request');
select is((select requested_role::text from public.registration_requests), 'editor',
  'repeat registration does not change the original role');
select throws_ok($$update public.registration_requests set status = 'approved'$$, '42501', null,
  'direct updates cannot approve requests');
select throws_ok($$insert into public.memberships (user_id, role, status) values (auth.uid(), 'editor', 'pending')$$,
  '42501', null, 'a user cannot create a membership directly');
select throws_ok($$select public.decide_registration_request(auth.uid(), gen_random_uuid(), 'reject', null, null, null)$$,
  '42501', null, 'a caller cannot access the privileged decision RPC');
select throws_ok($$select public.record_denied_registration_decision('forbidden', auth.uid())$$,
  '42501', null, 'an authenticated caller cannot write audit records directly');
select throws_ok('select * from private.email_deliveries', '42501', null, 'the private queue has no client grants');
select is((select count(*) from public.admin_verification_delivery_statuses()), 0::bigint,
  'user-supplied role metadata cannot authorize admin reporting');

set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af04';
insert into request_ids values ('second', public.create_registration_request('revisor', 'Second Applicant', 'en'));
select is((select count(*) from public.registration_requests), 1::bigint, 'an applicant sees only their request');
select is(public.verify_registration_code(repeat('a', 64)), 'not-eligible', 'an applicant cannot verify before approval');

set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af05';
insert into request_ids values ('rejected', public.create_registration_request('editor', 'Rejected Applicant', 'es'));

set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af01';
select is((select count(*) from public.registration_requests), 3::bigint, 'admin can see all requests');
reset role;

select is((select count(*) from private.email_deliveries where template = 'admin-notification'), 3::bigint,
  'duplicate registration creates no duplicate administrative email');

set local role service_role;
select lives_ok($$select public.record_denied_registration_decision('unexpected value')$$,
  'the trusted transport can record a denied decision');
select is(public.decide_registration_request('5db87197-0d49-4ef5-92ba-64b6f046af03',
  (select id from request_ids where name = 'first'), 'approve', 'revisor', repeat('a', 64), 'ciphertext-a'),
  'forbidden', 'trusted transport still checks the supplied decision actor');
select is(public.decide_registration_request('5db87197-0d49-4ef5-92ba-64b6f046af01',
  (select id from request_ids where name = 'first'), 'approve', 'revisor', repeat('a', 64), 'ciphertext-a'),
  'applied', 'admin approves and can assign the other editorial role');
select is(public.decide_registration_request('5db87197-0d49-4ef5-92ba-64b6f046af01',
  (select id from request_ids where name = 'first'), 'reject', null, null, null),
  'already-decided', 'an incompatible retry cannot change an approved request');
select is(public.decide_registration_request('5db87197-0d49-4ef5-92ba-64b6f046af01',
  (select id from request_ids where name = 'second'), 'approve', 'editor', repeat('b', 64), 'ciphertext-b'),
  'applied', 'second identity has its own separate challenge');
select is(public.decide_registration_request('5db87197-0d49-4ef5-92ba-64b6f046af01',
  (select id from request_ids where name = 'rejected'), 'reject', null, null, null),
  'applied', 'admin can reject a pending request');
select is(public.resend_verification_code('5db87197-0d49-4ef5-92ba-64b6f046af03', repeat('d', 64), 'ciphertext-d'),
  'cooldown', 'resend is blocked for 60 seconds');
insert into claimed_mail select * from public.claim_email_deliveries(50);
select is((select count(*) from public.claim_email_deliveries(50)), 0::bigint,
  'a second worker cannot claim an active lease');
select lives_ok($$select public.complete_email_delivery(id, lease_id, 'retry', 'provider-transient')
  from claimed_mail where template = 'activation-code' and request_id = (select id from request_ids where name = 'first')$$,
  'a transient delivery failure can be retried');
reset role;

select is((select result from private.audit_events where action = 'decision-denied'), 'invalid-input',
  'the stored result contains a fixed category rather than supplied text');
select is((select status::text from public.memberships where user_id = '5db87197-0d49-4ef5-92ba-64b6f046af03'),
  'pending', 'approval and failed email leave activation pending');
select is((select count(*) from private.verification_challenges), 2::bigint,
  'there is one challenge per approval and none for rejection');
select is((select count(*) from private.audit_events where action in ('approve', 'reject')), 5::bigint,
  'decision retries and denied attempts are audited');

set local role authenticated;
set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af01';
select is((select count(*) from public.admin_verification_delivery_statuses()), 2::bigint,
  'the active admin sees the two activation delivery statuses');
reset role;

update private.email_deliveries set available_at = now() - interval '1 second'
where challenge_id is not null and request_id = (select id from request_ids where name = 'first');

set local role service_role;
select is((select retry.idempotency_key from public.claim_email_deliveries(50) as retry),
  (select idempotency_key from claimed_mail where template = 'activation-code'
    and request_id = (select id from request_ids where name = 'first')),
  'the provider idempotency key remains stable after reclaim');
select lives_ok($$select public.complete_email_delivery(id, lease_id, 'sent', null)
  from claimed_mail where template = 'activation-code' and request_id = (select id from request_ids where name = 'first')$$,
  'stale acknowledgements are ignored safely');
reset role;
select is((select status::text from private.email_deliveries where template = 'activation-code'
  and request_id = (select id from request_ids where name = 'first')), 'processing', 'the current worker keeps its lease');

set local role authenticated;
set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af04';
select is(public.registration_email_status((select id from request_ids where name = 'first')), null::text,
  'a member cannot inspect another user delivery');
select is(public.verify_registration_code(repeat('a', 64)), 'invalid',
  'the first applicant code does not activate another identity');

set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af03';
select is(public.registration_email_status((select id from request_ids where name = 'first')), 'processing',
  'the owner sees retry state without the payload');
select is(public.verify_registration_code(repeat('e', 64)), 'invalid', 'wrong code is rejected');
do $$begin perform public.verify_registration_code(repeat('e', 64)) from generate_series(1, 3); end$$;
select is(public.verify_registration_code(repeat('e', 64)), 'locked', 'fifth failure locks the challenge');
select is(public.verify_registration_code(repeat('a', 64)), 'locked', 'a locked code cannot activate even if correct');
reset role;

update private.verification_challenges set created_at = now() - interval '61 seconds',
  expires_at = now() - interval '61 seconds' + interval '10 minutes'
where request_id = (select id from request_ids where name = 'first');
update private.verification_challenges set created_at = now() - interval '10 minutes', expires_at = now()
where request_id = (select id from request_ids where name = 'second');
update private.email_deliveries set expires_at = now()
where template = 'activation-code' and request_id = (select id from request_ids where name = 'second');
select private.expire_email_deliveries(now());
select is((select encrypted_payload from private.email_deliveries where template = 'activation-code'
  and request_id = (select id from request_ids where name = 'second')), null::text,
  'expiration removes the pending encrypted payload');

set local role service_role;
select is(public.resend_verification_code('5db87197-0d49-4ef5-92ba-64b6f046af03', repeat('a', 64), 'ciphertext-a'),
  'same-code', 'resend never reuses the previous code');
select is(public.resend_verification_code('5db87197-0d49-4ef5-92ba-64b6f046af03', repeat('d', 64), 'ciphertext-d'),
  'issued', 'resend can issue a new challenge after the cooldown');
reset role;

set local role authenticated;
set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af04';
select is(public.verify_registration_code(repeat('b', 64)), 'expired', 'code is expired at the ten-minute boundary');
set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af03';
select is(public.verify_registration_code(repeat('a', 64)), 'invalid', 'a resent code supersedes the old code');
select is(public.verify_registration_code(repeat('d', 64)), 'verified', 'a correct current code activates its owner');
select is(public.verify_registration_code(repeat('d', 64)), 'not-eligible', 'a consumed code cannot be reused');
select is((select role::text || '/' || status::text from public.memberships), 'revisor/active',
  'activation uses the assigned role and transitions the membership to active');
set local "request.jwt.claim.sub" = '5db87197-0d49-4ef5-92ba-64b6f046af05';
select is((select status::text from public.memberships), 'rejected', 'rejection does not grant editorial access');
reset role;

select * from finish();
rollback;
