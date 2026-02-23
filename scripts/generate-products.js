const fs = require('fs');
const path = require('path');

// Use absolute paths for container environment
const projectRoot = '/vercel/share/v0-project';
const csvPath = path.join(projectRoot, 'scripts', 'products.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0].split(',');

// Helper to parse CSV line with proper quote handling
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const headerList = parseCSVLine(lines[0]);
const products = [];

// Parse all products
for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  const row = {};
  
  headerList.forEach((header, index) => {
    row[header] = values[index] || '';
  });
  
  if (!row['Код BSU']) continue;
  
  // Create product object
  const product = {
    id: row['Код BSU'],
    sku: row['Артикул BSU'],
    name: row['Название'],
    slug: row['Название']
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''),
    brand: 'Cersanit',
    collection: row['Коллекция'] || 'Без коллекции',
    product_type: row['Тип плитки'] || 'Плитка',
    format: row['Формат плитки'] || '',
    surface: row['Поверхность'] || '',
    color: row['Цвет'] || '',
    material_type: row['Материал'] || 'Керамогранит',
    application: row['Назначение'] || '',
    rooms: row['Помещения'] ? row['Помещения'].split(';').map(r => r.trim()).filter(Boolean) : [],
    thickness: row['Толщина'] || null,
    pieces_per_box: row['Штук в коробке'] ? parseInt(row['Штук в коробке']) : null,
    sqm_per_box: row['М2 в коробке'] ? parseFloat(row['М2 в коробке'].replace(',', '.')) : null,
    country: row['Страна'] || 'РОССИЯ',
    price_retail: parseFloat(row['Цена розничная за м2'] || '0'),
    price_official: row['Цена официальная за м2'] ? parseFloat(row['Цена официальная за м2']) : null,
    currency: 'RUB',
    stock_yanino: parseInt(row['Остаток Янино'] || '0'),
    stock_factory: parseInt(row['Остаток Завод'] || '0'),
    description: row['Описание'] || `${row['Название']} - качественная плитка от Cersanit из коллекции ${row['Коллекция']}.`,
    main_image: row['Фото плиты'] || '',
    interior_image: row['Фото Коллекции'] || null,
    images: [
      row['Фото плиты'],
      row['Фото Коллекции'],
      ...(row['Доп фото коллекции'] ? row['Доп фото коллекции'].split(';').map(img => img.trim()).filter(Boolean) : [])
    ].filter(Boolean),
    is_new: false,
    is_bestseller: false,
    is_discount: false,
    rating: 4.5,
    reviews_count: 0,
  };
  
  products.push(product);
}

console.log(`Parsed ${products.length} products`);

// Generate TypeScript file
const tsContent = `// Auto-generated from CSV import
// Total products: ${products.length}

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

export const products: Product[] = ${JSON.stringify(products, null, 2)};

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
`;

// Write to lib directory
const outputPath = path.join(projectRoot, 'lib', 'products-data.ts');

// Create lib directory if it doesn't exist
const libDir = path.join(projectRoot, 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

fs.writeFileSync(outputPath, tsContent, 'utf-8');

console.log(`✅ Successfully generated ${outputPath}`);
console.log(`📦 Total products: ${products.length}`);
console.log(`📂 Collections: ${new Set(products.map(p => p.collection)).size}`);
