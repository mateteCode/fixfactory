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
    // TODO: sendNotification con MAIL

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

// Obtener una incidencia por ID con detalles de la máquina
export const getIssueById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id).populate("machine");
    if (!issue) {
      res.status(404).json({ message: "Incidencia no encontrada" });
      return;
    }
    res.status(200).json(issue);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar la incidencia", error });
  }
};

// Actualizar estado o detalles de la incidencia (RF-05)
export const updateIssue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status, description, priority } = req.body;

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, description, priority },
      { new: true, runValidators: true },
    );

    if (!updatedIssue) {
      res
        .status(404)
        .json({ message: "Incidencia no encontrada para actualizar" });
      return;
    }

    // Si el estado cambia a "Solucionado", podríamos disparar otra notificación en el futuro
    if (status === "Solucionado") {
      console.log(`Notification: Issue ${updatedIssue._id} has been resolved.`);
    }

    res.status(200).json(updatedIssue);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al actualizar la incidencia", error });
  }
};
