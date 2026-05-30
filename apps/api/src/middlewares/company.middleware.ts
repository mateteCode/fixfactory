import type { Request, Response, NextFunction } from "express";
import Company from "../models/Company.js";

// [!] Verifica que el usuario logueado sea el admin original (owner) de la compañia
export const isCompanyOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    const companyId = (req as any).companyId;
    const company = await Company.findById(companyId);

    // Verificamos si el ID del usuario coincide con el owner de la empresa[cite: 2]
    if (!company || company.owner.toString() !== user.id) {
      return res.status(403).json({
        message: "Prohibido: Solo el dueño de la empresa puede acceder.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Error de validación de propiedad" });
  }
};
