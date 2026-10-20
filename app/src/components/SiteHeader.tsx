import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-black uppercase tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center bg-foreground">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
          <path d="M18 4 L8 18 h6 L12 28 L24 12 h-7 z" fill="#ffe306" />
        </svg>
      </span>
      <span className={dark ? "text-background" : "text-foreground"}>
        Eléctrico<span className="text-primary">Pro</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/directorio", label: "Directorio" },
    { to: "/planes", label: "Planes" },
    { to: "/publicar", label: "Publica tus servicios" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex" aria-label="Principal">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-bold uppercase tracking-wider transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <button
                onClick={() => navigate("/panel")}
                className="text-sm font-bold uppercase tracking-wider transition-colors hover:text-primary cursor-pointer"
              >
                Mi panel
              </button>
              <button
                onClick={logout}
                className="text-sm font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              >
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-brutal !px-4 !py-2">
              Entrar
            </Link>
          )}
        </nav>
        <button
          className="flex h-11 w-11 items-center justify-center border-2 border-foreground md:hidden cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="border-t-2 border-foreground bg-background md:hidden" aria-label="Menú móvil">
          <div className="flex flex-col px-4 py-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="border-b border-foreground/10 py-4 text-sm font-bold uppercase tracking-wider"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/panel" onClick={() => setOpen(false)} className="border-b border-foreground/10 py-4 text-sm font-bold uppercase tracking-wider">
                  Mi panel
                </Link>
                <button onClick={() => { setOpen(false); logout(); }} className="py-4 text-left text-sm font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">
                  Salir
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="py-4 text-sm font-bold uppercase tracking-wider text-primary">
                Entrar
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
