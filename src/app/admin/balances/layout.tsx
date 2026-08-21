import { requireAdminSection } from "@/lib/auth/guards";

/**
 * RBAC example: gate /admin/balances by section permission "balances".
 * @see PERMISSION_EXAMPLES in src/lib/auth/rbac.ts
 */
export default async function AdminBalancesSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSection("balances");
  return children;
}
