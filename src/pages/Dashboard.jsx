import { useWorkout } from '../context/WorkoutContext';
import { formatTime } from '../context/WorkoutContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, Trash2, Calendar as CalendarIcon, 
  Zap, Flame, ChevronRight, ClipboardCheck,
  Award, Plus, Dumbbell, Clock, Activity, Trophy
} from 'lucide-react';

const NEON = '#818cf8';
const ACCENT = '#a855f7';
const CYAN = '#22d3ee';
const FIRE = '#f97316';
const GOLD = '#fbbf24';
const CARD = '#141425';

export default function Dashboard() {
  const context = useWorkout();
  const navigate = useNavigate();
  
  const { 
    history = [], 
    todaysWorkout = { logs: [] }, 
    plannedExercises = [],
    activeSession,
    removeFromPlan,
  } = context || {};

  const today = new Date();
  const todayDateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const totalWorkouts = history?.length || 0;

  // Calculate real streak
  const calcStreak = () => {
    if (!history || history.length === 0) return 0;
    let streak = 0;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toLocaleDateString();
      const hasWorkout = history.some(h => h.date === dateStr);
      if (hasWorkout) streak++;
      else if (i > 0) break;
    }
    return streak;
  };
  const streak = calcStreak();

  // Today's stats from completed sessions 
  const todayStr = new Date().toLocaleDateString();
  const todaySessions = history.filter(h => h.date === todayStr);
  const todayCalories = todaySessions.reduce((s, h) => s + (h.totalCalories || 0), 0) || todaysWorkout?.calories || 0;
  const todayDuration = todaySessions.reduce((s, h) => s + (h.durationSeconds || 0), 0);
  const todaySets = todaySessions.reduce((s, h) => s + (h.totalSets || 0), 0) || todaysWorkout?.logs?.reduce((s, l) => s + (l.sets?.length || 0), 0) || 0;
  const todayExercises = todaySessions.reduce((s, h) => s + (h.exercisesCompleted || 0), 0);

  // Get today's completed muscle groups
  const todayMuscles = [...new Set(todaySessions.flatMap(h => (h.logs || []).map(l => l.muscle)).filter(Boolean))];

  // Spirit Animal
  const getSpiritAnimal = (s) => {
    if (s >= 30) return { name: 'Titan', icon: '⚡' };
    if (s >= 15) return { name: 'Dragon', icon: '🐲' };
    if (s >= 7) return { name: 'Phoenix', icon: '🔥' };
    if (s >= 3) return { name: 'Gorilla', icon: '🦍' };
    return { name: 'Wolf', icon: '🐺' };
  };
  const spirit = getSpiritAnimal(streak);

  // Week Days
  const weekDays = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dStr = d.toLocaleDateString();
    weekDays.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      isToday: i === 0,
      isCompleted: history?.some(h => h.date === dStr)
    });
  }

  const hasActivePlan = plannedExercises && plannedExercises.length > 0;

  return (
    <div className="min-h-screen bg-gradient-premium pb-32">
      <div className="p-5 slide-up space-y-6 max-w-lg mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Train <span style={{ color: NEON, textShadow: `0 0 15px rgba(99,102,241,0.6)` }}>Hard</span>
            </h1>
            <p style={{ color: '#6b7280' }} className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{todayDateStr}</p>
          </div>
          <div className="flex items-center border border-white/5 px-4 py-2.5 rounded-2xl gap-3" style={{ background: CARD }}>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#6b7280' }}>{spirit.name}</p>
              <p className="text-sm font-black text-white">{streak} Day</p>
            </div>
            <span className="text-2xl">{spirit.icon}</span>
          </div>
        </header>

        {/* Today's Performance */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-2xl border border-white/5 text-center" style={{ background: CARD }}>
            <Flame size={16} style={{ color: FIRE }} className="mx-auto mb-1" />
            <p className="text-lg font-black text-white">{todayCalories}</p>
            <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: '#6b7280' }}>Cal</p>
          </div>
          <div className="p-3 rounded-2xl border border-white/5 text-center" style={{ background: CARD }}>
            <Clock size={16} style={{ color: CYAN }} className="mx-auto mb-1" />
            <p className="text-lg font-black text-white">{todayDuration > 0 ? formatTime(todayDuration) : '00:00'}</p>
            <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: '#6b7280' }}>Time</p>
          </div>
          <div className="p-3 rounded-2xl border border-white/5 text-center" style={{ background: CARD }}>
            <Activity size={16} style={{ color: ACCENT }} className="mx-auto mb-1" />
            <p className="text-lg font-black text-white">{todaySets}</p>
            <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: '#6b7280' }}>Sets</p>
          </div>
          <div className="p-3 rounded-2xl border border-white/5 text-center" style={{ background: CARD }}>
            <Dumbbell size={16} style={{ color: GOLD }} className="mx-auto mb-1" />
            <p className="text-lg font-black text-white">{todayExercises}</p>
            <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: '#6b7280' }}>Done</p>
          </div>
        </div>

        {/* Today's Completed Muscles */}
        {todayMuscles.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-bold text-gym-muted uppercase tracking-widest">Today:</span>
            {todayMuscles.map((m, i) => (
              <span key={i} className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg" style={{ background: 'rgba(99,102,241,0.1)', color: NEON, border: '1px solid rgba(99,102,241,0.2)' }}>
                {m}
              </span>
            ))}
          </div>
        )}

        {/* Weekly Progress */}
        <section className="glass p-5 rounded-3xl">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <CalendarIcon size={14} style={{ color: NEON }} />
              This Week
            </h2>
            <p className="text-[9px] font-black uppercase px-2 py-1 rounded-md" style={{ color: NEON, background: 'rgba(99,102,241,0.1)' }}>
              {totalWorkouts} Total
            </p>
          </div>
          <div className="flex justify-between items-center bg-gym-dark/40 p-3 rounded-2xl">
            {weekDays.map((wd, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-tighter" style={{ color: wd.isToday ? NEON : '#6b7280' }}>{wd.day}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all" style={
                  wd.isToday 
                    ? { background: NEON, borderColor: NEON, color: '#fff', boxShadow: `0 0 15px rgba(99,102,241,0.3)`, transform: 'scale(1.1)' } 
                    : wd.isCompleted 
                      ? { background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.3)', color: NEON }
                      : { background: 'transparent', borderColor: 'rgba(255,255,255,0.05)', color: '#6b7280' }
                }>
                  <span className="text-xs font-black">{wd.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Today's Plan / Start Workout */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Zap size={14} style={{ color: NEON }} />
              Today's Mission
            </h2>
            {hasActivePlan && (
              <span className="text-[9px] font-black text-gym-accent bg-gym-accent/10 px-2 py-1 rounded-md">
                {plannedExercises.length} Selected
              </span>
            )}
          </div>

          {hasActivePlan ? (
            <div className="space-y-3">
              {/* Start Workout */}
              <button
                onClick={() => navigate('/active-workout')}
                className="w-full py-5 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 25px rgba(99,102,241,0.3)' }}
              >
                <Play size={22} fill="currentColor" />
                Start Workout
              </button>

              {/* Exercise List with delete */}
              <div className="space-y-2">
                {plannedExercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between bg-gym-card p-3.5 rounded-2xl border border-white/5 group">
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => navigate(`/exercise/${ex.id}`)}>
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-gym-dark border border-white/10 shrink-0">
                        <img src={ex.image} alt="" className="w-full h-full object-cover opacity-80" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=60'; }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white group-hover:text-gym-neon transition-colors truncate">{ex.name}</p>
                        <p className="text-[9px] text-gym-muted uppercase font-bold tracking-tighter">{ex.muscleTarget || ex.muscle}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromPlan(ex.id); }}
                      className="p-2 ml-2 rounded-xl hover:bg-gym-danger/10 text-gym-muted hover:text-gym-danger transition-all active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <Link to="/workout" className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gym-muted hover:text-gym-neon hover:border-gym-neon/30 transition-all">
                <Plus size={14} />
                Add More Exercises
              </Link>
            </div>
          ) : (
            <div className="glass rounded-3xl p-8 text-center space-y-4">
              <Dumbbell size={40} className="text-gym-muted/30 mx-auto" />
              <p className="text-gym-muted text-sm">No exercises planned yet.<br/>Build your daily mission!</p>
              <Link to="/workout" className="inline-flex items-center gap-2 px-6 py-3 bg-gym-neon/10 border border-gym-neon/20 rounded-2xl text-xs font-black uppercase tracking-widest text-gym-neon hover:bg-gym-neon/20 transition-all">
                <Plus size={14} />
                Select Exercises
              </Link>
            </div>
          )}
        </section>

        {/* Active Session Banner */}
        {activeSession && activeSession.isRunning && (
          <button
            onClick={() => navigate('/active-workout')}
            className="w-full py-4 bg-gym-fire/10 border border-gym-fire/20 rounded-2xl flex items-center justify-center gap-3 glow-fire active:scale-[0.98] transition-transform"
          >
            <div className="w-3 h-3 bg-gym-fire rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-gym-fire">
              Workout In Progress — {formatTime(activeSession.elapsedSeconds || 0)}
            </span>
            <ChevronRight size={16} className="text-gym-fire" />
          </button>
        )}

        {/* Recent Sessions - with exercise images and names */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <ClipboardCheck size={14} className="text-gym-neon" />
              Recent Sessions
            </h2>
            {history.length > 0 && (
              <Link to="/history" className="text-[9px] font-bold text-gym-neon">View All →</Link>
            )}
          </div>
          
          {(!history || history.length === 0) ? (
            <div className="p-8 text-center bg-gym-card/30 rounded-2xl border border-white/5">
              <p className="text-gym-muted text-xs italic">No workout history yet. Start your first session!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 3).map((h, i) => (
                <div key={i} className="bg-gym-card rounded-2xl border border-white/5 overflow-hidden">
                  {/* Session Header */}
                  <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gym-neon/10 rounded-lg">
                        <Trophy size={14} className="text-gym-neon" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{h.date}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {h.durationFormatted && <span className="text-[9px] text-gym-cyan font-bold">⏱ {h.durationFormatted}</span>}
                          {h.totalCalories > 0 && <span className="text-[9px] text-gym-fire font-bold">🔥 {h.totalCalories} cal</span>}
                          {h.totalSets > 0 && <span className="text-[9px] text-gym-accent font-bold">{h.totalSets} sets</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-[8px] text-gym-muted bg-gym-dark/50 px-2 py-1 rounded-md">{h.finishedAt || ''}</span>
                  </div>

                  {/* Exercise Images + Names Row */}
                  {h.logs && h.logs.length > 0 && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide">
                        {h.logs.slice(0, 5).map((log, li) => (
                          <div key={li} className="flex items-center gap-2 bg-gym-dark/40 px-2.5 py-1.5 rounded-xl border border-white/5 shrink-0">
                            {log.image && (
                              <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                                <img src={log.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-white/80 truncate max-w-[100px]">{log.name}</p>
                              <p className="text-[8px] text-gym-muted">{log.sets?.length || 0} sets</p>
                            </div>
                          </div>
                        ))}
                        {h.logs.length > 5 && (
                          <span className="text-[9px] text-gym-muted shrink-0">+{h.logs.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Muscle tags */}
                  {h.logs && (
                    <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap">
                      {[...new Set(h.logs.map(l => l.muscle).filter(Boolean))].map((m, mi) => (
                        <span key={mi} className="px-2 py-0.5 bg-gym-accent/10 text-gym-accent text-[8px] font-black uppercase rounded-md">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
