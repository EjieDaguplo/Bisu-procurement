import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  const notifications = await prisma.notifications.findMany({
    where: { user_id: req.user!.userId },
    include: {
      purchase_requests: { select: { pr_number: true, title: true } },
    },
    orderBy: { created_at: "desc" },
    take: 50,
  });
  return res.json(notifications);
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const notif = await prisma.notifications.update({
    where: { id: Number(req.params.id) },
    data: { is_read: true },
  });
  return res.json(notif);
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  await prisma.notifications.updateMany({
    where: { user_id: req.user!.userId, is_read: false },
    data: { is_read: true },
  });
  return res.json({ message: "All notifications marked as read" });
};
