import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, AuthPayload } from "../types";

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
