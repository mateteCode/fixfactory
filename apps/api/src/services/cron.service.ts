// src/services/cron.service.ts
import cron from "node-cron";
import PreventiveMaintenance, {
  PreventiveStatus,
} from "../models/PreventiveMaintenance.js";
import { NotificationService } from "./notification.service.js";

// Tarea que se ejecuta todos los días a las 08:00 AM
export const initCronJobs = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily maintenance check...");
    // Llamamos a la función centralizada para evitar duplicar la lógica
    await runMaintenanceCheck();
  });
};

/**
 * Función que contiene la lógica de negocio del chequeo.
 * Se exporta para poder ser llamada desde el Cron o desde una ruta de Test.
 */
export const runMaintenanceCheck = async () => {
  console.log("--- Iniciando chequeo de mantenimiento preventivo ---");
  try {
    const today = new Date();
    // Definimos el umbral de alerta (tareas que vencen en los próximos 7 días)
    const warningLimit = new Date();
    warningLimit.setDate(today.getDate() + 7);

    // 1. Buscar tareas que vencen pronto y siguen en un estado "abierto"
    const upcomingTasks = await PreventiveMaintenance.find({
      nextDate: { $lte: warningLimit },
      status: {
        $in: [
          PreventiveStatus.PROGRAMADO,
          PreventiveStatus.ASIGNADO,
          PreventiveStatus.EN_PROCESO,
        ],
      },
    }).populate("machine company");

    if (upcomingTasks.length === 0) {
      console.log("No hay tareas próximas a vencer.");
    }

    for (const task of upcomingTasks) {
      const companyId = (task.company as any)._id.toString();
      const machineName =
        (task.machine as any)?.internalTag || "Máquina desconocida";

      // Si la fecha ya pasó, actualizamos a "Vencido"
      if (task.nextDate < today) {
        console.log(`[VENCIDO]: ${task.taskName} en ${machineName}`);

        task.status = PreventiveStatus.VENCIDO;
        await task.save();

        // Notificar que se venció a los jefes
        await NotificationService.sendToRole(
          ["ADMIN", "MANTENIMIENTO"],
          companyId,
          {
            title: "Mantenimiento Vencido",
            message: `El preventivo '${task.taskName}' en ${machineName} ha vencido y no fue completado.`,
            type: "PREVENTIVE",
            link: "/preventivo",
          },
          ["IN_APP", "EMAIL"],
        );
      } else {
        // Si está en el rango de los 7 días pero aún no venció
        const companyName = (task.company as any)?.name || "Empresa";
        console.log(
          `[ALERTA - ${companyName}]: ${task.taskName} vence pronto (${task.nextDate.toLocaleDateString()})`,
        );

        // 1. Notificar a los Jefes de Mantenimiento
        await NotificationService.sendToRole(
          ["ADMIN", "MANTENIMIENTO"],
          companyId,
          {
            title: "Vencimiento Próximo",
            message: `El mantenimiento '${task.taskName}' vence el ${task.nextDate.toLocaleDateString()}.`,
            type: "PREVENTIVE",
            link: "/preventivo",
          },
          ["IN_APP"], // A los jefes capaz solo In-App para no saturarles el mail, o agregás "EMAIL" si prefieren
        );

        // 2. Notificar al Técnico Asignado (si es que ya se le asignó a alguien)
        if (task.assignedTo) {
          await NotificationService.sendToUser(
            task.assignedTo.toString(),
            companyId,
            {
              title: "Tu Mantenimiento Vence Pronto",
              message: `La tarea preventiva '${task.taskName}' que tienes asignada vence el ${task.nextDate.toLocaleDateString()}.`,
              type: "PREVENTIVE",
              link: "/preventivo",
            },
            ["IN_APP", "EMAIL"], // Al técnico sí le mandamos mail para que no se olvide
          );
        }
      }
    }

    console.log("--- Chequeo finalizado con éxito ---");
  } catch (error) {
    console.error("Error al ejecutar el chequeo de mantenimiento:", error);
  }
};
