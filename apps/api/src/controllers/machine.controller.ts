import type { Request, Response } from "express";
import Machine from "../models/Machine.js";
import Issue from "../models/Issue.js";
import PreventiveMaintenance from "../models/PreventiveMaintenance.js";
import SparePartRequest from "../models/SparePartRequest.js";

// Obtener todas las máquinas de la empresa que pertenece el usuario
export const getMachines = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const machines = await Machine.find({ company: companyId });
    res.status(200).json(machines);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar las máquinas", error });
  }
};

// Obtener una máquina por ID (útil para la Ficha Histórica RF-02)
export const getMachineById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId as string;
    const machine = await Machine.findOne({
      _id: req.params.id as string,
      company: companyId,
    });
    if (!machine) {
      res
        .status(404)
        .json({ message: "Máquina no encontrada o acceso denegado" });
      return;
    }
    res.status(200).json(machine);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar la máquina", error });
  }
};

// Crear una nueva máquina
export const createMachine = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log(req.body);
    const companyId = (req as any).companyId;
    const { code } = req.body;

    // Verificar si ya existe una máquina con ese código
    const existingMachine = await Machine.findOne({ code });

    if (existingMachine) {
      res.status(400).json({
        message: `Ya existe una máquina registrada con el código: ${code}`,
      });
      return;
    }
    const newMachine = new Machine({
      ...req.body,
      company: companyId,
    });
    const savedMachine = await newMachine.save();

    res.status(201).json(savedMachine);
  } catch (error) {
    res.status(400).json({ message: "Error al crear la máquina", error });
  }
};

// Actualizar una máquina
export const updateMachine = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const updatedMachine = await Machine.findOneAndUpdate(
      { _id: req.params.id as string, company: companyId },
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedMachine) {
      res
        .status(404)
        .json({ message: "Máquina no encontrada o acceso denegado" });
      return;
    }
    res.status(200).json(updatedMachine);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar la máquina", error });
  }
};

// Eliminar una máquina
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

export const getMachineHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // Ejecutamos las consultas en paralelo para mejorar el rendimiento
    const [issues, preventiveTasks, spareParts] = await Promise.all([
      Issue.find({ machine: id as any }).sort({ createdAt: -1 }),
      PreventiveMaintenance.find({ machine: id as any }).sort({
        nextDate: 1,
      }),
      // Para los repuestos, buscamos los vinculados a las incidencias de esta máquina
      SparePartRequest.find()
        .populate({
          path: "issue",
          match: { machine: id },
        })
        .populate("sparePart"),
    ]);

    // Filtramos los repuestos que efectivamente pertenecen a esta máquina
    const filteredSpareParts = spareParts.filter((sp) => sp.issue !== null);

    // Calculamos el costo total acumulado de la máquina (RF-11 parcial)
    const totalMaintenanceCost = filteredSpareParts.reduce(
      (acc, curr) => acc + (curr.estimatedCost || 0),
      0,
    );

    res.status(200).json({
      machineId: id,
      totalMaintenanceCost,
      history: {
        issues,
        preventiveTasks,
        spareParts: filteredSpareParts,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al generar la ficha histórica", error });
  }
};
