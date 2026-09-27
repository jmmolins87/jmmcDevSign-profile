/* SPEC 07 — Vista placeholder para tabs secundarias. */

"use client";

import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { useDict } from "@/lib/i18n/I18nProvider";

export default function PlaceholderView({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const { demosSoftware } = useDict().sections;
  return (
    <Section id={id} anim="fade-up">
      <SectionHeading index="—" name={title} />
      <div className="flex items-center justify-center min-h-[200px] text-on-surface-variant">
        <p className="font-body-lg text-center">
          {demosSoftware.comingSoon}
        </p>
      </div>
    </Section>
  );
}