import { Link } from "react-router";
import { SERVICE_LABELS, type PlanId } from "@contracts/constants";

export type DirectoryPro = {
  id: number;
  name: string;
  slug: string;
  headline: string;
  secClass: string | null;
  region: string;
  comuna: string;
  services: string[];
  plan: PlanId;
  yearsExp: number | null;
  views: number;
  photoUrl: string | null;
};

export function PlanBadge({ plan }: { plan: PlanId }) {
  if (plan === "empresa")
    return (
      <span className="inline-flex items-center gap-1 bg-secondary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-foreground">
        <svg viewBox="0 0 32 32" className="h-3 w-3" aria-hidden="true"><path d="M18 4 L8 18 h6 L12 28 L24 12 h-7 z" fill="currentColor" /></svg>
        Empresa destacada
      </span>
    );
  if (plan === "pro")
    return (
      <span className="inline-flex items-center bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
        Pro
      </span>
    );
  return null;
}

export function ProCard({ pro, index = 0 }: { pro: DirectoryPro; index?: number }) {
  return (
    <Link
      to={`/profesional/${pro.slug}`}
      className="card-brutal group flex flex-col gap-3 p-5 transition-all duration-200 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-start sm:gap-6 sm:p-6"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border-2 border-foreground bg-muted font-display text-xl font-black uppercase">
        {pro.photoUrl ? (
          <img src={pro.photoUrl} alt={`Foto de ${pro.name}`} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          pro.name.trim().charAt(0)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-lg font-bold uppercase leading-tight group-hover:underline">
            {pro.name}
          </h3>
          <PlanBadge plan={pro.plan} />
        </div>
        <p className="mt-0.5 text-sm font-semibold text-primary">{pro.headline}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {pro.comuna}, {pro.region}
          {pro.secClass ? ` · SEC Clase ${pro.secClass}` : ""}
          {pro.yearsExp ? ` · ${pro.yearsExp} años de experiencia` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pro.services.slice(0, 4).map((s) => (
            <span key={s} className="border border-foreground/30 px-2 py-0.5 text-xs font-medium">
              {SERVICE_LABELS[s] ?? s}
            </span>
          ))}
          {pro.services.length > 4 && (
            <span className="px-1 py-0.5 text-xs text-muted-foreground">+{pro.services.length - 4} más</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary sm:flex-col sm:items-end">
        <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
        <span className="text-xs text-muted-foreground normal-case tracking-normal">Ver perfil</span>
      </div>
      <span className="sr-only">Perfil número {index + 1}</span>
    </Link>
  );
}
