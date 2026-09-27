/* SPEC 07 — Vista RESUMEN: KPIs, gráfico, citas, tabla facturas, stock. */

"use client";

import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { useDict } from "@/lib/i18n/I18nProvider";
import Kpis from "./Kpis";
import Chart from "./Chart";
import Appointments from "./Appointments";
import InvoicesTable from "./InvoicesTable";
import StockAlerts from "./StockAlerts";

export default function ResumenView() {
  const { demosSoftware } = useDict().sections;
  const headings = demosSoftware.headings;

  return (
    <>
      <Section id="kpis" anim="stagger-in" padding="py-8">
        <Kpis />
      </Section>
      <Section id="chart" anim="fade-up" padding="py-8">
        <SectionHeading index="01" name={headings.chart} />
        <Chart />
      </Section>
      <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <Section id="appointments" anim="fade-up" divider={false} className="lg:col-span-4" padding="py-8">
          <SectionHeading index="02" name={headings.appointments} />
          <Appointments />
        </Section>
        <Section id="invoices" anim="fade-up" divider={false} className="lg:col-span-8" padding="py-8">
          <SectionHeading index="03" name={headings.invoices} />
          <InvoicesTable />
        </Section>
      </div>
      <Section id="stock" anim="fade-up" padding="py-8">
        <SectionHeading index="04" name={headings.stock} />
        <StockAlerts />
      </Section>
    </>
  );
}