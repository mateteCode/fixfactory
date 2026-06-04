import { useEffect, useState, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useNavigate } from "react-router-dom";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, unreadCount, fetchNotifications, markAsRead } =
    useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    // Opcional: Polling cada X minutos para refrescar notificaciones
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si el menú está abierto, la referencia existe, y el clic NO fue dentro del contenedor...
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    // Escuchamos los clics en todo el documento
    document.addEventListener("mousedown", handleClickOutside);

    // Limpieza del event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    setIsOpen(false);
    if (link) navigate(link);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-2xl rounded-lg overflow-hidden z-50">
          <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead("all")}
                className="text-xs text-blue-600 hover:underline flex items-center"
              >
                <Check size={12} className="mr-1" /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">
                No tienes notificaciones.
              </p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif._id, notif.link)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notif.isRead ? "bg-blue-50/50" : "bg-white"}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p
                      className={`text-sm ${!notif.isRead ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}
                    >
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-2 block">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
