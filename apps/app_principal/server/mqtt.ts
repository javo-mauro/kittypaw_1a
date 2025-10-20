import * as mqtt from 'mqtt';
import { storage } from './storage';
import { WebSocket } from 'ws';
import { log } from './vite';
import * as fs from 'fs';

class MqttClient {
  private client: mqtt.MqttClient | null = null;
  private topics: Set<string> = new Set(['KPCL0021/pub']); // Conjunto de tópicos para suscribirse
  private connectionId: number | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private webSockets: Set<WebSocket> = new Set();
  
  // Sistema de detección de dispositivos inactivos
  private deviceLastSeen: Map<string, Date> = new Map(); // Registro de último ping de dispositivos
  private offlineCheckTimer: NodeJS.Timeout | null = null;
  private readonly DEVICE_TIMEOUT_MS = 15000; // 15 segundos sin datos = dispositivo offline

  async connect(
    brokerUrl: string, 
    clientId: string, 
    username?: string, 
    password?: string,
    caCert?: string,
    clientCert?: string,
    privateKey?: string
  ) {
    try {
      if (this.client) {
        await this.disconnect();
      }

      log(`Connecting to MQTT broker: ${brokerUrl}`, 'mqtt');

      const connectOptions: mqtt.IClientOptions = {
        clientId,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      };

      // Autenticación estándar
      if (username && password) {
        connectOptions.username = username;
        connectOptions.password = password;
      }
      
      // Autenticación con certificados (AWS IoT)
      if (caCert && clientCert && privateKey) {
        log('Using certificate authentication for MQTT connection', 'mqtt');
        connectOptions.ca = caCert;
        connectOptions.cert = clientCert;
        connectOptions.key = privateKey;
        connectOptions.protocol = 'mqtts';
        connectOptions.rejectUnauthorized = true;
      }

      this.client = mqtt.connect(brokerUrl, connectOptions);

      this.client.on('connect', async () => {
        log('Connected to MQTT broker', 'mqtt');
        if (this.connectionId) {
          await storage.updateMqttConnectionStatus(this.connectionId, true);
        }
        this.subscribe();
        this.broadcastToClients({
          type: 'mqtt_status',
          status: 'connected',
          broker: brokerUrl
        });
      });

      this.client.on('error', (err) => {
        log(`MQTT client error: ${err.message}`, 'mqtt');
        this.broadcastToClients({
          type: 'mqtt_status',
          status: 'error',
          message: err.message
        });
      });

      this.client.on('offline', async () => {
        log('MQTT client offline', 'mqtt');
        if (this.connectionId) {
          await storage.updateMqttConnectionStatus(this.connectionId, false);
        }
        this.broadcastToClients({
          type: 'mqtt_status',
          status: 'disconnected'
        });
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });

      return true;
    } catch (error) {
      log(`Failed to connect to MQTT broker: ${error}`, 'mqtt');
      return false;
    }
  }

  async disconnect() {
    return new Promise<void>((resolve) => {
      // Limpiar el timer de detección de dispositivos offline
      if (this.offlineCheckTimer) {
        clearInterval(this.offlineCheckTimer);
        this.offlineCheckTimer = null;
      }
      
      // Limpiar lastSeen de dispositivos
      this.deviceLastSeen.clear();
      
      if (!this.client) {
        resolve();
        return;
      }

      if (this.client.connected) {
        this.client.end(false, () => {
          this.client = null;
          resolve();
        });
      } else {
        this.client = null;
        resolve();
      }
    });
  }

  private subscribe() {
    if (this.client && this.client.connected) {
      // Suscribirse a todos los tópicos del conjunto
      Array.from(this.topics).forEach(topic => {
        this.client!.subscribe(topic, (err) => {
          if (!err) {
            log(`Subscribed to topic: ${topic}`, 'mqtt');
          } else {
            log(`Error subscribing to topic: ${err.message}`, 'mqtt');
          }
        });
      });
    }
  }
  
  // Método para agregar un nuevo tópico y suscribirse
  public addTopic(topic: string) {
    // Asegurarse de que si el tópico es un ID de dispositivo, tenga el formato correcto con /pub
    if (!topic.includes('/')) {
      topic = `${topic}/pub`;
      log(`Formateando tópico como ${topic} para asegurar el formato correcto`, 'mqtt');
    }
    
    if (!this.topics.has(topic)) {
      this.topics.add(topic);
      log(`Added new topic: ${topic}`, 'mqtt');
      
      // Si ya estamos conectados, suscribirse inmediatamente
      if (this.client && this.client.connected) {
        this.client.subscribe(topic, (err) => {
          if (!err) {
            log(`Subscribed to new topic: ${topic}`, 'mqtt');
          } else {
            log(`Error subscribing to new topic: ${err.message}`, 'mqtt');
          }
        });
      }
    }
  }

  // Método para comprobar dispositivos inactivos
  private startOfflineCheckTimer() {
    // Cancelar si ya hay un timer funcionando
    if (this.offlineCheckTimer) {
      clearInterval(this.offlineCheckTimer);
    }
    
    // Configurar un intervalo para verificar dispositivos inactivos cada 10 segundos
    this.offlineCheckTimer = setInterval(async () => {
      const now = new Date();
      
      // Verificar todos los dispositivos que hemos registrado - usando Array.from para evitar problemas de iteración
      const deviceIds = Array.from(this.deviceLastSeen.keys());
      
      // Por cada dispositivo registrado, verificar si ha pasado demasiado tiempo sin actividad
      for (const deviceId of deviceIds) {
        const lastSeen = this.deviceLastSeen.get(deviceId);
        if (!lastSeen) continue;
        
        const timeSinceLastMsg = now.getTime() - lastSeen.getTime();
        
        // Si ha pasado más tiempo que el timeout, marcar como offline
        if (timeSinceLastMsg > this.DEVICE_TIMEOUT_MS) {
          // Verificar si el dispositivo ya está marcado como offline
          const device = await storage.getDeviceByDeviceId(deviceId);
          
          // Solo notificar si el estado va a cambiar de online a offline
          if (device && device.status === 'online') {
            log(`Device ${deviceId} has been inactive for ${Math.round(timeSinceLastMsg/1000)}s, marking as offline`, 'mqtt');
            
            await storage.updateDeviceStatus(deviceId, { status: 'offline', lastUpdate: now });
            
            // Notificar a los clientes del cambio de estado
            this.broadcastToClients({
              type: 'device_status_update',
              deviceId,
              status: 'offline',
              previousStatus: 'online',
              timestamp: now.toISOString()
            });
          } else {
            // Si es null o ya está marcado como offline, solo actualizar silenciosamente la BD
            if (device) {
              // No hacemos log para eliminar contaminación del log con mensajes repetitivos
              await storage.updateDeviceStatus(deviceId, { status: 'offline', lastUpdate: now });
            }
          }
          
          // Eliminar de nuestro seguimiento para no notificar repetidamente
          this.deviceLastSeen.delete(deviceId);
        }
      }
    }, 10000); // Revisar cada 10 segundos
    
    log('Started offline detection timer', 'mqtt');
  }

  private async handleMessage(topic: string, messageBuffer: Buffer) {
    try {
      const message = messageBuffer.toString();
      log(`Received message on topic ${topic}: ${message}`, 'mqtt');

      // Procesamos cualquier tópico al que estemos suscritos
      // Verificamos si el formato del mensaje es correcto para un dispositivo KittyPaw
      
      try {
        // Parse message según formato: {"device_id": "THINGNAME", "timestamp": "...", "humidity": h, "temperature": t, "light": light, "weight": weight}
        const kpcData = JSON.parse(message);
        const deviceId = kpcData.device_id;
        
        if (!deviceId) {
          log(`Invalid KPCL0021 message format, missing device_id: ${message}`, 'mqtt');
          return;
        }
        
        // Actualizar el lastSeen del dispositivo
        this.deviceLastSeen.set(deviceId, new Date());
        
        // Asegurarse de que el timer está funcionando
        if (!this.offlineCheckTimer) {
          this.startOfflineCheckTimer();
        }
        
        // Check if device exists, if not create it
        let device = await storage.getDeviceByDeviceId(deviceId);
        
        // Estado del dispositivo, por defecto 'online' si no se especifica
        const deviceStatus = kpcData.status || 'online';
        
        if (!device) {
          // Si el dispositivo no existe, lo creamos
          device = await storage.createDevice({
            deviceId,
            name: `Kitty Paw Device ${deviceId}`,
            type: 'KittyPaw',
            status: deviceStatus,
            batteryLevel: 100
          });
        } else {
          // Si el dispositivo existe, verificamos si el estado cambió antes de notificar
          const currentDevice = await storage.getDeviceByDeviceId(deviceId);
          
          // Solo consideramos un cambio de estado real entre valores diferentes
          // Hay dos posibles cambios reales: de online a offline o de offline a online
          const stateChanged = (currentDevice && currentDevice.status === 'online' && deviceStatus === 'offline') ||
                               (currentDevice && currentDevice.status === 'offline' && deviceStatus === 'online');
          
          // Debug logs solo para nosotros
          if (currentDevice && currentDevice.status !== deviceStatus) {
            log(`Potential status change for ${deviceId}: ${currentDevice.status} -> ${deviceStatus}. Will notify: ${stateChanged}`, 'mqtt');
          }
          
          // Guardar el estado anterior para comparar después de la actualización
          const previousStatus = currentDevice ? currentDevice.status : null;
          
          // Actualizar el estado en la base de datos
          await storage.updateDeviceStatus(deviceId, { status: deviceStatus, lastUpdate: new Date() });
          
          // Obtenemos el dispositivo actualizado para verificar que el cambio se haya aplicado
          const updatedDevice = await storage.getDeviceByDeviceId(deviceId);
          
          // Verificar que el cambio se aplicó correctamente
          if (updatedDevice && updatedDevice.status !== previousStatus) {
            log(`Device ${deviceId} state updated from ${previousStatus} to ${updatedDevice.status}`, 'mqtt');
            
            // Notificar a los clientes SOLO si el estado cambió
            if (stateChanged) {
              this.broadcastToClients({
                type: 'device_status_update',
                deviceId,
                status: deviceStatus,
                previousStatus: previousStatus,
                timestamp: new Date().toISOString()
              });
            }
          } else if (updatedDevice) {
            log(`Warning: Failed to update device ${deviceId} status from ${previousStatus} to ${deviceStatus}. Current status: ${updatedDevice.status}`, 'mqtt');
          }
        }
        
        // Procesar los diferentes tipos de sensores incluidos en el mensaje (humidity, temperature, light, weight)
        // y crearlos como sensores independientes
        
        // Procesar temperatura
        if (kpcData.temperature !== undefined) {
          const tempData = {
            value: kpcData.temperature,
            unit: '°C',
            timestamp: kpcData.timestamp
          };
          
          const sensorData = await storage.createSensorData({
            deviceId,
            sensorType: 'temperature',
            data: tempData
          });
          
          this.broadcastToClients({
            type: 'sensor_data',
            deviceId,
            sensorType: 'temperature',
            data: tempData,
            timestamp: sensorData.timestamp
          });
        }
        
        // Procesar humedad
        if (kpcData.humidity !== undefined) {
          const humidityData = {
            value: kpcData.humidity,
            unit: '%',
            timestamp: kpcData.timestamp
          };
          
          const sensorData = await storage.createSensorData({
            deviceId,
            sensorType: 'humidity',
            data: humidityData
          });
          
          this.broadcastToClients({
            type: 'sensor_data',
            deviceId,
            sensorType: 'humidity',
            data: humidityData,
            timestamp: sensorData.timestamp
          });
        }
        
        // Procesar luz
        if (kpcData.light !== undefined) {
          const lightData = {
            value: kpcData.light,
            unit: 'lux',
            timestamp: kpcData.timestamp
          };
          
          const sensorData = await storage.createSensorData({
            deviceId,
            sensorType: 'light',
            data: lightData
          });
          
          this.broadcastToClients({
            type: 'sensor_data',
            deviceId,
            sensorType: 'light',
            data: lightData,
            timestamp: sensorData.timestamp
          });
        }
        
        // Procesar peso
        if (kpcData.weight !== undefined) {
          const weightData = {
            value: kpcData.weight,
            unit: 'g',
            timestamp: kpcData.timestamp
          };
          
          const sensorData = await storage.createSensorData({
            deviceId,
            sensorType: 'weight',
            data: weightData
          });
          
          this.broadcastToClients({
            type: 'sensor_data',
            deviceId,
            sensorType: 'weight',
            data: weightData,
            timestamp: sensorData.timestamp
          });
        }
        
        // Update system metrics and broadcast
        const metrics = await storage.getSystemMetrics();
        this.broadcastToClients({
          type: 'system_metrics',
          metrics
        });
      } catch (error) {
        log(`Error processing MQTT message on topic ${topic}: ${error}`, 'mqtt');
      }
    } catch (error) {
      log(`Error handling MQTT message: ${error}`, 'mqtt');
    }
  }

  // Método para verificar si el cliente MQTT está conectado
  isConnected(): boolean {
    return this.client !== null && this.client.connected === true;
  }
  
  addWebSocket(ws: WebSocket) {
    this.webSockets.add(ws);
    log(`WebSocket client connected. Total clients: ${this.webSockets.size}`, 'mqtt');

    // Send initial connection status
    if (this.client) {
      ws.send(JSON.stringify({
        type: 'mqtt_status',
        status: this.client.connected ? 'connected' : 'disconnected',
      }));
    }
  }

  removeWebSocket(ws: WebSocket) {
    this.webSockets.delete(ws);
    log(`WebSocket client disconnected. Total clients: ${this.webSockets.size}`, 'mqtt');
  }

  private broadcastToClients(data: any) {
    const message = JSON.stringify(data);
    // Convert Set to Array before iteration to avoid ES2015 target issues
    Array.from(this.webSockets).forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  async loadAndConnect(userId: number) {
    try {
      // Get the user to retrieve their householdId
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
      }
      const householdId = user.householdId;

      // Obtener la configuración de AWS IoT Core desde las variables de entorno
      const awsIotMqttHost = process.env.AWS_IOT_MQTT_HOST;
      const awsIotCertCaPath = process.env.AWS_IOT_CERT_CA_PATH;
      const awsIotCertClientPath = process.env.AWS_IOT_CERT_CLIENT_PATH;
      const awsIotPrivateKeyPath = process.env.AWS_IOT_PRIVATE_KEY_PATH;

      if (!awsIotMqttHost || !awsIotCertCaPath || !awsIotCertClientPath || !awsIotPrivateKeyPath) {
        log('AWS IoT Core environment variables are not fully configured. Falling back to public broker for testing.', 'mqtt');
        const defaultBrokerUrl = 'mqtt://broker.emqx.io:1883';
        const defaultClientId = `kitty-paw-${Math.random().toString(16).substring(2, 10)}`;
        
        let connection = await storage.getMqttConnectionByUserId(userId);
        if (!connection) {
          connection = await storage.createMqttConnection({
            userId: userId,
            brokerUrl: defaultBrokerUrl, 
            clientId: defaultClientId
          });
        }
        this.connectionId = connection.id;
        await this.connect(defaultBrokerUrl, defaultClientId);
      } else {
        log('Using AWS IoT Core configuration.', 'mqtt');
        const brokerUrl = `mqtts://${awsIotMqttHost}:8883`;
        const clientId = `kitty-paw-backend-${Math.random().toString(16).substring(2, 10)}`; // Unique client ID for backend

        // Leer los contenidos de los certificados
        const caCert = fs.readFileSync(awsIotCertCaPath).toString();
        const clientCert = fs.readFileSync(awsIotCertClientPath).toString();
        const privateKey = fs.readFileSync(awsIotPrivateKeyPath).toString();

        // Create a default connection in storage o actualizarlo si ya existe
        let connection = await storage.getMqttConnectionByUserId(userId);
        if (!connection) {
          connection = await storage.createMqttConnection({
            userId: userId,
            brokerUrl: brokerUrl, 
            clientId: clientId
          });
        }
        this.connectionId = connection.id;
        await this.connect(brokerUrl, clientId, undefined, undefined, caCert, clientCert, privateKey);
      }
      
      // --- Device Initialization and Dynamic Topic Subscription ---

      // For prototyping, ensure default devices exist
      const householdId = user.householdId; // Assuming user object is available from earlier in the function
      let device1 = await storage.getDeviceByDeviceId('KPCL0021');
      if (!device1) {
        await storage.createDevice({ deviceId: 'KPCL0021', name: 'Collar de Malto', type: 'KittyPaw Collar', status: 'online', batteryLevel: 95, householdId: householdId, mode: 'collar' });
      }
      let device2 = await storage.getDeviceByDeviceId('KPCL0022');
      if (!device2) {
        await storage.createDevice({ deviceId: 'KPCL0022', name: 'Placa de Canela', type: 'KittyPaw Tracker', status: 'online', batteryLevel: 85, householdId: householdId, mode: 'collar' });
      }

      // Dynamically subscribe to topics for all devices in the database
      log('Fetching all devices for dynamic topic subscription...', 'mqtt');
      const allDevices = await storage.getDevices();
      for (const device of allDevices) {
        this.addTopic(`${device.deviceId}/pub`);
        this.addTopic(`${device.deviceId}/sub`);
      }
      log(`Dynamically subscribed to topics for ${allDevices.length} devices.`, 'mqtt');
      
      // Iniciar el temporizador de detección de dispositivos inactivos
      this.startOfflineCheckTimer();
      
      // Registrar ambos dispositivos para el monitoreo de actividad
      // Usamos el doble del intervalo para asegurar que se marque como offline si no recibe datos
      const now = new Date();
      
      // Registramos KPCL0021 con un timestamp antiguo para que se marque como offline
      // si no recibimos datos pronto
      this.deviceLastSeen.set('KPCL0021', new Date(now.getTime() - this.DEVICE_TIMEOUT_MS - 1000));
      
      // Para KPCL0022, lo ponemos como "recién visto" para darle tiempo a recibir datos
      this.deviceLastSeen.set('KPCL0022', now);
      
      // Realizar una verificación inmediata (después de un breve retardo)
      setTimeout(() => {
        if (this.offlineCheckTimer) {
          clearInterval(this.offlineCheckTimer);
        }
        this.startOfflineCheckTimer();
      }, 5000); // 5 segundos de retraso
      
      return true;
    } catch (error: any) {
      log(`Error loading MQTT connection: ${error.stack}`, 'mqtt');
      return false;
    }
  }

  // Generate some random sensor data for testing (when real data isn't available)
  // Método público para publicar un mensaje MQTT
  publish(topic: string, message: string | object): boolean {
    if (!this.client || !this.client.connected) {
      log(`Cannot publish: MQTT client not connected`, 'mqtt');
      return false;
    }
    
    // Si el mensaje es un objeto, convertirlo a string
    const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
    
    this.client.publish(topic, messageStr);
    
    // Si el mensaje contiene un device_id y un status, actualizar el timestamp de lastSeen
    try {
      if (typeof message === 'string') {
        const parsedMsg = JSON.parse(message);
        if (parsedMsg.device_id) {
          // Actualizar lastSeen para este dispositivo
          this.deviceLastSeen.set(parsedMsg.device_id, new Date());
        }
      } else if (typeof message === 'object' && (message as any).device_id) {
        // Actualizar lastSeen para este dispositivo
        this.deviceLastSeen.set((message as any).device_id, new Date());
      }
    } catch (error) {
      // Ignorar errores de parsing
    }
    
    return true;
  }
  
  // La generación de datos aleatorios ha sido eliminada para usar solo datos reales
  async generateRandomData() {
    // Función deshabilitada para usar solo datos reales del broker MQTT
    return;
  }
}

export const mqttClient = new MqttClient();
