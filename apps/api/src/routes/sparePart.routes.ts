import { Router } from "express";
import {
  createSparePartRequest,
  getSparePartRequests,
  updatePurchaseDetails,
} from "../controllers/sparePart.controller.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { UserRole } from "../models/User.js";
import { validateOwnership } from "../middlewares/ownership.middleware.js";
import Issue from "../models/Issue.js";
import SparePartRequest from "../models/SparePartRequest.js";

const router = Router();

router.use(authenticate, checkTenant);

router.post(
  "/",
  authorize([UserRole.TECNICO, UserRole.ADMIN]),
  validateOwnership(Issue, "issue", "body"),
  createSparePartRequest,
);
router.get(
  "/",
  authorize([UserRole.COMPRAS, UserRole.ADMIN, UserRole.MANTENIMIENTO]),
  getSparePartRequests,
);
router.patch(
  "/:id",
  authorize([UserRole.COMPRAS, UserRole.ADMIN]),
  validateOwnership(SparePartRequest, "id", "params"),
  updatePurchaseDetails,
); // Para el área de Compras (RF-10)

export default router;
