import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { formatTime, calcCalories, WEIGHT_KG } from '../context/WorkoutContext';
import {
  Play, Pause, Square, ChevronLeft, ChevronRight, Check,
  Timer, Flame, Dumbbell, Trophy, X, Plus, Minus,
  Clock, Zap, Activity, ArrowRight
} from 'lucide-react';

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const {
    activeSession, plannedExercises,
    startSession, pauseSession, resumeSession,
    logSetInSession, completeExerciseInSession, finishSession
  } = useWorkout();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const restRef = useRef(null);

  // Start session if not active
  useEffect(() => {
    if (!activeSession && plannedExercises.length > 0) {
      startSession();
    }
  }, []);

  // Rest timer
  useEffect(() => {
    if (isResting && restTimer > 0) {
      restRef.current = setTimeout(() => setRestTimer(r => r - 1), 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
    }
    return () => clearTimeout(restRef.current);
  }, [isResting, restTimer]);

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-gym-dark flex flex-col items-center justify-center p-6 text-center">
        <Dumbbell size={64} className="text-gym-muted mb-6 opacity-30" />
        <h1 className="text-2xl font-black text-white mb-2">No Active Session</h1>
        <p className="text-gym-muted mb-8">Add exercises to your plan first, then start a workout.</p>
        <button onClick={() => navigate('/workout')} className="px-8 py-4 bg-gradient-neon text-white font-black rounded-2xl text-sm uppercase tracking-widest glow-neon">
          Browse Exercises
        </button>
      </div>
    );
  }

  const exercises = activeSession.exercises || [];
  const currentExercise = exercises[currentIdx];
  const completedCount = exercises.filter(e => e.isCompleted).length;
  const totalSetsLogged = exercises.reduce((s, e) => s + (e.completedSets?.length || 0), 0);
  const durationMin = (activeSession.elapsedSeconds || 0) / 60;
  const liveCalories = calcCalories(durationMin);

  const handleLogSet = () => {
    logSetInSession(currentIdx, weight, reps);
    setIsResting(true);
    setRestTimer(60);
  };

  const handleCompleteExercise = () => {
    completeExerciseInSession(currentIdx);
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleFinish = () => {
    const result = finishSession();
    setSummary(result);
    setShowSummary(true);
  };

  // ── Summary Screen ────────────────────────
  if (showSummary && summary) {
    return (
      <div className="min-h-screen bg-gym-dark pb-32">
        <div className="p-6 slide-up space-y-8 max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center pt-8 space-y-4">
            <div className="w-24 h-24 mx-auto bg-gym-neon/10 rounded-full flex items-center justify-center glow-neon">
              <Trophy size={48} className="text-gym-neon" />
            </div>
            <h1 className="text-4xl font-black text-white">Workout<br/><span className="text-gym-neon text-glow">Complete!</span></h1>
            <p className="text-gym-muted text-sm">{summary.date} • {summary.startTime} → {summary.finishedAt}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gym-card p-5 rounded-3xl border border-white/5 text-center">
              <Clock size={22} className="text-gym-neon mx-auto mb-2" />
              <p className="text-3xl font-black text-white timer-display">{summary.durationFormatted}</p>
              <p className="text-[10px] text-gym-muted uppercase font-bold tracking-widest mt-1">Duration</p>
            </div>
            <div className="bg-gym-card p-5 rounded-3xl border border-white/5 text-center">
              <Flame size={22} className="text-gym-fire mx-auto mb-2" />
              <p className="text-3xl font-black text-gym-fire">{summary.totalCalories}</p>
              <p className="text-[10px] text-gym-muted uppercase font-bold tracking-widest mt-1">Calories</p>
            </div>
            <div className="bg-gym-card p-5 rounded-3xl border border-white/5 text-center">
              <Dumbbell size={22} className="text-gym-accent mx-auto mb-2" />
              <p className="text-3xl font-black text-white">{summary.exercisesCompleted}<span className="text-lg text-gym-muted">/{summary.totalExercises}</span></p>
              <p className="text-[10px] text-gym-muted uppercase font-bold tracking-widest mt-1">Exercises</p>
            </div>
            <div className="bg-gym-card p-5 rounded-3xl border border-white/5 text-center">
              <Activity size={22} className="text-gym-gold mx-auto mb-2" />
              <p className="text-3xl font-black text-white">{summary.totalSets}</p>
              <p className="text-[10px] text-gym-muted uppercase font-bold tracking-widest mt-1">Total Sets</p>
            </div>
          </div>

          {/* Exercise Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40 px-2">Exercise Log</h3>
            {summary.logs.map((log, i) => (
              <div key={i} className="bg-gym-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.isCompleted ? 'bg-gym-success/20' : 'bg-gym-danger/20'}`}>
                    {log.isCompleted ? <Check size={16} className="text-gym-success" /> : <X size={16} className="text-gym-danger" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{log.name}</p>
                    <p className="text-[10px] text-gym-muted">{log.sets.length}/{log.targetSets} sets completed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Done Button */}
          <button
            onClick={() => navigate('/')}
            className="w-full py-5 bg-gradient-neon text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl glow-neon active:scale-95 transition-transform"
          >
            Back To Home
          </button>
        </div>
      </div>
    );
  }

  // ── Active Workout Screen ─────────────────
  return (
    <div className="min-h-screen bg-gym-dark pb-32">
      <div className="p-4 space-y-5 max-w-lg mx-auto slide-up">

        {/* Top Bar: Timer & Controls */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2.5 bg-gym-card rounded-xl border border-white/5 active:scale-95 transition-transform">
            <ChevronLeft size={22} className="text-white" />
          </button>
          
          <div className="flex items-center gap-3 bg-gym-card px-5 py-3 rounded-2xl border border-white/5">
            <Timer size={18} className="text-gym-neon" />
            <span className="text-2xl font-black text-white timer-display text-glow">
              {formatTime(activeSession.elapsedSeconds || 0)}
            </span>
          </div>

          <button
            onClick={activeSession.isPaused ? resumeSession : pauseSession}
            className={`p-2.5 rounded-xl border active:scale-95 transition-transform ${
              activeSession.isPaused ? 'bg-gym-neon/10 border-gym-neon/30 text-gym-neon' : 'bg-gym-card border-white/5 text-white'
            }`}
          >
            {activeSession.isPaused ? <Play size={22} /> : <Pause size={22} />}
          </button>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gym-card px-3 py-3 rounded-2xl border border-white/5 text-center">
            <p className="text-lg font-black text-gym-fire">{liveCalories}</p>
            <p className="text-[8px] text-gym-muted uppercase font-bold tracking-widest">Cal</p>
          </div>
          <div className="bg-gym-card px-3 py-3 rounded-2xl border border-white/5 text-center">
            <p className="text-lg font-black text-gym-neon">{completedCount}<span className="text-gym-muted">/{exercises.length}</span></p>
            <p className="text-[8px] text-gym-muted uppercase font-bold tracking-widest">Exercises</p>
          </div>
          <div className="bg-gym-card px-3 py-3 rounded-2xl border border-white/5 text-center">
            <p className="text-lg font-black text-gym-accent">{totalSetsLogged}</p>
            <p className="text-[8px] text-gym-muted uppercase font-bold tracking-widest">Sets</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gym-card rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-neon rounded-full transition-all duration-500"
            style={{ width: `${exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0}%` }}
          />
        </div>

        {/* Exercise Navigator */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="p-2 rounded-xl bg-gym-card border border-white/5 disabled:opacity-20 active:scale-90 transition-transform"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <p className="text-[10px] font-black uppercase tracking-widest text-gym-muted">
            Exercise {currentIdx + 1} of {exercises.length}
          </p>
          <button
            onClick={() => setCurrentIdx(Math.min(exercises.length - 1, currentIdx + 1))}
            disabled={currentIdx === exercises.length - 1}
            className="p-2 rounded-xl bg-gym-card border border-white/5 disabled:opacity-20 active:scale-90 transition-transform"
          >
            <ChevronRight size={18} className="text-white" />
          </button>
        </div>

        {/* Current Exercise Card */}
        {currentExercise && (
          <div className={`bg-gym-card rounded-3xl border overflow-hidden transition-all ${
            currentExercise.isCompleted ? 'border-gym-success/30' : 'border-white/5'
          }`}>
            {/* Exercise Image */}
            <div className="h-44 w-full relative overflow-hidden">
              <img 
                src={currentExercise.image} 
                alt={currentExercise.name}
                className="w-full h-full object-cover opacity-80"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gym-card via-transparent to-transparent" />
              {currentExercise.isCompleted && (
                <div className="absolute inset-0 bg-gym-success/10 flex items-center justify-center">
                  <div className="bg-gym-success/20 backdrop-blur-md p-4 rounded-full">
                    <Check size={40} className="text-gym-success" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[10px] text-gym-neon font-black uppercase tracking-widest mb-1">{currentExercise.muscle}</p>
                <h2 className="text-xl font-black text-white leading-tight">{currentExercise.name}</h2>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Target Info */}
              <div className="flex items-center justify-between bg-gym-dark/50 p-4 rounded-2xl">
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{currentExercise.targetSets}</p>
                  <p className="text-[9px] text-gym-muted uppercase font-bold tracking-widest">Target Sets</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{currentExercise.targetReps}</p>
                  <p className="text-[9px] text-gym-muted uppercase font-bold tracking-widest">Target Reps</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-black text-gym-neon">{currentExercise.completedSets?.length || 0}</p>
                  <p className="text-[9px] text-gym-muted uppercase font-bold tracking-widest">Done</p>
                </div>
              </div>

              {/* Set Progress Dots */}
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: currentExercise.targetSets }).map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full transition-all ${
                    i < (currentExercise.completedSets?.length || 0)
                      ? 'bg-gym-neon glow-neon scale-110' 
                      : 'bg-gym-dark border border-white/10'
                  }`} />
                ))}
              </div>

              {/* Rest Timer */}
              {isResting && (
                <div className="bg-gym-accent/10 p-4 rounded-2xl border border-gym-accent/20 text-center">
                  <p className="text-[10px] text-gym-accent font-black uppercase tracking-widest mb-1">Rest Timer</p>
                  <p className="text-3xl font-black text-gym-accent timer-display">{formatTime(restTimer)}</p>
                  <button onClick={() => { setIsResting(false); setRestTimer(0); }} className="mt-2 text-[10px] text-gym-muted underline">Skip Rest</button>
                </div>
              )}

              {/* Weight & Reps Input */}
              {!currentExercise.isCompleted && (
                <div className="space-y-4">
                  {/* Weight */}
                  <div className="flex items-center justify-between bg-gym-dark/50 px-4 py-3 rounded-2xl">
                    <span className="text-xs font-bold text-gym-muted uppercase tracking-wider">Weight (kg)</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setWeight(Math.max(0, weight - 2.5))} className="w-9 h-9 bg-gym-card rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
                        <Minus size={14} className="text-white" />
                      </button>
                      <span className="text-xl font-black text-white w-14 text-center timer-display">{weight}</span>
                      <button onClick={() => setWeight(weight + 2.5)} className="w-9 h-9 bg-gym-card rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
                        <Plus size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                  {/* Reps */}
                  <div className="flex items-center justify-between bg-gym-dark/50 px-4 py-3 rounded-2xl">
                    <span className="text-xs font-bold text-gym-muted uppercase tracking-wider">Reps</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setReps(Math.max(1, reps - 1))} className="w-9 h-9 bg-gym-card rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
                        <Minus size={14} className="text-white" />
                      </button>
                      <span className="text-xl font-black text-white w-14 text-center timer-display">{reps}</span>
                      <button onClick={() => setReps(reps + 1)} className="w-9 h-9 bg-gym-card rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
                        <Plus size={14} className="text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Log Set Button */}
                  <button
                    onClick={handleLogSet}
                    className="w-full py-4 bg-gradient-neon text-white font-black text-sm uppercase tracking-[0.15em] rounded-2xl glow-neon active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <Check size={18} strokeWidth={3} />
                    Log Set {(currentExercise.completedSets?.length || 0) + 1}
                  </button>
                </div>
              )}

              {/* Complete / Next Exercise */}
              {!currentExercise.isCompleted && (currentExercise.completedSets?.length || 0) >= currentExercise.targetSets && (
                <button
                  onClick={handleCompleteExercise}
                  className="w-full py-4 bg-gym-success/20 text-gym-success border border-gym-success/30 font-black text-sm uppercase tracking-[0.15em] rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} strokeWidth={3} />
                  Complete & Next
                </button>
              )}
            </div>
          </div>
        )}

        {/* Exercise List Overview */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gym-muted px-2">All Exercises</p>
          {exercises.map((ex, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                i === currentIdx ? 'bg-gym-neon/5 border-gym-neon/20' : 'bg-gym-card border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  ex.isCompleted ? 'bg-gym-success/20 text-gym-success' : i === currentIdx ? 'bg-gym-neon/20 text-gym-neon' : 'bg-gym-dark text-gym-muted'
                }`}>
                  {ex.isCompleted ? <Check size={14} /> : i + 1}
                </div>
                <p className={`text-xs font-bold ${ex.isCompleted ? 'text-gym-success line-through' : 'text-white'}`}>{ex.name}</p>
              </div>
              <p className="text-[10px] text-gym-muted">{ex.completedSets?.length || 0}/{ex.targetSets}</p>
            </button>
          ))}
        </div>

        {/* Finish Workout Button */}
        <button
          onClick={handleFinish}
          className="w-full py-5 bg-gym-danger/10 border-2 border-gym-danger/30 text-gym-danger font-black text-sm uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-3"
        >
          <Square size={18} fill="currentColor" />
          Finish Workout
        </button>
      </div>
    </div>
  );
}
