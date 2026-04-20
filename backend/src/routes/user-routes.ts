import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user-controller";
import { requireRole } from "../middleware/role-middleware";

const router = Router();

router.get("/", requireRole("ADMIN", "IT"), getAllUsers);
router.get("/:id", requireRole("ADMIN", "IT"), getUserById);
router.post("/", requireRole("ADMIN"), createUser);
router.put("/:id", requireRole("ADMIN"), updateUser);
router.delete("/:id", requireRole("ADMIN"), deleteUser);

export default router;
