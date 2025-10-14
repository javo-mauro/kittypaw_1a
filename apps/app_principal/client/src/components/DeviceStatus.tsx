import { Button } from '@/components/ui/button';
import { FaHistory } from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type DeviceStatusType = 'Encendido' | 'Sleep' | 'Apagado';

interface DeviceStatusProps {
  name: string;
  status: DeviceStatusType;
  lastConnection?: string | Date;
}

const statusConfig = {
  Encendido: { color: 'bg-green-500', text: 'Encendido' },
  Sleep: { color: 'bg-yellow-500', text: 'Sleep' },
  Apagado: { color: 'bg-red-500', text: 'Apagado' },
};

export default function DeviceStatus({ name, status, lastConnection }: DeviceStatusProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-4">
        <span className={`h-3 w-3 rounded-full ${config.color}`}></span>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">{config.text}</p>
          {lastConnection && (
            <p className="text-xs text-gray-400 mt-1">
              Últ. vez: {format(new Date(lastConnection), "dd MMM yyyy, HH:mm", { locale: es })}
            </p>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm">
        <FaHistory className="mr-2 h-4 w-4" />
        Historial
      </Button>
    </div>
  );
}
