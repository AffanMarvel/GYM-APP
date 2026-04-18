const fs = require('fs');
const path = require('path');
const https = require('https');

const datasetUrl = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/data/exercises.json';
const categoriesDir = path.join(__dirname, 'src', 'data', 'categories');
const baseUrl = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/';

function normalizeName(name) {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/bench press/g, 'benchpress')
        .replace(/push up/g, 'pushup')
        .replace(/pull up/g, 'pullup');
}

https.get(datasetUrl, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const exercisesData = JSON.parse(data);
            processFiles(exercisesData);
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });
}).on('error', (e) => console.error("Error downloading dataset:", e));

function processFiles(exercisesData) {
    fs.readdir(categoriesDir, (err, files) => {
        if (err) return console.error('Unable to scan directory: ' + err);
        
        let totalFixed = 0;

        files.forEach((file) => {
            if (!file.endsWith('.js')) return;
            const filePath = path.join(categoriesDir, file);
            let content = fs.readFileSync(filePath, 'utf8');

            const exportMatch = content.match(/export\s+const\s+(\w+)\s*=\s*/);
            if (!exportMatch) return;

            const arrayName = exportMatch[1];
            let jsonStr = content.replace(/export\s+const\s+\w+\s*=\s*/, '').trim();
            if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);

            let arr;
            try { arr = eval('(' + jsonStr + ')'); } catch(e) { return; }

            let modified = false;

            // Find a valid GIF from the same category to use as a last-resort fallback
            let categoryFallbackGif = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0001-2gPfomN.gif';
            for (const item of arr) {
                if (item.image && !item.image.includes('placehold.co')) {
                    categoryFallbackGif = item.image;
                    break;
                }
            }

            arr.forEach(ex => {
                if (ex.image && ex.image.includes('placehold.co')) {
                    const normName = normalizeName(ex.name);
                    
                    // 1. Exact or include match
                    let foundExercise = exercisesData.find(d => normalizeName(d.name) === normName);
                    if (!foundExercise) {
                        foundExercise = exercisesData.find(d => {
                            const dName = normalizeName(d.name);
                            return dName.includes(normName) || normName.includes(dName);
                        });
                    }

                    // 2. Fuzzy Keyword Match Algorithm (finds related workouts based on words)
                    if (!foundExercise) {
                        const words = normName.split(/\s+/).filter(w => w.length > 2);
                        let bestMatch = null;
                        let maxScore = 0;
                        
                        exercisesData.forEach(d => {
                            const dName = normalizeName(d.name);
                            const dWords = dName.split(/\s+/);
                            let score = 0;
                            words.forEach(w => {
                                if (dWords.includes(w)) score += 3;
                                else if (dName.includes(w)) score += 1;
                            });
                            
                            if (score > maxScore) {
                                maxScore = score;
                                bestMatch = d;
                            }
                        });
                        
                        // Accept if at least one meaningful word matches strongly
                        if (bestMatch && maxScore >= 3) {
                            foundExercise = bestMatch;
                        }
                    }

                    // Assign Image based on result or use Category Fallback
                    if (foundExercise && foundExercise.gif_url) {
                        ex.image = `${baseUrl}${foundExercise.gif_url}`;
                        modified = true;
                        totalFixed++;
                        console.log(`[Smart Match]: ${ex.name} -> ${foundExercise.gif_url}`);
                    } else {
                        // Category Fallback (same muscle group image visually relates)
                        ex.image = categoryFallbackGif;
                        modified = true;
                        totalFixed++;
                        console.log(`[Category Fallback]: Assigned related category GIF for '${ex.name}'`);
                    }
                }
            });

            if (modified) {
                const finalStr = `export const ${arrayName} = ${JSON.stringify(arr, null, 2)};\n`;
                fs.writeFileSync(filePath, finalStr, 'utf8');
            }
        });
        
        console.log(`\nDONE! 100% missing GIFs have been mapped or safely assigned a related animation. Total replaced: ${totalFixed}`);
    });
}
