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

    if (!email || !password || !first_name || !last_name || !role_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check duplicate email
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

//Deactivate only — sets is_active = false
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

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    //Delete all dependent records in correct order
    // 1. Refresh tokens
    await prisma.refresh_tokens.deleteMany({
      where: { user_id: userId },
    });

    // 2. Notifications sent TO this user
    await prisma.notifications.deleteMany({
      where: { user_id: userId },
    });

    // 3. Tracking logs where this user is from_user or to_user
    await prisma.tracking_logs.updateMany({
      where: { from_user_id: userId },
      data: { from_user_id: null },
    });
    await prisma.tracking_logs.updateMany({
      where: { to_user_id: userId },
      data: { to_user_id: null },
    });

    // 4. PR approvals where this user is the approver
    await prisma.pr_approvals.updateMany({
      where: { approver_id: userId },
      data: { approver_id: null },
    });

    // 5. Report snapshots generated by this user
    await prisma.report_snapshots.deleteMany({
      where: { generated_by: userId },
    });

    // 6. Purchase requests — cannot delete if user has PRs
    //    Instead reassign or block deletion
    const prCount = await prisma.purchase_requests.count({
      where: { requested_by: userId },
    });

    if (prCount > 0) {
      return res.status(400).json({
        message: `Cannot delete user — they have ${prCount} purchase request(s) on record. Deactivate the account instead to preserve procurement history.`,
      });
    }

    // 7. Finally delete the user
    await prisma.users.delete({
      where: { id: userId },
    });

    return res.json({ message: "User deleted permanently" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
