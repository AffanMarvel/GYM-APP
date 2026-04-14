const fs = require('fs');
const path = require('path');

// Dataset path (using the one provided by the tool)
const datasetPath = 'C:/Users/dell/.gemini/antigravity/brain/3c625059-4599-4873-9bf0-ca7f9ac3a859/.system_generated/steps/43/content.md';
const categoriesDir = path.join(__dirname, 'src', 'data', 'categories');

console.log('Reading dataset...');
let content = fs.readFileSync(datasetPath, 'utf8');
// Extract JSON part (after "---")
const jsonStart = content.indexOf('[');
const allExercises = JSON.parse(content.substring(jsonStart));

console.log(`Loaded ${allExercises.length} exercises.`);

const categoryMapping = {
  'abs': ['abs', 'obliques'],
  'back': ['lats', 'traps', 'upper back', 'lower back', 'spine'],
  'biceps': ['biceps'],
  'cardio': ['cardiovascular system'],
  'chest': ['pectorals'],
  'forearm': ['forearms'],
  'leg': ['quads', 'hamstrings', 'calves', 'glutes', 'adductors', 'abductors'],
  'shoulder': ['delts'],
  'triceps': ['triceps']
};

function generateMetadata(ex, appCategory) {
  const muscleTarget = ex.target.charAt(0).toUpperCase() + ex.target.slice(1);
  return {
    id: ex.id + '-' + ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: ex.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    muscle: appCategory,
    muscleTarget: muscleTarget,
    difficulty: 'intermediate',
    levels: {
      beginner: { sets: 3, reps: '10-12', focus: 'Form' },
      intermediate: { sets: 4, reps: '8-10', focus: 'Hypertrophy' },
      advanced: { sets: 5, reps: '6-8', focus: 'Strength' }
    },
    tutorialUrl: `https://www.youtube.com/results?search_query=how+to+${ex.name.replace(/\s+/g, '+')}`,
    instructions: ex.instruction_steps.en || [ex.instructions.en],
    tips: [
      "Maintain proper form throughout the movement.",
      "Control the eccentric (lowering) phase.",
      "Focus on the mind-muscle connection."
    ],
    image: `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${ex.gif_url}`
  };
}

const report = {};

Object.keys(categoryMapping).forEach(cat => {
  const filePath = path.join(categoriesDir, cat + '.js');
  if (!fs.existsSync(filePath)) return;

  console.log(`Processing ${cat}...`);
  let fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Find current exercises to avoid duplicates
  const existingIds = new Set();
  const idMatches = fileContent.match(/"id":\s*"([^"]+)"/g);
  if (idMatches) {
    idMatches.forEach(m => existingIds.add(m.match(/"([^"]+)"$/)[1]));
  }

  // Filter exercises for this category
  const candidates = allExercises.filter(ex => 
    categoryMapping[cat].includes(ex.target) && 
    !existingIds.has(ex.id) &&
    !ex.name.toLowerCase().includes('stretch')
  );

  // Take 12 fresh ones
  const newExercises = candidates.slice(0, 12).map(ex => generateMetadata(ex, cat));
  
  if (newExercises.length > 0) {
    // We need to inject them into the exported array
    // Assuming format: export const varName = [...];
    const exportMatch = fileContent.match(/export const \w+ = \[/);
    if (exportMatch) {
      const insertPoint = fileContent.lastIndexOf('];');
      if (insertPoint === -1) {
          // Fallback if ]; is missing at end
          const lastBracket = fileContent.lastIndexOf(']');
          const newData = ',\n' + newExercises.map(ex => JSON.stringify(ex, null, 2)).join(',\n') + '\n];';
          fileContent = fileContent.slice(0, lastBracket) + newData;
      } else {
          const newData = ',\n' + newExercises.map(ex => JSON.stringify(ex, null, 2)).join(',\n') + '\n';
          fileContent = fileContent.slice(0, insertPoint) + newData + '];';
      }
      fs.writeFileSync(filePath, fileContent);
      report[cat] = newExercises.length;
    }
  }
});

// Special handling for stretching and warmup if possible
// For now, let's just do the main ones.

console.log('EXPANSION REPORT:');
console.log(JSON.stringify(report, null, 2));
