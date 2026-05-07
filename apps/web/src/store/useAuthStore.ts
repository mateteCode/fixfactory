import { create } from "zustand";

interface User {
  id: string;
  name: string;
  //role: string;
  role: "ADMIN" | "TECNICO" | "GERENTE" | "COMPRAS";
  companyId: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  //setAuth: (token: string, user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Función auxiliar para leer del localStorage de forma segura
  const getSafeUser = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") return null; // Limpieza preventiva
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      return null;
    }
  };

  return {
    token: localStorage.getItem("token"),
    user: getSafeUser(),
    isAuthenticated:
      !!localStorage.getItem("token") &&
      localStorage.getItem("token") !== "undefined",

    login: (token, user) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
