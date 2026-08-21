import { z } from "zod";
import {
  idSchema,
  optionalNoteSchema,
  positiveAmountSchema,
  walletAddressSchema,
} from "./common";

export const withdrawalRequestSchema = z.object({
  amount: positiveAmountSchema,
  cryptocurrencyId: idSchema,
  networkId: idSchema,
  destinationAddress: walletAddressSchema,
});

export const adminWithdrawalActionSchema = z.object({
  adminNote: optionalNoteSchema,
  txHash: z
    .string()
    .trim()
    .max(128)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const adminWithdrawalCompleteSchema = adminWithdrawalActionSchema.extend({
  txHash: z
    .string()
    .trim()
    .min(8, "Transaction hash is required")
    .max(128),
});

export const withdrawalListQuerySchema = z.object({
  status: z
    .enum([
      "PENDING",
      "APPROVED",
      "DECLINED",
      "PROCESSING",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
export type AdminWithdrawalActionInput = z.infer<
  typeof adminWithdrawalActionSchema
>;
export type AdminWithdrawalCompleteInput = z.infer<
  typeof adminWithdrawalCompleteSchema
>;
export type WithdrawalListQuery = z.infer<typeof withdrawalListQuerySchema>;
