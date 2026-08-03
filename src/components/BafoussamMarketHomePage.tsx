import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingBag, 
  Bell, 
  User as UserIcon, 
  MapPin, 
  Globe, 
  ChevronRight, 
  X, 
  Grid, 
  Home, 
  Plus, 
  ChevronDown,
  ShieldCheck,
  Store,
  QrCode,
  ScanLine,
  BarChart3,
  Mic,
  ShieldAlert,
  Lock,
  FileText,
  Building2,
  Briefcase,
  Wrench,
  Truck
} from 'lucide-react';
import { Product, Merchant, User, Order, AccountType } from '../types';
import { Language } from '../translations';
import { AfriNovaLogo } from './AfriNovaLogo';
import ClientHomePage from './home/ClientHomePage';
import VendeurHomePage from './home/VendeurHomePage';
import PrestataireHomePage from './home/PrestataireHomePage';
import EntrepriseHomePage from './home/EntrepriseHomePage';
import LivreurHomePage from './home/LivreurHomePage';
import { UserRole, mapAccountTypeToRole, getDashboardForRole, isViewAllowedForRole } from '../lib/rbac';
import { logAuditEvent } from '../lib/auditLogger';
import { filterProductsByRole, filterOrdersByRole, filterMerchantsByRole } from '../lib/dataFilters';
import AccessDeniedModal from './AccessDeniedModal';
import AuditLogsModal from './AuditLogsModal';

interface BafoussamMarketHomePageProps {
  products: Product[];
  merchants: Merchant[];
  currentUser: User | null;
  onUpdateCurrentUser?: (user: User) => void;
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
  onLoginClick?: () => void;
  orders?: Order[];
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function BafoussamMarketHomePage({
  products,
  merchants,
  currentUser,
  onUpdateCurrentUser,
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
  onLoginClick,
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

  // Active Role Switcher state
  const [selectedRoleState, setSelectedRoleState] = useState<AccountType>(() => currentUser?.accountType || 'client');

  useEffect(() => {
    if (currentUser?.accountType) {
      setSelectedRoleState(currentUser.accountType);
    }
  }, [currentUser?.accountType]);

  // Security RBAC states
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [deniedAttemptInfo, setDeniedAttemptInfo] = useState<{ isOpen: boolean; resource: string } | null>(null);

  const activeRole: AccountType = selectedRoleState || currentUser?.accountType || 'client';
  const userRole: UserRole = mapAccountTypeToRole(activeRole);

  const handleSwitchRole = (newRole: AccountType) => {
    setSelectedRoleState(newRole);
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        accountType: newRole
      };
      try {
        localStorage.setItem('bafoussam_user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error("Error saving updated user role to localStorage:", e);
      }
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedUser);
      }
    }
    setIsProfileMenuOpen(false);
  };

  // Apply strict role-based data filtering
  const roleProducts = filterProductsByRole(products, currentUser);
  const roleOrders = filterOrdersByRole(orders, currentUser);
  const roleMerchants = filterMerchantsByRole(merchants, currentUser);

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

  // Guard navigation to protected role dashboards
  const handleProtectedNavigate = (targetRoleView: 'shop' | 'merchant' | 'orders' | 'admin') => {
    const isAllowed = isViewAllowedForRole(targetRoleView, userRole);

    if (!isAllowed && currentUser) {
      logAuditEvent({
        userId: currentUser.id,
        userName: currentUser.name || 'Utilisateur',
        userRole: userRole,
        action: 'ATTEMPT_UNAUTHORIZED_VIEW',
        resource: targetRoleView,
        status: 'DENIED',
        reason: `Rôle ${userRole} n'a pas accès à la vue ${targetRoleView}`,
      });

      setDeniedAttemptInfo({
        isOpen: true,
        resource: targetRoleView === 'merchant' ? 'Espace Pro Commerçant' : targetRoleView === 'admin' ? 'Panneau Admin' : targetRoleView,
      });
      return;
    }

    onNavigateView(targetRoleView);
  };

  // Search suggestions
  const searchSuggestions = searchTerm.trim().length > 1
    ? roleProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 4)
    : [];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-20 relative selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. BARRE SUPÉRIEURE FIXE (Fixed Top Header - Standardized Height h-16 sm:h-20) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs px-4 sm:px-6 h-16 sm:h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          
          {/* Gauche: Logo AfriNova & Localisation */}
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

            {/* Role Badge indicator */}
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-black uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rôle RBAC: {userRole}</span>
            </div>
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

            {/* Audit Logs Button */}
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="p-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition cursor-pointer relative"
              title="Journaux d'Audit Sécurité RBAC"
            >
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
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
              onClick={() => handleProtectedNavigate('orders')}
              className="p-2 text-slate-700 hover:text-[#16A34A] hover:bg-slate-100 rounded-full transition cursor-pointer relative"
              title="Notifications & Commandes"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
            </button>

            {/* Panier Cart Icon (Strictly for Client role) */}
            {userRole === 'CLIENT' && (
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
            )}

            {/* User Avatar & Dropdown strictly tailored by role */}
            <div className="relative">
              {!currentUser ? (
                <button
                  onClick={() => {
                    if (onLoginClick) onLoginClick();
                  }}
                  className="h-9 px-3.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  id="btn-header-login"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Se connecter</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F172A] to-[#16A34A] text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:opacity-90 transition cursor-pointer ring-2 ring-slate-100"
                >
                  {currentUser?.name ? currentUser.name.slice(0, 1).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </button>
              )}

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs font-medium space-y-1"
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50 space-y-1">
                      <p className="font-black text-[#0F172A] truncate">{currentUser?.name || 'Membre AfriNova'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser?.phone || '+237 Bafoussam'}</p>
                      <div className="flex items-center gap-1 pt-0.5">
                        <span className="bg-emerald-100 text-[#16A34A] text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-200 flex items-center gap-1">
                          <span>Profil Actif :</span>
                          <strong className="text-emerald-800">{activeRole.toUpperCase()}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Quick Role / Profile Selector */}
                    <div className="px-3 py-1.5 bg-slate-50/70 border-b border-slate-100 space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 px-1">Changer de Profil / Espace :</p>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <button
                          onClick={() => handleSwitchRole('client')}
                          className={`px-2 py-1.5 rounded-lg text-left font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            activeRole === 'client' ? 'bg-[#16A34A] text-white' : 'hover:bg-slate-200/70 text-slate-700'
                          }`}
                        >
                          <UserIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Client</span>
                        </button>

                        <button
                          onClick={() => handleSwitchRole('vendeur')}
                          className={`px-2 py-1.5 rounded-lg text-left font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            activeRole === 'vendeur' ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-200/70 text-slate-700'
                          }`}
                        >
                          <Store className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Vendeur</span>
                        </button>

                        <button
                          onClick={() => handleSwitchRole('entreprise')}
                          className={`px-2 py-1.5 rounded-lg text-left font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            activeRole === 'entreprise' ? 'bg-purple-600 text-white' : 'hover:bg-slate-200/70 text-slate-700'
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Entreprise</span>
                        </button>

                        <button
                          onClick={() => handleSwitchRole('prestataire')}
                          className={`px-2 py-1.5 rounded-lg text-left font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            activeRole === 'prestataire' ? 'bg-amber-600 text-white' : 'hover:bg-slate-200/70 text-slate-700'
                          }`}
                        >
                          <Briefcase className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Prestataire</span>
                        </button>

                        <button
                          onClick={() => handleSwitchRole('livreur')}
                          className={`px-2 py-1.5 rounded-lg text-left font-bold flex items-center gap-1.5 transition cursor-pointer col-span-2 ${
                            activeRole === 'livreur' ? 'bg-emerald-700 text-white' : 'hover:bg-slate-200/70 text-slate-700'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Livreur Bafoussam</span>
                        </button>
                      </div>
                    </div>

                    {/* Role-Specific Actions */}
                    {userRole === 'CLIENT' && (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onNavigateView('orders');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#16A34A]" />
                        <span>Mes Commandes Client</span>
                      </button>
                    )}

                    {userRole === 'BOUTIQUE' && (
                      <>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigateView('merchant');
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                        >
                          <Store className="w-4 h-4 text-[#2563EB]" />
                          <span>Mon Espace Boutique / Vendeur</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenAddModal();
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4 text-emerald-600" />
                          <span>Ajouter un produit</span>
                        </button>
                      </>
                    )}

                    {userRole === 'ENTREPRISE' && (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveNav('home');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4 text-purple-600" />
                        <span>Tableau de Bord Entreprise</span>
                      </button>
                    )}

                    {userRole === 'PRESTATAIRE' && (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveNav('home');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4 text-amber-600" />
                        <span>Espace Prestataire & Services</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsAuditModalOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-indigo-50 text-indigo-700 font-bold flex items-center gap-2 border-t border-slate-100"
                    >
                      <ShieldAlert className="w-4 h-4 text-indigo-600" />
                      <span>Journaux d'Audit & Sécurité</span>
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

      {/* CONTENU PRINCIPAL PAR RÔLE UNIQUE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 space-y-4">
        
        {/* BARRE DE RECHERCHE INTELLIGENTE */}
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
                
                <button
                  onClick={handleVoiceSearch}
                  className={`p-1.5 rounded-full transition cursor-pointer ${
                    isVoiceActive ? 'text-[#16A34A] bg-emerald-50' : 'hover:text-[#16A34A] hover:bg-slate-100'
                  }`}
                  title="Recherche vocale"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="p-1.5 rounded-full hover:text-[#16A34A] hover:bg-slate-100 transition cursor-pointer"
                  title="Scanner QR Code"
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
                    className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2 space-y-1"
                  >
                    {searchSuggestions.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onSelectProduct(prod);
                          setShowSearchSuggestions(false);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition"
                      >
                        <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-[#0F172A] truncate">{prod.name}</p>
                          <p className="text-[10px] text-slate-400">{prod.merchantName} • {prod.price.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* AFFICHAGE DU TABLEAU DE BORD EXCLUSIF AU RÔLE UNIQUE */}
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
                products={roleProducts}
                merchants={roleMerchants}
                orders={roleOrders}
                onOpenAddModal={onOpenAddModal}
                onNavigateView={onNavigateView}
                onSelectProduct={onSelectProduct}
                onLogout={onLogout}
              />
            ) : activeRole === 'prestataire' ? (
              <PrestataireHomePage
                currentUser={currentUser}
                products={roleProducts}
                merchants={roleMerchants}
                orders={roleOrders}
                onOpenAddModal={onOpenAddModal}
                onNavigateView={onNavigateView}
                onSelectProduct={onSelectProduct}
                onLogout={onLogout}
              />
            ) : activeRole === 'entreprise' ? (
              <EntrepriseHomePage
                currentUser={currentUser}
                products={roleProducts}
                merchants={roleMerchants}
                orders={roleOrders}
                onOpenAddModal={onOpenAddModal}
                onNavigateView={onNavigateView}
                onSelectProduct={onSelectProduct}
                onLogout={onLogout}
              />
            ) : activeRole === 'livreur' ? (
              <LivreurHomePage
                currentUser={currentUser}
                products={roleProducts}
                merchants={roleMerchants}
                orders={roleOrders}
                onOpenAddModal={onOpenAddModal}
                onNavigateView={onNavigateView}
                onSelectProduct={onSelectProduct}
                onLogout={onLogout}
              />
            ) : (
              <ClientHomePage
                products={roleProducts}
                merchants={roleMerchants}
                currentUser={currentUser}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onNavigateView={onNavigateView}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                orders={roleOrders}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onOpenScanner={() => setIsScannerOpen(true)}
                onLogout={onLogout}
                cartCount={cartItemsCount}
                onOpenCart={onOpenCart}
                onSwitchRole={handleSwitchRole}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* MENU INFÉRIEUR STRICTEMENT SÉPARÉ PAR PROFIL/RÔLE */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg py-2 px-4 sm:px-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          {/* Menu items for CLIENT Role */}
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

          {/* Menu items for BOUTIQUE Role */}
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
                onClick={() => onNavigateView('merchant')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'products' ? 'text-[#1E1B4B]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Store className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Boutique</span>
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
                <span className="text-[10px] font-bold">Ventes</span>
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

          {/* Menu items for PRESTATAIRE Role */}
          {activeRole === 'prestataire' && (
            <>
              <button
                onClick={() => {
                  setActiveNav('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'home' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Briefcase className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Services</span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('orders');
                  onNavigateView('orders');
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer text-slate-400 hover:text-slate-700`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Réservations</span>
              </button>

              <button
                onClick={() => setIsProfileMenuOpen(true)}
                className={`flex flex-col items-center gap-0.5 cursor-pointer text-slate-400 hover:text-slate-700`}
              >
                <UserIcon className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Profil</span>
              </button>
            </>
          )}

          {/* Menu items for ENTREPRISE Role */}
          {activeRole === 'entreprise' && (
            <>
              <button
                onClick={() => {
                  setActiveNav('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'home' ? 'text-purple-700' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Building2 className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Entreprise</span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('orders');
                  onNavigateView('orders');
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer text-slate-400 hover:text-slate-700`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Commandes B2B</span>
              </button>

              <button
                onClick={() => setIsProfileMenuOpen(true)}
                className={`flex flex-col items-center gap-0.5 cursor-pointer text-slate-400 hover:text-slate-700`}
              >
                <UserIcon className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Profil</span>
              </button>
            </>
          )}

          {/* Menu items for LIVREUR Role */}
          {activeRole === 'livreur' && (
            <>
              <button
                onClick={() => {
                  setActiveNav('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeNav === 'home' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Truck className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Courses</span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('orders');
                  onNavigateView('orders');
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer text-slate-400 hover:text-slate-700`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Livraisons</span>
              </button>

              <button
                onClick={() => setIsProfileMenuOpen(true)}
                className={`flex flex-col items-center gap-0.5 cursor-pointer text-slate-400 hover:text-slate-700`}
              >
                <UserIcon className="w-5 h-5 stroke-[2.2]" />
                <span className="text-[10px] font-bold">Profil</span>
              </button>
            </>
          )}

        </div>
      </nav>

      {/* ACCESS DENIED SECURITY MODAL */}
      <AccessDeniedModal
        isOpen={!!deniedAttemptInfo?.isOpen}
        userRole={userRole}
        attemptedResource={deniedAttemptInfo?.resource || 'Ressource restreinte'}
        onClose={() => setDeniedAttemptInfo(null)}
        onRedirectToHome={() => {
          setDeniedAttemptInfo(null);
          onNavigateView('shop');
        }}
      />

      {/* AUDIT LOGS SECURITY MODAL */}
      <AuditLogsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* MODAL SCANNER QR */}
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
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-white/10 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pt-2">
                <QrCode className="w-8 h-8 text-[#16A34A] mx-auto animate-pulse" />
                <h3 className="text-base font-black uppercase">Scanner AfriNova</h3>
                <p className="text-xs text-slate-400">Pointez la caméra vers un produit ou un QR marchand</p>
              </div>

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
