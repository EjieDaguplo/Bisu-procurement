"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PurchaseRequest } from "../../types";
import { Table } from "./../ui/Table";
import { StatusBadge, PriorityBadge } from "../ui/Badge";

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
        <span className="font-mono font-semibold text-bisu-blue-DEFAULT text-xs">
          {row.pr_number}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (row: PurchaseRequest) => (
        <span className="font-medium text-gray-800 line-clamp-1">
          {row.title}
        </span>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (row: PurchaseRequest) => (
        <span className="text-gray-600">{row.departments?.name || "—"}</span>
      ),
    },
    {
      key: "total_amount",
      header: "Amount",
      render: (row: PurchaseRequest) => (
        <span className="font-semibold text-gray-800">
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
        <span className="text-xs text-gray-500">
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
