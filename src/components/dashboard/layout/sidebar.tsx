"use client";

import {
  Sidebar as SidebarShell,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import LogoutDialog from "@/components/dashboard/layout/logout-dialog";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  Bell,
  CircleHelp,
  ClipboardList,
  FileText,
  Info,
  LayoutDashboard,
  LucideIcon,
  LogOut,
  Newspaper,
  PackageOpen,
  ShieldCheck,
  Tags,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MenuItem = {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: number | string;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Users", path: "/users", icon: UsersRound },
  { name: "Lead", path: "/leads", icon: ClipboardList },
  { name: "Categories", path: "/categories", icon: Tags },
  { name: "Blog", path: "/blogs", icon: Newspaper },
  { name: "Credit Packages", path: "/credit-packages", icon: PackageOpen },
  { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { name: "Notifications", path: "/notifications", icon: Bell, badge: 3 },
  { name: "Profile", path: "/settings", icon: UserRound },
  { name: "FAQ", path: "/faqs", icon: CircleHelp },
  { name: "Privacy Policy", path: "/disclaimer/privacy_policy", icon: ShieldCheck },
  { name: "Terms & Condition", path: "/disclaimer/terms_of_service", icon: FileText },
  { name: "General Information", path: "/disclaimer/general", icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <SidebarShell collapsible="icon" className="border-none">
      <SidebarContent
        className="flex flex-col h-screen select-none bg-[#0B1120] text-white"
        style={{ backgroundColor: "#0B1120" }}
      >
        {/* ── Header / Logo ── */}
        <SidebarHeader className="pt-6 pb-2 px-5 flex flex-col items-start">
          <Link href="/" className="flex items-center">
            {isCollapsed ? (
              <Image
                src="/icons/apple-touch-icon.png"
                alt="Controfferta"
                width={180}
                height={180}
                priority
                className="size-8 object-contain"
              />
            ) : (
              <Image
                src="/images/logo.png"
                alt="Controfferta"
                width={1290}
                height={112}
                priority
                className="h-auto w-[216px]"
              />
            )}
          </Link>

       

          {/* Top Divider */}
          <div className="w-full border-b border-slate-800/80 mt-3" />
        </SidebarHeader>

        {/* ── Navigation Menu ── */}
        <SidebarGroup className="flex-1 px-0 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {menuItems.map((item) => {
                const active = isActive(item.path);

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                      className={cn(
                        "h-11 w-full rounded-2xl transition-all duration-150 cursor-pointer flex items-center px-4 gap-3.5 text-[15px]",
                        "group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center",
                        active
                          ? "!bg-[#07352C] !text-[#00BC7D] font-medium hover:!bg-[#07352C] hover:!text-[#00BC7D] focus:!bg-[#07352C] focus:!text-[#00BC7D]"
                          : "!text-[#8E9CAE] font-normal hover:!bg-slate-800/40 hover:!text-slate-200 focus:!bg-slate-800/40 focus:!text-slate-200"
                      )}
                    >
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center gap-3.5 w-full",
                          isCollapsed && "justify-center gap-0"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-5 h-5 shrink-0 transition-colors",
                            active ? "!text-[#00BC7D]" : "!text-[#8E9CAE] group-hover:!text-slate-200"
                          )}
                          strokeWidth={1.8}
                        />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between w-full min-w-0">
                            <span className="truncate">{item.name}</span>
                            {item.badge !== undefined && (
                              <span className="w-5 h-5 rounded-full bg-[#1E293B] text-slate-300 text-[11px] font-semibold flex items-center justify-center shrink-0 ml-2">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="px-3 pb-4 pt-2">
          <button
            type="button"
            onClick={() => setIsLogoutDialogOpen(true)}
            className={cn(
              "flex h-11 w-full cursor-pointer items-center gap-3 rounded-2xl px-4 text-[15px] font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200",
              isCollapsed && "justify-center px-0",
            )}
            title="Log out"
          >
            <LogOut className="size-5 shrink-0" strokeWidth={1.8} />
            {!isCollapsed && <span>Log out</span>}
          </button>
          <LogoutDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen} />
        </SidebarFooter>

      </SidebarContent>
    </SidebarShell>
  );
}
