import { Router } from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  closeIssue,
  assignIssue,
} from "../controllers/issue.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";
import { UserRole } from "../models/User.js";
import Machine from "../models/Machine.js";
import Issue from "../models/Issue.js";
import { validateOwnership } from "../middlewares/ownership.middleware.js";

const router = Router();

// Todas las rutas requieren estar logueado y tener una empresa asignada
router.use(authenticate);
router.use(checkTenant);

// Rutas base: /api/issues
// Cualquier empleado de la empresa puede ver y reportar fallas
router.get("/", getIssues);
router.get("/:id", getIssueById);
router.post(
  "/",
  authorize([UserRole.OPERARIO, UserRole.ADMIN, UserRole.MANTENIMIENTO]),
  validateOwnership(Machine, "machine", "body"),
  createIssue,
);

// Solo el técnico o mantenimiento pueden cambiar estados técnicos
router.patch(
  "/assign",
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANTENIMIENTO]),
  assignIssue,
);

router.patch(
  "/:id",
  authorize([UserRole.TECNICO, UserRole.MANTENIMIENTO, UserRole.ADMIN]),
  updateIssue,
);
router.patch(
  "/:id/close",
  authorize([UserRole.TECNICO, UserRole.MANTENIMIENTO, UserRole.ADMIN]),
  validateOwnership(Issue, "id", "params"),
  closeIssue,
);

export default router;
