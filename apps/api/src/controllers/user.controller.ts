import type { Request, Response } from "express";
import User from "../models/User.js";
import { PasswordHasher } from "../utils/PasswordHasher.js";

// Listar usuarios (solo activos por defecto)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { includeInactive } = req.query;
    const filter: any = { company: companyId };
    if (includeInactive !== "true") {
      filter.active = true;
    }
    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// Borrado Lógico (Desactivar)
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    // Buscar al usuario validando pertenencia a la empresa
    const user = await User.findOne({ _id: id as string, company: companyId });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado en tu empresa o no existe.",
      });
    }

    // Verificar si ya se encuentra desactivado
    if (!user.active) {
      return res.status(400).json({
        message: `El usuario ${user.name} ya se encuentra desactivado actualmente.`,
      });
    }

    // Proceder con la desactivación (Borrado Lógico)
    user.active = false;
    await user.save();

    res.json({ message: "Usuario desactivado correctamente", user });
  } catch (error) {
    res.status(500).json({ message: "Error al desactivar usuario" });
  }
};

// Borrado Físico (Eliminar de la DB)
export const deleteUserPhysical = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const requesterId = (req as any).user.id;
    if (requesterId === req.params.id) {
      return res.status(400).json({
        message: "No puedes eliminar tu propia cuenta administrativa.",
      });
    }

    const user = await User.findByIdAndDelete({
      _id: req.params.id,
      company: companyId,
    });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado físicamente de la base de datos" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};
