/* SPEC 02 — Primitiva: wrapper de sección (contenedor 1280px + divisor).
   `padding` y `divider` cubren las variantes reales: el hero usa
   "pt-space-xl pb-32" y Contacto no lleva divisor. */

import type { ReactNode } from "react";
import HairlineDivider from "./HairlineDivider";

type SectionProps = {
  id?: string;
  anim?: string;
  divider?: boolean;
  padding?: string;
  className?: string;
  children: ReactNode;
};

const BASE = "w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin";

export default function Section({
  id,
  anim,
  divider = true,
  padding = "py-32",
  className = "",
  children,
}: SectionProps) {
  return (
    <>
      <section
        id={id}
        data-anim={anim}
        className={`${BASE} ${padding} ${className}`.trim()}
      >
        {children}
      </section>
      {divider && <HairlineDivider />}
    </>
  );
}
