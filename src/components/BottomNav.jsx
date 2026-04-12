import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Dumbbell, ActivitySquare } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  // Hide on active workout page
  if (location.pathname === '/active-workout') return null;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Workouts', path: '/workout', icon: Dumbbell },
    { name: 'History', path: '/history', icon: ActivitySquare },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-strong z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                isActive ? 'text-gym-neon' : 'text-gym-muted hover:text-gym-text'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[9px] font-bold tracking-wider ${isActive ? 'text-gym-neon' : ''}`}>
                {item.name}
              </span>
              {isActive && <div className="w-4 h-0.5 bg-gym-neon rounded-full mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
