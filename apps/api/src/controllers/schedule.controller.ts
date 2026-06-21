
import type { Request, Response } from "express";
import Issue from "../models/Issue.js";
//import PreventiveMaintenance from "../models/PreventiveMaintenance.js";
import { UserRole } from "../models/User.js";
import { NotificationService } from "../services/notification.service.js";
import { canReschedule, formatTimeLabel } from "../services/agenda.service.js";

const applyScheduleUpdate = (scheduledAt: string) => {
    const parsed = new Date(scheduledAt);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error("Fecha de visita inválida.");
    }
    return {
        scheduledAt: parsed,
        scheduledAtUpdatedAt: new Date(),
    };
};

export const rescheduleIssue = async (
    req: Request,
    res: Response,
    ): Promise<void> => {
    try {
        const user = (req as any).user;
        const companyId = (req as any).companyId;
        const { scheduledAt } = req.body;

        if (![UserRole.ADMIN, UserRole.MANTENIMIENTO].includes(user.role)) {
        res.status(403).json({ message: "No tienes permisos para reprogramar." });
        return;
        }

        if (!scheduledAt) {
        res.status(400).json({ message: "Debes indicar una fecha de visita." });
        return;
        }

        const issue = await Issue.findOne({
        _id: req.params.id as string,
        company: companyId,
        }).populate("assignedTo", "name");

        if (!issue) {
        res.status(404).json({ message: "Incidencia no encontrada." });
        return;
        }

        const permission = canReschedule(issue.scheduledAt, user.role);
        if (!permission.allowed) {
        res.status(403).json({ message: permission.reason });
        return;
        }

        Object.assign(issue, applyScheduleUpdate(scheduledAt));
        await issue.save();

        if (issue.assignedTo) {
        const assigned = issue.assignedTo as any;
        const techId = assigned._id ? assigned._id.toString() : assigned.toString();
        const visitTime = formatTimeLabel(issue.scheduledAt!);
        await NotificationService.sendToUser(
            techId,
            companyId,
            {
            title: "Visita reprogramada",
            message: `La visita por falla fue reprogramada para las ${visitTime}.`,
            type: "ISSUE",
            link: "/ordenes",
            },
            ["IN_APP", "EMAIL"],
        );
    }

    if (issue.reportedBy) {
        const visitTime = formatTimeLabel(issue.scheduledAt!);
        await NotificationService.sendToUser(
            issue.reportedBy.toString(),
            companyId,
            {
            title: "Visita técnica reprogramada",
            message: `La visita del técnico fue reprogramada para las ${visitTime}.`,
            type: "ISSUE",
            link: "/ordenes",
            },
            ["IN_APP"],
        );
        }

        res.status(200).json(issue);
    } catch (error: any) {
        res.status(400).json({
        message: error.message || "Error al reprogramar la visita.",
        });
    }
};
