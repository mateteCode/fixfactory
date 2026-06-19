// src/pages/MachinesPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMachines, type Machine } from "../hooks/useMachines";
import { DataTable } from "../components/common/DataTable";
import { Plus, Settings2, Tablet } from "lucide-react";
import AddMachineModal from "../components/machines/AddMachineModal";
import { usePermissions } from "../hooks/usePermissions";

const MachinesPage = () => {
  const navigate = useNavigate();
  const { machines, isLoading, refetch } = useMachines();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { canCreateMachine } = usePermissions();

  const columns = [
    { header: "TAG", accessor: "internalTag" as keyof Machine },
    { header: "Marca", accessor: "brand" as keyof Machine },
    { header: "Modelo", accessor: "modelCode" as keyof Machine },
    { header: "Equipo", accessor: "name" as keyof Machine },
    {
      header: "Estado",
      accessor: (item: Machine) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
            item.status === "Operativa"
              ? "bg-green-100 text-green-700"
              : item.status === "En Falla"
                ? "bg-red-100 text-red-700"
                : item.status === "Mantenimiento"
                  ? "bg-yellow-100 text-yellow-700"
                  : item.status === "Apagada" || item.status === "No Instalada"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gray-100 text-gray-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    { header: "Ubicación", accessor: "location" as keyof Machine },
  ];

  return (
    <div className="space-y-6">
      {/* Cabecera de Página */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Tablet className="mr-2 w-6 h-6 text-gray-600" />
            Gestión de Activos
          </h1>

          <p className="text-sm text-gray-500">
            Listado de maquinaria de la planta
          </p>
        </div>

        {/* Acción para abrir modal */}
        {canCreateMachine && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded text-xs font-bold hover:bg-gray-800 transition-all shadow-md"
          >
            <Plus size={16} />
            <span>NUEVA MÁQUINA</span>
          </button>
        )}
      </div>

      {/* Contenedor de Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-sm">
            Inventario de Equipos
          </h3>
          <Settings2 size={16} className="text-gray-400 cursor-pointer" />
        </div>

        {isLoading ? (
          <div className="p-20 text-center text-gray-500 font-semibold animate-pulse">
            Cargando activos de la empresa...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={machines}
            onRowClick={(m) => navigate(`/maquinas/${m._id}`)}
          />
        )}
        <AddMachineModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refetch} // Llama a refetch para actualizar la tabla
        />
      </div>
    </div>
  );
};

export default MachinesPage;
