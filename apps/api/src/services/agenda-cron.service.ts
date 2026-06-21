import cron from "node-cron";
import Company from "../models/Company.js";
import { NotificationService } from "./notification.service.js";
import {
    getOverdueVisitsForCompany,
    getTodayVisitsForCompany,
} from "./agenda.service.js";

export const runAgendaDailyAlerts = async () => {
    console.log("--- Iniciando alertas diarias de agenda ---");

    try {
        const companies = await Company.find({}).select("_id");

        for (const company of companies) {
        const companyId = company._id.toString();
        const todayVisits = await getTodayVisitsForCompany(companyId);
        const overdueVisits = await getOverdueVisitsForCompany(companyId);

        for (const visit of todayVisits) {
            if (visit.technician?.id) {
            await NotificationService.sendToUser(
                visit.technician.id,
                companyId,
                {
                title: "Visita programada hoy",
                message: `${visit.type} en ${visit.machine.code} a las ${visit.timeLabel}.`,
                type: visit.sourceType === "issue" ? "ISSUE" : "PREVENTIVE",
                link: visit.sourceType === "issue" ? "/ordenes" : "/preventivo",
                },
                ["IN_APP", "EMAIL"],
            );
            }

            if (visit.sourceType === "issue" && visit.reportedBy?.id) {
            await NotificationService.sendToUser(
                visit.reportedBy.id,
                companyId,
                {
                title: "Visita técnica hoy",
                message: `Hoy a las ${visit.timeLabel} se realizará una visita por la falla en ${visit.machine.code}.`,
                type: "ISSUE",
                link: "/ordenes",
                },
                ["IN_APP"],
            );
            }
        }

        if (overdueVisits.length > 0) {
            await NotificationService.sendToRole(
            ["ADMIN", "MANTENIMIENTO"],
            companyId,
            {
                title: "Visitas vencidas sin iniciar",
                message: `Hay ${overdueVisits.length} visita(s) vencida(s). Reprogramá o liberá la asignación.`,
                type: "SYSTEM",
                link: "/dashboard",
            },
            ["IN_APP", "EMAIL"],
            );
        }
        }

        console.log("--- Alertas de agenda finalizadas ---");
    } catch (error) {
        console.error("Error al ejecutar alertas de agenda:", error);
    }
};

export const initAgendaCronJobs = () => {
  cron.schedule("0 8 * * *", async () => {
    await runAgendaDailyAlerts();
    });
};