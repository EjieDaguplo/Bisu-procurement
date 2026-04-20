import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/database";

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await prisma.users.findMany({
    include: { roles: true, departments: true },
    omit: { password_hash: true },
  });
  return res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await prisma.users.findUnique({
    where: { id: Number(req.params.id) },
    include: { roles: true, departments: true },
    omit: { password_hash: true },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  const {
    employee_id,
    first_name,
    last_name,
    email,
    password,
    role_id,
    department_id,
  } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.users.create({
    data: {
      employee_id,
      first_name,
      last_name,
      email,
      password_hash: hashed,
      role_id,
      department_id,
    },
    include: { roles: true },
    omit: { password_hash: true },
  });
  return res.status(201).json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const { password, ...rest } = req.body;
  const data: Record<string, unknown> = { ...rest };
  if (password) data.password_hash = await bcrypt.hash(password, 10);

  const user = await prisma.users.update({
    where: { id: Number(req.params.id) },
    data,
    include: { roles: true },
    omit: { password_hash: true },
  });
  return res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  await prisma.users.update({
    where: { id: Number(req.params.id) },
    data: { is_active: false },
  });
  return res.json({ message: "User deactivated" });
};
