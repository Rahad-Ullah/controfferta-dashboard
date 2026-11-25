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
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  Bell,
  Clock,
  Download,
  HelpCircle,
  Info,
  LayoutGrid,
  LucideIcon,
  SquarePen,
  Tag,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type MenuItem = {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: number | string;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/", icon: LayoutGrid },
  { name: "Users", path: "/users", icon: Users },
  { name: "Lead", path: "/leads", icon: AlignLeft },
  { name: "Categories", path: "/categories", icon: Tag },
  { name: "Blog", path: "/blogs", icon: SquarePen },
  { name: "Credit Packages", path: "/pricing", icon: Clock },
  { name: "Transactions", path: "/transactions", icon: Download },
  { name: "Notifications", path: "/notifications", icon: Bell, badge: 3 },
  { name: "Profile", path: "/settings", icon: User },
  { name: "FAQ", path: "/faqs", icon: HelpCircle },
  { name: "Privacy Policy", path: "/disclaimer/privacy_policy", icon: Info },
  { name: "Terms & Condition", path: "/disclaimer/terms_of_service", icon: Info },
  { name: "General Information", path: "/disclaimer/general", icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
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

      </SidebarContent>
    </SidebarShell>
  );
}
