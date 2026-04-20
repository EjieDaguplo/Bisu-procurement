"use client";
import React from "react";
import { PageWrapper } from "../../../src/components/layout/PageWrapper";
import { useNotifications } from "../../../src/hooks/useNotification";
import { Bell, CheckCheck } from "lucide-react";

const typeColors: Record<string, string> = {
  PR_SUBMITTED: "bg-blue-100 text-blue-700",
  PR_APPROVED: "bg-green-100 text-green-700",
  PR_REJECTED: "bg-red-100 text-red-700",
  PR_RETURNED: "bg-orange-100 text-orange-700",
  PR_COMPLETED: "bg-purple-100 text-purple-700",
  PENDING_ACTION: "bg-yellow-100 text-yellow-700",
  SYSTEM: "bg-gray-100 text-gray-700",
};

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, unreadCount } =
    useNotifications();

  return (
    <PageWrapper
      title="Notifications"
      action={
        unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-bisu-blue-light hover:text-bisu-blue-DEFAULT font-medium"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        ) : undefined
      }
    >
      <div className="space-y-2 max-w-2xl">
        {notifications.length === 0 && (
          <div className="card text-center py-10 text-gray-400">
            <Bell size={32} className="mx-auto mb-2 text-gray-300" />
            <p>No notifications yet.</p>
          </div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`card flex items-start gap-4 cursor-pointer transition-all ${!n.is_read ? "border-l-4 border-l-bisu-blue-DEFAULT" : "opacity-70"}`}
            onClick={() => {
              if (!n.is_read) markRead(n.id);
            }}
          >
            <div
              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.is_read ? "bg-bisu-blue-DEFAULT" : "bg-transparent"}`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColors[n.type] || typeColors.SYSTEM}`}
                >
                  {n.type.replace(/_/g, " ")}
                </span>
                {n.purchase_requests && (
                  <span className="text-xs font-mono text-gray-500">
                    {n.purchase_requests.pr_number}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-800">{n.title}</p>
              <p className="text-sm text-gray-600">{n.message}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {new Date(n.created_at).toLocaleString("en-PH")}
            </span>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
