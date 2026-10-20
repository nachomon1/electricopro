import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProfileForm, type ProfileFormData } from "@/components/ProfileForm";
import { Reveal } from "@/components/Reveal";

export default function Publicar() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const { data: miPerfil, isLoading: perfilLoading } = trpc.pro.mine.useQuery(undefined, {
    enabled: !!user,
  });

  const upsert = trpc.pro.upsert.useMutation({
    onSuccess: async () => {
      await setStatus.mutateAsync({ status: "published" });
      navigate("/panel?nuevo=1");
    },
    onError: (err) => setError(err.message || "No se pudo guardar. Revisa los datos."),
  });
  const setStatus = trpc.pro.setStatus.useMutation();

  useEffect(() => {
    document.title = "Publica tus servicios eléctricos — EléctricoPro Chile";
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (miPerfil && miPerfil.status === "published") navigate("/panel");
  }, [miPerfil, navigate]);

  if (authLoading || (user && perfilLoading)) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16"><div className="card-brutal h-96 animate-pulse bg-muted" /></div>
      </div>
    );
  }

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

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <section className="border-b-2 border-foreground bg-muted py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <p className="kicker">Publicar gratis</p>
            <h1 className="mt-3 font-display text-3xl font-black uppercase sm:text-5xl">
              Crea tu ficha profesional
            </h1>
            <p className="mt-4 text-muted-foreground">
              Completa tu ficha en 3 minutos. Quedará publicada en el plan{" "}
              <strong>Gratis</strong> y podrás subir a Pro o Empresa cuando quieras.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="card-brutal p-6 sm:p-8">
            <ProfileForm
              currentPlan="free"
              submitting={upsert.isPending || setStatus.isPending}
              error={error}
              onSubmit={submit}
              submitLabel="Publicar mi ficha gratis"
            />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes ficha? <Link to="/panel" className="font-bold text-primary hover:underline">Ir a mi panel</Link>
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
