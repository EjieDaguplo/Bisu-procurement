import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  deleteUser,
} from "../controllers/user-controller";
import { requireRole } from "../middleware/role-middleware";

const router = Router();

router.get("/", requireRole("ADMIN"), getAllUsers);
router.get("/:id", requireRole("ADMIN"), getUserById);
router.post("/", requireRole("ADMIN"), createUser);
router.put("/:id", requireRole("ADMIN"), updateUser);
router.patch("/:id/deactivate", requireRole("ADMIN"), deactivateUser);
router.delete("/:id", requireRole("ADMIN"), deleteUser);

export default router;
