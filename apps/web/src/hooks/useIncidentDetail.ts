import { useState, useEffect } from "react";
import api from "../api/axios";

export const useIncidentDetail = (incidentId: string | null) => {
  const [incident, setIncident] = useState<any>(null);
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!incidentId) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        // Ejecutamos ambas peticiones en paralelo
        const [incRes, partsRes] = await Promise.all([
          api.get(`/issues/${incidentId}`),
          api.get(`/spare-parts/requests?issue=${incidentId}`),
        ]);

        setIncident(incRes.data);
        setSpareParts(partsRes.data);
      } catch (error) {
        console.error("Error al cargar detalles de la incidencia:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [incidentId]);

  return { incident, spareParts, isLoading };
};
