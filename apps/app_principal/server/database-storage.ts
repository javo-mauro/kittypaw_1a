import {
  users,
  devices,
  pets,
  consumptionEvents,
  type User,
  type InsertUser,
  type Device,
  type InsertDevice,
  type Pet,
  type InsertPet,
  type ConsumptionEvent,
  type InsertConsumptionEvent,
  type SensorReading,
  type SystemMetrics
} from "@shared/schema";
import { db } from './db';
import { eq, desc, sql, and, isNull, asc } from 'drizzle-orm';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async updateDeviceStatus(deviceId: string, status: string): Promise<void> {
    await db.update(devices)
      .set({ 
        status,
        lastUpdate: new Date()
      })
      .where(eq(devices.deviceId, deviceId));
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
    // This query now gets the latest consumption event for each device.
    const latestReadingsQuery = `
      WITH latest AS (
        SELECT DISTINCT ON (device_id)
          device_id,
          amount_grams,
          timestamp
        FROM consumption_events
        ORDER BY device_id, timestamp DESC
      )
      SELECT 
        l.device_id as "deviceId",
        'consumption' as "sensorType",
        l.amount_grams as "value",
        'grams' as "unit",
        l.timestamp as "timestamp"
      FROM latest l
      ORDER BY l.device_id
    `;
    
    const result = await db.execute(sql.raw(latestReadingsQuery));
    return result.rows as SensorReading[];
  }

  // MQTT connection operations
  // TODO: The mqttConnections table is not part of the current schema.
  // These methods need to be reviewed and reimplemented if MQTT configuration storage is needed.
  // async getMqttConnection(id: number): Promise<MqttConnection | undefined> {
  //   const [connection] = await db.select().from(mqttConnections).where(eq(mqttConnections.id, id));
  //   return connection;
  // }
  //
  // async getMqttConnectionByUserId(userId: number): Promise<MqttConnection | undefined> {
  //   const [connection] = await db.select()
  //     .from(mqttConnections)
  //     .where(eq(mqttConnections.userId, userId));
  //   return connection;
  // }
  //
  // async createMqttConnection(connection: InsertMqttConnection): Promise<MqttConnection> {
  //   const [newConnection] = await db.insert(mqttConnections)
  //     .values({
  //       ...connection,
  //       connected: false,
  //       lastConnected: new Date()
  //     })
  //     .returning();
  //   return newConnection;
  // }
  //
  // async updateMqttConnectionStatus(id: number, connected: boolean): Promise<void> {
  //   await db.update(mqttConnections)
  //     .set({ 
  //       connected,
  //       lastConnected: connected ? new Date() : undefined
  //     })
  //     .where(eq(mqttConnections.id, id));
  // }

  // System operations
  async getSystemMetrics(): Promise<SystemMetrics> {
    // Contar dispositivos activos (con estado "online")
    const activeDevicesResult = await db.select({
      count: sql<number>`count(*)`,
    })
    .from(devices)
    .where(eq(devices.status, 'online'));
    
    // Contar dispositivos que han enviado datos en los últimos 15 minutos
    const activeSensorsQuery = `
      SELECT COUNT(DISTINCT device_id) as count
      FROM consumption_events
      WHERE timestamp > NOW() - INTERVAL '15 minutes'
    `;
    const activeSensorsResult = await db.execute(sql.raw(activeSensorsQuery));
    
    // Contar alertas (por implementar, por ahora devuelve 0)
    const alertsCount = 0;
    
    return {
      activeDevices: activeDevicesResult[0]?.count || 0,
      activeSensors: parseInt(activeSensorsResult.rows[0]?.count || '0'),
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
  
  // This function is deprecated as the relationship is now managed by the petsToDevices table.
  // async getPetByKittyPawDeviceId(deviceId: string): Promise<Pet | undefined> {
  //   const [pet] = await db.select()
  //     .from(pets)
  //     .where(eq(pets.kittyPawDeviceId, deviceId));
  //   return pet;
  // }
}