import { Router } from "express";
import {
  getUsers,
  createUser,
  deactivateUser,
  activateUser,
  deleteUserPhysical,
  updateUser,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { UserRole } from "../models/User.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";

const router = Router();

// Todas las rutas de usuario requieren estar logueado
router.use(authenticate);
router.use(checkTenant);

// Solo el ASISTENTE y el ADMIN pueden gestionar la nómina
router.get("/", authorize([UserRole.ASISTENTE, UserRole.ADMIN]), getUsers);
router.patch(
  "/:id/deactivate",
  authorize([UserRole.ASISTENTE, UserRole.ADMIN]),
  deactivateUser,
);
router.get("/", authorize([UserRole.ASISTENTE, UserRole.ADMIN]), getUsers);
router.patch(
  "/:id/activate",
  authorize([UserRole.ASISTENTE, UserRole.ADMIN]),
  activateUser,
);
router.delete("/:id", authorize([UserRole.ADMIN]), deleteUserPhysical); // El físico solo el ADMIN

router.post("/", authorize([UserRole.ADMIN, UserRole.ASISTENTE]), createUser);

router.put("/:id", authorize([UserRole.ADMIN, UserRole.ASISTENTE]), updateUser);

export default router;
