import { Router } from "express";
import authRoutes from "./auth-routes";
import userRoutes from "./user-routes";
import purchaseRequestRoutes from "./purchaseRequest-routes";
import approvalRoutes from "./approval-routes";
import trackingRoutes from "./tracking-routes";
import notificationRoutes from "./notification-routes";
import reportRoutes from "./report-routes";
import { authMiddleware } from "../middleware/auth-middleware";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/users", authMiddleware, userRoutes);
router.use("/purchase-requests", authMiddleware, purchaseRequestRoutes);
router.use("/approvals", authMiddleware, approvalRoutes);
router.use("/tracking", authMiddleware, trackingRoutes);
router.use("/notifications", authMiddleware, notificationRoutes);
router.use("/reports", authMiddleware, reportRoutes);
