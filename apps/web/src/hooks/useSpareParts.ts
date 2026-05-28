import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export interface SparePart {
  _id: string;
  internalCode: string; // Nivel 3: SKU interno
  stockQuantity: number;
  minStock: number;
  price: number;
  location?: string;
  active: boolean;

  // Nivel 1: Catálogo Global
  brand: string;
  partNumber: string; // Reemplaza a modelCode
  name: string; // Reemplaza a description
  technicalSpecs?: string;
  isVerified?: boolean;
  isPrivate?: boolean;

  // Nivel 2: Perfil Privado
  customImageUrl?: string;
  manuals?: string[];
  images?: string[];
  compatibleMachines?: any[]; // Lo hacemos opcional (?)
  supplierLinks?: string[];
}

export const useSpareParts = () => {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSpareParts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/spare-parts/catalog");
      setSpareParts(response.data);
    } catch (error) {
      console.error("Error al cargar el catálogo de repuestos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSparePart = async (data: Partial<SparePart>) => {
    await api.post("/spare-parts/catalog", data);
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
