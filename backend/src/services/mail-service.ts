import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ── Verify connection on startup
transporter.verify((err) => {
  if (err) console.error("❌ Mail transporter error:", err);
  else console.log("✅ Mail transporter ready");
});

// ── Types and Interfaces
interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

// ── Send helper
export const sendMail = async ({ to, subject, html }: SendMailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || "BISU-Bilar Procurement MIS",
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to} — MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
    // Don't throw — email failure should not break the main flow
  }
};

// ── Email Templates

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BISU-Bilar Procurement MIS</title>
</head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,58,143,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1A3A8F 0%,#5B2D8E 100%);padding:32px 40px;text-align:center;">
              <h1 style="color:#F5C400;font-size:1.25rem;font-weight:800;margin:0 0 4px 0;letter-spacing:0.5px;">
                BISU – Bilar Campus
              </h1>
              <p style="color:rgba(255,255,255,0.75);font-size:0.8125rem;margin:0;">
                Procurement Management Information System
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:0.75rem;margin:0 0 4px 0;">
                This is an automated message from BISU-Bilar Procurement MIS.
              </p>
              <p style="color:#9ca3af;font-size:0.75rem;margin:0;">
                Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    SUBMITTED: { bg: "#dbeafe", color: "#1d4ed8" },
    UNDER_REVIEW: { bg: "#fef9c3", color: "#92400e" },
    APPROVED: { bg: "#dcfce7", color: "#15803d" },
    REJECTED: { bg: "#fee2e2", color: "#b91c1c" },
    RETURNED: { bg: "#ffedd5", color: "#c2410c" },
    COMPLETED: { bg: "#ede9fe", color: "#6d28d9" },
    CANCELLED: { bg: "#f3f4f6", color: "#374151" },
  };
  const s = map[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return `<span style="display:inline-block;padding:4px 14px;border-radius:9999px;font-size:0.75rem;font-weight:700;background:${s.bg};color:${s.color};">${status.replace(/_/g, " ")}</span>`;
};

const prInfoBox = (
  prNumber: string,
  title: string,
  amount: number,
  status: string,
) => `
  <div style="background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;padding:20px 24px;margin:20px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <p style="color:#9ca3af;font-size:0.7rem;font-weight:600;margin:0 0 2px 0;text-transform:uppercase;letter-spacing:0.5px;">PR Number</p>
          <p style="color:#1A3A8F;font-size:1rem;font-weight:800;font-family:monospace;margin:0 0 12px 0;">${prNumber}</p>
        </td>
        <td align="right" valign="top">
          ${statusBadge(status)}
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <p style="color:#9ca3af;font-size:0.7rem;font-weight:600;margin:0 0 2px 0;text-transform:uppercase;letter-spacing:0.5px;">Title</p>
          <p style="color:#1f2937;font-size:0.9375rem;font-weight:600;margin:0 0 12px 0;">${title}</p>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <p style="color:#9ca3af;font-size:0.7rem;font-weight:600;margin:0 0 2px 0;text-transform:uppercase;letter-spacing:0.5px;">Total Amount</p>
          <p style="color:#1A3A8F;font-size:1.125rem;font-weight:800;margin:0;">
            ₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
        </td>
      </tr>
    </table>
  </div>
`;

const ctaButton = (label: string, url: string) => `
  <div style="text-align:center;margin:24px 0 8px 0;">
    <a href="${url}" style="display:inline-block;background:#1A3A8F;color:#fff;font-weight:700;font-size:0.875rem;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
      ${label}
    </a>
  </div>
`;

// TEMPLATE FUNCTIONS

export const emailTemplates = {
  prSubmitted: (
    name: string,
    prNumber: string,
    title: string,
    amount: number,
    appUrl: string,
  ) =>
    baseLayout(`
      <h2 style="color:#1A3A8F;font-size:1.125rem;font-weight:700;margin:0 0 8px 0;">
        Hi ${name}, your PR has been submitted! 📋
      </h2>
      <p style="color:#6b7280;font-size:0.875rem;line-height:1.6;margin:0 0 4px 0;">
        Your Purchase Request has been successfully submitted and is now awaiting approval.
      </p>
      ${prInfoBox(prNumber, title, amount, "SUBMITTED")}
      <p style="color:#6b7280;font-size:0.8125rem;line-height:1.6;margin:0;">
        You will receive another email notification when the status of your PR changes.
      </p>
      ${ctaButton("View Purchase Request", `${appUrl}/purchase-requests`)}
    `),

  prApproved: (
    name: string,
    prNumber: string,
    title: string,
    amount: number,
    appUrl: string,
  ) =>
    baseLayout(`
      <h2 style="color:#15803d;font-size:1.125rem;font-weight:700;margin:0 0 8px 0;">
        🎉 Congratulations ${name}! Your PR has been approved.
      </h2>
      <p style="color:#6b7280;font-size:0.875rem;line-height:1.6;margin:0 0 4px 0;">
        Your Purchase Request has been fully approved and is now being processed by the Procurement Office.
      </p>
      ${prInfoBox(prNumber, title, amount, "APPROVED")}
      <p style="color:#6b7280;font-size:0.8125rem;line-height:1.6;margin:0;">
        The Procurement Office will proceed with the purchasing process. You may track the status anytime in the system.
      </p>
      ${ctaButton("View Purchase Request", `${appUrl}/purchase-requests`)}
    `),

  prRejected: (
    name: string,
    prNumber: string,
    title: string,
    amount: number,
    reason: string,
    appUrl: string,
  ) =>
    baseLayout(`
      <h2 style="color:#b91c1c;font-size:1.125rem;font-weight:700;margin:0 0 8px 0;">
        ❌ Your PR has been rejected, ${name}.
      </h2>
      <p style="color:#6b7280;font-size:0.875rem;line-height:1.6;margin:0 0 4px 0;">
        Unfortunately, your Purchase Request has been rejected by the approving authority.
      </p>
      ${prInfoBox(prNumber, title, amount, "REJECTED")}
      <div style="background:#fef2f2;border-left:4px solid #b91c1c;border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 20px 0;">
        <p style="color:#9ca3af;font-size:0.7rem;font-weight:600;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.5px;">Reason for Rejection</p>
        <p style="color:#b91c1c;font-size:0.875rem;font-weight:500;margin:0;">${reason}</p>
      </div>
      <p style="color:#6b7280;font-size:0.8125rem;line-height:1.6;margin:0;">
        You may revise your Purchase Request and resubmit it addressing the concerns mentioned above.
      </p>
      ${ctaButton("View Purchase Request", `${appUrl}/purchase-requests`)}
    `),

  prReturned: (
    name: string,
    prNumber: string,
    title: string,
    amount: number,
    reason: string,
    appUrl: string,
  ) =>
    baseLayout(`
      <h2 style="color:#c2410c;font-size:1.125rem;font-weight:700;margin:0 0 8px 0;">
        🔁 Your PR has been returned for revision, ${name}.
      </h2>
      <p style="color:#6b7280;font-size:0.875rem;line-height:1.6;margin:0 0 4px 0;">
        Your Purchase Request has been returned and needs revision before it can be approved.
      </p>
      ${prInfoBox(prNumber, title, amount, "RETURNED")}
      <div style="background:#fff7ed;border-left:4px solid #c2410c;border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 20px 0;">
        <p style="color:#9ca3af;font-size:0.7rem;font-weight:600;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.5px;">Reason for Return</p>
        <p style="color:#c2410c;font-size:0.875rem;font-weight:500;margin:0;">${reason}</p>
      </div>
      <p style="color:#6b7280;font-size:0.8125rem;line-height:1.6;margin:0;">
        Please log in to the system, make the necessary revisions, and resubmit your PR.
      </p>
      ${ctaButton("Revise Purchase Request", `${appUrl}/purchase-requests`)}
    `),

  prStepApproved: (
    name: string,
    prNumber: string,
    title: string,
    amount: number,
    stepName: string,
    nextStep: string,
    appUrl: string,
  ) =>
    baseLayout(`
      <h2 style="color:#1A3A8F;font-size:1.125rem;font-weight:700;margin:0 0 8px 0;">
        ✅ Your PR passed a review step, ${name}.
      </h2>
      <p style="color:#6b7280;font-size:0.875rem;line-height:1.6;margin:0 0 4px 0;">
        Your Purchase Request has passed the <strong>${stepName}</strong> step and is now proceeding to the next step.
      </p>
      ${prInfoBox(prNumber, title, amount, "UNDER_REVIEW")}
      <div style="background:#eff6ff;border-radius:10px;padding:14px 18px;margin:0 0 20px 0;display:flex;align-items:center;gap:12px;">
        <div>
          <p style="color:#9ca3af;font-size:0.7rem;font-weight:600;margin:0 0 2px 0;text-transform:uppercase;letter-spacing:0.5px;">Next Step</p>
          <p style="color:#1d4ed8;font-size:0.9375rem;font-weight:700;margin:0;">${nextStep}</p>
        </div>
      </div>
      <p style="color:#6b7280;font-size:0.8125rem;line-height:1.6;margin:0;">
        You will be notified once the next step has been completed.
      </p>
      ${ctaButton("Track Your PR", `${appUrl}/purchase-requests`)}
    `),

  pendingApprovalAlert: (
    approverName: string,
    prNumber: string,
    title: string,
    amount: number,
    requesterName: string,
    stepName: string,
    appUrl: string,
  ) =>
    baseLayout(`
      <h2 style="color:#1A3A8F;font-size:1.125rem;font-weight:700;margin:0 0 8px 0;">
        📋 A PR requires your approval, ${approverName}.
      </h2>
      <p style="color:#6b7280;font-size:0.875rem;line-height:1.6;margin:0 0 4px 0;">
        A Purchase Request submitted by <strong>${requesterName}</strong> is awaiting your review at step <strong>${stepName}</strong>.
      </p>
      ${prInfoBox(prNumber, title, amount, "SUBMITTED")}
      <p style="color:#6b7280;font-size:0.8125rem;line-height:1.6;margin:0;">
        Please log in to the system to review and act on this Purchase Request.
      </p>
      ${ctaButton("Review Now", `${appUrl}/approvals`)}
    `),
};
