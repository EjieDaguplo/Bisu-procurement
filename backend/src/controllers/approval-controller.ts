import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";

export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  try {
    // Pending approvals have NO approver yet — filter by role instead
    // Find the approval step that matches the current user's role
    const user = await prisma.users.findUnique({
      where: { id: req.user!.userId },
      include: { roles: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Get the approval step(s) that match this user's role
    const matchingSteps = await prisma.approval_steps.findMany({
      where: { role_id: user.role_id, is_active: true },
    });

    const stepIds = matchingSteps.map((s) => s.id);

    const approvals = await prisma.pr_approvals.findMany({
      where: {
        action: "PENDING",
        approval_step_id: { in: stepIds },
      },
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
  } catch (err) {
    console.error("GET PENDING APPROVALS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getApprovalsByPR = async (req: AuthRequest, res: Response) => {
  try {
    const approvals = await prisma.pr_approvals.findMany({
      where: { purchase_request_id: Number(req.params.prId) },
      include: {
        approval_steps: true,
        users: { select: { first_name: true, last_name: true } },
      },
      orderBy: { created_at: "asc" },
    });
    return res.json(approvals);
  } catch (err) {
    console.error("GET APPROVALS BY PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const approvePR = async (req: AuthRequest, res: Response) => {
  try {
    const { remarks } = req.body;

    const approval = await prisma.pr_approvals.update({
      where: { id: Number(req.params.id) },
      data: {
        action: "APPROVED",
        approver_id: req.user!.userId,
        remarks,
        acted_at: new Date(),
      },
      include: { purchase_requests: true, approval_steps: true },
    });

    // Check if there are more pending steps for this PR
    const nextPending = await prisma.pr_approvals.findFirst({
      where: {
        purchase_request_id: approval.purchase_request_id,
        action: "PENDING",
      },
      include: { approval_steps: true },
    });

    // If no more pending steps → fully APPROVED, else stay UNDER_REVIEW
    const newStatus = nextPending ? "UNDER_REVIEW" : "APPROVED";

    await prisma.purchase_requests.update({
      where: { id: approval.purchase_request_id },
      data: { status: newStatus },
    });

    await prisma.tracking_logs.create({
      data: {
        purchase_request_id: approval.purchase_request_id,
        from_user_id: req.user!.userId,
        from_office: approval.approval_steps.step_name,
        to_office:
          nextPending?.approval_steps.step_name ?? "Procurement Office",
        status_before: "UNDER_REVIEW",
        status_after: newStatus,
        action: "APPROVED",
        remarks: remarks ?? "Approved",
      },
    });

    await prisma.notifications.create({
      data: {
        user_id: approval.purchase_requests.requested_by,
        purchase_request_id: approval.purchase_request_id,
        type: newStatus === "APPROVED" ? "PR_APPROVED" : "PENDING_ACTION",
        title:
          newStatus === "APPROVED" ? "PR Fully Approved" : "PR Step Approved",
        message:
          newStatus === "APPROVED"
            ? `Your PR ${approval.purchase_requests.pr_number} has been fully approved.`
            : `Your PR ${approval.purchase_requests.pr_number} passed step "${approval.approval_steps.step_name}" and is awaiting next approval.`,
      },
    });

    return res.json({ ...approval, newStatus });
  } catch (err) {
    console.error("APPROVE PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const rejectPR = async (req: AuthRequest, res: Response) => {
  try {
    const { remarks } = req.body;

    const approval = await prisma.pr_approvals.update({
      where: { id: Number(req.params.id) },
      data: {
        action: "REJECTED",
        approver_id: req.user!.userId,
        remarks,
        acted_at: new Date(),
      },
      include: { purchase_requests: true, approval_steps: true },
    });

    await prisma.purchase_requests.update({
      where: { id: approval.purchase_request_id },
      data: { status: "REJECTED" },
    });

    await prisma.tracking_logs.create({
      data: {
        purchase_request_id: approval.purchase_request_id,
        from_user_id: req.user!.userId,
        from_office: approval.approval_steps.step_name,
        status_before: "UNDER_REVIEW",
        status_after: "REJECTED",
        action: "REJECTED",
        remarks: remarks ?? "Rejected",
      },
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
  } catch (err) {
    console.error("REJECT PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const returnPR = async (req: AuthRequest, res: Response) => {
  try {
    const { remarks } = req.body;

    const approval = await prisma.pr_approvals.update({
      where: { id: Number(req.params.id) },
      data: {
        action: "RETURNED",
        approver_id: req.user!.userId,
        remarks,
        acted_at: new Date(),
      },
      include: { purchase_requests: true, approval_steps: true },
    });

    await prisma.purchase_requests.update({
      where: { id: approval.purchase_request_id },
      data: { status: "DRAFT" },
    });

    await prisma.tracking_logs.create({
      data: {
        purchase_request_id: approval.purchase_request_id,
        from_user_id: req.user!.userId,
        from_office: approval.approval_steps.step_name,
        status_before: "UNDER_REVIEW",
        status_after: "DRAFT",
        action: "RETURNED",
        remarks: remarks ?? "Returned for revision",
      },
    });

    await prisma.notifications.create({
      data: {
        user_id: approval.purchase_requests.requested_by,
        purchase_request_id: approval.purchase_request_id,
        type: "PR_RETURNED",
        title: "PR Returned for Revision",
        message: `Your PR ${approval.purchase_requests.pr_number} has been returned. Reason: ${remarks}`,
      },
    });

    return res.json(approval);
  } catch (err) {
    console.error("RETURN PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
