import React, { useState, useEffect } from "react";
import { X, Loader2, UserCog } from "lucide-react";
import { useEmployees, type Employee } from "../../hooks/useEmployees";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSuccess: () => void;
}

const EditEmployeeModal = ({ isOpen, onClose, employee, onSuccess }: Props) => {
  const { updateEmployee, isSubmitting } = useEmployees();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        role: employee.role,
      });
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmployee(employee._id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-[#F5F5F5] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-gray-800 font-bold flex items-center text-sm uppercase tracking-wider">
            <UserCog className="w-4 h-4 mr-2 text-gray-600" />
            Editar Personal
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={formData.email}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Rol en el Sistema
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-gray-500 bg-white"
            >
              <option value="OPERARIO">Operario</option>
              <option value="TECNICO">Técnico de Mantenimiento</option>
              <option value="MANTENIMIENTO">Jefe de Mantenimiento</option>
              <option value="COMPRAS">Encargado de Compras</option>
              <option value="GERENTE">Gerente</option>
              <option value="ASISTENTE">Asistente Administrativo</option>
              <option value="ADMIN">Administrador General</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded text-xs font-bold uppercase hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center uppercase tracking-widest transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "GUARDAR"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
