import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { formatTime, calcCalories } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import {
  Play, Pause, ChevronLeft, ChevronRight, Check,
  Flame, Dumbbell, Trophy, X, Plus, Minus,
  Clock, Activity, ArrowRight
} from 'lucide-react';

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const {
    activeSession, plannedExercises,
    startSession, pauseSession, resumeSession,
    logSetInSession, completeExerciseInSession, finishSession
  } = useWorkout();

  const userWeight = userProfile?.weight || 75;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [restTimer, setRestTimer] = useState(0);
  const [initialRestTime, setInitialRestTime] = useState(60);
  const [isResting, setIsResting] = useState(false);
  const restRef = useRef(null);

  const playBuzzer = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Beep 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.15);

      // Beep 2 (delayed by 200ms)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.2);
      gain2.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc2.start(audioCtx.currentTime + 0.2);
      osc2.stop(audioCtx.currentTime + 0.35);
    } catch (err) {
      console.warn('Web Audio API not supported or blocked by browser policy:', err);
    }
  };

  useEffect(() => {
    if (!activeSession && plannedExercises.length > 0) {
      startSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rest timer using setTimeout chain
  useEffect(() => {
    clearTimeout(restRef.current);
    if (isResting && restTimer > 0) {
      restRef.current = setTimeout(() => setRestTimer(r => r - 1), 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
      playBuzzer();
    }
    return () => clearTimeout(restRef.current);
  }, [isResting, restTimer]);

  if (!activeSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Dumbbell size={80} className="text-white/10 mb-8 animate-beast-float" />
        <h1 className="text-3xl font-black text-white italic tracking-tighter mb-4">NO ACTIVE MISSION</h1>
        <p className="text-gym-muted/80 text-sm max-w-[200px] leading-relaxed mb-10 uppercase tracking-widest font-black">Plan your exercises first, then commence training.</p>
        <button onClick={() => navigate('/workout')} className="px-10 py-5 bg-gradient-beast text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-beast glow-beast active:scale-95 transition-all">
          Browse Arsenal
        </button>
      </div>
    );
  }

  const exercises = activeSession.logs || [];
  const currentExercise = exercises[currentIdx];
  const completedCount = exercises.filter(e => e.completed).length;
  const totalSetsLogged = exercises.reduce((s, e) => s + (e.sets?.length || 0), 0);
  const durationMin = (activeSession.elapsedSeconds || 0) / 60;
  const liveCalories = calcCalories(5, durationMin, userWeight);

  const handleLogSet = () => {
    logSetInSession(currentIdx, weight, reps);
    setIsResting(true);
    setRestTimer(60);
    setInitialRestTime(60);
  };

  const handleCompleteExercise = () => {
    completeExerciseInSession(currentIdx);
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleFinish = async () => {
    const result = await finishSession();
    setSummary(result);
    setShowSummary(true);
  };

  // ─── Summary Screen ───────────────────────────────────────
  if (showSummary && summary) {
    return (
      <div className="min-h-screen pb-10 overflow-y-auto">
        <div className="p-6 slide-up space-y-10 max-w-lg mx-auto preserve-3d">
          <div className="text-center pt-10 space-y-6">
            <div className="w-28 h-28 mx-auto glass-beast rounded-full flex items-center justify-center glow-beast shadow-beast-heavy relative">
              <div className="absolute inset-0 bg-gym-neon/10 blur-xl animate-pulse rounded-full" />
              <Trophy size={48} className="text-gym-neon relative z-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-white italic tracking-tighter">VICTORY <br /><span className="text-gym-neon text-glow-beast font-black uppercase tracking-[0.1em] text-4xl">SECURED</span></h1>
              <p className="text-gym-muted text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{summary.date} • {summary.startTime} → {summary.finishedAt}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Clock size={20} className="text-gym-neon" />, val: summary.durationFormatted, label: 'Duration' },
              { icon: <Flame size={20} className="text-gym-fire" />, val: summary.totalCalories, label: 'Calories' },
              { icon: <Dumbbell size={20} className="text-gym-accent" />, val: `${summary.exercisesCompleted}/${summary.totalExercises}`, label: 'Exercises' },
              { icon: <Activity size={20} className="text-gym-gold" />, val: summary.totalSets, label: 'Total Sets' },
            ].map((s, i) => (
              <div key={i} className="glass-beast p-6 rounded-[2.5rem] border-white/5 text-center shadow-beast transition-transform hover:scale-105">
                <div className="mx-auto mb-3 flex justify-center opacity-60">{s.icon}</div>
                <p className="text-3xl font-black text-white">{s.val}</p>
                <p className="text-[10px] text-gym-muted uppercase font-black tracking-widest mt-2">{s.label}</p>
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/')}
            className="w-full py-6 bg-gradient-beast text-white font-black text-sm uppercase tracking-[0.4em] rounded-[2rem] shadow-beast-heavy active:scale-95 transition-all overflow-hidden relative">
            <div className="absolute inset-0 shimmer-beast opacity-20" />
            RETURN TO BASE
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Workout Screen ──────────────────────────────────
  return (
    <div className="min-h-screen pb-10 overflow-y-auto">
      <div className="p-4 space-y-6 max-w-lg mx-auto slide-up preserve-3d">

        {/* Timer Panel */}
        <div className="glass-beast-floating rounded-[2.5rem] p-6 border-white/10 shadow-beast-heavy relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gym-neon/10 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />
          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className="w-full flex justify-between items-center">
              <button onClick={() => navigate('/')} className="p-4 glass-beast rounded-2xl border-white/10 active:scale-90 transition-all opacity-60 hover:opacity-100 min-w-[48px] min-h-[48px] flex items-center justify-center">
                <ChevronLeft size={20} className="text-white" />
              </button>
              <div className="text-center italic">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 flex items-center justify-center gap-2" style={{ color: activeSession.isRunning ? '#818cf8' : '#ef4444' }}>
                  {activeSession.isRunning ? (
                    <><span className="w-2 h-2 bg-gym-neon rounded-full animate-pulse shadow-[0_0_10px_#818cf8]" /> IN PROGRESS</>
                  ) : (
                    <><span className="w-2 h-2 bg-gym-danger rounded-full" /> PAUSED</>
                  )}
                </p>
              </div>
              <button
                onClick={activeSession.isRunning ? pauseSession : resumeSession}
                className={`p-4 rounded-2xl border transition-all shadow-beast tap-3d min-w-[48px] min-h-[48px] flex items-center justify-center ${
                  !activeSession.isRunning ? 'bg-gym-neon border-gym-neon text-gym-dark glow-beast' : 'glass-beast border-white/10 text-white'
                }`}>
                {!activeSession.isRunning ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
              </button>
            </div>

            <div className="text-7xl font-black text-white italic tracking-tighter text-glow-beast" style={{ transform: 'rotateX(5deg)' }}>
              {formatTime(activeSession.elapsedSeconds || 0)}
            </div>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-3 gap-3 preserve-3d">
          {[
            { label: 'CAL', val: liveCalories, color: 'text-gym-fire', icon: <Flame size={12} /> },
            { label: 'EX', val: `${completedCount}/${exercises.length}`, color: 'text-gym-neon', icon: <Dumbbell size={12} /> },
            { label: 'SETS', val: totalSetsLogged, color: 'text-gym-accent', icon: <Activity size={12} /> },
          ].map((s, i) => (
            <div key={i} className="glass-beast px-3 py-4 rounded-3xl border-white/5 text-center shadow-beast relative" style={{ transform: `rotateY(${i === 0 ? '-5deg' : i === 2 ? '5deg' : '0'})` }}>
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              <div className="flex items-center justify-center gap-1 mt-1 opacity-40">
                {s.icon}
                <p className="text-[8px] text-white uppercase font-black tracking-widest">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Current Exercise Card */}
        {currentExercise && (
          <div className={`glass-beast rounded-[3rem] border transition-all duration-700 shadow-beast-heavy overflow-hidden preserve-3d ${
            currentExercise.completed ? 'border-green-500/30' : 'border-white/10'
          }`}>
            <div className="h-48 w-full relative overflow-hidden group">
              <img
                src={currentExercise.image}
                alt={currentExercise.name}
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141425] via-[#141425]/40 to-transparent" />
              {currentExercise.completed && (
                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_#10b981]">
                    <Check size={32} className="text-white" strokeWidth={4} />
                  </div>
                </div>
              )}
              <div className="absolute bottom-5 left-7 right-7 space-y-1">
                <p className="text-[9px] text-gym-neon font-black uppercase tracking-[0.4em] italic mb-1">{currentExercise.muscle}</p>
                <h2 className="text-2xl font-black text-white italic tracking-tighter leading-none">{currentExercise.name}</h2>
              </div>
            </div>

            <div className="p-7 space-y-7 relative">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Target Specs */}
              <div className="grid grid-cols-3 gap-2 px-2">
                {[
                  { val: currentExercise.targetSets || 3, label: 'TARGET SETS' },
                  { val: currentExercise.targetReps || 10, label: 'TARGET REPS' },
                  { val: currentExercise.sets?.length || 0, label: 'COMPLETED', highlight: true },
                ].map((s, i) => (
                  <div key={i} className="text-center space-y-1">
                    <p className={`text-2xl font-black ${s.highlight ? 'text-gym-neon text-glow-beast' : 'text-white/40'}`}>{s.val}</p>
                    <p className="text-[7px] text-white/30 font-black uppercase tracking-widest leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-3">
                {Array.from({ length: currentExercise.targetSets || 3 }).map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < (currentExercise.sets?.length || 0)
                      ? 'w-10 bg-gym-neon glow-beast shadow-[0_0_10px_#818cf8]'
                      : 'w-6 bg-white/5 border border-white/5'
                  }`} />
                ))}
              </div>

              {/* Rest Timer */}
              {isResting && (
                <div className="glass-beast-floating p-5 rounded-[2rem] border-gym-accent/20 text-center animate-beast-float relative overflow-hidden">
                  <div className="absolute inset-0 shimmer-beast opacity-20" />
                  <p className="text-[10px] text-gym-accent font-black uppercase tracking-[0.3em] mb-1">RECUPERATION</p>
                  
                  <p className="text-4xl font-black text-gym-accent italic tracking-tighter">{formatTime(restTimer)}</p>
                  
                  {/* Sleek horizontal progress bar */}
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3 mb-2">
                    <div 
                      className="bg-gym-accent h-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      style={{ width: `${Math.min(100, Math.max(0, (restTimer / initialRestTime) * 100))}%` }}
                    />
                  </div>

                  {/* Rest Adjusters and Skip */}
                  <div className="flex justify-center items-center gap-3 mt-4 relative z-10">
                    <button 
                      onClick={() => {
                        setRestTimer(prev => Math.max(0, prev - 15));
                      }}
                      className="px-3 py-2 glass-beast border border-white/5 rounded-xl text-[9px] text-white/50 font-black uppercase tracking-wider active:scale-90 transition-all"
                    >
                      -15s
                    </button>
                    <button 
                      onClick={() => { setIsResting(false); setRestTimer(0); }}
                      className="px-4 py-2 bg-gym-accent/15 border border-gym-accent/20 text-gym-accent rounded-xl text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-gym-accent/10"
                    >
                      SKIP
                    </button>
                    <button 
                      onClick={() => {
                        setRestTimer(prev => {
                          const next = prev + 15;
                          if (next > initialRestTime) {
                            setInitialRestTime(next);
                          }
                          return next;
                        });
                      }}
                      className="px-3 py-2 glass-beast border border-white/5 rounded-xl text-[9px] text-white/50 font-black uppercase tracking-wider active:scale-90 transition-all"
                    >
                      +15s
                    </button>
                  </div>
                </div>
              )}

              {/* Training Controls */}
              {!currentExercise.completed && (
                <div className="space-y-5">
                  {/* Weight */}
                  <div className="flex items-center justify-between glass-beast p-3 rounded-[2rem] border-white/5 shadow-beast">
                    <button onClick={() => setWeight(Math.max(0, weight - 2.5))} className="w-14 h-14 glass-beast rounded-[1.2rem] flex items-center justify-center border-white/10 active:scale-75 transition-all text-white/40 hover:text-white">
                      <Minus size={16} />
                    </button>
                    <div className="text-center">
                      <p className="text-2xl font-black text-white italic">{weight}</p>
                      <p className="text-[7px] text-gym-muted font-black uppercase tracking-widest">WEIGHT KG</p>
                    </div>
                    <button onClick={() => setWeight(weight + 2.5)} className="w-14 h-14 glass-beast rounded-[1.2rem] flex items-center justify-center border-white/10 active:scale-75 transition-all text-white/40 hover:text-white">
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Reps */}
                  <div className="flex items-center justify-between glass-beast p-3 rounded-[2rem] border-white/5 shadow-beast">
                    <button onClick={() => setReps(Math.max(1, reps - 1))} className="w-14 h-14 glass-beast rounded-[1.2rem] flex items-center justify-center border-white/10 active:scale-75 transition-all text-white/40 hover:text-white">
                      <Minus size={16} />
                    </button>
                    <div className="text-center">
                      <p className="text-2xl font-black text-white italic">{reps}</p>
                      <p className="text-[7px] text-gym-muted font-black uppercase tracking-widest">REPS</p>
                    </div>
                    <button onClick={() => setReps(reps + 1)} className="w-14 h-14 glass-beast rounded-[1.2rem] flex items-center justify-center border-white/10 active:scale-75 transition-all text-white/40 hover:text-white">
                      <Plus size={16} />
                    </button>
                  </div>

                  <button onClick={handleLogSet}
                    className="w-full py-6 bg-gradient-beast text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-beast-heavy relative overflow-hidden active:scale-95 transition-all group">
                    <div className="absolute inset-0 shimmer-beast opacity-30" />
                    LOG SET {(currentExercise.sets?.length || 0) + 1}
                  </button>
                </div>
              )}

              {!currentExercise.completed && (currentExercise.sets?.length || 0) >= (currentExercise.targetSets || 3) && (
                <button onClick={handleCompleteExercise}
                  className="w-full py-6 border-2 font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] active:scale-95 transition-all group"
                  style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981' }}>
                  COMPLETE & NEXT <ArrowRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Exercise Navigator */}
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">EXERCISE LIST</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
              className="p-3 rounded-xl glass-beast border-white/5 disabled:opacity-10 active:scale-75 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button onClick={() => setCurrentIdx(Math.min(exercises.length - 1, currentIdx + 1))} disabled={currentIdx === exercises.length - 1}
              className="p-3 rounded-xl glass-beast border-white/5 disabled:opacity-10 active:scale-75 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {exercises.map((ex, i) => (
            <button key={i} onClick={() => setCurrentIdx(i)}
              className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 shadow-beast ${
                i === currentIdx ? 'glass-beast border-gym-neon/40 shadow-[0_0_20px_rgba(129,140,248,0.15)] scale-[1.02]' : 'glass-beast border-white/5 opacity-50'
              }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black italic ${
                  ex.completed ? 'bg-green-500/20 text-green-400' : i === currentIdx ? 'bg-gym-neon text-gym-dark' : 'bg-white/5 text-white/20'
                }`}>
                  {ex.completed ? <Check size={16} /> : i + 1}
                </div>
                <p className={`text-sm font-black italic tracking-tight ${ex.completed ? 'text-white/30 line-through' : 'text-white'}`}>{ex.name}</p>
              </div>
              <p className="text-[10px] font-black text-gym-muted opacity-40">{ex.sets?.length || 0}/{ex.targetSets || 3}</p>
            </button>
          ))}
        </div>

        {/* Finish Button */}
        <button onClick={handleFinish}
          className="w-full py-6 mt-4 font-black text-sm uppercase tracking-[0.5em] rounded-[2.5rem] active:scale-95 transition-all shadow-beast group relative overflow-hidden border-2"
          style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}>
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );
}
