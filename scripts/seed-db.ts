import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const supabaseUrl = 'https://jmdqojuxsixtxbavmrwq.supabase.co';
const supabaseServiceKey = 'sb_secret__9rvhj0Wy-T31-ip_jW1ZQ_cvztNzsY'; // use anon key or service role

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('Missing env variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const imagesRaw = fs.readFileSync(path.join(process.cwd(), 'image-mappings.json'), 'utf-8');
  const images = JSON.parse(imagesRaw);

  const products = [
    { name: "Accra HEAT Oversized Hoodie", slug: "accra-heat-oversized-hoodie", sku: "AT-ACC-001", category: "hoodies", gender: "unisex", price: 65000, description: "Oversized heavyweight hoodie with embroidered Accra HEAT logo", tags: ["new", "streetwear"], featured: true, published: true },
    { name: "Accra Slide (Women's)", slug: "accra-slide-womens", sku: "AT-ACC-002", category: "footwear", gender: "women", price: 25000, description: "Comfortable slide sandal with signature branding", tags: ["accessories"], featured: false, published: true },
    { name: "Accra Streets Duffel Bag", slug: "accra-streets-duffel-bag", sku: "AT-ACC-003", category: "bags", gender: "unisex", price: 85000, description: "Spacious duffel bag perfect for travel and gym", tags: ["new"], featured: false, published: true },
    { name: "Accra Threads Beanie", slug: "accra-threads-beanie", sku: "AT-ACC-004", category: "hats", gender: "unisex", price: 15000, description: "Classic knit beanie with embroidered logo", tags: ["accessories"], featured: false, published: true },
    { name: "Accra Threads Branded Water Bottle", slug: "accra-threads-branded-water-bottle", sku: "AT-ACC-005", category: "accessories", gender: "unisex", price: 45000, description: "Stainless steel double-wall water bottle, 500ml", tags: ["new", "eco-friendly"], featured: false, published: true },
    { name: "Accra Threads Gift Box", slug: "accra-threads-gift-box", sku: "AT-ACC-006", category: "gifts", gender: "unisex", price: 150000, description: "Premium gift box set with curated items", tags: ["gift"], featured: false, published: true },
    { name: "Adinkra Pendant Necklace", slug: "adinkra-pendant-necklace", sku: "AT-ACC-007", category: "jewelry", gender: "unisex", price: 55000, description: "Handcrafted necklace with Adinkra symbol pendant", tags: ["jewelry", "heritage"], featured: true, published: true },
    { name: "Ankara Mini Skirt", slug: "ankara-mini-skirt", sku: "AT-ACC-008", category: "skirts", gender: "women", price: 45000, description: "Vibrant Ankara print mini skirt with hidden pockets", tags: ["women", "new"], featured: false, published: true },
    { name: "Ankara Print Backpack", slug: "ankara-print-backpack", sku: "AT-ACC-009", category: "bags", gender: "unisex", price: 65000, description: "Durable backpack with authentic Ankara fabric", tags: ["bags", "sustainable"], featured: false, published: true },
    { name: "Black Stars Gym Bag", slug: "black-stars-gym-bag", sku: "AT-ACC-010", category: "bags", gender: "unisex", price: 55000, description: "Sports gym bag with Black Stars print", tags: ["sports"], featured: false, published: true },
    { name: "Boubou Dress (Modern)", slug: "boubou-dress-modern", sku: "AT-ACC-011", category: "dresses", gender: "women", price: 125000, description: "Contemporary take on the classic Boubou", tags: ["women", "heritage", "new"], featured: true, published: true },
    { name: "Cowrie Shell Necklace (Gold)", slug: "cowrie-shell-necklace-gold", sku: "AT-ACC-012", category: "jewelry", gender: "women", price: 75000, description: "Gold-plated cowrie shell statement necklace", tags: ["jewelry", "luxury"], featured: false, published: true },
    { name: "Crochet Beach Sandal", slug: "crochet-beach-sandal", sku: "AT-ACC-013", category: "footwear", gender: "women", price: 35000, description: "Hand-crocheted beach sandal for summer vibes", tags: ["footwear", "handmade"], featured: false, published: true },
    { name: "Dad Hat (Embroidered)", slug: "dad-hat-embroidered", sku: "AT-ACC-014", category: "hats", gender: "unisex", price: 25000, description: "Classic dad hat with embroidered Accra logo", tags: ["hats"], featured: false, published: true },
    { name: "Gold Cuff Bracelet", slug: "gold-cuff-bracelet", sku: "AT-ACC-015", category: "jewelry", gender: "women", price: 85000, description: "Statement gold cuff bracelet with geometric design", tags: ["jewelry", "luxury"], featured: false, published: true },
    { name: "Hoop Earrings", slug: "hoop-earrings", sku: "AT-ACC-016", category: "jewelry", gender: "women", price: 35000, description: "Classic gold-plated hoop earrings", tags: ["jewelry", "accessories"], featured: false, published: true },
    { name: "Kente Bead Bracelet Set", slug: "kente-bead-bracelet-set", sku: "AT-ACC-017", category: "jewelry", gender: "unisex", price: 45000, description: "Set of colorful kente-inspired beaded bracelets", tags: ["jewelry", "heritage", "new"], featured: true, published: true },
    { name: "Kente Denim Maxi Skirt", slug: "kente-denim-maxi-skirt", sku: "AT-ACC-018", category: "skirts", gender: "women", price: 95000, description: "Statement maxi skirt blending kente and denim", tags: ["women", "new"], featured: false, published: true },
    { name: "Kente Fanny Pack Belt Bag", slug: "kente-fanny-pack-belt-bag", sku: "AT-ACC-019", category: "bags", gender: "unisex", price: 55000, description: "Hands-free kente belt bag perfect for festivals", tags: ["bags", "festival"], featured: false, published: true },
    { name: "Kente Fila (Kufi Cap)", slug: "kente-fila-kufi-cap", sku: "AT-ACC-020", category: "hats", gender: "men", price: 35000, description: "Traditional kente Fila cap for special occasions", tags: ["hats", "heritage"], featured: false, published: true },
    { name: "Kente Kimono Jacket", slug: "kente-kimono-jacket", sku: "AT-ACC-021", category: "jackets", gender: "unisex", price: 145000, description: "Luxe kente kimono jacket with satin lining", tags: ["jackets", "new", "luxury"], featured: true, published: true },
    { name: "Kente Mini Crossbody", slug: "kente-mini-crossbody", sku: "AT-ACC-022", category: "bags", gender: "unisex", price: 45000, description: "Compact crossbody bag with kente fabric", tags: ["bags", "accessories"], featured: false, published: true },
    { name: "Kente Tote Bag (Large)", slug: "kente-tote-bag-large", sku: "AT-ACC-023", category: "bags", gender: "unisex", price: 85000, description: "Spacious kente tote perfect for market shopping", tags: ["bags", "sustainable"], featured: false, published: true },
    { name: "Kente Watch Strap", slug: "kente-watch-strap", sku: "AT-ACC-024", category: "accessories", gender: "unisex", price: 25000, description: "Kente fabric watch strap, one size fits most", tags: ["accessories"], featured: false, published: true },
    { name: "Market Tote (Small)", slug: "market-tote-small", sku: "AT-ACC-025", category: "bags", gender: "unisex", price: 35000, description: "Compact market tote for everyday essentials", tags: ["bags"], featured: false, published: true },
    { name: "Signet Ring (Akan Gold)", slug: "signet-ring-akan-gold", sku: "AT-ACC-026", category: "jewelry", gender: "men", price: 95000, description: "Handcrafted gold signet ring with Akan symbols", tags: ["jewelry", "luxury", "heritage"], featured: false, published: true },
    { name: "Snapback Cap", slug: "snapback-cap", sku: "AT-ACC-027", category: "hats", gender: "unisex", price: 28000, description: "Classic snapback cap with embroidered branding", tags: ["hats"], featured: false, published: true },
    { name: "Soft Knit Beret", slug: "soft-knit-beret", sku: "AT-ACC-028", category: "hats", gender: "women", price: 32000, description: "Cozy knit beret in neutral tones", tags: ["hats", "accessories"], featured: false, published: true },
    { name: "Strappy Kente Heels", slug: "strappy-kente-heels", sku: "AT-ACC-029", category: "footwear", gender: "women", price: 125000, description: "Bold strappy heels with kente print upper", tags: ["footwear", "luxury", "new"], featured: false, published: true },
    { name: "Streetwear Sweat Shorts", slug: "streetwear-sweat-shorts", sku: "AT-ACC-030", category: "shorts", gender: "unisex", price: 45000, description: "Comfortable sweat shorts with side pockets", tags: ["streetwear"], featured: false, published: true },
    { name: "Sunglasses (Accra Edit)", slug: "sunglasses-accra-edit", sku: "AT-ACC-031", category: "accessories", gender: "unisex", price: 65000, description: "Stylish sunglasses with signature Accra branding", tags: ["accessories", "new"], featured: false, published: true },
    { name: "Wide-Brim Sun Hat", slug: "wide-brim-sun-hat", sku: "AT-ACC-032", category: "hats", gender: "women", price: 35000, description: "Protective wide-brim sun hat in linen", tags: ["hats", "accessories"], featured: false, published: true },
    { name: "Wide-Leg Palazzo (Women's)", slug: "wide-leg-palazzo-womens", sku: "AT-ACC-033", category: "pants", gender: "women", price: 75000, description: "Flowy wide-leg palazzo pants for hot weather", tags: ["women", "new"], featured: false, published: true }
  ];

  const toInsert = products.map(p => {
    return {
      ...p,
      images: [`/products/${p.slug}.jpg`]
    };
  });

  // 1. Get all existing orders to delete because of foreign key constraints (assuming we just reset local test env)
  console.log('Clearing existing product/order data...');
  const { error: err1 } = await supabase.from('order_items').delete().gte('id', 0);
  const { error: err2 } = await supabase.from('orders').delete().neq('id', 'INVALID');
  const { error: err3 } = await supabase.from('products').delete().neq('slug', 'INVALID');

  if (err3) console.error('Error clearing products:', err3);

  // 2. Insert new products
  console.log('Inserting', toInsert.length, 'products...');
  const { data, error } = await supabase.from('products').insert(toInsert);

  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Seed completed successfully!');
  }
}

main();
