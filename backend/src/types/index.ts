import { Request } from "express";

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export type PRStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type NotificationType =
  | "PR_SUBMITTED"
  | "PR_APPROVED"
  | "PR_REJECTED"
  | "PR_RETURNED"
  | "PR_COMPLETED"
  | "PENDING_ACTION"
  | "SYSTEM";
