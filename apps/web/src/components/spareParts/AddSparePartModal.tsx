import React, { useState } from "react";
import { X, Loader2, PackagePlus } from "lucide-react";
import api from "../../api/axios";
import { useMachines } from "../../hooks/useMachines";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSparePartModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const { machines } = useMachines(); // Traemos las máquinas para la compatibilidad
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    model: "",
    brand: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    compatibleMachines: [] as string[],
  });

  if (!isOpen) return null;

  const handleMachineToggle = (machineId: string) => {
    setFormData((prev) => {
      const isSelected = prev.compatibleMachines.includes(machineId);
      return {
        ...prev,
        compatibleMachines: isSelected
          ? prev.compatibleMachines.filter((id) => id !== machineId)
          : [...prev.compatibleMachines, machineId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/spare-parts", formData);
      onSuccess();
      onClose();
    } catch (error) {
      alert("Error al crear el repuesto. Verificá los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-[#F5F5F5] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-gray-800 font-bold flex items-center text-sm uppercase tracking-wider">
            <PackagePlus className="w-4 h-4 mr-2 text-gray-600" />
            Alta de Repuesto
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Modelo / N° Parte
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Marca
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Descripción
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Stock Inicial
              </label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockQuantity: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Costo Estimado ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">
              Máquinas Compatibles (Opcional)
            </label>
            <div className="border border-gray-200 rounded p-3 max-h-32 overflow-y-auto space-y-2 bg-gray-50">
              {machines.map((m) => (
                <label
                  key={m._id}
                  className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.compatibleMachines.includes(m._id)}
                    onChange={() => handleMachineToggle(m._id)}
                    className="rounded border-gray-300 text-gray-700 focus:ring-gray-500"
                  />
                  <span>
                    {m.name}{" "}
                    <span className="text-[10px] text-gray-400 font-mono ml-1">
                      [{m.code}]
                    </span>
                  </span>
                </label>
              ))}
              {machines.length === 0 && (
                <span className="text-xs text-gray-400 italic">
                  No hay máquinas registradas
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded text-xs font-bold uppercase hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center uppercase tracking-widest transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Guardar Repuesto"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSparePartModal;
