import { useRef, useState } from "react";
import { trpc } from "@/providers/trpc";
import { REGIONS, SEC_CLASSES, SERVICES, PLANS, type PlanId } from "@contracts/constants";

export type ProfileFormData = {
  name: string;
  headline: string;
  bio: string;
  secClass: string;
  region: string;
  comuna: string;
  services: string[];
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  photoUrl: string | null;
  yearsExp?: number;
};

export const EMPTY_PROFILE: ProfileFormData = {
  name: "",
  headline: "",
  bio: "",
  secClass: "",
  region: "",
  comuna: "",
  services: [],
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  photoUrl: null,
};

export function ProfileForm({
  initial,
  currentPlan,
  submitting,
  error,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<ProfileFormData>;
  currentPlan: PlanId;
  submitting: boolean;
  error?: string;
  onSubmit: (data: ProfileFormData) => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<ProfileFormData>({ ...EMPTY_PROFILE, ...initial });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadPhoto = trpc.pro.uploadPhoto.useMutation();
  const maxServices = PLANS[currentPlan].maxServices;

  const set = (key: keyof ProfileFormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleService = (slug: string) =>
    setForm((f) => {
      const has = f.services.includes(slug);
      if (has) return { ...f, services: f.services.filter((s) => s !== slug) };
      if (f.services.length >= maxServices) return f;
      return { ...f, services: [...f.services, slug] };
    });

  const valid =
    form.name.trim().length >= 3 &&
    form.headline.trim().length >= 3 &&
    form.region &&
    form.comuna.trim().length >= 2 &&
    form.services.length >= 1;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({
          ...form,
          yearsExp: form.yearsExp ? Number(form.yearsExp) : undefined,
        });
      }}
      className="space-y-6"
    >
      {/* Foto de perfil */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploadingPhoto}
          className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-foreground bg-secondary font-display text-3xl font-black uppercase transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:opacity-50"
          aria-label={form.photoUrl ? "Cambiar foto de perfil" : "Subir foto de perfil"}
        >
          {uploadingPhoto ? (
            <span className="text-xs font-bold normal-case">Subiendo…</span>
          ) : form.photoUrl ? (
            <img src={form.photoUrl} alt="Tu foto de perfil" className="h-full w-full object-cover" />
          ) : (
            form.name.trim().charAt(0) || "?"
          )}
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">Foto de perfil o logo</p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG o WebP · máx. 5 MB. Las fichas con foto reciben más contactos.
          </p>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploadingPhoto}
            className="mt-2 min-h-11 border-2 border-foreground bg-transparent px-4 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-secondary cursor-pointer disabled:opacity-50"
          >
            {form.photoUrl ? "Cambiar foto" : "Subir foto"}
          </button>
          {photoError && <p className="mt-2 text-xs font-semibold text-destructive" role="alert">{photoError}</p>}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
              setPhotoError("La imagen supera 5 MB. Elige una más liviana.");
              return;
            }
            setPhotoError("");
            setUploadingPhoto(true);
            try {
              const buf = await file.arrayBuffer();
              let bin = "";
              const bytes = new Uint8Array(buf);
              for (let i = 0; i < bytes.length; i += 8192)
                bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
              const res = await uploadPhoto.mutateAsync({
                contentBase64: btoa(bin),
                contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
              });
              setForm((f) => ({ ...f, photoUrl: res.photoUrl }));
            } catch {
              setPhotoError("No se pudo subir la foto. Inténtalo de nuevo.");
            } finally {
              setUploadingPhoto(false);
            }
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider">Nombre o empresa *</span>
          <input
            required
            minLength={3}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ej: Juan Pérez / ElectroSur SpA"
            className="mt-1 min-h-12 w-full border-2 border-foreground bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider">Oficio / titular *</span>
          <input
            required
            minLength={3}
            value={form.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="Ej: Instalador Eléctrico SEC Clase D"
            className="mt-1 min-h-12 w-full border-2 border-foreground bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider">Descripción de tus servicios</span>
        <textarea
          rows={4}
          maxLength={1200}
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Cuenta tu experiencia, qué trabajos haces y por qué elegirte…"
          className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider">Región *</span>
          <select
            required
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
            className="mt-1 min-h-12 w-full border-2 border-foreground bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Selecciona…</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider">Comuna *</span>
          <input
            required
            minLength={2}
            value={form.comuna}
            onChange={(e) => set("comuna", e.target.value)}
            placeholder="Ej: Providencia"
            className="mt-1 min-h-12 w-full border-2 border-foreground bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider">Licencia SEC</span>
          <select
            value={form.secClass}
            onChange={(e) => set("secClass", e.target.value)}
            className="mt-1 min-h-12 w-full border-2 border-foreground bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sin indicar</option>
            {SEC_CLASSES.map((c) => (
              <option key={c} value={c}>Clase {c}</option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="text-xs font-bold uppercase tracking-wider">
          Servicios que ofreces * ({form.services.length}/{maxServices} en plan {PLANS[currentPlan].name})
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SERVICES.map((s) => {
            const active = form.services.includes(s.slug);
            const full = !active && form.services.length >= maxServices;
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => toggleService(s.slug)}
                disabled={full}
                className={`min-h-11 border-2 border-foreground px-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                  active ? "bg-foreground text-background" : "bg-transparent hover:bg-secondary"
                }`}
                aria-pressed={active}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {currentPlan === "free" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Con el plan Pro puedes elegir hasta 10 servicios.
          </p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider">Teléfono</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+56 9 …"
            className="mt-1 min-h-12 w-full border-2 border-foreground bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider">WhatsApp (solo número)</span>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            placeholder="56912345678"
            className="mt-1 min-h-12 w-full border-2 border-foreground bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider">Años de experiencia</span>
          <input
            type="number"
            min={0}
            max={70}
            value={form.yearsExp ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                yearsExp: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className="mt-1 min-h-12 w-full border-2 border-foreground bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider">Correo de contacto</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="tu@correo.cl"
            className="mt-1 min-h-12 w-full border-2 border-foreground bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider">Sitio web</span>
          <input
            type="url"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="https://…"
            className="mt-1 min-h-12 w-full border-2 border-foreground bg-transparent px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      {error && (
        <p className="border-2 border-destructive bg-destructive/10 p-3 text-sm font-semibold text-destructive" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={!valid || submitting} className="btn-brutal min-h-14 w-full text-base disabled:cursor-not-allowed disabled:opacity-50">
        {submitting ? "Guardando…" : submitLabel}
      </button>
      {!valid && (
        <p className="text-center text-xs text-muted-foreground">
          Completa los campos con * y elige al menos un servicio.
        </p>
      )}
    </form>
  );
}
