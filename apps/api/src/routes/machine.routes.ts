import { Router } from "express";
import {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineHistory,
} from "../controllers/machine.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";

const router = Router();

// Aplicamos seguridad a todas las rutas del archivo
router.use(authenticate);
router.use(checkTenant);

router.get("/", getMachines);
router.get("/:id", getMachineById);
router.post("/", createMachine);
router.put("/:id", updateMachine);
router.delete("/:id", deleteMachine);
router.get("/:id/history", getMachineHistory); // RF-02

export default router;
