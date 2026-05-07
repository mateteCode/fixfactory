import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import { useAuthStore } from "./store/useAuthStore";
import RegisterPage from "./pages/RegisterPage";
import MachinesPage from "./pages/MachinesPage";
import MachineDetailPage from "./pages/MachineDetailPage";

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
          <Route
            path="/dashboard"
            element={
              <div className="p-4">
                <h1>Dashboard</h1>
              </div>
            }
          />
          {/*
            <Route
              path="/maquinas"
              element={
                <div className="p-4">
                  <h1>Máquinas</h1>
                </div>
              }
            />
          */}
          <Route path="/maquinas" element={<MachinesPage />} />
          <Route path="/maquinas/:id" element={<MachineDetailPage />} />
          <Route
            path="/ordenes"
            element={
              <div className="p-4">
                <h1>Órdenes de Trabajo</h1>
              </div>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
