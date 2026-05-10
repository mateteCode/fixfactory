// src/pages/PurchaseManagementPage.tsx
import { useEffect } from "react";
import { useSparePartRequests } from "../hooks/useSparePartRequests";
import { DataTable } from "../components/common/DataTable";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  PackageCheck,
  Ban,
} from "lucide-react";

const PurchaseManagementPage = () => {
  const { requests, isLoading, fetchRequests, updateRequestStatus } =
    useSparePartRequests();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const columns = [
    {
      header: "Repuesto",
      accessor: (req: any) => (
        <div>
          <p className="font-bold text-gray-800">{req.sparePart?.model}</p>
          <p className="text-[10px] text-gray-400">{req.sparePart?.brand}</p>
        </div>
      ),
    },
    {
      header: "Máquina",
      accessor: (req: any) => req.issue?.machine?.name || "N/A",
    },
    {
      header: "Solicitado por",
      accessor: (req: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">
            {req.requestedBy?.name || "Desconocido"}
          </span>
          <span className="text-[10px] text-gray-400">
            {req.requestedBy?.email}
          </span>
        </div>
      ),
    },
    { header: "Cant.", accessor: "quantity" },
    {
      header: "Estado",
      accessor: (req: any) => (
        <span
          className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${
            req.status === "Sin Stock"
              ? "bg-red-50 text-red-600 border-red-200"
              : req.status === "Solicitado"
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : req.status === "Comprado"
                  ? "bg-orange-50 text-orange-600 border-orange-200"
                  : req.status === "En Stock"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {req.status}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessor: (req: any) => (
        <div className="flex space-x-1">
          {req.status === "Sin Stock" && (
            <button
              onClick={() => updateRequestStatus(req._id, "Comprado")}
              className="p-1 bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
              title="Marcar como Comprado"
            >
              <ShoppingCart size={14} />
            </button>
          )}
          {req.status === "Comprado" && (
            <button
              onClick={() => updateRequestStatus(req._id, "En Stock")}
              className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
              title="Recibir en Almacén"
            >
              <CheckCircle size={14} />
            </button>
          )}
          {(req.status === "En Stock" || req.status === "Solicitado") && (
            <button
              onClick={() => updateRequestStatus(req._id, "Aceptado")}
              className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              title="Entregar a Técnico"
            >
              <PackageCheck size={14} />
            </button>
          )}
          {["Solicitado", "Sin Stock"].includes(req.status) && (
            <button
              onClick={() => updateRequestStatus(req._id, "Rechazado")}
              className="p-1 bg-red-100 text-red-400 rounded hover:bg-red-200"
              title="Rechazar Pedido"
            >
              <Ban size={14} />
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
            <ShoppingCart className="mr-2 w-6 h-6 text-gray-600" />
            Gestión de Compras
          </h1>
          <p className="text-sm text-gray-500">
            Pedidos de repuestos pendientes de procesar
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-20 text-center animate-pulse text-gray-500">
            Cargando pedidos...
          </div>
        ) : (
          <DataTable columns={columns} data={requests} />
        )}
      </div>
    </div>
  );
};

export default PurchaseManagementPage;
