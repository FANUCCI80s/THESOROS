import { z } from "zod";
import {
  idSchema,
  isoDateSchema,
  nameSchema,
  optionalNoteSchema,
  phoneSchema,
  urlOrPathSchema,
} from "./common";

export const kycDocumentTypeSchema = z.enum([
  "PASSPORT",
  "NATIONAL_ID",
  "DRIVERS_LICENSE",
  "PROOF_OF_ADDRESS",
  "SELFIE",
  "OTHER",
]);

export const kycSubmitSchema = z.object({
  fullName: nameSchema.max(120),
  dateOfBirth: isoDateSchema,
  nationality: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(255),
  city: z.string().trim().min(1).max(80),
  country: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(2).max(20).optional(),
  phoneNumber: phoneSchema,
});

export const kycDocumentUploadSchema = z.object({
  type: kycDocumentTypeSchema,
  fileName: z.string().trim().min(1).max(255),
  fileUrl: urlOrPathSchema,
  mimeType: z.string().trim().max(100).optional(),
  size: z.number().int().positive().max(15 * 1024 * 1024).optional(), // 15 MB
});

export const adminKycActionSchema = z.object({
  adminNote: optionalNoteSchema,
  rejectionReason: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const adminKycDeclineSchema = adminKycActionSchema.extend({
  rejectionReason: z
    .string()
    .trim()
    .min(3, "Provide a rejection reason")
    .max(500),
});

export type KycSubmitInput = z.infer<typeof kycSubmitSchema>;
export type KycDocumentUploadInput = z.infer<typeof kycDocumentUploadSchema>;
export type AdminKycActionInput = z.infer<typeof adminKycActionSchema>;
export type AdminKycDeclineInput = z.infer<typeof adminKycDeclineSchema>;
