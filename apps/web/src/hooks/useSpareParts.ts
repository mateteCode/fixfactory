import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export interface SparePart {
  _id: string;
  modelName: string;
  brand: string;
  description: string;
  stockQuantity: number;
  price: number;
  compatibleMachines: { _id: string; name: string; code: string }[];
  active: boolean;
}

export const useSpareParts = () => {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSpareParts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/spare-parts");
      setSpareParts(response.data);
    } catch (error) {
      console.error("Error al cargar el catálogo de repuestos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSparePart = async (data: Partial<SparePart>) => {
    await api.post("/spare-parts", data);
    fetchSpareParts();
  };

  const updateSparePart = async (id: string, data: Partial<SparePart>) => {
    await api.patch(`/spare-parts/catalog/${id}`, data);
    fetchSpareParts();
  };

  const deleteSparePart = async (id: string) => {
    await api.delete(`/spare-parts/catalog/${id}`);
    fetchSpareParts();
  };

  const adjustStock = async (id: string, quantity: number) => {
    await api.post(`/spare-parts/catalog/${id}/stock`, { quantity });
    fetchSpareParts();
  };

  useEffect(() => {
    fetchSpareParts();
  }, [fetchSpareParts]);

  return {
    spareParts,
    isLoading,
    createSparePart,
    updateSparePart,
    deleteSparePart,
    adjustStock,
    refetch: fetchSpareParts,
  };
};
