import { Request, Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";

export const getAllTracking = async (_req: AuthRequest, res: Response) => {
  const logs = await prisma.tracking_logs.findMany({
    include: {
      purchase_requests: {
        select: { pr_number: true, title: true, status: true },
      },
      users_tracking_logs_from_user_idTousers: {
        select: { first_name: true, last_name: true },
      },
      users_tracking_logs_to_user_idTousers: {
        select: { first_name: true, last_name: true },
      },
    },
    orderBy: { created_at: "desc" },
    take: 100,
  });
  return res.json(logs);
};

export const getTrackingByPR = async (req: Request, res: Response) => {
  const logs = await prisma.tracking_logs.findMany({
    where: { purchase_request_id: Number(req.params.prId) },
    include: {
      users_tracking_logs_from_user_idTousers: {
        select: { first_name: true, last_name: true },
      },
      users_tracking_logs_to_user_idTousers: {
        select: { first_name: true, last_name: true },
      },
    },
    orderBy: { created_at: "asc" },
  });
  return res.json(logs);
};
