export type Role =
  | "REQUESTER"
  | "APPROVER"
  | "PROCUREMENT_OFFICER"
  | "ADMIN"
  | "IT";
export type PRStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface User {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  department_id?: number;
  departments?: Department;
  avatar_url?: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
}

export interface LineItem {
  id?: number;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  specifications?: string;
}

export interface PurchaseRequest {
  id: number;
  pr_number: string;
  title: string;
  purpose: string;
  requested_by: number;
  department_id: number;
  total_amount: number;
  status: PRStatus;
  priority: Priority;
  date_needed?: string;
  remarks?: string;
  ml_category_id?: number;
  ml_confidence?: number;
  created_at: string;
  updated_at: string;
  users?: { first_name: string; last_name: string; employee_id: string };
  departments?: Department;
  pr_line_items?: LineItem[];
}

export interface Notification {
  id: number;
  user_id: number;
  purchase_request_id?: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  purchase_requests?: { pr_number: string; title: string };
}

export interface TrackingLog {
  id: number;
  purchase_request_id: number;
  from_office?: string;
  to_office?: string;
  status_before?: string;
  status_after: string;
  action: string;
  remarks?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}
