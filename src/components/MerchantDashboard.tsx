import React, { useState, useEffect } from 'react';
import { Merchant, Product, MarketingCampaign, Order, User } from '../types';
import { 
  Store, Sparkles, Plus, Trash2, Edit3, BarChart3, Users, LineChart, 
  MapPin, Phone, ArrowUpRight, Check, ArrowRight, Loader2, Megaphone, 
  Settings, Percent, Star, Tag, Compass, X, ShieldAlert, PackageCheck,
  ShoppingBag, UserCheck, Lock, Clock, CheckCircle2, Truck, CreditCard,
  MessageSquare, AlertCircle, Bell, Eye, Heart, TrendingUp, ShieldCheck,
  Layers, FileText, DollarSign, Award, ChevronRight, HelpCircle, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VerifiedBadge from './VerifiedBadge';
import AddProductModal from './AddProductModal';
import { Language, translations } from '../translations';
import AboutAfriNovaSection from './AboutAfriNovaSection';

interface MerchantDashboardProps {
  currentUser?: User | null;
  products: Product[];
  merchants: Merchant[];
  orders?: Order[];
  onUpdateOrderStatus?: (orderId: string, status: 'pending' | 'preparing' | 'picked_up' | 'delivering' | 'completed') => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpgradeMerchant: (merchantId: string) => void;
  onRegisterMerchant?: (merchant: Merchant) => void;
  onSimulateMerchantExpiration?: (merchantId: string) => void;
  onBoostProduct?: (productId: string) => void;
  onSwitchToClientSpace?: () => void;
  lang: Language;
}

export default function MerchantDashboard({
  currentUser,
  products,
  merchants,
  orders = [],
  onUpdateOrderStatus,
  onAddProduct,
  onDeleteProduct,
  onUpgradeMerchant,
  onRegisterMerchant,
  onSimulateMerchantExpiration,
  onBoostProduct,
  onSwitchToClientSpace,
  lang,
}: MerchantDashboardProps) {
  const t = translations[lang];

  // Active Merchant ID State
  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(null);

  // Auto-detect merchant if currentUser owns a store
  useEffect(() => {
    if (currentUser) {
      const userMerchant = merchants.find(m => 
        m.id === currentUser.id || 
        (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (m.phone && currentUser.phone && m.phone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '')) ||
        (m.name && currentUser.name && m.name.toLowerCase() === currentUser.name.toLowerCase())
      );
      if (userMerchant) {
        setActiveMerchantId(userMerchant.id);
      }
    }
  }, [currentUser, merchants]);

  // Dashboard Tab state
  const [dashboardTab, setDashboardTab] = useState<
    'overview' | 'products' | 'orders' | 'stock' | 'deliveries' | 
    'payments' | 'promotions' | 'reviews' | 'messages' | 'stats' | 'profile'
  >('overview');

  // Modals / Gateways states
  const [showCreateShopModal, setShowCreateShopModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingLoginMerchant, setPendingLoginMerchant] = useState<Merchant | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Add Product & Upgrade Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // New Merchant Registration Form State
  const [regLegalName, setRegLegalName] = useState('');
  const [regCniPhoto, setRegCniPhoto] = useState<string | null>(null);
  const [regShopPhoto, setRegShopPhoto] = useState<string | null>(null);
  const [regRegistryNumber, setRegRegistryNumber] = useState('');
  const [regCniFileName, setRegCniFileName] = useState('');
  const [regShopFileName, setRegShopFileName] = useState('');

  // Upgrade / Renewal States
  const [upgradeOperator, setUpgradeOperator] = useState<'momo' | 'orange'>('momo');
  const [upgradePhone, setUpgradePhone] = useState('');
  const [upgradeStep, setUpgradeStep] = useState<'details' | 'processing' | 'ussd' | 'success'>('details');
  const [upgradePin, setUpgradePin] = useState('');
  const [upgradeError, setUpgradeError] = useState('');

  // Product Boosting States
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [productToBoost, setProductToBoost] = useState<Product | null>(null);
  const [boostOperator, setBoostOperator] = useState<'momo' | 'orange'>('momo');
  const [boostPhone, setBoostPhone] = useState('');
  const [boostStep, setBoostStep] = useState<'details' | 'processing' | 'success'>('details');
  const [boostError, setBoostError] = useState('');

  // Marketing Campaigns
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignType, setCampaignType] = useState<'promo' | 'boost'>('boost');
  const [campaignTarget, setCampaignTarget] = useState<string[]>(['Tamdja']);
  const [activeCampaigns, setActiveCampaigns] = useState<MarketingCampaign[]>([
    {
      id: 'c1',
      title: 'Opération Giga Boost - Café de l\'Ouest',
      type: 'boost',
      targetNeighborhoods: ['Tamdja', 'Bamendzi'],
      status: 'active',
      views: 345,
      conversions: 89,
      startDate: '2026-07-01',
      endDate: '2026-08-01'
    }
  ]);

  // Derived Active Merchant
  const activeMerchant = merchants.find(m => m.id === activeMerchantId);
  const isMerchantExpired = !!(
    activeMerchant && 
    activeMerchant.isPremium && 
    activeMerchant.premiumExpiryDate && 
    new Date(activeMerchant.premiumExpiryDate) < new Date()
  );

  // Merchant Specific Products & Orders
  const merchantProducts = products.filter(p => p.merchantId === activeMerchantId);
  const merchantOrders = orders.filter(o => 
    o.items.some(i => i.product.merchantId === activeMerchantId)
  );

  // Statistics Computations
  const totalStock = merchantProducts.reduce((acc, p) => acc + p.stock, 0);
  const pendingOrdersCount = merchantOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  
  // Today's Sales (Simulated or calculated from orders)
  const todaySalesCount = merchantOrders.length > 0 ? Math.min(merchantOrders.length, 3) : 2;
  const todaySalesTotal = merchantOrders.reduce((sum, o) => {
    const itemTotal = o.items
      .filter(i => i.product.merchantId === activeMerchantId)
      .reduce((s, i) => s + (i.product.price * i.quantity), 0);
    return sum + itemTotal;
  }, 42500);

  // Monthly Revenue
  const monthlySalesTotal = activeMerchant ? activeMerchant.sales : 245000;
  const storefrontViews = activeMerchant ? activeMerchant.views : 1240;
  const storefrontClicks = activeMerchant ? activeMerchant.clicks : 318;
  const averageRating = merchantProducts.length > 0 
    ? (merchantProducts.reduce((acc, p) => acc + (p.rating || 4.8), 0) / merchantProducts.length).toFixed(1) 
    : '4.8';

  // Low stock products (< 5)
  const lowStockProducts = merchantProducts.filter(p => p.stock < 5);

  // Top Performing Products (Sorted by sales or rating)
  const topProducts = [...merchantProducts].sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));

  // Handle Password Verification & Login
  const handleVerifyPasswordAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLoginMerchant) return;

    const correctPassword = pendingLoginMerchant.password || 'bafoussam';
    if (loginPassword === correctPassword) {
      setActiveMerchantId(pendingLoginMerchant.id);
      setUpgradePhone(pendingLoginMerchant.phone.replace(/[^0-9]/g, '').slice(-9));
      setPendingLoginMerchant(null);
      setLoginPassword('');
      setLoginError('');
      setShowLoginModal(false);
    } else {
      setLoginError('Mot de passe incorrect. Veuillez réessayer.');
    }
  };

  // Handle Creating New Merchant Store
  const handleCreateMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem('mName') as HTMLInputElement).value;
    const shopName = (form.elements.namedItem('mShopName') as HTMLInputElement).value;
    const location = (form.elements.namedItem('mLocation') as HTMLSelectElement).value;
    const phone = (form.elements.namedItem('mPhone') as HTMLInputElement).value;
    const password = (form.elements.namedItem('mPassword') as HTMLInputElement).value;

    const newM: Merchant = {
      id: `m-${Date.now()}`,
      name,
      shopName,
      location,
      phone,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@bafoussam.com`,
      password,
      isPremium: false,
      logo: shopName.slice(0, 2).toUpperCase(),
      views: 0,
      clicks: 0,
      sales: 0,
      isVerified: false,
      verificationStatus: 'pending_verification',
      legalName: regLegalName,
      cniPhoto: regCniPhoto || undefined,
      shopPhoto: regShopPhoto || undefined,
      registryNumber: regRegistryNumber || undefined,
    };

    if (onRegisterMerchant) {
      onRegisterMerchant(newM);
    } else {
      merchants.push(newM);
    }

    // Reset verification form
    setRegLegalName('');
    setRegCniPhoto(null);
    setRegShopPhoto(null);
    setRegRegistryNumber('');
    setRegCniFileName('');
    setRegShopFileName('');

    setActiveMerchantId(newM.id);
    setUpgradePhone(phone.replace(/[^0-9]/g, '').slice(-9));
    setShowCreateShopModal(false);
  };

  // Quick Action Handler
  const handleQuickAction = (tab: typeof dashboardTab) => {
    setDashboardTab(tab);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="merchant-portal-container">
      
      {/* ========================================================= */}
      {/* 1. STATE: NO ACTIVE MERCHANT / NOT LOGGED IN / NO STORE  */}
      {/* ========================================================= */}
      {!activeMerchantId ? (
        <div className="space-y-6">
          {/* Presentation Card / Pitch Header */}
          <div className="bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-slate-50/50 to-purple-50/30 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="bg-emerald-100 text-[#16A34A] border border-emerald-300/80 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-2xs">
                  <Store className="w-3.5 h-3.5" /> Espace Commerçant Pro AfriNova
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
                  Espace Vendeur AfriNova
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Gérez facilement votre boutique, suivez vos ventes en temps réel et recevez vos commandes à Bafoussam.
                </p>
              </div>

              {/* Top CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setShowCreateShopModal(true)}
                  className="bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#7C3AED] hover:from-[#15803D] hover:to-[#6D28D9] text-white font-black text-xs py-3.5 px-6 rounded-2xl shadow-[0_4px_20px_rgba(22,163,74,0.35)] transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  id="btn-create-shop-primary"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Créer ma boutique</span>
                </button>

                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white hover:bg-emerald-50/80 text-[#16A34A] border border-emerald-300 font-extrabold text-xs py-3.5 px-5 rounded-2xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  id="btn-login-shop-secondary"
                >
                  <Store className="w-4 h-4 text-[#16A34A]" />
                  <span>Se connecter à ma boutique</span>
                </button>

                {onSwitchToClientSpace && (
                  <button
                    onClick={onSwitchToClientSpace}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80"
                  >
                    <Compass className="w-4 h-4 text-purple-600" />
                    <span>Espace Client</span>
                  </button>
                )}
              </div>
            </div>

            {/* Concise Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 mt-8 border-t border-slate-200/80">
              <div className="flex items-center gap-3 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/70">
                <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#0F172A]">Paiement Mobile Money</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Encaissement direct MTN MoMo & Orange Money</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200/70">
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#0F172A]">Livraison Express Moto</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Flotte de coursiers dédiée dans tout Bafoussam</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/70">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#0F172A]">Badge Commerçant Certifié</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Confiance accrue auprès des acheteurs locaux</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presentation Section */}
          <AboutAfriNovaSection />
        </div>
      ) : (

        /* ========================================================= */
        /* 2. STATE: LOGGED IN MERCHANT DASHBOARD                     */
        /* ========================================================= */
        <div className="space-y-6">

          {/* --------------------------------------------------------- */}
          {/* HEADER: LOGO, NAME, VERIFICATION, SUBSCRIPTION, ACTIONS   */}
          {/* --------------------------------------------------------- */}
          <div className="bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
            
            {/* Top Row: Shop Info & Header Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200/80 pb-6">
              
              {/* Left: Logo & Details */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#16A34A] to-[#7C3AED] text-white rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border border-emerald-300/40 shrink-0">
                  {activeMerchant?.logo}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                      {activeMerchant?.shopName}
                    </h1>

                    {/* Statut de Vérification Badge */}
                    {activeMerchant?.isVerified ? (
                      <span className="bg-emerald-100 text-[#16A34A] border border-emerald-300/80 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-3xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Boutique Certifiée
                      </span>
                    ) : activeMerchant?.verificationStatus === 'pending_verification' ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300/80 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-3xs">
                        <Clock className="w-3.5 h-3.5 animate-pulse" /> En attente de validation
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                        Non vérifiée
                      </span>
                    )}

                    {/* Statut d'Abonnement Badge */}
                    {activeMerchant?.isPremium ? (
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 fill-slate-950" /> VIP PREMIUM
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                        Formule Standard
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <strong>Gérant :</strong> {activeMerchant?.name}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {activeMerchant?.location}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                      {activeMerchant?.phone}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right: Quick Action Buttons in Header */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#7C3AED] hover:from-[#15803D] hover:to-[#6D28D9] text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  id="btn-header-add-product"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Ajouter un produit</span>
                </button>

                {!activeMerchant?.isPremium && (
                  <button
                    onClick={() => {
                      setUpgradeStep('details');
                      setShowUpgradeModal(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Passer au VIP (100k F/an)</span>
                  </button>
                )}

                {onSwitchToClientSpace && (
                  <button
                    onClick={onSwitchToClientSpace}
                    className="bg-white hover:bg-emerald-50 text-[#16A34A] font-bold text-xs py-2.5 px-3.5 rounded-xl border border-emerald-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Vitrine Client</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveMerchantId(null)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
                  title="Déconnexion boutique"
                >
                  <X className="w-3.5 h-3.5 text-rose-600" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* REAL-TIME STATISTICAL CARDS (7 METRICS)                  */}
            {/* --------------------------------------------------------- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              
              {/* Stat 1: Nombre de Produits */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-indigo-600" /> Produits
                </span>
                <span className="text-lg sm:text-xl font-black text-[#0F172A] block">
                  {merchantProducts.length}
                </span>
                <span className="text-[9px] text-slate-500 block">{totalStock} en stock</span>
              </div>

              {/* Stat 2: Commandes en attente */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <PackageCheck className="w-3 h-3 text-amber-600" /> En Attente
                </span>
                <span className="text-lg sm:text-xl font-black text-amber-600 block">
                  {pendingOrdersCount}
                </span>
                <span className="text-[9px] text-slate-500 block">À préparer</span>
              </div>

              {/* Stat 3: Ventes du Jour */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#16A34A]" /> Ventes Jour
                </span>
                <span className="text-lg sm:text-xl font-black text-[#16A34A] block">
                  {todaySalesCount} <span className="text-[10px] font-semibold text-slate-500">ventes</span>
                </span>
                <span className="text-[9px] text-[#16A34A] font-bold block">{todaySalesTotal.toLocaleString('fr-FR')} F</span>
              </div>

              {/* Stat 4: Chiffre d'affaires du Mois */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-indigo-600" /> CA du Mois
                </span>
                <span className="text-lg sm:text-xl font-black text-[#0F172A] block truncate">
                  {monthlySalesTotal.toLocaleString('fr-FR')}
                </span>
                <span className="text-[9px] text-slate-500 block">FCFA mensuel</span>
              </div>

              {/* Stat 5: Visiteurs / Vues */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <Users className="w-3 h-3 text-purple-600" /> Visiteurs
                </span>
                <span className="text-lg sm:text-xl font-black text-[#0F172A] block">
                  {storefrontViews.toLocaleString('fr-FR')}
                </span>
                <span className="text-[9px] text-slate-500 block">Vues vitrine</span>
              </div>

              {/* Stat 6: Favoris & Clics */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500" /> Favoris
                </span>
                <span className="text-lg sm:text-xl font-black text-[#0F172A] block">
                  {storefrontClicks}
                </span>
                <span className="text-[9px] text-slate-400 block">Clics d'intérêt</span>
              </div>

              {/* Stat 7: Note Moyenne */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-3xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Note Client
                </span>
                <span className="text-lg sm:text-xl font-black text-[#0F172A] block">
                  {averageRating} <span className="text-[10px] font-semibold text-slate-500">/ 5.0</span>
                </span>
                <span className="text-[9px] text-slate-500 block">Avis certifiés</span>
              </div>

            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* QUICK ACTION MENU GRID (11 ACTIONS)                      */}
          {/* --------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Menu d'Actions Rapides</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
              
              <button
                onClick={() => setShowAddProductModal(true)}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer group"
              >
                <Plus className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
                <span className="text-[10px] font-black leading-tight">Ajouter Produit</span>
              </button>

              <button
                onClick={() => handleQuickAction('products')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer group ${
                  dashboardTab === 'products' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-[10px] font-bold leading-tight">Gérer Produits</span>
              </button>

              <button
                onClick={() => handleQuickAction('orders')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer relative group ${
                  dashboardTab === 'orders' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <PackageCheck className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-[10px] font-bold leading-tight">Commandes</span>
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleQuickAction('stock')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer group ${
                  dashboardTab === 'stock' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <BarChart3 className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-[10px] font-bold leading-tight">Stock</span>
              </button>

              <button
                onClick={() => handleQuickAction('deliveries')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer group ${
                  dashboardTab === 'deliveries' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <Truck className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-[10px] font-bold leading-tight">Livraisons</span>
              </button>

              <button
                onClick={() => handleQuickAction('payments')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer group ${
                  dashboardTab === 'payments' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <CreditCard className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-[10px] font-bold leading-tight">Paiements</span>
              </button>

              <button
                onClick={() => handleQuickAction('promotions')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer group ${
                  dashboardTab === 'promotions' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <Tag className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-[10px] font-bold leading-tight">Promotions</span>
              </button>

              <button
                onClick={() => handleQuickAction('reviews')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer group ${
                  dashboardTab === 'reviews' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <Star className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-[10px] font-bold leading-tight">Avis Clients</span>
              </button>

              <button
                onClick={() => handleQuickAction('messages')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer group ${
                  dashboardTab === 'messages' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <MessageSquare className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-[10px] font-bold leading-tight">Messages</span>
              </button>

              <button
                onClick={() => handleQuickAction('stats')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer group ${
                  dashboardTab === 'stats' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <LineChart className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-[10px] font-bold leading-tight">Statistiques</span>
              </button>

              <button
                onClick={() => handleQuickAction('profile')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer group ${
                  dashboardTab === 'profile' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                }`}
              >
                <Settings className="w-5 h-5 group-hover:scale-110 transition" />
                <span className="text-[10px] font-bold leading-tight">Paramètres</span>
              </button>

            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* TAB CONTENT: OVERVIEW (Vue Générale), PRODUCTS, ETC.     */}
          {/* --------------------------------------------------------- */}

          {/* OVERVIEW TAB */}
          {dashboardTab === 'overview' && (
            <div className="space-y-6">

              {/* 1. NOTIFICATIONS IMPORTANTES (ALERT CENTER) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    <span>Notifications & Alertes Importantes</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">Temps réel</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  
                  {/* Alert Pending Verification */}
                  {activeMerchant?.verificationStatus === 'pending_verification' && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                      <div className="text-xs">
                        <h4 className="font-bold text-amber-900">Vérification CNI en cours</h4>
                        <p className="text-amber-700/80 text-[11px] mt-1 leading-snug">
                          Votre dossier est en cours de validation administrative.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Alert Low Stock */}
                  {lowStockProducts.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <h4 className="font-bold text-rose-900">Alerte Stock Faible ({lowStockProducts.length})</h4>
                        <p className="text-rose-700/80 text-[11px] mt-1 leading-snug">
                          Des produits ont moins de 5 unités en réserve.
                        </p>
                        <button
                          onClick={() => setDashboardTab('stock')}
                          className="mt-2 text-[10px] font-black text-rose-700 hover:underline cursor-pointer uppercase tracking-wider"
                        >
                          Réapprovisionner →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Alert Pending Orders */}
                  {pendingOrdersCount > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-start gap-3">
                      <PackageCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <h4 className="font-bold text-indigo-900">{pendingOrdersCount} Commandes à traiter</h4>
                        <p className="text-indigo-700/80 text-[11px] mt-1 leading-snug">
                          Des acheteurs attendent la confirmation de leur commande.
                        </p>
                        <button
                          onClick={() => setDashboardTab('orders')}
                          className="mt-2 text-[10px] font-black text-indigo-700 hover:underline cursor-pointer uppercase tracking-wider"
                        >
                          Voir les commandes →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Alert Premium Upgrade Recommendation */}
                  {!activeMerchant?.isPremium && (
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <h4 className="font-bold text-purple-900">Débloquez le Badge VIP</h4>
                        <p className="text-purple-700/80 text-[11px] mt-1 leading-snug">
                          Positionnez vos articles en tête du catalogue Bafoussam.
                        </p>
                        <button
                          onClick={() => {
                            setUpgradeStep('details');
                            setShowUpgradeModal(true);
                          }}
                          className="mt-2 text-[10px] font-black text-purple-700 hover:underline cursor-pointer uppercase tracking-wider"
                        >
                          S'abonner pour 100k F/an →
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* 2. DERNIÈRES COMMANDES */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-emerald-600" />
                    <span>Dernières Commandes Clients</span>
                  </h3>
                  <button
                    onClick={() => setDashboardTab('orders')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Voir toutes ({merchantOrders.length})
                  </button>
                </div>

                {merchantOrders.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="font-semibold text-slate-700 text-xs">Aucune commande reçue pour le moment.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Les nouvelles commandes apparaîtront ici automatiquement.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {merchantOrders.slice(0, 3).map((ord) => {
                      const merchantItems = ord.items.filter(i => i.product.merchantId === activeMerchantId);
                      const merchantSubtotal = merchantItems.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

                      return (
                        <div key={ord.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-xs">Commande #{ord.id}</span>
                                <span className={`px-2 py-0.5 text-[9px] font-black rounded-full ${
                                  ord.status === 'completed' 
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {ord.status === 'pending' && 'En attente'}
                                  {ord.status === 'preparing' && 'En préparation'}
                                  {ord.status === 'delivering' && 'En cours de livraison'}
                                  {ord.status === 'completed' && 'Livrée'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Client : <strong>{ord.userName}</strong> ({ord.deliveryNeighborhood}) • Tél: {ord.paymentPhone}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-black text-slate-900 block">{merchantSubtotal.toLocaleString('fr-FR')} FCFA</span>
                              <span className="text-[9px] text-slate-400 block">Mobile Money</span>
                            </div>
                          </div>

                          {/* Items summary */}
                          <div className="space-y-1 text-xs">
                            {merchantItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-[11px]">
                                <span className="font-semibold text-slate-700">{item.quantity}x {item.product.name}</span>
                                <span className="font-mono text-slate-500">{(item.product.price * item.quantity).toLocaleString('fr-FR')} F</span>
                              </div>
                            ))}
                          </div>

                          {/* Action controls */}
                          {onUpdateOrderStatus && ord.status !== 'completed' && (
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                              {ord.status === 'pending' && (
                                <button
                                  onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg cursor-pointer transition"
                                >
                                  Confirmer & Préparer
                                </button>
                              )}
                              {ord.status === 'preparing' && (
                                <button
                                  onClick={() => onUpdateOrderStatus(ord.id, 'delivering')}
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] py-1.5 px-3 rounded-lg cursor-pointer transition"
                                >
                                  Remettre au Coursier
                                </button>
                              )}
                              {ord.status === 'delivering' && (
                                <button
                                  onClick={() => onUpdateOrderStatus(ord.id, 'completed')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg cursor-pointer transition"
                                >
                                  Marquer comme Livrée
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. PRODUITS LES PLUS PERFORMANTS */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <span>Produits les plus Performants</span>
                  </h3>
                  <button
                    onClick={() => setDashboardTab('products')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Gérer le catalogue
                  </button>
                </div>

                {topProducts.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="font-semibold text-slate-700 text-xs">Aucun produit en ligne.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topProducts.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs truncate">{p.name}</h4>
                          <p className="text-[10px] text-slate-400">{p.category}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px]">
                            <span className="font-black text-slate-900">{p.price.toLocaleString('fr-FR')} F</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 font-medium">Stock: {p.stock}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {p.rating || 4.8}
                          </span>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="mt-2 text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer block ml-auto"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* PRODUCTS TAB */}
          {dashboardTab === 'products' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Gestion de votre Catalogue</h3>
                  <p className="text-xs text-slate-500">Gérez vos articles en vente à Bafoussam</p>
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Ajouter un produit</span>
                </button>
              </div>

              {merchantProducts.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                  <span className="text-4xl">📦</span>
                  <p className="font-semibold text-slate-800 mt-2 text-sm">Aucun produit dans votre catalogue</p>
                  <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1">
                    Ajoutez vos articles pour qu'ils soient directement commandables en ligne.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {merchantProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-slate-900 text-xs truncate">{p.name}</h4>
                          {p.isBoosted && (
                            <span className="bg-amber-100 text-amber-900 font-black text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5 fill-amber-800" /> BOOST
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">{p.category}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs">
                          <span className="font-black text-slate-950">{p.price.toLocaleString('fr-FR')} FCFA</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-slate-500">Stock: {p.stock}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-rose-50 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {dashboardTab === 'orders' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Suivi des Commandes</h3>
                <p className="text-xs text-slate-500">Gérez l'état d'avancement des commandes attribuées à votre boutique</p>
              </div>

              {merchantOrders.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                  <span className="text-4xl">📋</span>
                  <p className="font-semibold text-slate-800 mt-2 text-sm">Aucune commande pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {merchantOrders.map((ord) => {
                    const merchantItems = ord.items.filter(i => i.product.merchantId === activeMerchantId);
                    const merchantSubtotal = merchantItems.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

                    return (
                      <div key={ord.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm">Commande #{ord.id}</span>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Client: {ord.userName} • Quartier: {ord.deliveryNeighborhood} • Tél: {ord.paymentPhone}
                            </p>
                          </div>
                          <span className="text-sm font-black text-slate-900">{merchantSubtotal.toLocaleString('fr-FR')} FCFA</span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          {merchantItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.quantity}x {item.product.name}</span>
                              <span className="font-mono text-slate-600">{(item.product.price * item.quantity).toLocaleString('fr-FR')} F</span>
                            </div>
                          ))}
                        </div>

                        {onUpdateOrderStatus && ord.status !== 'completed' && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                            {ord.status === 'pending' && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                                className="bg-indigo-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg cursor-pointer"
                              >
                                Passer en Préparation
                              </button>
                            )}
                            {ord.status === 'preparing' && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, 'delivering')}
                                className="bg-amber-500 text-slate-950 font-black text-xs py-1.5 px-3 rounded-lg cursor-pointer"
                              >
                                Remettre au Coursier
                              </button>
                            )}
                            {ord.status === 'delivering' && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, 'completed')}
                                className="bg-emerald-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg cursor-pointer"
                              >
                                Confirmer la Livraison
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STOCK TAB */}
          {dashboardTab === 'stock' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Gestion du Stock</h3>
                <p className="text-xs text-slate-500">Mettez à jour le niveau des stocks de vos produits</p>
              </div>

              <div className="space-y-3">
                {merchantProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                        <p className="text-[11px] text-slate-400">{p.price.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.stock < 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {p.stock} unités
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DELIVERIES TAB */}
          {dashboardTab === 'deliveries' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Suivi des Livraisons Moto-Taxi</h3>
              <p className="text-xs text-slate-500">Les coursier affiliés AfriNova prennent en charge l'expédition de vos colis à Bafoussam.</p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                📍 Zone Couverte : Tamdja, Bamendzi, Marché A, Marché Congo, Carrefour Bamiléké, Banengo, Kamkop.
              </div>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {dashboardTab === 'payments' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Paiements & Reversements</h3>
              <p className="text-xs text-slate-500">Les recettes de vos ventes sont versées directement sur votre compte Mobile Money.</p>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 font-semibold">
                Compte Mobile Money connecté : <strong>{activeMerchant?.phone}</strong>
              </div>
            </div>
          )}

          {/* PROMOTIONS TAB */}
          {dashboardTab === 'promotions' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Offres & Promotions</h3>
              <p className="text-xs text-slate-500">Appliquez des remises temporaires pour stimuler vos ventes.</p>
            </div>
          )}

          {/* REVIEWS TAB */}
          {dashboardTab === 'reviews' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Avis Clients Certifiés</h3>
              <p className="text-xs text-slate-500">Retours d'expérience déposés par vos acheteurs à Bafoussam.</p>
            </div>
          )}

          {/* MESSAGES TAB */}
          {dashboardTab === 'messages' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Messagerie Clients</h3>
              <p className="text-xs text-slate-500">Communiquez en direct avec vos clients pour répondre à leurs questions.</p>
            </div>
          )}

          {/* STATS TAB */}
          {dashboardTab === 'stats' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Statistiques Détaillées</h3>
              <p className="text-xs text-slate-500">Analyse du trafic de votre vitrine et de la répartition de vos ventes.</p>
            </div>
          )}

          {/* PROFILE TAB */}
          {dashboardTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-extrabold text-slate-900 text-lg">Paramètres de la Boutique</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Nom du Commerce</span>
                  <strong className="text-slate-900 text-sm font-bold">{activeMerchant?.shopName}</strong>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Gérant</span>
                  <strong className="text-slate-800">{activeMerchant?.name}</strong>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Emplacement</span>
                  <strong className="text-slate-800">{activeMerchant?.location}</strong>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Téléphone Mobile Money</span>
                  <strong className="text-slate-800 font-mono">{activeMerchant?.phone}</strong>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MODAL: CREATION DE BOUTIQUE                            */}
      {/* ========================================================= */}
      {showCreateShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto my-8">
            
            <button
              onClick={() => setShowCreateShopModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1.5 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Inscription Vendeur Pro
              </span>
              <h3 className="font-extrabold text-slate-900 text-xl">Créer votre Boutique AfriNova</h3>
              <p className="text-xs text-slate-500">Complétez le formulaire ci-dessous pour ouvrir votre espace de vente.</p>
            </div>

            <form onSubmit={handleCreateMerchant} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nom du Gérant *</label>
                <input
                  name="mName"
                  type="text"
                  required
                  placeholder="Ex: Paul Tagne"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nom du Commerce *</label>
                  <input
                    name="mShopName"
                    type="text"
                    required
                    placeholder="Ex: Épicerie Tagne & Fils"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Emplacement Bafoussam *</label>
                  <select
                    name="mLocation"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                  >
                    <option value="Marché A">Marché A (Centre)</option>
                    <option value="Marché B">Marché B</option>
                    <option value="Marché Congo">Marché Congo</option>
                    <option value="Carrefour Bamiléké">Carrefour Bamiléké</option>
                    <option value="Tamdja">Tamdja</option>
                    <option value="Bamendzi">Bamendzi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Numéro Téléphone Mobile Money *</label>
                <input
                  name="mPhone"
                  type="tel"
                  required
                  placeholder="Ex: 677000000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              {/* ID & Business Verification Fields */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block border-b border-slate-200 pb-1">
                  🛡️ Pièces de Vérification Requises
                </span>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nom Légal (selon CNI) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Paul Tagne"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-950"
                    value={regLegalName}
                    onChange={(e) => setRegLegalName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Photo CNI *</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-2 bg-white text-center cursor-pointer min-h-[75px] flex items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setRegCniFileName(file.name);
                            const reader = new FileReader();
                            reader.onload = (event) => setRegCniPhoto(event.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {regCniPhoto ? (
                        <span className="text-[9px] text-emerald-600 font-bold">✓ CNI Chargée</span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold uppercase">📷 Téléverser CNI</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Photo Boutique *</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-2 bg-white text-center cursor-pointer min-h-[75px] flex items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setRegShopFileName(file.name);
                            const reader = new FileReader();
                            reader.onload = (event) => setRegShopPhoto(event.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {regShopPhoto ? (
                        <span className="text-[9px] text-emerald-600 font-bold">✓ Photo Chargée</span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold uppercase">🏪 Photo Enseigne</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mot de passe de sécurité *</label>
                <input
                  name="mPassword"
                  type="password"
                  required
                  placeholder="Définissez un mot de passe d'accès"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateShopModal(false)}
                  className="flex-1 border border-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl cursor-pointer hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!(regLegalName && regCniPhoto && regShopPhoto)}
                  className={`flex-1 text-xs font-black py-3 rounded-xl transition cursor-pointer shadow-md ${
                    (regLegalName && regCniPhoto && regShopPhoto)
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Créer ma boutique
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL: SE CONNECTER À UNE BOUTIQUE                      */}
      {/* ========================================================= */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setPendingLoginMerchant(null);
                setLoginPassword('');
                setLoginError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            {!pendingLoginMerchant ? (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-lg">Connexion Boutique</h3>
                  <p className="text-xs text-slate-500">Sélectionnez votre boutique pour accéder au tableau de bord.</p>
                </div>

                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                  {merchants.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPendingLoginMerchant(m)}
                      className="w-full text-left p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/20 flex items-center justify-between transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-sm">
                          {m.logo}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-950 text-xs">{m.shopName}</p>
                          <p className="text-[10px] text-slate-400">{m.location} • {m.name}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyPasswordAndLogin} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-base">
                    {pendingLoginMerchant.logo}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">{pendingLoginMerchant.shopName}</p>
                    <p className="text-xs text-slate-400">{pendingLoginMerchant.name} • {pendingLoginMerchant.location}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mot de passe de sécurité</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Entrez le mot de passe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    autoFocus
                  />
                </div>

                {loginError && (
                  <div className="text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-xs font-bold">
                    ⚠️ {loginError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingLoginMerchant(null);
                      setLoginPassword('');
                      setLoginError('');
                    }}
                    className="flex-1 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 text-center"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer text-center shadow-sm"
                  >
                    Valider & Ouvrir
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: AJOUT DE PRODUIT (ADD PRODUCT MODAL)            */}
      {/* ========================================================= */}
      {showAddProductModal && activeMerchant && (
        <AddProductModal
          merchant={activeMerchant}
          onClose={() => setShowAddProductModal(false)}
          onPublishProduct={(newProd) => {
            onAddProduct(newProd);
            setShowAddProductModal(false);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: UPGRADE MEMBRE VIP PREMIUM                      */}
      {/* ========================================================= */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                  Abonnement VIP Premium
                </span>
                <h3 className="font-extrabold text-slate-900 text-xl">Devenir Commerçant VIP</h3>
                <p className="text-xs text-slate-500">100 000 FCFA / an par Mobile Money</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-700">
                <p className="font-extrabold text-slate-900">Avantages exclusifs Membre VIP :</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Positionnement prioritaire de vos articles dans le catalogue</li>
                  <li>Badge "VIP Premium" de confiance</li>
                  <li>Outils d'analyses géographiques par quartier à Bafoussam</li>
                  <li>Campagnes promotionnelles SMS & Bannières dédiées</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  if (activeMerchant) {
                    onUpgradeMerchant(activeMerchant.id);
                  }
                  setShowUpgradeModal(false);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3.5 rounded-2xl transition shadow-md cursor-pointer"
              >
                Confirmer le Paiement Mobile Money (100 000 FCFA)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
