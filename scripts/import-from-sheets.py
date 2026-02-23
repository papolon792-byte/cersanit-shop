#!/usr/bin/env python3
"""
Скрипт для импорта товаров из Google Sheets
"""
import csv
import json
import os
import sys
from pathlib import Path
from urllib.request import urlopen, urlretrieve
from urllib.parse import quote
import time

# Google Sheets ID
SHEET_ID = '1uBg2NMNzF4GzNPSVzVO7N4vnllDfCihapIzsJwntDrE'
CSV_URL = f'https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0'

# Пути
PROJECT_ROOT = Path(__file__).parent.parent
IMAGES_DIR = PROJECT_ROOT / 'public' / 'images' / 'products'
LIB_DIR = PROJECT_ROOT / 'lib'
OUTPUT_FILE = LIB_DIR / 'imported-products.ts'

# Создаём папки
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
LIB_DIR.mkdir(parents=True, exist_ok=True)

def slugify(text):
    """Генерация slug из текста"""
    import re
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

def download_image(url, product_name, index):
    """Скачивание изображения"""
    if not url or not url.startswith('http'):
        return None
    
    try:
        # Определяем расширение
        ext = '.jpg'
        if '.png' in url.lower():
            ext = '.png'
        elif '.jpeg' in url.lower() or '.jpg' in url.lower():
            ext = '.jpg'
        
        # Генерируем имя файла
        slug = slugify(product_name) if product_name else f'product-{index}'
        filename = f'{slug}-{int(time.time())}{ext}'
        filepath = IMAGES_DIR / filename
        
        print(f'  📷 Скачиваем изображение...')
        urlretrieve(url, filepath)
        print(f'  ✅ Изображение сохранено: {filename}')
        
        return f'/images/products/{filename}'
    except Exception as e:
        print(f'  ⚠️  Ошибка загрузки изображения: {e}')
        return None

def main():
    print('🚀 Начинаем импорт товаров из Google Sheets...\n')
    
    try:
        # Скачиваем CSV
        print('📥 Скачиваем данные из Google Sheets...')
        with urlopen(CSV_URL) as response:
            csv_data = response.read().decode('utf-8')
        print('✅ Данные получены\n')
        
        # Парсим CSV
        print('📊 Парсим данные...')
        reader = csv.DictReader(csv_data.splitlines())
        rows = list(reader)
        
        print(f'✅ Найдено {len(rows)} строк данных')
        
        # Показываем колонки для отладки
        if rows:
            print(f'\n📋 Доступные колонки: {", ".join(rows[0].keys())}\n')
        
        # Обрабатываем товары
        products = []
        image_count = 0
        
        for i, row in enumerate(rows, 1):
            # Пытаемся определить название товара из разных возможных колонок
            name = (row.get('Название') or 
                   row.get('название') or 
                   row.get('Name') or 
                   row.get('Наименование') or 
                   row.get('наименование') or
                   list(row.values())[0] if row else None)
            
            if not name or not name.strip():
                name = f'Товар {i}'
            
            print(f'\n[{i}/{len(rows)}] Обработка: {name}')
            
            # Скачиваем изображение
            image_url = (row.get('Фото URL') or 
                        row.get('фото url') or 
                        row.get('Image URL') or 
                        row.get('URL') or 
                        row.get('Изображение') or '')
            
            image_path = '/images/products/default.jpg'
            if image_url:
                downloaded = download_image(image_url, name, i)
                if downloaded:
                    image_path = downloaded
                    image_count += 1
            
            # Собираем данные товара
            product = {
                'id': i,
                'name': name,
                'slug': slugify(name),
                'collection': row.get('Коллекция') or row.get('коллекция') or 'Без коллекции',
                'product_type': row.get('Тип') or row.get('тип') or 'Напольная плитка',
                'color': row.get('Цвет') or row.get('цвет') or 'Белый',
                'format': row.get('Формат') or row.get('формат') or '60x60',
                'surface': row.get('Поверхность') or row.get('поверхность') or 'Матовая',
                'application': row.get('Применение') or row.get('применение') or 'Пол',
                'price_retail': float(row.get('Цена') or row.get('цена') or 0),
                'stock': int(row.get('Остаток') or row.get('остаток') or 0),
                'image': image_path,
                'images': [image_path],
                'description': row.get('Описание') or row.get('описание') or '',
                'specifications': {
                    'thickness': row.get('Толщина') or '8 мм',
                    'wear_resistance': row.get('Износостойкость') or 'PEI IV',
                    'water_absorption': row.get('Водопоглощение') or '< 0.5%',
                    'frost_resistance': row.get('Морозостойкость') or 'Да',
                }
            }
            
            products.append(product)
            print(f'  ✅ Товар добавлен')
        
        # Генерируем TypeScript файл
        print('\n\n📝 Генерируем TypeScript файл...')
        
        ts_content = f'''// Auto-generated from Google Sheets
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
        print('   2. Используйте импортированные данные в вашем приложении:')
        print('      import { importedProducts } from "@/lib/imported-products"')
        
    except Exception as e:
        print(f'\n❌ Ошибка импорта: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
