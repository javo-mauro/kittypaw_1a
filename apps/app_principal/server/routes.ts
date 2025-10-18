import express, { type Express, type Request, type Response, type Router } from "express";
import { createServer, type Server as HttpServer } from "http";
import { storage } from "./storage";
import { mqttClient } from "./mqtt";
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";
import {
  insertDeviceSchema,
  insertUserSchema,
  insertMqttConnectionSchema,
  insertPetSchema,
} from "@shared/schema";
import { log } from "./vite";

// Handles initial setup and regular data generation when no real MQTT data is available
let dataGenerationInterval: NodeJS.Timeout | null = null;

export async function registerRoutes(app: Express): Promise<HttpServer> {
  const httpServer = createServer(app);
  const apiRouter: Router = express.Router();

  // Setup WebSocket server
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws: WebSocket) => {
    // Add client to MQTT broadcast list
    mqttClient.addWebSocket(ws);

    // Handle WebSocket messages from clients
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle different message types
        if (data.type === 'connect_mqtt' && data.broker && data.clientId) {
          const success = await mqttClient.connect(data.broker, data.clientId, data.username, data.password);
          ws.send(JSON.stringify({ 
            type: 'mqtt_status', 
            status: success ? 'connected' : 'connection_error',
            broker: data.broker 
          }));
        }
      } catch (error) {
        log(`WebSocket message error: ${error}`, 'ws');
      }
    });

    // Remove client when disconnected
    ws.on('close', () => {
      mqttClient.removeWebSocket(ws);
    });

    // Send initial data to the client
    sendInitialData(ws);
  });

  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });


  // API routes
  // Endpoint para inicio de sesión
  apiRouter.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      console.log(`Intento de inicio de sesión para: ${username}`);
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Se requiere nombre de usuario y contraseña' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log(`Usuario no encontrado: ${username}`);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      if (user.password !== password) {
        console.log(`Contraseña incorrecta para: ${username}`);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      await storage.updateUserLastLogin(user.id);
      
      const { password: _, ...safeUser } = user;
      
      res.json({
        success: true,
        user: safeUser
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error al procesar la solicitud de inicio de sesión' });
    }
  });
  
  // TODO: Implement actual session invalidation for production.
  apiRouter.post('/auth/logout', async (req: Request, res: Response) => {
    // En una aplicación real, aquí invalidaríamos la sesión
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  });
  
  apiRouter.get('/user/current', async (req: Request, res: Response) => {
    // En un sistema real, obtendríamos el ID del usuario de la sesión
    // Por ahora, usamos el ID proporcionado en la solicitud, o el usuario 1 por defecto
    // TODO: Replace hardcoded userId with dynamic user identification from session/authentication for production.
    const userId = parseInt(req.query.userId as string) || 1;
    const user = await storage.getUser(userId);
    
    if (user) {
      // Don't send password
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
  
  // TODO: Replace with actual database interaction for production.
  apiRouter.get('/users', async (req: Request, res: Response) => {
    try {
      // Obtener todos los usuarios del sistema desde el storage
      // Ahora solo mostramos a Javier Dayne como administrador
      const users = [
        { id: 1, username: 'admin', name: 'Javier Dayne', role: 'admin', lastLogin: new Date().toISOString() },
        { id: 2, username: 'jdayne', name: 'Javier Dayne', role: 'owner', lastLogin: new Date().toISOString() },
      ];
      
      res.json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ message: 'Error al obtener los usuarios del sistema' });
    }
  });

  apiRouter.post('/auth/switch-user', async (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: 'Se requiere el nombre de usuario' });
      }

      // Para este ejemplo, simulamos un cambio de usuario exitoso
      // Solo permitimos cambiar entre admin y jdayne
      if (username === 'admin' || username === 'jdayne') {
        // Verificar si ya existe el dispositivo
        const existingDevice = await storage.getDeviceByDeviceId('KPCL0021');
        
        if (!existingDevice) {
          // Asociamos un dispositivo específico al usuario
          const device = {
            deviceId: 'KPCL0021',
            name: 'KittyPaw de Malto',
            type: 'KittyPaw Collar',
            status: 'online',
            batteryLevel: 78,
            lastUpdate: new Date().toISOString()
          };
          await storage.createDevice(device);
          
          /*
          // Generar algunos datos de sensores para este dispositivo
          const sensorTypes = ['temperature', 'humidity', 'activity', 'weight'];
          const now = new Date();
          
          for (let i = 0; i < 10; i++) {
            const pastTime = new Date(now.getTime() - (i * 3600000)); // Horas atrás
            
            for (const type of sensorTypes) {
              let value = 0;
              let unit = '';
              
              switch (type) {
                case 'temperature':
                  value = 37 + (Math.random() * 2 - 1); // Entre 36 y 38
                  unit = '°C';
                  break;
                case 'humidity':
                  value = 45 + (Math.random() * 10); // Entre 45 y 55
                  unit = '%';
                  break;
                case 'activity':
                  value = Math.floor(Math.random() * 100); // Entre 0 y 100
                  unit = 'mov/h';
                  break;
                case 'weight':
                  value = 5 + (Math.random() * 0.5 - 0.25); // Entre 4.75 y 5.25
                  unit = 'kg';
                  break;
              }
              
              await storage.createSensorData({
                deviceId: 'KPCL0021',
                sensorType: type,
                data: { value, unit }
              });
            }
          }
          */
        }

        let role = 'owner';
        let name = 'Javier Dayne';
        if (username === 'admin') {
          role = 'admin';
        }

        // Enviamos respuesta completa con toda la info del usuario
        res.json({ 
          success: true, 
          message: `Has cambiado al usuario ${username}`,
          user: { 
            id: username === 'admin' ? 1 : 2,
            username, 
            name,
            role, 
            lastLogin: new Date().toISOString() 
          }
        });
      } else {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
    } catch (error) {
      console.error('Error switching user:', error);
      res.status(500).json({ message: 'Error al cambiar de usuario' });
    }
  });

  apiRouter.get('/devices', async (req: Request, res: Response) => {
    try {
      // Verificar si se solicitan dispositivos para un usuario específico
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      const username = req.query.username as string || null;
      
      // Obtener todos los dispositivos
      const allDevices = await storage.getDevices();
      
      // Si no hay filtro, devolver todos los dispositivos (sólo para admin)
      if (!userId && !username) {
        res.json(allDevices);
        return;
      }
      
      // Filtrar dispositivos según el usuario
      let filteredDevices = allDevices;
      
      // Permitir que jdayne y admin vean todos los dispositivos
      if (username === 'admin' || userId === 1) {
        filteredDevices = allDevices; // El admin ve todos los dispositivos
      }
      // Para usuario "jdayne" asegurar que vea ambos dispositivos
      else if (username === 'jdayne' || userId === 2) {
        filteredDevices = allDevices;
      }
      // TODO: Refactor device filtering for other users based on household and petsToDevices.
      // The previous logic using storage.getPetsByOwnerId is obsolete.
      else if (userId) {
        filteredDevices = []; // Placeholder: No devices shown until refactored.
      }
      
      res.json(filteredDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ message: 'Error retrieving devices' });
    }
  });

  apiRouter.post('/devices', async (req: Request, res: Response) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(deviceData);
      
      // Suscribirnos al tópico del dispositivo recién creado
      if (device && device.deviceId) {
        mqttClient.addTopic(device.deviceId);
        log(`Auto-subscribing to new device topic: ${device.deviceId}`, 'express');
      }
      
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create device' });
      }
    }
  });

  apiRouter.get('/devices/:deviceId', async (req: Request, res: Response) => {
    const device = await storage.getDeviceByDeviceId(req.params.deviceId);
    if (device) {
      res.json(device);
    } else {
      res.status(404).json({ message: 'Device not found' });
    }
  });

  apiRouter.get('/sensor-data/:deviceId', async (req: Request, res: Response) => {
    const { deviceId } = req.params;
    const { type, limit } = req.query;
    
    let data;
    if (type) {
      data = await storage.getSensorDataByType(
        deviceId, 
        type as string, 
        limit ? parseInt(limit as string) : undefined
      );
    } else {
      data = await storage.getSensorData(
        deviceId, 
        limit ? parseInt(limit as string) : undefined
      );
    }
    
    res.json(data);
  });

  apiRouter.get('/latest-readings', async (req: Request, res: Response) => {
    const readings = await storage.getLatestReadings();
    res.json(readings);
  });

  apiRouter.get('/system/metrics', async (req: Request, res: Response) => {
    const metrics = await storage.getSystemMetrics();
    res.json(metrics);
  });

  // TODO: Replace with actual dynamic system information for production.
  apiRouter.get('/system/info', async (req: Request, res: Response) => {
    res.json({
      version: "v2.1.0",
      mqttVersion: "v1.4.3",
      lastUpdate: "2023-10-14"
    });
  });

  apiRouter.get('/mqtt/status', async (req: Request, res: Response) => {
    // TODO: Replace hardcoded userId with dynamic user identification from session/authentication for production.
    const connection = await storage.getMqttConnectionByUserId(1);
    if (connection) {
      // Don't send password or certificate information in the response
      const { password, caCert, clientCert, privateKey, ...safeConnection } = connection;
      
      // Indicar sin revelar contenido si los certificados están presentes
      const connectionInfo = {
        ...safeConnection,
        hasCaCert: !!caCert,
        hasClientCert: !!clientCert,
        hasPrivateKey: !!privateKey
      };
      
      res.json(connectionInfo);
    } else {
      res.status(404).json({ message: 'MQTT connection not found' });
    }
  });

  apiRouter.post('/mqtt/connect', async (req: Request, res: Response) => {
    try {
      const connectionData = insertMqttConnectionSchema.parse(req.body);
      const connection = await storage.createMqttConnection(connectionData);
      
      // Try to connect with the new credentials
      const success = await mqttClient.connect(
        connection.brokerUrl,
        connection.clientId,
        connection.username || undefined,
        connection.password || undefined,
        connection.caCert || undefined,
        connection.clientCert || undefined,
        connection.privateKey || undefined
      );
      
      // Si se proporcionó un tópico adicional, suscribirse a él
      if (success && req.body.topic) {
        mqttClient.addTopic(req.body.topic);
      }
      
      if (success) {
        // Excluir la contraseña y certificados confidenciales de la respuesta
        const { password, caCert, clientCert, privateKey, ...safeConnection } = connection;
        res.status(201).json({ ...safeConnection, connected: true });
      } else {
        res.status(400).json({ message: 'Failed to connect to MQTT broker' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create MQTT connection' });
      }
    }
  });

  // --- Rutas para Mascotas (Pet) ---
  const petRouter: Router = express.Router();

  petRouter.get('/', async (req: Request, res: Response) => {
    try {
      const pets = await storage.getPets();
      res.json(pets);
    } catch (error) {
      console.error('Error fetching pets:', error);
      res.status(500).json({ error: 'Failed to fetch pets' });
    }
  });

  petRouter.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const pet = await storage.getPet(id);
      if (!pet) {
        return res.status(404).json({ error: 'Pet not found' });
      }
      res.json(pet);
    } catch (error) {
      console.error('Error fetching pet:', error);
      res.status(500).json({ error: 'Failed to fetch pet' });
    }
  });

  petRouter.post('/', async (req: Request, res: Response) => {
    try {
      const petData = insertPetSchema.parse(req.body);
      const newPet = await storage.createPet(petData);
      res.status(201).json(newPet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating pet:', error);
      res.status(500).json({ error: 'Failed to create pet' });
    }
  });

  petRouter.put('/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const petData = insertPetSchema.partial().parse(req.body);
      const updatedPet = await storage.updatePet(id, petData);
      res.json(updatedPet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error updating pet:', error);
      res.status(500).json({ error: 'Failed to update pet' });
    }
  });

  petRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deletePet(id);
      if (!result) {
        return res.status(404).json({ error: 'Pet not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting pet:', error);
      res.status(500).json({ error: 'Failed to delete pet' });
    }
  });

  apiRouter.use('/pets', petRouter);

  apiRouter.get('/devices/:deviceId/pet', async (req: Request, res: Response) => {
    try {
      const deviceId = req.params.deviceId;
      const pet = await storage.getPetByKittyPawDeviceId(deviceId);
      
      if (!pet) {
        return res.status(404).json({ message: 'No se encontró mascota asociada a este dispositivo' });
      }
      
      res.json(pet);
    } catch (error) {
      console.error('Error fetching pet by device:', error);
      res.status(500).json({ message: 'Error al obtener la mascota por dispositivo' });
    }
  });

  // Endpoint para suscribirse a un nuevo tópico MQTT
  apiRouter.post('/mqtt/subscribe', async (req: Request, res: Response) => {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: "MQTT topic is required" });
      }
      
      mqttClient.addTopic(topic);
      return res.json({ success: true, message: `Subscribed to topic: ${topic}` });
    } catch (error) {
      console.error("Error subscribing to MQTT topic:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Endpoint para generar datos simulados para un dispositivo específico o todos los dispositivos
  apiRouter.post('/simulate-data', async (req: Request, res: Response) => {
    // La simulación de datos ha sido deshabilitada para usar solo datos reales del broker MQTT
    return res.status(403).json({ 
      success: false, 
      message: "La simulación de datos ha sido deshabilitada. Solo se procesan datos reales del broker MQTT."
    });
  });
  
  app.use('/api', apiRouter);

  // Initialize the MQTT client
  // await mqttClient.loadAndConnect(); // Removed duplicate call
  
  // Solo mantenemos la reconexión automática en caso de desconexión
  // y hemos eliminado toda generación de datos simulados
  if (dataGenerationInterval) {
    clearInterval(dataGenerationInterval);
    log('Desactivada la generación de datos simulados', 'express');
  }
  
  dataGenerationInterval = setInterval(() => {
    // Verificar si el cliente MQTT está conectado
    if (!mqttClient.isConnected()) {
      log('Cliente MQTT desconectado. Reintentando conexión...', 'express');
      mqttClient.loadAndConnect();
    }
  }, 60000);

  return httpServer;
}

async function sendInitialData(ws: WebSocket) {
  try {
    // Send system metrics
    const metrics = await storage.getSystemMetrics();
    ws.send(JSON.stringify({
      type: 'system_metrics',
      metrics
    }));

    // Send device list
    const devices = await storage.getDevices();
    ws.send(JSON.stringify({
      type: 'devices',
      devices
    }));

    // Send latest sensor readings
    const readings = await storage.getLatestReadings();
    ws.send(JSON.stringify({
      type: 'latest_readings',
      readings
    }));

    // Send system info
    ws.send(JSON.stringify({
      type: 'system_info',
      info: {
        version: "v2.1.0",
        mqttVersion: "v1.4.3",
        lastUpdate: "2023-10-14"
      }
    }));
  } catch (error) {
    log(`Error sending initial data: ${error}`, 'ws');
  }
}
