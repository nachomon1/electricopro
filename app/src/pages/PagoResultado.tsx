import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { PLANS, formatCLP } from "@contracts/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function PagoResultado() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading, refetch } = trpc.flow.paymentStatus.useQuery(
    { token },
    {
      enabled: !!token && !!user,
      refetchInterval: (query) =>
        query.state.data?.status === "pending" ? 4000 : false,
    },
  );

  useEffect(() => {
    document.title = "Resultado de tu pago — EléctricoPro Chile";
  }, []);

  const planInfo = data ? PLANS[data.plan] : null;
  const ciclo = data?.cycle === "yearly" ? "anual" : "mensual";

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 sm:px-6">
        <div className="card-brutal w-full p-8 text-center">
          {authLoading || isLoading || !data ? (
            <>
              <div className="mx-auto h-12 w-12 animate-spin border-4 border-foreground border-t-transparent" aria-label="Verificando pago" />
              <h1 className="mt-6 font-display text-2xl font-black uppercase">Verificando tu pago…</h1>
              <p className="mt-2 text-sm text-muted-foreground">Estamos confirmando con Flow. Toma unos segundos.</p>
            </>
          ) : data.status === "paid" && planInfo ? (
            <>
              <svg viewBox="0 0 32 32" className="mx-auto h-14 w-14" aria-hidden="true">
                <rect width="32" height="32" fill="#ffe306" />
                <path d="M9 17 l5 5 9-11" fill="none" stroke="#161616" strokeWidth="3" />
              </svg>
              <h1 className="mt-6 font-display text-2xl font-black uppercase">¡Pago recibido!</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Tu plan <strong className="text-foreground">{planInfo.name} {ciclo}</strong> ya está activo.
                Tu ficha aparece con prioridad en el directorio y tus datos de contacto son visibles.
              </p>
              <Link to="/panel" className="btn-brutal mt-8 w-full">Ir a mi panel</Link>
            </>
          ) : data.status === "pending" ? (
            <>
              <div className="mx-auto h-12 w-12 animate-spin border-4 border-foreground border-t-transparent" aria-label="Pago pendiente" />
              <h1 className="mt-6 font-display text-2xl font-black uppercase">Pago en proceso</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Flow aún está confirmando tu pago. Esta página se actualiza sola;
                si pagaste por transferencia puede tardar unos minutos.
              </p>
              <button onClick={() => refetch()} className="btn-brutal-inverse mt-8 w-full">
                Verificar ahora
              </button>
            </>
          ) : (
            <>
              <svg viewBox="0 0 32 32" className="mx-auto h-14 w-14" aria-hidden="true">
                <rect width="32" height="32" fill="#161616" />
                <path d="M10 10 l12 12 M22 10 l-12 12" stroke="#ffe306" strokeWidth="3" />
              </svg>
              <h1 className="mt-6 font-display text-2xl font-black uppercase">El pago no se completó</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                No se realizó ningún cobro. Puedes intentarlo de nuevo con otro
                medio de pago{planInfo ? ` — ${planInfo.name} ${ciclo}: ${formatCLP(data.cycle === "yearly" ? planInfo.yearly : planInfo.monthly)}` : ""}.
              </p>
              <Link to="/planes" className="btn-brutal mt-8 w-full">Volver a planes</Link>
            </>
          )}
        </div>
        <Link to="/" className="mt-6 text-sm font-bold uppercase tracking-wider text-primary hover:underline">
          ← Volver al inicio
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}
