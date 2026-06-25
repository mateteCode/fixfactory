import type { Request, Response } from "express";
import Machine from "../models/Machine.js";
import Issue from "../models/Issue.js";
import PreventiveMaintenance from "../models/PreventiveMaintenance.js";
import SparePartRequest from "../models/SparePartRequest.js";

import { MachineService } from "../services/machine.service.js";

// [✔] Obtiene todas las máquinas de la compañia del usuario
export const getMachines = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    if (!companyId) {
      res
        .status(400)
        .json({ message: "No se identificó la empresa del usuario." });
      return;
    }

    const formattedMachines = await MachineService.getAllMachines(companyId);
    res.status(200).json(formattedMachines);
  } catch (error: any) {
    res.status(500).json({
      message: "Error al recuperar las máquinas",
      error: error.message,
    });
  }
};

// [!] Desactivar máquina de una compañia (Borrado lógico)
export const deactivateMachine = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    await MachineService.deactivateMachine(id as string, companyId);

    res.status(200).json({ message: "Máquina dada de baja exitosamente" });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

// [✔] Obtener una máquina por su ID
export const getMachineById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    const machine = await MachineService.getMachineById(
      id as string,
      companyId,
    );

    res.status(200).json(machine);
  } catch (error: any) {
    res
      .status(404)
      .json({ message: error.message || "Error al obtener la máquina" });
  }
};

// [✔] Crear una nueva máquina
export const createMachine = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;

    const newMachine = await MachineService.createMachine(companyId, req.body);

    res.status(201).json({
      message: "Máquina registrada exitosamente en el sistema",
      machine: newMachine,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Error al crear la máquina",
    });
  }
};

// [✔] Actualizar una máquina
export const updateMachine = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    const updatedMachine = await MachineService.updateMachine(
      id as string,
      companyId,
      req.body,
    );

    res.status(200).json({
      message: "Máquina actualizada correctamente",
      machine: updatedMachine,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Error al actualizar la máquina",
    });
  }
};

// [✔] Patrones/modelos de todas las máquinas
export const getPatterns = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const patterns = await MachineService.getPatterns(companyId);
    res.status(200).json(patterns);
  } catch (error: any) {
    res.status(500).json({ message: "Error al obtener patrones del catálogo" });
  }
};

// [!] Eliminar una máquina fisicamente (No usa un servicio)
export const deleteMachine = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const deletedMachine = await Machine.findOneAndDelete({
      _id: req.params.id as string,
      company: companyId as string,
    });
    if (!deletedMachine) {
      res.status(404).json({
        message: "Máquina no encontrada o no tienes permisos para eliminarla",
      });
      return;
    }
    res.status(200).json({ message: "Máquina eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la máquina", error });
  }
};

//[ ] Obtiene todo el historial de una máquina (No usa un servicio)
export const getMachineHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const companyId = (req as any).companyId;

    // Ejecutamos las consultas de incidencias y preventivos de ESTA MÁQUINA y EMPRESA
    const [issues, preventiveTasks] = await Promise.all([
      Issue.find({ machine: id, company: companyId }).sort({ createdAt: -1 }),
      PreventiveMaintenance.find({ machine: id, company: companyId }).sort({
        nextDate: 1,
      }),
    ]);

    // Extraemos los IDs de esos tickets
    const issueIds = issues.map((i) => i._id);
    const preventiveIds = preventiveTasks.map((p) => p._id);

    // Buscamos los repuestos que coincidan con esos tickets (O que tengan la máquina directamente)
    const spareParts = await SparePartRequest.find({
      company: companyId, // <-- Filtro de seguridad principal
      $or: [
        { issue: { $in: issueIds } },
        { preventive: { $in: preventiveIds } },
        { machine: id }, // Cubre el caso futuro gracias al nuevo campo del esquema
      ],
    }).populate({
      path: "sparePart",
      populate: { path: "catalogRef" },
    });

    // Calculamos el costo con la lista purificada (Ya no hace falta hacer un .filter problemático)
    const totalMaintenanceCost = spareParts.reduce((acc, curr: any) => {
      const unitPrice = curr.estimatedCost || curr.sparePart?.price || 0;
      const quantity = curr.quantity || 1;
      return acc + unitPrice * quantity;
    }, 0);

    res.status(200).json({
      machineId: id,
      totalMaintenanceCost,
      history: {
        issues,
        preventiveTasks,
        spareParts,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al generar la ficha histórica", error });
  }
};
