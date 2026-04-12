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
    <div className="fixed bottom-0 left-0 right-0 z-[100] preserve-3d" 
      style={{ 
        background: 'rgba(14,14,26,0.95)', 
        backdropFilter: 'blur(50px)', 
        WebkitBackdropFilter: 'blur(50px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
      <div className="flex justify-around items-center h-[72px] max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className="flex flex-col items-center justify-center w-full h-full space-y-1.5 active:opacity-60 transition-all duration-300"
              style={{ color: isActive ? NEON : '#94a3b8' }}
            >
              <div style={{ 
                transform: isActive ? 'translateY(-2px) scale(1.15)' : 'scale(1)', 
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                filter: isActive ? `drop-shadow(0 0 8px ${NEON}4D)` : 'none'
              }}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
