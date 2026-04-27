import type { Request, Response } from "express";
import Machine from "../models/Machine.js";

// Obtener todas las máquinas
export const getMachines = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const machines = await Machine.find();
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
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      res.status(404).json({ message: "Máquina no encontrada" });
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
    const newMachine = new Machine(req.body);
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
    const updatedMachine = await Machine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedMachine) {
      res
        .status(404)
        .json({ message: "Máquina no encontrada para actualizar" });
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
    const deletedMachine = await Machine.findByIdAndDelete(req.params.id);
    if (!deletedMachine) {
      res.status(404).json({ message: "Máquina no encontrada para eliminar" });
      return;
    }
    res.status(200).json({ message: "Máquina eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la máquina", error });
  }
};
