create function private.seed_initial_published_posts()
returns void
language plpgsql
set search_path = ''
as $seed$
declare
  item record;
  inserted_post_id uuid;
  initial_revision_id uuid;
begin
  -- Published landing content at migration time. Post and slug collisions preserve existing work.
  insert into public.cover_assets (id, src, alt, label) values
    ('cover-architecture', '/assets/landing/featured-architecture-2025.png', 'Estructura brutalista de hormigón con diagonales geométricas y sombras duras', 'Featured architecture 2025'),
    ('cover-agent-runtime', '/assets/comparativa.png', 'Comparativa de identidad visual para un dossier sobre agentes de IA', 'Agent runtime comparison'),
    ('cover-design-contracts', '/assets/landing/Retrato.png', 'Retrato editorial monocromo para un artículo sobre sistemas de diseño', 'Design contracts portrait')
  on conflict (id) do nothing;

  for item in select * from (values
    ('f70aea8c-18e9-4c88-8003-5a2037428fd1'::uuid, '2025-02-20T09:00:00.000Z'::timestamptz, '2025-02-28T09:00:00.000Z'::timestamptz,
$snapshot${
  "title": "El ocaso de los microservicios caóticos: volviendo al monolito modular",
  "slug": "ocaso-microservicios-caoticos-monolito-modular",
  "excerpt": "Un análisis exhaustivo sobre el coste oculto de la latencia de red, el overhead cognitivo de infraestructura y la orquestación cuando se fragmentan dominios antes de tiempo.",
  "bodyMarkdown": "# Volver a los límites claros\n\nLa arquitectura no se vuelve distribuida solo porque añadamos más repositorios. Primero hay que decidir qué límites merecen existir.\n\n> Distribuir datos no obliga a distribuir la complejidad.\n\n## Una decisión reversible\n\nUn monolito modular conserva velocidad de cambio y permite separar procesos cuando la evidencia lo exige.",
  "category": "Arquitectura distribuida",
  "tags": [
    "arquitectura",
    "monolito",
    "sistemas distribuidos"
  ],
  "coverAssetId": "cover-architecture"
}$snapshot$::jsonb),
    ('f70aea8c-18e9-4c88-8003-5a2037428fd2'::uuid, '2025-03-04T09:00:00.000Z'::timestamptz, '2025-03-12T09:00:00.000Z'::timestamptz,
$snapshot${
  "title": "Agentes que ejecutan: de la instrucción a la ejecución",
  "slug": "agentes-que-ejecutan-instruccion-ejecucion",
  "excerpt": "Una guía práctica para diseñar agentes que puedan usar herramientas, mantener límites claros y dejar una traza útil para las personas que los supervisan.",
  "bodyMarkdown": "# De la instrucción a la ejecución\n\nUn agente útil no es solo una respuesta: es un flujo que puede elegir herramientas, conservar límites y dejar una traza verificable.\n\n## Límites operativos\n\nCada acción debe tener un contrato explícito y un resultado que pueda revisar una persona.",
  "category": "Agentes de IA",
  "tags": [
    "agentes",
    "automatización",
    "observabilidad"
  ],
  "coverAssetId": "cover-agent-runtime"
}$snapshot$::jsonb),
    ('f70aea8c-18e9-4c88-8003-5a2037428fd3'::uuid, '2025-03-25T09:00:00.000Z'::timestamptz, '2025-04-02T09:00:00.000Z'::timestamptz,
$snapshot${
  "title": "El contrato visual también es arquitectura",
  "slug": "contrato-visual-tambien-es-arquitectura",
  "excerpt": "Cómo convertir decisiones visuales en contratos de interfaz que resisten el crecimiento de un producto y de los equipos que los mantienen.",
  "bodyMarkdown": "# El contrato visual también es arquitectura\n\nLos tokens y los componentes no son decoración: son límites compartidos que reducen decisiones accidentales.\n\n## Crecer sin deriva\n\nUna interfaz consistente necesita nombres, estados y reglas que puedan comprobarse igual que cualquier contrato técnico.",
  "category": "Sistemas de diseño",
  "tags": [
    "diseño",
    "tokens",
    "accesibilidad"
  ],
  "coverAssetId": "cover-design-contracts"
}$snapshot$::jsonb)
  ) as fixtures (id, created_at, published_at, snapshot)
  loop
    insert into public.posts (id, slug, created_at, updated_at)
    values (item.id, item.snapshot ->> 'slug', item.created_at, item.published_at)
    on conflict do nothing
    returning id into inserted_post_id;
    if inserted_post_id is null then continue; end if;

    insert into public.post_revisions (post_id, version, snapshot, cover_asset_id, created_at)
    values (inserted_post_id, 1, item.snapshot, item.snapshot ->> 'coverAssetId', item.published_at)
    returning id into initial_revision_id;

    update public.posts set working_revision_id = initial_revision_id,
      published_revision_id = initial_revision_id, published_at = item.published_at
    where id = inserted_post_id;
  end loop;
end;
$seed$;

revoke execute on function private.seed_initial_published_posts()
from public, anon, authenticated, service_role;
