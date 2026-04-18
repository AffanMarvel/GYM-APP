const fs = require('fs');
const path = require('path');
const https = require('https');

const datasetUrl = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/data/exercises.json';
const categoriesDir = path.join(__dirname, 'src', 'data', 'categories');
const placeholderUrl = 'https://placehold.co/600x400/101014/9d4edd?text=Demonstration+Not+Available';
const baseUrl = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/';

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
    fs.readdir(categoriesDir, (err, files) => {
        if (err) {
            return console.error('Unable to scan directory: ' + err);
        }
        
        files.forEach((file) => {
            if (!file.endsWith('.js')) return;
            const filePath = path.join(categoriesDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let updatedContent = content;
            let changes = 0;

            // Simple regex to iteratively find exercises
            // This relies on the structure:
            // "name": "...",
            // ...
            // "image": "https://placehold.co/..."
            const blockRegex = /"name"\s*:\s*"([^"]+)"[\s\S]*?"image"\s*:\s*"https:\/\/placehold\.co[^"]+"/g;

            let match;
            while ((match = blockRegex.exec(content)) !== null) {
                const originalBlock = match[0];
                const exerciseName = match[1];
                
                const normName = normalizeName(exerciseName);
                
                // Find in dataset
                let foundExercise = exercisesData.find(ex => normalizeName(ex.name) === normName);
                
                // Try looser matching if exact fails
                if (!foundExercise) {
                    foundExercise = exercisesData.find(ex => {
                        const exName = normalizeName(ex.name);
                        return exName.includes(normName) || normName.includes(exName);
                    });
                }

                if (foundExercise && foundExercise.gif_url) {
                    const newImageUrl = `${baseUrl}${foundExercise.gif_url}`;
                    const replacedBlock = originalBlock.replace(placeholderUrl, newImageUrl);
                    updatedContent = updatedContent.replace(originalBlock, replacedBlock);
                    console.log(`[${file}] Fixed: ${exerciseName} -> ${newImageUrl}`);
                    changes++;
                } else {
                    console.log(`[${file}] Warning: Could not find GIF for '${exerciseName}'`);
                }
            }

            if (changes > 0) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Updated ${file} with ${changes} new GIFs.`);
            }
        });
        
        console.log("Finished processing all categories.");
    });
}
