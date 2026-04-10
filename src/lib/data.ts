import { db, type DbProduct, type Product, toProduct } from './db';
export type { Product };

export async function fetchProducts(category?: string): Promise<Product[]> {
  let query = db.from('products').select('*').eq('published', true);
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map(toProduct);
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !data) return null;
  
  return toProduct(data as DbProduct);
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('featured', true)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) throw error;
  
  return data.map(toProduct);
}

export const getProduct = async (slug: string) => {
  const product = await fetchProduct(slug);
  return product;
};

export const getRelated = async (product: Product) => {
  const related = await fetchProducts(product.category);
  return related.filter(p => p.slug !== product.slug).slice(0, 4);
};

// Legacy static (remove after wiring)
export const products: Product[] = [
  {
    id: "AT-25-001",
    name: "Accra FC Streetwear Jersey (Black)",
    slug: "accra-fc-streetwear-jersey-black",
    price: 350,
    images: ["/products/accra-fc-streetwear-black-jersey.jpg"],
    description: "Premium streetwear jersey inspired by Accra's vibrant football culture. Breathable mesh fabric with custom Accra crest.",
    category: "men",
    rating: 4.8,
    reviewCount: 42,
    isNew: true,
    cowriePoints: 35,
    colors: [{ name: "Black", hex: "#000000" }],
    sizes: [
      { label: "S", stock: 12 }, { label: "M", stock: 5 }, { label: "L", stock: 0 }, { label: "XL", stock: 8 }
    ]
  },
  {
    id: "AT-25-002",
    name: "Accra FC Streetwear Jersey (White)",
    slug: "accra-fc-streetwear-jersey-white",
    price: 350,
    images: ["/products/accra-fc-streetwear-white-jersey.jpg"],
    description: "Premium streetwear jersey in away white. Inspired by Accra's coastal breeze.",
    category: "men",
    rating: 4.7,
    reviewCount: 28,
    cowriePoints: 35,
    colors: [{ name: "White", hex: "#ffffff" }],
    sizes: [
      { label: "S", stock: 4 }, { label: "M", stock: 15 }, { label: "L", stock: 10 }, { label: "XL", stock: 2 }
    ]
  },
  {
    id: "AT-25-003",
    name: "Ghana Black Stars Heritage Jersey",
    slug: "ghana-black-stars-heritage-jersey",
    price: 450,
    originalPrice: 500,
    images: ["/products/ghana-black-stars-heritage-jersey.jpg", "/products/ghana-black-stars-heritage-jersey2.jpg"],
    description: "A throwback to the golden era of the Black Stars. Vintage styling with modern moisture-wicking technology.",
    category: "men",
    rating: 4.9,
    reviewCount: 156,
    isSale: true,
    cowriePoints: 45,
    colors: [{ name: "Gold/Black", hex: "#D4A017" }],
    sizes: [
      { label: "S", stock: 0 }, { label: "M", stock: 2 }, { label: "L", stock: 5 }, { label: "XL", stock: 1 }
    ]
  },
  {
    id: "AT-25-004",
    name: "Black Stars Away Kit Hoodie",
    slug: "black-stars-away-kit-hoodie",
    price: 650,
    images: ["/products/black-stars-away-kit-hoodie.png"],
    description: "Heavyweight premium cotton hoodie featuring the away kit star motif. Perfect for cool Accra nights.",
    category: "men",
    rating: 5.0,
    reviewCount: 89,
    isNew: true,
    cowriePoints: 65,
    colors: [{ name: "Red", hex: "#E92A2B" }, { name: "Yellow", hex: "#FCD015" }],
    sizes: [
      { label: "S", stock: 10 }, { label: "M", stock: 20 }, { label: "L", stock: 15 }, { label: "XL", stock: 5 }
    ]
  },
  {
    id: "AT-25-005",
    name: "Accra Skyline Crewneck Sweatshirt",
    slug: "accra-skyline-crewneck-sweatshirt",
    price: 550,
    images: ["/products/accra-skyline-crewneck-sweatshirt.jpg"],
    description: "Detailed embroidery of the Accra skyline on a comfortable, relaxed-fit crewneck.",
    category: "unisex" as any,
    rating: 4.6,
    reviewCount: 34,
    cowriePoints: 55,
    colors: [{ name: "Ash Grey", hex: "#b2b2b2" }, { name: "Navy", hex: "#1a2c42" }],
    sizes: [
      { label: "XS", stock: 5 }, { label: "S", stock: 12 }, { label: "M", stock: 18 }, { label: "L", stock: 6 }
    ]
  },
  {
    id: "AT-25-006",
    name: "Independence Stadium Bomber",
    slug: "stadium-bomber",
    price: 950,
    images: ["/products/stadium-bomber.jpg"],
    description: "Classic varsity stadium bomber jacket featuring custom Ghanaian independence patches. Satin interior.",
    category: "kente drops",
    rating: 4.9,
    reviewCount: 112,
    isNew: true,
    cowriePoints: 95,
    colors: [{ name: "Olive Green", hex: "#556B2F" }, { name: "Black", hex: "#000000" }],
    sizes: [
      { label: "S", stock: 3 }, { label: "M", stock: 0 }, { label: "L", stock: 2 }, { label: "XL", stock: 0 }
    ]
  },
  {
    id: "AT-25-007",
    name: "Retro Ghanaian Track Suit (Top)",
    slug: "ghanaian-retro-track-suit-top",
    price: 420,
    images: ["/products/ghanaian-retro-track-suit-top.jpg"],
    description: "'70s inspired track jacket in bold Pan-African colors. Features a zip-up front and high collar.",
    category: "men",
    rating: 4.5,
    reviewCount: 56,
    cowriePoints: 42,
    colors: [{ name: "Green/Gold", hex: "#1F592A" }],
    sizes: [
      { label: "S", stock: 8 }, { label: "M", stock: 12 }, { label: "L", stock: 10 }, { label: "XL", stock: 6 }
    ]
  },
  {
    id: "AT-25-008",
    name: "Retro Ghanaian Track Suit (Bottoms)",
    slug: "ghanaian-track-suit-bottoms",
    price: 380,
    images: ["/products/ghanaian-track-suit-bottoms.jpg"],
    description: "Matching '70s track pants. Tapered fit with elastic cuffs and side striping.",
    category: "men",
    rating: 4.4,
    reviewCount: 41,
    cowriePoints: 38,
    colors: [{ name: "Green/Gold", hex: "#1F592A" }],
    sizes: [
      { label: "S", stock: 10 }, { label: "M", stock: 15 }, { label: "L", stock: 8 }, { label: "XL", stock: 4 }
    ]
  },
  {
    id: "AT-25-009",
    name: "Nkrumah Tribute Graphic Tee",
    slug: "nkrumah-tribute-graphic-tee",
    price: 250,
    images: ["/products/nkrumah-tribute-graphic-tee.png"],
    description: "Oversized structural vintage wash tee honoring Kwame Nkrumah. Screen-printed in Accra.",
    category: "unisex" as any,
    rating: 4.8,
    reviewCount: 215,
    cowriePoints: 25,
    colors: [{ name: "Off White", hex: "#f5f5dc" }, { name: "Vintage Black", hex: "#222222" }],
    sizes: [
      { label: "S", stock: 25 }, { label: "M", stock: 30 }, { label: "L", stock: 20 }, { label: "XL", stock: 10 }
    ]
  },
  {
    id: "AT-25-010",
    name: "Afrobeats Concert Tee",
    slug: "afrobeats-concert-tee",
    price: 220,
    images: ["/products/afrobeats-concert-tee.jpg"],
    description: "100% organic cotton tee paying homage to the vibrant Afrobeats culture of Accra.",
    category: "unisex" as any,
    rating: 4.7,
    reviewCount: 78,
    cowriePoints: 22,
    colors: [{ name: "Black", hex: "#000000" }],
    sizes: [
      { label: "S", stock: 5 }, { label: "M", stock: 3 }, { label: "L", stock: 1 }, { label: "XL", stock: 0 }
    ]
  },
  {
    id: "AT-25-011",
    name: "Adinkra Sports Polo (Blue)",
    slug: "blue-adinkra-sports-polo",
    price: 300,
    images: ["/products/blue-adinkra-sports-polo.png"],
    description: "Performance polo shirt with subtle Adinkra symbols woven into the collar and cuffs.",
    category: "men",
    rating: 4.3,
    reviewCount: 22,
    cowriePoints: 30,
    colors: [{ name: "Royal Blue", hex: "#4169E1" }],
    sizes: [
      { label: "S", stock: 12 }, { label: "M", stock: 15 }, { label: "L", stock: 20 }, { label: "XL", stock: 10 }
    ]
  },
  {
    id: "AT-25-012",
    name: "Adinkra Sports Polo (White)",
    slug: "white-adinkra-sports-polo",
    price: 300,
    images: ["/products/white-adinkra-sports-polo.png"],
    description: "Clean white performance polo featuring 'Gye Nyame' Adinkra embroidery on the chest.",
    category: "men",
    rating: 4.5,
    reviewCount: 31,
    cowriePoints: 30,
    colors: [{ name: "Crisp White", hex: "#ffffff" }],
    sizes: [
      { label: "S", stock: 18 }, { label: "M", stock: 22 }, { label: "L", stock: 14 }, { label: "XL", stock: 5 }
    ]
  },
  {
    id: "AT-25-013",
    name: "Volta Region Running Tee",
    slug: "volta-region-running-tee",
    price: 280,
    originalPrice: 350,
    images: ["/products/volta-region-running-tee.jpg"],
    description: "Lightweight, ultra-breathable running shirt designed for the heat and hills of the Volta region.",
    category: "women" as any,
    rating: 4.6,
    reviewCount: 45,
    isSale: true,
    cowriePoints: 28,
    colors: [{ name: "Neon Yellow", hex: "#CCFF00" }],
    sizes: [
      { label: "XS", stock: 6 }, { label: "S", stock: 12 }, { label: "M", stock: 10 }, { label: "L", stock: 4 }
    ]
  },
  {
    id: "AT-25-014",
    name: "Oware Board Print Tee",
    slug: "oware-board-print-tee",
    price: 240,
    images: ["/products/oware-board-print-tee.jpg"],
    description: "Drop-shoulder tee featuring an artistic print of the traditional Oware board game.",
    category: "men",
    rating: 4.9,
    reviewCount: 88,
    cowriePoints: 24,
    colors: [{ name: "Earth Brown", hex: "#8B4513" }, { name: "Cream", hex: "#FFFDD0" }],
    sizes: [
      { label: "S", stock: 12 }, { label: "M", stock: 8 }, { label: "L", stock: 0 }, { label: "XL", stock: 2 }
    ]
  }
];

// export const getProduct = (slug: string) => products.find(p => p.slug === slug);
// export const getRelated = (product: Product) => products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

export const categories = [
  { id: 'men', label: 'Men', image: '/products/stadium-bomber.jpg', href: '/shop?cat=men' },
  { id: 'women', label: 'Women', image: '/products/volta-region-running-tee.jpg', href: '/shop?cat=women' },
  { id: 'accessories', label: 'Accessories', image: '/products/oware-board-print-tee.jpg', href: '/shop?cat=accessories' },
  { id: 'kente', label: 'Kente Drops', image: '/products/ghana-black-stars-heritage-jersey.jpg', href: '/shop?cat=kente' },
];

export const lookbookItems = [
  { id: 1, title: 'Osu Nights', label: 'Editorial', image: '/products/accra-skyline-crewneck-sweatshirt.jpg', color: '#1B4D2E' },
  { id: 2, title: 'Match Day', label: 'Collection', image: '/products/ghana-black-stars-heritage-jersey.jpg', color: '#D4A017' },
  { id: 3, title: 'Asafo Legacy', label: 'Heritage', image: '/products/stadium-bomber.jpg', color: '#000000' },
  { id: 4, title: 'Track & Field', label: 'Active', image: '/products/ghanaian-retro-track-suit-top.jpg', color: '#E92A2B' },
];

export const orders = [
  {
    id: "AT-2025-0043",
    date: "Today, 10:45 AM",
    status: "out_for_delivery" as const,
    total: 650,
    items: [
      {
         name: "Black Stars Away Kit Hoodie",
         qty: 1,
         price: 650,
         image: "/products/black-stars-away-kit-hoodie.png"
      }
    ]
  },
  {
    id: "AT-2025-0021",
    date: "March 20, 2025",
    status: "delivered" as const,
    total: 350,
    items: [
      {
         name: "Accra FC Streetwear Jersey (Black)",
         qty: 1,
         price: 350,
         image: "/products/accra-fc-streetwear-black-jersey.jpg"
      }
    ]
  }
];
