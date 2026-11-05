"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  accent: "green" | "blue" | "gray";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "New lead available: Windows & Doors in Milano",
    description: "A new lead in your preferred category is available.",
    timestamp: "5 min ago",
    isRead: false,
    accent: "green",
  },
  {
    id: "2",
    title: "Recommended lead: Solar Panels Padova",
    description: "Based on your preferences, this lead might interest you.",
    timestamp: "1 hour ago",
    isRead: false,
    accent: "blue",
  },
  {
    id: "3",
    title: "Credits added successfully",
    description: "150 credits added to your account. Balance: 285 credits.",
    timestamp: "2 hours ago",
    isRead: true,
    accent: "gray",
  },
  {
    id: "4",
    title: "Credit balance running low",
    description:
      "You have fewer than 50 credits. Consider topping up to avoid missing opportunities.",
    timestamp: "Yesterday",
    isRead: true,
    accent: "gray",
  },
  {
    id: "5",
    title: "Lead unlocked successfully",
    description:
      'You unlocked the lead "PVC window replacement" by Giulia Esposito.',
    timestamp: "2 days ago",
    isRead: true,
    accent: "gray",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true }))
    );
    toast.success("All notifications marked as read");
  };

  // Toggle single item read status
  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: !item.isRead } : item
      )
    );
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          Notifications
        </h1>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          className="text-sm font-semibold text-[#00BC7D] hover:text-[#00a86b] hover:underline transition-colors cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {/* ── Notification Items Stack ── */}
      <div className="space-y-4">
        {notifications.map((item) => {
          // Color styles based on accent type matching screenshot
          let bgStyle = "bg-[#EFF2F6] border-l-slate-300";
          if (item.accent === "green") {
            bgStyle = "bg-[#EAF7F0] border-l-[#00BC7D]";
          } else if (item.accent === "blue") {
            bgStyle = "bg-[#EBF2FA] border-l-[#38BDF8]";
          }

          return (
            <div
              key={item.id}
              onClick={() => handleToggleRead(item.id)}
              className={`rounded-2xl p-5 sm:p-6 border-l-4 border-y border-r border-slate-200/50 ${bgStyle} transition-all cursor-pointer shadow-2xs hover:shadow-xs`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Text Content */}
                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-[#0F172A]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-xs text-slate-400 pt-1">
                    {item.timestamp}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
