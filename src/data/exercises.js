import { chestExercises } from './categories/chest';
import { backExercises } from './categories/back';
import { legExercises } from './categories/leg';
import { shoulderExercises } from './categories/shoulder';
import { tricepsExercises } from './categories/triceps';
import { bicepsExercises } from './categories/biceps';
import { absExercises } from './categories/abs';
import { cardioExercises } from './categories/cardio';
import { forearmExercises } from './categories/forearm';
import { stretchingExercises } from './categories/stretching';
import { warmupExercises } from './categories/warmup';

// Built-in exercises
const builtInData = {
  chest: chestExercises,
  back: backExercises,
  legs: legExercises,
  shoulders: shoulderExercises,
  triceps: tricepsExercises,
  biceps: bicepsExercises,
  abs: absExercises,
  cardio: cardioExercises,
  forearms: forearmExercises,
  stretching: stretchingExercises,
  warmup: warmupExercises
};

// Merge custom exercises from localStorage with built-in data
function getCustomExercises() {
  try {
    const raw = localStorage.getItem('gym_custom_exercises');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// workoutData dynamically merges built-in + custom exercises
export function getWorkoutData() {
  const custom = getCustomExercises();
  const merged = { ...builtInData };

  Object.keys(custom).forEach(category => {
    if (merged[category]) {
      // Append custom exercises, avoiding duplicates by ID
      const existingIds = new Set(merged[category].map(e => e.id));
      const newExercises = custom[category].filter(e => !existingIds.has(e.id));
      merged[category] = [...merged[category], ...newExercises];
    } else {
      merged[category] = custom[category];
    }
  });

  return merged;
}

// Static reference (for backward compatibility) — re-reads each time
export const workoutData = new Proxy(builtInData, {
  get(target, prop) {
    const custom = getCustomExercises();
    const builtIn = target[prop] || [];
    const customCat = custom[prop] || [];
    
    if (typeof prop === 'symbol' || prop === 'toJSON') return target[prop];
    
    if (customCat.length > 0) {
      const existingIds = new Set(builtIn.map(e => e.id));
      const newExercises = customCat.filter(e => !existingIds.has(e.id));
      return [...builtIn, ...newExercises];
    }
    return builtIn;
  },
  ownKeys(target) {
    const custom = getCustomExercises();
    return [...new Set([...Object.keys(target), ...Object.keys(custom)])];
  },
  getOwnPropertyDescriptor(target, prop) {
    return { configurable: true, enumerable: true, value: this.get(target, prop) };
  }
});
