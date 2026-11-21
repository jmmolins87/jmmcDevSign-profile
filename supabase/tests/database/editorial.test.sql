begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(40);

insert into auth.users (id, email, email_confirmed_at) values
  ('931c17c3-1278-49ae-bb27-2fc0a17fb801', 'editor@example.test', now()),
  ('931c17c3-1278-49ae-bb27-2fc0a17fb802', 'revisor@example.test', now()),
  ('931c17c3-1278-49ae-bb27-2fc0a17fb803', 'admin@example.test', now()),
  ('931c17c3-1278-49ae-bb27-2fc0a17fb804', 'pending@example.test', now()),
  ('931c17c3-1278-49ae-bb27-2fc0a17fb805', 'rejected@example.test', now()),
  ('931c17c3-1278-49ae-bb27-2fc0a17fb806', 'authenticated-only@example.test', now());

insert into public.memberships (user_id, role, status, activated_at) values
  ('931c17c3-1278-49ae-bb27-2fc0a17fb801', 'editor', 'active', now()),
  ('931c17c3-1278-49ae-bb27-2fc0a17fb802', 'revisor', 'active', now()),
  ('931c17c3-1278-49ae-bb27-2fc0a17fb803', 'admin', 'active', now()),
  ('931c17c3-1278-49ae-bb27-2fc0a17fb804', 'revisor', 'pending', null),
  ('931c17c3-1278-49ae-bb27-2fc0a17fb805', 'editor', 'rejected', null);

create temp table opened_posts (name text primary key, entry jsonb not null);
grant select, insert, update on opened_posts to authenticated;

create function pg_temp.editorial_snapshot(p_title text, p_slug text)
returns jsonb language sql immutable as $$
  select jsonb_build_object('title', p_title, 'slug', p_slug, 'excerpt', '', 'bodyMarkdown', '# Content',
    'category', 'Architecture', 'tags', jsonb_build_array('design'), 'coverAssetId', 'cover-architecture');
$$;

select is((select schedule from cron.job where jobname = 'jmmc-publish-due-posts' and active), '* * * * *',
  'the publication job is active every minute');
select ok((select c.reloptions @> array['security_invoker=true'] from pg_class c
  where c.oid = 'public.published_posts'::regclass), 'the public view honors its source policies');

set local role anon;
select results_eq($$select slug from public.published_posts order by slug$$,
  $$values ('agentes-que-ejecutan-instruccion-ejecucion'), ('contrato-visual-tambien-es-arquitectura'),
    ('ocaso-microservicios-caoticos-monolito-modular')$$, 'anon sees the three published seeded slugs');
select is((select count(*) from public.cover_assets), 3::bigint, 'cover metadata is public');
select throws_ok('select public.editorial_posts()', '42501', null, 'anon cannot enter the editor');
select throws_ok('select working_revision_id from public.posts', '42501', null,
  'anon cannot read the private pointers of a public post');
reset role;

set local role authenticated;
set local "request.jwt.claim.sub" = '931c17c3-1278-49ae-bb27-2fc0a17fb804';
select throws_ok('select public.editorial_posts()', '42501', 'Active editorial membership is required',
  'pending members cannot read the editorial catalog');
select throws_ok($$select public.save_post(null, null, '{}'::jsonb)$$, '42501',
  'Active editorial membership is required', 'pending members cannot write');
set local "request.jwt.claim.sub" = '931c17c3-1278-49ae-bb27-2fc0a17fb805';
select throws_ok('select public.editorial_posts()', '42501', 'Active editorial membership is required',
  'rejected members cannot list posts');
set local "request.jwt.claim.sub" = '931c17c3-1278-49ae-bb27-2fc0a17fb806';
select throws_ok('select public.editorial_posts()', '42501', 'Active editorial membership is required',
  'a confirmed identity alone has no editorial permissions');

set local "request.jwt.claim.sub" = '931c17c3-1278-49ae-bb27-2fc0a17fb801';
select lives_ok('select public.editorial_posts()', 'active editors can list posts');
select throws_ok($$insert into public.posts default values$$, '42501', null,
  'ordinary data writes cannot bypass revision transitions');
insert into opened_posts values ('main', public.save_post(null, null, pg_temp.editorial_snapshot('', 'spec-editorial')));
select is((select entry #>> '{post,status}' from opened_posts where name = 'main'), 'draft',
  'an incomplete manual save creates a draft');
select throws_ok($$select public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int, null)
  from opened_posts where name = 'main'$$, '22023', 'Editorial validation failed', 'an incomplete draft cannot publish');
select throws_ok($$select public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int, null,
  pg_temp.editorial_snapshot('Reserved', 'not-found')) from opened_posts where name = 'main'$$,
  '22023', 'Editorial validation failed', 'a reserved route cannot become a post slug');
select throws_ok($$select public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int,
  now() - interval '1 second', pg_temp.editorial_snapshot('Past', 'spec-editorial'))
  from opened_posts where name = 'main'$$, '22023', 'Scheduled publication must be in the future',
  'a date in the past cannot be scheduled');

update opened_posts set entry = public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int,
  now() + interval '2 hours', pg_temp.editorial_snapshot('First schedule', 'spec-editorial')) where name = 'main';
select is((select entry ->> 'slugLocked' from opened_posts where name = 'main'), 'true',
  'the first schedule fixes the slug');
select throws_ok($$select public.save_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int,
  pg_temp.editorial_snapshot('New slug', 'different-slug')) from opened_posts where name = 'main'$$,
  '22023', 'Invalid editorial snapshot or locked slug', 'a fixed slug cannot be changed by a later edit');
reset role;

set local role anon;
select is((select count(*) from public.published_posts where slug = 'spec-editorial'), 0::bigint,
  'a schedule without a published version stays private');
select is((select count(*) from public.post_revisions where snapshot ->> 'slug' = 'spec-editorial'), 0::bigint,
  'direct revision reads cannot reveal unpublished snapshots');
reset role;

set local role authenticated;
set local "request.jwt.claim.sub" = '931c17c3-1278-49ae-bb27-2fc0a17fb802';
select lives_ok('select public.editorial_posts()', 'active reviewers can enter the editor');
update opened_posts set entry = public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int,
  now() + interval '3 hours', pg_temp.editorial_snapshot('Replacement schedule', 'spec-editorial')) where name = 'main';
insert into opened_posts select 'stale', entry from opened_posts where name = 'main';
update opened_posts set entry = public.save_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int,
  pg_temp.editorial_snapshot('Private later edit', 'spec-editorial')) where name = 'main';
select throws_ok($$select public.save_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int,
  pg_temp.editorial_snapshot('Stale edit', 'spec-editorial')) from opened_posts where name = 'stale'$$,
  '40001', 'Editorial version conflict', 'two sessions cannot overwrite the same revision silently');
reset role;

select is(private.promote_due_posts(now() + interval '2 hours', 1), 0,
  'the replaced schedule can no longer promote');
select is(private.promote_due_posts(now() + interval '3 hours', 1), 1,
  'the replacement schedule promotes at its exact boundary');
select is(private.promote_due_posts(now() + interval '3 hours', 1), 0, 'a second job run is idempotent');

set local role anon;
select is((select post ->> 'title' from public.published_posts where slug = 'spec-editorial'), 'Replacement schedule',
  'promotion publishes the frozen schedule snapshot');
select is((select count(*) from public.post_revisions where snapshot ->> 'slug' = 'spec-editorial'), 1::bigint,
  'a published post exposes exactly its current public revision to anon');
reset role;

set local role authenticated;
set local "request.jwt.claim.sub" = '931c17c3-1278-49ae-bb27-2fc0a17fb803';
update opened_posts as opened set entry = (
  select live from jsonb_array_elements(public.editorial_posts()) as live
  where live #>> '{post,id}' = opened.entry #>> '{post,id}'
) where name = 'main';
select is((select entry #>> '{post,title}' from opened_posts where name = 'main'), 'Private later edit',
  'the admin editor retains the newer private revision');
update opened_posts set entry = public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int,
  now() + interval '4 hours') where name = 'main';
update opened_posts set entry = public.cancel_post_schedule((entry #>> '{post,id}')::uuid,
  (entry ->> 'version')::int) where name = 'main';
select is((select entry #>> '{post,scheduledAt}' from opened_posts where name = 'main'), null::text,
  'explicit cancellation clears the schedule');
select is((select entry ->> 'slugLocked' from opened_posts where name = 'main'), 'true',
  'cancelled schedules keep the public slug fixed');
update opened_posts set entry = public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int,
  now() + interval '4 hours') where name = 'main';
update opened_posts set entry = public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int, null,
  pg_temp.editorial_snapshot('Published now', 'spec-editorial')) where name = 'main';
select is((select post ->> 'title' from public.published_posts where slug = 'spec-editorial'), 'Published now',
  'immediate publication advances the public snapshot');
select is((select entry #>> '{post,scheduledAt}' from opened_posts where name = 'main'), null::text,
  'immediate publication clears an earlier schedule');
insert into opened_posts values ('duplicate', public.save_post(null, null,
  pg_temp.editorial_snapshot('Duplicate slug', 'spec-editorial')));
select throws_ok($$select public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int, null)
  from opened_posts where name = 'duplicate'$$, '23505', null, 'a locked slug belongs to one post');

update opened_posts set entry = public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int,
  now() + interval '5 hours') where name = 'main';
select lives_ok($$select public.remove_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int)
  from opened_posts where name = 'main'$$, 'an active admin can withdraw a post');
reset role;

select is((select count(*) from public.published_posts where slug = 'spec-editorial'), 0::bigint,
  'withdrawal removes the public version');
select is(private.promote_due_posts(now() + interval '5 hours', 1), 0, 'a withdrawn post cannot republish');
select is((select count(*) from public.post_revisions where post_id =
  (select (entry #>> '{post,id}')::uuid from opened_posts where name = 'main')), 5::bigint,
  'withdrawal keeps all five stored revisions');

set local role authenticated;
set local "request.jwt.claim.sub" = '931c17c3-1278-49ae-bb27-2fc0a17fb803';
insert into opened_posts select 'seed', live from jsonb_array_elements(public.editorial_posts()) as live
where live #>> '{post,slug}' = 'contrato-visual-tambien-es-arquitectura';
update opened_posts set entry = public.publish_post((entry #>> '{post,id}')::uuid, (entry ->> 'version')::int,
  null, jsonb_set(entry -> 'post', '{title}', '"Edited after seed"'::jsonb)) where name = 'seed';
reset role;

select private.seed_initial_published_posts();
select private.seed_initial_published_posts();

select is((select count(*) from public.published_posts), 3::bigint, 're-running the seed preserves the three posts');
select is((select count(*) from public.cover_assets), 3::bigint, 're-running the seed preserves the three covers');
select is((select post ->> 'title' from public.published_posts where slug = 'contrato-visual-tambien-es-arquitectura'),
  'Edited after seed', 're-running the seed does not overwrite a newer publication');

select * from finish();
rollback;
