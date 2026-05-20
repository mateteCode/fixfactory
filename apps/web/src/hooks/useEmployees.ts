import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/users");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error al cargar la lista de personal:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEmployee = async (data: {
    name: string;
    email: string;
    role: string;
  }) => {
    try {
      setIsSubmitting(true);
      await api.post("/users", data);
      await fetchEmployees();
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Error al crear empleado",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    isLoading,
    isSubmitting,
    createEmployee,
    refetch: fetchEmployees,
  };
};
