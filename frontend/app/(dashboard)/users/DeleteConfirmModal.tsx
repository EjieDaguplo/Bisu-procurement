"use client";
import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface UserRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Props {
  isOpen: boolean;
  user: UserRow | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}

export const DeleteConfirmModal = ({
  isOpen,
  user,
  onClose,
  onConfirm,
  deleting,
}: Props) => {
  if (!isOpen || !user) return null;

  return (
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
        onClick={onClose}
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
          maxWidth: "400px",
          margin: "16px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "#b91c1c",
            }}
          >
            Deactivate User
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              display: "flex",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={28} color="#b91c1c" />
          </div>
          <div>
            <p
              style={{
                margin: "0 0 8px 0",
                fontWeight: 600,
                color: "#1f2937",
                fontSize: "1rem",
              }}
            >
              Are you sure?
            </p>
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              You are about to deactivate{" "}
              <strong>
                {user.first_name} {user.last_name}
              </strong>{" "}
              ({user.email}). They will no longer be able to log in.
            </p>
          </div>
        </div>

        {/* Footer */}
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
            onClick={onClose}
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
            onClick={onConfirm}
            disabled={deleting}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: deleting ? "#6b7280" : "#b91c1c",
              color: "#fff",
              fontWeight: 600,
              cursor: deleting ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
            }}
          >
            {deleting ? "Deactivating..." : "Yes, Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
};
