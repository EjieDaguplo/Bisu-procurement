"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageWrapper } from "../../components/layout/PageWrapper";
import { PRTable } from "../../components/pr/PRTable";
import { api } from "../../lib/api";
import { PurchaseRequest, PRStatus } from "../../types";

const STATUSES: PRStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
];

export default function PurchaseRequestsPage() {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatus] = useState<PRStatus | "">("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    api
      .get<PurchaseRequest[]>(`/purchase-requests${params}`)
      .then(setPrs)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = prs.filter(
    (p) =>
      p.pr_number.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageWrapper
      title="Purchase Requests"
      action={
        <Link
          href="/purchase-requests/create"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> New PR
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input-field max-w-xs"
            placeholder="Search PR number or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input-field max-w-xs"
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value as PRStatus | "")}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <PRTable data={filtered} loading={loading} />
      </div>
    </PageWrapper>
  );
}
