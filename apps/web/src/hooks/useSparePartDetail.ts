import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { type SparePart } from "./useSpareParts";

export const useSparePartDetail = (id: string | undefined) => {
  const [part, setPart] = useState<SparePart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/spare-parts/catalog/${id}`);
      setPart(response.data);
    } catch (error) {
      console.error("Error al obtener el detalle del repuesto:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { part, isLoading, refetch: fetchDetail };
};
