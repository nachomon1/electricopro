import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { PLANS, formatCLP, type PlanId } from "@contracts/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PlanCards } from "@/components/PlanCards";
import { Reveal } from "@/components/Reveal";

export default function Planes() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("yearly");
  const [confirm, setConfirm] = useState<PlanId | null>(null);
  const [done, setDone] = useState(false);

  const { data: miPerfil } = trpc.pro.mine.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();
  const activate = trpc.pro.activatePlan.useMutation({
    onSuccess: async () => {
      await utils.pro.mine.invalidate();
      setConfirm(null);
      setDone(true);
    },
  });
  const createPayment = trpc.flow.createSubscriptionPayment.useMutation({
    onSuccess: (res) => {
      window.location.href = res.redirectUrl;
    },
  });

  useEffect(() => {
    document.title = "Planes y precios para profesionales eléctricos — EléctricoPro Chile";
  }, []);

  const elegir = (plan: PlanId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!miPerfil) {
      navigate("/publicar");
      return;
    }
    setConfirm(plan);
  };

  const planSel = confirm ? PLANS[confirm] : null;
  const precioSel = planSel ? (cycle === "monthly" ? planSel.monthly : planSel.yearly) : 0;

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <section className="border-b-2 border-foreground py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="kicker">Planes y precios</p>
                <h1 className="mt-3 font-display text-3xl font-black uppercase sm:text-5xl">
                  Un cliente nuevo paga tu plan por años
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Una sola certificación TE1 se cobra entre $70.000 y $300.000.
                  El plan Pro cuesta {formatCLP(PLANS.pro.monthly)} al mes.
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

          <Reveal delay={120} className="mt-12">
            <PlanCards
              cycle={cycle}
              onSelect={elegir}
              currentPlan={miPerfil?.plan ?? null}
              selecting={activate.isPending || createPayment.isPending || authLoading}
            />
          </Reveal>

          <Reveal delay={200}>
            <div className="card-brutal mt-12 grid gap-6 p-6 sm:p-8 md:grid-cols-3">
              {[
                { t: "Sin permanencia", d: "Cancela cuando quieras. Tu ficha vuelve al plan Gratis y sigue visible." },
                { t: "Sin comisiones", d: "Los clientes te contactan directo. No cobramos nada por tus trabajos." },
                { t: "Publicación inmediata", d: "Crea tu ficha, elige plan y aparece en el directorio al instante." },
              ].map((x) => (
                <div key={x.t}>
                  <p className="font-display text-lg font-bold uppercase">→ {x.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Preguntas frecuentes (SEO) */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-black uppercase">Preguntas frecuentes</h2>
          </Reveal>
          <div className="mt-8 space-y-0 border-2 border-foreground">
            {[
              {
                q: "¿Cómo me encuentran los clientes?",
                a: "Tu ficha aparece en el directorio filtrable por región, comuna, servicio y clase de licencia SEC. Los planes pagos aparecen primero en los resultados y en la portada.",
              },
              {
                q: "¿Necesito licencia SEC para publicar?",
                a: "Recomendamos fuertemente publicar solo si tienes licencia SEC vigente — es lo que los clientes buscan y lo que la ley exige para ejecutar instalaciones. Puedes indicar tu clase (A a E) en tu ficha.",
              },
              {
                q: "¿Puedo cambiar de plan después?",
                a: "Sí. Puedes subir o bajar de plan en cualquier momento desde tu panel. Al pagar el plan anual ahorras casi dos meses respecto del mensual.",
              },
              {
                q: "¿Cómo recibo las solicitudes de contacto?",
                a: "Todas las solicitudes llegan a tu panel. Con el plan Pro o Empresa, además, tu teléfono y WhatsApp quedan visibles en tu ficha para contacto inmediato.",
              },
            ].map((f, i) => (
              <details key={f.q} className={`group bg-card ${i > 0 ? "border-t-2 border-foreground" : ""}`}>
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-base font-bold uppercase transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="text-xl transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Modal confirmación */}
      {confirm && planSel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar plan"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirm(null); }}
          onKeyDown={(e) => { if (e.key === "Escape") setConfirm(null); }}
        >
          <div className="card-brutal w-full max-w-md bg-card p-6 sm:p-8">
            <p className="kicker">Confirmar suscripción</p>
            <h3 className="mt-2 font-display text-2xl font-black uppercase">
              Plan {planSel.name} — {cycle === "monthly" ? "mensual" : "anual"}
            </h3>
            <p className="mt-4 font-display text-4xl font-black">
              {precioSel === 0 ? "$0" : formatCLP(precioSel)}
              <span className="text-base font-medium text-muted-foreground">
                {precioSel === 0 ? "" : cycle === "monthly" ? " /mes" : " /año"}
              </span>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {precioSel === 0
                ? "Tu ficha quedará en el plan Gratis al instante."
                : "Serás redirigido al pago seguro de Flow (tarjetas, transferencia, Webpay). Tu plan se activa automáticamente al confirmarse el pago."}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  if (confirm === "free") {
                    activate.mutate({ plan: "free" });
                  } else {
                    createPayment.mutate({ plan: confirm, cycle });
                  }
                }}
                disabled={activate.isPending || createPayment.isPending}
                className="btn-brutal flex-1 disabled:opacity-50"
              >
                {activate.isPending || createPayment.isPending
                  ? "Procesando…"
                  : precioSel === 0
                    ? "Confirmar"
                    : "Ir a pagar"}
              </button>
              <button onClick={() => setConfirm(null)} className="btn-brutal-inverse">
                Cancelar
              </button>
            </div>
            {(activate.isError || createPayment.isError) && (
              <p className="mt-3 text-sm font-semibold text-destructive" role="alert">
                {activate.error?.message || createPayment.error?.message || "No se pudo procesar. Inténtalo de nuevo."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal éxito */}
      {done && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Plan activado"
          onClick={(e) => { if (e.target === e.currentTarget) { setDone(false); navigate("/panel"); } }}
          onKeyDown={(e) => { if (e.key === "Escape") { setDone(false); navigate("/panel"); } }}
        >
          <div className="card-brutal w-full max-w-md bg-secondary p-6 text-center sm:p-8">
            <svg viewBox="0 0 32 32" className="mx-auto h-12 w-12" aria-hidden="true">
              <path d="M18 4 L8 18 h6 L12 28 L24 12 h-7 z" fill="#161616" />
            </svg>
            <h3 className="mt-4 font-display text-2xl font-black uppercase">¡Plan activado!</h3>
            <p className="mt-2 text-sm">Tu ficha ya está visible con tu nuevo plan.</p>
            <button onClick={() => { setDone(false); navigate("/panel"); }} className="btn-brutal mt-6 w-full">
              Ir a mi panel
            </button>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
