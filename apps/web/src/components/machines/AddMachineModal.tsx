import React, { useState } from "react";
import { X, Tablet, Loader2, Calendar, Factory } from "lucide-react";
import api from "../../api/axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMachineModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "",
    location: "",
    status: "Operativa",
    installationDate: "",
    productionLine: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/machines", formData);
      onSuccess(); // Recarga la tabla
      onClose(); // Cierra el modal
    } catch (error) {
      alert("Error al crear la máquina. Verifica si el código ya existe.");
      console.error("Detalles del error 400:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-[#F5F5F5] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-gray-700 font-bold flex items-center text-sm uppercase tracking-wider">
            <Tablet className="w-4 h-4 mr-2 text-[#7A7A7A]" />
            Nueva Máquina
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre y Código */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Nombre del Equipo
              </label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Código
              </label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Tipo
              </label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Fecha Instalación
              </label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 text-gray-400 w-3 h-3" />
                <input
                  required
                  type="date"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm outline-none"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      installationDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                Línea de Producción
              </label>
              <div className="relative">
                <Factory className="absolute left-2 top-2.5 text-gray-400 w-3 h-3" />
                <input
                  required
                  type="text"
                  placeholder="Línea 1"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm outline-none"
                  onChange={(e) =>
                    setFormData({ ...formData, productionLine: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Ubicación Física
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none"
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center uppercase tracking-widest"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMachineModal;
