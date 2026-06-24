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

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showLogout, setLogout] = useState(false);

  // Auto-close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const filtered = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role as Role),
  );

  const NavContent = () => (
    <>
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
      {/*No floating hamburger here anymore — it's in Navbar now */}

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 z-50 h-full w-64 flex flex-col
          bg-[#1A3A8F] shadow-2xl
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white flex items-center justify-center transition-colors z-10"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col overflow-hidden shadow-[0_2px_16px_rgba(26,58,143,0.12)] bg-[#1A3A8F]">
        <NavContent />
      </aside>

      <LogoutModal
        isOpen={showLogout}
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
