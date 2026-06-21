import { useState, useEffect } from "react";
import api from "../api/axios";
import type { IssueStatus } from "../types/Issue";
import { useQueryClient } from "@tanstack/react-query";

export interface Incident {
  _id: string;
  machine: { name: string; code: string }; // Poblado desde el backend
  description: string;
  priority: "Baja" | "Media" | "Alta" | "Crítica";
  status: IssueStatus;
  createdAt: string;
  reportedBy?: { _id: string; name: string; email: string };
  assignedTo?: { _id: string; name: string; email: string };
  scheduledAt?: string;
}

export const useIncidentManager = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/issues");
      setIncidents(response.data);
    } catch (error) {
      console.error("Error al cargar incidencias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await api.patch(`/issues/${id}`, { status: newStatus });
    fetchIncidents();
  };

  const assignTask = async (issueId: string, technicianId: string, scheduledAt?: string) => {
    await api.patch(`/issues/assign`, { issueId, technicianId, scheduledAt });
    await queryClient.invalidateQueries({ queryKey: ["agenda"] });
    fetchIncidents();
  };

  const rescheduleVisit = async (issueId: string, scheduledAt: string) => {
    await api.patch(`/agenda/issues/${issueId}`, { scheduledAt });
    await queryClient.invalidateQueries({ queryKey: ["agenda"] });
    fetchIncidents();
  };

  const addDiagnostic = async (
    issueId: string,
    description: string,
    images: string[],
  ) => {
    await api.patch(`/issues/${issueId}/diagnostic`, { description, images });
    fetchIncidents();
  };

  const finishTask = async (
    issueId: string,
    description: string,
    images: string[],
  ) => {
    await api.patch(`/issues/${issueId}/finish`, { description, images });
    fetchIncidents();
  };

  const releaseTask = async (issueId: string) => {
    await api.patch(`/issues/${issueId}/release`);
    fetchIncidents();
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return {
    incidents,
    isLoading,
    updateStatus,
    assignTask,
    refetch: fetchIncidents,
    addDiagnostic,
    finishTask,
    releaseTask,
    rescheduleVisit,
  };
};
