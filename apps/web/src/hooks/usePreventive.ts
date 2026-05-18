import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../api/axios";

export interface MachineReference {
  _id: string;
  name: string; 
}

export interface PreventiveMaintenance {
  _id: string;
  machine: MachineReference;
  taskName: string;
  frequencyDays: number;
  lastDate: string;
  nextDate: string;
  description?: string;
  status: "Programado" | "Vencido" | "Realizado";
}

// Lo que necesitamos enviar al backend para crear uno nuevo
export interface CreatePreventiveDTO {
  machine: string; // El ID de la máquina seleccionada
  taskName: string;
  frequencyDays: number;
  nextDate: string;
  description?: string;
}

const fetchPreventive = async (): Promise<PreventiveMaintenance[]> => {
  const { data } = await axios.get("/preventive");
  return data;
};

export const usePreventive = () => {
  return useQuery({
    queryKey: ["preventive-maintenance"],
    queryFn: fetchPreventive,
  });
};

// El hook para guardar la tarea
export const useAddPreventive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPreventive: CreatePreventiveDTO) => {
      const { data } = await axios.post("/preventive", newPreventive);
      return data;
    },
    onSuccess: () => {
      // ¡Magia! Esto hace que la tabla se recargue sola al guardar con éxito
      queryClient.invalidateQueries({ queryKey: ["preventive-maintenance"] });
    },
  });
};