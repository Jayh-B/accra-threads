import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify'; // npm i slugify

const supabaseUrl = 'https://jmdqojuxsixtxbavmrwq.supabase.co';
const supabaseServiceKey = 'sb_secret__9rvhj0Wy-T31-ip_jW1ZQ_cvztNzsY';  // Service role for uploads
const bucket = 'products';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface ImageMap {
  filename: string;
  slug: string;
  url: string;
}

// Simple slug map from known products (expand from seed.sql)
const slugMap: Record<string, string> = {
  'Accra HEAT Oversized Hoodie.jpg': 'accra-heat-oversized-hoodie',
  'Accra Slide (Women\'s).jpg': 'accra-slide-womens',
  'Accra Streets Duffel Bag.jpg': 'accra-streets-duffel-bag',
  // Add all 39 mappings here (from Product Images/ names → kebab-case slugs)
  // Full list generated below
};

const generateSlugMap = (filename: string): string => {
  return filename.toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const uploadProductImages = async () => {
  const imagesFolder = path.join(process.cwd(), 'Product Images');
  const files = await fs.readdir(imagesFolder);
  
  const mappings: ImageMap[] = [];

  for (const filename of files) {
    const filePath = path.join(imagesFolder, filename);
    const fileBuffer = await fs.readFile(filePath);
    const fileSize = Buffer.byteLength(fileBuffer);
    
    const slug = slugMap[filename] || generateSlugMap(filename.replace('.jpg', ''));
    const safeFilename = encodeURIComponent(filename);
    
    // Upload to products/{slug}/{filename}
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`${slug}/${safeFilename}`, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error(`❌ ${filename}:`, error.message);
    } else {
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(`${slug}/${safeFilename}`);
      
      mappings.push({ filename, slug, url: publicUrl });
      console.log(`✅ ${filename} → ${slug} → ${publicUrl}`);
    }
  }
  
  // Save mappings for seed update
  await fs.writeFile(
    path.join(process.cwd(), 'image-mappings.json'),
    JSON.stringify(mappings, null, 2)
  );
  console.log(`\n📄 Mappings saved to image-mappings.json (${mappings.length} images)`);
};

uploadProductImages().catch(console.error);

