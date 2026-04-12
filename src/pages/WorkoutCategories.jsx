import { Dumbbell, ChevronRight, Search, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const muscles = [
  { id: 'chest', name: 'Chest', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { id: 'back', name: 'Back', img: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&q=80' },
  { id: 'legs', name: 'Legs', img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&q=80' },
  { id: 'shoulders', name: 'Shoulders', img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80' },
  { id: 'biceps', name: 'Biceps', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80' },
  { id: 'triceps', name: 'Triceps', img: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=400&q=80' },
  { id: 'abs', name: 'Abs', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
  { id: 'forearms', name: 'Forearms', img: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&q=80' },
  { id: 'cardio', name: 'Cardio', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80' },
  { id: 'stretching', name: 'Stretching', img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80' },
  { id: 'warmup', name: 'Warm Up', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80' },
];

export default function WorkoutCategories() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #06060d 0%, #0e0e1a 40%, #0d0a1a 100%)' }}>
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(129,140,248,0.1)' }}>
              <Dumbbell style={{ color: '#818cf8' }} size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white leading-none">Training</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#6b7280' }}>Select your target</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/all-workouts')}
            className="p-3 bg-white/5 rounded-2xl border border-white/10 active:scale-95 transition-all text-gym-neon"
          >
            <Search size={22} />
          </button>
        </header>

        {/* Search All Banner */}
        <button 
          onClick={() => navigate('/all-workouts')}
          className="w-full p-4 rounded-3xl bg-gradient-to-r from-gym-neon/20 to-gym-accent/20 border border-white/10 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Zap size={18} className="text-gym-neon" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-white">Advanced Search</p>
              <p className="text-[10px] text-gym-muted font-bold uppercase tracking-tighter">Browse all 244+ Exercises</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gym-neon group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Image Grid - old banner style */}
        <div className="grid grid-cols-2 gap-4">
          {muscles.map((m) => (
            <Link 
              to={`/workout/${m.id}`} 
              key={m.id}
              className="relative h-40 rounded-2xl overflow-hidden group block border border-white/10"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
              <img 
                src={m.img} 
                alt={m.name} 
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="text-xl font-bold text-white tracking-wide drop-shadow-lg">{m.name}</span>
              </div>
              <div className="absolute top-3 right-3 z-20">
                <ChevronRight size={18} className="text-white/60 group-hover:text-white transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
