import { Label, ReferenceLine, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ConsumptionEvent } from '@/services/api';
import { format } from 'date-fns';

interface DurationChartProps {
  data: ConsumptionEvent[];
  color?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="label font-bold">{`Fecha: ${format(new Date(label), 'dd/MM/yy HH:mm')}`}</p>
        <p className="intro" style={{ color: payload[0].fill }}>{`Duración: ${payload[0].value}s`}</p>
      </div>
    );
  }

  return null;
};

export default function DurationChart({ data, color = "#99B898" }: DurationChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos de duración para mostrar.</p>
      </div>
    );
  }

  const chartData = data.map(event => ({
    timestamp: new Date(event.timestamp).getTime(),
    duration: event.durationSeconds,
  })).sort((a, b) => a.timestamp - b.timestamp);

  // Calcular el dominio del eje X con un padding
  const timeValues = chartData.map(d => d.timestamp);
  const minTime = Math.min(...timeValues);
  const maxTime = Math.max(...timeValues);
  const timePadding = (maxTime - minTime) * 0.1; // 10% padding

  const xDomain = [minTime - timePadding, maxTime + timePadding];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="timestamp" 
          type="number"
          domain={xDomain}
          tickFormatter={(time) => format(new Date(time), 'HH:mm')}
          stroke="#888"
          fontSize={12}
        />
        <YAxis 
          stroke="#888"
          fontSize={12}
          tickFormatter={(value) => `${value}s`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="duration" fill={color} />
        <ReferenceLine x={maxTime} stroke="red" strokeDasharray="3 3">
          <Label value="Última conexión" position="insideTop" fill="red" fontSize={10} />
        </ReferenceLine>
      </BarChart>
    </ResponsiveContainer>
  );
}
