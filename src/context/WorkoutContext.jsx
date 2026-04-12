import { createContext, useContext, useState, useEffect } from 'react';
import { workoutData as defaultWorkoutData } from '../data/exercises';

const WorkoutContext = createContext();

export const useWorkout = () => useContext(WorkoutContext);

export const WEIGHT_KG = 75;

export const calcCalories = (met, durationMinutes, weightKg = WEIGHT_KG) => {
  return Math.round(met * 3.5 * weightKg / 200 * durationMinutes);
};

export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const WorkoutProvider = ({ children }) => {
  // Merge built-in exercises with any custom ones from localStorage
  const [exercises, setExercises] = useState(() => {
    try {
      const customRaw = localStorage.getItem('gym_custom_exercises');
      const custom = customRaw ? JSON.parse(customRaw) : {};
      const merged = {};
      Object.keys(defaultWorkoutData).forEach(cat => {
        merged[cat] = [...defaultWorkoutData[cat]];
      });
      Object.keys(custom).forEach(cat => {
        if (merged[cat]) {
          const ids = new Set(merged[cat].map(e => e.id));
          custom[cat].forEach(e => { if (!ids.has(e.id)) merged[cat].push(e); });
        } else {
          merged[cat] = custom[cat];
        }
      });
      return merged;
    } catch { return { ...defaultWorkoutData }; }
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('gym_history');
    if (saved) return JSON.parse(saved);
    const backup = localStorage.getItem('gym_history_backup');
    return backup ? JSON.parse(backup) : [];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('gym_goals');
    return saved ? JSON.parse(saved) : {
      calories: 500, workoutsPerWeek: 4, waterIntake: 2500, currentWeight: 75, targetWeight: 70
    };
  });

  const [plannedExercises, setPlannedExercises] = useState(() => {
    const saved = localStorage.getItem('gym_active_plan');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSession, setActiveSession] = useState(() => {
    const saved = localStorage.getItem('gym_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    let timer;
    if (activeSession && activeSession.isRunning) {
      timer = setInterval(() => {
        setActiveSession(prev => ({ ...prev, elapsedSeconds: (prev.elapsedSeconds || 0) + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession?.isRunning]);

  useEffect(() => {
    localStorage.setItem('gym_history', JSON.stringify(history));
    if (history.length > 0) localStorage.setItem('gym_history_backup', JSON.stringify(history));
  }, [history]);

  useEffect(() => { localStorage.setItem('gym_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('gym_active_plan', JSON.stringify(plannedExercises)); }, [plannedExercises]);
  useEffect(() => {
    if (activeSession) localStorage.setItem('gym_active_session', JSON.stringify(activeSession));
    else localStorage.removeItem('gym_active_session');
  }, [activeSession]);

  const addToPlan = (exercise) => {
    if (!plannedExercises.find(e => e.id === exercise.id)) {
      setPlannedExercises([...plannedExercises, exercise]);
    }
  };
  const removeFromPlan = (id) => setPlannedExercises(plannedExercises.filter(e => e.id !== id));
  const updateGoals = (newGoals) => setGoals({ ...goals, ...newGoals });

  const startSession = () => {
    setActiveSession({
      startTime: new Date().toISOString(), isRunning: true, elapsedSeconds: 0,
      logs: plannedExercises.map(ex => ({ ...ex, sets: [] }))
    });
  };
  const pauseSession = () => setActiveSession(prev => ({ ...prev, isRunning: false }));
  const resumeSession = () => setActiveSession(prev => ({ ...prev, isRunning: true }));

  const finishSession = (sessionData) => {
    const newSession = {
      ...sessionData, id: Date.now(), date: new Date().toLocaleDateString(),
      finishedAt: new Date().toLocaleTimeString(), durationFormatted: formatTime(sessionData.durationSeconds)
    };
    setHistory([newSession, ...history]);
    setActiveSession(null);
    setPlannedExercises([]);
  };

  const logSetInSession = (exerciseId, set) => {
    setActiveSession(prev => ({
      ...prev,
      logs: prev.logs.map(log =>
        log.id === exerciseId ? { ...log, sets: [...log.sets, { ...set, id: Date.now() }] } : log
      )
    }));
  };

  const completeExerciseInSession = (exerciseId) => {
    setActiveSession(prev => ({
      ...prev,
      logs: prev.logs.map(log =>
        log.id === exerciseId ? { ...log, completed: true } : log
      )
    }));
  };

  const removeSetFromLog = (exerciseId, setId) => {
    setActiveSession(prev => ({
      ...prev,
      logs: prev.logs.map(log =>
        log.id === exerciseId ? { ...log, sets: log.sets.filter(s => s.id !== setId) } : log
      )
    }));
  };

  const updateExerciseData = (newData) => {
    setExercises(newData);
    localStorage.setItem('gym_custom_exercises', JSON.stringify(newData));
  };

  return (
    <WorkoutContext.Provider value={{
      exercises, updateExerciseData, history, goals, plannedExercises, activeSession,
      addToPlan, removeFromPlan, updateGoals, startSession, pauseSession, resumeSession,
      finishSession, logSetInSession, completeExerciseInSession, removeSetFromLog
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};
