import { useState, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { 
  Target, Flame, Trophy, Check, Calendar, 
  TrendingUp, ChevronRight, Dumbbell, Star
} from 'lucide-react';

const NEON = '#818cf8';
const ACCENT = '#a855f7';
const FIRE = '#f97316';
const SUCCESS = '#10b981';
const CARD = '#141425';

// Fixed daily challenge exercises — progressive reps that increase weekly
const DAILY_CHALLENGES = [
  { name: 'Push-Ups', icon: '💪', baseReps: 15, increment: 2, unit: 'reps' },
  { name: 'Pull-Ups', icon: '🏋️', baseReps: 5, increment: 1, unit: 'reps' },
  { name: 'Squats', icon: '🦵', baseReps: 20, increment: 3, unit: 'reps' },
  { name: 'Crunches', icon: '🔥', baseReps: 20, increment: 2, unit: 'reps' },
  { name: 'Deadlifts', icon: '⚡', baseReps: 10, increment: 1, unit: 'reps' },
  { name: 'Plank', icon: '🧘', baseReps: 30, increment: 5, unit: 'sec' },
];

const STORAGE_KEY = 'gym_daily_goals';

function getGoalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveGoalData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDayNumber() {
  // Day 1 starts from first use, stored in localStorage
  const startKey = 'gym_challenge_start';
  let start = localStorage.getItem(startKey);
  if (!start) {
    start = getTodayKey();
    localStorage.setItem(startKey, start);
  }
  const startDate = new Date(start);
  const today = new Date(getTodayKey());
  const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Day 1, 2, 3...
}

function getTargetReps(exercise, dayNumber) {
  // Reps increase every day based on increment
  const weekMultiplier = Math.floor((dayNumber - 1) / 7);
  return exercise.baseReps + (weekMultiplier * exercise.increment);
}

export default function Goals() {
  const { history } = useWorkout();
  const [goalData, setGoalData] = useState(getGoalData());
  const [dayNumber, setDayNumber] = useState(getDayNumber());
  const todayKey = getTodayKey();

  const todayData = goalData[todayKey] || {};

  const toggleExercise = (exerciseName) => {
    const updated = { ...goalData };
    if (!updated[todayKey]) updated[todayKey] = {};
    updated[todayKey][exerciseName] = !updated[todayKey][exerciseName];
    saveGoalData(updated);
    setGoalData(updated);
  };

  // Calculate streak
  const calcGoalStreak = () => {
    let streak = 0;
    const today = new Date();
    for (let i = 1; i < 365; i++) { // start from yesterday
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayData = goalData[key];
      if (dayData) {
        const allDone = DAILY_CHALLENGES.every(ex => dayData[ex.name]);
        if (allDone) streak++;
        else break;
      } else break;
    }
    // Check today too
    const todayAllDone = DAILY_CHALLENGES.every(ex => todayData[ex.name]);
    if (todayAllDone) streak++;
    return streak;
  };

  const streak = calcGoalStreak();
  const todayCompleted = DAILY_CHALLENGES.filter(ex => todayData[ex.name]).length;
  const todayProgress = Math.round((todayCompleted / DAILY_CHALLENGES.length) * 100);
  const allDoneToday = todayCompleted === DAILY_CHALLENGES.length;

  // Past 7 days completion data
  const weekData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayData = goalData[key] || {};
    const completed = DAILY_CHALLENGES.filter(ex => dayData[ex.name]).length;
    weekData.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      completed,
      total: DAILY_CHALLENGES.length,
      isToday: i === 0,
      allDone: completed === DAILY_CHALLENGES.length,
    });
  }

  // Total workouts from history
  const totalWorkouts = history?.length || 0;
  const totalSets = history?.reduce((s, h) => s + (h.totalSets || 0), 0) || 0;

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #06060d 0%, #0e0e1a 40%, #0d0a1a 100%)' }}>
      <div className="p-5 slide-up max-w-lg mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(129,140,248,0.1)' }}>
              <Target style={{ color: NEON }} size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Daily Goals</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Day {dayNumber} Challenge</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Flame size={16} style={{ color: FIRE }} />
            <span className="text-sm font-black text-white">{streak}</span>
            <span className="text-[8px] font-bold uppercase" style={{ color: '#6b7280' }}>Streak</span>
          </div>
        </header>

        {/* Today's Progress Ring */}
        <div className="rounded-3xl p-6 text-center" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
              <circle 
                cx="50" cy="50" r="42" 
                stroke={allDoneToday ? SUCCESS : NEON} 
                strokeWidth="8" 
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - todayProgress / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{todayProgress}%</span>
              <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Complete</span>
            </div>
          </div>
          <p className="text-xs font-bold" style={{ color: allDoneToday ? SUCCESS : '#6b7280' }}>
            {allDoneToday ? '🎉 All challenges complete! Beast mode!' : `${todayCompleted}/${DAILY_CHALLENGES.length} exercises done today`}
          </p>
        </div>

        {/* Weekly Overview */}
        <div className="rounded-2xl p-4" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>This Week</h3>
          <div className="flex justify-between items-end gap-1">
            {weekData.map((wd, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div 
                  className="w-full rounded-lg transition-all" 
                  style={{ 
                    height: 40, 
                    background: wd.allDone 
                      ? `linear-gradient(to top, ${NEON}, ${ACCENT})` 
                      : wd.completed > 0 
                        ? `linear-gradient(to top, rgba(129,140,248,${wd.completed / wd.total * 0.6}), rgba(129,140,248,0.1))`
                        : 'rgba(255,255,255,0.03)',
                    border: wd.isToday ? `2px solid ${NEON}` : '1px solid rgba(255,255,255,0.05)'
                  }}
                />
                <span className="text-[8px] font-bold" style={{ color: wd.isToday ? NEON : '#6b7280' }}>{wd.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Challenge List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Today's Challenges
            </h2>
            <span className="text-[9px] font-bold px-2 py-1 rounded-md" style={{ color: ACCENT, background: 'rgba(168,85,247,0.1)' }}>
              Day {dayNumber}
            </span>
          </div>

          {DAILY_CHALLENGES.map((ex, i) => {
            const targetReps = getTargetReps(ex, dayNumber);
            const isDone = todayData[ex.name];

            return (
              <button
                key={i}
                onClick={() => toggleExercise(ex.name)}
                className="w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98]"
                style={{ 
                  background: isDone ? 'rgba(16,185,129,0.08)' : CARD, 
                  border: `1px solid ${isDone ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}` 
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ 
                    background: isDone ? 'rgba(16,185,129,0.15)' : 'rgba(129,140,248,0.1)' 
                  }}>
                    {isDone ? <Check size={24} style={{ color: SUCCESS }} /> : ex.icon}
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-black ${isDone ? 'line-through' : ''}`} style={{ color: isDone ? SUCCESS : '#fff' }}>
                      {ex.name}
                    </p>
                    <p className="text-[10px] font-bold" style={{ color: '#6b7280' }}>
                      {targetReps} {ex.unit} {dayNumber > 7 ? '↑' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDone && <span className="text-[9px] font-black uppercase" style={{ color: SUCCESS }}>Done</span>}
                  <ChevronRight size={16} style={{ color: '#6b7280' }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Lifetime Stats */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Lifetime Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Trophy size={18} style={{ color: NEON }} className="mx-auto mb-1" />
              <p className="text-xl font-black text-white">{totalWorkouts}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Workouts</p>
            </div>
            <div className="text-center">
              <TrendingUp size={18} style={{ color: ACCENT }} className="mx-auto mb-1" />
              <p className="text-xl font-black text-white">{totalSets}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Total Sets</p>
            </div>
            <div className="text-center">
              <Star size={18} style={{ color: FIRE }} className="mx-auto mb-1" />
              <p className="text-xl font-black text-white">{dayNumber}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>Day</p>
            </div>
          </div>
        </div>

        {/* Progression Info */}
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.1)' }}>
          <div className="flex items-start gap-3">
            <TrendingUp size={18} style={{ color: NEON }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: NEON }}>Progressive Overload</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Reps increase every week automatically. Complete all {DAILY_CHALLENGES.length} exercises daily to maintain your streak! 💪
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
