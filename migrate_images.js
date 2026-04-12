const fs = require('fs');
const path = require('path');

const baseNotionPath = 'g:/Projects/gym_tracker V-2/Notion_GYM_File';
const targetPath = 'g:/Projects/gym_tracker V-2/public/assets/exercises';

if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath, { recursive: true });
}

const mapping = [
  { folder: 'Main_Course/Chest', prefix: 'chest_image' },
  { folder: 'Main_Course/Back', prefix: 'back_image' },
  { folder: 'Main_Course/Leg', prefix: 'leg_image' },
  { folder: 'Main_Course/Shoulder', prefix: 'shoulder_image' },
  { folder: 'Main_Course/Triceps', prefix: 'triceps_image' },
  { folder: 'Main_Course/Byshape', prefix: 'biceps_image' },
  { folder: 'Side_Course/Abs', prefix: 'abs_image' },
  { folder: 'Side_Course/Cardio', prefix: 'cardio_image' },
  { folder: 'Side_Course/Forearm', prefix: 'forearm_image' },
  { folder: 'Side_Course/Stanching', prefix: 'stretching_image' },
  { folder: 'Side_Course/Warm Up', prefix: 'warmup_image' },
];

mapping.forEach(m => {
  const srcDir = path.join(baseNotionPath, m.folder);
  if (!fs.existsSync(srcDir)) {
    console.log(`Source dir not found: ${srcDir}`);
    return;
  }

  const files = fs.readdirSync(srcDir);
  const images = files.filter(f => f.endsWith('.png')).sort((a, b) => {
    // Sort image.png, image 1.png, image 2.png ...
    if (a === 'image.png') return -1;
    if (b === 'image.png') return 1;
    const aNum = parseInt(a.match(/image (\d+)\.png/)?.[1] || 0);
    const bNum = parseInt(b.match(/image (\d+)\.png/)?.[1] || 0);
    return aNum - bNum;
  });

  images.forEach((img, index) => {
    const srcFile = path.join(srcDir, img);
    const destName = index === 0 ? `${m.prefix}.png` : `${m.prefix}_${index}.png`;
    const destFile = path.join(targetPath, destName);
    
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied: ${img} -> ${destName}`);
  });
});
