"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "../../../src/components/layout/PageWrapper";
import { api } from "../../../src/lib/api";
import { StatsCard } from "../../../src/components/dashboard/StatsCard";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";

interface SummaryReport {
  total: number;
  byStatus: { status: string; _count: { id: number } }[];
  totalAmount: number;
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<SummaryReport>("/reports/summary")
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  const getCount = (status: string) =>
    summary?.byStatus.find((s) => s.status === status)?._count.id ?? 0;

  return (
    <PageWrapper title="Reports & Analytics">
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatsCard
              title="Total PRs"
              value={summary?.total ?? 0}
              icon={FileText}
              color="blue"
            />
            <StatsCard
              title="Approved"
              value={getCount("APPROVED")}
              icon={CheckCircle}
              color="green"
            />
            <StatsCard
              title="Rejected"
              value={getCount("REJECTED")}
              icon={XCircle}
              color="red"
            />
            <StatsCard
              title="Pending"
              value={getCount("SUBMITTED") + getCount("UNDER_REVIEW")}
              icon={Clock}
              color="yellow"
            />
          </div>

          <div className="card">
            <h3 className="font-bold text-bisu-blue-DEFAULT mb-4">
              Status Breakdown
            </h3>
            <div className="space-y-3">
              {summary?.byStatus.map((s) => {
                const pct = summary.total
                  ? Math.round((s._count.id / summary.total) * 100)
                  : 0;
                return (
                  <div key={s.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {s.status.replace("_", " ")}
                      </span>
                      <span className="text-gray-500">
                        {s._count.id} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-bisu-blue-DEFAULT h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card bg-gradient-to-r from-bisu-purple-DEFAULT to-bisu-blue-DEFAULT text-white border-0">
            <p className="text-white/70 text-sm">Total Procurement Value</p>
            <p className="text-3xl font-bold mt-1">
              ₱
              {Number(summary?.totalAmount ?? 0).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
