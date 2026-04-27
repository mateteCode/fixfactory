import type { Request, Response } from "express";
import Issue from "../models/Issue.js";

// Crear una incidencia (RF-03) [cite: 1398]
export const createIssue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newIssue = new Issue(req.body);
    const savedIssue = await newIssue.save();

    // Simulación de Notificación Automática (RF-04)
    console.log(
      `Notification sent to Maintenance Lead: New issue ${savedIssue._id} created.`,
    );

    res.status(201).json(savedIssue);
  } catch (error) {
    res.status(400).json({ message: "Error al reportar la incidencia", error });
  }
};

// Obtener todas las incidencias (con población de datos de la máquina)
export const getIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const issues = await Issue.find().populate("machine", "name code");
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar incidencias", error });
  }
};
