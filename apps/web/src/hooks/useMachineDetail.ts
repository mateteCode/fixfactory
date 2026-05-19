import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import type { Machine } from "./useMachines";

export interface MachineHistory {
  issues: any[];
  preventiveTasks: any[];
  spareParts: any[];
}

export const useMachineDetail = (id: string | undefined) => {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [history, setHistory] = useState<MachineHistory>({
    issues: [],
    preventiveTasks: [],
    spareParts: [],
  });
  const [totalMaintenanceCost, setTotalMaintenanceCost] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMachineData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      // Ejecutamos ambas consultas en paralelo en el frontend
      const [detailResponse, historyResponse] = await Promise.all([
        api.get(`/machines/${id}`),
        api.get(`/machines/${id}/history`),
      ]);

      setMachine(detailResponse.data);
      setHistory(historyResponse.data.history);
      setTotalMaintenanceCost(historyResponse.data.totalMaintenanceCost);
    } catch (error) {
      console.error("Error al recuperar el expediente del activo:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMachineData();
  }, [fetchMachineData]);

  return {
    machine,
    history,
    totalMaintenanceCost,
    isLoading,
    refetch: fetchMachineData,
  };
};
