"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/app/components/ui/button";
import { Drawer } from "@/app/components/ui/drawer";
import { hasBackofficePermission } from "@/app/es/demos/business-backoffice/domain/backoffice-permissions";
import { backofficeRuntime, getFilteredBackofficeOrders, getPaginatedBackofficeOrders } from "@/app/es/demos/business-backoffice/domain/backoffice-runtime";
import type { BackofficePeriod, BackofficeRole, BackofficeSimulationState, BackofficeWorkspace, CustomerDossier } from "@/app/es/demos/business-backoffice/domain/backoffice-types";

import styles from "./backoffice-panel.module.css";

const ROLES: readonly BackofficeRole[] = ["ADMIN", "EDITOR", "LECTOR"];
const STATES: readonly { value: BackofficeSimulationState; label: string }[] = [
  { value: "live", label: "01. EN VIVO" }, { value: "drawer", label: "02. DRAWER CLIENTE" }, { value: "reader", label: "03. MODO LECTOR" },
  { value: "toast", label: "04. TOAST EMITIDO" }, { value: "skeletons", label: "05. ESQUELETOS" }, { value: "empty", label: "06. TABLA VACÍA" },
];
const orderStatusLabels: Record<string, string> = { processing: "PROCESANDO", paid: "PAGADO", shipped: "ENVIADO", invoiced: "FACTURADO", "pending-payment": "PAGO PENDIENTE" };
const invoiceStatusLabels: Record<string, string> = { "due-in-3d": "VENCE EN 3D", "due-today": "VENCE HOY", overdue: "VENCIDA" };

function formatCents(cents: number): string { return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100); }
function getCustomer(workspace: BackofficeWorkspace, id: string | null): CustomerDossier | null { return workspace.customers.find((customer) => customer.id === id) ?? null; }

export function BackofficePanel() {
  const [workspace, setWorkspace] = useState<BackofficeWorkspace | null>(null);
  const [feedback, setFeedback] = useState("Snapshot local preparado para revisión operativa.");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCustomerId, setManualCustomerId] = useState("CLI-8841");
  const [manualItem, setManualItem] = useState("Macetas Raw");
  const [manualQuantity, setManualQuantity] = useState("1");
  const [manualTotal, setManualTotal] = useState("24000");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const syncCustomerFields = useCallback((nextWorkspace: BackofficeWorkspace) => {
    const customer = getCustomer(nextWorkspace, nextWorkspace.selectedCustomerId);
    if (customer) { setEditName(customer.name); setEditEmail(customer.email); setEditNotes(customer.internalNotes); }
  }, []);
  const refresh = useCallback(async () => {
    const nextWorkspace = await backofficeRuntime.getWorkspace();
    setWorkspace(nextWorkspace);
    syncCustomerFields(nextWorkspace);
    if (nextWorkspace.toast) setFeedback(nextWorkspace.toast);
  }, [syncCustomerFields]);
  useEffect(() => { let active = true; void backofficeRuntime.getWorkspace().then((nextWorkspace) => { if (active) { setWorkspace(nextWorkspace); syncCustomerFields(nextWorkspace); if (nextWorkspace.toast) setFeedback(nextWorkspace.toast); } }); return () => { active = false; }; }, [syncCustomerFields]);

  const runAction = useCallback(async (action: () => Promise<BackofficeWorkspace>, message?: string) => {
    try { const nextWorkspace = await action(); setWorkspace(nextWorkspace); syncCustomerFields(nextWorkspace); if (message) setFeedback(message); else if (nextWorkspace.toast) setFeedback(nextWorkspace.toast); }
    catch (error) { setFeedback(error instanceof Error ? error.message : "La operación no se pudo completar."); }
  }, [syncCustomerFields]);

  const selectedCustomer = useMemo(() => workspace ? getCustomer(workspace, workspace.selectedCustomerId) : null, [workspace]);
  const filteredOrders = useMemo(() => workspace ? getFilteredBackofficeOrders(workspace) : [], [workspace]);
  const visibleOrders = useMemo(() => workspace ? getPaginatedBackofficeOrders(workspace) : [], [workspace]);
  const can = (permission: "create-order" | "emit-invoice" | "edit-customer" | "update-stock" | "export-data") => workspace ? hasBackofficePermission(workspace.role, permission) : false;

  if (!workspace) return <section className={styles.backoffice} aria-label="Business backoffice"><div className={styles.skeletonShell} aria-label="Cargando datos del backoffice"><span /><span /><span /><span /><span /><span /></div></section>;

  if (workspace.simulationState === "skeletons") return <section className={styles.backoffice} aria-label="Business backoffice"><div className={styles.skeletonShell} aria-label="Cargando datos del backoffice"><span /><span /><span /><span /><span /><span /><button onClick={() => void runAction(() => backofficeRuntime.setSimulationState({ state: "live" }), "Vista operativa recuperada.")} type="button">VOLVER A EN VIVO →</button></div></section>;

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / 5));
  const page = Math.min(Math.max(1, workspace.page), totalPages);
  const series = workspace.revenueSeries[workspace.period];
  const max = Math.max(...series.map((point) => point.currentCents), 1);
  const currentPoints = series.map((point, index) => `${30 + index * 105},${150 - (point.currentCents / max) * 110}`).join(" ");
  const previousPoints = series.map((point, index) => `${30 + index * 105},${165 - (point.previousCents / max) * 110}`).join(" ");
  const periodLabel = workspace.period === "feb-2025" ? "ESTE MES // 01 FEB - 28 FEB 2025" : "ENERO 2025 // 01 ENE - 31 ENE 2025";

  async function createManualOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await backofficeRuntime.createManualOrder({ customerId: manualCustomerId, items: [{ label: manualItem, quantity: Number(manualQuantity) }], totalCents: Number(manualTotal) });
      setWorkspace(result.workspace); setFeedback("Pedido manual registrado y añadido al audit log."); setManualOpen(false);
    } catch (error) { setFeedback(error instanceof Error ? error.message : "El pedido no se pudo registrar."); }
  }

  async function exportCsv() {
    try {
      const result = await backofficeRuntime.exportOrdersCsv();
      const url = URL.createObjectURL(new Blob([result.content], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = result.filename; anchor.click(); URL.revokeObjectURL(url);
      setFeedback("CSV local exportado con el filtro actual."); await refresh();
    } catch (error) { setFeedback(error instanceof Error ? error.message : "La exportación no se pudo completar."); }
  }

  return <section className={styles.backoffice} aria-label="Business backoffice">
    <div className={styles.simulatorBar}><div className={styles.simulatorControls}><span className={styles.monoMuted}>[ SIMULADOR DE ESTADOS ]:</span>{STATES.map((state) => <button aria-pressed={workspace.simulationState === state.value} className={workspace.simulationState === state.value ? styles.simulationActive : ""} key={state.value} onClick={() => void runAction(() => backofficeRuntime.setSimulationState({ state: state.value }))} type="button">[ {state.label} ]</button>)}</div><div className={styles.roleControls} aria-label="Selector de rol"><span className={styles.monoMuted}>{"{ ROL: }"}</span>{ROLES.map((role) => <button aria-pressed={workspace.role === role} className={workspace.role === role ? styles.roleActive : ""} key={role} onClick={() => void runAction(() => backofficeRuntime.setRole({ role }))} type="button">[ {role} ]</button>)}</div></div>
    <div className={styles.controlRibbon}><label className={styles.searchField}><span>✦ FIND_SYS:</span><input aria-label="Buscar en el backoffice" onChange={(event) => void runAction(() => backofficeRuntime.setSearch({ search: event.target.value }))} placeholder="Pedido, cliente, empresa, artículo..." value={workspace.search} /></label><label className={styles.periodField}><span>[ PERIODO ]</span><select aria-label="Periodo" onChange={(event) => void runAction(() => backofficeRuntime.setPeriod({ period: event.target.value as BackofficePeriod }))} value={workspace.period}><option value="feb-2025">{periodLabel}</option><option value="jan-2025">ENERO 2025 // COMPARATIVA</option></select></label><span className={styles.syncBadge}>● EN VIVO // SYNC: 100%</span></div>
    {workspace.role === "LECTOR" ? <div className={styles.readerBanner} role="status"><span>🔒 [ AVISO DE ACCESO RESTRINGIDO ] // Modo Lector activo. Las mutaciones están inhabilitadas.</span><button onClick={() => void runAction(() => backofficeRuntime.setRole({ role: "ADMIN" }))} type="button">SOLICITAR ELEVACIÓN →</button></div> : null}
    <div className={styles.workspaceGrid}><aside className={styles.sidebar} aria-label="Navegación de backoffice"><div><div className={styles.brandBlock}><strong>KÖNIG // ATELIER</strong><span>BOTÁNICO & CERÁMICA</span><small>SISTEMA BACKOFFICE · V.9.42</small></div><nav className={styles.sideNav}>{[["RESUMEN", "ACTIVO"], ["PEDIDOS", "05"], ["CLIENTES", "418"], ["FACTURAS", "3 PEND"], ["INVENTARIO", "⚠ STOCK"], ["EQUIPO", "4"]].map(([label, badge]) => <a href={`#${label.toLowerCase()}`} key={label}><span>· {label}</span><b>{badge}</b></a>)}</nav></div><div className={styles.profileBlock}><strong>JM · Juanma M.</strong><span>{"{ "}{workspace.role}{" }"}</span><small>admin@konig-studio.es</small></div></aside>
      <main className={styles.mainCanvas}><div className={styles.kpiGrid}>{workspace.metrics[workspace.period].map((metric) => <article className={styles.kpiCard} key={metric.id}><span>{metric.label}</span><em>{metric.trend}</em><strong>{metric.value}</strong><small>{metric.detail}</small></article>)}</div>
        <section className={styles.panel} aria-labelledby="revenue-title"><div className={styles.panelHeader}><div><span className={styles.eyebrow}>COMPARATIVA FACTURACIÓN // FEBRERO VS ENERO 2025</span><h2 id="revenue-title">Flujo de ingresos</h2></div><span className={styles.metricLegend}>[ {workspace.period === "feb-2025" ? "FEBRERO 2025 // 48.290 €" : "ENERO 2025 // 39.450 €"} ]</span></div><div className={styles.chartWrap}><svg aria-label="Gráfica comparativa de facturación" role="img" viewBox="0 0 450 170"><polyline className={styles.chartLineMuted} points={previousPoints} /><polyline className={styles.chartLine} points={currentPoints} />{series.map((point, index) => <circle className={styles.chartDot} cx={30 + index * 105} cy={150 - (point.currentCents / max) * 110} key={point.label} r="4" />)}</svg><div className={styles.chartLabels}>{series.map((point) => <span key={point.label}>{point.label}<b>{formatCents(point.currentCents)}</b></span>)}</div></div></section>
        <section className={styles.panel} id="pedidos" aria-labelledby="orders-title"><div className={styles.panelHeader}><div><span className={styles.eyebrow}>LEDGER OPERATIVO // BUFFER FIFO EN MEMORIA</span><h2 id="orders-title">Últimos pedidos</h2></div><div className={styles.actions}><button disabled={!can("export-data")} onClick={() => void exportCsv()} type="button">EXPORTAR CSV</button><button disabled={!can("create-order")} onClick={() => setManualOpen((open) => !open)} type="button">+ REGISTRAR PEDIDO MANUAL</button></div></div><p aria-live="polite" className={styles.feedback}>{feedback}</p>{manualOpen ? <form className={styles.manualForm} onSubmit={createManualOrder}><label>Cliente<select onChange={(event) => setManualCustomerId(event.target.value)} value={manualCustomerId}>{workspace.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label><label>Artículo<input onChange={(event) => setManualItem(event.target.value)} required value={manualItem} /></label><label>Uds.<input min="1" onChange={(event) => setManualQuantity(event.target.value)} required type="number" value={manualQuantity} /></label><label>Total céntimos<input min="0" onChange={(event) => setManualTotal(event.target.value)} required type="number" value={manualTotal} /></label><button type="submit">GUARDAR PEDIDO</button></form> : null}{workspace.simulationState === "empty" ? <div className={styles.emptyState}><strong>TABLA VACÍA // STREAM PAUSADO</strong><p>No hay pedidos visibles con este escenario.</p><button onClick={() => void runAction(() => backofficeRuntime.setSimulationState({ state: "live" }), "Stream reiniciado; vista operativa recuperada.")} type="button">REINICIAR STREAM →</button></div> : <div className={styles.tableWrap}><table><caption className={styles.visuallyHidden}>Últimos pedidos</caption><thead><tr><th>ID / CLIENTE</th><th>ARTÍCULOS</th><th>TIEMPO</th><th>IMPORTE</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead><tbody>{visibleOrders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong><span>{order.customerName} · {order.company}</span></td><td>{order.items.map((item) => `${item.label} ×${item.quantity}`).join(", ")}</td><td>{order.relativeTime}</td><td>{formatCents(order.totalCents)}</td><td><span className={styles[`status_${order.status}`] ?? styles.status_default}>{orderStatusLabels[order.status]}</span></td><td><button onClick={() => void runAction(() => backofficeRuntime.selectCustomer({ customerId: order.customerId }))} type="button">[ VER ]</button></td></tr>)}</tbody></table></div>}<div className={styles.pagination}><span>MOSTRANDO {visibleOrders.length} DE {filteredOrders.length} REGISTROS</span><div><button aria-label="Página anterior" disabled={page <= 1} onClick={() => void runAction(() => backofficeRuntime.setPage({ page: page - 1 }))} type="button">←</button><b>{page} / {totalPages}</b><button aria-label="Página siguiente" disabled={page >= totalPages} onClick={() => void runAction(() => backofficeRuntime.setPage({ page: page + 1 }))} type="button">→</button></div></div></section>
        <div className={styles.lowerGrid}><section className={styles.panel} id="facturas" aria-labelledby="invoices-title"><div className={styles.panelHeader}><div><span className={styles.eyebrow}>CUENTAS POR COBRAR</span><h2 id="invoices-title">Facturas pendientes</h2></div><span className={styles.warningLabel}>3 PEND</span></div>{workspace.invoices.map((invoice) => <div className={styles.listRow} key={invoice.id}><div><strong>{invoice.id}</strong><span>{invoice.customer}</span></div><b>{formatCents(invoice.amountCents)}</b><span className={invoice.status === "overdue" ? styles.overdue : styles.warningLabel}>{invoiceStatusLabels[invoice.status]}</span><button disabled={!can("emit-invoice")} onClick={() => void runAction(() => backofficeRuntime.emitInvoice({ invoiceId: invoice.id }), `${invoice.id} procesada.`)} type="button">EMITIR</button></div>)}</section><section className={styles.panel} id="inventario" aria-labelledby="stock-title"><div className={styles.panelHeader}><div><span className={styles.eyebrow}>ALERTAS DE STOCK</span><h2 id="stock-title">Inventario sensible</h2></div><span className={styles.warningLabel}>LIVE</span></div>{workspace.stockAlerts.map((alert) => <div className={styles.stockRow} key={alert.sku}><div><strong>{alert.label}</strong><span>{alert.sku} · mínimo {alert.minimum}</span></div><div className={styles.stockMeter}><span style={{ width: `${Math.min(100, alert.quantity / alert.minimum * 100)}%` }} /></div><b className={alert.severity === "critical" ? styles.critical : styles.warningLabel}>{alert.quantity} uds</b><button disabled={!can("update-stock")} onClick={() => void runAction(() => backofficeRuntime.updateStock({ sku: alert.sku, quantity: alert.quantity + 1 }), `${alert.sku} actualizado.`)} type="button">+1</button></div>)}</section></div>
        <section className={styles.panel} aria-labelledby="audit-title"><div className={styles.panelHeader}><div><span className={styles.eyebrow}>AUDIT LOG // REALTIME MOCK</span><h2 id="audit-title">Actividad del sistema</h2></div><span className={styles.syncBadge}>EN VIVO</span></div><div className={styles.auditLog}>{workspace.auditEvents.slice(0, 6).map((event) => <div className={styles.auditRow} key={event.id}><span>{event.at}</span><strong>{`{${event.actor}}`}</strong><p>{event.message}</p></div>)}</div></section>
      </main></div>
    <Drawer description="Expediente operativo del cliente seleccionado" onClose={() => void runAction(() => backofficeRuntime.selectCustomer({ customerId: null }))} open={Boolean(selectedCustomer)} title={selectedCustomer ? `EXPEDIENTE // ${selectedCustomer.id}` : "EXPEDIENTE CLIENTE"}>{selectedCustomer ? <div className={styles.drawerContent}><div className={styles.drawerIdentity}><strong>{selectedCustomer.name}</strong><span>{selectedCustomer.email}</span><small>{selectedCustomer.phoneAndAddress}</small></div><div className={styles.drawerMetrics}><span>GASTO TOTAL <b>{formatCents(selectedCustomer.totalSpendCents)}</b></span><span>PEDIDOS <b>{selectedCustomer.orderCount}</b></span><span>TICKET MEDIO <b>{formatCents(selectedCustomer.averageTicketCents)}</b></span></div><h3>HISTORIAL</h3>{selectedCustomer.history.map((item) => <div className={styles.historyRow} key={item.orderId}><strong>{item.orderId}</strong><span>{item.items}</span><b>{formatCents(item.totalCents)}</b></div>)}<form className={styles.editForm} onSubmit={(event) => { event.preventDefault(); void runAction(() => backofficeRuntime.editCustomer({ customerId: selectedCustomer.id, name: editName, email: editEmail, internalNotes: editNotes }), "Expediente actualizado."); }}><label>Nombre<input disabled={!can("edit-customer")} onChange={(event) => setEditName(event.target.value)} value={editName} /></label><label>Email<input disabled={!can("edit-customer")} onChange={(event) => setEditEmail(event.target.value)} type="email" value={editEmail} /></label><label>Anotaciones internas<textarea disabled={!can("edit-customer")} onChange={(event) => setEditNotes(event.target.value)} value={editNotes} /></label><Button disabled={!can("edit-customer")} type="submit" variant="accent">GUARDAR EXPEDIENTE</Button></form></div> : null}</Drawer>
  </section>;
}
