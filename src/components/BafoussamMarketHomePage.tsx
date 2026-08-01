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
  PhoneCall,
  Mic,
  Camera,
  Heart,
  Store,
  Wrench,
  Briefcase,
  QrCode,
  ScanLine,
  BarChart3,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { Product, Merchant, User, Order, AccountType } from '../types';
import { Language } from '../translations';
import { AfriNovaLogo } from './AfriNovaLogo';
import ClientHomePage from './home/ClientHomePage';
import VendeurHomePage from './home/VendeurHomePage';
import PrestataireHomePage from './home/PrestataireHomePage';
import EntrepriseHomePage from './home/EntrepriseHomePage';

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
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Bafoussam, Tamdja');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('home');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Active Role State - Default from logged in user or 'client'
  const [activeRole, setActiveRole] = useState<AccountType>(
    currentUser?.accountType || 'client'
  );

  useEffect(() => {
    if (currentUser?.accountType) {
      setActiveRole(currentUser.accountType);
    }
  }, [currentUser?.accountType]);

  const handleSelectNeighborhood = (name: string) => {
    setSelectedNeighborhood(`Bafoussam, ${name}`);
    setIsLocationModalOpen(false);
  };

  const toggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleVoiceSearch = () => {
    setIsVoiceActive(true);
    setTimeout(() => {
      onSearchChange('Poivre blanc Bafoussam');
      setIsVoiceActive(false);
    }, 1800);
  };

  // Search suggestions
  const searchSuggestions = searchTerm.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 4)
    : [];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-20 relative selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. BARRE SUPÉRIEURE FIXE (Fixed Top Header) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Gauche: Logo AfriNova & Localisation & Météo */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => {
                onCategoryChange('Tous');
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <AfriNovaLogo size="md" variant="light" showSlogan={false} />
              <span className="bg-[#10B981]/15 text-[#059669] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ml-1">
                Bafoussam
              </span>
            </div>

            {/* Localisation Pill */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border border-slate-200/60"
            >
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="truncate max-w-[140px] font-bold text-[#0F172A]">{selectedNeighborhood}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Droite: Actions Header (Notifications, Panier, Langue, User) */}
          <div className="flex items-center gap-2">
            
            {/* Localisation Mobile Button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="sm:hidden flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded-full text-[11px] font-bold"
            >
              <MapPin className="w-3 h-3 text-[#16A34A]" />
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
                <Globe className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="uppercase text-[11px]">{lang}</span>
              </button>
            )}

            {/* Notifications Icon with badge */}
            <button
              onClick={() => onNavigateView('orders')}
              className="p-2 text-slate-700 hover:text-[#16A34A] hover:bg-slate-100 rounded-full transition cursor-pointer relative"
              title="Notifications & Commandes"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
            </button>

            {/* Panier Cart Icon (Uniquement client) */}
            <button
              onClick={onOpenCart}
              className="p-2 text-slate-700 hover:text-[#16A34A] hover:bg-slate-100 rounded-full transition cursor-pointer relative"
              title="Mon Panier"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-[#16A34A] text-white font-black text-[10px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F172A] to-[#16A34A] text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:opacity-90 transition cursor-pointer ring-2 ring-slate-100"
              >
                {currentUser?.name ? currentUser.name.slice(0, 1).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 top-10 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs font-medium space-y-1"
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-black text-[#0F172A] truncate">{currentUser?.name || 'Membre AfriNova'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser?.phone || '+237 Bafoussam'}</p>
                      <span className="inline-block mt-1 bg-emerald-50 text-[#16A34A] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        Profil: {activeRole}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateView('orders');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#16A34A]" />
                      <span>Mes Commandes</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateView('merchant');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                    >
                      <Store className="w-4 h-4 text-[#2563EB]" />
                      <span>Espace Pro / Vendeur</span>
                    </button>

                    {onLogout && (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 border-t border-slate-100"
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

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 space-y-4">
        
        {/* 2. BARRE DE RECHERCHE INTELLIGENTE */}
        <div className="relative z-30 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                placeholder={isVoiceActive ? "Écoute en cours... Parlez à l'IA AfriNova" : "Rechercher produits, épicerie, services, boutiques Bafoussam..."}
                className={`w-full h-11 sm:h-12 pl-11 pr-24 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition duration-200 ${
                  isVoiceActive ? 'border-[#16A34A] ring-2 ring-[#16A34A]/30 animate-pulse' : ''
                }`}
              />

              {/* Action Buttons: Reset, Voice, Scanner */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Voice Search Button */}
                <button
                  onClick={handleVoiceSearch}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    isVoiceActive ? 'text-[#16A34A] bg-emerald-50' : 'hover:text-[#16A34A] hover:bg-slate-100'
                  }`}
                  title="Recherche vocale"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* QR / Barcode Scanner Button */}
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="p-1.5 rounded-full hover:text-[#16A34A] hover:bg-slate-100 transition cursor-pointer"
                  title="Scanner QR Code & Code-barres"
                >
                  <ScanLine className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestions Automatiques */}
              <AnimatePresence>
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 right-0 top-13 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50 p-2 space-y-1"
                  >
                    <p className="text-[10px] font-black text-slate-400 uppercase px-3 py-1">Suggestions directes</p>
                    {searchSuggestions.map((sug) => (
                      <button
                        key={sug.id}
                        onClick={() => {
                          onSelectProduct(sug);
                          setShowSearchSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 text-xs font-bold text-slate-800 flex items-center justify-between transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span className="truncate">{sug.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-[#16A34A]">{sug.price ? sug.price.toLocaleString() : '0'} FCFA</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white flex items-center justify-center shadow-2xs transition active:scale-95 shrink-0 cursor-pointer"
              title="Filtres par quartier"
            >
              <SlidersHorizontal className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 3. SÉLECTEUR DE PROFIL COMPLET (Barre de rôle) */}
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto scrollbar-none gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 pl-2 shrink-0">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Rôle Actif:</span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveRole('client')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
                activeRole === 'client'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Client</span>
            </button>

            <button
              onClick={() => setActiveRole('vendeur')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
                activeRole === 'vendeur'
                  ? 'bg-[#1E1B4B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Vendeur</span>
            </button>

            <button
              onClick={() => setActiveRole('prestataire')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
                activeRole === 'prestataire'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Prestataire</span>
            </button>

            <button
              onClick={() => setActiveRole('entreprise')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center ${
                activeRole === 'entreprise'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Entreprise</span>
            </button>
          </div>
        </div>

        {/* AFFICHAGE CONDITIONNEL TOTALEMENT SÉPARÉ SELON LE PROFIL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeRole === 'vendeur' ? (
              <VendeurHomePage
                currentUser={currentUser}
                products={products}
                merchants={merchants}
                orders={orders}
                onOpenAddModal={onOpenAddModal}
                onNavigateView={onNavigateView}
                onSelectProduct={onSelectProduct}
              />
            ) : activeRole === 'prestataire' ? (
              <PrestataireHomePage
                currentUser={currentUser}
                products={products}
                merchants={merchants}
                orders={orders}
                onOpenAddModal={onOpenAddModal}
                onNavigateView={onNavigateView}
                onSelectProduct={onSelectProduct}
              />
            ) : activeRole === 'entreprise' ? (
              <EntrepriseHomePage
                currentUser={currentUser}
                products={products}
                merchants={merchants}
                orders={orders}
                onOpenAddModal={onOpenAddModal}
                onNavigateView={onNavigateView}
                onSelectProduct={onSelectProduct}
              />
            ) : (
              <ClientHomePage
                products={products}
                merchants={merchants}
                currentUser={currentUser}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onNavigateView={onNavigateView}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                orders={orders}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onOpenScanner={() => setIsScannerOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* 8. MENU INFÉRIEUR MODULAIRE SELON LE PROFIL */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg py-2 px-4 sm:px-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          {/* Menu items for Client */}
          {activeRole === 'client' && (
            <>
              <button
                onClick={() => {
                  setActiveNav('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'home' ? 'text-[#16A34A]' : 'text-slate-400 hover:text-slate-700'
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
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'categories' ? 'text-[#16A34A]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Grid className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Explorer</span>
              </button>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0F172A] to-[#16A34A] text-white flex items-center justify-center shadow-md border-2 border-white transition active:scale-95 cursor-pointer -top-2 relative"
                title="Scanner"
              >
                <QrCode className="w-6 h-6 stroke-[2.5]" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('orders');
                  onNavigateView('orders');
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'orders' ? 'text-[#16A34A]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Commandes</span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('profile');
                  setIsProfileMenuOpen(true);
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'profile' ? 'text-[#16A34A]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <UserIcon className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Profil</span>
              </button>
            </>
          )}

          {/* Menu items for Vendeur */}
          {activeRole === 'vendeur' && (
            <>
              <button
                onClick={() => setActiveNav('home')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'home' ? 'text-[#1E1B4B]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Home className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Accueil</span>
              </button>

              <button
                onClick={() => onNavigateView('shop')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'products' ? 'text-[#1E1B4B]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Store className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Produits</span>
              </button>

              <button
                onClick={onOpenAddModal}
                className="w-11 h-11 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-md border-2 border-white transition active:scale-95 cursor-pointer -top-2 relative"
                title="Ajouter un produit"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>

              <button
                onClick={() => onNavigateView('orders')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'orders' ? 'text-[#1E1B4B]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Commandes</span>
              </button>

              <button
                onClick={() => onNavigateView('merchant')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'stats' ? 'text-[#1E1B4B]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <BarChart3 className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Stats</span>
              </button>
            </>
          )}

          {/* Menu items for Prestataire */}
          {activeRole === 'prestataire' && (
            <>
              <button
                onClick={() => setActiveNav('home')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'home' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Home className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Accueil</span>
              </button>

              <button
                onClick={() => onNavigateView('shop')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'services' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Wrench className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Services</span>
              </button>

              <button
                onClick={onOpenAddModal}
                className="w-11 h-11 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md border-2 border-white transition active:scale-95 cursor-pointer -top-2 relative"
                title="Créer un service"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>

              <button
                onClick={() => onNavigateView('orders')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'reservations' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Calendar className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Réservations</span>
              </button>

              <button
                onClick={() => setIsProfileMenuOpen(true)}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'profile' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <UserIcon className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Profil</span>
              </button>
            </>
          )}

          {/* Menu items for Entreprise */}
          {activeRole === 'entreprise' && (
            <>
              <button
                onClick={() => setActiveNav('home')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'home' ? 'text-[#0F172A]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Home className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Accueil</span>
              </button>

              <button
                onClick={() => onNavigateView('merchant')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'gestion' ? 'text-[#0F172A]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Gestion</span>
              </button>

              <button
                onClick={onOpenAddModal}
                className="w-11 h-11 rounded-full bg-[#0F172A] text-white flex items-center justify-center shadow-md border-2 border-white transition active:scale-95 cursor-pointer -top-2 relative"
                title="Nouveau projet B2B"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>

              <button
                onClick={() => onNavigateView('orders')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'reports' ? 'text-[#0F172A]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <FileText className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Rapports</span>
              </button>

              <button
                onClick={() => onNavigateView('merchant')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'corp' ? 'text-[#0F172A]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Building2 className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Entreprise</span>
              </button>
            </>
          )}

        </div>
      </nav>

      {/* MODAL SCANNER QR / CODE-BARRES */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 text-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-800 text-center relative overflow-hidden"
            >
              <button
                onClick={() => setIsScannerOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pt-2">
                <QrCode className="w-8 h-8 text-[#16A34A] mx-auto animate-pulse" />
                <h3 className="text-base font-black uppercase">Scanner AfriNova</h3>
                <p className="text-xs text-slate-400">Pointez la caméra vers un produit ou un QR marchand</p>
              </div>

              {/* Viewport Frame Simulator */}
              <div className="relative w-full h-52 bg-slate-950 rounded-2xl border-2 border-dashed border-[#16A34A] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-x-0 h-0.5 bg-[#16A34A] shadow-[0_0_15px_#16A34A] animate-bounce" />
                <p className="text-xs font-bold text-slate-500">Caméra active (Bafoussam)</p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setIsScannerOpen(false);
                    onSearchChange('Poivre blanc Bafoussam');
                  }}
                  className="w-full h-11 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs transition cursor-pointer"
                >
                  Simuler Scan Produit (#AFR-892)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SELECTION DE LOCALISATION */}
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
                  <MapPin className="w-5 h-5 text-[#16A34A]" />
                  <h3 className="text-sm font-black text-[#0F172A] uppercase">Changer de Quartier Bafoussam</h3>
                </div>
                <button
                  onClick={() => setIsLocationModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
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

    </div>
  );
}
