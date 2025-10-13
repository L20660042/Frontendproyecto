import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  BarChart2,
  CheckCircle,
  Bell,
  Search,
  Settings,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


// ✅ Interfaces para tipar los datos correctamente
interface Metric {
  id: number;
  title: string;
  value: string;
  delta: string;
}

interface RecentEvent {
  id: number;
  name: string;
  status: string;
}

interface ChartPoint {
  name: string;
  asistencia: number;
  aulas: number;
}

// ✅ Componente principal
export default function DashboardScreen() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [recent, setRecent] = useState<RecentEvent[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  // Cargar datos simulados
  useEffect(() => {
    setMetrics([
      { id: 1, title: "Asistencia", value: "92%", delta: "+3%" },
      { id: 2, title: "Uso de aulas", value: "68/100", delta: "-1%" },
      { id: 3, title: "Trámites", value: "1,248", delta: "+12%" },
    ]);

    setRecent([
      { id: 1, name: "Registro - Aula 203", status: "Completado" },
      { id: 2, name: "Solicitud - Biblioteca", status: "En progreso" },
      { id: 3, name: "Reporte - Laboratorio", status: "Pendiente" },
    ]);

    setChartData([
      { name: "Lun", asistencia: 88, aulas: 60 },
      { name: "Mar", asistencia: 90, aulas: 62 },
      { name: "Mié", asistencia: 91, aulas: 65 },
      { name: "Jue", asistencia: 92, aulas: 68 },
      { name: "Vie", asistencia: 93, aulas: 70 },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 🔹 Encabezado */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-gray-700" />
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
          <Settings className="w-5 h-5 text-gray-600 cursor-pointer" />
        </div>
      </header>

      {/* 🔹 Contenido principal */}
      <main className="flex-1 p-6 space-y-6">
        {/* Tarjetas métricas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <motion.div
              key={metric.id}
              className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-gray-600 font-medium">{metric.title}</h2>
                <BarChart2 className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{metric.value}</p>
              <p
                className={`text-sm ${
                  metric.delta.startsWith("+")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {metric.delta} desde la semana pasada
              </p>
            </motion.div>
          ))}
        </section>

        {/* 🔹 Gráfica de líneas */}
        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Asistencia y uso de aulas
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="asistencia"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="aulas"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 🔹 Actividades recientes */}
        <section className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Actividades recientes
          </h2>
          <ul className="space-y-3">
            {recent.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    item.status === "Completado"
                      ? "text-green-600"
                      : item.status === "En progreso"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* 🔹 Pie de página */}
      <footer className="p-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Sistema de Gestión Académica
      </footer>
    </div>
  );
}
