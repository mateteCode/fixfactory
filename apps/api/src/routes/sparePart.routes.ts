import { Router } from "express";
import {
  getSpareParts,
  createSparePart,
  updateSparePart,
  deleteSparePart,
  adjustStock,
  createSparePartRequest,
  getSparePartRequests,
  updateRequestStatus,
  /*updatePurchaseDetails,*/
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

// --- CATÁLOGO ---
router.get("/", getSpareParts);
router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.COMPRAS, UserRole.MANTENIMIENTO]),
  createSparePart,
);
router.patch(
  "/catalog/:id",
  authorize([UserRole.ADMIN, UserRole.COMPRAS, UserRole.MANTENIMIENTO]),
  updateSparePart,
);
router.delete("/catalog/:id", authorize([UserRole.ADMIN]), deleteSparePart);
router.post(
  "/catalog/:id/stock",
  authorize([UserRole.ADMIN, UserRole.COMPRAS, UserRole.MANTENIMIENTO]),
  adjustStock,
);

// --- SOLICITUDES (PEDIDOS) ---
router.post(
  "/request",
  authorize([UserRole.TECNICO, UserRole.ADMIN]),
  createSparePartRequest,
);
router.patch(
  "/request/:id/status",
  authorize([UserRole.COMPRAS, UserRole.ADMIN]),
  updateRequestStatus,
);
router.get(
  "/requests",
  authorize([
    UserRole.ADMIN,
    UserRole.COMPRAS,
    UserRole.MANTENIMIENTO,
    UserRole.TECNICO,
    UserRole.GERENTE,
  ]),
  getSparePartRequests,
);

/*
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
*/

export default router;
