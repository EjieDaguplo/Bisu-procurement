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
    <aside className="sticky top-0 h-screen w-64 shrink-0 flex flex-col overflow-hidden shadow-[0_2px_16px_rgba(26,58,143,0.12)] bg-[#1A3A8F]">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 px-6 py-6 border-b border-white/10">
        <Image
          src="/bisuLogo.png"
          alt="BISU Logo"
          width={60}
          height={60}
          className="rounded-full"
        />
        <div className="text-center">
          <p className="text-[#F5C400] font-bold text-sm leading-snug">
            BISU – Bilar
          </p>
          <p className="text-white/60 text-xs">Procurement MIS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-hidden">
        {filtered.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return active ? (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#F5C400] text-[#0F2460] font-semibold text-sm no-underline shadow-sm"
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/80 font-medium text-sm no-underline transition-all duration-150 hover:bg-white/10 hover:text-white"
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-[#F5C400] flex items-center justify-center text-[#0F2460] font-bold text-sm shrink-0">
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-white/50 text-xs">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-white/60 bg-transparent border-none cursor-pointer text-sm transition-all duration-150 hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
};
