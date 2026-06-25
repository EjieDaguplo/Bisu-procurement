"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { StatusBadge } from "@/src/components/ui/Badge";
import { api } from "@/src/lib/api";
import { PRStatus } from "@/src/types";
import { CheckCircle, XCircle, RotateCcw, ClipboardList } from "lucide-react";

interface Approval {
  id: number;
  action: string;
  purchase_requests: {
    id: number;
    pr_number: string;
    title: string;
    status: string;
    total_amount: number;
    users: { first_name: string; last_name: string };
  };
  approval_steps: { step_name: string };
}

const actionStyles = {
  approve: {
    btn: "bg-green-600 hover:bg-green-700",
    label: "Confirm Approve",
  },
  reject: {
    btn: "bg-red-600 hover:bg-red-700",
    label: "Confirm Reject",
  },
  return: {
    btn: "bg-orange-600 hover:bg-orange-700",
    label: "Confirm Return",
  },
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Approval | null>(null);
  const [remarks, setRemarks] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | "return" | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get<Approval[]>("/approvals/pending")
      .then(setApprovals)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAction = (a: Approval, act: "approve" | "reject" | "return") => {
    setSelected(a);
    setAction(act);
    setRemarks("");
    setError("");
  };

  const closeModal = () => {
    setSelected(null);
    setAction(null);
    setRemarks("");
    setError("");
  };

  const handleAction = async () => {
    if (!selected || !action) return;
    if (action !== "approve" && !remarks.trim()) {
      setError("Remarks are required for this action.");
      return;
    }
    setProcessing(true);
    try {
      await api.patch(`/approvals/${selected.id}/${action}`, { remarks });
      closeModal();
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PageWrapper title="Pending Approvals">
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : approvals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 m-0">No pending approvals.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {approvals.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-gray-100 px-6 py-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(26,58,143,0.06)]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-bisu-blue">
                    {a.purchase_requests.pr_number}
                  </span>
                  <StatusBadge
                    status={a.purchase_requests.status as PRStatus}
                  />
                </div>

                <p className="font-semibold text-gray-800 text-[0.9375rem] mb-1">
                  {a.purchase_requests.title}
                </p>

                <p className="text-sm text-gray-500 mb-1">
                  {a.purchase_requests.users.first_name}{" "}
                  {a.purchase_requests.users.last_name}
                  {" · "}₱
                  {Number(a.purchase_requests.total_amount).toLocaleString(
                    "en-PH",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}
                </p>

                <p className="text-xs font-medium text-bisu-purple m-0">
                  Step: {a.approval_steps.step_name}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openAction(a, "approve")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-[0.8125rem] rounded-lg transition-colors"
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => openAction(a, "return")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-[0.8125rem] rounded-lg transition-colors"
                >
                  <RotateCcw size={14} /> Return
                </button>
                <button
                  onClick={() => openAction(a, "reject")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-[0.8125rem] rounded-lg transition-colors"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Action Modal ── */}
      {selected && action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={closeModal}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[460px] m-4">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="m-0 text-lg font-bold text-bisu-blue capitalize">
                {action} Purchase Request
              </h2>
              <p className="mt-1 mb-0 text-sm text-gray-500">
                {selected.purchase_requests.pr_number} —{" "}
                {selected.purchase_requests.title}
              </p>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 flex flex-col gap-3">
              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3.5 py-2.5 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Remarks{" "}
                  {action !== "approve" ? (
                    <span className="text-red-600">*</span>
                  ) : (
                    "(optional)"
                  )}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  rows={4}
                  className="block w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 resize-none outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  processing ? "bg-gray-500" : actionStyles[action].btn
                }`}
              >
                {processing ? "Processing..." : actionStyles[action].label}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
