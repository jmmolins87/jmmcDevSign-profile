import { sql } from "drizzle-orm"

import { createDb } from "./index.js"

import * as s from "./schema.js"

/**
 * Seed script — the only mock data source (spec 00).
 * Realistic, deterministic data; every §6 table must end populated.
 */

const MS = { minute: 60_000, hour: 3_600_000, day: 86_400_000 }

/** Timestamp in the past, `ms` ago, so the data looks natural instead of "now". */
const before = (ms: number) => new Date(Date.now() - ms)
/** Timestamp in the future, `ms` from now (e.g. scheduled followups). */
const after = (ms: number) => new Date(Date.now() + ms)

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is required (use --env-file ../../.env)")
  }

  const { db, client } = createDb(url)

  try {
    // Idempotent re-seed: truncate everything, cascading to FK children.
    await db.execute(sql`
      truncate table
        audit_log, invoices, products, customers, shops,
        order_events, order_items, orders,
        followup_steps, leads,
        agent_messages, agents,
        contact_messages, posts,
        approval_requests, sessions, accounts, users
      restart identity cascade
    `)

    // ── Auth ──
    const [admin, memberA, memberB] = await db
      .insert(s.users)
      .values([
        {
          email: "hola@jmmcdevsign.es",
          name: "Juanma Martín-Carli",
          passwordHash: null,
          role: "admin",
          status: "approved",
          createdAt: before(90 * MS.day),
        },
        {
          email: "ana.torres@example.com",
          name: "Ana Torres",
          passwordHash: "$2b$12$C6UzMDM.H6dfI/f/IKcEe.inversehashexample1",
          role: "member",
          status: "approved",
          createdAt: before(12 * MS.day),
        },
        {
          email: "luis.gado@example.com",
          name: "Luis Gado",
          passwordHash: "$2b$12$C6UzMDM.H6dfI/f/IKcEe.inversehashexample2",
          role: "member",
          status: "pending",
          createdAt: before(2 * MS.hour),
        },
      ])
      .returning()

    await db.insert(s.accounts).values([
      {
        userId: admin.id,
        provider: "google",
        providerAccountId: "1029384756-gj",
        createdAt: before(90 * MS.day),
      },
      {
        userId: admin.id,
        provider: "github",
        providerAccountId: "40520",
        createdAt: before(90 * MS.day),
      },
      {
        userId: memberA.id,
        provider: "github",
        providerAccountId: "82107",
        createdAt: before(12 * MS.day),
      },
    ])

    await db.insert(s.sessions).values([
      {
        userId: memberA.id,
        token: "sess_9f2c81a4d7",
        ipAddress: "83.45.192.10",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        expiresAt: after(7 * MS.day),
        createdAt: before(1 * MS.day),
      },
      {
        userId: memberB.id,
        token: "sess_4b7e20c1f8",
        ipAddress: "37.221.84.153",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
        expiresAt: after(20 * MS.hour),
        createdAt: before(5 * MS.hour),
      },
    ])

    await db.insert(s.approvalRequests).values([
      {
        userId: memberB.id,
        codeHash: "sha256:0b4f9a11e2c8f40c",
        decisionTokenHash: "hmac:7c31d05e8491a3b2",
        expiresAt: after(15 * MS.minute),
        createdAt: before(2 * MS.hour),
      },
      {
        userId: memberA.id,
        codeHash: "sha256:a8d21b90f7d40e13",
        decisionTokenHash: "hmac:1e04c77b93856d0f",
        decision: "approve",
        decidedAt: before(11 * MS.day),
        expiresAt: before(11 * MS.day),
        createdAt: before(12 * MS.day),
      },
    ])

    // ── Content ──
    await db.insert(s.posts).values([
      {
        authorId: admin.id,
        slug: "design-tokens-en-la-practica",
        title: "Design tokens en la práctica",
        excerpt: "Cómo modelar un sistema visual que sobreviva a tres rediseños.",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "p",
              content: [{ type: "text", text: "Un token por decisión, no por antojo." }],
            },
          ],
        },
        category: "design",
        tags: ["tokens", "css", "arquitectura"],
        status: "published",
        publishedAt: before(30 * MS.day),
        createdAt: before(31 * MS.day),
      },
      {
        authorId: admin.id,
        slug: "monorepo-rapido-y-ordenado",
        title: "Monorepo rápido y ordenado",
        excerpt: "pnpm workspaces + Turborepo sin dolor en CI.",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "p",
              content: [{ type: "text", text: "Un lockfile, un cache, una verdad." }],
            },
          ],
        },
        category: "frontend",
        tags: ["pnpm", "turborepo", "ci"],
        status: "published",
        publishedAt: before(9 * MS.day),
        createdAt: before(10 * MS.day),
      },
      {
        authorId: memberA.id,
        slug: "ia-en-equipos-pequenos",
        title: "IA en equipos pequeños",
        excerpt: "Automatizar etapa a etapa sin hipotecar el producto.",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "p",
              content: [{ type: "text", text: "Ortogonalidad antes que magia." }],
            },
          ],
        },
        category: "ia",
        tags: ["ai-sdk", "workflow"],
        status: "draft",
        createdAt: before(30 * MS.hour),
      },
    ])

    await db.insert(s.contactMessages).values([
      {
        name: "Marta Ibáñez",
        email: "marta@estudionueve.es",
        message: "Nos interesa la demo 05 para un piloto de agentes internos.",
        createdAt: before(2 * MS.day),
      },
      {
        name: "Óscar Prieto",
        email: "oscar@paninaro.com",
        message: "Consulta por la demo 08 para nuestro terminal de cocina.",
        handled: true,
        handledAt: after(10 * MS.hour),
        createdAt: before(5 * MS.day),
      },
    ])

    // ── Demo 05: agents ──
    const [supportAgent, salesAgent] = await db
      .insert(s.agents)
      .values([
        {
          name: "Soporte Concise",
          tone: "concise",
          config: {
            tools: ["search_knowledge", "escalate"],
            knowledge: ["faq_v3.md", "pricing.md"],
            temperature: 0.2,
          },
          createdAt: before(20 * MS.day),
        },
        {
          name: "Ventas Cercano",
          tone: "friendly",
          config: {
            tools: ["book_call"],
            knowledge: ["case_studies.md"],
            temperature: 0.7,
          },
          createdAt: before(15 * MS.day),
        },
      ])
      .returning()

    await db.insert(s.agentMessages).values([
      {
        agentId: supportAgent.id,
        role: "user",
        content: "¿Cuánto cuesta la integración con Postgres?",
        createdAt: before(26 * MS.hour),
      },
      {
        agentId: supportAgent.id,
        role: "assistant",
        content:
          "La integración nativa va incluida en el plan Base; Postgres gestionado aparte, 19 €/mes.",
        createdAt: before(25 * MS.hour),
      },
      {
        agentId: salesAgent.id,
        role: "user",
        content: "Quiero acelerar el seguimiento de leads entrantes del formulario.",
        createdAt: before(9 * MS.hour),
      },
      {
        agentId: salesAgent.id,
        role: "assistant",
        content:
          "Perfecto: encaja el flujo de demos 06–07, scoring automático + followups programados.",
        createdAt: before(8 * MS.hour),
      },
    ])

    // ── Demos 06/07: leads ──
    const [leadHot, leadWarm, leadCold, leadNew] = await db
      .insert(s.leads)
      .values([
        {
          name: "Carla Ruiz",
          email: "carla@plusforma.io",
          company: "Plusforma",
          source: "webhook_contact_form",
          message: "Necesitamos integrar scoring de leads con nuestro CRM antes del Q3.",
          score: 92,
          status: "hot",
          reasoning: {
            summary:
              "Presupuesto anual > 50k, urgencia alta, churn reciente del proveedor",
            signals: ["budget", "timeline", "churn"],
          },
          createdAt: before(4 * MS.hour),
        },
        {
          name: "Diego Sarro",
          email: "diego@velneo.mx",
          company: "Velneo MX",
          source: "blog_cta",
          message: "Evaluando alternativas al workflow manual de propuestas.",
          score: 61,
          status: "warm",
          reasoning: {
            summary: "Interés real pero sin fecha",
            signals: ["engagement", "no-deadline"],
          },
          createdAt: before(3 * MS.day),
        },
        {
          name: "Irene Pons",
          email: "irene@casanova.cat",
          company: "Casanova Catering",
          source: "instagram_dm",
          message: "Vi la demo 08, ¿esto vale para reserva de mesas?",
          score: 18,
          status: "cold",
          reasoning: {
            summary: "Fuera de ICP, caso de uso distinto",
            signals: ["icp-miss"],
          },
          createdAt: before(6 * MS.day),
        },
        {
          name: "Pablo Etxe",
          email: "pablo@zuri.tech",
          company: "Zuri Tech",
          source: "webhook_linkedin",
          message:
            "Recomendados por un cliente común; explorando eventos en vivo como en demo 06.",
          score: 84,
          status: "hot",
          reasoning: {
            summary: "Referido directo, stack compatible",
            signals: ["referral", "stack-fit"],
          },
          createdAt: before(40 * MS.minute),
        },
      ])
      .returning()

    await db.insert(s.followupSteps).values([
      {
        leadId: leadHot.id,
        channel: "call",
        scheduledAt: before(2 * MS.hour),
        status: "done",
        updatedAt: before(3 * MS.hour),
      },
      {
        leadId: leadHot.id,
        channel: "email",
        scheduledAt: after(1 * MS.day),
        status: "scheduled",
      },
      {
        leadId: leadWarm.id,
        channel: "email",
        scheduledAt: after(1 * MS.day),
        status: "scheduled",
      },
      {
        leadId: leadWarm.id,
        channel: "whatsapp",
        scheduledAt: after(3 * MS.day),
        status: "scheduled",
      },
      {
        leadId: leadCold.id,
        channel: "reminder",
        scheduledAt: after(21 * MS.day),
        status: "skipped",
        updatedAt: before(2 * MS.day),
      },
      {
        leadId: leadNew.id,
        channel: "call",
        scheduledAt: after(2 * MS.hour),
        status: "scheduled",
      },
    ])

    // ── Demo 08: orders ──
    const [orderNew, orderPreparing, orderReady] = await db
      .insert(s.orders)
      .values([
        {
          orderNumber: "ORD-0042",
          customerName: "Mesa 7",
          status: "new",
          total: "24.90",
          createdAt: before(8 * MS.minute),
        },
        {
          orderNumber: "ORD-0041",
          customerName: "Recoger",
          status: "preparing",
          total: "18.50",
          createdAt: before(15 * MS.minute),
        },
        {
          orderNumber: "ORD-0040",
          customerName: "Barra 3",
          status: "ready",
          total: "31.20",
          createdAt: before(35 * MS.minute),
        },
      ])
      .returning()

    await db.insert(s.orderItems).values([
      { orderId: orderNew.id, name: "Ternera blueprint", quantity: 2, unitPrice: "9.90" },
      { orderId: orderNew.id, name: "Brutal fries", quantity: 1, unitPrice: "3.90" },
      { orderId: orderNew.id, name: "Refresco", quantity: 1, unitPrice: "1.20" },
      {
        orderId: orderPreparing.id,
        name: "Pollo weltpixel",
        quantity: 1,
        unitPrice: "8.90",
      },
      {
        orderId: orderPreparing.id,
        name: "Cerveza artesanal",
        quantity: 2,
        unitPrice: "4.80",
      },
      { orderId: orderReady.id, name: "Mega burgers x3", quantity: 3, unitPrice: "7.50" },
      { orderId: orderReady.id, name: "Agua con gas", quantity: 2, unitPrice: "1.85" },
    ])

    await db.insert(s.orderEvents).values([
      {
        orderId: orderNew.id,
        eventType: "order:new",
        payload: { source: "client_panel", items: 4 },
        createdAt: before(8 * MS.minute),
      },
      {
        orderId: orderPreparing.id,
        eventType: "order:new",
        payload: { source: "client_panel" },
        createdAt: before(15 * MS.minute),
      },
      {
        orderId: orderPreparing.id,
        eventType: "order:update",
        payload: { status: "preparing" },
        createdAt: before(13 * MS.minute),
      },
      {
        orderId: orderReady.id,
        eventType: "order:update",
        payload: { status: "preparing" },
        createdAt: before(32 * MS.minute),
      },
      {
        orderId: orderReady.id,
        eventType: "order:ready",
        payload: { status: "ready" },
        createdAt: before(9 * MS.minute),
      },
    ])

    // ── Demo 09: backoffice ──
    const [shop] = await db
      .insert(s.shops)
      .values([
        {
          name: "Corner Brutal Gift Shop",
          currency: "EUR",
          createdAt: before(120 * MS.day),
        },
      ])
      .returning()

    const [custAshe, custBert, custCach] = await db
      .insert(s.customers)
      .values([
        {
          shopId: shop.id,
          name: "Ashe Franklin",
          email: "ashe@brutal.se",
          createdAt: before(80 * MS.day),
        },
        {
          shopId: shop.id,
          name: "Bert Verhoeven",
          email: "bert@studio-nl.nl",
          createdAt: before(55 * MS.day),
        },
        {
          shopId: shop.id,
          name: "Cachita Rojas",
          email: "cachita@taller.cl",
          createdAt: before(20 * MS.day),
        },
      ])
      .returning()

    await db.insert(s.products).values([
      {
        shopId: shop.id,
        name: "Poster { 01 } starfield",
        price: "24.00",
        stock: 42,
        minStock: 10,
        createdAt: before(70 * MS.day),
      },
      {
        shopId: shop.id,
        name: "Mug braces",
        price: "14.50",
        stock: 8,
        minStock: 12,
        createdAt: before(70 * MS.day),
      },
      {
        shopId: shop.id,
        name: "Tote glyph",
        price: "19.00",
        stock: 23,
        minStock: 5,
        createdAt: before(48 * MS.day),
      },
      {
        shopId: shop.id,
        name: "Sticker pack",
        price: "6.00",
        stock: 134,
        minStock: 30,
        createdAt: before(30 * MS.day),
      },
    ])

    await db.insert(s.invoices).values([
      {
        shopId: shop.id,
        customerId: custAshe.id,
        number: "INV-2026-0089",
        amount: "148.00",
        status: "paid",
        issuedAt: before(18 * MS.day),
      },
      {
        shopId: shop.id,
        customerId: custBert.id,
        number: "INV-2026-0090",
        amount: "86.50",
        status: "issued",
        issuedAt: before(4 * MS.day),
      },
      {
        shopId: shop.id,
        customerId: custCach.id,
        number: "INV-2026-0091",
        amount: "33.00",
        status: "draft",
      },
    ])

    await db.insert(s.auditLog).values([
      {
        actorId: admin.id,
        entity: "products",
        entityId: null,
        action: "create",
        diff: { name: "Sticker pack", stock: 150, minStock: 30 },
        createdAt: before(30 * MS.day),
      },
      {
        actorId: admin.id,
        entity: "products",
        entityId: null,
        action: "adjust_stock",
        diff: { stock: 134, delta: -16 },
        createdAt: before(9 * MS.day),
      },
      {
        actorId: admin.id,
        entity: "invoices",
        entityId: null,
        action: "issue",
        diff: { number: "INV-2026-0090", amount: "86.50" },
        createdAt: before(4 * MS.day),
      },
      {
        actorId: memberA.id,
        entity: "posts",
        entityId: null,
        action: "draft_save",
        diff: { title: "IA en equipos pequeños" },
        createdAt: before(29 * MS.hour),
      },
    ])

    // ── Verification: every §6 table populated (spec 00) ──
    const verification = [
      ["users", sql`select count(*) from "users"`],
      ["accounts", sql`select count(*) from "accounts"`],
      ["sessions", sql`select count(*) from "sessions"`],
      ["approval_requests", sql`select count(*) from "approval_requests"`],
      ["posts", sql`select count(*) from "posts"`],
      ["contact_messages", sql`select count(*) from "contact_messages"`],
      ["agents", sql`select count(*) from "agents"`],
      ["agent_messages", sql`select count(*) from "agent_messages"`],
      ["leads", sql`select count(*) from "leads"`],
      ["followup_steps", sql`select count(*) from "followup_steps"`],
      ["orders", sql`select count(*) from "orders"`],
      ["order_items", sql`select count(*) from "order_items"`],
      ["order_events", sql`select count(*) from "order_events"`],
      ["shops", sql`select count(*) from "shops"`],
      ["customers", sql`select count(*) from "customers"`],
      ["products", sql`select count(*) from "products"`],
      ["invoices", sql`select count(*) from "invoices"`],
      ["audit_log", sql`select count(*) from "audit_log"`],
    ] as const

    const failures: string[] = []
    const lines: string[] = []

    for (const [tableName, query] of verification) {
      const result = await db.execute(query)
      const row = (
        Array.isArray(result) ? result[0] : (result as { rows: unknown[] }).rows?.[0]
      ) as { count: string } | undefined
      const count = Number(row?.count ?? 0)
      if (count === 0) {
        failures.push(tableName)
        lines.push(`${tableName}: 0 ❌`)
      } else {
        lines.push(`${tableName}: ${count}`)
      }
    }

    console.log("Seed finished:\n" + lines.join("\n"))

    if (failures.length > 0) {
      throw new Error(`Seed verification FAILED: empty tables [${failures.join(", ")}]`)
    }
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
