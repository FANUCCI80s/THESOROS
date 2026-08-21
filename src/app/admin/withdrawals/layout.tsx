import { requireAdminSection } from "@/lib/auth/guards";

/**
 * RBAC example: gate /admin/withdrawals by section permission "withdrawals".
 * @see PERMISSION_EXAMPLES in src/lib/auth/rbac.ts
 */
export default async function AdminWithdrawalsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSection("withdrawals");
  return children;
}
