import { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { formatTime } from '../context/WorkoutContext';
import { 
  Activity, Clock, Flame, Dumbbell, Trophy, Check, X,
  ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';

export default function HistoryAndProgress() {
  const { history } = useWorkout();

  return (
    <div className="min-h-screen bg-[#06060d] pb-32 p-5">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-white">History</h1>
      </header>

      {history.length === 0 ? (
        <div className="py-20 text-center opacity-30 text-white italic text-sm">No history yet.</div>
      ) : (
        <div className="space-y-4">
          {history.map((session, i) => (
            <div key={i} className="bg-gym-card rounded-2xl border border-white/5 p-4">
               <div className="flex justify-between items-center">
                 <p className="text-white font-bold">{session.date}</p>
                 <span className="text-[10px] text-gym-fire font-black">{session.totalCalories || 0} Cal</span>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
