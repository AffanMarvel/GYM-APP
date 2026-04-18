import { useState, useMemo, useEffect } from 'react';
import { useWorkout, formatTime } from '../context/WorkoutContext';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Trash2, Zap, Flame, ChevronRight, ChevronLeft, ClipboardCheck, Plus, Dumbbell, Clock, Activity, Shield } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';

const NEON = '#818cf8';
const CYAN = '#22d3ee';
const FIRE = '#f97316';
const GOLD = '#fbbf24';
const ACCENT = '#a855f7';

export default function Dashboard() {
  const { history = [], plannedExercises = [], removeFromPlan } = useWorkout() || {};
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const selectedStr = selectedDate.toLocaleDateString();
  const selectedDisplayStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const todayStr = new Date().toLocaleDateString();

  const calendarDates = useMemo(() => {
    const d = new Date(viewDate);
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0,0,0,0);

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
    const nextMonday = new Date(nextView.setDate(diff));
    nextMonday.setHours(0,0,0,0);
    setViewDate(nextMonday);
    setSelectedDate(nextMonday);
  };

  const filteredSessions = (history || []).filter(h => h.date === selectedStr);
  const activeCalories = filteredSessions.reduce((s, h) => s + (h.totalCalories || 0), 0);
  const activeDuration = filteredSessions.reduce((s, h) => s + (h.durationSeconds || 0), 0);
  const activeSets = filteredSessions.reduce((s, h) => s + (h.totalSets || 0), 0);
  const activeExercises = filteredSessions.reduce((s, h) => s + (h.exercisesCompleted || 0), 0);

  return (
    <div className="min-h-screen pb-32">
      <div className="p-5 slide-up space-y-8 max-w-lg mx-auto">
        
        {/* Header Section */}
        <header className="flex items-center justify-between pt-6 preserve-3d">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white italic tracking-tighter" style={{ transform: 'rotateX(5deg)' }}>
              TRAIN <span className="text-gym-neon text-glow-beast">HARD</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gym-neon/30" />
              <p className="text-[10px] font-bold text-gym-neon/60 uppercase tracking-[0.3em]">{selectedDisplayStr}</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin')} className="p-4 rounded-2xl glass-beast border-white/10 hover:border-gym-neon/40 transition-all shadow-beast tap-3d">
            <Shield size={22} className="text-gym-neon" />
          </button>
        </header>

        {/* 7-Day Grid Calendar Strip */}
        <div className="relative -mx-2 px-2 flex items-center gap-2 preserve-3d">
          <button 
            onClick={() => navigateWeek(-7)} 
            className="shrink-0 w-10 h-20 flex items-center justify-center glass-beast rounded-2xl border-white/5 active:scale-90 transition-all group"
          >
            <ChevronLeft size={20} className="text-white/40 group-hover:text-white" />
          </button>

          <div className="flex-1 grid grid-cols-7 gap-1.5 p-1 glass-beast rounded-[1.5rem] border-white/5 shadow-beast">
            {calendarDates.map((dateObj, i) => {
              const isSelected = dateObj.toLocaleDateString() === selectedStr;
              const isToday = dateObj.toLocaleDateString() === todayStr;
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateObj)}
                  className={`flex flex-col items-center justify-center h-[72px] rounded-2xl transition-all duration-500 tap-3d ${
                    isSelected 
                      ? 'bg-gradient-beast text-white shadow-beast scale-110 z-10' 
                      : 'text-gym-muted hover:bg-white/5'
                  }`}
                >
                  <p className={`text-[9px] font-black uppercase tracking-tighter ${isSelected ? 'text-white/80' : (isToday ? 'text-gym-neon' : '')}`}>{dayName[0]}</p>
                  <p className="text-lg font-black mt-0.5 leading-none">{dateObj.getDate()}</p>
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => navigateWeek(7)} 
            className="shrink-0 w-10 h-20 flex items-center justify-center glass-beast rounded-2xl border-white/5 active:scale-90 transition-all group"
          >
            <ChevronRight size={20} className="text-white/40 group-hover:text-white" />
          </button>
        </div>

        {/* 4-Stat Performance Grid */}
        <div className="grid grid-cols-2 gap-4 preserve-3d">
          {[
            { icon: <Flame size={20} style={{ color: FIRE }} />, val: activeCalories, label: 'Calories Burned', color: FIRE, shadow: 'rgba(249, 115, 22, 0.2)' },
            { icon: <Clock size={20} style={{ color: CYAN }} />, val: formatTime(activeDuration), label: 'Active Time', color: CYAN, shadow: 'rgba(34, 211, 238, 0.2)' },
            { icon: <Activity size={20} style={{ color: ACCENT }} />, val: activeSets, label: 'Total Sets', color: ACCENT, shadow: 'rgba(168, 85, 247, 0.2)' },
            { icon: <Dumbbell size={20} style={{ color: GOLD }} />, val: activeExercises, label: 'Exercises Done', color: GOLD, shadow: 'rgba(251, 191, 36, 0.2)' },
          ].map((s, i) => (
            <div key={i} className="glass-beast p-5 rounded-[2rem] border-white/5 shadow-beast relative overflow-hidden group tap-3d" 
              style={{ transform: `rotateY(${i % 2 === 0 ? '-5deg' : '5deg'})` }}>
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

        {/* Today's Mission Section */}
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
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=60'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-gym-dark/80 to-transparent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white truncate group-hover:text-gym-neon transition-colors">{ex.name}</p>
                        <p className="text-[9px] text-gym-muted uppercase font-bold tracking-widest mt-1 opacity-60">{ex.muscleTarget || ex.muscle}</p>
                      </div>
                    </Link>
                    <button onClick={() => removeFromPlan(ex.id)} className="p-3 text-gym-muted hover:text-white/80 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center glass-beast rounded-[3rem] border-white/5 space-y-6 shadow-beast">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-2 animate-beast-float">
                <Dumbbell size={40} className="text-white/20" />
              </div>
              <p className="text-gym-muted text-xs font-bold tracking-wide">No exercises planned.<br/>Forge your path today.</p>
              <Link to="/workout" className="inline-flex items-center gap-3 px-8 py-4 bg-gym-neon/10 border border-gym-neon/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gym-neon hover:bg-gym-neon/20 transition-all shadow-beast">
                <Plus size={16} /> Select Exercises
              </Link>
            </div>
          )}
        </section>

        {/* Dynamic Timeline */}
        <section className="space-y-4 pb-12 preserve-3d">
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
