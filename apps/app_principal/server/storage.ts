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
  SystemMetrics
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
}

// Exportamos la implementación de base de datos PostgreSQL
export const storage = new DatabaseStorage();