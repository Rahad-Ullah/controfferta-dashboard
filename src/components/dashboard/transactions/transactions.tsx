"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { apiKeys } from "@/lib/api/keys";
import TransactionViewDialog, {
  type TransactionItem,
} from "@/components/dashboard/transactions/transaction-view-dialog";
import type { CreditPackage } from "@/types/credit-package.interface";
import { formatLocalDateTime } from "@/utils/datetime";

interface ProviderUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: { countryCode?: string; number?: string };
  roleRef?: { _id?: string; businessName?: string };
}

const STATUS_OPTIONS = ["All statuses", "Pending", "Completed", "Failed", "Cancelled"];

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(searchQuery.trim()),
      400,
    );

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const purchaseParams = new URLSearchParams({ limit: "100" });
  if (debouncedSearch) purchaseParams.set("searchTerm", debouncedSearch);

  const { data: transactionsResponse } = useSWR<unknown>(
    apiKeys.transactions(purchaseParams.toString()),
  );
  const { data: users = [] } = useSWR<ProviderUser[]>(
    apiKeys.users("limit=100"),
  );
  const { data: packages = [] } = useSWR<CreditPackage[]>(
    apiKeys.creditPackages("limit=100"),
  );
  const providerByRoleId = useMemo(
    () =>
      new Map(
        users.flatMap((user) =>
          [user._id, user.roleRef?._id]
            .filter((id): id is string => Boolean(id))
            .map((id) => [id, user] as const),
        ),
      ),
    [users],
  );
  const packageById = useMemo(
    () => new Map(packages.map((pkg) => [pkg._id, pkg])),
    [packages],
  );
  const transactions = Array.isArray(transactionsResponse)
    ? transactionsResponse
    : ((transactionsResponse as { data?: unknown[] } | undefined)?.data ?? []);
  const liveTransactions: TransactionItem[] = (
    transactions as Record<string, unknown>[]
  ).map((p) => {
    const providerRecord = p.user as Record<string, unknown> | undefined;
    const providerId =
      typeof providerRecord?._id === "string" ? providerRecord._id : "";
    const provider = providerByRoleId.get(providerId);
    const providerFirstName = String(
      providerRecord?.firstName ?? provider?.firstName ?? "",
    );
    const providerLastName = String(
      providerRecord?.lastName ?? provider?.lastName ?? "",
    );
    const providerName = [provider?.firstName, provider?.lastName]
      .filter(Boolean)
      .join(" ");
    const providerPhoneRecord = providerRecord?.phone as
      | Record<string, unknown>
      | undefined;
    const purchaseRecord =
      ((p.reference as Record<string, unknown> | undefined)?.id as
        | Record<string, unknown>
        | undefined) ?? {};
    const transactionRecord = p;
    const pricing = purchaseRecord.pricing as
      | Record<string, unknown>
      | undefined;
    const packageRecord =
      purchaseRecord.package && typeof purchaseRecord.package === "object"
        ? (purchaseRecord.package as Record<string, unknown>)
        : packageById.get(String(purchaseRecord.package ?? ""));
    const transactionStatus = String(
      transactionRecord.status ?? p.status ?? p.paymentStatus ?? "pending",
    );

    return {
      id: String(p._id ?? ""),
      providerName:
        providerName ||
        [providerFirstName, providerLastName].filter(Boolean).join(" ") ||
        "—",
      providerEmail: String(providerRecord?.email ?? provider?.email ?? "—"),
      providerPhone: providerPhoneRecord?.number
        ? `${String(providerPhoneRecord.countryCode ?? "")} ${String(providerPhoneRecord.number)}`.trim()
        : provider?.phone?.number
          ? `${provider.phone.countryCode ?? ""} ${provider.phone.number}`.trim()
          : "—",
      txnId: String(transactionRecord.uid ?? p.uid ?? p._id ?? ""),
      date: new Date(String(p.createdAt ?? Date.now())).toLocaleDateString(),
      dateTime: formatLocalDateTime(p.createdAt),
      detailGroups: [
        {
          title: "Overview",
          fields: [
            {
              label: "Transaction ID",
              value: String(transactionRecord.uid ?? p.uid ?? p._id ?? ""),
            },
            { label: "Date and time", value: formatLocalDateTime(p.createdAt) },
            {
              label: "Status",
              value: String(transactionStatus).replace(/^./, (character) =>
                character.toUpperCase(),
              ),
            },
            {
              label: "Total amount",
              value: `€ ${String(pricing?.total ?? transactionRecord.amount ?? "—")} (${String(pricing?.currency ?? transactionRecord.currency ?? "EUR")})`,
            },
          ],
        },
        {
          title: "Provider / Company",
          fields: [
            { label: "User name", value: providerName || "—" },
            {
              label: "Company",
              value: (provider?.roleRef?.businessName ?? providerName) || "—",
            },
            { label: "Email", value: provider?.email ?? "—" },
            {
              label: "Phone",
              value: provider?.phone?.number
                ? `${provider.phone.countryCode ?? ""} ${provider.phone.number}`.trim()
                : "—",
            },
          ],
        },
        {
          title: "Package",
          fields: [
            {
              label: "Package",
              value: String(packageRecord?.name ?? "—"),
            },
            {
              label: "Credits",
              value: String(
                packageRecord?.creditsAmount ??
                  purchaseRecord.creditsAmount ??
                  "—",
              ),
            },
          ],
        },
      ],
      buyerCompany: String(provider?.roleRef?.businessName ?? "—"),
      package: String(packageRecord?.name ?? "—"),
      amount: Number(pricing?.total ?? transactionRecord.amount ?? 0),
      status: transactionStatus.replace(/^./, (character) =>
        character.toUpperCase(),
      ) as TransactionItem["status"],
    };
  });
  const source = liveTransactions;
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionItem | null>(null);
  const itemsPerPage = 6;

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return source.filter((txn) => {
      const matchesStatus =
        selectedStatus === "All statuses" ||
        txn.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesStatus;
    });
  }, [selectedStatus, source]);

  // Pagination calculation
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 pb-6 select-none font-sans">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          Transactions
        </h1>
        <p className="text-sm text-slate-500 font-normal mt-1">
          {liveTransactions.length} total transactions history
        </p>
      </div>

      {/* ── Main Container Card ── */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs sm:p-6">
        {/* Top Filter Bar */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <span>{selectedStatus}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl border border-slate-200 shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(status);
                      setIsDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer ${
                      selectedStatus === status
                        ? "bg-[#E6F8F2] text-[#00BC7D] font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-3">TRANSACTION ID</th>
                <th className="py-3.5 px-3">DATE</th>
                <th className="py-3.5 px-3">USER</th>
                <th className="py-3.5 px-3">PACKAGE</th>
                <th className="py-3.5 px-3">AMOUNT</th>
                <th className="py-3.5 px-3">STATUS</th>
                <th className="py-3.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-slate-400 text-sm"
                  >
                    No transactions match your search or selected status.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr
                    key={`${item.id}-${index}`}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* TRANSACTION ID */}
                    <td className="py-4 px-3 text-slate-500 text-xs sm:text-sm font-medium whitespace-nowrap">
                      {item.txnId}
                    </td>

                    {/* DATE */}
                    <td className="py-4 px-3 text-slate-500 text-xs sm:text-sm whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* BUYER/COMPANY */}
                    <td className="py-4 px-3 text-slate-600 text-xs sm:text-sm font-medium whitespace-nowrap">
                      {item.providerName}
                    </td>

                    {/* PACKAGE */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100/90 text-slate-700">
                        {item.package}
                      </span>
                    </td>

                    {/* AMOUNT */}
                    <td className="py-4 px-3 text-slate-700 text-xs sm:text-sm font-medium whitespace-nowrap">
                      € {item.amount}
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "Completed"
                            ? "bg-[#E6F8F2] text-[#00BC7D]"
                            : item.status === "Pending"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTransaction(item)}
                        aria-label={`View transaction ${item.txnId}`}
                        title="View transaction"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-[#00BC7D]/40 hover:bg-[#E6F8F2] hover:text-[#00BC7D]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer / Pagination ── */}
        <div className="pt-6 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {totalItems === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}{" "}
            transactions
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={handlePrevPage}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                currentPage === 1
                  ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              }`}
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                currentPage === totalPages
                  ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              }`}
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <TransactionViewDialog
        transaction={selectedTransaction}
        open={Boolean(selectedTransaction)}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      />
    </div>
  );
}
