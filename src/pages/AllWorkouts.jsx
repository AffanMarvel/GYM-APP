import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { getAssetPath } from '../utils/assetPath';
import { 
  Search, ChevronLeft, Filter, Plus, 
  Dumbbell, Target, Info, Check, AlertCircle 
} from 'lucide-react';

const CATEGORIES = [
  'chest', 'back', 'legs', 'shoulders', 'biceps', 
  'triceps', 'abs', 'cardio', 'forearms', 'stretching', 'warmup'
];

export default function AllWorkouts() {
  const navigate = useNavigate();
  const { exercises: allExercises, addToPlan, plannedExercises } = useWorkout();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [addedFeedback, setAddedFeedback] = useState(null);

  // Flatten and filter exercises
  const filteredExercises = useMemo(() => {
    let list = [];
    
    // Flatten all categories
    Object.keys(allExercises).forEach(muscle => {
      if (selectedFilter === 'all' || selectedFilter === muscle) {
        list = [...list, ...allExercises[muscle]];
      }
    });

    // Remove duplicates by ID (just in case)
    const uniqueList = Array.from(new Map(list.map(ex => [ex.id || ex.name, ex])).values());

    // Filter by search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return uniqueList.filter(ex => 
        ex.name.toLowerCase().includes(q) || 
        ex.muscle.toLowerCase().includes(q) ||
        (ex.muscleTarget && ex.muscleTarget.toLowerCase().includes(q))
      );
    }
    
    return uniqueList;
  }, [allExercises, selectedFilter, searchTerm]);

  const isInPlan = (ex) => {
    const exId = ex.id || ex.name.toLowerCase().replace(/ /g, '-');
    return plannedExercises.some(e => (e.id || e.name?.toLowerCase().replace(/ /g, '-')) === exId);
  };

  const handleQuickAdd = (e, ex) => {
    e.stopPropagation();
    const exId = ex.id || ex.name.toLowerCase().replace(/ /g, '-');
    addToPlan({ ...ex, id: exId });
    setAddedFeedback(exId);
    setTimeout(() => setAddedFeedback(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-premium pb-32">
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center space-x-4 pt-2">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-gym-card rounded-xl border border-white/5 active:scale-95 transition-transform"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">All Workouts</h1>
            <p className="text-[10px] font-bold text-gym-muted uppercase tracking-widest">{filteredExercises.length} Exercises Available</p>
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gym-muted group-focus-within:text-gym-neon transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Search exercises, muscles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gym-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gym-neon/50 transition-all font-bold placeholder:text-gym-muted/50 shadow-inner"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedFilter === 'all' 
                ? 'bg-gym-neon text-gym-dark shadow-lg shadow-gym-neon/20' 
                : 'bg-gym-card text-gym-muted border border-white/5'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedFilter === cat 
                  ? 'bg-gym-neon text-gym-dark shadow-lg shadow-gym-neon/20' 
                  : 'bg-gym-card text-gym-muted border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          {filteredExercises.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-gym-card/30 rounded-[2rem] border border-dashed border-white/5">
              <AlertCircle size={40} className="mx-auto text-gym-muted opacity-30" />
              <p className="text-gym-muted font-bold">No results for "{searchTerm}"</p>
            </div>
          ) : (
            filteredExercises.map((ex, i) => {
              const inPlan = isInPlan(ex);
              const exId = ex.id || ex.name.toLowerCase().replace(/ /g, '-');
              
              return (
                <div 
                  key={i}
                  onClick={() => navigate(`/exercise/${exId}`)}
                  className="bg-gym-card rounded-2xl border border-white/5 p-3 flex items-center gap-4 group active:scale-[0.98] transition-all cursor-pointer overflow-hidden relative"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gym-dark border border-white/10 shrink-0">
                    <img 
                      src={getAssetPath(ex.image)} 
                      alt="" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=60'; }} 
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-1.5 py-0.5 bg-gym-neon/10 text-gym-neon text-[8px] font-black uppercase rounded border border-gym-neon/20">
                        {ex.muscle}
                      </span>
                    </div>
                    <h3 className="font-black text-white text-sm truncate group-hover:text-gym-neon transition-colors">{ex.name}</h3>
                    <p className="text-[9px] text-gym-muted font-bold truncate opacity-60">{ex.muscleTarget}</p>
                  </div>

                  {/* Quick Add */}
                  <button
                    onClick={(e) => handleQuickAdd(e, ex)}
                    disabled={inPlan}
                    className={`p-2.5 rounded-xl transition-all ${
                      inPlan 
                        ? 'bg-gym-success/10 text-gym-success' 
                        : 'bg-white/5 text-gym-muted hover:bg-gym-neon hover:text-white'
                    }`}
                  >
                    {inPlan ? <Check size={18} /> : <Plus size={18} />}
                  </button>

                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gym-neon opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {addedFeedback && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-gym-success text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl animate-bounce border-2 border-white/20">
          ✓ Added to Plan
        </div>
      )}
    </div>
  );
}