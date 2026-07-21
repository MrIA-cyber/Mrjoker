import { Product, Merchant, Neighborhood, Review, Order } from '../types';

export const BAFOUSSAM_NEIGHBORHOODS: Neighborhood[] = [
  { id: 'tamdja', name: 'Tamdja', deliveryFee: 500, estMinutes: 15, coordinates: { x: 120, y: 150 } },
  { id: 'bamendzi', name: 'Bamendzi', deliveryFee: 500, estMinutes: 20, coordinates: { x: 250, y: 110 } },
  { id: 'banengo', name: 'Banengo', deliveryFee: 500, estMinutes: 25, coordinates: { x: 280, y: 220 } },
  { id: 'djeleng', name: 'Djeleng', deliveryFee: 500, estMinutes: 18, coordinates: { x: 100, y: 260 } },
  { id: 'famla', name: 'Famla', deliveryFee: 500, estMinutes: 22, coordinates: { x: 180, y: 310 } },
  { id: 'ndiangdam', name: 'Ndiangdam', deliveryFee: 500, estMinutes: 30, coordinates: { x: 340, y: 330 } },
  { id: 'carrefour-bamiléké', name: 'Carrefour Bamiléké', deliveryFee: 500, estMinutes: 15, coordinates: { x: 190, y: 200 } },
  { id: 'marche-a', name: 'Marché A (Centre-ville)', deliveryFee: 500, estMinutes: 12, coordinates: { x: 150, y: 180 } },
  { id: 'autre-ouest', name: 'Autre quartier (Ouest Cameroun)', deliveryFee: 500, estMinutes: 35, coordinates: { x: 220, y: 280 } },
];

export const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: 'm1',
    name: 'Mbiandou Paul',
    shopName: 'Maison du Café de l\'Ouest',
    location: 'Marché A (Centre-ville)',
    phone: '+237 677 89 45 12',
    email: 'mbiandou.coffee@gmail.com',
    password: 'bafoussam',
    isPremium: true,
    premiumStartDate: '2026-01-10',
    premiumExpiryDate: '2027-01-10',
    isVerified: true,
    logo: '☕',
    views: 1420,
    clicks: 345,
    sales: 112000,
  },
  {
    id: 'm2',
    name: 'Nguemgne Florence',
    shopName: 'Ndop & Traditions Bamiléké',
    location: 'Marché Congo',
    phone: '+237 699 12 34 56',
    email: 'florence.ndop@yahoo.com',
    password: 'bafoussam',
    isPremium: true,
    premiumStartDate: '2026-03-15',
    premiumExpiryDate: '2027-03-15',
    isVerified: true,
    logo: '👑',
    views: 2150,
    clicks: 512,
    sales: 385000,
  },
  {
    id: 'm3',
    name: 'Kengne Sylvain',
    shopName: 'Bafoussam Tech Hub & Électronique',
    location: 'Carrefour Bamiléké',
    phone: '+237 655 45 78 90',
    email: 'sylvain.tech@gmail.com',
    password: 'bafoussam',
    isPremium: true,
    premiumStartDate: '2026-05-01',
    premiumExpiryDate: '2027-05-01',
    logo: '⚡',
    views: 3100,
    clicks: 680,
    sales: 750000,
  },
  {
    id: 'm4',
    name: 'Tchoffo Jean-Pierre',
    shopName: 'Saveurs Agricoles de Bamendzi',
    location: 'Bamendzi',
    phone: '+237 670 11 22 33',
    email: 'tchoffo.agri@hotmail.com',
    password: 'bafoussam',
    isPremium: false,
    logo: '🌾',
    views: 450,
    clicks: 95,
    sales: 45000,
  },
  {
    id: 'm5',
    name: 'Mafouo Delphine',
    shopName: 'Épices de l\'Ouest & Ingrédients Achou',
    location: 'Marché B',
    phone: '+237 691 88 77 66',
    email: 'delphine.epices@gmail.com',
    password: 'bafoussam',
    isPremium: false,
    logo: '🌶️',
    views: 520,
    clicks: 110,
    sales: 68000,
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Café Arabica Pur de Bafoussam (250g)',
    description: 'Café arabica d\'altitude cultivé sur les terres volcaniques de l\'Ouest Cameroun. Torréfaction artisanale à Bafoussam, arômes riches et intenses avec notes de cacao.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60',
    category: 'Alimentation & Épicerie',
    merchantId: 'm1',
    merchantName: 'Maison du Café de l\'Ouest',
    isBoosted: true,
    boostExpiryDate: '2026-07-28T10:00:00.000Z',
    boostCount: 1,
    stock: 50,
    rating: 4.8,
    reviewsCount: 24,
    origin: 'Local (Bafoussam)'
  },
  {
    id: 'p2',
    name: 'Tissu Ndop Royal Traditionnel Bamiléké',
    description: 'Véritable tissu Ndop en coton lourd, teint à l\'indigo traditionnel avec des motifs rituels sacrés du peuple Bamiléké. Utilisé pour les grandes cérémonies et la décoration royale.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
    category: 'Artisanat & Mode',
    merchantId: 'm2',
    merchantName: 'Ndop & Traditions Bamiléké',
    isBoosted: true,
    boostExpiryDate: '2026-07-28T10:00:00.000Z',
    boostCount: 1,
    stock: 8,
    rating: 4.9,
    reviewsCount: 12,
    origin: 'Local (Ouest Cameroun)'
  },
  {
    id: 'p3',
    name: 'Smartphone Tecno Spark 10 Pro (256GB)',
    description: 'Smartphone performant idéal pour le commerce en ligne et la communication. Caméra selfie 32MP, 16GB RAM extensible, batterie 5000mAh. Garantie officielle 12 mois.',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
    category: 'Électronique & Tech',
    merchantId: 'm3',
    merchantName: 'Bafoussam Tech Hub & Électronique',
    isBoosted: true,
    boostExpiryDate: '2026-07-28T10:00:00.000Z',
    boostCount: 1,
    stock: 15,
    rating: 4.7,
    reviewsCount: 42,
    origin: 'Importé'
  },
  {
    id: 'p4',
    name: 'Sac de Taro Sélectionné pour Achou (10kg)',
    description: 'Taro de qualité supérieure, récolté à maturité dans les plaines fertiles autour de Bafoussam. Idéal pour obtenir la pâte souple et élastique nécessaire pour le plat traditionnel Achou.',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=500&auto=format&fit=crop&q=60',
    category: 'Alimentation & Épicerie',
    merchantId: 'm4',
    merchantName: 'Saveurs Agricoles de Bamendzi',
    isBoosted: false,
    stock: 20,
    rating: 4.5,
    reviewsCount: 9,
    origin: 'Local (Bamendzi)'
  },
  {
    id: 'p5',
    name: 'Mélange Spécial d\'Épices Achou (Lot de 3)',
    description: 'Assortiment d\'épices locales traditionnelles (4 côtés, Clous de girofle locaux, etc.) pour réaliser la sauce jaune onctueuse de l\'Achou. Recette secrète de grand-mère de Foumbot.',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60',
    category: 'Alimentation & Épicerie',
    merchantId: 'm5',
    merchantName: 'Épices de l\'Ouest & Ingrédients Achou',
    isBoosted: false,
    stock: 45,
    rating: 4.6,
    reviewsCount: 15,
    origin: 'Local (Marché B)'
  },
  {
    id: 'p6',
    name: 'Panier de Tomates Bio de Bamendzi (Grande Cagette)',
    description: 'Tomates fraîches, charnues et juteuses cueillies le matin même dans nos coopératives de Bamendzi. Sans pesticides de synthèse, parfaites pour vos sauces de poisson ou poulet.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60',
    category: 'Alimentation & Épicerie',
    merchantId: 'm4',
    merchantName: 'Saveurs Agricoles de Bamendzi',
    isBoosted: false,
    stock: 12,
    rating: 4.4,
    reviewsCount: 7,
    origin: 'Local (Bafoussam)'
  },
  {
    id: 'p7',
    name: 'Robe Moderne Brodée de Motifs Ndop',
    description: 'Création stylée mêlant coupe moderne contemporaine et broderies précieuses de motifs Ndop royaux sur les manches et l\'encolure. Confectionnée sur mesure par nos couturiers de Tamdja.',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60',
    category: 'Artisanat & Mode',
    merchantId: 'm2',
    merchantName: 'Ndop & Traditions Bamiléké',
    isBoosted: true,
    boostExpiryDate: '2026-07-28T10:00:00.000Z',
    boostCount: 1,
    stock: 5,
    rating: 4.9,
    reviewsCount: 18,
    origin: 'Local (Bafoussam)'
  },
  {
    id: 'p8',
    name: 'Enceinte Bluetooth Waterproof Oraimo',
    description: 'Enceinte sans fil puissante avec basses profondes pour égayer vos soirées et moments de détente. Autonomie 12h, connexion rapide. Idéal pour les jeunes de Tamdja et Bamendzi.',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60',
    category: 'Électronique & Tech',
    merchantId: 'm3',
    merchantName: 'Bafoussam Tech Hub & Électronique',
    isBoosted: true,
    boostExpiryDate: '2026-07-28T10:00:00.000Z',
    boostCount: 1,
    stock: 8,
    rating: 4.5,
    reviewsCount: 30,
    origin: 'Importé'
  },
  {
    id: 'p9',
    name: 'Miel Sauvage Pur des Forêts du Noun (1 Litre)',
    description: 'Miel 100% pur, récolté de façon éco-responsable dans les forêts d\'altitude de la région de l\'Ouest. Riche en nutriments, sans sucre ajouté, goût boisé et floral unique.',
    price: 4000,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=60',
    category: 'Alimentation & Épicerie',
    merchantId: 'm1',
    merchantName: 'Maison du Café de l\'Ouest',
    isBoosted: true,
    stock: 30,
    rating: 4.9,
    reviewsCount: 35,
    origin: 'Local (Noun)'
  }
];

export const CATEGORIES = [
  'Tous',
  'Alimentation & Épicerie',
  'Artisanat & Mode',
  'Électronique & Tech',
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    merchantId: 'm1',
    orderId: 'o-mock-1',
    clientName: 'Jean-Pierre T.',
    rating: 5,
    comment: 'Le meilleur café du Cameroun, torréfaction parfaite ! Livraison rapide à Tamdja.',
    createdAt: '2026-07-15T14:30:00Z'
  },
  {
    id: 'r2',
    merchantId: 'm1',
    orderId: 'o-mock-2',
    clientName: 'Client anonyme',
    rating: 4,
    comment: 'Très bon goût, sachet bien scellé. Je recommande vivement pour le petit déjeuner.',
    createdAt: '2026-07-18T09:15:00Z'
  },
  {
    id: 'r3',
    merchantId: 'm2',
    orderId: 'o-mock-3',
    clientName: 'Nathalie M.',
    rating: 5,
    comment: 'Le tissu Ndop est magnifique, d\'une qualité exceptionnelle et les motifs sont authentiques ! Parfait pour la dot.',
    createdAt: '2026-07-10T11:45:00Z'
  },
  {
    id: 'r4',
    merchantId: 'm3',
    orderId: 'o-mock-4',
    clientName: 'Arthur K.',
    rating: 4,
    comment: 'Téléphone de qualité, bon service après-vente. Le vendeur est très sérieux et m\'a aidé à transférer mes données.',
    createdAt: '2026-07-12T16:20:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'BM-9821',
    userId: 'u1',
    userName: 'Emmanuel Tagne',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 2 },
      { product: INITIAL_PRODUCTS[8], quantity: 1 }
    ],
    total: 9500,
    status: 'pending',
    deliveryNeighborhood: 'Tamdja',
    deliveryDetails: 'Derrière la pharmacie de Tamdja, portail vert',
    paymentMethod: 'momo',
    paymentPhone: '675123456',
    createdAt: new Date().toISOString(),
    deliveryTimeEstimated: 15
  },
  {
    id: 'BM-8842',
    userId: 'u2',
    userName: 'Chantal Foko',
    items: [
      { product: INITIAL_PRODUCTS[3], quantity: 1 },
      { product: INITIAL_PRODUCTS[5], quantity: 1 }
    ],
    total: 17000,
    status: 'preparing',
    deliveryNeighborhood: 'Bamendzi',
    deliveryDetails: 'Carrefour jeunesse Bamendzi',
    paymentMethod: 'orange',
    paymentPhone: '698887766',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deliveryTimeEstimated: 20
  },
  {
    id: 'BM-7619',
    userId: 'u3',
    userName: 'Serge Kamga',
    items: [
      { product: INITIAL_PRODUCTS[2], quantity: 1 }
    ],
    total: 85500,
    status: 'delivering',
    deliveryNeighborhood: 'Carrefour Bamiléké',
    deliveryDetails: 'Immeuble face boulangerie',
    paymentMethod: 'momo',
    paymentPhone: '651223344',
    createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    deliveryTimeEstimated: 15,
    courierName: 'Jean-Baptiste Moto',
    courierPhone: '699001122'
  },
  {
    id: 'BM-6510',
    userId: 'u4',
    userName: 'Bertrand Nguemgne',
    items: [
      { product: INITIAL_PRODUCTS[1], quantity: 1 }
    ],
    total: 45500,
    status: 'completed',
    deliveryNeighborhood: 'Banengo',
    deliveryDetails: 'Près du lycée bilingue',
    paymentMethod: 'orange',
    paymentPhone: '677990011',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    deliveryTimeEstimated: 25,
    courierName: 'Paul Moto',
    courierPhone: '670443322'
  },
  {
    id: 'BM-5432',
    userId: 'u5',
    userName: 'Rosine Wambo',
    items: [
      { product: INITIAL_PRODUCTS[6], quantity: 1 }
    ],
    total: 28500,
    status: 'completed',
    deliveryNeighborhood: 'Famla',
    deliveryDetails: 'Marché Famla, boutique coiffure',
    paymentMethod: 'momo',
    paymentPhone: '694556677',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    deliveryTimeEstimated: 22
  }
];


