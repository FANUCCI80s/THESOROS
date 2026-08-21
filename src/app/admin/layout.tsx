import { AdminSidebar } from "@/components/admin/sidebar";
import { requirePageAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cookie gate (middleware) + DB session + ADMIN/SUPER_ADMIN role
  await requirePageAdmin({ next: "/admin/dashboard" });

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
