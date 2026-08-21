import { requireApprovedKyc } from "@/lib/auth/guards";

/** Withdrawals require at least submitted KYC (not NOT_SUBMITTED / DECLINED). */
export default async function WithdrawalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireApprovedKyc({ strict: true });
  return children;
}
