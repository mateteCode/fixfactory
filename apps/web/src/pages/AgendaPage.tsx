import { ArrowLeft, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AgendaTodayPanel from "../components/agenda/AgendaTodayPanel";
import { usePermissions } from "../hooks/usePermissions";

const AgendaPage = () => {
    const navigate = useNavigate();
    const { defaultRoute } = usePermissions();

    return (
        <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <CalendarClock className="mr-2 w-6 h-6 text-gray-600" />
                Agenda de visitas
            </h1>
            <p className="text-sm text-gray-500 mt-1">
                Visitas técnicas programadas para el día.
            </p>
            </div>

            <button
            onClick={() => navigate(defaultRoute)}
            className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 text-[10px] font-bold rounded hover:bg-gray-200 uppercase flex items-center"
            >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Volver
            </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <AgendaTodayPanel />
        </div>
        </div>
    );
};

export default AgendaPage;