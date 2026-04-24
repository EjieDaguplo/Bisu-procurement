import { Router } from "express";
import {
  getAllPRs,
  getPRById,
  createPR,
  updatePR,
  deletePR,
  submitPR,
  cancelPR,
} from "../controllers/purchaseRequest-controller";
import { requireRole } from "../middleware/role-middleware";

const router = Router();

// All authenticated users can view PRs (controller filters by role)
router.get("/", getAllPRs);
router.get("/:id", getPRById);

// REQUESTER + ADMIN can create
router.post(
  "/",
  requireRole("REQUESTER", "ADMIN", "PROCUREMENT_OFFICER", "IT", "APPROVER"),
  createPR,
);

// Only owner (checked in controller) or ADMIN can update/delete
router.put("/:id", requireRole("REQUESTER", "ADMIN"), updatePR);
router.delete("/:id", requireRole("REQUESTER", "ADMIN"), deletePR);

// Submit and cancel
router.patch("/:id/submit", requireRole("REQUESTER", "ADMIN"), submitPR);
router.patch("/:id/cancel", requireRole("REQUESTER", "ADMIN"), cancelPR);

export default router;
