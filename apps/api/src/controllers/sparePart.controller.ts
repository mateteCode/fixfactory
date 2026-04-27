import type { Request, Response } from "express";
import SparePartRequest from "../models/SparePartRequest.js";
import Issue from "../models/Issue.js";

// Crear solicitud de repuesto (RF-09)
export const createSparePartRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { issue, description, quantity, requestedBy } = req.body;

    const newRequest = new SparePartRequest({
      issue,
      description,
      quantity,
      requestedBy,
    });

    const savedRequest = await newRequest.save();

    // Actualizamos automáticamente el estado de la incidencia a "En Espera de Repuesto" (RF-05)
    await Issue.findByIdAndUpdate(issue, { status: "En Espera de Repuesto" });

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
    const { estimatedCost, status } = req.body;

    const updatedRequest = await SparePartRequest.findByIdAndUpdate(
      req.params.id,
      { estimatedCost, status },
      { new: true },
    );

    if (!updatedRequest) {
      res.status(404).json({ message: "Solicitud no encontrada" });
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
    const requests = await SparePartRequest.find().populate({
      path: "issue",
      populate: { path: "machine", select: "name code" },
    });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener solicitudes", error });
  }
};
