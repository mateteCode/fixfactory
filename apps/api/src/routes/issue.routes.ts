import { Router } from "express";
import { createIssue, getIssues } from "../controllers/issue.controller.js";

const router = Router();

// Rutas base: /api/issues
router.post("/", createIssue);
router.get("/", getIssues);

export default router;
