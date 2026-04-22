import { Request, Response } from "express";
import { prisma } from "../config/database";

export const getAllRoles = async (_req: Request, res: Response) => {
  const roles = await prisma.roles.findMany({
    orderBy: { name: "asc" },
  });
  return res.json(roles);
};
