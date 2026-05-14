import { useState } from "react";
import { useSpareParts, type SparePart } from "../hooks/useSpareParts";
import { DataTable } from "../components/common/DataTable";
import { Package, Plus, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import AddSparePartModal from "../components/spareParts/AddSparePartModal";
import AdjustStockModal from "../components/spareParts/AdjustStockModal";

const SparePartsPage = () => {
  const { spareParts, isLoading, refetch } = useSpareParts();
  const user = useAuthStore((state) => state.user);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPartForStock, setSelectedPartForStock] =
    useState<SparePart | null>(null);

  // Solo ADMIN, MANTENIMIENTO o COMPRAS deberían poder agregar piezas al catálogo
  const canManageCatalog = ["ADMIN", "MANTENIMIENTO", "COMPRAS"].includes(
    user?.role || "",
  );

  const columns = [
    { header: "Modelo", accessor: "model" as keyof SparePart },
    { header: "Marca", accessor: "brand" as keyof SparePart },
    {
      header: "Stock",
      accessor: (item: SparePart) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            item.stockQuantity === 0
              ? "bg-red-100 text-red-700"
              : item.stockQuantity <= 5
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
          }`}
        >
          {item.stockQuantity} unid.
        </span>
      ),
    },
    {
      header: "Precio",
      accessor: (item: SparePart) => `$${item.price.toFixed(2)}`,
    },
    {
      header: "Compatibilidad",
      accessor: (item: SparePart) => (
        <span className="text-xs text-gray-500">
          {item.compatibleMachines.length > 0
            ? `${item.compatibleMachines.length} máquina(s)`
            : "Universal"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Package className="mr-2 w-6 h-6 text-gray-600" />
            Catálogo de Repuestos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de inventario y stock de piezas
          </p>
        </div>

        {canManageCatalog && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded text-xs font-bold hover:bg-gray-800 transition-all shadow-md"
          >
            <Plus size={16} />
            <span>NUEVO REPUESTO</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-20 text-center text-gray-500 font-semibold animate-pulse">
            Cargando inventario...
          </div>
        ) : spareParts.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center text-gray-400">
            <AlertCircle className="w-12 h-12 mb-3 text-gray-300" />
            <p>No hay repuestos registrados en el catálogo.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={spareParts}
            onRowClick={(item) =>
              canManageCatalog && setSelectedPartForStock(item)
            }
          />
        )}
      </div>

      <AddSparePartModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refetch}
      />

      <AdjustStockModal
        isOpen={selectedPartForStock !== null}
        onClose={() => setSelectedPartForStock(null)}
        onSuccess={refetch}
        sparePart={selectedPartForStock}
      />
    </div>
  );
};

export default SparePartsPage;
