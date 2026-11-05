import type { Metadata } from "next";
import OptimusSidebar from "@/components/appSidebar/AppsideBar";
import Header from "@/components/header/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "../globals.css";

export const metadata: Metadata = {
  title: "CONTROFFERTA.IT - Admin Dashboard",
  description: "CONTROFFERTA.IT Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <OptimusSidebar />
      <SidebarInset className="bg-[#EDF0F3] flex flex-col overflow-hidden h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0 flex flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
