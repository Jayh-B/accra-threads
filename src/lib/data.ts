import { db, type DbProduct, type Product, toProduct } from './db';
export type { Product };

export async function fetchProducts(category?: string, searchQuery?: string): Promise<Product[]> {
  let query = db.from('products').select('*').eq('published', true);
  
  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`);
  }
  
  if (category) {
    if (category === 'men') {
      query = query.in('gender', ['men', 'unisex']);
    } else if (category === 'women') {
      query = query.in('gender', ['women', 'unisex']);
    } else if (category === 'kente') {
      query = query.ilike('name', '%kente%');
    } else if (category === 'accessories') {
      query = query.in('category', ['accessories', 'jewelry', 'bags', 'hats']);
    } else if (category === 'sale') {
      // Just a mock way to handle sale tab
      query = query.eq('featured', true);
    } else if (category === 'jackets') {
      query = query.in('category', ['jackets', 'outerwear']);
    } else {
      query = query.eq('category', category);
    }
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
export const products: Product[] = [];

export const categories = [
  { id: 'men', label: 'Men', image: '/products/accra-heat-oversized-hoodie.jpg', href: '/shop?cat=men' },
  { id: 'women', label: 'Women', image: '/products/ankara-mini-skirt.jpg', href: '/shop?cat=women' },
  { id: 'accessories', label: 'Accessories', image: '/products/cowrie-shell-necklace-gold.jpg', href: '/shop?cat=accessories' },
  { id: 'kente', label: 'Kente Drops', image: '/products/kente-kimono-jacket.jpg', href: '/shop?cat=kente' },
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
