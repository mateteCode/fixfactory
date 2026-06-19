import { useState } from "react";
import { useEmployees, type Employee } from "../hooks/useEmployees";
import { DataTable } from "../components/common/DataTable";
import {
  BriefcaseBusiness,
  Plus,
  ShieldCheck,
  Users,
  Edit,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import EditEmployeeModal from "../components/employees/EditEmployeeModal";

const EmployeePage = () => {
  const {
    employees,
    isLoading,
    deactivateEmployee,
    activateEmployee,
    refetch,
  } = useEmployees();
  const user = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  console.log(employees);

  // Solo ADMIN, ASISTENTE o GERENTE pueden crear empleados
  const canManageStaff = ["ADMIN", "GERENTE", "ASISTENTE"].includes(
    user?.role || "",
  );

  const handleDeactivate = async (id: string, name: string) => {
    if (
      window.confirm(
        `¿Estás seguro que deseas desactivar a ${name}? Ya no podrá iniciar sesión.`,
      )
    ) {
      try {
        await deactivateEmployee(id);
        alert("Usuario desactivado correctamente");
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleAactivate = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro que deseas activar a ${name}?`)) {
      try {
        await activateEmployee(id);
        alert("Usuario activado correctamente");
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const roleStyles: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
    GERENTE: "bg-blue-100 text-blue-700 border-blue-200",
    COMPRAS: "bg-orange-100 text-orange-700 border-orange-200",
    TECNICO: "bg-teal-100 text-teal-700 border-teal-200",
    MANTENIMIENTO: "bg-amber-100 text-amber-700 border-amber-200",
    ASISTENTE: "bg-pink-100 text-pink-700 border-pink-200",
    OPERARIO: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const columns = [
    {
      header: "Nombre",
      accessor: (emp: Employee) => (
        <div className="flex items-center space-x-2">
          {/* Si está inactivo, bajamos la opacidad del texto */}
          <span
            className={`font-bold ${emp.active ? "text-gray-800" : "text-gray-400"}`}
          >
            {emp.name}
          </span>
          {/* Etiqueta visual para usuarios inactivos */}
          {!emp.active && (
            <span className="bg-red-100 text-red-600 text-[9px] px-1.5 py-0.5 rounded border border-red-200 font-bold uppercase">
              Desactivado
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Email",
      accessor: (emp: Employee) => (
        <span className={emp.active ? "text-gray-600" : "text-gray-400"}>
          {emp.email}
        </span>
      ),
    },
    {
      header: "Rol",
      accessor: (emp: Employee) => (
        <span
          // Agregamos opacidad si está inactivo (opacity-60)
          className={`px-2 py-1 rounded text-[10px] font-black uppercase border flex items-center w-max 
          ${roleStyles[emp.role] || roleStyles.TECNICO} 
          ${!emp.active ? "opacity-60" : ""}`}
        >
          <ShieldCheck className="w-3 h-3 mr-1" />
          {emp.role}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessor: (emp: Employee) => (
        <div className="flex space-x-2">
          {canManageStaff && (
            <>
              <button
                onClick={() => setEditingEmployee(emp)}
                className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                title="Editar Empleado"
              >
                <Edit size={14} />
              </button>
              {/* Evitar que el usuario se desactive a sí mismo */}
              {user?.id !== emp._id && emp?.active && (
                <button
                  onClick={() => handleDeactivate(emp._id, emp.name)}
                  className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  title="Desactivar Empleado"
                >
                  <UserMinus size={14} />
                </button>
              )}
              {!emp?.active && (
                <button
                  onClick={() => handleAactivate(emp._id, emp.name)}
                  className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                  title="Activar Empleado"
                >
                  <UserPlus size={14} />
                </button>
              )}
            </>
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

      <EditEmployeeModal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        employee={editingEmployee}
        onSuccess={refetch}
      />
    </div>
  );
};

export default EmployeePage;
