import request from 'supertest';
import express from 'express';
import { apiRouter } from "../../server/routes";
import { storage } from './storage';
import { db } from './db';
import type { User, Device, ConsumptionEvent } from '@shared/schema';

// Mock la capa de storage y la base de datos
jest.mock('./storage');
jest.mock('./db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([]), // Default a un array vacío
  },
}));

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

// Tipamos los mocks para tener autocompletado y seguridad de tipos
const mockedStorage = storage as jest.Mocked<typeof storage>;
const mockedDb = db as jest.Mocked<typeof db>;

describe('API Routes', () => {
  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return a list of users', async () => {
      const mockUsers: User[] = [
        { id: 1, username: 'admin', name: 'Admin User', role: 'admin', lastLogin: new Date(), householdId: 1, password: 'xxx' },
        { id: 2, username: 'jdayne', name: 'Javier Dayne', role: 'owner', lastLogin: new Date(), householdId: 1, password: 'xxx' },
      ];
      mockedStorage.getUsers.mockResolvedValue(mockUsers);

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(mockedStorage.getUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when fetching users', async () => {
      mockedStorage.getUsers.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch users' });
    });
  });

  describe('GET /api/devices', () => {
    it('should return all devices if no username is provided', async () => {
      const mockDevices: Device[] = [
        { id: 1, deviceId: 'DEV001', name: 'Device 1', type: 'Feeder', householdId: 1, status: 'online', batteryLevel: 90, lastUpdate: new Date() },
      ];
      mockedStorage.getDevices.mockResolvedValue(mockDevices);

      const response = await request(app).get('/api/devices');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDevices);
      expect(mockedStorage.getDevices).toHaveBeenCalledTimes(1);
    });

    it('should return devices for a specific user', async () => {
      const mockUser: User = { id: 2, username: 'jdayne', name: 'Javier', role: 'owner', householdId: 1, lastLogin: new Date(), password: 'xxx' };
      const mockUserDevices: Device[] = [
        { id: 1, deviceId: 'DEV001', name: 'Device 1', type: 'Feeder', householdId: 1, status: 'online', batteryLevel: 90, lastUpdate: new Date() },
      ];
      
      mockedStorage.getUserByUsername.mockResolvedValue(mockUser);
      // Mockeamos la respuesta de la query a la BD
      (mockedDb.where as jest.Mock).mockResolvedValue(mockUserDevices);

      const response = await request(app).get('/api/devices?username=jdayne');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserDevices);
      expect(mockedStorage.getUserByUsername).toHaveBeenCalledWith('jdayne');
      expect(mockedDb.where).toHaveBeenCalled();
    });

    it('should return an empty array for a user with no household', async () => {
        const mockUser: User = { id: 3, username: 'nouser', name: 'No User', role: 'owner', householdId: null, lastLogin: new Date(), password: 'xxx' };
        mockedStorage.getUserByUsername.mockResolvedValue(mockUser);

        const response = await request(app).get('/api/devices?username=nouser');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/sensor-data/:deviceId', () => {
    it('should return consumption events for a valid deviceId', async () => {
      const mockDevice: Device = { id: 1, deviceId: 'DEV001', name: 'Device 1', type: 'Feeder', householdId: 1, status: 'online', batteryLevel: 90, lastUpdate: new Date() };
      const mockEvents: ConsumptionEvent[] = [
        { id: 1, deviceId: 1, amountGrams: 50, durationSeconds: 30, timestamp: new Date() },
      ];

      mockedStorage.getDeviceByDeviceId.mockResolvedValue(mockDevice);
      mockedStorage.getConsumptionEvents.mockResolvedValue(mockEvents);

      const response = await request(app).get('/api/sensor-data/DEV001');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      // Comparamos los timestamps como strings para evitar problemas de formato
      expect(response.body[0].amountGrams).toBe(mockEvents[0].amountGrams);
      expect(new Date(response.body[0].timestamp).toISOString()).toBe(mockEvents[0].timestamp.toISOString());
      expect(mockedStorage.getDeviceByDeviceId).toHaveBeenCalledWith('DEV001');
      expect(mockedStorage.getConsumptionEvents).toHaveBeenCalledWith(mockDevice.id, 50);
    });

    it('should return 404 if deviceId is not found', async () => {
      mockedStorage.getDeviceByDeviceId.mockResolvedValue(undefined);

      const response = await request(app).get('/api/sensor-data/UNKNOWN');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Device not found' });
    });
  });
});