"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { saveAuth, clearAuth, getStoredUser } from "../lib/auth";
import { User } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>("/auth/login", { email, password });
    saveAuth(res.accessToken, res.refreshToken, res.user);
    setUser(res.user);
    router.push("/dashboard");
  };

  const logout = async () => {
    const rt = localStorage.getItem("refreshToken");
    await api.post("/auth/logout", { refreshToken: rt }).catch(() => {});
    clearAuth();
    setUser(null);
    router.push("/login");
  };

  return { user, loading, login, logout };
};
