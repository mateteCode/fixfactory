import React, { useState } from "react";
import { X, Lock, Loader2 } from "lucide-react";
import api from "../../api/axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: Props) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      return setError("Las contraseñas nuevas no coinciden.");
    }
    if (newPassword.length < 6) {
      return setError("La nueva contraseña debe tener al menos 6 caracteres.");
    }

    setIsLoading(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      alert("Contraseña actualizada exitosamente.");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cambiar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-[#F5F5F5] px-6 py-4 border-b border-gray-300 flex justify-between items-center">
          <h3 className="text-gray-800 font-bold flex items-center text-sm uppercase tracking-wider">
            <Lock className="w-4 h-4 mr-2 text-gray-600" />
            Cambiar Contraseña
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Contraseña Actual
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none"
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none"
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded text-xs font-bold uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded text-xs font-bold flex items-center justify-center uppercase"
            >
              {isLoading ? (
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

export default ChangePasswordModal;
