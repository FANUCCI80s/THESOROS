import { requireAdminSection } from "@/lib/auth/guards";

/**
 * RBAC example: gate /admin/deposits by section permission "deposits".
 * @see PERMISSION_EXAMPLES in src/lib/auth/rbac.ts
 */
export default async function AdminDepositsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSection("deposits");
  return children;
}
