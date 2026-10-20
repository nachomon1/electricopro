import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths, REGIONS, SERVICES } from "@contracts/constants";
import { listPublishedSlugs } from "./queries/professionals";
import { storage } from "./lib/storage";
import { flowConfigured, flowGetStatus } from "./lib/flow";
import { markPaymentPaid, markPaymentRejected, findPaymentByOrder } from "./queries/professionals";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// Archivos subidos por usuarios (fotos de perfil): URL pública estable
// que redirige a una URL firmada de corta duración.
app.get("/api/f/:key{.+}", async (c) => {
  try {
    const key = c.req.param("key");
    const { url } = await storage.getPresignedUrl({ key });
    return c.redirect(url);
  } catch {
    return c.notFound();
  }
});

// Sitemap dinámico: incluye cada ficha publicada y las secciones del directorio.
app.get("/sitemap.xml", async (c) => {
  const origin = new URL(c.req.url).origin;
  const today = new Date().toISOString().slice(0, 10);

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/directorio", priority: "0.9", changefreq: "hourly" },
    { loc: "/planes", priority: "0.8", changefreq: "weekly" },
    { loc: "/publicar", priority: "0.7", changefreq: "monthly" },
  ];
  const sectionPages = [
    ...REGIONS.map((r) => `/directorio?region=${encodeURIComponent(r)}`),
    ...SERVICES.map((s) => `/directorio?servicio=${encodeURIComponent(s.slug)}`),
  ];

  let profilePages: { slug: string; updatedAt: Date }[] = [];
  try {
    profilePages = await listPublishedSlugs();
  } catch {
    // Si la BD no responde, el sitemap sigue sirviendo las páginas estáticas
  }

  const url = (loc: string, lastmod: string, changefreq: string, priority: string) =>
    `  <url><loc>${origin}${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map((p) => url(p.loc, today, p.changefreq, p.priority)).join("\n")}
${sectionPages.map((loc) => url(loc, today, "daily", "0.7")).join("\n")}
${profilePages
  .map((p) =>
    url(
      `/profesional/${encodeURIComponent(p.slug)}`,
      p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10) : today,
      "weekly",
      "0.8",
    ),
  )
  .join("\n")}
</urlset>`;

  c.header("Content-Type", "application/xml; charset=utf-8");
  c.header("Cache-Control", "public, max-age=3600");
  return c.body(xml);
});

// ── Flow.cl: confirmación de pago (webhook) y retorno del usuario ──
// Adaptado desde CrearPáginasPs (confirm-payment-hook / payment success).

// Webhook: Flow envía POST form-urlencoded con `token`
app.post("/api/flow/confirm", async (c) => {
  try {
    const bodyText = await c.req.text();
    const token = new URLSearchParams(bodyText).get("token")?.trim() ?? "";
    if (!token || !flowConfigured()) return c.json({ received: true });

    const flow = await flowGetStatus(token);
    const order = flow.commerceOrder ?? "";
    if (!order) return c.json({ received: true });

    const payment = await findPaymentByOrder(order);
    if (!payment) return c.json({ received: true });

    // Verificación de monto: nunca activar un plan con monto distinto
    const amountOk =
      flow.amount === undefined || Number(flow.amount) === payment.amount;

    if (flow.status === 2 && amountOk) {
      await markPaymentPaid(order, String(flow.flowOrder ?? ""));
    } else if (flow.status === 3 || flow.status === 4) {
      await markPaymentRejected(order);
    }
    return c.json({ received: true });
  } catch (err) {
    console.error("[flow/confirm] error:", err);
    // 200 siempre: evita reintentos en loop de Flow ante errores de negocio
    return c.json({ received: true });
  }
});

// Retorno: Flow redirige al usuario aquí con ?token=...
app.get("/api/flow/return", (c) => {
  const token = new URL(c.req.url).searchParams.get("token") ?? "";
  return c.redirect(`/pago/resultado?token=${encodeURIComponent(token)}`);
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
