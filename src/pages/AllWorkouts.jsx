import { useEffect, useState } from 'react';
import { getExercisesByMuscle } from '../api/exerciseApi';
import { ChevronLeft, Plus, PlayCircle } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export default function AllWorkouts() {
  console.log('AllWorkouts component rendered - SIMPLE VERSION');

  // Super simple test to see if component renders at all
  return (
    <div className="p-6 slide-up">
      <h1 className="text-3xl font-bold text-gym-neon">ALL WORKOUTS PAGE</h1>
      <p className="text-gym-text mt-4">If you see this, the AllWorkouts component is rendering correctly.</p>
      <p className="text-gym-muted">Current URL: /workout</p>
    </div>
  );
}