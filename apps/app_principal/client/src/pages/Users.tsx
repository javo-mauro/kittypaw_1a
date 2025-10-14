import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
// Removido: import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, User as UserIcon, HardDrive, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
// Mejora: Importar tipos desde el paquete compartido para mantener la consistencia.
import type { User, Device, ConsumptionEvent } from "@shared/schema";

export default function Users() {
  const { toast } = useToast();
  const { switchUser } = useAuth();

  // --- Estados del Componente ---
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Mejora: Estados más explícitos para la selección.
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // --- Estados de Datos ---
  const [devices, setDevices] = useState<Device[]>([]);
  // Mejora: Usamos ConsumptionEvent que es más específico y probablemente lo que devuelve la API.
  const [sensorData, setSensorData] = useState<ConsumptionEvent[]>([]);

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Obtenemos la lista de usuarios del sistema
        const fetchedUsers = await apiRequest<User[]>("/api/users");
        setUsers(fetchedUsers); // Solo actualizamos la lista maestra
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los usuarios.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  // Mejora: Usar useMemo para optimizar el filtrado de usuarios.
  // Se recalcula solo cuando `searchTerm` o `users` cambian.
  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return users;
    }
      const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(lowerSearchTerm) ||
        (user.name && user.name.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm, users]);

  // Función para obtener los dispositivos asociados a un usuario
  const fetchUserDevices = async (username: string) => {
    try {
      setDetailsLoading(true);
      setDevices([]); // Limpiar dispositivos anteriores
      setSensorData([]); // Limpiar datos de sensores
      // Usamos el parámetro de consulta para filtrar los dispositivos por usuario
      const fetchedDevices = await apiRequest<Device[]>(`/api/devices?username=${username}`);
      setDevices(fetchedDevices);
      
      // Limpiamos los datos de sensores cuando se cambia de usuario
      setSensorData([]);
      
      return fetchedDevices;
    } catch (error) {
      console.error(`Error al obtener dispositivos del usuario ${username}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los dispositivos del usuario.",
      });
      return [];
    } finally {
      setDetailsLoading(false);
    }
  };

  // Función para obtener los datos de sensores de un dispositivo
  const fetchDeviceSensorData = async (deviceId: string) => {
    try {
      setSensorData([]); // Limpiar datos anteriores
      setDetailsLoading(true);
      const data = await apiRequest<ConsumptionEvent[]>(`/api/sensor-data/${deviceId}`);
      setSensorData(data);
      return data;
    } catch (error) {
      console.error(`Error al obtener datos del dispositivo ${deviceId}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del dispositivo.",
      });
      return [];
    } finally {
      setDetailsLoading(false);
    }
  };

  // Función para cambiar al usuario seleccionado usando el contexto de autenticación
  const handleSwitchUser = async (username: string) => {
    try {
      const success = await switchUser(username);
      
      if (!success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cambiar al usuario seleccionado.",
        });
      }
    } catch (error) {
      console.error("Error al cambiar de usuario:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cambiar al usuario seleccionado.",
      });
    }
  };

  // Manejar selección de usuario
  const handleUserSelect = async (user: User) => {
    if (selectedUser?.id === user.id) return; // No recargar si ya está seleccionado
    setSelectedUser(user);
    setSelectedDevice(null); // Deseleccionar cualquier dispositivo
    await fetchUserDevices(user.username);
  };

  // Manejar selección de dispositivo
  const handleDeviceSelect = (device: Device) => {
    if (selectedDevice?.id === device.id) return; // No recargar si ya está seleccionado
    setSelectedDevice(device);
    fetchDeviceSensorData(device.deviceId);
  };

  // Renderizar detalles del usuario
  const renderUserDetails = () => {
    if (!selectedUser) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2"><UserIcon className="h-5 w-5" /> {selectedUser.name || selectedUser.username}</h3>
            <p className="text-sm text-gray-500 ml-7">Rol: {selectedUser.role || "No especificado"}</p>
            <p className="text-sm text-gray-500">
              Último acceso: {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "Nunca"}
            </p>
          </div>
          <Button onClick={() => handleSwitchUser(selectedUser.username)}>
            Cambiar a este usuario
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold flex items-center gap-2"><HardDrive className="h-5 w-5" /> Dispositivos asociados</h4>
          {devices.length > 0 ? (
            <div className="border rounded-md">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Batería</TableHead>
                    <TableHead>Última actualización</TableHead>
                  </TableRow>
                </TableHeader>
              <Table>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow 
                      key={device.id}
                      className={`cursor-pointer hover:bg-gray-100/80 ${selectedDevice?.id === device.id ? "bg-gray-100" : ""}`}
                      onClick={() => handleDeviceSelect(device)} // Simplificado
                    >
                      <TableCell>{device.deviceId}</TableCell>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{device.type}</TableCell>
                      <TableCell>
                        <Badge variant={device.status === "online" ? "success" : "secondary"}>
                          {device.status || "desconocido"}
                        </Badge>
                      </TableCell>
                      <TableCell>{device.batteryLevel !== null ? `${device.batteryLevel}%` : "-"}</TableCell>
                      <TableCell>
                        {device.lastUpdate ? new Date(device.lastUpdate).toLocaleString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : detailsLoading && !selectedDevice ? (
            <div className="flex justify-center items-center p-4 border rounded-md h-24">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2">Cargando dispositivos...</span>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No hay dispositivos asociados a este usuario.</p>
          )}
        </div>

        {selectedDevice && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold flex items-center gap-2"><BarChart className="h-5 w-5" /> Datos de Consumo ({selectedDevice.name})</h4>
            {detailsLoading && sensorData.length === 0 ? (
              <div className="flex justify-center items-center p-4 border rounded-md h-40">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2">Cargando datos del sensor...</span>
              </div>
            ) : sensorData.length > 0 ? (
              <ScrollArea className="h-60 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Cantidad (g)</TableHead>
                      <TableHead className="text-right">Duración (s)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensorData.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{event.amountGrams.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{event.durationSeconds}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay datos de consumo para este dispositivo.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel izquierdo: Lista de usuarios */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">Usuarios</CardTitle>
              <CardDescription>Usuarios registrados en el sistema</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-1 p-2">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`p-3 rounded-md flex items-center space-x-3 cursor-pointer hover:bg-gray-100 ${
                            selectedUser?.id === user.id ? "bg-gray-100" : ""
                          }`}
                          onClick={() => handleUserSelect(user)}
                          onDoubleClick={() => handleSwitchUser(user.username)}
                        >
                          <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name ?? user.username}</p>
                            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {user.role || "user"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">No se encontraron usuarios.</p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho: Detalles del usuario seleccionado */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
              <CardDescription>
                {selectedUser 
                  ? "Información del usuario y dispositivos asociados" 
                  : "Selecciona un usuario para ver sus detalles"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedUser 
                ? renderUserDetails() 
                : (
                  <div className="h-72 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                    <UserIcon className="h-16 w-16 mb-4 opacity-20" />
                    <p>Selecciona un usuario de la lista para ver sus detalles.</p>
                    <p className="text-sm mt-2">Puedes hacer doble clic en un usuario para cambiar a su cuenta.</p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}