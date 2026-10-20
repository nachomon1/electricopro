import { Link } from "react-router";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="font-display text-8xl font-black text-primary">404</p>
        <h1 className="mt-4 font-display text-2xl font-black uppercase">Página no encontrada</h1>
        <p className="mt-2 text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-brutal">Ir al inicio</Link>
          <Link to="/directorio" className="btn-brutal-inverse">Ver directorio</Link>
        </div>
      </div>
    </div>
  );
}
