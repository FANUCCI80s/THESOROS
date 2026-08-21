import type { KycStatus, UserRole, UserStatus } from "./enums";
import type { DecimalString, IsoDateString } from "./api";

export type PublicAccount = {
  availableBalance: DecimalString;
  investedBalance: DecimalString;
  currency: string;
};

/**
 * Safe user payload returned by /api/auth/me and login/verify-otp.
 * Never includes passwordHash.
 */
export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  kycStatus: KycStatus;
  account: PublicAccount | null;
};

export type SessionUser = PublicUser & {
  lastLoginAt?: IsoDateString | null;
};

export type AuthSignupResponse = {
  message: string;
  user: Pick<PublicUser, "id" | "email" | "firstName" | "lastName">;
};

export type AuthLoginResponse = {
  message: string;
  challengeId: string;
  expiresAt: IsoDateString;
  /** Present only in non-production when email is not configured */
  debugCode?: string;
  user: {
    email: string;
    firstName: string;
  };
};

export type AuthVerifyOtpResponse = {
  message: string;
  user: PublicUser;
  kycStatus: KycStatus;
  redirectTo: string;
};

export type AuthMeResponse = {
  user: PublicUser;
};

export type AuthResendOtpResponse = {
  message: string;
  challengeId: string;
  expiresAt: IsoDateString;
  debugCode?: string;
};
