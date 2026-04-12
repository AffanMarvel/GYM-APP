import { Link } from 'react-router-dom';
import { Dumbbell, ChevronRight } from 'lucide-react';

const muscles = [
  { id: 'chest', name: 'Chest', emoji: '💪', gradient: 'from-rose-500/20 to-transparent' },
  { id: 'back', name: 'Back', emoji: '🔙', gradient: 'from-blue-500/20 to-transparent' },
  { id: 'legs', name: 'Legs', emoji: '🦵', gradient: 'from-emerald-500/20 to-transparent' },
  { id: 'shoulders', name: 'Shoulders', emoji: '🏋️', gradient: 'from-amber-500/20 to-transparent' },
  { id: 'biceps', name: 'Biceps', emoji: '💪', gradient: 'from-cyan-500/20 to-transparent' },
  { id: 'triceps', name: 'Triceps', emoji: '🔱', gradient: 'from-purple-500/20 to-transparent' },
  { id: 'abs', name: 'Abs', emoji: '🎯', gradient: 'from-yellow-500/20 to-transparent' },
  { id: 'forearms', name: 'Forearms', emoji: '✊', gradient: 'from-orange-500/20 to-transparent' },
  { id: 'cardio', name: 'Cardio', emoji: '🏃', gradient: 'from-red-500/20 to-transparent' },
  { id: 'stretching', name: 'Stretching', emoji: '🧘', gradient: 'from-teal-500/20 to-transparent' },
  { id: 'warmup', name: 'Warm Up', emoji: '🔥', gradient: 'from-pink-500/20 to-transparent' },
];

export default function WorkoutCategories() {
  return (
    <div className="min-h-screen bg-gradient-premium pb-28">
      <div className="p-5 slide-up max-w-lg mx-auto">
        <header className="mb-6 flex items-center space-x-3">
          <div className="p-2.5 bg-gym-neon/10 rounded-xl">
            <Dumbbell className="text-gym-neon" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Target Muscle</h1>
            <p className="text-[10px] text-gym-muted font-bold uppercase tracking-widest">Select a category to browse exercises</p>
          </div>
        </header>

        <div className="space-y-2.5">
          {muscles.map((m) => (
            <Link 
              to={`/workout/${m.id}`} 
              key={m.id}
              className="flex items-center justify-between p-4 bg-gym-card rounded-2xl border border-white/5 hover:border-gym-neon/20 transition-all duration-300 group active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${m.gradient} border border-white/5 text-2xl`}>
                  {m.emoji}
                </div>
                <div>
                  <p className="text-sm font-black text-white group-hover:text-gym-neon transition-colors">{m.name}</p>
                  <p className="text-[9px] text-gym-muted uppercase font-bold tracking-widest">Browse exercises</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gym-muted group-hover:text-gym-neon transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
