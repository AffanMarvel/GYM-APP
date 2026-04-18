import { useState, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { 
  Target, Flame, Trophy, Check, Calendar, 
  TrendingUp, ChevronUp, ChevronDown, Dumbbell, Star, AlertTriangle, Plus, Minus, Save, X 
} from 'lucide-react';

const NEON = '#818cf8';
const ACCENT = '#a855f7';
const FIRE = '#f97316';
const SUCCESS = '#10b981';
const WARN = '#f59e0b';
const DANGER = '#ef4444';
const CARD = '#141425';
const CYAN = '#22d3ee';

// Default exercises with starting targets
const DEFAULT_EXERCISES = [
  { name: 'Push-Ups', icon: '💪', defaultTarget: 100, unit: 'reps' },
  { name: 'Pull-Ups', icon: '🏋️', defaultTarget: 50, unit: 'reps' },
  { name: 'Squats', icon: '🦵', defaultTarget: 100, unit: 'reps' },
  { name: 'Crunches', icon: '🔥', defaultTarget: 100, unit: 'reps' },
  { name: 'Deadlifts', icon: '⚡', defaultTarget: 50, unit: 'reps' },
  { name: 'Plank', icon: '🧘', defaultTarget: 120, unit: 'sec' },
  { name: 'Running', icon: '🏃', defaultTarget: 5, unit: 'km' },
];

const GOALS_KEY = 'gym_target_goals';

function loadGoals() {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveGoals(data) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(data));
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function initGoals() {
  const existing = loadGoals();
  if (existing) return existing;
  
  const initial = {
    exercises: DEFAULT_EXERCISES.map(ex => ({
      name: ex.name,
      icon: ex.icon,
      unit: ex.unit,
      target: ex.defaultTarget,
    })),
    dailyLogs: {},
  };
  saveGoals(initial);
  return initial;
}

export default function Goals() {
  const { history } = useWorkout();
  const [goals, setGoals] = useState(initGoals);
  const [editingTarget, setEditingTarget] = useState(null); // index of exercise being edited
  const [tempTarget, setTempTarget] = useState('');
  const [inputValues, setInputValues] = useState({}); // current input values for today
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', icon: '🔥', target: 50, unit: 'reps' });
  const todayKey = getTodayKey();

  // Load today's performed values into input state
  useEffect(() => {
    const todayLog = goals.dailyLogs?.[todayKey] || {};
    const vals = {};
    goals.exercises.forEach(ex => {
      vals[ex.name] = todayLog[ex.name]?.performed ?? '';
    });
    setInputValues(vals);
  }, [todayKey]);

  const updateGoals = (newGoals) => {
    setGoals(newGoals);
    saveGoals(newGoals);
  };

  // Save performed reps for an exercise
  const savePerformed = (exerciseName, performed) => {
    const num = parseInt(performed) || 0;
    const updated = { ...goals };
    if (!updated.dailyLogs[todayKey]) updated.dailyLogs[todayKey] = {};
    
    const exercise = goals.exercises.find(e => e.name === exerciseName);
    updated.dailyLogs[todayKey][exerciseName] = {
      performed: num,
      target: exercise?.target || 0,
      timestamp: new Date().toLocaleTimeString(),
    };
    updateGoals(updated);
  };

  // Change target for an exercise
  const updateTarget = (index, newTarget) => {
    const num = parseInt(newTarget);
    if (isNaN(num) || num < 1) return;
    const updated = { ...goals };
    updated.exercises[index].target = num;
    updateGoals(updated);
    setEditingTarget(null);
  };

  const addNewGoal = () => {
    if (!newGoal.name.trim()) return alert('Name required!');
    const updated = { ...goals };
    updated.exercises.push({
      ...newGoal,
      target: parseInt(newGoal.target) || 50
    });
    updateGoals(updated);
    setIsAdding(false);
    setNewGoal({ name: '', icon: '🔥', target: 50, unit: 'reps' });
  };

  const removeGoal = (index) => {
    if (!window.confirm('Remove this goal? History for today will be kept.')) return;
    const updated = { ...goals };
    updated.exercises = updated.exercises.filter((_, i) => i !== index);
    updateGoals(updated);
  };

  // Quick increment/decrement target
  const adjustTarget = (index, delta) => {
    const updated = { ...goals };
    const current = updated.exercises[index].target;
    updated.exercises[index].target = Math.max(1, current + delta);
    updateGoals(updated);
  };

  // Get today's data
  const todayLog = goals.dailyLogs?.[todayKey] || {};

  // Calculate completion stats
  const exerciseStats = goals.exercises.map(ex => {
    const log = todayLog[ex.name];
    const performed = log?.performed ?? 0;
    const target = ex.target;
    const progress = target > 0 ? Math.min(100, Math.round((performed / target) * 100)) : 0;
    const remaining = Math.max(0, target - performed);
    const isComplete = performed >= target;
    const isPartial = performed > 0 && performed < target;
    return { ...ex, performed, target, progress, remaining, isComplete, isPartial, hasLogged: log !== undefined };
  });

  const totalComplete = exerciseStats.filter(e => e.isComplete).length;
  const totalProgress = exerciseStats.length > 0 
    ? Math.round(exerciseStats.reduce((s, e) => s + e.progress, 0) / exerciseStats.length) 
    : 0;
  const allDone = totalComplete === exerciseStats.length;
  const hasAlerts = exerciseStats.some(e => e.isPartial);

  // Streak calculation
  const calcStreak = () => {
    let streak = 0;
    for (let i = 1; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLog = goals.dailyLogs?.[key];
      if (dayLog) {
        const dayComplete = goals.exercises.every(ex => (dayLog[ex.name]?.performed || 0) >= (dayLog[ex.name]?.target || ex.target));
        if (dayComplete) streak++;
        else break;
      } else break;
    }
    if (allDone) streak++;
    return streak;
  };
  const streak = calcStreak();

  // Past 7 days visualization
  const weekData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLog = goals.dailyLogs?.[key] || {};
    const dayExercises = goals.exercises.map(ex => {
      const log = dayLog[ex.name];
      return log ? Math.min(100, Math.round((log.performed / (log.target || ex.target)) * 100)) : 0;
    });
    const avgProgress = dayExercises.length > 0 ? Math.round(dayExercises.reduce((s, v) => s + v, 0) / dayExercises.length) : 0;
    weekData.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      progress: avgProgress,
      isToday: i === 0,
    });
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #06060d 0%, #0e0e1a 40%, #0d0a1a 100%)' }}>
      <div className="p-5 slide-up max-w-lg mx-auto space-y-5">
        
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(129,140,248,0.1)' }}>
              <Target style={{ color: NEON }} size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Daily Targets</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Track your performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Flame size={16} style={{ color: FIRE }} />
            <span className="text-sm font-black text-white">{streak}</span>
            <span className="text-[8px] font-bold uppercase" style={{ color: '#6b7280' }}>Streak</span>
          </div>
        </header>

        {/* Overall Progress Ring */}
        <div className="rounded-3xl p-6 text-center" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
              <circle 
                cx="50" cy="50" r="42" 
                stroke={allDone ? SUCCESS : hasAlerts ? WARN : NEON} 
                strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - totalProgress / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{totalProgress}%</span>
              <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Overall</span>
            </div>
          </div>
          <p className="text-xs font-bold" style={{ color: allDone ? SUCCESS : hasAlerts ? WARN : '#6b7280' }}>
            {allDone ? '🎉 All targets smashed! Beast mode!' : `${totalComplete}/${exerciseStats.length} targets hit`}
          </p>
        </div>

        {/* Alert Banner */}
        {hasAlerts && (
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle size={20} style={{ color: WARN }} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-white mb-1">Targets Not Met!</p>
              <div className="space-y-1">
                {exerciseStats.filter(e => e.isPartial).map((ex, i) => (
                  <p key={i} className="text-[11px] font-bold" style={{ color: WARN }}>
                    {ex.name}: Did {ex.performed}, need {ex.remaining} more {ex.unit} to hit {ex.target}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Progress Bars */}
        <div className="rounded-2xl p-4" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>This Week</h3>
          <div className="flex justify-between items-end gap-1.5">
            {weekData.map((wd, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[8px] font-bold" style={{ color: '#6b7280' }}>{wd.progress}%</span>
                <div className="w-full h-16 rounded-lg overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div 
                    className="absolute bottom-0 w-full rounded-lg transition-all duration-500"
                    style={{ 
                      height: `${wd.progress}%`, 
                      background: wd.progress >= 100 
                        ? `linear-gradient(to top, ${SUCCESS}, ${CYAN})` 
                        : wd.progress > 0 
                          ? `linear-gradient(to top, ${NEON}, ${ACCENT})`
                          : 'transparent',
                      border: wd.isToday ? `2px solid ${NEON}` : 'none'
                    }}
                  />
                </div>
                <span className="text-[8px] font-bold" style={{ color: wd.isToday ? NEON : '#6b7280' }}>{wd.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise Target Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Dumbbell size={12} style={{ color: NEON }} />
              Today's Exercise Targets
            </h2>
            <button onClick={() => setIsAdding(true)} className="p-1 px-2.5 rounded-lg bg-gym-neon/10 border border-gym-neon/20 hover:bg-gym-neon/20 transition-all active:scale-95 flex items-center gap-1.5">
              <Plus size={12} style={{ color: NEON }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: NEON }}>Add Goal</span>
            </button>
          </div>

          {exerciseStats.map((ex, i) => (
            <div 
              key={i} 
              className="rounded-2xl overflow-hidden transition-all"
              style={{ 
                background: ex.isComplete ? 'rgba(16,185,129,0.06)' : CARD, 
                border: `1px solid ${ex.isComplete ? 'rgba(16,185,129,0.15)' : ex.isPartial ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)'}` 
              }}
            >
              {/* Exercise Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ 
                    background: ex.isComplete ? 'rgba(16,185,129,0.15)' : 'rgba(129,140,248,0.1)' 
                  }}>
                    {ex.isComplete ? <Check size={24} style={{ color: SUCCESS }} /> : ex.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                       {ex.name}
                       {!DEFAULT_EXERCISES.find(d => d.name === ex.name) && (
                         <button onClick={() => removeGoal(i)} className="p-1 text-red-500/40 hover:text-red-500 transition-colors">
                           <X size={12} />
                         </button>
                       )}
                    </h3>
                    <p className="text-[10px] font-bold" style={{ color: ex.isComplete ? SUCCESS : ex.isPartial ? WARN : '#6b7280' }}>
                      {ex.isComplete ? '✅ Target hit!' : ex.isPartial ? `⚠️ ${ex.remaining} ${ex.unit} remaining` : `Target: ${ex.target} ${ex.unit}`}
                    </p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="text-right">
                  {ex.hasLogged && (
                    <span className="text-lg font-black" style={{ color: ex.isComplete ? SUCCESS : ex.isPartial ? WARN : '#6b7280' }}>
                      {ex.progress}%
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-4 pb-2">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ 
                      width: `${Math.min(100, ex.progress)}%`,
                      background: ex.isComplete 
                        ? `linear-gradient(90deg, ${SUCCESS}, ${CYAN})` 
                        : ex.isPartial 
                          ? `linear-gradient(90deg, ${WARN}, ${FIRE})`
                          : `linear-gradient(90deg, ${NEON}, ${ACCENT})`
                    }}
                  />
                </div>
              </div>

              {/* Target + Input Row */}
              <div className="px-4 pb-4 pt-2 flex items-center gap-3">
                {/* Target Adjuster */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => adjustTarget(i, -5)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <Minus size={14} style={{ color: '#6b7280' }} />
                  </button>
                  
                  {editingTarget === i ? (
                    <input
                      type="number"
                      value={tempTarget}
                      onChange={(e) => setTempTarget(e.target.value)}
                      onBlur={() => { updateTarget(i, tempTarget); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') updateTarget(i, tempTarget); }}
                      className="w-16 h-8 rounded-lg text-center text-base font-black text-white outline-none"
                      style={{ background: 'rgba(129,140,248,0.1)', border: `1px solid ${NEON}` }}
                      autoFocus
                    />
                  ) : (
                    <button 
                      onClick={() => { setEditingTarget(i); setTempTarget(ex.target.toString()); }}
                      className="w-16 h-8 rounded-lg text-center text-xs font-black transition-all active:scale-95"
                      style={{ color: NEON, background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)' }}
                    >
                      {ex.target}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => adjustTarget(i, 5)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <Plus size={14} style={{ color: '#6b7280' }} />
                  </button>
                  <span className="text-[8px] font-bold uppercase" style={{ color: '#6b7280' }}>Target</span>
                </div>

                <div className="flex-1" />

                {/* Performed Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="0"
                    value={inputValues[ex.name] || ''}
                    onChange={(e) => setInputValues({ ...inputValues, [ex.name]: e.target.value })}
                    className="w-20 h-10 rounded-xl text-center text-base font-black text-white outline-none transition-all placeholder:text-gray-600"
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: `2px solid ${inputValues[ex.name] ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.05)'}` 
                    }}
                  />
                  <button
                    onClick={() => savePerformed(ex.name, inputValues[ex.name])}
                    className="h-10 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95"
                    style={{ 
                      background: `linear-gradient(135deg, ${NEON}, ${ACCENT})`, 
                      color: '#fff',
                      boxShadow: '0 0 15px rgba(129,140,248,0.2)'
                    }}
                  >
                    <Save size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lifetime Stats */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Lifetime Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Trophy size={18} style={{ color: NEON }} className="mx-auto mb-1" />
              <p className="text-xl font-black text-white">{history?.length || 0}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Workouts</p>
            </div>
            <div className="text-center">
              <TrendingUp size={18} style={{ color: ACCENT }} className="mx-auto mb-1" />
              <p className="text-xl font-black text-white">{Object.keys(goals.dailyLogs || {}).length}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Days Logged</p>
            </div>
            <div className="text-center">
              <Star size={18} style={{ color: FIRE }} className="mx-auto mb-1" />
              <p className="text-xl font-black text-white">{streak}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Best Streak</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.1)' }}>
          <div className="flex items-start gap-3">
            <TrendingUp size={18} style={{ color: NEON }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: NEON }}>How It Works</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Set your daily target for each exercise. Log what you performed. If you fall short, you'll get an alert showing how many remain. Increase targets daily to push harder! 💪
              </p>
            </div>
          </div>
        </div>

        {/* Add Goal Modal */}
        {isAdding && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md p-5 flex items-end animate-in fade-in transition-all">
            <div className="w-full max-w-lg mx-auto bg-[#141425] rounded-t-[40px] border-t border-x border-white/10 p-8 space-y-8 slide-up scrollbar-hide">
              <div className="flex items-center justify-between border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-2xl font-black text-white">Forge New Goal</h2>
                  <p className="text-[10px] text-gym-muted font-bold tracking-widest uppercase">Expand your targets</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-3 bg-white/5 rounded-full text-gym-muted hover:text-white transition-all"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#818cf8]">Exercise Identity</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Icon (e.g. 🏃)" 
                      value={newGoal.icon} 
                      onChange={(e) => setNewGoal({...newGoal, icon: e.target.value})}
                      className="w-16 h-14 bg-black/40 border border-white/10 rounded-2xl text-center text-xl focus:border-[#818cf8]/50 outline-none transition-all"
                    />
                    <input 
                      type="text" 
                      placeholder="Goal Name (e.g. Running)" 
                      value={newGoal.name} 
                      onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                      className="flex-1 h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white font-bold focus:border-[#818cf8]/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#818cf8]">Daily Target</label>
                    <input 
                      type="number" 
                      value={newGoal.target} 
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white font-bold focus:border-[#818cf8]/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#818cf8]">Metric</label>
                    <select 
                      value={newGoal.unit} 
                      onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white font-bold focus:border-[#818cf8]/50 outline-none transition-all appearance-none"
                    >
                      <option value="km">km</option>
                      <option value="meters">meters</option>
                      <option value="reps">reps</option>
                      <option value="sets">sets</option>
                      <option value="sec">seconds</option>
                      <option value="min">minutes</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button onClick={() => setNewGoal({...newGoal, name: 'Running', icon: '🏃', target: 5, unit: 'km'})} className="flex-1 py-3 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-gym-muted hover:text-[#818cf8] transition-all">
                    Load Running
                  </button>
                  <button onClick={() => setNewGoal({...newGoal, name: 'Cycling', icon: '🚴', target: 15, unit: 'km'})} className="flex-1 py-3 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-gym-muted hover:text-[#818cf8] transition-all">
                    Load Cycling
                  </button>
                </div>

                <button 
                  onClick={addNewGoal}
                  className="w-full py-5 bg-gradient-to-r from-[#818cf8] to-[#a855f7] text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-xl shadow-[#818cf8]/20 active:scale-95 transition-all mt-4"
                >
                  Activate Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
