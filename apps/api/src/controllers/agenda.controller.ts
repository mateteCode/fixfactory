import type { Request, Response } from "express";
import { getAgendaForCompany } from "../services/agenda.service.js";

export const getAgenda = async (req: Request, res: Response): Promise<void> => {
    try {
        const companyId = (req as any).companyId;
        const user = (req as any).user;
        const date = req.query.date as string | undefined;

        const agenda = await getAgendaForCompany(
        companyId,
        { id: user.id, role: user.role },
        date,
        true,
    );

    res.status(200).json(agenda);
    } catch (error) {
    res.status(500).json({ message: "Error al obtener la agenda", error });
    }
};