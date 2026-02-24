const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Google Sheets ID и URL для CSV экспорта
const SHEET_ID = '1uBg2NMNzF4GzNPSVzVO7N4vnllDfCihapIzsJwntDrE';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

// Директории
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'products');
const LIB_DIR = path.join(process.cwd(), 'lib');
const OUTPUT_FILE = path.join(LIB_DIR, 'imported-products.ts');

// Создаём директории
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}
if (!fs.existsSync(LIB_DIR)) {
  fs.mkdirSync(LIB_DIR, { recursive: true });
}

// Функция для скачивания файла
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Редирект
        file.close();
        fs.unlinkSync(filepath);
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

// Функция для парсинга CSV с учетом кавычек
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Функция для разбора строки CSV с учетом кавычек
  function parseLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Двойная кавычка внутри кавычек
          current += '"';
          i++;
        } else {
          // Переключаем режим кавычек
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Разделитель вне кавычек
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
    if (Object.keys(row).length > 0) {
      rows.push(row);
    }
  }
  
  return rows;
}

// Функция для генерации slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Главная функция импорта
async function importProducts() {
  console.log('🚀 Начинаем импорт товаров из Google Sheets...\n');
  
  try {
    // Скачиваем CSV
    console.log('📥 Скачиваем данные из Google Sheets...');
    const csvData = await new Promise((resolve, reject) => {
      https.get(CSV_URL, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(data));
        response.on('error', reject);
      });
    });
    
    console.log('✅ Данные получены\n');
    
    // Парсим CSV
    console.log('📊 Парсим данные...');
    const rows = parseCSV(csvData);
    console.log(`✅ Найдено ${rows.length} товаров\n`);
    
    if (rows.length === 0) {
      console.log('⚠️  Нет данных для импорта');
      return;
    }
    
    // Обрабатываем каждый товар
    const products = [];
    let imageCount = 0;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`\n[${i + 1}/${rows.length}] Обработка: ${row['Название'] || 'Unknown'}`);
      
      // Скачиваем изображение
      let imagePath = '/images/products/default.jpg';
      if (row['Фото URL']) {
        try {
          const imageUrl = row['Фото URL'];
          const ext = imageUrl.includes('.jpg') ? '.jpg' : imageUrl.includes('.png') ? '.png' : '.jpg';
          const filename = `${generateSlug(row['Название'] || `product-${i}`)}-${Date.now()}${ext}`;
          const localPath = path.join(IMAGES_DIR, filename);
          
          console.log(`  📷 Скачиваем фото...`);
          await downloadFile(imageUrl, localPath);
          imagePath = `/images/products/${filename}`;
          imageCount++;
          console.log(`  ✅ Фото сохранено: ${filename}`);
        } catch (err) {
          console.log(`  ⚠️  Ошибка загрузки фото: ${err.message}`);
        }
      }
      
      // Создаём объект товара
      const product = {
        id: i + 1,
        name: row['Название'] || `Товар ${i + 1}`,
        slug: generateSlug(row['Название'] || `product-${i + 1}`),
        collection: row['Коллекция'] || 'Без коллекции',
        product_type: row['Тип'] || 'Напольная плитка',
        color: row['Цвет'] || 'Белый',
        format: row['Формат'] || '60x60',
        surface: row['Поверхность'] || 'Матовая',
        application: row['Применение'] || 'Пол',
        price_retail: parseFloat(row['Цена'] || '0'),
        stock: parseInt(row['Остаток'] || '0'),
        image: imagePath,
        images: [imagePath],
        description: row['Описание'] || '',
        specifications: {
          thickness: row['Толщина'] || '8 мм',
          wear_resistance: row['Износостойкость'] || 'PEI IV',
          water_absorption: row['Водопоглощение'] || '< 0.5%',
          frost_resistance: row['Морозостойкость'] || 'Да',
        }
      };
      
      products.push(product);
      console.log(`  ✅ Товар добавлен`);
    }
    
    // Генерируем TypeScript файл
    console.log(`\n\n📝 Генерируем TypeScript файл...`);
    
    const tsContent = `// Auto-generated from Google Sheets
// Generated at: ${new Date().toISOString()}
// Total products: ${products.length}
// Downloaded images: ${imageCount}

export interface Product {
  id: number;
  name: string;
  slug: string;
  collection: string;
  product_type: string;
  color: string;
  format: string;
  surface: string;
  application: string;
  price_retail: number;
  stock: number;
  image: string;
  images: string[];
  description: string;
  specifications: {
    thickness: string;
    wear_resistance: string;
    water_absorption: string;
    frost_resistance: string;
  };
}

export const importedProducts: Product[] = ${JSON.stringify(products, null, 2)};

export default importedProducts;
`;
    
    fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
    console.log(`✅ Файл создан: ${OUTPUT_FILE}`);
    
    // Статистика
    console.log('\n\n✨ ИМПОРТ ЗАВЕРШЁН! ✨\n');
    console.log('📊 Статистика:');
    console.log(`   • Всего товаров: ${products.length}`);
    console.log(`   • Скачано изображений: ${imageCount}`);
    console.log(`   • Файл данных: lib/imported-products.ts`);
    console.log(`   • Папка изображений: public/images/products/`);
    
    console.log('\n📋 Следующие шаги:');
    console.log('   1. Проверьте файл lib/imported-products.ts');
    console.log('   2. Используйте импортированные данные в вашем приложении:');
    console.log('      import { importedProducts } from "@/lib/imported-products"');
    
  } catch (error) {
    console.error('\n❌ Ошибка импорта:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Запускаем импорт
importProducts();
