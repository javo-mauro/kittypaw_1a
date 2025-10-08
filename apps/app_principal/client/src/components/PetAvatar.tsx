import type { Pet } from '@/services/api';
import { Link } from 'wouter';

export default function PetAvatar({ pet }: { pet: Pet }) {
  // Genera un color de fondo basado en el nombre de la mascota
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "00000".substring(0, 6 - c.length) + c;
  };

  return (
    <Link href={`/mascotas/${pet.id}`}>
      <div className="flex flex-col items-center space-y-2 cursor-pointer group">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform"
          style={{ backgroundColor: `#${getAvatarColor(pet.name)}` }}
        >
          {pet.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700">{pet.name}</span>
      </div>
    </Link>
  );
}
