/* SPEC 07 — Vista placeholder para tabs secundarias. */

"use client";

import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";

export default function PlaceholderView({ title }: { title: string }) {
  return (
    <Section id={title.toLowerCase()} anim="fade-up">
      <SectionHeading index="—" name={title} />
      <div className="flex items-center justify-center min-h-[200px] text-on-surface-variant">
        <p className="font-body-lg text-center">
          Próximamente en esta demo
        </p>
      </div>
    </Section>
  );
}