import React, { useState, useEffect } from "react";
import { X, UserCheck, Loader2 } from "lucide-react";
import api from "../../api/axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  onAssign: (taskId: string, technicianId: string) => Promise<void>;
}

export const AssignPreventiveModal = ({
  isOpen,
  onClose,
  taskId,
  onAssign,
}: Props) => {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Cargamos los técnicos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      api
        .get("/users")
        .then((res) => {
          const techs = res.data.filter(
            (u: any) =>
              u.role === "TECNICO" ||
              u.role === "MANTENIMIENTO" ||
              u.role === "ADMIN",
          );
          setTechnicians(techs);
        })
        .catch((err) => console.error("Error cargando técnicos", err));
    }
  }, [isOpen]);

  if (!isOpen || !taskId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) return;

    setIsLoading(true);
    try {
      // Pasamos el ID del mantenimiento y el ID del técnico al hook
      await onAssign(taskId, selectedTech);
      onClose();
      setSelectedTech(""); // Limpiamos para la próxima vez
    } catch (error) {
      alert("Error al asignar la tarea.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center">
            <UserCheck className="w-4 h-4 mr-2 text-indigo-600" />
            Asignar Preventivo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Seleccionar Técnico
            </label>
            <select
              required
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            >
              <option value="" disabled>
                -- Elige un técnico --
              </option>
              {technicians.map((tech) => (
                <option key={tech._id} value={tech._id}>
                  {tech.name} ({tech.role})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedTech}
            className="w-full py-2 bg-indigo-600 text-white rounded text-xs font-bold uppercase hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex justify-center items-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Confirmar Asignación"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
