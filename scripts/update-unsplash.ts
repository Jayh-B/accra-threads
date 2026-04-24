import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmdqojuxsixtxbavmrwq.supabase.co';
const supabaseServiceKey = 'sb_secret__9rvhj0Wy-T31-ip_jW1ZQ_cvztNzsY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const unsplashMap: Record<string, string[]> = {
  hoodies: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop'],
  footwear: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop'],
  bags: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'],
  dresses: ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop'],
  jewelry: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop'],
  hats: ['https://images.unsplash.com/photo-1521369909029-2afed882ba54?q=80&w=800&auto=format&fit=crop'],
  skirts: ['https://images.unsplash.com/photo-1582142407894-ec85a1260a46?q=80&w=800&auto=format&fit=crop'],
  jackets: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop'],
  pants: ['https://images.unsplash.com/photo-1594938298596-afdf15bd06ee?q=80&w=800&auto=format&fit=crop'],
  shorts: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop'],
  accessories: ['https://images.unsplash.com/photo-1611082531317-09d5921869e8?q=80&w=800&auto=format&fit=crop'],
  gifts: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop']
};

const defaultFallback = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop';

async function updateImages() {
  console.log('Fetching products...');
  const { data: products, error } = await supabase.from('products').select('id, category');
  
  if (error || !products) {
    console.error('Failed to fetch:', error);
    return;
  }

  console.log(`Found ${products.length} products. Updating with Unsplash images...`);

  for (const p of products) {
    const urls = unsplashMap[p.category] || [defaultFallback];
    await supabase.from('products').update({ images: urls }).eq('id', p.id);
  }

  console.log('Successfully updated all product images to Unsplash!');
}

updateImages();
