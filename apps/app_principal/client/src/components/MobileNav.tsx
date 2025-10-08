import { Link, useLocation } from 'wouter';

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/devices', label: 'Dispositivos', icon: 'memory' },
    { path: '/mascotas', label: 'Mascotas', icon: 'pets' },
    { path: '/settings', label: 'Ajustes', icon: 'settings' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-neutral-200 z-10">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <div className={`flex flex-col items-center justify-center ${
              location === item.path ? 'text-[#FF847C]' : 'text-neutral-500'
            }`}>
              <span className="material-icons text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
