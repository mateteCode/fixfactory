import { Router } from "express";
import {
  assignPreventive,
  createPreventiveTask,
  finishPreventive,
  getPreventiveTasks,
  releasePreventive,
  updatePreventiveStatus,
} from "../controllers/preventive.controller.js";
import { runMaintenanceCheck } from "../services/cron.service.js";
import Machine from "../models/Machine.js";
import { validateOwnership } from "../middlewares/ownership.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { UserRole } from "../models/User.js";

const router = Router();
router.use(authenticate, checkTenant);

router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.MANTENIMIENTO]),
  validateOwnership(Machine, "machine", "body"),
  createPreventiveTask,
);
router.get("/", getPreventiveTasks);
// Ruta para disparar el chequeo manualmente
router.post("/test-cron", async (req, res) => {
  try {
    await runMaintenanceCheck();
    res.status(200).json({
      message: "Chequeo manual ejecutado. Revisa la consola de la API.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al ejecutar el test", error });
  }
});
router.patch(
  "/assign",
  authorize(["ADMIN", "MANTENIMIENTO"]),
  assignPreventive,
);
router.patch(
  "/:id/status",
  authorize(["ADMIN", "MANTENIMIENTO", "TECNICO"]),
  updatePreventiveStatus,
);
router.patch(
  "/:id/finish",
  authorize(["ADMIN", "MANTENIMIENTO", "TECNICO"]),
  finishPreventive,
);
router.patch(
  "/:id/release",
  authorize(["ADMIN", "MANTENIMIENTO", "TECNICO"]),
  releasePreventive,
);

export default router;
