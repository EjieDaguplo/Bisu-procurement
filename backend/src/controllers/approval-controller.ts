//CHANGES
import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";
import {
  notifyPRRejected,
  notifyPRReturned,
} from "../services/notification-service";

// Only called when PR is fully approved
const generatePRNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.purchase_requests.count({
    where: { pr_number: { not: null } },
  });
  return `PR-${year}-${String(count + 1).padStart(5, "0")}`;
};

export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user!.userId },
      include: { roles: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const matchingSteps = await prisma.approval_steps.findMany({
      where: { role_id: user.role_id, is_active: true },
    });

    const stepIds = matchingSteps.map((s) => s.id);
    if (stepIds.length === 0) return res.json([]);

    const allPending = await prisma.pr_approvals.findMany({
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

    // Batch fetch all pending for the relevant PRs — avoids broken nested filter
    const prIds = [...new Set(allPending.map((a) => a.purchase_request_id))];

    const allPendingForThesePRs = await prisma.pr_approvals.findMany({
      where: {
        purchase_request_id: { in: prIds },
        action: "PENDING",
      },
      include: { approval_steps: true },
    });

    // JS comparison — correct and no N+1 queries
    const visible = allPending.filter((approval) => {
      const thisStepOrder = approval.approval_steps.step_order;
      const blockedByPrevious = allPendingForThesePRs.some(
        (other) =>
          other.purchase_request_id === approval.purchase_request_id &&
          other.id !== approval.id &&
          other.approval_steps.step_order < thisStepOrder,
      );
      return !blockedByPrevious;
    });

    return res.json(visible);
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
      include: { approval_steps: true, purchase_requests: true },
    });

    const nextPending = await prisma.pr_approvals.findFirst({
      where: {
        purchase_request_id: approval.purchase_request_id,
        action: "PENDING",
      },
      include: { approval_steps: true },
      orderBy: { approval_steps: { step_order: "asc" } },
    });

    const newStatus = nextPending ? "UNDER_REVIEW" : "APPROVED";

    // Only generate PR number on final approval
    let assignedPRNumber: string | null = null;
    if (newStatus === "APPROVED") {
      assignedPRNumber = await generatePRNumber();
    }

    await prisma.purchase_requests.update({
      where: { id: approval.purchase_request_id },
      data: {
        status: newStatus,
        ...(assignedPRNumber && { pr_number: assignedPRNumber }),
      },
    });

    await prisma.tracking_logs.create({
      data: {
        purchase_request_id: approval.purchase_request_id,
        from_user_id: req.user!.userId,
        from_office: approval.approval_steps.step_name,
        to_office:
          nextPending?.approval_steps.step_name ?? "Procurement Office",
        status_before: "SUBMITTED",
        status_after: newStatus,
        action: "APPROVED",
        remarks: remarks ?? "Approved",
      },
    });

    const prId = approval.purchase_request_id;
    const prTitle = approval.purchase_requests.title;

    if (newStatus === "APPROVED" && assignedPRNumber) {
      await prisma.notifications.create({
        data: {
          user_id: approval.purchase_requests.requested_by,
          purchase_request_id: prId,
          type: "PR_APPROVED",
          title: "Purchase Request Fully Approved 🎉",
          message: `Your Purchase Request "${prTitle}" has been fully approved! Official PR Number assigned: ${assignedPRNumber}`,
        },
      });
    } else {
      await prisma.notifications.create({
        data: {
          user_id: approval.purchase_requests.requested_by,
          purchase_request_id: prId,
          type: "PENDING_ACTION",
          title: `Step Approved: ${approval.approval_steps.step_name}`,
          message: `Your Purchase Request (ID #${prId}) "${prTitle}" passed "${approval.approval_steps.step_name}" and is now at "${nextPending?.approval_steps.step_name}".`,
        },
      });

      if (nextPending) {
        const nextApprovers = await prisma.users.findMany({
          where: {
            role_id: nextPending.approval_steps.role_id,
            is_active: true,
          },
        });
        await Promise.all(
          nextApprovers.map((approver) =>
            prisma.notifications.create({
              data: {
                user_id: approver.id,
                purchase_request_id: prId,
                type: "PENDING_ACTION",
                title: "PR Awaiting Your Approval",
                message: `Purchase Request (ID #${prId}) "${prTitle}" has reached your step: "${nextPending.approval_steps.step_name}".`,
              },
            }),
          ),
        );
      }
    }

    return res.json({ ...approval, newStatus, pr_number: assignedPRNumber });
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
      include: { approval_steps: true, purchase_requests: true },
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
        status_before: "SUBMITTED",
        status_after: "REJECTED",
        action: "REJECTED",
        remarks: remarks ?? "Rejected",
      },
    });

    const requester = await prisma.users.findUnique({
      where: { id: approval.purchase_requests.requested_by },
    });
    const requesterName =
      `${requester?.first_name ?? ""} ${requester?.last_name ?? ""}`.trim();

    // pr_number may be null — pass a fallback label for the email
    await notifyPRRejected(
      approval.purchase_requests.requested_by,
      approval.purchase_request_id,
      approval.purchase_requests.pr_number ??
        `Request #${approval.purchase_request_id}`,
      approval.purchase_requests.title,
      Number(approval.purchase_requests.total_amount),
      requesterName,
      remarks ?? "No reason provided",
    );

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
      include: { approval_steps: true, purchase_requests: true },
    });

    await prisma.purchase_requests.update({
      where: { id: approval.purchase_request_id },
      data: { status: "DRAFT" },
    });

    // Reset all pending steps so PR can be resubmitted cleanly
    await prisma.pr_approvals.deleteMany({
      where: {
        purchase_request_id: approval.purchase_request_id,
        action: "PENDING",
      },
    });

    await prisma.tracking_logs.create({
      data: {
        purchase_request_id: approval.purchase_request_id,
        from_user_id: req.user!.userId,
        from_office: approval.approval_steps.step_name,
        status_before: "SUBMITTED",
        status_after: "DRAFT",
        action: "RETURNED",
        remarks: remarks ?? "Returned for revision",
      },
    });

    const requester = await prisma.users.findUnique({
      where: { id: approval.purchase_requests.requested_by },
    });
    const requesterName =
      `${requester?.first_name ?? ""} ${requester?.last_name ?? ""}`.trim();

    // pr_number may be null — pass fallback label
    await notifyPRReturned(
      approval.purchase_requests.requested_by,
      approval.purchase_request_id,
      approval.purchase_requests.pr_number ??
        `Request #${approval.purchase_request_id}`,
      approval.purchase_requests.title,
      Number(approval.purchase_requests.total_amount),
      requesterName,
      remarks ?? "No reason provided",
    );

    return res.json(approval);
  } catch (err) {
    console.error("RETURN PR ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
