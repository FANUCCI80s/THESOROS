/**
 * THÉSOROS internal OTP delivery layer.
 *
 * Resend has been completely removed.
 *
 * The OTP itself is generated and secured by otp.ts.
 * This module will later provide THÉSOROS-controlled
 * delivery mechanisms without changing the OTP database logic.
 */

export type OtpDeliveryPurpose =
  | "LOGIN"
  | "PASSWORD_RESET"
  | "EMAIL_VERIFICATION";

export async function sendOtpEmail(params: {
  to: string;
  code: string;
  purpose: OtpDeliveryPurpose;
}): Promise<{
  ok: boolean;
}> {
  /*
   * Temporary development implementation.
   *
   * We deliberately do not send an external email yet.
   * otp.ts handles the development OTP through debugCode.
   */

  console.info(
    `[THÉSOROS OTP:DEV] delivery requested for ${params.to}`
  );

  return {
    ok: true,
  };
}

export function isMailConfigured(): boolean {
  return false;
}