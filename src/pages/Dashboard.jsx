import { useWorkout, formatTime } from '../context/WorkoutContext';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Trash2, Zap, Flame, ChevronRight, ClipboardCheck, Plus, Dumbbell, Clock, Activity, Shield } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';

const NEON = '#818cf8';
const CYAN = '#22d3ee';
const FIRE = '#f97316';
const GOLD = '#fbbf24';
const ACCENT = '#a855f7';
const CARD = '#141425';

export default function Dashboard() {
  const { history = [], plannedExercises = [], activeSession, removeFromPlan } = useWorkout() || {};
  const navigate = useNavigate();

  const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const todayStr = new Date().toLocaleDateString();
  const todaySessions = (history || []).filter(h => h.date === todayStr);
  const todayCalories = todaySessions.reduce((s, h) => s + (h.totalCalories || 0), 0);
  const todayDuration = todaySessions.reduce((s, h) => s + (h.durationSeconds || 0), 0);
  const todaySets = todaySessions.reduce((s, h) => s + (h.totalSets || 0), 0);
  const todayExercises = todaySessions.reduce((s, h) => s + (h.exercisesCompleted || 0), 0);
  const streak = (history || []).length;
  const spirit = { name: streak >= 7 ? 'Phoenix' : 'Wolf', icon: streak >= 7 ? '🔥' : '🐺' };

  return (
    <div className="min-h-screen pb-32" style={{ background: '#06060d' }}>
      <div className="p-5 slide-up space-y-6 max-w-lg mx-auto">
        <header className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-3xl font-black text-white">Train <span style={{ color: NEON, textShadow: `0 0 20px ${NEON}4D` }}>Hard</span></h1>
            <p className="text-[10px] font-bold text-gym-muted uppercase tracking-[0.2em] mt-2">{todayDateStr}</p>
          </div>
          <button onClick={() => navigate('/admin')} className="p-3 rounded-2xl bg-gym-neon/10 border border-gym-neon/20">
            <Shield size={22} style={{ color: NEON }} />
          </button>
        </header>

        <div className="flex items-center justify-between p-4 rounded-3xl border border-white/5" style={{ background: CARD }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,0.03)' }}>{spirit.icon}</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gym-muted mb-1">Streak</p>
              <p className="text-xl font-black text-white">{streak} <span className="text-xs text-gray-400">Days</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gym-neon mb-1">Spirit</p>
            <p className="text-lg font-black text-white">{spirit.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Flame size={16} style={{ color: FIRE }} />, val: todayCalories, label: 'Cal' },
            { icon: <Clock size={16} style={{ color: CYAN }} />, val: formatTime(todayDuration), label: 'Time' },
            { icon: <Activity size={16} style={{ color: ACCENT }} />, val: todaySets, label: 'Sets' },
            { icon: <Dumbbell size={16} style={{ color: GOLD }} />, val: todayExercises, label: 'Done' },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-2xl border border-white/5 text-center" style={{ background: CARD }}>
              <div className="mx-auto mb-1 flex justify-center">{s.icon}</div>
              <p className="text-lg font-black text-white">{s.val}</p>
              <p className="text-[8px] uppercase font-bold tracking-widest text-gym-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 px-1">
            <Zap size={14} style={{ color: NEON }} /> Today's Mission
          </h2>
          {(plannedExercises || []).length > 0 ? (
            <div className="space-y-3">
              <button onClick={() => navigate('/active-workout')}
                className="w-full py-5 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3"
                style={{ background: `linear-gradient(135deg, #6366f1, #a855f7)`, boxShadow: '0 0 25px rgba(99,102,241,0.3)' }}>
                <Play size={22} fill="currentColor" /> Start Workout
              </button>
              {plannedExercises.map((ex, i) => (
                <div key={i} className="flex items-center justify-between bg-gym-card p-3.5 rounded-2xl border border-white/5">
                  <Link to={`/exercise/${ex.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gym-dark border border-white/10 shrink-0">
                      <img src={getAssetPath(ex.image)} alt="" className="w-full h-full object-cover opacity-80"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=60'; }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white truncate">{ex.name}</p>
                      <p className="text-[9px] text-gym-muted uppercase font-bold">{ex.muscleTarget || ex.muscle}</p>
                    </div>
                  </Link>
                  <button onClick={() => removeFromPlan(ex.id)} className="p-2 ml-2 text-gym-muted hover:text-gym-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gym-card/30 rounded-3xl border border-white/5 space-y-4">
              <Dumbbell size={40} className="text-gym-muted/30 mx-auto" />
              <p className="text-gym-muted text-sm">No exercises planned. Start your mission!</p>
              <Link to="/workout" className="inline-flex items-center gap-2 px-6 py-3 bg-gym-neon/10 border border-gym-neon/20 rounded-2xl text-xs font-black uppercase tracking-widest text-gym-neon">
                <Plus size={14} /> Select Exercises
              </Link>
            </div>
          )}
        </section>

        {(history || []).length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <ClipboardCheck size={14} style={{ color: NEON }} /> Recent
              </h2>
              <Link to="/history" className="text-[9px] font-bold text-gym-neon">View All →</Link>
            </div>
            {history.slice(0, 2).map((h, i) => (
              <div key={i} className="bg-gym-card rounded-2xl border border-white/5 p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">{h.date}</p>
                  <div className="flex gap-3 text-[9px] font-bold text-gym-muted mt-1">
                    <span>⏱ {h.durationFormatted}</span>
                    <span>🔥 {h.totalCalories} cal</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gym-muted" />
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
