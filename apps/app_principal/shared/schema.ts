import { pgTable, text, serial, integer, timestamp, date, real, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from 'drizzle-zod';

// --- ENUMS ---
export const userRoleEnum = pgEnum('user_role', ['owner', 'carer']);
export const deviceModeEnum = pgEnum('device_mode', ['comedero', 'bebedero', 'collar', 'cama_inteligente']);

// --- TABLAS PRINCIPALES ---

// Nueva tabla central: Hogares
export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Ej: "Casa de Mauro"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Usuarios, ahora pertenecen a un Hogar
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('carer'),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mascotas, ahora pertenecen a un Hogar y tienen avatar
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  species: text("species"),
  breed: text("breed"),
  birthDate: date("birth_date"),
  avatarUrl: text("avatar_url"), // URL a la imagen de perfil
});

// Dispositivos, ahora pertenecen a un Hogar
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id").notNull().references(() => households.id, { onDelete: 'cascade' }),
  deviceId: text("device_id").notNull().unique(), // ID físico del QR
  name: text("name").notNull(), // Apodo del dispositivo
  mode: deviceModeEnum("mode").notNull(),
  status: text("status").notNull().default('offline'),
});

// Nueva tabla de unión para la relación Muchos-a-Muchos con PK compuesta
export const petsToDevices = pgTable("pets_to_devices", {
    petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: 'cascade' }),
    deviceId: integer("device_id").notNull().references(() => devices.id, { onDelete: 'cascade' }),
}, table => ({
    primaryKey: ["petId", "deviceId"],
}));

// Eventos de consumo, sin cambios estructurales
export const consumptionEvents = pgTable("consumption_events", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => devices.id, { onDelete: 'cascade' }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  amountGrams: real("amount_grams").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
});

// Nueva tabla para reportes de salud del dispositivo
export const deviceHealthReports = pgTable("device_health_reports", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => devices.id, { onDelete: 'cascade' }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  firmwareVersion: text("firmware_version"),
  report: text("report").notNull(), // Almacenará el JSON completo del reporte
  overallStatus: text("overall_status").notNull(), // 'PASS' o 'FAIL'
});

export const mqttConnections = pgTable("mqtt_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  brokerUrl: text("broker_url").notNull(),
  clientId: text("client_id").notNull(),
  username: text("username"),
  password: text("password"),
  caCert: text("ca_cert"),
  clientCert: text("client_cert"),
  privateKey: text("private_key"),
  connected: boolean("connected").default(false).notNull(),
  lastConnected: timestamp("last_connected"),
});

// --- RELACIONES ---

export const householdsRelations = relations(households, ({ many }) => ({
  users: many(users),
  pets: many(pets),
  devices: many(devices),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  household: one(households, {
    fields: [users.householdId],
    references: [households.id],
  }),
  mqttConnections: many(mqttConnections),
}));

export const petsRelations = relations(pets, ({ one, many }) => ({
  household: one(households, {
    fields: [pets.householdId],
    references: [households.id],
  }),
  petsToDevices: many(petsToDevices),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  household: one(households, {
    fields: [devices.householdId],
    references: [households.id],
  }),
  consumptionEvents: many(consumptionEvents),
  petsToDevices: many(petsToDevices),
  healthReports: many(deviceHealthReports),
}));

export const petsToDevicesRelations = relations(petsToDevices, ({ one }) => ({
  pet: one(pets, { fields: [petsToDevices.petId], references: [pets.id] }),
  device: one(devices, { fields: [petsToDevices.deviceId], references: [devices.id] }),
}));

export const consumptionEventsRelations = relations(consumptionEvents, ({ one }) => ({
  device: one(devices, {
    fields: [consumptionEvents.deviceId],
    references: [devices.id],
  }),
}));

export const deviceHealthReportsRelations = relations(deviceHealthReports, ({ one }) => ({
  device: one(devices, {
    fields: [deviceHealthReports.deviceId],
    references: [devices.id],
  }),
}));

export const mqttConnectionsRelations = relations(mqttConnections, ({ one }) => ({
  user: one(users, {
    fields: [mqttConnections.userId],
    references: [users.id],
  }),
}));

// --- ZOD SCHEMAS ---
export const insertHouseholdSchema = createInsertSchema(households);
export const insertUserSchema = createInsertSchema(users);
export const insertPetSchema = createInsertSchema(pets);
export const insertDeviceSchema = createInsertSchema(devices);
export const insertPetToDeviceSchema = createInsertSchema(petsToDevices);
export const insertConsumptionEventSchema = createInsertSchema(consumptionEvents);
export const insertDeviceHealthReportSchema = createInsertSchema(deviceHealthReports);
export const insertMqttConnectionSchema = createInsertSchema(mqttConnections);
