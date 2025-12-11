import { Card, CardContent } from '../../components/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AlertItem {
  _id: string;
  message: string;
  riskLevel: number;
  resolved: boolean;
  createdAt: string;
}

interface RiskLevelChartProps {
  alerts: AlertItem[];
}

const COLORS = ['#34d399', '#fbbf24', '#f97316', '#ef4444'];

const RiskLevelChart = ({ alerts }: RiskLevelChartProps) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const data = [
    {
      name: 'Muy bajo (< 0.25)',
      value: alerts.filter((a) => a.riskLevel < 0.25).length,
    },
    {
      name: 'Bajo (0.25 - 0.49)',
      value: alerts.filter((a) => a.riskLevel >= 0.25 && a.riskLevel < 0.5).length,
    },
    {
      name: 'Medio (0.50 - 0.74)',
      value: alerts.filter((a) => a.riskLevel >= 0.5 && a.riskLevel < 0.75).length,
    },
    {
      name: 'Alto (≥ 0.75)',
      value: alerts.filter((a) => a.riskLevel >= 0.75).length,
    },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full">
        <h3 className="text-sm font-medium mb-4">
          Distribución de nivel de riesgo (alertas)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="value"
                data={data}
                innerRadius={40}
                outerRadius={80}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskLevelChart;
