import { Router } from "express";
import { getAgenda } from "../controllers/agenda.controller.js";
import {rescheduleIssue} from "../controllers/schedule.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { UserRole } from "../models/User.js";

const router = Router();

router.use(authenticate, checkTenant);

router.get("/", getAgenda);

router.patch(
    "/issues/:id",
    authorize([UserRole.ADMIN, UserRole.MANTENIMIENTO]),
    rescheduleIssue,
);

export default router;