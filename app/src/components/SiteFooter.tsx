import { Link } from "react-router";
import { SERVICES } from "@contracts/constants";
import { Logo } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-foreground bg-foreground text-background">
      {/* Wordmark gigante */}
      <div className="overflow-hidden border-b border-background/20 py-6" aria-hidden="true">
        <p className="whitespace-nowrap text-center font-display text-[11vw] font-black uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_#fafafa]">
          EléctricoPro
        </p>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-4 text-sm leading-relaxed text-background/70">
            Directorio de instaladores eléctricos, técnicos e ingenieros
            autorizados por la SEC en todo Chile.
          </p>
        </div>
        <nav aria-label="Servicios">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-background/50">Servicios</p>
          <ul className="mt-3 space-y-2">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link to={`/directorio?servicio=${s.slug}`} className="text-sm text-background/80 transition-colors hover:text-secondary">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Regiones">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-background/50">Regiones</p>
          <ul className="mt-3 space-y-2">
            {["Metropolitana de Santiago", "Valparaíso", "Biobío", "Antofagasta", "La Araucanía", "Los Lagos"].map((r) => (
              <li key={r}>
                <Link to={`/directorio?region=${encodeURIComponent(r)}`} className="text-sm text-background/80 transition-colors hover:text-secondary">
                  {r}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Plataforma">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-background/50">Plataforma</p>
          <ul className="mt-3 space-y-2">
            <li><Link to="/directorio" className="text-sm text-background/80 transition-colors hover:text-secondary">Directorio</Link></li>
            <li><Link to="/planes" className="text-sm text-background/80 transition-colors hover:text-secondary">Planes y precios</Link></li>
            <li><Link to="/publicar" className="text-sm text-background/80 transition-colors hover:text-secondary">Publica tus servicios</Link></li>
            <li><Link to="/login" className="text-sm text-background/80 transition-colors hover:text-secondary">Entrar</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-background/20">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-background/50 sm:px-6">
          © {new Date().getFullYear()} EléctricoPro Chile. Directorio independiente — verifica siempre la licencia del instalador en el registro oficial de la SEC (sec.cl).
        </p>
      </div>
    </footer>
  );
}
