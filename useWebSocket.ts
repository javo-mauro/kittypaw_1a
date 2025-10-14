import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './use-toast';
import { getWebSocketUrl } from '@/lib/environment';
import type { SystemMetrics, Device, SensorReading } from '@shared/schema';

type MessageType = 'system_metrics' | 'devices' | 'latest_readings' | 'system_info' | 'device_update' | 'new_reading';

interface WebSocketMessage {
  type: MessageType;
  metrics?: SystemMetrics;
  devices?: Device[];
  readings?: SensorReading[];
  device?: Device;
  reading?: SensorReading;
  info?: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});
  const ws = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

    const socketUrl = getWebSocketUrl();
    ws.current = new WebSocket(socketUrl);
    console.log('Attempting to connect to WebSocket...');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        // Actualiza el estado basado en el tipo de mensaje
        setData(prevData => {
          const newData = { ...prevData };
          switch (message.type) {
            // Casos de carga completa de datos
            case 'system_metrics':
              newData.metrics = message.metrics;
              break;
            case 'devices':
              newData.devices = message.devices;
              break;
            case 'latest_readings':
              newData.readings = message.readings;
              break;

            // --- Mejoras para actualizaciones incrementales ---

            case 'device_update':
              if (message.device) {
                const devices = [...(prevData.devices || [])];
                const index = devices.findIndex(d => d.id === message.device!.id);
                if (index > -1) {
                  devices[index] = { ...devices[index], ...message.device }; // Actualiza el dispositivo existente
                } else {
                  devices.push(message.device); // Añade un nuevo dispositivo
                }
                newData.devices = devices;
              }
              break;

            case 'new_reading':
              if (message.reading) {
                const readings = [...(prevData.readings || [])];
                const index = readings.findIndex(r => r.deviceId === message.reading!.deviceId);
                if (index > -1) {
                  readings[index] = message.reading; // Actualiza la lectura existente
                } else {
                  readings.push(message.reading); // Añade una nueva lectura
                }
                newData.readings = readings;
              }
              break;

            default:
              break;
          }
          return newData;
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected. Attempting to reconnect in 5s...');
      setIsConnected(false);
      reconnectTimeout.current = setTimeout(connect, 5000);
    };
  }, [toast]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      ws.current?.close();
    };
  }, [connect]);

  return { isConnected, data };
}