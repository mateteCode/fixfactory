import type { Request, Response } from "express";
import Machine from "../models/Machine.js"; // Usamos extensión .js por el type: module

// Obtener todas las máquinas
export const getMachines = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const machines = await Machine.find();
    res.status(200).json(machines);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving machines", error });
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
    res.status(400).json({ message: "Error creating machine", error });
  }
};
