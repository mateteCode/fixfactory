import { Router } from "express";
import {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineHistory,
  deactivateMachine,
  getPatterns,
} from "../controllers/machine.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { UserRole } from "../models/User.js";

const router = Router();

// Aplicamos seguridad a todas las rutas del archivo
router.use(authenticate);
router.use(checkTenant);

// Obtener todas las máquinas
router.get("/", getMachines);

// Obtener Patrones de Máquinas creadas
router.get("/patterns", getPatterns);

// Obtener una maquina por su id
router.get("/:id", getMachineById);

// Crear una máquina
router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.ASISTENTE, UserRole.MANTENIMIENTO]),
  createMachine,
);

// Actualizar maquina
//router.patch("/:id", updateMachine);
router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.ASISTENTE, UserRole.MANTENIMIENTO]),
  updateMachine,
);

// Borrado lógico
router.patch(
  "/:id/deactivate",
  authorize([UserRole.ADMIN, UserRole.ASISTENTE, UserRole.MANTENIMIENTO]),
  deactivateMachine,
);

router.delete("/:id", deleteMachine);
router.get("/:id/history", getMachineHistory); // RF-02

export default router;
