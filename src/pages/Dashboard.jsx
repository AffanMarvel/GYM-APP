import { useWorkout } from '../context/WorkoutContext';
import { formatTime } from '../context/WorkoutContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, Trash2, Calendar as CalendarIcon, 
  Zap, Flame, ChevronRight, ClipboardCheck,
  Award, Plus, Dumbbell, Clock, Activity, Trophy, Shield, LogOut
} from 'lucide-react';

const NEON = '#818cf8';
const CARD = '#141425';

export default function Dashboard() {
  const context = useWorkout();
  const navigate = useNavigate();
  
  const { 
    history = [], 
    plannedExercises = [],
    activeSession,
    removeFromPlan,
  } = context || {};

  const todayStr = new Date().toLocaleDateString();
  const streak = history.length;
  const spirit = { name: streak >= 7 ? 'Phoenix' : 'Wolf', icon: streak >= 7 ? '🔥' : '🐺' };

  return (
    <div className="min-h-screen bg-[#06060d] pb-32">
      <div className="p-5 slide-up space-y-6 max-w-lg mx-auto">
        <header className="flex flex-col gap-4 pt-2">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-3xl font-black text-white">Train <span style={{ color: NEON }}>Hard</span></h1>
            <button onClick={() => navigate('/admin')} className="p-3 bg-gym-card rounded-2xl border border-white/5">
              <Shield size={22} style={{ color: NEON }} />
            </button>
          </div>
        </header>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Zap size={14} style={{ color: NEON }} />
              Today's Mission
            </h2>
          </div>

          {plannedExercises.length > 0 ? (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/active-workout')}
                className="w-full py-5 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl bg-gym-neon text-gym-dark"
              >
                Start Workout
              </button>
              {plannedExercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between bg-gym-card p-3.5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <img src={ex.image} className="w-10 h-10 rounded-lg object-cover" />
                    <p className="text-xs font-black text-white">{ex.name}</p>
                  </div>
                  <button onClick={() => removeFromPlan(ex.id)} className="text-gym-muted">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gym-card/30 rounded-3xl border border-white/5">
              <p className="text-gym-muted text-xs">No mission planned yet.</p>
              <Link to="/workout" className="text-gym-neon text-xs font-bold mt-2 inline-block">Plan Now +</Link>
            </div>
          )}
        </section>

        {history.length > 0 && (
          <section className="space-y-3">
             <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Recent</h2>
            </div>
            {history.slice(0, 2).map((h, i) => (
              <div key={i} className="bg-gym-card rounded-2xl border border-white/5 p-4 flex justify-between items-center">
                <p className="text-xs font-bold text-white">{h.date}</p>
                <ChevronRight size={16} className="text-gym-muted" />
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
