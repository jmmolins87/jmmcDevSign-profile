type LanguageSelectorProps = Readonly<{
  alwaysVisible?: boolean;
}>;

export function LanguageSelector({ alwaysVisible = false }: LanguageSelectorProps = {}) {
  return (
    <div
      aria-label="Selector de idioma"
      className={/* taste-skill-ignore: technical selector token from DESIGN.md */ `${alwaysVisible ? "flex" : "hidden lg:flex"} items-center border border-border font-mono text-mono-code uppercase tracking-[0.12em]`}
      role="group"
    >
      <button
        aria-pressed="true"
        className="min-h-10 min-w-10 bg-primary px-space-sm text-primary-foreground"
        type="button"
      >
        ES
      </button>
      <span aria-hidden="true" className="text-border-strong">
        /
      </span>
      <button
        aria-pressed="false"
        className="min-h-10 min-w-10 px-space-sm text-on-surface-variant disabled:cursor-not-allowed"
        disabled
        title="El inglés se añadirá en una fase futura"
        type="button"
      >
        EN
      </button>
    </div>
  );
}
