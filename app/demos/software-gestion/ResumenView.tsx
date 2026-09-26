/* SPEC 07 — Vista RESUMEN: KPIs, gráfico, citas, tabla facturas, stock. */

"use client";

import Section from "@/app/components/ui/Section";
import SectionHeading from "@/app/components/ui/SectionHeading";
import Kpis from "./Kpis";
import Chart from "./Chart";
import Appointments from "./Appointments";
import InvoicesTable from "./InvoicesTable";
import StockAlerts from "./StockAlerts";

export default function ResumenView() {
  return (
    <>
      <Section id="kpis" anim="stagger-in" padding="py-8">
        <Kpis />
      </Section>
      <Section id="chart" anim="fade-up" padding="py-8">
        <SectionHeading index="01" name="EVOLUCIÓN DE INGRESOS Y COBROS" />
        <Chart />
      </Section>
      <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <Section id="appointments" anim="fade-up" divider={false} className="lg:col-span-4" padding="py-8">
          <SectionHeading index="02" name="CITAS DE HOY" />
          <Appointments />
        </Section>
        <Section id="invoices" anim="fade-up" divider={false} className="lg:col-span-8" padding="py-8">
          <SectionHeading index="03" name="ÚLTIMAS FACTURAS EMITIDAS" />
          <InvoicesTable />
        </Section>
      </div>
      <Section id="stock" anim="fade-up" padding="py-8">
        <SectionHeading index="04" name="ALERTAS DE INVENTARIO" />
        <StockAlerts />
      </Section>
    </>
  );
}