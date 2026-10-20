import { PLANS, PLAN_IDS, formatCLP, type PlanId } from "@contracts/constants";

export function PlanCards({
  cycle,
  onSelect,
  currentPlan,
  selecting,
}: {
  cycle: "monthly" | "yearly";
  onSelect?: (plan: PlanId) => void;
  currentPlan?: PlanId | null;
  selecting?: boolean;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PLAN_IDS.map((id) => {
        const plan = PLANS[id];
        const price = cycle === "monthly" ? plan.monthly : plan.yearly;
        const isCurrent = currentPlan === id;
        const isEmpresa = id === "empresa";
        return (
          <div
            key={id}
            className={`card-brutal relative flex flex-col p-6 sm:p-8 ${
              isEmpresa ? "bg-foreground text-background" : ""
            }`}
          >
            {isEmpresa && (
              <span className="absolute -top-3 left-6 bg-secondary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-foreground">
                Más completo
              </span>
            )}
            <p className={`kicker ${isEmpresa ? "!text-secondary" : ""}`}>{plan.name}</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="font-display text-4xl font-black sm:text-5xl">
                {price === 0 ? "$0" : formatCLP(price)}
              </span>
              <span className={`pb-1 text-sm ${isEmpresa ? "text-background/60" : "text-muted-foreground"}`}>
                {price === 0 ? "para siempre" : cycle === "monthly" ? "/mes" : "/año"}
              </span>
            </div>
            {cycle === "yearly" && plan.yearly > 0 && (
              <p className={`mt-1 text-xs font-semibold ${isEmpresa ? "text-secondary" : "text-primary"}`}>
                Ahorras {formatCLP(plan.monthly * 12 - plan.yearly)} al año
              </p>
            )}
            <p className={`mt-3 text-sm ${isEmpresa ? "text-background/70" : "text-muted-foreground"}`}>
              {plan.tagline}
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className={isEmpresa ? "text-secondary" : "text-primary"} aria-hidden="true">→</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {onSelect && (
              <button
                onClick={() => onSelect(id)}
                disabled={selecting || isCurrent}
                className={`mt-8 min-h-12 w-full border-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                  isEmpresa
                    ? "border-secondary bg-secondary text-foreground hover:bg-background hover:border-background hover:text-foreground"
                    : "border-foreground bg-foreground text-background hover:bg-primary hover:border-primary"
                }`}
              >
                {isCurrent ? "Tu plan actual" : id === "free" ? "Empezar gratis" : `Elegir ${plan.name}`}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
