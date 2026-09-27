-- SPEC 10 — Paso 3: RLS + policies (aplicado vía MCP, migración `spec10_rls_policies`).
-- Réplica exacta de lo ejecutado en el proyecto jmmcDevSign-profile.

-- Helper: rol del usuario actual (security definer evita recursión en profiles)
create or replace function public.app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role from public.profiles p where p.id = auth.uid();
$$;

revoke execute on function public.app_role() from public;
grant execute on function public.app_role() to anon, authenticated;

-- profiles: solo el propio usuario lee su fila; altas solo vía trigger
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

-- posts: público lee publicados; editors leen todo y escriben
alter table public.posts enable row level security;

create policy "posts_select_published"
  on public.posts for select
  using (status = 'published');

create policy "posts_select_editors"
  on public.posts for select
  using (public.app_role() in ('admin', 'author'));

create policy "posts_write_editors"
  on public.posts for all
  using (public.app_role() in ('admin', 'author'))
  with check (public.app_role() in ('admin', 'author'));

-- post_translations: público lee traducciones de posts publicados; editors escriben
alter table public.post_translations enable row level security;

create policy "translations_select_public"
  on public.post_translations for select
  using (exists (
    select 1 from public.posts p
    where p.id = post_id and p.status = 'published'
  ));

create policy "translations_select_editors"
  on public.post_translations for select
  using (public.app_role() in ('admin', 'author'));

create policy "translations_write_editors"
  on public.post_translations for all
  using (public.app_role() in ('admin', 'author'))
  with check (public.app_role() in ('admin', 'author'));

-- images: público lee; editors escriben
alter table public.images enable row level security;

create policy "images_select_all"
  on public.images for select
  using (true);

create policy "images_write_editors"
  on public.images for all
  using (public.app_role() in ('admin', 'author'))
  with check (public.app_role() in ('admin', 'author'));

-- Trigger: cada signup crea su profile con rol author
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    'author'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage: lectura pública del bucket; escritura solo editors
create policy "site_images_public_read"
  on storage.objects for select
  using (bucket_id = 'site-images');

create policy "site_images_editors_write"
  on storage.objects for all
  using (bucket_id = 'site-images' and public.app_role() in ('admin', 'author'))
  with check (bucket_id = 'site-images' and public.app_role() in ('admin', 'author'));
