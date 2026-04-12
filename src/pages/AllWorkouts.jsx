import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { ChevronLeft, Search, Plus, Dumbbell } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';

export default function AllWorkouts() {
  const navigate = useNavigate();
  const { exercises, addToPlan } = useWorkout();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');

  const allExercises = useMemo(() => {
    const list = [];
    Object.keys(exercises).forEach(muscle => {
      exercises[muscle].forEach(ex => list.push({ ...ex, category: muscle }));
    });
    return list;
  }, [exercises]);

  const muscles = ['all', ...Object.keys(exercises)];

  const filtered = allExercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (ex.muscleTarget || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchMuscle = selectedMuscle === 'all' || ex.category === selectedMuscle;
    return matchSearch && matchMuscle;
  });

  return (
    <div className="min-h-screen pb-32" style={{ background: '#06060d' }}>
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        <header className="flex items-center space-x-4 pt-2">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-gym-card rounded-xl border border-white/5 text-white">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">All Workouts</h1>
            <p className="text-[10px] font-bold text-gym-muted uppercase tracking-widest mt-1">Global Exercise Browser</p>
          </div>
        </header>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gym-muted" size={18} />
            <input type="text" placeholder="Search all exercises..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gym-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gym-neon/50 font-bold" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {muscles.map(m => (
              <button key={m} onClick={() => setSelectedMuscle(m)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
                  selectedMuscle === m ? 'bg-gym-neon text-gym-dark border-gym-neon' : 'bg-gym-card text-gym-muted border-white/5'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-widest text-gym-muted px-1">Found {filtered.length} Exercises</p>
        <div className="space-y-3">
          {filtered.map((ex, i) => (
            <div key={ex.id || i} className="bg-gym-card rounded-2xl border border-white/5 p-3 flex items-center gap-4 active:scale-[0.98] transition-all">
              <Link to={`/exercise/${ex.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gym-dark border border-white/10 shrink-0">
                  <img src={getAssetPath(ex.image)} alt="" className="w-full h-full object-cover opacity-80"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=60'; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-sm truncate">{ex.name}</h3>
                  <p className="text-[9px] text-gym-neon font-bold uppercase">{ex.category}</p>
                  <p className="text-[8px] text-gym-muted font-bold uppercase">{ex.muscleTarget}</p>
                </div>
              </Link>
              <button onClick={() => addToPlan(ex)} className="p-3 bg-white/5 rounded-xl text-gym-neon hover:bg-gym-neon hover:text-white transition-all active:scale-90">
                <Plus size={20} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <Dumbbell size={40} className="mx-auto text-gym-muted/20 mb-4" />
              <p className="text-gym-muted font-bold italic">No workouts match your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}