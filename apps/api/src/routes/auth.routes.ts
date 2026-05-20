import { Router } from "express";
import {
  register,
  login,
  registerCompany,
  changePassword,
  forgotPassword,
  resetPassword,
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

// Cambio de contraseña (REQUIERE estar logueado)
router.post("/change-password", authenticate, changePassword);

// Recuperación (Públicas, NO requieren estar logueado)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
