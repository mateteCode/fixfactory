import { useState } from "react";
import { useIncidentManager } from "../hooks/useIncidentManager";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Hammer,
  PackageSearch,
  FileText,
  UserCheck,
  Play,
  Wrench,
} from "lucide-react";
import { IssueStatus } from "../types/Issue";
import RequestSparePartModal from "../components/incidents/RequestSparePartModal";
import IncidentDetailModal from "../components/incidents/IncidentDetailModal";
import AssignIssueModal from "../components/incidents/AssignIssueModal";
import { useAuthStore } from "../store/useAuthStore";

const IncidentsPage = () => {
  const { incidents, isLoading, updateStatus, assignTask, refetch } =
    useIncidentManager();
  const user = useAuthStore((state) => state.user);

  const [incidentForSparePart, setIncidentForSparePart] = useState<any>(null);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);
  const [issueToAssign, setIssueToAssign] = useState<string | null>(null);
  const [filterMyTasks, setFilterMyTasks] = useState(false);

  // Privilegios
  const canAssignTasks =
    user?.role === "ADMIN" || user?.role === "MANTENIMIENTO";

  const displayedIncidents = filterMyTasks
    ? incidents.filter((i) => i.assignedTo?._id === user?.id)
    : incidents;

  const priorityStyles: Record<string, string> = {
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
        {/* Toggle para filtrar Mis Tareas */}
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setFilterMyTasks(false)}
            className={`px-4 py-1.5 text-xs font-bold rounded ${!filterMyTasks ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterMyTasks(true)}
            className={`px-4 py-1.5 text-xs font-bold rounded ${filterMyTasks ? "bg-white shadow-sm text-blue-700" : "text-gray-500"}`}
          >
            Mis Tareas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-20 text-center animate-pulse text-gray-500 font-bold">
            Cargando incidencias...
          </div>
        ) : displayedIncidents.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-lg border border-dashed border-gray-300 text-gray-400">
            No hay órdenes de trabajo para mostrar en esta vista.
          </div>
        ) : (
          displayedIncidents.map((inc) => {
            const isMyTask = inc.assignedTo?._id === user?.id;

            return (
              <div
                key={inc._id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-3 rounded-full shrink-0 ${priorityStyles[inc.priority]}`}
                  >
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-800">
                        {inc.machine?.internalTag} -{" "}
                        {inc.machine?.catalogRef?.name}
                      </h3>
                      <span className="text-[10px] text-gray-400 font-mono">
                        [{inc.machine?.catalogRef?.brand}{" "}
                        {inc.machine?.catalogRef?.modelCode}]
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                      {inc.description}
                    </p>

                    <div className="flex items-center mt-2 text-[10px] text-gray-500 space-x-3 flex-wrap gap-y-1">
                      <span className="flex items-center">
                        <Clock size={10} className="mr-1" />{" "}
                        {new Date(inc.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {inc.status}
                      </span>
                      {inc.assignedTo ? (
                        <span className="flex items-center font-bold text-emerald-600">
                          <UserCheck size={10} className="mr-1" />{" "}
                          {inc.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold flex items-center">
                          <AlertCircle size={10} className="mr-1" /> Sin asignar
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => setDetailModalId(inc._id)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 text-[10px] font-bold rounded hover:bg-gray-200 uppercase flex items-center"
                  >
                    <FileText className="w-3 h-3 mr-1" /> Detalle
                  </button>

                  {/* BOTÓN JEFE: ASIGNAR */}
                  {inc.status === "Pendiente" && canAssignTasks && (
                    <button
                      onClick={() => setIssueToAssign(inc._id)}
                      className="px-3 py-2 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 uppercase flex items-center shadow-sm"
                    >
                      <UserCheck className="w-3 h-3 mr-1" /> Asignar Trabajo
                    </button>
                  )}

                  {/* FLUJO DE TRABAJO DEL TÉCNICO (Solo visible si es "Su" tarea) */}
                  {isMyTask && (
                    <>
                      {inc.status === IssueStatus.EN_PROCESO && (
                        <button
                          onClick={() => updateStatus(inc._id, "Diagnóstico")}
                          className="px-3 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700 uppercase flex items-center"
                        >
                          <Play className="w-3 h-3 mr-1" /> Diagnosticar
                        </button>
                      )}

                      {[
                        "Diagnóstico",
                        "En Espera de Repuesto",
                        "En Proceso",
                      ].includes(inc.status) && (
                        <button
                          onClick={() => setIncidentForSparePart(inc)}
                          className="px-3 py-2 bg-amber-500 text-white text-[10px] font-bold rounded hover:bg-amber-600 uppercase flex items-center"
                        >
                          <PackageSearch className="w-3 h-3 mr-1" /> Pedir
                          Repuesto
                        </button>
                      )}

                      {(inc.status === "Diagnóstico" ||
                        inc.status === "En Espera de Repuesto") && (
                        <button
                          onClick={() => updateStatus(inc._id, "En Reparación")}
                          className="px-3 py-2 bg-orange-600 text-white text-[10px] font-bold rounded hover:bg-orange-700 uppercase flex items-center"
                        >
                          <Wrench className="w-3 h-3 mr-1" /> Reparar
                        </button>
                      )}

                      {inc.status === "En Reparación" && (
                        <button
                          onClick={() => updateStatus(inc._id, "Cerrado")}
                          className="px-3 py-2 bg-green-600 text-white text-[10px] font-bold rounded hover:bg-green-700 uppercase flex items-center"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Finalizar
                        </button>
                      )}
                    </>
                  )}

                  {inc.status === "Cerrado" && (
                    <CheckCircle2 className="text-green-500 w-6 h-6 ml-2" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modales */}
      <AssignIssueModal
        isOpen={!!issueToAssign}
        onClose={() => setIssueToAssign(null)}
        issueId={issueToAssign}
        onAssign={assignTask}
      />

      {incidentForSparePart && (
        <RequestSparePartModal
          isOpen={true}
          onClose={() => setIncidentForSparePart(null)}
          incidentId={incidentForSparePart._id}
          machineId={
            incidentForSparePart.machine._id || incidentForSparePart.machine
          }
          onSuccess={() => refetch()}
        />
      )}

      <IncidentDetailModal
        incidentId={detailModalId}
        onClose={() => setDetailModalId(null)}
      />
    </div>
  );
};

export default IncidentsPage;
