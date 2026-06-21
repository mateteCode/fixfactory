import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export type HistoryTypeFilter = "all" | "fallas" | "mantenimiento";

export interface HistoryRecord {
    id: string;
    date: string;
    machine: {
        id: string;
        code: string;
        name: string;
    };
    type: "Falla" | "Mantenimiento";
    description: string;
    technician: { id: string; name: string } | null;
    status: string;
    usedSparePart: boolean;
    downtimeMinutes: number;
    detailType: "issue" | "preventive";
}

export interface HistoryResponse {
    total: number;
    page: number;
    limit: number;
    records: HistoryRecord[];
}

const fetchHistory = async (
    type: HistoryTypeFilter,
    ): Promise<HistoryResponse> => {
    const { data } = await api.get<HistoryResponse>("/history", {
        params: { type, limit: 100 },
    });
    return data;
};

export const useHistory = (type: HistoryTypeFilter = "all") => {
    return useQuery({
        queryKey: ["maintenance-history", type],
        queryFn: () => fetchHistory(type),
    });
};

export const formatDowntime = (minutes: number): string => {
    if (minutes <= 0) return "0h 00m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, "0")}m`;
};