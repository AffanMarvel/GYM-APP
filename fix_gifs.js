const fs = require('fs');
const path = require('path');
const https = require('https');

const datasetUrl = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/data/exercises.json';
const categoriesDir = path.join(__dirname, 'src', 'data', 'categories');
const baseUrl = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/';

// Safely normalize names to help fuzzy match
function normalizeName(name) {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/bench press/g, 'benchpress')
        .replace(/push up/g, 'pushup')
        .replace(/pull up/g, 'pullup');
}

https.get(datasetUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            console.log("Downloaded dataset successfully.");
            const exercisesData = JSON.parse(data);
            processFiles(exercisesData);
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });
}).on('error', (e) => {
    console.error("Error downloading dataset:", e);
});

function processFiles(exercisesData) {
    // Read all js files
    fs.readdir(categoriesDir, (err, files) => {
        if (err) return console.error('Unable to scan directory: ' + err);
        
        let totalFixed = 0;

        files.forEach((file) => {
            if (!file.endsWith('.js')) return;
            const filePath = path.join(categoriesDir, file);
            let content = fs.readFileSync(filePath, 'utf8');

            // Find the array name (e.g. export const chestExercises = ...)
            const exportMatch = content.match(/export\s+const\s+(\w+)\s*=\s*/);
            if (!exportMatch) return;

            const arrayName = exportMatch[1];

            // Extract the actual array literal
            let jsonStr = content.replace(/export\s+const\s+\w+\s*=\s*/, '');
            // Strip trailing semi-colon
            jsonStr = jsonStr.trim();
            if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);

            let arr;
            try {
                // Using eval because the objects might have JS-specific trailing commas
                arr = eval('(' + jsonStr + ')');
            } catch(e) {
                console.error(`Skipping ${file}: couldn't parse array.`);
                return;
            }

            let modified = false;

            arr.forEach(ex => {
                if (ex.image && ex.image.includes('placehold.co')) {
                    const normName = normalizeName(ex.name);
                    
                    // Priority 1: Exact match on normalized name
                    let foundExercise = exercisesData.find(d => normalizeName(d.name) === normName);
                    
                    // Priority 2: Contains Match
                    if (!foundExercise) {
                        foundExercise = exercisesData.find(d => {
                            const dName = normalizeName(d.name);
                            return dName.includes(normName) || normName.includes(dName);
                        });
                    }

                    if (foundExercise && foundExercise.gif_url) {
                        ex.image = `${baseUrl}${foundExercise.gif_url}`;
                        modified = true;
                        totalFixed++;
                        console.log(`[Fixed]: ${ex.name} -> ${foundExercise.gif_url}`);
                    } else {
                        console.log(`[Not Found]: Could not find a dataset match for '${ex.name}'`);
                    }
                }
            });

            if (modified) {
                // Reconstruct the file contents
                const finalStr = `export const ${arrayName} = ${JSON.stringify(arr, null, 2)};\n`;
                fs.writeFileSync(filePath, finalStr, 'utf8');
            }
        });
        
        console.log(`\nDONE! Replaced ${totalFixed} missing GIFs.`);
    });
}
