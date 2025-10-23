import type { Device } from '@/services/api';
import { Link } from 'wouter';

// Iconos para los modos de dispositivo
const DeviceIcon = ({ mode }: { mode: 'comedero' | 'bebedero' | 'collar' | 'cama_inteligente' }) => {
  let iconName = 'help';
  let color = 'text-gray-500';

  switch (mode) {
    case 'comedero':
      iconName = 'restaurant';
      color = 'text-orange-500';
      break;
    case 'bebedero':
      iconName = 'water_drop';
      color = 'text-blue-500';
      break;
    case 'collar':
      iconName = 'pets';
      color = 'text-green-500';
      break;
    case 'cama_inteligente':
      iconName = 'king_bed';
      color = 'text-purple-500';
      break;
  }

  return <span className={`material-icons text-4xl ${color}`}>{iconName}</span>;
};

export default function DeviceCard({ device }: { device: Device }) {
  return (
    <Link href={`/devices/${device.id}`}>
      <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white">
        <div className="flex items-center space-x-4">
          <DeviceIcon mode={device.mode} />
          <div>
            <h2 className="text-lg font-bold text-gray-800">{device.name}</h2>
            <p className="text-sm text-gray-500">{device.deviceId}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
