import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/require";
import { kycSubmitSchema, kycDocumentUploadSchema } from "@/lib/validations/kyc";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/api";
import { z } from "zod";

const submitWithDocsSchema = kycSubmitSchema.extend({
  documents: z.array(kycDocumentUploadSchema).min(1, "Upload at least one document").max(10),
});

/** GET /api/kyc — own KYC status */
export async function GET() {
  const auth = await requirePermission("kyc:read_own");
  if ("error" in auth) return auth.error;

  const kyc = await prisma.kyc.findUnique({
    where: { userId: auth.ctx.user.id },
    include: { documents: true },
  });

  return jsonOk({
    kyc: kyc
      ? {
          status: kyc.status,
          fullName: kyc.fullName,
          submittedAt: kyc.submittedAt?.toISOString() ?? null,
          rejectionReason: kyc.rejectionReason,
          documents: kyc.documents.map((d) => ({
            id: d.id,
            type: d.type,
            fileName: d.fileName,
            fileUrl: d.fileUrl,
            uploadedAt: d.uploadedAt.toISOString(),
          })),
        }
      : { status: "NOT_SUBMITTED" },
  });
}

/** POST /api/kyc — submit / resubmit KYC */
export async function POST(request: NextRequest) {
  const auth = await requirePermission("kyc:submit");
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const data = submitWithDocsSchema.parse(body);

    const existing = await prisma.kyc.findUnique({
      where: { userId: auth.ctx.user.id },
    });

    if (existing?.status === "PENDING") {
      return jsonError("KYC is already pending review", 400);
    }
    if (existing?.status === "APPROVED") {
      return jsonError("KYC is already approved", 400);
    }

    const kyc = await prisma.$transaction(async (tx) => {
      const row = await tx.kyc.upsert({
        where: { userId: auth.ctx.user.id },
        create: {
          userId: auth.ctx.user.id,
          status: "PENDING",
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          address: data.address,
          city: data.city,
          country: data.country,
          postalCode: data.postalCode,
          phoneNumber: data.phoneNumber,
          submittedAt: new Date(),
          rejectionReason: null,
        },
        update: {
          status: "PENDING",
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          address: data.address,
          city: data.city,
          country: data.country,
          postalCode: data.postalCode,
          phoneNumber: data.phoneNumber,
          submittedAt: new Date(),
          rejectionReason: null,
        },
      });

      await tx.kycDocument.deleteMany({ where: { kycId: row.id } });
      await tx.kycDocument.createMany({
        data: data.documents.map((d) => ({
          kycId: row.id,
          type: d.type,
          fileName: d.fileName,
          fileUrl: d.fileUrl,
          mimeType: d.mimeType,
          size: d.size,
        })),
      });

      return row;
    });

    return jsonOk({
      message: "KYC submitted and is PENDING review",
      status: kyc.status,
    });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("[kyc/submit]", err);
    return jsonError("Unable to submit KYC", 500);
  }
}
