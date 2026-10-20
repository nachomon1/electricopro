import crypto from "crypto";

// Adaptado desde la integración Flow de CrearPáginasPs (route.ts create-payment
// y confirm-return) al stack Hono + tRPC de EléctricoPro.

const FLOW_API_KEY = process.env.FLOW_API_KEY;
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY;
const FLOW_API_URL = process.env.FLOW_URL || "https://www.flow.cl/api";

export function flowConfigured(): boolean {
  return Boolean(FLOW_API_KEY && FLOW_SECRET_KEY);
}

export function signParameters(
  params: Record<string, string | number>,
  secret: string,
): string {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((k) => `${k}${params[k]}`).join("");
  return crypto.createHmac("sha256", secret).update(toSign).digest("hex");
}

export async function flowCreatePayment(input: {
  commerceOrder: string;
  subject: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
}): Promise<{ token: string; url: string; flowOrder?: string }> {
  if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
    throw new Error("Flow no está configurado (faltan FLOW_API_KEY / FLOW_SECRET_KEY)");
  }

  const params: Record<string, string | number> = {
    apiKey: FLOW_API_KEY,
    commerceOrder: input.commerceOrder,
    subject: input.subject,
    currency: "CLP",
    amount: input.amount,
    email: input.email,
    paymentMethod: 9, // todos los medios de pago
    urlConfirmation: input.urlConfirmation,
    urlReturn: input.urlReturn,
  };

  const s = signParameters(params, FLOW_SECRET_KEY);
  const bodyParams = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    s,
  });

  const resp = await fetch(`${FLOW_API_URL}/payment/create`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: bodyParams.toString(),
  });

  const data = (await resp.json().catch(() => null)) as {
    token?: string;
    url?: string;
    flowOrder?: string;
    message?: string;
  } | null;

  if (!resp.ok || !data?.token || !data?.url) {
    throw new Error(data?.message || `Flow respondió ${resp.status}`);
  }

  return { token: data.token, url: data.url, flowOrder: data.flowOrder };
}

export async function flowGetStatus(token: string): Promise<{
  status: number; // 1 pendiente · 2 pagada · 3 rechazada · 4 anulada
  commerceOrder?: string;
  amount?: number | string;
  flowOrder?: string;
  payer?: string;
}> {
  if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
    throw new Error("Flow no está configurado (faltan FLOW_API_KEY / FLOW_SECRET_KEY)");
  }

  const params = { apiKey: FLOW_API_KEY, token };
  const s = signParameters(params, FLOW_SECRET_KEY);
  const qs = new URLSearchParams({ apiKey: FLOW_API_KEY, token, s });

  const resp = await fetch(`${FLOW_API_URL}/payment/getStatus?${qs.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const text = await resp.text();
  if (!resp.ok) throw new Error(text || `Flow getStatus falló (${resp.status})`);
  return JSON.parse(text);
}
