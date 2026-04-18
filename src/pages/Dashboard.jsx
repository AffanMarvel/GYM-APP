import { useState, useMemo, useEffect, useRef } from 'react';
import { useWorkout, formatTime } from '../context/WorkoutContext';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Trash2, Zap, Flame, ChevronRight, ChevronLeft, ClipboardCheck, Plus, Dumbbell, Clock, Activity, Shield } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';

const NEON = '#818cf8';
const CYAN = '#22d3ee';
const FIRE = '#f97316';
const GOLD = '#fbbf24';
const ACCENT = '#a855f7';
const CARD = '#141425';

export default function Dashboard() {
  const { history = [], plannedExercises = [], removeFromPlan } = useWorkout() || {};
  const navigate = useNavigate();
  
  // Date State Setup
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // The center of the visible window
  const selectedStr = selectedDate.toLocaleDateString();
  const selectedDisplayStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const todayStr = new Date().toLocaleDateString();

  // Generate strictly Monday to Sunday (7 days)
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

  const scrollRef = useRef(null);
  
  // Auto-scroll to center of the week
  useEffect(() => {
    if (scrollRef.current) {
      const centerIndex = 3; // Center of 7 days
      const childWidth = 72; 
      const centerOffset = (scrollRef.current.clientWidth / 2) - (childWidth / 2);
      scrollRef.current.scrollTo({
        left: (centerIndex * childWidth) - centerOffset,
        behavior: 'smooth'
      });
    }
  }, [viewDate]);

  const navigateWeek = (days) => {
    const nextView = new Date(viewDate);
    nextView.setDate(nextView.getDate() + days);
    setViewDate(nextView);
  };

  // Filter sessions exactly by the tapped date
  const filteredSessions = (history || []).filter(h => h.date === selectedStr);

  const activeCalories = filteredSessions.reduce((s, h) => s + (h.totalCalories || 0), 0);
  const activeDuration = filteredSessions.reduce((s, h) => s + (h.durationSeconds || 0), 0);
  const activeSets = filteredSessions.reduce((s, h) => s + (h.totalSets || 0), 0);
  const activeExercises = filteredSessions.reduce((s, h) => s + (h.exercisesCompleted || 0), 0);
  
  const streak = (history || []).length;
  const spirit = { name: streak >= 7 ? 'Phoenix' : 'Wolf', icon: streak >= 7 ? '🔥' : '🐺' };

  return (
    <div className="min-h-screen pb-32" style={{ background: '#06060d' }}>
      <div className="p-5 slide-up space-y-6 max-w-lg mx-auto">
        <header className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-3xl font-black text-white">Train <span style={{ color: NEON, textShadow: `0 0 20px ${NEON}4D` }}>Hard</span></h1>
            <p className="text-[10px] font-bold text-gym-neon uppercase tracking-[0.2em] mt-2">{selectedDisplayStr}</p>
          </div>
          <button onClick={() => navigate('/admin')} className="p-3 rounded-2xl bg-gym-neon/10 border border-gym-neon/20 hover:bg-gym-neon/20 transition-all shadow-[0_0_15px_rgba(129,140,248,0.2)]">
            <Shield size={22} style={{ color: NEON }} />
          </button>
        </header>

        {/* Horizontal Scrolling Calendar Strip with Nav Arrows */}
        <div className="relative -mx-5 px-5 flex items-center gap-2">
          <button 
            onClick={() => navigateWeek(-7)} 
            className="shrink-0 w-8 h-[76px] flex items-center justify-center bg-white/5 rounded-xl border border-white/5 active:scale-90 transition-all text-white/40 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>

          <div 
            ref={scrollRef}
            className="flex-1 flex overflow-x-auto gap-3 pb-2 snap-x scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {calendarDates.map((dateObj, i) => {
              const isSelected = dateObj.toLocaleDateString() === selectedStr;
              const isToday = dateObj.toLocaleDateString() === todayStr;
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateObj)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-[60px] h-[76px] rounded-2xl border transition-all snap-center ${
                    isSelected 
                      ? 'bg-gym-neon text-gym-dark border-gym-neon shadow-[0_0_20px_rgba(129,140,248,0.4)] scale-105 z-10' 
                      : 'bg-[#141425] text-gym-muted border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-gym-dark/70' : (isToday ? 'text-gym-neon' : '')}`}>{dayName}</p>
                  <p className="text-2xl font-black mt-1 leading-none">{dateObj.getDate()}</p>
                  {isToday && !isSelected && <div className="w-1 h-1 bg-gym-neon rounded-full mt-1 animate-pulse" />}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => navigateWeek(7)} 
            className="shrink-0 w-8 h-[76px] flex items-center justify-center bg-white/5 rounded-xl border border-white/5 active:scale-90 transition-all text-white/40 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 4-Stat Performance Grid specific to the tapped date */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Flame size={16} style={{ color: FIRE }} />, val: activeCalories, label: 'Cal' },
            { icon: <Clock size={16} style={{ color: CYAN }} />, val: formatTime(activeDuration), label: 'Time' },
            { icon: <Activity size={16} style={{ color: ACCENT }} />, val: activeSets, label: 'Sets' },
            { icon: <Dumbbell size={16} style={{ color: GOLD }} />, val: activeExercises, label: 'Done' },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-2xl border border-white/5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]" style={{ background: CARD }}>
              <div className="mx-auto mb-1 flex justify-center">{s.icon}</div>
              <p className="text-xl font-black text-white">{s.val}</p>
              <p className="text-[8px] uppercase font-black tracking-widest text-gym-muted">{s.label}</p>
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

        {/* Dynamic Timeline of the Selected Day */}
        <section className="space-y-3 pb-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <ClipboardCheck size={14} style={{ color: NEON }} /> {selectedDate.toLocaleDateString() === todayStr ? "Today's Logs" : "Logged Activity"}
            </h2>
            <Link to="/history" className="text-[9px] font-bold text-gym-neon">View Full History →</Link>
          </div>
          
          {filteredSessions.length > 0 ? (
            <div className="space-y-2 relative before:absolute before:inset-y-0 before:left-6 before:w-0.5 before:bg-white/5">
              {filteredSessions.map((h, i) => (
                <div key={i} className="relative pl-14 pr-3 py-3">
                  {/* Timeline Dot */}
                  <div className="absolute left-[21px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gym-neon shadow-[0_0_10px_rgba(129,140,248,0.5)] z-10" />
                  
                  <div className="bg-gym-card rounded-2xl border border-white/5 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gym-neon/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <p className="text-[10px] font-black text-gym-neon mb-1 uppercase tracking-widest">{h.finishedAt || h.date}</p>
                        <div className="flex gap-4 text-xs font-bold text-white mt-1">
                          <span className="flex items-center gap-1"><Clock size={12} className="text-gym-muted" /> {h.durationFormatted}</span>
                          <span className="flex items-center gap-1"><Flame size={12} className="text-gym-muted" /> {h.totalCalories} cal</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gym-muted group-hover:text-gym-neon transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gym-card/20 rounded-3xl border border-white/5 space-y-3">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                <ClipboardCheck size={20} className="text-gym-muted/50" />
              </div>
              <p className="text-gym-muted text-xs font-bold">No workouts logged on this date.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
