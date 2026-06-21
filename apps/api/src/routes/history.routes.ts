import { Router } from "express";
import { getHistory } from "../controllers/history.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";

const router = Router();

router.use(authenticate, checkTenant);
router.get("/", getHistory);

export default router;