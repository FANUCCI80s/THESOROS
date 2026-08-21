import { requireAdminSection } from "@/lib/auth/guards";

/**
 * RBAC example: gate /admin/plans by section permission "plans".
 * @see PERMISSION_EXAMPLES in src/lib/auth/rbac.ts
 */
export default async function AdminPlansSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSection("plans");
  return children;
}
