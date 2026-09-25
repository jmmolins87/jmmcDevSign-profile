/* SPEC 02 — Primitiva: cabecera "NN — NOMBRE" + hairline.
   `className` cubre la única variante real: Experiencia usa "mb-20". */

type SectionHeadingProps = {
  index: string;
  name: string;
  className?: string;
};

export default function SectionHeading({
  index,
  name,
  className = "mb-16",
}: SectionHeadingProps) {
  return (
    <div className={`flex items-center gap-space-md ${className}`}>
      <span className="font-mono-code text-mono-code text-primary uppercase tracking-[0.06em]">
        {index} — {name}
      </span>
      <div className="h-[1px] flex-1 bg-outline-variant" />
    </div>
  );
}
