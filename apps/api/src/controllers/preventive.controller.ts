import type { Request, Response } from "express";
import PreventiveMaintenance from "../models/PreventiveMaintenance.js";

// Crear una tarea preventiva (RF-07)
export const createPreventiveTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { machine, taskName, frequencyDays, lastDate, description } =
      req.body;

    // Cálculo automático de la próxima fecha
    const baseDate = lastDate ? new Date(lastDate) : new Date();
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + frequencyDays);

    const newTask = new PreventiveMaintenance({
      machine,
      taskName,
      frequencyDays,
      lastDate: baseDate,
      nextDate,
      description,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al programar mantenimiento preventivo", error });
  }
};

// Obtener calendario de mantenimientos (RF-07)
export const getPreventiveTasks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const tasks = await PreventiveMaintenance.find().populate(
      "machine",
      "name code",
    );
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener calendario", error });
  }
};
