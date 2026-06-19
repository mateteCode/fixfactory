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
import ClientsPage from "./pages/ClientsPage";
import HistoryPage from "./pages/HistoryPage";
import PreventivePage from "./pages/PreventivePage";
import EmployeePage from "./pages/EmployeePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SparePartDetailPage from "./pages/SparePartDetailPage";
import { usePermissions } from "./hooks/usePermissions";
import type { JSX } from "react";

const RoleGuard = ({
  isAllowed,
  children,
}: {
  isAllowed: boolean;
  children: JSX.Element;
}) => {
  const { defaultRoute } = usePermissions();
  return isAllowed ? children : <Navigate to={defaultRoute} replace />;
};

function App() {
  const { isAuthenticated } = useAuthStore();
  const p = usePermissions();

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Path Raíz: Redirección inteligente */}
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated ? p.defaultRoute : "/login"}
              replace
            />
          }
        />
        {/* Si ya está logueado y entra a /login, lo mandamos al dashboard */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={p.defaultRoute} replace />
            )
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? (
              <RegisterPage />
            ) : (
              <Navigate to={p.defaultRoute} replace />
            )
          }
        />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Rutas Privadas. Si no está logueado, cualquier ruta privada lo manda al login */}
        <Route
          element={
            isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
          }
        >
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <RoleGuard isAllowed={p.canViewDashboard}>
                <Dashboard />
              </RoleGuard>
            }
          />

          {/* Clientes (Lo dejamos solo para ADMIN ya que dijiste de sacarlo) */}
          <Route
            path="/clientes"
            element={
              <RoleGuard isAllowed={p.isAdmin}>
                <ClientsPage />
              </RoleGuard>
            }
          />

          {/* Gestión de Máquinas */}
          <Route
            path="/maquinas"
            element={
              <RoleGuard isAllowed={p.canViewMachines}>
                <MachinesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/maquinas/:id"
            element={
              <RoleGuard isAllowed={p.canViewMachines}>
                <MachineDetailPage />
              </RoleGuard>
            }
          />

          {/* Historial */}
          <Route
            path="/historial"
            element={
              <RoleGuard isAllowed={p.canViewHistory}>
                <HistoryPage />
              </RoleGuard>
            }
          />

          {/* Gestión de Incidencias / Órdenes */}
          <Route
            path="/ordenes"
            element={
              <RoleGuard isAllowed={p.canViewOrders}>
                <IncidentsPage />
              </RoleGuard>
            }
          />

          {/* Preventivo */}
          <Route
            path="/preventivo"
            element={
              <RoleGuard isAllowed={p.canViewPreventive}>
                <PreventivePage />
              </RoleGuard>
            }
          />

          {/* Repuestos */}
          <Route
            path="/repuestos"
            element={
              <RoleGuard isAllowed={p.canViewSpareParts}>
                <SparePartsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/repuestos/:id"
            element={
              <RoleGuard isAllowed={p.canViewSpareParts}>
                <SparePartDetailPage />
              </RoleGuard>
            }
          />

          {/* Gestión de Compras */}
          <Route
            path="/compras"
            element={
              <RoleGuard isAllowed={p.canViewPurchases}>
                <PurchaseManagementPage />
              </RoleGuard>
            }
          />

          {/* Personal */}
          <Route
            path="/personal"
            element={
              <RoleGuard isAllowed={p.canViewStaff}>
                <EmployeePage />
              </RoleGuard>
            }
          />
        </Route>

        {/* Catch-all: Redirección a la ruta default del usuario (Reemplaza al antiguo /dashboard) */}
        <Route path="*" element={<Navigate to={p.defaultRoute} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
