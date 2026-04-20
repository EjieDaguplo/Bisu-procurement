"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "../../../src/components/layout/PageWrapper";
import { api } from "../../../src/lib/api";
import { TrackingLog } from "../../../src/types";
import { MapPin } from "lucide-react";

export default function TrackingPage() {
  const [logs, setLogs] = useState<
    (TrackingLog & {
      purchase_requests?: { pr_number: string; title: string; status: string };
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get<typeof logs>("/tracking")
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.purchase_requests?.pr_number
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageWrapper title="Document Tracking">
      <div className="space-y-4">
        <input
          className="input-field max-w-xs"
          placeholder="Search by PR number or action..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((log) => (
              <div key={log.id} className="card flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-bisu-blue-light/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-bisu-blue-DEFAULT" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-bisu-blue-DEFAULT">
                      {log.purchase_requests?.pr_number}
                    </span>
                    <span className="text-xs bg-bisu-purple-DEFAULT/10 text-bisu-purple-DEFAULT px-2 py-0.5 rounded-full font-medium">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {log.purchase_requests?.title}
                  </p>
                  {(log.from_office || log.to_office) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {log.from_office && <span>{log.from_office} → </span>}
                      {log.to_office && (
                        <span className="font-medium">{log.to_office}</span>
                      )}
                    </p>
                  )}
                  {log.remarks && (
                    <p className="text-xs text-gray-500 italic mt-0.5">
                      {log.remarks}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(log.created_at).toLocaleString("en-PH")}
                </span>
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <p className="text-center text-gray-400 py-8 card">
                No tracking logs found.
              </p>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
