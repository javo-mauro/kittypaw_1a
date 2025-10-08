import { useState, useEffect } from 'react';
import { getDevicesByUserId } from '@/services/api';
import type { Device } from '@/services/api';
import DeviceCard from '@/components/DeviceCard'; // Import our new component

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // We'll assume a hardcoded user ID for now, as auth is not in scope for this task.
    const FAKE_USER_ID = 1;

    getDevicesByUserId(FAKE_USER_ID)
      .then(data => {
        setDevices(data);
      })
      .catch(err => {
        console.error("Error fetching devices:", err);
        setError("No se pudieron cargar los dispositivos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Runs only once on component mount

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis Dispositivos</h1>
        {/* We can add a "Add Device" button here later */}
      </div>

      {loading && <p>Cargando dispositivos...</p>}
      
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
