"use client";
import React, { useState } from "react";
import { AlertTriangle, Trash2, UserX, X } from "lucide-react";

interface UserRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

interface Props {
  isOpen: boolean;
  user: UserRow | null;
  onClose: () => void;
  onDeactivate: () => Promise<void>;
  onDelete: () => Promise<void>;
}

type ActionType = "deactivate" | "delete" | null;

export const DeleteConfirmModal = ({
  isOpen,
  user,
  onClose,
  onDeactivate,
  onDelete,
}: Props) => {
  const [action, setAction] = useState<ActionType>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !user) return null;

  const reset = () => {
    setAction(null);
    setError("");
  };
  const close = () => {
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    if (!action) return;
    setProcessing(true);
    setError("");
    try {
      if (action === "deactivate") await onDeactivate();
      else await onDelete();
      close();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">
            Manage User Account
          </h2>
          <button
            onClick={close}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* User info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-bisu-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.first_name[0]}
              {user.last_name[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <span
              className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
            >
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Action selection */}
          {!action ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">
                Choose an action for this user account:
              </p>

              {/* Deactivate option */}
              <button
                onClick={() => setAction("deactivate")}
                className="flex items-start gap-4 w-full text-left px-4 py-3.5 rounded-xl border-2 border-orange-200 bg-orange-50 hover:border-orange-400 hover:bg-orange-100 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserX size={18} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-orange-700 text-sm mb-0.5">
                    Deactivate Account
                  </p>
                  <p className="text-xs text-orange-600/80 leading-relaxed">
                    The user will be disabled and cannot log in, but their data
                    and records are preserved. This can be reversed.
                  </p>
                </div>
              </button>

              {/* Delete option */}
              <button
                onClick={() => setAction("delete")}
                className="flex items-start gap-4 w-full text-left px-4 py-3.5 rounded-xl border-2 border-red-200 bg-red-50 hover:border-red-400 hover:bg-red-100 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Trash2 size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-700 text-sm mb-0.5">
                    Delete Permanently
                  </p>
                  <p className="text-xs text-red-600/80 leading-relaxed">
                    Permanently removes the user from the system. This action{" "}
                    <strong>cannot be undone</strong>.
                  </p>
                </div>
              </button>
            </div>
          ) : (
            /* Confirmation step */
            <div className="flex flex-col gap-4">
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${action === "delete" ? "bg-red-50 border border-red-200" : "bg-orange-50 border border-orange-200"}`}
              >
                <AlertTriangle
                  size={20}
                  className={
                    action === "delete"
                      ? "text-red-500 flex-shrink-0"
                      : "text-orange-500 flex-shrink-0"
                  }
                />
                <p
                  className={`text-sm font-medium ${action === "delete" ? "text-red-700" : "text-orange-700"}`}
                >
                  {action === "delete"
                    ? "This will permanently delete the user and cannot be undone."
                    : "This will disable the user's access to the system."}
                </p>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Are you sure you want to{" "}
                <strong
                  className={
                    action === "delete" ? "text-red-600" : "text-orange-600"
                  }
                >
                  {action === "delete" ? "permanently delete" : "deactivate"}
                </strong>{" "}
                <strong className="text-gray-800">
                  {user.first_name} {user.last_name}
                </strong>
                ?
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 gap-3">
          {action ? (
            <>
              <div className="justify-evenly flex-1 flex gap-3">
                <button
                  onClick={close}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className={`px-5 py-2 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer
                    ${
                      action === "delete"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                >
                  {processing
                    ? "Processing..."
                    : action === "delete"
                      ? "Yes, Delete Permanently"
                      : "Yes, Deactivate"}
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={close}
              className="ml-auto px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
