import { Router } from "express";
import {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineHistory,
} from "../controllers/machine.controller.js";

const router = Router();

router.get("/", getMachines);
router.get("/:id", getMachineById);
router.post("/", createMachine);
router.put("/:id", updateMachine);
router.delete("/:id", deleteMachine);
router.get("/:id/history", getMachineHistory); // RF-02

export default router;
