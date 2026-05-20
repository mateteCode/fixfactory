import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Lock, Loader2, CheckCircle } from "lucide-react";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword)
      return setError("Las contraseñas no coinciden");
    if (newPassword.length < 6) return setError("Mínimo 6 caracteres");

    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { newPassword });
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al restablecer contraseña",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded shadow border text-green-600">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold">¡Contraseña restablecida!</h2>
          <p className="text-sm mt-2 text-gray-500">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Crear Nueva Contraseña
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border rounded text-sm outline-none"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border rounded text-sm outline-none"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-700 text-white py-3 rounded text-xs font-bold uppercase mt-6 flex justify-center items-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "ACTUALIZAR Y ENTRAR"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ResetPasswordPage;
