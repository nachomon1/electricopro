import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { PLANS, SERVICE_LABELS, formatCLP } from "@contracts/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProfileForm, type ProfileFormData } from "@/components/ProfileForm";

type Tab = "resumen" | "ficha" | "solicitudes";

export default function Panel() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>("resumen");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const nuevo = params.get("nuevo") === "1";

  const utils = trpc.useUtils();
  const { data: perfil, isLoading } = trpc.pro.mine.useQuery(undefined, { enabled: !!user });
  const { data: leadsData } = trpc.pro.leads.useQuery(undefined, { enabled: !!user && !!perfil });

  const upsert = trpc.pro.upsert.useMutation({
    onSuccess: async () => {
      await utils.pro.mine.invalidate();
      setSaved(true);
      setTab("resumen");
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => setError(err.message || "No se pudo guardar."),
  });
  const setStatus = trpc.pro.setStatus.useMutation({
    onSuccess: () => utils.pro.mine.invalidate(),
  });

  useEffect(() => {
    document.title = "Mi panel — EléctricoPro Chile";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!isLoading && user && !perfil) navigate("/publicar");
  }, [isLoading, user, perfil, navigate]);

  if (authLoading || isLoading || !perfil) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-16"><div className="card-brutal h-96 animate-pulse bg-muted" /></div>
      </div>
    );
  }

  const plan = PLANS[perfil.plan];
  const publicado = perfil.status === "published";
  const solicitudes = leadsData?.leads ?? [];

  const submit = (data: ProfileFormData) => {
    setError("");
    upsert.mutate({
      ...data,
      secClass: (data.secClass || undefined) as never,
      region: data.region as never,
      email: data.email || "",
      phone: data.phone || undefined,
      whatsapp: data.whatsapp || undefined,
      website: data.website || undefined,
      bio: data.bio || undefined,
    });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "resumen", label: "Resumen" },
    { id: "ficha", label: "Mi ficha" },
    { id: "solicitudes", label: `Solicitudes (${solicitudes.length})` },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <section className="border-b-2 border-foreground bg-muted py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Mi panel</p>
              <h1 className="mt-2 font-display text-3xl font-black uppercase sm:text-4xl">
                {perfil.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Plan <strong className="text-foreground">{plan.name}</strong>
                {perfil.planExpiresAt && (
                  <> · vigente hasta {new Date(perfil.planExpiresAt).toLocaleDateString("es-CL")}</>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              {publicado && (
                <Link to={`/profesional/${perfil.slug}`} className="btn-brutal-inverse !py-2">
                  Ver mi ficha pública
                </Link>
              )}
              <button
                onClick={() => setStatus.mutate({ status: publicado ? "draft" : "published" })}
                disabled={setStatus.isPending}
                className={`min-h-11 border-2 px-4 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 ${
                  publicado
                    ? "border-foreground bg-transparent hover:bg-muted"
                    : "border-foreground bg-secondary hover:bg-foreground hover:text-background"
                }`}
              >
                {publicado ? "Pausar publicación" : "Publicar ficha"}
              </button>
            </div>
          </div>

          {nuevo && (
            <div className="mt-6 border-2 border-foreground bg-secondary p-4" role="status">
              <p className="font-display text-lg font-bold uppercase">¡Tu ficha está publicada!</p>
              <p className="text-sm">Ya apareces en el directorio con el plan Gratis. Sube a Pro para mostrar tu teléfono y WhatsApp.</p>
              <Link to="/planes" className="btn-brutal mt-3 !py-2">Ver planes</Link>
            </div>
          )}
          {saved && (
            <div className="mt-6 border-2 border-foreground bg-secondary p-4" role="status">
              <p className="font-bold">Cambios guardados.</p>
            </div>
          )}

          <div className="mt-8 flex gap-0 border-2 border-foreground" role="tablist" aria-label="Secciones del panel">
            {tabs.map((t, i) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`min-h-12 flex-1 px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer sm:text-sm ${
                  i > 0 ? "border-l-2 border-foreground" : ""
                } ${tab === t.id ? "bg-foreground text-background" : "bg-card hover:bg-secondary"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {tab === "resumen" && (
            <div className="space-y-6">
              <div className="grid gap-px border-2 border-foreground bg-foreground sm:grid-cols-3">
                <div className="bg-card p-6">
                  <p className="kicker">Plan actual</p>
                  <p className="mt-2 font-display text-3xl font-black uppercase">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {perfil.plan === "free"
                      ? "Gratis para siempre"
                      : `${formatCLP(plan[perfil.planCycle ?? "monthly"])} /${perfil.planCycle === "yearly" ? "año" : "mes"}`}
                  </p>
                </div>
                <div className="bg-card p-6">
                  <p className="kicker">Visitas a tu ficha</p>
                  <p className="mt-2 font-display text-3xl font-black">{perfil.views}</p>
                  <p className="text-sm text-muted-foreground">acumuladas</p>
                </div>
                <div className="bg-card p-6">
                  <p className="kicker">Solicitudes</p>
                  <p className="mt-2 font-display text-3xl font-black">{solicitudes.length}</p>
                  <p className="text-sm text-muted-foreground">recibidas</p>
                </div>
              </div>

              {perfil.plan === "free" && (
                <div className="card-brutal bg-secondary p-6 sm:p-8">
                  <h2 className="font-display text-2xl font-black uppercase">
                    Tus clientes no pueden verte el teléfono todavía
                  </h2>
                  <p className="mt-2 max-w-xl text-sm">
                    Con el plan Pro ({formatCLP(PLANS.pro.monthly)}/mes) tu teléfono y WhatsApp quedan
                    visibles en tu ficha y apareces primero en las búsquedas.
                  </p>
                  <Link to="/planes" className="btn-brutal mt-5">Subir a Pro</Link>
                </div>
              )}

              <div className="card-brutal p-6">
                <h2 className="font-display text-lg font-bold uppercase">Estado de tu ficha</h2>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-muted-foreground">Estado</dt><dd className="font-semibold">{publicado ? "Publicada" : "Pausada"}</dd></div>
                  <div><dt className="text-muted-foreground">Ubicación</dt><dd className="font-semibold">{perfil.comuna}, {perfil.region}</dd></div>
                  <div><dt className="text-muted-foreground">Licencia SEC</dt><dd className="font-semibold">{perfil.secClass ? `Clase ${perfil.secClass}` : "Sin indicar"}</dd></div>
                  <div><dt className="text-muted-foreground">Servicios</dt><dd className="font-semibold">{perfil.services.length} publicados</dd></div>
                </dl>
              </div>
            </div>
          )}

          {tab === "ficha" && (
            <div className="card-brutal p-6 sm:p-8">
              <ProfileForm
                initial={{
                  name: perfil.name,
                  headline: perfil.headline,
                  bio: perfil.bio ?? "",
                  secClass: perfil.secClass ?? "",
                  region: perfil.region,
                  comuna: perfil.comuna,
                  services: perfil.services,
                  phone: perfil.phone ?? "",
                  whatsapp: perfil.whatsapp ?? "",
                  email: perfil.email ?? "",
                  website: perfil.website ?? "",
                  photoUrl: perfil.photoUrl,
                  yearsExp: perfil.yearsExp ?? undefined,
                }}
                currentPlan={perfil.plan}
                submitting={upsert.isPending}
                error={error}
                onSubmit={submit}
                submitLabel="Guardar cambios"
              />
            </div>
          )}

          {tab === "solicitudes" && (
            <div className="space-y-4">
              {solicitudes.length === 0 ? (
                <div className="card-brutal p-10 text-center">
                  <p className="font-display text-xl font-bold uppercase">Aún no tienes solicitudes</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cuando un cliente te contacte desde tu ficha, aparecerá aquí.
                    {perfil.plan === "free" && " Sube a Pro para que te contacten también por WhatsApp."}
                  </p>
                </div>
              ) : (
                solicitudes.map((lead) => (
                  <article key={lead.id} className="card-brutal p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-lg font-bold">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[
                        lead.comuna,
                        lead.service ? SERVICE_LABELS[lead.service] ?? lead.service : null,
                        lead.phone,
                        lead.email,
                      ].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-3 border-l-4 border-secondary pl-3 text-sm">{lead.message}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {lead.phone && (
                        <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="btn-brutal !px-4 !py-2 text-xs">Llamar</a>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="btn-brutal-inverse !px-4 !py-2 text-xs">Escribir correo</a>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
