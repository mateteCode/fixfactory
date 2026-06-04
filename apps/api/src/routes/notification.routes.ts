// src/routes/notification.routes.ts
import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js"; // Ajusta el path de tu middleware si es diferente

const router = Router();

// Ruta para obtener las notificaciones del usuario logueado
router.get("/", authenticate, getMyNotifications);

// Ruta para marcar una notificación (o todas) como leída
router.patch("/:id/read", authenticate, markAsRead);

export default router;
