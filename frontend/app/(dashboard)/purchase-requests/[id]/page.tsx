//CHANGES
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { StatusBadge, PriorityBadge } from "@/src/components/ui/Badge";
import { api } from "@/src/lib/api";
import { PurchaseRequest, TrackingLog } from "@/src/types";
import {
  ArrowLeft,
  Send,
  XCircle,
  Trash2,
  ShieldAlert,
  Hash,
} from "lucide-react";
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

  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.id === pr?.requested_by;
  const canSoftDelete = isOwner && pr?.status === "DRAFT";
  const canForceDelete = isAdmin;

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
    //page title uses ID when no PR number assigned yet
    <PageWrapper
      title={pr.pr_number ? `PR — ${pr.pr_number}` : `Request #${id}`}
    >
      <div className="flex flex-col gap-6 max-w-6xl">
        {/* ── Confirm delete banner ── */}
        {confirmDelete && (
          <div className="rounded-xl border px-5 py-4 flex items-start gap-4 shadow-sm bg-red-50 border-red-200">
            <div className="flex-1">
              {confirmDelete === "force" ? (
                <>
                  <p className="font-bold text-red-700 text-sm mb-0.5 flex items-center gap-1.5">
                    <ShieldAlert size={15} /> Permanently delete this PR?
                  </p>
                  <p className="text-xs text-red-600">
                    This will remove{" "}
                    <span className="font-semibold">
                      {pr.pr_number ?? `Request #${id}`}
                    </span>{" "}
                    and all its line items, approvals, tracking logs, and
                    notifications. This cannot be undone.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-red-700 text-sm mb-0.5">
                    Delete this draft?
                  </p>
                  <p className="text-xs text-red-600">
                    <span className="font-semibold">Request #{id}</span> will be
                    permanently removed.
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

              {/*PR number shown only when assigned (APPROVED) */}
              {pr.pr_number ? (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-bisu-blue bg-bisu-blue/10 px-2 py-0.5 rounded-full">
                  <Hash size={11} />
                  {pr.pr_number}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-amber-100 text-amber-700">
                  No PR Number — Pending Approval
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
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

            {canSoftDelete && !isAdmin && (
              <button
                onClick={() => setConfirmDelete("soft")}
                disabled={deleting || !!confirmDelete}
                className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={15} /> Delete
              </button>
            )}

            {canForceDelete && (
              <button
                onClick={() => setConfirmDelete("force")}
                disabled={deleting || !!confirmDelete}
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
                {/*Added PR Number row — only shows when approved */}
                {pr.pr_number && (
                  <div className="col-span-2 bg-green-50 rounded-lg px-4 py-3 border border-green-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Hash size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium mb-0.5">
                        Official PR Number
                      </p>
                      <p className="font-mono font-extrabold text-green-700 text-lg leading-none">
                        {pr.pr_number}
                      </p>
                    </div>
                  </div>
                )}

                {[
                  {
                    label: "Requested By",
                    value: `${pr.users?.first_name} ${pr.users?.last_name}`,
                  },
                  {
                    label: "Department",
                    value: pr.departments
                      ? `${pr.departments.name} (${(pr.departments as { code?: string }).code ?? ""})`
                      : "—",
                  },
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
                      className={`font-semibold text-sm ${highlight ? "text-bisu-blue text-base font-bold" : "text-gray-800"}`}
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

            {/* Line Items */}
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
                        className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
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

          {/* Right: tracking */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm self-start">
            <h3 className="font-bold text-bisu-blue text-base mb-4">
              Document Trail
              {trackingLogs.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({trackingLogs.length})
                </span>
              )}
            </h3>

            {/*Approval status progress — shows which steps are done */}
            {pr.status !== "DRAFT" && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Approval Progress
                </p>
                {pr.status === "APPROVED" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5l2.5 2.5L8 3"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-700">
                        Fully Approved
                      </p>
                      {pr.pr_number && (
                        <p className="text-[0.65rem] text-green-600 font-mono font-semibold">
                          {pr.pr_number}
                        </p>
                      )}
                    </div>
                  </div>
                ) : pr.status === "REJECTED" ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <XCircle size={12} color="white" />
                    </div>
                    <p className="text-xs font-bold text-red-600">Rejected</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <p className="text-xs font-medium text-amber-700">
                      {pr.status === "SUBMITTED"
                        ? "Awaiting Step 1 Review"
                        : "Under Review"}
                    </p>
                  </div>
                )}
              </div>
            )}

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
