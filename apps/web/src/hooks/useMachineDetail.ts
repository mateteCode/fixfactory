import { useState, useEffect } from "react";
import api from "../api/axios";
import type { Machine } from "./useMachines";

export const useMachineDetail = (id: string | undefined) => {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/machines/${id}`);
        setMachine(response.data);
      } catch (error) {
        console.error("Error al traer detalle:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  return { machine, isLoading };
};
