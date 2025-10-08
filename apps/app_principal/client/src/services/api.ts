// D:/Escritorio/Proyectos/KittyPaw/Kittypaw_1a/apps/app_principal/client/src/services/api.ts

/**
 * @file Este archivo simula una API real para el frontend de KittyPaw.
 * Proporciona funciones asíncronas que devuelven datos de prueba (mocks)
 * y simula la lógica del backend para el flujo de onboarding v2.0.
 */

// --- Tipos de Datos (basados en el schema.ts v2.1) ---

export type Household = {
  id: number;
  name: string;
};

export type User = {
  id: number;
  householdId: number;
  name: string;
  email: string;
  role: 'owner' | 'carer';
};

export type Device = {
  id: number;
  householdId: number;
  deviceId: string; // ID físico del dispositivo
  name: string;
  mode: 'comedero' | 'bebedero' | 'collar' | 'cama_inteligente';
};

export type Pet = {
  id: number;
  householdId: number;
  name: string;
  species: string | null;
  breed: string | null;
  birthDate: string | null; // Formato 'YYYY-MM-DD'
  avatarUrl: string | null;
};

export type ConsumptionEvent = {
    id: number;
    deviceId: number;
    timestamp: string; // ISO 8601
    amountGrams: number;
    durationSeconds: number;
}

// --- Base de Datos Falsa (Mocks) ---

let MOCK_HOUSEHOLDS: Household[] = [
    { id: 1, name: "Casa de Mauro" }
];
let MOCK_USERS: User[] = [
    { id: 1, householdId: 1, name: 'Mauro', email: 'mauro@kittypaw.com', role: 'owner' }
];
let MOCK_DEVICES: Device[] = [
  { id: 1, householdId: 1, deviceId: 'KP-C01-0001', name: 'Comedero Cocina', mode: 'comedero' },
  { id: 2, householdId: 1, deviceId: 'KP-B01-0002', name: 'Bebedero Terraza', mode: 'bebedero' },
];
let MOCK_PETS: Pet[] = [
  { id: 1, householdId: 1, name: 'Milo', species: 'Gato', breed: 'Mestizo', birthDate: '2022-05-10', avatarUrl: null },
  { id: 2, householdId: 1, name: 'Luna', species: 'Gato', breed: 'Siamés', birthDate: '2023-01-15', avatarUrl: null },
];
let MOCK_CONSUMPTION_EVENTS: ConsumptionEvent[] = [
    { id: 1, deviceId: 1, timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), amountGrams: 50, durationSeconds: 120 },
    { id: 2, deviceId: 2, timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), amountGrams: 150, durationSeconds: 60 },
    { id: 3, deviceId: 1, timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), amountGrams: 25, durationSeconds: 45 },
];
let MOCK_PETS_TO_DEVICES: { petId: number, deviceId: number }[] = [];


// --- Funciones de la API Simulada ---

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- GETTERS ---
export const getUser = async (userId: number): Promise<User | undefined> => {
  await simulateDelay(500);
  const user = MOCK_USERS.find(u => u.id === userId);
  console.log('API MOCK: Fetched user', user);
  return user;
};

export const getDevicesByHouseholdId = async (householdId: number): Promise<Device[]> => {
  await simulateDelay(800);
  const devices = MOCK_DEVICES.filter(d => d.householdId === householdId);
  console.log(`API MOCK: Fetched ${devices.length} devices for householdId ${householdId}`);
  return devices;
};

export const getPetsByHouseholdId = async (householdId: number): Promise<Pet[]> => {
  await simulateDelay(700);
  const pets = MOCK_PETS.filter(p => p.householdId === householdId);
  console.log(`API MOCK: Fetched ${pets.length} pets for householdId ${householdId}`);
  return pets;
};

export const getConsumptionEventsByDeviceId = async (deviceId: number): Promise<ConsumptionEvent[]> => {
    await simulateDelay(1000);
    const events = MOCK_CONSUMPTION_EVENTS.filter(e => e.deviceId === deviceId);
    console.log(`API MOCK: Fetched ${events.length} events for deviceId ${deviceId}`);
    return events;
}

// --- SETTERS (Nuevas funciones para el Onboarding) ---

export const registerUserAndHousehold = async (userData: {name: string, email: string}): Promise<User> => {
    await simulateDelay(1200);
    const newHouseholdId = MOCK_HOUSEHOLDS.length + 1;
    const newHousehold: Household = { id: newHouseholdId, name: `Hogar de ${userData.name}`};
    MOCK_HOUSEHOLDS.push(newHousehold);

    const newUserId = MOCK_USERS.length + 1;
    const newUser: User = { 
        id: newUserId, 
        householdId: newHouseholdId, 
        name: userData.name, 
        email: userData.email, 
        role: 'owner' 
    };
    MOCK_USERS.push(newUser);
    
    console.log('API MOCK: Registered new user and household', { newUser, newHousehold });
    return newUser;
};

export const createPet = async (petData: Omit<Pet, 'id' | 'householdId'>, householdId: number): Promise<Pet> => {
    await simulateDelay(600);
    const newPetId = MOCK_PETS.length + 1;
    const createdPet: Pet = { ...petData, id: newPetId, householdId };
    MOCK_PETS.push(createdPet);
    console.log('API MOCK: Added new pet', createdPet);
    return createdPet;
};

export const linkDevice = async (scannedId: string, name: string, householdId: number): Promise<Device> => {
    await simulateDelay(900);
    const newDeviceId = MOCK_DEVICES.length + 1;
    const newDevice: Device = {
        id: newDeviceId,
        householdId,
        deviceId: scannedId,
        name,
        mode: scannedId.includes('KP-C') ? 'comedero' : 'bebedero' // Simple logic based on fake ID
    };
    MOCK_DEVICES.push(newDevice);
    console.log('API MOCK: Linked new device', newDevice);
    return newDevice;
};

export const associatePetToDevice = async (deviceId: number, petIds: number[]): Promise<void> => {
    await simulateDelay(400);
    // Remove old associations for this device
    MOCK_PETS_TO_DEVICES = MOCK_PETS_TO_DEVICES.filter(assoc => assoc.deviceId !== deviceId);
    // Add new ones
    petIds.forEach(petId => {
        MOCK_PETS_TO_DEVICES.push({ petId, deviceId });
    });
    console.log('API MOCK: Associated pets to device', MOCK_PETS_TO_DEVICES);
    return;
};