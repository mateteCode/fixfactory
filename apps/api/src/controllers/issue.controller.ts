import type { Request, Response } from "express";
import { sendIssueNotification } from "../services/mail.service.js";
import Machine from "../models/Machine.js";
import Issue from "../models/Issue.js";
import { IssueStatus } from "../models/Issue.js";
import { UserRole } from "../models/User.js";

// Helper local para verificar y restablecer la máquina si corresponde
const syncMachineStatus = async (machineId: any, companyId: any) => {
  // Contamos si queda alguna incidencia que NO esté cerrada para esta máquina
  const incidenciasActivas = await Issue.countDocuments({
    machine: machineId,
    company: companyId,
    status: { $ne: IssueStatus.CERRADO },
  });

  // Si ya no quedan fallas abiertas, devolvemos la máquina a estado "Operativa"
  if (incidenciasActivas === 0) {
    await Machine.findOneAndUpdate(
      { _id: machineId, company: companyId },
      { status: "Operativa" },
    );
    console.log(
      `[Automatización] Máquina ${machineId} restablecida a 'Operativa'.`,
    );
  }
};

// Crear una incidencia (RF-03) [cite: 1398]
export const createIssue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const userId = (req as any).user.id;
    /*
    const machineId = (req as any).body.machine;

    // Validación si la máquina pertenece a la empresa del operario
    const machine = await Machine.findOne({
      _id: machineId,
      company: companyId,
    });

    if (!machine) {
      res.status(403).json({
        message:
          "Operación no permitida: La máquina no pertenece a tu empresa o no existe.",
      });
      return;
    }
    */
    const machine = (req as any).validatedResource;

    const newIssue = new Issue({
      ...req.body,
      company: companyId,
      reportedBy: userId, // Trazabilidad: quién la creó
    });
    const savedIssue = await newIssue.save();

    // Al reportar un fallo, la máquina pasa automáticamente a "En Falla"
    await Machine.findOneAndUpdate(
      { _id: machine._id, company: companyId },
      { status: "En Falla" },
    );
    console.log(
      `[Automatización] Máquina ${machine._id} cambiada a 'En Falla'.`,
    );

    // Simulación de Notificación Automática (RF-04)
    console.log(
      `Notification sent to Maintenance Lead: New issue ${savedIssue._id} created.`,
    );

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
    const companyId = (req as any).companyId;

    // Buscamos incidencias que pertenezcan a ese ID de objeto
    const issues = await Issue.find({ company: companyId })
      .populate({
        path: "machine",
        populate: { path: "catalogRef" },
      })
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

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
    const companyId = (req as any).companyId;
    const issue = await Issue.findOne({
      _id: req.params.id as string,
      company: companyId,
    })
      .populate({
        path: "machine",
        populate: { path: "catalogRef" },
      })
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email");

    if (!issue) {
      res
        .status(404)
        .json({ message: "Incidencia no encontrada o acceso denegado" });
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
    const companyId = (req as any).companyId;
    const { status, description, priority } = req.body;

    // Armamos el objeto de actualización
    const updateData: any = { status, description, priority };

    console.log(status);
    // Si el estado cambia a CERRADO, guardamos la fecha de cierre
    if (status === IssueStatus.CERRADO) {
      updateData.closedAt = new Date();
    }

    const updatedIssue = await Issue.findOneAndUpdate(
      { _id: req.params.id as string, company: companyId }, // Filtramos por ID Y por Empresa
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedIssue) {
      res.status(404).json({
        message: "Incidencia no encontrada o no pertenece a tu empresa",
      });
      return;
    }

    // Si se cambia el estado a Cerrado verificadar si se puede cambiar el estado de la maquina
    if (status === IssueStatus.CERRADO) {
      await syncMachineStatus(updatedIssue.machine, companyId);
      // Podríamos disparar otra notificación en el futuro
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
    const companyId = (req as any).companyId;
    const { technicalDiagnosis, resolutionDetails } = req.body;

    const updatedIssue = await Issue.findByIdAndUpdate(
      { _id: req.params.id, company: companyId },
      {
        technicalDiagnosis,
        resolutionDetails,
        status: IssueStatus.CERRADO, // Estado final del flujo
        closedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updatedIssue) {
      res.status(404).json({ message: "Incidencia no encontrada" });
      return;
    }

    // Al cerrar definitivamente, disparamos el chequeo de la máquina
    await syncMachineStatus(updatedIssue.machine, companyId);

    res.status(200).json(updatedIssue);
  } catch (error) {
    res.status(400).json({ message: "Error al cerrar la incidencia", error });
  }
};

// El jefe de mantenimiento asigna la tarea/repación a un técnico o si mismo
export const assignIssue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { issueId, technicianId } = req.body;
    const user = (req as any).user;

    // Validación de Roles (Solo ADMIN o MANTENIMIENTO)
    if (![UserRole.ADMIN, UserRole.MANTENIMIENTO].includes(user.role)) {
      res
        .status(403)
        .json({ message: "No tienes permisos para asignar tareas." });
      return;
    }

    // Actualizar la incidencia
    const updatedIssue = await Issue.findOneAndUpdate(
      { _id: issueId, company: (req as any).companyId },
      { assignedTo: technicianId, status: IssueStatus.EN_PROCESO },
      { new: true },
    );

    if (!updatedIssue) {
      res.status(404).json({ message: "Incidencia no encontrada." });
      return;
    }

    res.status(200).json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: "Error al asignar la tarea." });
  }
};
