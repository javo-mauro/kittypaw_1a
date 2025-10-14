import { Label, ReferenceLine, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

// Let's define a new type for this mock data
export interface ActivityEvent {
  timestamp: string;
  level: number; // 0: sleeping, 1: resting, 2: active
}

interface ActivityChartProps {
  data: ActivityEvent[];
  color?: string;
}

const activityLabels = ['Durmiendo', 'Descansando', 'Activo'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="label font-bold">{`Hora: ${format(new Date(label), 'HH:mm')}`}</p>
        <p className="intro" style={{ color: payload[0].color }}>
          {`Nivel: ${activityLabels[payload[0].value] || 'Desconocido'}`}
        </p>
      </div>
    );
  }

  return null;
};

export default function ActivityChart({ data, color = "#EBB7AA" }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos de actividad para mostrar.</p>
      </div>
    );
  }
  
  const chartData = data.map(event => ({
    ...event,
    timestamp: new Date(event.timestamp).getTime(),
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
          ticks={[0, 1, 2]}
          tickFormatter={(value) => activityLabels[value] || ''}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="step" dataKey="level" stroke={color} fillOpacity={0.3} fill={`url(#color${color.replace('#', '')})`} strokeWidth={2} />

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
