import React, { useState } from "react";
import { X, Mail, Loader2 } from "lucide-react";
import api from "../../api/axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose }: Props) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (error) {
      setMessage("Error al procesar la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <h3 className="text-gray-800 font-bold text-lg mb-2">
          Recuperar Acceso
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Ingresá tu correo y te enviaremos un enlace para restablecer tu
          contraseña.
        </p>

        {message ? (
          <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm font-medium text-center">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="email"
                required
                placeholder="tu@email.com"
                className="w-full pl-10 pr-4 py-2 border rounded text-sm outline-none"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-700 text-white py-2 rounded text-xs font-bold uppercase tracking-widest flex justify-center items-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "ENVIAR ENLACE"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default ForgotPasswordModal;
