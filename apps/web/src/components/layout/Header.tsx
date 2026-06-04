import { useState, useRef, useEffect } from "react";
import {
  Search,
  QrCode,
  UserCircle,
  LogOut,
  Building2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "../auth/ChangePasswordModal";
import QRScannerModal from "../common/QRScannerModal";
import { NotificationBell } from "./NotificationBell";

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-[#F5F5F5] border-b border-gray-300 flex items-center justify-between px-8 shadow-sm relative z-40">
      {/* Buscador Izquierdo */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar máquina o incidencia..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
        />
      </div>

      {/* Acciones Derecha */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-gray-700 transition-colors shadow-sm"
        >
          <QrCode className="w-4 h-4" />
          <span>ESCANEAR QR</span>
        </button>

        <NotificationBell />

        {/* Perfil de Usuario y Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-3 border-l pl-6 border-gray-300 hover:opacity-80 transition-opacity outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-gray-700 leading-none uppercase tracking-tighter">
                {user?.role || "Rol"}
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                {user?.name || "Usuario"}
              </p>
            </div>
            <div className="bg-gray-200 p-1 rounded-full border border-gray-300">
              <UserCircle className="w-7 h-7 text-gray-600" />
            </div>
          </button>

          {/* Ventana Desplegable (Dropdown) */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-in fade-in zoom-in duration-150">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "matias@empresa.com"}
                </p>
              </div>

              <div className="py-1">
                <div className="px-4 py-2 flex items-center text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 mr-3 text-gray-400" />
                  <span>
                    Rol: <span className="font-bold">{user?.role}</span>
                  </span>
                </div>
                <div className="px-4 py-2 flex items-center text-xs text-gray-600">
                  <Building2 className="w-4 h-4 mr-3 text-gray-400" />
                  <span>
                    Empresa:{" "}
                    <span className="font-bold">
                      {user?.companyName || "Mi Empresa"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-1">
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(true);
                    setIsMenuOpen(false); // Cerramos el dropdown
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 font-bold flex items-center hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <KeyRound className="w-4 h-4 mr-3 text-gray-500" />
                  CAMBIAR CONTRASEÑA
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 font-bold flex items-center hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  CERRAR SESIÓN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </header>
  );
};

export default Header;
