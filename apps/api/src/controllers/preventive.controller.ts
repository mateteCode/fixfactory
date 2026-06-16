import type { Request, Response } from "express";
import { NotificationService } from "../services/notification.service.js";
import { PreventiveStatus } from "../models/PreventiveMaintenance.js";
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

// [ ] Obtener todos los mantenimientos preventivos (calendario)
export const getPreventiveTasks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const tasks = await PreventiveMaintenance.find({
      company: (req as any).companyId,
    })
      .populate({ path: "machine", populate: { path: "catalogRef" } })
      .populate("assignedTo", "name email") // <--- NUEVO
      .populate("conclusion.finishedBy", "name") // <--- NUEVO
      .sort({ nextDate: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener calendario", error });
  }
};

// [ ] Asignar un mantenimiento preventivo a un técnico
export const assignPreventive = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { taskId, technicianId } = req.body;
    const task = await PreventiveMaintenance.findOneAndUpdate(
      { _id: taskId, company: (req as any).companyId },
      { assignedTo: technicianId, status: PreventiveStatus.ASIGNADO },
      { new: true },
    );

    if (task) {
      await NotificationService.sendToUser(
        technicianId,
        (req as any).companyId,
        {
          title: "Preventivo Asignado",
          message: `Se te asignó el mantenimiento: ${task.taskName}.`,
          type: "PREVENTIVE",
          link: "/preventivo",
        },
        ["IN_APP", "EMAIL"],
      );
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al asignar" });
  }
};

export const updatePreventiveStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    const task = await PreventiveMaintenance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado" });
  }
};

export const finishPreventive = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { description, images } = req.body;
    const tech = (req as any).user;

    // Al finalizar, reprogramamos la próxima fecha automáticamente
    const task: any = await PreventiveMaintenance.findById(req.params.id);
    const newNextDate = new Date();
    newNextDate.setDate(newNextDate.getDate() + task.frequencyDays);

    const updatedTask = await PreventiveMaintenance.findByIdAndUpdate(
      req.params.id,
      {
        conclusion: {
          description,
          images,
          finishedBy: tech.id,
          finishedAt: new Date(),
        },
        status: PreventiveStatus.REALIZADO,
        lastDate: new Date(),
        nextDate: newNextDate, // Reprogramación automática
      },
      { new: true },
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error al finalizar" });
  }
};

export const releasePreventive = async (req: Request, res: Response) => {
  try {
    const task = await PreventiveMaintenance.findByIdAndUpdate(
      req.params.id,
      { assignedTo: null, status: PreventiveStatus.PROGRAMADO },
      { new: true },
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error al liberar" });
  }
};
