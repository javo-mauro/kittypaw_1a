import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPetAdd: (petData: any) => void; // We'll define a proper type later
}

export default function AddPetModal({ isOpen, onClose, onPetAdd }: AddPetModalProps) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleSubmit = () => {
    // Basic validation
    if (!name || !species) {
      alert("Nombre y Especie son campos requeridos.");
      return;
    }
    onPetAdd({ name, species, breed, birthDate });
    onClose(); // Close modal on submit
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Mascota</DialogTitle>
          <DialogDescription>
            Completa los detalles de tu mascota. Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="species" className="text-right">
              Especie
            </Label>
            <Select onValueChange={setSpecies} value={species}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona una especie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gato">Gato</SelectItem>
                <SelectItem value="Perro">Perro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="breed" className="text-right">
              Raza
            </Label>
            <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthDate" className="text-right">
              Fecha de Nac.
            </Label>
            <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="avatar" className="text-right">
              Foto
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
                <Button variant="outline" size="icon">
                    <span className="material-icons">photo_camera</span>
                </Button>
                <p className="text-sm text-gray-500">Sube o toma una foto.</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar Mascota</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
