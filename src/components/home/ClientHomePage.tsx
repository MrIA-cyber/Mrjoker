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
  Tag,
  Zap,
  Bot,
  Sun,
  Wrench,
  Award,
  PhoneCall,
  ExternalLink,
  MessageSquare,
  Newspaper,
  Check,
  Globe
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';
import { AfriNovaLogo } from '../AfriNovaLogo';

interface ClientHomePageProps {
  products: Product[];
  merchants: Merchant[];
  currentUser: User | null;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigateView: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  orders: Order[];
  favorites: Record<string, boolean>;
  onToggleFavorite: (e: React.MouseEvent, productId: string) => void;
  onOpenScanner?: () => void;
}

// 1. BANNIÈRE DYNAMIQUE (Hauteur réduite de 40%, ~160px height, auto-slide)
const PROMO_SLIDES = [
  {
    id: 1,
    badge: 'PROMO FLASH • MARCHÉ A',
    title: 'Jusqu\'à -30% sur les produits frais & épices',
    subtitle: 'Livraison express en 20 min à Tamdja, Kamkop & Djeleng.',
    cta: 'Profiter des réductions',
    bgGradient: 'from-[#0F172A] via-[#1E1B4B] to-[#16A34A]',
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

// 2. CATÉGORIES INTERACTIVES AVEC COMPTEURS ET ANIMATION
const CATEGORIES_GRID = [
  { id: 'Tous', name: 'Tous', icon: Grid, bg: 'bg-indigo-50 text-[#4F46E5]', categoryName: 'Tous', count: '120+' },
  { id: 'Alimentation & Épicerie', name: 'Épicerie & Repas', icon: Utensils, bg: 'bg-emerald-50 text-[#10B981]', categoryName: 'Alimentation & Épicerie', count: '45' },
  { id: 'Électronique & Tech', name: 'High-Tech & Tel', icon: Smartphone, bg: 'bg-purple-50 text-[#9333EA]', categoryName: 'Électronique & Tech', count: '32' },
  { id: 'Artisanat & Mode', name: 'Mode & Ndop', icon: Shirt, bg: 'bg-amber-50 text-[#D97706]', categoryName: 'Artisanat & Mode', count: '28' },
  { id: 'Maison & Décoration', name: 'Maison & Déco', icon: HomeIcon, bg: 'bg-blue-50 text-[#2563EB]', categoryName: 'Maison & Décoration', count: '19' },
  { id: 'Santé & Pharmacie', name: 'Santé & Soins', icon: Pill, bg: 'bg-rose-50 text-[#E11D48]', categoryName: 'Santé & Pharmacie', count: '14' },
  { id: 'Transport & Taxi', name: 'Express 20min', icon: Navigation, bg: 'bg-teal-50 text-[#0D9488]', categoryName: 'Transport & Taxi', count: '8' },
  { id: 'Prestations & Services', name: 'Services & Artisanat', icon: Wrench, bg: 'bg-slate-100 text-slate-700', categoryName: 'Prestations & Services', count: '22' }
];

// 3. SERVICES POPULAIRES (Prestataires vérifiés)
const POPULAR_SERVICES = [
  {
    id: 'srv-1',
    title: 'Installation & Dépannage Solaire',
    providerName: 'Jean-Pierre Nguemo',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    category: 'Électricité & Énergie',
    rating: 4.9,
    reviewsCount: 38,
    price: '15 000 FCFA',
    verified: true,
    availableNow: true,
    location: 'Tamdja',
  },
  {
    id: 'srv-2',
    title: 'Plomberie & Sanitaire Express 24h/24',
    providerName: 'Samuel Foka',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    category: 'Plomberie',
    rating: 4.8,
    reviewsCount: 29,
    price: '10 000 FCFA',
    verified: true,
    availableNow: true,
    location: 'Kamkop',
  },
  {
    id: 'srv-3',
    title: 'Traiteur Repas Traditionnels & Ndop Royal',
    providerName: 'Mme Mireille Kamdem',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    category: 'Restauration',
    rating: 5.0,
    reviewsCount: 52,
    price: 'Sur devis',
    verified: true,
    availableNow: true,
    location: 'Marché A',
  },
  {
    id: 'srv-4',
    title: 'Coiffure & Soins Esthétiques à Domicile',
    providerName: 'Nadine Beauty',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    category: 'Beauté & Bien-être',
    rating: 4.7,
    reviewsCount: 41,
    price: '8 000 FCFA',
    verified: true,
    availableNow: false,
    location: 'Djeleng',
  }
];

// 4. ENTREPRISES PARTENAIRES (B2B Corporate)
const PARTNER_COMPANIES = [
  {
    id: 'corp-1',
    name: 'West-Cameroon Agrobusiness SA',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
    industry: 'Agroalimentaire & Épices',
    branches: '3 succursales',
    verified: true,
    rating: 4.9,
    description: 'Producteur et exportateur agréé du poivre blanc Penja & Bafoussam.',
  },
  {
    id: 'corp-2',
    name: 'SOTRACAM Logistique Express',
    logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=200&q=80',
    industry: 'Transport & Fret Interurbain',
    branches: '5 succursales',
    verified: true,
    rating: 4.8,
    description: 'Livraisons lourdes et légères Ouest-Littoral avec suivi GPS en direct.',
  },
  {
    id: 'corp-3',
    name: 'Bafoussam BTP & Solaire',
    logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80',
    industry: 'Construction & Matériaux',
    branches: '2 succursales',
    verified: true,
    rating: 4.7,
    description: 'Matériaux certifiés et kits d\'énergie solaire hybrides.',
  }
];

export default function ClientHomePage({
  products,
  merchants,
  currentUser,
  onSelectProduct,
  onAddToCart,
  onNavigateView,
  selectedCategory,
  onCategoryChange,
  orders,
  favorites,
  onToggleFavorite,
  onOpenScanner
}: ClientHomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Active delivery order detection (strictly show ONLY if active)
  const activeOrder = orders.find(o => o.status === 'delivering' || o.status === 'preparing' || o.status === 'picked_up');

  // Auto-slide banner every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 pb-6 font-sans">
      
      {/* 4. BANNIÈRE DYNAMIQUE (Hauteur réduite de 40%, ~150-180px height) */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className={`relative min-h-[150px] sm:min-h-[170px] bg-gradient-to-r ${PROMO_SLIDES[currentSlide].bgGradient} p-4 sm:p-6 text-white flex items-center justify-between overflow-hidden`}
          >
            {/* Background Image overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 opacity-25 sm:opacity-35 pointer-events-none overflow-hidden">
              <img
                src={PROMO_SLIDES[currentSlide].image}
                alt="Promo"
                className="w-full h-full object-cover filter contrast-125 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] to-transparent" />
            </div>

            <div className="relative z-10 max-w-lg space-y-1 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-white/20">
                <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>{PROMO_SLIDES[currentSlide].badge}</span>
              </div>

              <h2 className="text-base sm:text-xl md:text-2xl font-black font-display leading-tight text-white drop-shadow-xs">
                {PROMO_SLIDES[currentSlide].title}
              </h2>

              <p className="text-xs text-slate-200 line-clamp-1 font-medium hidden sm:block">
                {PROMO_SLIDES[currentSlide].subtitle}
              </p>

              <div className="pt-1">
                <button
                  onClick={() => {
                    const el = document.getElementById('popular-products');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <span>{PROMO_SLIDES[currentSlide].cta}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#16A34A]" />
                </button>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-2 right-4 z-20 flex items-center gap-1.5">
              {PROMO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentSlide ? 'w-5 bg-[#16A34A]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 5. RACCOURCIS RAPIDES (Quick Action Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 pt-0.5">
        <button
          onClick={() => {
            const el = document.getElementById('popular-products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-[#15803D] border border-emerald-200/60 text-xs font-black flex items-center gap-2 shrink-0 transition shadow-2xs cursor-pointer"
        >
          <Truck className="w-4 h-4 text-[#16A34A]" />
          <span>⚡ Livraison 20 min</span>
        </button>

        <button
          onClick={() => onCategoryChange('Alimentation & Épicerie')}
          className="px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100/80 text-[#B45309] border border-amber-200/60 text-xs font-black flex items-center gap-2 shrink-0 transition shadow-2xs cursor-pointer"
        >
          <Tag className="w-4 h-4 text-[#D97706]" />
          <span>🔥 Offres Flash -30%</span>
        </button>

        <button
          onClick={() => onCategoryChange('Artisanat & Mode')}
          className="px-3 py-2 rounded-2xl bg-purple-50 hover:bg-purple-100/80 text-[#6B21A8] border border-purple-200/60 text-xs font-black flex items-center gap-2 shrink-0 transition shadow-2xs cursor-pointer"
        >
          <Award className="w-4 h-4 text-[#9333EA]" />
          <span>👑 Artisanat Ndop Royal</span>
        </button>

        {onOpenScanner && (
          <button
            onClick={onOpenScanner}
            className="px-3 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 text-[#3730A3] border border-indigo-200/60 text-xs font-black flex items-center gap-2 shrink-0 transition shadow-2xs cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#4F46E5]" />
            <span>📷 Scanner QR / Code</span>
          </button>
        )}
      </div>

      {/* 6. CATÉGORIES (Grille moderne) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs sm:text-sm font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-[#16A34A]" />
            <span>Catégories & Univers</span>
          </h3>
          <button
            onClick={() => onCategoryChange('Tous')}
            className="text-xs font-extrabold text-[#16A34A] hover:underline"
          >
            Tout afficher
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {CATEGORIES_GRID.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.categoryName;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoryChange(cat.categoryName);
                  const el = document.getElementById('popular-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-2.5 rounded-2xl border transition flex flex-col items-center text-center space-y-1 cursor-pointer group relative ${
                  isSelected
                    ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl ${isSelected ? 'bg-white/10 text-white' : cat.bg} flex items-center justify-center transition group-hover:scale-110`}>
                  <IconComp className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="font-extrabold text-[10px] sm:text-[11px] leading-tight truncate w-full">
                  {cat.name}
                </span>
                <span className={`text-[9px] font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. RECOMMANDATIONS PERSONNALISÉES (IA AfriNova & Salutations) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16A34A] to-[#10B981] text-white flex items-center justify-center font-black shadow-md shrink-0">
              <Bot className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Bonjour, {currentUser?.name || 'Cher Membre'} 👋
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                  IA AfriNova
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Bafoussam, Cameroun • <Sun className="w-3.5 h-3.5 inline text-amber-400" /> 26°C Ensoleillé
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            {activeOrder ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-emerald-300 flex items-center gap-2">
                <Truck className="w-4 h-4 animate-pulse" />
                <span>Commande #{activeOrder.id.slice(0, 6)} en cours</span>
              </div>
            ) : (
              <span className="text-slate-400 text-xs">Aucune commande en attente</span>
            )}
          </div>
        </div>

        {/* AI Suggestions Row */}
        <div>
          <p className="text-[11px] font-extrabold uppercase text-emerald-400 tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Suggestions intelligentes selon vos préférences
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer flex items-center gap-3">
              <span className="text-xl">🌶️</span>
              <div className="truncate">
                <h4 className="text-xs font-black text-white truncate">Poivre Blanc Penja Agréé</h4>
                <p className="text-[10px] text-slate-400 truncate">Marché A • 2 500 FCFA</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer flex items-center gap-3">
              <span className="text-xl">📱</span>
              <div className="truncate">
                <h4 className="text-xs font-black text-white truncate">Ecouteurs Wireless Bass</h4>
                <p className="text-[10px] text-slate-400 truncate">High-Tech • 6 000 FCFA</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer flex items-center gap-3">
              <span className="text-xl">👕</span>
              <div className="truncate">
                <h4 className="text-xs font-black text-white truncate">Tunique Ndop Bafoussam</h4>
                <p className="text-[10px] text-slate-400 truncate">Artisanat • 18 000 FCFA</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. BOUTIQUES VÉRIFIÉES (Vrais marchands) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0F172A] font-display leading-tight">
                Boutiques & Marchands Vérifiés
              </h3>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Commerçants officiels certifiés par la plateforme AfriNova
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateView('merchant')}
            className="text-xs font-black text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explorer les boutiques</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {merchants.slice(0, 3).map((merchant, idx) => (
            <motion.div
              key={merchant.id}
              whileHover={{ y: -2 }}
              onClick={() => onNavigateView('merchant')}
              className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-md transition cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0F172A] to-[#1E1B4B] text-white flex items-center justify-center font-black text-sm shadow-xs overflow-hidden shrink-0">
                    {merchant.logo ? (
                      <img src={merchant.logo} alt={merchant.name} className="w-full h-full object-cover" />
                    ) : (
                      merchant.shopName?.slice(0, 2).toUpperCase() || 'AM'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-extrabold text-xs text-[#0F172A] truncate max-w-[130px]">
                        {merchant.shopName || merchant.name}
                      </h4>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" title="AfriNova Certifié" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {merchant.location || 'Marché A • Bafoussam'}
                    </p>
                  </div>
                </div>

                <span className="bg-emerald-50 text-[#16A34A] text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                  ⚡ Rép. 5 min
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-2 border-t border-slate-100">
                <span>📍 {merchant.location || 'Tamdja'} (1.2 km)</span>
                <span className="font-bold text-slate-800">48 articles en stock</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 9. PRODUITS POPULAIRES (Grille Amazon/Alibaba) */}
      <div id="popular-products" className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0F172A] font-display leading-tight">
                Produits populaires {selectedCategory !== 'Tous' && <span className="text-[#16A34A] font-normal">• {selectedCategory}</span>}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Les meilleures offres sélectionnées par les marchands de Bafoussam
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onCategoryChange('Tous');
            }}
            className="text-xs font-black text-[#16A34A] hover:text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer transition py-1 px-2 rounded-lg bg-emerald-50/60"
          >
            <span>Voir tout</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grille 2 cartes/ligne mobile, 3-4 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {products
            .filter(p => selectedCategory === 'Tous' || p.category === selectedCategory)
            .map((product, idx) => {
              const merchant = merchants.find(m => m.id === product.merchantId);
              const merchantName = merchant?.shopName || merchant?.name || 'Marché A Bafoussam';
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
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.2) }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white rounded-[20px] border border-slate-100 shadow-2xs hover:shadow-md overflow-hidden flex flex-col justify-between cursor-pointer group transition duration-200"
                >
                  <div>
                    {/* Image */}
                    <div className="h-28 sm:h-34 lg:h-36 w-full relative overflow-hidden bg-slate-100 rounded-t-[20px]">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      
                      {/* Location Badge */}
                      <span className="absolute top-2 left-2 bg-[#0F172A]/85 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#16A34A]" />
                        <span className="truncate max-w-[85px]">{product.neighborhood || 'Tamdja'}</span>
                      </span>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => onToggleFavorite(e, product.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-slate-700 hover:text-rose-500 transition shadow-2xs cursor-pointer"
                        title="Ajouter aux favoris"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {/* Discount Badge */}
                      <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
                        -20% PROMO
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span className="font-black text-slate-800">{rating}</span>
                          <span className="text-slate-400">({reviewsCount})</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">⚡ 20 min</span>
                      </div>

                      <h4 className="font-bold text-xs text-[#0F172A] group-hover:text-[#16A34A] transition line-clamp-2 leading-snug min-h-[2rem]">
                        {product.name}
                      </h4>

                      <div className="flex items-baseline gap-1.5">
                        <div className="font-black text-xs sm:text-sm text-[#16A34A] tracking-tight">
                          {product.price ? product.price.toLocaleString() : '0'} FCFA
                        </div>
                        {oldPrice > 0 && (
                          <span className="text-[10px] text-slate-400 line-through font-medium">
                            {oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium truncate pt-1 border-t border-slate-50">
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

                  {/* Add to Cart */}
                  <div className="p-2.5 pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="w-full h-8 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#166534] text-white text-[11px] font-black transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* 10. SERVICES POPULAIRES (Prestataires) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-black">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0F172A] font-display leading-tight">
                Services & Prestataires Qualifiés
              </h3>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Plomberie, électricité, traiteur, beauté & maintenance à Bafoussam
              </p>
            </div>
          </div>

          <button
            onClick={() => onCategoryChange('Prestations & Services')}
            className="text-xs font-black text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Voir tous les services</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {POPULAR_SERVICES.map((srv) => (
            <motion.div
              key={srv.id}
              whileHover={{ y: -2 }}
              onClick={() => alert(`Réservation du service: ${srv.title} (${srv.providerName})`)}
              className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                    {srv.category}
                  </span>
                  {srv.availableNow && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Disponible
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-xs text-[#0F172A] line-clamp-2">
                  {srv.title}
                </h4>

                <div className="flex items-center gap-2">
                  <img src={srv.avatar} alt={srv.providerName} className="w-7 h-7 rounded-full object-cover" />
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-slate-800 truncate">{srv.providerName}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-700">{srv.rating}</span>
                      <span>({srv.reviewsCount})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-[#16A34A]">{srv.price}</span>
                <span className="text-[10px] font-bold text-[#2563EB] hover:underline">Réserver</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 11. ENTREPRISES PARTENAIRES (B2B Corporate) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-black">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0F172A] font-display leading-tight">
                Entreprises Partenaires B2B
              </h3>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Réseau corporate & grands comptes affiliés AfriNova
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PARTNER_COMPANIES.map((corp) => (
            <div
              key={corp.id}
              className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-md transition space-y-2"
            >
              <div className="flex items-center gap-3">
                <img src={corp.logo} alt={corp.name} className="w-10 h-10 rounded-xl object-cover" />
                <div className="truncate">
                  <div className="flex items-center gap-1">
                    <h4 className="font-extrabold text-xs text-[#0F172A] truncate">{corp.name}</h4>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{corp.industry} • {corp.branches}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {corp.description}
              </p>

              <button
                onClick={() => alert(`Demande de devis B2B envoyée à ${corp.name}`)}
                className="w-full h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-black transition cursor-pointer"
              >
                Demander un Devis B2B
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 12. ACTUALITÉS LOCALES (Bafoussam News) */}
      <div className="bg-emerald-50/60 rounded-3xl p-4 sm:p-5 border border-emerald-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#16A34A]" />
            <h3 className="text-xs sm:text-sm font-black text-[#0F172A] uppercase">
              Actualités & Vie Économique Bafoussam
            </h3>
          </div>
          <button
            onClick={() => onNavigateView('news')}
            className="text-xs font-black text-[#16A34A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Lire tout</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => onNavigateView('news')}
            className="p-3 bg-white rounded-2xl border border-slate-200/80 hover:shadow-sm transition cursor-pointer space-y-1"
          >
            <span className="text-[9px] font-black text-[#16A34A] uppercase">Économie Locale</span>
            <h4 className="text-xs font-extrabold text-[#0F172A] line-clamp-1">
              Marché A de Bafoussam : Modernisation du hall des épices
            </h4>
            <p className="text-[10px] text-slate-500 line-clamp-2">
              Les commerçants de Tamdja et Djeleng bénéficient désormais du nouveau réseau de livraison express AfriNova.
            </p>
          </div>

          <div
            onClick={() => onNavigateView('news')}
            className="p-3 bg-white rounded-2xl border border-slate-200/80 hover:shadow-sm transition cursor-pointer space-y-1"
          >
            <span className="text-[9px] font-black text-[#9333EA] uppercase">High-Tech & Numérique</span>
            <h4 className="text-xs font-extrabold text-[#0F172A] line-clamp-1">
              Inauguration du réseau de paiement Mobile Money sécurisé
            </h4>
            <p className="text-[10px] text-slate-500 line-clamp-2">
              Achetez directement sur AfriNova avec Orange Money et MTN Mobile Money en toute sérénité.
            </p>
          </div>
        </div>
      </div>

      {/* 13. PIED DE PAGE (Footer) */}
      <footer className="pt-6 pb-2 border-t border-slate-200/80 text-slate-500 text-xs space-y-6">
        {/* Assurances & Garantes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
          <div className="space-y-1">
            <Truck className="w-5 h-5 text-[#16A34A] mx-auto" />
            <h5 className="font-extrabold text-[11px] text-[#0F172A]">AfriNova Express</h5>
            <p className="text-[10px] text-slate-400">Livraison 20 min Bafoussam</p>
          </div>

          <div className="space-y-1">
            <ShieldCheck className="w-5 h-5 text-[#16A34A] mx-auto" />
            <h5 className="font-extrabold text-[11px] text-[#0F172A]">Marchands Certifiés</h5>
            <p className="text-[10px] text-slate-400">100% Produits Vérifiés</p>
          </div>

          <div className="space-y-1">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] mx-auto" />
            <h5 className="font-extrabold text-[11px] text-[#0F172A]">Paiement Sécurisé</h5>
            <p className="text-[10px] text-slate-400">OM, MoMo & Espèces</p>
          </div>

          <div className="space-y-1">
            <PhoneCall className="w-5 h-5 text-[#16A34A] mx-auto" />
            <h5 className="font-extrabold text-[11px] text-[#0F172A]">Support 24h/24</h5>
            <p className="text-[10px] text-slate-400">677 89 45 12</p>
          </div>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <AfriNovaLogo size="sm" showSlogan={true} />
          <p className="text-[11px] text-slate-400 text-center sm:text-right font-semibold">
            © 2026 AfriNova Global Tech. « L'Afrique connectée au monde. »
          </p>
        </div>
      </footer>

    </div>
  );
}
