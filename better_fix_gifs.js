const fs = require('fs');
const path = require('path');
const https = require('https');

const categoriesDir = path.join(__dirname, 'src', 'data', 'categories');
const PLACEHOLDER_URL = "https://placehold.co/600x400/101014/9d4edd?text=Demonstration+Not+Available";

async function getAvailableVideos() {
  return new Promise((resolve, reject) => {
    https.get('https://api.github.com/repos/hasaneyldrm/exercises-dataset/contents/videos', {
      headers: { 'User-Agent': 'node.js' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const files = JSON.parse(data);
          if (Array.isArray(files)) {
            const validNames = new Set(files.map(f => f.name));
            resolve(validNames);
          } else {
            reject('Invalid API response');
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', err => reject(err));
  });
}

async function fixGifsSmartly() {
  try {
    console.log('Fetching available GIFs from GitHub...');
    const validNames = await getAvailableVideos();
    console.log(`Found ${validNames.size} valid GIFs in the repository.`);

    let files = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.js'));
    let totalFixed = 0;

    for (const file of files) {
      const filePath = path.join(categoriesDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      const imageRegex = /"image":\s*"https:\/\/raw\.githubusercontent\.com\/hasaneyldrm\/exercises-dataset\/master\/videos\/([^"]+)"/g;
      
      let modifiedContent = content;
      let fileFixedCount = 0;
      
      modifiedContent = content.replace(imageRegex, (fullMatch, filename) => {
        // If the GIF is missing from the database, use a safe neon placeholder text
        if (!validNames.has(filename)) {
          fileFixedCount++;
          totalFixed++;
          return `"image": "${PLACEHOLDER_URL}"`;
        }
        return fullMatch;
      });

      if (fileFixedCount > 0) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`Replaced ${fileFixedCount} broken GIFs with placeholders in ${file}.`);
      }
    }
    
    console.log(`\nDONE! Replaced ${totalFixed} missing GIFs with a safe placeholder.`);
  } catch (err) {
    console.error('Error:', err);
  }
}

fixGifsSmartly();
