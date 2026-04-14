const fs = require('fs');
const path = require('path');

// Target paths
const dbPath = 'C:/Users/dell/.gemini/antigravity/brain/4b0c85a3-7343-4fbd-bed9-02fa289cbeb7/.system_generated/steps/39/content.md';
const categoriesDir = path.join(__dirname, 'src', 'data', 'categories');

console.log('Loading exercise database...');
const content = fs.readFileSync(dbPath, 'utf8');
const jsonStr = content.substring(content.indexOf('['));
const exercisesDB = JSON.parse(jsonStr);

console.log(`Loaded ${exercisesDB.length} exercises from dataset.`);

function findMatch(localName, category) {
  let cleanName = localName.toLowerCase().replace(/[\(\)-]/g, ' ').replace(/\s+/g, ' ').trim();
  let words = cleanName.split(' ').filter(w => w);

  // Special aliases to force reliable matching
  if (cleanName.includes('push up')) return exercisesDB.find(e => e.name === 'push-up');
  if (cleanName.includes('pull up')) return exercisesDB.find(e => e.name === 'pull up');
  if (cleanName.includes('chest dip')) return exercisesDB.find(e => e.name === 'chest dip');
  if (cleanName.includes('lat pulldown') || cleanName.includes('lat pull-down')) return exercisesDB.find(e => e.name === 'cable lat pulldown full range of motion');
  if (cleanName.includes('bicep curl')) return exercisesDB.find(e => e.name === 'dumbbell bicep curl');
  if (cleanName.includes('triceps dip')) return exercisesDB.find(e => e.name === 'triceps dip');
  if (cleanName.includes('barbell squat')) return exercisesDB.find(e => e.name === 'barbell squat');
  if (cleanName.includes('cable crossover')) return exercisesDB.find(e => e.name === 'cable middle fly');
  if (cleanName.includes('pec deck')) return exercisesDB.find(e => e.name === 'pec deck fly');

  let bestMatch = null;
  let bestScore = 0;

  for (let dbEx of exercisesDB) {
    let dbName = dbEx.name.toLowerCase();
    
    if (dbName === cleanName) return dbEx;

    let dbWords = dbName.split(/[\s-]+/).filter(w => w);
    
    let score = 0;
    for (let w of words) {
      if (dbWords.includes(w)) score += 2;
      else if (dbName.includes(w)) score += 1;
    }
    
    // Penalize size difference
    score -= (Math.abs(dbWords.length - words.length) * 0.5);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = dbEx;
    }
  }

  if (bestScore > 0) return bestMatch;
  return null;
}

const files = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(categoriesDir, file);
  console.log(`Processing ${file}...`);
  
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const varMatch = fileContent.match(/export const (\w+) =/);
  if (!varMatch) return;
  const varName = varMatch[1];
  
  const arrStr = fileContent.substring(fileContent.indexOf('['));
  let array;
  try {
    array = eval('(' + arrStr.replace(/;?\s*$/, '') + ')');
  } catch (e) {
    console.error(`Failed to parse array in ${file}`, e);
    return;
  }

  let updatedCount = 0;
  for (let ex of array) {
    let match = findMatch(ex.name, file.replace('.js', ''));
    if (match) {
      ex.image = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/" + match.gif_url;
      ex.instructions = match.instruction_steps.en;
      updatedCount++;
    } else {
      console.log(`  No solid match found for: ${ex.name}`);
    }
  }

  const updatedFileContent = `export const ${varName} = ${JSON.stringify(array, null, 2)};\n`;
  fs.writeFileSync(filePath, updatedFileContent, 'utf8');
  console.log(`Updated ${updatedCount} exercises in ${file}.`);
});

console.log('Update completed successfully!');
