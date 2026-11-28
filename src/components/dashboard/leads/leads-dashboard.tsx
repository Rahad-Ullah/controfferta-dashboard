"use client";

import { ChevronLeft, ChevronRight, FileInput, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import LeadDetailsDialog from "@/components/dashboard/leads/lead-details-dialog";
import {
  LeadDeleteDialog,
  LeadRejectDialog,
} from "@/components/dashboard/leads/lead-confirm-dialogs";
import { apiKeys } from "@/lib/api/keys";
import { nextFetch } from "@/lib/api/fetcher";
import type {
  Lead,
  LeadListResponse,
  LeadStatus,
} from "@/types/lead.interface";
import type { Category } from "@/types/category.interface";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StatusFilter = "all" | LeadStatus;

const STATUS_LABELS: Record<LeadStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  closed: "Closed",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  accepted: "bg-[#E6F8F2] text-[#00BC7D] border-emerald-100",
  rejected: "bg-rose-50 text-rose-500 border-rose-100",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function LeadsDashboard() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [leadToReject, setLeadToReject] = useState<Lead | null>(null);
  const { mutate } = useSWRConfig();

  const categoriesQuery = new URLSearchParams({
    limit: "1000",
    sort: "name",
  }).toString();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useSWR<Category[]>(apiKeys.categories(categoriesQuery));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "8",
      sort: "-createdAt",
    });
    if (debouncedSearch) params.set("searchTerm", debouncedSearch);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    return params.toString();
  }, [categoryFilter, debouncedSearch, page, statusFilter]);
  const leadsKey = apiKeys.leads(query);
  const { data, error, isLoading, isValidating } = useSWR<LeadListResponse>(
    leadsKey,
    (url: string) =>
      nextFetch<LeadListResponse>({ url, preservePagination: true }),
  );
  const leads = data?.data ?? [];
  const pagination = data?.pagination;

  const { trigger: updateStatus, isMutating: isUpdatingStatus } =
    useSWRMutation(
      "lead-status",
      (
        _key: string,
        { arg }: { arg: { leadId: string; status: LeadStatus } },
      ) =>
        nextFetch<Lead>({
          url: apiKeys.leadStatus(arg.leadId),
          method: "PATCH",
          payload: { status: arg.status },
        }),
    );
  const { trigger: deleteLead, isMutating: isDeleting } = useSWRMutation(
    "lead-delete",
    (_key: string, { arg }: { arg: { leadId: string } }) =>
      nextFetch<Lead>({ url: apiKeys.lead(arg.leadId), method: "DELETE" }),
  );

  const refresh = async () => {
    await mutate(leadsKey);
    if (leads.length === 1 && page > 1) setPage((current) => current - 1);
  };

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
    try {
      await updateStatus({ leadId: lead._id, status }, { throwOnError: true });
      toast.success(`Lead ${STATUS_LABELS[status].toLowerCase()} successfully`);
      await refresh();
      return true;
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Unable to update lead status",
      );
      return false;
    }
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;
    try {
      await deleteLead({ leadId: leadToDelete._id }, { throwOnError: true });
      toast.success("Lead deleted successfully");
      setLeadToDelete(null);
      await refresh();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Unable to delete lead",
      );
    }
  };

  const handleReject = async () => {
    if (leadToReject && (await handleStatusChange(leadToReject, "rejected")))
      setLeadToReject(null);
  };

  const selectStatus = (status: StatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  const selectCategory = (category: string) => {
    setCategoryFilter(category);
    setPage(1);
  };

  const categoryOptions: SearchableSelectOption[] = [
    { value: "all", label: "All categories" },
    ...categories.map((category) => ({
      value: category._id,
      label: category.name,
    })),
  ];

  const firstRow = leads.length ? (page - 1) * (pagination?.limit ?? 8) + 1 : 0;
  const lastRow = (page - 1) * (pagination?.limit ?? 8) + leads.length;

  return (
    <div className="space-y-6 pb-6 font-sans">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            Lead Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {pagination?.total ?? 0} registered leads
          </p>
        </div>
        <Link
          href="/leads/import"
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-full bg-[#00BC7D] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#00a86b] sm:self-auto"
        >
          <FileInput className="h-4 w-4" />
          <span>Import Lead</span>
        </Link>
      </header>

      <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs">
        {error && (
          <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Failed to load leads: {error.message}
          </p>
        )}
        <div className="mb-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 sm:w-[420px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search leads..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-full border border-slate-200/80 bg-slate-50/70 py-2.5 pl-11 pr-4 text-sm text-[#0F172A] outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-[#00BC7D]/40"
            />
          </div>

          <SearchableSelect
            value={categoryFilter}
            options={categoryOptions}
            onValueChange={selectCategory}
            searchPlaceholder="Search categories..."
            loading={isLoadingCategories}
            className="sm:w-52"
          />
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={(value) => selectStatus(value as StatusFilter)}
          className="w-full"
        >
          <TabsList className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-slate-100 bg-transparent p-0 text-xs font-medium sm:text-sm">
            {(["all", "pending", "accepted", "rejected", "closed"] as const).map(
              (status) => (
                <TabsTrigger
                  key={status}
                  value={status}
                  className="group relative -mb-px h-auto flex-none cursor-pointer rounded-none border-0 bg-transparent px-0 pb-3 pt-0 capitalize text-slate-600 shadow-none transition-colors hover:text-slate-900 data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-[#00BC7D] data-[state=active]:shadow-none"
                >
                  {status === "all" ? "All" : STATUS_LABELS[status]}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#00BC7D] opacity-0 transition-opacity group-data-[state=active]:opacity-100"
                  />
                </TabsTrigger>
              ),
            )}
          </TabsList>
        </Tabs>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-7xl border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="w-28 px-3 py-3">ID</th>
                <th className="w-[360px] px-3 py-3">Lead</th>
                <th className="w-44 px-3 py-3">Category</th>
                <th className="w-48 px-3 py-3">Client</th>
                <th className="w-[380px] px-3 py-3">Address</th>
                <th className="w-36 px-3 py-3">Date</th>
                <th className="w-24 px-3 py-3">Credits</th>
                <th className="w-32 px-3 py-3">Status</th>
                <th className="w-56 px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    <td className="whitespace-nowrap px-3 py-3.5 text-xs font-medium text-slate-400">
                      #{lead.uid}
                    </td>
                    <td className="px-3 py-3.5 align-top text-sm font-semibold text-[#0F172A]">
                      <div
                        className="line-clamp-2 max-w-[330px] leading-5"
                        title={lead.title}
                      >
                        {lead.title}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-slate-100/90 px-3 py-1 text-xs font-medium text-slate-600">
                        {lead.category?.name ?? "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-xs text-slate-600 sm:text-sm">
                      {lead.client?.name ?? "—"}
                    </td>
                    <td className="px-3 py-3.5 align-top text-xs text-slate-600 sm:text-sm">
                      <div
                        className="line-clamp-2 max-w-[350px] leading-5"
                        title={lead.address}
                      >
                        {lead.address}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-xs text-slate-600 sm:text-sm">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-sm font-bold text-[#9333EA]">
                      {lead.category?.creditCost ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="cursor-pointer rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
                        >
                          View
                        </button>
                        {lead.status === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={isUpdatingStatus}
                              onClick={() =>
                                handleStatusChange(lead, "accepted")
                              }
                              className="cursor-pointer rounded-full border border-emerald-100 bg-[#E6F8F2] px-3 py-1 text-xs font-semibold text-[#00BC7D] disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              disabled={isUpdatingStatus}
                              onClick={() => setLeadToReject(lead)}
                              className="cursor-pointer rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-500 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setLeadToDelete(lead)}
                          className="cursor-pointer rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-500 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between pt-6 text-xs text-slate-400">
          <span>
            Showing {firstRow}-{lastRow} of {pagination?.total ?? 0} leads
            {isValidating && " · Syncing..."}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title="Previous"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => current - 1)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Next"
              disabled={
                !pagination || page >= pagination.totalPage || isLoading
              }
              onClick={() => setPage((current) => current + 1)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </section>

      <LeadDetailsDialog
        lead={selectedLead}
        open={Boolean(selectedLead)}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      />
      <LeadDeleteDialog
        lead={leadToDelete}
        open={Boolean(leadToDelete)}
        onOpenChange={(open) => !open && setLeadToDelete(null)}
        onConfirm={handleDelete}
        isMutating={isDeleting}
      />
      <LeadRejectDialog
        lead={leadToReject}
        open={Boolean(leadToReject)}
        onOpenChange={(open) => !open && setLeadToReject(null)}
        onConfirm={handleReject}
        isMutating={isUpdatingStatus}
      />
    </div>
  );
}
