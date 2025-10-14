// D:/Escritorio/Proyectos/KittyPaw/Kittypaw_1a/apps/app_principal/client/src/services/api.ts

/**
 * @file Este archivo se conecta a la API real del backend de KittyPaw.
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

// --- Funciones de la API Real ---

const API_BASE_URL = '/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Error en la petición a la API');
    }
    return response.json();
  } catch (error) {
    console.error(`API request failed for endpoint: ${endpoint}`, error);
    throw error;
  }
}

// --- GETTERS ---

export const getDevicesByHouseholdId = async (householdId: number): Promise<Device[]> => {
  // El backend no tiene un endpoint directo, traemos todos y filtramos.
  // Esto no es óptimo y debería mejorarse en el backend en el futuro.
  const allDevices = await apiRequest<Device[]>('/devices');
  return allDevices.filter(d => d.householdId === householdId);
};

export const getPetsByHouseholdId = async (householdId: number): Promise<Pet[]> => {
  // El backend no tiene un endpoint directo, traemos todas y filtramos.
  // Esto no es óptimo y debería mejorarse en el backend en el futuro.
  const allPets = await apiRequest<Pet[]>('/pets');
  return allPets.filter(p => p.householdId === householdId);
};

export const getConsumptionEventsByDeviceId = async (deviceId: number): Promise<ConsumptionEvent[]> => {
    // NOTA: El backend usa el endpoint 'sensor-data' para los eventos de consumo.
    // También, la estructura de datos puede ser diferente. Asumimos que es compatible por ahora.
    return apiRequest<ConsumptionEvent[]>(`/sensor-data/${deviceId}`);
}

// Aquí se podrían añadir el resto de funciones (POST, PUT, DELETE) para interactuar con la API real.
// Por ejemplo:
/*
export const createPet = async (petData: Omit<Pet, 'id'>): Promise<Pet> => {
    return apiRequest<Pet>('/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petData),
    });
};
*/
