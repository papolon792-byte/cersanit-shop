const fs = require('fs');
const path = require('path');
const https = require('https');

const PROJECT_ROOT = '/vercel/share/v0-project';
const CSV_FILE = path.join(PROJECT_ROOT, 'scripts', 'products.csv');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'products');
const LIB_DIR = path.join(PROJECT_ROOT, 'lib');
const OUTPUT_FILE = path.join(LIB_DIR, 'imported-products.ts');

// Создаём директории
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}
if (!fs.existsSync(LIB_DIR)) {
  fs.mkdirSync(LIB_DIR, { recursive: true });
}

console.log('🚀 Начинаем импорт товаров...');
console.log(`📂 CSV файл: ${CSV_FILE}`);
console.log(`📁 Изображения: ${IMAGES_DIR}`);
console.log(`📄 Выходной файл: ${OUTPUT_FILE}`);

// Проверяем CSV
if (!fs.existsSync(CSV_FILE)) {
  console.error(`❌ CSV файл не найден: ${CSV_FILE}`);
  process.exit(1);
}

// Парсинг CSV с учетом кавычек
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

// Загрузка изображения
async function downloadImage(url, filename) {
  if (!url || url === '') return null;
  
  return new Promise((resolve) => {
    const filepath = path.join(IMAGES_DIR, filename);
    
    // Если файл уже есть, пропускаем
    if (fs.existsSync(filepath)) {
      resolve(filename);
      return;
    }
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filename);
        });
      } else {
        console.warn(`⚠️  Не удалось загрузить ${url}`);
        resolve(null);
      }
    }).on('error', (err) => {
      console.warn(`⚠️  Ошибка загрузки ${url}: ${err.message}`);
      resolve(null);
    });
  });
}

// Чтение CSV
const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
const lines = csvContent.split('\n').filter(l => l.trim());

if (lines.length === 0) {
  console.error('❌ CSV файл пуст');
  process.exit(1);
}

const headers = parseCSVLine(lines[0]);
console.log(`📊 Найдено ${lines.length - 1} товаров`);
console.log(`📋 Колонки: ${headers.slice(0, 5).join(', ')}...`);

// Парсинг товаров
const products = [];
for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  if (values.length < 10) continue; // Пропускаем пустые строки
  
  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index] || '';
  });
  
  products.push(row);
}

console.log(`✅ Обработано ${products.length} товаров`);

// Загрузка изображений и формирование данных
(async () => {
  const result = [];
  let imageCount = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const progress = `[${i + 1}/${products.length}]`;
    
    const code = product['Код BSU'] || '';
    const name = product['Наименование для сайта'] || product['Наименование'] || 'Без названия';
    const collection = product['Коллекция'] || 'Без коллекции';
    const productType = product['Тип элемента'] || 'Товар';
    const photoUrl = product['Фото плиты'] || '';
    const collectionPhotoUrl = product['Фото Коллекции'] || '';
    
    process.stdout.write(`\r${progress} Обработка: ${name.substring(0, 40)}...`);
    
    // Загружаем фото
    let image = null;
    if (photoUrl) {
      const ext = path.extname(new URL(photoUrl).pathname) || '.jpg';
      const filename = `${code}${ext}`;
      image = await downloadImage(photoUrl, filename);
      if (image) imageCount++;
    }
    
    result.push({
      id: code,
      name: name,
      collection: collection,
      product_type: productType,
      color: product['Цвет плитки'] || '',
      format: product['Формат плиты округленный'] || '',
      surface: product['Вид поверхности'] || '',
      application: product['Применение'] || '',
      price_retail: 0, // Будет заполнено позже
      image: image ? `/images/products/${image}` : '/images/placeholder.jpg',
      description: `${name}, коллекция ${collection}`,
    });
  }
  
  console.log(`\n✅ Загружено ${imageCount} изображений`);
  
  // Создаём TypeScript файл
  const tsContent = `// Автоматически сгенерировано ${new Date().toISOString()}
// Импортировано ${result.length} товаров

export interface Product {
  id: string;
  name: string;
  collection: string;
  product_type: string;
  color: string;
  format: string;
  surface: string;
  application: string;
  price_retail: number;
  image: string;
  description: string;
}

export const importedProducts: Product[] = ${JSON.stringify(result, null, 2)};
`;
  
  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
  console.log(`📝 Создан файл: ${OUTPUT_FILE}`);
  console.log(`✨ Импорт завершён! Товаров: ${result.length}, Изображений: ${imageCount}`);
})();
