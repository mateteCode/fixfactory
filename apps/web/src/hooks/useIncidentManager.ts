import { useState, useEffect } from "react";
import api from "../api/axios";
import type { IssueStatus } from "../types/Issue";

export interface Incident {
  _id: string;
  machine: { name: string; code: string }; // Poblado desde el backend
  description: string;
  priority: "Baja" | "Media" | "Alta" | "Crítica";
  status: IssueStatus;
  createdAt: string;
}

export const useIncidentManager = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/issues");
      setIncidents(response.data);
    } catch (error) {
      console.error("Error al cargar incidencias");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await api.patch(`/issues/${id}`, { status: newStatus });
    fetchIncidents(); // Refrescar lista
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return { incidents, isLoading, updateStatus, refetch: fetchIncidents };
};
