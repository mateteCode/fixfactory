import { Router } from "express";
import { getGeneralStats } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/stats", getGeneralStats);

export default router;
