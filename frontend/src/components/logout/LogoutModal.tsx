"use client";
import React from "react";
import { LogOut, X, ShieldAlert } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  userName?: string;
}

export const LogoutModal = ({
  isOpen,
  onConfirm,
  onCancel,
  userName,
}: LogoutModalProps) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/* Modal card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm px-8 py-8 flex flex-col items-center gap-0 animate-[modalIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "modalIn 0.2s ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X size={15} />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mb-5">
          <ShieldAlert size={28} className="text-red-500" />
        </div>

        {/* Text */}
        <h3 className="text-[#0F2460] text-xl font-extrabold tracking-tight mb-1 text-center">
          Sign out?
        </h3>
        <p className="text-gray-400 text-sm text-center mb-7 leading-relaxed">
          {userName ? (
            <>
              You're signing out as{" "}
              <span className="text-[#1A3A8F] font-semibold">{userName}</span>.
              <br />
            </>
          ) : null}
          You'll need to sign back in to access the procurement portal.
        </p>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.35)] hover:shadow-[0_6px_16px_rgba(239,68,68,0.45)]"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
