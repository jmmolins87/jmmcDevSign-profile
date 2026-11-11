"use client";

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMeta,
  CardTitle,
  CheckboxField,
  InputField,
  Modal,
  SelectField,
  StatusIndicator,
  Tabs,
  TextareaField,
} from "@/app/components/ui";
import { agentRepository, type AgentConfig } from "@/app/es/repositories/mock-repositories";
import { useMockRepository } from "@/app/es/repositories/use-mock-repository";

export function AgentBuilderPanel() {
  const storedAgents = useMockRepository(agentRepository);
  const [agent, setAgent] = useState<AgentConfig | null>(() => storedAgents[0] ?? null);
  const [feedback, setFeedback] = useState("Configuración local lista para probar.");
  const [isTestOpen, setIsTestOpen] = useState(false);

  function updateAgent<Key extends keyof AgentConfig>(key: Key, value: AgentConfig[Key]) {
    if (!agent) return;
    setAgent((currentAgent) => currentAgent ? { ...currentAgent, [key]: value } : currentAgent);
    setFeedback("Cambios locales sin guardar.");
  }

  function toggleTool(toolId: string, enabled: boolean) {
    if (!agent) return;
    updateAgent(
      "tools",
      agent.tools.map((tool) => (tool.id === toolId ? { ...tool, enabled } : tool)),
    );
  }

  async function saveAgent() {
    if (!agent) return;

    const updatedAgent = await agentRepository.update(agent.id, agent);
    setAgent(updatedAgent);
    setFeedback(`Agente «${agent.name}» guardado en el workspace mock.`);
  }

  if (!agent) {
    return <p className="border border-border p-space-lg text-body-md text-on-surface-variant" role="status">No hay agentes disponibles para editar.</p>;
  }

  const configuration = (
    <Card>
      <CardHeader>
        <div>
          <CardMeta>Agente / configuración</CardMeta>
          <CardTitle className="mt-space-sm">Definir comportamiento</CardTitle>
        </div>
        <Badge variant="active">DEMO</Badge>
      </CardHeader>
      <CardContent>
        <form className="grid gap-space-lg" onSubmit={(event) => { event.preventDefault(); saveAgent(); }}>
          <InputField label="Nombre del agente" onChange={(event) => updateAgent("name", event.target.value)} required value={agent.name} />
          <SelectField
            label="Modelo"
            onChange={(event) => updateAgent("model", event.target.value)}
            options={[
              { label: "GPT-5 mini / rápido", value: "gpt-5-mini" },
              { label: "GPT-5 / razonamiento", value: "gpt-5" },
            ]}
            value={agent.model}
          />
          <SelectField
            label="Temperatura"
            onChange={(event) => updateAgent("temperature", event.target.value)}
            options={[
              { label: "0.0 / determinista", value: "0.0" },
              { label: "0.2 / equilibrada", value: "0.2" },
              { label: "0.7 / exploratoria", value: "0.7" },
            ]}
            value={agent.temperature}
          />
          <TextareaField label="Instrucciones del sistema" onChange={(event) => updateAgent("systemPrompt", event.target.value)} required value={agent.systemPrompt} />
          <fieldset className="grid gap-space-md border-t border-border pt-space-lg">{/* taste-skill-ignore: form section rule from DESIGN.md */}
            <legend className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary">Herramientas disponibles</legend>
            <div className="grid gap-space-md">
              {agent.tools.map((tool) => (
                <CheckboxField
                  checked={tool.enabled}
                  description={tool.description}
                  key={tool.id}
                  label={tool.label}
                  onChange={(event) => toggleTool(tool.id, event.target.checked)}
                />
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-space-sm">
            <Button type="submit" variant="primary">Guardar agente</Button>
            <Button onClick={() => setIsTestOpen(true)} type="button" variant="secondary">Probar configuración</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const runtime = (
    <div className="grid gap-space-lg lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <div>
          <CardMeta>Ejecución / traza operativa</CardMeta>
            <CardTitle className="mt-space-sm">Prueba controlada</CardTitle>
          </div>
          <StatusIndicator label="LISTO" status="active" />
        </CardHeader>
        <CardContent className="grid gap-space-lg">
          <p className="text-body-lg text-on-surface-variant">La prueba usa solo datos locales y muestra qué herramientas entrarían en la ejecución.</p>
          <div className="grid gap-space-sm">
            {agent.tools.filter((tool) => tool.enabled).map((tool, index) => (
              <div className="flex items-center justify-between gap-space-md border border-border px-space-md py-space-sm" key={tool.id}>
                <span className="font-headline text-headline-md uppercase text-primary">{tool.label}</span>
                <Badge>{`PASO ${index + 1}`}</Badge>
              </div>
            ))}
          </div>
          <Button onClick={() => setIsTestOpen(true)} type="button" variant="accent">Ejecutar prueba mock</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="grid gap-space-md">
          <CardMeta>Salida / observabilidad</CardMeta>
          <p aria-live="polite" className="text-body-md text-on-surface-variant">{feedback}</p>
          <StatusIndicator label={`${agent.tools.filter((tool) => tool.enabled).length} HERRAMIENTAS ACTIVAS`} />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="grid gap-space-lg">
      <Tabs
        ariaLabel="Secciones del agent builder"
        items={[
          { id: "configuration", label: "Configuración", content: configuration },
          { id: "runtime", label: "Prueba mock", content: runtime },
        ]}
      />
      <Modal
        description="La ejecución no llama a ningún proveedor externo."
        footer={<Button onClick={() => setIsTestOpen(false)} type="button" variant="secondary">Cerrar</Button>}
        onClose={() => setIsTestOpen(false)}
        open={isTestOpen}
        title="Traza de ejecución mock"
      >
        <div className="grid gap-space-md">
          <StatusIndicator label="EJECUCIÓN COMPLETA" status="active" />
          <p className="text-body-md text-on-surface-variant">{agent.name} procesaría la entrada con {agent.tools.filter((tool) => tool.enabled).length} herramientas activas y temperatura {agent.temperature}.</p>
          <CardMeta>Resultado / listo para la siguiente fase</CardMeta>
        </div>
      </Modal>
    </div>
  );
}
