"use client";
import React, { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { api } from "../../lib/api";
import { PurchaseRequest } from "../../types";
import { PRTable } from "../../components/pr/PRTable";

export default function DashboardPage() {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PurchaseRequest[]>("/purchase-requests")
      .then((data) => {
        setPrs(data);
      })
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

  const recent = [...prs].slice(0, 8);

  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

        {/* Total amount */}
        <div className="card flex items-center gap-4 bg-gradient-to-r from-bisu-blue-DEFAULT to-bisu-purple-DEFAULT text-white border-0">
          <TrendingUp size={28} className="text-bisu-yellow-DEFAULT" />
          <div>
            <p className="text-white/70 text-sm font-medium">
              Total Procurement Value
            </p>
            <p className="text-2xl font-bold">
              ₱
              {stats.total_amount.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Recent PRs */}
        <div className="card">
          <h3 className="font-bold text-bisu-blue-DEFAULT mb-4">
            Recent Purchase Requests
          </h3>
          <PRTable data={recent} loading={loading} />
        </div>
      </div>
    </PageWrapper>
  );
}
