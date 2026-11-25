"use client";

import { ChevronRight, FileText, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";
import React from "react";

export type DisclaimerItem = {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const DISCLAIMER_ITEMS: DisclaimerItem[] = [
  {
    id: "1",
    slug: "privacy_policy",
    type: "privacy_policy",
    title: "Privacy Policy",
    description:
      "Manage privacy statements, data collection guidelines, and user data rights.",
    icon: ShieldCheck,
  },
  {
    id: "2",
    slug: "terms_of_service",
    type: "terms_of_service",
    title: "Terms & Condition",
    description:
      "Rules, guidelines, and terms governing platform usage for all users.",
    icon: FileText,
  },
  {
    id: "3",
    slug: "general",
    type: "general",
    title: "General Information",
    description:
      "General legal disclosures, compliance notes, and platform information.",
    icon: Info,
  },
];

export default function DisclaimerListPage() {
  return (
    <div className="space-y-6 select-none font-sans w-full">
      {/* ── Page Header Title ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          Legal Policies & Disclaimers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
          Select any legal document to view and edit its content.
        </p>
      </div>

      {/* ── Vertical List (Flex Col) of Disclaimers ── */}
      <div className="flex flex-col gap-4">
        {DISCLAIMER_ITEMS.map((item) => {
          const IconComp = item.icon;

          return (
            <Link
              key={item.id}
              href={`/disclaimer/${item.slug}`}
              className="bg-white hover:bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-2xs transition-all flex items-center justify-between gap-4 group cursor-pointer"
            >
              {/* Left Info Section */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-[#00BC7D] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <IconComp className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#00BC7D] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-2xl">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Right Action Chevron */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block text-xs font-semibold text-[#00BC7D] opacity-0 group-hover:opacity-100 transition-opacity">
                  Edit Content
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#00BC7D] text-slate-500 group-hover:text-white flex items-center justify-center transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
