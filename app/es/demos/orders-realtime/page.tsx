import { SHARED_SURFACE_ROLES } from "@/app/es/auth/roles";
import { DemoPageShell } from "@/app/es/demos/_components/demo-page-shell";
import { OrdersPanel } from "@/app/es/demos/orders-realtime/orders-panel";

export default function OrdersRealtimePage() {
  return (
    <DemoPageShell
      allowedRoles={SHARED_SURFACE_ROLES}
      description="Observa pedidos, filtra por estado y emite eventos en tiempo real de forma determinista."
      eyebrow="08 / order stream"
      id="orders-realtime-title"
      title="Pedidos en tiempo real"
    >
      <OrdersPanel />
    </DemoPageShell>
  );
}
