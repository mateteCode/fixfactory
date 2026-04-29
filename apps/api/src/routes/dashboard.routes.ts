import { Router } from "express";
import { getGeneralStats } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { UserRole } from "../models/User.js";

const router = Router();

router.get(
  "/stats",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.GERENTE]),
  getGeneralStats,
);

export default router;
