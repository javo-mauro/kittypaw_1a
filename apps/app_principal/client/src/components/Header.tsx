import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import kittyLogo from '../assets/kitty-logo.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { mqttConnected } = useWebSocket();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={onMenuToggle}
            className="mr-4 lg:hidden focus:outline-none"
          >
            <span className="material-icons text-[#2A363B]">menu</span>
          </button>
          <div className="flex items-center">
            <Link href={isAuthenticated ? "/dashboard" : "/"}>
              <div className="flex items-center cursor-pointer">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                  <img src={kittyLogo} alt="Kitty Paw" className="h-full w-full object-cover" />
                </div>
                <h1 className="app-title text-2xl font-bold">Kitty Paw</h1>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="nav-item hover:text-[#FF847C]">
            Dashboard
          </Link>
          <Link href="/devices" className="nav-item hover:text-[#FF847C]">
            Dispositivos
          </Link>
          <Link href="/settings" className="nav-item hover:text-[#FF847C]">
            Configuración
          </Link>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center mr-4 px-3 py-1 rounded-full border border-[#EBB7AA]">
            <span className={`w-2 h-2 rounded-full mr-2 ${mqttConnected ? 'bg-[#99B898]' : 'bg-[#E84A5F]'}`}></span>
            <span className="text-sm text-[#2A363B]">{mqttConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          
          {!isAuthenticated ? (
            <Link href="/register">
              <button className="px-4 py-1.5 text-sm font-medium bg-[#FF847C] text-white rounded-md hover:bg-[#E84A5F] transition-colors">
                Registro
              </button>
            </Link>
          ) : (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <div className="mr-3 text-right hidden md:block">
                    <p className="text-sm font-medium text-[#2A363B]">{user?.name || user?.username || 'Usuario'}</p>
                    <p className="text-xs text-[#FF847C]">{user?.role || 'Invitado'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#EBB7AA] bg-opacity-20 flex items-center justify-center">
                    <span className="material-icons text-[#EBB7AA]">person</span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <span className="material-icons text-sm mr-2 align-middle">settings</span>
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <span className="material-icons text-sm mr-2 align-middle">logout</span>
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
