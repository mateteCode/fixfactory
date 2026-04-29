import type { Request, Response } from "express";
import User from "../models/User.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";

// Listar usuarios (solo activos por defecto)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === "true" ? {} : { active: true };
    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// Borrado Lógico (Desactivar)
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true },
    );
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario desactivado correctamente", user });
  } catch (error) {
    res.status(500).json({ message: "Error al desactivar usuario" });
  }
};

// Borrado Físico (Eliminar de la DB)
export const deleteUserPhysical = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    if (adminId === req.params.id) {
      return res
        .status(400)
        .json({
          message: "No puedes eliminar tu propia cuenta administrativa.",
        });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado físicamente de la base de datos" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};
