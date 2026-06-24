"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PurchaseRequest } from "../../types";
import { Table } from "../../components/ui/Table";
import { StatusBadge, PriorityBadge } from "../../components/ui/Badge";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../../components/ui/Pagination";

interface PRTableProps {
  data: PurchaseRequest[];
  loading?: boolean;
}

export const PRTable = ({ data, loading }: PRTableProps) => {
  const router = useRouter();

  const pg = usePagination({
    totalItems: data.length,
    initialPageSize: 8,
    pageSizeOptions: [8, 15, 25, 50],
  });

  const visibleData = pg.paginate(data);

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
    <div className="flex flex-col gap-3">
      <Table
        columns={columns}
        data={visibleData}
        loading={loading}
        emptyText="No purchase requests found."
        onRowClick={(row) => router.push(`/purchase-requests/${row.id}`)}
      />

      {/* Only show pagination controls when there is more than one page */}
      {!loading && pg.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
          {/* Summary */}
          <p className="text-xs text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-600">
              {pg.from}–{pg.to}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-600">{pg.totalItems}</span>{" "}
            requests
          </p>

          {/* Controls */}
          <Pagination
            {...pg}
            showInfo={false}
            showPageSize={true}
            showEdgeButtons={true}
          />
        </div>
      )}
    </div>
  );
};
