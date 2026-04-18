import { useState, useMemo, useEffect } from 'react';
import { useWorkout, formatTime } from '../context/WorkoutContext';
import { Trophy, Flame, Clock, Check, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAssetPath } from '../utils/assetPath';

const NEON = '#818cf8';
const CARD = '#141425';

export default function HistoryAndProgress() {
  const { history = [] } = useWorkout() || {};
  const navigate = useNavigate();

  // Date State Setup
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // Center of visible window
  const selectedStr = selectedDate.toLocaleDateString();
  const todayStr = new Date().toLocaleDateString();
  const selectedDisplayStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

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

  const navigateWeek = (days) => {
    const nextView = new Date(viewDate);
    nextView.setDate(nextView.getDate() + days);
    
    // Calculate Monday of the new week to ensure strict alignment
    const day = nextView.getDay();
    const diff = nextView.getDate() - (day === 0 ? 6 : day - 1);
    const nextMonday = new Date(nextView.setDate(diff));
    nextMonday.setHours(0,0,0,0);
    
    setViewDate(nextMonday);
    setSelectedDate(nextMonday); // Auto-jump to start of the week
  };

  // Filter history strictly by the selected date
  const filteredSessions = history.filter(h => h.date === selectedStr);

  const activeCalories = filteredSessions.reduce((s, h) => s + (h.totalCalories || 0), 0);
  const activeDuration = filteredSessions.reduce((s, h) => s + (h.durationSeconds || 0), 0);

  // Formatting Explicit Name
  const isToday = selectedStr === todayStr;
  const isPast = selectedDate < new Date(new Date().setHours(0,0,0,0));
  
  let dateTitleLabel = "Scheduled Activity";
  if (isToday) dateTitleLabel = "Today's Logs";
  else if (isPast) dateTitleLabel = "Ancient Logs";

  return (
    <div className="min-h-screen pb-32" style={{ background: '#06060d' }}>
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-black/40 rounded-xl border border-white/5 active:scale-95 transition-all">
              <ChevronLeft size={22} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white">History</h1>
              <p className="text-[10px] font-bold text-gym-muted uppercase tracking-widest mt-1">Review your legacy</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gym-neon/10 border border-gym-neon/20 flex items-center justify-center">
            <Trophy size={24} className="text-gym-neon" />
          </div>
        </header>

        {/* Fixed 7-Day Grid Calendar Strip with Nav Arrows */}
        <div className="relative -mx-3 px-3 flex items-center gap-1.5">
          <button 
            onClick={() => navigateWeek(-7)} 
            className="shrink-0 w-8 h-[76px] flex items-center justify-center bg-white/5 rounded-xl border border-white/5 active:scale-90 transition-all text-white/40 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 grid grid-cols-7 gap-1">
            {calendarDates.map((dateObj, i) => {
              const isSelected = dateObj.toLocaleDateString() === selectedStr;
              const isDateToday = dateObj.toLocaleDateString() === todayStr;
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateObj)}
                  className={`flex flex-col items-center justify-center h-[76px] rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-gym-neon text-gym-dark border-gym-neon shadow-[0_0_20px_rgba(129,140,248,0.4)] z-10' 
                      : 'bg-[#141425] text-gym-muted border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <p className={`text-[8px] font-black uppercase tracking-tighter ${isSelected ? 'text-gym-dark/70' : (isDateToday ? 'text-gym-neon' : '')}`}>{dayName[0]}</p>
                  <p className="text-xl font-black mt-1 leading-none">{dateObj.getDate()}</p>
                  {isDateToday && !isSelected && <div className="w-1 h-1 bg-gym-neon rounded-full mt-1 animate-pulse" />}
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

        {/* Selected Date Header Stats */}
        <div className="space-y-4">
           <div>
             <h2 className="text-xl font-black text-white flex items-center gap-2">
               {dateTitleLabel} <span className="text-sm font-bold text-gym-neon">— {selectedDisplayStr}</span>
             </h2>
             <p className="text-[10px] font-bold text-gym-muted uppercase tracking-widest mt-1">
               {filteredSessions.length} Session{filteredSessions.length !== 1 ? 's' : ''} Completed
             </p>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
             <div className="p-4 rounded-3xl border border-white/5 space-y-3" style={{ background: CARD }}>
               <div className="flex items-center gap-2">
                 <div className="p-1.5 rounded-lg bg-gym-fire/10"><Flame size={14} className="text-gym-fire" /></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-gym-muted">Calories Burned</span>
               </div>
               <p className="text-2xl font-black text-white">{activeCalories}</p>
             </div>
             <div className="p-4 rounded-3xl border border-white/5 space-y-3" style={{ background: CARD }}>
               <div className="flex items-center gap-2">
                 <div className="p-1.5 rounded-lg bg-gym-cyan/10"><Clock size={14} className="text-gym-cyan" /></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-gym-muted">Time Active</span>
               </div>
               <p className="text-2xl font-black text-white">{formatTime(activeDuration)}</p>
             </div>
           </div>
        </div>

        {/* Advanced Timeline UI */}
        <div className="pt-4 pb-10">
          <div className="flex items-center justify-between px-1 mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Calendar size={14} /> Timeline View
            </h2>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center bg-gym-card/20 rounded-3xl border border-white/5 space-y-3">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar size={20} className="text-gym-muted/50" />
              </div>
              <p className="text-gym-muted text-xs font-bold text-wrap">No workout telemetry recorded for this timeline.</p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-white/10 before:z-0">
              {filteredSessions.map((session, si) => (
                <div key={session.id || si} className="relative pl-10">
                  {/* Neon Glow Node */}
                  <div className="absolute left-[-5px] top-4 w-4 h-4 rounded-full bg-gym-card border-2 border-gym-neon z-10 shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
                  
                  <div className="bg-gym-card rounded-3xl border border-white/5 overflow-hidden shadow-lg relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gym-neon/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-all group-hover:bg-gym-neon/10" />
                    
                    <div className="p-4 flex items-center justify-between border-b border-white/5 relative z-10 bg-black/20">
                      <div>
                        <p className="text-[11px] font-black text-gym-neon uppercase tracking-widest">Workout Session</p>
                        <p className="text-sm font-black text-white mt-0.5">{session.finishedAt || 'Finished'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gym-fire">{session.totalCalories || 0} Cal</p>
                        <p className="text-[10px] text-gym-cyan font-bold mt-1 uppercase tracking-widest">{session.durationFormatted}</p>
                      </div>
                    </div>
                    
                    {session.logs && (
                      <div className="p-4 space-y-1 relative z-10">
                        {session.logs.map((log, li) => (
                          <div key={li} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/5 bg-gym-dark">
                              <img src={getAssetPath(log.image)} alt="" className="w-full h-full object-cover opacity-80"
                                onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-white/90 truncate">{log.name}</p>
                              <p className="text-[9px] text-gym-muted font-bold uppercase tracking-widest mt-1 tracking-widest">{log.sets?.length || 0} SETS COMPLETED</p>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-gym-neon/10 flex items-center justify-center shrink-0">
                              <Check size={12} className="text-gym-neon" strokeWidth={3} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
