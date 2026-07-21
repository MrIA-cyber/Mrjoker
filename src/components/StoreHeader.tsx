import React from 'react';
import { User } from '../types';
import { CATEGORIES } from '../data/mockData';
import { ShoppingCart, Search, Store, Compass, MapPin, LogOut, PackageCheck, Newspaper, Key, Sun, Moon, X, Globe } from 'lucide-react';
import { translations, Language } from '../translations';

interface StoreHeaderProps {
  currentUser: User;
  activeView: 'shop' | 'merchant' | 'orders' | 'news' | 'admin';
  onViewChange: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  cartItemsCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onLogout: () => void;
  isAdminUnlocked?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSimulateUserExpiration?: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

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
  selectedCategory,
  onCategoryChange,
  onLogout,
  isAdminUnlocked = false,
  theme,
  onToggleTheme,
  onSimulateUserExpiration,
  lang,
  onLangChange,
}: StoreHeaderProps) {
  const t = translations[lang];

  const translateCategory = (cat: string) => {
    if (cat === 'Tous') return lang === 'fr' ? 'Tous' : 'All';
    if (cat === 'Alimentation & Épicerie') return lang === 'fr' ? 'Alimentation & Épicerie' : 'Food & Grocery';
    if (cat === 'Artisanat & Mode') return lang === 'fr' ? 'Artisanat & Mode' : 'Crafts & Fashion';
    if (cat === 'Électronique & Tech') return lang === 'fr' ? 'Électronique & Tech' : 'Electronics & Tech';
    return cat;
  };

  return (
    <header className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 sticky top-0 z-40 transition-colors duration-200" id="store-header">
      {/* Upper bar: User location, welcome, signout */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-6 flex justify-between items-center">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Bafoussam, Cameroun</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            {lang === 'fr' 
              ? `Accès payé jusqu'au ${currentUser.subscriptionExpiryDate ? new Date(currentUser.subscriptionExpiryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}`
              : `Paid access until ${currentUser.subscriptionExpiryDate ? new Date(currentUser.subscriptionExpiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}`
            }
          </span>
          {isAdminUnlocked && onSimulateUserExpiration && (
            <>
              <span className="text-slate-500">•</span>
              <button
                onClick={onSimulateUserExpiration}
                className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer bg-transparent border-none text-[11px]"
                title="Tester l'écran d'expiration"
              >
                [🧪 Expirer mon Accès]
              </button>
            </>
          )}
          <span className="text-slate-500">•</span>
          <span className="text-indigo-400 font-bold">
            Support: <a href="tel:640406412" className="underline hover:text-indigo-300">640 40 64 12</a>
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 hidden xs:inline">
            {lang === 'fr' ? 'Bonjour' : 'Hello'}, <strong className="text-white font-semibold">{currentUser.name}</strong>
          </span>
          
          {/* Language toggle selector */}
          <button
            onClick={() => onLangChange(lang === 'fr' ? 'en' : 'fr')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center bg-slate-800 hover:bg-slate-700 h-8 gap-1.5 px-2.5 text-[10px] font-extrabold font-mono"
            title={lang === 'fr' ? 'Switch to English' : 'Changer en Français'}
            id="language-toggle-button"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center bg-slate-800 hover:bg-slate-700 h-8 w-8 text-center"
            title={theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
            id="theme-toggle-button"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 hover:text-red-400 transition cursor-pointer h-8 text-slate-400"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Platform Modes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-start gap-4 sm:gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3 cursor-pointer self-start sm:self-auto group" onClick={() => onViewChange('shop')}>
              <LogoImage />
              <div className="flex flex-col justify-center">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display leading-none">
                  Bafoussam <span className="text-indigo-600 dark:text-indigo-400">Market</span>
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-normal mt-1 leading-none">
                  {lang === 'fr' ? 'Livraison locale rapide' : 'Fast local delivery'}
                </span>
              </div>
            </div>

            {/* Mode Switches */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar w-full sm:w-auto max-w-full shrink-0">
              <button
                onClick={() => onViewChange('shop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeView === 'shop'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t.home}</span>
              </button>

              <button
                onClick={() => onViewChange('merchant')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeView === 'merchant'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="tab-merchant-space"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t.merchant}</span>
              </button>

              <button
                onClick={() => onViewChange('orders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer relative ${
                  activeView === 'orders'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Suivi Commandes' : 'Order Tracking'}</span>
              </button>

              <button
                onClick={() => onViewChange('news')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer relative ${
                  activeView === 'news'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="tab-city-news"
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Actualités' : 'News'}</span>
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              </button>

              {isAdminUnlocked && (
                <button
                  onClick={() => onViewChange('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer relative ${
                    activeView === 'admin'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                  }`}
                  id="tab-admin-space"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="font-extrabold">{t.admin}</span>
                </button>
              )}
            </div>
          </div>

          {/* Search, Filter, Cart Controls (only if in shop view) */}
          {activeView === 'shop' && (
            <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 md:max-w-xl md:justify-end">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={lang === 'fr' ? "Rechercher taro, café, vêtement, épices..." : "Search taro, coffee, clothing, spices..."}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl text-slate-950 dark:text-slate-100 text-sm transition"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="Effacer la recherche"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                className="relative bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900 cursor-pointer transition flex items-center justify-center shrink-0"
                id="btn-open-cart"
              >
                <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Category horizontal scroller (only visible in Shop view) */}
        {activeView === 'shop' && (
          <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-t border-slate-100 dark:border-slate-800 pt-4" id="categories-scroller">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2 shrink-0">
              {lang === 'fr' ? 'Catégories:' : 'Categories:'}
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {translateCategory(cat)}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
