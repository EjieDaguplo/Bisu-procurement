import { Request, Response } from "express";
import { prisma } from "../config/database";

export const getAllDepartments = async (_req: Request, res: Response) => {
  const departments = await prisma.departments.findMany({
    orderBy: { name: "asc" },
  });
  return res.json(departments);
};
