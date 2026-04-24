"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Briefcase,
  Building2,
  BadgeCheck,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { api } from "@/src/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "profile" | "password";

export const MyProfileModal = ({ isOpen, onClose }: Props) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  /* ── Profile form ── */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  /* ── Password form ── */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwOk, setPwOk] = useState(false);
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
    }
    // reset on open
    setSaveOk(false);
    setSaveErr("");
    setPwOk(false);
    setPwErr("");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setActiveTab("profile");
  }, [isOpen, user]);

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setSaveErr("First name and last name are required.");
      return;
    }
    setSaving(true);
    setSaveErr("");
    setSaveOk(false);
    try {
      await api.put(`/users/${user?.id}`, {
        first_name: firstName,
        last_name: lastName,
      });
      // update localStorage user
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.first_name = firstName;
        parsed.last_name = lastName;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
      setSaveOk(true);
    } catch (err: unknown) {
      setSaveErr(
        err instanceof Error ? err.message : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwErr("");
    setPwOk(false);
    if (!currentPw || !newPw || !confirmPw) {
      setPwErr("All password fields are required.");
      return;
    }
    if (newPw.length < 8) {
      setPwErr("New password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwErr("New passwords do not match.");
      return;
    }
    setPwSaving(true);
    try {
      await api.put(`/users/${user?.id}`, {
        current_password: currentPw,
        password: newPw,
      });
      setPwOk(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: unknown) {
      setPwErr(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    } finally {
      setPwSaving(false);
    }
  };

  if (!isOpen) return null;

  const roleColors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    APPROVER: "bg-blue-100 text-blue-700",
    REQUESTER: "bg-green-100 text-green-700",
    PROCUREMENT_OFFICER: "bg-yellow-100 text-yellow-800",
    IT: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-bisu-blue to-bisu-purple px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-bisu-yellow flex items-center justify-center text-bisu-blue font-extrabold text-xl shadow-md flex-shrink-0">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight m-0">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-white/70 text-xs mt-0.5">{user?.email}</p>
                <span
                  className={`inline-block mt-1 text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${roleColors[user?.role ?? ""] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "profile"
                ? "border-bisu-blue text-bisu-blue bg-blue-50/40"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "password"
                ? "border-bisu-blue text-bisu-blue bg-blue-50/40"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Change Password
          </button>
        </div>

        {/* ── Tab content ── */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              {/* Read-only info */}
              <div className="grid grid-cols-2 gap-3">
                <InfoRow
                  icon={<BadgeCheck size={15} />}
                  label="Employee ID"
                  value={user?.employee_id ?? "—"}
                />
                <InfoRow
                  icon={<Briefcase size={15} />}
                  label="Role"
                  value={user?.role ?? "—"}
                />
                <InfoRow
                  icon={<Building2 size={15} />}
                  label="Department"
                  value={
                    (user as unknown as { departments?: { name: string } })
                      ?.departments?.name ?? "—"
                  }
                  full
                />
                <InfoRow
                  icon={<Mail size={15} />}
                  label="Email"
                  value={user?.email ?? "—"}
                  full
                />
              </div>

              <hr className="border-gray-100" />

              {/* Editable fields */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User size={15} className="text-bisu-blue" /> Edit Name
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      First Name
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Last Name
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {saveErr && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
                  {saveErr}
                </div>
              )}
              {saveOk && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex items-center gap-2">
                  <CheckCircle size={15} /> Profile updated successfully.
                </div>
              )}

              {/* Save button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-bisu-blue hover:bg-bisu-blue-dark text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={15} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── PASSWORD TAB ── */}
          {activeTab === "password" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <KeyRound size={15} className="text-bisu-blue" /> Change Your
                  Password
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Password must be at least 8 characters long.
                </p>
              </div>

              {/* Current password */}
              <PasswordField
                label="Current Password"
                value={currentPw}
                show={showCur}
                onChange={setCurrentPw}
                onToggle={() => setShowCur(!showCur)}
                placeholder="Enter current password"
              />

              {/* New password */}
              <PasswordField
                label="New Password"
                value={newPw}
                show={showNew}
                onChange={setNewPw}
                onToggle={() => setShowNew(!showNew)}
                placeholder="Enter new password"
              />

              {/* Confirm password */}
              <PasswordField
                label="Confirm New Password"
                value={confirmPw}
                show={showCon}
                onChange={setConfirmPw}
                onToggle={() => setShowCon(!showCon)}
                placeholder="Confirm new password"
              />

              {/* Strength indicator */}
              {newPw && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          passwordStrength(newPw) >= i
                            ? i <= 1
                              ? "bg-red-400"
                              : i <= 2
                                ? "bg-yellow-400"
                                : i <= 3
                                  ? "bg-blue-400"
                                  : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {
                      ["", "Weak", "Fair", "Good", "Strong"][
                        passwordStrength(newPw)
                      ]
                    }{" "}
                    password
                  </p>
                </div>
              )}

              {/* Feedback */}
              {pwErr && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
                  {pwErr}
                </div>
              )}
              {pwOk && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2.5 text-sm flex items-center gap-2">
                  <CheckCircle size={15} /> Password changed successfully.
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving}
                  className="inline-flex items-center gap-2 bg-bisu-blue hover:bg-bisu-blue-dark text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <KeyRound size={15} />
                  {pwSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Sub-components ── */

const InfoRow = ({
  icon,
  label,
  value,
  full,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  full?: boolean;
}) => (
  <div
    className={`bg-gray-50 rounded-lg px-3 py-2.5 ${full ? "col-span-2" : ""}`}
  >
    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
      {icon} {label}
    </div>
    <p className="text-sm font-semibold text-gray-800 m-0 truncate">{value}</p>
  </div>
);

const PasswordField = ({
  label,
  value,
  show,
  onChange,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  show: boolean;
  onChange: (v: string) => void;
  onToggle: () => void;
  placeholder: string;
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  </div>
);

/* ── Password strength helper ── */
const passwordStrength = (pw: string): number => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};
