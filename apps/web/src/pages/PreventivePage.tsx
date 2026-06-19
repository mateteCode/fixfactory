import { useState } from "react";
import { usePreventiveManager } from "../hooks/usePreventiveManager";
import { useAuthStore } from "../store/useAuthStore";
import {
  Calendar,
  UserCheck,
  Play,
  Wrench,
  X,
  CheckCircle2,
  ShieldCheck,
  PackageSearch,
  Plus,
} from "lucide-react";
import { AddPreventiveModal } from "../components/preventive/AddPreventiveModal";
import TaskActionModal from "../components/incidents/TaskActionModal";
import RequestSparePartModal from "../components/incidents/RequestSparePartModal";
import { AssignPreventiveModal } from "../components/preventive/AssignPreventiveModal";
import { usePermissions } from "../hooks/usePermissions";

const PreventivePage = () => {
  const {
    tasks,
    isLoading,
    assignTask,
    updateStatus,
    finishTask,
    releaseTask,
    refetch,
  } = usePreventiveManager();
  const user = useAuthStore((state) => state.user);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterMyTasks, setFilterMyTasks] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<string | null>(null);
  const [taskForSparePart, setTaskForSparePart] = useState<any>(null);
  const [actionModal, setActionModal] = useState<{ id: string } | null>(null);
  const { canSchedulePreventive, canAssignPreventive } = usePermissions();

  const canAssignTasks =
    user?.role === "ADMIN" || user?.role === "MANTENIMIENTO";
  const displayedTasks = filterMyTasks
    ? tasks.filter((t) => t.assignedTo?._id === user?.id)
    : tasks;

  const handleFinishSubmit = async (description: string, images: string[]) => {
    if (actionModal) await finishTask(actionModal.id, description, images);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Calendar className="mr-2 w-6 h-6 text-indigo-600" /> Plan
            Preventivo
          </h1>
          <p className="text-sm text-gray-500">
            Mantenimiento programado para activos.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setFilterMyTasks(false)}
              className={`px-4 py-1.5 text-xs font-bold rounded ${!filterMyTasks ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterMyTasks(true)}
              className={`px-4 py-1.5 text-xs font-bold rounded ${filterMyTasks ? "bg-white shadow-sm text-indigo-700" : "text-gray-500"}`}
            >
              Mis Mantenimientos
            </button>
          </div>
          {canSchedulePreventive && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center shadow-sm font-bold text-xs uppercase hover:bg-indigo-700"
            >
              <Plus size={16} className="mr-1" /> Programar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-20 text-center animate-pulse text-gray-500 font-bold">
            Cargando preventivos...
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-lg border border-dashed border-gray-300 text-gray-400">
            No hay mantenimientos programados.
          </div>
        ) : (
          displayedTasks.map((task) => {
            const isMyTask = task.assignedTo?._id === user?.id;

            return (
              <div
                key={task._id}
                className="bg-white rounded-lg border-l-4 border-indigo-500 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase">
                        MANTENIMIENTO
                      </span>
                      <h3 className="font-bold text-gray-800">
                        {task.machine?.internalTag || "S/T"} -{" "}
                        {task.machine?.catalogRef?.name}
                      </h3>
                    </div>
                    <p className="text-sm font-bold text-gray-600 mt-1">
                      {task.taskName}
                    </p>
                    <div className="flex flex-wrap items-center mt-2 text-[10px] text-gray-500 gap-3">
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        VENCE: {new Date(task.nextDate).toLocaleDateString()}
                      </span>
                      <span className="font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {task.status}
                      </span>
                      {task.assignedTo ? (
                        <span className="flex items-center font-bold text-emerald-600">
                          <UserCheck size={10} className="mr-1" />{" "}
                          {task.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold flex items-center">
                          Sin asignar
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  {task.status === "Programado" && canAssignPreventive && (
                    <button
                      onClick={() => setTaskToAssign(task._id)}
                      className="px-3 py-2 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 uppercase flex items-center shadow-sm"
                    >
                      <UserCheck className="w-3 h-3 mr-1" /> Asignar
                    </button>
                  )}

                  {isMyTask && (
                    <>
                      {task.status === "Asignado" && (
                        <button
                          onClick={() => updateStatus(task._id, "En Proceso")}
                          className="px-3 py-2 bg-orange-600 text-white text-[10px] font-bold rounded hover:bg-orange-700 uppercase flex items-center shadow-sm"
                        >
                          <Wrench className="w-3 h-3 mr-1" /> Iniciar
                          Mantenimiento
                        </button>
                      )}

                      {task.status === "En Proceso" && (
                        <>
                          <button
                            onClick={() => setTaskForSparePart(task)}
                            className="px-3 py-2 bg-amber-500 text-white text-[10px] font-bold rounded hover:bg-amber-600 uppercase flex items-center shadow-sm"
                          >
                            <PackageSearch className="w-3 h-3 mr-1" /> Repuestos
                          </button>
                          <button
                            onClick={() => setActionModal({ id: task._id })}
                            className="px-3 py-2 bg-green-600 text-white text-[10px] font-bold rounded hover:bg-green-700 uppercase flex items-center"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Finalizar
                          </button>
                          <button
                            onClick={() => releaseTask(task._id)}
                            className="px-3 py-2 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700 uppercase flex items-center"
                          >
                            <X className="w-3 h-3 mr-1" /> Abandonar
                          </button>
                        </>
                      )}

                      {task.status === "En Espera de Repuesto" && (
                        <>
                          <button
                            onClick={() => setTaskForSparePart(task)}
                            className="px-3 py-2 bg-amber-500 text-white text-[10px] font-bold rounded hover:bg-amber-600 uppercase flex items-center shadow-sm"
                          >
                            <PackageSearch className="w-3 h-3 mr-1" /> +
                            Repuestos
                          </button>
                          <button
                            onClick={() => updateStatus(task._id, "En Proceso")}
                            className="px-3 py-2 bg-orange-600 text-white text-[10px] font-bold rounded hover:bg-orange-700 uppercase flex items-center shadow-sm"
                          >
                            <Wrench className="w-3 h-3 mr-1" /> Retomar
                            Preventivo
                          </button>
                        </>
                      )}
                    </>
                  )}
                  {task.status === "Realizado" && (
                    <CheckCircle2 className="text-green-500 w-6 h-6 ml-2" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddPreventiveModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
      />
      <AssignPreventiveModal
        isOpen={!!taskToAssign}
        onClose={() => setTaskToAssign(null)}
        taskId={taskToAssign}
        onAssign={assignTask}
      />
      {taskForSparePart && (
        <RequestSparePartModal
          isOpen={true}
          onClose={() => setTaskForSparePart(null)}
          orderId={taskForSparePart._id}
          orderType="PREVENTIVE"
          machineId={taskForSparePart.machine._id}
          onSuccess={refetch}
        />
      )}
      <TaskActionModal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title="Finalizar Mantenimiento Preventivo"
        placeholder="Trabajo realizado y observaciones..."
        submitText="Cerrar Mantenimiento"
        onSubmit={handleFinishSubmit}
      />
    </div>
  );
};

export default PreventivePage;
