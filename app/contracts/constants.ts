export const Session = {
  cookieName: "kimi_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback",
} as const;

// ─────────────────────────────────────────────
// Dominio: EléctricoPro Chile
// ─────────────────────────────────────────────

export const REGIONS = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "Libertador General Bernardo O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén del General Carlos Ibáñez del Campo",
  "Magallanes y de la Antártica Chilena",
] as const;

export const SERVICES = [
  { slug: "instalaciones-domiciliarias", label: "Instalaciones domiciliarias" },
  { slug: "certificacion-te1", label: "Certificación TE1 / Declaración SEC" },
  { slug: "paneles-solares", label: "Paneles solares fotovoltaicos" },
  { slug: "cargadores-ev", label: "Cargadores para autos eléctricos" },
  { slug: "industrial-motores", label: "Instalaciones industriales y motores" },
  { slug: "tableros-protecciones", label: "Tableros y protecciones eléctricas" },
  { slug: "proyectos-asesorias", label: "Proyectos y asesorías eléctricas" },
  { slug: "iluminacion", label: "Iluminación y alumbrado" },
  { slug: "emergencias", label: "Emergencias eléctricas 24/7" },
  { slug: "regularizacion", label: "Regularización de instalaciones" },
  { slug: "redes-datos", label: "Redes, datos y citofonía" },
  { slug: "aumento-potencia", label: "Aumento de potencia y empalmes" },
] as const;

export const SERVICE_LABELS: Record<string, string> = Object.fromEntries(
  SERVICES.map((s) => [s.slug, s.label]),
);

export const SEC_CLASSES = ["A", "B", "C", "D", "E", "Empresa"] as const;

export const PLANS = {
  free: {
    id: "free" as const,
    name: "Gratis",
    monthly: 0,
    yearly: 0,
    tagline: "Aparece en el directorio",
    features: [
      "Ficha básica en el directorio",
      "Nombre, oficio, región y comuna",
      "Hasta 3 servicios",
      "Recepción de solicitudes por formulario",
    ],
    maxServices: 3,
    showPhone: false,
    showWhatsapp: false,
    featured: false,
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    monthly: 2990,
    yearly: 29990,
    tagline: "Para profesionales que quieren más clientes",
    features: [
      "Todo lo del plan Gratis",
      "Teléfono y botón de WhatsApp visibles",
      "Foto de perfil y descripción completa",
      "Hasta 10 servicios",
      "Prioridad en los resultados de búsqueda",
      "Alerta inmediata de nuevas solicitudes",
    ],
    maxServices: 10,
    showPhone: true,
    showWhatsapp: true,
    featured: true,
  },
  empresa: {
    id: "empresa" as const,
    name: "Empresa",
    monthly: 5000,
    yearly: 50000,
    tagline: "Para empresas eléctricas y contratistas",
    features: [
      "Todo lo del plan Pro",
      "Insignia “Empresa destacada”",
      "Primer lugar en portada y búsqueda",
      "Estadísticas de visitas y solicitudes",
      "Servicios ilimitados",
      "Enlace a sitio web y redes",
    ],
    maxServices: 99,
    showPhone: true,
    showWhatsapp: true,
    featured: true,
  },
} as const;

export type PlanId = keyof typeof PLANS;
export const PLAN_IDS: PlanId[] = ["free", "pro", "empresa"];

export function formatCLP(amount: number): string {
  return "$" + amount.toLocaleString("es-CL");
}

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  empresa: 2,
};
