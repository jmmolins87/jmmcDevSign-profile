-- SPEC 10 — Paso 7: seed de los 3 posts de lib/data/mock.ts en ES y EN.
-- Traducciones EN escritas a mano para el seed: contenido [placeholder]
-- con revisión humana pendiente antes de producción (riesgo documentado).
-- Las portadas apuntan a hotlinks de SPEC 01 (fallback documentado);
-- el paso 8 las migra a Storage y actualiza images.storage_path.

-- --- images (portadas) -----------------------------------------------------
insert into public.images (key, url, alt)
values
  (
    'post-featured',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD1UO2FHCD-wkO_dY6JY0L7R65GCyKN3eEM2gaJO2hd1oAErNKrvfcl2TMbXSgYLrgEBOYMRU1jx56AT2hNSu8auI3NF-_J_gnzUc1dB3ZjIzWbSR8vXCH3ayPavWis5RleyJMsKqFUNRZ7bDmEH3WdmSy1kStlL-7uO7yCJrWlmT7QIenvgf3RhYdvxmBFHh9b72_l-QH-GwHuTuLzbCjdwvu6Hua9FxAi3BcTJ6JQbAZflgxPbUO2',
    'Cuaderno de especímenes tipográficos sobre mesa de arquitecto' -- [placeholder]
  ),
  (
    'post-css',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDWsxf0NpdttfMh88wqA27BcA2N91szgUCHrXm0WKeZRI-4cY0mia3KjNHoj5WfKN97nogArOTNS7O4DmVND2mcBQYvvk0QOBwQh36oBB5URP8UuHDhTu8ahDv0OVo8VCd2JrKisB3mP4n8qYd1wxi_mxruGck29XArScJg3EdK2nbp7zLmqLHfY6tJMXt_xRYEqGHLm8b8gmfmDvHhQ4X2S7hxqsF9KpufjfAiGy9qhMvS-BuLSob_',
    'Kaelo Platform — FinTech Analytics' -- [placeholder]
  ),
  (
    'post-ollama',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDhuloIhMHnCLkNDQCnrfaVmYtN29dTEYagaUBSrbUbJvnSPL_AnyPvheRX6nJxQCZHjKavUSpRuOmVtXsQbkyymURHRt8qSeowMsG7ymYu21SDju-FZJThnhzGONPHyvFklbRDFQrCh0G_FN2qYVvcPnQqbW2wgjpyyTUjpVps3ajRRFmGmTdAJ_S2RPBtEJdNIzo_y_d5t7AN0sMIarYRMLKjzeA8vn4m4uogJqneIVbXA21fDt-U',
    'Synapse Core — Automation & AI' -- [placeholder]
  )
on conflict (key) do nothing;

-- --- posts (base compartida) ----------------------------------------------
insert into public.posts (slug_base, category, cover_image_id, status, published_at)
select v.slug_base, v.category, i.id, 'published', v.published_at::timestamptz
from (
  values
    ('mas-alla-de-la-reactividad', 'Arquitectura Frontend', 'post-featured', '2026-02-14'),
    ('sistemas-diseno-css-puro', '01 // Dev', 'post-css', '2026-02-03'),
    ('ollama-local-produccion', '03 // IA', 'post-ollama', '2026-01-22')
) as v (slug_base, category, cover_key, published_at)
join public.images i on i.key = v.cover_key
on conflict (slug_base) do nothing;

-- --- post_translations (ES + EN) ------------------------------------------
insert into public.post_translations (post_id, locale, title, excerpt, body, reading_minutes)
select p.id, v.locale, v.title, v.excerpt, v.body, v.reading_minutes
from (
  values
    -- mas-alla-de-la-reactividad [placeholder]
    (
      'mas-alla-de-la-reactividad',
      'es',
      'Más allá de la reactividad: composición funcional y rendimiento en browsers modernos',
      'Un análisis pausado sobre por qué el exceso de capas de abstracción daña el Core Web Vitals y cómo recuperar la fluidez cinematográfica a 60 FPS.',
      'Un análisis pausado sobre por qué el exceso de capas de abstracción daña el Core Web Vitals y cómo recuperar la fluidez cinematográfica a 60 FPS.

Cada framework añade una capa, y cada capa suma trabajo en el hilo principal. Este ensayo desmonta el coste real de la abstracción y propone un camino de vuelta a la composición simple.

El resultado no es solo un número mejor en Lighthouse: es recuperar la sensación de un interfaz que responde antes de que termines de pensar.',
      6
    ),
    (
      'mas-alla-de-la-reactividad',
      'en',
      'Beyond reactivity: functional composition and performance in modern browsers',
      'A measured look at why an excess of abstraction layers hurts Core Web Vitals and how to get cinematic 60 FPS fluidity back.',
      'A measured look at why an excess of abstraction layers hurts Core Web Vitals and how to get cinematic 60 FPS fluidity back.

Every framework adds a layer, and every layer adds work to the main thread. This essay breaks down the real cost of abstraction and proposes a path back to simple composition.

The result is not just a better Lighthouse score: it is recovering the feeling of an interface that responds before you finish thinking.',
      6
    ),
    -- sistemas-diseno-css-puro [placeholder]
    (
      'sistemas-diseno-css-puro',
      'es',
      'Sistemas de diseño dinámicos en CSS puro',
      'Tokens, custom properties y @layer para mantener un sistema vivo sin arrastrar un runtime de JavaScript al navegador.',
      'Tokens, custom properties y @layer para mantener un sistema vivo sin arrastrar un runtime de JavaScript al navegador.

Un sistema de diseño no muere por falta de componentes: muere por exceso de acoplamiento. Con CSS puro se puede vivir, tematizarse y escalar sin peso extra.

Recorremos la arquitectura de capas, la estrategia de tokens y los límites honestos de esta aproximación.',
      5
    ),
    (
      'sistemas-diseno-css-puro',
      'en',
      'Dynamic design systems in pure CSS',
      'Tokens, custom properties and @layer to keep a system alive without dragging a JavaScript runtime into the browser.',
      'Tokens, custom properties and @layer to keep a system alive without dragging a JavaScript runtime into the browser.

A design system does not die from a lack of components: it dies from excess coupling. With pure CSS you can live, theme and scale without extra weight.

We walk through the layer architecture, the token strategy and the honest limits of this approach.',
      5
    ),
    -- ollama-local-produccion [placeholder]
    (
      'ollama-local-produccion',
      'es',
      'Modelos locales en producción con Ollama',
      'Qué cambia cuando el modelo vive en tu servidor: latencia, coste, privacidad y las decisiones de infraestructura que nadie te cuenta.',
      'Qué cambia cuando el modelo vive en tu servidor: latencia, coste, privacidad y las decisiones de infraestructura que nadie te cuenta.

Ejecutar modelos localmente no es solo ahorrar API: es asumir cargas, colas y versiones como cualquier otro servicio.

Guía práctica desde el primer `ollama run` hasta un despliegue con métricas y expectativas realistas.',
      7
    ),
    (
      'ollama-local-produccion',
      'en',
      'Local models in production with Ollama',
      'What changes when the model lives on your server: latency, cost, privacy and the infrastructure decisions nobody tells you about.',
      'What changes when the model lives on your server: latency, cost, privacy and the infrastructure decisions nobody tells you about.

Running models locally is not just saving on API bills: it means owning loads, queues and versions like any other service.

A practical guide from your first `ollama run` to a deployment with metrics and realistic expectations.',
      7
    )
) as v (slug_base, locale, title, excerpt, body, reading_minutes)
join public.posts p on p.slug_base = v.slug_base
on conflict (post_id, locale) do nothing;
