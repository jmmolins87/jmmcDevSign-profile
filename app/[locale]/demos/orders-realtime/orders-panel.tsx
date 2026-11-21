"use client";

import Link from "next/link";
import { useOrdersText } from "./orders-copy";
import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import { DemoPlaybackControls } from "@/app/components/demo-playback-controls";
import { useDemoPlayback } from "@/app/lib/use-demo-playback";

import {
  ordersDomainAdapter,
  ordersRealtimeTransport,
  ordersRepository,
  ordersRuntimeService,
  type MockOrder,
  type MobileOrdersView,
  type OrderConnectionState,
  type OrderItemId,
  type OrderScenario,
  type OrdersWorkspace,
} from "@/app/[locale]/demos/orders-realtime/domain";

import styles from "./orders-panel.module.css";

const moneyFormatter = new Intl.NumberFormat("es-ES", { useGrouping: "always", minimumFractionDigits: 2, maximumFractionDigits: 2 });

const connectionLabels: Record<OrderConnectionState, string> = {
  connected: "{ CONECTADO // WSS://STREAM.BURGER.DEV }",
  reconnecting: "{ RECONECTANDO // WSS://STREAM.BURGER.DEV }",
  offline: "{ OFFLINE // STREAM.BURGER.DEV }",
};

const connectionLatency: Record<OrderConnectionState, string> = {
  connected: "24ms",
  reconnecting: "180ms",
  offline: "0ms",
};

const connectionIcons: Record<OrderConnectionState, string> = {
  connected: "✓",
  reconnecting: "↻",
  offline: "×",
};

const connectionIconStyles: Record<OrderConnectionState, string> = {
  connected: styles.connectionConnected,
  reconnecting: styles.connectionReconnecting,
  offline: styles.connectionOffline,
};

const scenarioButtons: readonly { id: OrderScenario; label: string }[] = [
  { id: "live", label: "[ 01. EN VIVO (SINCRONIZADO) ]" },
  { id: "incoming", label: "[ 02. NUEVO PEDIDO ENTRANTE (✦) ]" },
  { id: "rush", label: "[ 03. COCINA EN HORA PUNTA ]" },
  { id: "high_latency", label: "[ 04. LATENCIA ALTA (RECONECTANDO) ]" },
];

const connectionButtons: readonly { id: OrderConnectionState; label: string }[] = [
  { id: "connected", label: "{ CONECTADO }" },
  { id: "reconnecting", label: "RECONECTANDO" },
  { id: "offline", label: "OFFLINE" },
];

const orderCatalog = ordersDomainAdapter.getCatalog();

function formatMoney(amount: number): string {
  return `${moneyFormatter.format(amount)} €`;
}

function clientStatusLabel(status: OrdersWorkspace["clientStatus"]): string {
  return { confirmed: "CONFIRMADO", cooking: "PREPARANDO TU PEDIDO", ready: "¡LISTO PARA RECOGER!" }[status];
}

function countLabel(count: number): string {
  return `[ ${String(count).padStart(2, "0")} ]`;
}

function eventClassName(type: string): string {
  if (type === "IN" || type === "CLIENT") return styles.eventAccent;
  if (type === "ERR" || type === "WARN") return styles.eventError;
  if (type === "HEARTBEAT") return styles.eventMuted;
  return styles.eventDefault;
}

type OrderCardProps = {
  order: MockOrder;
  onAdvance: (orderId: string, target: "cooking" | "ready") => void;
  onDeliver: (orderId: string) => void;
};

function OrderCard({ order, onAdvance, onDeliver }: OrderCardProps) {
  const text = useOrdersText();

  const itemNames = order.items.filter((item) => item.quantity > 0).map((item) => `${item.quantity}x ${item.name}`).slice(0, 3);
  const action = order.status === "new"
    ? { label: order.id === "B-842" ? "COMENZAR A COCINAR →" : "A PLANCHA →", onClick: () => onAdvance(order.id, "cooking") }
    : order.status === "cooking"
      ? { label: "MARCAR LISTO →", onClick: () => onAdvance(order.id, "ready") }
      : order.status === "ready"
        ? { label: "ENTREGAR ✓", onClick: () => onDeliver(order.id) }
        : order.status === "delivered"
          ? { label: "ARCHIVAR", onClick: () => onDeliver(order.id) }
          : null;

  return (
    <article className={`${styles.orderCard} ${order.id === "B-842" ? styles.orderCardFeatured : ""}`}>
      <div className={styles.orderCardHeader}>
        <span className={styles.orderId}>{order.id === "B-842" ? "✦" : ""}#{order.id}</span>
        <span className={styles.orderTimer}>{order.pin ? `PIN: ${order.pin}` : order.elapsedLabel}</span>
      </div>
      <div className={styles.orderCardBody}>
        <div className={styles.orderCustomer}>{order.customerShort} <span>• {order.tableLabel}</span></div>
        {itemNames.map((name) => <div className={styles.orderItemLine} key={`${order.id}-${name}`}>{name}</div>)}
        {order.notification ? <div className={styles.orderNotification}>{`{ ${order.notification} }`}</div> : null}
        {order.total > 0 ? <div className={styles.orderTotal}><span>{text("TOTAL TICKET:")}</span><strong>{formatMoney(order.total)}</strong></div> : null}
      </div>
      {action ? <button className={styles.orderAction} onClick={action.onClick} type="button">{text(action.label)}</button> : null}
    </article>
  );
}

export function OrdersPanel() {
  const locale = useLocale();
  const text = useOrdersText();

  const [workspace, setWorkspace] = useState<OrdersWorkspace>(() => ordersDomainAdapter.getInitialWorkspace());
  const [mobileView, setMobileView] = useState<MobileOrdersView>("client");
  const [feedback, setFeedback] = useState("Canal de tiempo real conectado. Workspace mock preparado.");
  const [persistenceWarning, setPersistenceWarning] = useState<string | null>(null);
  const playbackOrderId = useRef<string | null>(null);
  const playback = useDemoPlayback({
    steps: [
      { id: "incoming-1", label: text("Pedido entrante · NUEVO"), durationMs: 1000 },
      { id: "cooking-1", label: text("Preparar · EN PLANCHA"), durationMs: 1200 },
      { id: "ready-1", label: text("Finalizar · LISTO"), durationMs: 1200 },
      { id: "delivered-1", label: text("Entregar · ENTREGADO"), durationMs: 1200 },
      { id: "incoming-2", label: text("Segundo pedido · NUEVO"), durationMs: 1200 },
      { id: "cooking-2", label: text("Preparar · EN PLANCHA"), durationMs: 1200 },
      { id: "ready-2", label: text("Finalizar · LISTO"), durationMs: 1200 },
      { id: "delivered-2", label: text("Entregar · ENTREGADO"), durationMs: 1200 },
    ],
    async onReset() {
      try {
      playbackOrderId.current = null;
      setWorkspace(await ordersRepository.resetWorkspace());
      setPersistenceWarning(null);
      setFeedback("Canal de tiempo real conectado. Workspace mock preparado.");
    
      } catch (error: unknown) {
        throw new Error(text(error instanceof Error ? error.message : "La operación mock no pudo completarse."));
      }
    },
    async onStep(step) {
      try {
      if (step.startsWith("incoming")) {
        const result = await ordersRuntimeService.dispatchOrder();
        playbackOrderId.current = result.order.id;
        setWorkspace(result.workspace);
        setFeedback(`Pedido ${result.order.id} emitido: evento recibido en NUEVO.`);
      } else {
        const orderId = playbackOrderId.current;
        if (!orderId) throw new Error("No hay un pedido activo para reproducir.");
        const next = step.startsWith("delivered")
          ? await ordersRuntimeService.deliverOrder({ orderId })
          : await ordersRuntimeService.advanceOrder({ orderId, target: step.startsWith("cooking") ? "cooking" : "ready" });
        setWorkspace(next);
        setFeedback(`${orderId}: ${step.startsWith("delivered") ? "ENTREGADO" : step.startsWith("cooking") ? "EN PLANCHA" : "LISTO"}.`);
      }
    
      } catch (error: unknown) {
        throw new Error(text(error instanceof Error ? error.message : "La operación mock no pudo completarse."));
      }
    },
  });

  useEffect(() => {
    let active = true;
    void ordersRepository.getSnapshot().then((snapshot) => {
      if (!active) return;
      setWorkspace(snapshot);
      const warning = ordersRepository.consumePersistenceWarning();
      if (warning) {
        setPersistenceWarning(warning);
        setFeedback(`Aviso de persistencia: ${warning}`);
      }
    }).catch((error: unknown) => {
      if (!active) return;
      setFeedback(error instanceof Error ? error.message : "No se pudo hidratar el snapshot; se mantiene el fixture seguro en memoria.");
    });

    const unsubscribe = ordersRealtimeTransport.subscribe((event) => {
      if (!active) return;
      setWorkspace((current) => ({ ...current, events: [event, ...current.events.filter((candidate) => candidate.id !== event.id)].slice(0, 40) }));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const { subtotal: cartSubtotal, tax, total } = useMemo(() => ordersDomainAdapter.getCartTotals(workspace.cart), [workspace.cart]);
  const visibleEvents = workspace.streamFilter
    ? workspace.events.filter((event) => event.orderId?.includes(workspace.streamFilter) || event.message.includes(workspace.streamFilter))
    : workspace.events;
  const newOrders = workspace.orders.filter((order) => order.status === "new");
  const cookingOrders = workspace.orders.filter((order) => order.status === "cooking");
  const readyOrders = workspace.orders.filter((order) => order.status === "ready");
  const deliveredOrders = workspace.orders.filter((order) => order.status === "delivered");

  async function applyWorkspace(action: () => Promise<OrdersWorkspace>, nextFeedback: string): Promise<void> {
    try {
      const nextWorkspace = await action();
      setWorkspace(nextWorkspace);
      setFeedback(nextFeedback);
      const warning = ordersRepository.consumePersistenceWarning();
      if (warning) {
        setPersistenceWarning(warning);
        setFeedback(`Aviso de persistencia: ${warning}`);
      }
    } catch (error: unknown) {
      setFeedback(error instanceof Error ? error.message : "La operación no pudo completarse en el runtime mock.");
    }
  }

  function adjustQuantity(item: OrderItemId, delta: number): void {
    void applyWorkspace(() => ordersRuntimeService.updateCart({ item, delta }), `Carrito actualizado: ${item}.`);
  }

  function handleDispatch(): void {
    void (async () => {
      try {
        const result = await ordersRuntimeService.dispatchOrder();
        setWorkspace(result.workspace);
        setFeedback(`Pedido ${result.order.id} emitido: evento recibido en NUEVO.`);
      } catch (error: unknown) {
        setFeedback(error instanceof Error ? error.message : "No se pudo emitir el pedido mock.");
      }
    })();
  }

  function handleAdvance(orderId: string, target: "cooking" | "ready"): void {
    void applyWorkspace(() => ordersRuntimeService.advanceOrder({ orderId, target }), `${orderId}: evento recibido, estado ${target === "cooking" ? "en plancha" : "listo"}.`);
  }

  function handleDeliver(orderId: string): void {
    void applyWorkspace(() => ordersRuntimeService.deliverOrder({ orderId }), `${orderId}: evento recibido, pedido actualizado.`);
  }

  function handleClientStatus(status: "confirmed" | "cooking" | "ready"): void {
    void applyWorkspace(() => ordersRuntimeService.simulateClientStatus({ status }), `Estado del cliente: ${clientStatusLabel(status)}.`);
  }

  function handleConnection(state: OrderConnectionState): void {
    void applyWorkspace(() => ordersRuntimeService.setConnectionState({ state }), `Conexión mock: ${state.toUpperCase()}.`);
  }

  function handleScenario(scenario: OrderScenario): void {
    void applyWorkspace(() => ordersRuntimeService.triggerScenario({ scenario }), `Escenario activo: ${scenario}.`);
  }

  function handlePause(): void {
    const wasPaused = workspace.streamPaused;
    void (async () => {
      if (!wasPaused) await playback.pause();
      await applyWorkspace(() => ordersRuntimeService.toggleStreamPause(), wasPaused ? "STREAM REANUDADO // BUFFER ACTIVO" : "STREAM PAUSADO // LOS EVENTOS AUTOMÁTICOS ESPERAN");
      if (wasPaused) await playback.resume();
    })();
  }

  function handleClear(): void {
    void applyWorkspace(() => ordersRuntimeService.clearStream(), "BUFFER REINICIADO // 0 FRAMES");
  }

  function handleFilter(): void {
    const filter = window.prompt(text("Filtrar stream por ID"), workspace.streamFilter);
    if (filter === null) return;
    void applyWorkspace(() => ordersRuntimeService.filterStream({ filter }), filter.trim() ? `FILTRO ACTIVO // ID:${filter.trim()}` : "FILTRO LIMPIO // TODOS LOS FRAMES");
  }

  return (
    <main aria-labelledby="orders-realtime-title" className={styles.ordersPage}>
      <DemoPlaybackControls playback={playback} />
      <section className={styles.technicalStrip}>
        <div className={styles.stripTop}>
          <div className={styles.stripIdentity}>
            <Link className={styles.backLink} href={localePath("/es/demos", locale)}>{text("← VOLVER A LAS DEMOS")}</Link>
            <span className={styles.separator} aria-hidden="true" />
            <span>{"{ 08 / 09 // DEMO_ORDERS_REALTIME }"}</span>
            <span className={styles.stripArchitecture}>[ ARCHITECTURE: FULL-DUPLEX KDS & CLIENT DISPATCH ]</span>
          </div>
          <div className={styles.connectionArea}>
            <div className={`${styles.connectionPill} ${connectionIconStyles[workspace.connectionState]}`}>
              <span aria-hidden="true" className={styles.connectionIcon}>{connectionIcons[workspace.connectionState]}</span>
              <span>{text(connectionLabels[workspace.connectionState])}</span>
              <strong>{connectionLatency[workspace.connectionState]}</strong>
            </div>
            <div aria-label={text("Estado de conexión")} className={styles.connectionControls} role="group">
              {connectionButtons.map((button) => <button aria-pressed={workspace.connectionState === button.id} className={workspace.connectionState === button.id ? styles.controlActive : ""} key={button.id} onClick={() => handleConnection(button.id)} type="button">{text(button.label)}</button>)}
            </div>
          </div>
        </div>
        <div className={styles.scenarioBar}>
          <span className={styles.scenarioLabel}>⚙ SCENARIO SIMULATOR:</span>
          <div className={styles.scenarioControls}>
            {scenarioButtons.map((button) => <button aria-pressed={workspace.scenario === button.id} className={workspace.scenario === button.id ? styles.scenarioActive : ""} key={button.id} onClick={() => handleScenario(button.id)} type="button">{text(button.label)}</button>)}
          </div>
        </div>
      </section>

      <header className={styles.kpiRail}>
        <h1 className={styles.visuallyHidden} id="orders-realtime-title">{text("Pedidos en tiempo real")}</h1>
        <div className={styles.kpiCard}><span>{text("{ PEDIDOS HOY }")}</span><strong>{workspace.ordersToday}</strong><em>{text("+14% vs ayer")}</em></div>
        <div className={styles.kpiCard}><span>{text("{ TIEMPO MEDIO PREPARACIÓN }")}</span><strong>8m 42s</strong><em>{text("(Meta: < 10m) [OK]")}</em></div>
        <div className={styles.kpiCard}><span>{text("{ TICKET MEDIO }")}</span><strong>24,80 €</strong><em>{text("Margen 68%")}</em></div>
        <div className={styles.kpiCard}><span>{text("{ VENTAS EN VIVO }")}</span><strong>{formatMoney(workspace.totalRevenue)} <i aria-hidden="true">■</i></strong><em className={styles.sparklineWrap}><svg aria-label={text("Tendencia de ventas")} role="img" viewBox="0 0 180 32"><polyline className={styles.sparkline} fill="none" points="0,25 20,20 40,23 60,13 80,15 100,4 120,13 140,2 160,8 180,1" /></svg><small>{text("12:00 PEAK 14:15 AHORA")}</small></em></div>
      </header>

      <div className={styles.mobileTabs} role="tablist" aria-label={text("Vista móvil de pedidos")}>
        <button aria-selected={mobileView === "client"} className={mobileView === "client" ? styles.mobileTabActive : ""} onClick={() => setMobileView("client")} role="tab" type="button">{text("{ CLIENTE } // ORDEN")}</button>
        <button aria-selected={mobileView === "kitchen"} className={mobileView === "kitchen" ? styles.mobileTabActive : ""} onClick={() => setMobileView("kitchen")} role="tab" type="button">{text("{ COCINA } // KDS")}</button>
      </div>

      <section className={styles.workspace}>
        <div className={`${styles.clientPanel} ${mobileView === "kitchen" ? styles.mobileHidden : ""}`}>
          <div className={styles.panelEyebrow}><span>{text("{ CLIENTE }")}</span><strong>ONLINE ORDERING ENGINE</strong><span>[TERMINAL MOBILE_EMU]</span></div>
          <div className={styles.phoneFrame}>
            <div className={styles.phoneTop}><span>14:41 • 5G</span><span className={styles.notch} aria-hidden="true" /><span><i aria-hidden="true">■</i> WSS:LIVE</span></div>
            <div className={styles.phoneBody}>
              <div className={styles.phoneHeader}><div><h2>BRUTAL BURGER</h2><span>{text("ORDEN ACTIVA //")}{" "}<b>#B-842</b></span></div><div className={styles.phoneMeta}><b>TAKEAWAY #04</b><span>{text("MESA INTERNA 03")}</span></div></div>
              <div className={styles.clientStatusBox}>
                <div className={styles.statusLine}><span>{text("ESTADO EN TIEMPO REAL:")}</span><strong>✦ {text(clientStatusLabel(workspace.clientStatus))}</strong></div>
                <div className={styles.progressBars} aria-label={text(`Progreso: ${text(clientStatusLabel(workspace.clientStatus))}`)} role="progressbar" aria-valuemin={0} aria-valuemax={2} aria-valuenow={workspace.clientStatus === "confirmed" ? 0 : workspace.clientStatus === "cooking" ? 1 : 2}><span className={workspace.clientStatus !== "confirmed" ? styles.progressDone : ""} /><span className={workspace.clientStatus === "ready" ? styles.progressDone : workspace.clientStatus === "cooking" ? styles.progressCurrent : ""} /><span className={workspace.clientStatus === "ready" ? styles.progressDone : ""} /></div>
                <div className={styles.progressLabels}><span>{text("1. RECIBIDO")}</span><span>{text("2. COCINANDO")}</span><span>{text("3. LISTO")}</span></div>
                <div className={styles.clientSimulator}><span>{text("EMULAR EVENTO:")}</span><div><button onClick={() => handleClientStatus("ready")} type="button">{text("→ LISTO")}</button><button onClick={() => handleClientStatus("cooking")} type="button">{text("→ PLANCHA")}</button><button onClick={() => handleClientStatus("confirmed")} type="button">{text("→ NUEVO")}</button></div></div>
              </div>
              <div className={styles.menuHeader}><span>{text("// SELECCIÓN DE PRODUCTOS")}</span><span>{text("CANT / TOTAL")}</span></div>
              {orderCatalog.map((item, index) => {
                const itemId = item.id;
                return <div className={styles.menuItem} key={item.id}><div><b>{String(index + 1).padStart(2, "0")}. {item.name}</b><p>{item.description}</p><span>{formatMoney(item.unitPrice)} {" "}{text("/ ud")}</span></div><div className={styles.quantityControls}><button aria-label={text(`Reducir ${item.name}`)} onClick={() => adjustQuantity(itemId, -1)} type="button">−</button><strong>{workspace.cart[itemId]}</strong><button aria-label={text(`Aumentar ${item.name}`)} onClick={() => adjustQuantity(itemId, 1)} type="button">+</button></div></div>;
              })}
              <div className={styles.orderSummary}><div><span>SUBTOTAL</span><b>{formatMoney(cartSubtotal)}</b></div><div><span>{text("IMPUESTOS (IVA 10%)")}</span><b>{formatMoney(tax)}</b></div><div className={styles.orderSummaryTotal}><strong>{text("TOTAL A PAGAR")}</strong><b>{formatMoney(total)}</b></div></div>
              <button className={styles.dispatchButton} onClick={handleDispatch} type="button">{text("✦ ENVIAR PEDIDO [ PEDIR ↵ ]")}{" "}<small>WSS.EMIT</small></button>
              <div className={styles.phoneFooter}><span>CLIENT: ELENA R.</span><span>DEV_UUID: 4f98-b842-live</span></div>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className={styles.duplexDivider}><span>{"{ WSS CLIENT OUTBOUND }"}</span><div><b>✦</b><i /><strong>↔<small>24ms</small></strong><i /><b>✦</b></div><span>{"{ WSS KDS INBOUND }"}</span></div>

        <div className={`${styles.kitchenPanel} ${mobileView === "client" ? styles.mobileHidden : ""}`}>
          <div className={styles.kitchenHeader}><div><div className={styles.panelEyebrow}><span>{text("{ COCINA }")}</span><strong>KITCHEN DISPLAY SYSTEM (KDS)</strong></div><p>{text("ESTACIÓN ACTIVA:")}{" "}<b>{text("LINEA CENTRAL // BRUTAL_GRILL")}</b></p></div><div className={styles.kitchenTools}><div><button className={styles.controlActive} type="button">{text("TODAS")}</button><button type="button">{text("PARRILLA")}</button><button type="button">{text("ENSAMBLE")}</button></div><span>{text("♧ ALERTAS: ON")}</span></div></div>
          <div className={styles.kdsBoard}>
            <section className={styles.kdsColumn}><header><b><i aria-hidden="true" />{text("{ NUEVO }")}</b><span>{countLabel(newOrders.length)}</span></header><div>{newOrders.map((order) => <OrderCard key={order.id} onAdvance={handleAdvance} onDeliver={handleDeliver} order={order} />)}</div></section>
            <section className={styles.kdsColumn}><header><b><i aria-hidden="true" />{text("{ EN PLANCHA }")}</b><span>{countLabel(cookingOrders.length)}</span></header><div>{cookingOrders.map((order) => <OrderCard key={order.id} onAdvance={handleAdvance} onDeliver={handleDeliver} order={order} />)}</div></section>
            <section className={styles.kdsColumn}><header><b><i aria-hidden="true" />{text("{ LISTO RECOGIDA }")}</b><span>{countLabel(readyOrders.length)}</span></header><div>{readyOrders.map((order) => <OrderCard key={order.id} onAdvance={handleAdvance} onDeliver={handleDeliver} order={order} />)}</div></section>
            <section className={styles.kdsColumn}><header><b><i aria-hidden="true" />{text("{ ENTREGADO }")}</b><span>{countLabel(deliveredOrders.length)}</span></header><div>{deliveredOrders.map((order) => <OrderCard key={order.id} onAdvance={handleAdvance} onDeliver={handleDeliver} order={order} />)}</div></section>
          </div>
          <div className={styles.kitchenFooter}><span>▣ KDS ENGINE V3.4 // DUPLEX BUS: 100% HEALTH</span><span>QUEUE CAPACITY: <b>{countLabel(workspace.orders.length)} / 20 SLOTS</b></span></div>
        </div>
      </section>

      <section aria-labelledby="orders-events-title" className={styles.eventsPanel}>
        <div className={styles.eventsHeader}><h2 id="orders-events-title">{text("✦ { EVENTOS }")}{" "}<span>{text("// PROTOCOLO WEBSOCKET EN VIVO")}</span></h2><span className={styles.bufferBadge}>BUFFER: {workspace.events.length} / 40 EVENTS</span><div className={styles.eventsActions}><button onClick={handlePause} type="button">{text(workspace.streamPaused ? "REANUDAR STREAM [ ▶ ]" : "PAUSAR STREAM [ || ]")}</button><button onClick={handleClear} type="button">{text("LIMPIAR BUFFER")}</button><button onClick={handleFilter} type="button">{text("FILTRAR POR ID")}</button><span>WSS://204.79.197.200:8443</span></div></div>
        <div aria-live="polite" className={styles.feedback} role="status">{text(feedback)}</div>
        {persistenceWarning ? <div aria-live="polite" className={styles.persistenceWarning} role="status">{text("Aviso de persistencia:")}{" "}{text(persistenceWarning)}</div> : null}
        <div className={styles.eventStream}>{visibleEvents.length > 0 ? visibleEvents.map((event) => <div className={`${styles.eventRow} ${eventClassName(event.type)}`} key={event.id}><span>[{event.at}] [WSS:{event.type}] {text(event.message)}</span><span>-- {event.latency}</span></div>) : <p className={styles.emptyStream}>{text("BUFFER VACÍO // NO HAY FRAMES QUE MOSTRAR")}</p>}</div>
        <div className={styles.protocolFooter}><span>FRAMEWORK: NATIVE RFC-6455 BINARY FRAMING // JMMC DUPLEX ARCHITECTURE</span><span>UPSTREAM: 1.2 KB/s　 DOWNSTREAM: 4.8 KB/s　 <b>ZERO DROPPED FRAMES</b></span></div>
      </section>

      <footer className={styles.operationalFooter}><div><b>✦ JUANMA // JMMC STUDIO</b><p>Fullstack Engineering & Structural Digital Architecture. Raw computational discipline rejecting ornamental decay.</p><small>VERSION // 4.2.0-STABLE<br />CORE // BRUTALIST RUNTIME</small></div><div><span>{"{ DIRECTORY }"}</span><b>SELECTED WORKS　　　 [01]</b><b>COMPLETE ARCHIVE　　[02]</b><b>DESIGN ENGINEERING　[03]</b><b>CURRICULUM & DOSSIER [04]</b></div><div><span>{"{ TELEMETRY & FEED }"}</span><b>PROTOCOL　　　　　　　 HTTPS / TLS 1.3</b><b>EDGE LATENCY　　　　　 14ms GLOBAL</b><b>FRAMEWORK　　　　　　 NATIVE VIRTUAL</b><b className={styles.footerAccent}>ACCENT　　　　　　　　 #FF5A1F STAR</b></div><div><span>{"{ DISPATCH }"}</span><Link href="mailto:hola@jmmcdevsign.es">INITIATE CONTACT</Link><small>ENCRYPTED CHANNEL</small></div><div className={styles.copyright}>© 2025 JMMC ARCHITECTURE. ALL RIGHTS RESERVED.<span>CODE: RAW_SPEC　 [ LAT: +40.7128 ]　 [ LON: -74.0060 ]</span></div></footer>
    </main>
  );
}
