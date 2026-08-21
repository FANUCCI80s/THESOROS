import { requireApprovedKyc } from "@/lib/auth/guards";

/**
 * Deposit requires KYC submitted/approved path.
 * PENDING is allowed (strict: false) so users can still fund while review runs;
 * set strict: true to block until APPROVED.
 */
export default async function DepositLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireApprovedKyc({ strict: false });
  return children;
}
