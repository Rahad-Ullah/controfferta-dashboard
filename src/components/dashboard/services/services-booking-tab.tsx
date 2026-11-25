"use client";

import BookingTable, {
  ApiAppointment,
} from "@/components/dashboard/services/booking-table";
import BookingTabs, {
  BookingTab,
} from "@/components/dashboard/services/booking-tabs";
import UserPagination from "@/components/dashboard/services/table-pagination";
import { useMemo, useState } from "react";

const STATIC_APPOINTMENTS: ApiAppointment[] = [
  {
    _id: "apt-1",
    uid: "BK-1001",
    customer: {
      firstName: "Marco",
      lastName: "Ferretti",
      email: "marco@ferretti.it",
    },
    professional: { firstName: "Giulia", lastName: "Esposito" },
    salon: { name: "Ferretti Serramenti" },
    scheduledAt: "2026-01-12T09:00:00.000Z",
    totalDurationInMinutes: 120,
    pricing: { total: 240, currency: "EUR" },
    paymentStatus: "paid",
    status: "confirmed",
  },
  {
    _id: "apt-2",
    uid: "BK-1002",
    customer: {
      firstName: "Luca",
      lastName: "Bianchi",
      email: "luca@bianchi.it",
    },
    professional: { firstName: "Roberto", lastName: "Marini" },
    salon: { name: "Solaris Energy" },
    scheduledAt: "2026-01-14T11:30:00.000Z",
    totalDurationInMinutes: 180,
    pricing: { total: 480, currency: "EUR" },
    paymentStatus: "unpaid",
    status: "pending",
  },
  {
    _id: "apt-3",
    uid: "BK-1003",
    customer: { firstName: "Anna", lastName: "Rossi", email: "anna@rossi.it" },
    professional: { firstName: "Paolo", lastName: "Greco" },
    salon: { name: "CasaMove Traslochi" },
    scheduledAt: "2026-01-09T08:00:00.000Z",
    totalDurationInMinutes: 240,
    pricing: { total: 650, currency: "EUR" },
    paymentStatus: "paid",
    status: "completed",
  },
  {
    _id: "apt-4",
    uid: "BK-1004",
    customer: {
      firstName: "Elena",
      lastName: "Conti",
      email: "elena@conti.it",
    },
    professional: { firstName: "Giulia", lastName: "Esposito" },
    salon: { name: "Infissi Group" },
    scheduledAt: "2026-01-16T15:00:00.000Z",
    totalDurationInMinutes: 90,
    pricing: { total: 180, currency: "EUR" },
    paymentStatus: "unpaid",
    status: "cancelled",
  },
];

export default function ServicesBookingTab() {
  const [activeTab, setActiveTab] = useState<BookingTab>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const appointments = useMemo(() => {
    return STATIC_APPOINTMENTS.filter((item) => {
      if (activeTab !== "All") {
        const expected = activeTab.toLowerCase().replace(" ", "_");
        if ((item.status || "").toLowerCase() !== expected) return false;
      }

      if (
        paymentStatusFilter !== "all" &&
        (item.paymentStatus || "").toLowerCase() !==
          paymentStatusFilter.toLowerCase()
      ) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const haystack = [
          item.uid,
          item.customer?.firstName,
          item.customer?.lastName,
          item.customer?.email,
          item.professional?.firstName,
          item.professional?.lastName,
          item.salon?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [activeTab, paymentStatusFilter, searchTerm]);

  const isLoading = false;
  const totalPages = 1;

  const handleTabChange = (tab: BookingTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePaymentStatusChange = (value: string) => {
    setPaymentStatusFilter(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setPaymentStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ── Filter Tabs Component ── */}
      <BookingTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── Bookings Table Component ── */}
      <BookingTable
        appointments={appointments}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusChange={handlePaymentStatusChange}
        onResetFilters={handleResetFilters}
      />

      {/* ── Pagination Component ── */}
      <UserPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(Number(page))}
      />
    </div>
  );
}
