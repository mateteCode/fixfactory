import type { Request, Response } from "express";
import Issue from "../models/Issue.js";
import Machine from "../models/Machine.js";
import SparePartRequest from "../models/SparePartRequest.js";

export const getGeneralStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;

    // 1. Contadores básicos
    const totalMachines = await Machine.countDocuments({ company: companyId });
    const activeIssues = await Issue.countDocuments({
      company: companyId,
      status: { $ne: "Cerrado" },
    });

    // 2. Cálculo de MTTR (Tiempo promedio de reparación en horas)
    // Solo para incidencias cerradas que tengan fecha de creación y cierre
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

    // 3. Costo Total en Repuestos (RF-10)
    const spareParts = await SparePartRequest.find({
      company: companyId,
      status: "Comprado",
    });
    const totalSpent = spareParts.reduce(
      (acc, curr) => acc + (curr.estimatedCost || 0),
      0,
    );

    res.status(200).json({
      overview: {
        totalMachines,
        activeIssues,
        totalSpent,
        mttrHours: Number(mttrHours),
      },
      criticalMachines: await getCriticalMachines(companyId),
    });
  } catch (error) {
    res.status(500).json({ message: "Error al generar estadísticas", error });
  }
};

// Función auxiliar para identificar máquinas con más fallas
async function getCriticalMachines(companyId: any) {
  return await Issue.aggregate([
    {
      $match: {
        company: companyId,
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
        name: "$machineInfo.name",
        code: "$machineInfo.code",
        issueCount: "$count",
      },
    },
  ]);
}
