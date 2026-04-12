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
        <div className="grid grid-cols-1 gap-6 mt-6">
          {filtered.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-50">
              <Dumbbell size={40} className="mx-auto text-gym-muted/50 mb-4" />
              <p className="text-gym-muted font-bold tracking-widest uppercase text-xs">No workouts match your search</p>
            </div>
          ) : (
            filtered.map((ex, i) => (
              <div key={ex.id || i} className="group bg-[#141425] rounded-3xl overflow-hidden border border-white/5 hover:border-gym-neon/30 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                {/* Large Thumbnail Section */}
                <Link to={`/exercise/${ex.id}`} className="block relative h-56 w-full bg-black overflow-hidden cursor-pointer">
                  <img 
                    src={getAssetPath(ex.image)} 
                    alt={ex.name} 
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'; }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141425] via-transparent to-transparent opacity-90" />
                  <div className="absolute inset-0 bg-gym-neon/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Tag Overlays */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-gym-neon/90 text-gym-dark text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-gym-neon">
                      {ex.category}
                    </span>
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/10">
                      {ex.muscleTarget}
                    </span>
                  </div>
                </Link>

                {/* Details & Action Section */}
                <div className="p-5 space-y-4 relative z-10 -mt-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <Link to={`/exercise/${ex.id}`}>
                        <h3 className="font-black text-white text-xl truncate hover:text-gym-neon transition-colors leading-tight">{ex.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                            ex.difficulty === 'beginner' ? 'bg-gym-cyan/10 text-gym-cyan border-gym-cyan/20' :
                            ex.difficulty === 'intermediate' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {ex.difficulty || 'Expert'}
                          </span>
                          <span className="text-[9px] text-gym-muted font-bold uppercase tracking-widest opacity-60">
                            {ex.muscleTarget}
                          </span>
                        </div>
                      </Link>
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); addToPlan(ex); }} 
                      className="flex-shrink-0 w-12 h-12 bg-gym-neon text-gym-dark rounded-xl flex items-center justify-center hover:bg-white transition-colors shadow-[0_0_15px_rgba(129,140,248,0.2)] active:scale-90"
                      title="Add to Workout Plan"
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  </div>

                  {/* Glanceable Stats Row */}
                  <div className="flex items-center gap-4 pt-3 border-t border-white/[0.03]">
                    <div className="flex items-center gap-1.5">
                      <Dumbbell size={12} className="text-gym-neon" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">
                        {ex.levels?.beginner?.sets || 3}x{ex.levels?.beginner?.reps || '10'}
                      </span>
                    </div>
                    <div className="h-3 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-1.5">
                      <Search size={12} className="text-gym-muted" />
                      <span className="text-[10px] font-bold text-gym-muted uppercase tracking-wider">
                        {ex.instructions?.length || 0} Steps
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}