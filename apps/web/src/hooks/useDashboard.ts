import { useState, useEffect } from "react";
import api from "../api/axios";

// Definimos la estructura de datos que envía el backend
export interface DashboardStats {
  totalMachines: number;
  activeIncidents: number;
  machinesInFalla: number;
  resolvedThisMonth: number;
  mttrHours: number;
  totalSpent: number;
  machineStatusData: { name: string; value: number }[];
  // NUEVO: Agregamos el tipado para las máquinas críticas
  criticalMachines: { name: string; code: string; issueCount: number }[];
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMachines: 0,
    activeIncidents: 0,
    machinesInFalla: 0,
    resolvedThisMonth: 0,
    mttrHours: 0,
    totalSpent: 0,
    machineStatusData: [],
    criticalMachines: [], // Inicializamos el arreglo vacío
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error(`Error al cargar estadísticas: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, isLoading };
};