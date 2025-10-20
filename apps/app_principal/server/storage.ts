import type {
  User,
  InsertUser,
  Device,
  InsertDevice,
  Pet,
  InsertPet,
  ConsumptionEvent,
  InsertConsumptionEvent,
  SensorReading,
  SystemMetrics,
  MqttConnection,
  InsertMqttConnection
} from "@shared/schema";
import { DatabaseStorage } from './database-storage';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;

  // Device operations
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceByDeviceId(deviceId: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDeviceStatus(deviceId: string, status: string): Promise<void>;
  updateDeviceBattery(deviceId: string, batteryLevel: number): Promise<void>;

  // Consumption events operations
  getConsumptionEvents(deviceId: number, limit?: number): Promise<ConsumptionEvent[]>;
  createConsumptionEvent(data: InsertConsumptionEvent): Promise<ConsumptionEvent>;
  getLatestReadings(): Promise<SensorReading[]>;
  getSensorData(deviceId: string, limit?: number): Promise<SensorReading[]>;
  getSensorDataByType(deviceId: string, type: string, limit?: number): Promise<SensorReading[]>;

  // MQTT connection operations
  getMqttConnection(id: number): Promise<MqttConnection | undefined>;
  getMqttConnectionByUserId(userId: number): Promise<MqttConnection | undefined>;
  createMqttConnection(connection: InsertMqttConnection): Promise<MqttConnection>;
  updateMqttConnectionStatus(id: number, connected: boolean): Promise<void>;

  // System operations
  getSystemMetrics(): Promise<SystemMetrics>;
  
  // Pet operations
  getPets(): Promise<Pet[]>;
  getPetsByHouseholdId(householdId: number): Promise<Pet[]>;
  getPet(id: number): Promise<Pet | undefined>;
  getPetByChipNumber(chipNumber: string): Promise<Pet | undefined>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: number, pet: Partial<InsertPet>): Promise<Pet>;
  deletePet(id: number): Promise<boolean>;

  // Data initialization
  getOrCreateHousehold(name: string): Promise<{ id: number }>;
  getOrCreateUser(username: string, password: string, email: string, householdId: number): Promise<{ id: number }>;
  getOrCreatePet(name: string, householdId: number): Promise<{ id: number }>;
  getOrCreateDevice(deviceId: string, name: string, mode: string, householdId: number): Promise<{ id: number }>;
  associatePetToDevice(petId: number, deviceId: number): Promise<void>;
}

// Exportamos la implementación de base de datos PostgreSQL
export const storage = new DatabaseStorage();