"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageWrapper } from "../../../../src/components/layout/PageWrapper";
import {
  StatusBadge,
  PriorityBadge,
} from "../../../../src/components/ui/Badge";
import { api } from "../../../../src/lib/api";
import { PurchaseRequest, TrackingLog } from "../../../../src/types";
import { ArrowLeft, Send, XCircle } from "lucide-react";
import Link from "next/link";

export default function PRDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pr, setPR] = useState<
    (PurchaseRequest & { tracking_logs?: TrackingLog[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PurchaseRequest & { tracking_logs?: TrackingLog[] }>(
        `/purchase-requests/${id}`,
      )
      .then(setPR)
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async () => {
    await api.patch(`/purchase-requests/${id}/submit`);
    router.refresh();
    window.location.reload();
  };

  const cancel = async () => {
    if (!confirm("Cancel this PR?")) return;
    await api.patch(`/purchase-requests/${id}/cancel`);
    router.push("/purchase-requests");
  };

  if (loading)
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!pr)
    return <div className="p-8 text-center text-red-500">PR not found.</div>;

  return (
    <PageWrapper title={`PR Detail — ${pr.pr_number}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/purchase-requests"
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </Link>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-lg">{pr.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={pr.status} />
              <PriorityBadge priority={pr.priority} />
              <span className="text-xs text-gray-400 font-mono">
                {pr.pr_number}
              </span>
            </div>
          </div>
          {pr.status === "DRAFT" && (
            <div className="flex gap-2">
              <button
                onClick={submit}
                className="btn-primary flex items-center gap-2"
              >
                <Send size={15} /> Submit for Approval
              </button>
              <button
                onClick={cancel}
                className="btn-danger flex items-center gap-2"
              >
                <XCircle size={15} /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h3 className="font-semibold text-bisu-blue-DEFAULT mb-3">
                Request Details
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">Requested By</dt>
                  <dd className="font-medium">
                    {pr.users?.first_name} {pr.users?.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Department</dt>
                  <dd className="font-medium">{pr.departments?.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Date Needed</dt>
                  <dd className="font-medium">
                    {pr.date_needed
                      ? new Date(pr.date_needed).toLocaleDateString("en-PH")
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Total Amount</dt>
                  <dd className="font-bold text-bisu-blue-DEFAULT">
                    ₱
                    {Number(pr.total_amount).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-500">Purpose</dt>
                  <dd className="font-medium">{pr.purpose}</dd>
                </div>
                {pr.remarks && (
                  <div className="col-span-2">
                    <dt className="text-gray-500">Remarks</dt>
                    <dd>{pr.remarks}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Line Items */}
            <div className="card">
              <h3 className="font-semibold text-bisu-blue-DEFAULT mb-3">
                Items
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {[
                        "Description",
                        "Unit",
                        "Qty",
                        "Unit Price",
                        "Subtotal",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-2 text-gray-600 font-semibold"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pr.pr_line_items?.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2">{item.unit}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">
                          ₱
                          {Number(item.unit_price).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-3 py-2 font-semibold">
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
                </table>
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="card">
            <h3 className="font-semibold text-bisu-blue-DEFAULT mb-3">
              Document Trail
            </h3>
            <div className="space-y-3">
              {pr.tracking_logs?.length ? (
                pr.tracking_logs.map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-bisu-yellow-DEFAULT mt-0.5 flex-shrink-0" />
                      {i < (pr.tracking_logs?.length || 0) - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-semibold text-bisu-blue-DEFAULT">
                        {log.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString("en-PH")}
                      </p>
                      {log.remarks && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          {log.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">
                  No tracking activity yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
