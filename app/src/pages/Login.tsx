import { useEffect } from "react";
import { Link } from "react-router";
import { SiteHeader } from "@/components/SiteHeader";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  useEffect(() => {
    document.title = "Entrar — EléctricoPro Chile";
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:px-6">
        <div className="card-brutal w-full p-8 text-center">
          <svg viewBox="0 0 32 32" className="mx-auto h-12 w-12" aria-hidden="true">
            <rect width="32" height="32" fill="#161616" />
            <path d="M18 4 L8 18 h6 L12 28 L24 12 h-7 z" fill="#ffe306" />
          </svg>
          <h1 className="mt-6 font-display text-2xl font-black uppercase">
            Entra a tu cuenta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Para publicar tus servicios o administrar tu ficha necesitas una cuenta.
          </p>
          <button
            className="btn-brutal mt-8 min-h-14 w-full text-base"
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
          >
            Entrar con Kimi
          </button>
        </div>
        <Link to="/" className="mt-6 text-sm font-bold uppercase tracking-wider text-primary hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
