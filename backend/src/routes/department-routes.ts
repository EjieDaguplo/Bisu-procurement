import { Router } from "express";
import { getAllDepartments } from "../controllers/department-controller";

const router = Router();
router.get("/", getAllDepartments);
export default router;
