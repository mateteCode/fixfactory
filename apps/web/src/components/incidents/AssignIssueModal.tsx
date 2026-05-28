import React, { useState } from "react";
import { X, Loader2, UserCheck } from "lucide-react";
import { useEmployees } from "../../hooks/useEmployees";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  issueId: string | null;
  onAssign: (issueId: string, techId: string) => Promise<void>;
}

const AssignIssueModal = ({ isOpen, onClose, issueId, onAssign }: Props) => {
  const { employees, isLoading } = useEmployees();
  const [selectedTech, setSelectedTech] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !issueId) return null;

  // Filtramos solo el personal calificado para reparar
  const eligibleTechs = employees.filter((emp) =>
    ["TECNICO", "MANTENIMIENTO", "ADMIN"].includes(emp.role),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) return;
    setIsSubmitting(true);
    try {
      await onAssign(issueId, selectedTech);
      onClose();
    } catch (error) {
      alert("Error al asignar tarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-[#F5F5F5] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-gray-800 font-bold flex items-center text-sm uppercase tracking-wider">
            <UserCheck className="w-4 h-4 mr-2 text-gray-600" />
            Asignar Trabajo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isLoading ? (
            <p className="text-xs text-gray-500 animate-pulse text-center py-4">
              Cargando personal...
            </p>
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Seleccionar Técnico
              </label>
              <select
                required
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
              >
                <option value="" disabled>
                  -- Elegir personal --
                </option>
                {eligibleTechs.map((tech) => (
                  <option key={tech._id} value={tech._id}>
                    {tech.name} ({tech.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded text-xs font-bold uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedTech}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "ASIGNAR"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignIssueModal;
