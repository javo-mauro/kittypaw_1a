import {
  users,
  devices,
  pets,
  consumptionEvents,
  mqttConnections,
  households,
  petsToDevices,
  type User,
  type InsertUser,
  type Device,
  type InsertDevice,
  type Pet,
  type InsertPet,
  type ConsumptionEvent,
  type InsertConsumptionEvent,
  type SensorReading,
  type SystemMetrics,
  type MqttConnection,
  type InsertMqttConnection
} from "@shared/schema";
import { db } from './db';
import { eq, desc, sql, and, isNull, asc, gt } from 'drizzle-orm';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    console.log(`[Storage] Attempting to get user by ID: ${id}`);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) {
      console.log(`[Storage] Found user by ID: ${user.id}`);
    } else {
      console.log(`[Storage] User with ID ${id} not found.`);
    }
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  // Device operations
  async getDevices(): Promise<Device[]> {
    return db.select().from(devices).orderBy(asc(devices.id));
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async getDeviceByDeviceId(deviceId: string): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.deviceId, deviceId));
    return device;
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const [newDevice] = await db.insert(devices)
      .values({
        ...device,
        lastUpdate: new Date()
      })
      .returning();
    return newDevice;
  }

  async updateDeviceStatus(deviceId: string, updates: Record<string, any>): Promise<void> {
    try {
      console.log(`[DB] Intentando actualizar dispositivo ${deviceId} con:`, updates);

      const keys = Object.keys(updates);
      if (keys.length === 0) {
        console.warn(`[DB] No hay campos que actualizar para el dispositivo ${deviceId}`);
        return;
      }

      await db.update(devices)
        .set(updates)
        .where(eq(devices.deviceId, deviceId));

      console.log(`[DB] Dispositivo ${deviceId} actualizado correctamente`);
    } catch (error) {
      console.error(`[DB] Error actualizando estado del dispositivo ${deviceId}:`, error);
    }
  }

  async updateDeviceBattery(deviceId: string, batteryLevel: number): Promise<void> {
    await db.update(devices)
      .set({ 
        batteryLevel,
        lastUpdate: new Date()
      })
      .where(eq(devices.deviceId, deviceId));
  }

  // Consumption events operations
  async getConsumptionEvents(deviceId: number, limit = 100): Promise<ConsumptionEvent[]> {
    return db.select()
      .from(consumptionEvents)
      .where(eq(consumptionEvents.deviceId, deviceId))
      .orderBy(desc(consumptionEvents.timestamp))
      .limit(limit);
  }

  async createConsumptionEvent(data: InsertConsumptionEvent): Promise<ConsumptionEvent> {
    const [newEvent] = await db.insert(consumptionEvents)
      .values({
        ...data,
        timestamp: new Date()
      })
      .returning();
    return newEvent;
  }

  async getLatestReadings(): Promise<SensorReading[]> {
    const result = await db
      .selectDistinctOn([consumptionEvents.deviceId], {
        deviceId: consumptionEvents.deviceId,
        sensorType: sql<string>`'consumption'`,
        value: consumptionEvents.amountGrams,
        unit: sql<string>`'grams'`,
        timestamp: consumptionEvents.timestamp,
      })
      .from(consumptionEvents)
      .orderBy(consumptionEvents.deviceId, desc(consumptionEvents.timestamp));

    return result as SensorReading[];
  }

  // MQTT connection operations
  async getMqttConnection(id: number): Promise<MqttConnection | undefined> {
    const [connection] = await db.select().from(mqttConnections).where(eq(mqttConnections.id, id));
    return connection;
  }

  async getMqttConnectionByUserId(userId: number): Promise<MqttConnection | undefined> {
    const [connection] = await db.select()
      .from(mqttConnections)
      .where(eq(mqttConnections.userId, userId));
    return connection;
  }

  async createMqttConnection(connection: InsertMqttConnection): Promise<MqttConnection> {
    const [newConnection] = await db.insert(mqttConnections)
      .values({
        ...connection,
        connected: false,
        lastConnected: new Date()
      })
      .returning();
    return newConnection;
  }

  async updateMqttConnectionStatus(id: number, connected: boolean): Promise<void> {
    await db.update(mqttConnections)
      .set({ 
        connected,
        lastConnected: connected ? new Date() : undefined
      })
      .where(eq(mqttConnections.id, id));
  }

  // System operations
  async getSystemMetrics(): Promise<SystemMetrics> {
    // Contar dispositivos activos (con estado "online")
    const activeDevicesResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM devices WHERE status = 'online'`));
    
    // Contar dispositivos que han enviado datos en los últimos 15 minutos
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeSensorsResult = await db.select({
      count: sql<number>`count(DISTINCT ${consumptionEvents.deviceId})`,
    })
    .from(consumptionEvents)
    .where(gt(consumptionEvents.timestamp, fifteenMinutesAgo));
    
    // Contar alertas (por implementar, por ahora devuelve 0)
    const alertsCount = 0;
    
    return {
      activeDevices: activeDevicesResult[0]?.count || 0,
      activeSensors: activeSensorsResult[0]?.count || 0,
      alerts: alertsCount,
      lastUpdate: new Date().toISOString()
    };
  }
  
  // Pet owner operations
  // TODO: All pet owner operations have been removed as they are part of a legacy schema.
  // These should be reimplemented based on the 'users' and 'households' schema if needed.
  
  // Pet operations
  async getPets(): Promise<Pet[]> {
    return db.select().from(pets);
  }

  async getPetsByHouseholdId(householdId: number): Promise<Pet[]> {
    return db.select()
      .from(pets)
      .where(eq(pets.householdId, householdId));
  }
  
  // This function is deprecated as pets are now related to households, not owners directly.
  // async getPetsByOwnerId(ownerId: number): Promise<Pet[]> {
  //   return db.select()
  //     .from(pets)
  //     .where(eq(pets.ownerId, ownerId));
  // }
  
  async getPet(id: number): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet;
  }
  
  async getPetByChipNumber(chipNumber: string): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.chipNumber, chipNumber));
    return pet;
  }
  
  async createPet(pet: InsertPet): Promise<Pet> {
    const now = new Date();
    const [newPet] = await db.insert(pets)
      .values({
        ...pet,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newPet;
  }
  
  async updatePet(id: number, pet: Partial<InsertPet>): Promise<Pet> {
    const [updatedPet] = await db.update(pets)
      .set({
        ...pet,
        updatedAt: new Date()
      })
      .where(eq(pets.id, id))
      .returning();
    return updatedPet;
  }
  
  async deletePet(id: number): Promise<boolean> {
    const result = await db.delete(pets)
      .where(eq(pets.id, id))
      .returning({ id: pets.id });
    return result.length > 0;
  }

  // Data initialization
  async getOrCreateHousehold(name: string): Promise<{ id: number }> {
    const [household] = await db.select().from(households).where(eq(households.name, name));
    if (household) {
      return household;
    }
    const [newHousehold] = await db.insert(households).values({ name }).returning();
    return newHousehold;
  }

  async getOrCreateUser(username: string, password: string, email: string, householdId: number): Promise<User> {
    console.log(`[Storage] Attempting to get or create user: ${username}`);
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (user) {
      console.log(`[Storage] Found existing user: ${user.id}`);
      return user;
    }
    console.log(`[Storage] Creating new user: ${username}`);
    const [newUser] = await db.insert(users).values({ username, password, email, householdId, name: username }).returning();
    console.log(`[Storage] Created new user with ID: ${newUser.id}`);
    return newUser;
  }

  async getOrCreatePet(name: string, householdId: number): Promise<{ id: number }> {
    const [pet] = await db.select().from(pets).where(and(eq(pets.name, name), eq(pets.householdId, householdId)));
    if (pet) {
      return pet;
    }
    const [newPet] = await db.insert(pets).values({ name, householdId }).returning();
    return newPet;
  }

  async getOrCreateDevice(deviceId: string, name: string, mode: string, householdId: number): Promise<{ id: number }> {
    const [device] = await db.select().from(devices).where(eq(devices.deviceId, deviceId));
    if (device) {
      return device;
    }
    const [newDevice] = await db.insert(devices).values({ deviceId, name, mode, householdId }).returning();
    return newDevice;
  }

  async associatePetToDevice(petId: number, deviceId: number): Promise<void> {
    const [association] = await db.select().from(petsToDevices).where(and(eq(petsToDevices.petId, petId), eq(petsToDevices.deviceId, deviceId)));
    if (!association) {
      await db.insert(petsToDevices).values({ petId, deviceId });
        }
      }
    }