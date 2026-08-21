import { requireAdminSection } from "@/lib/auth/guards";

/**
 * RBAC example: gate /admin/users by section permission "users".
 * @see PERMISSION_EXAMPLES in src/lib/auth/rbac.ts
 */
export default async function AdminUsersSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSection("users");
  return children;
}
