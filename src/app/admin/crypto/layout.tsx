import { requireAdminSection } from "@/lib/auth/guards";

/**
 * RBAC example: gate /admin/crypto by section permission "crypto".
 * @see PERMISSION_EXAMPLES in src/lib/auth/rbac.ts
 */
export default async function AdminCryptoSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSection("crypto");
  return children;
}
