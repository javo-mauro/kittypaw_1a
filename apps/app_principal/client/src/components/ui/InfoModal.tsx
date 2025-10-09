import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import kittyLogo from '@/assets/kitty-logo.jpg';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function InfoModal({ isOpen, onClose, title, message }: InfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader className="flex flex-col items-center text-center pt-4">
          <img src={kittyLogo} alt="Kitty Paw Logo" className="w-16 h-16 rounded-full mb-4" />
          <DialogTitle className="text-2xl text-primary">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button onClick={onClose} className="w-full">Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
