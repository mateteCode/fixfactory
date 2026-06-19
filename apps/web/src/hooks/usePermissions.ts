import { useAuthStore } from "../store/useAuthStore";

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "";

  const hasRole = (allowedRoles: string[]) => {
    if (role === "ADMIN") return true;
    return allowedRoles.includes(role);
  };

  const getDefaultRoute = () => {
    if (hasRole(["ADMIN", "GERENTE"])) return "/dashboard";
    if (hasRole(["COMPRAS"])) return "/compras";
    if (hasRole(["MANTENIMIENTO", "TECNICO"])) return "/ordenes";
    if (hasRole(["ASISTENTE"])) return "/personal";
    if (hasRole(["OPERARIO"])) return "/maquinas";
    return "/maquinas";
  };

  return {
    role,
    isAdmin: role === "ADMIN",
    defaultRoute: getDefaultRoute(),

    // === PERMISOS DE PÁGINAS (SIDEBAR) ===
    canViewDashboard: hasRole(["GERENTE"]),
    canViewMachines: hasRole([
      "OPERARIO",
      "TECNICO",
      "MANTENIMIENTO",
      "COMPRAS",
      "GERENTE",
    ]),
    canViewHistory: hasRole(["GERENTE", "TECNICO", "MANTENIMIENTO"]),
    canViewOrders: hasRole(["TECNICO", "MANTENIMIENTO"]),
    canViewPreventive: hasRole(["MANTENIMIENTO", "TECNICO"]),
    canViewSpareParts: hasRole(["COMPRAS", "MANTENIMIENTO", "TECNICO"]),
    canViewPurchases: hasRole(["COMPRAS", "GERENTE"]),
    canViewStaff: hasRole(["GERENTE", "ASISTENTE"]),

    // === PERMISOS DE ACCIONES (BOTONES) ===

    // Máquinas
    canCreateMachine: hasRole(["GERENTE"]),
    canReportMachineIssue: hasRole(["OPERARIO"]),

    // Órdenes
    canAssignOrder: hasRole(["MANTENIMIENTO"]),

    // Preventivo
    canSchedulePreventive: hasRole(["MANTENIMIENTO"]),
    canAssignPreventive: hasRole(["MANTENIMIENTO"]),

    // Repuestos
    canManageSparePartsInventory: hasRole(["COMPRAS"]), // Ajustar stock y precio

    // Compras
    canManagePurchases: hasRole(["COMPRAS"]), // Botones de aceptar/recibir
  };
};
