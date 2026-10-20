import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Perfil público de un profesional / empresa eléctrica
export const professionals = mysqlTable("professionals", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .unique()
    .references(() => users.id),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 190 }).notNull().unique(),
  headline: varchar("headline", { length: 250 }).notNull(), // ej: Instalador Eléctrico
  bio: text("bio"),
  secClass: varchar("secClass", { length: 20 }), // A, B, C, D, E, Empresa
  region: varchar("region", { length: 80 }).notNull(),
  comuna: varchar("comuna", { length: 80 }).notNull(),
  services: text("services").notNull(), // JSON array de slugs
  phone: varchar("phone", { length: 30 }),
  whatsapp: varchar("whatsapp", { length: 30 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  photoKey: varchar("photoKey", { length: 255 }),
  yearsExp: int("yearsExp"),
  plan: mysqlEnum("plan", ["free", "pro", "empresa"])
    .default("free")
    .notNull(),
  planCycle: mysqlEnum("planCycle", ["monthly", "yearly"]),
  planExpiresAt: timestamp("planExpiresAt"),
  status: mysqlEnum("status", ["draft", "published"])
    .default("draft")
    .notNull(),
  views: int("views").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = typeof professionals.$inferInsert;

// Solicitudes de contacto (leads) que reciben los profesionales
export const leads = mysqlTable("leads", {
  id: serial("id").primaryKey(),
  professionalId: bigint("professionalId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => professionals.id),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  comuna: varchar("comuna", { length: 80 }),
  service: varchar("service", { length: 80 }),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// Pagos de suscripciones (Flow.cl)
export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  professionalId: bigint("professionalId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => professionals.id),
  commerceOrder: varchar("commerceOrder", { length: 60 }).notNull().unique(),
  flowOrder: varchar("flowOrder", { length: 60 }),
  token: varchar("token", { length: 120 }),
  plan: mysqlEnum("plan", ["pro", "empresa"]).notNull(),
  cycle: mysqlEnum("cycle", ["monthly", "yearly"]).notNull(),
  amount: int("amount").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "rejected", "error"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
