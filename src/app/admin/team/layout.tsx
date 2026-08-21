import { requireAdminSection } from "@/lib/auth/guards";

/**
 * RBAC example: gate /admin/team by section permission "team".
 * @see PERMISSION_EXAMPLES in src/lib/auth/rbac.ts
 */
export default async function AdminTeamSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSection("team");
  return children;
}
