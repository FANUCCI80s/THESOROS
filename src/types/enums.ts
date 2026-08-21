/**
 * Domain enums aligned with prisma/schema.prisma.
 * Prefer importing from @prisma/client when the client is generated;
 * these mirrors keep frontend / API contracts typed without a generated client.
 */

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type UserStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "BANNED"
  | "PENDING_VERIFICATION";

export type KycStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "DECLINED";

export type KycDocumentType =
  | "PASSPORT"
  | "NATIONAL_ID"
  | "DRIVERS_LICENSE"
  | "PROOF_OF_ADDRESS"
  | "SELFIE"
  | "OTHER";

export type OtpPurpose = "LOGIN" | "PASSWORD_RESET" | "EMAIL_VERIFICATION";

export type OtpStatus = "PENDING" | "VERIFIED" | "EXPIRED" | "FAILED";

export type DepositMethod = "MANUAL" | "AUTOMATIC";

export type DepositStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "CANCELLED";

export type WithdrawalStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED";

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "INVESTMENT_PURCHASE"
  | "INVESTMENT_RETURN"
  | "INVESTMENT_MATURITY"
  | "BALANCE_ADJUSTMENT"
  | "FEE"
  | "REFUND";

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REVERSED";

export type InvestmentStatus = "ACTIVE" | "MATURED" | "CANCELLED" | "PENDING";

export type InvestmentPlanStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type NotificationType =
  | "SYSTEM"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "KYC"
  | "INVESTMENT"
  | "MESSAGE"
  | "NOTICE";

export type NotificationStatus =
  | "PENDING"
  | "UNREAD"
  | "READ"
  | "ARCHIVED";

export type NetworkStatus = "ACTIVE" | "INACTIVE";

export type AuditAction =
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_SUSPENDED"
  | "KYC_APPROVED"
  | "KYC_DECLINED"
  | "DEPOSIT_APPROVED"
  | "DEPOSIT_DECLINED"
  | "WITHDRAWAL_APPROVED"
  | "WITHDRAWAL_DECLINED"
  | "BALANCE_ADJUSTED"
  | "PLAN_CREATED"
  | "PLAN_UPDATED"
  | "CONFIG_UPDATED"
  | "LOGIN"
  | "LOGOUT"
  | "OTHER";
