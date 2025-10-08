// D:/Escritorio/Proyectos/KittyPaw/Kittypaw_1a/apps/app_principal/client/src/services/api.ts

/**
 * @file Este archivo simula una API real.
 * Proporciona funciones asíncronas que devuelven datos de prueba (mocks).
 * Esto permite desarrollar el frontend de forma desacoplada del backend.
 */

// --- Tipos de Datos (basados en el nuevo schema.ts v2.0) ---

export type User = {
  id: number;
  name: string;
  email: string;
};

export type Device = {
  id: number;
  deviceId: string; // ID físico del dispositivo
  userId: number;
  name: string;
  mode: 'comedero' | 'bebedero';
};

export type Pet = {
  id: number;
  userId: number;
  name: string;
  species: string | null;
  breed: string | null;
  birthDate: string | null; // Formato 'YYYY-MM-DD'
};

export type ConsumptionEvent = {
    id: number;
    deviceId: number;
    timestamp: string; // ISO 8601
    amountGrams: number;
    durationSeconds: number;
}

// --- Base de Datos Falsa (Mocks) ---

const MOCK_USER: User = {
  id: 1,
  name: 'Mauro',
  email: 'mauro@kittypaw.com',
};

const MOCK_DEVICES: Device[] = [
  { id: 1, deviceId: 'KP-C01-0001', userId: 1, name: 'Comedero Cocina', mode: 'comedero' },
  { id: 2, deviceId: 'KP-B01-0002', userId: 1, name: 'Bebedero Terraza', mode: 'bebedero' },
];

const MOCK_PETS: Pet[] = [
  { id: 1, userId: 1, name: 'Milo', species: 'Gato', breed: 'Mestizo', birthDate: '2022-05-10' },
  { id: 2, userId: 1, name: 'Luna', species: 'Gato', breed: 'Siamés', birthDate: '2023-01-15' },
];

const MOCK_CONSUMPTION_EVENTS: ConsumptionEvent[] = [
    { id: 1, deviceId: 1, timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), amountGrams: 50, durationSeconds: 120 },
    { id: 2, deviceId: 2, timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), amountGrams: 150, durationSeconds: 60 },
    { id: 3, deviceId: 1, timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), amountGrams: 25, durationSeconds: 45 },
]

// --- Funciones de la API Simulada ---

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getUser = async (): Promise<User> => {
  await simulateDelay(500);
  console.log('API MOCK: Fetched user');
  return MOCK_USER;
};

export const getDevicesByUserId = async (userId: number): Promise<Device[]> => {
  await simulateDelay(800);
  const devices = MOCK_DEVICES.filter(d => d.userId === userId);
  console.log(`API MOCK: Fetched ${devices.length} devices for userId ${userId}`);
  return devices;
};

export const getPetsByUserId = async (userId: number): Promise<Pet[]> => {
  await simulateDelay(700);
  const pets = MOCK_PETS.filter(p => p.userId === userId);
  console.log(`API MOCK: Fetched ${pets.length} pets for userId ${userId}`);
  return pets;
};

export const getConsumptionEventsByDeviceId = async (deviceId: number): Promise<ConsumptionEvent[]> => {
    await simulateDelay(1000);
    const events = MOCK_CONSUMPTION_EVENTS.filter(e => e.deviceId === deviceId);
    console.log(`API MOCK: Fetched ${events.length} events for deviceId ${deviceId}`);
    return events;
}
