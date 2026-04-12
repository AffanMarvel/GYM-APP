import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { ChevronLeft, Plus, PlayCircle, Info, Zap, Target, HelpCircle } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exercises, addToPlan } = useWorkout();
  const [exercise, setExercise] = useState(null);
  const [activeTab, setActiveTab] = useState('instructions');

  useEffect(() => {
    let found = null;
    Object.values(exercises).forEach(cat => {
      const ex = cat.find(e => e.id === id);
      if (ex) found = ex;
    });
    setExercise(found);
  }, [id, exercises]);

  if (!exercise) return <div className="p-10 text-center text-white">Exercise not found</div>;

  return (
    <div className="min-h-screen pb-32" style={{ background: '#06060d' }}>
      {/* Hero Image Section */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img src={getAssetPath(exercise.image)} alt={exercise.name} className="w-full h-full object-cover sm:object-contain bg-black/40"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06060d] via-transparent to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl active:scale-90 transition-all">
          <ChevronLeft size={22} />
        </button>
        
        {exercise.tutorialUrl && (
          <a href={exercise.tutorialUrl} target="_blank" rel="noopener noreferrer" 
            className="absolute bottom-6 right-6 p-4 bg-gym-neon text-gym-dark rounded-2xl shadow-lg shadow-gym-neon/30 active:scale-95 transition-all flex items-center gap-2">
            <PlayCircle size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-widest">Tutorial</span>
          </a>
        )}
      </div>

      <div className="px-6 -mt-10 relative z-10 space-y-8">
        {/* Title & Difficulty Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gym-neon/10 text-gym-neon text-[9px] font-black uppercase rounded-lg border border-gym-neon/20 tracking-widest">
              {exercise.category || exercise.muscle}
            </span>
            {exercise.difficulty && (
              <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border tracking-widest ${
                exercise.difficulty === 'beginner' ? 'bg-gym-cyan/10 text-gym-cyan border-gym-cyan/20' :
                exercise.difficulty === 'intermediate' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {exercise.difficulty}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">{exercise.name}</h1>
          <div className="flex items-center gap-2 text-gym-muted">
            <Target size={14} className="text-gym-neon opacity-70" />
            <p className="text-xs font-bold uppercase tracking-wider">{exercise.muscleTarget}</p>
          </div>
        </div>

        {/* Action Button */}
        <button onClick={() => addToPlan(exercise)}
          className="w-full py-5 bg-gradient-to-r from-gym-neon to-[#a5b4fc] text-gym-dark font-black text-sm uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-gym-neon/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
          <Plus size={22} strokeWidth={3} /> Add To Workout
        </button>

        {/* Progression Levels / Recommended Volume */}
        {exercise.levels && (
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 px-1">
              <Zap size={14} className="text-gym-neon" /> Recommended Progression
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
              {Object.entries(exercise.levels).map(([level, data]) => (
                <div key={level} className="min-w-[160px] flex-1 p-4 bg-[#141425] rounded-3xl border border-white/5 space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gym-neon/80">{level}</p>
                  <div>
                    <p className="text-xl font-black text-white">{data.sets}x{data.reps}</p>
                    <p className="text-[9px] font-bold text-gym-muted mt-1 uppercase truncate">{data.focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabbed Content: Instructions & Tips */}
        <div className="space-y-6">
          <div className="flex gap-8 border-b border-white/5">
            <button onClick={() => setActiveTab('instructions')}
              className={`text-[10px] font-black uppercase tracking-widest pb-3 relative transition-colors ${activeTab === 'instructions' ? 'text-white' : 'text-gym-muted'}`}>
              Theories
              {activeTab === 'instructions' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gym-neon rounded-full" />}
            </button>
            <button onClick={() => setActiveTab('tips')}
              className={`text-[10px] font-black uppercase tracking-widest pb-3 relative transition-colors ${activeTab === 'tips' ? 'text-white' : 'text-gym-muted'}`}>
              Pro Tips
              {activeTab === 'tips' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gym-neon rounded-full" />}
            </button>
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'instructions' ? (
              <ul className="space-y-4">
                {(exercise.instructions || []).map((step, i) => (
                  <li key={i} className="flex gap-4 p-5 bg-[#141425]/50 rounded-3xl border border-white/[0.03] group hover:border-gym-neon/30 transition-all">
                    <span className="text-gym-neon font-black text-xs opacity-30 group-hover:opacity-100 transition-opacity pt-1">0{i + 1}</span>
                    <p className="text-sm font-medium text-white/80 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-4">
                {(exercise.tips && exercise.tips.length > 0) ? (
                  exercise.tips.map((tip, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-gym-neon/5 rounded-3xl border border-gym-neon/10">
                      <Zap size={18} className="text-gym-neon shrink-0 mt-1" />
                      <p className="text-sm font-bold text-gym-neon/90 leading-relaxed italic">"{tip}"</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <HelpCircle size={32} className="mx-auto text-gym-muted opacity-30 mb-3" />
                    <p className="text-xs font-bold text-gym-muted uppercase tracking-widest">No expert tips logged yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
