import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { CATEGORIES } from '../data/mockData';
import { 
  ShoppingCart, 
  Search, 
  Store, 
  Compass, 
  MapPin, 
  LogOut, 
  PackageCheck, 
  Newspaper, 
  Key, 
  Sun, 
  Moon, 
  X, 
  Globe, 
  Sparkles, 
  Smartphone,
  Mic,
  QrCode,
  Bell,
  Settings,
  User as UserIcon,
  Volume2,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { translations, Language } from '../translations';
import SupportPhoneNumber from './SupportPhoneNumber';

interface StoreHeaderProps {
  currentUser: User;
  activeView: 'shop' | 'merchant' | 'orders' | 'news' | 'admin';
  onViewChange: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  cartItemsCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit?: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onLogout: () => void;
  isAdminUnlocked?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSimulateUserExpiration?: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  onOpenSubscriptions?: () => void;
}

const CATEGORY_EMOJIS: Record<string, { emoji: string; label: string }> = {
  'Tous': { emoji: '🌟', label: 'Tous' },
  'Alimentation & Épicerie': { emoji: '🥬', label: 'Alimentation' },
  'Artisanat & Mode': { emoji: '👕', label: 'Mode' },
  'Électronique & Tech': { emoji: '📱', label: 'Électronique' },
  'Maison & Décoration': { emoji: '🏠', label: 'Maison' },
  'Santé & Pharmacie': { emoji: '💊', label: 'Pharmacie' },
  'Transport & Taxi': { emoji: '🚕', label: 'Taxi' },
  'Événements & Billetterie': { emoji: '🎉', label: 'Événements' },
  'Emplois & Stage': { emoji: '💼', label: 'Emplois' },
  'Prestations & Services': { emoji: '🛠️', label: 'Services' },
};

function LogoImage() {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <svg className="w-11 h-11 object-contain group-hover:scale-105 transition-transform shrink-0" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hdrBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#3730a3" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="hdrAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="128" fill="url(#hdrBgGrad)" />
        <path d="M 60 380 L 180 260 L 260 320 L 360 210 L 452 380 Z" fill="#ffffff" fillOpacity="0.06" />
        <rect x="24" y="24" width="464" height="464" rx="104" fill="none" stroke="url(#hdrAccentGrad)" strokeWidth="8" strokeOpacity="0.4" />
        <g transform="translate(0, -10)">
          <path d="M 196 180 C 196 120, 316 120, 316 180" fill="none" stroke="#f59e0b" strokeWidth="24" strokeLinecap="round" />
          <path d="M 216 180 C 216 136, 296 136, 296 180" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
          <path d="M 140 185 H 372 L 352 400 C 352 420, 336 436, 316 436 H 196 C 176 436, 160 420, 160 400 Z" fill="#ffffff" />
          <path d="M 196 240 L 256 310 L 316 240 L 328 350 H 296 L 288 290 L 256 328 L 224 290 L 216 350 H 184 Z" fill="#4f46e5" />
          <circle cx="256" cy="380" r="16" fill="#10b981" />
          <path d="M 256 368 L 260 376 L 268 380 L 260 384 L 256 392 L 252 384 L 244 380 L 252 376 Z" fill="#ffffff" />
        </g>
      </svg>
    );
  }

  return (
    <img 
      src="/logo-bafoussam-market.svg" 
      alt="Bafoussam Market Logo" 
      className="w-11 h-11 object-contain group-hover:scale-105 transition-transform shrink-0" 
      onError={() => setHasError(true)}
    />
  );
}

export default function StoreHeader({
  currentUser,
  activeView,
  onViewChange,
  cartItemsCount,
  onOpenCart,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  selectedCategory,
  onCategoryChange,
  onLogout,
  isAdminUnlocked = false,
  theme,
  onToggleTheme,
  onSimulateUserExpiration,
  lang,
  onLangChange,
  onOpenSubscriptions,
}: StoreHeaderProps) {
  const t = translations[lang];

  // Interactive Voice and QR search state modals
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isQrActive, setIsQrActive] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  const handleStartVoiceSearch = () => {
    setIsVoiceActive(true);
    setVoiceText(lang === 'fr' ? 'Écoute en cours...' : 'Listening...');
    setTimeout(() => {
      const sampleQueries = ['Taro avec sauce jaune', 'Café Arabica Bafoussam', 'Tissu Ndop royal', 'Poivre blanc de Penja'];
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      setVoiceText(`"${randomQuery}"`);
      setTimeout(() => {
        onSearchChange(randomQuery);
        setIsVoiceActive(false);
      }, 1200);
    }, 1500);
  };

  const handleStartQrScanner = () => {
    setIsQrActive(true);
    setTimeout(() => {
      onSearchChange('Café Arabica');
      setIsQrActive(false);
    }, 2500);
  };

  const getCategoryDisplay = (cat: string) => {
    const item = CATEGORY_EMOJIS[cat];
    if (item) {
      return `${item.emoji} ${lang === 'fr' ? item.label : cat}`;
    }
    return cat;
  };

  return (
    <header className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 sticky top-0 z-40 transition-colors duration-200 relative overflow-hidden" id="store-header">
      {/* Ambient Drifting Radial Light Halo */}
      <div className="absolute -top-24 left-1/3 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-ambient-halo" />

      {/* Upper bar: Location, Subscriptions, Quick Controls */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-6 flex justify-between items-center border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="font-bold text-white">Bafoussam, Cameroun</span>
          <span className="text-slate-600">•</span>
          <button
            onClick={() => onViewChange('merchant')}
            className="text-amber-300 hover:text-amber-200 font-bold underline text-[11px] transition cursor-pointer flex items-center gap-1"
            id="link-merchant-portal"
            title="Accès Espace Commerçant"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Vous êtes commerçant ?</span>
          </button>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <button
            onClick={onOpenSubscriptions}
            className="text-emerald-400 hover:text-emerald-300 font-black text-[11px] transition cursor-pointer flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg"
            title="Gérer ou Modifier mon Abonnement"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Formule : <strong className="uppercase">{currentUser.accountType || 'Client'}</strong></span>
          </button>
          {isAdminUnlocked && onSimulateUserExpiration && (
            <>
              <span className="text-slate-600">•</span>
              <button
                onClick={onSimulateUserExpiration}
                className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer bg-transparent border-none text-[11px]"
                title="Tester l'écran d'expiration"
              >
                [🧪 Expirer mon Accès]
              </button>
            </>
          )}
          <span className="text-slate-600 hidden md:inline">•</span>
          <SupportPhoneNumber prefix="Support :" showIcon={false} className="text-[10px] text-slate-400/80 font-normal hidden md:inline" />
        </div>

        {/* Right Controls: Language, Theme, Logout */}
        <div className="flex items-center gap-2">
          {/* Language toggle selector */}
          <button
            onClick={() => onLangChange(lang === 'fr' ? 'en' : 'fr')}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center bg-slate-800 hover:bg-slate-700 h-7 px-2 text-[10px] font-extrabold font-mono"
            title={lang === 'fr' ? 'Switch to English' : 'Changer en Français'}
            id="language-toggle-button"
          >
            <Globe className="w-3 h-3 text-indigo-400 mr-1" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center bg-slate-800 hover:bg-slate-700 h-7 w-7 text-center"
            title={theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
            id="theme-toggle-button"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 hover:text-red-400 transition cursor-pointer h-7 text-slate-400 text-xs ml-1"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Modern Welcome Card Banner (Section 1 in Prompt) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-4 sm:px-6 py-3 border-b border-indigo-500/20 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-black text-xs text-white uppercase font-display">
                  {currentUser.name ? currentUser.name.slice(0, 2) : 'BM'}
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 font-display">
                <span>👋 Bonjour,</span>
                <span className="text-indigo-300">{currentUser.name}</span>
              </h2>
              <p className="text-[11px] text-slate-300 font-medium leading-none mt-0.5">
                Bon retour sur Bafoussam Market
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewChange('orders')}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-indigo-400" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>
            <button
              onClick={onOpenSubscriptions}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition cursor-pointer"
              title="Paramètres de profil"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Platform Modes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-start gap-3 sm:gap-5 w-full md:w-auto">
            <div className="flex items-center gap-3 cursor-pointer self-start sm:self-auto group" onClick={() => onViewChange('shop')}>
              <LogoImage />
              <div className="flex flex-col justify-center">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-display leading-none">
                  Bafoussam <span className="text-[#4F46E5] dark:text-indigo-400">Market</span>
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-normal mt-1 leading-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{lang === 'fr' ? 'Livraison locale 100% active' : '100% active local delivery'}</span>
                </span>
              </div>
            </div>

            {/* Mode Switches */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl text-xs font-bold overflow-x-auto no-scrollbar w-full sm:w-auto max-w-full shrink-0 border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => onViewChange('shop')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  activeView === 'shop'
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-md shadow-indigo-600/20 font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="tab-client-space"
              >
                <Compass className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Espace Client' : 'Customer Space'}</span>
              </button>

              {activeView === 'merchant' && (
                <button
                  onClick={() => onViewChange('merchant')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm font-black"
                  id="tab-merchant-space"
                >
                  <Store className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Espace Commerçant' : 'Merchant Space'}</span>
                </button>
              )}

              <button
                onClick={() => onViewChange('orders')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer relative ${
                  activeView === 'orders'
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-md shadow-indigo-600/20 font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Commandes' : 'Orders'}</span>
              </button>

              <button
                onClick={() => onViewChange('news')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer relative ${
                  activeView === 'news'
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-md shadow-indigo-600/20 font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="tab-city-news"
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Actualités' : 'News'}</span>
              </button>

              {isAdminUnlocked && (
                <button
                  onClick={() => onViewChange('admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                    activeView === 'admin'
                      ? 'bg-slate-900 text-amber-400 shadow-sm'
                      : 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40'
                  }`}
                  id="tab-admin-space"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="font-extrabold">{t.admin}</span>
                </button>
              )}
            </div>
          </div>

          {/* Search, Filter, Voice & QR Scanner, Cart Controls */}
          {activeView === 'shop' && (
            <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 md:max-w-xl md:justify-end">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onSearchSubmit) {
                    onSearchSubmit();
                  }
                }}
                className="relative w-full md:max-w-md group"
              >
                <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-[#4F46E5] transition-colors" />
                <input
                  type="text"
                  placeholder={lang === 'fr' ? "Rechercher taro, café, vêtement, épices..." : "Search taro, coffee, clothing, spices..."}
                  className="w-full pl-10 pr-24 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 focus:border-[#4F46E5] focus:scale-[1.01] rounded-2xl text-slate-950 dark:text-slate-100 text-xs sm:text-sm transition-all font-medium shadow-2xs"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                
                {/* Voice & QR Scanner Actions inside Search Input */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700"
                      title="Effacer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStartVoiceSearch}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-[#4F46E5] dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition cursor-pointer"
                    title="Recherche Vocale"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStartQrScanner}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-[#4F46E5] dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition cursor-pointer"
                    title="Scan QR / Code-barres"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenCart}
                className="relative bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60 hover:from-indigo-100 hover:to-violet-100 dark:hover:from-indigo-900/60 dark:hover:to-violet-900/60 text-indigo-900 dark:text-indigo-200 p-3 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/60 cursor-pointer transition flex items-center justify-center shrink-0 shadow-sm"
                id="btn-open-cart"
              >
                <ShoppingCart className="w-5 h-5 text-[#4F46E5] dark:text-indigo-400" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#4F46E5] text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </motion.button>
            </div>
          )}
        </div>

        {/* Categories Bar with Emoji Cards (Section 4 in Prompt) */}
        {activeView === 'shop' && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1" id="categories-scroller">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                const displayText = getCategoryDisplay(cat);

                return (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-500/20'
                        : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <span>{displayText}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Voice Search Animated Modal */}
      <AnimatePresence>
        {isVoiceActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[#4F46E5] flex items-center justify-center mx-auto animate-pulse">
                <Volume2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                Recherche Vocale
              </h3>
              <p className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                {voiceText}
              </p>
              <button
                onClick={() => setIsVoiceActive(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Annuler
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Scanner Animated Modal */}
      <AnimatePresence>
        {isQrActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative"
            >
              <div className="w-48 h-48 border-2 border-dashed border-[#4F46E5] rounded-2xl mx-auto flex items-center justify-center relative overflow-hidden bg-slate-950">
                <div className="absolute inset-x-0 h-0.5 bg-[#4F46E5] shadow-[0_0_15px_#4F46E5] animate-ping top-1/2" />
                <Camera className="w-10 h-10 text-slate-500 animate-pulse" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                Scanner un produit
              </h3>
              <p className="text-xs text-slate-500">
                Placez le code QR ou code-barres du produit dans le cadre...
              </p>
              <button
                onClick={() => setIsQrActive(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

