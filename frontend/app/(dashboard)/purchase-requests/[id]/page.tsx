//this is the detail page for a single purchase request, showing its details, line items, and tracking logs. It also allows the owner to submit or cancel the PR, and allows the owner or admin to delete the PR (soft delete for owner if DRAFT, force delete for admin at any status).
//C:\Users\ejiedags\Desktop\bisu-procurement\frontend\app\(dashboard)\purchase-requests\[id]\page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { StatusBadge, PriorityBadge } from "@/src/components/ui/Badge";
import { api } from "@/src/lib/api";
import { PurchaseRequest, TrackingLog } from "@/src/types";
import { ArrowLeft, Send, XCircle, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";

export default function PRDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [pr, setPR] = useState<
    (PurchaseRequest & { tracking_logs?: TrackingLog[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Confirm dialog state
  const [confirmDelete, setConfirmDelete] = useState<"soft" | "force" | null>(
    null,
  );

  useEffect(() => {
    api
      .get<PurchaseRequest & { tracking_logs?: TrackingLog[] }>(
        `/purchase-requests/${id}`,
      )
      .then(setPR)
      .finally(() => setLoading(false));
  }, [id]);

  // ── Derived permissions ──────────────────────────────────────────────────
  const isAdmin = user?.role === "ADMIN";
  // Owner = the user who created this PR
  const isOwner = user?.id === pr?.requested_by;
  // Owner can soft-delete only while DRAFT
  const canSoftDelete = isOwner && pr?.status === "DRAFT";
  // Admin can force-delete at any status
  const canForceDelete = isAdmin;

  // ── Actions ──────────────────────────────────────────────────────────────
  const submit = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/purchase-requests/${id}/submit`);
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async () => {
    if (!confirm("Cancel this PR?")) return;
    setCancelling(true);
    try {
      await api.patch(`/purchase-requests/${id}/cancel`);
      router.push("/purchase-requests");
    } finally {
      setCancelling(false);
    }
  };

  // Owner soft-delete (DRAFT only) → DELETE /purchase-requests/:id
  const handleSoftDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/purchase-requests/${id}`);
      router.push("/purchase-requests");
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  // Admin force-delete (any status, full cascade) → DELETE /purchase-requests/:id/force
  const handleForceDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/purchase-requests/${id}/force`);
      router.push("/purchase-requests");
    } catch (err) {
      console.error("Force delete failed:", err);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  // ── Render guards ─────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex items-center justify-center p-12 text-gray-400">
        Loading...
      </div>
    );
  if (!pr)
    return (
      <div className="flex items-center justify-center p-12 text-red-500">
        PR not found.
      </div>
    );

  const trackingLogs = pr.tracking_logs ?? [];
  const lineItems = pr.pr_line_items ?? [];

  return (
    <PageWrapper title={`PR Detail — ${pr.pr_number}`}>
      <div className="flex flex-col gap-6 max-w-6xl">
        {/* ── Inline confirm dialogs ── */}
        {confirmDelete && (
          <div
            className="rounded-xl border px-5 py-4 flex items-start gap-4 shadow-sm
            bg-red-50 border-red-200"
          >
            <div className="flex-1">
              {confirmDelete === "force" ? (
                <>
                  <p className="font-bold text-red-700 text-sm mb-0.5 flex items-center gap-1.5">
                    <ShieldAlert size={15} /> Permanently delete this PR?
                  </p>
                  <p className="text-xs text-red-600">
                    This will remove{" "}
                    <span className="font-semibold">{pr.pr_number}</span> and
                    all its line items, approvals, tracking logs, and
                    notifications. This cannot be undone.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-red-700 text-sm mb-0.5">
                    Delete this draft PR?
                  </p>
                  <p className="text-xs text-red-600">
                    <span className="font-semibold">{pr.pr_number}</span> will
                    be permanently removed.
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={
                  confirmDelete === "force"
                    ? handleForceDelete
                    : handleSoftDelete
                }
                disabled={deleting}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-start gap-3">
          <Link
            href="/purchase-requests"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-800 text-lg mb-1.5 truncate">
              {pr.title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={pr.status} />
              <PriorityBadge priority={pr.priority} />
              <span className="text-xs text-gray-400 font-mono">
                {pr.pr_number}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
            {/* Submit + Cancel — owner, DRAFT only */}
            {pr.status === "DRAFT" && isOwner && (
              <>
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-bisu-blue hover:bg-bisu-blue-dark text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={15} />
                  {submitting ? "Submitting..." : "Submit for Approval"}
                </button>
                <button
                  onClick={cancel}
                  disabled={cancelling}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle size={15} /> Cancel
                </button>
              </>
            )}

            {/* Owner soft-delete — DRAFT only, not shown if admin (admin has force-delete) */}
            {canSoftDelete && !isAdmin && (
              <button
                onClick={() => setConfirmDelete("soft")}
                disabled={deleting || !!confirmDelete}
                title="Delete this draft"
                className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={15} /> Delete
              </button>
            )}

            {/* Admin force-delete — any status */}
            {canForceDelete && (
              <button
                onClick={() => setConfirmDelete("force")}
                disabled={deleting || !!confirmDelete}
                title="Admin: permanently delete this PR and all related records"
                className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldAlert size={15} /> Force Delete
              </button>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: details + items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Request Details */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-bisu-blue text-base mb-4">
                Request Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Requested By",
                    value: `${pr.users?.first_name} ${pr.users?.last_name}`,
                  },
                  { label: "Department", value: pr.departments?.name ?? "—" },
                  {
                    label: "Date Needed",
                    value: pr.date_needed
                      ? new Date(pr.date_needed).toLocaleDateString("en-PH")
                      : "—",
                  },
                  {
                    label: "Total Amount",
                    value: `₱${Number(pr.total_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
                    highlight: true,
                  },
                ].map(({ label, value, highlight }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">
                      {label}
                    </p>
                    <p
                      className={`font-semibold text-sm ${
                        highlight
                          ? "text-bisu-blue text-base font-bold"
                          : "text-gray-800"
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">
                    Purpose
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {pr.purpose}
                  </p>
                </div>
                {pr.remarks && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">
                      Remarks
                    </p>
                    <p className="text-sm text-gray-700">{pr.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items — no pagination; all items shown (this is a detail view) */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-bisu-blue text-base mb-4">
                Items
                {lineItems.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    ({lineItems.length} total)
                  </span>
                )}
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      {[
                        "Description",
                        "Unit",
                        "Qty",
                        "Unit Price",
                        "Subtotal",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-2.5 font-semibold text-gray-600 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr
                        key={i}
                        className={`border-b border-gray-50 ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-gray-800">
                          {item.description}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">
                          {item.unit}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">
                          ₱
                          {Number(item.unit_price).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-bisu-blue">
                          ₱
                          {(
                            Number(item.quantity) * Number(item.unit_price)
                          ).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td
                        colSpan={4}
                        className="px-3 py-3 font-bold text-gray-700 text-right"
                      >
                        Total
                      </td>
                      <td className="px-3 py-3 font-bold text-bisu-blue text-base">
                        ₱
                        {Number(pr.total_amount).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Right: tracking — all logs, no pagination on detail view */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm self-start">
            <h3 className="font-bold text-bisu-blue text-base mb-4">
              Document Trail
              {trackingLogs.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({trackingLogs.length})
                </span>
              )}
            </h3>

            {trackingLogs.length ? (
              <div className="flex flex-col">
                {trackingLogs.map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-bisu-yellow border-2 border-bisu-blue flex-shrink-0 mt-0.5" />
                      {i < trackingLogs.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="text-xs font-bold text-bisu-blue mb-0.5">
                        {log.action}
                      </p>
                      {(log.from_office || log.to_office) && (
                        <p className="text-xs text-bisu-purple mb-0.5">
                          {log.from_office}
                          {log.from_office && log.to_office && " → "}
                          {log.to_office && (
                            <span className="font-semibold">
                              {log.to_office}
                            </span>
                          )}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mb-0.5">
                        {new Date(log.created_at).toLocaleString("en-PH")}
                      </p>
                      {log.remarks && (
                        <p className="text-xs text-gray-500 italic">
                          {log.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No tracking activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
