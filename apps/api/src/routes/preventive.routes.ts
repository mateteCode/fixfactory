import { Router } from "express";
import {
  createPreventiveTask,
  getPreventiveTasks,
} from "../controllers/preventive.controller.js";

const router = Router();

router.post("/", createPreventiveTask);
router.get("/", getPreventiveTasks);

export default router;
