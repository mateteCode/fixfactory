//const HistoryPage = () => {
  //return (
    //<div className="p-6">
      //<h1 className="text-2xl font-bold mb-4 text-gray-800">Historial General</h1>
      //<div className="bg-white p-4 rounded shadow">
        //<p className="text-gray-600">Aquí irá la línea de tiempo e historial de todas las máquinas.</p>
      //</div>
    //</div>
  //);
//};

//export default HistoryPage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { History, Filter, AlertTriangle } from "lucide-react";
import {
  useHistory,
  formatDowntime,
  type HistoryTypeFilter,
  type HistoryRecord,
} from "../hooks/useHistory";
import IncidentDetailModal from "../components/incidents/IncidentDetailModal";

const TYPE_FILTERS: { label: string; value: HistoryTypeFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Fallas", value: "fallas" },
  { label: "Mantenimiento", value: "mantenimiento" },
];

const HistoryPage = () => {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<HistoryTypeFilter>("all");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const { data, isLoading, isError } = useHistory(typeFilter);

  const records = data?.records ?? [];
  const total = data?.total ?? 0;

  const handleViewDetail = (record: HistoryRecord) => {
    if (record.detailType === "issue") {
      setSelectedIssueId(record.id);
      return;
    }
    if (record.machine.id) {
      navigate(`/maquinas/${record.machine.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <History className="mr-2 w-6 h-6 text-gray-600" />
            Historial de Fallas y Mantenimiento
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro unificado de intervenciones cerradas en la planta.
          </p>
        </div>

        <button
          onClick={() => navigate("/maquinas")}
          className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded text-xs font-bold hover:bg-gray-800 transition-all shadow-md uppercase"
        >
          <AlertTriangle size={14} />
          Reportar
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTypeFilter(filter.value)}
                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${
                  typeFilter === filter.value
                    ? "bg-white shadow-sm text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <Filter size={14} className="text-gray-400" />
            <span>
              Mostrando {records.length} de {total} registros
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 text-center text-gray-500 font-semibold animate-pulse">
            Cargando historial...
          </div>
        ) : isError ? (
          <div className="p-20 text-center text-red-500 font-semibold">
            No se pudo cargar el historial.
          </div>
        ) : records.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            No hay registros históricos para mostrar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Fecha",
                    "Máquina",
                    "Tipo",
                    "Descripción",
                    "Técnico",
                    "Estado",
                    "Repuesto",
                    "Tiempo Parada",
                    "Acciones",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={`${record.detailType}-${record.id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap font-mono">
                      {record.date}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                      <span className="font-bold">{record.machine.code}</span>
                      <span className="text-gray-500"> - {record.machine.name}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          record.type === "Falla"
                            ? "bg-gray-800 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {record.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">
                      {record.description}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                      {record.technician?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.usedSparePart
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {record.usedSparePart ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap font-mono">
                      {formatDowntime(record.downtimeMinutes)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetail(record)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 text-[10px] font-bold rounded hover:bg-gray-200 uppercase"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <IncidentDetailModal
        incidentId={selectedIssueId}
        onClose={() => setSelectedIssueId(null)}
      />
    </div>
  );
};

export default HistoryPage;