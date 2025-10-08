import { useState, useEffect } from 'react';
import { getPetsByUserId, getConsumptionEventsByDeviceId } from '@/services/api';
import type { Pet, ConsumptionEvent } from '@/services/api';
import PetAvatar from '@/components/PetAvatar';
import StatWidget from '@/components/StatWidget';

export default function Dashboard() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [events, setEvents] = useState<ConsumptionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const FAKE_USER_ID = 1;
    // In a real app, we'd get the device IDs from the user's devices
    const FAKE_DEVICE_ID_COMEDERO = 1; 

    const fetchData = async () => {
      try {
        setLoading(true);
        const petsData = await getPetsByUserId(FAKE_USER_ID);
        setPets(petsData);

        // Fetch events for a specific device to show some stats
        const eventsData = await getConsumptionEventsByDeviceId(FAKE_DEVICE_ID_COMEDERO);
        setEvents(eventsData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate a simple statistic from the mock data
  const totalConsumption = events.reduce((sum, event) => sum + event.amountGrams, 0);

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

          {/* Statistics Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Resumen de Hoy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatWidget 
                icon="restaurant"
                label="Consumo Comedero"
                value={totalConsumption.toFixed(0)}
                unit="gramos"
                color="#FF847C"
              />
              <StatWidget 
                icon="water_drop"
                label="Consumo Bebedero"
                value="75" // Hardcoded mock value
                unit="ml"
                color="#99B898"
              />
              <StatWidget 
                icon="event_note"
                label="Eventos Registrados"
                value={events.length.toString()}
                unit="hoy"
                color="#EBB7AA"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}