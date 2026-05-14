import { useState, useCallback } from "react";
import api from "../api/axios";

export interface RequestSparePartData {
  issue: string;
  sparePart: string;
  quantity: number;
}

export interface SparePartRequest {
  _id: string;
  sparePart: { _id: string; model: string; brand: string; price: number };
  issue: {
    _id: string;
    machine: { name: string; code: string };
  };
  quantity: number;
  estimatedCost: number;
  status: string;
  requestedBy: { name: string; email: string };
  createdAt: string;
}

export const useSparePartRequests = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<SparePartRequest[]>([]);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/spare-parts/requests");
      setRequests(response.data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRequestStatus = async (id: string, status: string) => {
    await api.patch(`/spare-parts/request/${id}/status`, { status });
    fetchRequests();
  };

  const createRequest = async (data: RequestSparePartData) => {
    try {
      setIsLoading(true);
      const response = await api.post("/spare-parts/request", data);
      return response.data;
    } catch (error) {
      console.error("Error al solicitar repuesto:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // La función fetchRequests la usaremos en el próximo paso para el área de Compras

  return {
    requests,
    isLoading,
    fetchRequests,
    updateRequestStatus,
    createRequest,
  };
};
