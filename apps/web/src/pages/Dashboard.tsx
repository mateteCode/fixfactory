import { useDashboard } from "../hooks/useDashboard";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  // NUEVAS IMPORTACIONES DE RECHARTS PARA EL GRÁFICO DE BARRAS
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import {
  Tablet,
  AlertTriangle,
  CheckCircle,
  Activity,
  TimerReset,
  BadgeDollarSign,
  AlertOctagon // Nuevo ícono para la tabla de críticas
} from "lucide-react";

const Dashboard = () => {
  const { stats, isLoading } = useDashboard();

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
        {/* Gráfico 1: Dona de Estados */}
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

        {/* Gráfico 2: Top 5 Máquinas Críticas (Reemplaza el div negro) */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-80 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase flex items-center">
               <AlertOctagon className="w-4 h-4 mr-2 text-red-500"/>
               Top Máquinas con Fallas Frecuentes
            </h3>
          </div>
          
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            {stats.criticalMachines && stats.criticalMachines.length > 0 ? (
              <ResponsiveContainer width="99%" height="99%">
                <BarChart data={stats.criticalMachines} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    formatter={(value) => [`${value} incidencias`, 'Fallas Reportadas']}
                  />
                  <Bar dataKey="issueCount" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-2">
                <div className="bg-green-50 p-4 rounded-full inline-block">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  ¡Todo en orden!
                </p>
                <p className="text-[10px] text-gray-300 italic">
                  No hay historial de fallas recurrentes.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;