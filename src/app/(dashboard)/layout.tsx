import Header from "@/components/dashboard/layout/header";
import AdminRouteGuard from "@/components/dashboard/layout/admin-route-guard";
import Sidebar from "@/components/dashboard/layout/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "../globals.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminRouteGuard>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset className="bg-[#EDF0F3] flex flex-col overflow-hidden h-screen">
          <Header />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 2xl:p-8 overflow-y-auto min-w-0 flex flex-col">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminRouteGuard>
  );
}
