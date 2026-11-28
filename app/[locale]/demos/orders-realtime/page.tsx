import { OrdersPanel } from "@/app/[locale]/demos/orders-realtime/orders-panel";
import { DemoGuideProvider } from "@/app/components/demo-guide";

export default function OrdersRealtimePage() {
  return <DemoGuideProvider demo="orders"><OrdersPanel /></DemoGuideProvider>;
}
