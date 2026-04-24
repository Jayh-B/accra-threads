import fs from 'fs';
import path from 'path';

function main() {
  const imagesRaw = fs.readFileSync(path.join(process.cwd(), 'image-mappings.json'), 'utf-8');
  const mappings = JSON.parse(imagesRaw);
  
  const sourceDir = path.join(process.cwd(), 'Product Images');
  const destDir = path.join(process.cwd(), 'public', 'products');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  let successCount = 0;
  let missingCount = 0;

  for (const mapping of mappings) {
    const srcFile = path.join(sourceDir, mapping.filename);
    // Force extension to .jpg for simplicity as they are all JPG
    const destFile = path.join(destDir, `${mapping.slug}.jpg`);
    
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      successCount++;
    } else {
      console.warn(`Missing source image: ${mapping.filename}`);
      missingCount++;
    }
  }

  console.log(`Successfully copied ${successCount} formatted images. (${missingCount} missing)`);
}

main();
