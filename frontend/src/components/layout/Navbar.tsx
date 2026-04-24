"use client";
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/src/hooks/useNotification";
import { useAuth } from "@/src/hooks/useAuth";
import Link from "next/link";
import { MyProfileModal } from "@/src/components/profile/MyProfile";

export const Navbar = ({ title }: { title?: string }) => {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-6 sticky top-0 z-30">
        {/* Title */}
        <h1 className="text-lg font-extrabold tracking-tight text-bisu-blue m-0">
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
              <>
                {/* Click-away backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-[calc(100%+4px)] bg-white rounded-xl shadow-nav border border-gray-100 py-2 w-52 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <span className="inline-block mt-1 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full bg-bisu-blue/10 text-bisu-blue">
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfile(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-bisu-blue transition-colors cursor-pointer border-none bg-transparent"
                  >
                    My Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <MyProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
};
