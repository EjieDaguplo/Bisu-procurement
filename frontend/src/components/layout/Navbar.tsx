"use client";
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotification";
import { useAuth } from "../../hooks/useAuth";
import Link from "next/link";

export const Navbar = ({ title }: { title?: string }) => {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Title */}
      <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-bisu-blue to-bisu-purple bg-clip-text text-transparent m-0">
        {title || "BISU-Bilar Procurement MIS"}
      </h1>

      <div className="flex items-center gap-4">
        {/* Bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg flex items-center justify-center text-bisu-blue hover:bg-blue-50 transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[0.65rem] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-bisu-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </div>
            <span className="text-sm font-semibold text-bisu-blue hidden sm:block">
              {user?.first_name}
            </span>
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-[calc(100%+4px)] bg-white rounded-xl shadow-nav border border-gray-100 py-2 w-48 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800 mb-0.5">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-bisu-blue transition-colors"
                onClick={() => setShowMenu(false)}
              >
                My Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
