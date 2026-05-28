import mongoose from "mongoose";
import SparePartPattern from "../models/SparePartPattern.js";
import SparePartProfile from "../models/SparePartProfile.js";
import SparePart from "../models/SparePart.js";

export class SparePartService {
  static async getAllSpareParts(companyId: string) {
    const parts = await SparePart.find({ company: companyId, active: true })
      .populate("catalogRef")
      .lean();

    return parts.map((part: any) => {
      const pattern = part.catalogRef;
      return {
        _id: part._id,
        internalCode: part.internalCode || "S/C",
        stockQuantity: part.stockQuantity,
        minStock: part.minStock,
        price: part.price,
        location: part.location || "No asignada",

        // Datos del Catálogo (Nivel 1)
        brand: pattern?.brand || "Desconocida",
        partNumber: pattern?.partNumber || "S/N",
        name: pattern?.name || "Repuesto Genérico",
      };
    });
  }

  // 2. OBTENER POR ID (Ficha técnica completa)
  static async getSparePartById(partId: string, companyId: string) {
    const part = await SparePart.findOne({ _id: partId, company: companyId })
      .populate("catalogRef")
      .lean();

    if (!part) throw new Error("Repuesto no encontrado en el pañol.");

    const pattern: any = part.catalogRef;
    const profile = await SparePartProfile.findOne({
      catalogRef: pattern._id,
      company: companyId,
    })
      .populate("compatibleMachines", "name internalTag brand modelCode") // Traemos info básica de las máquinas compatibles
      .lean();

    return {
      _id: part._id,
      internalCode: part.internalCode,
      stockQuantity: part.stockQuantity,
      minStock: part.minStock,
      price: part.price,
      location: part.location,
      active: part.active,
      createdAt: part.createdAt,

      // Datos del Catálogo (Nivel 1)
      brand: pattern?.brand || "",
      partNumber: pattern?.partNumber || "",
      name: pattern?.name || "",
      technicalSpecs: pattern?.technicalSpecs || "",
      isVerified: pattern?.isVerified || false,
      isPrivate: pattern?.isPrivate || false,

      // Datos del Perfil (Nivel 2)
      customImageUrl: profile?.customImageUrl || pattern?.defaultImageUrl || "",
      manuals: profile?.manuals || [],
      images: profile?.images || [],
      compatibleMachines: profile?.compatibleMachines || [],
      supplierLinks: profile?.supplierLinks || [],
    };
  }

  static async createSparePart(companyId: string, data: any) {
    // Escudo de validación
    if (!data.brand || !data.partNumber || !data.name) {
      throw new Error(
        "Faltan datos de fábrica: marca, número de parte y nombre son obligatorios.",
      );
    }

    // Buscar o Crear el Patrón Global (Nivel 1)
    let pattern = await SparePartPattern.findOne({
      brand: data.brand.toUpperCase(),
      partNumber: data.partNumber.toUpperCase(),
    });

    if (!pattern) {
      pattern = await SparePartPattern.create({
        brand: data.brand,
        partNumber: data.partNumber,
        name: data.name,
        technicalSpecs: data.technicalSpecs,
        createdByCompany: companyId,
        isPrivate: data.isPrivate || false,
      });
    }

    // Buscar o Crear el Perfil Privado (Nivel 2)
    let profile = await SparePartProfile.findOne({
      catalogRef: pattern._id,
      company: companyId,
    });

    if (!profile) {
      profile = await SparePartProfile.create({
        catalogRef: pattern._id,
        company: companyId,
        customImageUrl: data.customImageUrl || "",
        manuals: data.manuals || [],
        images: data.images || [],
        compatibleMachines: data.compatibleMachines || [],
        supplierLinks: data.supplierLinks || [],
      });
    } else {
      // Actualizamos el perfil con los nuevos archivos/datos que subió el usuario
      if (data.customImageUrl) profile.customImageUrl = data.customImageUrl;
      if (data.manuals) profile.manuals = data.manuals;
      if (data.images) profile.images = data.images;
      if (data.compatibleMachines)
        profile.compatibleMachines = data.compatibleMachines;
      await profile.save();
    }

    // Validar y Crear Instancia Física (Nivel 3)
    const existingPart = await SparePart.findOne({
      catalogRef: pattern._id,
      company: companyId,
    });

    if (existingPart) {
      throw new Error(
        "Este repuesto ya está registrado en tu inventario. Para sumar unidades, editá su stock.",
      );
    }

    const newPart = await SparePart.create({
      catalogRef: pattern._id,
      company: companyId,
      internalCode: data.internalCode,
      stockQuantity: data.stockQuantity || 0,
      minStock: data.minStock || 1,
      price: data.price || 0,
      location: data.location,
      active: true,
    });

    // Devolvemos el repuesto aplanado
    return this.getSparePartById(newPart._id.toString(), companyId);
  }

  static async getPatterns(companyId: string) {
    const patterns = await SparePartPattern.find({
      $or: [{ isVerified: true }, { createdByCompany: companyId }],
    }).lean();

    const detailedPatterns = await Promise.all(
      patterns.map(async (pattern: any) => {
        const profile = await SparePartProfile.findOne({
          catalogRef: pattern._id,
          company: companyId,
        }).lean();

        return {
          _id: pattern._id,
          brand: pattern.brand,
          partNumber: pattern.partNumber,
          name: pattern.name,
          technicalSpecs: pattern.technicalSpecs || "",
          isVerified: pattern.isVerified || false,
          isPrivate: pattern.isPrivate || false,

          customImageUrl:
            profile?.customImageUrl || pattern.defaultImageUrl || "",
          manuals: profile?.manuals || [],
          images: profile?.images || [],
        };
      }),
    );

    return detailedPatterns;
  }
}
