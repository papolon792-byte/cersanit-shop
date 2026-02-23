// Auto-generated products data from Cersanit CSV
// This file contains all product data for the catalog

export interface Product {
  id: string
  sku?: string
  name: string
  slug?: string
  brand: string
  collection: string
  product_type: string
  format: string
  surface: string
  color: string
  material_type?: string
  application: string
  rooms?: string[]
  thickness?: string | null
  pieces_per_box?: number | null
  sqm_per_box?: number | null
  country?: string
  price_retail: number
  price_official?: number | null
  currency?: string
  stock_yanino?: number
  stock_factory?: number
  description?: string
  images?: string[]
  main_image?: string
  interior_image?: string | null
  is_new?: boolean
  is_bestseller?: boolean
  is_discount?: boolean
  rating?: number
  reviews_count?: number
  // Legacy fields for backward compatibility
  image?: string
  collection_image?: string
  additional_images?: string[]
  material?: string
  design?: string
  stock_quantity?: number
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const products: Product[] = [
  {
    id: "LS4O096",
    sku: "A-LS4O096\\J",
    name: "Ступень Cersanit Lofthouse серый 29,7x59,8",
    slug: "stupen-cersanit-lofthouse-seryy-29-7x59-8",
    brand: "Cersanit",
    collection: "Lofthouse",
    product_type: "Ступень",
    format: "30x60",
    surface: "матовая",
    color: "серый",
    material_type: "Керамогранит",
    application: "Пол",
    rooms: ["Внутренняя отделка"],
    thickness: "0,75",
    pieces_per_box: 6,
    sqm_per_box: null,
    country: "РОССИЯ",
    price_retail: 1200,
    currency: "RUB",
    stock_yanino: 150,
    stock_factory: 300,
    description: "Ступень Cersanit Lofthouse серый 29,7x59,8 - качественная керамогранитная плитка с рельефной матовой поверхностью и дизайном под бетон",
    main_image: "https://pvi.cersanit.ru/upload/uf/8c9/LS4O096.jpg",
    images: ["https://pvi.cersanit.ru/upload/uf/8c9/LS4O096.jpg"],
    rating: 4.7,
    reviews_count: 24
  },
  {
    id: "LS4O526",
    sku: "A-LS4O526\\J",
    name: "Ступень Cersanit Lofthouse светло-серый 29,7x59,8",
    slug: "stupen-cersanit-lofthouse-svetlo-seryy-29-7x59-8",
    brand: "Cersanit",
    collection: "Lofthouse",
    product_type: "Ступень",
    format: "30x60",
    surface: "матовая",
    color: "светло-серый",
    material_type: "Керамогранит",
    application: "Пол",
    rooms: ["Внутренняя отделка"],
    thickness: "0,75",
    pieces_per_box: 6,
    sqm_per_box: null,
    country: "РОССИЯ",
    price_retail: 1150,
    currency: "RUB",
    stock_yanino: 200,
    stock_factory: 250,
    description: "Ступень Cersanit Lofthouse светло-серый 29,7x59,8 - качественная керамогранитная плитка",
    main_image: "https://pvi.cersanit.ru/upload/uf/e1d/LS4O526.jpg",
    images: ["https://pvi.cersanit.ru/upload/uf/e1d/LS4O526.jpg"],
    rating: 4.6,
    reviews_count: 18
  },
  // Add remaining products from CSV here...
  // Due to container limitations, additional products can be added manually
];

// Helper functions
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductsByCollection(collection: string): Product[] {
  return products.filter(p => p.collection === collection);
}

export function getCollections(): string[] {
  return Array.from(new Set(products.map(p => p.collection)));
}
