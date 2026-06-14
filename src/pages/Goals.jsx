import { useState, useMemo, useEffect, useCallback } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { 
  Target, Flame, Trophy, Check, Calendar, 
  TrendingUp, Dumbbell, Star, Plus, Minus, Save, X, ChevronLeft, ChevronRight, History, AlertTriangle
} from 'lucide-react';

const SUCCESS = '#10b981';
const NEON = '#818cf8';
const ACCENT = '#a855f7';
const FIRE = '#f97316';
const WARN = '#f59e0b';
const CARD = '#141425';
const CYAN = '#22d3ee';

const DEFAULT_EXERCISES = [
  { name: 'Push-Ups', icon: '💪', defaultTarget: 100, unit: 'reps' },
  { name: 'Pull-Ups', icon: '🏋️', defaultTarget: 50, unit: 'reps' },
  { name: 'Squats', icon: '🦵', defaultTarget: 100, unit: 'reps' },
  { name: 'Crunches', icon: '🔥', defaultTarget: 100, unit: 'reps' },
  { name: 'Deadlifts', icon: '⚡', defaultTarget: 50, unit: 'reps' },
  { name: 'Plank', icon: '🧘', defaultTarget: 120, unit: 'sec' },
  { name: 'Running', icon: '🏃', defaultTarget: 5, unit: 'km' },
];

export default function Goals() {
  const { history = [], dailyGoals, updateDailyGoals } = useWorkout();
  
  // Local state for UI
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'history'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTarget, setEditingTarget] = useState(null);
  const [tempTarget, setTempTarget] = useState('');
  const [inputValues, setInputValues] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', icon: '🔥', target: 50, unit: 'reps' });

  const selectedKey = useMemo(() => {
    const d = selectedDate;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [selectedDate]);

  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);

  // Initialize dailyGoals if empty
  useEffect(() => {
    if (!dailyGoals) {
      updateDailyGoals({
        exercises: DEFAULT_EXERCISES.map(ex => ({
          name: ex.name,
          icon: ex.icon,
          unit: ex.unit,
          target: ex.defaultTarget,
        })),
        dailyLogs: {}
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load selected day's values into input state
  useEffect(() => {
    if (!dailyGoals) return;
    const log = dailyGoals.dailyLogs?.[selectedKey] || {};
    const vals = {};
    dailyGoals.exercises?.forEach(ex => {
      vals[ex.name] = log[ex.name]?.performed ?? '';
    });
    setInputValues(vals);
  }, [selectedKey, dailyGoals]);

  if (!dailyGoals) return null;

  const handleUpdateDailyGoals = (newDaily) => {
    updateDailyGoals(newDaily);
  };

  const savePerformed = (exerciseName, performed) => {
    const num = parseInt(performed) || 0;
    const updated = { ...dailyGoals };
    if (!updated.dailyLogs) updated.dailyLogs = {};
    if (!updated.dailyLogs[selectedKey]) updated.dailyLogs[selectedKey] = {};
    
    const exercise = updated.exercises.find(e => e.name === exerciseName);
    updated.dailyLogs[selectedKey][exerciseName] = {
      performed: num,
      target: exercise?.target || 0,
      timestamp: new Date().toLocaleTimeString(),
    };
    handleUpdateDailyGoals(updated);
  };

  const updateTarget = (index, newTarget) => {
    const num = parseInt(newTarget);
    if (isNaN(num) || num < 1) return;
    const updated = { ...dailyGoals };
    updated.exercises[index].target = num;
    handleUpdateDailyGoals(updated);
    setEditingTarget(null);
  };

  const adjustTarget = (index, delta) => {
    const updated = { ...dailyGoals };
    const current = updated.exercises[index].target;
    updated.exercises[index].target = Math.max(1, current + delta);
    handleUpdateDailyGoals(updated);
  };

  const addNewGoal = () => {
    if (!newGoal.name.trim()) return;
    const updated = { ...dailyGoals };
    updated.exercises.push({
      ...newGoal,
      target: parseInt(newGoal.target) || 50
    });
    handleUpdateDailyGoals(updated);
    setIsAdding(false);
    setNewGoal({ name: '', icon: '🔥', target: 50, unit: 'reps' });
  };

  const removeGoal = (index) => {
    const updated = { ...dailyGoals };
    updated.exercises = updated.exercises.filter((_, i) => i !== index);
    handleUpdateDailyGoals(updated);
    setConfirmDeleteIdx(null);
  };

  // Stats Logic
  const selectedLog = dailyGoals.dailyLogs?.[selectedKey] || {};
  const exerciseStats = (dailyGoals.exercises || []).map(ex => {
    const log = selectedLog[ex.name];
    const performed = log?.performed ?? 0;
    const target = log?.target ?? ex.target;
    const progress = target > 0 ? Math.min(100, Math.round((performed / target) * 100)) : 0;
    const isComplete = performed >= target;
    const isPartial = performed > 0 && performed < target;
    return { ...ex, performed, target, progress, isComplete, isPartial, hasLogged: log !== undefined };
  });

  const totalProgress = exerciseStats.length > 0 
    ? Math.round(exerciseStats.reduce((s, e) => s + e.progress, 0) / exerciseStats.length) 
    : 0;

  const streak = useMemo(() => {
    let s = 0;
    const dates = Object.keys(dailyGoals.dailyLogs || {}).sort().reverse();
    for (const dKey of dates) {
      const dayLog = dailyGoals.dailyLogs[dKey];
      const dayComplete = dailyGoals.exercises.every(ex => (dayLog[ex.name]?.performed || 0) >= (dayLog[ex.name]?.target || ex.target));
      if (dayComplete) s++;
      else break;
    }
    return s;
  }, [dailyGoals]);

  const changeDate = (days) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        
        {/* Header (The "Gold Panel" style) */}
        <header className="flex items-center justify-between pt-6 preserve-3d">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white italic tracking-tighter">
              TARGETS <span className="text-[#fbbf24] text-glow-beast">GOLD</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#fbbf24]/30" />
              <p className="text-[10px] font-bold text-[#fbbf24]/60 uppercase tracking-[0.3em]">
                {selectedKey === todayKey ? 'Active Daily Mission' : selectedDate.toDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
               <span className="text-xs font-black text-white">{streak}</span>
               <span className="text-[7px] font-black uppercase text-[#fbbf24]">STREAK</span>
             </div>
             <div className="p-3 rounded-2xl glass-beast border-[#fbbf24]/20 shadow-beast shadow-[#fbbf24]/10">
               <Trophy size={20} className="text-[#fbbf24]" />
             </div>
          </div>
        </header>

        {/* Tab Toggle */}
        <div className="flex p-1.5 glass-beast rounded-[2rem] border-white/5 shadow-beast">
          <button 
            onClick={() => { setActiveTab('today'); setSelectedDate(new Date()); }}
            className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'today' ? 'bg-gradient-beast text-white shadow-beast' : 'text-white/40'}`}
          >
            Today
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'history' ? 'bg-gradient-beast text-white shadow-beast' : 'text-white/40'}`}
          >
            History
          </button>
        </div>

        {/* Date Selector for History */}
        {activeTab === 'history' && (
          <div className="flex items-center justify-between glass-beast p-2 rounded-3xl border-white/5 shadow-beast animate-in fade-in slide-in-from-top-2">
            <button onClick={() => changeDate(-1)} className="p-4 glass-beast rounded-2xl border-white/5 active:scale-75 transition-all">
              <ChevronLeft size={20} className="text-white" />
            </button>
            <div className="text-center">
               <p className="text-sm font-black text-white italic">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
               <p className="text-[8px] font-black uppercase tracking-widest text-[#fbbf24]/60 mt-0.5">Mission Recap</p>
            </div>
            <button onClick={() => changeDate(1)} disabled={selectedKey === todayKey} className="p-4 glass-beast rounded-2xl border-white/5 active:scale-75 transition-all disabled:opacity-20">
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        )}

        {/* Progress Display */}
        <div className="glass-beast p-8 rounded-[3rem] border-white/5 shadow-beast-heavy relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/5 rounded-full blur-[60px] animate-pulse" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-4xl font-black text-white italic">{totalProgress}%</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#fbbf24]">Efficiency</p>
            </div>
            <div className="w-20 h-20 relative">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke={totalProgress >= 100 ? SUCCESS : '#fbbf24'} 
                    strokeWidth="12" fill="none" strokeLinecap="round"
                    strokeDasharray="251"
                    strokeDashoffset={251 - (251 * totalProgress) / 100}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                  <Target size={20} className="text-white/20" />
               </div>
            </div>
          </div>
        </div>

        {/* Goal Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
              <Dumbbell size={14} className="text-[#fbbf24]" /> {activeTab === 'today' ? 'Active Matrix' : 'Archived Results'}
            </h2>
            {activeTab === 'today' && (
              <button 
                onClick={() => setIsAdding(true)}
                className="p-3 glass-beast rounded-2xl border-[#fbbf24]/20 text-[#fbbf24] shadow-beast tap-3d transition-all hover:bg-[#fbbf24]/10"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {exerciseStats.map((ex, i) => (
              <div 
                key={i} 
                className="glass-beast rounded-[2.5rem] border transition-all duration-500 shadow-beast overflow-hidden preserve-3d"
                style={{ borderColor: ex.isComplete ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.05)' }}
              >
                <div className="p-6 flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl glass-beast flex items-center justify-center text-2xl shadow-beast relative">
                        {ex.isComplete ? <Check size={28} strokeWidth={3} style={{ color: SUCCESS }} /> : <span className="animate-beast-float">{ex.icon}</span>}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-white italic uppercase tracking-wider flex items-center gap-2">
                          {ex.name}
                          {activeTab === 'today' && !DEFAULT_EXERCISES.find(d => d.name === ex.name) && (
                            <button onClick={() => setConfirmDeleteIdx(i)} className="p-1 opacity-20 hover:opacity-100 text-gym-danger transition-all">
                              <X size={12} />
                            </button>
                          )}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: ex.isComplete ? SUCCESS : 'rgba(255,255,255,0.3)' }}>
                          {ex.isComplete ? 'Target Smashed' : `Objective: ${ex.target} ${ex.unit}`}
                        </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-2xl font-black text-white italic">{ex.progress}%</p>
                      <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mt-1">Completion</p>
                   </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pb-2">
                   <div className="h-1.5 w-full glass-beast rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000"
                        style={{ width: `${ex.progress}%`, background: ex.isComplete ? SUCCESS : '#fbbf24' }}
                      />
                   </div>
                </div>

                {/* Interaction Row (Only if active or looking at history) */}
                <div className="p-6 flex items-center justify-between pt-2">
                   {activeTab === 'today' && editingTarget === i ? (
                     <div className="flex items-center gap-2 w-full animate-in slide-in-from-left-2">
                        <input 
                          type="number"
                          autoFocus
                          value={tempTarget}
                          onChange={(e) => setTempTarget(e.target.value)}
                          onBlur={() => updateTarget(i, tempTarget)}
                          onKeyDown={(e) => e.key === 'Enter' && updateTarget(i, tempTarget)}
                          className="flex-1 glass-beast h-12 rounded-2xl px-4 text-white font-black italic border-[#fbbf24]/30 outline-none"
                        />
                        <button onClick={() => updateTarget(i, tempTarget)} className="p-3 bg-SUCCESS rounded-2xl text-white shadow-beast"><Save size={18} /></button>
                     </div>
                   ) : (
                     <div className="flex items-center gap-3">
                        {activeTab === 'today' && (
                          <div className="flex items-center gap-1.5 glass-beast p-1.5 rounded-2xl border-white/5">
                            <button onClick={() => adjustTarget(i, -5)} className="w-10 h-10 glass-beast rounded-xl flex items-center justify-center opacity-40 hover:opacity-100"><Minus size={14} /></button>
                            <button onClick={() => { setEditingTarget(i); setTempTarget(ex.target.toString()); }} className="px-4 text-[10px] font-black text-white italic">{ex.target}</button>
                            <button onClick={() => adjustTarget(i, 5)} className="w-10 h-10 glass-beast rounded-xl flex items-center justify-center opacity-40 hover:opacity-100"><Plus size={14} /></button>
                          </div>
                        )}
                        {activeTab === 'history' && (
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Target: {ex.target} {ex.unit}</p>
                        )}
                     </div>
                   )}

                   {/* Data Entry */}
                   <div className="flex items-center gap-3">
                      <input 
                        type="number"
                        placeholder="0"
                        value={inputValues[ex.name] || ''}
                        onChange={(e) => setInputValues({...inputValues, [ex.name]: e.target.value})}
                        className="w-16 h-12 glass-beast rounded-2xl text-center text-white font-black italic outline-none border-white/10 focus:border-[#fbbf24]/40"
                      />
                      <button 
                        onClick={() => savePerformed(ex.name, inputValues[ex.name])}
                        className="p-3 bg-gradient-beast rounded-2xl text-white shadow-beast tap-3d"
                      >
                        <Save size={18} />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime Matrix */}
        <section className="glass-beast p-8 rounded-[3rem] border-white/5 shadow-beast-heavy preserve-3d">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Tactical Lifetime Matrix</p>
           <div className="grid grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                 <div className="w-12 h-12 mx-auto glass-beast rounded-2xl flex items-center justify-center text-gym-neon shadow-beast"><History size={20} /></div>
                 <p className="text-2xl font-black text-white italic">{history?.length || 0}</p>
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Missions</p>
              </div>
              <div className="text-center space-y-2">
                 <div className="w-12 h-12 mx-auto glass-beast rounded-2xl flex items-center justify-center text-[#fbbf24] shadow-beast"><TrendingUp size={20} /></div>
                 <p className="text-2xl font-black text-white italic">{Object.keys(dailyGoals.dailyLogs || {}).length}</p>
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Logs</p>
              </div>
              <div className="text-center space-y-2">
                 <div className="w-12 h-12 mx-auto glass-beast rounded-2xl flex items-center justify-center text-accent shadow-beast"><Star size={20} /></div>
                 <p className="text-2xl font-black text-white italic">{streak}</p>
                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Streak</p>
              </div>
           </div>
        </section>

        {/* Add Goal Modal */}
        {isAdding && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md p-5 flex items-end animate-in fade-in transition-all">
            <div className="w-full max-w-lg mx-auto glass-beast rounded-t-[3rem] border-t border-white/10 p-10 space-y-8 slide-up">
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-white italic">NEW <span className="text-[#fbbf24]">MISSION</span></h2>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Configure Daily Objective</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-4 glass-beast rounded-full text-white/40 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-4 gap-4">
                    <input 
                       type="text" 
                       placeholder="🔥" 
                       value={newGoal.icon} 
                       onChange={(e) => setNewGoal({...newGoal, icon: e.target.value})}
                       className="h-16 glass-beast rounded-2xl text-center text-2xl focus:border-[#fbbf24]/50 outline-none"
                    />
                    <input 
                       type="text" 
                       placeholder="Exercise Name" 
                       value={newGoal.name} 
                       onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                       className="col-span-3 h-16 glass-beast rounded-2xl px-6 text-white font-black italic focus:border-[#fbbf24]/50 outline-none"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-[#fbbf24] uppercase tracking-widest px-1">Daily Target</p>
                      <input 
                        type="number" 
                        value={newGoal.target} 
                        onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                        className="w-full h-16 glass-beast rounded-2xl px-6 text-white font-black italic outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-[#fbbf24] uppercase tracking-widest px-1">Unit</p>
                      <select 
                        value={newGoal.unit} 
                        onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                        className="w-full h-16 glass-beast rounded-2xl px-6 text-white font-black italic outline-none appearance-none"
                      >
                        {['reps','sets','km','meters','sec','min'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                 </div>

                 <button 
                   onClick={addNewGoal}
                   className="w-full py-6 bg-gradient-beast text-white font-black text-sm uppercase tracking-[0.4em] rounded-[2rem] shadow-beast active:scale-95 transition-all mt-6 relative overflow-hidden"
                 >
                   <div className="absolute inset-0 shimmer-beast opacity-30" />
                   AUTHENTICATE GOAL
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {confirmDeleteIdx !== null && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-end p-5 animate-in fade-in">
          <div className="w-full max-w-lg mx-auto glass-beast-floating rounded-[2.5rem] p-8 border-white/10 shadow-beast-heavy slide-up">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={22} style={{ color: '#f59e0b' }} />
              <p className="text-xl font-black text-white">Remove Goal?</p>
            </div>
            <p className="text-sm mb-8 font-medium" style={{ color: '#9ca3af' }}>
              Remove <strong className="text-white">{dailyGoals?.exercises?.[confirmDeleteIdx]?.name}</strong> from your active goals?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteIdx(null)}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-white/60 glass-beast border-white/10 transition-all active:scale-95">
                Cancel
              </button>
              <button onClick={() => removeGoal(confirmDeleteIdx)}
                className="flex-1 py-4 rounded-2xl font-black text-sm text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 8px 20px rgba(239,68,68,0.25)' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
