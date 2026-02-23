#!/usr/bin/env python3
"""
Скрипт импорта товаров из CSV с загрузкой изображений
"""
import csv
import os
import json
import re
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
import time

# Пути
PROJECT_ROOT = Path(os.getcwd())
CSV_FILE = PROJECT_ROOT / 'scripts' / 'cersanit-products.csv'
IMAGES_DIR = PROJECT_ROOT / 'public' / 'images' / 'products'
LIB_DIR = PROJECT_ROOT / 'lib'
OUTPUT_FILE = LIB_DIR / 'imported-products.ts'

# Создаём директории
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
LIB_DIR.mkdir(parents=True, exist_ok=True)

def clean_text(text):
    """Очистка текста от лишних пробелов"""
    if not text:
        return ''
    return text.strip()

def download_image(url, filename):
    """Скачивание изображения с URL"""
    if not url or url == '':
        return None
    
    try:
        # Создаём запрос с User-Agent
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        req = Request(url, headers=headers)
        
        with urlopen(req, timeout=30) as response:
            data = response.read()
            
        # Определяем расширение из URL
        ext = '.jpg'
        if '.png' in url.lower():
            ext = '.png'
        elif '.jpeg' in url.lower():
            ext = '.jpeg'
            
        # Сохраняем файл
        file_path = IMAGES_DIR / f"{filename}{ext}"
        with open(file_path, 'wb') as f:
            f.write(data)
            
        return f"/images/products/{filename}{ext}"
    except (HTTPError, URLError) as e:
        print(f"  ⚠️  Ошибка загрузки {url}: {e}")
        return None
    except Exception as e:
        print(f"  ⚠️  Неожиданная ошибка при загрузке {url}: {e}")
        return None

def slugify(text):
    """Создание slug из текста"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def parse_price(text):
    """Парсинг цены из текста"""
    if not text:
        return 0
    try:
        # Убираем все кроме цифр и точки/запятой
        cleaned = re.sub(r'[^\d.,]', '', str(text))
        cleaned = cleaned.replace(',', '.')
        return float(cleaned) if cleaned else 0
    except:
        return 0

def main():
    print("🚀 Начинаем импорт товаров из CSV...")
    
    if not CSV_FILE.exists():
        print(f"❌ CSV файл не найден: {CSV_FILE}")
        print("\nПожалуйста, сохраните CSV файл как scripts/products.csv")
        return
    
    products = []
    
    # Читаем CSV
    print(f"\n📖 Читаем CSV файл: {CSV_FILE}")
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"✅ Найдено {len(rows)} строк в CSV")
    
    # Обрабатываем каждый товар
    for idx, row in enumerate(rows, 1):
        article = clean_text(row.get('Артикул', ''))
        name = clean_text(row.get('Наименование для сайта', ''))
        
        if not article or not name:
            continue
            
        print(f"\n[{idx}/{len(rows)}] Обрабатываем: {name}")
        
        # Основные данные
        product = {
            'id': article.replace('/', '-').replace('\\', '-'),
            'name': name,
            'article': article,
            'collection': clean_text(row.get('Коллекция', '')),
            'brand': clean_text(row.get('Бренд', 'Cersanit')),
            'product_type': clean_text(row.get('Тип элемента', '')),
            'color': clean_text(row.get('Цвет плитки', '')),
            'format': clean_text(row.get('Формат плиты номинальный', '')),
            'surface': clean_text(row.get('Поверхность', '')),
            'material': clean_text(row.get('Материал', '')),
            'application': clean_text(row.get('Применение', '')),
            'price_retail': 0,  # Цены нет в CSV
            'price_wholesale': 0,
            'in_stock': True,
            'images': []
        }
        
        # Загружаем фото плиты
        photo_url = clean_text(row.get('Фото плиты', ''))
        if photo_url:
            print(f"  📥 Загружаем главное фото...")
            image_filename = f"{slugify(article)}-main"
            image_path = download_image(photo_url, image_filename)
            if image_path:
                product['images'].append(image_path)
                product['image'] = image_path
                print(f"  ✅ Загружено: {image_path}")
            time.sleep(0.5)  # Пауза между запросами
        
        # Загружаем фото коллекции
        collection_photo = clean_text(row.get('Фото Коллекции', ''))
        if collection_photo and collection_photo not in [photo_url]:
            print(f"  📥 Загружаем фото коллекции...")
            image_filename = f"{slugify(article)}-collection"
            image_path = download_image(collection_photo, image_filename)
            if image_path:
                product['images'].append(image_path)
                print(f"  ✅ Загружено: {image_path}")
            time.sleep(0.5)
        
        # Загружаем дополнительные фото
        extra_photos = clean_text(row.get('Доп фото коллекции', ''))
        if extra_photos:
            extra_urls = [url.strip() for url in extra_photos.split(';') if url.strip()]
            for i, extra_url in enumerate(extra_urls[:3], 1):  # Макс 3 доп фото
                print(f"  📥 Загружаем доп фото {i}...")
                image_filename = f"{slugify(article)}-extra-{i}"
                image_path = download_image(extra_url, image_filename)
                if image_path:
                    product['images'].append(image_path)
                    print(f"  ✅ Загружено: {image_path}")
                time.sleep(0.5)
        
        # Если нет изображений, добавляем плейсхолдер
        if not product['images']:
            product['image'] = '/images/placeholder.jpg'
            product['images'] = ['/images/placeholder.jpg']
        elif 'image' not in product:
            product['image'] = product['images'][0]
        
        products.append(product)
        print(f"  ✅ Товар добавлен ({len(product['images'])} фото)")
    
    print(f"\n\n📦 Обработано товаров: {len(products)}")
    print(f"🖼️  Загружено изображений в {IMAGES_DIR}")
    
    # Генерируем TypeScript файл
    print(f"\n📝 Создаём TypeScript файл: {OUTPUT_FILE}")
    
    ts_content = '''// Автоматически сгенерированный файл с импортированными товарами
// Сгенерировано: ''' + time.strftime('%Y-%m-%d %H:%M:%S') + '''

export interface ImportedProduct {
  id: string;
  name: string;
  article: string;
  collection: string;
  brand: string;
  product_type: string;
  color: string;
  format: string;
  surface: string;
  material: string;
  application: string;
  price_retail: number;
  price_wholesale: number;
  in_stock: boolean;
  image: string;
  images: string[];
}

export const importedProducts: ImportedProduct[] = '''
    
    ts_content += json.dumps(products, ensure_ascii=False, indent=2)
    ts_content += ';\n'
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"✅ Файл создан: {OUTPUT_FILE}")
    print(f"\n🎉 Импорт завершён успешно!")
    print(f"   📊 Всего товаров: {len(products)}")
    print(f"   📁 Изображения: {IMAGES_DIR}")
    print(f"   💾 Данные: {OUTPUT_FILE}")
    
    # Статистика по коллекциям
    collections = {}
    for p in products:
        coll = p['collection']
        collections[coll] = collections.get(coll, 0) + 1
    
    print(f"\n📈 Статистика по коллекциям:")
    for coll, count in sorted(collections.items(), key=lambda x: -x[1])[:10]:
        print(f"   {coll}: {count} товаров")

if __name__ == '__main__':
    main()
