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
import { api } from "../../../src/lib/api";
import { PurchaseRequest } from "../../../src/types";
import { PRTable } from "@/src/components/pr/PRTable";

export default function DashboardPage() {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

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

  const recent = [...prs].slice(0, 8);

  return (
    <PageWrapper title="Dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* ── Stats grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
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
        <div
          style={{
            background: "linear-gradient(to right, #1A3A8F, #5B2D8E)",
            borderRadius: "12px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 2px 12px rgba(26,58,143,0.20)",
          }}
        >
          <TrendingUp size={28} color="#F5C400" />
          <div>
            <p
              style={{
                color: "rgba(255,255,255,0.70)",
                fontSize: "0.875rem",
                fontWeight: 500,
                margin: "0 0 2px 0",
              }}
            >
              Total Procurement Value
            </p>
            <p
              style={{
                color: "#ffffff",
                fontSize: "1.5rem",
                fontWeight: 700,
                margin: 0,
              }}
            >
              ₱
              {stats.total_amount.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* ── Recent PRs ── */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #f3f4f6",
            padding: "24px",
            boxShadow: "0 2px 12px rgba(26,58,143,0.08)",
          }}
        >
          <h3
            style={{
              fontWeight: 700,
              color: "#1A3A8F",
              margin: "0 0 16px 0",
              fontSize: "1rem",
            }}
          >
            Recent Purchase Requests
          </h3>
          <PRTable data={recent} loading={loading} />
        </div>
      </div>
    </PageWrapper>
  );
}
