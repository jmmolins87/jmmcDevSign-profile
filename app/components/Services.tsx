/* SPEC 01 — Paso 7: sección 05 — Servicios (4 tarjetas numeradas). */

import { services } from "@/lib/content";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";

export default function Services() {
  return (
    <Section id="servicios" anim="reveal-lines">
      <SectionHeading index="05" name="Servicios" />
        {/* 4 Numbered Cards in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.index}
              className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-col justify-between h-[360px] group hover:border-primary transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-on-surface-variant mb-8">
                  <span className="font-mono-code text-[13px] text-primary">
                    {service.index} /
                  </span>
                  <span
                    className="material-symbols-outlined text-[28px] text-on-surface group-hover:text-primary transition-colors"
                    style={{ fontVariationSettings: "'wght' 200" }}
                  >
                    {service.icon}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3">
                  {service.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {service.body}
                </p>
              </div>
              <span className="font-mono-code text-[11px] uppercase tracking-wider text-outline">
                {service.meta}
              </span>
            </div>
          ))}
        </div>
    </Section>
  );
}
