import { createContext, useContext, useState, useEffect } from 'react';

const WorkoutContext = createContext();

export const useWorkout = () => useContext(WorkoutContext);

export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const WorkoutProvider = ({ children }) => {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('gym_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('gym_goals');
    return saved ? JSON.parse(saved) : {
      calories: 500,
      workoutsPerWeek: 4,
      waterIntake: 2500,
      currentWeight: 75,
      targetWeight: 70
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

  // Track elapsed time for active session
  useEffect(() => {
    let timer;
    if (activeSession && activeSession.isRunning) {
      timer = setInterval(() => {
        setActiveSession(prev => ({
          ...prev,
          elapsedSeconds: (prev.elapsedSeconds || 0) + 1
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession?.isRunning]);

  // Persist states
  useEffect(() => {
    localStorage.setItem('gym_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('gym_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('gym_active_plan', JSON.stringify(plannedExercises));
  }, [plannedExercises]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('gym_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('gym_active_session');
    }
  }, [activeSession]);

  const addToPlan = (exercise) => {
    if (!plannedExercises.find(e => e.id === exercise.id)) {
      setPlannedExercises([...plannedExercises, exercise]);
    }
  };

  const removeFromPlan = (id) => {
    setPlannedExercises(plannedExercises.filter(e => e.id !== id));
  };

  const updateGoals = (newGoals) => {
    setGoals({ ...goals, ...newGoals });
  };

  const startWorkout = () => {
    setActiveSession({
      startTime: new Date().toISOString(),
      isRunning: true,
      elapsedSeconds: 0,
      logs: plannedExercises.map(ex => ({
        ...ex,
        sets: []
      }))
    });
  };

  const pauseWorkout = () => {
    setActiveSession(prev => ({ ...prev, isRunning: false }));
  };

  const resumeWorkout = () => {
    setActiveSession(prev => ({ ...prev, isRunning: true }));
  };

  const finishSession = (sessionData) => {
    const newSession = {
      ...sessionData,
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      finishedAt: new Date().toLocaleTimeString(),
      durationFormatted: formatTime(sessionData.durationSeconds)
    };
    setHistory([newSession, ...history]);
    setActiveSession(null);
    setPlannedExercises([]); // Clear plan after finishing
  };

  const addLogToActiveSession = (exerciseId, set) => {
    setActiveSession(prev => ({
      ...prev,
      logs: prev.logs.map(log => 
        log.id === exerciseId 
          ? { ...log, sets: [...log.sets, { ...set, id: Date.now() }] }
          : log
      )
    }));
  };

  const removeSetFromLog = (exerciseId, setId) => {
    setActiveSession(prev => ({
      ...prev,
      logs: prev.logs.map(log => 
        log.id === exerciseId 
          ? { ...log, sets: log.sets.filter(s => s.id !== setId) }
          : log
      )
    }));
  };

  return (
    <WorkoutContext.Provider value={{
      history,
      goals,
      plannedExercises,
      activeSession,
      addToPlan,
      removeFromPlan,
      updateGoals,
      startWorkout,
      pauseWorkout,
      resumeWorkout,
      finishSession,
      addLogToActiveSession,
      removeSetFromLog
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};
