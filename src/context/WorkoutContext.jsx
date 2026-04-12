import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { workoutData as defaultWorkoutData } from '../data/exercises';

const WorkoutContext = createContext(null);

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    console.error("useWorkout must be used within a WorkoutProvider");
    return {
      goals: { chest: 3, legs: 3, sets: 15 },
      history: [],
      todaysWorkout: { logs: [] },
      plannedExercises: [],
      activeSession: null,
      logSet: () => {},
      addToPlan: () => {},
      removeFromPlan: () => {},
      clearPlan: () => {},
      startSession: () => {},
      pauseSession: () => {},
      resumeSession: () => {},
      completeExerciseInSession: () => {},
      logSetInSession: () => {},
      finishSession: () => {},
      finishWorkout: () => {},
      getSessionElapsed: () => 0,
    };
  }
  return context;
};

// Calorie calculation using MET formula
// MET for weight training ~= 3.5 (moderate), 6.0 (vigorous)
const WEIGHT_KG = 70; // Default body weight
const MET_MODERATE = 3.5;
const MET_VIGOROUS = 6.0;

const calcCalories = (durationMinutes, intensity = 'moderate') => {
  const met = intensity === 'vigorous' ? MET_VIGOROUS : MET_MODERATE;
  return Math.round((met * 3.5 * WEIGHT_KG / 200) * durationMinutes);
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export { calcCalories, formatTime, WEIGHT_KG };

export const WorkoutProvider = ({ children }) => {
  // ─── Exercise Data State (Built-in + Custom) ────────
  const [exercises, setExercises] = useState(() => {
    try {
      const customRaw = localStorage.getItem('gym_custom_exercises');
      const custom = customRaw ? JSON.parse(customRaw) : {};
      const merged = { ...defaultWorkoutData };
      
      Object.keys(custom).forEach(cat => {
        const existingIds = new Set(merged[cat]?.map(e => e.id) || []);
        const newEx = custom[cat].filter(e => !existingIds.has(e.id));
        merged[cat] = [...(merged[cat] || []), ...newEx];
      });
      return merged;
    } catch { return defaultWorkoutData; }
  });

  // ─── Persisted User States ─────────────────────
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_goals');
      return saved ? JSON.parse(saved) : { chest: 3, legs: 3, sets: 15 };
    } catch { return { chest: 3, legs: 3, sets: 15 }; }
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Fallback: Restore from backup if primary is empty but backup exists
      const backup = localStorage.getItem('gym_history_backup');
      if (backup) {
        const parsedBackup = JSON.parse(backup);
        if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
          console.log("Restored history from backup storage");
          return parsedBackup;
        }
      }
      return [];
    } catch { return []; }
  });

  const [todaysWorkout, setTodaysWorkout] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_today');
      const todayStr = new Date().toLocaleDateString();
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr) return parsed;
      }
      return { date: todayStr, logs: [], completed: false };
    } catch { return { date: new Date().toLocaleDateString(), logs: [], completed: false }; }
  });

  const [plannedExercises, setPlannedExercises] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_plan');
      const todayStr = new Date().toLocaleDateString();
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr) return parsed.exercises || [];
      }
      return [];
    } catch { return []; }
  });

  // ─── Active Session State ─────────────────
  const [activeSession, setActiveSession] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if it was today
        if (parsed && parsed.date === new Date().toLocaleDateString()) {
          return parsed;
        }
      }
      return null;
    } catch { return null; }
  });

  const timerRef = useRef(null);

  // ─── Persistence Effects ──────────────────
  // ─── Persistence & Sync Effects ───────────
  useEffect(() => { 
    localStorage.setItem('gym_goals', JSON.stringify(goals)); 
  }, [goals]);

  useEffect(() => { 
    localStorage.setItem('gym_history', JSON.stringify(history));
    // Always keep a backup mirrored
    if (history.length > 0) {
      localStorage.setItem('gym_history_backup', JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => { localStorage.setItem('gym_today', JSON.stringify(todaysWorkout)); }, [todaysWorkout]);
  
  useEffect(() => {
    localStorage.setItem('gym_plan', JSON.stringify({
      date: new Date().toLocaleDateString(),
      exercises: plannedExercises
    }));
  }, [plannedExercises]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('gym_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('gym_active_session');
    }
  }, [activeSession]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'gym_history') setHistory(JSON.parse(e.newValue || '[]'));
      if (e.key === 'gym_custom_exercises') {
        const custom = JSON.parse(e.newValue || '{}');
        const merged = { ...defaultWorkoutData };
        Object.keys(custom).forEach(cat => {
          const existingIds = new Set(merged[cat]?.map(ex => ex.id) || []);
          const newEx = custom[cat].filter(ex => !existingIds.has(ex.id));
          merged[cat] = [...(merged[cat] || []), ...newEx];
        });
        setExercises(merged);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ─── Timer Logic ──────────────────────────
  useEffect(() => {
    if (activeSession && activeSession.isRunning && !activeSession.isPaused) {
      timerRef.current = setInterval(() => {
        setActiveSession(prev => {
          if (!prev || prev.isPaused) return prev;
          const now = Date.now();
          const elapsed = Math.floor((now - prev.startTime) / 1000) - (prev.totalPausedDuration || 0);
          return { ...prev, elapsedSeconds: Math.max(0, elapsed) };
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeSession?.isRunning, activeSession?.isPaused]);

  // ─── Plan Management ──────────────────────
  const addToPlan = useCallback((exercise) => {
    setPlannedExercises(prev => {
      const exId = exercise.id || exercise.name.toLowerCase().replace(/ /g, '-');
      if (prev.find(e => (e.id || e.name.toLowerCase().replace(/ /g, '-')) === exId)) return prev;
      return [...prev, { ...exercise, id: exId }];
    });
  }, []);

  const removeFromPlan = useCallback((id) => {
    setPlannedExercises(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearPlan = useCallback(() => {
    setPlannedExercises([]);
  }, []);

  // ─── Session Management ───────────────────
  const startSession = useCallback(() => {
    const exercises = plannedExercises.map(ex => ({
      ...ex,
      targetSets: ex.levels?.intermediate?.sets || 3,
      targetReps: ex.levels?.intermediate?.reps || '10-12',
      completedSets: [],
      isCompleted: false,
      startedAt: null,
      completedAt: null,
    }));

    setActiveSession({
      date: new Date().toLocaleDateString(),
      startTime: Date.now(),
      elapsedSeconds: 0,
      isPaused: false,
      isRunning: true,
      totalPausedDuration: 0,
      pausedAt: null,
      exercises,
      currentExerciseIndex: 0,
      totalCalories: 0,
    });
  }, [plannedExercises]);

  const pauseSession = useCallback(() => {
    setActiveSession(prev => {
      if (!prev) return prev;
      return { ...prev, isPaused: true, pausedAt: Date.now() };
    });
  }, []);

  const resumeSession = useCallback(() => {
    setActiveSession(prev => {
      if (!prev) return prev;
      const pausedDuration = prev.pausedAt ? Math.floor((Date.now() - prev.pausedAt) / 1000) : 0;
      return {
        ...prev,
        isPaused: false,
        pausedAt: null,
        totalPausedDuration: (prev.totalPausedDuration || 0) + pausedDuration,
      };
    });
  }, []);

  const logSetInSession = useCallback((exerciseIndex, weight, reps) => {
    setActiveSession(prev => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      const ex = { ...exercises[exerciseIndex] };
      
      if (!ex.startedAt) ex.startedAt = Date.now();
      
      ex.completedSets = [
        ...(ex.completedSets || []),
        { weight, reps, time: new Date().toLocaleTimeString() }
      ];
      
      if (ex.completedSets.length >= ex.targetSets) {
        ex.isCompleted = true;
        ex.completedAt = Date.now();
      }
      
      exercises[exerciseIndex] = ex;
      
      const durationMin = prev.elapsedSeconds / 60;
      const totalCalories = calcCalories(durationMin);
      
      return { ...prev, exercises, totalCalories };
    });
  }, []);

  const completeExerciseInSession = useCallback((exerciseIndex) => {
    setActiveSession(prev => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      exercises[exerciseIndex] = {
        ...exercises[exerciseIndex],
        isCompleted: true,
        completedAt: Date.now(),
      };
      return { ...prev, exercises };
    });
  }, []);

  const finishSession = useCallback(() => {
    if (!activeSession) return null;

    const durationMin = activeSession.elapsedSeconds / 60;
    const totalCalories = calcCalories(durationMin);
    const completedExercises = activeSession.exercises.filter(e => e.isCompleted).length;
    const totalSets = activeSession.exercises.reduce((sum, e) => sum + (e.completedSets?.length || 0), 0);

    const summary = {
      date: activeSession.date,
      startTime: new Date(activeSession.startTime).toLocaleTimeString(),
      finishedAt: new Date().toLocaleTimeString(),
      durationSeconds: activeSession.elapsedSeconds,
      durationFormatted: formatTime(activeSession.elapsedSeconds),
      totalCalories,
      exercisesCompleted: completedExercises,
      totalExercises: activeSession.exercises.length,
      totalSets,
      logs: activeSession.exercises.map(ex => ({
        name: ex.name,
        muscle: ex.muscle || ex.muscleTarget || '',
        image: ex.image || '',
        sets: ex.completedSets || [],
        targetSets: ex.targetSets,
        isCompleted: ex.isCompleted,
      })),
    };

    // Save to history
    setHistory(prev => [summary, ...prev]);
    setTodaysWorkout(prev => ({
      ...prev,
      completed: true,
      logs: summary.logs,
      duration: summary.durationFormatted,
      calories: totalCalories,
    }));

    // Clear session & plan
    setActiveSession(null);
    setPlannedExercises([]);
    clearInterval(timerRef.current);

    return summary;
  }, [activeSession]);

  const getSessionElapsed = useCallback(() => {
    return activeSession?.elapsedSeconds || 0;
  }, [activeSession]);

  // ─── Legacy logging ───────────────────────
  const logSet = useCallback((exerciseName, weight, reps) => {
    setTodaysWorkout(prev => {
      const newLogs = [...(prev.logs || [])];
      const existing = newLogs.find(l => l.name === exerciseName);
      const setInfo = { weight, reps, time: new Date().toLocaleTimeString() };
      if (existing) {
        existing.sets = [...(existing.sets || []), setInfo];
      } else {
        newLogs.push({ id: Date.now(), name: exerciseName, sets: [setInfo] });
      }
      return { ...prev, logs: newLogs };
    });
  }, []);

  const finishWorkout = useCallback(() => {
    setHistory(prev => [{ ...todaysWorkout, finishedAt: new Date().toLocaleTimeString() }, ...prev]);
    setTodaysWorkout(prev => ({ ...prev, completed: true }));
    setPlannedExercises([]);
  }, [todaysWorkout]);

  return (
    <WorkoutContext.Provider value={{
      goals, setGoals,
      history,
      exercises,
      setExercises,
      todaysWorkout: todaysWorkout || { logs: [] },
      plannedExercises: plannedExercises || [],
      activeSession,
      logSet,
      addToPlan,
      removeFromPlan,
      clearPlan,
      startSession,
      pauseSession,
      resumeSession,
      completeExerciseInSession,
      logSetInSession,
      finishSession,
      finishWorkout,
      getSessionElapsed,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};
