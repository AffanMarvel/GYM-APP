import { workoutData } from '../data/exercises';

/**
 * Replaced external API Ninjas dependency with local Notion-extracted data.
 * @param {string} muscle 
 * @returns {Array} List of exercises for the given muscle group
 */
export const getExercisesByMuscle = async (muscle) => {
  try {
    const muscleKey = muscle.toLowerCase();
    
    // Check if we have local data for this muscle group
    if (workoutData[muscleKey]) {
      return workoutData[muscleKey];
    }
    
    console.warn(`No local data found for muscle: ${muscle}. Returning empty list.`);
    return [];
  } catch (error) {
    console.error("Error fetching local exercises:", error);
    return [];
  }
};

export const getExerciseById = async (id) => {
  try {
    // Search across all muscle groups
    for (const muscle in workoutData) {
      const found = workoutData[muscle].find(ex => (ex.id === id || ex.name.toLowerCase().replace(/ /g, '-') === id));
      if (found) return found;
    }
    return null;
  } catch (error) {
    console.error("Error finding exercise by id:", error);
    return null;
  }
};

export const API_KEY = '';
const exerciseApi = null;
