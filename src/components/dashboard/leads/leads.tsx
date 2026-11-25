"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

type PrimaryTab = "Accepted" | "Pending";
type StatusFilter =
  | "All"
  | "Available"
  | "Unlocked"
  | "Contacted"
  | "In Progress"
  | "Completed";

interface LeadItem {
  id: string;
  code: string;
  title: string;
  category: string;
  provider: string;
  region: string;
  date: string;
  credits: number;
  status: "Available" | "Unlocked" | "Contacted" | "In Progress" | "Completed";
}

const INITIAL_ACCEPTED_LEADS: LeadItem[] = [
  {
    id: "1",
    code: "#0001",
    title: "Replacement of 8 PVC windows",
    category: "Windows & Doors",
    provider: "Giulia Esposito",
    region: "Lombardia",
    date: "Jan 8 2026",
    credits: 15,
    status: "Available",
  },
  {
    id: "2",
    code: "#0002",
    title: "6kW solar panel system",
    category: "Solar Panels",
    provider: "Roberto Marini",
    region: "Veneto",
    date: "Jan 7 2026",
    credits: 20,
    status: "Completed",
  },
  {
    id: "3",
    code: "#0003",
    title: "Kitchen renovation Torino",
    category: "Construction",
    provider: "CSV Import",
    region: "Piemonte",
    date: "Jan 6 2026",
    credits: 18,
    status: "Contacted",
  },
  {
    id: "4",
    code: "#0002",
    title: "6kW solar panel system",
    category: "Solar Panels",
    provider: "Roberto Marini",
    region: "Veneto",
    date: "Jan 7 2026",
    credits: 20,
    status: "Completed",
  },
  {
    id: "5",
    code: "#0004",
    title: "Move Roma Nord",
    category: "Moving",
    provider: "Giulia Esposito",
    region: "Lazio",
    date: "Jan 5 2026",
    credits: 12,
    status: "In Progress",
  },
  {
    id: "6",
    code: "#0005",
    title: "3-zone air conditioner Napoli",
    category: "Air Conditioning",
    provider: "Facebook Import",
    region: "Campania",
    date: "Jan 4 2026",
    credits: 10,
    status: "Unlocked",
  },
  {
    id: "7",
    code: "#0004",
    title: "Move Roma Nord",
    category: "Moving",
    provider: "Giulia Esposito",
    region: "Lazio",
    date: "Jan 5 2026",
    credits: 12,
    status: "In Progress",
  },
  {
    id: "8",
    code: "#0005",
    title: "3-zone air conditioner Napoli",
    category: "Air Conditioning",
    provider: "Facebook Import",
    region: "Campania",
    date: "Jan 4 2026",
    credits: 10,
    status: "Unlocked",
  },
];

const INITIAL_PENDING_LEADS: LeadItem[] = [
  {
    id: "p1",
    code: "#0001",
    title: "Replacement of 8 PVC windows",
    category: "Windows & Doors",
    provider: "Giulia Esposito",
    region: "Lombardia",
    date: "Jan 8 2026",
    credits: 15,
    status: "Available",
  },
  {
    id: "p2",
    code: "#0002",
    title: "6kW solar panel system",
    category: "Solar Panels",
    provider: "Roberto Marini",
    region: "Veneto",
    date: "Jan 7 2026",
    credits: 20,
    status: "Completed",
  },
  {
    id: "p3",
    code: "#0003",
    title: "Kitchen renovation Torino",
    category: "Construction",
    provider: "CSV Import",
    region: "Piemonte",
    date: "Jan 6 2026",
    credits: 18,
    status: "Contacted",
  },
  {
    id: "p4",
    code: "#0002",
    title: "6kW solar panel system",
    category: "Solar Panels",
    provider: "Roberto Marini",
    region: "Veneto",
    date: "Jan 7 2026",
    credits: 20,
    status: "Completed",
  },
  {
    id: "p5",
    code: "#0003",
    title: "Kitchen renovation Torino",
    category: "Construction",
    provider: "CSV Import",
    region: "Piemonte",
    date: "Jan 6 2026",
    credits: 18,
    status: "Contacted",
  },
  {
    id: "p6",
    code: "#0004",
    title: "Move Roma Nord",
    category: "Moving",
    provider: "Giulia Esposito",
    region: "Lazio",
    date: "Jan 5 2026",
    credits: 12,
    status: "In Progress",
  },
  {
    id: "p7",
    code: "#0005",
    title: "3-zone air conditioner Napoli",
    category: "Air Conditioning",
    provider: "Facebook Import",
    region: "Campania",
    date: "Jan 4 2026",
    credits: 10,
    status: "Unlocked",
  },
  {
    id: "p8",
    code: "#0005",
    title: "3-zone air conditioner Napoli",
    category: "Air Conditioning",
    provider: "Facebook Import",
    region: "Campania",
    date: "Jan 4 2026",
    credits: 10,
    status: "Unlocked",
  },
];

export default function LeadPage() {
  // Main view state
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>("Accepted");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [acceptedLeads, setAcceptedLeads] = useState<LeadItem[]>(INITIAL_ACCEPTED_LEADS);
  const [pendingLeads, setPendingLeads] = useState<LeadItem[]>(INITIAL_PENDING_LEADS);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [deleteModalLead, setDeleteModalLead] = useState<LeadItem | null>(null);

  // Filtered Leads
  const currentLeads = primaryTab === "Accepted" ? acceptedLeads : pendingLeads;

  const filteredLeads = useMemo(() => {
    return currentLeads.filter((lead) => {
      const matchesSearch =
        lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [currentLeads, searchQuery, statusFilter]);

  // Actions
  const confirmDeleteAccepted = () => {
    if (!deleteModalLead) return;
    setAcceptedLeads((prev) => prev.filter((item) => item.id !== deleteModalLead.id));
    toast.success("Lead deleted successfully");
    setDeleteModalLead(null);
  };

  const handleAcceptPending = (lead: LeadItem) => {
    setPendingLeads((prev) => prev.filter((item) => item.id !== lead.id));
    setAcceptedLeads((prev) => [lead, ...prev]);
    toast.success("Lead accepted successfully");
  };

  const handleRejectPending = (id: string) => {
    setPendingLeads((prev) => prev.filter((item) => item.id !== id));
    toast.error("Lead rejected");
  };

  // Status Badge Helper
  const renderStatusBadge = (status: LeadItem["status"]) => {
    switch (status) {
      case "Available":
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E6F8F2] text-[#00BC7D] border border-emerald-100">
            Available
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E6F8F2] text-[#00BC7D] border border-emerald-100">
            Completed
          </span>
        );
      case "Contacted":
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
            Contacted
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            In Progress
          </span>
        );
      case "Unlocked":
      default:
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Unlocked
          </span>
        );
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: MAIN LEAD MANAGEMENT TABLE VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-6 select-none font-sans">
      {/* ── Top Header & Import Lead Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Lead Management
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            5 registered users
          </p>
        </div>

        {/* Import Lead Pill Button */}
        <Link
          href="/leads/import"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Import Lead</span>
        </Link>
      </div>

      {/* ── Primary Tabs: Accepted / Pending ── */}
      <div className="flex items-center gap-6 border-b border-slate-200/60 pb-px">
        <button
          type="button"
          onClick={() => setPrimaryTab("Accepted")}
          className={`pb-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2 -mb-px ${
            primaryTab === "Accepted"
              ? "border-[#00BC7D] text-[#00BC7D]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Accepted
        </button>
        <button
          type="button"
          onClick={() => setPrimaryTab("Pending")}
          className={`pb-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2 -mb-px ${
            primaryTab === "Pending"
              ? "border-[#00BC7D] text-[#00BC7D]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Pending
        </button>
      </div>

      {/* ── Main White Container Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-2xs">
        {/* Pill Search Input */}
        <div className="relative w-full mb-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-full text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
          />
        </div>

        {/* Secondary Filter Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-100 pb-3 overflow-x-auto text-xs sm:text-sm font-medium">
          {(
            [
              "All",
              "Available",
              "Unlocked",
              "Contacted",
              "In Progress",
              "Completed",
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`pb-1 whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-3.5 ${
                  active
                    ? "border-[#00BC7D] text-[#00BC7D] font-bold"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── Table Container ── */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">LEAD</th>
                <th className="py-3 px-3">CATEGORY</th>
                <th className="py-3 px-3">PROVIDER</th>
                <th className="py-3 px-3">REGION</th>
                <th className="py-3 px-3">
                  {primaryTab === "Accepted" ? "DATE" : "SUBMITTED DATE"}
                </th>
                <th className="py-3 px-3">CREDITS</th>
                {primaryTab === "Accepted" && <th className="py-3 px-3">STATUS</th>}
                <th className="py-3 px-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={primaryTab === "Accepted" ? 9 : 8}
                    className="py-10 text-center text-slate-400 text-sm"
                  >
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, idx) => (
                  <tr
                    key={`${lead.id}-${idx}`}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-3 font-medium text-slate-400 text-xs whitespace-nowrap">
                      {lead.code}
                    </td>

                    {/* LEAD Title */}
                    <td className="py-3.5 px-3 font-semibold text-sm text-[#0F172A] whitespace-nowrap max-w-xs truncate">
                      {lead.title}
                    </td>

                    {/* CATEGORY */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100/90 text-slate-600">
                        {lead.category}
                      </span>
                    </td>

                    {/* PROVIDER */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap text-xs sm:text-sm">
                      {lead.provider}
                    </td>

                    {/* REGION */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap text-xs sm:text-sm">
                      {lead.region}
                    </td>

                    {/* DATE */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap text-xs sm:text-sm">
                      {lead.date}
                    </td>

                    {/* CREDITS */}
                    <td className="py-3.5 px-3 font-bold text-sm text-[#9333EA] whitespace-nowrap">
                      {lead.credits}
                    </td>

                    {/* STATUS (Accepted Only) */}
                    {primaryTab === "Accepted" && (
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {renderStatusBadge(lead.status)}
                      </td>
                    )}

                    {/* ACTIONS */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        >
                          View
                        </button>

                        {/* Accepted Tab: Delete Action */}
                        {primaryTab === "Accepted" && (
                          <button
                            type="button"
                            onClick={() => setDeleteModalLead(lead)}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        )}

                        {/* Pending Tab: Accept and Reject Actions */}
                        {primaryTab === "Pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAcceptPending(lead)}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F8F2] hover:bg-[#d4f5e9] text-[#00BC7D] border border-emerald-100 transition-colors cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectPending(lead.id)}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer / Pagination ── */}
        <div className="pt-6 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 1-8 of 48 leads</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Lead Detail Modal ── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-xs font-semibold text-slate-400">{selectedLead.code}</span>
                <h3 className="text-base font-bold text-[#0F172A]">{selectedLead.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Category</span>
                  <span className="font-semibold text-slate-700">{selectedLead.category}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Provider</span>
                  <span className="font-semibold text-slate-700">{selectedLead.provider}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Region</span>
                  <span className="font-semibold text-slate-700">{selectedLead.region}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Credits Cost</span>
                  <span className="font-bold text-[#9333EA]">{selectedLead.credits} credits</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Date</span>
                  <span className="font-semibold text-slate-700">{selectedLead.date}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Status</span>
                  <div>{renderStatusBadge(selectedLead.status)}</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Delete Lead</h3>
                  <p className="text-xs text-slate-400">Confirm lead deletion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalLead(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3 text-sm">
              <p className="text-slate-600 text-sm leading-relaxed">
                Are you sure you want to delete lead{" "}
                <span className="font-semibold text-[#0F172A]">{deleteModalLead.code}</span> (
                <span className="font-medium text-slate-800">{deleteModalLead.title}</span>)?
              </p>
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800">
                This action cannot be undone. The lead will be permanently removed from the list.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteModalLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccepted}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
