import {
  X,
  Loader2,
  FileText,
  User,
  Tablet,
  Wrench,
  PackageSearch,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { useIncidentDetail } from "../../hooks/useIncidentDetail";

interface Props {
  incidentId: string | null;
  onClose: () => void;
}

const IncidentDetailModal = ({ incidentId, onClose }: Props) => {
  const { incident, spareParts, isLoading, error } =
    useIncidentDetail(incidentId);
  //console.log(incident);
  //console.log(spareParts);

  if (!incidentId) return null;

  // 1. Agrupamos por estado y unificamos cantidades de piezas idénticas
  const groupedParts = (Array.isArray(spareParts) ? spareParts : []).reduce(
    (acc, part) => {
      const status = part.status || "Desconocido";

      // Si el estado no existe en nuestro acumulador, creamos un objeto vacío
      if (!acc[status]) acc[status] = {};

      // Tomamos el ID único del repuesto físico para saber si ya lo contamos
      const partId = part.sparePart?._id || "repuesto_desconocido";

      if (!acc[status][partId]) {
        // Si no existe este repuesto en este estado, lo agregamos (clonándolo para no mutar el original)
        acc[status][partId] = { ...part };
      } else {
        // Si ya existe, simplemente le sumamos la cantidad del nuevo pedido
        acc[status][partId].quantity += part.quantity;
      }

      return acc;
    },
    {} as Record<string, Record<string, any>>, // Estructura: { "Aceptado": { "id_123": {...}, "id_456": {...} } }
  );

  // 2. Convertimos el diccionario doble a un array iterable para poder renderizarlo en el HTML
  const groupedEntries: [string, any[]][] = Object.entries(groupedParts).map(
    ([status, partsDict]) => [status, Object.values(partsDict)],
  );

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
          {error ? (
            <div className="flex flex-col items-center justify-center py-10 text-red-500">
              <p className="text-lg font-bold">No se pudo cargar</p>
              <p className="text-sm text-red-400 mt-2 bg-red-50 p-3 rounded">
                {error}
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Verifica en consola (F12) o prueba con un rol de
                Administrador/Técnico.
              </p>
            </div>
          ) : isLoading || !incident ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-bold animate-pulse">
                Cargando expediente...
              </p>
            </div>
          ) : (
            <>
              {/* SECCIÓN 1: Info General */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center mb-1">
                    <Tablet className="w-3 h-3 mr-1" /> Máquina Afectada
                  </p>
                  <p className="font-bold text-gray-800 truncate">
                    {incident.machine?.internalTag} -{" "}
                    {incident.machine?.catalogRef?.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {incident.machine?.catalogRef?.brand}{" "}
                    {incident.machine?.catalogRef?.modelCode}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center mb-1">
                    <User className="w-3 h-3 mr-1" /> Reportado por
                  </p>
                  <p className="font-bold text-gray-800">
                    {incident.reportedBy?.name || "Desconocido"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {incident.reportedBy?.email}
                  </p>
                </div>

                <div className="bg-blue-50/50 p-4 rounded border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-500 uppercase flex items-center mb-1">
                    <UserCheck className="w-3 h-3 mr-1" /> Asignado a
                  </p>
                  <p className="font-bold text-blue-900">
                    {incident.assignedTo?.name || "Sin asignar"}
                  </p>
                  <p className="text-xs text-blue-600/70 truncate">
                    {incident.assignedTo
                      ? "Responsable de reparación"
                      : "Pendiente de jefe"}
                  </p>
                </div>
              </div>

              {/* SECCIÓN 2: El Problema, Evidencia y Diagnóstico */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase mb-1">
                    Descripción de la falla
                  </p>
                  <div className="bg-red-50 text-red-800 p-3 rounded text-sm border border-red-100">
                    {incident.description}
                  </div>
                </div>

                {/* Mostrar la evidencia fotográfica si existe */}
                {incident.imageUrl && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase mb-1 flex items-center">
                      <ImageIcon className="w-3 h-3 mr-1" /> Evidencia
                      Fotográfica
                    </p>
                    <div className="bg-gray-50 border border-gray-200 p-2 rounded flex justify-center mt-1">
                      <img
                        src={incident.imageUrl}
                        alt="Evidencia de la falla"
                        className="max-h-64 object-contain rounded shadow-sm border border-gray-200"
                      />
                    </div>
                  </div>
                )}

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

              {/* SECCIÓN NUEVA: BITÁCORA DE DIAGNÓSTICOS */}
              {incident.diagnostics && incident.diagnostics.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-1 flex items-center">
                    <Wrench className="w-3 h-3 mr-1" /> Historial de
                    Diagnósticos
                  </p>
                  {incident.diagnostics.map((diag: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                          Técnico: {diag.technician?.name || "Desconocido"}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          {new Date(diag.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed">
                        {diag.description}
                      </p>

                      {diag.images && diag.images.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                          {diag.images.map((img: string, i: number) => (
                            <a
                              key={i}
                              href={img}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={img}
                                className="h-20 w-20 object-cover rounded border border-indigo-200 hover:opacity-80 transition-opacity"
                                alt="Evidencia"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* SECCIÓN NUEVA: CONCLUSIÓN */}
              {incident.conclusion && incident.conclusion.finishedBy && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-1 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />{" "}
                    Resolución y Cierre
                  </p>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-green-800 bg-green-200 px-2 py-0.5 rounded">
                        Finalizado por:{" "}
                        {incident.conclusion.finishedBy?.name || "Desconocido"}
                      </span>
                      <span className="text-[10px] text-green-600 font-mono">
                        {new Date(
                          incident.conclusion.finishedAt,
                        ).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {incident.conclusion.description}
                    </p>

                    {incident.conclusion.images &&
                      incident.conclusion.images.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                          {incident.conclusion.images.map(
                            (img: string, i: number) => (
                              <a
                                key={i}
                                href={img}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={img}
                                  className="h-24 w-24 object-cover rounded border border-green-300 hover:opacity-80 transition-opacity"
                                  alt="Conclusión"
                                />
                              </a>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* SECCIÓN 3: Repuestos Solicitados */}
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
                    {/* 3. SOLUCIÓN: Usamos la variable limpia aquí */}
                    {groupedEntries.map(([status, parts]) => (
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
                          {parts.map((p: any) => {
                            // Extraemos el Nivel 1 (Catálogo) de forma segura
                            const catalog = p.sparePart?.catalogRef;

                            return (
                              <li
                                key={p._id}
                                className="p-3 text-sm flex justify-between items-center hover:bg-gray-50"
                              >
                                <div>
                                  <span className="font-bold text-gray-800">
                                    {catalog?.name || "Repuesto no indexado"}
                                  </span>
                                  <span className="text-gray-500 text-xs ml-2">
                                    ({catalog?.brand || "S/M"} - PN:{" "}
                                    {catalog?.partNumber || "S/N"})
                                  </span>
                                </div>
                                <span className="font-mono bg-gray-800 text-white px-2 py-1 rounded text-xs">
                                  x{p.quantity} unid.
                                </span>
                              </li>
                            );
                          })}
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
