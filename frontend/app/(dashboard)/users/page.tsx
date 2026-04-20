"use client";
import React, { useEffect, useState } from "react";
import { PageWrapper } from "../../../src/components/layout/PageWrapper";
import { api } from "../../../src/lib/api";
import { User } from "../../../src/types";
import {
  Users,
  Hash,
  Mail,
  Briefcase,
  Building2,
  ShieldCheck,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<User[]>("/users")
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const headers = [
    { label: "Employee ID", icon: Hash },
    { label: "Name", icon: Users },
    { label: "Email", icon: Mail },
    { label: "Role", icon: ShieldCheck },
    { label: "Department", icon: Building2 },
    { label: "Status", icon: Briefcase },
  ];

  return (
    <PageWrapper title="User Management">
      <div className="card overflow-hidden p-0">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users size={16} className="text-bisu-blue" />
            </div>
            <div>
              <p className="text-sm font-bold text-bisu-blue leading-none">
                System Users
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {users.length} total records
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-bisu-blue to-bisu-purple">
                {headers.map(({ label, icon: Icon }) => (
                  <th key={label} className="text-left px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Icon size={13} className="text-white/60" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-bisu-blue border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-400 font-medium">
                        Loading users...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-gray-200" />
                      <span className="text-sm text-gray-400 font-medium">
                        No users found
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u, i) => {
                  const user = u as User & {
                    departments?: { name: string };
                    is_active?: boolean;
                  };
                  return (
                    <tr
                      key={u.id}
                      className={`border-t border-gray-50 hover:bg-blue-50/40 transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      {/* Employee ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-bisu-blue bg-blue-50 px-2 py-1 rounded-md">
                          {u.employee_id}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-bisu-blue to-bisu-purple flex items-center justify-center text-white text-[0.6rem] font-bold flex-shrink-0">
                            {u.first_name?.[0]}
                            {u.last_name?.[0]}
                          </div>
                          <span className="font-semibold text-gray-800">
                            {u.first_name} {u.last_name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {u.email}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className="text-xs px-2.5 py-1 bg-purple-50 text-bisu-purple border border-purple-100 rounded-full font-semibold">
                          {u.role}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {user.departments?.name || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
                            user.is_active
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-red-50 text-red-600 border border-red-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.is_active ? "bg-green-500" : "bg-red-400"
                            }`}
                          />
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
