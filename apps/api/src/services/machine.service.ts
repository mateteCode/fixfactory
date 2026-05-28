import Machine, { MachineStatus } from "../models/Machine.js";
import MachineProfile from "../models/MachineProfile.js";
import MachinePattern from "../models/MachinePattern.js";

export class MachineService {
  static async getAllMachines(companyId: string) {
    // Buscamos el Nivel 3 (Físico) y le hacemos populate al Nivel 1 (Patrón)
    //lean() es clave para rendimiento, devuelve JSON puro en lugar de documentos pesados de Mongoose
    const machines = await Machine.find({ company: companyId })
      .populate("catalogRef")
      .lean();

    // B. Buscamos el Nivel 2 (Perfiles) de esta empresa
    const profiles = await MachineProfile.find({ company: companyId }).lean();

    // C. Aplastamos (Flatten) los datos para que el frontend reciba lo que ya conoce
    return machines.map((machine: any) => {
      const pattern = machine.catalogRef;

      // Buscamos si la empresa personalizó esta máquina
      const profile = profiles.find(
        (p) => p.catalogRef.toString() === pattern._id.toString(),
      );

      return {
        _id: machine._id, // ID de la máquina física
        internalTag: machine.internalTag,
        status: machine.status,
        productionLine: machine.productionLine,
        location: machine.location,
        installationDate: machine.installationDate,
        purchasePrice: machine.purchasePrice,

        // Datos del Patrón Global (Nivel 1)
        brand: pattern?.brand || "Desconocida",
        modelCode: pattern?.modelCode || "S/N",
        name: pattern?.name || "Activo Industrial",

        // Datos del Perfil (Nivel 2) con fallback al Patrón (Nivel 1)
        imageUrl: profile?.customImageUrl || pattern?.defaultImageUrl || "",
        manuals: profile?.serviceManuals || [],
      };
    });
  }

  static async createMachine(companyId: string, data: any) {
    // Validaciones
    if (!data.brand || !data.modelCode || !data.internalTag) {
      throw new Error(
        "Faltan campos obligatorios: 'brand', 'modelCode' e 'internalTag' son requeridos.",
      );
    }
    if (!data.name) {
      throw new Error(
        "El nombre de la máquina ('name') es requerido para el catálogo.",
      );
    }

    // Buscar o Crear el Patrón Global (Nivel 1)
    let pattern = await MachinePattern.findOne({
      brand: data.brand.toUpperCase(),
      modelCode: data.modelCode.toUpperCase(),
    });

    if (!pattern) {
      pattern = await MachinePattern.create({
        brand: data.brand,
        modelCode: data.modelCode,
        name: data.name,
        technicalSpecs: data.technicalSpecs,
        createdByCompany: companyId,
        isPrivate: data.isPrivate || false, // Si es un invento de la fábrica, va true
      });
    }

    // Buscar o Crear el Perfil Privado (Nivel 2)
    let profile = await MachineProfile.findOne({
      catalogRef: pattern._id,
      company: companyId,
    });

    if (!profile) {
      profile = await MachineProfile.create({
        catalogRef: pattern._id,
        company: companyId,
        customImageUrl: data.customImageUrl || "",
        serviceManuals: data.serviceManuals || [],
        images: data.images || [],
        operationalNotes: data.operationalNotes || "",
      });
    }

    // Validar si el TAG interno ya existe en la empresa antes de crear la física
    const existingTag = await Machine.findOne({
      company: companyId,
      internalTag: data.internalTag.toUpperCase(),
    });

    if (existingTag) {
      throw new Error(
        `Ya existe una máquina con el TAG ${data.internalTag} en tu empresa.`,
      );
    }

    // Crear la Máquina Física (Nivel 3)
    const newMachine = await Machine.create({
      catalogRef: pattern._id,
      company: companyId,
      internalTag: data.internalTag,
      status: data.status || MachineStatus.OPERATIVA,
      productionLine: data.productionLine,
      location: data.location,
      installationDate: data.installationDate,
      purchasePrice: data.purchasePrice,
    });

    // Devolvemos la máquina recién creada con los datos del patrón adjuntos para el frontend
    return {
      _id: newMachine._id,
      internalTag: newMachine.internalTag,
      status: newMachine.status,
      productionLine: newMachine.productionLine,
      location: newMachine.location,
      brand: pattern.brand,
      modelCode: pattern.modelCode,
      name: pattern.name,
    };
  }

  static async deactivateMachine(machineId: string, companyId: string) {
    const machine = await Machine.findOne({
      _id: machineId,
      company: companyId,
    });

    if (!machine) {
      throw new Error("La máquina no existe o no pertenece a tu empresa.");
    }

    machine.status = MachineStatus.APAGADA;
    machine.active = false;

    await machine.save();
    return machine;
  }

  static async updateMachine(machineId: string, companyId: string, data: any) {
    const machine = await Machine.findOne({
      _id: machineId,
      company: companyId,
    });

    if (!machine) {
      throw new Error("La máquina no existe o no pertenece a tu empresa.");
    }

    // Actualizar campos del Activo Físico (Nivel 3)
    if (data.internalTag) machine.internalTag = data.internalTag;
    if (data.status) machine.status = data.status;
    if (data.productionLine !== undefined)
      machine.productionLine = data.productionLine;
    if (data.location !== undefined) machine.location = data.location;
    if (data.installationDate !== undefined)
      machine.installationDate = data.installationDate;
    if (data.purchasePrice !== undefined)
      machine.purchasePrice = data.purchasePrice;

    await machine.save();

    // Actualizar el Perfil Privado (Nivel 2) si se envían datos relacionados
    const hasProfileUpdates =
      data.customImageUrl !== undefined ||
      data.serviceManuals !== undefined ||
      data.images !== undefined ||
      data.operationalNotes !== undefined;

    if (hasProfileUpdates) {
      const profile = await MachineProfile.findOne({
        catalogRef: machine.catalogRef,
        company: companyId,
      });

      if (profile) {
        if (data.customImageUrl !== undefined)
          profile.customImageUrl = data.customImageUrl;
        if (data.serviceManuals) profile.serviceManuals = data.serviceManuals;
        if (data.images) profile.images = data.images;
        if (data.operationalNotes !== undefined)
          profile.operationalNotes = data.operationalNotes;

        await profile.save();
      }
    }

    return machine;
  }

  static async getMachineById(machineId: string, companyId: string) {
    const machine = await Machine.findOne({
      _id: machineId,
      company: companyId,
    })
      .populate("catalogRef")
      .lean();

    if (!machine) {
      throw new Error("Máquina no encontrada o no pertenece a la empresa.");
    }

    const pattern: any = machine.catalogRef;
    const profile = await MachineProfile.findOne({
      catalogRef: pattern._id,
      company: companyId,
    }).lean();

    return {
      _id: machine._id,
      internalTag: machine.internalTag,
      status: machine.status,
      productionLine: machine.productionLine,
      location: machine.location,
      installationDate: machine.installationDate,

      purchasePrice: machine.purchasePrice, // <-- ASEGURARSE QUE ESTÉ
      createdAt: machine.createdAt, // <-- NUEVO: Fecha de alta en el sistema

      // Datos del Catálogo (Nivel 1)
      brand: pattern?.brand || "Desconocida",
      modelCode: pattern?.modelCode || "S/N",
      name: pattern?.name || "Activo",
      technicalSpecs: pattern?.technicalSpecs || "",
      isVerified: pattern?.isVerified || false, // <-- NUEVO: Saber si es un patrón global oficial
      isPrivate: pattern?.isPrivate || false, // <-- NUEVO: Saber si es un invento de la empresa

      // Datos del Perfil (Nivel 2)
      operationalNotes: profile?.operationalNotes || "",
      imageUrl: profile?.customImageUrl || pattern?.defaultImageUrl || "",
      images: profile?.images || [],
      manuals: profile?.serviceManuals || [],
    };
  }

  static async getPatterns(companyId: string) {
    // 1. Buscamos los patrones globales o creados por la empresa
    const patterns = await MachinePattern.find({
      $or: [{ isVerified: true }, { createdByCompany: companyId }],
    }).lean();

    // 2. Por cada patrón, buscamos si la empresa ya le armó un Perfil de Documentación (Nivel 2)
    const detailedPatterns = await Promise.all(
      patterns.map(async (pattern: any) => {
        const profile = await MachineProfile.findOne({
          catalogRef: pattern._id,
          company: companyId,
        }).lean();

        return {
          _id: pattern._id,
          brand: pattern.brand,
          modelCode: pattern.modelCode,
          name: pattern.name,
          technicalSpecs: pattern.technicalSpecs || "",
          isVerified: pattern.isVerified || false,
          isPrivate: pattern.isPrivate || false,

          // Inyectamos la documentación multimedia del Nivel 2
          operationalNotes: profile?.operationalNotes || "",
          imageUrl: profile?.customImageUrl || pattern.defaultImageUrl || "",
          manuals: profile?.serviceManuals || [],
          images: profile?.images || [],
        };
      }),
    );

    return detailedPatterns;
  }
}
