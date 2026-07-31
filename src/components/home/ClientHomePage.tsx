import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Grid, 
  Utensils, 
  Smartphone, 
  Shirt, 
  Home as HomeIcon, 
  Pill, 
  Navigation, 
  Building2, 
  MapPin, 
  Star, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Truck, 
  CheckCircle2, 
  TrendingUp,
  Tag
} from 'lucide-react';
import { Product, Merchant, Order } from '../../types';

interface ClientHomePageProps {
  products: Product[];
  merchants: Merchant[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigateView: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  orders: Order[];
  favorites: Record<string, boolean>;
  onToggleFavorite: (e: React.MouseEvent, productId: string) => void;
}

// Banner slide promos (Amazon / Glovo inspired)
const PROMO_SLIDES = [
  {
    id: 1,
    badge: 'PROMO FLASH • MARCHÉ A',
    title: 'Jusqu\'à -30% sur les produits frais & épices',
    subtitle: 'Livraison express en 20 min à Tamdja, Kamkop & Djeleng.',
    cta: 'Profiter des réductions',
    bgGradient: 'from-[#0F172A] via-[#1E1B4B] to-[#4F46E5]',
    accentColor: '#10B981',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    badge: 'AFRINOVA TECH EXPRESS',
    title: 'Smartphones & Accessoires Garantie Bafoussam',
    subtitle: 'Paiement à la livraison par Orange Money ou MTN Mobile Money.',
    cta: 'Découvrir la High-Tech',
    bgGradient: 'from-[#1E1B4B] via-[#4C1D95] to-[#9333EA]',
    accentColor: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    badge: 'ARTISANAT & NDOP ROYAL',
    title: 'Créations authentiques de Bafoussam & Foumban',
    subtitle: 'Soutenez les artisans indépendants de l\'Ouest Cameroun.',
    cta: 'Explorer l\'artisanat',
    bgGradient: 'from-[#064E3B] via-[#047857] to-[#10B981]',
    accentColor: '#A7F3D0',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
  }
];

// Grille moderne de catégories
const CATEGORIES_GRID = [
  { id: 'Tous', name: 'Tous', icon: Grid, bg: 'bg-indigo-50 text-[#4F46E5]', categoryName: 'Tous' },
  { id: 'Alimentation & Épicerie', name: 'Épicerie & Repas', icon: Utensils, bg: 'bg-emerald-50 text-[#10B981]', categoryName: 'Alimentation & Épicerie' },
  { id: 'Électronique & Tech', name: 'High-Tech & Tel', icon: Smartphone, bg: 'bg-purple-50 text-[#9333EA]', categoryName: 'Électronique & Tech' },
  { id: 'Artisanat & Mode', name: 'Mode & Ndop', icon: Shirt, bg: 'bg-amber-50 text-[#D97706]', categoryName: 'Artisanat & Mode' },
  { id: 'Maison & Décoration', name: 'Maison & Déco', icon: HomeIcon, bg: 'bg-blue-50 text-[#2563EB]', categoryName: 'Maison & Décoration' },
  { id: 'Santé & Pharmacie', name: 'Santé & Soins', icon: Pill, bg: 'bg-rose-50 text-[#E11D48]', categoryName: 'Santé & Pharmacie' },
  { id: 'Transport & Taxi', name: 'Express 20min', icon: Navigation, bg: 'bg-teal-50 text-[#0D9488]', categoryName: 'Transport & Taxi' },
  { id: 'Prestations & Services', name: 'Services', icon: Building2, bg: 'bg-slate-100 text-slate-700', categoryName: 'Prestations & Services' }
];

export default function ClientHomePage({
  products,
  merchants,
  onSelectProduct,
  onAddToCart,
  onNavigateView,
  selectedCategory,
  onCategoryChange,
  orders,
  favorites,
  onToggleFavorite
}: ClientHomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Active delivery order detection (strictly show ONLY if active)
  const activeOrder = orders.find(o => o.status === 'delivering' || o.status === 'preparing' || o.status === 'picked_up');

  // Auto slide promo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* BANNIÈRE PRINCIPALE - CARROUSEL INTERACTIF */}
      <div className="relative rounded-3xl overflow-hidden shadow-md group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className={`relative min-h-[170px] sm:min-h-[200px] bg-gradient-to-r ${PROMO_SLIDES[currentSlide].bgGradient} p-5 sm:p-7 text-white flex flex-col justify-between`}
          >
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 sm:opacity-40 overflow-hidden pointer-events-none">
              <img 
                src={PROMO_SLIDES[currentSlide].image} 
                alt="Promo Bafoussam" 
                className="w-full h-full object-cover scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 max-w-lg space-y-1.5 sm:space-y-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {PROMO_SLIDES[currentSlide].badge}
              </span>

              <h2 className="text-base sm:text-xl lg:text-2xl font-black leading-tight">
                {PROMO_SLIDES[currentSlide].title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">
                {PROMO_SLIDES[currentSlide].subtitle}
              </p>
            </div>

            <div className="relative z-10 pt-2 flex items-center justify-between">
              <button
                onClick={() => onCategoryChange('Tous')}
                className="h-9 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>{PROMO_SLIDES[currentSlide].cta}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Slide Indicators */}
              <div className="flex items-center gap-1.5">
                {PROMO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? 'w-6 bg-[#16A34A]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* SUIVI DE COMMANDE EN COURS (Masqué si aucune commande active) */}
      {activeOrder && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-900 text-white p-4 rounded-2xl shadow-md border border-emerald-700 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs uppercase tracking-wider text-emerald-300">Commande #{activeOrder.id.slice(0, 6)}</span>
                <span className="bg-emerald-500/30 text-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full">En cours</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">Livraison en cours vers {activeOrder.deliveryAddress || 'Bafoussam'}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateView('orders')}
            className="h-8 px-3 rounded-xl bg-white text-emerald-900 text-xs font-black hover:bg-emerald-50 transition cursor-pointer shrink-0"
          >
            Suivre
          </button>
        </motion.div>
      )}

      {/* CATÉGORIES (Icones agrandies, hauteur réduite, effets) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-[#16A34A]" />
            Catégories Populaires
          </h3>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {CATEGORIES_GRID.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.categoryName;

            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.categoryName)}
                className={`py-2.5 px-2 rounded-2xl border transition duration-200 flex flex-col items-center justify-center text-center cursor-pointer ${
                  isSelected 
                    ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-md scale-102' 
                    : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div className={`p-2 rounded-xl mb-1 transition ${
                  isSelected ? 'bg-white/20 text-white' : cat.bg
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-bold line-clamp-1 leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOUTIQUES RECOMMANDÉES À BAFOUSSAM */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#16A34A]" />
            Boutiques Vérifiées à Bafoussam
          </h3>
          <button 
            onClick={() => onNavigateView('merchant')}
            className="text-xs font-black text-[#16A34A] hover:underline flex items-center gap-1"
          >
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {merchants.slice(0, 4).map((m) => (
            <div 
              key={m.id}
              onClick={() => onNavigateView('merchant')}
              className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-800 text-sm border border-slate-200 shrink-0 group-hover:bg-emerald-50 group-hover:text-[#16A34A] transition">
                {m.shopName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-xs text-[#0F172A] truncate">{m.shopName}</h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 truncate">{m.location || 'Bafoussam Centre'}</p>
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>4.8 (95 avis)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUITS POPULAIRES (Cartes Produit Intégrales) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#16A34A]" />
              Produits Populaires & Offres Locales
            </h3>
            <p className="text-xs text-slate-500">Articles disponibles immédiatement à Bafoussam</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products
            .filter(p => selectedCategory === 'Tous' || p.category === selectedCategory)
            .map((product, idx) => {
              const merchant = merchants.find(m => m.id === product.merchantId);
              const merchantName = merchant?.name || 'Marché A Bafoussam';
              const rating = product.rating || (4.6 + (idx % 3) * 0.1).toFixed(1);
              const reviewsCount = product.reviewsCount || (14 + idx * 6);
              const isFavorite = !!favorites[product.id];
              const oldPrice = product.price ? Math.round(product.price * 1.25) : 0;
              const isVerifiedMerchant = idx % 2 === 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.25) }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white rounded-[20px] border border-slate-200/80 shadow-2xs hover:shadow-md overflow-hidden flex flex-col justify-between cursor-pointer group transition duration-200"
                >
                  <div>
                    {/* Image avec hauteur uniforme & object-fit: cover */}
                    <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-slate-100 rounded-t-[20px]">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      
                      {/* 📍 Ville / Quartier Badge */}
                      <span className="absolute top-2 left-2 bg-[#0F172A]/85 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#16A34A]" />
                        <span className="truncate max-w-[85px]">Bafoussam, {product.neighborhood || 'Tamdja'}</span>
                      </span>

                      {/* Favorite Heart Toggle */}
                      <button
                        onClick={(e) => onToggleFavorite(e, product.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-slate-700 hover:text-rose-500 transition shadow-2xs cursor-pointer"
                        title="Ajouter aux favoris"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {/* Promo Badge */}
                      <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
                        -20% PROMO
                      </span>
                    </div>

                    {/* Info produit */}
                    <div className="p-3 space-y-1.5">
                      
                      {/* ⭐ Note + Avis + Délai de livraison */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span className="font-black text-slate-800">{rating}</span>
                          <span className="text-slate-400">({reviewsCount})</span>
                        </div>
                        
                        <span className="text-[9px] font-bold text-[#16A34A] bg-emerald-50 px-1.5 py-0.5 rounded">⚡ 20 min</span>
                      </div>

                      {/* Nom du produit (limité strictement à 2 lignes) */}
                      <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] group-hover:text-[#16A34A] transition line-clamp-2 leading-snug min-h-[2.2rem]">
                        {product.name}
                      </h4>

                      {/* Prix actuel + prix barré si réduction */}
                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <div className="font-black text-sm text-[#16A34A] tracking-tight">
                          {product.price ? product.price.toLocaleString() : '0'} FCFA
                        </div>
                        {oldPrice > 0 && (
                          <span className="text-[10px] text-slate-400 line-through font-medium">
                            {oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Boutique & Badge vérifié */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium truncate pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[90px]">{merchantName}</span>
                        </div>
                        {isVerifiedMerchant && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" title="Boutique vérifiée" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bouton Ajouter au panier */}
                  <div className="p-3 pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="w-full h-8 sm:h-9 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#166534] text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Ajouter au panier</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
