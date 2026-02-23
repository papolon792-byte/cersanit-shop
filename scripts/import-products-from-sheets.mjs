#!/usr/bin/env node

/**
 * Скрипт импорта товаров из Google Sheets
 * 
 * Использование:
 * 1. Экспортируйте Google таблицу в CSV: File -> Download -> CSV
 * 2. Положите файл в scripts/products.csv
 * 3. Запустите: node scripts/import-products-from-sheets.mjs
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Google Sheets ID из вашей ссылки
const SHEET_ID = '1uBg2NMNzF4GzNPSVzVO7N4vnllDfCihapIzsJwntDrE'

// Пути
const CSV_PATH = path.join(__dirname, 'products.csv')
const OUTPUT_JSON = path.join(__dirname, '../lib/imported-products.ts')
const IMAGES_DIR = path.join(__dirname, '../public/images/products')

// Создаём папку для изображений
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
}

console.log('🚀 Запуск импорта товаров из Google Sheets...\n')

/**
 * Скачивает файл по URL
 */
async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(filepath)
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Редирект
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject)
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Ошибка загрузки: ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {})
      reject(err)
    })
  })
}

/**
 * Скачивает изображение товара
 */
async function downloadProductImage(imageUrl, sku) {
  if (!imageUrl || imageUrl === '-' || imageUrl === '') {
    return null
  }
  
  try {
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg'
    const filename = `${sku}${ext}`
    const filepath = path.join(IMAGES_DIR, filename)
    
    // Если уже скачано, пропускаем
    if (fs.existsSync(filepath)) {
      return `/images/products/${filename}`
    }
    
    await downloadFile(imageUrl, filepath)
    return `/images/products/${filename}`
  } catch (error) {
    console.error(`  ❌ Ошибка загрузки изображения для ${sku}:`, error.message)
    return null
  }
}

/**
 * Парсит CSV строку с учётом кавычек
 */
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"'
      i++
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

/**
 * Загружает CSV из Google Sheets
 */
async function downloadGoogleSheetAsCSV() {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`
  console.log('📥 Скачиваем таблицу из Google Sheets...')
  
  try {
    await downloadFile(csvUrl, CSV_PATH)
    console.log('✅ Таблица скачана\n')
  } catch (error) {
    console.error('❌ Не удалось скачать таблицу автоматически')
    console.log('\n💡 Скачайте таблицу вручную:')
    console.log(`   1. Откройте: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`)
    console.log('   2. File -> Download -> Comma Separated Values (.csv)')
    console.log(`   3. Сохраните как: ${CSV_PATH}`)
    console.log('   4. Запустите скрипт снова\n')
    process.exit(1)
  }
}

/**
 * Парсит CSV и создаёт массив товаров
 */
async function parseCSV() {
  if (!fs.existsSync(CSV_PATH)) {
    await downloadGoogleSheetAsCSV()
  }
  
  console.log('📖 Читаем CSV файл...')
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  
  if (lines.length === 0) {
    throw new Error('CSV файл пуст')
  }
  
  // Парсим заголовки
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())
  console.log(`✅ Найдено колонок: ${headers.length}`)
  console.log(`📋 Заголовки: ${headers.join(', ')}\n`)
  
  const products = []
  
  // Парсим строки товаров
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i])
      
      if (values.length < headers.length - 5) {
        // Пропускаем пустые строки
        continue
      }
      
      const product = {}
      headers.forEach((header, index) => {
        product[header] = values[index] || ''
      })
      
      products.push(product)
    } catch (error) {
      console.error(`⚠️  Ошибка парсинга строки ${i + 1}:`, error.message)
    }
  }
  
  console.log(`✅ Распарсено товаров: ${products.length}\n`)
  return products
}

/**
 * Нормализует данные товара
 */
function normalizeProduct(rawProduct, index) {
  const sku = rawProduct.артикул || rawProduct.sku || rawProduct.код || `PRODUCT-${index}`
  const name = rawProduct.название || rawProduct.name || rawProduct.наименование || 'Без названия'
  const collection = rawProduct.коллекция || rawProduct.collection || 'Без коллекции'
  const format = rawProduct.формат || rawProduct.format || rawProduct.размер || '-'
  const productType = rawProduct['тип товара'] || rawProduct.product_type || rawProduct.тип || 'Керамическая плитка'
  const surface = rawProduct.поверхность || rawProduct.surface || 'Матовая'
  const color = rawProduct.цвет || rawProduct.color || 'Натуральный'
  const priceRetail = parseFloat(rawProduct.цена || rawProduct.price || rawProduct['цена розница'] || '0')
  const priceOfficial = parseFloat(rawProduct['цена официальная'] || rawProduct.price_official || '0') || null
  const stockYanino = parseInt(rawProduct['остаток янино'] || rawProduct.stock_yanino || '0')
  const stockFactory = parseInt(rawProduct['остаток завод'] || rawProduct.stock_factory || '0')
  const imageUrl = rawProduct['фото'] || rawProduct.image || rawProduct.изображение || ''
  
  // Создаём slug из названия
  const slug = name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 100)
  
  return {
    id: index + 1,
    sku,
    name,
    slug: `${slug}-${sku.toLowerCase()}`,
    brand: rawProduct.бренд || rawProduct.brand || 'Cersanit',
    collection,
    product_type: productType,
    format,
    surface,
    color,
    material_type: productType.includes('керамогранит') ? 'Керамогранит' : 'Керамика',
    application: rawProduct.применение || rawProduct.application || 'Универсальный',
    rooms: [rawProduct.помещение || 'Ванная комната'],
    thickness: rawProduct.толщина || rawProduct.thickness || '9 мм',
    pieces_per_box: parseInt(rawProduct['шт в упаковке'] || rawProduct.pieces_per_box || '10'),
    sqm_per_box: parseFloat(rawProduct['м2 в упаковке'] || rawProduct.sqm_per_box || '1.5'),
    country: rawProduct.страна || rawProduct.country || 'Польша',
    price_retail: priceRetail,
    price_official: priceOfficial,
    currency: 'RUB',
    stock_yanino: stockYanino,
    stock_factory: stockFactory,
    description: rawProduct.описание || rawProduct.description || `${name} из коллекции ${collection}`,
    images: [],
    main_image: '',
    interior_image: null,
    is_new: false,
    is_bestseller: false,
    is_discount: priceOfficial && priceRetail < priceOfficial,
    rating: 5,
    reviews_count: 0,
    _imageUrl: imageUrl
  }
}

/**
 * Основная функция
 */
async function main() {
  try {
    // Шаг 1: Парсим CSV
    const rawProducts = await parseCSV()
    
    // Шаг 2: Нормализуем данные
    console.log('🔄 Нормализация данных...')
    const products = rawProducts.map((raw, index) => normalizeProduct(raw, index))
    console.log(`✅ Данные нормализованы\n`)
    
    // Шаг 3: Скачиваем изображения
    console.log('📸 Загрузка изображений товаров...')
    console.log('⏳ Это может занять несколько минут...\n')
    
    let downloadedCount = 0
    let errorCount = 0
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const progress = `[${i + 1}/${products.length}]`
      
      if (product._imageUrl) {
        process.stdout.write(`${progress} ${product.sku}... `)
        
        const imagePath = await downloadProductImage(product._imageUrl, product.sku)
        
        if (imagePath) {
          product.images = [imagePath]
          product.main_image = imagePath
          console.log('✅')
          downloadedCount++
        } else {
          console.log('⚠️  пропущено')
          errorCount++
        }
      } else {
        console.log(`${progress} ${product.sku}... ⚠️  нет URL изображения`)
        errorCount++
      }
      
      // Удаляем временное поле
      delete product._imageUrl
      
      // Небольшая задержка, чтобы не перегружать сервер
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log(`\n✅ Загружено изображений: ${downloadedCount}`)
    console.log(`⚠️  Пропущено: ${errorCount}\n`)
    
    // Шаг 4: Сохраняем в TypeScript файл
    console.log('💾 Сохранение данных...')
    
    const tsContent = `// Автоматически сгенерировано скриптом import-products-from-sheets.mjs
// Дата: ${new Date().toISOString()}
// Товаров: ${products.length}

import { Product } from './mock-data'

export const importedProducts: Product[] = ${JSON.stringify(products, null, 2)}
`
    
    fs.writeFileSync(OUTPUT_JSON, tsContent, 'utf-8')
    console.log(`✅ Данные сохранены в: ${OUTPUT_JSON}\n`)
    
    // Статистика
    console.log('📊 СТАТИСТИКА ИМПОРТА')
    console.log('='.repeat(60))
    console.log(`Всего товаров:           ${products.length}`)
    console.log(`Загружено изображений:   ${downloadedCount}`)
    console.log(`Пропущено изображений:   ${errorCount}`)
    console.log(`Папка с изображениями:   ${IMAGES_DIR}`)
    console.log('='.repeat(60))
    
    // Группировка по коллекциям
    const collectionStats = products.reduce((acc, p) => {
      acc[p.collection] = (acc[p.collection] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📦 ТОП КОЛЛЕКЦИЙ:')
    Object.entries(collectionStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([collection, count]) => {
        console.log(`  ${collection}: ${count} товаров`)
      })
    
    console.log('\n✅ Импорт завершён успешно!')
    console.log('\n💡 Что дальше:')
    console.log('   1. Проверьте файл: lib/imported-products.ts')
    console.log('   2. Импортируйте товары в своё приложение:')
    console.log('      import { importedProducts } from "@/lib/imported-products"')
    console.log('   3. Объедините с существующими товарами или замените их')
    
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Запуск
main()
