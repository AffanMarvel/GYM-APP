import { useWorkout } from '../context/WorkoutContext';
import { formatTime } from '../context/WorkoutContext';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Flame, Dumbbell, Trophy, Check, X } from 'lucide-react';

export default function HistoryAndProgress() {
  const { history, finishWorkout, todaysWorkout } = useWorkout();

  const chartData = [...history].reverse().slice(-14).map(h => ({
    date: h.date ? h.date.substring(0, 5) : '', 
    sets: h.totalSets || h.logs?.reduce((acc, log) => acc + (log.sets?.length || 0), 0) || 0,
    cal: h.totalCalories || 0
  }));

  // Group history by date for a nice display
  const groupedHistory = {};
  history.forEach(h => {
    const dateKey = h.date || 'Unknown';
    if (!groupedHistory[dateKey]) {
      groupedHistory[dateKey] = [];
    }
    groupedHistory[dateKey].push(h);
  });

  // Weekly summary
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

  return (
    <div className="min-h-screen bg-gradient-premium pb-28">
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gym-neon/10 rounded-xl">
              <Activity className="text-gym-neon" size={22} />
            </div>
            <h1 className="text-2xl font-black text-white">Progress</h1>
          </div>
          
          {!todaysWorkout?.completed && todaysWorkout?.logs?.length > 0 && (
            <button 
              onClick={finishWorkout}
              className="bg-gym-card border border-gym-neon/30 text-gym-neon px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gym-neon hover:text-white transition-all active:scale-95"
            >
              End Workout
            </button>
          )}
        </header>

        {/* Weekly Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gym-card p-4 rounded-2xl border border-white/5 text-center">
            <Flame size={18} className="text-gym-fire mx-auto mb-1.5" />
            <p className="text-xl font-black text-white">{weekCalories}</p>
            <p className="text-[8px] text-gym-muted uppercase font-bold tracking-widest">Calories</p>
          </div>
          <div className="bg-gym-card p-4 rounded-2xl border border-white/5 text-center">
            <Clock size={18} className="text-gym-cyan mx-auto mb-1.5" />
            <p className="text-xl font-black text-white">{weekDuration > 0 ? formatTime(weekDuration) : '0:00'}</p>
            <p className="text-[8px] text-gym-muted uppercase font-bold tracking-widest">Duration</p>
          </div>
          <div className="bg-gym-card p-4 rounded-2xl border border-white/5 text-center">
            <Dumbbell size={18} className="text-gym-accent mx-auto mb-1.5" />
            <p className="text-xl font-black text-white">{weekSets}</p>
            <p className="text-[8px] text-gym-muted uppercase font-bold tracking-widest">Sets</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gym-card p-4 rounded-2xl border border-white/5">
          <h3 className="text-[10px] font-black mb-3 text-gym-muted uppercase tracking-widest">Volume Over Time</h3>
          <div className="h-40 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141425', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                    itemStyle={{ color: '#6366f1' }}
                  />
                  <Line type="monotone" dataKey="sets" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }} />
                  <Line type="monotone" dataKey="cal" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', strokeWidth: 0, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gym-muted text-xs">
                Complete a workout to see your progress!
              </div>
            )}
          </div>
        </div>

        {/* History grouped by date */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Workout History</h2>
          
          {Object.keys(groupedHistory).length === 0 ? (
            <p className="text-gym-muted italic text-xs text-center py-6 bg-gym-card/30 rounded-2xl border border-white/5">Your journey begins today.</p>
          ) : (
            Object.entries(groupedHistory).map(([date, sessions]) => {
              // Gather all muscles trained this day
              const dayMuscles = [...new Set(sessions.flatMap(s => (s.logs || []).map(l => l.muscle).filter(Boolean)))];
              const dayCalories = sessions.reduce((s, h) => s + (h.totalCalories || 0), 0);
              const daySets = sessions.reduce((s, h) => s + (h.totalSets || 0), 0);
              const dayDuration = sessions.reduce((s, h) => s + (h.durationSeconds || 0), 0);

              return (
                <div key={date} className="bg-gym-card rounded-2xl border border-white/5 overflow-hidden">
                  {/* Date Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gym-neon/10 rounded-lg">
                        <Trophy size={14} className="text-gym-neon" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{date}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {dayDuration > 0 && <span className="text-[9px] text-gym-cyan font-bold">⏱ {formatTime(dayDuration)}</span>}
                          {dayCalories > 0 && <span className="text-[9px] text-gym-fire font-bold">🔥 {dayCalories} cal</span>}
                          {daySets > 0 && <span className="text-[9px] text-gym-accent font-bold">{daySets} sets</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-gym-neon bg-gym-neon/10 px-2 py-1 rounded-md font-bold">
                      {sessions.length} session{sessions.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Muscle Tags */}
                  {dayMuscles.length > 0 && (
                    <div className="px-4 pt-3 flex flex-wrap gap-1.5">
                      {dayMuscles.map((m, mi) => (
                        <span key={mi} className="px-2.5 py-1 bg-gym-accent/10 text-gym-accent text-[8px] font-black uppercase rounded-md border border-gym-accent/20">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* All exercises done on this date */}
                  <div className="p-4 space-y-2">
                    {sessions.map((session, si) => (
                      <div key={si}>
                        {session.logs && session.logs.map((log, li) => (
                          <div key={li} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                            {/* Exercise Image */}
                            {log.image ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                <img src={log.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gym-dark flex items-center justify-center shrink-0 border border-white/10">
                                <Dumbbell size={14} className="text-gym-muted" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{log.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-gym-muted">{log.sets?.length || 0}/{log.targetSets || '?'} sets</span>
                                {log.muscle && <span className="text-[8px] text-gym-neon/70">{log.muscle}</span>}
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${log.isCompleted ? 'bg-gym-success/20' : 'bg-gym-danger/20'}`}>
                              {log.isCompleted ? <Check size={12} className="text-gym-success" /> : <X size={12} className="text-gym-danger" />}
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
