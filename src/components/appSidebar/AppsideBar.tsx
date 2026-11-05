"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/features/auth/authSlice";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  Bell,
  Clock,
  Download,
  HelpCircle,
  Info,
  LayoutGrid,
  LogOut,
  LucideIcon,
  SquarePen,
  Tag,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type MenuItem = {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: number | string;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/", icon: LayoutGrid },
  { name: "Users", path: "/user-management", icon: Users },
  { name: "Lead", path: "/lead", icon: AlignLeft },
  { name: "Categories", path: "/categories", icon: Tag },
  { name: "Blog", path: "/blog", icon: SquarePen },
  { name: "Credit Packages", path: "/pricing", icon: Clock },
  { name: "Transactions", path: "/transaction", icon: Download },
  { name: "Notifications", path: "/notifications", icon: Bell, badge: 3 },
  { name: "Profile", path: "/settings", icon: User },
  { name: "FAQ", path: "/faq", icon: HelpCircle },
  { name: "Privacy Policy", path: "/disclaimer/privacy_policy", icon: Info },
  { name: "Terms & Condition", path: "/disclaimer/terms_of_service", icon: Info },
  { name: "General Information", path: "/disclaimer/general", icon: Info },
];

export default function AppSideBar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    dispatch(logout());
    document.cookie = "salon-admin-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "realState-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "salon-role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    toast.success("Logged out successfully");
    window.location.href = "/auth/login";
  };

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarContent
        className="flex flex-col h-screen select-none bg-[#0B1120] text-white"
        style={{ backgroundColor: "#0B1120" }}
      >
        {/* ── Header / Logo ── */}
        <SidebarHeader className="pt-6 pb-2 px-5 flex flex-col items-start">
          <Link href="/" className="flex items-center">
            {isCollapsed ? (
              <div className="flex items-center text-lg font-bold">
                <span className="text-white">&lt;</span>
                <span className="text-[#00BC7D]">&gt;</span>
              </div>
            ) : (
              <div className="flex items-center text-xl font-bold tracking-wider font-sans">
                <span className="text-white">CONTR</span>
                <span className="text-white">&lt;</span>
                <span className="text-[#00BC7D]">&gt;</span>
                <span className="text-[#00BC7D]">FFERTA</span>
                <span className="text-white">.IT</span>
              </div>
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

        {/* ── Logout Row ── */}
        <SidebarFooter className="p-3 pt-1 pb-5">
          <div className="w-full border-t border-slate-800/80 mb-2" />
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            title={isCollapsed ? "Log Out" : undefined}
            className={cn(
              "flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[#F87171] hover:bg-red-500/10 transition-colors w-full cursor-pointer select-none",
              isCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0 text-[#F87171]" strokeWidth={1.8} />
            {!isCollapsed && <span className="text-[15px] font-medium text-[#F87171]">Log Out</span>}
          </button>
        </SidebarFooter>
      </SidebarContent>

      {/* ── Logout Dialog ── */}
      <AlertDialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the login page and your session will be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
