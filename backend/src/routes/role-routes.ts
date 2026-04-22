import { Router } from "express";
import { getAllRoles } from "../controllers/role-controller";

const router = Router();
router.get("/", getAllRoles);
export default router;
