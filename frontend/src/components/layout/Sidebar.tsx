"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  MapPin,
  BarChart2,
  Users,
  Bell,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Role } from "../../types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
    roles: ["REQUESTER", "APPROVER", "PROCUREMENT_OFFICER", "ADMIN", "IT"],
  },
  {
    label: "Purchase Requests",
    href: "/purchase-requests",
    icon: <FileText size={18} />,
    roles: ["REQUESTER", "APPROVER", "PROCUREMENT_OFFICER", "ADMIN"],
  },
  {
    label: "Approvals",
    href: "/approvals",
    icon: <CheckSquare size={18} />,
    roles: ["APPROVER", "ADMIN"],
  },
  {
    label: "Document Tracking",
    href: "/tracking",
    icon: <MapPin size={18} />,
    roles: ["REQUESTER", "APPROVER", "PROCUREMENT_OFFICER", "ADMIN"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <BarChart2 size={18} />,
    roles: ["PROCUREMENT_OFFICER", "ADMIN"],
  },
  {
    label: "Users",
    href: "/users",
    icon: <Users size={18} />,
    roles: ["ADMIN", "IT"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell size={18} />,
    roles: ["REQUESTER", "APPROVER", "PROCUREMENT_OFFICER", "ADMIN", "IT"],
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filtered = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role as Role),
  );

  return (
    <aside
      style={{
        backgroundColor: "#1A3A8F",
        minHeight: "100vh",
        width: "256px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 16px rgba(26,58,143,0.12)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "24px",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <Image
          src="/bisuLogo.png"
          alt="BISU Logo"
          width={60}
          height={60}
          style={{ borderRadius: "50%" }}
        />
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              color: "#F5C400",
              fontWeight: 700,
              fontSize: "0.875rem",
              lineHeight: 1.3,
            }}
          >
            BISU – Bilar
          </p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.75rem" }}>
            Procurement MIS
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {filtered.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return active ? (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                borderRadius: "8px",
                backgroundColor: "#F5C400",
                color: "#0F2460",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
                boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 16px",
                borderRadius: "8px",
                color: "rgba(255,255,255,0.80)",
                fontWeight: 500,
                fontSize: "0.875rem",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.10)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.80)";
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#F5C400",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0F2460",
              fontWeight: 700,
              fontSize: "0.875rem",
              flexShrink: 0,
            }}
          >
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ color: "rgba(255,255,255,0.50)", fontSize: "0.75rem" }}>
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            padding: "8px 16px",
            borderRadius: "8px",
            color: "rgba(255,255,255,0.60)",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.20)";
            e.currentTarget.style.color = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.60)";
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
};
