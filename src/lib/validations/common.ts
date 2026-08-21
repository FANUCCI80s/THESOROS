import { z } from "zod";

/** CUID-like id (Prisma @default(cuid())) */
export const idSchema = z
  .string()
  .min(1, "ID is required")
  .max(64, "ID is invalid");

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(255)
  .transform((v) => v.toLowerCase());

/**
 * Positive decimal amount as string (up to 8 fractional digits).
 * Accepts number or string input from JSON bodies.
 */
export const positiveAmountSchema = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .refine((v) => v.length > 0, { message: "Amount is required" })
  .refine((v) => /^\d+(\.\d{1,8})?$/.test(v), {
    message: "Enter a valid amount (up to 8 decimal places)",
  })
  .refine((v) => parseFloat(v) > 0, {
    message: "Amount must be greater than zero",
  });

/** Optional non-negative amount (e.g. admin adjustments) */
export const nonNegativeAmountSchema = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .refine((v) => /^\d+(\.\d{1,8})?$/.test(v), {
    message: "Enter a valid amount (up to 8 decimal places)",
  })
  .refine((v) => parseFloat(v) >= 0, {
    message: "Amount cannot be negative",
  });

export const urlOrPathSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2048, "URL is too long");

export const optionalNoteSchema = z
  .string()
  .trim()
  .max(1000, "Note is too long")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(20).optional(),
  cursor: z.string().max(64).optional(),
});

export const statusFilterSchema = z.string().max(32).optional();

/** Crypto wallet address (generic — chain-specific checks can be added later) */
export const walletAddressSchema = z
  .string()
  .trim()
  .min(8, "Wallet address is too short")
  .max(128, "Wallet address is too long")
  .regex(/^[a-zA-Z0-9:]+$/, "Wallet address contains invalid characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(80, "Name is too long");

export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long")
  .regex(/^[+0-9\s()-]+$/, "Enter a valid phone number")
  .optional();

export const isoDateSchema = z
  .string()
  .trim()
  .refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Enter a valid date",
  })
  .transform((v) => new Date(v));
