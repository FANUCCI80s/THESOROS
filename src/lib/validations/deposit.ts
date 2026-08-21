import { z } from "zod";
import {
  idSchema,
  optionalNoteSchema,
  positiveAmountSchema,
  urlOrPathSchema,
} from "./common";

export const manualDepositSchema = z.object({
  amount: positiveAmountSchema,
  cryptocurrencyId: idSchema,
  networkId: idSchema,
  proofUrl: urlOrPathSchema,
  paymentReference: z.string().trim().max(200).optional(),
});

export const automaticInitiateSchema = z.object({
  amount: positiveAmountSchema,
  cryptocurrencyId: idSchema,
  networkId: idSchema.optional().nullable(),
  configId: idSchema.optional(),
});

export const automaticProofSchema = z.object({
  depositId: idSchema,
  proofUrl: urlOrPathSchema,
  paymentReference: z.string().trim().max(200).optional(),
});

export const adminDepositActionSchema = z.object({
  adminNote: optionalNoteSchema,
});

export const depositListQuerySchema = z.object({
  status: z
    .enum(["PENDING", "APPROVED", "DECLINED", "CANCELLED"])
    .optional(),
  method: z.enum(["MANUAL", "AUTOMATIC"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export type ManualDepositInput = z.infer<typeof manualDepositSchema>;
export type AutomaticInitiateInput = z.infer<typeof automaticInitiateSchema>;
export type AutomaticProofInput = z.infer<typeof automaticProofSchema>;
export type AdminDepositActionInput = z.infer<typeof adminDepositActionSchema>;
export type DepositListQuery = z.infer<typeof depositListQuerySchema>;
