import React from "react";
import { PRStatus, Priority } from "../../types";

const statusStyles: Record<PRStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-200 text-gray-600",
  COMPLETED: "bg-purple-100 text-purple-700",
};

const priorityStyles: Record<Priority, string> = {
  LOW: "bg-gray-100 text-gray-600",
  NORMAL: "bg-blue-50 text-blue-600",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export const StatusBadge = ({ status }: { status: PRStatus }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[status]}`}
  >
    {status.replace("_", " ")}
  </span>
);

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityStyles[priority]}`}
  >
    {priority}
  </span>
);
