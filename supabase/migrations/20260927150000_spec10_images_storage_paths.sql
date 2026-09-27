-- SPEC 10 — Paso 8: apuntar los registros de images a los objetos públicos
-- ya subidos manualmente al bucket site-images.
-- Los nombres de objeto son deterministas: <key>.webp.

update public.images
set
  storage_path = key || '.webp',
  url = 'https://lxgooahlwacoaoaqoent.supabase.co/storage/v1/object/public/site-images/' || key || '.webp'
where key in (
  'hero',
  'portrait',
  'project-01',
  'project-02',
  'project-03',
  'project-04',
  'post-featured',
  'post-css',
  'post-ollama'
);
