import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { 
  ChevronLeft, Play, Info, Check, 
  Dumbbell, Target, ChevronRight, Activity, Plus 
} from 'lucide-react';
import { workoutData } from '../data/exercises';

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToPlan } = useWorkout();
  const [exercise, setExercise] = useState(null);
  const [activeTab, setActiveTab] = useState('instructions');

  useEffect(() => {
    // Flatten all categories to find the exercise
    let found = null;
    Object.values(workoutData).forEach(cat => {
      const ex = cat.find(e => e.id === id);
      if (ex) found = ex;
    });
    setExercise(found);
  }, [id]);

  if (!exercise) return <div className="p-10 text-center text-white">Exercise not found</div>;

  return (
    <div className="min-h-screen pb-32" style={{ background: '#06060d' }}>
      {/* Hero Image */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img src={exercise.image} alt={exercise.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06060d] via-transparent to-transparent" />
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10"
        >
          <ChevronLeft size={22} className="text-white" />
        </button>
      </div>

      <div className="px-6 -mt-12 relative z-10 space-y-8">
        {/* Title & Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gym-neon/10 text-gym-neon text-[10px] font-black uppercase rounded-lg border border-gym-neon/20">
              {exercise.muscle}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">{exercise.name}</h1>
          <p className="text-gym-muted text-sm font-medium leading-relaxed opacity-80">{exercise.muscleTarget}</p>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => addToPlan(exercise)}
          className="w-full py-5 bg-gym-neon text-gym-dark font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-gym-neon/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Plus size={20} />
          Add To Today's Plan
        </button>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex gap-8 border-b border-white/5 pb-2">
            {['instructions', 'tips'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] font-black uppercase tracking-widest pb-2 transition-all relative ${
                  activeTab === tab ? 'text-white' : 'text-gym-muted'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gym-neon rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="text-gym-muted text-sm leading-relaxed space-y-4">
            {activeTab === 'instructions' ? (
              <ul className="space-y-4">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4 p-4 bg-gym-card rounded-2xl border border-white/5">
                    <span className="text-gym-neon font-black text-lg opacity-40">0{i+1}</span>
                    <p className="font-medium text-white/80">{step}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-gym-card p-6 rounded-3xl border border-white/5 border-dashed">
                <p className="italic text-center opacity-60 font-medium">Keep your core tight and maintain controlled movements for maximum muscle engagement.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
