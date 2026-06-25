"use client";
import React, { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { StatsCard } from "@/src/components/dashboard/StatsCard";
import { CampusMap } from "@/src/components/dashboard/campusMap";
import { api } from "../../../src/lib/api";
import { PurchaseRequest } from "../../../src/types";
import { PRTable } from "@/src/components/pr/PRTable";
import { usePagination } from "@/src/hooks/usePagination";
import { Pagination } from "@/src/components/ui/Pagination";

export default function DashboardPage() {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const recent = [...prs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const pg = usePagination({
    totalItems: recent.length,
    initialPageSize: 8,
    pageSizeOptions: [5, 8, 15, 25],
  });

  useEffect(() => {
    api
      .get<PurchaseRequest[]>("/purchase-requests")
      .then((data) => setPrs(data))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: prs.length,
    pending: prs.filter((p) => ["SUBMITTED", "UNDER_REVIEW"].includes(p.status))
      .length,
    approved: prs.filter((p) => p.status === "APPROVED").length,
    rejected: prs.filter((p) => p.status === "REJECTED").length,
    total_amount: prs.reduce((s, p) => s + Number(p.total_amount), 0),
  };

  return (
    <PageWrapper title="Dashboard">
      <div className="flex flex-col gap-6">
        {/* Campus map */}
        <CampusMap />
        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Total PRs"
            value={stats.total}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* ── Total procurement value banner ── */}
        <div className="bg-linear-to-r from-bisu-blue to-bisu-purple rounded-xl px-6 py-5 flex items-center gap-4 shadow-[0_2px_12px_rgba(26,58,143,0.20)]">
          <TrendingUp size={28} className="text-bisu-yellow shrink-0" />
          <div>
            <p className="text-white/70 text-sm font-medium mb-0.5">
              Total Procurement Value
            </p>
            <p className="text-white text-2xl font-bold m-0">
              ₱
              {stats.total_amount.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* ── Two-column row: Recent PRs (left, wider) + Campus Map (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
          {/* Recent PRs */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-[0_2px_12px_rgba(26,58,143,0.08)]">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h3 className="font-bold text-bisu-blue text-base m-0">
                Recent Purchase Requests
              </h3>

              {!loading && recent.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.8125rem] text-gray-400">Rows:</span>
                  <select
                    value={pg.pageSize}
                    onChange={(e) => pg.setPageSize(Number(e.target.value))}
                    className="text-[0.8125rem] border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 outline-none"
                  >
                    {pg.pageSizeOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <PRTable data={pg.paginate(recent)} loading={loading} />

            {!loading && recent.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Pagination
                  {...pg}
                  showPageSize={false}
                  showInfo={true}
                  showEdgeButtons={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
