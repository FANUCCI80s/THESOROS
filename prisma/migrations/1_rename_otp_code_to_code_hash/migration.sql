-- DropIndex
DROP INDEX "OtpChallenge_code_idx";

-- Add the new hash column temporarily as nullable
ALTER TABLE "OtpChallenge"
ADD COLUMN "codeHash" TEXT;

-- Convert all existing plaintext OTP codes to SHA-256 hashes.
-- This matches hashOtp() in src/lib/auth/otp.ts.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE "OtpChallenge"
SET "codeHash" = encode(
  digest(trim("code"), 'sha256'),
  'hex'
)
WHERE "code" IS NOT NULL;

-- codeHash is now populated for every existing challenge.
ALTER TABLE "OtpChallenge"
ALTER COLUMN "codeHash" SET NOT NULL;

-- Remove the plaintext OTP values.
ALTER TABLE "OtpChallenge"
DROP COLUMN "code";

-- Create the new index.
CREATE INDEX "OtpChallenge_codeHash_idx"
ON "OtpChallenge"("codeHash");