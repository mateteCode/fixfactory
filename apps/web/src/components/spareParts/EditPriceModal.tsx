import React, { useState, useEffect } from "react";
import { X, DollarSign, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sparePart: any | null;
  onUpdate: (id: string, newPrice: number) => Promise<void>;
}

export const EditPriceModal = ({
  isOpen,
  onClose,
  sparePart,
  onUpdate,
}: Props) => {
  const [price, setPrice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Cargamos el precio actual cuando se abre el modal
  useEffect(() => {
    if (sparePart) {
      setPrice(sparePart.price?.toString() || "0");
    }
  }, [sparePart]);

  if (!isOpen || !sparePart) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdate(sparePart._id, Number(price));
      onClose();
    } catch (error) {
      alert("Error al guardar el precio");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
            Editar Precio
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
            <p className="text-sm text-gray-600 font-medium mb-1">
              {sparePart.name}
            </p>
            <p className="text-xs text-gray-400 font-mono mb-4">
              PN: {sparePart.partNumber}
            </p>

            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Costo Unitario (USD / Moneda Local)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">
                $
              </span>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold uppercase transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 text-white bg-green-600 hover:bg-green-700 rounded text-xs font-bold uppercase transition-colors disabled:bg-green-400 flex justify-center items-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Guardar Valor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
