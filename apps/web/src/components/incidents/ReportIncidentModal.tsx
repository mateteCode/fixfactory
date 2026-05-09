import React, { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { useIncidents } from "../../hooks/useIncidents";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  machineName: string;
  onSuccess: () => void;
}

const ReportIncidentModal = ({
  isOpen,
  onClose,
  machineId,
  machineName,
  onSuccess,
}: Props) => {
  const { createIncident } = useIncidents();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    priority: "Media",
    type: "Mecánico",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      //await createIncident({ ...formData, machineId } as any);
      await createIncident({ ...formData, machine: machineId } as any);
      onSuccess();
      onClose();
    } catch (error) {
      console.log(error);
      alert("No se pudo registrar la incidencia.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-gray-200">
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
          <h3 className="text-red-700 font-bold flex items-center text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reportar Falla: {machineName}
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
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Tipo de Falla
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-red-400"
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="Mecánico">Mecánico</option>
              <option value="Eléctrico">Eléctrico</option>
              <option value="Software">Software</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Prioridad
            </label>
            <div className="flex space-x-2">
              {["Baja", "Media", "Alta", "Crítica"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`flex-1 py-2 rounded text-[10px] font-bold uppercase border transition-all ${
                    formData.priority === p
                      ? "bg-gray-700 text-white border-gray-700"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Descripción del Problema
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describa brevemente qué sucede..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-red-400"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center uppercase tracking-widest transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "ENVIAR REPORTE"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIncidentModal;
