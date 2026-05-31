import type { Request, Response } from "express";
import SparePart from "../models/SparePart.js";
import SparePartRequest, {
  SparePartStatus,
} from "../models/SparePartRequest.js";
import Issue, { IssueStatus } from "../models/Issue.js";
import type { AnyArray } from "mongoose";
import { SparePartService } from "../services/sparePart.service.js";

// Asignarle el estado "EN_STOCK" a los pedidos de repuestos más antiguos al reponer el stock
const allocateVirtualStock = async (
  sparePartId: string,
  actualStock: number,
) => {
  // Buscamos pedidos pendientes, ordenados por fecha más antigua
  const pendingRequests = await SparePartRequest.find({
    sparePart: sparePartId,
    status: { $in: [SparePartStatus.COMPRADO, SparePartStatus.SIN_STOCK] },
  }).sort({ createdAt: 1 });

  let virtualStock = actualStock;
  const updates = [];

  // Iteramos aplicando la lógica de asignación temporal
  for (const request of pendingRequests) {
    if (virtualStock >= request.quantity) {
      // El stock temporal cubre este pedido
      request.status = SparePartStatus.EN_STOCK;

      // Descontamos la cantidad de nuestra variable temporal (NUNCA del stock real de la base)
      virtualStock -= request.quantity;

      // Preparamos la promesa para guardar el cambio de estado
      updates.push(request.save());
      // else { break; } // Si queremos que no le de al siguiente si no cumple con el más viejo
    }

    // Ejecutamos todas las actualizaciones a la base de datos en paralelo
    if (updates.length > 0) {
      await Promise.all(updates);
    }
  }
};

// [✔] Lista de repuestos
export const getSpareParts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const parts = await SparePartService.getAllSpareParts(companyId);
    res.status(200).json(parts);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message || "Error al obtener el inventario" });
  }
};

// [✔] Obtener patrones de repuestos para autocompletado
export const getPatterns = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const patterns = await SparePartService.getPatterns(companyId);
    res.status(200).json(patterns);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Error al obtener el catálogo de repuestos",
    });
  }
};

// [✔] Obtener detalle completo de un repuesto por ID
export const getSparePartById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;
    const part = await SparePartService.getSparePartById(
      id as string,
      companyId,
    );
    res.status(200).json(part);
  } catch (error: any) {
    res
      .status(404)
      .json({ message: error.message || "Repuesto no encontrado" });
  }
};

// [✔] Crear Repuesto
export const createSparePart = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const data = { ...req.body };

    const newPart = await SparePartService.createSparePart(companyId, data);
    res.status(201).json({
      message: "Repuesto registrado exitosamente",
      sparePart: newPart,
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: error.message || "Error al crear el repuesto" });
  }
};

// [!] Actualizar Repuesto (Editarla)
export const updateSparePart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).companyId;
    const updatedPart = await SparePart.findOneAndUpdate(
      { _id: id as any, company: companyId },
      req.body,
      { new: true },
    );
    if (!updatedPart) {
      return res.status(404).json({
        message: "Repuesto no encontrado o no pertenece a tu empresa",
      });
    }
    res.json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar" });
  }
};

// [!] Borrado lógico Repuesto (Editarla)
export const deleteSparePart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).companyId;
    const deletedPart = await SparePart.findOneAndUpdate(
      { _id: id as any, company: companyId },
      { active: false },
    );
    if (!deletedPart) {
      return res.status(404).json({
        message: "Repuesto no encontrado o no pertenece a tu empresa",
      });
    }
    res.json({ message: "Repuesto desactivado del catálogo" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
};

// [✔] Incremento/Decremento manual de stock (Editarla)
export const adjustStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body; // Puede ser positivo o negativo
    const companyId = (req as any).companyId;

    const part = await SparePart.findOne({
      _id: id as any,
      company: companyId,
    });
    if (!part) {
      return res.status(404).json({
        message: "Repuesto no encontrado o no pertenece a tu empresa",
      });
    }

    part.stockQuantity += quantity;
    if (part.stockQuantity < 0) part.stockQuantity = 0;
    await part.save();
    await allocateVirtualStock(part._id.toString(), part.stockQuantity);
    res.json(part);
  } catch (error) {
    res.status(400).json({ message: "Error al ajustar stock" });
  }
};

// [✔] Crear un pedido de repuesto
export const createSparePartRequest = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const userId = (req as any).user.id;
    const { issue: issueId, sparePart: partId, quantity } = req.body;

    // Validar que la incidencia pertenezca a la empresa
    const issue = await Issue.findOne({ _id: issueId, company: companyId });
    if (!issue) {
      res
        .status(403)
        .json({ message: "La incidencia no pertenece a tu empresa." });
      return;
    }

    // Validar que el repuesto pertenezca a la empresa
    const part = await SparePart.findOne({ _id: partId, company: companyId });
    if (!part) {
      res
        .status(403)
        .json({ message: "El repuesto no pertenece a tu empresa." });
      return;
    }

    const status =
      part.stockQuantity >= quantity
        ? SparePartStatus.SOLICITADO
        : SparePartStatus.SIN_STOCK;

    const newRequest = new SparePartRequest({
      ...req.body,
      requestedBy: userId,
      company: companyId,
      status,
      estimatedCost: part.price,
    });

    await newRequest.save();

    // Actualizar la incidencia a "En espera de repuesto"
    await Issue.findByIdAndUpdate(issueId, {
      status: IssueStatus.EN_ESPERA_DE_REPUESTO,
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: "Error al solicitar repuesto" });
  }
};

// Actualizar estado del pedido (RF-10 o RF-12 ?)
export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const companyId = (req as any).companyId;

    ///const request = await SparePartRequest.findById(id).populate("sparePart");
    const request = await SparePartRequest.findOne({
      _id: id as any,
      company: companyId,
    }).populate("sparePart");

    if (!request)
      return res.status(404).json({ message: "Pedido no encontrado" });
    //const part = await SparePart.findById(request.sparePart._id);
    const part = await SparePart.findOne({
      _id: request.sparePart._id,
      company: companyId,
    });
    if (!part) {
      res
        .status(403)
        .json({ message: "El repuesto no pertenece a tu empresa." });
      return;
    }

    // Lógica de efectos secundarios según el estado
    if (status === SparePartStatus.EN_STOCK) {
      // Si llegó el repuesto, sumamos al stock global
      if (part) {
        part.stockQuantity += request.quantity;
        try {
          await part.save();
          console.log("GUARDADO");
        } catch (error) {
          console.log(error);
        }
      }
    } else if (status === SparePartStatus.ACEPTADO) {
      // Si el técnico lo retira, restamos del stock global
      if (part) {
        if (part.stockQuantity < request.quantity) {
          return res
            .status(400)
            .json({ message: "No hay stock suficiente para entregar" });
        }
        part.stockQuantity -= request.quantity;
        await part.save();
      }
    }

    request.status = status;
    await request.save();

    // Verificar si todos los repuestos del Issue están resueltos
    if (
      status === SparePartStatus.ACEPTADO ||
      status === SparePartStatus.RECHAZADO
    ) {
      // Contamos cuántos repuestos de esta incidencia NO están Aceptados ni Rechazados
      const pendingParts = await SparePartRequest.countDocuments({
        issue: request.issue,
        company: companyId,
        status: { $nin: [SparePartStatus.ACEPTADO, SparePartStatus.RECHAZADO] },
      });

      // Si no queda ningún repuesto pendiente, avanzamos la incidencia
      if (pendingParts === 0) {
        await Issue.findByIdAndUpdate(request.issue, {
          status: IssueStatus.DIAGNOSTICADO,
        });
        console.log(
          `Incidencia ${request.issue} actualizada a DIAGNOSTICADO automáticamente.`,
        );
      }
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar estado del pedido" });
  }
};

/**
 * Obtiene todos los pedidos de repuestos de la empresa.
 * Incluye población profunda para mostrar: Repuesto, Técnico y Máquina afectada.
 */
export const getSparePartRequests = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { issue } = req.query; // Capturamos el query param opcional
    const filter: any = { company: companyId };
    if (issue) {
      filter.issue = issue; // Si mandan ?issue=123, filtramos por esa incidencia
    }

    const requests = await SparePartRequest.find(filter)
      .populate({
        path: "sparePart",
        populate: { path: "catalogRef" },
      })
      .populate("requestedBy", "name email")
      .populate({
        path: "issue",
        populate: {
          path: "machine",
          populate: { path: "catalogRef" },
        },
      })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la lista de pedidos", error });
  }
};
// VIEJAS FUNCIONES

/*
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
*/

/*
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
*/
