import { Link } from 'react-router-dom';
import { Dumbbell, ChevronRight, Search, Zap } from 'lucide-react';

const muscles = [
  { id: 'chest', name: 'Chest', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { id: 'back', name: 'Back', img: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80' },
  { id: 'legs', name: 'Legs', img: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80' },
  { id: 'shoulders', name: 'Shoulders', img: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80' },
  { id: 'biceps', name: 'Biceps', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80' },
  { id: 'triceps', name: 'Triceps', img: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=400&q=80' },
  { id: 'forearms', name: 'Forearms', img: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&q=80' },
  { id: 'abs', name: 'Core / Abs', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
  { id: 'cardio', name: 'Cardio', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80' },
  { id: 'warmup', name: 'Warm Up', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80' },
  { id: 'stretching', name: 'Stretching', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80' }
];

export default function WorkoutCategories() {
  return (
    <div className="min-h-screen pb-28" style={{ background: '#06060d' }}>
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gym-neon/10 border border-gym-neon/20">
              <Dumbbell className="text-gym-neon" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Target Muscle</h1>
              <p className="text-[10px] font-bold text-gym-muted uppercase tracking-widest mt-1">Select target area</p>
            </div>
          </div>
          <Link to="/all-workouts" className="p-3 bg-white/5 rounded-2xl border border-white/5 text-gym-neon">
            <Search size={22} />
          </Link>
        </header>

        <Link to="/all-workouts" className="block p-5 rounded-3xl bg-gym-card border border-white/5 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gym-neon/10 border border-gym-neon/20 flex items-center justify-center">
                <Zap size={22} className="text-gym-neon" fill="currentColor" />
              </div>
              <div>
                <p className="text-base font-black text-white">Browse All Workouts</p>
                <p className="text-[10px] font-bold text-gym-muted uppercase tracking-widest">Search 240+ Exercises</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gym-muted" />
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          {muscles.map((m) => (
            <Link key={m.id} to={`/workout/${m.id}`}
              className="group relative h-48 rounded-3xl overflow-hidden border border-white/5 active:scale-95 transition-all">
              <img src={m.img} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/40 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase tracking-widest">{m.name}</span>
                  <div className="p-1.5 bg-gym-neon/20 rounded-lg group-hover:bg-gym-neon transition-colors">
                    <ChevronRight size={14} className="text-gym-neon group-hover:text-gym-dark" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
