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
      header: "PR Number", //fixed header name
      render: (row: PurchaseRequest) =>
        row.pr_number ? (
          //Has PR number fully approved, show it
          <span className="font-mono font-bold text-bisu-blue text-xs">
            {row.pr_number}
          </span>
        ) : (
          // No PR number yet show pending badge
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-amber-100 text-amber-700 whitespace-nowrap">
            Pending Approval
          </span>
        ),
    },
    {
      key: "title",
      header: "Title",
      render: (row: PurchaseRequest) => (
        <span
          className="font-medium text-gray-800"
          style={{
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
        <div className="flex items-center gap-1.5">
          {row.departments?.code && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[0.65rem] font-bold bg-bisu-blue/10 text-bisu-blue flex-shrink-0">
              {row.departments.code}
            </span>
          )}
          <span className="text-gray-500 text-xs truncate">
            {row.departments?.name || "—"}
          </span>
        </div>
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
      render: (row: PurchaseRequest) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={row.status} />
          {/*Show extra context badge based on status */}
          {row.status === "DRAFT" && (
            <span className="text-[0.6rem] text-gray-400 font-medium">
              Not submitted
            </span>
          )}
          {row.status === "SUBMITTED" && (
            <span className="text-[0.6rem] text-blue-500 font-medium">
              Awaiting Step 1
            </span>
          )}
          {row.status === "UNDER_REVIEW" && (
            <span className="text-[0.6rem] text-yellow-600 font-medium">
              In review process
            </span>
          )}
          {row.status === "APPROVED" && row.pr_number && (
            <span className="text-[0.6rem] text-green-600 font-medium font-mono">
              {row.pr_number}
            </span>
          )}
          {row.status === "REJECTED" && (
            <span className="text-[0.6rem] text-red-500 font-medium">
              See remarks
            </span>
          )}
          {row.status === "CANCELLED" && (
            <span className="text-[0.6rem] text-gray-400 font-medium">
              Cancelled by requester
            </span>
          )}
          {row.status === "COMPLETED" && (
            <span className="text-[0.6rem] text-purple-500 font-medium">
              Process complete
            </span>
          )}
        </div>
      ),
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
    <div className="flex flex-col gap-3">
      <Table
        columns={columns}
        data={visibleData}
        loading={loading}
        emptyText="No purchase requests found."
        onRowClick={(row) => router.push(`/purchase-requests/${row.id}`)}
      />

      {!loading && pg.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
          <p className="text-xs text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-600">
              {pg.from}–{pg.to}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-600">{pg.totalItems}</span>{" "}
            requests
          </p>
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
