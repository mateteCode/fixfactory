// src/components/layout/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* 1. Barra Lateral */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 2. Barra Superior (Header) */}
        <Header />

        {/* 3. Contenido de la página (Dashboard, Máquinas, etc.) */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
