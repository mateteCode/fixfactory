// src/pages/MachineDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useMachineDetail } from "../hooks/useMachineDetail";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  History,
  AlertTriangle,
  Layers,
  Activity,
  Wrench,
  DollarSign,
  PackageCheck,
} from "lucide-react";
import { useState } from "react";
import ReportIncidentModal from "../components/incidents/ReportIncidentModal";

const MachineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { machine, history, totalMaintenanceCost, isLoading, refetch } =
    useMachineDetail(id);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-10 text-center text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
        Cargando expediente del activo...
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-10 text-center text-sm font-semibold text-gray-500">
        Máquina no encontrada.
      </div>
    );
  }

  const priorityStyles: Record<string, string> = {
    Crítica: "bg-red-50 text-red-700 border-red-200",
    Alta: "bg-orange-50 text-orange-700 border-orange-200",
    Media: "bg-blue-50 text-blue-700 border-blue-200",
    Baja: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="space-y-6">
      {/* Barra de Navegación Superior */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{machine.name}</h1>
        <span
          className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${
            machine.status === "Operativa"
              ? "bg-green-50 text-green-700 border-green-200"
              : machine.status === "En Falla"
                ? "bg-red-50 text-red-700 border-red-200"
                : machine.status === "Mantenimiento"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
          }`}
        >
          {machine.status}
        </span>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Izquierdo: Datos Técnicos e Historiales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ficha de Especificaciones */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded text-gray-600">
                <Tag size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Línea de Producción
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {machine.productionLine}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded text-gray-600">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Ubicación Física
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {machine.location}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded text-gray-600">
                <Layers size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Tipo de Maquinaria
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {machine.type || "No especificado"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded text-gray-600">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Fecha de Instalación
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(machine.installationDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* HISTORIAL 1: Incidentes / Correctivos */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-700 text-sm flex items-center uppercase tracking-wider border-b pb-2">
              <History className="w-4 h-4 mr-2 text-gray-500" /> Historial de
              Incidentes Recientes
            </h3>
            {history.issues.length === 0 ? (
              <p className="text-gray-400 text-xs italic py-4 text-center">
                No hay fallas reportadas para este equipo.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-2 space-y-3">
                {history.issues.map((issue) => (
                  <div
                    key={issue._id}
                    className="pt-3 first:pt-0 flex justify-between items-start text-xs"
                  >
                    <div className="space-y-1 max-w-[70%]">
                      <p className="font-medium text-gray-800">
                        {issue.description}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Reportado el{" "}
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${priorityStyles[issue.priority]}`}
                      >
                        {issue.priority}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 uppercase">
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORIAL 2: Mantenimiento Preventivo */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-700 text-sm flex items-center uppercase tracking-wider border-b pb-2">
              <Activity className="w-4 h-4 mr-2 text-gray-500" /> Plan de
              Mantenimiento Preventivo
            </h3>
            {history.preventiveTasks.length === 0 ? (
              <p className="text-gray-400 text-xs italic py-4 text-center">
                No se han programado tareas preventivas.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-2">
                {history.preventiveTasks.map((task) => (
                  <div
                    key={task._id}
                    className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-800">{task.taskName}</p>
                      <p className="text-[10px] text-gray-400">
                        Frecuencia: cada {task.frequencyDays} días
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] text-gray-500">
                        Próximo: {new Date(task.nextDate).toLocaleDateString()}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          task.status === "Programado"
                            ? "bg-blue-100 text-blue-700"
                            : task.status === "Vencido"
                              ? "bg-red-100 text-red-700 animate-pulse"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Repuestos Utilizados y Gastos Totales */}
        <div className="space-y-6">
          {/* Código QR de Planta */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-700 mb-4 text-xs uppercase tracking-wider">
              Identificador QR único
            </h3>
            <div className="p-3 border border-gray-100 rounded bg-gray-50">
              <QRCodeSVG value={machine._id} size={130} />
            </div>
            <p className="mt-3 text-[9px] text-gray-400 font-mono tracking-tighter">
              {machine._id}
            </p>

            <button
              onClick={() => setIsIncidentModalOpen(true)}
              className="mt-5 w-full py-2.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors uppercase tracking-widest flex items-center justify-center shadow-sm"
            >
              <AlertTriangle size={14} className="mr-2" /> Reportar Falla
            </button>
          </div>

          {/* Bloque Financiero / Resumen de Gasto */}
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Costo en Mantenimiento (USD)
              </p>
              <p className="text-2xl font-black mt-1 font-mono">
                {totalMaintenanceCost.toLocaleString("es-AR", {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-full text-green-400">
              <DollarSign size={24} />
            </div>
          </div>

          {/* HISTORIAL 3: Repuestos consumidos */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-700 text-sm flex items-center uppercase tracking-wider border-b pb-2">
              <PackageCheck className="w-4 h-4 mr-2 text-gray-500" /> Repuestos
              Utilizados
            </h3>
            {history.spareParts.length === 0 ? (
              <p className="text-gray-400 text-xs italic py-4 text-center">
                No se registran componentes cambiados.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-2 space-y-2">
                {/* Lógica funcional para agrupar repuestos por ID */}
                {Object.values(
                  history.spareParts.reduce(
                    (acc, sp) => {
                      const partId = sp.sparePart?._id || "unknown";
                      const partName =
                        sp.sparePart?.modelName ||
                        sp.sparePart?.model ||
                        "Componente";
                      const quantity = sp.quantity || 1;
                      const cost = (sp.estimatedCost || 0) * quantity;

                      if (!acc[partId]) {
                        acc[partId] = {
                          id: partId,
                          name: partName,
                          totalQuantity: 0,
                          totalCost: 0,
                        };
                      }

                      acc[partId].totalQuantity += quantity;
                      acc[partId].totalCost += cost;

                      return acc;
                    },
                    {} as Record<
                      string,
                      {
                        id: string;
                        name: string;
                        totalQuantity: number;
                        totalCost: number;
                      }
                    >,
                  ),
                ).map((groupedPart) => (
                  <div
                    key={groupedPart.id}
                    className="pt-2 first:pt-0 flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-800">
                        {groupedPart.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Cantidad Total: {groupedPart.totalQuantity} unid.
                      </p>
                    </div>
                    <span className="font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded text-[11px]">
                      ${groupedPart.totalCost.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Inyectado */}
      <ReportIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        machineId={machine._id}
        machineName={machine.name}
        onSuccess={() => {
          refetch(); // Recarga toda la ficha técnica automáticamente ante un nuevo reporte
        }}
      />
    </div>
  );
};

export default MachineDetailPage;
