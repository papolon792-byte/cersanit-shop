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

export const products: Product[] = [
  {
    id: "LS4O096",
    sku: "A-LS4O096\\J",
    name: "Ступень Cersanit Lofthouse серый 29,7x59,8",
    slug: "stepen-lofthouse-seryy-30x60",
    collection: "Lofthouse",
    product_type: "Ступень",
    color: "серый",
    format: "30x60",
    surface: "матовая",
    application: "Пол",
    price_retail: 1200,
    main_image: "https://pvi.cersanit.ru/upload/uf/8c9/LS4O096.jpg",
    images: ["https://pvi.cersanit.ru/upload/uf/8c9/LS4O096.jpg"],
    brand: "Cersanit",
    material_type: "Керамогранит",
    country: "РОССИЯ",
    rating: 4.7,
    reviews_count: 24,
    stock_yanino: 150,
    stock_factory: 300,
    currency: "RUB"
  },
  {
    id: "LS4O526",
    name: "Ступень Cersanit Lofthouse светло-серый 29,7x59,8",
    collection: "Lofthouse",
    product_type: "Ступень",
    color: "светло-серый",
    format: "30x60",
    surface: "матовая",
    application: "Пол",
    price_retail: 1200,
    image: "https://pvi.cersanit.ru/upload/uf/e1d/LS4O526.jpg",
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Бетон",
    stock_quantity: 120
  },
  {
    id: "LS5A096",
    name: "Плинтус Cersanit Lofthouse серый 7x59,8",
    collection: "Lofthouse",
    product_type: "Плинтус",
    color: "серый",
    format: "7x60",
    surface: "матовая",
    application: "Универсальный",
    price_retail: 450,
    image: "https://pvi.cersanit.ru/upload/uf/a4f/LS5A096.jpg",
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Бетон",
    stock_quantity: 200
  },
  {
    id: "LS5A526",
    name: "Плинтус Cersanit Lofthouse светло-серый 7x59,8",
    collection: "Lofthouse",
    product_type: "Плинтус",
    color: "светло-серый",
    format: "7x60",
    surface: "матовая",
    application: "Универсальный",
    price_retail: 450,
    image: "https://pvi.cersanit.ru/upload/uf/2f9/LS5A526.jpg",
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Бетон",
    stock_quantity: 180
  },
  {
    id: "LS6O096",
    name: "Мозаика на сетке Cersanit Lofthouse серый 28,3x24,6",
    collection: "Lofthouse",
    product_type: "Мозаика на сетке",
    color: "серый",
    format: "28x25",
    surface: "матовая",
    application: "Универсальный",
    price_retail: 890,
    image: "https://pvi.cersanit.ru/upload/uf/1d7/LS6O096.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/0db/INT_LOFTHOUSE_5_1.jpg",
    additional_images: [
      "https://pvi.cersanit.ru/upload/uf/ed3/INT_LOFTHOUSE_5_3.jpg",
      "https://pvi.cersanit.ru/upload/uf/5aa/INT_LOFTHOUSE_5_4.jpg",
      "https://pvi.cersanit.ru/upload/uf/b7f/INT_LOFTHOUSE_5_5.jpg",
      "https://pvi.cersanit.ru/upload/uf/c13/INT_LOFTHOUSE_5_6.jpg"
    ],
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Бетон",
    stock_quantity: 100
  },
  {
    id: "LS6O526",
    name: "Мозаика на сетке Cersanit Lofthouse светло-серый 28,3x24,6",
    collection: "Lofthouse",
    product_type: "Мозаика на сетке",
    color: "светло-серый",
    format: "28x25",
    surface: "матовая",
    application: "Универсальный",
    price_retail: 890,
    image: "https://pvi.cersanit.ru/upload/uf/e19/LS6O526.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/3c8/2_13_.jpg",
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Бетон",
    stock_quantity: 90
  },
  {
    id: "RS2L451",
    name: "Мозаика на сетке Cersanit Royal Stone многоцветный 30x30",
    collection: "Royal Stone",
    product_type: "Мозаика на сетке",
    color: "многоцветный",
    format: "30x30",
    surface: "глянцевая",
    application: "Стена",
    price_retail: 950,
    image: "https://pvi.cersanit.ru/upload/uf/084/RS2L451.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/cb8/INT_Royal_stone_2_1.jpg",
    additional_images: [
      "https://pvi.cersanit.ru/upload/uf/299/INT_Royal_stone_2_2.jpg",
      "https://pvi.cersanit.ru/upload/uf/976/INT_Royal_stone_2_3.jpg",
      "https://pvi.cersanit.ru/upload/uf/cae/Royal_Stone.jpg"
    ],
    brand: "Cersanit",
    material: "Керамическая плитка",
    design: "Камень",
    stock_quantity: 75
  },
  {
    id: "WS4O116",
    name: "Ступень Cersanit Woodhouse коричневый 29,7x59,8",
    collection: "Woodhouse",
    product_type: "Ступень",
    color: "коричневый",
    format: "30x60",
    surface: "матовая",
    application: "Пол",
    price_retail: 1250,
    image: "https://pvi.cersanit.ru/upload/uf/27d/WS4O116.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/f0c/INT_Woodhouse_WS4O112_3_1.jpg",
    additional_images: [
      "https://pvi.cersanit.ru/upload/uf/1cf/INT_Woodhouse_WS4O112_3_3.jpg"
    ],
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Дерево",
    stock_quantity: 110
  },
  {
    id: "WS4O156",
    name: "Ступень Cersanit Woodhouse темно-бежевый 29,7x59,8",
    collection: "Woodhouse",
    product_type: "Ступень",
    color: "темно-бежевый",
    format: "30x60",
    surface: "матовая",
    application: "Пол",
    price_retail: 1250,
    image: "https://pvi.cersanit.ru/upload/uf/228/WS4O156.jpg",
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Дерево",
    stock_quantity: 95
  },
  {
    id: "WS4O526",
    name: "Ступень Cersanit Woodhouse светло-серый 29,7x59,8",
    collection: "Woodhouse",
    product_type: "Ступень",
    color: "светло-серый",
    format: "30x60",
    surface: "матовая",
    application: "Пол",
    price_retail: 1250,
    image: "https://pvi.cersanit.ru/upload/uf/ae3/WS4O526.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/ae1/INT_Woodhouse_522_3_3.jpg",
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Дерево",
    stock_quantity: 130
  },
  {
    id: "WS5A116",
    name: "Плинтус Cersanit Woodhouse коричневый 7x59,8",
    collection: "Woodhouse",
    product_type: "Плинтус",
    color: "коричневый",
    format: "7x60",
    surface: "матовая",
    application: "Универсальный",
    price_retail: 470,
    image: "https://pvi.cersanit.ru/upload/uf/23b/WS5A116.jpg",
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Дерево",
    stock_quantity: 220
  },
  {
    id: "WS5A156",
    name: "Плинтус Cersanit Woodhouse темно-бежевый 7x59,8",
    collection: "Woodhouse",
    product_type: "Плинтус",
    color: "темно-бежевый",
    format: "7x60",
    surface: "матовая",
    application: "Универсальный",
    price_retail: 470,
    image: "https://pvi.cersanit.ru/upload/uf/f64/WS5A156.jpg",
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Дерево",
    stock_quantity: 190
  },
  {
    id: "WS5A526",
    name: "Плинтус Cersanit Woodhouse светло-серый 7x59,8",
    collection: "Woodhouse",
    product_type: "Плинтус",
    color: "светло-серый",
    format: "7x60",
    surface: "матовая",
    application: "Универсальный",
    price_retail: 470,
    image: "https://pvi.cersanit.ru/upload/uf/3d6/WS5A526.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/ae1/INT_Woodhouse_522_3_3.jpg",
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Дерево",
    stock_quantity: 200
  },
  {
    id: "WS6O116",
    name: "Мозаика на сетке Cersanit Woodhouse коричневый 30x30",
    collection: "Woodhouse",
    product_type: "Мозаика на сетке",
    color: "коричневый",
    format: "30x30",
    surface: "матовая",
    application: "Универсальный",
    price_retail: 920,
    image: "https://pvi.cersanit.ru/upload/uf/e89/WS6O116.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/f0c/INT_Woodhouse_WS4O112_3_1.jpg",
    additional_images: [
      "https://pvi.cersanit.ru/upload/uf/3fb/INT_Lofthouse_Mix_2_1.jpg",
      "https://pvi.cersanit.ru/upload/uf/d5b/INT_Lofthouse_Mix_2_2.jpg",
      "https://pvi.cersanit.ru/upload/uf/e37/INT_Lofthouse_Mix_2_3.jpg"
    ],
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Дерево",
    stock_quantity: 85
  },
  {
    id: "NW4M012",
    name: "Керамогранит Cersanit Northwood бежевый 18,5x59,8",
    collection: "Northwood",
    product_type: "Керамогранит",
    color: "бежевый",
    format: "18x60",
    surface: "матовая",
    application: "Универсальный",
    price_retail: 780,
    image: "https://pvi.cersanit.ru/upload/uf/5b6/C_NW4M012D_1a.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/f6c/Northwood_1.jpg",
    additional_images: [
      "https://pvi.cersanit.ru/upload/uf/1f6/INT_Northwood_012_2_1.jpg",
      "https://pvi.cersanit.ru/upload/uf/a08/INT_Northwood_012_2_2.jpg",
      "https://pvi.cersanit.ru/upload/uf/f49/INT_Northwood_012_2_3.jpg"
    ],
    brand: "Cersanit",
    material: "Керамогранит",
    design: "Дерево",
    stock_quantity: 300
  },
  {
    id: "DE2L381",
    name: "Настенная вставка Cersanit Deco орнамент золотистый 29,8x59,8",
    collection: "Deco",
    product_type: "Настенная вставка",
    color: "золотистый",
    format: "30x60",
    surface: "глянцевая",
    application: "Стена",
    price_retail: 850,
    image: "https://pvi.cersanit.ru/upload/uf/028/DE2L381.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/3a2/Deco_Large_1_2.jpg",
    additional_images: [
      "https://pvi.cersanit.ru/upload/uf/58d/Deco_Large_1.jpg",
      "https://pvi.cersanit.ru/upload/uf/25b/Deco_Large_2.jpg",
      "https://pvi.cersanit.ru/upload/uf/4ab/Deco_Large_3.jpg"
    ],
    brand: "Cersanit",
    material: "Керамическая плитка",
    design: "Узоры",
    stock_quantity: 60
  },
  {
    id: "DEL232",
    name: "Плитка Cersanit Deco черный рельеф 29,8x59,8",
    collection: "Deco",
    product_type: "Плитка",
    color: "черный",
    format: "30x60",
    surface: "глянцевая",
    application: "Стена",
    price_retail: 720,
    image: "https://pvi.cersanit.ru/upload/uf/b22/DEL232.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/3a2/Deco_Large_1_2.jpg",
    additional_images: [
      "https://pvi.cersanit.ru/upload/uf/58d/Deco_Large_1.jpg",
      "https://pvi.cersanit.ru/upload/uf/25b/Deco_Large_2.jpg"
    ],
    brand: "Cersanit",
    material: "Керамическая плитка",
    design: "Моноколор",
    stock_quantity: 250
  },
  {
    id: "KT2L051",
    name: "Настенная вставка Cersanit Calacatta узор белый 29,8x59,8",
    collection: "Calacatta",
    product_type: "Настенная вставка",
    color: "белый",
    format: "30x60",
    surface: "глянцевая",
    application: "Стена",
    price_retail: 870,
    image: "https://pvi.cersanit.ru/upload/uf/d5d/KT2L051.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/1e0/Calacatta_Large_1_2.jpg",
    additional_images: [
      "https://pvi.cersanit.ru/upload/uf/b00/Int_Calacatta_2.jpg",
      "https://pvi.cersanit.ru/upload/uf/020/Int_Calacatta_3.jpg",
      "https://pvi.cersanit.ru/upload/uf/ae8/Calacatta_large_1.jpg"
    ],
    brand: "Cersanit",
    material: "Керамическая плитка",
    design: "Узоры",
    stock_quantity: 70
  },
  {
    id: "KTL051",
    name: "Плитка Cersanit Calacatta белый 29,8x59,8",
    collection: "Calacatta",
    product_type: "Плитка",
    color: "белый",
    format: "30x60",
    surface: "глянцевая",
    application: "Стена",
    price_retail: 740,
    image: "https://pvi.cersanit.ru/upload/uf/77c/KTL051st.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/1e0/Calacatta_Large_1_2.jpg",
    additional_images: [
      "https://pvi.cersanit.ru/upload/uf/b00/Int_Calacatta_2.jpg",
      "https://pvi.cersanit.ru/upload/uf/020/Int_Calacatta_3.jpg"
    ],
    brand: "Cersanit",
    material: "Керамическая плитка",
    design: "Камень",
    stock_quantity: 280
  },
  {
    id: "KTL052",
    name: "Плитка Cersanit Calacatta белый рельеф 29,8x59,8",
    collection: "Calacatta",
    product_type: "Плитка",
    color: "белый",
    format: "30x60",
    surface: "глянцевая",
    application: "Стена",
    price_retail: 760,
    image: "https://pvi.cersanit.ru/upload/uf/c2b/KTL052.jpg",
    collection_image: "https://pvi.cersanit.ru/upload/uf/1e0/Calacatta_Large_1_2.jpg",
    additional_images: [
      "https://pvi.cersanit.ru/upload/uf/b00/Int_Calacatta_2.jpg",
      "https://pvi.cersanit.ru/upload/uf/020/Int_Calacatta_3.jpg"
    ],
    brand: "Cersanit",
    material: "Керамическая плитка",
    design: "Камень",
    stock_quantity: 260
  }
]
