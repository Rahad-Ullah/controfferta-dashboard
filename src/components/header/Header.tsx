"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";

const PAGE_TITLE_MAP: Record<string, string> = {
  "/": "Dashboard",
  "/user-management": "Users",
  "/lead": "Lead Management",
  "/lead/import": "Import Leads",
  "/customer-management": "Lead Management",
  "/customers": "Lead Management",
  "/categories": "Categories",
  "/blog": "Blog",
  "/pricing": "Credit Packages",
  "/transaction": "Transactions",
  "/notifications": "Notifications",
  "/settings": "Profile",
  "/faq": "FAQ",
  "/disclaimer": "General Information",
  "/disclaimer/privacy_policy": "Privacy Policy",
  "/disclaimer/privacy": "Privacy Policy",
  "/disclaimer/terms_of_service": "Terms & Condition",
  "/disclaimer/terms": "Terms & Condition",
  "/disclaimer/general": "General Information",
};

export default function MyNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const title =
    PAGE_TITLE_MAP[pathname] ||
    (pathname.startsWith("/disclaimer") ? "Disclaimer" : "Dashboard");

  return (
    <header className="flex h-16 items-center justify-between gap-4 bg-[#E5E7EB] px-6 sm:px-8 w-full shrink-0 border-b border-neutral-300/50 select-none">
      {/* ── Left Side: Sidebar Toggle & Page Title ── */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-9 w-9 text-slate-700 hover:bg-black/5" />
        <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
          {title}
        </h1>
      </div>

      {/* ── Right Side: Circular Avatar 'M' ── */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="w-10 h-10 rounded-full bg-[#CBD5E1] text-[#334155] font-semibold text-sm flex items-center justify-center cursor-pointer hover:bg-[#b8c5d6] transition-colors shadow-2xs select-none"
          title="Profile"
        >
          M
        </button>
      </div>
    </header>
  );
}
