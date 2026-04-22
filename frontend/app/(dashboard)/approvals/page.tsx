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

  const actionColors = {
    approve: { bg: "#16a34a", hover: "#15803d", label: "Confirm Approve" },
    reject: { bg: "#dc2626", hover: "#b91c1c", label: "Confirm Reject" },
    return: { bg: "#ea580c", hover: "#c2410c", label: "Confirm Return" },
  };

  return (
    <PageWrapper title="Pending Approvals">
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
          Loading...
        </div>
      ) : approvals.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #f3f4f6",
          }}
        >
          <ClipboardList
            size={40}
            color="#d1d5db"
            style={{ margin: "0 auto 12px" }}
          />
          <p style={{ color: "#9ca3af", margin: 0 }}>No pending approvals.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {approvals.map((a) => (
            <div
              key={a.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "1px solid #f3f4f6",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 2px 8px rgba(26,58,143,0.06)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#1A3A8F",
                    }}
                  >
                    {a.purchase_requests.pr_number}
                  </span>
                  <StatusBadge
                    status={a.purchase_requests.status as PRStatus}
                  />
                </div>
                <p
                  style={{
                    fontWeight: 600,
                    color: "#1f2937",
                    margin: "0 0 4px 0",
                    fontSize: "0.9375rem",
                  }}
                >
                  {a.purchase_requests.title}
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    margin: "0 0 4px 0",
                  }}
                >
                  {a.purchase_requests.users.first_name}{" "}
                  {a.purchase_requests.users.last_name}
                  {" · "}₱
                  {Number(a.purchase_requests.total_amount).toLocaleString(
                    "en-PH",
                    { minimumFractionDigits: 2 },
                  )}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#7C4DB3",
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  Step: {a.approval_steps.step_name}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button
                  onClick={() => openAction(a, "approve")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    backgroundColor: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                  }}
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => openAction(a, "return")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    backgroundColor: "#ea580c",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={14} /> Return
                </button>
                <button
                  onClick={() => openAction(a, "reject")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                  }}
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={closeModal}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(2px)",
            }}
          />

          <div
            style={{
              position: "relative",
              backgroundColor: "#fff",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              width: "100%",
              maxWidth: "460px",
              margin: "16px",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#1A3A8F",
                  textTransform: "capitalize",
                }}
              >
                {action} Purchase Request
              </h2>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}
              >
                {selected.purchase_requests.pr_number} —{" "}
                {selected.purchase_requests.title}
              </p>
            </div>

            {/* Modal body */}
            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {error && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    color: "#b91c1c",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  Remarks{" "}
                  {action !== "approve" ? (
                    <span style={{ color: "#b91c1c" }}>*</span>
                  ) : (
                    "(optional)"
                  )}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  rows={4}
                  style={{
                    display: "block",
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontSize: "0.875rem",
                    color: "#111827",
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                padding: "16px 24px",
                borderTop: "1px solid #f3f4f6",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#fff",
                  color: "#374151",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: processing
                    ? "#6b7280"
                    : actionColors[action].bg,
                  color: "#fff",
                  fontWeight: 600,
                  cursor: processing ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                }}
              >
                {processing ? "Processing..." : actionColors[action].label}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
