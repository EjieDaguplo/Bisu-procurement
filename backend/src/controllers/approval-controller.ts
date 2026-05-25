import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";
import {
  notifyPRApproved,
  notifyPRRejected,
  notifyPRReturned,
  notifyPRStepApproved,
  notifyApproverPending,
} from "../services/notification-service";

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

    // Only show approvals where all previous steps are already approved
    const visible = await Promise.all(
      allPending.map(async (approval) => {
        const thisStepOrder = approval.approval_steps.step_order;

        const blockedByPrevious = await prisma.pr_approvals.findFirst({
          where: {
            purchase_request_id: approval.purchase_request_id,
            action: "PENDING",
            approval_steps: { step_order: { lt: thisStepOrder } },
          },
          include: { approval_steps: true },
        });

        return blockedByPrevious ? null : approval;
      }),
    );

    return res.json(visible.filter(Boolean));
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
      include: {
        approval_steps: true,
        //include total_amount so email template can use it
        purchase_requests: true,
      },
    });

    // Check if any more steps are still PENDING
    const nextPending = await prisma.pr_approvals.findFirst({
      where: {
        purchase_request_id: approval.purchase_request_id,
        action: "PENDING",
      },
      include: { approval_steps: true },
      orderBy: { approval_steps: { step_order: "asc" } },
    });

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
        status_before: "SUBMITTED",
        status_after: newStatus,
        action: "APPROVED",
        remarks: remarks ?? "Approved",
      },
    });

    //Get requester info for email
    const requester = await prisma.users.findUnique({
      where: { id: approval.purchase_requests.requested_by },
    });
    const requesterName =
      `${requester?.first_name ?? ""} ${requester?.last_name ?? ""}`.trim();
    const prAmount = Number(approval.purchase_requests.total_amount);

    if (newStatus === "APPROVED") {
      //Fully approved — notify requester
      await notifyPRApproved(
        approval.purchase_requests.requested_by,
        approval.purchase_request_id,
        approval.purchase_requests.pr_number,
        approval.purchase_requests.title,
        prAmount,
        requesterName,
      );
    } else {
      //Step approved, more steps remain — notify requester of progress
      await notifyPRStepApproved(
        approval.purchase_requests.requested_by,
        approval.purchase_request_id,
        approval.purchase_requests.pr_number,
        approval.purchase_requests.title,
        prAmount,
        requesterName,
        approval.approval_steps.step_name,
        nextPending?.approval_steps.step_name ?? "Next Step",
      );

      //Notify next step approvers
      if (nextPending) {
        const nextApprovers = await prisma.users.findMany({
          where: {
            role_id: nextPending.approval_steps.role_id,
            is_active: true,
          },
        });

        await Promise.all(
          nextApprovers.map((approver) =>
            notifyApproverPending(
              approver.id,
              approval.purchase_request_id,
              approval.purchase_requests.pr_number,
              approval.purchase_requests.title,
              prAmount,
              `${approver.first_name} ${approver.last_name}`,
              requesterName,
              nextPending.approval_steps.step_name,
            ),
          ),
        );
      }
    }

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
      include: {
        approval_steps: true,
        purchase_requests: true,
      },
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

    //Get requester info for email
    const requester = await prisma.users.findUnique({
      where: { id: approval.purchase_requests.requested_by },
    });
    const requesterName =
      `${requester?.first_name ?? ""} ${requester?.last_name ?? ""}`.trim();

    await notifyPRRejected(
      approval.purchase_requests.requested_by,
      approval.purchase_request_id,
      approval.purchase_requests.pr_number,
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
      include: {
        approval_steps: true,
        purchase_requests: true,
      },
    });

    await prisma.purchase_requests.update({
      where: { id: approval.purchase_request_id },
      data: { status: "DRAFT" },
    });

    //Reset all PENDING approval steps for this PR so it can be resubmitted cleanly
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

    //Get requester info for email
    const requester = await prisma.users.findUnique({
      where: { id: approval.purchase_requests.requested_by },
    });
    const requesterName =
      `${requester?.first_name ?? ""} ${requester?.last_name ?? ""}`.trim();

    await notifyPRReturned(
      approval.purchase_requests.requested_by,
      approval.purchase_request_id,
      approval.purchase_requests.pr_number,
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
