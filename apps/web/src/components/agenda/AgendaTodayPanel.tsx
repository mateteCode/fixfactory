import { useState } from "react";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { useAgenda, type AgendaVisit } from "../../hooks/useAgenda";
import RescheduleVisitModal from "./RescheduleVisitModal";
import { usePermissions } from "../../hooks/usePermissions";

const statusStyles: Record<string, string> = {
    Programada: "bg-blue-100 text-blue-700 border-blue-200",
    Vencida: "bg-red-100 text-red-700 border-red-200 animate-pulse",
    "En curso": "bg-green-100 text-green-700 border-green-200",
};

interface VisitRowProps {
    visit: AgendaVisit;
    onReschedule: (visit: AgendaVisit) => void;
    canRescheduleVisit: boolean;
}

const VisitRow = ({ visit, onReschedule, canRescheduleVisit, }: VisitRowProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-gray-800">
                {visit.timeLabel}
            </span>

            <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${statusStyles[visit.visitStatus]}`}
            >
                {visit.visitStatus}
            </span>

            <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                visit.type === "Falla"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
            >
                {visit.type}
            </span>
            </div>

            <p className="text-sm font-bold text-gray-800 truncate">
            {visit.machine.code} - {visit.machine.name}
            </p>

            <p className="text-xs text-gray-500 truncate">{visit.description}</p>

            {visit.technician && (
            <p className="text-[10px] text-gray-400">
                Técnico: {visit.technician.name}
            </p>
            )}
        </div>

        <div className="shrink-0 flex flex-col gap-2">
            <button
            onClick={() =>
                navigate(visit.sourceType === "issue" ? "/ordenes" : "/preventivo")
            }
            className="px-2 py-1 text-[10px] font-bold uppercase border border-gray-300 rounded hover:bg-gray-50"
            >
            Ver
            </button>

            {canRescheduleVisit && visit.sourceType === "issue" && (
            <button
                onClick={() => onReschedule(visit)}
                className="px-2 py-1 text-[10px] font-bold uppercase border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
            >
                Reprogramar
            </button>
            )}
        </div>
        </div>
    );
};

const AgendaTodayPanel = () => {
    const { data, isLoading, isError } = useAgenda();
    const queryClient = useQueryClient();
    const { canRescheduleVisit } = usePermissions();

    const [visitToReschedule, setVisitToReschedule] =
        useState<AgendaVisit | null>(null);

    const handleRescheduleSubmit = async (scheduledAt: string) => {
        if (!visitToReschedule) return;

        await api.patch(`/agenda/issues/${visitToReschedule.id}`, {
        scheduledAt,
        });

        await queryClient.invalidateQueries({ queryKey: ["agenda"] });
    };

    return (
        <>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase flex items-center">
                <CalendarClock className="w-4 h-4 mr-2 text-blue-600" />
                Agenda de Hoy
            </h3>

            {data?.date && (
                <span className="text-[10px] font-mono text-gray-400">
                {data.date}
                </span>
            )}
            </div>

            {isLoading ? (
            <p className="text-sm text-gray-400 animate-pulse py-6 text-center">
                Cargando agenda...
            </p>
            ) : isError ? (
            <p className="text-sm text-red-500 py-6 text-center">
                No se pudo cargar la agenda.
            </p>
            ) : (
            <>
                {data?.overdue && data.overdue.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-[10px] font-bold uppercase text-red-700 flex items-center mb-2">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Visitas vencidas ({data.overdue.length})
                    </p>

                    <div className="max-h-40 overflow-y-auto">
                    {data.overdue.map((visit) => (
                        <VisitRow
                            key={`${visit.sourceType}-${visit.id}`}
                            visit={visit}
                            onReschedule={setVisitToReschedule}
                            canRescheduleVisit={canRescheduleVisit}
                        />
                    ))}
                    </div>
                </div>
                )}

                {data?.visits && data.visits.length > 0 ? (
                <div className="max-h-72 overflow-y-auto">
                    {data.visits.map((visit) => (
                    <VisitRow
                        key={`${visit.sourceType}-${visit.id}`}
                        visit={visit}
                        onReschedule={setVisitToReschedule}
                        canRescheduleVisit={canRescheduleVisit}
                    />
                    ))}
                </div>
                ) : (
                <p className="text-sm text-gray-400 py-6 text-center italic">
                    No hay visitas programadas para hoy.
                </p>
                )}
            </>
            )}
        </div>

        <RescheduleVisitModal
            isOpen={!!visitToReschedule}
            onClose={() => setVisitToReschedule(null)}
            title="Reprogramar visita"
            currentScheduledAt={visitToReschedule?.scheduledAt}
            onSubmit={handleRescheduleSubmit}
        />
        </>
    );
};

export default AgendaTodayPanel;