"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "../../../src/components/layout/PageWrapper";
import { StatusBadge } from "../../../src/components/ui/Badge";
import { api } from "../../../src/lib/api";
import { Modal } from "../../../src/components/ui/Modal";

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

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Approval | null>(null);
  const [remarks, setRemarks] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | "return" | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);

  const load = () =>
    api
      .get<Approval[]>("/approvals/pending")
      .then(setApprovals)
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const handleAction = async () => {
    if (!selected || !action) return;
    setProcessing(true);
    try {
      await api.patch(`/approvals/${selected.id}/${action}`, { remarks });
      setSelected(null);
      setAction(null);
      setRemarks("");
      load();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PageWrapper title="Pending Approvals">
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : (
        <div className="space-y-3">
          {approvals.length === 0 && (
            <p className="text-center text-gray-400 py-8 card">
              No pending approvals.
            </p>
          )}
          {approvals.map((a) => (
            <div key={a.id} className="card flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-bisu-blue-DEFAULT">
                    {a.purchase_requests.pr_number}
                  </span>
                  <StatusBadge
                    status={
                      a.purchase_requests.status as Parameters<
                        typeof StatusBadge
                      >[0]["status"]
                    }
                  />
                </div>
                <p className="font-semibold text-gray-800">
                  {a.purchase_requests.title}
                </p>
                <p className="text-sm text-gray-500">
                  {a.purchase_requests.users.first_name}{" "}
                  {a.purchase_requests.users.last_name} &bull; ₱
                  {Number(a.purchase_requests.total_amount).toLocaleString(
                    "en-PH",
                  )}
                </p>
                <p className="text-xs text-bisu-purple-DEFAULT mt-0.5">
                  Step: {a.approval_steps.step_name}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelected(a);
                    setAction("approve");
                  }}
                  className="btn-primary text-sm py-2 px-3 bg-green-600 hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelected(a);
                    setAction("return");
                  }}
                  className="btn-secondary text-sm py-2 px-3"
                >
                  Return
                </button>
                <button
                  onClick={() => {
                    setSelected(a);
                    setAction("reject");
                  }}
                  className="btn-danger text-sm py-2 px-3"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => {
          setSelected(null);
          setAction(null);
          setRemarks("");
        }}
        title={`${action?.toUpperCase()} — ${selected?.purchase_requests.pr_number}`}
      >
        <p className="text-sm text-gray-600 mb-4">
          {selected?.purchase_requests.title}
        </p>
        <label className="label">
          Remarks {action !== "approve" ? "*" : "(optional)"}
        </label>
        <textarea
          className="input-field min-h-[90px] resize-none"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter remarks..."
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => {
              setSelected(null);
              setAction(null);
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={processing}
            className={`px-4 py-2 rounded-lg text-white text-sm font-semibold ${action === "approve" ? "bg-green-600 hover:bg-green-700" : action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600"}`}
          >
            {processing ? "Processing..." : `Confirm ${action}`}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
