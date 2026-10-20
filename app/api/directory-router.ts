import { z } from "zod";
import { PLAN_IDS, REGIONS, SEC_CLASSES, SERVICES } from "@contracts/constants";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { storage } from "./lib/storage";
import {
  activatePlan,
  countPublished,
  createLead,
  findLeadsForUser,
  findMyProfessional,
  findProfessionalBySlug,
  searchProfessionals,
  setPhotoKey,
  setProfileStatus,
  upsertProfessional,
} from "./queries/professionals";

const serviceSlugs = SERVICES.map((s) => s.slug) as [string, ...string[]];

export const directoryRouter = createRouter({
  search: publicQuery
    .input(
      z.object({
        q: z.string().max(120).optional(),
        region: z.string().max(80).optional(),
        service: z.string().max(80).optional(),
        secClass: z.string().max(20).optional(),
      }),
    )
    .query(({ input }) => searchProfessionals(input)),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string().max(190) }))
    .query(({ input }) => findProfessionalBySlug(input.slug)),

  stats: publicQuery.query(async () => ({
    professionals: await countPublished(),
    regions: REGIONS.length,
    services: SERVICES.length,
  })),
});

const profileInput = z.object({
  name: z.string().min(3, "Ingresa tu nombre o el de tu empresa").max(160),
  headline: z.string().min(3, "Indica tu oficio").max(240),
  bio: z.string().max(1200).optional(),
  secClass: z.enum(SEC_CLASSES).optional(),
  region: z.enum(REGIONS),
  comuna: z.string().min(2, "Indica tu comuna").max(80),
  services: z.array(z.enum(serviceSlugs)).min(1, "Elige al menos un servicio").max(99),
  phone: z.string().max(30).optional(),
  whatsapp: z.string().max(30).optional(),
  email: z.string().email("Correo inválido").max(320).optional().or(z.literal("")),
  website: z.string().max(255).optional(),
  yearsExp: z.number().int().min(0).max(70).optional(),
});

export const proRouter = createRouter({
  mine: authedQuery.query(({ ctx }) => findMyProfessional(ctx.user.id)),

  upsert: authedQuery
    .input(profileInput)
    .mutation(({ ctx, input }) =>
      upsertProfessional(ctx.user.id, {
        ...input,
        email: input.email || null,
      } as never),
    ),

  setStatus: authedQuery
    .input(z.object({ status: z.enum(["draft", "published"]) }))
    .mutation(({ ctx, input }) => setProfileStatus(ctx.user.id, input.status)),

  activatePlan: authedQuery
    .input(
      z.object({
        plan: z.enum(PLAN_IDS),
        cycle: z.enum(["monthly", "yearly"]).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      activatePlan(ctx.user.id, input.plan, input.cycle ?? null),
    ),

  leads: authedQuery.query(({ ctx }) => findLeadsForUser(ctx.user.id)),

  uploadPhoto: authedQuery
    .input(
      z.object({
        contentBase64: z.string().max(8_500_000), // ~6MB en base64
        contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const bytes = Uint8Array.from(Buffer.from(input.contentBase64, "base64"));
      const ext = input.contentType.split("/")[1].replace("jpeg", "jpg");
      const saved = await storage.uploadFile({
        fileContent: bytes,
        fileName: `perfiles/u${ctx.user.id}/foto.${ext}`,
        contentType: input.contentType,
      });
      await setPhotoKey(ctx.user.id, saved.key);
      return { photoUrl: `/api/f/${saved.key}` };
    }),
});

export const leadsRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        professionalId: z.number().int().positive(),
        name: z.string().min(2, "Ingresa tu nombre").max(160),
        email: z.string().email("Correo inválido").max(320).optional().or(z.literal("")),
        phone: z.string().max(30).optional(),
        comuna: z.string().max(80).optional(),
        service: z.string().max(80).optional(),
        message: z.string().min(10, "Cuéntanos qué necesitas (mín. 10 caracteres)").max(1500),
      }),
    )
    .mutation(({ input }) =>
      createLead({
        ...input,
        email: input.email || undefined,
        phone: input.phone || undefined,
        comuna: input.comuna || undefined,
        service: input.service || undefined,
      }),
    ),
});
