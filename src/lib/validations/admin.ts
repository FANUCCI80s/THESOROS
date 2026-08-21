import { z } from "zod";
import {
  idSchema,
  optionalNoteSchema,
  urlOrPathSchema,
  walletAddressSchema,
} from "./common";

export const adminUserStatusSchema = z.object({
  userId: idSchema,
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED", "PENDING_VERIFICATION"]),
  note: optionalNoteSchema,
});

export const adminManualDepositConfigSchema = z.object({
  cryptocurrencyId: idSchema,
  networkId: idSchema,
  walletAddress: walletAddressSchema,
  qrCodeUrl: urlOrPathSchema.optional().nullable(),
  warningMessage: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const adminAutomaticDepositConfigSchema = z.object({
  cryptocurrencyId: idSchema,
  networkId: idSchema.optional().nullable(),
  paymentUrl: z
    .string()
    .trim()
    .url("Enter a valid payment URL")
    .max(2048),
  walletAddress: walletAddressSchema.optional().nullable(),
  qrCodeUrl: urlOrPathSchema.optional().nullable(),
  warningMessage: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const adminCryptoSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(2)
    .max(16)
    .transform((v) => v.toUpperCase()),
  name: z.string().trim().min(1).max(80),
  isActive: z.boolean().default(true),
});

export const adminNetworkSchema = z.object({
  cryptocurrencyId: idSchema,
  name: z.string().trim().min(1).max(40),
  chainId: z.string().trim().max(32).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const adminNoticeSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(5000),
  isActive: z.boolean().default(true),
});

export type AdminUserStatusInput = z.infer<typeof adminUserStatusSchema>;
export type AdminManualDepositConfigInput = z.infer<
  typeof adminManualDepositConfigSchema
>;
export type AdminAutomaticDepositConfigInput = z.infer<
  typeof adminAutomaticDepositConfigSchema
>;
export type AdminCryptoInput = z.infer<typeof adminCryptoSchema>;
export type AdminNetworkInput = z.infer<typeof adminNetworkSchema>;
export type AdminNoticeInput = z.infer<typeof adminNoticeSchema>;
