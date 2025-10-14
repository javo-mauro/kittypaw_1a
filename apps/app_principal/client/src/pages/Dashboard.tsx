import { useState, useEffect } from 'react';
import { getPetsByHouseholdId, getConsumptionEventsByDeviceId } from '@/services/api';
import type { Pet, ConsumptionEvent } from '@/services/api';
import PetAvatar from '@/components/PetAvatar';
import StatWidget from '@/components/StatWidget';
import ConsumptionChart from '@/components/ConsumptionChart';
import DurationChart from '@/components/DurationChart';
import ActivityChart, { ActivityEvent } from '@/components/ActivityChart';
import DeviceStatus from '@/components/DeviceStatus';

// Helper function to generate mock data
const generateMockWaterData = (baseEvents: ConsumptionEvent[]): ConsumptionEvent[] => {
  return baseEvents.map(event => ({
    ...event,
    amountGrams: Math.floor(Math.random() * 50) + 20, // Random water consumption in ml
  }));
};

const generateMockActivityData = (): ActivityEvent[] => {
  const data: ActivityEvent[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
    const level = Math.floor(Math.random() * 3); // 0, 1, or 2
    data.push({ timestamp, level });
  }
  return data;
};


export default function Dashboard() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [foodEvents, setFoodEvents] = useState<ConsumptionEvent[]>([]);
  const [waterEvents, setWaterEvents] = useState<ConsumptionEvent[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const FAKE_HOUSEHOLD_ID = 1;
    const FAKE_DEVICE_ID_COMEDERO = 1; 

    const fetchData = async () => {
      try {
        setLoading(true);
        const petsData = await getPetsByHouseholdId(FAKE_HOUSEHOLD_ID);
        setPets(petsData);

        const foodEventsData = await getConsumptionEventsByDeviceId(FAKE_DEVICE_ID_COMEDERO);
        setFoodEvents(foodEventsData);
        
        // Generate mock data for other charts based on the fetched data or new logic
        setWaterEvents(generateMockWaterData(foodEventsData));
        setActivityEvents(generateMockActivityData());

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalFoodConsumption = foodEvents.reduce((sum, event) => sum + event.amountGrams, 0);
  const totalWaterConsumption = waterEvents.reduce((sum, event) => sum + event.amountGrams, 0);

  // Find the latest timestamp from each event type
  const findLatestTimestamp = (events: { timestamp: string }[]) => {
    if (events.length === 0) return undefined;
    return events.reduce((latest, event) => {
      const eventTime = new Date(event.timestamp).getTime();
      return eventTime > latest ? eventTime : latest;
    }, 0);
  };

  const lastFoodEventTime = findLatestTimestamp(foodEvents);
  const lastWaterEventTime = findLatestTimestamp(waterEvents);
  const lastActivityEventTime = findLatestTimestamp(activityEvents);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Hola, Mauro</h1>
        <p className="text-gray-500">Bienvenido a tu panel de control de KittyPaw.</p>
      </div>

      {loading ? (
        <p>Cargando dashboard...</p>
      ) : (
        <>
          {/* Pet List Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Mis Mascotas</h2>
            <div className="flex flex-wrap gap-6">
              {pets.length > 0 ? (
                pets.map(pet => <PetAvatar key={pet.id} pet={pet} />)
              ) : (
                <p className="text-gray-500">No tienes mascotas añadidas.</p>
              )}
            </div>
          </div>

          {/* Device Status Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Mis Dispositivos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DeviceStatus 
                name="Comedero Principal" 
                status="Encendido" 
                lastConnection={lastFoodEventTime ? new Date(lastFoodEventTime) : undefined}
              />
              <DeviceStatus 
                name="Bebedero Automático" 
                status="Sleep" 
                lastConnection={lastWaterEventTime ? new Date(lastWaterEventTime) : undefined}
              />
              <DeviceStatus 
                name="Collar de Actividad" 
                status="Encendido" 
                lastConnection={lastActivityEventTime ? new Date(lastActivityEventTime) : undefined}
              />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Consumo de Alimento (g)</h3>
              <ConsumptionChart data={foodEvents} color="#FF847C" />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Consumo de Agua (ml)</h3>
              <ConsumptionChart data={waterEvents} color="#99B898" />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Duración de Comidas (s)</h3>
              <DurationChart data={foodEvents} color="#EBB7AA" />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Nivel de Actividad</h3>
              <ActivityChart data={activityEvents} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
