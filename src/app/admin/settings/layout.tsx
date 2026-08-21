import { requireAdminSection } from "@/lib/auth/guards";

/**
 * RBAC example: gate /admin/settings by section permission "settings".
 * @see PERMISSION_EXAMPLES in src/lib/auth/rbac.ts
 */
export default async function AdminSettingsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSection("settings");
  return children;
}
