import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  Building2,
  User,
  Mail,
  Lock,
  Loader2,
  CheckCircle,
} from "lucide-react";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    adminName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Este endpoint debe crear la Company y el primer User (Admin)
      await api.post("/auth/register-company", formData);
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      alert("Error al registrar la empresa. Intenta con otro correo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            ¡Empresa Registrada!
          </h2>
          <p className="text-gray-500 mt-2">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-[#7A7A7A] text-white py-2 px-4 rounded inline-block font-bold text-xs tracking-widest mb-4">
            NUEVA CUENTA CMMS
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Registrar Empresa
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Nombre de la Empresa
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Ej: Industrias Metalúrgicas S.A."
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Nombre del Administrador
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="Tu nombre"
                  onChange={(e) =>
                    setFormData({ ...formData, adminName: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Email Corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="admin@empresa.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="••••••••"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 rounded text-xs font-bold text-white bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 transition-all uppercase tracking-widest mt-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "CREAR CUENTA"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6 uppercase font-semibold">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
