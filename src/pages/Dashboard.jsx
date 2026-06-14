import { useState, useMemo } from 'react';
import { useWorkout, formatTime } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Trash2, Zap, Flame, ChevronRight, ChevronLeft, ClipboardCheck, Plus, Dumbbell, Clock, Activity, Shield, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';

const NEON = '#818cf8';
const CYAN = '#22d3ee';
const FIRE = '#f97316';
const GOLD = '#fbbf24';
const ACCENT = '#a855f7';

export default function Dashboard() {
  const { 
    history = [], plannedExercises = [], removeFromPlan, reorderPlan, dataLoading,
    streak = 0, logWater, dailyGoals, goals
  } = useWorkout() || {};
  const { user, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const selectedStr = selectedDate.toLocaleDateString();
  const selectedDisplayStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const todayStr = new Date().toLocaleDateString();

  const displayName = userProfile?.displayName || user?.displayName || 'Trainer';
  const firstName = displayName.split(' ')[0];

  const calendarDates = useMemo(() => {
    const d = new Date(viewDate);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(viewDate);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [viewDate]);

  const navigateWeek = (days) => {
    const nextView = new Date(viewDate);
    nextView.setDate(nextView.getDate() + days);
    const day = nextView.getDay();
    const diff = nextView.getDate() - (day === 0 ? 6 : day - 1);
    const nextMonday = new Date(nextView);
    nextMonday.setDate(diff);
    nextMonday.setHours(0, 0, 0, 0);
    setViewDate(nextMonday);
  };

  const filteredSessions = (history || []).filter(h => h.date === selectedStr);
  const activeCalories = filteredSessions.reduce((s, h) => s + (h.totalCalories || 0), 0);
  const activeDuration = filteredSessions.reduce((s, h) => s + (h.durationSeconds || 0), 0);
  const activeSets = filteredSessions.reduce((s, h) => s + (h.totalSets || 0), 0);
  const activeExercises = filteredSessions.reduce((s, h) => s + (h.exercisesCompleted || 0), 0);

  // Weekly stats
  const workoutsThisWeek = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(d);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    return (history || []).filter(h => {
      const hDate = new Date(h.date);
      return hDate >= monday;
    }).length;
  }, [history]);

  const waterLogged = (dailyGoals?.waterDate === todayStr) ? (dailyGoals?.waterLogged || 0) : 0;
  const waterTarget = goals?.waterIntake || 2500;
  const weeklyTarget = goals?.workoutsPerWeek || 4;

  return (
    <div className="min-h-screen pb-36">
      <div className="p-5 slide-up space-y-7 max-w-lg mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between pt-6 preserve-3d">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: NEON + '80' }}>
              {selectedDisplayStr}
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-white italic tracking-tighter" style={{ transform: 'rotateX(5deg)' }}>
                HEY, <span className="text-gym-neon text-glow-beast">{firstName.toUpperCase()}</span>
              </h1>
              {streak > 0 && (
                <div className="flex items-center gap-1 bg-gym-fire/15 border border-gym-fire/20 px-2.5 py-1 rounded-full text-gym-fire font-black text-[9px] shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-pulse">
                  <Flame size={11} fill="currentColor" />
                  <span>{streak} DAY STREAK</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="p-4 rounded-2xl glass-beast border-white/10 hover:border-gym-neon/40 transition-all shadow-beast tap-3d">
                <Shield size={22} className="text-gym-neon" />
              </button>
            )}
          </div>
        </header>

        {/* 7-Day Calendar Strip */}
        <div className="relative flex items-center gap-2 preserve-3d">
          <button onClick={() => navigateWeek(-7)}
            className="shrink-0 w-10 h-20 flex items-center justify-center glass-beast rounded-2xl border-white/5 active:scale-90 transition-all group">
            <ChevronLeft size={20} className="text-white/40 group-hover:text-white" />
          </button>

          <div className="flex-1 grid grid-cols-7 gap-1 p-1 glass-beast rounded-[1.5rem] border-white/5 shadow-beast">
            {calendarDates.map((dateObj, i) => {
              const ds = dateObj.toLocaleDateString();
              const isSelected = ds === selectedStr;
              const isToday = ds === todayStr;
              const hasWorkout = (history || []).some(h => h.date === ds);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <button key={i} onClick={() => setSelectedDate(new Date(dateObj))}
                  className={`flex flex-col items-center justify-center h-[72px] rounded-2xl transition-all duration-300 tap-3d relative ${
                    isSelected ? 'bg-gradient-beast text-white shadow-beast scale-105 z-10' : 'text-gym-muted hover:bg-white/5'
                  }`}>
                  <p className={`text-[9px] font-black uppercase tracking-tighter ${isSelected ? 'text-white/80' : isToday ? 'text-gym-neon' : ''}`}>
                    {dayName[0]}
                  </p>
                  <p className="text-lg font-black mt-0.5 leading-none">{dateObj.getDate()}</p>
                  {hasWorkout && !isSelected && (
                    <div className="w-1 h-1 rounded-full mt-1 bg-gym-neon animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          <button onClick={() => navigateWeek(7)}
            className="shrink-0 w-10 h-20 flex items-center justify-center glass-beast rounded-2xl border-white/5 active:scale-90 transition-all group">
            <ChevronRight size={20} className="text-white/40 group-hover:text-white" />
          </button>
        </div>

        {/* Stats Grid */}
        {dataLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-beast p-5 rounded-[2rem] border-white/5 h-28 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 preserve-3d">
            {[
              { icon: <Flame size={20} style={{ color: FIRE }} />, val: activeCalories, label: 'Calories Burned', color: FIRE, shadow: 'rgba(249,115,22,0.2)' },
              { icon: <Clock size={20} style={{ color: CYAN }} />, val: formatTime(activeDuration), label: 'Active Time', color: CYAN, shadow: 'rgba(34,211,238,0.2)' },
              { icon: <Activity size={20} style={{ color: ACCENT }} />, val: activeSets, label: 'Total Sets', color: ACCENT, shadow: 'rgba(168,85,247,0.2)' },
              { icon: <Dumbbell size={20} style={{ color: GOLD }} />, val: activeExercises, label: 'Exercises Done', color: GOLD, shadow: 'rgba(251,191,36,0.2)' },
            ].map((s, i) => (
              <div key={i} className="glass-beast p-5 rounded-[2rem] border-white/5 shadow-beast relative overflow-hidden group tap-3d"
                style={{ transform: `rotateY(${i % 2 === 0 ? '-3deg' : '3deg'})` }}>
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10 blur-2xl -mr-6 -mt-6 rounded-full" style={{ background: s.color }} />
                <div className="flex flex-col h-full justify-between">
                  <div className="w-10 h-10 rounded-xl glass-beast flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ boxShadow: `0 0 15px ${s.shadow}` }}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{s.val}</p>
                    <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-gym-muted mt-1">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Goals Summary Progress Widget */}
        <section className="space-y-4 preserve-3d">
          <div className="glass-beast p-5 rounded-[2rem] border-white/5 shadow-beast flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl glass-beast flex items-center justify-center bg-gym-neon/15" style={{ boxShadow: '0 0 10px rgba(129,140,248,0.1)' }}>
                <Trophy size={18} className="text-gym-neon" />
              </div>
              <div>
                <h3 className="font-black text-white text-xs uppercase tracking-wider">Weekly Target</h3>
                <p className="text-[9px] text-gym-muted mt-0.5 uppercase tracking-widest font-semibold">{workoutsThisWeek} of {weeklyTarget} workouts logged</p>
              </div>
            </div>
            
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-white/5" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-gym-neon" strokeWidth="3.5" strokeDasharray={`${Math.min(100, (workoutsThisWeek / weeklyTarget) * 100)}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute font-black text-[9px] text-white italic">{Math.round((workoutsThisWeek / weeklyTarget) * 100)}%</div>
            </div>
          </div>
        </section>

        {/* Water Hydration Tracker Widget */}
        <section className="space-y-4 preserve-3d">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gym-cyan/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/50">Hydration Tracker</h2>
          </div>

          <div className="glass-beast p-5 rounded-[2rem] border-white/5 shadow-beast flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-12 h-12 rounded-xl bg-[#141425] border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                <div className="absolute bottom-0 inset-x-0 bg-gym-cyan/20 transition-all duration-500" style={{ height: `${Math.min(100, (waterLogged / waterTarget) * 100)}%` }} />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" className="relative z-10"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">{waterLogged}</span>
                  <span className="text-[10px] text-gym-muted">/ {waterTarget} ml</span>
                </div>
                {/* ProgressBar */}
                <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-gym-cyan h-full transition-all duration-500" style={{ width: `${Math.min(100, (waterLogged / waterTarget) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => logWater(250)} className="px-3 py-2 bg-white/5 border border-white/5 hover:border-gym-cyan/30 text-white rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all">
                +250ml
              </button>
              <button onClick={() => logWater(500)} className="px-3 py-2 bg-white/5 border border-white/5 hover:border-gym-cyan/30 text-white rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all">
                +500ml
              </button>
            </div>
          </div>
        </section>

        {/* Today's Mission */}
        <section className="space-y-4 preserve-3d">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gym-neon/10 flex items-center justify-center">
              <Zap size={16} className="text-gym-neon" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/50">Today's Mission</h2>
          </div>

          {(plannedExercises || []).length > 0 ? (
            <div className="space-y-4">
              <button onClick={() => navigate('/active-workout')}
                className="w-full py-6 bg-gradient-beast text-white font-black text-sm uppercase tracking-[0.3em] rounded-[2rem] shadow-beast-heavy flex items-center justify-center gap-4 group active:scale-95 transition-all overflow-hidden relative">
                <div className="absolute inset-0 shimmer-beast opacity-30" />
                <Play size={24} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                <span className="relative z-10">Start Session</span>
              </button>

              <div className="grid grid-cols-1 gap-3">
                {plannedExercises.map((ex, i) => (
                  <div key={i} className="glass-beast p-4 rounded-3xl border-white/5 flex items-center justify-between group hover:border-gym-neon/30 transition-all shadow-beast">
                    <Link to={`/exercise/${ex.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden glass-beast border-white/10 shrink-0 relative">
                        <img src={getAssetPath(ex.image)} alt="" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=60'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-gym-dark/80 to-transparent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white truncate group-hover:text-gym-neon transition-colors">{ex.name}</p>
                        <p className="text-[9px] text-gym-muted uppercase font-bold tracking-widest mt-1 opacity-60">{ex.muscleTarget || ex.muscle}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          if (i === 0) return;
                          const next = [...plannedExercises];
                          const temp = next[i];
                          next[i] = next[i - 1];
                          next[i - 1] = temp;
                          reorderPlan(next);
                        }} 
                        disabled={i === 0}
                        className="p-2 text-gym-muted hover:text-gym-neon disabled:opacity-10 active:scale-75 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-white/[0.02]"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button 
                        onClick={() => {
                          if (i === plannedExercises.length - 1) return;
                          const next = [...plannedExercises];
                          const temp = next[i];
                          next[i] = next[i + 1];
                          next[i + 1] = temp;
                          reorderPlan(next);
                        }} 
                        disabled={i === plannedExercises.length - 1}
                        className="p-2 text-gym-muted hover:text-gym-neon disabled:opacity-10 active:scale-75 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-white/[0.02]"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button onClick={() => removeFromPlan(ex.id)} className="p-3 text-gym-muted hover:text-red-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center glass-beast rounded-[3rem] border-white/5 space-y-6 shadow-beast">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-2 animate-beast-float">
                <Dumbbell size={40} className="text-white/20" />
              </div>
              <p className="text-gym-muted text-xs font-bold tracking-wide">No exercises planned.<br />Forge your path today.</p>
              <Link to="/workout" className="inline-flex items-center gap-3 px-8 py-4 bg-gym-neon/10 border border-gym-neon/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gym-neon hover:bg-gym-neon/20 transition-all shadow-beast">
                <Plus size={16} /> Select Exercises
              </Link>
            </div>
          )}
        </section>

        {/* Legend (Recent Sessions for selected day) */}
        <section className="space-y-4 pb-6 preserve-3d">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/50 flex items-center gap-3">
              <ClipboardCheck size={16} className="text-gym-neon" /> Legend
            </h2>
            <Link to="/history" className="text-[10px] font-black text-gym-neon uppercase tracking-widest opacity-60 hover:opacity-100 italic transition-opacity">View All →</Link>
          </div>

          {filteredSessions.length > 0 ? (
            <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-7 before:w-[1px] before:bg-white/5">
              {filteredSessions.map((h, i) => (
                <div key={i} className="relative pl-16 pr-2 py-2">
                  <div className="absolute left-[24px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gym-neon shadow-[0_0_15px_rgba(129,140,248,0.8)] z-10 animate-pulse" />
                  <div className="glass-beast rounded-3xl border-white/5 p-5 relative overflow-hidden group hover:border-gym-neon/20 transition-all shadow-beast">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gym-neon/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex justify-between items-center relative z-10">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gym-neon italic uppercase tracking-[0.2em]">{h.finishedAt || h.date}</p>
                        <div className="flex gap-6 items-center">
                          <span className="flex items-center gap-2 text-xs font-bold text-white/80"><Clock size={14} className="text-gym-neon" /> {h.durationFormatted}</span>
                          <span className="flex items-center gap-2 text-xs font-bold text-white/80"><Flame size={14} className="text-gym-fire" /> {h.totalCalories} cal</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-white/20 group-hover:text-gym-neon transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center glass-beast rounded-[2.5rem] border-white/5 space-y-4 shadow-beast">
              <ClipboardCheck size={32} className="text-white/10 mx-auto" />
              <p className="text-gym-muted text-[10px] font-black uppercase tracking-widest opacity-40">No activity recorded for this day.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
