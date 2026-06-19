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

    const machinesInOperation = await Machine.countDocuments({
      company: companyId,
      status: MachineStatus.OPERATIVA,
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

    // 3. Costo Total en Repuestos (RF-10)
    const spareParts = await SparePartRequest.find({
      company: companyId,
      status: { $in: ["Comprado", "En Stock", "Aceptado"] },
    })
      .populate({
        path: "issue",
        populate: { path: "machine", select: "internalTag" },
      })
      .populate({
        path: "preventive",
        populate: { path: "machine", select: "internalTag" },
      });

    let totalSpent = 0;
    const costMap: Record<string, { name: string; cost: number }> = {};

    spareParts.forEach((sp) => {
      const cost = (sp.estimatedCost || 0) * sp.quantity;
      totalSpent += cost;

      const machine =
        (sp as any).issue?.machine || (sp as any).preventive?.machine;
      if (machine) {
        const tag = machine.internalTag || "S/T";
        if (!costMap[tag]) costMap[tag] = { name: tag, cost: 0 };
        costMap[tag].cost += cost;
      }
    });

    const topCostMachines = Object.values(costMap)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    // Cálculo de PMP (Cumplimiento de Preventivo)
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
        : 100; // Si no hay tareas, asumimos 100%

    // Cálculo de Disponibilidad de Planta
    const availability =
      totalMachines > 0
        ? Math.round((machinesInOperation / totalMachines) * 100)
        : 100;

    // Cálculo de Carga Operativa por Técnico (Backlog)
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

    // a. Preventivos Vencidos (Reutilizamos la variable que ya calculaste para el PMP)
    const overduePreventives = preventivosVencidos;

    // b. Repuestos Pendientes (Todo lo que el técnico pidió pero el pañol aún no le entrega)
    const pendingSpareParts = await SparePartRequest.countDocuments({
      company: companyId,
      status: { $nin: ["Aceptado", "Rechazado"] },
    });

    // c. Fallas Críticas Activas (Incidencias abiertas de prioridad CRITICA)
    const activeCriticalIssues = await Issue.countDocuments({
      company: companyId,
      status: { $ne: "Cerrado" },
      priority: { $in: ["Crítica", "Alta"] }, // Agrupamos Alta y Crítica para mayor seguridad
    });

    // d. Preventivos a Vencer (Próximos 7 días)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingPreventives = await PreventiveMaintenance.countDocuments({
      company: companyId,
      nextDate: { $lte: sevenDaysFromNow },
    });

    res.status(200).json({
      overview: {
        totalMachines,
      },
      criticalMachines: await getCriticalMachines(companyId),
      topCostMachines,
      technicianBacklog,
      totalMachines,
      activeIncidents,
      machinesInFalla,
      resolvedThisMonth,
      machineStatusData, //TODO: Ordenar todo este lio de variables. Chequear con el resto del backend y el dashboard del front
      mttrHours: Number(mttrHours),
      totalSpent,
      pmp,
      availability,
      overduePreventives,
      pendingSpareParts,
      activeCriticalIssues,
      upcomingPreventives,
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
    { $match: { company: new Types.ObjectId(realId) } }, // ¡Sin excluir las cerradas!
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
        code: { $ifNull: ["$machineInfo.modelCode", ""] }, // Requerido por tu interfaz TypeScript
        issueCount: "$count",
      },
    },
  ]);
}
