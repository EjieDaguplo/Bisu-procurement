import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  getMe,
  register,
} from "../controllers/auth-controller";
import { authMiddleware } from "../middleware/auth-middleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", authMiddleware, logout);
router.post("/refresh-token", refreshToken);
router.get("/me", authMiddleware, getMe);

export default router;
