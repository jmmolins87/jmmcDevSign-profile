import { sql } from "drizzle-orm"

import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

/**
 * Schema v1 — all domains from guidelines §6.
 * Conventions: UUID primary keys (gen_random_uuid()), snake_case columns,
 * timestamptz timestamps with created_at/updated_at, enums via pgEnum.
 */

const id = () => uuid().primaryKey().default(sql`gen_random_uuid()`)

const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
})

// ── Auth domain ────────────────────────────────────────────────────────────

export const userRole = pgEnum("user_role", ["admin", "member"])
export const userStatus = pgEnum("user_status", ["pending", "approved", "rejected"])
export const approvalAction = pgEnum("approval_action", ["approve", "reject"])

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    name: text("name"),
    passwordHash: text("password_hash"),
    role: userRole().notNull().default("member"),
    status: userStatus().notNull().default("pending"),
    ...timestamps(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
)

export const accounts = pgTable(
  "accounts",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("accounts_provider_account_unique").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
)

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    ...timestamps(),
  },
  (table) => [uniqueIndex("sessions_token_unique").on(table.token)],
)

export const approvalRequests = pgTable(
  "approval_requests",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull(),
    decisionTokenHash: text("decision_token_hash").notNull(),
    decision: approvalAction(),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "date" }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    ...timestamps(),
  },
  (table) => [index("approval_requests_user_idx").on(table.userId)],
)

// ── Content domain ─────────────────────────────────────────────────────────

export const postStatus = pgEnum("post_status", ["draft", "published"])

export const posts = pgTable(
  "posts",
  {
    id: id(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    contentJson: jsonb("content_json"),
    coverUrl: text("cover_url"),
    category: text("category"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    status: postStatus().notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    ...timestamps(),
  },
  (table) => [uniqueIndex("posts_slug_unique").on(table.slug)],
)

export const contactMessages = pgTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  handled: boolean("handled").notNull().default(false),
  handledAt: timestamp("handled_at", { withTimezone: true, mode: "date" }),
  ...timestamps(),
})

// ── Demo 05: agent builder ─────────────────────────────────────────────────

export const messageRole = pgEnum("message_role", ["user", "assistant"])

export const agents = pgTable("agents", {
  id: id(),
  name: text("name").notNull(),
  tone: text("tone").notNull().default("concise"),
  config: jsonb("config").notNull().default(sql`'{}'::jsonb`),
  ...timestamps(),
})

export const agentMessages = pgTable(
  "agent_messages",
  {
    id: id(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    role: messageRole().notNull(),
    content: text("content").notNull(),
    ...timestamps(),
  },
  (table) => [index("agent_messages_agent_idx").on(table.agentId)],
)

// ── Demos 06/07: leads workflow + qualification ────────────────────────────

export const leadStatus = pgEnum("lead_status", ["hot", "warm", "cold"])
export const followupChannel = pgEnum("followup_channel", [
  "email",
  "whatsapp",
  "call",
  "reminder",
])
export const followupStatus = pgEnum("followup_status", ["scheduled", "done", "skipped"])

export const leads = pgTable(
  "leads",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    source: text("source"),
    message: text("message"),
    score: integer("score").notNull().default(50),
    status: leadStatus().notNull().default("warm"),
    reasoning: jsonb("reasoning"),
    ...timestamps(),
  },
  (table) => [index("leads_score_idx").on(table.score)],
)

export const followupSteps = pgTable(
  "followup_steps",
  {
    id: id(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    channel: followupChannel().notNull(),
    scheduledAt: timestamp("scheduled_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    status: followupStatus().notNull().default("scheduled"),
    ...timestamps(),
  },
  (table) => [index("followup_steps_lead_idx").on(table.leadId)],
)

// ── Demo 08: orders realtime ───────────────────────────────────────────────

export const orderStatus = pgEnum("order_status", ["new", "preparing", "ready"])

export const orders = pgTable(
  "orders",
  {
    id: id(),
    orderNumber: text("order_number").notNull(),
    customerName: text("customer_name"),
    status: orderStatus().notNull().default("new"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
    ...timestamps(),
  },
  (table) => [uniqueIndex("orders_number_unique").on(table.orderNumber)],
)

export const orderItems = pgTable(
  "order_items",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    ...timestamps(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
)

export const orderEvents = pgTable(
  "order_events",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("order_events_order_idx").on(table.orderId)],
)

// ── Demo 09: business backoffice ───────────────────────────────────────────

export const invoiceStatus = pgEnum("invoice_status", ["draft", "issued", "paid"])

export const shops = pgTable("shops", {
  id: id(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("EUR"),
  ...timestamps(),
})

export const customers = pgTable(
  "customers",
  {
    id: id(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    ...timestamps(),
  },
  (table) => [index("customers_shop_idx").on(table.shopId)],
)

export const products = pgTable(
  "products",
  {
    id: id(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").notNull().default(0),
    minStock: integer("min_stock").notNull().default(0),
    ...timestamps(),
  },
  (table) => [index("products_shop_idx").on(table.shopId)],
)

export const invoices = pgTable(
  "invoices",
  {
    id: id(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    number: text("number").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: invoiceStatus().notNull().default("draft"),
    issuedAt: timestamp("issued_at", { withTimezone: true, mode: "date" }),
    ...timestamps(),
  },
  (table) => [uniqueIndex("invoices_number_unique").on(table.number)],
)

export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    entity: text("entity").notNull(),
    entityId: uuid("entity_id"),
    action: text("action").notNull(),
    diff: jsonb("diff"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("audit_log_entity_idx").on(table.entity, table.entityId)],
)
