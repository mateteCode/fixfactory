// src/components/layout/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#F5F5F5] border-b border-gray-300 flex items-center px-8 shadow-sm">
          <h2 className="text-gray-600 font-semibold">Panel de Control</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet /> {/* Aquí se renderizan las páginas */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
