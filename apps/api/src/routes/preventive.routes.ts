import { Router } from "express";
import {
  createPreventiveTask,
  getPreventiveTasks,
} from "../controllers/preventive.controller.js";
import { runMaintenanceCheck } from "../services/cron.service.js";

const router = Router();

router.post("/", createPreventiveTask);
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

export default router;
