import { Router } from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
} from "../controllers/issue.controller.js";

const router = Router();

// Rutas base: /api/issues
router.post("/", createIssue);
router.get("/", getIssues);
router.get("/:id", getIssueById);
router.put("/:id", updateIssue);

export default router;
