"use client";

import { createContext, useContext, useLayoutEffect, useState, useSyncExternalStore, type ReactNode } from "react";

import { Button } from "@/app/components/ui/button";
import { CheckboxField } from "@/app/components/ui/checkbox";
import { Modal } from "@/app/components/ui/modal";
import { demoGuidePreferenceKey, type DemoGuideId } from "@/app/lib/demo-guide-preference";
import { useCopy } from "@/app/lib/locale-context";

const copy = {
  es: {
    open: "Cómo funciona",
    close: "Cerrar guía",
    enter: "Ir a la demo",
    skip: "No volver a mostrar al entrar en esta demo",
    note: "Puedes avanzar un paso, reproducir el recorrido completo o reiniciar los datos de prueba.",
    guides: {
      agent: {
        title: "Guía del constructor de agentes",
        description: "Configura un agente y comprueba cómo responde en una conversación de prueba.",
        steps: [
          "En Configurar, ajusta el tono y elige las herramientas y fuentes de conocimiento.",
          "Abre Probar (chat) y usa una pregunta de ejemplo o escribe la tuya.",
          "Revisa la respuesta y la traza antes de probar el despliegue local.",
        ],
      },
      workflow: {
        title: "Guía del flujo de leads",
        description: "Sigue un contacto de prueba desde que entra al flujo hasta que se envía su notificación simulada.",
        steps: [
          "Pulsa Simular disparo para enviar un evento al primer nodo.",
          "Sigue los nodos para ver cómo se evalúa el contacto y adónde se envía.",
          "Abre el registro para revisar el resultado de cada paso. Prueba el enrutamiento crítico para ver cómo se informa un fallo.",
        ],
      },
      qualification: {
        title: "Guía de cualificación de leads",
        description: "Explora cómo se puntúa un contacto comercial y decide qué seguimiento darle.",
        steps: [
          "Selecciona un contacto de la bandeja o añade uno con Inyectar lead test.",
          "Abre Detalle para revisar la puntuación, los motivos y la respuesta sugerida.",
          "Reasigna el contacto, edita la respuesta o aprueba el seguimiento de prueba.",
        ],
      },
      orders: {
        title: "Guía de pedidos en tiempo real",
        description: "Envía un pedido de prueba y sigue los cambios que ven el cliente y la cocina.",
        steps: [
          "En Cliente, ajusta el carrito y envía el pedido.",
          "Abre Cocina para preparar el pedido y marcarlo como listo.",
          "Consulta el registro de eventos para ver cuándo se produjo cada cambio de estado.",
        ],
      },
      backoffice: {
        title: "Guía de gestión empresarial",
        description: "Explora cómo cambia la operación al gestionar pedidos, facturas e inventario.",
        steps: [
          "Elige un periodo o busca un pedido en el panel.",
          "Pulsa Ver en un pedido para abrir el expediente del cliente y consultar su historial.",
          "Prueba los roles Admin, Editor y Lector para ver qué acciones tiene disponibles cada uno.",
        ],
      },
    },
  },
  en: {
    open: "How it works",
    close: "Close guide",
    enter: "Go to demo",
    skip: "Don't show this guide when I open this demo",
    note: "You can advance one step at a time, play the walkthrough automatically, or reset the sample data.",
    guides: {
      agent: {
        title: "Agent Builder guide",
        description: "Configure an agent and see how it responds in a sample conversation.",
        steps: [
          "Under Configure, adjust the tone and select tools and knowledge sources.",
          "Open Test (chat) and choose a sample prompt or type your own.",
          "Review the response and the trace before trying a local deployment.",
        ],
      },
      workflow: {
        title: "Lead workflow guide",
        description: "Follow a sample lead from intake to its simulated notification.",
        steps: [
          "Select Simulate trigger to send an event to the first node.",
          "Follow the nodes to see how the lead is evaluated and routed.",
          "Open the registry to review each result. Try critical routing to see how a failure is reported.",
        ],
      },
      qualification: {
        title: "Lead qualification guide",
        description: "See how a lead is scored and decide how to follow up.",
        steps: [
          "Select a lead from the inbox or add one using Inject test lead.",
          "Open Detail to review the score, the reasons behind it, and the suggested response.",
          "Reassign the lead, edit the response, or approve the sample follow-up.",
        ],
      },
      orders: {
        title: "Real-time orders guide",
        description: "Submit a sample order and follow the updates the customer and kitchen see.",
        steps: [
          "In Customer, adjust the cart and submit the order.",
          "Open Kitchen to prepare the order and mark it as ready.",
          "Check the event log to see when each status changed.",
        ],
      },
      backoffice: {
        title: "Business backoffice guide",
        description: "Explore how managing orders, invoices, and inventory affects the operation.",
        steps: [
          "Choose a time period or search for an order in the dashboard.",
          "Select View on an order to open its customer record and review the history.",
          "Try the Admin, Editor, and Reader roles to see which actions each one can take.",
        ],
      },
    },
  },
};

const DemoGuideContext = createContext<(() => void) | null>(null);

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readPreference(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function getServerPreference() {
  return null;
}

export function DemoGuideProvider({ children, demo }: { children: ReactNode; demo: DemoGuideId }) {
  const text = useCopy(copy);
  const guide = text.guides[demo];
  const preferenceKey = demoGuidePreferenceKey(demo);
  const storedPreference = useSyncExternalStore(
    subscribeToStorage,
    () => readPreference(preferenceKey),
    getServerPreference,
  );
  const [visibility, setVisibility] = useState<"entry" | "manual" | "closed">("entry");
  const [checked, setChecked] = useState<boolean>();
  const entry = visibility === "entry";
  const open = entry ? storedPreference === false : visibility === "manual";

  useLayoutEffect(() => () => {
    // Next.js can preserve an inactive route's state when the visitor leaves a demo.
    setVisibility("entry");
    setChecked(undefined);
  }, [demo]);

  function changePreference(next: boolean) {
    setChecked(next);
    // Keep the entry dialog open while the visitor finishes reading.
    setVisibility("manual");
    try {
      if (next) window.localStorage.setItem(preferenceKey, "1");
      else window.localStorage.removeItem(preferenceKey);
    } catch {
      // The current visit still works when persistent storage is unavailable.
    }
  }

  function close() {
    setVisibility("closed");
  }

  return (
    <DemoGuideContext value={() => setVisibility("manual")}>
      {children}
      <Modal
        closeLabel={text.close}
        description={guide.description}
        footer={(
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <CheckboxField checked={checked ?? storedPreference ?? false} label={text.skip} onChange={(event) => changePreference(event.target.checked)} />
            <Button onClick={close} variant="accent">{text.enter}</Button>
          </div>
        )}
        onClose={close}
        open={open}
        title={guide.title}
      >
        <div className="grid gap-space-md">
          <ol className="list-decimal space-y-space-sm ps-space-lg text-body-md marker:font-semibold marker:text-accent-text">
            {guide.steps.map((step) => <li className="ps-space-xs" key={step}>{step}</li>)}
          </ol>
          <p className="text-body-sm text-on-surface-variant">{text.note}</p>
        </div>
      </Modal>
    </DemoGuideContext>
  );
}

export function DemoGuideButton() {
  const text = useCopy(copy);
  const openGuide = useContext(DemoGuideContext);
  return openGuide ? (
    <Button aria-haspopup="dialog" onClick={openGuide} size="sm" variant="secondary">{text.open}</Button>
  ) : null;
}
