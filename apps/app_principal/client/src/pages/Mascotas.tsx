import { useEffect, useState } from 'react';
import { getPetsByUserId } from '@/services/api';
import type { Pet } from '@/services/api';
import PetAvatar from '@/components/PetAvatar';
import { Button } from '@/components/ui/button';
import AddPetModal from '@/components/AddPetModal'; // Import the modal

export default function Mascotas() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

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

  const handlePetAdd = (petData: any) => {
    // In a real app, we'd call the API service here to save the pet
    // and then update the local state.
    console.log("New pet to add:", petData);
    // For now, we can just optimistically add it to the UI
    const newPet = { ...petData, id: Math.random(), userId: 1 }; // Create a fake new pet
    setPets(currentPets => [...currentPets, newPet]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis Mascotas</h1>
        <Button onClick={() => setIsModalOpen(true)}> {/* Open modal on click */}
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

      {/* Render the modal */}
      <AddPetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPetAdd={handlePetAdd}
      />
    </div>
  );
}
