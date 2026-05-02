import type { Request, Response } from "express";
import SparePartRequest from "../models/SparePartRequest.js";
import Issue, { IssueStatus } from "../models/Issue.js";

// Crear solicitud de repuesto (RF-09)
export const createSparePartRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const userId = (req as any).user.id;
    const { issue: issueId } = req.body;

    console.log({ ...req.body, requestedBy: userId, company: companyId });

    // Validar que la incidencia pertenezca a la empresa
    const issue = await Issue.findOne({ _id: issueId, company: companyId });

    if (!issue) {
      res
        .status(403)
        .json({ message: "La incidencia no pertenece a tu empresa." });
      return;
    }

    const newRequest = new SparePartRequest({
      ...req.body,
      requestedBy: userId,
      company: companyId, // Inyección automática[cite: 30]
    });

    const savedRequest = await newRequest.save();

    // Actualización segura de estado
    issue.status = IssueStatus.EN_ESPERA_DE_REPUESTO;
    await issue.save();

    res.status(201).json(savedRequest);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al crear solicitud de repuesto", error });
  }
};

// Actualizar costo y estado (RF-10 - Rol Compras)
export const updatePurchaseDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const { estimatedCost, status } = req.body;

    const updatedRequest = await SparePartRequest.findOneAndUpdate(
      { _id: req.params.id as string, company: companyId },
      { estimatedCost, status },
      { new: true, runValidators: true },
    );

    if (!updatedRequest) {
      res.status(404).json({
        message:
          "Solicitud de repuesto no encontrada o no pertenece a tu empresa",
      });
      return;
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al actualizar detalles de compra", error });
  }
};

// Listar solicitudes para el área de Compras
export const getSparePartRequests = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;

    const requests = await SparePartRequest.find({ company: companyId })
      .populate({
        path: "issue",
        populate: {
          path: "machine",
          select: "name code",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener solicitudes", error });
  }
};
