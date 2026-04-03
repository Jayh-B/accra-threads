export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: 'men' | 'women' | 'accessories' | 'kente-drops';
  gender: 'men' | 'women' | 'unisex';
  colors: { name: string; hex: string }[];
  sizes: { label: string; stock: number }[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isSale?: boolean;
  isFeatured?: boolean;
  cowriePoints: number;
  description: string;
  careInstructions: string;
  tags: string[];
}

export interface Order {
  id: string;
  date: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  items: { name: string; qty: number; price: number; image: string }[];
  total: number;
  courier?: string;
  trackingCode?: string;
  eta?: string;
}

export const products: Product[] = [
  {
    id: 'p001',
    slug: 'kente-bomber-jacket',
    name: 'Kente Bomber Jacket',
    price: 850,
    images: ['/product_kente_bomber.png', '/product_streetwear_hoodie.png'],
    category: 'men',
    gender: 'unisex',
    colors: [
      { name: 'Black/Gold', hex: '#D4A017' },
      { name: 'Navy/Red',   hex: '#1a2a5e' },
    ],
    sizes: [
      { label: 'XS', stock: 3 }, { label: 'S',  stock: 8 },
      { label: 'M',  stock: 12 }, { label: 'L', stock: 4 },
      { label: 'XL', stock: 2 }, { label: '2XL', stock: 0 },
    ],
    rating: 4.8,
    reviewCount: 124,
    isNew: true,
    isFeatured: true,
    cowriePoints: 85,
    description: `Our signature Kente Bomber Jacket is a celebration of Ghanaian craft heritage reimagined for the modern street. Hand-selected kente fabric panels are fused with premium heavyweight satin for a piece that commands attention whether you're in Osu or London.\n\nFeaturing authentic Asante kente weave on the chest, back and sleeves, with a sleek obsidian liner and ribbed gold cuffs. A true collector's piece.`,
    careInstructions: 'Dry clean only. Do not wring. Store flat or hang with padded hanger.',
    tags: ['kente', 'bomber', 'outerwear', 'limited'],
  },
  {
    id: 'p002',
    slug: 'adinkra-midi-dress',
    name: 'Adinkra Midi Dress',
    price: 420,
    originalPrice: 580,
    images: ['/product_agbada_dress.png', '/product_kente_bomber.png'],
    category: 'women',
    gender: 'women',
    colors: [
      { name: 'Gold/Black', hex: '#D4A017' },
      { name: 'Red/Gold',   hex: '#B5352B' },
      { name: 'Green/Cream', hex: '#1B4D2E' },
    ],
    sizes: [
      { label: 'XS', stock: 0 }, { label: 'S', stock: 6 },
      { label: 'M',  stock: 9 }, { label: 'L', stock: 5 },
      { label: 'XL', stock: 3 }, { label: '2XL', stock: 2 },
    ],
    rating: 4.9,
    reviewCount: 87,
    isSale: true,
    cowriePoints: 42,
    description: 'Effortlessly elegant, the Adinkra Midi Dress features a cascade of traditional Kente-inspired geometric patterns on fluid stretch-woven fabric. The relaxed fit and midi length make it perfect for both elevated occasions and Accra streetwear.',
    careInstructions: 'Hand wash cold or gentle machine cycle. Lay flat to dry. Iron on low.',
    tags: ['dress', 'kente', 'women', 'sale'],
  },
  {
    id: 'p003',
    slug: 'obsidian-adinkra-hoodie',
    name: 'Obsidian Adinkra Hoodie',
    price: 320,
    images: ['/product_streetwear_hoodie.png', '/product_kente_cap.png'],
    category: 'men',
    gender: 'unisex',
    colors: [
      { name: 'Black/Gold', hex: '#D4A017' },
      { name: 'Charcoal',   hex: '#3a3a3a' },
    ],
    sizes: [
      { label: 'S', stock: 10 }, { label: 'M', stock: 14 },
      { label: 'L', stock: 7  }, { label: 'XL', stock: 4 },
      { label: '2XL', stock: 1 }, { label: '3XL', stock: 0 },
    ],
    rating: 4.7,
    reviewCount: 203,
    isNew: true,
    cowriePoints: 32,
    description: 'Our bestselling oversized hoodie in premium 450gsm heavyweight French terry. Embroidered Adinkra symbols across the chest — each symbol a message: Gye Nyame (supremacy of God), Sankofa (learn from the past), Dwennimmen (strength and humility).',
    careInstructions: 'Machine wash cold, inside out. Tumble dry low. Do not bleach.',
    tags: ['hoodie', 'adinkra', 'streetwear', 'unisex'],
  },
  {
    id: 'p004',
    slug: 'kente-snapback-cap',
    name: 'Kente Snapback Cap',
    price: 185,
    images: ['/product_kente_cap.png', '/product_streetwear_hoodie.png'],
    category: 'accessories',
    gender: 'unisex',
    colors: [
      { name: 'Black/Gold', hex: '#D4A017' },
      { name: 'Black/Red',  hex: '#B5352B' },
    ],
    sizes: [
      { label: 'One Size', stock: 24 },
    ],
    rating: 4.6,
    reviewCount: 156,
    cowriePoints: 18,
    description: 'A statement piece for every outfit. Our Kente Snapback features authentic woven kente panels on each of the six sections, with a flat debossed leather brim and brass snap closure engraved with the Accra Threads logo.',
    careInstructions: 'Spot clean with damp cloth. Do not machine wash. Air dry only.',
    tags: ['cap', 'kente', 'accessories'],
  },
  {
    id: 'p005',
    slug: 'kente-bomber-jacket-v2',
    name: 'Heritage Track Jacket',
    price: 560,
    images: ['/product_kente_bomber.png', '/product_agbada_dress.png'],
    category: 'men',
    gender: 'men',
    colors: [
      { name: 'Cream/Gold', hex: '#F5F0E8' },
      { name: 'Black/Gold', hex: '#D4A017' },
    ],
    sizes: [
      { label: 'S', stock: 5 }, { label: 'M', stock: 8 },
      { label: 'L', stock: 4 }, { label: 'XL', stock: 0 },
    ],
    rating: 4.5,
    reviewCount: 62,
    cowriePoints: 56,
    description: 'The Heritage Track Jacket fuses retro sports aesthetics with contemporary Ghanaian motifs. Contrast kente stripe panels flow down the sleeves, with embossed Adinkra symbols at the chest pocket.',
    careInstructions: 'Machine wash cold. Line dry. Do not tumble dry.',
    tags: ['jacket', 'track', 'kente', 'men'],
  },
  {
    id: 'p006',
    slug: 'akan-silk-wrap-dress',
    name: 'Akan Silk Wrap Dress',
    price: 680,
    originalPrice: 900,
    images: ['/product_agbada_dress.png', '/product_streetwear_hoodie.png'],
    category: 'kente-drops',
    gender: 'women',
    colors: [
      { name: 'Royal Gold', hex: '#D4A017' },
      { name: 'Deep Green', hex: '#1B4D2E' },
    ],
    sizes: [
      { label: 'XS', stock: 2 }, { label: 'S', stock: 4 },
      { label: 'M',  stock: 3 }, { label: 'L', stock: 1 },
    ],
    rating: 5.0,
    reviewCount: 34,
    isSale: true,
    isFeatured: true,
    cowriePoints: 68,
    description: 'Our most exclusive drop yet — the Akan Silk Wrap Dress is made from 100% pure habotai silk hand-printed with authentic Akan symbols. Limited to 50 pieces worldwide. Each piece serial-numbered.',
    careInstructions: 'Dry clean only. Store hanging in breathable garment bag.',
    tags: ['silk', 'wrap', 'kente-drops', 'limited', 'women'],
  },
  {
    id: 'p007',
    slug: 'cowrie-shell-necklace',
    name: 'Cowrie Shell Choker',
    price: 120,
    images: ['/product_kente_cap.png', '/product_agbada_dress.png'],
    category: 'accessories',
    gender: 'unisex',
    colors: [
      { name: 'Natural/Gold', hex: '#D4A017' },
      { name: 'Black/Gold',   hex: '#1a1a1a' },
    ],
    sizes: [{ label: 'One Size', stock: 30 }],
    rating: 4.8,
    reviewCount: 211,
    isNew: true,
    cowriePoints: 12,
    description: 'Hand-strung real cowrie shells on a gold-plated chain with an Adinkra symbol pendant. Cowrie shells have been used as currency and adornment across West Africa for centuries — wear your heritage.',
    careInstructions: 'Avoid contact with water and perfume. Store in pouch provided.',
    tags: ['jewelry', 'cowrie', 'accessories'],
  },
  {
    id: 'p008',
    slug: 'ankara-jogger-set',
    name: 'Ankara Jogger Set',
    price: 480,
    images: ['/product_streetwear_hoodie.png', '/product_kente_bomber.png'],
    category: 'men',
    gender: 'unisex',
    colors: [
      { name: 'Blue/Gold', hex: '#1a4a8a' },
      { name: 'Black/Red', hex: '#B5352B' },
    ],
    sizes: [
      { label: 'S', stock: 6 }, { label: 'M', stock: 11 },
      { label: 'L', stock: 8 }, { label: 'XL', stock: 3 },
      { label: '2XL', stock: 2 },
    ],
    rating: 4.4,
    reviewCount: 89,
    cowriePoints: 48,
    description: 'The Ankara Jogger Set is two-piece comfort luxury. Bold African print waistband and cuff accents on ultra-soft 380gsm loopback cotton. Designed to be worn together or mixed and matched.',
    careInstructions: 'Machine wash cold. Tumble dry low. Iron inside-out on medium.',
    tags: ['jogger', 'set', 'ankara', 'matching'],
  },
];

export const orders: Order[] = [
  {
    id: 'AT-2025-0042',
    date: '2025-03-28',
    status: 'delivered',
    items: [
      { name: 'Kente Bomber Jacket', qty: 1, price: 850, image: '/product_kente_bomber.png' },
      { name: 'Kente Snapback Cap', qty: 1, price: 185, image: '/product_kente_cap.png' },
    ],
    total: 1035,
    courier: 'DHL Express',
    trackingCode: 'DHL-GH-44829183',
    eta: 'Delivered on Mar 30, 2025',
  },
  {
    id: 'AT-2025-0031',
    date: '2025-03-15',
    status: 'shipped',
    items: [
      { name: 'Adinkra Midi Dress', qty: 1, price: 420, image: '/product_agbada_dress.png' },
    ],
    total: 420,
    courier: 'GIG Logistics',
    trackingCode: 'GIG-2025-77234',
    eta: 'Expected Apr 5, 2025',
  },
];

export const lookbookItems = [
  {
    id: 'lb1',
    label: 'SS25 Collection',
    title: 'The City Speaks',
    image: '/product_kente_bomber.png',
    color: '#D4A017',
  },
  {
    id: 'lb2',
    label: 'Editorial',
    title: 'Roots & Routes',
    image: '/category_men.png',
    color: '#1B4D2E',
  },
  {
    id: 'lb3',
    label: 'Kente Drops',
    title: 'Woven in Gold',
    image: '/product_agbada_dress.png',
    color: '#B5352B',
  },
  {
    id: 'lb4',
    label: 'Streetwear',
    title: 'Urban Royalty',
    image: '/product_streetwear_hoodie.png',
    color: '#D4A017',
  },
];

export const categories = [
  { id: 'men',         label: 'Men',           image: '/category_men.png',           href: '/shop?gender=men' },
  { id: 'women',       label: 'Women',         image: '/product_agbada_dress.png',   href: '/shop?gender=women' },
  { id: 'accessories', label: 'Accessories',   image: '/product_kente_cap.png',      href: '/shop?category=accessories' },
  { id: 'kente-drops', label: 'Kente Drops',   image: '/product_kente_bomber.png',   href: '/shop?category=kente-drops' },
];

export function getProduct(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getRelated(product: Product, limit = 4): Product[] {
  return products.filter(p => p.id !== product.id && p.category === product.category).slice(0, limit);
}
