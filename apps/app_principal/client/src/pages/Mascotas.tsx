import { useEffect, useState } from 'react';
import { getPetsByHouseholdId, createPet } from '@/services/api'; // Import createPet
import type { Pet } from '@/services/api';
import PetAvatar from '@/components/PetAvatar';
import { Button } from '@/components/ui/button';
import AddPetModal from '@/components/AddPetModal';

export default function Mascotas() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // In a real app, this would come from the logged-in user's context
    const FAKE_HOUSEHOLD_ID = 1;
    
    getPetsByHouseholdId(FAKE_HOUSEHOLD_ID)
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

  const handlePetAdd = async (petData: Omit<Pet, 'id' | 'householdId' | 'avatarUrl'>) => {
    const FAKE_HOUSEHOLD_ID = 1; // This would come from user context
    
    try {
      const newPet = await createPet(petData, FAKE_HOUSEHOLD_ID);
      setPets(currentPets => [...currentPets, newPet]);
    } catch (error) {
      console.error("Error creating pet:", error);
      // Here you would typically show an error toast to the user
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis Mascotas</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <span className="material-icons mr-2">add</span>
          Añadir Mascota
        </Button>
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

      <AddPetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPetAdd={handlePetAdd}
      />
    </div>
  );
}