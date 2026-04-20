import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  getMe,
} from "../controllers/auth-controller";
import { authMiddleware } from "../middleware/auth-middleware";

const router = Router();

router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/refresh-token", refreshToken);
router.get("/me", authMiddleware, getMe);

export default router;
