import type { Request, Response } from "express";
import Company from "../models/Company.js";

// [!] Obtener el perfil de la empresa
export const getCompanyProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;

    // Buscamos la empresa y podemos traer datos del dueño (owner) si es necesario
    const company = await Company.findById(companyId).populate(
      "owner",
      "name email",
    );

    if (!company) {
      res.status(404).json({ message: "Empresa no encontrada" });
      return;
    }

    res.status(200).json(company);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el perfil de la empresa", error });
  }
};

// [!] Actualizar datos de la empresa
export const updateCompany = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const { name, taxId, address } = req.body;

    // Solo permitimos editar ciertos campos. El 'owner' o el 'plan' no deberían cambiarse por esta ruta simple.
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { name, taxId, address },
      { new: true, runValidators: true },
    );

    if (!updatedCompany) {
      res.status(404).json({ message: "Empresa no encontrada" });
      return;
    }

    res.status(200).json({
      message: "Datos de la empresa actualizados correctamente",
      company: updatedCompany,
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Error al actualizar la empresa",
      error: error.message,
    });
  }
};

// [!] Borrado lógico de la empresa (desactivar)
export const deactivateCompany = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;

    // Buscar la empresa para verificar su estado actual
    const company = await Company.findById(companyId);

    if (!company) {
      res.status(404).json({ message: "Empresa no encontrada" });
      return;
    }

    // Si ya está desactivada, avisar al usuario y salir
    if (!company.active) {
      res.status(400).json({
        message: "La empresa ya se encuentra desactivada actualmente.",
      });
      return;
    }

    // Proceder con la desactivación si estaba activa
    company.active = false;
    await company.save();

    // TODO: Desactivar a todos los usuarios y/o borrar todo de la empresa

    res.status(200).json({
      message: "La empresa ha sido desactivada correctamente.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al desactivar la empresa" });
  }
};
