import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not authenticated or not an ADMIN, redirect them to the home or their client dashboard
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <AdminSidebar adminName={session.user.name || "Admin"} logoutAction={logout} />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 pt-20 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
