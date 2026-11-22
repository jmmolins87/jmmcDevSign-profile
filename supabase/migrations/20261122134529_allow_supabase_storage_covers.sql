alter table public.cover_assets
  drop constraint cover_assets_src_check;

alter table public.cover_assets
  add constraint cover_assets_src_check check (
    src ~ '^/[^/]'
    or src ~ '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/post-covers/[A-Za-z0-9][A-Za-z0-9._/-]*$'
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-covers', 'post-covers', true, 5242880, array['image/png']::text[])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
