create type public.revision_stage as enum ('draft', 'review');

create table public.cover_assets (
  id text primary key,
  src text not null check (src ~ '^/[^/]'),
  alt text not null,
  label text not null
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_by uuid references auth.users(id) on delete set null,
  working_revision_id uuid,
  published_revision_id uuid,
  published_at timestamptz,
  published_via_schedule boolean not null default false,
  scheduled_revision_id uuid,
  scheduled_at timestamptz,
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((published_revision_id is not null) = (published_at is not null)),
  check ((scheduled_revision_id is not null) = (scheduled_at is not null)),
  check (published_revision_id is null and scheduled_revision_id is null or slug is not null),
  check (deleted_at is null or (published_revision_id is null and scheduled_revision_id is null)),
  check (not published_via_schedule or published_revision_id is not null)
);

create index posts_creator_idx on public.posts (created_by);
create index posts_scheduled_at_idx on public.posts (scheduled_at, id) where scheduled_at is not null;

create table public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id),
  version integer not null check (version > 0),
  author_id uuid references auth.users(id) on delete set null,
  stage public.revision_stage not null default 'draft',
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  cover_asset_id text references public.cover_assets(id),
  created_at timestamptz not null default now(),
  unique (post_id, id),
  unique (post_id, version),
  check (cover_asset_id is not distinct from (snapshot ->> 'coverAssetId'))
);

create index post_revisions_author_idx on public.post_revisions (author_id);
create index post_revisions_cover_asset_idx on public.post_revisions (cover_asset_id);

alter table public.posts
  add foreign key (id, working_revision_id) references public.post_revisions (post_id, id),
  add foreign key (id, published_revision_id) references public.post_revisions (post_id, id),
  add foreign key (id, scheduled_revision_id) references public.post_revisions (post_id, id);

create function private.can_edit_posts()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.memberships where user_id = (select auth.uid()) and status = 'active'
  );
$$;

alter table public.cover_assets enable row level security;
alter table public.posts enable row level security;
alter table public.post_revisions enable row level security;

revoke all on public.cover_assets, public.posts, public.post_revisions from public, anon, authenticated, service_role;
grant select on public.cover_assets to anon, authenticated;
grant select (id, slug, published_revision_id, published_at, published_via_schedule, deleted_at, created_at)
  on public.posts to anon, authenticated;
grant select (id, post_id, snapshot, created_at) on public.post_revisions to anon, authenticated;

create policy cover_assets_read on public.cover_assets for select to anon, authenticated using (true);
create policy posts_anon_read on public.posts for select to anon
  using (deleted_at is null and published_revision_id is not null);
create policy posts_authenticated_read on public.posts for select to authenticated
  using (deleted_at is null and (published_revision_id is not null or (select private.can_edit_posts())));

create policy post_revisions_anon_read on public.post_revisions for select to anon
  using (exists (
    select 1 from public.posts as p
    where p.id = post_id and p.published_revision_id = post_revisions.id and p.deleted_at is null
  ));
create policy post_revisions_authenticated_read on public.post_revisions for select to authenticated
  using ((select private.can_edit_posts()) or exists (
    select 1 from public.posts as p
    where p.id = post_id and p.published_revision_id = post_revisions.id and p.deleted_at is null
  ));

create view public.published_posts with (security_invoker = true) as
select p.slug,
  r.snapshot || jsonb_build_object(
    'id', p.id, 'slug', p.slug, 'status', 'published',
    'publishMode', case when p.published_via_schedule then 'scheduled' else 'immediate' end,
    'access', 'public', 'rights', 'CC-BY-4.0', 'createdAt', p.created_at,
    'updatedAt', greatest(r.created_at, p.published_at), 'publishedAt', p.published_at
  ) as post
from public.posts as p join public.post_revisions as r
  on r.post_id = p.id and r.id = p.published_revision_id
where p.deleted_at is null and p.published_revision_id is not null;

revoke all on public.published_posts from public, anon, authenticated, service_role;
grant select on public.published_posts to anon, authenticated;

create function private.editorial_post(p_post public.posts, p_revision public.post_revisions)
returns jsonb language sql stable set search_path = ''
as $$
  select jsonb_build_object(
    'version', p_post.version,
    'slugLocked', p_post.slug is not null,
    'post', p_revision.snapshot || jsonb_strip_nulls(jsonb_build_object(
      'id', p_post.id,
      'slug', coalesce(p_post.slug, p_revision.snapshot ->> 'slug'),
      'status', case
        when p_post.scheduled_revision_id is not null then 'scheduled'
        when p_post.published_revision_id = p_revision.id then 'published'
        else p_revision.stage::text
      end,
      'publishMode', case
        when p_post.scheduled_revision_id is not null then 'scheduled'
        else 'immediate'
      end,
      'scheduledAt', p_post.scheduled_at, 'publishedAt', p_post.published_at,
      'access', 'public', 'rights', 'CC-BY-4.0',
      'createdAt', p_post.created_at, 'updatedAt', p_post.updated_at
    ))
  );
$$;

create function private.editorial_posts()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  if not (select private.can_edit_posts()) then
    raise exception using errcode = '42501', message = 'Active editorial membership is required';
  end if;

  return (
    select coalesce(jsonb_agg(private.editorial_post(p, r) order by p.updated_at desc, p.id), '[]'::jsonb)
    from public.posts as p join public.post_revisions as r
      on r.post_id = p.id and r.id = p.working_revision_id
    where p.deleted_at is null
  );
end;
$$;

create function public.editorial_posts()
returns jsonb language sql stable security invoker set search_path = ''
as $$ select private.editorial_posts(); $$;

create function private.lock_post(p_post_id uuid, p_expected_version integer)
returns public.posts language plpgsql set search_path = ''
as $$
declare
  locked_post public.posts;
begin
  select p.* into locked_post from public.posts as p where p.id = p_post_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Editorial post was not found';
  end if;
  if locked_post.deleted_at is not null or locked_post.version is distinct from p_expected_version then
    raise exception using errcode = '40001', message = 'Editorial version conflict';
  end if;
  return locked_post;
end;
$$;

create function private.insert_post_revision(p_post public.posts, p_snapshot jsonb, p_version integer)
returns public.post_revisions language plpgsql set search_path = ''
as $$
declare
  revision public.post_revisions;
  chosen_cover text := p_snapshot ->> 'coverAssetId';
begin
  if jsonb_typeof(p_snapshot) is distinct from 'object'
    or exists (
      select 1 from unnest(array['title', 'slug', 'excerpt', 'bodyMarkdown', 'category']) as k(key)
      where jsonb_typeof(p_snapshot -> k.key) is distinct from 'string'
    )
    or jsonb_typeof(p_snapshot -> 'tags') is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Invalid editorial snapshot';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_snapshot -> 'tags') as tag
    where jsonb_typeof(tag) <> 'string'
  ) or (p_post.slug is not null and p_post.slug is distinct from p_snapshot ->> 'slug') then
    raise exception using errcode = '22023', message = 'Invalid editorial snapshot or locked slug';
  end if;

  if chosen_cover is not null and (
    jsonb_typeof(p_snapshot -> 'coverAssetId') <> 'string'
    or not exists (select 1 from public.cover_assets where id = chosen_cover)
  ) then
    raise exception using errcode = '22023', message = 'Unknown cover asset';
  end if;

  insert into public.post_revisions (post_id, version, author_id, stage, snapshot, cover_asset_id)
  values (p_post.id, p_version, (select auth.uid()),
    case when p_snapshot ->> 'status' = 'review' then 'review'::public.revision_stage else 'draft' end,
    jsonb_strip_nulls(jsonb_build_object(
      'title', p_snapshot -> 'title', 'slug', p_snapshot -> 'slug', 'excerpt', p_snapshot -> 'excerpt',
      'bodyMarkdown', p_snapshot -> 'bodyMarkdown', 'category', p_snapshot -> 'category',
      'tags', p_snapshot -> 'tags', 'coverAssetId', chosen_cover
    )), chosen_cover)
  returning * into revision;
  return revision;
end;
$$;

create function private.save_post(p_post_id uuid, p_expected_version integer, p_snapshot jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  post_row public.posts;
  revision public.post_revisions;
  next_version integer;
begin
  if not (select private.can_edit_posts()) then
    raise exception using errcode = '42501', message = 'Active editorial membership is required';
  end if;

  if p_post_id is null then
    if p_expected_version is not null then
      raise exception using errcode = '22023', message = 'Invalid initial editorial version';
    end if;
    insert into public.posts (created_by) values ((select auth.uid())) returning * into post_row;
    next_version := post_row.version;
  else
    post_row := private.lock_post(p_post_id, p_expected_version);
    next_version := post_row.version + 1;
  end if;

  revision := private.insert_post_revision(post_row, p_snapshot, next_version);
  update public.posts set working_revision_id = revision.id, version = next_version, updated_at = statement_timestamp()
  where id = post_row.id returning * into post_row;

  insert into private.audit_events (actor_id, action, entity_id, result)
    values ((select auth.uid()), 'post-saved', post_row.id, 'applied');
  return private.editorial_post(post_row, revision);
end;
$$;

create function public.save_post(p_post_id uuid default null, p_expected_version integer default null,
  p_snapshot jsonb default null)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.save_post(p_post_id, p_expected_version, p_snapshot); $$;

create function private.assert_publishable(p_snapshot jsonb)
returns void language plpgsql set search_path = ''
as $$
begin
  if not coalesce(
    (p_snapshot ->> 'title') ~ '[^[:space:]]'
    and (p_snapshot ->> 'slug') ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and (p_snapshot ->> 'slug') not in ('editor', 'not-found')
    and (p_snapshot ->> 'category') ~ '[^[:space:]]'
    and char_length(p_snapshot ->> 'excerpt') <= 160
    and exists (
      select 1 from jsonb_array_elements_text(p_snapshot -> 'tags') as tag
      where tag ~ '[^[:space:]]'
    ), false
  ) then
    raise exception using errcode = '22023', message = 'Editorial validation failed';
  end if;
end;
$$;

create function private.publish_post(p_post_id uuid, p_expected_version integer, p_scheduled_at timestamptz,
  p_snapshot jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  post_row public.posts;
  revision public.post_revisions;
  publish_time timestamptz;
begin
  if not (select private.can_edit_posts()) then
    raise exception using errcode = '42501', message = 'Active editorial membership is required';
  end if;

  post_row := private.lock_post(p_post_id, p_expected_version);
  publish_time := clock_timestamp();
  if p_scheduled_at is not null and (not isfinite(p_scheduled_at) or p_scheduled_at <= publish_time) then
    raise exception using errcode = '22023', message = 'Scheduled publication must be in the future';
  end if;

  if p_snapshot is not null then
    revision := private.insert_post_revision(post_row, p_snapshot, post_row.version + 1);
  else
    select r.* into revision from public.post_revisions as r
    where r.post_id = post_row.id and r.id = post_row.working_revision_id;
  end if;

  perform private.assert_publishable(revision.snapshot);
  update public.posts set slug = coalesce(post_row.slug, revision.snapshot ->> 'slug'),
    working_revision_id = revision.id,
    published_revision_id = case when p_scheduled_at is null then revision.id else post_row.published_revision_id end,
    published_at = case when p_scheduled_at is null then publish_time else post_row.published_at end,
    published_via_schedule = p_scheduled_at is not null and post_row.published_via_schedule,
    scheduled_revision_id = case when p_scheduled_at is not null then revision.id end,
    scheduled_at = p_scheduled_at, version = post_row.version + 1, updated_at = publish_time
  where id = post_row.id returning * into post_row;

  insert into private.audit_events (actor_id, action, entity_id, result)
    values ((select auth.uid()), case when p_scheduled_at is null then 'post-published' else 'post-scheduled' end,
      post_row.id, 'applied');
  return private.editorial_post(post_row, revision);
end;
$$;

create function public.publish_post(p_post_id uuid, p_expected_version integer, p_scheduled_at timestamptz default null,
  p_snapshot jsonb default null)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.publish_post(p_post_id, p_expected_version, p_scheduled_at, p_snapshot); $$;

create function private.cancel_post_schedule(p_post_id uuid, p_expected_version integer)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  post_row public.posts;
  revision public.post_revisions;
begin
  if not (select private.can_edit_posts()) then
    raise exception using errcode = '42501', message = 'Active editorial membership is required';
  end if;

  post_row := private.lock_post(p_post_id, p_expected_version);
  if post_row.scheduled_at is not null then
    update public.posts set scheduled_revision_id = null, scheduled_at = null,
      version = version + 1, updated_at = statement_timestamp()
    where id = post_row.id returning * into post_row;
    insert into private.audit_events (actor_id, action, entity_id, result)
      values ((select auth.uid()), 'post-unscheduled', post_row.id, 'applied');
  end if;

  select r.* into revision from public.post_revisions as r
    where r.post_id = post_row.id and r.id = post_row.working_revision_id;
  return private.editorial_post(post_row, revision);
end;
$$;

create function public.cancel_post_schedule(p_post_id uuid, p_expected_version integer)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.cancel_post_schedule(p_post_id, p_expected_version); $$;

create function private.remove_post(p_post_id uuid, p_expected_version integer)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  post_row public.posts;
begin
  if not (select private.can_edit_posts()) then
    raise exception using errcode = '42501', message = 'Active editorial membership is required';
  end if;

  post_row := private.lock_post(p_post_id, p_expected_version);
  update public.posts set deleted_at = statement_timestamp(), published_revision_id = null,
    published_at = null, published_via_schedule = false, scheduled_revision_id = null, scheduled_at = null,
    version = version + 1, updated_at = statement_timestamp()
  where id = post_row.id;

  insert into private.audit_events (actor_id, action, entity_id, result)
    values ((select auth.uid()), 'post-removed', post_row.id, 'applied');
end;
$$;

create function public.remove_post(p_post_id uuid, p_expected_version integer)
returns void language sql security invoker set search_path = ''
as $$ select private.remove_post(p_post_id, p_expected_version); $$;

create function private.promote_due_posts(p_now timestamptz, p_limit integer)
returns integer language plpgsql set search_path = ''
as $$
declare
  promoted_count integer;
begin
  if p_limit is null or p_limit not between 1 and 1000 or p_now is null or not isfinite(p_now) then
    raise exception using errcode = '22023', message = 'Invalid publication batch';
  end if;

  with due as (
    select p.id from public.posts as p
    where p.scheduled_at <= p_now and p.deleted_at is null
    order by p.scheduled_at, p.id limit p_limit for update skip locked
  ), promoted as (
    update public.posts as p set published_revision_id = p.scheduled_revision_id, published_at = p_now,
      published_via_schedule = true, scheduled_revision_id = null, scheduled_at = null,
      version = p.version + 1, updated_at = p_now
    from due where p.id = due.id returning p.id
  )
  insert into private.audit_events (action, entity_id, result)
    select 'post-promoted', id, 'applied' from promoted;

  get diagnostics promoted_count = row_count;
  return promoted_count;
end;
$$;

create function private.run_publication_job()
returns void language plpgsql set search_path = ''
as $$
declare
  due_at timestamptz := statement_timestamp();
begin
  loop
    exit when private.promote_due_posts(due_at, 100) < 100;
  end loop;
end;
$$;

revoke execute on function private.can_edit_posts(), private.editorial_post(public.posts, public.post_revisions),
  private.editorial_posts(), private.lock_post(uuid, integer), private.insert_post_revision(public.posts, jsonb, integer),
  private.save_post(uuid, integer, jsonb), private.assert_publishable(jsonb),
  private.publish_post(uuid, integer, timestamptz, jsonb), private.cancel_post_schedule(uuid, integer),
  private.remove_post(uuid, integer), private.promote_due_posts(timestamptz, integer), private.run_publication_job(),
  public.editorial_posts(), public.save_post(uuid, integer, jsonb),
  public.publish_post(uuid, integer, timestamptz, jsonb), public.cancel_post_schedule(uuid, integer),
  public.remove_post(uuid, integer)
from public, anon, authenticated, service_role;

grant execute on function private.can_edit_posts(), private.editorial_posts(),
  private.save_post(uuid, integer, jsonb), private.publish_post(uuid, integer, timestamptz, jsonb),
  private.cancel_post_schedule(uuid, integer), private.remove_post(uuid, integer),
  public.editorial_posts(), public.save_post(uuid, integer, jsonb),
  public.publish_post(uuid, integer, timestamptz, jsonb), public.cancel_post_schedule(uuid, integer),
  public.remove_post(uuid, integer) to authenticated;

select cron.schedule('jmmc-publish-due-posts', '* * * * *', $$select private.run_publication_job();$$);
