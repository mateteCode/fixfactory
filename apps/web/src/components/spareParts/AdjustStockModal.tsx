import React, { useState } from "react";
import { X, Loader2, ArrowLeftRight } from "lucide-react";
import api from "../../api/axios";
import type { SparePart } from "../../hooks/useSpareParts";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sparePart: SparePart | null;
}

const AdjustStockModal = ({ isOpen, onClose, onSuccess, sparePart }: Props) => {
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !sparePart) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post(`/spare-parts/catalog/${sparePart._id}/stock`, {
        quantity,
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert("Error al ajustar el stock.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-[#F5F5F5] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-gray-800 font-bold flex items-center text-sm uppercase tracking-wider">
            <ArrowLeftRight className="w-4 h-4 mr-2 text-gray-600" />
            Ajuste Manual
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center mb-4">
            <p className="text-sm font-bold text-gray-800">
              {sparePart.brand} - {sparePart.model}
            </p>
            <p className="text-xs text-gray-500">
              Stock actual:{" "}
              <span className="font-bold text-gray-800">
                {sparePart.stockQuantity}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 text-center">
              Cantidad a sumar o restar (Ej: -2 o 5)
            </label>
            <input
              type="number"
              required
              value={quantity || "0"}
              className="w-full px-3 py-3 border border-gray-300 rounded text-center text-lg font-bold outline-none focus:border-gray-500"
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || quantity === 0}
            className="w-full py-3 mt-2 bg-gray-700 text-white rounded text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center uppercase tracking-widest transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "CONFIRMAR AJUSTE"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;
