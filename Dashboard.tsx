import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Wifi, WifiOff, HardDrive, Activity, AlertTriangle, BarChartHorizontal } from "lucide-react";
import type { SystemMetrics, Device, SensorReading } from "@shared/schema";

function MetricCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { isConnected, data } = useWebSocket();
  const metrics: SystemMetrics | undefined = data.metrics;
  const devices: Device[] | undefined = data.devices;
  const readings: SensorReading[] | undefined = data.readings;

  const getReadingForDevice = (deviceId: number): SensorReading | undefined => {
    return readings?.find(r => r.deviceId === deviceId);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard en Tiempo Real</h1>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">Conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-600">Desconectado</span>
            </>
          )}
        </div>
      </div>

      {/* Métricas del Sistema */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <MetricCard
          title="Dispositivos Activos"
          value={metrics?.activeDevices ?? '...'}
          icon={HardDrive}
        />
        <MetricCard
          title="Sensores Activos (15 min)"
          value={metrics?.activeSensors ?? '...'}
          icon={Activity}
        />
        <MetricCard
          title="Alertas del Sistema"
          value={metrics?.alerts ?? '...'}
          icon={AlertTriangle}
        />
      </div>

      {/* Tabla de Dispositivos y Lecturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartHorizontal className="h-5 w-5" />
            Estado de Dispositivos y Últimas Lecturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Dispositivo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Batería</TableHead>
                <TableHead>Última Lectura (Consumo)</TableHead>
                <TableHead>Fecha de Lectura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices && devices.length > 0 ? (
                devices.map((device) => {
                  const reading = getReadingForDevice(device.id);
                  return (
                    <TableRow key={device.id}>
                      <TableCell className="font-mono">{device.deviceId}</TableCell>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>
                        <Badge variant={device.status === 'online' ? 'success' : 'secondary'}>
                          {device.status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {device.batteryLevel !== null ? `${device.batteryLevel}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {reading ? `${Number(reading.value).toFixed(2)} ${reading.unit}` : 'Sin datos'}
                      </TableCell>
                      <TableCell>
                        {reading ? new Date(reading.timestamp).toLocaleString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {isConnected ? 'Esperando datos de dispositivos...' : 'Conectando para recibir datos...'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}