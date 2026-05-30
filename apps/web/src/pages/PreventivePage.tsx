import { useState } from "react";
import { Plus, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
// Importamos el hook y la interfaz (tipo) desde la carpeta correcta
import {
  usePreventive,
  type PreventiveMaintenance,
} from "../hooks/usePreventive";
import { DataTable } from "../components/common/DataTable";
import { AddPreventiveModal } from "../components/preventive/AddPreventiveModal";

const PreventivePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Llamamos al hook para traer los datos
  const { data, isLoading, error } = usePreventive();
  console.log(data);

  // 2. Manejo de estado mientras carga
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <p className="text-gray-600 font-semibold animate-pulse">
          Cargando mantenimientos programados...
        </p>
      </div>
    );
  }

  // 3. Manejo de errores
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500 font-semibold bg-red-50 p-4 rounded">
          Hubo un error al cargar los datos del servidor.
        </p>
      </div>
    );
  }

  // 4. Definimos las columnas adaptadas a tu componente DataTable.tsx
  const columns = [
    {
      header: "Máquina",
      accessor: (row: PreventiveMaintenance) => {
        const machine = row.machine;
        const catalog = machine?.catalogRef;

        if (!machine)
          return <span className="text-gray-400 italic">Desconocida</span>;

        return (
          <div className="flex flex-col gap-0.5">
            {/* Fila 1: Identificación Física */}
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-gray-900 text-sm tracking-tight">
                {machine.internalTag || "S/ETIQUETA"}
              </span>
              <span className="font-bold text-gray-600 text-xs">
                {catalog?.name || "Equipo sin nombre"}
              </span>
            </div>

            {/* Fila 2: Datos Técnicos */}
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                {catalog?.brand || "MARCA N/A"}
              </span>
              <span>•</span>
              <span>{catalog?.modelCode || "MOD. N/A"}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Tipo de Tarea",
      // Pasamos el string directo para claves simples
      accessor: "taskName" as keyof PreventiveMaintenance,
    },
    {
      header: "Frecuencia (Días)",
      accessor: "frequencyDays" as keyof PreventiveMaintenance,
    },
    {
      header: "Próxima Fecha",
      // Función para formatear la fecha a un string legible
      accessor: (row: PreventiveMaintenance) =>
        new Date(row.nextDate).toLocaleDateString(),
    },
    {
      header: "Estado",
      // Renderizado personalizado pasado a través del accessor
      accessor: (row: PreventiveMaintenance) => {
        const status = row.status;
        const colors = {
          Programado: "bg-blue-100 text-blue-800",
          Vencido: "bg-red-100 text-red-800",
          Realizado: "bg-green-100 text-green-800",
        };
        const colorClass =
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClass}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      {/* Cabecera de la página */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Mantenimiento Preventivo
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona las tareas programadas para los equipos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#7A7A7A] hover:bg-gray-800 text-white px-4 py-2 rounded-md flex items-center transition-colors shadow-sm font-semibold text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Programar Tarea
        </button>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200">
        <DataTable data={data || []} columns={columns} />
      </div>

      <AddPreventiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PreventivePage;
