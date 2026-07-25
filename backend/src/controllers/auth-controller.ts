//auth-controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";

// ── Token generators ─────────────────────────────────────────
const generateAccessToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "15m" });

const generateRefreshToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });

// ── Login ────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await prisma.users.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user || !user.is_active)
      return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.roles.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refresh_tokens.create({
      data: { user_id: user.id, token: refreshToken, expires_at: expiresAt },
    });

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.roles.name,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── Register (public — REQUESTER only) ───────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const {
      employee_id,
      first_name,
      last_name,
      email,
      password,
      department_id,
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        message: "First name, last name, email and password are required.",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    // Validate password strength
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    // Check duplicate email
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }

    // Get REQUESTER role
    const requesterRole = await prisma.roles.findUnique({
      where: { name: "REQUESTER" },
    });
    if (!requesterRole) {
      return res.status(500).json({
        message: "System configuration error. Please contact admin.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        employee_id: employee_id?.trim() || null,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: hashed,
        role_id: requesterRole.id,
        department_id: department_id ? Number(department_id) : null,
        is_active: true,
      },
      include: { roles: true, departments: true },
    });

    // Auto-login after registration
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.roles.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
      },
    });

    const { password_hash, ...safeUser } = user;

    return res.status(201).json({
      message: "Account created successfully.",
      accessToken,
      refreshToken,
      user: {
        id: safeUser.id,
        employee_id: safeUser.employee_id,
        first_name: safeUser.first_name,
        last_name: safeUser.last_name,
        email: safeUser.email,
        role: safeUser.roles.name,
        departments: safeUser.departments,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── Logout ───────────────────────────────────────────────────
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refresh_tokens.deleteMany({
        where: { token: refreshToken },
      });
    }
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── Refresh Token ─────────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "Refresh token required" });

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as { userId: number; email: string; role: string };

    const stored = await prisma.refresh_tokens.findUnique({
      where: { token: refreshToken },
    });
    if (!stored || stored.expires_at < new Date())
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });

    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return res.json({ accessToken });
  } catch (err) {
    console.error("REFRESH TOKEN ERROR:", err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

// ── Get Me ────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user!.userId },
      include: { roles: true, departments: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { password_hash, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    console.error("GET ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
