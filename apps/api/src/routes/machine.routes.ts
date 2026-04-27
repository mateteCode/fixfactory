import { Router } from "express";
import {
  getMachines,
  createMachine,
} from "../controllers/machine.controller.js";

const router = Router();

// Rutas para /api/machines
router.get("/", getMachines);
router.post("/", createMachine);

export default router;
