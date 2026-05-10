import React, { useState } from "react";
import { X, Loader2, Wrench } from "lucide-react";
import { useSpareParts } from "../../hooks/useSpareParts";
import { useSparePartRequests } from "../../hooks/useSparePartRequests";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string;
  machineId: string; // Para filtrar compatibilidad
  onSuccess: () => void;
}

const RequestSparePartModal = ({
  isOpen,
  onClose,
  incidentId,
  machineId,
  onSuccess,
}: Props) => {
  const { spareParts, isLoading: loadingParts } = useSpareParts();
  const { createRequest, isLoading: isSubmitting } = useSparePartRequests();

  const [selectedPart, setSelectedPart] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  // Filtramos: repuestos universales o compatibles con esta máquina en particular
  const compatibleParts = spareParts.filter(
    (part) =>
      part.compatibleMachines.length === 0 ||
      part.compatibleMachines.some((m) => m._id === machineId),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return alert("Seleccioná un repuesto");

    try {
      await createRequest({
        issue: incidentId,
        sparePart: selectedPart,
        quantity,
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert("Error al procesar la solicitud de repuesto.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-[#F5F5F5] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-gray-800 font-bold flex items-center text-sm uppercase tracking-wider">
            <Wrench className="w-4 h-4 mr-2 text-gray-600" />
            Solicitar Repuesto
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loadingParts ? (
            <div className="text-center py-4 text-xs text-gray-500 animate-pulse">
              Cargando catálogo...
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Repuesto Necesario
                </label>
                <select
                  required
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
                >
                  <option value="" disabled>
                    -- Seleccioná una pieza --
                  </option>
                  {compatibleParts.map((part) => (
                    <option key={part._id} value={part._id}>
                      {part.model} - {part.brand} (Stock: {part.stockQuantity})
                    </option>
                  ))}
                </select>
                {compatibleParts.length === 0 && (
                  <p className="text-xs text-red-500 mt-1 mt-1">
                    No hay repuestos compatibles en el catálogo.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
                />
              </div>
            </>
          )}

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
              disabled={isSubmitting || compatibleParts.length === 0}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center uppercase tracking-widest transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "PEDIR PIEZA"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestSparePartModal;
