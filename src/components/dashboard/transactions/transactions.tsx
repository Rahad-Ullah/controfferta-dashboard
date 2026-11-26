"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useMemo, useState } from "react";

interface TransactionItem {
  id: string;
  txnId: string;
  date: string;
  buyerCompany: string;
  package: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: "1",
    txnId: "TXN-88213-A",
    date: "Sep 12, 2026",
    buyerCompany: "Infissi Group Sri",
    package: "Growth",
    amount: 129,
    status: "Paid",
  },
  {
    id: "2",
    txnId: "TXN-88213-A",
    date: "Sep 12, 2026",
    buyerCompany: "Infissi Group Sri",
    package: "Growth",
    amount: 129,
    status: "Paid",
  },
  {
    id: "3",
    txnId: "TXN-88213-A",
    date: "Sep 12, 2026",
    buyerCompany: "Infissi Group Sri",
    package: "Growth",
    amount: 129,
    status: "Paid",
  },
  {
    id: "4",
    txnId: "TXN-88213-A",
    date: "Sep 12, 2026",
    buyerCompany: "Infissi Group Sri",
    package: "Growth",
    amount: 129,
    status: "Paid",
  },
  {
    id: "5",
    txnId: "TXN-88213-A",
    date: "Sep 12, 2026",
    buyerCompany: "Infissi Group Sri",
    package: "Growth",
    amount: 129,
    status: "Paid",
  },
  {
    id: "6",
    txnId: "TXN-88213-A",
    date: "Sep 12, 2026",
    buyerCompany: "Infissi Group Sri",
    package: "Growth",
    amount: 129,
    status: "Paid",
  },
  {
    id: "7",
    txnId: "TXN-88214-B",
    date: "Sep 10, 2026",
    buyerCompany: "CasaMove Traslochi",
    package: "Starter",
    amount: 49,
    status: "Paid",
  },
  {
    id: "8",
    txnId: "TXN-88215-C",
    date: "Sep 09, 2026",
    buyerCompany: "Solaris Energy",
    package: "Professional",
    amount: 349,
    status: "Paid",
  },
  {
    id: "9",
    txnId: "TXN-88216-D",
    date: "Sep 08, 2026",
    buyerCompany: "BuildRight Sri",
    package: "Enterprise",
    amount: 599,
    status: "Paid",
  },
  {
    id: "10",
    txnId: "TXN-88217-E",
    date: "Sep 07, 2026",
    buyerCompany: "Edilizia Moderna",
    package: "Growth",
    amount: 129,
    status: "Pending",
  },
  {
    id: "11",
    txnId: "TXN-88218-F",
    date: "Sep 05, 2026",
    buyerCompany: "Termoidraulica Roma",
    package: "Starter",
    amount: 49,
    status: "Paid",
  },
  {
    id: "12",
    txnId: "TXN-88219-G",
    date: "Sep 03, 2026",
    buyerCompany: "Verde Solar Nord",
    package: "Professional",
    amount: 349,
    status: "Paid",
  },
];

const STATUS_OPTIONS = ["All statuses", "Paid", "Pending", "Failed"];

export default function TransactionsPage() {
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    if (selectedStatus === "All statuses") {
      return INITIAL_TRANSACTIONS;
    }
    return INITIAL_TRANSACTIONS.filter(
      (txn) => txn.status.toLowerCase() === selectedStatus.toLowerCase()
    );
  }, [selectedStatus]);

  // Pagination calculation
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
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
          {INITIAL_TRANSACTIONS.length} total transactions history
        </p>
      </div>

      {/* ── Main Container Card ── */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs sm:p-6">
        {/* Top Filter Bar: All statuses Dropdown on the right */}
        <div className="flex justify-end mb-6">
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
                <th className="py-3.5 px-3">BUYER/COMPANY</th>
                <th className="py-3.5 px-3">PACKAGE</th>
                <th className="py-3.5 px-3">AMOUNT</th>
                <th className="py-3.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-400 text-sm"
                  >
                    No transactions found for the selected status.
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
                      {item.buyerCompany}
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
                          item.status === "Paid"
                            ? "bg-[#E6F8F2] text-[#00BC7D]"
                            : item.status === "Pending"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {item.status}
                      </span>
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
    </div>
  );
}
