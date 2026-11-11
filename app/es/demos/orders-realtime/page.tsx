import { DemoPageShell } from "@/app/es/demos/_components/demo-page-shell";
import { OrdersPanel } from "@/app/es/demos/orders-realtime/orders-panel";

export default function OrdersRealtimePage() {
  return (
    <DemoPageShell
      allowedRoles={["admin", "editor", "lector"]}
      description="Observa pedidos, filtra por estado y emite eventos realtime mock de forma determinista."
      eyebrow="08 / order stream"
      id="orders-realtime-title"
      title="Pedidos realtime"
    >
      <OrdersPanel />
    </DemoPageShell>
  );
}
