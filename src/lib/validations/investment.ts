import { z } from "zod";
import {
  idSchema,
  nonNegativeAmountSchema,
  optionalNoteSchema,
  positiveAmountSchema,
} from "./common";

export const purchaseInvestmentSchema = z.object({
  planId: idSchema,
  amount: positiveAmountSchema,
});

const adminPlanFields = {
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional(),
  minAmount: positiveAmountSchema,
  maxAmount: nonNegativeAmountSchema.optional().nullable(),
  durationDays: z.coerce.number().int().min(1).max(3650),
  returnPercentage: z
    .union([z.string(), z.number()])
    .transform((v) => String(v).trim())
    .refine((v) => /^\d+(\.\d{1,4})?$/.test(v), {
      message: "Enter a valid percentage (up to 4 decimals)",
    })
    .refine((v) => parseFloat(v) >= 0 && parseFloat(v) <= 1000, {
      message: "Return percentage out of range",
    }),
  assetsIncluded: z.string().trim().max(500).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0).optional(),
};

const validateAmountRange = (
  data: {
    minAmount?: string;
    maxAmount?: string | null;
  },
  ctx: z.RefinementCtx
) => {
  if (data.maxAmount == null || data.minAmount == null) {
    return;
  }

  if (parseFloat(data.maxAmount) < parseFloat(data.minAmount)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Max amount must be greater than or equal to min amount",
      path: ["maxAmount"],
    });
  }
};

export const adminPlanCreateSchema = z
  .object(adminPlanFields)
  .superRefine(validateAmountRange);

export const adminPlanUpdateSchema = z
  .object(adminPlanFields)
  .partial()
  .extend({
    id: idSchema.optional(),
  })
  .superRefine(validateAmountRange);

export const adminBalanceAdjustSchema = z.object({
  userId: idSchema,
  amount: positiveAmountSchema,
  direction: z.enum(["credit_available", "debit_available"]),
  note: optionalNoteSchema,
});

export type PurchaseInvestmentInput = z.infer<
  typeof purchaseInvestmentSchema
>;

export type AdminPlanCreateInput = z.infer<
  typeof adminPlanCreateSchema
>;

export type AdminPlanUpdateInput = z.infer<
  typeof adminPlanUpdateSchema
>;

export type AdminBalanceAdjustInput = z.infer<
  typeof adminBalanceAdjustSchema
>;
