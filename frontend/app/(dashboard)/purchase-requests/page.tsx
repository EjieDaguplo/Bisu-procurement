"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { PRTable } from "@/src/components/pr/PRTable";
import { api } from "@/src/lib/api";
import { PurchaseRequest, PRStatus } from "@/src/types";

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
    setLoading(true);
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
          className="inline-flex items-center gap-2 bg-bisu-blue text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-bisu-blue-dark transition-colors"
        >
          <Plus size={16} /> New PR
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
              placeholder="Search PR number or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="max-w-xs w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value as PRStatus | "")}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <PRTable data={filtered} loading={loading} />
      </div>
    </PageWrapper>
  );
}
