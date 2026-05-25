"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { api } from "@/src/lib/api";
import { UserModal } from "./UserModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { SuccessModal } from "./SuccessModal";
import { Plus, Pencil, Trash2, Search, Users, RefreshCw } from "lucide-react";

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

const roleStyle: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  APPROVER: "bg-blue-100 text-blue-700",
  REQUESTER: "bg-green-100 text-green-700",
  PROCUREMENT_OFFICER: "bg-yellow-100 text-yellow-800",
  IT: "bg-gray-100 text-gray-600",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Success modal state ──
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const showSuccess = (title: string, message: string) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setSuccessOpen(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      const u = await api.get<UserRow[]>("/users");
      setUsers(u);

      const deptMap = new Map<number, Department>();
      const roleMap = new Map<number, Role>();
      u.forEach((user) => {
        if (user.departments)
          deptMap.set(user.departments.id, user.departments);
        if (user.roles) roleMap.set(user.roles.id, user.roles);
      });

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

  const filtered = users.filter((u) => {
    const matchesSearch =
      `${u.first_name} ${u.last_name} ${u.email} ${u.employee_id}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.roles?.name === roleFilter : true;
    return matchesSearch && matchesRole;
  });

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
        showSuccess(
          "User Updated",
          `${editTarget.first_name} ${editTarget.last_name}'s account has been updated successfully.`,
        );
      } else {
        await api.post("/users", data);
        showSuccess(
          "User Created",
          `New user account has been created successfully.`,
        );
      }
      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.patch(`/users/${deleteTarget.id}/deactivate`);
      const name = `${deleteTarget.first_name} ${deleteTarget.last_name}`;
      setDeleteTarget(null);
      await load();
      showSuccess(
        "Account Deactivated",
        `${name}'s account has been deactivated. They can no longer log in.`,
      );
    } catch (err: unknown) {
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      const name = `${deleteTarget.first_name} ${deleteTarget.last_name}`;
      setDeleteTarget(null);
      await load();
      showSuccess(
        "User Deleted",
        `${name}'s account has been permanently deleted from the system.`,
      );
    } catch (err: unknown) {
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = users.filter((u) => !u.is_active).length;

  return (
    <PageWrapper
      title="User Management"
      action={
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-bisu-blue hover:bg-bisu-blue-dark text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors border-none cursor-pointer"
        >
          <Plus size={16} /> New User
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Users",
              value: totalUsers,
              cls: "bg-blue-50 text-bisu-blue border-blue-100",
            },
            {
              label: "Active",
              value: activeUsers,
              cls: "bg-green-50 text-green-700 border-green-100",
            },
            {
              label: "Inactive",
              value: inactiveUsers,
              cls: "bg-red-50 text-red-600 border-red-100",
            },
          ].map(({ label, value, cls }) => (
            <div
              key={label}
              className={`rounded-xl border px-5 py-4 flex items-center gap-3 ${cls}`}
            >
              <Users size={20} className="flex-shrink-0 opacity-70" />
              <div>
                <p className="text-2xl font-bold leading-none">{value}</p>
                <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              placeholder="Search name, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all max-w-xs"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-bisu-blue">
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
                    className="text-left px-4 py-3 font-semibold text-white whitespace-nowrap text-xs tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-200 border-t-bisu-blue rounded-full animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Users size={32} className="mx-auto mb-2 text-gray-300" />
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-t border-gray-100 transition-colors hover:bg-blue-50/30
                      ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                      ${!u.is_active ? "opacity-60" : ""}
                    `}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-bisu-blue text-xs">
                      {u.employee_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-bisu-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.first_name[0]}
                          {u.last_name[0]}
                        </div>
                        <span className="font-medium text-gray-800">
                          {u.first_name} {u.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleStyle[u.roles?.name] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {u.roles?.name?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.departments?.name || (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.is_active ? "bg-green-500" : "bg-red-400"}`}
                        />
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(u)}
                          title="Edit user"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-bisu-blue hover:bg-blue-50 hover:border-bisu-blue/30 transition-colors cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          title="Manage account"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
              Showing {filtered.length} of {users.length} user
              {users.length !== 1 ? "s" : ""}
              {roleFilter && ` · Role: ${roleFilter.replace(/_/g, " ")}`}
              {search && ` · Search: "${search}"`}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
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
        onDeactivate={handleDeactivate}
        onDelete={handleDelete}
      />

      {/* ── Success modal ── */}
      <SuccessModal
        isOpen={successOpen}
        title={successTitle}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
      />
    </PageWrapper>
  );
}
