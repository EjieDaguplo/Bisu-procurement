// import { Request, Response } from "express";
// import { prisma } from "../config/database";
// import { AuthRequest } from "../types";

// export const getAllTracking = async (_req: AuthRequest, res: Response) => {
//   const logs = await prisma.tracking_logs.findMany({
//     include: {
//       purchase_requests: {
//         select: { pr_number: true, title: true, status: true },
//       },
//       users_tracking_logs_from_user_idTousers: {
//         select: { first_name: true, last_name: true },
//       },
//       users_tracking_logs_to_user_idTousers: {
//         select: { first_name: true, last_name: true },
//       },
//     },
//     orderBy: { created_at: "desc" },
//     take: 100,
//   });
//   return res.json(logs);
// };

// export const getTrackingByPR = async (req: Request, res: Response) => {
//   const logs = await prisma.tracking_logs.findMany({
//     where: { purchase_request_id: Number(req.params.prId) },
//     include: {
//       users_tracking_logs_from_user_idTousers: {
//         select: { first_name: true, last_name: true },
//       },
//       users_tracking_logs_to_user_idTousers: {
//         select: { first_name: true, last_name: true },
//       },
//     },
//     orderBy: { created_at: "asc" },
//   });
//   return res.json(logs);
// };

import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";

export const getAllTracking = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // Build where clause based on role
    // REQUESTER → only their own PRs
    // Everyone else → all tracking logs
    const where =
      user.role === "REQUESTER"
        ? {
            purchase_requests: {
              requested_by: user.userId,
            },
          }
        : {};

    const logs = await prisma.tracking_logs.findMany({
      where,
      include: {
        purchase_requests: {
          select: {
            id: true,
            pr_number: true,
            title: true,
            status: true,
          },
        },
        users_tracking_logs_from_user_idTousers: {
          select: { first_name: true, last_name: true },
        },
        users_tracking_logs_to_user_idTousers: {
          select: { first_name: true, last_name: true },
        },
      },
      orderBy: { created_at: "desc" },
      take: 200,
    });

    return res.json(logs);
  } catch (err) {
    console.error("GET ALL TRACKING ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTrackingByPR = async (req: AuthRequest, res: Response) => {
  try {
    const prId = Number(req.params.prId);
    const user = req.user!;

    // If REQUESTER, verify this PR belongs to them before returning logs
    if (user.role === "REQUESTER") {
      const pr = await prisma.purchase_requests.findUnique({
        where: { id: prId },
        select: { requested_by: true },
      });

      if (!pr) {
        return res.status(404).json({ message: "PR not found" });
      }

      if (pr.requested_by !== user.userId) {
        return res.status(403).json({
          message: "Forbidden: You can only view tracking for your own PRs",
        });
      }
    }

    const logs = await prisma.tracking_logs.findMany({
      where: { purchase_request_id: prId },
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
  } catch (err) {
    console.error("GET TRACKING BY PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
