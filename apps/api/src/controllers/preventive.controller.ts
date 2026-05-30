import type { Request, Response } from "express";
import PreventiveMaintenance from "../models/PreventiveMaintenance.js";

// [✔] Crear un mantenimiento preventivo
export const createPreventiveTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const { machine: machineId, frequencyDays, lastDate, nextDate } = req.body;

    let finalLastDate: Date | undefined;
    let finalNextDate: Date;

    if (nextDate) {
      finalNextDate = new Date(nextDate);
      if (lastDate) {
        finalLastDate = new Date(lastDate);
      }
    } else {
      const baseDate = lastDate ? new Date(lastDate) : new Date();
      finalNextDate = new Date(baseDate);
      finalNextDate.setDate(finalNextDate.getDate() + Number(frequencyDays));
      if (lastDate) {
        finalLastDate = baseDate;
      }
    }

    const taskData: any = {
      ...req.body,
      company: companyId,
      nextDate: finalNextDate,
    };

    if (finalLastDate) {
      taskData.lastDate = finalLastDate;
    }

    const newTask = new PreventiveMaintenance(taskData);
    const savedTask = await newTask.save();

    res.status(201).json(savedTask);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al programar mantenimiento preventivo", error });
  }
};

// [✔] Obtener todos los mantenimientos preventivos (calendario)
export const getPreventiveTasks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const tasks = await PreventiveMaintenance.find({
      company: companyId,
    })
      .populate({
        path: "machine",
        populate: { path: "catalogRef" },
      })
      .sort({ nextDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener calendario", error });
  }
};
