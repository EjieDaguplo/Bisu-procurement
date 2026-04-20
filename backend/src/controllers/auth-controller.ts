import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { AuthRequest } from "../types";

const generateAccessToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "15m" });

const generateRefreshToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.roles.name, // "roles" is the relation field name in your schema
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
    console.error("❌ LOGIN ERROR:", err); // always log the real error
    return res.status(500).json({ message: "Server error" });
  }
};

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
    console.error("❌ LOGOUT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as { userId: number; email: string; role: string };

    const stored = await prisma.refresh_tokens.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.expires_at < new Date()) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return res.json({ accessToken });
  } catch (err) {
    console.error("❌ REFRESH TOKEN ERROR:", err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user!.userId },
      include: {
        roles: true,
        departments: true,
      },
      // ❌ REMOVED "omit" — not supported reliably with your generator
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Manually exclude password_hash instead
    const { password_hash, ...safeUser } = user;

    return res.json(safeUser);
  } catch (err) {
    console.error("❌ GET ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
