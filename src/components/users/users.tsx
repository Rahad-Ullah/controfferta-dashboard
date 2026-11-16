"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

type UserStatus = "Active" | "Suspended";

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  credits: number;
  joinDate: string;
  status: UserStatus;
  phone?: string;
  company?: string;
}

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "1",
    name: "Marco Ferretti",
    email: "marco@ferretti.it",
    avatar: "M",
    credits: 285,
    joinDate: "Jan 1 2026",
    status: "Active",
    phone: "+39 02 1234567",
    company: "Ferretti Windows",
  },
  {
    id: "2",
    name: "Giulia Esposito",
    email: "g.esposito@leadpro.it",
    avatar: "G",
    credits: 285,
    joinDate: "Dec 15 2025",
    status: "Active",
    phone: "+39 06 9876543",
    company: "LeadPro Italy",
  },
  {
    id: "3",
    name: "Luca Bianchi",
    email: "l.bianchi@solargroup.it",
    avatar: "L",
    credits: 150,
    joinDate: "Dec 20 2025",
    status: "Active",
    phone: "+39 011 5554321",
    company: "SolarGroup SRL",
  },
  {
    id: "4",
    name: "Sara Conti",
    email: "s.conti@edil.it",
    avatar: "S",
    credits: 0,
    joinDate: "Nov 5 2025",
    status: "Suspended",
    phone: "+39 055 4443322",
    company: "Edil Costruzioni",
  },
  {
    id: "5",
    name: "Marco Ferretti",
    email: "marco@ferretti.it",
    avatar: "M",
    credits: 285,
    joinDate: "Jan 1 2026",
    status: "Active",
    phone: "+39 02 1234567",
    company: "Ferretti Windows",
  },
  {
    id: "6",
    name: "Giulia Esposito",
    email: "g.esposito@leadpro.it",
    avatar: "G",
    credits: 285,
    joinDate: "Dec 15 2025",
    status: "Active",
    phone: "+39 06 9876543",
    company: "LeadPro Italy",
  },
  {
    id: "7",
    name: "Sara Conti",
    email: "s.conti@edil.it",
    avatar: "S",
    credits: 0,
    joinDate: "Nov 5 2025",
    status: "Suspended",
    phone: "+39 055 4443322",
    company: "Edil Costruzioni",
  },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Suspended">("All");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ? true : u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  // Handle status toggle (Suspend / Reactivate)
  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus: UserStatus = u.status === "Active" ? "Suspended" : "Active";
          if (newStatus === "Suspended") {
            toast.success(`${u.name} has been suspended.`);
          } else {
            toast.success(`${u.name} has been reactivated.`);
          }
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  return (
    <div className="space-y-6 pb-6 select-none font-sans">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          User Management
        </h1>
        <p className="text-sm text-slate-500 font-normal mt-1">
          5 registered users
        </p>
      </div>

      {/* ── Main White Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-2xs">
        {/* Search & Status Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6">
          {/* Pill Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-full text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
            />
          </div>

          {/* Status Filter Pill Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {(["All", "Active", "Suspended"] as const).map((tab) => {
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
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Table Container ── */}
        <div className="overflow-x-auto">
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isActive = user.status === "Active";

                  return (
                    <tr
                      key={`${user.id}-${idx}`}
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
                        {user.credits} credits
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
                              onClick={() => toggleUserStatus(user.id)}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 transition-colors cursor-pointer"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleUserStatus(user.id)}
                              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E6F8F2] hover:bg-[#d4f5e9] text-[#00BC7D] border border-emerald-100 transition-colors cursor-pointer"
                            >
                              Reactivate
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
        </div>

        {/* ── Table Footer / Pagination ── */}
        <div className="pt-6 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 1-5 of 48 leads</span>
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
                  <span className="font-semibold text-[#00BC7D]">{selectedUser.credits} credits</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Join Date</span>
                  <span className="font-semibold text-slate-700">{selectedUser.joinDate}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">Current Status</span>
                  <span
                    className={`font-semibold ${
                      selectedUser.status === "Active" ? "text-[#00BC7D]" : "text-rose-500"
                    }`}
                  >
                    {selectedUser.status}
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
                  toggleUserStatus(selectedUser.id);
                  setSelectedUser(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer ${
                  selectedUser.status === "Active"
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-[#00BC7D] hover:bg-[#00a86b]"
                }`}
              >
                {selectedUser.status === "Active" ? "Suspend User" : "Reactivate User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
