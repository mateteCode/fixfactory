import { Router } from "express";
import {
  register,
  login,
  registerCompany,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Prefijo: /api/auth
router.post(
  "/register",
  authenticate,
  checkTenant,
  authorize(["ADMIN", "ASISTENTE"]),
  register,
);
router.post("/login", login);
router.post("/register-company", registerCompany);

export default router;
