import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import InteractiveWizardForm from '@/components/ui/InteractiveWizardForm';
import petOnboardingSections from '@/lib/forms';

interface PetOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PetOnboardingModal({ isOpen, onClose }: PetOnboardingModalProps) {
  const handleSubmit = (formData: Record<string, any>) => {
    console.log('Form submitted:', formData);
    alert('Mascota registrada (simulado). Revisa la consola para ver los datos.');
    onClose(); // Close modal on submit
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-primary">Registra a tu Mascota</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <InteractiveWizardForm
            sections={petOnboardingSections}
            onSubmit={handleSubmit}
          />
        </div>
        <DialogClose asChild>
          <button className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
