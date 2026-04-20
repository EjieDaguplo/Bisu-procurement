import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";

const generatePRNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.purchase_requests.count();
  return `PR-${year}-${String(count + 1).padStart(5, "0")}`;
};

export const getAllPRs = async (req: AuthRequest, res: Response) => {
  const { status, department_id } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (department_id) where.department_id = Number(department_id);
  if (req.user?.role === "REQUESTER") where.requested_by = req.user.userId;

  const prs = await prisma.purchase_requests.findMany({
    where,
    include: {
      users: {
        select: { first_name: true, last_name: true, employee_id: true },
      },
      departments: true,
      item_categories: true,
      pr_line_items: true,
    },
    orderBy: { created_at: "desc" },
  });
  return res.json(prs);
};

export const getPRById = async (req: AuthRequest, res: Response) => {
  const pr = await prisma.purchase_requests.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      users: {
        select: { first_name: true, last_name: true, employee_id: true },
      },
      departments: true,
      item_categories: true,
      pr_line_items: true,
      pr_approvals: {
        include: {
          approval_steps: true,
          users: { select: { first_name: true, last_name: true } },
        },
      },
      tracking_logs: {
        orderBy: { created_at: "asc" },
      },
    },
  });
  if (!pr)
    return res.status(404).json({ message: "Purchase Request not found" });
  return res.json(pr);
};

export const createPR = async (req: AuthRequest, res: Response) => {
  const {
    title,
    purpose,
    department_id,
    date_needed,
    remarks,
    priority,
    line_items,
  } = req.body;
  const pr_number = await generatePRNumber();

  const totalAmount = (
    line_items as { quantity: number; unit_price: number }[]
  ).reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const pr = await prisma.purchase_requests.create({
    data: {
      pr_number,
      title,
      purpose,
      requested_by: req.user!.userId,
      department_id: Number(department_id),
      date_needed: date_needed ? new Date(date_needed) : null,
      remarks,
      priority: priority || "NORMAL",
      total_amount: totalAmount,
      status: "DRAFT",
      pr_line_items: {
        create: line_items,
      },
    },
    include: { pr_line_items: true },
  });
  return res.status(201).json(pr);
};

export const updatePR = async (req: AuthRequest, res: Response) => {
  const pr = await prisma.purchase_requests.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!pr) return res.status(404).json({ message: "PR not found" });
  if (pr.status !== "DRAFT")
    return res.status(400).json({ message: "Only DRAFT PRs can be edited" });

  const { line_items, ...rest } = req.body;
  const updated = await prisma.purchase_requests.update({
    where: { id: Number(req.params.id) },
    data: {
      ...rest,
      ...(line_items && {
        pr_line_items: {
          deleteMany: {},
          create: line_items,
        },
      }),
    },
    include: { pr_line_items: true },
  });
  return res.json(updated);
};

export const deletePR = async (req: AuthRequest, res: Response) => {
  const pr = await prisma.purchase_requests.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!pr) return res.status(404).json({ message: "PR not found" });
  if (pr.status !== "DRAFT")
    return res.status(400).json({ message: "Only DRAFT PRs can be deleted" });
  await prisma.purchase_requests.delete({
    where: { id: Number(req.params.id) },
  });
  return res.json({ message: "PR deleted" });
};

export const submitPR = async (req: AuthRequest, res: Response) => {
  const pr = await prisma.purchase_requests.update({
    where: { id: Number(req.params.id) },
    data: { status: "SUBMITTED" },
  });

  await prisma.tracking_logs.create({
    data: {
      purchase_request_id: pr.id,
      from_user_id: req.user!.userId,
      status_before: "DRAFT",
      status_after: "SUBMITTED",
      action: "SUBMITTED",
      remarks: "Purchase Request submitted for approval",
    },
  });

  await prisma.notifications.create({
    data: {
      user_id: req.user!.userId,
      purchase_request_id: pr.id,
      type: "PR_SUBMITTED",
      title: "PR Submitted",
      message: `Your PR ${pr.pr_number} has been submitted successfully.`,
    },
  });

  return res.json(pr);
};

export const cancelPR = async (req: AuthRequest, res: Response) => {
  const pr = await prisma.purchase_requests.update({
    where: { id: Number(req.params.id) },
    data: { status: "CANCELLED" },
  });
  return res.json(pr);
};
