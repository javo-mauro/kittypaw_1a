import { pgTable, text, serial, integer, timestamp, date, real, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default('carer'),
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
});

// Nueva tabla de unión para la relación Muchos-a-Muchos
export const petsToDevices = pgTable("pets_to_devices", {
    petId: integer("pet_id").notNull().references(() => pets.id, { onDelete: 'cascade' }),
    deviceId: integer("device_id").notNull().references(() => devices.id, { onDelete: 'cascade' }),
});

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

// --- DEFINICIÓN DE RELACIONES ---

export const householdsRelations = relations(households, ({ many }) => ({
  users: many(users),
  pets: many(pets),
  devices: many(devices),
}));

export const usersRelations = relations(users, ({ one }) => ({
  household: one(households, {
    fields: [users.householdId],
    references: [households.id],
  }),
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