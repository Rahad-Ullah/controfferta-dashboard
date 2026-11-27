"use client";

import Link from "next/link";
import useSWR from "swr";
import { apiKeys } from "@/lib/api/keys";
import type { CreditPackage } from "@/types/credit-package.interface";

interface Transaction {
  id: string;
  buyer: string;
  date?: string;
  package: string;
  amount: string;
  status: string;
}

interface OverviewUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  roleRef?: { _id?: string; businessName?: string };
}

function getTransactionStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
    case "paid":
      return "bg-[#E6F8F2] text-[#00BC7D]";
    case "pending":
      return "bg-amber-50 text-amber-600";
    case "failed":
    case "cancelled":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

interface CategoryRevenue {
  name: string;
  amount: string;
  percentage: number;
}

interface Activity {
  id: string;
  content: React.ReactNode;
  time: string;
}

const STATS = [
  {
    number: "285",
    label: "Total Users",
    color: "text-[#0F172A]",
  },
  {
    number: "1,284",
    label: "Total Byers/Companies",
    color: "text-[#2563EB]",
  },
  {
    number: "3,420",
    label: "Total Leads",
    color: "text-[#00BC7D]",
  },
  {
    number: "8,740",
    label: "Sold Leads",
    color: "text-[#D97706]",
  },
  {
    number: "€ 48,600",
    label: "Credits Purchased",
    color: "text-[#9333EA]",
  },
];

const TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    buyer: "Infissi Group Sri",
    package: "Growth",
    amount: "€ 129",
    status: "Paid",
  },
  {
    id: "2",
    buyer: "CasaMove Traslochi",
    package: "Starter",
    amount: "€ 49",
    status: "Paid",
  },
  {
    id: "3",
    buyer: "Solaris Energy",
    package: "Professional",
    amount: "€ 349",
    status: "Paid",
  },
  {
    id: "4",
    buyer: "Solaris Energy",
    package: "Professional",
    amount: "€ 349",
    status: "Paid",
  },
  {
    id: "5",
    buyer: "Solaris Energy",
    package: "Professional",
    amount: "€ 349",
    status: "Paid",
  },
  {
    id: "6",
    buyer: "Solaris Energy",
    package: "Professional",
    amount: "€ 349",
    status: "Paid",
  },
  {
    id: "7",
    buyer: "BuildRight Sri",
    package: "Growth",
    amount: "€ 599",
    status: "Paid",
  },
];

const CATEGORIES: CategoryRevenue[] = [
  { name: "Windows & Doors", amount: "€ 16,529", percentage: 88 },
  { name: "Solar Panels", amount: "€ 16,529", percentage: 70 },
  { name: "Construction", amount: "€ 16,529", percentage: 65 },
  { name: "Moving", amount: "€ 16,529", percentage: 48 },
  { name: "Other", amount: "€ 16,529", percentage: 32 },
];

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    content: (
      <span>
        <strong className="font-semibold text-[#0F172A]">Marco Ferretti</strong>{" "}
        unlocked a lead{" "}
        <strong className="font-semibold text-[#0F172A]">&quot;Windows Milano&quot;</strong>
      </span>
    ),
    time: "5 min ago",
  },
  {
    id: "2",
    content: (
      <span>
        <strong className="font-semibold text-[#0F172A]">New transaction: Growth package</strong>{" "}
        150 credits - € 129
      </span>
    ),
    time: "23 min ago",
  },
  {
    id: "3",
    content: (
      <span>
        <strong className="font-semibold text-[#0F172A]">Giulia Esposito</strong>{" "}
        published 3 new leads
      </span>
    ),
    time: "1 hour ago",
  },
];

export default function OverviewPage() {
  const { data: transactionsResponse } = useSWR<unknown>(
    apiKeys.transactions("limit=7"),
  );
  const { data: users = [] } = useSWR<OverviewUser[]>(
    apiKeys.users("limit=100"),
  );
  const { data: packages = [] } = useSWR<CreditPackage[]>(
    apiKeys.creditPackages("limit=100"),
  );

  const providerByRoleId = new Map(
    users.flatMap((user) =>
      [user._id, user.roleRef?._id]
        .filter((id): id is string => Boolean(id))
        .map((id) => [id, user] as const),
    ),
  );
  const packageById = new Map(packages.map((pkg) => [pkg._id, pkg]));
  const transactions = Array.isArray(transactionsResponse)
    ? transactionsResponse
    : ((transactionsResponse as { data?: unknown[] } | undefined)?.data ?? []);
  const recentTransactions: Transaction[] = (
    transactions as Record<string, unknown>[]
  ).map((transaction) => {
    const userRecord = transaction.user as Record<string, unknown> | undefined;
    const provider = providerByRoleId.get(String(userRecord?._id ?? ""));
    const reference = transaction.reference as Record<string, unknown> | undefined;
    const purchase = reference?.id as Record<string, unknown> | undefined;
    const pricing = purchase?.pricing as Record<string, unknown> | undefined;
    const packageValue = purchase?.package;
    const packageRecord =
      packageValue && typeof packageValue === "object"
        ? (packageValue as Record<string, unknown>)
        : packageById.get(String(packageValue ?? ""));
    const status = String(
      transaction.status ?? transaction.paymentStatus ?? "Pending",
    );

    return {
      id: String(transaction._id ?? transaction.uid ?? ""),
      date: transaction.createdAt
        ? new Date(String(transaction.createdAt)).toLocaleDateString()
        : "—",
      buyer:
        [provider?.firstName, provider?.lastName].filter(Boolean).join(" ") ||
        [userRecord?.firstName, userRecord?.lastName]
          .filter((name): name is string => typeof name === "string" && Boolean(name))
          .join(" ") ||
        provider?.roleRef?.businessName ||
        String(userRecord?.firstName ?? "Unknown buyer"),
      package: String(packageRecord?.name ?? "—"),
      amount: `€ ${String(pricing?.total ?? transaction.amount ?? "—")}`,
      status: status.replace(/^./, (character) => character.toUpperCase()),
    };
  });
  const displayTransactions =
    transactionsResponse === undefined ? TRANSACTIONS : recentTransactions;

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 select-none font-sans">
      {/* ── Greeting Header ── */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
        Good morning, Manish
      </h1>

      {/* ── Stat Cards (5 Column Grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3 sm:gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="min-w-0 bg-white rounded-2xl p-4 sm:p-5 2xl:p-6 border border-slate-200/70 shadow-2xs flex flex-col justify-between"
          >
            <div className={`text-2xl sm:text-3xl 2xl:text-4xl font-bold tracking-tight whitespace-nowrap ${stat.color}`}>
              {stat.number}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid (Left Table & Right Stacked Cards) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Left Column (2/3 width) - Recent Transactions */}
        <div className="xl:col-span-2 min-w-0 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/70 shadow-2xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">Recent Transactions</h2>
            <Link
              href="/transactions"
              className="text-sm font-semibold text-[#00BC7D] hover:underline inline-flex items-center gap-1 group"
            >
              <span>View all</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-2 font-bold">USER</th>
                  <th className="py-3 px-2 font-bold">DATE</th>
                  <th className="py-3 px-2 font-bold">PACKAGE</th>
                  <th className="py-3 px-2 font-bold">AMOUNT</th>
                  <th className="py-3 px-2 font-bold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No transactions yet.
                    </td>
                  </tr>
                ) : displayTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Buyer */}
                    <td className="py-3.5 px-2 font-medium text-[#0F172A] whitespace-nowrap">
                      {tx.buyer}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-2 text-slate-500 whitespace-nowrap">
                      {tx.date ?? "—"}
                    </td>

                    {/* Package */}
                    <td className="py-3.5 px-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100/90 text-slate-600">
                        {tx.package}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-2 font-semibold text-[#0F172A] whitespace-nowrap">
                      {tx.amount}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3.5 py-0.5 rounded-full text-xs font-semibold ${getTransactionStatusClasses(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1/3 width) - Revenue by Category & Recent Activity */}
        <div className="min-w-0 space-y-4 sm:space-y-6">
          {/* Card 1: Revenue by Category */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/70 shadow-2xs">
            <h2 className="text-lg font-bold text-[#0F172A] mb-5">
              Revenue by Category
            </h2>
            <div className="space-y-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-slate-700">{cat.name}</span>
                    <span className="shrink-0 font-bold text-[#0F172A]">{cat.amount}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-[#00BC7D] rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Recent Activity */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/70 shadow-2xs">
            <h2 className="text-lg font-bold text-[#0F172A] mb-5">
              Recent Activity
            </h2>
            <div className="space-y-5">
              {ACTIVITIES.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="text-slate-600 text-[13px] sm:text-sm leading-snug">
                    {act.content}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap mt-0.5">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
