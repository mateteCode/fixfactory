import cron from "node-cron";
import PreventiveMaintenance from "../models/PreventiveMaintenance.js";

// Tarea que se ejecuta todos los días a las 08:00 AM
export const initCronJobs = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily maintenance check...");

    try {
      const today = new Date();
      const warningLimit = new Date();
      warningLimit.setDate(today.getDate() + 7); // Avisar con 7 días de antelación

      // Buscar tareas programadas que vencen pronto
      const upcomingTasks = await PreventiveMaintenance.find({
        nextDate: { $lte: warningLimit },
        status: "Programado",
      }).populate("machine");

      upcomingTasks.forEach((task) => {
        // Aquí se integraría el servicio de mail (RF-04)
        console.log(
          `ALERTA PREVENTIVA: La tarea "${task.taskName}" vence el ${task.nextDate.toLocaleDateString()}`,
        );

        // Si ya pasó la fecha, marcar como Vencido
        if (task.nextDate < today) {
          task.status = "Vencido";
          task.save();
        }
      });
    } catch (error) {
      console.error("Error en el cron job:", error);
    }
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
    // Definimos el umbral de alerta (ej: tareas que vencen en los próximos 7 días)
    const warningLimit = new Date();
    warningLimit.setDate(today.getDate() + 7);

    // 1. Buscar tareas que vencen pronto y siguen en estado "Programado"
    const upcomingTasks = await PreventiveMaintenance.find({
      nextDate: { $lte: warningLimit },
      status: "Programado",
    }).populate("machine company");

    if (upcomingTasks.length === 0) {
      console.log("No hay tareas próximas a vencer.");
    }

    for (const task of upcomingTasks) {
      // Si la fecha ya pasó, actualizamos a "Vencido"
      if (task.nextDate < today) {
        const machineName = (task.machine as any).name || "Máquina desconocida";
        console.log(`[VENCIDO]: ${task.taskName} en ${machineName}`);
        task.status = "Vencido";
        await task.save();
      } else {
        // Si está en el rango de los 7 días pero aún no venció
        const companyName = (task.company as any).name;
        console.log(
          `[ALERTA - ${companyName}]: ${task.taskName} vence pronto (${task.nextDate.toLocaleDateString()})`,
        );

        // Aquí es donde llamarías a sendNotification(...) en el futuro (RF-04)
      }
    }

    console.log("--- Chequeo finalizado con éxito ---");
  } catch (error) {
    console.error("Error al ejecutar el chequeo de mantenimiento:", error);
  }
};
