import { useState, useEffect } from "react";
import api from "../api/axios";

export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalMachines: 0,
    activeIncidents: 0,
    machinesInFalla: 0,
    resolvedThisMonth: 0,
    mttrHours: 0,
    totalSpent: 0,
    machineStatusData: [] as { name: string; value: number }[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        console.log(response.data);
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
