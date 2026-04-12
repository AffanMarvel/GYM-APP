import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExerciseById } from '../api/exerciseApi';
import { useWorkout } from '../context/WorkoutContext';
import { 
  ChevronLeft, Play, CheckCircle2, Plus, 
  Trophy, Flame, Info, Youtube, AlertCircle
} from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToPlan, plannedExercises, removeFromPlan, exercises: allExercises } = useWorkout();
  
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Find exercise in context
    let found = null;
    for (const cat in allExercises) {
      const match = allExercises[cat].find(ex => (ex.id === id || ex.name.toLowerCase().replace(/ /g, '-') === id));
      if (match) {
        found = match;
        break;
      }
    }
    setExercise(found);
    setLoading(false);
  }, [id, allExercises]);

  const exerciseId = exercise?.id || exercise?.name?.toLowerCase().replace(/ /g, '-');
  const isPlanned = plannedExercises.some(p => (p.id || p.name?.toLowerCase().replace(/ /g, '-')) === exerciseId);

  const handlePlanToggle = () => {
    if (isPlanned) {
      removeFromPlan(exerciseId);
    } else {
      addToPlan({ ...exercise, id: exerciseId });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gym-dark flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gym-neon border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!exercise) {
    return <div className="min-h-screen bg-gym-dark p-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-white mb-4">Exercise not found</h1>
      <button onClick={() => navigate(-1)} className="text-gym-neon underline">Go back</button>
    </div>;
  }

  const currentLevelData = exercise.levels?.[selectedLevel] || { sets: 3, reps: "10-12", focus: "Hypertrophy" };

  return (
    <div className="min-h-screen bg-gym-dark pb-32">
      {/* Hero */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img 
          src={getAssetPath(exercise.image)} 
          alt={exercise.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541534741688-6078c64b52d3?w=800&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gym-dark via-gym-dark/40 to-transparent" />
        
        <div className="absolute top-8 left-5 right-5 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 text-white active:scale-95 transition-transform"
          >
            <ChevronLeft size={22} />
          </button>
          
          <a 
            href={exercise.tutorialUrl || `https://www.youtube.com/results?search_query=how+to+do+${exercise.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-red-600/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
          >
            <Youtube size={14} />
            <span>Tutorial</span>
          </a>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-1 bg-gym-neon text-gym-dark text-[9px] font-black uppercase rounded-md tracking-tighter">
              {exercise.muscle}
            </span>
            <span className="px-2 py-1 bg-white/10 backdrop-blur-md text-white text-[9px] font-bold uppercase rounded-md border border-white/10">
              {exercise.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">{exercise.name}</h1>
        </div>
      </div>

      <div className="p-5 space-y-6 slide-up">
        {/* Level Selection */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-gym-neon" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gym-muted">Your Level</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 p-1 bg-gym-card rounded-xl border border-white/5">
            {['beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  selectedLevel === lvl 
                    ? 'bg-gym-neon text-gym-dark shadow-lg shadow-gym-neon/20'
                    : 'text-gym-muted hover:bg-white/5'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gym-card p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-[9px] font-bold text-gym-muted uppercase tracking-tighter mb-1">Target Sets</p>
            <p className="text-2xl font-black text-white">{currentLevelData.sets} <span className="text-sm text-gym-neon">Sets</span></p>
          </div>
          <div className="bg-gym-card p-4 rounded-2xl border border-white/5 text-center">
            <p className="text-[9px] font-bold text-gym-muted uppercase tracking-tighter mb-1">Target Reps</p>
            <p className="text-2xl font-black text-white">{currentLevelData.reps} <span className="text-sm text-gym-neon">Reps</span></p>
          </div>
        </div>

        {/* Focus */}
        <div className="p-3.5 bg-gym-neon/5 rounded-xl border border-gym-neon/15 flex items-start space-x-3">
          <Info size={16} className="text-gym-neon mt-0.5 shrink-0" />
          <div>
            <p className="text-[9px] font-black text-gym-neon uppercase tracking-widest mb-0.5">Focus</p>
            <p className="text-xs text-gym-text/80 leading-relaxed">{currentLevelData.focus}</p>
          </div>
        </div>

        {/* Instructions */}
        <section className="space-y-3">
          <h3 className="text-sm font-black text-white px-2 border-l-4 border-gym-neon">Steps</h3>
          <div className="space-y-2">
            {exercise.instructions.map((step, i) => (
              <div key={i} className="flex space-x-3 p-3 bg-gym-card rounded-xl border border-white/5">
                <span className="text-gym-neon font-black text-sm w-5 shrink-0">{i + 1}</span>
                <p className="text-gym-text/80 text-xs leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        {exercise.tips && (
          <section className="space-y-3">
            <h3 className="text-sm font-black text-white px-2 border-l-4 border-gym-accent">Pro Tips</h3>
            <div className="bg-gym-card/50 rounded-2xl p-4 border border-dashed border-white/10">
              <ul className="space-y-3">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs italic text-gym-muted leading-relaxed">
                    <span className="text-gym-accent mt-0.5 shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      {/* Floating Action - positioned above bottom nav */}
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto">
        <button 
          onClick={handlePlanToggle}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3 border-2 active:scale-[0.97]"
          style={isPlanned 
            ? { background: 'transparent', borderColor: '#818cf8', color: '#818cf8' }
            : { background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderColor: '#6366f1', color: '#fff', boxShadow: '0 0 25px rgba(99,102,241,0.3)' }
          }
        >
          {isPlanned ? (
            <><CheckCircle2 size={20} strokeWidth={3} /><span>Added to Plan</span></>
          ) : (
            <><Plus size={20} strokeWidth={3} /><span>Add to Today's Plan</span></>
          )}
        </button>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] bg-gradient-neon text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl animate-bounce">
          Added to plan ✓
        </div>
      )}
    </div>
  );
}
