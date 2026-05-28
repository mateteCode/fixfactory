// src/hooks/useMachines.ts
import { useState, useEffect } from "react";
import api from "../api/axios";

export interface Machine {
  _id: string;
  internalTag: string;
  name: string;
  brand: string;
  modelCode: string;
  status:
    | "Operativa"
    | "En Falla"
    | "Mantenimiento"
    | "Apagada"
    | "No Instalada";
  productionLine?: string;
  location?: string;
  installationDate?: string;

  // Nivel 3 (Físico)
  purchasePrice?: number;
  createdAt?: string;

  // Nivel 1 y 2 (Catálogo y Perfil)
  technicalSpecs?: string;
  operationalNotes?: string;
  imageUrl?: string;
  images?: string[];
  manuals?: string[];
  isVerified?: boolean;
  isPrivate?: boolean;
}

export const useMachines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      // El backend ya filtra por companyId gracias al token en el interceptor de axios
      const response = await api.get("/machines");
      setMachines(response.data);
    } catch (error) {
      console.error("Error al traer máquinas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return { machines, isLoading, refetch: fetchMachines };
};
