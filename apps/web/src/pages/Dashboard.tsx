// src/pages/Dashboard.tsx
import { useDashboard } from "../hooks/useDashboard";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Tablet,
  AlertTriangle,
  CheckCircle,
  Activity,
  TimerReset,
  BadgeDollarSign,
  AlertOctagon,
  TrendingUp,
  Target,
  Users,
  Zap,
  CalendarX2,
  PackageSearch,
  Siren,
  CalendarClock,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react";

const Dashboard = () => {
  const { stats, isLoading } = useDashboard();

  const STATUS_COLORS: Record<string, string> = {
    Operativa: "#22c55e",
    "En Falla": "#ef4444",
    Mantenimiento: "#eab308",
  };

  const TYPE_COLORS: Record<string, string> = {
    Mecánico: "#3b82f6",
    Eléctrico: "#eab308",
    Software: "#8b5cf6",
    Otro: "#9ca3af",
  };

  const cards = [
    // Fila 1: Inventario y Salud de Planta
    {
      label: "Total Máquinas",
      value: stats.totalMachines,
      icon: Tablet,
      color: "text-blue-600",
    },
    {
      label: "Máquinas en Falla",
      value: stats.machinesInFalla,
      icon: AlertTriangle,
      color: stats.machinesInFalla > 0 ? "text-red-600" : "text-green-600",
    },
    {
      label: "Disponibilidad Planta",
      value: `${stats.availability}%`,
      icon: Zap,
      color: stats.availability >= 95 ? "text-green-600" : "text-amber-500",
    },
    {
      label: "PMP (Cumplimiento de Preventivos)",
      value: `${stats.pmp}%`,
      icon: Target,
      color: stats.pmp >= 90 ? "text-green-600" : "text-amber-500",
    },

    // Fila 2: Volumen de Trabajo (Mes)
    {
      label: "Incidencias Abiertas",
      value: stats.activeIncidents,
      icon: Activity,
      color: "text-orange-600",
    },
    {
      label: "Fallas Resueltas",
      value: stats.resolvedThisMonth,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      label: "Preventivos Ejecutados",
      value: stats.preventivesThisMonth,
      icon: ShieldCheck,
      color: "text-indigo-600",
    },
    {
      label: "SLA (Respuesta a Incidentes)",
      value: `${(stats.avgResponseTimeHours || 0).toLocaleString("es-AR")} hs`,
      icon: Timer,
      color: "text-indigo-600",
    },

    // Fila 3: Confiabilidad y Finanzas
    {
      label: "MTTR (Reparación)",
      value: `${(stats.mttrHours || 0).toLocaleString("es-AR")} hs`,
      icon: TimerReset,
      color: "text-rose-600",
    },
    {
      label: "MTBF (Confiabilidad)",
      value: `${(stats.mtbfHours || 0).toLocaleString("es-AR")} hs`,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      label: "Gasto de Mantenimiento",
      value: `$${(stats.totalSpent || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`,
      icon: BadgeDollarSign,
      color: "text-cyan-600",
    },
    {
      label: "Costo Medio por Tarea",
      value: `$${(stats.avgTaskCost || 0).toLocaleString("es-AR")}`,
      icon: Wallet,
      color: "text-teal-600",
    },

    // Fila 4: Alertas Operativas (Atención Inmediata)
    {
      label: "Preventivos Vencidos",
      value: stats.overduePreventives,
      icon: CalendarX2,
      color: stats.overduePreventives > 0 ? "text-red-600" : "text-gray-400",
    },
    {
      label: "Repuestos Pendientes",
      value: stats.pendingSpareParts,
      icon: PackageSearch,
      color: stats.pendingSpareParts > 0 ? "text-amber-500" : "text-gray-400",
    },
    {
      label: "Fallas Críticas",
      value: stats.activeCriticalIssues,
      icon: Siren,
      color: stats.activeCriticalIssues > 0 ? "text-red-600" : "text-gray-400",
    },
    {
      label: "Preventivos a Vencer (7 días)",
      value: stats.upcomingPreventives,
      icon: CalendarClock,
      color:
        stats.upcomingPreventives > 0 ? "text-indigo-600" : "text-gray-400",
    },
  ];

  if (isLoading)
    return (
      <div className="p-10 text-center animate-pulse">
        Cargando métricas de planta...
      </div>
    );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">
        Panel de Control General
      </h1>

      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-3"
          >
            <div className={`p-2.5 bg-gray-50 rounded-lg ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                {card.label}
              </p>
              <p className="text-xl font-black text-gray-800 leading-none mt-1">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos en grilla de 3 columnas (6 gráficos en total) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Estado General */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-72 flex flex-col">
          <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">
            Estado de la Planta
          </h3>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            {stats.machineStatusData && stats.machineStatusData.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <PieChart>
                  <Pie
                    data={stats.machineStatusData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {stats.machineStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || "#9ca3af"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-xs italic">
                Sin datos registrados
              </p>
            )}
          </div>
        </div>

        {/* Gráfico 2: Origen de Fallas */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-72 flex flex-col">
          <h3 className="text-xs font-bold text-gray-700 uppercase mb-2">
            Distribución de Tipos de Fallas
          </h3>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            {stats.issueTypeData && stats.issueTypeData.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <PieChart>
                  <Pie
                    data={stats.issueTypeData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {stats.issueTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={TYPE_COLORS[entry.name] || "#9ca3af"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-xs italic">
                Sin fallas reportadas
              </p>
            )}
          </div>
        </div>

        {/* Gráfico 3: Fallas por Máquina */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-72 flex flex-col">
          <h3 className="text-xs font-bold text-gray-700 uppercase mb-2 text-red-600 flex items-center">
            <AlertOctagon className="w-3 h-3 mr-1" /> TOP de Máquinas con Fallas
            Frecuentes
          </h3>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            {stats.criticalMachines && stats.criticalMachines.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <BarChart
                  data={stats.criticalMachines}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 9 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f3f4f6" }}
                    formatter={(value) => [`${value} roturas`, "Historial"]}
                  />
                  <Bar
                    dataKey="issueCount"
                    fill="#ef4444"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-xs italic">
                Nivel de fallas en cero
              </p>
            )}
          </div>
        </div>

        {/* Gráfico 4: Costos por Máquina */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-72 flex flex-col">
          <h3 className="text-xs font-bold text-gray-700 uppercase mb-2 text-blue-600 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> TOP de Máquinas con Gastos
            de Mantenimiento
          </h3>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            {stats.topCostMachines && stats.topCostMachines.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <BarChart
                  data={stats.topCostMachines}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(val) => `$${val}`}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 9 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f3f4f6" }}
                    formatter={(value) => [`$${value}`, "Costo USD"]}
                  />
                  <Bar
                    dataKey="cost"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-xs italic">
                Sin gastos registrados
              </p>
            )}
          </div>
        </div>

        {/* Gráfico 5: Backlog de Técnicos */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-72 flex flex-col">
          <h3 className="text-xs font-bold text-gray-700 uppercase mb-2 text-indigo-600 flex items-center">
            <Users className="w-3 h-3 mr-1" /> Carga por Técnico
          </h3>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            {stats.technicianBacklog && stats.technicianBacklog.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <BarChart
                  data={stats.technicianBacklog}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 9 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f3f4f6" }}
                    formatter={(value) => [`${value} tickets`, "Asignados"]}
                  />
                  <Bar
                    dataKey="ticketCount"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-xs italic">
                No hay tareas pendientes
              </p>
            )}
          </div>
        </div>

        {/* Gráfico 6: Top Repuestos Usados */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-72 flex flex-col">
          <h3 className="text-xs font-bold text-gray-700 uppercase mb-2 text-amber-500 flex items-center">
            <PackageSearch className="w-3 h-3 mr-1" /> Rotación de Stock de
            Repuestos
          </h3>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            {stats.topSpareParts && stats.topSpareParts.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <BarChart
                  data={stats.topSpareParts}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 9 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f3f4f6" }}
                    formatter={(value) => [`${value} unidades`, "Consumidas"]}
                  />
                  <Bar
                    dataKey="quantity"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-xs italic">
                No hay consumo de pañol
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
