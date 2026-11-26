"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import toast from "react-hot-toast";
import { useState } from "react";
import { apiKeys } from "@/lib/api/keys";
import { nextFetch } from "@/lib/api/fetcher";
import type {
  Notification,
  NotificationListResponse,
  NotificationPagination,
  NotificationType,
} from "@/types/notification.interface";
import { formatLocalDateTime } from "@/utils/datetime";

type NotificationsData = NotificationListResponse["data"];
type PaginatedNotificationsResponse = {
  data: NotificationsData;
  pagination?: NotificationPagination;
};

async function fetchNotifications(
  url: string,
): Promise<PaginatedNotificationsResponse> {
  return (await nextFetch<NotificationsData>({
    url,
    preservePagination: true,
  })) as unknown as PaginatedNotificationsResponse;
}

function getAccent(type: NotificationType): "green" | "blue" | "gray" {
  if (type.includes("success") || type.includes("purchase")) return "green";
  if (type.includes("lead")) return "blue";
  return "gray";
}

function getTimestamp(notification: Notification) {
  return notification.timeAgo ?? formatLocalDateTime(notification.createdAt);
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const notificationsKey = apiKeys.notifications(
    new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    }).toString(),
  );
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<PaginatedNotificationsResponse>(notificationsKey, fetchNotifications);
  const { trigger: markRead, isMutating: isMarkingRead } = useSWRMutation(
    notificationsKey,
    (_key, { arg }: { arg: string }) =>
      nextFetch({ url: apiKeys.notificationRead(arg), method: "PATCH" }),
  );
  const { trigger: markAllRead, isMutating: isMarkingAllRead } = useSWRMutation(
    notificationsKey,
    () => nextFetch({ url: apiKeys.notificationsReadAll, method: "PATCH" }),
  );

  const notifications = data?.data.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPage ?? 1;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead(undefined, { throwOnError: true });
      await mutate();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Unable to mark notifications as read");
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead || isMarkingRead) return;

    try {
      await markRead(notification._id, { throwOnError: true });
      await mutate();
    } catch {
      toast.error("Unable to mark notification as read");
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {data?.data.unreadCount ?? 0} unread notifications
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={
            isMarkingAllRead || !notifications?.some((item) => !item.isRead)
          }
          className="text-sm font-semibold text-[#00BC7D] hover:text-[#00a86b] hover:underline transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isMarkingAllRead ? "Updating..." : "Mark all as read"}
        </button>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading notifications...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Unable to load notifications. Please try again.
        </div>
      )}

      {!isLoading && !error && notifications.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          You have no notifications yet.
        </div>
      )}

      <div className="space-y-4">
        {notifications.map((item) => {
          const accent = getAccent(item.type);
          let bgStyle = "bg-[#EFF2F6] border-l-slate-300";
          if (accent === "green") bgStyle = "bg-[#EAF7F0] border-l-[#00BC7D]";
          if (accent === "blue") bgStyle = "bg-[#EBF2FA] border-l-[#38BDF8]";

          return (
            <button
              key={item._id}
              type="button"
              onClick={() => handleMarkAsRead(item)}
              className={`block w-full rounded-2xl p-5 text-left sm:p-6 border-l-4 border-y border-r border-slate-200/50 ${bgStyle} transition-all cursor-pointer shadow-2xs hover:shadow-xs`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Text Content */}
                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-[#0F172A]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-xs text-slate-400 pt-1">
                    {getTimestamp(item)}
                  </p>
                </div>

                {/* Unread indicator dot */}
                {!item.isRead && (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#00BC7D] shrink-0 mt-1"
                    title="Unread"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, pagination.total)} of {pagination.total}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage - 1)}
              disabled={page === 1 || isValidating}
              className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="whitespace-nowrap font-medium text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={page >= totalPages || isValidating}
              className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
