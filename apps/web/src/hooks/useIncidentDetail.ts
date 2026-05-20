import { useState, useEffect } from "react";
import api from "../api/axios";

export const useIncidentDetail = (incidentId: string | null) => {
  const [incident, setIncident] = useState<any>(null);
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // NUEVO ESTADO

  useEffect(() => {
    if (!incidentId) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [incRes, partsRes] = await Promise.all([
          api.get(`/issues/${incidentId}`),
          api.get(`/spare-parts/requests?issue=${incidentId}`),
        ]);

        setIncident(incRes.data);
        setSpareParts(partsRes.data);
      } catch (err: any) {
        console.error("Error al cargar detalles:", err);
        // Capturamos el mensaje del backend o lanzamos uno por defecto
        setError(err.response?.data?.message || "Acceso denegado o error de conexión.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [incidentId]);

  return { incident, spareParts, isLoading, error }; // Exportamos el error
};