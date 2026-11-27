"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/use-current-user";
import LogoutDialog from "@/components/dashboard/layout/logout-dialog";
import { apiKeys } from "@/lib/api/keys";
import { Bell, ChevronDown, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import type { NotificationListResponse } from "@/types/notification.interface";

const PAGE_TITLE_MAP: Record<string, string> = {
  "/": "Dashboard",
  "/users": "Users",
  "/leads": "Lead Management",
  "/leads/import": "Import Leads",
  "/customer-management": "Lead Management",
  "/customers": "Lead Management",
  "/categories": "Categories",
  "/blogs": "Blog",
  "/credit-packages": "Credit Packages",
  "/transactions": "Transactions",
  "/notifications": "Notifications",
  "/settings": "Profile",
  "/faqs": "FAQ",
  "/disclaimer": "Platform Settings",
  "/disclaimer/privacy_policy": "Privacy Policy",
  "/disclaimer/privacy": "Privacy Policy",
  "/disclaimer/terms_of_service": "Terms & Condition",
  "/disclaimer/terms": "Terms & Condition",
  "/disclaimer/general": "Platform Settings",
  "/platform-settings": "Platform Settings",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: notificationData } = useSWR<NotificationListResponse["data"]>(
    apiKeys.notifications("page=1&limit=1"),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const title =
    PAGE_TITLE_MAP[pathname] ||
    (pathname.startsWith("/disclaimer") ? "Disclaimer" : "Dashboard");

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin User";
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "A";

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b border-neutral-300/50 bg-[#E5E7EB] px-3 select-none sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
      {/* ── Left Side: Sidebar Toggle & Page Title ── */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <SidebarTrigger className="h-9 w-9 text-slate-700 hover:bg-black/5" />
        <h1 className="truncate text-base font-bold tracking-tight text-[#0F172A] sm:text-xl">
          {title}
        </h1>
      </div>

      {/* ── Right Side: Circular Avatar 'M' ── */}
      <div className="flex items-center gap-2">
        <Link
          href="/notifications"
          aria-label="Notifications"
          title="Notifications"
          className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-black/5 hover:text-[#00BC7D]"
        >
          <Bell className="size-5" />
          {notificationData?.unreadCount ? (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00BC7D] px-1 text-[10px] font-bold text-white">
              {notificationData.unreadCount > 99 ? "99+" : notificationData.unreadCount}
            </span>
          ) : null}
        </Link>
        <div ref={profileRef} className="relative flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#CBD5E1] text-sm font-semibold text-[#334155] shadow-2xs transition-colors select-none hover:bg-[#b8c5d6]"
          title="Profile"
        >
          {initials}
        </button>
        <ChevronDown className={`ml-1 hidden size-4 text-slate-500 transition-transform sm:block ${isOpen ? "rotate-180" : ""}`} />

        {isOpen ? (
          <div
            role="menu"
            className="absolute top-12 right-0 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
          >
            <div className="border-b border-slate-100 px-4 py-4">
              <p className="truncate text-sm font-semibold text-slate-900">{fullName}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{user?.email || ""}</p>
            </div>
            <div className="p-2">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/settings");
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                <UserRound className="size-4 text-slate-500" />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  setIsLogoutDialogOpen(true);
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </div>
          </div>
        ) : null}
        <LogoutDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen} />
        </div>
      </div>
    </header>
  );
}
