import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { 
  ChevronLeft, Search, Filter, Play, 
  Dumbbell, Target, Info, Plus 
} from 'lucide-react';
import { workoutData } from '../data/exercises';

export default function ExerciseList() {
  const { muscle } = useParams();
  const { addToPlan } = useWorkout();
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch from local data
    const data = workoutData[muscle] || [];
    setExercises(data);
    setLoading(false);
  }, [muscle]);

  const filtered = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscleTarget.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-32" style={{ background: '#06060d' }}>
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center space-x-4 pt-2">
          <Link to="/workout" className="p-2.5 bg-gym-card rounded-xl border border-white/5">
            <ChevronLeft size={22} className="text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white capitalize">{muscle}</h1>
            <p className="text-[10px] font-bold text-gym-muted uppercase tracking-widest">{exercises.length} Exercises Available</p>
          </div>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gym-muted" size={18} />
          <input 
            type="text"
            placeholder={`Search ${muscle} exercises...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gym-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gym-neon/50 transition-all font-bold"
          />
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center animate-pulse text-gym-muted font-black uppercase tracking-widest text-xs">Loading Exercises...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gym-muted font-bold">No exercises found</div>
          ) : (
            filtered.map((ex, i) => (
              <div 
                key={i}
                className="bg-gym-card rounded-2xl border border-white/5 p-3 flex items-center gap-4 group active:scale-[0.98] transition-all"
              >
                <Link to={`/exercise/${ex.id}`} className="flex-1 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gym-dark border border-white/10 shrink-0">
                    <img src={ex.image} alt="" className="w-full h-full object-cover opacity-80" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=60'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-sm truncate">{ex.name}</h3>
                    <p className="text-[9px] text-gym-muted font-bold truncate uppercase">{ex.muscleTarget}</p>
                  </div>
                </Link>
                <button 
                  onClick={() => addToPlan(ex)}
                  className="p-3 bg-white/5 rounded-xl text-gym-neon hover:bg-gym-neon hover:text-white transition-all active:scale-90"
                >
                  <Plus size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
