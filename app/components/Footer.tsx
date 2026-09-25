/* SPEC 01 — Paso 1: footer editorial. */

export default function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant bg-surface-container-low mt-space-xl">
      <div className="max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg text-on-surface-variant">
        <div className="flex items-center gap-space-md font-mono-code text-mono-code">
          <span className="text-on-surface font-medium">© 2026 JMMC</span>
          <span className="text-outline-variant">/</span>
          <span className="font-label-caps text-label-caps uppercase tracking-wider">
            Fullstack &amp; UI/UX
          </span>
        </div>
        <div className="flex items-center gap-space-lg font-mono-code text-mono-code">
          <div className="flex items-center gap-1 font-label-caps text-label-caps uppercase">
            <a
              href="#top"
              className="text-on-surface font-semibold hover:text-primary transition-colors"
            >
              ES
            </a>
            <span className="text-outline-variant">|</span>
            <span className="text-on-surface-variant">EN</span>
          </div>
          <span className="text-outline-variant hidden sm:inline">/</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            LinkedIn
          </a>
          <span className="text-outline-variant hidden sm:inline">/</span>
          <a
            href="#top"
            className="hover:text-on-surface flex items-center gap-1 transition-colors font-mono-code text-mono-code"
          >
            <span className="font-label-caps text-label-caps uppercase">
              Volver arriba
            </span>
            <span className="material-symbols-outlined text-[16px]">north</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
