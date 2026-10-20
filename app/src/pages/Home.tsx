import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { REGIONS, SERVICES, PLANS, formatCLP } from "@contracts/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { ProCard } from "@/components/ProCard";

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("yearly");

  const { data: destacados } = trpc.directory.search.useQuery({});

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (region) params.set("region", region);
    navigate(`/directorio${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="border-b-2 border-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-24 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div>
            <Reveal>
              <p className="kicker">Directorio nacional · Chile</p>
              <h1 className="mt-4 font-display text-4xl font-black uppercase sm:text-6xl lg:text-7xl">
                Encuentra un instalador eléctrico{" "}
                <span className="bg-secondary px-2">autorizado SEC</span> en tu región
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Certificación TE1, instalaciones domiciliarias e industriales,
                paneles solares y cargadores para autos eléctricos. Compara
                profesionales y contacta directo, sin intermediarios.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <form onSubmit={buscar} className="mt-8 flex flex-col gap-0 border-2 border-foreground bg-card sm:flex-row" role="search">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="¿Qué necesitas? Ej: certificación TE1, paneles solares…"
                  className="min-h-14 flex-1 border-b-2 border-foreground bg-transparent px-4 text-base placeholder:text-muted-foreground focus:outline-none focus:bg-muted/50 sm:border-b-0 sm:border-r-2"
                  aria-label="Qué servicio necesitas"
                />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="min-h-14 border-b-2 border-foreground bg-transparent px-4 text-base focus:outline-none focus:bg-muted/50 sm:border-b-0 sm:border-r-2 sm:max-w-56"
                  aria-label="Región"
                >
                  <option value="">Todas las regiones</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <button type="submit" className="min-h-14 bg-primary px-8 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-foreground cursor-pointer">
                  Buscar
                </button>
              </form>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold">
                <span><strong className="font-display text-xl">{REGIONS.length}</strong> regiones cubiertas</span>
                <span><strong className="font-display text-xl">{SERVICES.length}</strong> especialidades</span>
                <span><strong className="font-display text-xl">100%</strong> gratis para buscar</span>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="hidden lg:block">
            <div className="card-brutal bg-foreground p-8 text-background">
              <svg viewBox="0 0 32 32" className="h-16 w-16" aria-hidden="true">
                <path d="M18 2 L6 19 h7 L11 30 L26 11 h-8 z" fill="#ffe306" />
              </svg>
              <p className="mt-6 font-display text-2xl font-bold uppercase leading-tight">
                ¿Eres instalador o empresa eléctrica?
              </p>
              <p className="mt-3 text-background/70">
                Sé de los primeros en publicar en tu región: quien llega
                primero, se queda con los clientes. Un solo trabajo de
                certificación TE1 paga tu plan por años.
              </p>
              <Link to="/publicar" className="mt-6 inline-flex min-h-12 items-center border-2 border-secondary bg-secondary px-6 py-3 text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-transparent hover:text-secondary">
                Publicar gratis →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="border-b-2 border-foreground py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p className="kicker">Qué puedes encontrar</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase sm:text-5xl">
              Servicios eléctricos por especialidad
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-px border-2 border-foreground bg-foreground md:grid-cols-5">
            {SERVICES.map((s, i) => (
              <Reveal key={s.slug} delay={i * 40}>
                <Link
                  to={`/directorio?servicio=${s.slug}`}
                  className="flex h-full min-h-28 flex-col justify-between bg-background p-4 transition-colors duration-200 hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                >
                  <span className="font-display text-sm font-bold uppercase leading-snug">{s.label}</span>
                  <span className="mt-4 text-primary" aria-hidden="true">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="border-b-2 border-foreground bg-muted py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <p className="kicker">Cómo funciona</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase sm:text-5xl">
              Tres pasos y listo
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-px border-2 border-foreground bg-foreground md:grid-cols-3">
            {[
              { n: "01", t: "Busca por servicio y región", d: "Filtra por lo que necesitas — certificación TE1, instalación, emergencia — y por tu región o comuna." },
              { n: "02", t: "Compara perfiles", d: "Revisa experiencia, clase de licencia SEC y especialidades de cada profesional o empresa." },
              { n: "03", t: "Contacta directo", d: "Envía una solicitud desde el perfil o habla por WhatsApp. Sin comisiones ni intermediarios." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="h-full bg-background p-6 sm:p-8">
                  <span className="font-display text-5xl font-black text-primary">{s.n}</span>
                  <h3 className="mt-4 font-display text-xl font-bold uppercase">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      {destacados && destacados.length > 0 && (
        <section className="border-b-2 border-foreground py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="kicker">Profesionales</p>
                  <h2 className="mt-3 font-display text-3xl font-black uppercase sm:text-5xl">
                    Destacados del directorio
                  </h2>
                </div>
                <Link to="/directorio" className="btn-brutal-inverse">
                  Ver todos →
                </Link>
              </div>
            </Reveal>
            <div className="mt-10 space-y-4">
              {destacados.slice(0, 10).map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <ProCard pro={p} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* POR QUÉ SEC (SEO) */}
      <section className="border-b-2 border-foreground bg-foreground py-16 text-background md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className="kicker !text-secondary">Seguridad primero</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase sm:text-5xl">
              ¿Por qué exigir un instalador autorizado SEC?
            </h2>
            <p className="mt-6 text-background/70">
              En Chile, la ley exige que las instalaciones eléctricas sean
              ejecutadas y declaradas por un instalador autorizado por la
              Superintendencia de Electricidad y Combustibles (SEC). El
              certificado TE1 es tu respaldo legal.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <ul className="space-y-4">
              {[
                "Sin certificación SEC, tu seguro puede rechazar un siniestro por causa eléctrica.",
                "Una instalación no declarada puede ser multada o desconectada por la distribuidora.",
                "Paneles solares y cargadores de autos eléctricos requieren declaración SEC obligatoria.",
                "Verifica la licencia del instalador gratis en el registro oficial de la SEC (sec.cl).",
              ].map((t) => (
                <li key={t} className="flex gap-3 border-l-4 border-secondary pl-4 text-sm text-background/85">
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* PLANES PREVIEW */}
      <section className="border-b-2 border-foreground py-16 md:py-24" id="planes">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="kicker">Para profesionales</p>
                <h2 className="mt-3 font-display text-3xl font-black uppercase sm:text-5xl">
                  Publica y consigue clientes
                </h2>
                <p className="mt-4 max-w-xl text-muted-foreground">
                  Empieza gratis. Cuando quieras destacar, un plan Pro cuesta
                  menos que una hora de trabajo: {formatCLP(PLANS.pro.monthly)}/mes.
                </p>
              </div>
              <div className="flex border-2 border-foreground" role="group" aria-label="Período de pago">
                {(["monthly", "yearly"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    className={`min-h-12 px-5 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      cycle === c ? "bg-foreground text-background" : "bg-transparent hover:bg-muted"
                    }`}
                    aria-pressed={cycle === c}
                  >
                    {c === "monthly" ? "Mensual" : "Anual −16%"}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={120} className="mt-10">
            <div className="grid gap-6 md:grid-cols-3">
              {(["free", "pro", "empresa"] as const).map((id) => {
                const plan = PLANS[id];
                const price = cycle === "monthly" ? plan.monthly : plan.yearly;
                return (
                  <div key={id} className="card-brutal flex flex-col p-6">
                    <p className="kicker">{plan.name}</p>
                    <p className="mt-3 font-display text-4xl font-black">
                      {price === 0 ? "$0" : formatCLP(price)}
                      <span className="text-base font-medium text-muted-foreground">
                        {price === 0 ? "" : cycle === "monthly" ? " /mes" : " /año"}
                      </span>
                    </p>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">{plan.tagline}</p>
                    <Link to="/planes" className="btn-brutal mt-6 w-full">
                      Ver detalle
                    </Link>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-b-2 border-foreground py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="card-brutal bg-secondary p-8 text-center sm:p-14">
              <p className="kicker !text-foreground/60">Somos los primeros en Chile</p>
              <h2 className="mt-3 font-display text-3xl font-black uppercase sm:text-5xl">
                Tu próximo cliente te está buscando ahora
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-foreground/80">
                Somos el primer directorio nacional exclusivo para profesionales
                eléctricos autorizados SEC. Quienes publican ahora se posicionan
                primero en Google — cada ficha es una página indexable con tu
                nombre, tu comuna y tus especialidades. Publicar es gratis.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/publicar" className="btn-brutal">
                  Publicar mis servicios
                </Link>
                <Link to="/directorio" className="btn-brutal-inverse">
                  Buscar un profesional
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECCIONES DEL DIRECTORIO (SEO) */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-2xl font-black uppercase sm:text-3xl">
              Explora el directorio por región y especialidad
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <nav aria-label="Directorio por región">
              <p className="kicker">Por región</p>
              <ul className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {REGIONS.map((r) => (
                  <li key={r} className="border-b border-foreground/10">
                    <Link
                      to={`/directorio?region=${encodeURIComponent(r)}`}
                      className="flex min-h-11 items-center justify-between text-sm font-semibold transition-colors hover:text-primary"
                    >
                      Instaladores en {r} <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Directorio por especialidad">
              <p className="kicker">Por especialidad</p>
              <ul className="mt-4">
                {SERVICES.map((s) => (
                  <li key={s.slug} className="border-b border-foreground/10">
                    <Link
                      to={`/directorio?servicio=${s.slug}`}
                      className="flex min-h-11 items-center justify-between text-sm font-semibold transition-colors hover:text-primary"
                    >
                      {s.label} <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
