export function GET() {
  return new Response(
    "<!doctype html><html lang=\"es\"><head><meta name=\"robots\" content=\"noindex\"><title>Post no encontrado | JMMC</title></head><body><main><p>{ 404 // POST NOT FOUND }</p><h1>Esta publicación no está disponible</h1><p>El slug no existe o el documento todavía no está publicado.</p><a href=\"/es/\">[ VOLVER AL PORTFOLIO ]</a></main></body></html>",
    {
      headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
      status: 404,
    },
  );
}

