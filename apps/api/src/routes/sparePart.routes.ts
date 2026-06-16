import { Router } from "express";
import {
  getSpareParts,
  getSparePartById,
  createSparePart,
  getPatterns,
  updateSparePart,
  deleteSparePart,
  adjustStock,
  createSparePartRequest,
  getSparePartRequests,
  updateRequestStatus,
  updateSparePartPrice,
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
// [✔] Obtener todos los repuestos: GET api/spare-parts/catalog
// Roles: Compras, Mantenimiento, Técnico, Admin
router.get(
  "/catalog/",
  authorize([
    UserRole.ADMIN,
    UserRole.COMPRAS,
    UserRole.MANTENIMIENTO,
    UserRole.TECNICO,
  ]),
  getSpareParts,
);

// [✔] Obtener catálogo : GET api/spare-parts/catalog/patterns
// Roles: Compras, Mantenimiento, Admin
router.get(
  "/catalog/patterns",
  authorize([UserRole.ADMIN, UserRole.COMPRAS, UserRole.MANTENIMIENTO]),
  getPatterns,
);

// [✔] Obtener Repuesto por ID : GET api/spare-parts/catalog/:id
// Roles: Compras, Mantenimiento, Técnico, Admin
router.get(
  "/catalog/:id",
  authorize([
    UserRole.ADMIN,
    UserRole.COMPRAS,
    UserRole.MANTENIMIENTO,
    UserRole.TECNICO,
  ]),
  getSparePartById,
);

// [✔] Crear Repuesto: POST api/spare-parts/catalog
// Roles: Compras, Mantenimiento, Admin
router.post(
  "/catalog/",
  authorize([UserRole.ADMIN, UserRole.COMPRAS, UserRole.MANTENIMIENTO]),
  createSparePart,
);

/*
// [ ] Cambiar el precio de un repuesto: PATCH api/spare-parts/catalog/:id/price
// Roles: Compras, Mantenimiento, Admin
router.patch(
  "/catalog/:id/price",
  authorize([UserRole.ADMIN, UserRole.COMPRAS, UserRole.MANTENIMIENTO]),
  updateSparePartPrice,
);
*/

// [✔] Cambiar algún dato del repuesto: PATCH api/spare-parts/catalog/:id
// Roles: Compras, Mantenimiento, Admin
router.patch(
  "/catalog/:id",
  authorize([UserRole.ADMIN, UserRole.COMPRAS, UserRole.MANTENIMIENTO]),
  updateSparePart,
);
router.delete("/catalog/:id", authorize([UserRole.ADMIN]), deleteSparePart);

// [✔] Incrementar/Decrementar el stock de un repuesto: POST api/spare-parts/catalog/:id/stock
// Roles: Compras, Admin
router.post(
  "/catalog/:id/stock",
  authorize([UserRole.ADMIN, UserRole.COMPRAS]),
  adjustStock,
);

// --- SOLICITUDES (PEDIDOS) ---
// [✔] Crear un pedido de repuesto: POST api/spare-parts/request
// Roles: Técnico, Mantenimiento, Admin
router.post(
  "/request",
  authorize([UserRole.TECNICO, UserRole.ADMIN, UserRole.MANTENIMIENTO]),
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
    UserRole.OPERARIO,
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
