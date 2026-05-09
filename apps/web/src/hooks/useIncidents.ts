import api from "../api/axios";

export interface Incident {
  /*machineId: string;*/
  machine: string;
  description: string;
  priority: "Baja" | "Media" | "Alta" | "Crítica";
  type: "Eléctrico" | "Mecánico" | "Software" | "Otro";
}

export const useIncidents = () => {
  const createIncident = async (incidentData: Incident) => {
    try {
      const response = await api.post("/issues", incidentData);
      return response.data;
    } catch (error) {
      console.error("Error al reportar incidencia:", error);
      throw error;
    }
  };

  return { createIncident };
};
