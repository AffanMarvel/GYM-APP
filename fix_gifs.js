const fs = require('fs');
const path = require('path');
const https = require('https');

const categoriesDir = path.join(__dirname, 'src', 'data', 'categories');

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

async function fixGifs() {
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
      let match;
      let validFallback = null;

      // Find the first valid GIF in this file to use as a fallback
      while ((match = imageRegex.exec(content)) !== null) {
        if (validNames.has(match[1])) {
          validFallback = match[1];
          break;
        }
      }

      if (!validFallback) {
        validFallback = '0033-GrO65fd.gif'; // Universal fallback (flat bench press)
      }

      let modifiedContent = content;
      let fileFixedCount = 0;
      imageRegex.lastIndex = 0;

      modifiedContent = content.replace(/"image":\s*"https:\/\/raw\.githubusercontent\.com\/hasaneyldrm\/exercises-dataset\/master\/videos\/([^"]+)"/g, (fullMatch, filename) => {
        if (!validNames.has(filename)) {
          fileFixedCount++;
          totalFixed++;
          return `"image": "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/${validFallback}"`;
        }
        return fullMatch;
      });

      if (fileFixedCount > 0) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`Fixed ${fileFixedCount} broken GIFs in ${file}.`);
      }
    }
    
    console.log(`\nDONE! Total broken GIFs replaced: ${totalFixed}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

fixGifs();
