import { useWorkout, formatTime } from '../context/WorkoutContext';
import { Trophy, Flame, Clock, Check, ChevronRight, Calendar } from 'lucide-react';
import { getAssetPath } from '../utils/assetPath';

const CARD = '#141425';

export default function HistoryAndProgress() {
  const { history } = useWorkout();

  const grouped = {};
  history.forEach(h => {
    const key = h.date || 'Unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(h);
  });
  const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
  const totalCalories = history.reduce((s, h) => s + (h.totalCalories || 0), 0);
  const totalDuration = history.reduce((s, h) => s + (h.durationSeconds || 0), 0);

  return (
    <div className="min-h-screen pb-32" style={{ background: '#06060d' }}>
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        <header className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-black text-white">Your Progress</h1>
            <p className="text-[10px] font-bold text-gym-muted uppercase tracking-widest mt-1">Consistency is key</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gym-neon/10 border border-gym-neon/20 flex items-center justify-center">
            <Trophy size={24} className="text-gym-neon" />
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-3xl border border-white/5 space-y-3" style={{ background: CARD }}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gym-fire/10"><Flame size={14} className="text-gym-fire" /></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gym-muted">Calories</span>
            </div>
            <p className="text-2xl font-black text-white">{totalCalories}</p>
          </div>
          <div className="p-4 rounded-3xl border border-white/5 space-y-3" style={{ background: CARD }}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gym-cyan/10"><Clock size={14} className="text-gym-cyan" /></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gym-muted">Time</span>
            </div>
            <p className="text-2xl font-black text-white">{formatTime(totalDuration)}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Calendar size={14} /> Session Log
            </h2>
            <span className="text-[9px] font-black text-gym-neon uppercase">{history.length} sessions</span>
          </div>

          {dates.length === 0 ? (
            <div className="py-20 text-center text-gym-muted opacity-30 italic text-sm">No history yet.</div>
          ) : dates.map(date => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-white/5" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gym-muted">{date}</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              {grouped[date].map((session, si) => (
                <div key={session.id || si} className="bg-gym-card rounded-3xl border border-white/5 overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white uppercase">Workout Session</p>
                      <p className="text-[9px] text-gym-muted font-bold">{session.finishedAt || 'Finished'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gym-fire">{session.totalCalories || 0} Cal</p>
                      <p className="text-[9px] text-gym-cyan font-bold mt-1">{session.durationFormatted}</p>
                    </div>
                  </div>
                  {session.logs && (
                    <div className="p-4 pt-0 space-y-1">
                      {session.logs.map((log, li) => (
                        <div key={li} className="flex items-center gap-3 py-2 border-b border-white/[0.03]">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/5">
                            <img src={getAssetPath(log.image)} alt="" className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-white/90 truncate">{log.name}</p>
                            <p className="text-[9px] text-gym-muted font-bold">{log.sets?.length || 0} sets</p>
                          </div>
                          <Check size={14} className="text-gym-neon opacity-40 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
