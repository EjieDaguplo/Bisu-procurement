import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";

export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  const approvals = await prisma.pr_approvals.findMany({
    where: { action: "PENDING", approver_id: req.user!.userId },
    include: {
      purchase_requests: {
        include: {
          users: { select: { first_name: true, last_name: true } },
          departments: true,
        },
      },
      approval_steps: true,
    },
    orderBy: { created_at: "desc" },
  });
  return res.json(approvals);
};

export const getApprovalsByPR = async (req: AuthRequest, res: Response) => {
  const approvals = await prisma.pr_approvals.findMany({
    where: { purchase_request_id: Number(req.params.prId) },
    include: {
      approval_steps: true,
      users: { select: { first_name: true, last_name: true } },
    },
    orderBy: { created_at: "asc" },
  });
  return res.json(approvals);
};

export const approvePR = async (req: AuthRequest, res: Response) => {
  const { remarks } = req.body;
  const approval = await prisma.pr_approvals.update({
    where: { id: Number(req.params.id) },
    data: {
      action: "APPROVED",
      approver_id: req.user!.userId,
      remarks,
      acted_at: new Date(),
    },
    include: { purchase_requests: true },
  });

  await prisma.purchase_requests.update({
    where: { id: approval.purchase_request_id },
    data: { status: "APPROVED" },
  });

  await prisma.tracking_logs.create({
    data: {
      purchase_request_id: approval.purchase_request_id,
      from_user_id: req.user!.userId,
      status_before: "UNDER_REVIEW",
      status_after: "APPROVED",
      action: "APPROVED",
      remarks,
    },
  });

  await prisma.notifications.create({
    data: {
      user_id: approval.purchase_requests.requested_by,
      purchase_request_id: approval.purchase_request_id,
      type: "PR_APPROVED",
      title: "PR Approved",
      message: `Your PR ${approval.purchase_requests.pr_number} has been approved.`,
    },
  });

  return res.json(approval);
};

export const rejectPR = async (req: AuthRequest, res: Response) => {
  const { remarks } = req.body;
  const approval = await prisma.pr_approvals.update({
    where: { id: Number(req.params.id) },
    data: {
      action: "REJECTED",
      approver_id: req.user!.userId,
      remarks,
      acted_at: new Date(),
    },
    include: { purchase_requests: true },
  });

  await prisma.purchase_requests.update({
    where: { id: approval.purchase_request_id },
    data: { status: "REJECTED" },
  });

  await prisma.notifications.create({
    data: {
      user_id: approval.purchase_requests.requested_by,
      purchase_request_id: approval.purchase_request_id,
      type: "PR_REJECTED",
      title: "PR Rejected",
      message: `Your PR ${approval.purchase_requests.pr_number} has been rejected. Reason: ${remarks}`,
    },
  });

  return res.json(approval);
};

export const returnPR = async (req: AuthRequest, res: Response) => {
  const { remarks } = req.body;
  const approval = await prisma.pr_approvals.update({
    where: { id: Number(req.params.id) },
    data: {
      action: "RETURNED",
      approver_id: req.user!.userId,
      remarks,
      acted_at: new Date(),
    },
    include: { purchase_requests: true },
  });

  await prisma.purchase_requests.update({
    where: { id: approval.purchase_request_id },
    data: { status: "DRAFT" },
  });

  return res.json(approval);
};
