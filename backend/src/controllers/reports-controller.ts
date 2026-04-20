import { Request, Response } from "express";
import { prisma } from "../config/database";

export const getSummaryReport = async (_req: Request, res: Response) => {
  const [total, byStatus, totalAmount] = await Promise.all([
    prisma.purchase_requests.count(),
    prisma.purchase_requests.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.purchase_requests.aggregate({ _sum: { total_amount: true } }),
  ]);
  return res.json({
    total,
    byStatus,
    totalAmount: totalAmount._sum.total_amount || 0,
  });
};

export const getDepartmentReport = async (_req: Request, res: Response) => {
  const report = await prisma.purchase_requests.groupBy({
    by: ["department_id"],
    _count: { id: true },
    _sum: { total_amount: true },
  });
  return res.json(report);
};

export const getStatusReport = async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const where: Record<string, unknown> = {};
  if (from && to) {
    where.created_at = {
      gte: new Date(from as string),
      lte: new Date(to as string),
    };
  }
  const prs = await prisma.purchase_requests.findMany({
    where,
    select: {
      pr_number: true,
      title: true,
      status: true,
      total_amount: true,
      created_at: true,
      departments: { select: { name: true } },
      users: { select: { first_name: true, last_name: true } },
    },
    orderBy: { created_at: "desc" },
  });
  return res.json(prs);
};
