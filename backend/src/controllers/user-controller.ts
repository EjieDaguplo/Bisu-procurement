import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/database";

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      include: { roles: true, departments: true },
      omit: { password_hash: true },
      orderBy: { created_at: "desc" },
    });
    return res.json(users);
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(req.params.id) },
      include: { roles: true, departments: true },
      omit: { password_hash: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error("GET USER BY ID ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      employee_id,
      first_name,
      last_name,
      email,
      password,
      role_id,
      department_id,
    } = req.body;

    if (!email || !password || !first_name || !last_name || !role_id)
      return res.status(400).json({ message: "Missing required fields" });

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        employee_id,
        first_name,
        last_name,
        email,
        password_hash: hashed,
        role_id: Number(role_id),
        department_id: department_id ? Number(department_id) : null,
      },
      include: { roles: true, departments: true },
      omit: { password_hash: true },
    });
    return res.status(201).json(user);
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { password, current_password, ...rest } = req.body;
    const data: Record<string, unknown> = { ...rest };

    if (password) {
      if (current_password) {
        const existing = await prisma.users.findUnique({
          where: { id: Number(req.params.id) },
        });
        if (!existing)
          return res.status(404).json({ message: "User not found" });

        const valid = await bcrypt.compare(
          current_password,
          existing.password_hash,
        );
        if (!valid)
          return res
            .status(400)
            .json({ message: "Current password is incorrect." });
      }
      data.password_hash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.users.update({
      where: { id: Number(req.params.id) },
      data,
      include: { roles: true, departments: true },
    });

    const { password_hash, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    await prisma.users.update({
      where: { id: Number(req.params.id) },
      data: { is_active: false },
    });
    return res.json({ message: "User deactivated successfully" });
  } catch (err) {
    console.error("DEACTIVATE USER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Hard delete — removes user + ALL their records via cascade
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ── Step 1: Get all PRs owned by this user ──
    const userPRs = await prisma.purchase_requests.findMany({
      where: { requested_by: userId },
      select: { id: true },
    });
    const prIds = userPRs.map((pr) => pr.id);

    // ── Step 2: Delete all PR-related records (cascade manually) ──
    if (prIds.length > 0) {
      // ML classifications
      await prisma.ml_classifications.deleteMany({
        where: { purchase_request_id: { in: prIds } },
      });

      // Notifications linked to PRs
      await prisma.notifications.deleteMany({
        where: { purchase_request_id: { in: prIds } },
      });

      // Tracking logs
      await prisma.tracking_logs.deleteMany({
        where: { purchase_request_id: { in: prIds } },
      });

      // PR approvals
      await prisma.pr_approvals.deleteMany({
        where: { purchase_request_id: { in: prIds } },
      });

      // PR line items
      await prisma.pr_line_items.deleteMany({
        where: { purchase_request_id: { in: prIds } },
      });

      // Purchase requests themselves
      await prisma.purchase_requests.deleteMany({
        where: { id: { in: prIds } },
      });
    }

    // ── Step 3: Delete user-level records ──
    await prisma.refresh_tokens.deleteMany({
      where: { user_id: userId },
    });

    await prisma.notifications.deleteMany({
      where: { user_id: userId },
    });

    await prisma.report_snapshots.deleteMany({
      where: { generated_by: userId },
    });

    // Nullify references in tracking logs (from/to user)
    await prisma.tracking_logs.updateMany({
      where: { from_user_id: userId },
      data: { from_user_id: null },
    });
    await prisma.tracking_logs.updateMany({
      where: { to_user_id: userId },
      data: { to_user_id: null },
    });

    // Nullify approver references
    await prisma.pr_approvals.updateMany({
      where: { approver_id: userId },
      data: { approver_id: null },
    });

    // ── Step 4: Delete the user ──
    await prisma.users.delete({ where: { id: userId } });

    return res.json({
      message: `User and all associated records deleted permanently.`,
      deleted: {
        purchase_requests: prIds.length,
        user_id: userId,
      },
    });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
