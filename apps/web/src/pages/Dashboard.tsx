import { useDashboard } from "../hooks/useDashboard";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Tablet,
  AlertTriangle,
  CheckCircle,
  Activity,
  TimerReset,
  BadgeDollarSign,
} from "lucide-react";

const Dashboard = () => {
  const { stats, isLoading } = useDashboard();

  const COLORS = ["#22c55e", "#ef4444", "#eab308"]; // Verde, Rojo, Amarillo
  const STATUS_COLORS: Record<string, string> = {
    Operativa: "#22c55e", // Verde
    "En Falla": "#ef4444", // Rojo
    Mantenimiento: "#eab308", // Amarillo
  };

  const cards = [
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
      color: "text-red-600",
    },
    {
      label: "Incidencias Abiertas",
      value: stats.activeIncidents,
      icon: Activity,
      color: "text-orange-600",
    },
    {
      label: "Resueltas (Mes)",
      value: stats.resolvedThisMonth,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "MTTR (Hs)",
      value: `${(stats.mttrHours || 0).toLocaleString("es-AR", { minimumFractionDigits: 1 })}`,
      icon: TimerReset,
      color: "text-red-600",
    },
    {
      label: "Mantenimiento (USD)",
      value: `${(stats.totalSpent || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`,
      icon: BadgeDollarSign,
      color: "text-red-600",
    },
  ];

  if (isLoading)
    return (
      <div className="p-10 text-center animate-pulse">Cargando métricas...</div>
    );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4"
          >
            <div className={`p-3 bg-gray-50 rounded-lg ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {card.label}
              </p>
              <p className="text-2xl font-black text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Estados */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-80 flex flex-col">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">
            Estado de la Planta
          </h3>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            {stats.machineStatusData && stats.machineStatusData.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <PieChart>
                  <Pie
                    data={stats.machineStatusData}
                    innerRadius={60}
                    outerRadius={80}
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
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              /* DISEÑO PARA ESTADO VACÍO */
              <div className="text-center space-y-2">
                <div className="bg-gray-100 p-4 rounded-full inline-block">
                  <Activity className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Sin datos de activos
                </p>
                <p className="text-[10px] text-gray-300 italic">
                  Registrá máquinas para ver su estado
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mensaje de Bienvenida / Acción Rápida */}
        <div className="bg-[#2C2C2C] p-8 rounded-lg shadow-inner flex flex-col justify-center text-white">
          <h2 className="text-xl font-bold mb-2">Bienvenido al CMMS</h2>
          <p className="text-gray-400 text-sm mb-6">
            Monitoreá el estado de tus activos y gestioná las órdenes de trabajo
            pendientes de forma eficiente.
          </p>
          <button className="bg-white text-black px-6 py-2 rounded text-xs font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest self-start">
            Ver Reportes Detallados
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
