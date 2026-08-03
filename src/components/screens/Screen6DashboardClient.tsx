import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Bell, 
  ShoppingBag, 
  Store, 
  Utensils, 
  Hotel, 
  Pill, 
  Car, 
  Wrench, 
  Sparkles, 
  Star, 
  ChevronRight, 
  User, 
  Clock, 
  ShieldCheck, 
  Check, 
  Truck, 
  Flame, 
  Mic, 
  X, 
  SlidersHorizontal, 
  Zap, 
  Building2, 
  Eye, 
  Plus, 
  CheckCircle2, 
  Heart, 
  Phone, 
  MessageSquare,
  RotateCcw,
  Sliders,
  Filter,
  ArrowRight
} from 'lucide-react';
import { AfriNovaLogo } from '../AfriNovaLogo';
import { Product, Merchant, User as UserType } from '../../types';
import { INITIAL_PRODUCTS, INITIAL_MERCHANTS } from '../../data/mockData';
import { getMerchantCoverPhoto, getMerchantLogoUrl } from '../../utils/merchantImage';
import SmartProductImage from '../SmartProductImage';

interface Screen6DashboardClientProps {
  onNavigate?: (page: string) => void;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  currentUser?: UserType | null;
  lang?: 'fr' | 'en';
  cartItemsCount?: number;
}

// Service Providers mock data
const RECOMMENDED_PROVIDERS = [
  {
    id: 'prov-1',
    name: 'Kouamé Jean-Baptiste',
    profession: 'Plomberie & Dépannage Express',
    rating: 4.9,
    reviewsCount: 86,
    isVerified: true,
    isOnline: true,
    location: 'Tamdja, Bafoussam',
    rate: '5 000 FCFA / intervention',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&auto=format&fit=crop&q=80',
    specialty: 'Plomberie, Fuites, Chauffe-eau'
  },
  {
    id: 'prov-2',
    name: 'Mme Fotso Béatrice',
    profession: 'Coiffure & Esthétique à Domicile',
    rating: 4.8,
    reviewsCount: 124,
    isVerified: true,
    isOnline: true,
    location: 'Djeleng, Bafoussam',
    rate: '3 500 FCFA / coiffure',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    specialty: 'Tresses, Manucure, Maquillage Pro'
  },
  {
    id: 'prov-3',
    name: 'Tagne Samuel',
    profession: 'Électricité Général & Solaire',
    rating: 4.9,
    reviewsCount: 62,
    isVerified: true,
    isOnline: false,
    location: 'Carrefour Bamiléké',
    rate: '10 000 FCFA / installation',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    specialty: 'Panneaux solaires, Câblage, Groupes'
  },
  {
    id: 'prov-4',
    name: 'Coursier Express AfriNova',
    profession: 'Transport & Livraisons Rapides',
    rating: 5.0,
    reviewsCount: 310,
    isVerified: true,
    isOnline: true,
    location: 'Centre-ville, Bafoussam',
    rate: '500 FCFA / course locale',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    specialty: 'Moto Taxi, Colis, Repas 24h/7d'
  }
];

// Recommended Enterprises mock data
const RECOMMENDED_ENTERPRISES = [
  {
    id: 'ent-1',
    name: 'AfriNova Logistics & Fret',
    domain: 'Transport National & International',
    rating: 4.9,
    reviewsCount: 215,
    isVerified: true,
    location: 'Zone Industrielle, Bafoussam',
    logo: '🚛',
    cover: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
    services: ['Expédition inter-villes', 'Stockage', 'Livreurs dédiés']
  },
  {
    id: 'ent-2',
    name: 'Immo-Ouest S.A.',
    domain: 'Immobilier, Location & Terrains',
    rating: 4.8,
    reviewsCount: 140,
    isVerified: true,
    location: 'Tamdja Centre, Bafoussam',
    logo: '🏢',
    cover: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&auto=format&fit=crop&q=80',
    services: ['Appartements meublés', 'Vente de terrains titrés', 'Gestion']
  },
  {
    id: 'ent-3',
    name: 'Bafoussam Agro-Industry',
    domain: 'Transformation & Export Café/Cacao',
    rating: 4.9,
    reviewsCount: 98,
    isVerified: true,
    location: 'Quartier Administratif',
    logo: '🌾',
    cover: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
    services: ['Café moulu pur', 'Produits du terroir', 'Grossiste']
  },
  {
    id: 'ent-4',
    name: 'Solaire & Energy West',
    domain: 'Solutions Énergétiques Solaires',
    rating: 4.7,
    reviewsCount: 76,
    isVerified: true,
    location: 'Marché A, Bafoussam',
    logo: '⚡',
    cover: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&auto=format&fit=crop&q=80',
    services: ['Kits solaires maison', 'Oduleurs', 'Batteries Lithium']
  }
];

export default function Screen6DashboardClient({
  onNavigate,
  onSelectProduct,
  onAddToCart,
  currentUser,
  lang = 'fr',
  cartItemsCount = 3
}: Screen6DashboardClientProps) {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'flash' | 'cart' | 'profile'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Advanced Filter Modal State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'under10k' | '10k-50k' | 'over50k'>('all');
  const [distanceFilter, setDistanceFilter] = useState<'all' | '2km' | '5km' | '10km'>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [promoOnly, setPromoOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Live Order Tracking Modal State
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [expressDeliveryOnly, setExpressDeliveryOnly] = useState(false);

  // Favorites & Likes state
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Flash Sale Timer State (Countdown effect)
  const [flashTime, setFlashTime] = useState({ hours: 2, minutes: 14, seconds: 35 });

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTime(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle favorite helper
  const toggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Categories definition
  const categories = useMemo(() => [
    { id: 'all', label: lang === 'fr' ? 'Tous' : 'All', icon: Store, color: 'bg-[#16A34A] text-white' },
    { id: 'marche', label: lang === 'fr' ? 'Marché & Épicerie' : 'Market & Grocery', icon: Store, color: 'bg-emerald-600 text-white' },
    { id: 'tech', label: lang === 'fr' ? 'Électronique & Tech' : 'Tech & Devices', icon: Zap, color: 'bg-purple-600 text-white' },
    { id: 'mode', label: lang === 'fr' ? 'Mode & Ndop' : 'Fashion & Ndop', icon: Sparkles, color: 'bg-indigo-600 text-white' },
    { id: 'resto', label: lang === 'fr' ? 'Restaurants' : 'Food & Drinks', icon: Utensils, color: 'bg-orange-500 text-white' },
    { id: 'services', label: lang === 'fr' ? 'Prestataires' : 'Services & Pros', icon: Wrench, color: 'bg-blue-600 text-white' },
    { id: 'entreprises', label: lang === 'fr' ? 'Entreprises' : 'Businesses', icon: Building2, color: 'bg-slate-700 text-white' },
    { id: 'taxi', label: lang === 'fr' ? 'Taxi & Livraisons' : 'Taxi & Rides', icon: Car, color: 'bg-amber-500 text-slate-950' },
    { id: 'pharmacie', label: lang === 'fr' ? 'Pharmacies' : 'Health & Pharma', icon: Pill, color: 'bg-rose-500 text-white' },
  ], [lang]);

  // Enriched product dataset with dynamic badges & flash deals
  const enrichedProducts = useMemo(() => {
    return INITIAL_PRODUCTS.map((p, idx) => {
      const isPromo = p.price > 10000 || idx % 2 === 0;
      const oldPrice = isPromo ? Math.round(p.price * 1.25 / 500) * 500 : p.oldPrice;
      const discountPercent = oldPrice ? Math.round(((oldPrice - p.price) / oldPrice) * 100) : 0;
      const isVerified = true;
      const isFreeDelivery = p.price >= 15000;
      const isNewArrival = idx % 3 === 0;
      const isPopular = p.rating >= 4.7;
      const isFlashDeal = idx === 0 || idx === 2 || idx === 7;
      const flashStockRemaining = isFlashDeal ? (idx * 3 + 4) : undefined;
      const flashStockTotal = isFlashDeal ? (idx * 3 + 15) : undefined;

      return {
        ...p,
        oldPrice,
        discountPercent,
        isVerified,
        isFreeDelivery,
        isNewArrival,
        isPopular,
        isFlashDeal,
        flashStockRemaining,
        flashStockTotal
      };
    });
  }, []);

  // Filtered Products based on search, category, and advanced filters
  const filteredProducts = useMemo(() => {
    return enrichedProducts.filter(p => {
      // Search term filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        const matchMerchant = p.merchantName.toLowerCase().includes(query);
        if (!matchName && !matchCategory && !matchMerchant) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'marche' && !p.category.includes('Alimentation')) return false;
        if (selectedCategory === 'tech' && !p.category.includes('Électronique')) return false;
        if (selectedCategory === 'mode' && !p.category.includes('Mode')) return false;
        if (selectedCategory === 'resto' && !p.category.includes('Restaurant')) return false;
      }

      // Advanced filters
      if (promoOnly && (!p.discountPercent || p.discountPercent <= 0)) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (expressDeliveryOnly && !p.isFreeDelivery) return false;
      if (ratingFilter > 0 && p.rating < ratingFilter) return false;

      if (priceFilter === 'under10k' && p.price >= 10000) return false;
      if (priceFilter === '10k-50k' && (p.price < 10000 || p.price > 50000)) return false;
      if (priceFilter === 'over50k' && p.price <= 50000) return false;

      return true;
    });
  }, [enrichedProducts, searchTerm, selectedCategory, promoOnly, inStockOnly, expressDeliveryOnly, ratingFilter, priceFilter]);

  // Section specific datasets
  const popularProducts = useMemo(() => filteredProducts.filter(p => p.isPopular), [filteredProducts]);
  const flashDeals = useMemo(() => enrichedProducts.filter(p => p.isFlashDeal), [enrichedProducts]);
  const newArrivals = useMemo(() => enrichedProducts.filter(p => p.isNewArrival), [enrichedProducts]);
  const recentlyViewed = useMemo(() => [enrichedProducts[0], enrichedProducts[1], enrichedProducts[3], enrichedProducts[8]], [enrichedProducts]);

  // Recommended Stores (from merchants)
  const recommendedShops = useMemo(() => {
    return INITIAL_MERCHANTS.slice(0, 4).map(m => ({
      ...m,
      rating: 4.9,
      reviewsCount: Math.floor(m.views / 10),
      coverPhoto: getMerchantCoverPhoto(m),
      productCount: Math.floor(m.sales / 10000) + 12
    }));
  }, []);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (priceFilter !== 'all') count++;
    if (distanceFilter !== 'all') count++;
    if (ratingFilter > 0) count++;
    if (promoOnly) count++;
    if (inStockOnly) count++;
    if (expressDeliveryOnly) count++;
    return count;
  }, [priceFilter, distanceFilter, ratingFilter, promoOnly, inStockOnly, expressDeliveryOnly]);

  const resetFilters = () => {
    setPriceFilter('all');
    setDistanceFilter('all');
    setRatingFilter(0);
    setPromoOnly(false);
    setInStockOnly(false);
    setExpressDeliveryOnly(false);
  };

  const handleProductClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onNavigate) {
      onNavigate('detail-produit');
    }
  };

  const handleAddToCartClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-slate-50 text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col justify-between min-h-[720px] relative font-sans transition-all">
      
      {/* 1. TOP HEADER (Unified, Non-Redundant) */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 p-3 sm:p-5 text-white space-y-3 shadow-md relative z-20">
        
        {/* Top Profile & Location Bar */}
        <div className="flex items-center justify-between">
          
          {/* Logo & User Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#16A34A] via-[#15803D] to-[#7C3AED] p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white font-black text-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'K'}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                <span>{lang === 'fr' ? 'Bonjour,' : 'Hello,'}</span>
                <strong className="text-white font-black">{currentUser?.name || 'Paul Kamdem'}</strong>
                <span className="bg-[#16A34A]/20 text-[#22C55E] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-[#16A34A]/30">
                  Client Vérifié
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-xs">📍 Cameroun • Bafoussam, Carrefour Bamiléké</span>
              </div>
            </div>
          </div>

          {/* Top Actions: Notifications, Order Tracking & Cart */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsOrderTrackingOpen(true)}
              className="relative px-2.5 py-1.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 flex items-center gap-1.5 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
              title="Suivi de ma commande"
            >
              <Truck className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span className="hidden sm:inline">Suivi commande</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>

            <button 
              onClick={() => onNavigate && onNavigate('news')}
              className="relative w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white border border-white/15 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            </button>

            <button 
              onClick={() => onNavigate && onNavigate('cart')}
              className="relative w-9 h-9 rounded-2xl bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:brightness-110 active:scale-95 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 transition cursor-pointer"
              title="Panier"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#7C3AED] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. BANDEAU PROMOTIONNEL (Hauteur réduite d'environ 20% - Sleek Panoramic Banner) */}
        <div className="relative w-full h-20 sm:h-24 rounded-2xl overflow-hidden border border-white/20 shadow-lg group">
          <img 
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80" 
            alt="AfriNova Promo Banner" 
            className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-purple-950/75 to-transparent p-3 sm:p-4 flex items-center justify-between">
            <div className="space-y-1 max-w-[70%]">
              <div className="flex items-center gap-1.5">
                <span className="bg-[#16A34A] text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" />
                  Offre de la semaine -30%
                </span>
                <span className="text-[10px] text-purple-200 font-bold hidden sm:inline">
                  Livraison Express Guaranteed
                </span>
              </div>
              <h2 className="text-xs sm:text-sm md:text-base font-black text-white font-display leading-tight truncate">
                Le meilleur de votre pays à portée de main
              </h2>
              <p className="text-[10px] text-slate-200 hidden sm:block">
                Marché frais, électronique, produits du terroir & prestataires qualifiés.
              </p>
            </div>

            <button 
              onClick={() => onNavigate && onNavigate('marketplace')}
              className="px-3 py-2 bg-gradient-to-r from-[#16A34A] to-[#7C3AED] hover:brightness-110 active:scale-95 text-white text-[10px] font-black rounded-xl shadow-md flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 transition-all"
            >
              <span>Découvrir</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3. SINGLE PRIMARY SEARCH BAR & FILTER TRIGGER */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'fr' ? "Rechercher un produit, boutique, artisan, entreprise..." : "Search product, shop, artisan, company..."}
              className="w-full pl-10 pr-9 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs text-white placeholder-slate-300 focus:outline-none focus:bg-white/20 focus:border-emerald-400 transition"
            />
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                onClick={() => setSearchTerm('Poivre blanc Penja')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                title="Recherche vocale"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeFilterCount > 0
                ? 'bg-gradient-to-r from-[#16A34A] to-[#7C3AED] text-white border-transparent shadow-md'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Filtres' : 'Filters'}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#16A34A] text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* 4. EXPANDABLE ADVANCED FILTERS PANEL */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-slate-200 shadow-lg p-4 space-y-3 z-10"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#16A34A]" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {lang === 'fr' ? 'Filtres Avancés de Recherche' : 'Advanced Search Filters'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button 
                    onClick={resetFilters}
                    className="text-[10px] font-bold text-slate-500 hover:text-[#16A34A] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Réinitialiser</span>
                  </button>
                )}
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              
              {/* Prix */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prix (FCFA)</label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#16A34A]"
                >
                  <option value="all">Tous les prix</option>
                  <option value="under10k">&lt; 10 000 FCFA</option>
                  <option value="10k-50k">10k - 50k FCFA</option>
                  <option value="over50k">&gt; 50 000 FCFA</option>
                </select>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Distance</label>
                <select
                  value={distanceFilter}
                  onChange={(e) => setDistanceFilter(e.target.value as any)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#16A34A]"
                >
                  <option value="all">Tout le pays</option>
                  <option value="2km">&lt; 2 km (Proximité)</option>
                  <option value="5km">&lt; 5 km (Quartier)</option>
                  <option value="10km">&lt; 10 km (Ville)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Note Minimale</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#16A34A]"
                >
                  <option value={0}>Toutes les notes</option>
                  <option value={4.0}>4.0★ et +</option>
                  <option value={4.5}>4.5★ et + (Excellence)</option>
                </select>
              </div>

              {/* Checkboxes: Promo, Stock, Express */}
              <div className="flex items-center gap-2 pt-4">
                <input 
                  type="checkbox" 
                  id="promoToggle"
                  checked={promoOnly}
                  onChange={(e) => setPromoOnly(e.target.checked)}
                  className="accent-[#16A34A] w-3.5 h-3.5 rounded cursor-pointer"
                />
                <label htmlFor="promoToggle" className="text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                  🏷️ Promotions
                </label>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input 
                  type="checkbox" 
                  id="stockToggle"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-[#16A34A] w-3.5 h-3.5 rounded cursor-pointer"
                />
                <label htmlFor="stockToggle" className="text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                  📦 En Stock
                </label>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input 
                  type="checkbox" 
                  id="expressToggle"
                  checked={expressDeliveryOnly}
                  onChange={(e) => setExpressDeliveryOnly(e.target.checked)}
                  className="accent-[#16A34A] w-3.5 h-3.5 rounded cursor-pointer"
                />
                <label htmlFor="expressToggle" className="text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                  🚚 Express (&lt;30m)
                </label>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. MAIN CONTENT SCROLL AREA */}
      <div className="p-3 sm:p-5 space-y-6 overflow-y-auto max-h-[580px] sm:max-h-[640px] scrollbar-thin scrollbar-thumb-slate-300">
        
        {/* CATEGORY NAV CHIPS (Compact and intuitive) */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{lang === 'fr' ? 'Catégories Principales' : 'Main Categories'}</span>
            </h2>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="text-[10px] font-bold text-[#16A34A] hover:underline cursor-pointer"
            >
              {lang === 'fr' ? 'Réinitialiser' : 'Reset'}
            </button>
          </div>

          {/* Compact Category Chips Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#16A34A] to-[#7C3AED] text-white border-transparent shadow-md scale-102'
                      : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 1: OFFRES FLASH (Flash Sales with Countdown) */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 font-bold">
                <Zap className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
                  {lang === 'fr' ? 'Offres Flash AfriNova' : 'AfriNova Flash Deals'}
                </h2>
                <span className="text-[10px] font-bold text-slate-500">
                  {lang === 'fr' ? 'Prix cassés pour une durée limitée' : 'Limited time discount prices'}
                </span>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="bg-slate-900 text-white px-2.5 py-1 rounded-xl text-[10px] font-mono font-black flex items-center gap-1 border border-slate-700 shadow-sm">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{String(flashTime.hours).padStart(2, '0')}h : {String(flashTime.minutes).padStart(2, '0')}m : {String(flashTime.seconds).padStart(2, '0')}s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {flashDeals.map((product) => (
              <motion.div
                key={`flash-${product.id}`}
                whileHover={{ y: -3 }}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl p-3 border border-rose-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Top Badge Overlay */}
                <div className="relative h-36 sm:h-40 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <SmartProductImage 
                    product={product} 
                    containerClassName="w-full h-full"
                    aspectRatio="auto"
                  />
                  
                  {/* Badges Top Left & Right */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    <span className="bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                      ⚡ FLASH -{product.discountPercent}%
                    </span>
                    {product.isFreeDelivery && (
                      <span className="bg-[#16A34A] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                        <Truck className="w-2.5 h-2.5" />
                        Gratuit
                      </span>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button 
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-rose-500 transition cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites[product.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  {/* Stock Remaining Bar Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-md p-1.5 text-white flex items-center justify-between text-[9px]">
                    <span className="font-bold text-amber-400">Stock limité</span>
                    <span className="font-black">{product.flashStockRemaining} / {product.flashStockTotal} restants</span>
                  </div>
                </div>

                {/* Product Meta */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                    <span className="truncate">{product.merchantName}</span>
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#16A34A] transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-xs sm:text-sm font-black text-[#16A34A]">
                        {product.price.toLocaleString('fr-FR')} FCFA
                      </div>
                      {product.oldPrice && (
                        <div className="text-[10px] font-bold text-slate-400 line-through">
                          {product.oldPrice.toLocaleString('fr-FR')} FCFA
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleAddToCartClick(product, e)}
                      className="p-2 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ajouter</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 2: PRODUITS POPULAIRES (Dynamic Badges & Larger Images) */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#16A34A] font-bold">
                <Flame className="w-4 h-4 fill-[#16A34A] text-[#16A34A]" />
              </div>
              <h2 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
                {lang === 'fr' ? 'Produits Populaires' : 'Popular Products'}
              </h2>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('marketplace')}
              className="text-[10px] font-black text-[#16A34A] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Tout voir ({filteredProducts.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {popularProducts.slice(0, 8).map((product) => (
              <motion.div
                key={`pop-${product.id}`}
                whileHover={{ y: -3 }}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                {/* Large Product Image Container */}
                <div className="relative h-36 sm:h-44 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <SmartProductImage 
                    product={product} 
                    containerClassName="w-full h-full"
                    aspectRatio="auto"
                  />
                  
                  {/* Dynamic Badges Overlay */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    {product.discountPercent > 0 && (
                      <span className="bg-gradient-to-r from-[#16A34A] to-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                        -{product.discountPercent}%
                      </span>
                    )}
                    <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                      🔥 Populaire
                    </span>
                    {product.isFreeDelivery && (
                      <span className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                        🚚 Livraison gratuite
                      </span>
                    )}
                  </div>

                  {/* Verified Check Badge */}
                  {product.isVerified && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-md shadow-xs flex items-center justify-center text-blue-600" title="Vendeur Vérifié">
                      <ShieldCheck className="w-3.5 h-3.5 fill-blue-600 text-white" />
                    </div>
                  )}
                </div>

                {/* Info & Pricing */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 font-semibold truncate flex items-center gap-1">
                    <Store className="w-2.5 h-2.5 text-slate-400" />
                    <span>{product.merchantName}</span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#16A34A] transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-xs font-black text-[#16A34A]">
                        {product.price.toLocaleString('fr-FR')} FCFA
                      </div>
                      {product.oldPrice && (
                        <div className="text-[9px] text-slate-400 line-through">
                          {product.oldPrice.toLocaleString('fr-FR')} FCFA
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 3: BOUTIQUES RECOMMANDÉES (Recommended Shops) */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#7C3AED] font-bold">
                <Store className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <h2 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
                {lang === 'fr' ? 'Boutiques Recommandées' : 'Recommended Shops'}
              </h2>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('marketplace')}
              className="text-[10px] font-black text-[#7C3AED] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Voir toutes' : 'See all'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {recommendedShops.map((shop) => (
              <motion.div
                key={`shop-${shop.id}`}
                whileHover={{ y: -3 }}
                onClick={() => onNavigate && onNavigate('marketplace')}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="relative h-24 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <img src={shop.coverPhoto} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-white">
                    <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-sm font-black border border-white/30 overflow-hidden shrink-0">
                      {shop.logo && shop.logo.length <= 4 ? (
                        <span>{shop.logo}</span>
                      ) : (
                        <img src={getMerchantLogoUrl(shop)} alt={shop.shopName} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="text-[10px] font-bold truncate">
                      <span>{shop.location}</span>
                    </div>
                  </div>

                  {shop.isVerified && (
                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Vérifié
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-extrabold text-slate-900 truncate group-hover:text-[#7C3AED] transition-colors">
                    {shop.shopName}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {shop.productCount} produits disponibles
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{shop.rating} ({shop.reviewsCount} avis)</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#7C3AED] group-hover:underline">Visiter &gt;</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 4: PRESTATAIRES ET ARTISANS RECOMMANDÉS */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-bold">
                <Wrench className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
                {lang === 'fr' ? 'Prestataires & Artisans Recommandés' : 'Recommended Service Pros'}
              </h2>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('marketplace')}
              className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Voir tous' : 'See all'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {RECOMMENDED_PROVIDERS.map((prov) => (
              <motion.div
                key={prov.id}
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img src={prov.avatar} alt={prov.name} className="w-full h-full object-cover" />
                    {prov.isOnline && (
                      <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#16A34A] border-2 border-white" title="Disponible" />
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs font-bold text-slate-900 truncate">{prov.name}</h3>
                      {prov.isVerified && <ShieldCheck className="w-3 h-3 text-blue-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] font-extrabold text-[#16A34A] truncate">{prov.profession}</p>
                    <span className="text-[9px] text-slate-400 font-medium">{prov.location}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-600">{prov.rate}</span>
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{prov.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => onNavigate && onNavigate('orders')}
                      className="flex-1 py-1.5 px-2 bg-gradient-to-r from-[#16A34A] to-emerald-700 hover:brightness-110 active:scale-95 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Contacter</span>
                    </button>
                    <button 
                      onClick={() => onNavigate && onNavigate('orders')}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                      title="Envoyer un message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 5: ENTREPRISES RECOMMANDÉES */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-800/10 border border-slate-800/20 flex items-center justify-center text-slate-800 font-bold">
                <Building2 className="w-4 h-4 text-slate-800" />
              </div>
              <h2 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
                {lang === 'fr' ? 'Entreprises Recommandées' : 'Recommended Companies'}
              </h2>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('marketplace')}
              className="text-[10px] font-black text-slate-700 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Voir toutes' : 'See all'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {RECOMMENDED_ENTERPRISES.map((ent) => (
              <motion.div
                key={ent.id}
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="relative h-20 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <img src={ent.cover} alt={ent.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                  <div className="absolute inset-0 bg-slate-950/40" />
                  <span className="absolute top-2 left-2 bg-slate-900/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white/20">
                    🏢 Entreprise Certifiée
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{ent.logo}</span>
                    <h3 className="text-xs font-extrabold text-slate-900 truncate">{ent.name}</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{ent.domain}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold">{ent.location}</span>
                    <button 
                      onClick={() => onNavigate && onNavigate('orders')}
                      className="text-[10px] font-extrabold text-[#16A34A] hover:underline cursor-pointer"
                    >
                      Devis / Contact &gt;
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 6: NOUVEAUTÉS (New Arrivals) */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-purple-600 font-bold">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
                {lang === 'fr' ? 'Nouveautés sur AfriNova' : 'New Arrivals'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {newArrivals.slice(0, 4).map((product) => (
              <motion.div
                key={`new-${product.id}`}
                whileHover={{ y: -3 }}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl p-2.5 border border-purple-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <SmartProductImage product={product} containerClassName="w-full h-full" aspectRatio="auto" />
                  <span className="absolute top-2 left-2 bg-[#7C3AED] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10">
                    <Sparkles className="w-2.5 h-2.5" />
                    Nouveau
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#7C3AED] transition-colors">{product.name}</h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-black text-[#16A34A]">{product.price.toLocaleString('fr-FR')} FCFA</span>
                    <button 
                      onClick={(e) => handleAddToCartClick(product, e)}
                      className="p-1.5 bg-[#7C3AED] hover:bg-purple-800 text-white rounded-lg shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 7: PRODUITS RÉCEMMENT CONSULTÉS */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold">
              <Eye className="w-4 h-4 text-slate-700" />
            </div>
            <h2 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
              {lang === 'fr' ? 'Produits Récemment Consultés' : 'Recently Viewed'}
            </h2>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {recentlyViewed.map((product) => (
              <div
                key={`rec-${product.id}`}
                onClick={() => handleProductClick(product)}
                className="w-36 sm:w-44 bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
              >
                <div className="h-24 rounded-xl overflow-hidden bg-slate-100 mb-1.5">
                  <SmartProductImage product={product} containerClassName="w-full h-full" aspectRatio="auto" />
                </div>
                <h4 className="text-[11px] font-bold text-slate-900 truncate">{product.name}</h4>
                <div className="text-[11px] font-black text-[#16A34A] mt-0.5">{product.price.toLocaleString('fr-FR')} FCFA</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 6. BOTTOM NAVIGATION DOCK (Compact & Intuitive) */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center text-slate-600 z-20">
        {[
          { id: 'home', label: lang === 'fr' ? 'Accueil' : 'Home', icon: Store },
          { id: 'explore', label: lang === 'fr' ? 'Explorer' : 'Explore', icon: Search },
          { id: 'flash', label: lang === 'fr' ? 'Flash' : 'Flash', icon: Zap },
          { id: 'cart', label: lang === 'fr' ? 'Panier' : 'Cart', icon: ShoppingBag, badge: cartItemsCount },
          { id: 'profile', label: lang === 'fr' ? 'Profil' : 'Profile', icon: User },
        ].map((nav) => {
          const NavIcon = nav.icon;
          const isActive = activeTab === nav.id;
          return (
            <button 
              key={nav.id} 
              onClick={() => {
                setActiveTab(nav.id as any);
                if (nav.id === 'cart') {
                  if (onNavigate) onNavigate('cart');
                } else if (nav.id === 'profile') {
                  if (onNavigate) onNavigate('merchant');
                } else if (nav.id === 'explore' || nav.id === 'flash') {
                  if (onNavigate) onNavigate('marketplace');
                } else {
                  if (onNavigate) onNavigate('shop');
                }
              }}
              className={`flex flex-col items-center gap-0.5 relative py-1 px-3 rounded-xl transition cursor-pointer ${
                isActive 
                  ? 'text-[#16A34A] font-black bg-emerald-50' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <NavIcon className={`w-4 h-4 ${isActive ? 'text-[#16A34A]' : 'text-slate-400'}`} />
              <span className="text-[9px] font-bold">{nav.label}</span>
              {nav.badge !== undefined && nav.badge > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-[#16A34A] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {nav.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 7. LIVE ORDER TRACKING MODAL */}
      <AnimatePresence>
        {isOrderTrackingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-200 relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsOrderTrackingOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#16A34A] flex items-center justify-center font-black shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-display">Suivi de Commande #AFR-88492</h3>
                  <p className="text-xs text-slate-500">Livraison Bafoussam Express (Marché A ➔ Tamdja)</p>
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-500">
                  
                  {/* Step 1: Confirmed */}
                  <div className="relative flex items-start gap-3">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Commande Confirmée</div>
                      <div className="text-[11px] text-slate-500">Payée via MTN Mobile Money • 14:15</div>
                    </div>
                  </div>

                  {/* Step 2: In Preparation */}
                  <div className="relative flex items-start gap-3">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Préparée par le commerçant</div>
                      <div className="text-[11px] text-slate-500">Bafoussam HighTech (Marché A) • 14:22</div>
                    </div>
                  </div>

                  {/* Step 3: Courier En Route */}
                  <div className="relative flex items-start gap-3">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-emerald-100 animate-pulse">
                      🚚
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-700 flex items-center gap-1">
                        <span>Livreur en cours de route</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">EN COURS</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">Arrivée estimée dans 12 minutes (Tamdja)</div>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="relative flex items-start gap-3 opacity-50">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                      4
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">Livré à domicile</div>
                      <div className="text-[11px] text-slate-400">Confirmation par code OTP</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Courier Contact Card */}
              <div className="bg-emerald-950 text-white p-3.5 rounded-2xl border border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black text-xs flex items-center justify-center border border-emerald-600 shrink-0">
                    MOTO
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-300">Coursier: Tagne Samuel</div>
                    <div className="text-[11px] text-slate-300">Moto-Taxi Express Afrinova • LT-892-BA</div>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <a
                    href="tel:677123456"
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://wa.me/237677123456"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <button
                onClick={() => setIsOrderTrackingOpen(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Fermer la fenêtre de suivi
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
