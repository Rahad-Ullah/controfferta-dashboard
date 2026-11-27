import Header from "@/components/dashboard/layout/header";
import { SocketProvider } from "@/components/notifications/socket-provider";
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
      <SocketProvider>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset className="flex min-h-svh flex-col overflow-hidden bg-[#EDF0F3]">
          <Header />
          <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-6 2xl:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      </SocketProvider>
    </AdminRouteGuard>
  );
}
