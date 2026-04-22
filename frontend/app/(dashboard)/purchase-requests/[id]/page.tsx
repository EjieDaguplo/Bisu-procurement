"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { StatusBadge, PriorityBadge } from "@/src/components/ui/Badge";
import { api } from "@/src/lib/api";
import { PurchaseRequest, TrackingLog } from "@/src/types";
import { ArrowLeft, Send, XCircle } from "lucide-react";
import Link from "next/link";

export default function PRDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pr, setPR] = useState<
    (PurchaseRequest & { tracking_logs?: TrackingLog[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api
      .get<PurchaseRequest & { tracking_logs?: TrackingLog[] }>(
        `/purchase-requests/${id}`,
      )
      .then(setPR)
      .finally(() => setLoading(false));
  }, [id]);

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

  if (loading)
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#9ca3af" }}>
        Loading...
      </div>
    );
  if (!pr)
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#b91c1c" }}>
        PR not found.
      </div>
    );

  return (
    <PageWrapper title={`PR Detail — ${pr.pr_number}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <Link
            href="/purchase-requests"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              color: "#4b5563",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} />
          </Link>

          <div style={{ flex: 1 }}>
            <h2
              style={{
                margin: "0 0 6px 0",
                fontWeight: 700,
                color: "#1f2937",
                fontSize: "1.125rem",
              }}
            >
              {pr.title}
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <StatusBadge status={pr.status} />
              <PriorityBadge priority={pr.priority} />
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  fontFamily: "monospace",
                }}
              >
                {pr.pr_number}
              </span>
            </div>
          </div>

          {pr.status === "DRAFT" && (
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button
                onClick={submit}
                disabled={submitting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  backgroundColor: submitting ? "#6b7280" : "#1A3A8F",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                <Send size={15} />{" "}
                {submitting ? "Submitting..." : "Submit for Approval"}
              </button>
              <button
                onClick={cancel}
                disabled={cancelling}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  backgroundColor: cancelling ? "#6b7280" : "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: cancelling ? "not-allowed" : "pointer",
                }}
              >
                <XCircle size={15} /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* ── Body grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "24px",
          }}
        >
          {/* Left: details + items */}
          <div
            style={{
              gridColumn: "span 2",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Details card */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "1px solid #f3f4f6",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(26,58,143,0.06)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontWeight: 700,
                  color: "#1A3A8F",
                  fontSize: "1rem",
                }}
              >
                Request Details
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {[
                  {
                    label: "Requested By",
                    value: `${pr.users?.first_name} ${pr.users?.last_name}`,
                  },
                  { label: "Department", value: pr.departments?.name },
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
                    <p
                      style={{
                        margin: "0 0 2px 0",
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: highlight ? 700 : 500,
                        color: highlight ? "#1A3A8F" : "#1f2937",
                        fontSize: "0.9375rem",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
                <div style={{ gridColumn: "span 2" }}>
                  <p
                    style={{
                      margin: "0 0 2px 0",
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                      fontWeight: 500,
                    }}
                  >
                    Purpose
                  </p>
                  <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>
                    {pr.purpose}
                  </p>
                </div>
                {pr.remarks && (
                  <div style={{ gridColumn: "span 2" }}>
                    <p
                      style={{
                        margin: "0 0 2px 0",
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        fontWeight: 500,
                      }}
                    >
                      Remarks
                    </p>
                    <p style={{ margin: 0, color: "#374151" }}>{pr.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Line items card */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "1px solid #f3f4f6",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(26,58,143,0.06)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontWeight: 700,
                  color: "#1A3A8F",
                  fontSize: "1rem",
                }}
              >
                Items
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.875rem",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f9fafb",
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      {[
                        "Description",
                        "Unit",
                        "Qty",
                        "Unit Price",
                        "Subtotal",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            fontWeight: 600,
                            color: "#374151",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pr.pr_line_items?.map((item, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb",
                        }}
                      >
                        <td style={{ padding: "10px 12px", color: "#1f2937" }}>
                          {item.description}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#4b5563" }}>
                          {item.unit}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#4b5563" }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#4b5563" }}>
                          ₱
                          {Number(item.unit_price).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            fontWeight: 700,
                            color: "#1A3A8F",
                          }}
                        >
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
                    <tr style={{ borderTop: "2px solid #e5e7eb" }}>
                      <td
                        colSpan={4}
                        style={{
                          padding: "12px",
                          fontWeight: 700,
                          color: "#374151",
                          textAlign: "right",
                        }}
                      >
                        Total
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontWeight: 700,
                          color: "#1A3A8F",
                          fontSize: "1rem",
                        }}
                      >
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
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "1px solid #f3f4f6",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(26,58,143,0.06)",
              alignSelf: "start",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                fontWeight: 700,
                color: "#1A3A8F",
                fontSize: "1rem",
              }}
            >
              Document Trail
            </h3>

            {pr.tracking_logs?.length ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "0" }}
              >
                {pr.tracking_logs.map((log, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px" }}>
                    {/* Timeline dot + line */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: "#F5C400",
                          border: "2px solid #1A3A8F",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      />
                      {i < (pr.tracking_logs?.length ?? 0) - 1 && (
                        <div
                          style={{
                            width: "2px",
                            flex: 1,
                            backgroundColor: "#e5e7eb",
                            margin: "4px 0",
                          }}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ paddingBottom: "16px", flex: 1 }}>
                      <p
                        style={{
                          margin: "0 0 2px 0",
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                          color: "#1A3A8F",
                        }}
                      >
                        {log.action}
                      </p>
                      {(log.from_office || log.to_office) && (
                        <p
                          style={{
                            margin: "0 0 2px 0",
                            fontSize: "0.75rem",
                            color: "#7C4DB3",
                          }}
                        >
                          {log.from_office && <span>{log.from_office}</span>}
                          {log.from_office && log.to_office && <span> → </span>}
                          {log.to_office && (
                            <span style={{ fontWeight: 600 }}>
                              {log.to_office}
                            </span>
                          )}
                        </p>
                      )}
                      <p
                        style={{
                          margin: "0 0 2px 0",
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        {new Date(log.created_at).toLocaleString("en-PH")}
                      </p>
                      {log.remarks && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            fontStyle: "italic",
                          }}
                        >
                          {log.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
                No tracking activity yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
