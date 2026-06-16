import { useState, useEffect } from "react";
import api from "../api/axios";

export const usePreventiveManager = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    const { data } = await api.get("/preventive");
    setTasks(data);
    setIsLoading(false);
  };

  const assignTask = async (taskId: string, technicianId: string) => {
    await api.patch(`/preventive/assign`, { taskId, technicianId });
    fetchTasks();
  };

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/preventive/${id}/status`, { status });
    fetchTasks();
  };

  const finishTask = async (
    id: string,
    description: string,
    images: string[],
  ) => {
    await api.patch(`/preventive/${id}/finish`, { description, images });
    fetchTasks();
  };

  const releaseTask = async (id: string) => {
    await api.patch(`/preventive/${id}/release`);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    assignTask,
    updateStatus,
    finishTask,
    releaseTask,
    refetch: fetchTasks,
  };
};
