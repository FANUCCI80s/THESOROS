import { requireAdminSection } from "@/lib/auth/guards";

/**
 * RBAC example: gate /admin/notices by section permission "notices".
 * @see PERMISSION_EXAMPLES in src/lib/auth/rbac.ts
 */
export default async function AdminNoticesSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSection("notices");
  return children;
}
