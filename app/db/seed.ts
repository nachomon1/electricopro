import { getDb } from "../api/queries/connection";
import { professionals, users } from "./schema";
import { slugify } from "../api/queries/professionals";

// Perfiles de demostración para que el directorio no nazca vacío.
// El dueño del sitio puede borrarlos desde la base de datos.
const SEED_PROS = [
  {
    name: "Juan Carlos Morales Cerda",
    headline: "Ingeniero Eléctrico — Instalaciones y certificación TE1",
    bio: "Más de 15 años ejecutando y declarando instalaciones eléctricas ante la SEC. Trabajo con empresas, oficinas y viviendas en toda la Región Metropolitana. Entrego certificado TE1 al finalizar cada proyecto.",
    secClass: "A",
    region: "Metropolitana de Santiago",
    comuna: "Providencia",
    services: ["certificacion-te1", "instalaciones-domiciliarias", "proyectos-asesorias", "tableros-protecciones", "regularizacion"],
    phone: "+56 9 9336 9256",
    whatsapp: "56993369256",
    email: "jcmorales@example.cl",
    yearsExp: 15,
    plan: "empresa",
    views: 342,
  },
  {
    name: "ElectroSur SpA",
    headline: "Empresa instaladora — Proyectos industriales y comerciales",
    bio: "Empresa instaladora autorizada SEC. Diseñamos, ejecutamos y certificamos instalaciones eléctricas industriales, plantas fotovoltaicas y salas de motores en la zona sur de Chile.",
    secClass: "Empresa",
    region: "Biobío",
    comuna: "Concepción",
    services: ["industrial-motores", "paneles-solares", "proyectos-asesorias", "certificacion-te1", "tableros-protecciones"],
    phone: "+56 41 222 3344",
    whatsapp: "56981234567",
    website: "https://example.cl",
    yearsExp: 20,
    plan: "empresa",
    views: 289,
  },
  {
    name: "Fabián Rivera Zubicueta",
    headline: "Ingeniero Eléctrico — Asesorías y proyectos",
    bio: "Ingeniero eléctrico con licencia SEC Clase A. Asesoro a empresas eléctricas, mineras y constructoras en proyectos de baja y media tensión, estudios de cortocircuito y coordinación de protecciones.",
    secClass: "A",
    region: "Metropolitana de Santiago",
    comuna: "Las Condes",
    services: ["proyectos-asesorias", "industrial-motores", "certificacion-te1"],
    phone: "+56 9 8787 2170",
    whatsapp: "56987872170",
    yearsExp: 18,
    plan: "pro",
    views: 210,
  },
  {
    name: "María José Paredes Fuentes",
    headline: "Instaladora Eléctrica — Hogares y emergencias 24/7",
    bio: "Instaladora autorizada SEC Clase D. Atiendo emergencias eléctricas, cambios de tablero, instalación de enchufes, lámparas y termos eléctricos en hogares. Trabajo garantizado y con boleta.",
    secClass: "D",
    region: "Metropolitana de Santiago",
    comuna: "Maipú",
    services: ["instalaciones-domiciliarias", "emergencias", "tableros-protecciones"],
    phone: "+56 9 7456 8890",
    whatsapp: "56974568890",
    yearsExp: 7,
    plan: "pro",
    views: 176,
  },
  {
    name: "Rodrigo Nicolás Peña Silva",
    headline: "Técnico en Electricidad Industrial — Motores y tableros",
    bio: "Técnico electricista industrial, licencia SEC Clase B. Mantención de motores, partidas suaves, variadores de frecuencia y tableros de control para la industria del Biobío.",
    secClass: "B",
    region: "Biobío",
    comuna: "Talcahuano",
    services: ["industrial-motores", "tableros-protecciones", "emergencias"],
    phone: "+56 9 6242 4905",
    whatsapp: "56962424905",
    yearsExp: 12,
    plan: "pro",
    views: 154,
  },
  {
    name: "Solar Andina Ltda.",
    headline: "Paneles solares y cargadores de autos eléctricos",
    bio: "Especialistas en sistemas fotovoltaicos conectados a red (Netbilling) e instalación de cargadores Wallbox para vehículos eléctricos, con declaración SEC incluida.",
    secClass: "Empresa",
    region: "Antofagasta",
    comuna: "Antofagasta",
    services: ["paneles-solares", "cargadores-ev", "certificacion-te1"],
    phone: "+56 55 245 7788",
    whatsapp: "56966554433",
    yearsExp: 9,
    plan: "pro",
    views: 198,
  },
  {
    name: "Cristian Toledo Cid",
    headline: "Técnico Universitario en Electricidad",
    bio: "Licencia SEC Clase B. Instalaciones eléctricas para locales comerciales, restaurantes y oficinas en Valparaíso y Viña del Mar. Regularización de instalaciones antiguas.",
    secClass: "B",
    region: "Valparaíso",
    comuna: "Viña del Mar",
    services: ["instalaciones-domiciliarias", "regularizacion", "iluminacion"],
    yearsExp: 10,
    plan: "free",
    views: 87,
  },
  {
    name: "Andrés Salazar Carabantes",
    headline: "Electricista — Instalaciones y certificaciones",
    bio: "Electricista con licencia SEC Clase A. Atiendo la zona norte: instalaciones nuevas, ampliaciones y certificación TE1 para viviendas y empresas.",
    secClass: "A",
    region: "Antofagasta",
    comuna: "Calama",
    services: ["instalaciones-domiciliarias", "certificacion-te1", "emergencias"],
    yearsExp: 14,
    plan: "free",
    views: 64,
  },
  {
    name: "Ignacio Mena Reyes",
    headline: "Ingeniero Eléctrico — Proyectos y asesorías",
    bio: "Ingeniero eléctrico Clase A. Proyectos eléctricos para el sector salmonero y agroindustrial de Los Lagos. Memorias de cálculo, especificaciones técnicas y declaraciones SEC.",
    secClass: "A",
    region: "Los Lagos",
    comuna: "Puerto Montt",
    services: ["proyectos-asesorias", "industrial-motores", "certificacion-te1"],
    yearsExp: 16,
    plan: "free",
    views: 58,
  },
  {
    name: "Juan Manuel Hernández Williams",
    headline: "Electricista — Zona austral",
    bio: "Electricista SEC Clase D en Magallanes. Instalaciones domiciliarias, calefacción eléctrica y emergencias en Punta Arenas y alrededores.",
    secClass: "D",
    region: "Magallanes y de la Antártica Chilena",
    comuna: "Punta Arenas",
    services: ["instalaciones-domiciliarias", "emergencias", "iluminacion"],
    yearsExp: 8,
    plan: "free",
    views: 41,
  },
  {
    name: "Bastián González Iturra",
    headline: "Ingeniero en Electricidad — Iluminación y eficiencia",
    bio: "Diseño de sistemas de iluminación para empresas y municipios. Auditorías energéticas y proyectos de eficiencia en la región de Ñuble y Biobío.",
    secClass: "B",
    region: "Ñuble",
    comuna: "Chillán",
    services: ["iluminacion", "proyectos-asesorias"],
    yearsExp: 6,
    plan: "free",
    views: 33,
  },
  {
    name: "Timo Jurado",
    headline: "Ingeniero Civil Eléctrico — Certificación y regularización",
    bio: "Ingeniero civil eléctrico SEC Clase A. Regularizo instalaciones eléctricas para compraventas de propiedades, recepciones municipales y seguros. Cobertura en O'Higgins y Maule.",
    secClass: "A",
    region: "Libertador General Bernardo O'Higgins",
    comuna: "Rancagua",
    services: ["certificacion-te1", "regularizacion", "proyectos-asesorias"],
    phone: "+56 9 9090 2954",
    whatsapp: "56990902954",
    yearsExp: 11,
    plan: "pro",
    views: 121,
  },
] as const;

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  const existing = await db.query.professionals.findFirst();
  if (existing) {
    console.log("Ya existen profesionales, se omite el seed.");
    process.exit(0);
  }

  for (let i = 0; i < SEED_PROS.length; i++) {
    const p = SEED_PROS[i];
    const [userResult] = await db.insert(users).values({
      unionId: `seed-${i + 1}`,
      name: p.name,
      email: `seed${i + 1}@electricopro.local`,
    });
    const userId = Number((userResult as unknown as { insertId: number }).insertId);

    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);

    await db.insert(professionals).values({
      userId,
      name: p.name,
      slug: `${slugify(p.name)}-${userId}`,
      headline: p.headline,
      bio: p.bio,
      secClass: p.secClass,
      region: p.region,
      comuna: p.comuna,
      services: JSON.stringify([...p.services]),
      phone: "phone" in p ? p.phone : null,
      whatsapp: "whatsapp" in p ? p.whatsapp : null,
      email: "email" in p ? p.email : null,
      website: "website" in p ? p.website : null,
      yearsExp: p.yearsExp,
      plan: p.plan,
      planCycle: p.plan === "free" ? null : "yearly",
      planExpiresAt: p.plan === "free" ? null : expires,
      status: "published",
      views: p.views,
    });
  }

  console.log(`Seed listo: ${SEED_PROS.length} profesionales publicados.`);
  process.exit(0);
}

seed();
