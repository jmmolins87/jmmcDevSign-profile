"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";

import { decideRequest } from "@/app/[locale]/auth/actions";
import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import { initialAuthFeedback, type MembershipDecision, type MembershipRequest } from "@/app/[locale]/auth/managed-types";
import { AuthFeedback } from "@/app/[locale]/login/auth-feedback";
import { RefreshAuthStatus } from "@/app/[locale]/login/pending-panel";
import { Badge, Button, Card, CardContent, CardMeta, CardTitle, DataTable, SelectField, Tabs, type DataTableColumn } from "@/app/components/ui";

export type DecisionSelection = { requestId: string; decision: MembershipDecision; proof?: string };

const filters = [
  { status: "pending", label: "Pendientes", badge: "Pendiente", variant: "neutral" },
  { status: "approved", label: "Aprobadas", badge: "Aprobada", variant: "active" },
  { status: "rejected", label: "Rechazadas", badge: "Rechazada", variant: "error" },
] as const;

export function ApprovalPanel({ requests, linkSelection = null, invalidLink = false, deliveryUnavailable = false }: {
  requests: readonly MembershipRequest[];
  linkSelection?: DecisionSelection | null;
  invalidLink?: boolean;
  deliveryUnavailable?: boolean;
}) {
  const t = useManagedAuthCopy();
  const [selection, setSelection] = useState(linkSelection);
  const [feedback, submit, submitting] = useActionState(decideRequest, initialAuthFeedback);
  const confirmSection = useRef<HTMLElement>(null);
  const confirmTitle = useId();
  const linkedRequest = requests.find(({ id }) => id === selection?.requestId);
  const toReview = linkedRequest?.status === "pending" ? linkedRequest : null;
  const approve = selection?.decision === "approve";

  useEffect(() => { if (selection) confirmSection.current?.focus(); }, [selection]);

  function renderStatus(request: MembershipRequest) {
    const filter = filters.find(({ status }) => status === request.status);
    if (!filter) return null;
    return <Badge variant={filter.variant}>{t(filter.badge)}</Badge>;
  }

  function renderDelivery(request: MembershipRequest) {
    if (!request.delivery) return "—";
    const name = request.delivery === "failed" ? "Entrega fallida" : request.delivery === "sent" ? "Código enviado" : "Código en cola";
    return <Badge variant={request.delivery === "failed" ? "error" : "neutral"}>{t(name)}</Badge>;
  }

  function renderActions(request: MembershipRequest) {
    if (request.status !== "pending") return "—";
    return (
      <div className="flex flex-wrap gap-space-sm">
        <Button disabled={submitting} onClick={() => setSelection({ requestId: request.id, decision: "approve" })} size="sm" variant="accent">
          {t("Aprobar")}
        </Button>
        <Button disabled={submitting} onClick={() => setSelection({ requestId: request.id, decision: "reject" })} size="sm" variant="danger">
          {t("Rechazar")}
        </Button>
      </div>
    );
  }

  const roleLabel = (role: MembershipRequest["assignedRole"]) => role === "editor" ? t("Editor")
    : role === "revisor" ? t("Revisor") : "—";

  const columns: readonly DataTableColumn<MembershipRequest>[] = [
    {
      header: t("Solicitante"),
      key: "applicant",
      render: (request) => (
        <div className="grid gap-space-xs">
          <span className="font-headline text-headline-md uppercase text-primary">{request.fullName}</span>
          <span className="wrap-anywhere text-body-sm text-on-surface-variant">{request.email}</span>
        </div>
      ),
    },
    { header: t("Rol solicitado"), key: "requestedRole", render: ({ requestedRole }) => roleLabel(requestedRole) },
    { header: t("Rol asignado"), key: "assignedRole", render: ({ assignedRole }) => roleLabel(assignedRole) },
    { header: t("Estado"), key: "status", render: renderStatus },
    { header: t("Entrega del código"), key: "delivery", render: renderDelivery },
    { header: t("Acciones"), key: "actions", render: renderActions },
  ];

  const groups = filters.map((filter) => ({ ...filter, requests: requests.filter(({ status }) => status === filter.status) }));
  const tabs = groups.map((group) => ({
    id: group.status,
    label: `${t(group.label)} (${group.requests.length})`,
    content: (
      <>
        <div className="hidden sm:block">
          <DataTable caption={t(group.label)} columns={columns} emptyMessage={t("No hay solicitudes en este estado.")} getRowKey={({ id }) => id} rows={group.requests} />
        </div>
        <div className="grid gap-space-md sm:hidden">
          {group.requests.length === 0 ? <p role="status">{t("No hay solicitudes en este estado.")}</p> : group.requests.map((request) => (
            <article className="grid gap-space-md border border-border bg-surface-container p-space-md" data-approval-request={request.email} key={request.id}>
              <div className="grid gap-space-xs">
                <CardTitle>{request.fullName}</CardTitle>
                <CardMeta>{request.email}</CardMeta>
              </div>
              <dl className="grid gap-space-sm text-body-sm">
                <div className="flex justify-between gap-space-sm"><dt>{t("Rol solicitado")}</dt><dd>{roleLabel(request.requestedRole)}</dd></div>
                <div className="flex justify-between gap-space-sm"><dt>{t("Rol asignado")}</dt><dd>{roleLabel(request.assignedRole)}</dd></div>
                <div className="flex justify-between gap-space-sm"><dt>{t("Estado")}</dt><dd>{renderStatus(request)}</dd></div>
                <div className="flex justify-between gap-space-sm"><dt>{t("Entrega del código")}</dt><dd>{renderDelivery(request)}</dd></div>
              </dl>
              {renderActions(request)}
            </article>
          ))}
        </div>
      </>
    ),
  }));

  return (
    <div className="grid gap-space-lg">
      <div className="grid gap-space-lg sm:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.status}>
            <CardContent className="grid gap-space-sm">
              <CardMeta>{t(group.label)}</CardMeta>
              <CardTitle>{group.requests.length}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
      <AuthFeedback feedback={feedback} />
      {deliveryUnavailable ? <AuthFeedback feedback={{ status: "error", message: "No se pudo consultar el estado de entrega." }} /> : null}
      {invalidLink || (selection && !linkedRequest) ? <AuthFeedback feedback={{ status: "error", message: "El enlace no corresponde a una solicitud disponible." }} /> : null}
      {selection && linkedRequest && !toReview && feedback.status === "idle" ? (
        <AuthFeedback feedback={{ status: "success", message: "Esta solicitud ya había sido revisada." }} />
      ) : null}
      {toReview && selection ? (
        <section aria-labelledby={confirmTitle} className="grid gap-space-md border border-accent bg-surface-container p-space-lg" ref={confirmSection} tabIndex={-1}>
          <h2 className="font-headline text-headline-lg text-primary" id={confirmTitle}>{t(approve ? "Confirmar aprobación" : "Confirmar rechazo")}</h2>
          <p className="break-words text-body-sm text-on-surface-variant">{toReview.fullName} · {toReview.email}</p>
          <p className="text-body-sm text-on-surface-variant">{t(approve ? "Revisa el rol asignado antes de confirmar la aprobación." : "Confirma que quieres rechazar esta solicitud.")}</p>
          <form action={submit} className="grid gap-space-md" key={`${selection.requestId}:${selection.decision}`}>
            <input name="requestId" type="hidden" value={toReview.id} />
            <input name="decision" type="hidden" value={selection.decision} />
            {selection.proof ? <input name="linkProof" type="hidden" value={selection.proof} /> : null}
            {approve ? (
              <SelectField
                defaultValue={toReview.requestedRole}
                label={t("Rol asignado")}
                name="assignedRole"
                options={[{ value: "editor", label: t("Editor") }, { value: "revisor", label: t("Revisor") }]}
                required
              />
            ) : null}
            <div className="flex flex-wrap gap-space-sm">
              <Button disabled={submitting} type="submit" variant={approve ? "primary" : "danger"}>
                {t(submitting ? "Guardando…" : approve ? "Confirmar aprobación" : "Confirmar rechazo")}
              </Button>
              <Button disabled={submitting} onClick={() => setSelection(null)} variant="secondary">{t("Cancelar decisión")}</Button>
            </div>
          </form>
        </section>
      ) : null}
      <Tabs ariaLabel={t("Filtro de solicitudes")} items={tabs} />
      <div className="justify-self-start"><RefreshAuthStatus /></div>
    </div>
  );
}
