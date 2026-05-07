import { Search, QrCode, Bell, UserCircle } from "lucide-react";

const Header = () => {
  return (
    <header className="h-16 bg-[#F5F5F5] border-b border-gray-300 flex items-center justify-between px-8 shadow-sm">
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar máquina o incidencia..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>
      <div className="flex items-center space-x-6">
        <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-gray-700 transition-colors">
          <QrCode className="w-4 h-4" />
          <span>ESCANEAR QR</span>
        </button>
        <div className="flex items-center space-x-3 border-l pl-6 border-gray-300">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-700 leading-none">
              Perfil: Supervisor
            </p>
            <p className="text-[10px] text-gray-500">Matías Lorenzo</p>
          </div>
          <UserCircle className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
