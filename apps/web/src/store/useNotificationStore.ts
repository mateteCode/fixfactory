import { create } from "zustand";
import api from "../api/axios";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const { data } = await api.get("/notifications");
      const unreadCount = data.filter((n: Notification) => !n.isRead).length;
      set({ notifications: data, unreadCount });
    } catch (error) {
      console.error("Error fetching notifications");
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      // Actualizamos estado local sin recargar
      const updated = get().notifications.map((n) =>
        n._id === id || id === "all" ? { ...n, isRead: true } : n,
      );
      set({
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      });
    } catch (error) {
      console.error("Error marking as read");
    }
  },
}));
