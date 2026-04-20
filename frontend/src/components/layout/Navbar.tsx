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
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-lg font-bold text-bisu-blue-DEFAULT">
        {title || "Dashboard"}
      </h1>

      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} className="text-bisu-blue-DEFAULT" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center min-w-[18px] px-0.5">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-bisu-blue-DEFAULT flex items-center justify-center text-white text-xs font-bold">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.first_name}
            </span>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-48 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
