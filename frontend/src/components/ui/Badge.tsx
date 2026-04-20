import React from "react";
import { PRStatus, Priority } from "../../types";

const statusStyles: Record<
  PRStatus,
  { backgroundColor: string; color: string }
> = {
  DRAFT: { backgroundColor: "#f3f4f6", color: "#374151" },
  SUBMITTED: { backgroundColor: "#dbeafe", color: "#1d4ed8" },
  UNDER_REVIEW: { backgroundColor: "#fef9c3", color: "#92400e" },
  APPROVED: { backgroundColor: "#dcfce7", color: "#15803d" },
  REJECTED: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  CANCELLED: { backgroundColor: "#e5e7eb", color: "#4b5563" },
  COMPLETED: { backgroundColor: "#ede9fe", color: "#6d28d9" },
};

const priorityStyles: Record<
  Priority,
  { backgroundColor: string; color: string }
> = {
  LOW: { backgroundColor: "#f3f4f6", color: "#4b5563" },
  NORMAL: { backgroundColor: "#eff6ff", color: "#2563eb" },
  HIGH: { backgroundColor: "#ffedd5", color: "#c2410c" },
  URGENT: { backgroundColor: "#fee2e2", color: "#b91c1c" },
};

export const StatusBadge = ({ status }: { status: PRStatus }) => {
  const s = statusStyles[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        backgroundColor: s.backgroundColor,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const s = priorityStyles[priority];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        backgroundColor: s.backgroundColor,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {priority}
    </span>
  );
};
