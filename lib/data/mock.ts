/* SPEC 03 — Implementación mock de la capa de datos.
   Reutiliza los valores actuales (hotlink asumido por SPEC 01).
   SPEC 10 paso 7: posts en el modelo bilingüe (translations es/en).
   Todo contenido de ejemplo lleva // [placeholder]. */

import type { Post, SiteImage } from "./types";

export const MOCK_IMAGES: Record<string, SiteImage> = {
  hero: {
    key: "hero", // [placeholder]
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKaearigWhLy1U-xRq1hRmMDKoiTT8JXAe3p8qC9WFn0sffFBNu_k5m7r08bihl9iGjdtHrP8kxhUc7jUlry3j8AgXmasDyFoXE-U6MSYH34hJXFrEE59c0oiU_-wk8u9wkNNYy4IU4QYIs816f7UyKx76IOmKjcggTn1QTpOocWWvRj5tX0Aqh2KoZEcC6qnOG4tIzghm48GuzuuC0IasEOqPGX99rphjTKl-Y8dAeRKAIhq4nfjt", // [placeholder]
    alt: "Interior arquitectónico minimalista cinematográfico con luz terracota cálida", // [placeholder]
  },
  portrait: {
    key: "portrait", // [placeholder]
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCCTrXMpPUglLzlsOZKeAEfVB2gXQyCEpCZqCm6ai0ED5YDTkquWKgHPGogMv2tN7IkYmSPYnEXzeLVip5Sr3sV1yE76ZINbwFcaNckOX87pL3pk0xfXSdkAKuZojGSXIZe1opoIoG0JpKA9wDrNeEIfRpN1OEO-xh0B_Q3UzcogVo5Vpb8a2zK-QQcEFnK5C69kkhyXlINhfNxI8JTB4T4xVzdI3yq2dQPIjZHN6HumS6zezDOV18", // [placeholder]
    alt: "Retrato de estudio de JMMC, director creativo e ingeniero de software", // [placeholder]
  },
  "project-01": {
    key: "project-01", // [placeholder]
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWsxf0NpdttfMh88wqA27BcA2N91szgUCHrXm0WKeZRI-4cY0mia3KjNHoj5WfKN97nogArOTNS7O4DmVND2mcBQYvvk0QOBwQh36oBB5URP8UuHDhTu8ahDv0OVo8VCd2JrKisB3mP4n8qYd1wxi_mxruGck29XArScJg3EdK2nbp7zLmqLHfY6tJMXt_xRYEqGHLm8b8gmfmDvHhQ4X2S7hxqsF9KpufjfAiGy9qhMvS-BuLSob_", // [placeholder]
    alt: "Kaelo Platform — FinTech Analytics", // [placeholder]
  },
  "project-02": {
    key: "project-02", // [placeholder]
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9k4qs3b5soYOUu4rSOx-H3WuHEXUPL7Wk0XVhtTlEYp6x9jsIb7x94iFCMqnmnDyo_GBs-T921DnYJTmH1r9niz9SLQkucAEz3fm6VE1nzqf9TwplpSlltRkWGh5JglSm6EJl31-bnzJv4e-HN-a4rnjh-W_A-EpyZwGtbl01Q7wSO_9qeAt6g8iafxCXXt53qqcmI7xpVxrJVIukRqOTK89Rcx5o70akWbDDfW6Gtz6QIRdoaBmT", // [placeholder]
    alt: "Atelier Solstice — E-Commerce Editorial", // [placeholder]
  },
  "project-03": {
    key: "project-03", // [placeholder]
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhuloIhMHnCLkNDQCnrfaVmYtN29dTEYagaUBSrbUbJvnSPL_AnyPvheRX6nJxQCZHjKavUSpRuOmVtXsQbkyymURHRt8qSeowMsG7ymYu21SDju-FZJThnhzGONPHyvFklbRDFQrCh0G_FN2qYVvcPnQqbW2wgjpyyTUjpVps3ajRRFmGmTdAJ_S2RPBtEJdNIzo_y_d5t7AN0sMIarYRMLKjzeA8vn4m4uogJqneIVbXA21fDt-U", // [placeholder]
    alt: "Synapse Core — Automation & AI", // [placeholder]
  },
  "project-04": {
    key: "project-04", // [placeholder]
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6HyLhe5Cspiyu7361jOmlB_ODIvaP94ak03_XyKwkFOv1-RmxMwm0_Qjkcke_ybdSyZ5stuosh1HGweScCpQ4x_EEKrh_B_v01SR1VG4IrOONK6T8ogIK6M8CiWriIs5JRhm8vCg1UNWmI95vKeW7XRSz6JCHPP1SCYgL_UBQIivQ2eZtrXaB8_6hlLoV5mlbNxFQzEx0V-xwrp6eVajUXE3_ih8TWw2pNjd4n4pHnxF0TA3wMsRY", // [placeholder]
    alt: "Vesta Workspace — SaaS Enterprise", // [placeholder]
  },
  "post-featured": {
    key: "post-featured", // [placeholder]
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1UO2FHCD-wkO_dY6JY0L7R65GCyKN3eEM2gaJO2hd1oAErNKrvfcl2TMbXSgYLrgEBOYMRU1jx56AT2hNSu8auI3NF-_J_gnzUc1dB3ZjIzWbSR8vXCH3ayPavWis5RleyJMsKqFUNRZ7bDmEH3WdmSy1kStlL-7uO7yCJrWlmT7QIenvgf3RhYdvxmBFHh9b72_l-QH-GwHuTuLzbCjdwvu6Hua9FxAi3BcTJ6JQbAZflgxPbUO2", // [placeholder]
    alt: "Cuaderno de especímenes tipográficos sobre mesa de arquitecto", // [placeholder]
  },
};

export const MOCK_POSTS: Post[] = [
  {
    slugBase: "mas-alla-de-la-reactividad", // [placeholder]
    category: "Arquitectura Frontend", // [placeholder]
    status: "published",
    publishedAt: "2026-02-14", // [placeholder]
    cover: MOCK_IMAGES["post-featured"],
    translations: {
      es: {
        locale: "es",
        title:
          "Más allá de la reactividad: composición funcional y rendimiento en browsers modernos", // [placeholder]
        excerpt:
          "Un análisis pausado sobre por qué el exceso de capas de abstracción daña el Core Web Vitals y cómo recuperar la fluidez cinematográfica a 60 FPS.", // [placeholder]
        body:
          "Un análisis pausado sobre por qué el exceso de capas de abstracción daña el Core Web Vitals y cómo recuperar la fluidez cinematográfica a 60 FPS.\n\nCada framework añade una capa, y cada capa suma trabajo en el hilo principal. Este ensayo desmonta el coste real de la abstracción y propone un camino de vuelta a la composición simple.\n\nEl resultado no es solo un número mejor en Lighthouse: es recuperar la sensación de un interfaz que responde antes de que termines de pensar.", // [placeholder]
        readingMinutes: 6,
      },
      en: {
        locale: "en",
        title:
          "Beyond reactivity: functional composition and performance in modern browsers", // [placeholder]
        excerpt:
          "A measured look at why an excess of abstraction layers hurts Core Web Vitals and how to get cinematic 60 FPS fluidity back.", // [placeholder]
        body:
          "A measured look at why an excess of abstraction layers hurts Core Web Vitals and how to get cinematic 60 FPS fluidity back.\n\nEvery framework adds a layer, and every layer adds work to the main thread. This essay breaks down the real cost of abstraction and proposes a path back to simple composition.\n\nThe result is not just a better Lighthouse score: it is recovering the feeling of an interface that responds before you finish thinking.", // [placeholder]
        readingMinutes: 6,
      },
    },
  },
  {
    slugBase: "sistemas-diseno-css-puro", // [placeholder]
    category: "01 // Dev", // [placeholder]
    status: "published",
    publishedAt: "2026-02-03", // [placeholder]
    cover: MOCK_IMAGES["project-01"],
    translations: {
      es: {
        locale: "es",
        title: "Sistemas de diseño dinámicos en CSS puro", // [placeholder]
        excerpt:
          "Tokens, custom properties y `@layer` para mantener un sistema vivo sin arrastrar un runtime de JavaScript al navegador.", // [placeholder]
        body:
          "Tokens, custom properties y @layer para mantener un sistema vivo sin arrastrar un runtime de JavaScript al navegador.\n\nUn sistema de diseño no muere por falta de componentes: muere por exceso de acoplamiento. Con CSS puro se puede vivir, tematizarse y escalar sin peso extra.\n\nRecorremos la arquitectura de capas, la estrategia de tokens y los límites honestos de esta aproximación.", // [placeholder]
        readingMinutes: 5,
      },
      en: {
        locale: "en",
        title: "Dynamic design systems in pure CSS", // [placeholder]
        excerpt:
          "Tokens, custom properties and @layer to keep a system alive without dragging a JavaScript runtime into the browser.", // [placeholder]
        body:
          "Tokens, custom properties and @layer to keep a system alive without dragging a JavaScript runtime into the browser.\n\nA design system does not die from a lack of components: it dies from excess coupling. With pure CSS you can live, theme and scale without extra weight.\n\nWe walk through the layer architecture, the token strategy and the honest limits of this approach.", // [placeholder]
        readingMinutes: 5,
      },
    },
  },
  {
    slugBase: "ollama-local-produccion", // [placeholder]
    category: "03 // IA", // [placeholder]
    status: "published",
    publishedAt: "2026-01-22", // [placeholder]
    cover: MOCK_IMAGES["project-03"],
    translations: {
      es: {
        locale: "es",
        title: "Modelos locales en producción con Ollama", // [placeholder]
        excerpt:
          "Qué cambia cuando el modelo vive en tu servidor: latencia, coste, privacidad y las decisiones de infraestructura que nadie te cuenta.", // [placeholder]
        body:
          "Qué cambia cuando el modelo vive en tu servidor: latencia, coste, privacidad y las decisiones de infraestructura que nadie te cuenta.\n\nEjecutar modelos localmente no es solo ahorrar API: es asumir cargas, colas y versiones como cualquier otro servicio.\n\nGuía práctica desde el primer `ollama run` hasta un despliegue con métricas y expectativas realistas.", // [placeholder]
        readingMinutes: 7,
      },
      // Sin traducción EN a propósito: fixture de fallback
      // (`/en/blog/ollama-local-produccion` muestra ES con aviso).
    },
  },
];
