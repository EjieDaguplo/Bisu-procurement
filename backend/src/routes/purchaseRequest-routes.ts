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

const router = Router();

router.get("/", getAllPRs);
router.get("/:id", getPRById);
router.post("/", createPR);
router.put("/:id", updatePR);
router.delete("/:id", deletePR);
router.patch("/:id/submit", submitPR);
router.patch("/:id/cancel", cancelPR);

export default router;
