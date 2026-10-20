import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { REGIONS, SEC_CLASSES, SERVICES, SERVICE_LABELS } from "@contracts/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProCard } from "@/components/ProCard";
import { Reveal } from "@/components/Reveal";

export default function Directorio() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const region = params.get("region") ?? "";
  const service = params.get("servicio") ?? "";
  const secClass = params.get("clase") ?? "";

  useEffect(() => {
    const serviceLabel = service ? SERVICE_LABELS[service] : null;
    const parts = [serviceLabel, "Instaladores eléctricos autorizados SEC"];
    if (region) parts.push(`en ${region}`);
    if (secClass) parts.push(`Clase ${secClass}`);
    document.title = `${parts.filter(Boolean).join(" ")} | EléctricoPro Chile`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      const desc = [
        serviceLabel ? `${serviceLabel} por instaladores autorizados SEC` : "Directorio de instaladores eléctricos autorizados SEC",
        region ? ` en ${region}, Chile.` : " en las 16 regiones de Chile.",
        " Compara perfiles, certificación TE1 y contacta directo. ¿Eres instalador? Publica gratis.",
      ].join("");
      meta.setAttribute("content", desc);
    }
  }, [region, service, secClass]);

  const filters = {
    q: q.trim() || undefined,
    region: region || undefined,
    service: service || undefined,
    secClass: secClass || undefined,
  };
  const { data: results, isLoading } = trpc.directory.search.useQuery(filters);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const limpiar = () => {
    setQ("");
    setParams({}, { replace: true });
  };

  const hayFiltros = q.trim() || region || service || secClass;

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <section className="border-b-2 border-foreground bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <p className="kicker">Directorio</p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase sm:text-5xl">
            {service && SERVICE_LABELS[service]
              ? `${SERVICE_LABELS[service]}${region ? ` en ${region}` : ""}`
              : `Instaladores eléctricos autorizados${region ? ` en ${region}` : ""}`}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {service && SERVICE_LABELS[service]
              ? `Profesionales y empresas que ofrecen ${SERVICE_LABELS[service].toLowerCase()}${region ? ` en ${region}` : " en todo Chile"}, autorizados por la SEC.`
              : `Electricistas, técnicos e ingenieros autorizados por la SEC${region ? ` en ${region}` : " en las 16 regiones de Chile"}. Certificación TE1, instalaciones y emergencias.`}
          </p>

          {/* Buscador */}
          <div className="mt-8 flex flex-col gap-0 border-2 border-foreground bg-card sm:flex-row">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, oficio o comuna…"
              className="min-h-12 flex-1 bg-transparent px-4 focus:outline-none"
              aria-label="Buscar"
            />
            <select
              value={region}
              onChange={(e) => setParam("region", e.target.value)}
              className="min-h-12 border-t-2 border-foreground bg-transparent px-3 sm:border-t-0 sm:border-l-2"
              aria-label="Filtrar por región"
            >
              <option value="">Todas las regiones</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              value={secClass}
              onChange={(e) => setParam("clase", e.target.value)}
              className="min-h-12 border-t-2 border-foreground bg-transparent px-3 sm:border-t-0 sm:border-l-2"
              aria-label="Filtrar por clase SEC"
            >
              <option value="">Toda clase SEC</option>
              {SEC_CLASSES.map((c) => (
                <option key={c} value={c}>Clase {c}</option>
              ))}
            </select>
          </div>

          {/* Chips de servicios */}
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por servicio">
            <button
              onClick={() => setParam("servicio", "")}
              className={`min-h-11 border-2 border-foreground px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                !service ? "bg-foreground text-background" : "bg-transparent hover:bg-secondary"
              }`}
              aria-pressed={!service}
            >
              Todos
            </button>
            {SERVICES.map((s) => (
              <button
                key={s.slug}
                onClick={() => setParam("servicio", service === s.slug ? "" : s.slug)}
                className={`min-h-11 border-2 border-foreground px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  service === s.slug ? "bg-foreground text-background" : "bg-transparent hover:bg-secondary"
                }`}
                aria-pressed={service === s.slug}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground" role="status">
              {isLoading ? "Buscando…" : `${results?.length ?? 0} profesional${results?.length === 1 ? "" : "es"} encontrado${results?.length === 1 ? "" : "s"}`}
            </p>
            {hayFiltros ? (
              <button onClick={limpiar} className="text-sm font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer">
                Limpiar filtros
              </button>
            ) : null}
          </div>

          {isLoading ? (
            <div className="mt-8 space-y-4" aria-label="Cargando resultados">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card-brutal h-32 animate-pulse bg-muted" />
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <div className="mt-6 space-y-4">
              {results.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 5) * 50}>
                  <ProCard pro={p} index={i} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="card-brutal mt-8 p-10 text-center">
              <p className="font-display text-2xl font-bold uppercase">
                {hayFiltros ? "Sin resultados" : "Estamos abriendo esta vitrina"}
              </p>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                {hayFiltros
                  ? "No encontramos profesionales con esos filtros. Prueba ampliando la región o quitando algún filtro."
                  : "Aún no hay profesionales publicados aquí. ¿Eres instalador eléctrico? Sé el primero de tu región y llévate todos los clientes."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {hayFiltros ? (
                  <button onClick={limpiar} className="btn-brutal">
                    Ver todo el directorio
                  </button>
                ) : (
                  <Link to="/publicar" className="btn-brutal">
                    Publicar mi ficha gratis
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
