"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import toast from "react-hot-toast";

import { nextFetch } from "@/lib/api/fetcher";
import { apiKeys } from "@/lib/api/keys";
import type { UserPagination } from "@/types/user.interface";

type UserStatus = "active" | "suspended" | "banned";

interface ManagedUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  credits?: number;
  joinDate: string;
  status: UserStatus;
  phone?: { countryCode?: string; number?: string };
  company?: string;
  image?: string;
}

interface ApiUser extends ManagedUser {
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  roleRef?: { businessName?: string; creditBalance?: number } | string;
}

interface UserListResponse {
  data: ApiUser[];
  pagination: UserPagination;
}

const DEFAULT_LIMIT = 10;

function toManagedUser(user: ApiUser): ManagedUser {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed user";
  const roleRef = typeof user.roleRef === "object" ? user.roleRef : undefined;

  return {
    ...user,
    credits: user.credits ?? roleRef?.creditBalance,
    name,
    avatar: name.charAt(0).toUpperCase(),
    company: roleRef?.businessName,
    joinDate: user.createdAt
      ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(user.createdAt))
      : "—",
  };
}

function statusLabel(status: UserStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(DEFAULT_LIMIT),
    });
    if (searchQuery.trim()) params.set("searchTerm", searchQuery.trim());
    if (statusFilter !== "All") params.set("status", statusFilter);
    return params.toString();
  }, [page, searchQuery, statusFilter]);

  const usersKey = apiKeys.users(query);

  const {
    data: userList,
    error,
    isLoading,
    isValidating,
    mutate: mutateUsers,
  } = useSWR<UserListResponse>(
    usersKey,
    (url: string) =>
      nextFetch<UserListResponse>({ url, preservePagination: true }),
  );

  const pagination = userList?.pagination;

  const users = useMemo(() => (userList?.data ?? []).map(toManagedUser), [userList]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const { trigger: updateStatus, isMutating: isUpdatingStatus } = useSWRMutation(
    apiKeys.users(),
    async (_key, { arg }: { arg: { id: string; status: UserStatus } }) =>
      nextFetch<ApiUser>({
        url: apiKeys.userStatus(arg.id),
        method: "PATCH",
        payload: { status: arg.status },
      }),
    { revalidate: true },
  );

  const toggleUserStatus = async (user: ManagedUser) => {
    const nextStatus: UserStatus = user.status === "active" ? "suspended" : "active";

    try {
      await updateStatus(
        { id: user._id, status: nextStatus },
        { throwOnError: true },
      );
      await mutateUsers();
      if (users.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setSelectedUser(null);
      toast.success(
        `${user.name} has been ${nextStatus === "active" ? "reactivated" : "suspended"}.`,
      );
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update user status.",
      );
    }
  };

  const firstRow = users.length ? (page - 1) * (pagination?.limit ?? DEFAULT_LIMIT) + 1 : 0;
  const lastRow = (page - 1) * (pagination?.limit ?? DEFAULT_LIMIT) + users.length;

  return (
    <div className="space-y-6 pb-6 select-none font-sans">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          User Management
        </h1>
        <p className="text-sm text-slate-500 font-normal mt-1">
          {isLoading ? "Loading users..." : `${pagination?.total ?? 0} registered users`}
          {isValidating && !isLoading ? " · Syncing..." : ""}
        </p>
      </div>

      {/* ── Main White Card ── */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs sm:p-6">
        {/* Search & Status Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6">
          {/* Pill Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-full text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
            />
          </div>

          {/* Status Filter Pill Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {(["All", "active", "suspended", "banned"] as const).map((tab) => {
              const active = statusFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-[#00BC7D] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {tab === "All" ? "All" : statusLabel(tab)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Table Container ── */}
        {error ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-8 text-center text-sm text-rose-600">
            Failed to load users. {error.message}
          </div>
        ) : isLoading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading users...</div>
        ) : <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="w-[28%] py-3.5 px-3">USER</th>
                <th className="w-[17%] py-3.5 px-3">CREDITS</th>
                <th className="w-[18%] py-3.5 px-3">JOIN DATE</th>
                <th className="w-[17%] py-3.5 px-3">STATUS</th>
                <th className="w-[20%] py-3.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isActive = user.status === "active";

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* USER */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#CBD5E1] text-[#334155] font-semibold text-xs flex items-center justify-center shrink-0">
                            {user.avatar}
                          </div>
                          <div className="truncate min-w-0">
                            <div className="font-semibold text-sm text-[#0F172A] leading-tight truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-400 leading-tight mt-0.5 truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CREDITS */}
                      <td className="py-4 px-3 font-semibold text-sm text-[#00BC7D] whitespace-nowrap">
                        {user.credits === undefined ? "—" : `${user.credits} credits`}
                      </td>

                      {/* JOIN DATE */}
                      <td className="py-4 px-3 text-sm text-slate-600 whitespace-nowrap">
                        {user.joinDate}
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[#E6F8F2] text-[#00BC7D]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-500 border border-rose-100">
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            View
                          </button>

                          {/* Suspend / Reactivate Button */}
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => toggleUserStatus(user)}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 transition-colors cursor-pointer"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={user.status === "banned" || isUpdatingStatus}
                              onClick={() => toggleUserStatus(user)}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E6F8F2] hover:bg-[#d4f5e9] text-[#00BC7D] border border-emerald-100 transition-colors cursor-pointer"
                            >
                              {user.status === "banned" ? "Banned" : "Reactivate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>}

        {/* ── Table Footer / Pagination ── */}
        <div className="pt-6 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {firstRow}-{lastRow} of {pagination?.total ?? 0} users
            {isValidating && " · Syncing..."}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => current - 1)}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!pagination || page >= pagination.totalPage || isLoading}
              onClick={() => setPage((current) => current + 1)}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── User Details Modal ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-[#0F172A]">User Details</h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-[#CBD5E1] text-[#334155] font-bold text-base flex items-center justify-center shrink-0">
                  {selectedUser.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#0F172A]">{selectedUser.name}</h4>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Company</span>
                  <span className="font-semibold text-slate-700">{selectedUser.company || "N/A"}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Available Credits</span>
                  <span className="font-semibold text-[#00BC7D]">{selectedUser.credits === undefined ? "—" : `${selectedUser.credits} credits`}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Join Date</span>
                  <span className="font-semibold text-slate-700">{selectedUser.joinDate}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Current Status</span>
                  <span
                    className={`font-semibold ${
                      selectedUser.status === "active" ? "text-[#00BC7D]" : "text-rose-500"
                    }`}
                  >
                    {statusLabel(selectedUser.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  void toggleUserStatus(selectedUser);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer ${
                  selectedUser.status === "active"
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-[#00BC7D] hover:bg-[#00a86b]"
                }`}
              >
                {selectedUser.status === "active" ? "Suspend User" : "Reactivate User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
