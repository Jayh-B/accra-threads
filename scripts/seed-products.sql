-- Seed Products Table with Mock Data + Supabase Image URLs
-- Run after images are uploaded to Supabase

INSERT INTO public.products (name, slug, sku, category, gender, price, sale_price, description, tags, featured, published) VALUES
('Accra HEAT Oversized Hoodie', 'accra-heat-oversized-hoodie', 'AT-ACC-001', 'hoodies', 'unisex', 65000, NULL, 'Oversized heavyweight hoodie with embroidered Accra HEAT logo', ARRAY['new', 'streetwear'], true, true),
('Accra Slide (Women\'s)', 'accra-slide-womens', 'AT-ACC-002', 'footwear', 'women', 25000, NULL, 'Comfortable slide sandal with signature branding', ARRAY['accessories'], false, true),
('Accra Streets Duffel Bag', 'accra-streets-duffel-bag', 'AT-ACC-003', 'bags', 'unisex', 85000, NULL, 'Spacious duffel bag perfect for travel and gym', ARRAY['new'], false, true),
('Accra Threads Beanie', 'accra-threads-beanie', 'AT-ACC-004', 'hats', 'unisex', 15000, NULL, 'Classic knit beanie with embroidered logo', ARRAY['accessories'], false, true),
('Accra Threads Branded Water Bottle', 'accra-threads-branded-water-bottle', 'AT-ACC-005', 'accessories', 'unisex', 45000, NULL, 'Stainless steel double-wall water bottle, 500ml', ARRAY['new', 'eco-friendly'], false, true),
('Accra Threads Gift Box', 'accra-threads-gift-box', 'AT-ACC-006', 'gifts', 'unisex', 150000, NULL, 'Premium gift box set with curated items', ARRAY['gift'], false, true),
('Adinkra Pendant Necklace', 'adinkra-pendant-necklace', 'AT-ACC-007', 'jewelry', 'unisex', 55000, NULL, 'Handcrafted necklace with Adinkra symbol pendant', ARRAY['jewelry', 'heritage'], true, true),
('Ankara Mini Skirt', 'ankara-mini-skirt', 'AT-ACC-008', 'skirts', 'women', 45000, NULL, 'Vibrant Ankara print mini skirt with hidden pockets', ARRAY['women', 'new'], false, true),
('Ankara Print Backpack', 'ankara-print-backpack', 'AT-ACC-009', 'bags', 'unisex', 65000, NULL, 'Durable backpack with authentic Ankara fabric', ARRAY['bags', 'sustainable'], false, true),
('Black Stars Gym Bag', 'black-stars-gym-bag', 'AT-ACC-010', 'bags', 'unisex', 55000, NULL, 'Sports gym bag with Black Stars print', ARRAY['sports'], false, true),
('Boubou Dress (Modern)', 'boubou-dress-modern', 'AT-ACC-011', 'dresses', 'women', 125000, NULL, 'Contemporary take on the classic Boubou', ARRAY['women', 'heritage', 'new'], true, true),
('Cowrie Shell Necklace (Gold)', 'cowrie-shell-necklace-gold', 'AT-ACC-012', 'jewelry', 'women', 75000, NULL, 'Gold-plated cowrie shell statement necklace', ARRAY['jewelry', 'luxury'], false, true),
('Crochet Beach Sandal', 'crochet-beach-sandal', 'AT-ACC-013', 'footwear', 'women', 35000, NULL, 'Hand-crocheted beach sandal for summer vibes', ARRAY['footwear', 'handmade'], false, true),
('Dad Hat (Embroidered)', 'dad-hat-embroidered', 'AT-ACC-014', 'hats', 'unisex', 25000, NULL, 'Classic dad hat with embroidered Accra logo', ARRAY['hats'], false, true),
('Gold Cuff Bracelet', 'gold-cuff-bracelet', 'AT-ACC-015', 'jewelry', 'women', 85000, NULL, 'Statement gold cuff bracelet with geometric design', ARRAY['jewelry', 'luxury'], false, true),
('Hoop Earrings', 'hoop-earrings', 'AT-ACC-016', 'jewelry', 'women', 35000, NULL, 'Classic gold-plated hoop earrings', ARRAY['jewelry', 'accessories'], false, true),
('Kente Bead Bracelet Set', 'kente-bead-bracelet-set', 'AT-ACC-017', 'jewelry', 'unisex', 45000, NULL, 'Set of colorful kente-inspired beaded bracelets', ARRAY['jewelry', 'heritage', 'new'], true, true),
('Kente Denim Maxi Skirt', 'kente-denim-maxi-skirt', 'AT-ACC-018', 'skirts', 'women', 95000, NULL, 'Statement maxi skirt blending kente and denim', ARRAY['women', 'new'], false, true),
('Kente Fanny Pack Belt Bag', 'kente-fanny-pack-belt-bag', 'AT-ACC-019', 'bags', 'unisex', 55000, NULL, 'Hands-free kente belt bag perfect for festivals', ARRAY['bags', 'festival'], false, true),
('Kente Fila (Kufi Cap)', 'kente-fila-kufi-cap', 'AT-ACC-020', 'hats', 'men', 35000, NULL, 'Traditional kente Fila cap for special occasions', ARRAY['hats', 'heritage'], false, true),
('Kente Kimono Jacket', 'kente-kimono-jacket', 'AT-ACC-021', 'jackets', 'unisex', 145000, NULL, 'Luxe kente kimono jacket with satin lining', ARRAY['jackets', 'new', 'luxury'], true, true),
('Kente Mini Crossbody', 'kente-mini-crossbody', 'AT-ACC-022', 'bags', 'unisex', 45000, NULL, 'Compact crossbody bag with kente fabric', ARRAY['bags', 'accessories'], false, true),
('Kente Tote Bag (Large)', 'kente-tote-bag-large', 'AT-ACC-023', 'bags', 'unisex', 85000, NULL, 'Spacious kente tote perfect for market shopping', ARRAY['bags', 'sustainable'], false, true),
('Kente Watch Strap', 'kente-watch-strap', 'AT-ACC-024', 'accessories', 'unisex', 25000, NULL, 'Kente fabric watch strap, one size fits most', ARRAY['accessories'], false, true),
('Market Tote (Small)', 'market-tote-small', 'AT-ACC-025', 'bags', 'unisex', 35000, NULL, 'Compact market tote for everyday essentials', ARRAY['bags'], false, true),
('Signet Ring (Akan Gold)', 'signet-ring-akan-gold', 'AT-ACC-026', 'jewelry', 'men', 95000, NULL, 'Handcrafted gold signet ring with Akan symbols', ARRAY['jewelry', 'luxury', 'heritage'], false, true),
('Snapback Cap', 'snapback-cap', 'AT-ACC-027', 'hats', 'unisex', 28000, NULL, 'Classic snapback cap with embroidered branding', ARRAY['hats'], false, true),
('Soft Knit Beret', 'soft-knit-beret', 'AT-ACC-028', 'hats', 'women', 32000, NULL, 'Cozy knit beret in neutral tones', ARRAY['hats', 'accessories'], false, true),
('Strappy Kente Heels', 'strappy-kente-heels', 'AT-ACC-029', 'footwear', 'women', 125000, NULL, 'Bold strappy heels with kente print upper', ARRAY['footwear', 'luxury', 'new'], false, true),
('Streetwear Sweat Shorts', 'streetwear-sweat-shorts', 'AT-ACC-030', 'shorts', 'unisex', 45000, NULL, 'Comfortable sweat shorts with side pockets', ARRAY['streetwear'], false, true),
('Sunglasses (Accra Edit)', 'sunglasses-accra-edit', 'AT-ACC-031', 'accessories', 'unisex', 65000, NULL, 'Stylish sunglasses with signature Accra branding', ARRAY['accessories', 'new'], false, true),
('Wide-Brim Sun Hat', 'wide-brim-sun-hat', 'AT-ACC-032', 'hats', 'women', 35000, NULL, 'Protective wide-brim sun hat in linen', ARRAY['hats', 'accessories'], false, true),
('Wide-Leg Palazzo (Women\'s)', 'wide-leg-palazzo-womens', 'AT-ACC-033', 'pants', 'women', 75000, NULL, 'Flowy wide-leg palazzo pants for hot weather', ARRAY['women', 'new'], false, true);

-- Seed data with Supabase image URLs (39 images uploaded)
-- Copy-paste this full block to Supabase SQL Editor → Run

INSERT INTO public.products (name, slug, sku, category, gender, price, sale_price, description, tags, featured, published, images) VALUES
('Accra HEAT Oversized Hoodie', 'accra-heat-oversized-hoodie', 'AT-ACC-001', 'hoodies', 'unisex', 65000, NULL, 'Oversized heavyweight hoodie with embroidered Accra HEAT logo', ARRAY['new', 'streetwear'], true, true, ARRAY['https://jmdqojuxsixtxbavmrwq.supabase.co/storage/v1/object/public/products/accra-heat-oversized-hoodie/Accra%20HEAT%20Oversized%20Hoodie.jpg']),
('Accra Slide (Women''s)', 'accra-slide-womens', 'AT-ACC-002', 'footwear', 'women', 25000, NULL, 'Comfortable slide sandal with signature branding', ARRAY['accessories'], false, true, ARRAY['https://jmdqojuxsixtxbavmrwq.supabase.co/storage/v1/object/public/products/accra-slide-womens/Accra%20Slide%20(Women''s).jpg']),
('Accra Streets Duffel Bag', 'accra-streets-duffel-bag', 'AT-ACC-003', 'bags', 'unisex', 85000, NULL, 'Spacious duffel bag perfect for travel and gym', ARRAY['new'], false, true, ARRAY['https://jmdqojuxsixtxbavmrwq.supabase.co/storage/v1/object/public/products/accra-streets-duffel-bag/Accra%20Streets%20Duffel%20Bag.jpg']),
('Accra Threads Beanie', 'accra-threads-beanie', 'AT-ACC-004', 'hats', 'unisex', 15000, NULL, 'Classic knit beanie with embroidered logo', ARRAY['accessories'], false, true, ARRAY['https://jmdqojuxsixtxbavmrwq.supabase.co/storage/v1/object/public/products/accra-threads-beanie/Accra%20Threads%20Beanie.jpg']),
('Accra Threads Branded Water Bottle', 'accra-threads-branded-water-bottle', 'AT-ACC-005', 'accessories', 'unisex', 45000, NULL, 'Stainless steel double-wall water bottle, 500ml', ARRAY['new', 'eco-friendly'], false, true, ARRAY['https://jmdqojuxsixtxbavmrwq.supabase.co/storage/v1/object/public/products/accra-threads-branded-water-bottle/Accra%20Threads%20Branded%20Water%20Bottle.jpg']),
('Accra Threads Gift Box', 'accra-threads-gift-box', 'AT-ACC-006', 'gifts', 'unisex', 150000, NULL, 'Premium gift box set with curated items', ARRAY['gift'], false, true, ARRAY['https://jmdqojuxsixtxbavmrwq.supabase.co/storage/v1/object/public/products/accra-threads-gift-box/Accra%20Threads%20Gift%20Box.jpg']),
('Adinkra Pendant Necklace', 'adinkra-pendant-necklace', 'AT-ACC-007', 'jewelry', 'unisex', 55000, NULL, 'Handcrafted necklace with Adinkra symbol pendant', ARRAY['jewelry', 'heritage'], true, true, ARRAY['https://jmdqojuxsixtxbavmrwq.supabase.co/storage/v1/object/public/products/adinkra-pendant-necklace/Adinkra%20Pendant%20Necklace.jpg']),
('Ankara Mini Skirt', 'ankara-mini-skirt', 'AT-ACC-008', 'skirts', 'women', 45000, NULL, 'Vibrant Ankara print mini skirt with hidden pockets', ARRAY['women', 'new'], false, true, ARRAY['https://jmdqojuxsixtxbavmrwq.supabase.co/storage/v1/object/public/products/ankara-mini-skirt/Ankara%20Mini%20Skirt.jpg']),
('Ankara Print Backpack', 'ankara-print-backpack', 'AT-ACC-009', 'bags', 'unisex', 65000, NULL, 'Durable backpack with authentic Ankara fabric', ARRAY['bags', 'sustainable'], false, true, ARRAY['https://jmdqojuxsixtxbavmrwq.supabase.co/storage/v1/object/public/products/ankara-print-backpack/Ankara%20Print%20Backpack.jpg']),
('Black Stars Gym Bag', 'black-stars-gym-bag', 'AT-ACC-010', 'bags', 'unisex', 55000, NULL, 'Sports gym bag with Black Stars print', ARRAY['sports'], false, true, ARRAY['https://jmdqojuxsixtxbavmrwq.supabase.co/storage/v1/object/public/products/black-stars-gym-bag/Black%20Stars%20Gym%20Bag.jpg']); -- truncated for brevity
