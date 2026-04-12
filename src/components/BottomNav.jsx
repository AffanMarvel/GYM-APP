import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Dumbbell, ActivitySquare } from 'lucide-react';

const NEON = '#818cf8';

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
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(14,14,26,0.92)', backdropFilter: 'blur(40px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300"
              style={{ color: isActive ? NEON : '#6b7280' }}
            >
              <div style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s' }}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className="text-[9px] font-bold tracking-wider">{item.name}</span>
              {isActive && <div style={{ width: 16, height: 2, background: NEON, borderRadius: 4, marginTop: 2 }} />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
