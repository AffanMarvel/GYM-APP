import { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { formatTime } from '../context/WorkoutContext';
import { 
  Activity, Clock, Flame, Dumbbell, Trophy, Check, X,
  ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';

const NEON = '#818cf8';
const ACCENT = '#a855f7';
const CYAN = '#22d3ee';
const FIRE = '#f97316';
const SUCCESS = '#10b981';
const DANGER = '#ef4444';
const CARD = '#141425';

export default function HistoryAndProgress() {
  const { history } = useWorkout();
  const [selectedDate, setSelectedDate] = useState(null); // null = show all

  // Group history by date
  const groupedHistory = {};
  history.forEach(h => {
    const dateKey = h.date || 'Unknown';
    if (!groupedHistory[dateKey]) {
      groupedHistory[dateKey] = [];
    }
    groupedHistory[dateKey].push(h);
  });

  const dateKeys = Object.keys(groupedHistory);

  // Weekly summary (last 7 days)
  const weekHistory = history.filter(h => {
    if (!h.date) return false;
    const d = new Date(h.date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });
  const weekCalories = weekHistory.reduce((s, h) => s + (h.totalCalories || 0), 0);
  const weekSets = weekHistory.reduce((s, h) => s + (h.totalSets || h.logs?.reduce((a, l) => a + (l.sets?.length || 0), 0) || 0), 0);
  const weekDuration = weekHistory.reduce((s, h) => s + (h.durationSeconds || 0), 0);

  // Get sessions for selected date
  const filteredDates = selectedDate ? { [selectedDate]: groupedHistory[selectedDate] || [] } : groupedHistory;

  // Generate date chips for past 14 days
  const dateChips = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString();
    const hasData = groupedHistory[dateStr];
    dateChips.push({
      date: dateStr,
      label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hasData: !!hasData,
      sessions: hasData ? hasData.length : 0,
    });
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #06060d 0%, #0e0e1a 40%, #0d0a1a 100%)' }}>
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(129,140,248,0.1)' }}>
              <Activity style={{ color: NEON }} size={22} />
            </div>
            <h1 className="text-2xl font-black text-white">History</h1>
          </div>
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate(null)}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl active:scale-95 transition-transform"
              style={{ color: NEON, background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)' }}
            >
              Show All
            </button>
          )}
        </header>

        {/* Weekly Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl text-center" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Flame size={18} style={{ color: FIRE }} className="mx-auto mb-1.5" />
            <p className="text-xl font-black text-white">{weekCalories}</p>
            <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: '#6b7280' }}>Calories</p>
          </div>
          <div className="p-4 rounded-2xl text-center" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Clock size={18} style={{ color: CYAN }} className="mx-auto mb-1.5" />
            <p className="text-xl font-black text-white">{weekDuration > 0 ? formatTime(weekDuration) : '0:00'}</p>
            <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: '#6b7280' }}>Duration</p>
          </div>
          <div className="p-4 rounded-2xl text-center" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Dumbbell size={18} style={{ color: ACCENT }} className="mx-auto mb-1.5" />
            <p className="text-xl font-black text-white">{weekSets}</p>
            <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: '#6b7280' }}>Sets</p>
          </div>
        </div>

        {/* Date Selector - Scrollable chips */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Calendar size={12} className="inline mr-1.5" style={{ color: NEON }} />
            Browse by Date
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {dateChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(chip.hasData ? chip.date : null)}
                className="shrink-0 px-3 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95"
                style={{
                  background: selectedDate === chip.date ? NEON : chip.hasData ? 'rgba(129,140,248,0.1)' : 'rgba(255,255,255,0.03)',
                  color: selectedDate === chip.date ? '#fff' : chip.hasData ? NEON : '#4b5563',
                  border: `1px solid ${chip.hasData ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                {chip.label}
                {chip.hasData && <span className="ml-1 opacity-60">({chip.sessions})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* History grouped by date */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {selectedDate ? `Sessions on ${selectedDate}` : 'All Sessions'}
          </h2>
          
          {Object.keys(filteredDates).length === 0 ? (
            <div className="p-8 text-center rounded-2xl" style={{ background: 'rgba(20,20,37,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Dumbbell size={40} style={{ color: '#4b5563' }} className="mx-auto mb-3 opacity-30" />
              <p className="text-xs italic" style={{ color: '#6b7280' }}>
                {selectedDate ? 'No workouts on this date.' : 'Your journey begins today.'}
              </p>
            </div>
          ) : (
            Object.entries(filteredDates).map(([date, sessions]) => {
              if (!sessions || sessions.length === 0) return null;
              
              const dayMuscles = [...new Set(sessions.flatMap(s => (s.logs || []).map(l => l.muscle).filter(Boolean)))];
              const dayCalories = sessions.reduce((s, h) => s + (h.totalCalories || 0), 0);
              const daySets = sessions.reduce((s, h) => s + (h.totalSets || 0), 0);
              const dayDuration = sessions.reduce((s, h) => s + (h.durationSeconds || 0), 0);

              return (
                <div key={date} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
                  {/* Date Header */}
                  <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(129,140,248,0.1)' }}>
                        <Trophy size={14} style={{ color: NEON }} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{date}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {dayDuration > 0 && <span className="text-[9px] font-bold" style={{ color: CYAN }}>⏱ {formatTime(dayDuration)}</span>}
                          {dayCalories > 0 && <span className="text-[9px] font-bold" style={{ color: FIRE }}>🔥 {dayCalories} cal</span>}
                          {daySets > 0 && <span className="text-[9px] font-bold" style={{ color: ACCENT }}>{daySets} sets</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-1 rounded-md" style={{ color: NEON, background: 'rgba(129,140,248,0.1)' }}>
                      {sessions.length} session{sessions.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Muscle Tags */}
                  {dayMuscles.length > 0 && (
                    <div className="px-4 pt-3 flex flex-wrap gap-1.5">
                      {dayMuscles.map((m, mi) => (
                        <span key={mi} className="px-2.5 py-1 text-[8px] font-black uppercase rounded-md" style={{ background: 'rgba(168,85,247,0.1)', color: ACCENT, border: '1px solid rgba(168,85,247,0.2)' }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Exercises */}
                  <div className="p-4 space-y-2">
                    {sessions.map((session, si) => (
                      <div key={si}>
                        {session.startTime && sessions.length > 1 && (
                          <p className="text-[9px] font-bold mb-1.5 pt-2" style={{ color: '#6b7280', borderTop: si > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                            Session at {session.startTime}
                          </p>
                        )}
                        {session.logs && session.logs.map((log, li) => (
                          <div key={li} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            {log.image ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                <img src={getAssetPath(log.image)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#06060d', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Dumbbell size={14} style={{ color: '#6b7280' }} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{log.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px]" style={{ color: '#6b7280' }}>{log.sets?.length || 0}/{log.targetSets || '?'} sets</span>
                                {log.muscle && <span className="text-[8px]" style={{ color: 'rgba(129,140,248,0.7)' }}>{log.muscle}</span>}
                                {log.sets && log.sets.length > 0 && (
                                  <span className="text-[8px]" style={{ color: '#6b7280' }}>
                                    {log.sets.map(s => `${s.weight}kg×${s.reps}`).join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: log.isCompleted ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }}>
                              {log.isCompleted ? <Check size={12} style={{ color: SUCCESS }} /> : <X size={12} style={{ color: DANGER }} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
