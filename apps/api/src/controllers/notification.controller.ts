import Notification from "../models/Notification.js";
import type { Request, Response } from "express";

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Traemos las últimas 50
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notificaciones" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID de la notificación (o 'all' para leer todas)
    const userId = (req as any).user.id;

    if (id === "all") {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true },
      );
    } else {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    res.json({ message: "Marcada(s) como leída(s)" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar" });
  }
};
