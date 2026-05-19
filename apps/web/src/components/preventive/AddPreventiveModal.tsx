import { useState } from "react";
import { X } from "lucide-react";
import { useAddPreventive } from "../../hooks/usePreventive";
import { useMachines } from "../../hooks/useMachines"; 

interface AddPreventiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPreventiveModal = ({ isOpen, onClose }: AddPreventiveModalProps) => {
  const [machineId, setMachineId] = useState("");
  const [taskName, setTaskName] = useState("");
  const [frequencyDays, setFrequencyDays] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [description, setDescription] = useState("");

  const { machines } = useMachines();
  const addPreventive = useAddPreventive();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPreventive.mutate(
      {
        machine: machineId,
        taskName,
        frequencyDays: Number(frequencyDays),
        nextDate,
        description,
      },
      {
        onSuccess: () => {
          // Si sale bien, cerramos el modal y limpiamos el formulario
          onClose();
          setMachineId("");
          setTaskName("");
          setFrequencyDays("");
          setNextDate("");
          setDescription("");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Programar Mantenimiento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Máquina</label>
            <select
              required
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="" disabled>Selecciona una máquina...</option>
              {machines?.map((m: any) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Tarea</label>
            <input
              required
              type="text"
              placeholder="Ej: Cambio de aceite y filtros"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia (Días)</label>
              <input
                required
                type="number"
                min="1"
                placeholder="Ej: 30"
                value={frequencyDays}
                onChange={(e) => setFrequencyDays(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Fecha</label>
              <input
                required
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
            <textarea
              rows={3}
              placeholder="Detalles adicionales sobre la tarea..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={addPreventive.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-[#7A7A7A] hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
            >
              {addPreventive.isPending ? "Guardando..." : "Guardar Tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};