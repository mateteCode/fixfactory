import { useIncidentManager } from "../hooks/useIncidentManager";
import { AlertCircle, Clock, CheckCircle2, Hammer } from "lucide-react";
import { IssueStatus } from "../types/Issue";

const IncidentsPage = () => {
  const { incidents, isLoading, updateStatus } = useIncidentManager();
  console.log(incidents);

  const priorityStyles = {
    Crítica: "bg-red-100 text-red-700 border-red-200",
    Alta: "bg-orange-100 text-orange-700 border-orange-200",
    Media: "bg-blue-100 text-blue-700 border-blue-200",
    Baja: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Hammer className="mr-2 w-6 h-6 text-gray-600" />
          Órdenes de Trabajo
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-20 text-center animate-pulse text-gray-500 font-bold">
            Cargando incidencias...
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-lg border border-dashed border-gray-300 text-gray-400">
            No hay incidencias activas en este momento.
          </div>
        ) : (
          incidents.map((inc) => (
            <div
              key={inc._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-full ${priorityStyles[inc.priority]}`}
                >
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-800">
                      {inc.machine.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono">
                      [{inc.machine.code}]
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {inc.description}
                  </p>
                  <div className="flex items-center mt-1 text-[10px] text-gray-400 space-x-3">
                    <span className="flex items-center">
                      <Clock size={10} className="mr-1" />{" "}
                      {new Date(inc.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-bold uppercase tracking-widest">
                      {inc.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {inc.status === IssueStatus.PENDIENTE && (
                  <button
                    onClick={() => updateStatus(inc._id, "En Proceso")}
                    className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 transition-colors uppercase"
                  >
                    Tomar Trabajo
                  </button>
                )}
                {inc.status === IssueStatus.EN_PROCESO && (
                  <button
                    onClick={() => updateStatus(inc._id, "Cerrado")}
                    className="px-4 py-2 bg-green-600 text-white text-[10px] font-bold rounded hover:bg-green-700 transition-colors uppercase"
                  >
                    Finalizar
                  </button>
                )}
                {inc.status === "Cerrado" && (
                  <CheckCircle2 className="text-green-500 w-6 h-6 mr-4" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncidentsPage;
