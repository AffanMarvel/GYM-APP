import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { workoutData as defaultWorkoutData } from '../data/exercises';
import { useAuth } from './AuthContext';
import {
  getHistory, addHistoryEntry, deleteHistoryEntry as fsDeleteHistoryEntry,
  getGoals, updateGoals as fsUpdateGoals,
  getDailyGoals, updateDailyGoals as fsUpdateDailyGoals,
  getActivePlan, updateActivePlan,
  getActiveSession, saveActiveSession, clearActiveSession,
  getCustomExercises, updateCustomExercises
} from '../firebase/firestoreService';

const WorkoutContext = createContext();
export const useWorkout = () => useContext(WorkoutContext);

// ─── MET values per category (for accurate calorie calculation) ──────────────
const MET_BY_CATEGORY = {
  chest: 5.0, back: 5.0, legs: 6.0, shoulders: 4.5,
  biceps: 4.0, triceps: 4.0, forearms: 3.5,
  abs: 4.5, cardio: 8.0, warmup: 3.5, stretching: 2.5,
};

// ─── Calorie formula: MET × weight(kg) × hours ───────────────────────────────
export const calcCalories = (met, durationMinutes, weightKg = 75) => {
  return Math.round(met * weightKg * (durationMinutes / 60));
};

// ─── Format seconds → mm:ss or h:mm:ss ───────────────────────────────────────
export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const WorkoutProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const uid = user?.uid;
  const userWeight = userProfile?.weight || 75;

  const [customExercises, setCustomExercises] = useState({});
  const [history, setHistory] = useState([]);
  const [goals, setGoals] = useState({ calories: 500, workoutsPerWeek: 4, waterIntake: 2500, currentWeight: 75, targetWeight: 70 });
  const [dailyGoals, setDailyGoals] = useState(null);
  const [plannedExercises, setPlannedExercises] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Timestamp-based timer (avoids double-counting race condition)
  const timerRef = useRef(null);
  const sessionStartTimestampRef = useRef(null);

  // Dynamic exercise list: merges built-in exercises with custom exercises from Firestore
  const exercises = useMemo(() => {
    const merged = {};
    // Load built-in
    Object.keys(defaultWorkoutData).forEach(cat => {
      merged[cat] = (defaultWorkoutData[cat] || []).map(ex => ({
        ...ex,
        id: ex.id || ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    });

    // Merge custom
    Object.keys(customExercises).forEach(cat => {
      const customList = (customExercises[cat] || []).map(ex => ({
        ...ex,
        id: ex.id || ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));

      if (merged[cat]) {
        const existingIds = new Set(merged[cat].map(e => e.id));
        const uniques = customList.filter(e => !existingIds.has(e.id));
        merged[cat] = [...merged[cat], ...uniques];
      } else {
        merged[cat] = customList;
      }
    });

    return merged;
  }, [customExercises]);

  // ─── Load all data from Firestore on mount ──────────────────────────────────
  useEffect(() => {
    if (!uid) {
      setHistory([]);
      setCustomExercises({});
      setDailyGoals(null);
      setPlannedExercises([]);
      setActiveSession(null);
      setDataLoading(false);
      return;
    }

    const loadData = async () => {
      setDataLoading(true);
      try {
        const [h, g, dg, ap, as_, ce] = await Promise.all([
          getHistory(uid),
          getGoals(uid),
          getDailyGoals(uid),
          getActivePlan(uid),
          getActiveSession(uid),
          getCustomExercises(uid)
        ]);
        setHistory(h || []);
        if (g) setGoals(g);
        setDailyGoals(dg);
        setPlannedExercises(ap || []);
        setCustomExercises(ce || {});

        // Validate active session — discard if older than 24h
        if (as_) {
          const age = Date.now() - (as_.startTimestamp || 0);
          if (age < 24 * 60 * 60 * 1000) {
            setActiveSession(as_);
            if (as_.isRunning) {
              sessionStartTimestampRef.current = as_.startTimestamp;
            }
          } else {
            await clearActiveSession(uid);
          }
        }
      } catch (err) {
        console.error('Failed to load workout data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [uid]);

  // ─── Timestamp-based session timer ─────────────────────────────────────────
  useEffect(() => {
    if (activeSession?.isRunning) {
      timerRef.current = setInterval(() => {
        setActiveSession(prev => {
          if (!prev?.isRunning) return prev;
          const elapsed = Math.floor((Date.now() - (prev.startTimestamp || Date.now())) / 1000) + (prev.pausedSeconds || 0);
          return { ...prev, elapsedSeconds: elapsed };
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [activeSession?.isRunning]);

  // ─── Debounced Firestore sync helpers ──────────────────────────────────────
  const syncDebounce = useRef({});
  const debouncedSync = useCallback((key, fn, delay = 1500) => {
    clearTimeout(syncDebounce.current[key]);
    syncDebounce.current[key] = setTimeout(fn, delay);
  }, []);

  // ─── Plan ───────────────────────────────────────────────────────────────────
  const addToPlan = (exercise) => {
    if (plannedExercises.find(e => e.id === exercise.id)) return;
    const next = [...plannedExercises, exercise];
    setPlannedExercises(next);
    if (uid) debouncedSync('plan', () => updateActivePlan(uid, next));
  };

  const removeFromPlan = (id) => {
    const next = plannedExercises.filter(e => e.id !== id);
    setPlannedExercises(next);
    if (uid) debouncedSync('plan', () => updateActivePlan(uid, next));
  };

  const reorderPlan = (nextPlan) => {
    setPlannedExercises(nextPlan);
    if (uid) debouncedSync('plan', () => updateActivePlan(uid, nextPlan));
  };

  // ─── Goals ──────────────────────────────────────────────────────────────────
  const updateGoals = (newGoals) => {
    const merged = { ...goals, ...newGoals };
    setGoals(merged);
    if (uid) debouncedSync('goals', () => fsUpdateGoals(uid, merged));
  };

  const updateDailyGoals = (newDaily) => {
    setDailyGoals(newDaily);
    if (uid) debouncedSync('dailyGoals', () => fsUpdateDailyGoals(uid, newDaily));
  };

  // ─── Custom Exercises CRUD ──────────────────────────────────────────────────
  const addCustomExercise = async (newEx) => {
    if (!uid) return;
    const cleanEx = {
      ...newEx,
      id: newEx.id || newEx.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      instructions: (newEx.instructions || []).filter(i => i.trim()),
      tips: (newEx.tips || []).filter(t => t.trim())
    };

    const updated = { ...customExercises };
    if (!updated[cleanEx.category]) updated[cleanEx.category] = [];
    
    const existingIndex = updated[cleanEx.category].findIndex(e => e.id === cleanEx.id);
    if (existingIndex > -1) {
      updated[cleanEx.category][existingIndex] = cleanEx;
    } else {
      updated[cleanEx.category].push(cleanEx);
    }

    setCustomExercises(updated);
    await updateCustomExercises(uid, updated);
  };

  const deleteCustomExercise = async (category, id) => {
    if (!uid) return;
    const updated = { ...customExercises };
    if (updated[category]) {
      updated[category] = updated[category].filter(e => e.id !== id);
      setCustomExercises(updated);
      await updateCustomExercises(uid, updated);
    }
  };

  // ─── History Deletion ───────────────────────────────────────────────────────
  const deleteHistory = async (firestoreId) => {
    if (!uid || !firestoreId) return;
    try {
      await fsDeleteHistoryEntry(uid, firestoreId);
      setHistory(prev => prev.filter(h => h.firestoreId !== firestoreId));
    } catch (err) {
      console.error('Failed to delete history entry:', err);
    }
  };

  // ─── Session ────────────────────────────────────────────────────────────────
  const startSession = () => {
    const now = Date.now();
    const session = {
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      startTimestamp: now,
      isRunning: true,
      elapsedSeconds: 0,
      pausedSeconds: 0,
      logs: plannedExercises.map(ex => ({ ...ex, sets: [], completed: false })),
    };
    setActiveSession(session);
    if (uid) saveActiveSession(uid, session);
  };

  const pauseSession = () => {
    setActiveSession(prev => {
      if (!prev) return null;
      const paused = {
        ...prev,
        isRunning: false,
        pausedSeconds: prev.elapsedSeconds,
        pauseTimestamp: Date.now(),
      };
      if (uid) debouncedSync('session', () => saveActiveSession(uid, paused), 500);
      return paused;
    });
  };

  const resumeSession = () => {
    setActiveSession(prev => {
      if (!prev) return null;
      const resumed = {
        ...prev,
        isRunning: true,
        startTimestamp: Date.now() - (prev.pausedSeconds || 0) * 1000,
      };
      if (uid) debouncedSync('session', () => saveActiveSession(uid, resumed), 500);
      return resumed;
    });
  };

  const streak = useMemo(() => {
    if (!history || history.length === 0) return 0;
    const dates = Array.from(new Set(history.map(h => h.date)))
      .map(dStr => new Date(dStr))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => b - a);

    if (dates.length === 0) return 0;

    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latestWorkoutDate = new Date(dates[0]);
    latestWorkoutDate.setHours(0,0,0,0);

    if (latestWorkoutDate.getTime() !== today.getTime() && latestWorkoutDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let streakCount = 1;
    let current = latestWorkoutDate;

    for (let i = 1; i < dates.length; i++) {
      const nextDate = new Date(dates[i]);
      nextDate.setHours(0,0,0,0);

      const diffTime = current.getTime() - nextDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streakCount++;
        current = nextDate;
      } else if (diffDays > 1) {
        break;
      }
    }
    return streakCount;
  }, [history]);

  const logWater = (ml) => {
    const todayStr = new Date().toLocaleDateString();
    const currentWater = (dailyGoals?.waterDate === todayStr) ? (dailyGoals?.waterLogged || 0) : 0;
    const nextDaily = {
      ...dailyGoals,
      waterLogged: currentWater + ml,
      waterDate: todayStr
    };
    setDailyGoals(nextDaily);
    if (uid) debouncedSync('dailyGoals', () => fsUpdateDailyGoals(uid, nextDaily));
  };

  const finishSession = async () => {
    if (!activeSession) return null;

    const durationSec = activeSession.elapsedSeconds || 0;
    const durationMin = durationSec / 60;

    // Calculate calories dynamically by averaging the MET of logged exercise categories
    const loggedExercises = activeSession.logs || [];
    let totalMet = 0;
    let exerciseCount = 0;

    loggedExercises.forEach(log => {
      const cat = log.category || 'warmup';
      const met = MET_BY_CATEGORY[cat] || 4.0;
      totalMet += met;
      exerciseCount++;
    });

    const avgMet = exerciseCount > 0 ? (totalMet / exerciseCount) : 4.0;
    const totalCalories = calcCalories(avgMet, durationMin, userWeight);

    let exercisesCompleted = 0;
    let totalSets = 0;
    activeSession.logs.forEach(log => {
      if (log.completed) exercisesCompleted++;
      totalSets += log.sets?.length || 0;
    });

    const newSession = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      startTime: activeSession.startTime,
      finishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: durationSec,
      durationFormatted: formatTime(durationSec),
      totalCalories,
      exercisesCompleted,
      totalExercises: activeSession.logs.length,
      totalSets,
      logs: activeSession.logs,
    };

    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    setActiveSession(null);
    setPlannedExercises([]);

    if (uid) {
      const newId = await addHistoryEntry(uid, newSession);
      setHistory(prev => prev.map((h, i) => i === 0 ? { ...h, firestoreId: newId } : h));
      await clearActiveSession(uid);
      await updateActivePlan(uid, []);
    }

    return newSession;
  };

  const logSetInSession = (exerciseIdx, weight, reps) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const newLogs = [...prev.logs];
      if (newLogs[exerciseIdx]) {
        newLogs[exerciseIdx] = {
          ...newLogs[exerciseIdx],
          sets: [...(newLogs[exerciseIdx].sets || []), { weight, reps, id: Date.now() }],
        };
      }
      const updated = { ...prev, logs: newLogs };
      if (uid) debouncedSync('session', () => saveActiveSession(uid, updated), 800);
      return updated;
    });
  };

  const completeExerciseInSession = (exerciseIdx) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const newLogs = [...prev.logs];
      if (newLogs[exerciseIdx]) {
        newLogs[exerciseIdx] = { ...newLogs[exerciseIdx], completed: true };
      }
      const updated = { ...prev, logs: newLogs };
      if (uid) debouncedSync('session', () => saveActiveSession(uid, updated), 800);
      return updated;
    });
  };

  const removeSetFromLog = (exerciseIdx, setId) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const newLogs = [...prev.logs];
      if (newLogs[exerciseIdx]) {
        newLogs[exerciseIdx] = {
          ...newLogs[exerciseIdx],
          sets: newLogs[exerciseIdx].sets.filter(s => s.id !== setId),
        };
      }
      const updated = { ...prev, logs: newLogs };
      if (uid) debouncedSync('session', () => saveActiveSession(uid, updated), 800);
      return updated;
    });
  };

  return (
    <WorkoutContext.Provider value={{
      exercises, history, goals, dailyGoals, plannedExercises, activeSession,
      dataLoading, userWeight, calcCalories, MET_BY_CATEGORY,
      addToPlan, removeFromPlan, reorderPlan, updateGoals, updateDailyGoals,
      startSession, pauseSession, resumeSession, finishSession,
      logSetInSession, completeExerciseInSession, removeSetFromLog,
      customExercises, addCustomExercise, deleteCustomExercise, deleteHistory,
      streak, logWater
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};
