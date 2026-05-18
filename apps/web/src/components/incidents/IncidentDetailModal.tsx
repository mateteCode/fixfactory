import {
  X,
  Loader2,
  FileText,
  User,
  Tablet,
  Wrench,
  PackageSearch,
} from "lucide-react";
import { useIncidentDetail } from "../../hooks/useIncidentDetail";

interface Props {
  incidentId: string | null;
  onClose: () => void;
}

const IncidentDetailModal = ({ incidentId, onClose }: Props) => {
  const { incident, spareParts, isLoading } = useIncidentDetail(incidentId);

  if (!incidentId) return null;

  // Función para agrupar los repuestos por estado
  const groupedParts = spareParts.reduce(
    (acc, part) => {
      const status = part.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(part);
      return acc;
    },
    {} as Record<string, any[]>,
  );
  console.log(groupedParts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#F5F5F5] px-6 py-4 border-b border-gray-300 flex justify-between items-center shrink-0">
          <h3 className="text-gray-800 font-bold flex items-center text-sm uppercase tracking-wider">
            <FileText className="w-4 h-4 mr-2 text-gray-600" />
            Detalle de Orden de Trabajo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading || !incident ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-bold animate-pulse">
                Cargando expediente...
              </p>
            </div>
          ) : (
            <>
              {/* SECCIÓN 1: Info General */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center mb-1">
                    <Tablet className="w-3 h-3 mr-1" /> Máquina Afectada
                  </p>
                  <p className="font-bold text-gray-800">
                    {incident.machine?.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {incident.machine?.code}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center mb-1">
                    <User className="w-3 h-3 mr-1" /> Reportado por
                  </p>
                  <p className="font-bold text-gray-800">
                    {incident.reportedBy?.name || "Desconocido"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {incident.reportedBy?.email}
                  </p>
                </div>
              </div>

              {/* SECCIÓN 2: El Problema y Diagnóstico */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase mb-1">
                    Descripción de la falla
                  </p>
                  <div className="bg-red-50 text-red-800 p-3 rounded text-sm border border-red-100">
                    {incident.description}
                  </div>
                </div>

                {incident.technicalDiagnosis && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase mb-1 flex items-center">
                      <Wrench className="w-3 h-3 mr-1" /> Diagnóstico Técnico
                    </p>
                    <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm border border-blue-100 whitespace-pre-wrap">
                      {incident.technicalDiagnosis}
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 3: Repuestos Solicitados (Agrupados) */}
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center border-b pb-2">
                  <PackageSearch className="w-4 h-4 mr-1" /> Piezas y Repuestos
                  Involucrados
                </p>

                {spareParts.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded border border-gray-100">
                    No se solicitaron repuestos para esta orden.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedParts).map(([status, parts]) => (
                      <div
                        key={status}
                        className="border border-gray-200 rounded overflow-hidden"
                      >
                        <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 uppercase border-b border-gray-200 flex justify-between">
                          <span>Estado: {status}</span>
                          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            {parts.length}
                          </span>
                        </div>
                        <ul className="divide-y divide-gray-100">
                          {parts.map((p: any) => (
                            <li
                              key={p._id}
                              className="p-3 text-sm flex justify-between items-center hover:bg-gray-50"
                            >
                              <div>
                                <span className="font-bold text-gray-800">
                                  {p.sparePart?.modelName}
                                </span>
                                <span className="text-gray-500 text-xs ml-2">
                                  ({p.sparePart?.brand})
                                </span>
                              </div>
                              <span className="font-mono bg-gray-800 text-white px-2 py-1 rounded text-xs">
                                x{p.quantity} unid.
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailModal;
