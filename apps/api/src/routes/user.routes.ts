import { Router } from "express";
import {
  getUsers,
  deactivateUser,
  deleteUserPhysical,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { UserRole } from "../models/User.js";

const router = Router();

// Todas las rutas de usuario requieren estar logueado
router.use(authenticate);

// Solo el ASISTENTE y el ADMIN pueden gestionar la nómina
router.get("/", authorize([UserRole.ASISTENTE, UserRole.ADMIN]), getUsers);
router.patch(
  "/:id/deactivate",
  authorize([UserRole.ASISTENTE, UserRole.ADMIN]),
  deactivateUser,
);
router.delete("/:id", authorize([UserRole.ADMIN]), deleteUserPhysical); // El físico solo el ADMIN

export default router;
