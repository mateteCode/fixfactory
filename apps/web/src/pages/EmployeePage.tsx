import { useState } from "react";
import { useEmployees, type Employee } from "../hooks/useEmployees";
import { DataTable } from "../components/common/DataTable";
import { BriefcaseBusiness, Plus, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";

const EmployeePage = () => {
  const { employees, isLoading, refetch } = useEmployees();
  const user = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Solo ADMIN o GERENTE pueden crear empleados
  const canManageStaff = ["ADMIN", "GERENTE"].includes(user?.role || "");

  const roleStyles: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
    GERENTE: "bg-blue-100 text-blue-700 border-blue-200",
    COMPRAS: "bg-orange-100 text-orange-700 border-orange-200",
    TECNICO: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const columns = [
    {
      header: "Nombre",
      accessor: (emp: Employee) => (
        <span className="font-bold text-gray-800">{emp.name}</span>
      ),
    },
    { header: "Email", accessor: "email" },
    {
      header: "Rol",
      accessor: (emp: Employee) => (
        <span
          className={`px-2 py-1 rounded text-[10px] font-black uppercase border flex items-center w-max ${roleStyles[emp.role] || roleStyles.TECNICO}`}
        >
          <ShieldCheck className="w-3 h-3 mr-1" />
          {emp.role}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <BriefcaseBusiness className="mr-2 w-6 h-6 text-gray-600" />
            Personal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de usuarios y accesos al sistema
          </p>
        </div>

        {canManageStaff && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded text-xs font-bold hover:bg-gray-800 transition-all shadow-md"
          >
            <Plus size={16} />
            <span>NUEVO EMPLEADO</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-20 text-center text-gray-500 font-semibold animate-pulse">
            Cargando nómina de personal...
          </div>
        ) : (
          <DataTable columns={columns} data={employees} />
        )}
      </div>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default EmployeePage;
