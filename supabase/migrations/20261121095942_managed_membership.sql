create schema if not exists private;
revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema private to authenticated, service_role;

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create type public.membership_role as enum ('admin', 'editor', 'revisor');
create type public.membership_status as enum ('pending', 'active', 'rejected');
create type public.registration_status as enum ('pending', 'approved', 'rejected');
create type private.email_template as enum ('admin-notification', 'activation-code');
create type private.email_status as enum ('pending', 'processing', 'sent', 'failed');

create table public.memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.membership_role not null,
  status public.membership_status not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  activated_at timestamptz,
  activated_by uuid references auth.users(id) on delete set null,
  check ((status = 'active') = (activated_at is not null)),
  check (role <> 'admin' or status = 'active')
);

create unique index memberships_single_admin on public.memberships (role) where role = 'admin';
create index memberships_activated_by_idx on public.memberships (activated_by);

create table public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null check (char_length(full_name) between 1 and 150),
  requested_role public.membership_role not null check (requested_role <> 'admin'),
  assigned_role public.membership_role check (assigned_role <> 'admin'),
  status public.registration_status not null default 'pending',
  locale text not null check (locale in ('es', 'en')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  check ((status = 'approved') = (assigned_role is not null)),
  check ((status = 'pending') = (decided_at is null))
);

create index registration_requests_status_created_idx on public.registration_requests (status, created_at desc);
create index registration_requests_decided_by_idx on public.registration_requests (decided_by);

create table private.verification_challenges (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.registration_requests(id) on delete cascade,
  digest text not null check (digest ~ '^[0-9a-f]{64}$'),
  failed_attempts integer not null default 0 check (failed_attempts between 0 and 5),
  created_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  invalidated_at timestamptz,
  check (expires_at = created_at + interval '10 minutes'),
  check (consumed_at is null or invalidated_at is null)
);

create unique index verification_challenges_one_current on private.verification_challenges (request_id)
  where consumed_at is null and invalidated_at is null;
create index verification_challenges_request_created_idx on private.verification_challenges (request_id, created_at desc);

create table private.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity_id uuid,
  result text not null,
  created_at timestamptz not null default now()
);

create index audit_events_entity_created_idx on private.audit_events (entity_id, created_at desc);

create table private.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.registration_requests(id) on delete cascade,
  challenge_id uuid unique references private.verification_challenges(id) on delete cascade,
  recipient text,
  template private.email_template not null,
  idempotency_key text not null unique,
  encrypted_payload text,
  attempts integer not null default 0 check (attempts between 0 and 5),
  status private.email_status not null default 'pending',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  available_at timestamptz not null,
  expires_at timestamptz not null,
  lease_id uuid,
  lease_expires_at timestamptz,
  last_error text,
  check ((template = 'activation-code') = (challenge_id is not null and recipient is not null)),
  check ((status = 'processing') = (lease_id is not null and lease_expires_at is not null)),
  check ((template = 'activation-code' and status in ('pending', 'processing')) = (encrypted_payload is not null))
);

create index email_deliveries_request_idx on private.email_deliveries (request_id);
create index email_deliveries_pending_idx on private.email_deliveries (available_at, id)
  where status in ('pending', 'processing');
create index email_deliveries_expiry_idx on private.email_deliveries (expires_at)
  where status in ('pending', 'processing');

alter table public.memberships enable row level security;
alter table public.registration_requests enable row level security;
alter table private.verification_challenges enable row level security;
alter table private.audit_events enable row level security;
alter table private.email_deliveries enable row level security;

revoke all on public.memberships, public.registration_requests from public, anon, authenticated, service_role;
revoke all on private.verification_challenges, private.audit_events, private.email_deliveries
  from public, anon, authenticated, service_role;
grant select on public.memberships, public.registration_requests to authenticated;
grant select (id, user_id) on public.registration_requests to service_role;

create function private.is_active_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where user_id = (select auth.uid()) and role = 'admin' and status = 'active'
  );
$$;

create policy memberships_owner_read on public.memberships
  for select to authenticated using (user_id = (select auth.uid()));
create policy registration_requests_owner_or_admin_read on public.registration_requests
  for select to authenticated using (user_id = (select auth.uid()) or (select private.is_active_admin()));

create function private.create_registration_request(p_requested_role text, p_full_name text, p_locale text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  confirmed_email text;
  request_id uuid;
  requested_at timestamptz := statement_timestamp();
begin
  select u.email into confirmed_email from auth.users as u
  where u.id = actor_id and u.email_confirmed_at is not null and not u.is_anonymous;

  if confirmed_email is null or (select private.is_active_admin()) then
    raise exception using errcode = '42501', message = 'Registration requires a confirmed applicant';
  end if;

  if p_requested_role is null or p_requested_role not in ('editor', 'revisor')
    or p_locale is null or p_locale not in ('es', 'en')
    or p_full_name is null or char_length(btrim(p_full_name)) not between 1 and 150 then
    raise exception using errcode = '22023', message = 'Invalid registration details';
  end if;

  insert into public.registration_requests (user_id, email, full_name, requested_role, locale)
    values (actor_id, confirmed_email, btrim(p_full_name), p_requested_role::public.membership_role, p_locale)
    on conflict (user_id) do nothing returning id into request_id;

  if request_id is null then
    return (select r.id from public.registration_requests as r where r.user_id = actor_id);
  end if;

  insert into private.email_deliveries (request_id, template, idempotency_key, created_at,
    updated_at, available_at, expires_at)
  values (request_id, 'admin-notification', 'admin-notification/' || request_id, requested_at,
    requested_at, requested_at, requested_at + interval '24 hours');

  insert into private.audit_events (actor_id, action, entity_id, result)
    values (actor_id, 'request-created', request_id, 'applied');
  return request_id;
end;
$$;

create function public.create_registration_request(p_requested_role text, p_full_name text, p_locale text)
returns uuid language sql security invoker set search_path = ''
as $$ select private.create_registration_request(p_requested_role, p_full_name, p_locale); $$;

create function private.issue_verification_challenge(
  p_request public.registration_requests, p_digest text, p_encrypted_code text, p_now timestamptz
)
returns void language plpgsql set search_path = ''
as $$
declare
  new_challenge_id uuid;
  expiry timestamptz := p_now + interval '10 minutes';
  verified_email text;
begin
  select u.email into verified_email from auth.users as u
  where u.id = p_request.user_id and u.email_confirmed_at is not null and not u.is_anonymous;

  if verified_email is null or p_digest is null or p_digest !~ '^[0-9a-f]{64}$'
    or p_encrypted_code is null or char_length(p_encrypted_code) not between 1 and 512 then
    raise exception using errcode = '22023', message = 'Invalid activation challenge';
  end if;

  insert into private.verification_challenges (request_id, digest, created_at, expires_at)
    values (p_request.id, p_digest, p_now, expiry) returning id into new_challenge_id;

  insert into private.email_deliveries (request_id, challenge_id, recipient, template,
    idempotency_key, encrypted_payload, created_at, updated_at, available_at, expires_at)
  values (p_request.id, new_challenge_id, verified_email, 'activation-code',
    'activation-code/' || new_challenge_id, p_encrypted_code, p_now, p_now, p_now, expiry);
end;
$$;

create function private.decide_registration_request(p_actor_id uuid, p_request_id uuid,
  p_decision text, p_assigned_role text, p_digest text, p_encrypted_code text)
returns text language plpgsql security definer set search_path = ''
as $$
declare
  request_row public.registration_requests;
  decision_time timestamptz;
  decision_action text := case
    when p_decision in ('approve', 'approved') then 'approve'
    when p_decision in ('reject', 'rejected') then 'reject'
    else 'invalid-decision'
  end;
  outcome text;
begin
  if not exists (
    select 1 from public.memberships where user_id = p_actor_id and role = 'admin' and status = 'active'
  ) then
    outcome := 'forbidden';
  else
    select r.* into request_row from public.registration_requests as r where r.id = p_request_id for update;
    decision_time := clock_timestamp();

    if not found then
      outcome := 'not-found';
    elsif request_row.status <> 'pending' then
      outcome := 'already-decided';
    elsif decision_action = 'approve' and p_assigned_role in ('editor', 'revisor') then
      perform private.issue_verification_challenge(request_row, p_digest, p_encrypted_code, decision_time);
      insert into public.memberships (user_id, role, status)
        values (request_row.user_id, p_assigned_role::public.membership_role, 'pending');
      update public.registration_requests set status = 'approved', assigned_role = p_assigned_role::public.membership_role,
        decided_at = decision_time, decided_by = p_actor_id,
        updated_at = decision_time, version = version + 1 where id = request_row.id;
      outcome := 'applied';
    elsif decision_action = 'reject' then
      insert into public.memberships (user_id, role, status)
        values (request_row.user_id, request_row.requested_role, 'rejected');
      update public.registration_requests set status = 'rejected',
        decided_at = decision_time, decided_by = p_actor_id,
        updated_at = decision_time, version = version + 1 where id = request_row.id;
      outcome := 'applied';
    else
      outcome := 'invalid-decision';
    end if;
  end if;

  insert into private.audit_events (actor_id, action, entity_id, result)
    values (p_actor_id, decision_action, p_request_id, outcome);
  return outcome;
end;
$$;

create function public.decide_registration_request(p_actor_id uuid, p_request_id uuid,
  p_decision text, p_assigned_role text, p_digest text, p_encrypted_code text)
returns text language sql security invoker set search_path = ''
as $$
  select private.decide_registration_request(p_actor_id, p_request_id, p_decision,
    p_assigned_role, p_digest, p_encrypted_code);
$$;

create function private.resend_verification_code(p_actor_id uuid, p_digest text, p_encrypted_code text)
returns text language plpgsql security definer set search_path = ''
as $$
declare
  request_row public.registration_requests;
  previous_challenge private.verification_challenges;
  requested_at timestamptz;
begin
  select r.* into request_row from public.registration_requests as r
  where r.user_id = p_actor_id and r.status = 'approved' for update;

  if not found or not exists (
    select 1 from public.memberships where user_id = p_actor_id and status = 'pending'
  ) then
    return 'not-eligible';
  end if;

  requested_at := clock_timestamp();
  select c.* into previous_challenge from private.verification_challenges as c
  where c.request_id = request_row.id and c.consumed_at is null and c.invalidated_at is null;

  if found then
    if requested_at < previous_challenge.created_at + interval '60 seconds' then
      return 'cooldown';
    end if;
    if p_digest = previous_challenge.digest then
      return 'same-code';
    end if;

    update private.verification_challenges set invalidated_at = requested_at where id = previous_challenge.id;
    update private.email_deliveries set status = 'failed', encrypted_payload = null,
      lease_id = null, lease_expires_at = null, updated_at = requested_at, last_error = 'superseded'
    where challenge_id = previous_challenge.id and status in ('pending', 'processing');
  end if;

  perform private.issue_verification_challenge(request_row, p_digest, p_encrypted_code, requested_at);
  insert into private.audit_events (actor_id, action, entity_id, result)
    values (p_actor_id, 'challenge-resent', request_row.id, 'issued');
  return 'issued';
end;
$$;

create function public.resend_verification_code(p_actor_id uuid, p_digest text, p_encrypted_code text)
returns text language sql security invoker set search_path = ''
as $$ select private.resend_verification_code(p_actor_id, p_digest, p_encrypted_code); $$;

create function private.verify_registration_code(p_digest text)
returns text language plpgsql security definer set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  request_row public.registration_requests;
  challenge private.verification_challenges;
  checked_at timestamptz;
  outcome text;
begin
  select r.* into request_row from public.registration_requests as r
  where r.user_id = actor_id and r.status = 'approved' for update;

  if not found or not exists (
    select 1 from public.memberships where user_id = actor_id and status = 'pending'
  ) then
    return 'not-eligible';
  end if;

  checked_at := clock_timestamp();
  select c.* into challenge from private.verification_challenges as c
  where c.request_id = request_row.id and c.consumed_at is null and c.invalidated_at is null;

  if not found then
    outcome := 'not-eligible';
  elsif challenge.expires_at <= checked_at then
    outcome := 'expired';
  elsif challenge.failed_attempts >= 5 then
    outcome := 'locked';
  elsif p_digest is distinct from challenge.digest then
    update private.verification_challenges set failed_attempts = failed_attempts + 1 where id = challenge.id;
    outcome := case when challenge.failed_attempts = 4 then 'locked' else 'invalid' end;
  else
    update private.verification_challenges set consumed_at = checked_at where id = challenge.id;
    update public.memberships set status = 'active', activated_at = checked_at, activated_by = actor_id,
      updated_at = checked_at where user_id = actor_id and status = 'pending';
    outcome := 'verified';
  end if;

  insert into private.audit_events (actor_id, action, entity_id, result)
    values (actor_id, 'challenge-verified', request_row.id, outcome);
  return outcome;
end;
$$;

create function public.verify_registration_code(p_digest text)
returns text language sql security invoker set search_path = ''
as $$ select private.verify_registration_code(p_digest); $$;

create function private.expire_email_deliveries(p_now timestamptz)
returns void language sql set search_path = ''
as $$
  update private.email_deliveries set status = 'failed', encrypted_payload = null, lease_id = null,
    lease_expires_at = null, updated_at = p_now,
    last_error = case when expires_at <= p_now then 'expired' else 'retry-exhausted' end
  where status in ('pending', 'processing')
    and (expires_at <= p_now or (attempts >= 5 and lease_expires_at <= p_now));
$$;

create function private.claim_email_deliveries(p_limit integer)
returns table (id uuid, recipient text, template text, idempotency_key text,
  encrypted_payload text, attempts integer, request_id uuid, locale text, lease_id uuid,
  full_name text, requested_role text, user_id uuid, applicant_email text)
language plpgsql security definer set search_path = ''
as $$
declare
  claimed_at timestamptz := statement_timestamp();
begin
  if p_limit is null or p_limit not between 1 and 50 then
    raise exception using errcode = '22023', message = 'Invalid email batch size';
  end if;

  return query
  with available as (
    select d.id from private.email_deliveries as d
    where d.status in ('pending', 'processing') and d.attempts < 5
      and d.available_at <= claimed_at and d.expires_at > claimed_at
      and (d.lease_expires_at is null or d.lease_expires_at <= claimed_at)
    order by d.available_at, d.id limit p_limit for update skip locked
  ), claimed as (
    update private.email_deliveries as d set status = 'processing', attempts = d.attempts + 1,
      lease_id = gen_random_uuid(), lease_expires_at = claimed_at + interval '2 minutes', updated_at = claimed_at
    from available where d.id = available.id returning d.*
  )
  select d.id, d.recipient, d.template::text, d.idempotency_key, d.encrypted_payload, d.attempts,
    d.request_id, r.locale, d.lease_id, r.full_name, r.requested_role::text, r.user_id, r.email
  from claimed as d join public.registration_requests as r on r.id = d.request_id;
end;
$$;

create function public.claim_email_deliveries(p_limit integer)
returns table (id uuid, recipient text, template text, idempotency_key text,
  encrypted_payload text, attempts integer, request_id uuid, locale text, lease_id uuid,
  full_name text, requested_role text, user_id uuid, applicant_email text)
language sql security invoker set search_path = ''
as $$ select * from private.claim_email_deliveries(p_limit); $$;

create function private.complete_email_delivery(p_id uuid, p_lease_id uuid, p_result text, p_error text)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  delivery private.email_deliveries;
  completed_at timestamptz := statement_timestamp();
  retry_at timestamptz;
  outcome private.email_status;
  error_category text;
begin
  if p_result is null or p_result not in ('sent', 'retry', 'failed') then
    raise exception using errcode = '22023', message = 'Invalid delivery result';
  end if;

  select d.* into delivery from private.email_deliveries as d
  where d.id = p_id and d.status = 'processing' and d.lease_id = p_lease_id for update;
  if not found then return; end if;

  retry_at := completed_at + make_interval(secs => 15 * (1 << (delivery.attempts - 1)));
  outcome := case
    when p_result = 'sent' then 'sent'
    when p_result = 'retry' and delivery.attempts < 5 and retry_at < delivery.expires_at then 'pending'
    else 'failed'
  end;
  error_category := case
    when p_result = 'sent' then null
    when p_error in ('network', 'provider-transient', 'provider-permanent', 'configuration', 'invalid-payload') then p_error
    else 'delivery-error'
  end;

  update private.email_deliveries set status = outcome,
    encrypted_payload = case when outcome = 'pending' then delivery.encrypted_payload end,
    available_at = case when outcome = 'pending' then retry_at else delivery.available_at end,
    lease_id = null, lease_expires_at = null, last_error = error_category, updated_at = completed_at
  where id = p_id;
  insert into private.audit_events (action, entity_id, result)
    values ('email-delivery', p_id, outcome::text);
end;
$$;

create function public.complete_email_delivery(p_id uuid, p_lease_id uuid, p_result text, p_error text)
returns void language sql security invoker set search_path = ''
as $$ select private.complete_email_delivery(p_id, p_lease_id, p_result, p_error); $$;

create function private.registration_email_status(p_request_id uuid)
returns text language sql stable security definer set search_path = ''
as $$
  select d.status::text
  from private.email_deliveries as d
  join public.registration_requests as r on r.id = d.request_id
  where d.request_id = p_request_id and d.template = 'activation-code'
    and (r.user_id = (select auth.uid()) or (select private.is_active_admin()))
  order by d.created_at desc limit 1;
$$;

create function public.registration_email_status(p_request_id uuid)
returns text language sql stable security invoker set search_path = ''
as $$ select private.registration_email_status(p_request_id); $$;

create function private.admin_verification_delivery_statuses()
returns table (request_id uuid, status text)
language sql stable security definer set search_path = ''
as $$
  select distinct on (d.request_id) d.request_id, d.status::text
  from private.email_deliveries as d
  where d.template = 'activation-code' and (select private.is_active_admin())
  order by d.request_id, d.created_at desc;
$$;

create function public.admin_verification_delivery_statuses()
returns table (request_id uuid, status text)
language sql stable security invoker set search_path = ''
as $$ select * from private.admin_verification_delivery_statuses(); $$;

create function private.provision_admin(p_email text)
returns uuid language plpgsql set search_path = ''
as $$
declare
  target_user uuid;
  matched_users integer;
begin
  select count(*), (array_agg(u.id) filter (where u.email_confirmed_at is not null and not u.is_anonymous))[1]
  into matched_users, target_user from auth.users as u where lower(u.email) = lower(btrim(p_email));
  if matched_users <> 1 then
    raise exception using errcode = '22023', message = 'Exactly one Auth identity is required';
  end if;

  if target_user is null then
    raise exception using errcode = '22023', message = 'A confirmed Auth identity is required';
  end if;

  insert into public.memberships (user_id, role, status, activated_at, activated_by)
    values (target_user, 'admin', 'active', statement_timestamp(), target_user)
    on conflict (user_id) do nothing;

  if not exists (
    select 1 from public.memberships where user_id = target_user and role = 'admin' and status = 'active'
  ) then
    raise exception using errcode = '23505', message = 'Identity already has another membership';
  end if;
  return target_user;
end;
$$;

revoke execute on function private.is_active_admin(),
  private.create_registration_request(text, text, text),
  private.issue_verification_challenge(public.registration_requests, text, text, timestamptz),
  private.decide_registration_request(uuid, uuid, text, text, text, text),
  private.resend_verification_code(uuid, text, text),
  private.verify_registration_code(text), private.expire_email_deliveries(timestamptz),
  private.claim_email_deliveries(integer), private.complete_email_delivery(uuid, uuid, text, text),
  private.registration_email_status(uuid), private.admin_verification_delivery_statuses(), private.provision_admin(text)
  from public, anon, authenticated, service_role;
revoke execute on function public.create_registration_request(text, text, text),
  public.decide_registration_request(uuid, uuid, text, text, text, text),
  public.resend_verification_code(uuid, text, text), public.verify_registration_code(text),
  public.claim_email_deliveries(integer), public.complete_email_delivery(uuid, uuid, text, text),
  public.registration_email_status(uuid), public.admin_verification_delivery_statuses()
  from public, anon, authenticated, service_role;

grant execute on function private.is_active_admin(),
  private.create_registration_request(text, text, text), public.create_registration_request(text, text, text),
  private.verify_registration_code(text), public.verify_registration_code(text),
  private.registration_email_status(uuid), public.registration_email_status(uuid),
  private.admin_verification_delivery_statuses(), public.admin_verification_delivery_statuses() to authenticated;

grant execute on function private.decide_registration_request(uuid, uuid, text, text, text, text),
  public.decide_registration_request(uuid, uuid, text, text, text, text),
  private.resend_verification_code(uuid, text, text), public.resend_verification_code(uuid, text, text),
  private.claim_email_deliveries(integer), public.claim_email_deliveries(integer),
  private.complete_email_delivery(uuid, uuid, text, text), public.complete_email_delivery(uuid, uuid, text, text)
  to service_role;

select cron.schedule('jmmc-expire-email-deliveries', '* * * * *',
  $$select private.expire_email_deliveries(statement_timestamp());$$);
