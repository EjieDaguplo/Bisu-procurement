"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface Department {
  id: number;
  name: string;
}
interface Role {
  id: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  saving: boolean;
  editData: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    roles: Role;
    departments: Department | null;
  } | null;
  departments: Department[];
  roles: Role[];
}

const empty = {
  employee_id: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role_id: "",
  department_id: "",
  is_active: true,
};

export const UserModal = ({
  isOpen,
  onClose,
  onSave,
  saving,
  editData,
  departments,
  roles,
}: Props) => {
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        employee_id: editData.employee_id,
        first_name: editData.first_name,
        last_name: editData.last_name,
        email: editData.email,
        password: "",
        role_id: String(editData.roles?.id ?? ""),
        department_id: String(editData.departments?.id ?? ""),
        is_active: editData.is_active as unknown as string,
      } as unknown as typeof empty);
    } else {
      setForm({ ...empty });
    }
    setError("");
  }, [editData, isOpen]);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setError("");
    if (!form.first_name || !form.last_name || !form.email || !form.role_id) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!editData && !form.password) {
      setError("Password is required for new users.");
      return;
    }
    const payload: Record<string, unknown> = {
      employee_id: form.employee_id,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      role_id: Number(form.role_id),
      department_id: form.department_id ? Number(form.department_id) : null,
      is_active: form.is_active,
    };
    if (form.password) payload.password = form.password;
    try {
      await onSave(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save user.");
    }
  };

  if (!isOpen) return null;

  const isEdit = !!editData;

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
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          width: "100%",
          maxWidth: "520px",
          margin: "16px",
          maxHeight: "90vh",
          overflowY: "auto",
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
              color: "#1A3A8F",
            }}
          >
            {isEdit ? "Edit User" : "Create New User"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              color: "#6b7280",
              display: "flex",
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
            gap: "16px",
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

          {/* Row: first + last */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Field label="First Name *">
              <input
                style={inputStyle}
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                placeholder="Juan"
              />
            </Field>
            <Field label="Last Name *">
              <input
                style={inputStyle}
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                placeholder="Dela Cruz"
              />
            </Field>
          </div>

          <Field label="Employee ID">
            <input
              style={inputStyle}
              value={form.employee_id}
              onChange={(e) => set("employee_id", e.target.value)}
              placeholder="BISU-2024-001"
            />
          </Field>

          <Field label="Email Address *">
            <input
              type="email"
              style={inputStyle}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="user@bisu.edu.ph"
            />
          </Field>

          <Field
            label={
              isEdit
                ? "New Password (leave blank to keep current)"
                : "Password *"
            }
          >
            <input
              type="password"
              style={inputStyle}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          <Field label="Role *">
            <select
              style={inputStyle}
              value={form.role_id}
              onChange={(e) => set("role_id", e.target.value)}
            >
              <option value="">— Select Role —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Department">
            <select
              style={inputStyle}
              value={form.department_id}
              onChange={(e) => set("department_id", e.target.value)}
            >
              <option value="">— Select Department —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>

          {isEdit && (
            <Field label="Status">
              <select
                style={inputStyle}
                value={String(form.is_active)}
                onChange={(e) => set("is_active", e.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </Field>
          )}
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
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: saving ? "#6b7280" : "#1A3A8F",
              color: "#fff",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
            }}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────
const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
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
      {label}
    </label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "0.875rem",
  color: "#111827",
  backgroundColor: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
};
