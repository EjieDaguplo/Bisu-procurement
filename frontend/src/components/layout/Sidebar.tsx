"use client";
import React, { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { Role } from "@/src/types";
import { LogoutModal } from "@/src/components/logout/LogoutModal";

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
  const [showLogoutModal, setLogout] = useState(false);
  const [mobileOpen, setMobile] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobile(false);
  }, [pathname]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const filtered = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role as Role),
  );

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 px-6 py-6 border-b border-white/10">
        <Image
          src="/bisuLogo.png"
          alt="BISU Logo"
          width={60}
          height={60}
          className="rounded-full shadow-md"
        />
        <div className="text-center">
          <p className="text-[#F5C400] font-bold text-sm leading-snug">
            BISU – Bilar
          </p>
          <p className="text-white/60 text-xs">Procurement MIS</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
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

      {/* User + Sign out */}
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
            <p className="text-white/50 text-xs truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => setLogout(true)}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-white/60 bg-transparent border-none cursor-pointer text-sm transition-all duration-150 hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        onClick={() => setMobile(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-[#1A3A8F] text-white flex items-center justify-center shadow-lg border border-white/10"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile backdrop overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobile(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 z-50 h-full w-64 flex flex-col
          bg-[#1A3A8F] shadow-2xl
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setMobile(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>

        <NavContent />
      </aside>

      {/* ── Desktop sidebar (always visible on lg+) ── */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col overflow-hidden shadow-[0_2px_16px_rgba(26,58,143,0.12)] bg-[#1A3A8F]">
        <NavContent />
      </aside>

      {/* ── Logout modal ── */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={() => {
          setLogout(false);
          logout();
        }}
        onCancel={() => setLogout(false)}
        userName={
          user?.first_name ? `${user.first_name} ${user.last_name}` : undefined
        }
      />
    </>
  );
};
