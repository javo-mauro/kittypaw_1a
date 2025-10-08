import { useEffect, useState } from 'react';
import { getPetsByUserId } from '@/services/api';
import type { Pet } from '@/services/api';
import PetAvatar from '@/components/PetAvatar'; // Import our new component

export default function Mascotas() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const FAKE_USER_ID = 1;
    
    getPetsByUserId(FAKE_USER_ID)
      .then(data => {
        setPets(data);
      })
      .catch(err => {
        console.error("Error fetching pets:", err);
        setError("No se pudieron cargar las mascotas.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis Mascotas</h1>
        {/* We can add a "Add Pet" button here later */}
      </div>
      
      {loading && <p>Cargando mascotas...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-wrap gap-6">
          {pets.map(pet => (
            <PetAvatar key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}