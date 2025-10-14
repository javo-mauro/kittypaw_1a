import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { PetForm } from "@/components/PetForm";
import { MoreHorizontal, PlusCircle, Cat, Dog, PawPrint, Loader2 } from "lucide-react";
import type { Pet, InsertPet } from "@shared/schema";

export default function PetsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  const fetchPets = useCallback(async () => {
    if (!user?.householdId) return;
    try {
      setLoading(true);
      const data = await apiRequest<Pet[]>(`/api/households/${user.householdId}/pets`);
      setPets(data);
    } catch (error) {
      console.error("Error fetching pets:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las mascotas." });
    } finally {
      setLoading(false);
    }
  }, [user?.householdId, toast]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleFormSubmit = async (values: Omit<InsertPet, 'householdId'>) => {
    if (!user?.householdId) {
      toast({ variant: "destructive", title: "Error", description: "Usuario no asociado a un hogar." });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPet) {
        // Actualizar mascota existente
        await apiRequest(`/api/pets/${editingPet.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        });
        toast({ title: "Éxito", description: "Mascota actualizada correctamente." });
      } else {
        // Crear nueva mascota
        const petData: InsertPet = { ...values, householdId: user.householdId };
        await apiRequest("/api/pets", {
          method: "POST",
          body: JSON.stringify(petData),
        });
        toast({ title: "Éxito", description: "Mascota añadida correctamente." });
      }
      setIsDialogOpen(false);
      setEditingPet(null);
      fetchPets(); // Recargar la lista de mascotas
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la mascota." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePet = async (petId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta mascota?")) return;

    try {
      await apiRequest(`/api/pets/${petId}`, { method: "DELETE" });
      toast({ title: "Éxito", description: "Mascota eliminada." });
      fetchPets(); // Recargar la lista
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la mascota." });
    }
  };

  const getPetIcon = (species: string | null) => {
    switch (species) {
      case 'cat': return <Cat className="h-5 w-5" />;
      case 'dog': return <Dog className="h-5 w-5" />;
      default: return <PawPrint className="h-5 w-5" />;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Mascotas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPet(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Mascota
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingPet ? "Editar Mascota" : "Añadir Nueva Mascota"}</DialogTitle>
            </DialogHeader>
            <PetForm pet={editingPet} onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mis Mascotas</CardTitle>
          <CardDescription>Lista de todas las mascotas de tu hogar.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pets.length > 0 ? (
                  pets.map((pet) => (
                    <TableRow key={pet.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {getPetIcon(pet.species)} {pet.name}
                      </TableCell>
                      <TableCell>{pet.species}</TableCell>
                      <TableCell>{pet.breed}</TableCell>
                      <TableCell>{pet.weightKg}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingPet(pet); setIsDialogOpen(true); }}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePet(pet.id)} className="text-red-600">
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No tienes mascotas añadidas. ¡Añade una para empezar!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}