import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export type VisitAgendaStatus = "Programada" | "Vencida" | "En curso";

export interface AgendaVisit {
    id: string;
    sourceType: "issue" | "preventive";
    type: "Falla" | "Mantenimiento";
    scheduledAt: string;
    timeLabel: string;
    description: string;
    visitStatus: VisitAgendaStatus;
    machine: {
        id: string;
        code: string;
        name: string;
    };
    technician: { id: string; name: string } | null;
    reportedBy?: { id: string; name: string } | null;
}

export interface AgendaResponse {
    date: string;
    visits: AgendaVisit[];
    overdue: AgendaVisit[];
    }

const fetchAgenda = async (date?: string): Promise<AgendaResponse> => {
    const { data } = await api.get<AgendaResponse>("/agenda", {
        params: date ? { date } : undefined,
    });
    return data;
};

export const useAgenda = (date?: string) => {
    return useQuery({
        queryKey: ["agenda", date ?? "today"],
        queryFn: () => fetchAgenda(date),
    });
};

export const toDateTimeLocalValue = (isoDate?: string | null): string => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
};

export const fromDateTimeLocalValue = (value: string): string => {
    if (!value) return "";
    return new Date(value).toISOString();
};
