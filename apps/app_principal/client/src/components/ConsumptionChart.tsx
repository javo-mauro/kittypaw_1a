import { Label, ReferenceLine, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { ConsumptionEvent } from '@/services/api';
import { format } from 'date-fns';

interface ConsumptionChartProps {
  data: ConsumptionEvent[];
  color?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="label font-bold">{`Fecha: ${format(new Date(label), 'dd/MM/yy HH:mm')}`}</p>
        <p className="intro" style={{ color: payload[0].color }}>{`Consumo: ${payload[0].value.toFixed(2)}g`}</p>
      </div>
    );
  }

  return null;
};

export default function ConsumptionChart({ data, color = "#F87A6D" }: ConsumptionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos de consumo para mostrar.</p>
      </div>
    );
  }

  // Formatear los datos para el gráfico
  const chartData = data.map(event => ({
    timestamp: new Date(event.timestamp).getTime(), // Convert to timestamp for easier domain calculation
    amount: event.amountGrams,
  })).sort((a, b) => a.timestamp - b.timestamp);

  // Calcular el dominio del eje X con un padding
  const timeValues = chartData.map(d => d.timestamp);
  const minTime = Math.min(...timeValues);
  const maxTime = Math.max(...timeValues);
  
  const timePadding = (maxTime - minTime) * 0.1; // 10% padding

  const xDomain = [minTime - timePadding, maxTime + timePadding];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
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
          tickFormatter={(value) => `${value}g`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="amount" stroke={color} fillOpacity={0.3} fill={`url(#color${color.replace('#', '')})`} strokeWidth={2} />
        
        <ReferenceLine x={maxTime} stroke="red" strokeDasharray="3 3">
          <Label value="Última conexión" position="insideTop" fill="red" fontSize={10} />
        </ReferenceLine>

        <defs>
          <linearGradient id={`color${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}
