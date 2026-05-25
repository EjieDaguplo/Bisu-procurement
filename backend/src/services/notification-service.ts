import { prisma } from "../config/database";
import { sendMail, emailTemplates } from "./mail-service";
import { NotificationType } from "../types";

const APP_URL = process.env.FRONTEND_URL || "http://localhost:3000";

interface CreateNotificationOptions {
  user_id: number;
  purchase_request_id?: number;
  type: NotificationType;
  title: string;
  message: string;
  // email extras
  sendEmail?: boolean;
  emailSubject?: string;
  emailHtml?: string;
}

export const createNotification = async (opts: CreateNotificationOptions) => {
  // 1. Save in-app notification
  const notification = await prisma.notifications.create({
    data: {
      user_id: opts.user_id,
      purchase_request_id: opts.purchase_request_id,
      type: opts.type,
      title: opts.title,
      message: opts.message,
    },
  });

  // 2. Send email if requested
  if (opts.sendEmail && opts.emailSubject && opts.emailHtml) {
    const user = await prisma.users.findUnique({
      where: { id: opts.user_id },
    });
    if (user?.email) {
      await sendMail({
        to: user.email,
        subject: opts.emailSubject,
        html: opts.emailHtml,
      });
    }
  }

  return notification;
};
// Notification + Email helpers per event
export const notifyPRSubmitted = async (
  userId: number,
  prId: number,
  prNumber: string,
  prTitle: string,
  prAmount: number,
  userName: string,
) => {
  await createNotification({
    user_id: userId,
    purchase_request_id: prId,
    type: "PR_SUBMITTED",
    title: "PR Submitted Successfully",
    message: `Your PR ${prNumber} — "${prTitle}" has been submitted and is awaiting approval.`,
    sendEmail: true,
    emailSubject: `[BISU Procurement] PR ${prNumber} Submitted`,
    emailHtml: emailTemplates.prSubmitted(
      userName,
      prNumber,
      prTitle,
      prAmount,
      APP_URL,
    ),
  });
};

export const notifyPRApproved = async (
  userId: number,
  prId: number,
  prNumber: string,
  prTitle: string,
  prAmount: number,
  userName: string,
) => {
  await createNotification({
    user_id: userId,
    purchase_request_id: prId,
    type: "PR_APPROVED",
    title: "PR Fully Approved 🎉",
    message: `Your PR ${prNumber} — "${prTitle}" has been fully approved.`,
    sendEmail: true,
    emailSubject: `[BISU Procurement] PR ${prNumber} Approved ✅`,
    emailHtml: emailTemplates.prApproved(
      userName,
      prNumber,
      prTitle,
      prAmount,
      APP_URL,
    ),
  });
};

export const notifyPRRejected = async (
  userId: number,
  prId: number,
  prNumber: string,
  prTitle: string,
  prAmount: number,
  userName: string,
  reason: string,
) => {
  await createNotification({
    user_id: userId,
    purchase_request_id: prId,
    type: "PR_REJECTED",
    title: "PR Rejected",
    message: `Your PR ${prNumber} has been rejected. Reason: ${reason}`,
    sendEmail: true,
    emailSubject: `[BISU Procurement] PR ${prNumber} Rejected ❌`,
    emailHtml: emailTemplates.prRejected(
      userName,
      prNumber,
      prTitle,
      prAmount,
      reason,
      APP_URL,
    ),
  });
};

export const notifyPRReturned = async (
  userId: number,
  prId: number,
  prNumber: string,
  prTitle: string,
  prAmount: number,
  userName: string,
  reason: string,
) => {
  await createNotification({
    user_id: userId,
    purchase_request_id: prId,
    type: "PR_RETURNED",
    title: "PR Returned for Revision",
    message: `Your PR ${prNumber} has been returned. Reason: ${reason}`,
    sendEmail: true,
    emailSubject: `[BISU Procurement] PR ${prNumber} Returned for Revision 🔁`,
    emailHtml: emailTemplates.prReturned(
      userName,
      prNumber,
      prTitle,
      prAmount,
      reason,
      APP_URL,
    ),
  });
};

export const notifyPRStepApproved = async (
  userId: number,
  prId: number,
  prNumber: string,
  prTitle: string,
  prAmount: number,
  userName: string,
  stepName: string,
  nextStep: string,
) => {
  await createNotification({
    user_id: userId,
    purchase_request_id: prId,
    type: "PENDING_ACTION",
    title: `PR Passed: ${stepName}`,
    message: `Your PR ${prNumber} passed "${stepName}" and is now at "${nextStep}".`,
    sendEmail: true,
    emailSubject: `[BISU Procurement] PR ${prNumber} Passed Review Step`,
    emailHtml: emailTemplates.prStepApproved(
      userName,
      prNumber,
      prTitle,
      prAmount,
      stepName,
      nextStep,
      APP_URL,
    ),
  });
};

export const notifyApproverPending = async (
  approverId: number,
  prId: number,
  prNumber: string,
  prTitle: string,
  prAmount: number,
  approverName: string,
  requesterName: string,
  stepName: string,
) => {
  await createNotification({
    user_id: approverId,
    purchase_request_id: prId,
    type: "PENDING_ACTION",
    title: "New PR Awaiting Your Approval",
    message: `PR ${prNumber} — "${prTitle}" requires your review at step "${stepName}".`,
    sendEmail: true,
    emailSubject: `[BISU Procurement] Action Required: PR ${prNumber}`,
    emailHtml: emailTemplates.pendingApprovalAlert(
      approverName,
      prNumber,
      prTitle,
      prAmount,
      requesterName,
      stepName,
      APP_URL,
    ),
  });
};
