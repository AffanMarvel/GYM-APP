import { Link } from 'react-router-dom';
import { Dumbbell, ChevronRight } from 'lucide-react';

const muscles = [
  { id: 'chest', name: 'Chest', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { id: 'back', name: 'Back', img: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80' },
  { id: 'legs', name: 'Legs', img: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80' },
  { id: 'shoulders', name: 'Shoulders', img: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80' },
  { id: 'biceps', name: 'Biceps', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80' },
  { id: 'triceps', name: 'Triceps', img: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=400&q=80' },
  { id: 'abs', name: 'Core', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
  { id: 'cardio', name: 'Cardio', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80' }
];

export default function WorkoutCategories() {
  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #06060d 0%, #0e0e1a 40%, #0d0a1a 100%)' }}>
      <div className="p-5 slide-up max-w-lg mx-auto">
        <header className="mb-6 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <Dumbbell style={{ color: '#818cf8' }} size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Target Muscle</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Select a category to browse exercises</p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {muscles.map((m) => (
            <Link 
              key={m.id} 
              to={`/workout/${m.id}`}
              className="group relative h-48 rounded-3xl overflow-hidden border border-white/5 active:scale-95 transition-all shadow-lg"
            >
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
