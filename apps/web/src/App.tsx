import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import { useAuthStore } from "./store/useAuthStore";
import RegisterPage from "./pages/RegisterPage";
import MachinesPage from "./pages/MachinesPage";
import MachineDetailPage from "./pages/MachineDetailPage";
import IncidentsPage from "./pages/IncidentsPage";
import Dashboard from "./pages/Dashboard";
import SparePartsPage from "./pages/SparePartsPage";
import PurchaseManagementPage from "./pages/PurchaseManagementPage";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Path Raíz: Redirección inteligente */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
        {/* Si ya está logueado y entra a /login, lo mandamos al dashboard */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? (
              <RegisterPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Rutas Privadas. Si no está logueado, cualquier ruta privada lo manda al login */}
        <Route
          element={
            isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Gestión de Máquinas */}
          <Route path="/maquinas" element={<MachinesPage />} />
          <Route path="/maquinas/:id" element={<MachineDetailPage />} />
          {/* Gestión de Incidencias / Órdenes */}
          <Route path="/ordenes" element={<IncidentsPage />} />
          {/* Repuestos */}
          <Route path="/repuestos" element={<SparePartsPage />} />

          {/* Gestión de Compras */}
          <Route path="/compras" element={<PurchaseManagementPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
