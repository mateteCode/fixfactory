import type { Request, Response } from "express";
import {
    getMaintenanceHistory,
    type HistoryTypeFilter,
} from "../services/history.service.js";

const VALID_TYPES: HistoryTypeFilter[] = ["all", "fallas", "mantenimiento"];

export const getHistory = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const companyId = (req as any).companyId;
        const rawType = (req.query.type as string) || "all";
        const type: HistoryTypeFilter = VALID_TYPES.includes(
        rawType as HistoryTypeFilter,
    )
        ? (rawType as HistoryTypeFilter)
        : "all";

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit as string, 10) || 50),
    );

    const result = await getMaintenanceHistory(companyId, type, page, limit);
    res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el historial", error });
    }
};
