"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "../../../src/components/layout/PageWrapper";
import { api } from "../../../src/lib/api";
import { StatsCard } from "../../../src/components/dashboard/StatsCard";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface SummaryReport {
  total: number;
  byStatus: { status: string; _count: { id: number } }[];
  totalAmount: number;
}

// Color map per status
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  SUBMITTED: "#60a5fa",
  UNDER_REVIEW: "#fbbf24",
  APPROVED: "#34d399",
  REJECTED: "#f87171",
  CANCELLED: "#cbd5e1",
  COMPLETED: "#a78bfa",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

// Custom Tooltip for Pie
const PieTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { pct: number } }[];
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-sm">
      <p className="font-bold text-gray-800 mb-0.5">{d.name}</p>
      <p className="text-gray-500">
        Count: <span className="font-semibold text-gray-700">{d.value}</span>
      </p>
      <p className="text-gray-500">
        Share:{" "}
        <span className="font-semibold text-gray-700">{d.payload.pct}%</span>
      </p>
    </div>
  );
};

// Custom Tooltip for Bar
const BarTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-sm">
      <p className="font-bold text-gray-800 mb-0.5">
        {STATUS_LABELS[label ?? ""] ?? label}
      </p>
      <p className="text-gray-500">
        PRs:{" "}
        <span className="font-semibold text-gray-700">{payload[0].value}</span>
      </p>
    </div>
  );
};

export default function ReportsPage() {
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<"pie" | "bar">("pie");

  useEffect(() => {
    api
      .get<SummaryReport>("/reports/summary")
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  const getCount = (status: string) =>
    summary?.byStatus.find((s) => s.status === status)?._count.id ?? 0;

  // Prepare chart data
  const chartData = (summary?.byStatus ?? [])
    .filter((s) => s._count.id > 0)
    .map((s) => ({
      name: STATUS_LABELS[s.status] ?? s.status,
      value: s._count.id,
      status: s.status,
      color: STATUS_COLORS[s.status] ?? "#94a3b8",
      pct: summary?.total ? Math.round((s._count.id / summary.total) * 100) : 0,
    }));

  return (
    <PageWrapper title="Reports & Analytics">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-bisu-blue rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Stats cards */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
          </div> */}

          {/* Total procurement value banner */}
          <div
            className="rounded-xl px-6 py-5 flex items-center gap-4"
            style={{
              background: "linear-gradient(to right, #5B2D8E, #1A3A8F)",
              boxShadow: "0 2px 12px rgba(26,58,143,0.20)",
            }}
          >
            <TrendingUp size={28} color="#F5C400" className="flex-shrink-0" />
            <div>
              <p className="text-white/70 text-sm font-medium mb-0.5">
                Total Procurement Value
              </p>
              <p className="text-white text-3xl font-bold m-0">
                ₱
                {Number(summary?.totalAmount ?? 0).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Chart + breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Chart card */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              {/* Chart toggle */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-bisu-blue text-base m-0">
                  PR Distribution
                </h3>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveChart("pie")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      activeChart === "pie"
                        ? "bg-white text-bisu-blue shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <PieChartIcon size={13} /> Pie
                  </button>
                  <button
                    onClick={() => setActiveChart("bar")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      activeChart === "bar"
                        ? "bg-white text-bisu-blue shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <BarChart3 size={13} /> Bar
                  </button>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                  No data to display yet.
                </div>
              ) : activeChart === "pie" ? (
                /* Pie Chart */
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs text-gray-600">{value}</span>
                      )}
                    />
                    {/* Center label */}
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                /* Bar Chart */
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
                    barSize={32}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickFormatter={(v) =>
                        STATUS_LABELS[v]?.split(" ")[0] ?? v
                      }
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<BarTooltip />}
                      cursor={{ fill: "#f9fafb" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Status breakdown list */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-bisu-blue text-base m-0">
                Status Breakdown
              </h3>

              <div className="flex flex-col gap-3">
                {(summary?.byStatus ?? []).map((s) => {
                  const pct = summary?.total
                    ? Math.round((s._count.id / summary.total) * 100)
                    : 0;
                  const color = STATUS_COLORS[s.status] ?? "#94a3b8";
                  const label = STATUS_LABELS[s.status] ?? s.status;

                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">
                            {s._count.id}
                          </span>
                          <span className="text-xs text-gray-400 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary totals */}
              <div className="mt-2 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total PRs</span>
                  <span className="font-bold text-gray-800">
                    {summary?.total ?? 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Approved</span>
                  <span className="font-bold text-green-600">
                    {getCount("APPROVED")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending</span>
                  <span className="font-bold text-yellow-600">
                    {getCount("SUBMITTED") + getCount("UNDER_REVIEW")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rejected</span>
                  <span className="font-bold text-red-500">
                    {getCount("REJECTED")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Approval Rate</span>
                  <span className="font-bold text-bisu-blue">
                    {summary?.total
                      ? Math.round((getCount("APPROVED") / summary.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Per-status detailed cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(summary?.byStatus ?? []).map((s) => {
              const color = STATUS_COLORS[s.status] ?? "#94a3b8";
              const label = STATUS_LABELS[s.status] ?? s.status;
              const pct = summary?.total
                ? Math.round((s._count.id / summary.total) * 100)
                : 0;

              return (
                <div
                  key={s.status}
                  className="bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm"
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {label}
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-gray-800 mb-0.5">
                    {s._count.id}
                  </p>
                  <p className="text-xs text-gray-400">{pct}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
