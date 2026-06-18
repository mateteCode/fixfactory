import type { Request, Response } from "express";
import Issue from "../models/Issue.js";
import Machine from "../models/Machine.js";
import SparePartRequest from "../models/SparePartRequest.js";
import { Types } from "mongoose";

export const getGeneralStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;

    // Maquinas totales de la empresa
    const totalMachines = await Machine.countDocuments({ company: companyId });

    // Incidentes activos de la empresa
    const activeIncidents = await Issue.countDocuments({
      company: companyId,
      status: { $ne: "Cerrado" },
    });

    // Máquinas con fallas de la empresa (TODO: Cuando se reporta un incidente que se actualice a este estado)
    const machinesInFalla = await Machine.countDocuments({
      company: companyId,
      status: "En Falla",
    });

    // Cálculo de MTTR: Tiempo promedio de reparación en horas (TODO: Hacer que cuando se cierre, ponerle closeAt)
    const closedIssues = await Issue.find({
      company: companyId,
      status: "Cerrado",
      closedAt: { $exists: true },
    });

    let totalRepairTimeMs = 0;
    closedIssues.forEach((issue) => {
      const duration =
        issue.closedAt!.getTime() - (issue as any).createdAt.getTime();
      totalRepairTimeMs += duration;
    });

    const mttrHours =
      closedIssues.length > 0
        ? (totalRepairTimeMs / (1000 * 60 * 60) / closedIssues.length).toFixed(
            2,
          )
        : 0;

    // Data para el Gráfico Circular (Agrupación por estado de maquinas)
    const realId = companyId._id || companyId;
    const statusCounts = await Machine.aggregate([
      { $match: { company: new Types.ObjectId(realId) } },
      { $group: { _id: "$status", value: { $sum: 1 } } },
    ]);

    const machineStatusData = statusCounts.map((item) => ({
      name: item._id || "Desconocido",
      value: item.value,
    }));

    // Resueltas en el mes (TODO: Asegurar que cuadno se cierra un Issue, se ponga la fecha de closeAt
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const resolvedThisMonth = await Issue.countDocuments({
      company: companyId,
      status: "Cerrado",
      closedAt: { $gte: startOfMonth },
    });
    console.log(resolvedThisMonth);

    // 3. Costo Total en Repuestos (RF-10)
    const spareParts = await SparePartRequest.find({
      company: companyId,
      status: { $in: ["Comprado", "En Stock", "Aceptado"] },
    });
    const totalSpent = spareParts.reduce(
      (acc, curr) => acc + (curr.estimatedCost || 0) * curr.quantity,
      0,
    );

    res.status(200).json({
      overview: {
        totalMachines,
      },
      criticalMachines: await getCriticalMachines(companyId),
      totalMachines,
      activeIncidents,
      machinesInFalla,
      resolvedThisMonth,
      machineStatusData, //TODO: Ordenar todo este lio de variables. Chequear con el resto del backend y el dashboard del front
      mttrHours: Number(mttrHours),
      totalSpent,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al generar estadísticas", error });
  }
};

// Función auxiliar para identificar máquinas con más fallas
async function getCriticalMachines(companyId: any) {
  // 1. Aseguramos que el ID tenga el formato correcto para MongoDB
  const realId = companyId._id || companyId;

  return await Issue.aggregate([
    {
      $match: {
        company: new Types.ObjectId(realId), // 2. Casteo estricto para que no falle el filtro
        status: { $ne: "Cerrado" },
      },
    },
    { $group: { _id: "$machine", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "machines",
        localField: "_id",
        foreignField: "_id",
        as: "machineInfo",
      },
    },
    { $unwind: "$machineInfo" },
    {
      $project: {
        // 3. Usamos internalTag en lugar del viejo campo name
        name: { $ifNull: ["$machineInfo.internalTag", "Máquina sin Tag"] },
        issueCount: "$count",
      },
    },
  ]);
}