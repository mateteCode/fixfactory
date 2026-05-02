import { Router } from "express";
import { getGeneralStats } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { UserRole } from "../models/User.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";

const router = Router();

router.get(
  "/stats",
  authenticate,
  checkTenant,
  authorize([UserRole.ADMIN, UserRole.GERENTE]),
  getGeneralStats,
);

export default router;
