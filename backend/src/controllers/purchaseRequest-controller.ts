import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";

//Generate PR number only when fully APPROVED
const generatePRNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();

  // Count only PRs that already have a pr_number assigned
  const count = await prisma.purchase_requests.count({
    where: { pr_number: { not: null } },
  });

  return `PR-${year}-${String(count + 1).padStart(5, "0")}`;
};

export const getAllPRs = async (req: AuthRequest, res: Response) => {
  try {
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
  } catch (err) {
    console.error("GET ALL PRS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPRById = async (req: AuthRequest, res: Response) => {
  try {
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
          orderBy: { approval_step_id: "asc" },
        },
        tracking_logs: {
          orderBy: { created_at: "asc" },
        },
      },
    });
    if (!pr)
      return res.status(404).json({ message: "Purchase Request not found" });
    return res.json(pr);
  } catch (err) {
    console.error("GET PR BY ID ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createPR = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      purpose,
      department_id,
      date_needed,
      remarks,
      priority,
      line_items,
    } = req.body;

    if (!title || !purpose || !department_id || !line_items?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const totalAmount = (
      line_items as { quantity: number; unit_price: number }[]
    ).reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

    //pr_number is NULL until the PR is fully approved
    const pr = await prisma.purchase_requests.create({
      data: {
        pr_number: null, // ← no number yet
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
  } catch (err) {
    console.error("CREATE PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updatePR = async (req: AuthRequest, res: Response) => {
  try {
    const pr = await prisma.purchase_requests.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!pr) return res.status(404).json({ message: "PR not found" });
    if (pr.status !== "DRAFT")
      return res.status(400).json({ message: "Only DRAFT PRs can be edited" });

    const { line_items, ...rest } = req.body;

    let total_amount = pr.total_amount;
    if (line_items?.length) {
      const calculated = (
        line_items as { quantity: number; unit_price: number }[]
      ).reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      total_amount = calculated as unknown as typeof pr.total_amount;
    }

    const updated = await prisma.purchase_requests.update({
      where: { id: Number(req.params.id) },
      data: {
        ...rest,
        total_amount,
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
  } catch (err) {
    console.error("UPDATE PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deletePR = async (req: AuthRequest, res: Response) => {
  try {
    const pr = await prisma.purchase_requests.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!pr) return res.status(404).json({ message: "PR not found" });
    if (pr.status !== "DRAFT")
      return res.status(400).json({ message: "Only DRAFT PRs can be deleted" });

    await prisma.purchase_requests.delete({
      where: { id: Number(req.params.id) },
    });
    return res.json({ message: "PR deleted successfully" });
  } catch (err) {
    console.error("DELETE PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const submitPR = async (req: AuthRequest, res: Response) => {
  try {
    const prId = Number(req.params.id);

    const pr = await prisma.purchase_requests.findUnique({
      where: { id: prId },
    });
    if (!pr) return res.status(404).json({ message: "PR not found" });
    if (pr.status !== "DRAFT")
      return res
        .status(400)
        .json({ message: "Only DRAFT PRs can be submitted" });

    const steps = await prisma.approval_steps.findMany({
      where: { is_active: true },
      orderBy: { step_order: "asc" },
    });
    if (steps.length === 0)
      return res
        .status(400)
        .json({
          message: "No approval steps configured. Please contact admin.",
        });

    //Still no pr_number assigned — just change status
    const updated = await prisma.purchase_requests.update({
      where: { id: prId },
      data: { status: "SUBMITTED" },
    });

    await prisma.pr_approvals.createMany({
      data: steps.map((step) => ({
        purchase_request_id: prId,
        approval_step_id: step.id,
        action: "PENDING" as const,
      })),
    });

    await prisma.tracking_logs.create({
      data: {
        purchase_request_id: prId,
        from_user_id: req.user!.userId,
        from_office: "Requesting Office",
        to_office: steps[0].step_name,
        status_before: "DRAFT",
        status_after: "SUBMITTED",
        action: "SUBMITTED",
        remarks: "Purchase Request submitted for approval.",
      },
    });

    await prisma.notifications.create({
      data: {
        user_id: req.user!.userId,
        purchase_request_id: prId,
        type: "PR_SUBMITTED",
        title: "PR Submitted Successfully",
        //No pr_number yet — reference by internal ID
        message: `Your Purchase Request (ID #${prId}) — "${updated.title}" has been submitted and is awaiting approval.`,
      },
    });

    const firstStepApprovers = await prisma.users.findMany({
      where: { role_id: steps[0].role_id, is_active: true },
    });

    if (firstStepApprovers.length > 0) {
      await prisma.notifications.createMany({
        data: firstStepApprovers.map((approver) => ({
          user_id: approver.id,
          purchase_request_id: prId,
          type: "PENDING_ACTION" as const,
          title: "New PR Awaiting Your Approval",
          message: `A Purchase Request (ID #${prId}) — "${updated.title}" has been submitted and requires your review at step "${steps[0].step_name}".`,
        })),
      });
    }

    return res.json(updated);
  } catch (err) {
    console.error("SUBMIT PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const cancelPR = async (req: AuthRequest, res: Response) => {
  try {
    const prId = Number(req.params.id);

    const pr = await prisma.purchase_requests.findUnique({
      where: { id: prId },
    });
    if (!pr) return res.status(404).json({ message: "PR not found" });
    if (!["DRAFT", "SUBMITTED"].includes(pr.status)) {
      return res
        .status(400)
        .json({ message: "Only DRAFT or SUBMITTED PRs can be cancelled" });
    }

    const updated = await prisma.purchase_requests.update({
      where: { id: prId },
      data: { status: "CANCELLED" },
    });

    await prisma.pr_approvals.updateMany({
      where: { purchase_request_id: prId, action: "PENDING" },
      data: { action: "REJECTED" },
    });

    await prisma.tracking_logs.create({
      data: {
        purchase_request_id: prId,
        from_user_id: req.user!.userId,
        status_before: pr.status,
        status_after: "CANCELLED",
        action: "CANCELLED",
        remarks: "Purchase Request was cancelled by the requester.",
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error("CANCEL PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

//Admin force-delete a PR and all cascade records
export const adminDeletePR = async (req: AuthRequest, res: Response) => {
  try {
    const prId = Number(req.params.id);

    const pr = await prisma.purchase_requests.findUnique({
      where: { id: prId },
    });
    if (!pr) return res.status(404).json({ message: "PR not found" });

    await prisma.ml_classifications.deleteMany({
      where: { purchase_request_id: prId },
    });
    await prisma.notifications.deleteMany({
      where: { purchase_request_id: prId },
    });
    await prisma.tracking_logs.deleteMany({
      where: { purchase_request_id: prId },
    });
    await prisma.pr_approvals.deleteMany({
      where: { purchase_request_id: prId },
    });
    await prisma.pr_line_items.deleteMany({
      where: { purchase_request_id: prId },
    });
    await prisma.purchase_requests.delete({ where: { id: prId } });

    return res.json({
      message: `Purchase Request (ID #${prId}) and all associated records have been permanently deleted.`,
    });
  } catch (err) {
    console.error("ADMIN DELETE PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
