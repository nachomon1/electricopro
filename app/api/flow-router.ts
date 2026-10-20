import { z } from "zod";
import { PLANS } from "@contracts/constants";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import { flowConfigured, flowCreatePayment, flowGetStatus } from "./lib/flow";
import {
  createPaymentOrder,
  findPaymentByToken,
  markPaymentPaid,
  markPaymentRejected,
  saveFlowToken,
} from "./queries/professionals";

export const flowRouter = createRouter({
  // Crea la orden en Flow y devuelve la URL de pago (checkout de Flow)
  createSubscriptionPayment: authedQuery
    .input(z.object({ plan: z.enum(["pro", "empresa"]), cycle: z.enum(["monthly", "yearly"]) }))
    .mutation(async ({ ctx, input }) => {
      if (!flowConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Los pagos en línea aún no están configurados. Escríbenos y activamos tu plan manualmente.",
        });
      }

      const planInfo = PLANS[input.plan];
      const amount = input.cycle === "monthly" ? planInfo.monthly : planInfo.yearly;
      const commerceOrder = `ep-${ctx.user.id}-${Date.now()}`;
      const origin = new URL(ctx.req.url).origin;
      const email = ctx.user.email || "";

      if (!email.includes("@")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tu cuenta no tiene un correo válido para el pago.",
        });
      }

      const paymentId = await createPaymentOrder({
        userId: ctx.user.id,
        commerceOrder,
        plan: input.plan,
        cycle: input.cycle,
        amount,
      });

      if (paymentId === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Primero crea tu ficha profesional antes de contratar un plan.",
        });
      }

      const flow = await flowCreatePayment({
        commerceOrder,
        subject: `EléctricoPro — Plan ${planInfo.name} ${input.cycle === "monthly" ? "mensual" : "anual"}`,
        amount,
        email,
        urlConfirmation: `${origin}/api/flow/confirm`,
        urlReturn: `${origin}/api/flow/return`,
      });

      await saveFlowToken(commerceOrder, flow.token, flow.flowOrder);

      return { redirectUrl: `${flow.url}?token=${flow.token}` };
    }),

  // Estado del pago para la página /pago/exito
  paymentStatus: authedQuery
    .input(z.object({ token: z.string().min(5).max(120) }))
    .query(async ({ ctx, input }) => {
      const payment = await findPaymentByToken(input.token);
      if (!payment || payment.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pago no encontrado" });
      }
      // Si sigue pendiente, consultamos Flow por si el webhook aún no llega
      if (payment.status === "pending" && flowConfigured()) {
        try {
          const flow = await flowGetStatus(input.token);
          if (flow.status === 2 && flow.commerceOrder === payment.commerceOrder) {
            await markPaymentPaid(payment.commerceOrder, String(flow.flowOrder ?? ""));
            return { status: "paid" as const, plan: payment.plan, cycle: payment.cycle };
          }
          if (flow.status === 3 || flow.status === 4) {
            await markPaymentRejected(payment.commerceOrder);
            return { status: "rejected" as const, plan: payment.plan, cycle: payment.cycle };
          }
        } catch {
          // Si Flow no responde, devolvemos el estado local
        }
      }
      return { status: payment.status, plan: payment.plan, cycle: payment.cycle };
    }),

  // Diagnóstico público mínimo (sin exponer claves)
  configured: publicQuery.query(() => ({ configured: flowConfigured() })),
});
