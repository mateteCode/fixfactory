import type { Request, Response } from "express";
import Issue from "../models/Issue.js";
import Machine, { MachineStatus } from "../models/Machine.js";
import SparePartRequest from "../models/SparePartRequest.js";
import { Types } from "mongoose";
import PreventiveMaintenance from "../models/PreventiveMaintenance.js";

export const getGeneralStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = (req as any).companyId;
    const realId = companyId._id || companyId;

    const totalMachines = await Machine.countDocuments({ company: companyId });
    const activeIncidents = await Issue.countDocuments({
      company: companyId,
      status: { $ne: "Cerrado" },
    });
    const machinesInFalla = await Machine.countDocuments({
      company: companyId,
      status: "En Falla",
    });
    const machinesInOperation = await Machine.countDocuments({
      company: companyId,
      status: MachineStatus.OPERATIVA,
    });

    // 1. Buscamos las incidencias cerradas
    const closedIssues = await Issue.find({
      company: companyId,
      status: "Cerrado",
      closedAt: { $exists: true },
    });
    let totalRepairTimeMs = 0;

    // 2. Iteramos asegurando valores numéricos primitivos directos
    closedIssues.forEach((issue) => {
      const closedTime = issue.closedAt
        ? new Date(issue.closedAt).getTime()
        : 0;
      const createdTime = (issue as any).createdAt
        ? new Date((issue as any).createdAt).getTime()
        : 0;

      if (closedTime > 0 && createdTime > 0) {
        const duration = closedTime - createdTime;
        totalRepairTimeMs += duration;
      }
    });

    const mttrHours =
      closedIssues.length > 0
        ? (totalRepairTimeMs / (1000 * 60 * 60) / closedIssues.length).toFixed(
            2,
          )
        : 0;

    const statusCounts = await Machine.aggregate([
      { $match: { company: new Types.ObjectId(realId) } },
      { $group: { _id: "$status", value: { $sum: 1 } } },
    ]);

    const machineStatusData = statusCounts.map((item) => ({
      name: item._id || "Desconocido",
      value: item.value,
    }));

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const resolvedThisMonth = await Issue.countDocuments({
      company: companyId,
      status: "Cerrado",
      closedAt: { $gte: startOfMonth },
    });

    // --- RECOPILACIÓN DE REPUESTOS ---
    const spareParts = await SparePartRequest.find({
      company: companyId,
      status: {
        $in: [
          "Comprado",
          "En Stock",
          "Aceptado",
          "COMPRADO",
          "EN_STOCK",
          "ACEPTADO",
          "ENTREGADO",
        ],
      },
    })
      .populate({
        path: "issue",
        populate: { path: "machine", select: "internalTag" },
      })
      .populate({
        path: "preventive",
        populate: { path: "machine", select: "internalTag" },
      })
      .populate({ path: "sparePart", populate: { path: "catalogRef" } }); // Clave para obtener el nombre

    let totalSpent = 0;
    const costMap: Record<string, { name: string; cost: number }> = {};
    const sparePartsUsage: Record<string, { name: string; quantity: number }> =
      {};

    spareParts.forEach((sp: any) => {
      const quantity = sp.quantity || 1;
      const cost = (sp.estimatedCost || 0) * quantity;
      totalSpent += cost;

      // Gastos por Máquina
      const machine = sp.issue?.machine || sp.preventive?.machine;
      if (machine) {
        const tag = machine.internalTag || "S/T";
        if (!costMap[tag]) costMap[tag] = { name: tag, cost: 0 };
        costMap[tag].cost += cost;
      }

      // Eficiencia de Stock (Top 3 Repuestos consumidos)
      if (sp.status === "Aceptado" || sp.status === "ACEPTADO") {
        const partName = sp.sparePart?.catalogRef?.name || "Repuesto Genérico";
        if (!sparePartsUsage[partName])
          sparePartsUsage[partName] = { name: partName, quantity: 0 };
        sparePartsUsage[partName].quantity += quantity;
      }
    });

    const topCostMachines = Object.values(costMap)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
    const topSpareParts = Object.values(sparePartsUsage)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // --- PMP Y DISPONIBILIDAD ---
    const preventivosRealizados = await PreventiveMaintenance.countDocuments({
      company: companyId,
      status: "Realizado",
    });
    const preventivosVencidos = await PreventiveMaintenance.countDocuments({
      company: companyId,
      status: "Vencido",
    });
    const totalPmpBase = preventivosRealizados + preventivosVencidos;
    const pmp =
      totalPmpBase > 0
        ? Math.round((preventivosRealizados / totalPmpBase) * 100)
        : 100;

    const availability =
      totalMachines > 0
        ? Math.round((machinesInOperation / totalMachines) * 100)
        : 100;

    // --- BACKLOG ---
    const activeIssuesForTechs = await Issue.find({
      company: companyId,
      status: { $ne: "Cerrado" },
      assignedTo: { $exists: true, $ne: null },
    }).populate("assignedTo", "name");

    const activePreventivesForTechs = await PreventiveMaintenance.find({
      company: companyId,
      status: { $in: ["Asignado", "En Proceso"] },
      assignedTo: { $exists: true, $ne: null },
    }).populate("assignedTo", "name");

    const backlogMap: Record<string, { name: string; ticketCount: number }> =
      {};
    const processTask = (task: any) => {
      const techName = task.assignedTo?.name;
      if (techName) {
        if (!backlogMap[techName])
          backlogMap[techName] = { name: techName, ticketCount: 0 };
        backlogMap[techName].ticketCount += 1;
      }
    };
    activeIssuesForTechs.forEach(processTask);
    activePreventivesForTechs.forEach(processTask);
    const technicianBacklog = Object.values(backlogMap).sort(
      (a, b) => b.ticketCount - a.ticketCount,
    );

    // --- ALERTAS INFERIORES ---
    const overduePreventives = preventivosVencidos;
    const pendingSpareParts = await SparePartRequest.countDocuments({
      company: companyId,
      status: { $nin: ["Aceptado", "Rechazado", "ACEPTADO", "RECHAZADO"] },
    });
    const activeCriticalIssues = await Issue.countDocuments({
      company: companyId,
      status: { $ne: "Cerrado" },
      priority: { $in: ["Crítica", "Alta", "CRITICA", "ALTA"] },
    });
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingPreventives = await PreventiveMaintenance.countDocuments({
      company: companyId,
      status: { $in: ["Programado", "Asignado", "En Proceso"] },
      nextDate: { $lte: sevenDaysFromNow },
    });

    // MTBF (Mean Time Between Failures en horas)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const issuesLast30Days = await Issue.countDocuments({
      company: companyId,
      createdAt: { $gte: thirtyDaysAgo },
    });
    const totalMachineHours = totalMachines * 30 * 24;
    const mtbfHours =
      issuesLast30Days > 0
        ? (totalMachineHours / issuesLast30Days).toFixed(1)
        : totalMachineHours;

    // Tiempos de Respuesta (SLA)
    const issuesWithDiagnostics = await Issue.find({
      company: companyId,
      "diagnostics.0": { $exists: true },
    });
    let totalResponseMs = 0;

    issuesWithDiagnostics.forEach((i) => {
      // Extraemos los tiempos validando estrictamente su existencia mediante ternarios
      const diagDate =
        i.diagnostics && i.diagnostics[0] && i.diagnostics[0].createdAt
          ? new Date(i.diagnostics[0].createdAt).getTime()
          : 0;
      const createDate = (i as any).createdAt
        ? new Date((i as any).createdAt).getTime()
        : 0;

      if (diagDate > 0 && createDate > 0) {
        totalResponseMs += diagDate - createDate;
      }
    });

    const avgResponseTimeHours =
      issuesWithDiagnostics.length > 0
        ? (
            totalResponseMs /
            (1000 * 60 * 60) /
            issuesWithDiagnostics.length
          ).toFixed(1)
        : 0;

    // Distribución de Fallas por Tipo
    const issuesByType = await Issue.aggregate([
      { $match: { company: new Types.ObjectId(realId) } },
      { $group: { _id: "$type", value: { $sum: 1 } } },
    ]);
    const issueTypeData = issuesByType.map((i) => ({
      name: i._id || "Otro",
      value: i.value,
    }));

    // Preventivos ejecutados este mes
    const preventivesThisMonth = await PreventiveMaintenance.countDocuments({
      company: companyId,
      status: "Realizado",
      lastDate: { $gte: startOfMonth },
    });

    // Costo medio por intervención (Fallas + Preventivos terminados)
    const totalFinishedTasks = closedIssues.length + preventivosRealizados;
    const avgTaskCost =
      totalFinishedTasks > 0 ? Math.round(totalSpent / totalFinishedTasks) : 0;

    res.status(200).json({
      overview: { totalMachines },
      criticalMachines: await getCriticalMachines(companyId),
      topCostMachines,
      technicianBacklog,
      totalMachines,
      activeIncidents,
      machinesInFalla,
      resolvedThisMonth,
      machineStatusData,
      mttrHours: Number(mttrHours),
      totalSpent,
      pmp,
      availability,
      overduePreventives,
      pendingSpareParts,
      activeCriticalIssues,
      upcomingPreventives,
      mtbfHours: Number(mtbfHours),
      avgResponseTimeHours: Number(avgResponseTimeHours),
      issueTypeData,
      topSpareParts,
      preventivesThisMonth,
      avgTaskCost,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al generar estadísticas", error });
  }
};

// Función auxiliar para identificar máquinas con más fallas
async function getCriticalMachines(companyId: any) {
  const realId = companyId._id || companyId;

  return await Issue.aggregate([
    { $match: { company: new Types.ObjectId(realId) } },
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
        name: { $ifNull: ["$machineInfo.internalTag", "Sin Tag"] },
        code: { $ifNull: ["$machineInfo.modelCode", ""] },
        issueCount: "$count",
      },
    },
  ]);
}
