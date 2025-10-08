import { useState } from 'react';
import type { Pet, Device } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PetDeviceAssociationProps {
  device: Device;
  pets: Pet[];
  onAssociationSave: (device: Device, selectedPetIds: number[]) => void;
}

export default function PetDeviceAssociation({ device, pets, onAssociationSave }: PetDeviceAssociationProps) {
  const [selectedPets, setSelectedPets] = useState<number[]>([]);

  const handlePetSelect = (petId: number) => {
    setSelectedPets(prevSelected => 
      prevSelected.includes(petId)
        ? prevSelected.filter(id => id !== petId)
        : [...prevSelected, petId]
    );
  };

  const handleSave = () => {
    onAssociationSave(device, selectedPets);
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h2 className="text-lg font-bold mb-2">Asociar Mascotas al Dispositivo</h2>
      <div className="p-3 rounded-md bg-gray-50 border mb-4">
        <p className="font-semibold">{device.name}</p>
        <p className="text-sm text-gray-500">{device.deviceId}</p>
      </div>

      <p className="text-sm font-medium mb-2">¿Qué mascotas usarán este dispositivo?</p>
      <div className="space-y-2">
        {pets.map(pet => (
          <div key={pet.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`pet-${pet.id}`}
              checked={selectedPets.includes(pet.id)}
              onCheckedChange={() => handlePetSelect(pet.id)}
            />
            <Label htmlFor={`pet-${pet.id}`} className="flex-1 cursor-pointer">
              {pet.name}
            </Label>
          </div>
        ))}
      </div>

      <Button className="w-full mt-4" onClick={handleSave} disabled={selectedPets.length === 0}>
        Guardar Asociación ({selectedPets.length})
      </Button>
    </div>
  );
}
