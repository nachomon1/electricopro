import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { SERVICE_LABELS, SERVICES } from "@contracts/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PlanBadge } from "@/components/ProCard";

export default function Profesional() {
  const { slug } = useParams<{ slug: string }>();
  const { data: pro, isLoading } = trpc.directory.getBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug },
  );
  const contactMutation = trpc.leads.create.useMutation();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", comuna: "", service: "", message: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (pro) {
      document.title = `${pro.name} — ${pro.headline} en ${pro.comuna} | EléctricoPro Chile`;
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute(
        "content",
        `${pro.name} — ${pro.headline} en ${pro.comuna}, ${pro.region}. ${pro.secClass ? `Licencia SEC Clase ${pro.secClass}. ` : ""}Contáctalo directo en EléctricoPro Chile.`,
      );
    }
  }, [pro]);

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="card-brutal h-64 animate-pulse bg-muted" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-3xl font-black uppercase">Perfil no encontrado</h1>
          <p className="mt-3 text-muted-foreground">Este profesional no existe o ya no está publicado.</p>
          <Link to="/directorio" className="btn-brutal mt-8">Volver al directorio</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const esPago = pro.plan !== "free";
  const waNumber = pro.whatsapp?.replace(/[^0-9]/g, "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    contactMutation.mutate(
      { professionalId: pro.id, ...form },
      {
        onSuccess: () => setSent(true),
        onError: (err) => setError(err.message || "No se pudo enviar. Inténtalo de nuevo."),
      },
    );
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: pro.name,
            description: pro.headline,
            areaServed: `${pro.comuna}, ${pro.region}, Chile`,
          }),
        }}
      />

      <section className="border-b-2 border-foreground bg-muted">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <Link to="/directorio" className="text-sm font-bold uppercase tracking-wider text-primary hover:underline">
            ← Volver al directorio
          </Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-foreground bg-secondary font-display text-4xl font-black uppercase">
              {pro.photoUrl ? (
                <img src={pro.photoUrl} alt={`Foto de ${pro.name}`} className="h-full w-full object-cover" />
              ) : (
                pro.name.trim().charAt(0)
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-black uppercase sm:text-4xl">{pro.name}</h1>
                <PlanBadge plan={pro.plan} />
              </div>
              <p className="mt-1 text-lg font-semibold text-primary">{pro.headline}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {pro.comuna}, {pro.region}
                {pro.secClass ? ` · Licencia SEC Clase ${pro.secClass}` : ""}
                {pro.yearsExp ? ` · ${pro.yearsExp} años de experiencia` : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:grid-cols-[3fr_2fr]">
          <div>
            {pro.bio && (
              <>
                <h2 className="font-display text-xl font-bold uppercase">Sobre mí</h2>
                <p className="mt-3 whitespace-pre-line text-muted-foreground">{pro.bio}</p>
              </>
            )}
            <h2 className="mt-8 font-display text-xl font-bold uppercase">Servicios</h2>
            <ul className="mt-3 space-y-2">
              {pro.services.map((s) => (
                <li key={s} className="flex items-center gap-2 border-l-4 border-secondary pl-3 text-sm font-medium">
                  {SERVICE_LABELS[s] ?? s}
                </li>
              ))}
            </ul>
            {pro.website && esPago && (
              <a
                href={pro.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-primary hover:underline"
              >
                Visitar sitio web ↗
              </a>
            )}
            <p className="mt-8 border-2 border-foreground bg-muted p-4 text-xs text-muted-foreground">
              Consejo: antes de contratar, verifica que la licencia del instalador esté vigente en el registro oficial de la SEC (sec.cl).
            </p>
          </div>

          {/* Contacto */}
          <aside className="card-brutal h-fit p-6">
            <h2 className="font-display text-xl font-bold uppercase">Contactar</h2>

            {esPago && (pro.phone || waNumber) ? (
              <div className="mt-4 space-y-3">
                {pro.phone && (
                  <a href={`tel:${pro.phone.replace(/\s/g, "")}`} className="btn-brutal w-full">
                    Llamar: {pro.phone}
                  </a>
                )}
                {waNumber && (
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola ${pro.name}, te encontré en EléctricoPro Chile y necesito: `)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-brutal-inverse w-full"
                  >
                    Escribir por WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-3 border-l-4 border-secondary pl-3 text-sm text-muted-foreground">
                Este profesional prefiere recibir solicitudes por formulario.
              </p>
            )}

            <div className="my-5 border-t-2 border-foreground/10" />

            {sent ? (
              <div className="border-2 border-foreground bg-secondary p-4" role="status">
                <p className="font-display text-lg font-bold uppercase">¡Solicitud enviada!</p>
                <p className="mt-1 text-sm">El profesional recibirá tu solicitud y te contactará directamente.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <p className="text-sm font-semibold">Envía una solicitud de cotización</p>
                <input required minLength={2} placeholder="Tu nombre *" className="min-h-11 w-full border-2 border-foreground bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" {...field("name")} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input type="email" placeholder="Correo" className="min-h-11 w-full border-2 border-foreground bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" {...field("email")} />
                  <input type="tel" placeholder="Teléfono" className="min-h-11 w-full border-2 border-foreground bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" {...field("phone")} />
                </div>
                <input placeholder="Tu comuna" className="min-h-11 w-full border-2 border-foreground bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" {...field("comuna")} />
                <select className="min-h-11 w-full border-2 border-foreground bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" {...field("service")} aria-label="Servicio que necesitas">
                  <option value="">¿Qué servicio necesitas?</option>
                  {SERVICES.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.label}</option>
                  ))}
                </select>
                <textarea required minLength={10} rows={4} placeholder="Describe el trabajo que necesitas *" className="w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" {...field("message")} />
                {error && <p className="text-sm font-semibold text-destructive" role="alert">{error}</p>}
                <button type="submit" disabled={contactMutation.isPending} className="btn-brutal w-full disabled:opacity-50">
                  {contactMutation.isPending ? "Enviando…" : "Enviar solicitud"}
                </button>
                <p className="text-xs text-muted-foreground">El profesional te contactará directamente. EléctricoPro no cobra comisiones.</p>
              </form>
            )}
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
