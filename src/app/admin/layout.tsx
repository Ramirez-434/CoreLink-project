import { signOut } from "@/auth";
import { verifyAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await verifyAdminSession();

  // If not authenticated or not an active ADMIN in PostgreSQL, redirect them to the home
  if (!adminUser) {
    redirect("/");
  }

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <AdminSidebar adminName={adminUser.name || "Admin"} logoutAction={logout} />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 pt-20 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
