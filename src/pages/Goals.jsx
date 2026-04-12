import { useWorkout } from '../context/WorkoutContext';
import { Target } from 'lucide-react';

export default function Goals() {
  const { goals, setGoals, todaysWorkout } = useWorkout();

  // Basic progress calculator based on workout logs matching goal names
  // In a real app we'd map string names exact, but for demo we just sum total sets done vs goal sets
  const totalSetsDone = todaysWorkout.logs.reduce((acc, log) => acc + log.sets.length, 0);
  const setsGoal = goals.sets || 15;
  const progressPercent = Math.min((totalSetsDone / setsGoal) * 100, 100);

  return (
    <div className="p-6 slide-up">
      <header className="mb-8 flex items-center space-x-3">
        <Target className="text-gym-neon" size={28} />
        <h1 className="text-3xl font-bold">Daily Targets</h1>
      </header>

      <div className="bg-gym-surface p-6 rounded-2xl border border-white/5 mb-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="font-bold text-lg">Total Volume Goal</h3>
            <p className="text-sm text-gym-muted">Sets completed today</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gym-neon">{totalSetsDone}</span>
            <span className="text-gym-muted"> / {setsGoal}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-4 w-full bg-gym-dark rounded-full overflow-hidden">
          <div 
            className="h-full bg-gym-neon transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {progressPercent >= 100 && (
          <p className="text-gym-neon text-sm mt-3 font-medium">Goal Crushed! 🔥</p>
        )}
      </div>
      
      {/* For future, editable goals can go here */}
      <h2 className="text-xl font-bold mb-4">Set Your Targets</h2>
      <div className="space-y-4">
         <div className="bg-gym-surface p-4 rounded-xl flex justify-between items-center">
            <span>Daily Sets Goal</span>
            <input 
              type="number" 
              className="bg-gym-dark text-gym-neon w-16 text-center rounded p-1"
              value={goals.sets}
              onChange={(e) => setGoals({...goals, sets: parseInt(e.target.value) || 0})}
            />
         </div>
      </div>
    </div>
  );
}
