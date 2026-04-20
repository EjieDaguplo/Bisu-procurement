"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PurchaseRequest } from "../../types";
import { Table } from "../../components/ui/Table";
import { StatusBadge, PriorityBadge } from "../../components/ui/Badge";

interface PRTableProps {
  data: PurchaseRequest[];
  loading?: boolean;
}

export const PRTable = ({ data, loading }: PRTableProps) => {
  const router = useRouter();

  const columns = [
    {
      key: "pr_number",
      header: "PR Number",
      render: (row: PurchaseRequest) => (
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 700,
            color: "#1A3A8F",
            fontSize: "0.75rem",
          }}
        >
          {row.pr_number}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (row: PurchaseRequest) => (
        <span
          style={{
            fontWeight: 500,
            color: "#1f2937",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {row.title}
        </span>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (row: PurchaseRequest) => (
        <span style={{ color: "#4b5563" }}>{row.departments?.name || "—"}</span>
      ),
    },
    {
      key: "total_amount",
      header: "Amount",
      render: (row: PurchaseRequest) => (
        <span style={{ fontWeight: 600, color: "#1f2937" }}>
          ₱
          {Number(row.total_amount).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (row: PurchaseRequest) => (
        <PriorityBadge priority={row.priority} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: PurchaseRequest) => <StatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      header: "Date",
      render: (row: PurchaseRequest) => (
        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
          {new Date(row.created_at).toLocaleDateString("en-PH")}
        </span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      emptyText="No purchase requests found."
      onRowClick={(row) => router.push(`/purchase-requests/${row.id}`)}
    />
  );
};
