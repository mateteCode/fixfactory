// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Tablet,
  ClipboardList,
  Package,
  History,
  Calendar,
  ShoppingCart,
  BriefcaseBusiness,
  SquareChevronLeft,
  SquareChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { usePermissions } from "../../hooks/usePermissions";
import { useState } from "react";

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const { notifications } = useNotificationStore();

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

  const issueNotifsCount = notifications.filter(
    (n) => !n.isRead && n.type === "ISSUE",
  ).length;
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

  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`relative z-1000 shrink-0 ${
        isOpen ? "w-64" : "w-24"
      } bg-[#D1D1D1] h-screen flex flex-col border-r border-gray-300 shadow-inner transition-all duration-200 ease-in-out`}
    >
   
      {/* Header / logo */}
      <div className={`border-b border-gray-400 flex items-center justify-center ${isOpen ? "p-6" : "p-2"}`}>

        <div className={`bg-[#7a7a7a] text-white rounded font-bold uppercase overflow-hidden shadow-sm flex items-center justify-center ${
          isOpen ? "py-2 px-4 text-xs tracking-tighter w-auto h-auto" : "w-12 h-12 leading-none"
        }`}>
          {isOpen ? (user ? user.companyName : "CMMS LOGO") : (user?.companyName?.[0] ?? "C").toUpperCase()}
        </div>
      </div>
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="bg-[#577cf5] text-white flex items-center justify-center p-1 w-full h-12 shadow-sm hover:bg-[#6A6A6A]"
        aria-label={isOpen ? "Colapsar menú" : "Expandir menú"}
        >
        {isOpen ? <SquareChevronLeft className="w-5 h-5" /> : <SquareChevronRight className="w-5 h-5" />}
        {isOpen && <span className="ml-3">Contraer</span>}
        
      </button>

      {/* Navegación */}
      <nav className={`flex-1 space-y-1 ${isOpen ? "p-4" : "py-2"}`}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.name}
            className={({ isActive }) =>
                        `flex items-center rounded transition-all duration-200 text-sm font-semibold ${
                          isOpen ? "justify-between p-3" : "justify-center py-2"
                        } ${
                          isActive
                            ? `bg-white text-gray-900 shadow-sm border-[#7A7A7A] ${isOpen ? "border-l-4" : ""}`
                            : "text-gray-700 hover:bg-gray-200"
                        }`
                      }
          >
            {/* Contenedor izquierdo: Ícono y Nombre */}
            <div className="relative flex items-center">
              <item.icon className="w-5 h-5 shrink-0" />
              {isOpen && <span className="ml-3">{item.name}</span>}
              {!isOpen && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-[#D1D1D1]" />
              )}
            </div>

            {isOpen && item.badge !== undefined && item.badge > 0 && (
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