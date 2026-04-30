import type { Request, Response } from "express";
import { sendIssueNotification } from "../services/mail.service.js";
import Machine from "../models/Machine.js";
import Issue from "../models/Issue.js";

// Crear una incidencia (RF-03) [cite: 1398]
export const createIssue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const company = (req as any).company;
    const userId = (req as any).user.id;

    const newIssue = new Issue({
      ...req.body,
      company: company, // Inyección automática
      reportedBy: userId, // Trazabilidad: quién la creó
    });
    const savedIssue = await newIssue.save();

    // Simulación de Notificación Automática (RF-04)
    console.log(
      `Notification sent to Maintenance Lead: New issue ${savedIssue._id} created.`,
    );

    // TODO: sendNotification con MAIL
    // Buscamos el nombre de la máquina para el cuerpo del mail
    const machine = await Machine.findOne({ _id: savedIssue.machine, company });

    // Disparar notificación asíncrona (RF-04)
    sendIssueNotification({
      machineName: machine?.name || "Desconocida",
      priority: savedIssue.priority,
      reportedBy: savedIssue.reportedBy,
      description: savedIssue.description,
    });

    res.status(201).json(savedIssue);
  } catch (error) {
    res.status(400).json({ message: "Error al reportar la incidencia", error });
  }
};

// Obtener todas las incidencias (con población de datos de la máquina)
export const getIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = (req as any).company;

    // Filtramos por empresa y podemos popular la máquina para ver el nombre
    const issues = await Issue.find({ company }).populate("machine", "name");
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
    const company = (req as any).company;
    const issue = await Issue.findById({
      _id: req.params.id,
      company,
    }).populate("machine");
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
    const company = (req as any).company; // Sacamos la empresa del token

    const updatedIssue = await Issue.findOneAndUpdate(
      { id: req.params.id, company }, // Filtramos por ID Y por Empresa
      { status, description, priority },
      { new: true, runValidators: true },
    );

    if (!updatedIssue) {
      res.status(404).json({
        message: "Incidencia no encontrada o no pertenece a tu empresa",
      });
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

// Finalizar reparación y cerrar incidencia (RF-06)
export const closeIssue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const company = (req as any).company;
    const { technicalDiagnosis, resolutionDetails } = req.body;

    const updatedIssue = await Issue.findByIdAndUpdate(
      { _id: req.params.id, company },
      {
        technicalDiagnosis,
        resolutionDetails,
        status: "Cerrado", // Estado final del flujo
        closedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updatedIssue) {
      res.status(404).json({ message: "Incidencia no encontrada" });
      return;
    }

    res.status(200).json(updatedIssue);
  } catch (error) {
    res.status(400).json({ message: "Error al cerrar la incidencia", error });
  }
};
