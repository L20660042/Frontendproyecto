import { Card, CardContent } from '../../components/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AlertItem {
  _id: string;
  message: string;
  riskLevel: number;
  resolved: boolean;
  createdAt: string;
}

interface AlertsOverTimeChartProps {
  alerts: AlertItem[];
}

const AlertsOverTimeChart = ({ alerts }: AlertsOverTimeChartProps) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  // Agrupar por mes (YYYY-MM)
  const alertsByMonth: Record<
    string,
    { total: number; unresolved: number; highRisk: number }
  > = {};

  alerts.forEach((alert) => {
    const date = new Date(alert.createdAt);
    if (isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}`;

    if (!alertsByMonth[key]) {
      alertsByMonth[key] = { total: 0, unresolved: 0, highRisk: 0 };
    }

    alertsByMonth[key].total += 1;
    if (!alert.resolved) alertsByMonth[key].unresolved += 1;
    if (alert.riskLevel >= 0.75) alertsByMonth[key].highRisk += 1;
  });

  const data = Object.entries(alertsByMonth)
    .map(([month, values]) => ({
      month,
      total: values.total,
      sinResolver: values.unresolved,
      altoRiesgo: values.highRisk,
    }))
    .sort((a, b) => (a.month > b.month ? 1 : -1));

  if (data.length === 0) return null;

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full">
        <h3 className="text-sm font-medium mb-4">
          Alertas por mes (total / sin resolver / alto riesgo)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total" />
              <Bar dataKey="sinResolver" name="Sin resolver" />
              <Bar dataKey="altoRiesgo" name="Alto riesgo" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsOverTimeChart;
