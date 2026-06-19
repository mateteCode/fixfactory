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
  Check,
  X,
} from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";

const PurchaseManagementPage = () => {
  const { requests, isLoading, fetchRequests, updateRequestStatus } =
    useSparePartRequests();

  const { canManagePurchases } = usePermissions();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const columns = [
    {
      header: "Repuesto",
      accessor: (req: any) => {
        // Accedemos al Nivel 1 (Catálogo) de forma segura
        const catalog = req.sparePart?.catalogRef;
        if (!catalog)
          return <span className="text-gray-400 italic">No indexado</span>;

        return (
          <div className="flex flex-col">
            <span className="font-bold text-gray-800">
              {catalog.name || "S/N"}
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5">
              {catalog.brand || "S/M"} — PN: {catalog.partNumber || "S/N"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Máquina Afectada",
      accessor: (req: any) => {
        // Accedemos a la instancia de la máquina y luego a su catálogo
        const machine = req.issue?.machine || req.preventive?.machine;
        const catalog = machine?.catalogRef;
        if (!machine)
          return (
            <span className="text-gray-400 italic">
              Universal / Stock general
            </span>
          );

        return (
          <div className="flex flex-col">
            <span className="font-bold text-gray-700">
              {machine.internalTag || "Activo Físico"}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              {catalog?.brand} {catalog?.name || "Modelo de equipo"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Solicitado por",
      accessor: (req: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-700">
            {req.requestedBy?.name || "Desconocido"}
          </span>
          <span className="text-[10px] text-gray-400">
            {req.requestedBy?.email}
          </span>
        </div>
      ),
    },
    {
      header: "Cant.",
      accessor: (req: any) => (
        <span className="font-mono bg-gray-100 border px-2 py-0.5 rounded font-bold text-gray-700 text-xs">
          x{req.quantity}
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: (req: any) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
            req.status === "Solicitado"
              ? "bg-yellow-100 text-yellow-700"
              : req.status === "En Stock"
                ? "bg-indigo-100 text-indigo-700"
                : req.status === "Aceptado"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
          }`}
        >
          {req.status}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessor: (req: any) => (
        <div className="flex items-center space-x-2">
          {req.status === "Sin Stock" && canManagePurchases && (
            <button
              onClick={() => updateRequestStatus(req._id, "Comprado")}
              className="p-1.5 bg-green-50 text-green-600 rounded border border-green-200 hover:bg-green-100 transition-colors shadow-sm"
              title="Aprobar Compra"
            >
              <PackageCheck size={16} />
            </button>
          )}
          {["Solicitado", "En Stock"].includes(req.status) &&
            canManagePurchases && (
              <button
                onClick={() => updateRequestStatus(req._id, "Aceptado")}
                className="p-1.5 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm"
                title="Entregar a Técnico"
              >
                <CheckCircle size={16} />
              </button>
            )}
          {["Solicitado", "En Stock"].includes(req.status) &&
            canManagePurchases && (
              <button
                onClick={() => updateRequestStatus(req._id, "Rechazado")}
                className="p-1.5 bg-red-50 text-red-500 rounded border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
                title="Rechazar Pedido"
              >
                <Ban size={16} />
              </button>
            )}
          {/* SI ESTÁ COMPRADO: Botón para indicar que ya llegó físicamente (En Stock) */}
          {req.status === "Comprado" && canManagePurchases && (
            <button
              onClick={() => updateRequestStatus(req._id, "En Stock")}
              className="p-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 shadow-sm transition-colors"
              title="Marcar como Recibido (En Stock)"
            >
              <PackageCheck size={16} />
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
          <p className="text-sm text-gray-500 mt-1">
            Pedidos de repuestos pendientes de procesar
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-20 text-center flex flex-col items-center text-gray-400">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="font-semibold animate-pulse">
              Cargando solicitudes...
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center text-gray-400">
            <Clock className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-semibold">
              No hay pedidos pendientes de revisión.
            </p>
            <p className="text-xs mt-1">
              Todas las órdenes han sido procesadas.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={requests} />
        )}
      </div>
    </div>
  );
};

export default PurchaseManagementPage;
/*
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
          <p className="font-bold text-gray-800">{req.sparePart?.modelName}</p>
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
*/
