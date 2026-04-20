"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { Notification } from "../types";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = useCallback(async () => {
    try {
      const data = await api.get<Notification[]>("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch {}
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [fetch]);

  const markRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetch };
};
