import { useState } from "react";
import { useSpareParts, type SparePart } from "../hooks/useSpareParts";
import { DataTable } from "../components/common/DataTable";
import {
  Package,
  Plus,
  AlertCircle,
  Eye,
  Layers,
  DollarSign,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import AddSparePartModal from "../components/spareParts/AddSparePartModal";
import AdjustStockModal from "../components/spareParts/AdjustStockModal";
import { EditPriceModal } from "../components/spareParts/EditPriceModal";
import { usePermissions } from "../hooks/usePermissions";

import { useNavigate } from "react-router-dom";

const SparePartsPage = () => {
  const navigate = useNavigate();
  const { spareParts, isLoading, refetch, updateSparePart } = useSpareParts();

  const user = useAuthStore((state) => state.user);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPartForStock, setSelectedPartForStock] =
    useState<SparePart | null>(null);

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedPartForPrice, setSelectedPartForPrice] = useState<any | null>(
    null,
  );
  const { canManageSparePartsInventory } = usePermissions();

  const canManageCatalog = ["ADMIN", "MANTENIMIENTO", "COMPRAS"].includes(
    user?.role || "",
  );

  // Función exclusiva para abrir el modal de stock sin disparar el click de la fila
  const handleOpenStockModal = (e: React.MouseEvent, part: SparePart) => {
    e.stopPropagation();
    setSelectedPartForStock(part);
  };

  const handleUpdatePrice = async (id: string, price: number) => {
    await updateSparePart(id, { price });
  };

  const columns = [
    { header: "N° Parte", accessor: "partNumber" as keyof SparePart },
    { header: "Marca", accessor: "brand" as keyof SparePart },
    { header: "Repuesto", accessor: "name" as keyof SparePart },
    {
      header: "Stock",
      accessor: (item: SparePart) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            item.stockQuantity === 0
              ? "bg-red-100 text-red-700"
              : item.stockQuantity <= (item.minStock || 5)
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
      header: "Acciones",
      accessor: (item: SparePart) => (
        <div className="flex items-center space-x-2">
          {/* Ir al detalle completo */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/repuestos/${item._id}`);
            }}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Ver expediente completo"
          >
            <Eye size={16} />
          </button>

          {/* Ajustar stock manualmente */}
          {canManageSparePartsInventory && (
            <button
              onClick={(e) => handleOpenStockModal(e, item)}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              title="Ajustar Stock"
            >
              <Layers size={16} />
            </button>
          )}

          {/* Editar Precio */}
          {canManageSparePartsInventory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPartForPrice(item);
                setPriceModalOpen(true);
              }}
              className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
              title="Actualizar Precio"
            >
              <DollarSign size={16} />
            </button>
          )}
        </div>
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
            onRowClick={(item) => navigate(`/repuestos/${item._id}`)}
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

      <EditPriceModal
        isOpen={priceModalOpen}
        onClose={() => {
          setPriceModalOpen(false);
          setSelectedPartForPrice(null);
        }}
        sparePart={selectedPartForPrice}
        onUpdate={handleUpdatePrice}
      />
    </div>
  );
};

export default SparePartsPage;
