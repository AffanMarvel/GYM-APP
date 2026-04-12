import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExercisesByMuscle } from '../api/exerciseApi';
import { ChevronLeft, Plus, PlayCircle, Target, Lightbulb, ClipboardList, Check } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function ExerciseList() {
  const { muscle } = useParams();
  const navigate = useNavigate();
  const { addToPlan, plannedExercises } = useWorkout();
  
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedFeedback, setAddedFeedback] = useState(null);

  useEffect(() => {
    async function loadExercises() {
      setLoading(true);
      const data = await getExercisesByMuscle(muscle);
      setExercises(data || []);
      setLoading(false);
    }
    loadExercises();
  }, [muscle]);

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
    <div className="min-h-screen bg-gradient-premium transition-all duration-500">
      <div className="p-6 slide-up pb-24 max-w-2xl mx-auto">
        <header className="mb-8 flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-gym-card rounded-xl hover:bg-white/10 transition-colors border border-white/5 active:scale-95"
          >
            <ChevronLeft size={24} className="text-gym-text" />
          </button>
          <h1 className="text-3xl font-extrabold capitalize tracking-tight">
            {muscle.replace('-', ' ')} <span className="text-gym-neon font-light">Workouts</span>
          </h1>
        </header>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gym-card rounded-3xl w-full shimmer border border-white/5" />
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-20 bg-gym-card rounded-3xl border border-dashed border-white/10">
            <p className="text-gym-muted text-lg">No exercises found for this category.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {exercises.map((ex, i) => {
              const inPlan = isInPlan(ex);
              const exId = ex.id || ex.name.toLowerCase().replace(/ /g, '-');
              const justAdded = addedFeedback === exId;

              return (
                <div 
                  key={i} 
                  className="bg-gym-card rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl hover:border-gym-neon/30 transition-all duration-300 group"
                >
                  {/* Image Section */}
                  <div className="h-64 w-full bg-black relative overflow-hidden cursor-pointer" onClick={() => navigate(`/exercise/${exId}`)}>
                    <img 
                      src={ex.image} 
                      alt={ex.name}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gym-card via-transparent to-transparent opacity-60" />
                    
                    {/* Quick Add Button - on the OUTSIDE of the card click area */}
                    <div className="absolute bottom-6 right-6 z-10">
                      <button 
                        onClick={(e) => handleQuickAdd(e, ex)}
                        disabled={inPlan}
                        className={`p-4 rounded-2xl shadow-lg transition-all duration-300 active:scale-90 ${
                          inPlan 
                            ? 'bg-gym-success text-white' 
                            : justAdded
                              ? 'bg-gym-success text-white scale-110'
                              : 'bg-gym-neon text-white hover:scale-110 glow-neon'
                        }`}
                        title={inPlan ? 'Already in plan' : 'Add to today\'s plan'}
                      >
                        {inPlan || justAdded ? <Check size={24} strokeWidth={3} /> : <Plus size={24} strokeWidth={3} />}
                      </button>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute top-6 left-6">
                      <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md rounded-lg text-white border border-white/10">
                        {ex.difficulty}
                      </span>
                    </div>

                    {/* In Plan Badge */}
                    {inPlan && (
                      <div className="absolute top-6 right-6">
                        <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-gym-neon/80 backdrop-blur-md rounded-lg text-white">
                          ✓ In Plan
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Section - visible like the old design */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-black text-2xl leading-tight text-white group-hover:text-gym-neon transition-colors cursor-pointer" onClick={() => navigate(`/exercise/${exId}`)}>
                        {ex.name}
                      </h3>
                    </div>

                    {/* Muscle Target */}
                    <div className="flex items-center space-x-2 mb-6 p-3 bg-white/5 rounded-2xl border border-white/5">
                      <div className="p-1.5 bg-gym-neon/10 rounded-lg">
                        <Target size={18} className="text-gym-neon" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gym-muted font-bold uppercase tracking-tighter">Primary Target</p>
                        <p className="text-sm font-bold text-white/90">{ex.muscleTarget}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Instructions - fully visible */}
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <ClipboardList size={18} className="text-gym-neon" />
                          <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Instructions</h4>
                        </div>
                        <ul className="space-y-2">
                          {ex.instructions.map((step, idx) => (
                            <li key={idx} className="flex items-start space-x-3 text-sm text-gym-muted leading-relaxed">
                              <span className="text-gym-neon font-black mt-0.5">{idx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pro Tips - fully visible */}
                      {ex.tips && ex.tips.length > 0 && (
                        <div className="p-4 bg-gym-accent/5 rounded-2xl border border-gym-accent/10">
                          <div className="flex items-center space-x-2 mb-3">
                            <Lightbulb size={18} className="text-gym-accent" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-gym-accent/80">Pro Tips</h4>
                          </div>
                          <ul className="space-y-2">
                            {ex.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start space-x-2 text-sm text-gym-text/80 leading-relaxed italic">
                                <span className="text-gym-accent">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Tutorial Link */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <a 
                        href={ex.tutorialUrl || `https://www.youtube.com/results?search_query=how+to+perform+${encodeURIComponent(ex.name)}+workout`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 w-full py-3 bg-white/5 rounded-2xl text-sm font-bold text-gym-text hover:bg-white/10 hover:text-gym-neon transition-all"
                      >
                        <PlayCircle size={20} />
                        <span>Watch Pro Tutorial</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Added Toast */}
      {addedFeedback && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] bg-gradient-neon text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl animate-bounce">
          ✓ Added to today's plan!
        </div>
      )}
    </div>
  );
}
