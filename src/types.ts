export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  isSubscribed: boolean;
  subscriptionDate?: string;
  subscriptionExpiryDate?: string;
  hasPaidFee: boolean;
  neighborhoodId?: string;
}

export interface Merchant {
  id: string;
  name: string;
  shopName: string;
  location: string; // e.g. "Marché A", "Carrefour Bamiléké", "Marché B", etc.
  phone: string;
  email: string;
  password?: string; // security password to log in and prevent scams
  isPremium: boolean; // 100,000 FCFA / year
  premiumStartDate?: string;
  premiumExpiryDate?: string;
  logo: string;
  views: number;
  clicks: number;
  sales: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA
  image: string;
  category: string;
  merchantId: string;
  merchantName: string;
  isBoosted: boolean; // boosted via Premium subscription
  stock: number;
  rating: number;
  reviewsCount: number;
  origin: string; // "Local (Bafoussam)", "Importé", etc.
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'delivering' | 'completed';
  deliveryNeighborhood: string;
  deliveryDetails: string;
  paymentMethod: 'momo' | 'orange';
  paymentPhone: string;
  createdAt: string;
  deliveryTimeEstimated: number; // in minutes
  currentLocation?: { x: number; y: number }; // coordinates for animated tracker map
}

export interface Neighborhood {
  id: string;
  name: string;
  deliveryFee: number; // in FCFA
  estMinutes: number; // typical delivery time in minutes
  coordinates: { x: number; y: number }; // for map rendering
}

export interface MarketingCampaign {
  id: string;
  title: string;
  type: 'promo' | 'boost' | 'banner';
  targetNeighborhoods: string[];
  status: 'active' | 'scheduled' | 'ended';
  views: number;
  conversions: number;
  startDate: string;
  endDate: string;
}
