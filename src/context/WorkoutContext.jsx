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

  const [dailyGoals, setDailyGoals] = useState(() => {
    const saved = localStorage.getItem('gym_daily_goals') || localStorage.getItem('gym_target_goals');
    return saved ? JSON.parse(saved) : null;
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
  useEffect(() => { 
    if (dailyGoals) localStorage.setItem('gym_daily_goals', JSON.stringify(dailyGoals)); 
  }, [dailyGoals]);
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
  const updateDailyGoals = (newDaily) => setDailyGoals(newDaily);

  const startSession = () => {
    setActiveSession({
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }), 
      isRunning: true, 
      elapsedSeconds: 0,
      logs: plannedExercises.map(ex => ({ ...ex, sets: [] }))
    });
  };
  const pauseSession = () => setActiveSession(prev => prev ? ({ ...prev, isRunning: false }) : null);
  const resumeSession = () => setActiveSession(prev => prev ? ({ ...prev, isRunning: true }) : null);

  const finishSession = () => {
    if (!activeSession) return null;
    
    const durationMin = activeSession.elapsedSeconds / 60;
    const totalCalories = calcCalories(6, durationMin);
    
    let exercisesCompleted = 0;
    let totalSets = 0;
    
    activeSession.logs.forEach(log => {
      if (log.completed) exercisesCompleted++;
      totalSets += (log.sets?.length || 0);
    });

    const summaryData = {
      startTime: activeSession.startTime,
      durationSeconds: activeSession.elapsedSeconds,
      durationFormatted: formatTime(activeSession.elapsedSeconds),
      totalCalories,
      exercisesCompleted,
      totalExercises: activeSession.logs.length,
      totalSets,
      logs: activeSession.logs
    };

    const newSession = {
      ...summaryData,
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      finishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })
    };
    
    setHistory([newSession, ...history]);
    setActiveSession(null);
    setPlannedExercises([]);
    
    return newSession;
  };

  const logSetInSession = (exerciseIdx, weight, reps) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const newLogs = [...prev.logs];
      if (newLogs[exerciseIdx]) {
        newLogs[exerciseIdx] = { 
          ...newLogs[exerciseIdx], 
          sets: [...(newLogs[exerciseIdx].sets || []), { weight, reps, id: Date.now() }] 
        };
      }
      return { ...prev, logs: newLogs };
    });
  };

  const completeExerciseInSession = (exerciseIdx) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const newLogs = [...prev.logs];
      if (newLogs[exerciseIdx]) {
        newLogs[exerciseIdx] = { ...newLogs[exerciseIdx], completed: true };
      }
      return { ...prev, logs: newLogs };
    });
  };

  const removeSetFromLog = (exerciseIdx, setId) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const newLogs = [...prev.logs];
      if (newLogs[exerciseIdx]) {
        newLogs[exerciseIdx] = { 
          ...newLogs[exerciseIdx], 
          sets: newLogs[exerciseIdx].sets.filter(s => s.id !== setId) 
        };
      }
      return { ...prev, logs: newLogs };
    });
  };

  const updateExerciseData = (newData) => {
    setExercises(newData);
    localStorage.setItem('gym_custom_exercises', JSON.stringify(newData));
  };

  return (
    <WorkoutContext.Provider value={{
      exercises, updateExerciseData, history, goals, dailyGoals, plannedExercises, activeSession,
      addToPlan, removeFromPlan, updateGoals, updateDailyGoals, startSession, pauseSession, resumeSession,
      finishSession, logSetInSession, completeExerciseInSession, removeSetFromLog
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};
