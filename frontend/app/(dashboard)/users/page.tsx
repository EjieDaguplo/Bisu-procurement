// this is having issue by fetching user FIX IT
"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { api } from "@/src/lib/api";
import { UserModal } from "./UserModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Department {
  id: number;
  name: string;
  code: string;
}

interface Role {
  id: number;
  name: string;
}

interface UserRow {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  roles: Role;
  departments: Department | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch users first — this is the critical call
      const u = await api.get<UserRow[]>("/users");
      setUsers(u);

      // Derive departments and roles from users as fallback
      const deptMap = new Map<number, Department>();
      const roleMap = new Map<number, Role>();
      u.forEach((user) => {
        if (user.departments)
          deptMap.set(user.departments.id, user.departments);
        if (user.roles) roleMap.set(user.roles.id, user.roles);
      });

      // Try to fetch departments/roles separately — gracefully ignore failures
      try {
        const d = await api.get<Department[]>("/departments");
        setDepartments(d);
      } catch {
        setDepartments(Array.from(deptMap.values()));
      }

      try {
        const r = await api.get<Role[]>("/roles");
        setRoles(r);
      } catch {
        setRoles(Array.from(roleMap.values()));
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email} ${u.employee_id}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (u: UserRow) => {
    setEditTarget(u);
    setModalOpen(true);
  };

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/users/${editTarget.id}`, data);
      } else {
        await api.post("/users", data);
      }
      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const roleColor: Record<string, { bg: string; color: string }> = {
    ADMIN: { bg: "#ede9fe", color: "#6d28d9" },
    APPROVER: { bg: "#dbeafe", color: "#1d4ed8" },
    REQUESTER: { bg: "#dcfce7", color: "#15803d" },
    PROCUREMENT_OFFICER: { bg: "#fef9c3", color: "#92400e" },
    IT: { bg: "#f3f4f6", color: "#374151" },
  };

  return (
    <PageWrapper
      title="User Management"
      action={
        <button
          onClick={openCreate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#1A3A8F",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.875rem",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={16} /> New User
        </button>
      }
    >
      {/* Search */}
      <div
        style={{
          marginBottom: "16px",
          position: "relative",
          maxWidth: "320px",
        }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
          }}
        />
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 16px 10px 36px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "0.875rem",
            color: "#111827",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          backgroundColor: "#fff",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#1A3A8F" }}>
              {[
                "Employee ID",
                "Name",
                "Email",
                "Role",
                "Department",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    fontWeight: 600,
                    color: "#fff",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#9ca3af",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "#9ca3af",
                  }}
                >
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => {
                const rc = roleColor[u.roles?.name] || {
                  bg: "#f3f4f6",
                  color: "#374151",
                };
                return (
                  <tr
                    key={u.id}
                    style={{
                      borderTop: "1px solid #f3f4f6",
                      backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: "#1A3A8F",
                        fontSize: "0.75rem",
                      }}
                    >
                      {u.employee_id}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontWeight: 500,
                        color: "#1f2937",
                      }}
                    >
                      {u.first_name} {u.last_name}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#4b5563" }}>
                      {u.email}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "2px 10px",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: rc.bg,
                          color: rc.color,
                        }}
                      >
                        {u.roles?.name}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#4b5563" }}>
                      {u.departments?.name || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "2px 10px",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: u.is_active ? "#dcfce7" : "#fee2e2",
                          color: u.is_active ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => openEdit(u)}
                          title="Edit"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            color: "#1A3A8F",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#eff6ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#fff";
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          title="Deactivate"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            color: "#b91c1c",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fef2f2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#fff";
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
        editData={editTarget}
        departments={departments}
        roles={roles}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </PageWrapper>
  );
}
