import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Dumbbell, History, UserCircle2 } from 'lucide-react';

const NEON = '#818cf8';

export default function BottomNav() {
  const location = useLocation();

  // Hide on active workout page
  if (location.pathname === '/active-workout') return null;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Workout', path: '/workout', icon: Dumbbell },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: UserCircle2 },
  ];

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="mx-3 mb-3 rounded-[1.8rem] flex justify-around items-center relative overflow-hidden"
        style={{
          height: '68px',
          background: 'rgba(14,14,26,0.85)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset',
        }}>
        {/* Shimmer */}
        <div className="absolute inset-0 shimmer-beast opacity-10 pointer-events-none" />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.name}
              to={item.path}
              className="relative flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-90"
              style={{ width: '20%', height: '100%' }}
            >
              {/* Active indicator pill */}
              {isActive && (
                <div
                  className="absolute top-2 rounded-full"
                  style={{ width: 32, height: 3, background: `linear-gradient(90deg, ${NEON}, #a855f7)`, boxShadow: `0 0 10px ${NEON}` }}
                />
              )}

              {/* Active glow blob */}
              {isActive && (
                <div
                  className="absolute rounded-full animate-pulse pointer-events-none"
                  style={{ width: 36, height: 36, background: `radial-gradient(circle, rgba(129,140,248,0.2), transparent 70%)` }}
                />
              )}

              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{
                  color: isActive ? NEON : 'rgba(255,255,255,0.35)',
                  filter: isActive ? `drop-shadow(0 0 8px ${NEON})` : 'none',
                  transform: isActive ? 'translateY(2px) scale(1.1)' : 'scale(1)',
                  transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
              <span
                className="text-[8px] font-bold uppercase tracking-wider transition-all"
                style={{ color: isActive ? NEON : 'rgba(255,255,255,0.2)' }}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
