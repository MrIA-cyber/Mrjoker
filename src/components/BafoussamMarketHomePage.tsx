import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  SlidersHorizontal, 
  ShoppingBag, 
  Bell, 
  User as UserIcon, 
  MapPin, 
  Globe, 
  ChevronRight, 
  Star, 
  ArrowRight, 
  X, 
  Grid, 
  Home, 
  MessageSquare, 
  Plus, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Utensils, 
  Smartphone, 
  Shirt, 
  Home as HomeIcon, 
  Pill, 
  Navigation,
  ChevronDown,
  ShieldCheck,
  Zap,
  Tag,
  Building2,
  PhoneCall
} from 'lucide-react';
import { Product, Merchant, User, Order } from '../types';
import { Language } from '../translations';
import { AfriNovaLogo } from './AfriNovaLogo';

interface BafoussamMarketHomePageProps {
  products: Product[];
  merchants: Merchant[];
  currentUser: User | null;
  cartItemsCount: number;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigateView: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  onOpenAddModal: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  lang?: Language;
  onLangChange?: (lang: Language) => void;
  onLogout?: () => void;
  orders?: Order[];
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
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

// Grille moderne de catégories (Style Glovo / Uber Eats)
const CATEGORIES_GRID = [
  { id: 'Tous', name: 'Tous', icon: Grid, bg: 'bg-indigo-50 text-[#4F46E5]', categoryName: 'Tous' },
  { id: 'Alimentation & Épicerie', name: 'Épicerie & Repas', icon: Utensils, bg: 'bg-emerald-50 text-[#10B981]', categoryName: 'Alimentation & Épicerie' },
  { id: 'Électronique & Tech', name: 'High-Tech & Tel', icon: Smartphone, bg: 'bg-purple-50 text-[#9333EA]', categoryName: 'Électronique & Tech' },
  { id: 'Artisanat & Mode', name: 'Mode & Ndop', icon: Shirt, bg: 'bg-amber-50 text-[#D97706]', categoryName: 'Artisanat & Mode' },
  { id: 'Maison & Décoration', name: 'Maison & Déco', icon: HomeIcon, bg: 'bg-blue-50 text-[#2563EB]', categoryName: 'Maison & Décoration' },
  { id: 'Santé & Pharmacie', name: 'Santé & Soins', icon: Pill, bg: 'bg-rose-50 text-[#E11D48]', categoryName: 'Santé & Pharmacie' },
  { id: 'Transport & Taxi', name: 'Express 20min', icon: Navigation, bg: 'bg-teal-50 text-[#0D9488]', categoryName: 'Transport & Taxi' },
  { id: 'Prestations & Services', name: 'Services', icon: Building2, bg: 'bg-[#F1F5F9] text-slate-700', categoryName: 'Prestations & Services' }
];

export default function BafoussamMarketHomePage({
  products,
  merchants,
  currentUser,
  cartItemsCount,
  onOpenCart,
  onSelectProduct,
  onAddToCart,
  onNavigateView,
  onOpenAddModal,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  lang = 'fr',
  onLangChange,
  onLogout,
  orders = [],
  theme,
  onToggleTheme
}: BafoussamMarketHomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Bafoussam, Tamdja');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'categories' | 'add' | 'messages' | 'profile'>('home');

  // Active delivery order detection
  const activeOrder = orders.find(o => o.status === 'delivering' || o.status === 'preparing' || o.status === 'picked_up' || o.status === 'pending') || 
                      (orders.length > 0 ? orders[0] : null);

  // Auto slide promo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleSelectNeighborhood = (name: string) => {
    setSelectedNeighborhood(`Bafoussam, ${name}`);
    setIsLocationModalOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-20 relative selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. EN-TÊTE MINIMALISTE ET HAUT DE GAMME (AfriNova Logo, Localisation, Actions) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Gauche: Logo AfriNova & Localisation */}
          <div className="flex items-center gap-3">
            {/* Logo AfriNova + Bafoussam Market */}
            <div 
              onClick={() => {
                onCategoryChange('Tous');
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#4F46E5] flex items-center justify-center p-1.5 shadow-xs transition group-hover:scale-105">
                <AfriNovaLogo variant="icon" size="sm" className="w-full h-full text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-black text-sm sm:text-base tracking-tight text-[#0F172A]">
                    Afri<span className="text-[#4F46E5]">Nova</span>
                  </span>
                  <span className="bg-[#10B981]/15 text-[#059669] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    Bafoussam
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                  Plateforme Internationale
                </span>
              </div>
            </div>

            {/* Localisation Pill (Amazon / Uber Eats style) */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border border-slate-200/60"
            >
              <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="truncate max-w-[140px] font-bold text-[#0F172A]">{selectedNeighborhood}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Droite: Icônes Notifications, Profil, Langue, Panier */}
          <div className="flex items-center gap-2">
            
            {/* Localisation mobile icon */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="sm:hidden flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded-full text-[11px] font-bold"
            >
              <MapPin className="w-3 h-3 text-[#10B981]" />
              <span className="truncate max-w-[90px]">{selectedNeighborhood.split(',')[1] || 'Bafoussam'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Toggle Langue (FR / EN) */}
            {onLangChange && (
              <button
                onClick={() => onLangChange(lang === 'fr' ? 'en' : 'fr')}
                className="h-8 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-black flex items-center gap-1 transition cursor-pointer border border-slate-200/50"
                title="Changer de langue"
              >
                <Globe className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span className="uppercase text-[11px]">{lang}</span>
              </button>
            )}

            {/* Notifications Icon with badge */}
            <button
              onClick={() => onNavigateView('orders')}
              className="p-2 text-slate-700 hover:text-[#4F46E5] hover:bg-slate-100 rounded-full transition cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
            </button>

            {/* Panier Shopping Cart with badge */}
            <button
              onClick={onOpenCart}
              className="p-2 text-slate-700 hover:text-[#10B981] hover:bg-slate-100 rounded-full transition cursor-pointer relative"
              title="Mon Panier"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-[#10B981] text-white font-black text-[10px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Profil User Avatar */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F172A] to-[#4F46E5] text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:opacity-90 transition cursor-pointer ring-2 ring-slate-100"
              >
                {currentUser?.name ? currentUser.name.slice(0, 1).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </button>

              {/* Popup Menu Profil */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs font-medium space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-black text-[#0F172A] truncate">{currentUser?.name || 'Client AfriNova'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser?.phone || '+237 Bafoussam'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateView('orders');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#4F46E5]" />
                      <span>Mes Commandes</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateView('merchant');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-[#10B981]" />
                      <span>Espace Vendeur</span>
                    </button>

                    {onLogout && (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 border-t border-slate-100"
                      >
                        <X className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </header>

      {/* 2. CONTENU DE PAGE D'ACCUEIL COMPACT & MINIMALISTE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 space-y-4">
        
        {/* BARRE DE RECHERCHE MODERNE (Inspiration Amazon / Glovo) */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher des produits, épicerie, restos sur AfriNova..."
                className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr from-[#0F172A] to-[#4F46E5] text-white flex items-center justify-center shadow-2xs hover:opacity-95 transition active:scale-95 shrink-0 cursor-pointer"
              title="Filtres par quartier"
            >
              <SlidersHorizontal className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* RÉSUMÉ COMPACT DES COMMANDES (Visible uniquement si une commande existe, avec Suivi GPS à la demande) */}
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-900 via-[#1E1B4B] to-slate-900 text-white rounded-2xl p-3 shadow-sm border border-slate-800 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-white">Commande #{activeOrder.id.slice(-6).toUpperCase()}</span>
                  <span className="bg-[#10B981]/20 text-[#34D399] font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                    {activeOrder.status === 'delivering' ? 'Livraison en cours' : 'En préparation'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">Est. 15-20 min • Livreur Bafoussam Express</p>
              </div>
            </div>

            {/* GPS Tracker Trigger (GPS Map is NOT permanently cluttering the page!) */}
            <button
              onClick={() => setIsGpsModalOpen(true)}
              className="h-8 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
            >
              <Navigation className="w-3.5 h-3.5 fill-white" />
              <span>Suivre (GPS)</span>
            </button>
          </motion.div>
        )}

        {/* PROMOTIONS CARROUSEL COMPACT (Amazon / Glovo style - Palette Midnight Navy, Violet, Emerald) */}
        <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={PROMO_SLIDES[currentSlide].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`relative w-full h-[150px] sm:h-[180px] bg-gradient-to-r ${PROMO_SLIDES[currentSlide].bgGradient} flex items-center justify-between p-4 sm:p-6 text-white overflow-hidden`}
            >
              {/* Overlay graphics */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              {/* Text content */}
              <div className="space-y-1.5 max-w-md z-10">
                <span className="inline-block text-[9px] font-black tracking-widest uppercase bg-white/15 px-2 py-0.5 rounded-full border border-white/20">
                  {PROMO_SLIDES[currentSlide].badge}
                </span>

                <h2 className="text-base sm:text-xl font-black tracking-tight leading-snug font-display">
                  {PROMO_SLIDES[currentSlide].title}
                </h2>

                <p className="text-xs text-slate-200 font-medium line-clamp-1">
                  {PROMO_SLIDES[currentSlide].subtitle}
                </p>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      const el = document.getElementById('popular-products');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="h-8 px-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black flex items-center gap-1 transition shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span>{PROMO_SLIDES[currentSlide].cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Image thumbnail right side */}
              <div className="hidden sm:block relative w-36 h-28 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-md">
                <img
                  src={PROMO_SLIDES[currentSlide].image}
                  alt="Promo"
                  className="w-full h-full object-cover"
                />
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Slide dots */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {PROMO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-4 bg-[#10B981]' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 5. GRILLE ÉLÉGANTE DE CATÉGORIES (Uber Eats / Glovo Style) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-black text-[#0F172A] uppercase tracking-wider">
              Catégories & Univers
            </h3>
            <button
              onClick={() => onCategoryChange('Tous')}
              className="text-xs font-bold text-[#4F46E5] hover:underline"
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
                  className={`p-2.5 rounded-2xl border transition flex flex-col items-center text-center space-y-1 cursor-pointer group ${
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
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. PRODUITS POPULAIRES (Amazon / Alibaba Style - Compact Low Height Cards) */}
        <div id="popular-products" className="pt-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
              <h3 className="text-xs sm:text-sm font-black text-[#0F172A] uppercase tracking-wider">
                Produits Populaires {selectedCategory !== 'Tous' && `• ${selectedCategory}`}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {products.filter(p => selectedCategory === 'Tous' || p.category === selectedCategory).length} articles
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {products
              .filter(p => selectedCategory === 'Tous' || p.category === selectedCategory)
              .map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -2 }}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs overflow-hidden flex flex-col justify-between cursor-pointer group transition"
                >
                  <div>
                    {/* Compact image height */}
                    <div className="h-28 sm:h-32 w-full relative overflow-hidden bg-slate-100">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-[#0F172A]/80 backdrop-blur-xs text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                        📍 {product.neighborhood || 'Bafoussam'}
                      </span>
                    </div>

                    <div className="p-2.5 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800">4.8</span>
                        <span>(34)</span>
                      </div>

                      <h4 className="font-bold text-xs text-[#0F172A] group-hover:text-[#4F46E5] transition line-clamp-1 leading-snug">
                        {product.name}
                      </h4>

                      <div className="font-black text-xs sm:text-sm text-[#10B981]">
                        {product.price ? product.price.toLocaleString() : '0'} FCFA
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="w-full h-8 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-extrabold transition flex items-center justify-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

      </main>

      {/* 7. BARRE DE NAVIGATION INFÉRIEURE (Amazon / Uber Eats style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg py-2 px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          <button
            onClick={() => {
              setActiveNav('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 transition cursor-pointer ${
              activeNav === 'home' ? 'text-[#4F46E5]' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold">Accueil</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('categories');
              const el = document.getElementById('popular-products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 transition cursor-pointer ${
              activeNav === 'categories' ? 'text-[#4F46E5]' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Grid className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold">Explorer</span>
          </button>

          {/* Central Add Button */}
          <button
            onClick={() => {
              setActiveNav('add');
              onOpenAddModal();
            }}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0F172A] to-[#10B981] text-white flex items-center justify-center shadow-md border-2 border-white transition active:scale-95 cursor-pointer -top-2 relative"
            title="Vendre un produit"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <button
            onClick={() => {
              setActiveNav('messages');
              onNavigateView('orders');
            }}
            className={`flex flex-col items-center gap-0.5 transition cursor-pointer ${
              activeNav === 'messages' ? 'text-[#4F46E5]' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold">Commandes</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('profile');
              onNavigateView('merchant');
            }}
            className={`flex flex-col items-center gap-0.5 transition cursor-pointer ${
              activeNav === 'profile' ? 'text-[#4F46E5]' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <UserIcon className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold">Vendeur</span>
          </button>

        </div>
      </nav>

      {/* MODAL MODERNE DE SELECTION DE LOCALISATION */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-2xs">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#10B981]" />
                  <h3 className="text-sm font-black text-[#0F172A] uppercase">Changer de Quartier Bafoussam</h3>
                </div>
                <button
                  onClick={() => setIsLocationModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {['Tamdja', 'Kamkop', 'Djeleng', 'Marché A', 'Marché B', 'Tyo-Ville', 'Banengo'].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSelectNeighborhood(q)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-[#059669] font-bold text-xs flex items-center justify-between transition cursor-pointer"
                  >
                    <span>📍 {q}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL GPS DE SUIVI DE LIVRAISON (Apparaît UNIQUEMENT lorsqu'une livraison est demandée / en cours) */}
      <AnimatePresence>
        {isGpsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#10B981]" />
                  <h3 className="text-sm font-black text-[#0F172A] uppercase">Suivi GPS de Livraison en Direct</h3>
                </div>
                <button
                  onClick={() => setIsGpsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Carte GPS simulée */}
              <div className="relative w-full h-48 bg-slate-900 rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80"
                  alt="GPS Map"
                  className="w-full h-full object-cover opacity-60 filter contrast-125"
                />

                {/* Animated pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#10B981] text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce">
                  <Truck className="w-5 h-5" />
                </div>

                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs font-bold">Arrivée estimée: 15 min (Tamdja)</span>
                  </div>
                  <span className="bg-[#10B981] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">GPS En Direct</span>
                </div>
              </div>

              {/* Détails livreur */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                    JP
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#0F172A]">Jean-Paul (Livreur AfriNova)</h4>
                    <p className="text-[11px] text-slate-500">Moto Express • Bafoussam Center</p>
                  </div>
                </div>

                <button
                  onClick={() => alert('Appel du livreur Jean-Paul: 677 00 11 22')}
                  className="p-2.5 rounded-xl bg-[#10B981] text-white hover:bg-[#059669] transition cursor-pointer"
                  title="Appeler le livreur"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setIsGpsModalOpen(false)}
                className="w-full h-11 rounded-xl bg-[#0F172A] text-white font-extrabold text-xs uppercase cursor-pointer"
              >
                Fermer la carte
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
