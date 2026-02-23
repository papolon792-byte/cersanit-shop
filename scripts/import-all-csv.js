const fs = require('fs');
const path = require('path');

// Read CSV from scripts directory - use absolute path for container environment
const csvPath = '/vercel/share/v0-project/scripts/products-import.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV with proper quote handling
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  function parseLine(line) {
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
  
  const headers = parseLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    if (Object.values(row).some(v => v)) {
      rows.push(row);
    }
  }
  
  return rows;
}

const rows = parseCSV(csvContent);

console.log(`Parsed ${rows.length} products from CSV`);

// Generate TypeScript products
const products = rows.map((row, index) => {
  const id = row['Код BSU'] || `product-${index + 1}`;
  const sku = row['Артикул'] || '';
  const name = row['Наименование для сайта'] || row['Наименование'] || 'Товар без названия';
  const collection = row['Коллекция'] || 'Без коллекции';
  const productType = row['Тип элемента'] || 'Плитка';
  const format = row['Формат плиты округленный'] || row['Формат плиты номинальный'] || '';
  const color = row['Цвет плитки'] || '';
  const material = row['Материал'] || 'Керамика';
  const surface = row['Поверхность'] || '';
  const application = row['Назначение'] || '';
  const country = row['Страна происхождения'] || '';
  const width = row['Ширина плитки (см)'] || '';
  const length = row['Длина плитки (см)'] || '';
  const thickness = row['Толщина плитки (см)'] || '';
  const piecesPerBox = row['Количество плиток в коробке'] || '';
  const sqmPerBox = row['М2 в одной коробке'] || '';
  const mainImage = row['Фото плиты'] || '';
  const collectionImage = row['Фото Коллекции'] || '';
  const additionalImages = row['Доп фото коллекции'] || '';
  
  // Parse additional images
  let imagesArray = [mainImage];
  if (additionalImages) {
    const addImages = additionalImages.split(';').filter(img => img.trim());
    imagesArray = [...imagesArray, ...addImages];
  }
  
  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^а-яёa-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
  
  // Generate price based on product type
  let basePrice = 500;
  if (productType.includes('Керамогранит')) basePrice = 800;
  if (productType.includes('Ступень')) basePrice = 1200;
  if (productType.includes('Мозаика')) basePrice = 1500;
  if (productType.includes('Плинтус')) basePrice = 300;
  
  const priceRetail = basePrice + Math.floor(Math.random() * 300);
  
  return {
    id,
    sku,
    name,
    slug,
    collection,
    product_type: productType,
    format,
    color,
    material_type: material,
    surface,
    application,
    country,
    width,
    length,
    thickness,
    pieces_per_box: piecesPerBox ? parseFloat(piecesPerBox) : undefined,
    sqm_per_box: sqmPerBox ? parseFloat(sqmPerBox) : undefined,
    price_retail: priceRetail,
    main_image: mainImage,
    collection_image: collectionImage || mainImage,
    images: imagesArray.filter(img => img),
    brand: 'Cersanit',
    currency: 'RUB',
    stock_yanino: Math.floor(Math.random() * 500),
    stock_factory: Math.floor(Math.random() * 1000),
    rating: (4 + Math.random()).toFixed(1),
    reviews_count: Math.floor(Math.random() * 50),
  };
});

// Generate TypeScript file content
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
  width?: string
  length?: string
  thickness?: string
  pieces_per_box?: number
  sqm_per_box?: number
  country?: string
  price_retail: number
  price_official?: number | null
  currency?: string
  stock_yanino?: number
  stock_factory?: number
  description?: string
  images?: string[]
  main_image?: string
  collection_image?: string
  interior_image?: string | null
  is_new?: boolean
  is_bestseller?: boolean
  is_discount?: boolean
  rating?: number
  reviews_count?: number
  // Legacy fields for backward compatibility
  image?: string
  additional_images?: string[]
  material?: string
  design?: string
  stock_quantity?: number
  rooms?: string[]
}

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;

// Write to lib/products-data.ts - use absolute path
const outputPath = '/vercel/share/v0-project/lib/products-data.ts';

// Create lib directory if it doesn't exist
const libDir = '/vercel/share/v0-project/lib';
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

fs.writeFileSync(outputPath, tsContent, 'utf-8');

console.log(`✅ Successfully imported ${products.length} products to lib/products-data.ts`);
