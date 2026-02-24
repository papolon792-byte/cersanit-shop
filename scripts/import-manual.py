#!/usr/bin/env python3
"""
Скрипт для импорта товаров из локального CSV файла
Инструкция:
1. Откройте Google Sheets: https://docs.google.com/spreadsheets/d/1uBg2NMNzF4GzNPSVzVO7N4vnllDfCihapIzsJwntDrE
2. Нажмите Файл → Скачать → CSV (.csv)
3. Сохраните файл в папку scripts/ с именем products.csv
4. Запустите этот скрипт
"""
import csv
import json
import os
import sys
from pathlib import Path
from urllib.request import urlretrieve
import time
import re

# Пути
PROJECT_ROOT = Path(os.getcwd())
IMAGES_DIR = PROJECT_ROOT / 'public' / 'images' / 'products'
LIB_DIR = PROJECT_ROOT / 'lib'
OUTPUT_FILE = LIB_DIR / 'imported-products.ts'
CSV_FILE = PROJECT_ROOT / 'scripts' / 'products.csv'

# Создаём папки
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
LIB_DIR.mkdir(parents=True, exist_ok=True)

def slugify(text):
    """Генерация slug из текста"""
    text = str(text).lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

def download_image(url, product_name, index):
    """Скачивание изображения"""
    if not url or not str(url).startswith('http'):
        return None
    
    try:
        # Определяем расширение
        ext = '.jpg'
        url_lower = url.lower()
        if '.png' in url_lower:
            ext = '.png'
        elif '.jpeg' in url_lower or '.jpg' in url_lower:
            ext = '.jpg'
        
        # Генерируем имя файла
        slug = slugify(product_name) if product_name else f'product-{index}'
        timestamp = int(time.time() * 1000)  # milliseconds
        filename = f'{slug}-{timestamp}{ext}'
        filepath = IMAGES_DIR / filename
        
        print(f'  📷 Скачиваем изображение: {url[:60]}...')
        urlretrieve(url, filepath)
        print(f'  ✅ Изображение сохранено: {filename}')
        
        return f'/images/products/{filename}'
    except Exception as e:
        print(f'  ⚠️  Ошибка загрузки изображения: {e}')
        return None

def parse_float(value):
    """Безопасное преобразование в float"""
    if not value:
        return 0.0
    try:
        # Убираем пробелы и заменяем запятую на точку
        value = str(value).strip().replace(',', '.').replace(' ', '')
        return float(value)
    except:
        return 0.0

def parse_int(value):
    """Безопасное преобразование в int"""
    if not value:
        return 0
    try:
        return int(float(str(value).strip().replace(',', '.').replace(' ', '')))
    except:
        return 0

def main():
    print('🚀 Начинаем импорт товаров из CSV файла...\n')
    
    # Проверяем наличие CSV файла
    if not CSV_FILE.exists():
        print(f'❌ Файл не найден: {CSV_FILE}')
        print('\n📋 Инструкция:')
        print('   1. Откройте: https://docs.google.com/spreadsheets/d/1uBg2NMNzF4GzNPSVzVO7N4vnllDfCihapIzsJwntDrE')
        print('   2. Нажмите: Файл → Скачать → CSV (.csv)')
        print('   3. Сохраните как: scripts/products.csv')
        print('   4. Запустите скрипт снова')
        sys.exit(1)
    
    try:
        # Читаем CSV
        print(f'📥 Читаем файл: {CSV_FILE.name}')
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        print(f'✅ Найдено {len(rows)} строк данных')
        
        # Показываем колонки для отладки
        if rows:
            print(f'\n📋 Доступные колонки ({len(rows[0])}):')
            for col in rows[0].keys():
                print(f'   • {col}')
            print()
        
        # Обрабатываем товары
        products = []
        image_count = 0
        
        for i, row in enumerate(rows, 1):
            # Пытаемся определить название товара
            name = None
            for key in ['Название', 'название', 'Name', 'Наименование', 'наименование', 'Товар']:
                if key in row and row[key]:
                    name = row[key]
                    break
            
            if not name:
                # Берём первую непустую колонку
                for value in row.values():
                    if value and str(value).strip():
                        name = str(value).strip()
                        break
            
            if not name or not str(name).strip():
                name = f'Товар {i}'
            
            print(f'\n[{i}/{len(rows)}] Обработка: {name}')
            
            # Ищем URL изображения
            image_url = None
            for key in ['Фото URL', 'фото url', 'Image URL', 'URL', 'Изображение', 'Фото', 'фото']:
                if key in row and row[key]:
                    image_url = row[key]
                    break
            
            # Скачиваем изображение
            image_path = '/images/products/default.jpg'
            if image_url:
                downloaded = download_image(image_url, name, i)
                if downloaded:
                    image_path = downloaded
                    image_count += 1
                time.sleep(0.5)  # Небольшая задержка между загрузками
            
            # Собираем данные товара
            product = {
                'id': i,
                'name': str(name).strip(),
                'slug': slugify(name),
                'collection': row.get('Коллекция') or row.get('коллекция') or row.get('Collection') or 'Без коллекции',
                'product_type': row.get('Тип') or row.get('тип') or row.get('Type') or 'Напольная плитка',
                'color': row.get('Цвет') or row.get('цвет') or row.get('Color') or 'Белый',
                'format': row.get('Формат') or row.get('формат') or row.get('Format') or '60x60',
                'surface': row.get('Поверхность') or row.get('поверхность') or row.get('Surface') or 'Матовая',
                'application': row.get('Применение') or row.get('применение') or row.get('Application') or 'Пол',
                'price_retail': parse_float(row.get('Цена') or row.get('цена') or row.get('Price') or 0),
                'stock': parse_int(row.get('Остаток') or row.get('остаток') or row.get('Stock') or 0),
                'image': image_path,
                'images': [image_path],
                'description': row.get('Описание') or row.get('описание') or row.get('Description') or '',
                'specifications': {
                    'thickness': row.get('Толщина') or row.get('толщина') or '8 мм',
                    'wear_resistance': row.get('Износостойкость') or 'PEI IV',
                    'water_absorption': row.get('Водопоглощение') or '< 0.5%',
                    'frost_resistance': row.get('Морозостойкость') or 'Да',
                }
            }
            
            products.append(product)
            print(f'  ✅ Товар добавлен (Цена: {product["price_retail"]} ₽, Остаток: {product["stock"]} шт)')
        
        # Генерируем TypeScript файл
        print('\n\n📝 Генерируем TypeScript файл...')
        
        ts_content = f'''// Auto-generated from CSV import
// Generated at: {time.strftime("%Y-%m-%d %H:%M:%S")}
// Total products: {len(products)}
// Downloaded images: {image_count}

export interface Product {{
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
  specifications: {{
    thickness: string;
    wear_resistance: string;
    water_absorption: string;
    frost_resistance: string;
  }};
}}

export const importedProducts: Product[] = {json.dumps(products, ensure_ascii=False, indent=2)};

export default importedProducts;
'''
        
        OUTPUT_FILE.write_text(ts_content, encoding='utf-8')
        print(f'✅ Файл создан: {OUTPUT_FILE}')
        
        # Статистика
        print('\n\n✨ ИМПОРТ ЗАВЕРШЁН! ✨\n')
        print('📊 Статистика:')
        print(f'   • Всего товаров: {len(products)}')
        print(f'   • Скачано изображений: {image_count}')
        print(f'   • Файл данных: lib/imported-products.ts')
        print(f'   • Папка изображений: public/images/products/')
        
        print('\n📋 Следующие шаги:')
        print('   1. Проверьте файл lib/imported-products.ts')
        print('   2. Замените в lib/mock-data.ts:')
        print('      import { importedProducts as products } from "./imported-products"')
        print('      export { products }')
        
    except Exception as e:
        print(f'\n❌ Ошибка импорта: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
