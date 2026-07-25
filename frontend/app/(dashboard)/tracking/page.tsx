"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "../../../src/components/layout/PageWrapper";
import { api } from "../../../src/lib/api";
import { useAuth } from "../../../src/hooks/useAuth";
import { TrackingLog } from "../../../src/types";
import { MapPin, Search, ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "../../../src/components/ui/Badge";
import { PRStatus } from "../../../src/types";
import Link from "next/link";

type EnrichedLog = TrackingLog & {
  purchase_requests?: {
    id: number;
    pr_number: string | null;
    title: string;
    status: string;
  };
};

// ── Group logs by their PR ──────────────────────────────────
const groupByPR = (logs: EnrichedLog[]) => {
  const map = new Map<
    number,
    { pr: EnrichedLog["purchase_requests"]; logs: EnrichedLog[] }
  >();

  logs.forEach((log) => {
    const prId = log.purchase_request_id;
    if (!map.has(prId)) {
      map.set(prId, { pr: log.purchase_requests, logs: [] });
    }
    map.get(prId)!.logs.push(log);
  });

  return Array.from(map.values());
};

export default function TrackingPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<EnrichedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const isRequester = user?.role === "REQUESTER";

  useEffect(() => {
    api
      .get<EnrichedLog[]>("/tracking")
      .then((data) => {
        setLogs(data);
        // Auto-expand all PRs for requesters so they immediately see their trail
        if (user?.role === "REQUESTER") {
          const prIds = new Set(data.map((l) => l.purchase_request_id));
          setExpanded(prIds);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const toggleExpand = (prId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(prId) ? next.delete(prId) : next.add(prId);
      return next;
    });
  };

  // Filter across PR number, title, and action text
  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      (l.purchase_requests?.pr_number ?? "").toLowerCase().includes(q) ||
      (l.purchase_requests?.title ?? "").toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q)
    );
  });

  const grouped = groupByPR(filtered);

  return (
    <PageWrapper title="Document Tracking">
      <div className="flex flex-col gap-4">
        {/* ── Search ── */}
        <div className="relative max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            placeholder="Search PR number, title or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm
                       text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-bisu-blue/30
                       focus:border-bisu-blue transition-all"
          />
        </div>

        {/* ── Requester info banner ── */}
        {isRequester && !loading && (
          <div
            className="bg-bisu-blue/5 border border-bisu-blue/20 rounded-xl px-4 py-3
                          text-sm text-bisu-blue font-medium"
          >
            Showing document trail for your Purchase Requests only.
          </div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400 text-sm">
            <div
              className="w-4 h-4 border-2 border-gray-200 border-t-bisu-blue
                            rounded-full animate-spin"
            />
            Loading...
          </div>
        ) : grouped.length === 0 ? (
          /* ── Empty state ── */
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <MapPin size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {search
                ? "No results match your search."
                : isRequester
                  ? "No tracking activity for your PRs yet."
                  : "No tracking logs found."}
            </p>
          </div>
        ) : (
          /* ── Grouped accordion ── */
          <div className="flex flex-col gap-3">
            {grouped.map(({ pr, logs: prLogs }) => {
              const prId = pr?.id ?? prLogs[0].purchase_request_id;
              const isOpen = expanded.has(prId);
              // newest log is first (API returns desc order)
              const latestLog = prLogs[0];

              return (
                <div
                  key={prId}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* ── PR accordion header ── */}
                  <button
                    onClick={() => toggleExpand(prId)}
                    className="w-full flex items-center justify-between px-5 py-4
                               hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-lg bg-bisu-blue/10
                                      flex items-center justify-center flex-shrink-0"
                      >
                        <MapPin size={16} className="text-bisu-blue" />
                      </div>

                      {/* PR info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          {pr?.pr_number ? (
                            <span className="font-mono text-xs font-bold text-bisu-blue">
                              {pr.pr_number}
                            </span>
                          ) : (
                            <span
                              className="text-[0.65rem] font-semibold px-2 py-0.5
                                             rounded-full bg-amber-100 text-amber-700"
                            >
                              Pending Approval
                            </span>
                          )}
                          {pr?.status && (
                            <StatusBadge status={pr.status as PRStatus} />
                          )}
                        </div>

                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {pr?.title ?? `Request #${prId}`}
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5">
                          Latest:{" "}
                          <span className="font-medium text-bisu-purple">
                            {latestLog.action}
                          </span>
                          {" · "}
                          {new Date(latestLog.created_at).toLocaleDateString(
                            "en-PH",
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right: count + chevron */}
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-xs text-gray-400">
                        {prLogs.length} event{prLogs.length !== 1 ? "s" : ""}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* ── Expanded timeline ── */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      <div className="flex flex-col">
                        {prLogs
                          .slice()
                          .reverse() // oldest first in timeline
                          .map((log, i) => (
                            <div key={log.id} className="flex gap-3">
                              {/* Dot + connector line */}
                              <div className="flex flex-col items-center">
                                <div
                                  className="w-3 h-3 rounded-full bg-bisu-yellow
                                                border-2 border-bisu-blue
                                                flex-shrink-0 mt-0.5"
                                />
                                {i < prLogs.length - 1 && (
                                  <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                                )}
                              </div>

                              {/* Log content */}
                              <div className="pb-4 flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <span
                                    className="inline-flex items-center px-2 py-0.5
                                                   rounded-full text-[0.65rem] font-semibold
                                                   bg-bisu-purple/10 text-bisu-purple"
                                  >
                                    {log.action}
                                  </span>
                                  <span className="text-[0.65rem] text-gray-400 flex-shrink-0">
                                    {new Date(log.created_at).toLocaleString(
                                      "en-PH",
                                    )}
                                  </span>
                                </div>

                                {(log.from_office || log.to_office) && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {log.from_office && (
                                      <span>{log.from_office}</span>
                                    )}
                                    {log.from_office && log.to_office && (
                                      <span className="mx-1 text-gray-300">
                                        →
                                      </span>
                                    )}
                                    {log.to_office && (
                                      <span className="font-semibold text-gray-700">
                                        {log.to_office}
                                      </span>
                                    )}
                                  </p>
                                )}

                                {log.status_before && (
                                  <p className="text-[0.65rem] text-gray-400 mt-0.5">
                                    Status:{" "}
                                    <span className="font-medium">
                                      {log.status_before}
                                    </span>
                                    <span className="mx-1">→</span>
                                    <span className="font-semibold text-gray-600">
                                      {log.status_after}
                                    </span>
                                  </p>
                                )}

                                {log.remarks && (
                                  <p className="text-xs text-gray-500 italic mt-0.5">
                                    &ldquo;{log.remarks}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Link to PR detail */}
                      <div className="mt-1 pt-3 border-t border-gray-100">
                        <Link
                          href={`/purchase-requests/${prId}`}
                          className="text-xs font-semibold text-bisu-blue
                                     hover:text-bisu-blue-dark transition-colors"
                        >
                          View Purchase Request →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Footer summary ── */}
        {!loading && grouped.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            {grouped.length} PR{grouped.length !== 1 ? "s" : ""}
            {" · "}
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </p>
        )}
      </div>
    </PageWrapper>
  );
}
