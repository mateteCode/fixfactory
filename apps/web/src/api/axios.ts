import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

console.log(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, la dejamos pasar
    return response;
  },
  (error) => {
    // Si el backend devuelve un 401 (No Autorizado)
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada. Redirigiendo al login...");
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    // Rechazamos la promesa para que los bloques catch(err) de tus componentes sigan funcionando
    return Promise.reject(error);
  },
);

export default api;
