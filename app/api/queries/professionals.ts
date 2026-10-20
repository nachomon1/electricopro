import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { PLAN_RANK, type PlanId } from "@contracts/constants";
import { getDb } from "./connection";
import { leads, payments, professionals, users } from "../../db/schema";
import type { InsertProfessional } from "../../db/schema";

export function parseServices(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

type DirectoryFilters = {
  q?: string;
  region?: string;
  service?: string;
  secClass?: string;
};

export async function searchProfessionals(filters: DirectoryFilters) {
  const db = getDb();
  const conditions = [eq(professionals.status, "published")];

  if (filters.region) conditions.push(eq(professionals.region, filters.region));
  if (filters.secClass)
    conditions.push(eq(professionals.secClass, filters.secClass));
  if (filters.service)
    conditions.push(like(professionals.services, `%"${filters.service}"%`));
  if (filters.q) {
    const q = `%${filters.q}%`;
    conditions.push(
      or(
        like(professionals.name, q),
        like(professionals.headline, q),
        like(professionals.comuna, q),
        like(professionals.bio, q),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(professionals)
    .where(and(...conditions));

  const now = new Date();
  const active = (p: (typeof rows)[number]) =>
    p.plan === "free" ||
    (p.planExpiresAt !== null && p.planExpiresAt > now);

  return rows
    .filter(active)
    .sort((a, b) => {
      const rank =
        PLAN_RANK[(active(b) ? b.plan : "free") as PlanId] -
        PLAN_RANK[(active(a) ? a.plan : "free") as PlanId];
      if (rank !== 0) return rank;
      return (b.views ?? 0) - (a.views ?? 0);
    })
    .map((p) => ({
      ...p,
      services: parseServices(p.services),
      photoUrl: p.photoKey ? `/api/f/${p.photoKey}` : null,
    }));
}

export async function findProfessionalBySlug(slug: string) {
  const db = getDb();
  const row = await db.query.professionals.findFirst({
    where: eq(professionals.slug, slug),
  });
  if (!row || row.status !== "published") return null;
  await db
    .update(professionals)
    .set({ views: sql`${professionals.views} + 1` })
    .where(eq(professionals.id, row.id));
  return {
    ...row,
    services: parseServices(row.services),
    photoUrl: row.photoKey ? `/api/f/${row.photoKey}` : null,
  };
}

export async function findMyProfessional(userId: number) {
  const db = getDb();
  const row = await db.query.professionals.findFirst({
    where: eq(professionals.userId, userId),
  });
  if (!row) return null;
  return {
    ...row,
    services: parseServices(row.services),
    photoUrl: row.photoKey ? `/api/f/${row.photoKey}` : null,
  };
}

export async function upsertProfessional(
  userId: number,
  data: Omit<InsertProfessional, "id" | "userId" | "slug" | "services"> & {
    services: string[];
  },
) {
  const db = getDb();
  const existing = await db.query.professionals.findFirst({
    where: eq(professionals.userId, userId),
  });
  const payload = { ...data, services: JSON.stringify(data.services) };

  if (existing) {
    await db
      .update(professionals)
      .set(payload)
      .where(eq(professionals.id, existing.id));
    return findMyProfessional(userId);
  }

  const base = slugify(data.name) || "profesional";
  let slug = base;
  let i = 1;
  while (await db.query.professionals.findFirst({ where: eq(professionals.slug, slug) })) {
    slug = `${base}-${++i}`;
  }
  await db.insert(professionals).values({ ...payload, userId, slug });
  return findMyProfessional(userId);
}

export async function activatePlan(
  userId: number,
  plan: PlanId,
  cycle: "monthly" | "yearly" | null,
) {
  const db = getDb();
  const pro = await db.query.professionals.findFirst({
    where: eq(professionals.userId, userId),
  });
  if (!pro) throw new Error("Perfil no encontrado");

  const expires = new Date();
  if (plan === "free") {
    await db
      .update(professionals)
      .set({ plan, planCycle: null, planExpiresAt: null })
      .where(eq(professionals.id, pro.id));
    return;
  }
  if (cycle === "yearly") expires.setFullYear(expires.getFullYear() + 1);
  else expires.setMonth(expires.getMonth() + 1);

  await db
    .update(professionals)
    .set({ plan, planCycle: cycle, planExpiresAt: expires })
    .where(eq(professionals.id, pro.id));
}

export async function setProfileStatus(
  userId: number,
  status: "draft" | "published",
) {
  const db = getDb();
  await db
    .update(professionals)
    .set({ status })
    .where(eq(professionals.userId, userId));
}

export async function countPublished() {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(professionals)
    .where(eq(professionals.status, "published"));
  return row?.count ?? 0;
}

export async function createLead(data: {
  professionalId: number;
  name: string;
  email?: string;
  phone?: string;
  comuna?: string;
  service?: string;
  message: string;
}) {
  const db = getDb();
  await db.insert(leads).values(data);
}

export async function findLeadsForUser(userId: number) {
  const db = getDb();
  const pro = await db.query.professionals.findFirst({
    where: eq(professionals.userId, userId),
  });
  if (!pro) return { professional: null, leads: [] as (typeof leads.$inferSelect)[] };
  const rows = await db
    .select()
    .from(leads)
    .where(eq(leads.professionalId, pro.id))
    .orderBy(desc(leads.createdAt));
  return {
    professional: {
      ...pro,
      services: parseServices(pro.services),
      photoUrl: pro.photoKey ? `/api/f/${pro.photoKey}` : null,
    },
    leads: rows,
  };
}

export async function countSeedUsers() {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(like(users.unionId, "seed-%"));
  return row?.count ?? 0;
}

// Listado ligero para el sitemap dinámico
export async function listPublishedSlugs() {
  const db = getDb();
  return db
    .select({ slug: professionals.slug, updatedAt: professionals.updatedAt })
    .from(professionals)
    .where(eq(professionals.status, "published"));
}

// Conteo de fichas publicadas agrupado por región (para secciones SEO)
export async function countByRegion() {
  const db = getDb();
  return db
    .select({ region: professionals.region, count: sql<number>`count(*)` })
    .from(professionals)
    .where(eq(professionals.status, "published"))
    .groupBy(professionals.region);
}

export async function setPhotoKey(userId: number, photoKey: string) {
  const db = getDb();
  await db
    .update(professionals)
    .set({ photoKey })
    .where(eq(professionals.userId, userId));
}

// ── Pagos Flow ──────────────────────────────

export async function createPaymentOrder(data: {
  userId: number;
  commerceOrder: string;
  plan: "pro" | "empresa";
  cycle: "monthly" | "yearly";
  amount: number;
}): Promise<number | null> {
  const db = getDb();
  const pro = await db.query.professionals.findFirst({
    where: eq(professionals.userId, data.userId),
  });
  if (!pro) return null;
  const [res] = await db.insert(payments).values({
    userId: data.userId,
    professionalId: pro.id,
    commerceOrder: data.commerceOrder,
    plan: data.plan,
    cycle: data.cycle,
    amount: data.amount,
  });
  return Number((res as unknown as { insertId: number }).insertId);
}

export async function findPaymentByToken(token: string) {
  const db = getDb();
  return (
    (await db.query.payments.findFirst({ where: eq(payments.token, token) })) ??
    null
  );
}

export async function findPaymentByOrder(commerceOrder: string) {
  const db = getDb();
  return (
    (await db.query.payments.findFirst({
      where: eq(payments.commerceOrder, commerceOrder),
    })) ?? null
  );
}

export async function saveFlowToken(commerceOrder: string, token: string, flowOrder?: string) {
  const db = getDb();
  await db
    .update(payments)
    .set({ token, flowOrder: flowOrder ?? null })
    .where(eq(payments.commerceOrder, commerceOrder));
}

// Activa el plan del profesional dueño del pago (idempotente)
export async function markPaymentPaid(commerceOrder: string, flowOrder: string) {
  const db = getDb();
  const payment = await findPaymentByOrder(commerceOrder);
  if (!payment) return false;
  if (payment.status === "paid") return true; // idempotente

  await db
    .update(payments)
    .set({ status: "paid", paidAt: new Date(), flowOrder: flowOrder || null })
    .where(eq(payments.commerceOrder, commerceOrder));

  const expires = new Date();
  if (payment.cycle === "yearly") expires.setFullYear(expires.getFullYear() + 1);
  else expires.setMonth(expires.getMonth() + 1);

  await db
    .update(professionals)
    .set({ plan: payment.plan, planCycle: payment.cycle, planExpiresAt: expires })
    .where(eq(professionals.id, payment.professionalId));
  return true;
}

export async function markPaymentRejected(commerceOrder: string) {
  const db = getDb();
  await db
    .update(payments)
    .set({ status: "rejected" })
    .where(eq(payments.commerceOrder, commerceOrder));
}
