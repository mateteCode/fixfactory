// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Tablet,
  ClipboardList,
  Package,
  History,
  Users,
  Calendar,
  ShoppingCart,
  BriefcaseBusiness,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { usePermissions } from "../../hooks/usePermissions";

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const { notifications } = useNotificationStore();

  // Extraemos todos los permisos de páginas
  const {
    canViewDashboard,
    canViewMachines,
    canViewHistory,
    canViewOrders,
    canViewPreventive,
    canViewSpareParts,
    canViewPurchases,
    canViewStaff,
  } = usePermissions();

  // Contamos cuántas notificaciones NO leídas hay de tipo ISSUE
  const issueNotifsCount = notifications.filter(
    (n) => !n.isRead && n.type === "ISSUE",
  ).length;
  // Contamos de Compras
  const sparePartNotifsCount = notifications.filter(
    (n) => !n.isRead && n.type === "SPARE_PART",
  ).length;

  const menuItems = [
    ...(canViewDashboard
      ? [{ name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }]
      : []),
    ...(canViewMachines
      ? [{ name: "Máquinas", icon: Tablet, path: "/maquinas" }]
      : []),
    ...(canViewHistory
      ? [{ name: "Historial", icon: History, path: "/historial" }]
      : []),
    ...(canViewOrders
      ? [
          {
            name: "Órdenes",
            icon: ClipboardList,
            path: "/ordenes",
            badge: issueNotifsCount,
          },
        ]
      : []),
    ...(canViewPreventive
      ? [{ name: "Preventivo", icon: Calendar, path: "/preventivo" }]
      : []),
    ...(canViewSpareParts
      ? [{ name: "Repuestos", icon: Package, path: "/repuestos" }]
      : []),
    ...(canViewPurchases
      ? [
          {
            name: "Compras",
            icon: ShoppingCart,
            path: "/compras",
            badge: sparePartNotifsCount,
          },
        ]
      : []),
    ...(canViewStaff
      ? [{ name: "Personal", icon: BriefcaseBusiness, path: "/personal" }]
      : []),
  ];

  return (
    <aside className="w-64 bg-[#D1D1D1] h-screen flex flex-col border-r border-gray-300 shadow-inner">
      <div className="p-6 border-b border-gray-400">
        <div className="bg-[#7A7A7A] text-white py-2 px-4 rounded text-center font-bold text-xs tracking-tighter uppercase shadow-sm">
          {user ? user.companyName : "CMMS LOGO"}
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded transition-all duration-200 text-sm font-semibold ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm border-l-4 border-[#7A7A7A]"
                  : "text-gray-700 hover:bg-gray-200"
              }`
            }
          >
            {/* Contenedor izquierdo: Ícono y Nombre */}
            <div className="flex items-center">
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </div>

            {/* Contenedor derecho: Badge Numérico (si existe y es mayor a 0) */}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
