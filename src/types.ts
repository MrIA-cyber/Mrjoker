export type AccountType = 'client' | 'vendeur' | 'prestataire' | 'entreprise' | 'livreur' | 'admin';

export interface SubscriptionPlan {
  id: AccountType;
  name: string;
  monthlyPrice: number; // in FCFA
  yearlyPrice: number; // in FCFA
  trialDays: number; // e.g. 5 for client, 10 for others
  recommended?: boolean;
  badge?: string;
  color: string;
  features: string[];
}

export interface SubscriptionInvoice {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  planId: AccountType;
  planName: string;
  duration: 'monthly' | 'yearly';
  amount: number;
  paymentMethod: 'momo' | 'orange' | 'visa' | 'mastercard';
  paymentRef: string;
  createdAt: string;
  startDate: string;
  expiryDate: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  isVerifiedPhone?: boolean;
  accountType?: AccountType;
  trialStartDate?: string;
  trialExpiryDate?: string;
  isInTrial?: boolean;
  hasCompletedTrial?: boolean;
  subscriptionPlan?: AccountType;
  subscriptionDuration?: 'monthly' | 'yearly';
  subscriptionDate?: string;
  subscriptionExpiryDate?: string;
  isSubscribed: boolean;
  hasPaidFee: boolean;
  neighborhoodId?: string;
  neighborhood?: string;
  avatar?: string;
  paymentHistory?: SubscriptionInvoice[];
}

export interface Merchant {
  id: string;
  name: string;
  shopName: string;
  ownerName?: string;
  category?: string;
  location: string; // e.g. "Marché A", "Carrefour Bamiléké", "Marché B", etc.
  phone: string;
  email: string;
  password?: string; // security password to log in and prevent scams
  rating?: number;
  reviewCount?: number;
  description?: string;
  neighborhood?: string;
  salesCount?: number;
  isPremium: boolean; // 100,000 FCFA / year
  premiumStartDate?: string;
  premiumExpiryDate?: string;
  isVerified?: boolean; // verified status badge
  createdAt?: string;
  logo: string;
  views: number;
  clicks: number;
  sales: number;
  verificationStatus?: 'pending_verification' | 'verified' | 'rejected';
  cniPhoto?: string;
  shopPhoto?: string;
  registryNumber?: string;
  legalName?: string;
  rejectionReason?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in FCFA
  oldPrice?: number; // optional original price for discount
  discountPercent?: number; // calculated promo percentage
  image: string; // main image
  images?: string[]; // secondary images (up to 10)
  videos?: string[]; // presentation videos (up to 3)
  videoUrl?: string; // single promo video URL
  category: string;
  subCategory?: string;
  brand?: string;
  condition?: 'Neuf' | 'Occasion' | 'Reconditionné';
  sku?: string; // Product reference / SKU
  merchantId: string;
  merchantName: string;
  isBoosted: boolean; // boosted via Premium subscription
  boostExpiryDate?: string;
  boostCount?: number;
  stock: number;
  minStockThreshold?: number;
  availabilityStatus?: 'in_stock' | 'limited' | 'out_of_stock' | 'preorder';
  rating: number;
  reviewsCount: number;
  origin: string; // "Local (Bafoussam)", "Importé", etc.
  neighborhood?: string; // e.g. "Tamdja", "Marché A"
  specifications?: { label: string; value: string }[];
  weight?: string;
  dimensions?: string;
  materials?: string;
  usageTips?: string;
  warranty?: string;
  colors?: string[];
  sizes?: string[];
  deliveryOptions?: {
    local?: boolean;
    national?: boolean;
    international?: boolean;
    storePickup?: boolean;
    deliveryTime?: string;
    deliveryFee?: number;
    freeDeliveryMin?: number;
  };
  isDraft?: boolean;
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
  status: 'pending' | 'preparing' | 'picked_up' | 'delivering' | 'completed';
  deliveryNeighborhood: string;
  deliveryDetails: string;
  paymentMethod: 'momo' | 'orange' | 'cash_on_delivery';
  paymentPhone: string;
  createdAt: string;
  deliveryTimeEstimated: number; // in minutes
  currentLocation?: { x: number; y: number }; // coordinates for animated tracker map
  courierName?: string;
  courierPhone?: string;
  isReviewed?: boolean;
  commissionRate?: number; // e.g. 0.10 for 10%
  commissionAmount?: number; // total minus delivery fee times rate
  netToMerchant?: number; // subtotal minus commission
  payoutDate?: string; // date marked as paid out
  payoutRef?: string; // MoMo transaction ref for the payout
}

export interface Review {
  id: string;
  merchantId: string;
  productId?: string; // specific product ID for filtered reviews
  orderId: string;
  clientName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  photos?: string[]; // photos published by buyers
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
