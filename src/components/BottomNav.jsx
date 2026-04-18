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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[400px] preserve-3d">
      <div className="glass-beast-floating rounded-[2rem] px-6 h-20 flex justify-around items-center relative overflow-hidden group">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 shimmer-beast opacity-20 pointer-events-none" />
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className="flex flex-col items-center justify-center relative w-12 h-12 tap-3d transition-all duration-300"
              style={{ color: isActive ? NEON : '#94a3b8' }}
            >
              {/* Active Glow Indicator */}
              {isActive && (
                <div className="absolute inset-0 bg-gym-neon/20 blur-xl rounded-full scale-150 animate-pulse" />
              )}
              
              <div className="relative z-10" style={{ 
                transform: isActive ? 'translateY(-4px) scale(1.2) rotateX(10deg)' : 'scale(1)', 
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                filter: isActive ? `drop-shadow(0 0 12px ${NEON}CC)` : 'none'
              }}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {isActive && (
                <span className="absolute -bottom-4 text-[8px] font-black uppercase tracking-[0.2em] text-gym-neon animate-beast-float">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
