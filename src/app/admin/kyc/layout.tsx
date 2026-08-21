import { requireAdminSection } from "@/lib/auth/guards";

/**
 * RBAC example: gate /admin/kyc by section permission "kyc".
 * @see PERMISSION_EXAMPLES in src/lib/auth/rbac.ts
 */
export default async function AdminKycSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSection("kyc");
  return children;
}
