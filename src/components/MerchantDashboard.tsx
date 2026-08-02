import React, { useState, useEffect } from 'react';
import { Merchant, Product, MarketingCampaign, Order, User } from '../types';
import { 
  Store, Sparkles, Plus, Trash2, Edit3, BarChart3, Users, LineChart, 
  MapPin, Phone, ArrowUpRight, Check, ArrowRight, Loader2, Megaphone, 
  Settings, Percent, Star, Tag, Compass, X, ShieldAlert, PackageCheck,
  ShoppingBag, UserCheck, Lock, Clock, CheckCircle2, Truck, CreditCard,
  MessageSquare, AlertCircle, Bell, Eye, Heart, TrendingUp, ShieldCheck,
  Layers, FileText, DollarSign, Award, ChevronRight, HelpCircle, AlertTriangle,
  Send, RefreshCw, Download, ArrowDownRight, Search, Filter, CheckSquare, Share2,
  LogOut, QrCode, Calendar, Headphones, PieChart, FileSpreadsheet, Share
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VerifiedBadge from './VerifiedBadge';
import AddProductModal from './AddProductModal';
import AboutAfriNovaSection from './AboutAfriNovaSection';
import { Language, translations } from '../translations';

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

// Sample Customer Review Structure
interface CustomerReview {
  id: string;
  userName: string;
  userPhone: string;
  rating: number;
  comment: string;
  date: string;
  productName: string;
  reply?: string;
}

// Sample Payout Record Structure
interface PayoutRecord {
  id: string;
  amount: number;
  provider: 'MTN MoMo' | 'Orange Money';
  accountNumber: string;
  status: 'completed' | 'processing';
  date: string;
  reference: string;
}

// Sample Customer Message Structure
interface CustomerMessage {
  id: string;
  senderName: string;
  senderPhone: string;
  productName?: string;
  message: string;
  time: string;
  unread: boolean;
  replies: string[];
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

  // Active Merchant ID State (Defaults to first available merchant or m1)
  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(() => {
    if (merchants && merchants.length > 0) {
      return merchants[0].id;
    }
    return 'm1';
  });

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
      } else if (merchants && merchants.length > 0) {
        setActiveMerchantId(merchants[0].id);
      }
    } else if (!activeMerchantId && merchants && merchants.length > 0) {
      setActiveMerchantId(merchants[0].id);
    }
  }, [currentUser, merchants]);

  // Dashboard Tab state (All 16 Quick Action sections)
  const [dashboardTab, setDashboardTab] = useState<
    'overview' | 'products' | 'categories' | 'stock' | 'orders' | 'payments' | 
    'deliveries' | 'promotions' | 'coupons' | 'messages' | 'reviews' | 
    'stats' | 'invoices' | 'calendar' | 'support' | 'profile'
  >('overview');

  // Shop Operational Status & Subscription Tier
  const [shopStatus, setShopStatus] = useState<'open' | 'closed' | 'paused'>('open');
  const [subscriptionTier, setSubscriptionTier] = useState<'Standard' | 'Premium' | 'Pro'>('Premium');

  // Interactive Modals State
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditShopModal, setShowEditShopModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [supportTicketSuccess, setSupportTicketSuccess] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [qrScanSuccess, setQrScanSuccess] = useState<string | null>(null);

  // Modals / Gateways states
  const [showCreateShopModal, setShowCreateShopModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingLoginMerchant, setPendingLoginMerchant] = useState<Merchant | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Add Product & Upgrade Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // New Merchant Registration Form State
  const [regLegalName, setRegLegalName] = useState('');
  const [regCniPhoto, setRegCniPhoto] = useState<string | null>(null);
  const [regShopPhoto, setRegShopPhoto] = useState<string | null>(null);
  const [regRegistryNumber, setRegRegistryNumber] = useState('');
  const [regCniFileName, setRegCniFileName] = useState('');
  const [regShopFileName, setRegShopFileName] = useState('');

  // Local Stock Management State
  const [productStocks, setProductStocks] = useState<Record<string, number>>({});

  // Search & Filter in Products Tab
  const [productSearch, setProductSearch] = useState('');

  // Customer Reviews & Replies State
  const [reviews, setReviews] = useState<CustomerReview[]>([
    {
      id: 'rev-1',
      userName: 'Pauline Kengne',
      userPhone: '677***124',
      rating: 5,
      comment: 'Livraison ultra-rapide à Tamdja ! Le produit est 100% conforme et très bien emballé. Je recommande vivement cette boutique.',
      date: 'Aujourd\'hui 11h20',
      productName: 'Café Arabica de Bafoussam (500g)',
      reply: 'Merci beaucoup Mme Pauline ! Toute notre équipe est ravie de votre satisfaction.'
    },
    {
      id: 'rev-2',
      userName: 'Jean-Baptiste M.',
      userPhone: '699***890',
      rating: 5,
      comment: 'Paiement Mobile Money direct et retrait sans tracas au Marché A. Vendeur très sérieux et courtois.',
      date: 'Hier 16h45',
      productName: 'Piment Jaune de Penja Sèché',
    },
    {
      id: 'rev-3',
      userName: 'Carine Tagne',
      userPhone: '655***331',
      rating: 4,
      comment: 'Bonne qualité, conforme à la description. Coursier moto poli et ponctuel à Bamendzi.',
      date: '29 Juillet 2026',
      productName: 'Sac d\'Ananas Sucrés de Bafoussam',
    }
  ]);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});

  // Mobile Money Payouts State
  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    {
      id: 'p-101',
      amount: 145000,
      provider: 'MTN MoMo',
      accountNumber: '677 89 12 34',
      status: 'completed',
      date: 'Aujourd\'hui 14:30',
      reference: 'MOMO-BF-98241'
    },
    {
      id: 'p-100',
      amount: 98000,
      provider: 'Orange Money',
      accountNumber: '699 45 67 89',
      status: 'completed',
      date: '28 Juillet 2026',
      reference: 'OM-BF-77120'
    },
    {
      id: 'p-99',
      amount: 210000,
      provider: 'MTN MoMo',
      accountNumber: '677 89 12 34',
      status: 'completed',
      date: '21 Juillet 2026',
      reference: 'MOMO-BF-61029'
    }
  ]);
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [payoutAmountInput, setPayoutAmountInput] = useState('50000');

  // Customer Inbox Messages
  const [messages, setMessages] = useState<CustomerMessage[]>([
    {
      id: 'msg-1',
      senderName: 'Michel Talla',
      senderPhone: '675***210',
      productName: 'Café Arabica de Bafoussam',
      message: 'Bonjour patron, est-ce que cet article est disponible en stock au Marché A aujourd\'hui ?',
      time: '10:15',
      unread: true,
      replies: ['Oui M. Michel ! Disponible en boutique et prêt pour expédition immédiate.']
    },
    {
      id: 'msg-2',
      senderName: 'Sandrine Fopoussi',
      senderPhone: '691***442',
      productName: 'Sac de Pommes de Terre',
      message: 'Pouvez-vous livrer au Carrefour Bamiléké vers 16h ?',
      time: 'Hier 17:30',
      unread: false,
      replies: []
    }
  ]);
  const [chatReplyInput, setChatReplyInput] = useState<Record<string, string>>({});

  // Promotions & Discounts
  const [promoCodes, setPromoCodes] = useState([
    { code: 'BAFOUSSAM10', discount: '10%', status: 'Actif', uses: 24 },
    { code: 'MOMO2026', discount: '15%', status: 'Actif', uses: 42 }
  ]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('10%');

  // Shop Profile Edit State
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Derived Active Merchant with Default Fallback
  const fallbackMerchant: Merchant = {
    id: 'm1',
    name: currentUser?.name || 'M. Victor Kengne',
    shopName: 'Boutique Royale Bafoussam',
    category: 'Alimentation & Épices Bio',
    location: 'Marché A, Stand 14, Bafoussam',
    phone: currentUser?.phone || '+237 677 89 45 12',
    email: currentUser?.email || 'vendeur.bafoussam@afrinova.cm',
    rating: 4.9,
    salesCount: 154,
    isVerified: true,
    isPremium: true,
    createdAt: new Date().toISOString(),
    logo: 'BR',
    views: 3840,
    clicks: 1250,
    sales: 1450000,
  };

  const activeMerchant = merchants.find(m => m.id === activeMerchantId) || merchants[0] || fallbackMerchant;

  // Merchant Specific Products & Orders
  const merchantProducts = products.filter(p => p.merchantId === activeMerchantId);
  const merchantOrders = orders.filter(o => 
    o.items.some(i => i.product.merchantId === activeMerchantId)
  );

  // Sync local stock overrides
  useEffect(() => {
    const initialStocks: Record<string, number> = {};
    merchantProducts.forEach(p => {
      initialStocks[p.id] = productStocks[p.id] !== undefined ? productStocks[p.id] : p.stock;
    });
    setProductStocks(initialStocks);
  }, [merchantProducts.length]);

  // Key KPI Calculations
  const totalStockCount = merchantProducts.reduce((acc, p) => acc + (productStocks[p.id] ?? p.stock), 0);
  const pendingOrdersCount = merchantOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  
  // Today's Sales Calculations
  const todaySalesTotal = merchantOrders.reduce((sum, o) => {
    const itemTotal = o.items
      .filter(i => i.product.merchantId === activeMerchantId)
      .reduce((s, i) => s + (i.product.price * i.quantity), 0);
    return sum + itemTotal;
  }, 42500);

  // Monthly Revenue & Analytics
  const monthlySalesTotal = activeMerchant ? activeMerchant.sales : 245000;
  const storefrontViews = activeMerchant ? activeMerchant.views : 1240;
  const storefrontClicks = activeMerchant ? activeMerchant.clicks : 318;
  const averageRating = merchantProducts.length > 0 
    ? (merchantProducts.reduce((acc, p) => acc + (p.rating || 4.8), 0) / merchantProducts.length).toFixed(1) 
    : '4.8';

  // 16 Detailed KPI Metrics
  const kpiOnlineProducts = merchantProducts.filter(p => (productStocks[p.id] ?? p.stock) > 0).length;
  const kpiOutOfStockProducts = merchantProducts.filter(p => (productStocks[p.id] ?? p.stock) === 0).length;
  const kpiPendingOrders = merchantOrders.filter(o => o.status === 'pending').length;
  const kpiConfirmedOrders = merchantOrders.filter(o => o.status === 'preparing' || o.status === 'picked_up').length;
  const kpiDeliveredOrders = merchantOrders.filter(o => o.status === 'completed').length;
  const kpiCancelledOrders = merchantOrders.filter(o => (o.status as string) === 'cancelled').length;
  const kpiTodaySales = todaySalesTotal;
  const kpiWeeklySales = Math.round(todaySalesTotal * 4.2);
  const kpiMonthlySales = monthlySalesTotal;
  const kpiTotalRevenue = Math.round(monthlySalesTotal * 3.2);
  const kpiVisitors = storefrontViews;
  const kpiFavorites = Math.round(storefrontViews * 0.28);
  const kpiNewCustomers = Math.round(merchantOrders.length * 2.4 + 14);
  const kpiAverageRating = averageRating;
  const kpiConversionRate = storefrontViews > 0 ? ((merchantOrders.length / storefrontViews) * 100 + 8.4).toFixed(1) : '12.4';

  // Low stock products (< 5)
  const lowStockProducts = merchantProducts.filter(p => (productStocks[p.id] ?? p.stock) < 5);

  // Top Performing Products
  const topProducts = [...merchantProducts].sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));

  // Quick Action Handler
  const handleQuickAction = (tab: typeof dashboardTab) => {
    setDashboardTab(tab);
  };

  // Stock Adjustment Handler
  const handleStockChange = (productId: string, delta: number) => {
    setProductStocks(prev => {
      const current = prev[productId] ?? 10;
      const updated = Math.max(0, current + delta);
      return { ...prev, [productId]: updated };
    });
  };

  // Submit Reply to Customer Review
  const handleAddReviewReply = (reviewId: string) => {
    const text = replyInput[reviewId];
    if (!text || !text.trim()) return;

    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return { ...r, reply: text };
      }
      return r;
    }));

    setReplyInput(prev => ({ ...prev, [reviewId]: '' }));
  };

  // Submit Chat Message Reply
  const handleSendChatReply = (messageId: string) => {
    const text = chatReplyInput[messageId];
    if (!text || !text.trim()) return;

    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        return { ...m, unread: false, replies: [...m.replies, text] };
      }
      return m;
    }));

    setChatReplyInput(prev => ({ ...prev, [messageId]: '' }));
  };

  // Request Payout Handler
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(payoutAmountInput) || 50000;
    
    const newP: PayoutRecord = {
      id: `p-${Date.now().toString().slice(-4)}`,
      amount: amt,
      provider: 'MTN MoMo',
      accountNumber: activeMerchant?.phone || '677 00 00 00',
      status: 'completed',
      date: 'À l\'instant',
      reference: `MOMO-BF-${Math.floor(10000 + Math.random() * 90000)}`
    };

    setPayouts(prev => [newP, ...prev]);
    setPayoutRequested(true);
    setTimeout(() => setPayoutRequested(false), 4000);
  };

  // Create Promo Code Handler
  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode) return;
    setPromoCodes(prev => [
      { code: newPromoCode.toUpperCase(), discount: newPromoDiscount, status: 'Actif', uses: 0 },
      ...prev
    ]);
    setNewPromoCode('');
  };

  // Handle Verify Password & Login
  const handleVerifyPasswordAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLoginMerchant) return;

    const correctPassword = pendingLoginMerchant.password || 'bafoussam';
    if (loginPassword === correctPassword) {
      setActiveMerchantId(pendingLoginMerchant.id);
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
      email: `${name.toLowerCase().replace(/\s+/g, '')}@afrinova.com`,
      password,
      isPremium: true,
      logo: shopName.slice(0, 2).toUpperCase(),
      views: 0,
      clicks: 0,
      sales: 0,
      isVerified: true,
      verificationStatus: 'verified',
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

    setActiveMerchantId(newM.id);
    setShowCreateShopModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-[#0F172A]" id="merchant-portal-container">
      
      {/* ========================================================= */}
      {/* CONNECTED MERCHANT TABLEAU DE BORD PRO                    */}
      {/* ========================================================= */}
      <div className="space-y-6">

        {/* --------------------------------------------------------- */}
        {/* HEADER: STORE IDENTITY, BADGES, TOP MANAGEMENT ACTIONS    */}
        {/* --------------------------------------------------------- */}
        <div className="bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#7C3AED]"></div>
          
          {/* Top Row: Shop Info & Direct Action Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200/80 pb-6">
            
            {/* Left: Logo & Store Details */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#16A34A] to-[#7C3AED] text-white rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border border-emerald-300/40">
                  {activeMerchant?.logo || 'MB'}
                </div>
                {activeMerchant?.shopPhoto && (
                  <img
                    src={activeMerchant.shopPhoto}
                    alt={activeMerchant.shopName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover absolute inset-0 border-2 border-white shadow-md"
                  />
                )}
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  shopStatus === 'open' ? 'bg-emerald-500' : shopStatus === 'paused' ? 'bg-amber-500' : 'bg-rose-500'
                }`} title={`Statut : ${shopStatus}`} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-100 text-[#16A34A] border border-emerald-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-3xs">
                    <Store className="w-3.5 h-3.5 text-[#16A34A]" /> Espace Vendeur Pro
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                    Tableau de bord de la boutique
                  </h1>
                  <span className="text-slate-300 font-bold hidden sm:inline">•</span>
                  <span className="text-sm font-extrabold text-slate-700">{activeMerchant?.shopName || 'Ma Boutique Bafoussam'}</span>
                  <VerifiedBadge size="sm" />
                    
                    {/* Subscription Tier Badge / Selector */}
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-3xs cursor-pointer transition"
                      title="Changer de niveau d'abonnement"
                    >
                      <Sparkles className="w-3 h-3 fill-amber-700 text-amber-700" />
                      <span>{subscriptionTier}</span>
                    </button>

                    {/* Interactive Shop Status Selector */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200">
                      <button
                        onClick={() => setShopStatus('open')}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          shopStatus === 'open' ? 'bg-emerald-600 text-white shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        ● Ouverte
                      </button>
                      <button
                        onClick={() => setShopStatus('paused')}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          shopStatus === 'paused' ? 'bg-amber-500 text-slate-950 shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        ● En pause
                      </button>
                      <button
                        onClick={() => setShopStatus('closed')}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          shopStatus === 'closed' ? 'bg-rose-600 text-white shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        ● Fermée
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold">
                      <Users className="w-3.5 h-3.5 text-[#16A34A]" /> Gérant : <strong className="text-slate-900">{activeMerchant?.name}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" /> {activeMerchant?.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {activeMerchant?.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Header Buttons (Modifier, Partager, Scanner QR, Paramètres, Vitrine, Logout) */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#7C3AED] hover:from-[#15803D] hover:to-[#6D28D9] text-white font-black text-xs py-2.5 px-4 rounded-2xl shadow-[0_4px_16px_rgba(22,163,74,0.3)] transition flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nouveau produit</span>
                </button>

                <button
                  onClick={() => setShowEditShopModal(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 px-3.5 rounded-2xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  title="Modifier la boutique"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Modifier</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 px-3.5 rounded-2xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  title="Partager la boutique"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Partager</span>
                </button>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 font-extrabold text-xs py-2.5 px-3.5 rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
                  title="Scanner QR Code de retrait ou paiement"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Scanner QR</span>
                </button>

                <button
                  onClick={() => setDashboardTab('profile')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 px-3.5 rounded-2xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-600" />
                  <span>Paramètres</span>
                </button>

                {onSwitchToClientSpace && (
                  <button
                    onClick={onSwitchToClientSpace}
                    className="bg-emerald-50 hover:bg-emerald-100/80 text-[#16A34A] border border-emerald-200 font-extrabold text-xs py-2.5 px-3.5 rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Vitrine</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveMerchantId(null)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs p-2.5 rounded-2xl transition flex items-center justify-center cursor-pointer"
                  title="Se déconnecter de la boutique"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* --------------------------------------------------------- */}
            {/* REAL-TIME STATS GRID (ALL 16 PERFORMANCE METRICS)        */}
            {/* --------------------------------------------------------- */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[#16A34A]" />
                  Statistiques Vendeur en Temps Réel (16 Indicateurs)
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Mis à jour en direct
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-16 gap-2">
                
                {/* 1. Total produits */}
                <div onClick={() => setDashboardTab('products')} className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#16A34A] block truncate">Total Produits</span>
                  <span className="text-base font-black text-[#0F172A] block leading-tight mt-0.5">{merchantProducts.length}</span>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">Catalogue</span>
                </div>

                {/* 2. Produits en ligne */}
                <div onClick={() => setDashboardTab('products')} className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block truncate">En Ligne</span>
                  <span className="text-base font-black text-emerald-900 block leading-tight mt-0.5">{kpiOnlineProducts}</span>
                  <span className="text-[8px] text-emerald-700 font-bold block mt-0.5">Disponibles</span>
                </div>

                {/* 3. En rupture */}
                <div onClick={() => setDashboardTab('stock')} className="bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/80 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 block truncate">Rupture Stock</span>
                  <span className="text-base font-black text-rose-900 block leading-tight mt-0.5">{kpiOutOfStockProducts}</span>
                  <span className="text-[8px] text-rose-700 font-bold block mt-0.5">À réapprov.</span>
                </div>

                {/* 4. Commandes en attente */}
                <div onClick={() => setDashboardTab('orders')} className="bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#7C3AED] block truncate">Cmds Attente</span>
                  <span className="text-base font-black text-purple-900 block leading-tight mt-0.5">{kpiPendingOrders}</span>
                  <span className="text-[8px] text-purple-700 font-bold block mt-0.5">À traiter</span>
                </div>

                {/* 5. Commandes confirmées */}
                <div onClick={() => setDashboardTab('orders')} className="bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#7C3AED] block truncate">Cmds Prep</span>
                  <span className="text-base font-black text-purple-900 block leading-tight mt-0.5">{kpiConfirmedOrders}</span>
                  <span className="text-[8px] text-purple-700 font-bold block mt-0.5">En cours</span>
                </div>

                {/* 6. Commandes livrées */}
                <div onClick={() => setDashboardTab('orders')} className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block truncate">Cmds Livrées</span>
                  <span className="text-base font-black text-emerald-900 block leading-tight mt-0.5">{kpiDeliveredOrders}</span>
                  <span className="text-[8px] text-emerald-700 font-bold block mt-0.5">Finalisées</span>
                </div>

                {/* 7. Commandes annulées */}
                <div onClick={() => setDashboardTab('orders')} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 block truncate">Annulées</span>
                  <span className="text-base font-black text-slate-800 block leading-tight mt-0.5">{kpiCancelledOrders}</span>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">0% perte</span>
                </div>

                {/* 8. CA du jour */}
                <div onClick={() => setDashboardTab('payments')} className="bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block truncate">CA Jour</span>
                  <span className="text-xs font-black text-amber-950 block leading-tight mt-0.5">{kpiTodaySales.toLocaleString('fr-FR')} F</span>
                  <span className="text-[8px] text-emerald-700 font-bold block mt-0.5">Aujourd'hui</span>
                </div>

                {/* 9. CA Semaine */}
                <div onClick={() => setDashboardTab('payments')} className="bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block truncate">CA Semaine</span>
                  <span className="text-xs font-black text-amber-950 block leading-tight mt-0.5">{kpiWeeklySales.toLocaleString('fr-FR')} F</span>
                  <span className="text-[8px] text-amber-700 font-bold block mt-0.5">7 jours</span>
                </div>

                {/* 10. CA Mois */}
                <div onClick={() => setDashboardTab('payments')} className="bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block truncate">CA Mois</span>
                  <span className="text-xs font-black text-amber-950 block leading-tight mt-0.5">{kpiMonthlySales.toLocaleString('fr-FR')} F</span>
                  <span className="text-[8px] text-amber-700 font-bold block mt-0.5">30 jours</span>
                </div>

                {/* 11. Revenus Totaux */}
                <div onClick={() => setDashboardTab('payments')} className="bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-300 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#16A34A] block truncate">Revenus Totaux</span>
                  <span className="text-xs font-black text-emerald-950 block leading-tight mt-0.5">{kpiTotalRevenue.toLocaleString('fr-FR')} F</span>
                  <span className="text-[8px] text-emerald-700 font-bold block mt-0.5">Cumulé</span>
                </div>

                {/* 12. Visiteurs */}
                <div onClick={() => setDashboardTab('stats')} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 block truncate">Visiteurs</span>
                  <span className="text-base font-black text-slate-900 block leading-tight mt-0.5">{kpiVisitors}</span>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">Vues shop</span>
                </div>

                {/* 13. Favoris */}
                <div onClick={() => setDashboardTab('stats')} className="bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 border border-purple-200 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#7C3AED] block truncate">Favoris</span>
                  <span className="text-base font-black text-purple-950 block leading-tight mt-0.5">{kpiFavorites}</span>
                  <span className="text-[8px] text-purple-700 font-bold block mt-0.5">Acheteurs</span>
                </div>

                {/* 14. Nouveaux Clients */}
                <div onClick={() => setDashboardTab('stats')} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 block truncate">Nouveaux Clts</span>
                  <span className="text-base font-black text-slate-900 block leading-tight mt-0.5">{kpiNewCustomers}</span>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">Nouveaux</span>
                </div>

                {/* 15. Note moyenne */}
                <div onClick={() => setDashboardTab('reviews')} className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block truncate">Note Moy.</span>
                  <span className="text-base font-black text-amber-950 block leading-tight mt-0.5">★ {kpiAverageRating}</span>
                  <span className="text-[8px] text-amber-700 font-bold block mt-0.5">Avis certifiés</span>
                </div>

                {/* 16. Taux de conversion */}
                <div onClick={() => setDashboardTab('stats')} className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl p-2.5 transition cursor-pointer group">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block truncate">Conversion</span>
                  <span className="text-base font-black text-emerald-950 block leading-tight mt-0.5">{kpiConversionRate}%</span>
                  <span className="text-[8px] text-emerald-700 font-bold block mt-0.5">Excellente</span>
                </div>

              </div>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* QUICK ACTION MENU GRID (ALL 16 QUICK ACTIONS)             */}
          {/* --------------------------------------------------------- */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#16A34A]" />
                <span>Menu d'Actions Rapides Vendeur (16 Outils)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Accès instantané 1-clic</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-16 gap-2">
              
              {/* 1. Vue Générale */}
              <button
                onClick={() => setDashboardTab('overview')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'overview' 
                    ? 'bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white border-emerald-600 shadow-sm font-black' 
                    : 'bg-slate-50 hover:bg-emerald-50/50 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <Compass className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Vue Générale</span>
              </button>

              {/* 2. Ajouter Produit */}
              <button
                onClick={() => setShowAddProductModal(true)}
                className="p-2.5 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-[#16A34A] border border-emerald-300 flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group shadow-3xs"
              >
                <Plus className="w-4 h-4 stroke-[3] group-hover:scale-110 transition" />
                <span className="text-[9px] font-black leading-tight">+ Produit</span>
              </button>

              {/* 3. Gérer Produits */}
              <button
                onClick={() => setDashboardTab('products')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'products' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Produits</span>
              </button>

              {/* 4. Catégories */}
              <button
                onClick={() => setDashboardTab('categories')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'categories' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <Layers className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Catégories</span>
              </button>

              {/* 5. Stock */}
              <button
                onClick={() => setDashboardTab('stock')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'stock' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <BarChart3 className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Stock</span>
              </button>

              {/* 6. Commandes */}
              <button
                onClick={() => setDashboardTab('orders')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer relative group ${
                  dashboardTab === 'orders' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <PackageCheck className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Commandes</span>
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              {/* 7. Paiements */}
              <button
                onClick={() => setDashboardTab('payments')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'payments' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <CreditCard className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Paiements</span>
              </button>

              {/* 8. Livraisons */}
              <button
                onClick={() => setDashboardTab('deliveries')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'deliveries' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <Truck className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Livraisons</span>
              </button>

              {/* 9. Promotions */}
              <button
                onClick={() => setDashboardTab('promotions')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'promotions' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <Tag className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Promotions</span>
              </button>

              {/* 10. Messages */}
              <button
                onClick={() => setDashboardTab('messages')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer relative group ${
                  dashboardTab === 'messages' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <MessageSquare className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Messages</span>
                {messages.some(m => m.unread) && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    !
                  </span>
                )}
              </button>

              {/* 11. Avis Clients */}
              <button
                onClick={() => setDashboardTab('reviews')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'reviews' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <Star className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Avis Clients</span>
              </button>

              {/* 12. Statistiques */}
              <button
                onClick={() => setDashboardTab('stats')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'stats' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <LineChart className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Statistiques</span>
              </button>

              {/* 13. Factures */}
              <button
                onClick={() => setDashboardTab('invoices')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'invoices' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Factures</span>
              </button>

              {/* 14. Calendrier */}
              <button
                onClick={() => setDashboardTab('calendar')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'calendar' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <Calendar className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Calendrier</span>
              </button>

              {/* 15. Assistance Support */}
              <button
                onClick={() => setDashboardTab('support')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'support' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <Headphones className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Assistance</span>
              </button>

              {/* 16. Paramètres */}
              <button
                onClick={() => setDashboardTab('profile')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer group ${
                  dashboardTab === 'profile' ? 'bg-[#16A34A] text-white border-[#16A34A] font-black shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 font-bold'
                }`}
              >
                <Settings className="w-4 h-4 group-hover:scale-110 transition" />
                <span className="text-[9px] leading-tight">Paramètres</span>
              </button>

            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* TAB CONTENT SECTIONS                                       */}
          {/* --------------------------------------------------------- */}

          {/* OVERVIEW TAB */}
          {dashboardTab === 'overview' && (
            <div className="space-y-6">

              {/* 1. NOTIFICATIONS IMPORTANTES */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    <span>Notifications & Alertes Importantes</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">Mises à jour en direct</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  
                  {/* Alert Pending Verification */}
                  {activeMerchant?.verificationStatus === 'pending_verification' && (
                    <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                      <div className="text-xs">
                        <h4 className="font-bold text-amber-900">Vérification CNI en cours</h4>
                        <p className="text-amber-800/80 text-[11px] mt-1 leading-snug">
                          Votre dossier est en cours de validation par l'administration AfriNova.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Alert Low Stock */}
                  {lowStockProducts.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <h4 className="font-bold text-rose-900">Alerte Stock Faible ({lowStockProducts.length})</h4>
                        <p className="text-rose-800/80 text-[11px] mt-1 leading-snug">
                          Certains produits ont moins de 5 unités en réserve.
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
                    <div className="bg-purple-50 border border-purple-200/80 p-4 rounded-2xl flex items-start gap-3">
                      <PackageCheck className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <h4 className="font-bold text-purple-900">{pendingOrdersCount} Commandes à traiter</h4>
                        <p className="text-purple-800/80 text-[11px] mt-1 leading-snug">
                          Des acheteurs locaux attendent la préparation de leur colis.
                        </p>
                        <button
                          onClick={() => setDashboardTab('orders')}
                          className="mt-2 text-[10px] font-black text-[#7C3AED] hover:underline cursor-pointer uppercase tracking-wider"
                        >
                          Voir les commandes →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Alert VIP Membership */}
                  {!activeMerchant?.isPremium && (
                    <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <h4 className="font-bold text-emerald-900">Activez votre Badge VIP</h4>
                        <p className="text-emerald-800/80 text-[11px] mt-1 leading-snug">
                          Mettez en avant vos articles en tête du catalogue Bafoussam.
                        </p>
                        <button
                          onClick={() => setShowUpgradeModal(true)}
                          className="mt-2 text-[10px] font-black text-[#16A34A] hover:underline cursor-pointer uppercase tracking-wider"
                        >
                          S'abonner Membre VIP →
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* 2. DERNIÈRES COMMANDES CLIENTS */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-[#16A34A]" />
                    <span>Dernières Commandes Clients</span>
                  </h3>
                  <button
                    onClick={() => setDashboardTab('orders')}
                    className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
                  >
                    Voir toutes ({merchantOrders.length})
                  </button>
                </div>

                {merchantOrders.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="font-semibold text-slate-700 text-xs">Aucune commande enregistrée pour le moment.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Les commandes des acheteurs apparaîtront ici automatiquement.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {merchantOrders.slice(0, 3).map((ord) => {
                      const merchantItems = ord.items.filter(i => i.product.merchantId === activeMerchantId);
                      const merchantSubtotal = merchantItems.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

                      return (
                        <div key={ord.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-xs">Commande #{ord.id}</span>
                                <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full ${
                                  ord.status === 'completed' 
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {ord.status === 'pending' && 'En attente'}
                                  {ord.status === 'preparing' && 'En préparation'}
                                  {ord.status === 'delivering' && 'En livraison'}
                                  {ord.status === 'completed' && 'Livrée'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Client : <strong className="text-slate-900">{ord.userName}</strong> ({ord.deliveryNeighborhood}) • Tél: {ord.paymentPhone}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-black text-[#0F172A] block">{merchantSubtotal.toLocaleString('fr-FR')} FCFA</span>
                              <span className="text-[9px] text-emerald-700 font-bold block">Mobile Money Paid</span>
                            </div>
                          </div>

                          {/* Items summary */}
                          <div className="space-y-1 text-xs">
                            {merchantItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-[11px]">
                                <span className="font-semibold text-slate-800">{item.quantity}x {item.product.name}</span>
                                <span className="font-mono text-slate-600">{(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                              </div>
                            ))}
                          </div>

                          {/* Action controls */}
                          {onUpdateOrderStatus && ord.status !== 'completed' && (
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                              {ord.status === 'pending' && (
                                <button
                                  onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                                  className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-[11px] py-1.5 px-3 rounded-lg cursor-pointer transition shadow-2xs"
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
                                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-[11px] py-1.5 px-3 rounded-lg cursor-pointer transition"
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

              {/* 3. GRAPHIQUES DE PERFORMANCE & STATISTIQUES */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-[#7C3AED]" />
                    <span>Aperçu Graphique des Performances</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">Juillet - Août 2026</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Growth Bar Chart */}
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                        Progression Mensuelle du Chiffre d'Affaires
                      </h4>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">+28% ce mois</span>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>Semaine 1</span>
                          <span>45 000 FCFA</span>
                        </div>
                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#16A34A] to-[#15803D] rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>Semaine 2</span>
                          <span>72 000 FCFA</span>
                        </div>
                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#16A34A] to-[#15803D] rounded-full" style={{ width: '70%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>Semaine 3</span>
                          <span>68 000 FCFA</span>
                        </div>
                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#16A34A] to-[#15803D] rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>Semaine 4 (En cours)</span>
                          <span>85 000 FCFA</span>
                        </div>
                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visitors & Conversions Ratio */}
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                        Visites & Taux de Conversion Bafoussam
                      </h4>
                      <span className="text-[10px] font-black text-[#7C3AED] bg-purple-100 px-2 py-0.5 rounded-full">Taux: 12.4%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Vues Totales Vitrine</span>
                        <span className="text-xl font-black text-[#0F172A] block mt-0.5">{storefrontViews}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">↑ +140 cette semaine</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Clics & Intentions</span>
                        <span className="text-xl font-black text-[#0F172A] block mt-0.5">{storefrontClicks}</span>
                        <span className="text-[10px] text-purple-700 font-semibold">↑ +32 cette semaine</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/70 text-xs text-emerald-900 font-semibold flex items-center justify-between">
                      <span>🎯 1 client sur 8 valide un achat direct</span>
                      <button onClick={() => setDashboardTab('stats')} className="font-extrabold text-[#16A34A] underline cursor-pointer">Détails →</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. PRODUITS LES PLUS VENDUS */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#16A34A]" />
                    <span>Produits les plus Performants</span>
                  </h3>
                  <button
                    onClick={() => setDashboardTab('products')}
                    className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
                  >
                    Gérer le catalogue ({merchantProducts.length})
                  </button>
                </div>

                {topProducts.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="font-semibold text-slate-700 text-xs">Aucun produit dans le catalogue.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topProducts.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs truncate">{p.name}</h4>
                          <p className="text-[10px] text-slate-500 font-semibold">{p.category}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px]">
                            <span className="font-black text-[#0F172A]">{p.price.toLocaleString('fr-FR')} FCFA</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-medium">Stock: {productStocks[p.id] ?? p.stock}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full flex items-center gap-0.5">
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

              {/* 5. DERNIERS AVIS CLIENTS & RÉPONSES */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    <span>Derniers Avis Clients Certifiés</span>
                  </h3>
                  <button
                    onClick={() => setDashboardTab('reviews')}
                    className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
                  >
                    Voir tous les avis ({reviews.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {reviews.slice(0, 2).map((rev) => (
                    <div key={rev.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{rev.userName}</span>
                          <span className="text-[10px] text-slate-400">({rev.userPhone})</span>
                          <span className="bg-emerald-100 text-[#16A34A] text-[9px] font-black px-2 py-0.2 rounded-full">Acheteur Vérifié</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">"{rev.comment}"</p>
                      <p className="text-[10px] text-slate-400">Article : <strong>{rev.productName}</strong> • {rev.date}</p>

                      {rev.reply ? (
                        <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/70 text-xs text-emerald-900 mt-2">
                          <strong className="block text-[10px] uppercase text-[#16A34A] font-black">Réponse du Vendeur :</strong>
                          <p className="text-slate-700 mt-0.5">{rev.reply}</p>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Écrire une réponse à ce client..."
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                            value={replyInput[rev.id] || ''}
                            onChange={(e) => setReplyInput({ ...replyInput, [rev.id]: e.target.value })}
                          />
                          <button
                            onClick={() => handleAddReviewReply(rev.id)}
                            className="bg-[#16A34A] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#15803D] cursor-pointer"
                          >
                            Répondre
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. PAIEMENTS RÉCENTS & REVERSEMENTS MOBILE MONEY */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#16A34A]" />
                    <span>Paiements Récents & Reversements Mobile Money</span>
                  </h3>
                  <button
                    onClick={() => setDashboardTab('payments')}
                    className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
                  >
                    Gérer les comptes
                  </button>
                </div>

                <div className="space-y-2">
                  {payouts.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center font-black">
                          ✓
                        </div>
                        <div>
                          <strong className="text-slate-900 block text-xs">{p.amount.toLocaleString('fr-FR')} FCFA</strong>
                          <span className="text-[10px] text-slate-500 font-semibold">{p.provider} ({p.accountNumber}) • Ref: {p.reference}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full block">Versé</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{p.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* PRODUCTS TAB */}
          {dashboardTab === 'products' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Gestion du Catalogue Produits</h3>
                  <p className="text-xs text-slate-500">Consultez, modifiez et ajoutez vos articles en vente à Bafoussam.</p>
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nouveau Produit</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher un produit dans votre catalogue..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              {merchantProducts.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                  <span className="text-4xl">📦</span>
                  <p className="font-semibold text-slate-800 mt-2 text-sm">Votre catalogue est vide</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Ajoutez dès maintenant vos articles pour qu'ils soient visibles par les acheteurs à Bafoussam.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {merchantProducts
                    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((p) => (
                      <div key={p.id} className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
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
                          <p className="text-[10px] text-slate-500 font-semibold">{p.category}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs">
                            <span className="font-black text-[#0F172A]">{p.price.toLocaleString('fr-FR')} FCFA</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-semibold text-slate-600">Stock: {productStocks[p.id] ?? p.stock}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-rose-50 transition"
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
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Gestion des Commandes Clients</h3>
                <p className="text-xs text-slate-500">Traitez et mettez à jour le statut des commandes attribuées à votre boutique.</p>
              </div>

              {merchantOrders.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                  <span className="text-4xl">📋</span>
                  <p className="font-semibold text-slate-800 mt-2 text-sm">Aucune commande en attente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {merchantOrders.map((ord) => {
                    const merchantItems = ord.items.filter(i => i.product.merchantId === activeMerchantId);
                    const merchantSubtotal = merchantItems.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

                    return (
                      <div key={ord.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm">Commande #{ord.id}</span>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Client: <strong className="text-slate-900">{ord.userName}</strong> • Quartier: {ord.deliveryNeighborhood} • Tél: {ord.paymentPhone}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-slate-900 block">{merchantSubtotal.toLocaleString('fr-FR')} FCFA</span>
                            <span className="text-[10px] font-bold text-emerald-700">Payé par Mobile Money</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          {merchantItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="font-semibold text-slate-800">{item.quantity}x {item.product.name}</span>
                              <span className="font-mono text-slate-600">{(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          ))}
                        </div>

                        {onUpdateOrderStatus && ord.status !== 'completed' && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                            {ord.status === 'pending' && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                                className="bg-[#16A34A] text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer hover:bg-[#15803D]"
                              >
                                Confidentialiser & Préparer
                              </button>
                            )}
                            {ord.status === 'preparing' && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, 'delivering')}
                                className="bg-amber-500 text-slate-950 font-black text-xs py-2 px-4 rounded-xl cursor-pointer hover:bg-amber-600"
                              >
                                Remettre au Coursier Moto
                              </button>
                            )}
                            {ord.status === 'delivering' && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, 'completed')}
                                className="bg-[#7C3AED] text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer hover:bg-[#6D28D9]"
                              >
                                Confirmer Livraison Réussie
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
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Ajustement du Stock en Temps Réel</h3>
                <p className="text-xs text-slate-500">Modifiez instantanément les quantités disponibles pour éviter les ruptures de stock.</p>
              </div>

              <div className="space-y-3">
                {merchantProducts.map((p) => {
                  const currentQty = productStocks[p.id] ?? p.stock;
                  return (
                    <div key={p.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold">{p.price.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleStockChange(p.id, -1)}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-black text-slate-800 text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          -
                        </button>
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${currentQty < 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {currentQty} unités
                        </span>
                        <button
                          onClick={() => handleStockChange(p.id, 1)}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-black text-slate-800 text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DELIVERIES TAB */}
          {dashboardTab === 'deliveries' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              <h3 className="font-extrabold text-slate-900 text-lg">Suivi des Livraisons Moto-Taxi</h3>
              <p className="text-xs text-slate-500">Les coursiers affiliés AfriNova prennent en charge la livraison express à Bafoussam.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs space-y-2">
                  <h4 className="font-extrabold text-[#16A34A] uppercase tracking-wider">Zones de Livraison Couvertes :</h4>
                  <p className="text-slate-700 leading-relaxed">
                    📍 Tamdja, Bamendzi, Marché A, Marché B, Marché Congo, Carrefour Bamiléké, Banengo, Kamkop, Djeleng.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200/80 text-xs space-y-2">
                  <h4 className="font-extrabold text-[#7C3AED] uppercase tracking-wider">Service Coursier Dédié :</h4>
                  <p className="text-slate-700 leading-relaxed">
                    ⏱️ Temps moyen d'expédition : 25 à 45 minutes après confirmation de préparation en boutique.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENTS TAB */}
          {dashboardTab === 'payments' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Paiements & Reversements Mobile Money</h3>
                <p className="text-xs text-slate-500">Demandez et suivez vos retours de fonds directement sur vos comptes Mobile Money.</p>
              </div>

              {/* Connected MoMo account info */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">Compte d'Encaissement</span>
                  <strong className="text-slate-900 text-sm font-black">{activeMerchant?.phone}</strong>
                  <p className="text-[11px] text-slate-600">Paiements automatisés par MTN MoMo / Orange Money</p>
                </div>

                <form onSubmit={handleRequestPayout} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    value={payoutAmountInput}
                    onChange={(e) => setPayoutAmountInput(e.target.value)}
                    className="w-28 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition shadow-2xs"
                  >
                    Demander virement
                  </button>
                </form>
              </div>

              {payoutRequested && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900">
                  ✓ Demande de virement envoyée avec succès sur le numéro Mobile Money !
                </div>
              )}

              {/* Transactions log */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Historique des Reversements</h4>
                {payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                    <div>
                      <strong className="text-slate-900 block text-xs">{p.amount.toLocaleString('fr-FR')} FCFA</strong>
                      <span className="text-[10px] text-slate-500">{p.provider} ({p.accountNumber}) • Ref: {p.reference}</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">Versé</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROMOTIONS TAB */}
          {dashboardTab === 'promotions' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Offres & Codes Promo</h3>
                <p className="text-xs text-slate-500">Créez des remises promotionnelles pour attirer plus d'acheteurs à Bafoussam.</p>
              </div>

              <form onSubmit={handleCreatePromoCode} className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Ex: PROMO2026"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                />
                <select
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(e.target.value)}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="5%">Remise 5%</option>
                  <option value="10%">Remise 10%</option>
                  <option value="15%">Remise 15%</option>
                  <option value="20%">Remise 20%</option>
                </select>
                <button
                  type="submit"
                  className="bg-[#16A34A] text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer hover:bg-[#15803D]"
                >
                  Créer le Code Promo
                </button>
              </form>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Codes Promos Actifs</h4>
                {promoCodes.map((pc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#16A34A]" />
                      <strong className="font-black text-slate-900">{pc.code}</strong>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">{pc.discount}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">{pc.uses} utilisations</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {dashboardTab === 'reviews' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Avis Clients Certifiés</h3>
                <p className="text-xs text-slate-500">Répondez aux évaluations laissées par vos clients après leurs achats.</p>
              </div>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs">{rev.userName} ({rev.userPhone})</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700">"{rev.comment}"</p>
                    {rev.reply ? (
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                        <strong className="block text-[10px] uppercase text-[#16A34A]">Votre Réponse :</strong>
                        <p>{rev.reply}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Votre réponse..."
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                          value={replyInput[rev.id] || ''}
                          onChange={(e) => setReplyInput({ ...replyInput, [rev.id]: e.target.value })}
                        />
                        <button
                          onClick={() => handleAddReviewReply(rev.id)}
                          className="bg-[#16A34A] text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                        >
                          Envoyer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {dashboardTab === 'messages' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Messagerie Vendeur Instantanée</h3>
                <p className="text-xs text-slate-500">Répondez directement aux questions des acheteurs intéressés.</p>
              </div>

              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs font-bold text-slate-900">{m.senderName} ({m.senderPhone})</strong>
                      <span className="text-[10px] text-slate-400">{m.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">{m.message}</p>

                    {m.replies.map((r, idx) => (
                      <div key={idx} className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                        <strong className="block text-[10px] uppercase text-[#16A34A]">Votre Réponse :</strong>
                        <p>{r}</p>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Répondre au message..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                        value={chatReplyInput[m.id] || ''}
                        onChange={(e) => setChatReplyInput({ ...chatReplyInput, [m.id]: e.target.value })}
                      />
                      <button
                        onClick={() => handleSendChatReply(m.id)}
                        className="bg-[#16A34A] text-white px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {dashboardTab === 'categories' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Catégories de Produits de la Boutique</h3>
                  <p className="text-xs text-slate-500">Organisez vos articles par rayons pour faciliter les achats des clients.</p>
                </div>
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-[#16A34A] text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle Catégorie</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {['Alimentation', 'Boissons & Jus', 'Électronique & Mobile', 'Mode & Beauté', 'Maison & Décoration', 'Scolaire & Bureau'].map((cat, idx) => {
                  const count = merchantProducts.filter(p => p.category === cat || idx % 2 === 0).length;
                  return (
                    <div key={cat} className="p-4 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-200/80 transition flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{cat}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{count} articles en vente</p>
                      </div>
                      <span className="w-8 h-8 rounded-xl bg-emerald-100 text-[#16A34A] font-black text-xs flex items-center justify-center">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COUPONS & PROMOTIONS TAB */}
          {(dashboardTab === 'promotions' || dashboardTab === 'coupons') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Promotions & Codes Promo Vendeur</h3>
                  <p className="text-xs text-slate-500">Boostez vos ventes avec des remises spéciales et coupons de réduction.</p>
                </div>
                <button 
                  onClick={() => alert('Code promo créé avec succès : "AFRI-BAFOUSSAM-10" (-10% sur toute la boutique !)')}
                  className="bg-gradient-to-r from-[#16A34A] to-[#7C3AED] text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer un Code Promo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">Actif</span>
                    <Tag className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <p className="font-extrabold text-slate-900 text-base">BIENVENUE10</p>
                  <p className="text-xs text-slate-600">-10% sur la première commande dès 5 000 FCFA</p>
                  <p className="text-[10px] text-slate-400 font-bold">Utilisé 28 fois ce mois</p>
                </div>

                <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-[#7C3AED] text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">VIP</span>
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  </div>
                  <p className="font-extrabold text-slate-900 text-base">BAFOUSSAM-EXPRESS</p>
                  <p className="text-xs text-slate-600">Livraison gratuite dès 15 000 FCFA d'achat</p>
                  <p className="text-[10px] text-slate-400 font-bold">Utilisé 14 fois ce mois</p>
                </div>

                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-amber-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">Flash</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="font-extrabold text-slate-900 text-base">WEEKEND-SPECIAL</p>
                  <p className="text-xs text-slate-600">-2000 FCFA sur tous les paniers {'>'} 20 000 FCFA</p>
                  <p className="text-[10px] text-slate-400 font-bold">Expire dans 2 jours</p>
                </div>
              </div>
            </div>
          )}

          {/* INVOICES TAB */}
          {dashboardTab === 'invoices' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Factures & Reçus Officiels AfriNova</h3>
                  <p className="text-xs text-slate-500">Téléchargez les bordereaux de virement et récapitulatifs comptables.</p>
                </div>
                <button 
                  onClick={() => alert('Exportation Excel / PDF des factures générée !')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 px-4 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                  <span>Exporter PDF/Excel</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">N° Facture</th>
                      <th className="p-3">Période</th>
                      <th className="p-3">Montant Brut</th>
                      <th className="p-3">Commission AfriNova (0.5%)</th>
                      <th className="p-3">Montant Reçu (OM/MOMO)</th>
                      <th className="p-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {[
                      { id: 'FACT-2026-08', period: 'Août 2026', brut: 245000, comm: 1225, net: 243775, status: 'Payé' },
                      { id: 'FACT-2026-07', period: 'Juillet 2026', brut: 310000, comm: 1550, net: 308450, status: 'Payé' },
                      { id: 'FACT-2026-06', period: 'Juin 2026', brut: 180000, comm: 900, net: 179100, status: 'Payé' },
                    ].map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-900">{f.id}</td>
                        <td className="p-3 text-slate-600">{f.period}</td>
                        <td className="p-3 font-bold text-slate-900">{f.brut.toLocaleString('fr-FR')} FCFA</td>
                        <td className="p-3 text-rose-600">-{f.comm.toLocaleString('fr-FR')} FCFA</td>
                        <td className="p-3 font-extrabold text-[#16A34A]">{f.net.toLocaleString('fr-FR')} FCFA</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                            ✓ {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CALENDAR TAB */}
          {dashboardTab === 'calendar' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Planning & Retraits Bafoussam</h3>
                  <p className="text-xs text-slate-500">Gérez les créneaux de livraison et les rendez-vous de retrait en boutique.</p>
                </div>
                <span className="bg-purple-100 text-[#7C3AED] font-extrabold text-xs py-1.5 px-3 rounded-full">
                  Août 2026
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#16A34A]" />
                    <span>Créneaux de Retrait Aujourd'hui</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">09h30 - 10h30</p>
                        <p className="text-[11px] text-slate-500">M. Emmanuel Talla • Sac de Riz Parfumé</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Prêt</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">14h00 - 15h00</p>
                        <p className="text-[11px] text-slate-500">Mme. Claudine • Huile Diamaor 5L</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">En prép</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#16A34A]" />
                    <span>Livraisons Programmées</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Les livreurs AfriNova passent chaque jour à <strong>11h00</strong> et <strong>16h30</strong> pour collecter les colis expédiés par coursier à Bafoussam, Mbouda, Dschang et Bandjoun.
                  </p>
                  <button 
                    onClick={() => alert('Demande de passage de coursier confirmée pour 16h30 !')}
                    className="w-full bg-[#16A34A] text-white font-extrabold text-xs py-2.5 rounded-xl hover:bg-[#15803D] transition cursor-pointer"
                  >
                    Demander un passage coursier aujourd'hui
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUPPORT TAB */}
          {dashboardTab === 'support' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Assistance & Support Vendeur AfriNova</h3>
                  <p className="text-xs text-slate-500">Un conseiller dédié vous accompagne 7j/7 pour booster vos ventes à Bafoussam.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  ● Ligne Ouverte
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-center">
                  <Phone className="w-8 h-8 text-[#16A34A] mx-auto" />
                  <h4 className="font-extrabold text-slate-900 text-sm">Appel Téléphonique</h4>
                  <p className="text-xs text-slate-600">+237 677 00 00 00</p>
                  <a href="tel:+237677000000" className="inline-block mt-2 text-xs font-black text-[#16A34A] hover:underline">
                    Appeler l'assistance →
                  </a>
                </div>

                <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl space-y-2 text-center">
                  <MessageSquare className="w-8 h-8 text-[#7C3AED] mx-auto" />
                  <h4 className="font-extrabold text-slate-900 text-sm">WhatsApp Direct Vendeur</h4>
                  <p className="text-xs text-slate-600">Réponse en moins de 5 min</p>
                  <a href="https://wa.me/237677000000" target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs font-black text-[#7C3AED] hover:underline">
                    Démarrer un chat →
                  </a>
                </div>

                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-center">
                  <Headphones className="w-8 h-8 text-amber-600 mx-auto" />
                  <h4 className="font-extrabold text-slate-900 text-sm">Ticket de Réclamation</h4>
                  <p className="text-xs text-slate-600">Gestion litige & remboursement</p>
                  <button 
                    onClick={() => setShowSupportModal(true)}
                    className="inline-block mt-2 text-xs font-black text-amber-700 hover:underline cursor-pointer"
                  >
                    Ouvrir un ticket →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATS TAB */}
          {dashboardTab === 'stats' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Analyse Approfondie des Ventes</h3>
                <p className="text-xs text-slate-500">Statistiques détaillées sur le comportement de vos clients à Bafoussam.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold block uppercase">Chiffre d'Affaires</span>
                  <span className="text-2xl font-black text-[#0F172A] mt-1 block">{monthlySalesTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold block uppercase">Vues de la Vitrine</span>
                  <span className="text-2xl font-black text-[#0F172A] mt-1 block">{storefrontViews}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold block uppercase">Note Moyenne</span>
                  <span className="text-2xl font-black text-amber-600 mt-1 block">{averageRating} / 5.0</span>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {dashboardTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Paramètres de la Boutique</h3>
                <p className="text-xs text-slate-500">Mettez à jour les coordonnées et informations de votre commerce.</p>
              </div>

              <div className="space-y-4 max-w-xl text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nom du Commerce</label>
                  <input type="text" defaultValue={activeMerchant?.shopName} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nom du Gérant</label>
                  <input type="text" defaultValue={activeMerchant?.name} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Emplacement Bafoussam</label>
                  <input type="text" defaultValue={activeMerchant?.location} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Téléphone Mobile Money</label>
                  <input type="text" defaultValue={activeMerchant?.phone} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileSuccess(true);
                    setTimeout(() => setProfileSuccess(false), 3000);
                  }}
                  className="bg-[#16A34A] text-white font-bold text-xs py-3 px-6 rounded-xl hover:bg-[#15803D] cursor-pointer"
                >
                  Sauvegarder les Modifications
                </button>

                {profileSuccess && (
                  <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold">
                    ✓ Informations sauvegardées avec succès !
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      {/* ========================================================= */}
      {/* MODAL 1: CREATION DE BOUTIQUE                              */}
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
              <h3 className="font-extrabold text-slate-900 text-xl">Ouvrir votre Boutique AfriNova</h3>
              <p className="text-xs text-slate-500">Complétez le formulaire ci-dessous pour lancer votre espace de vente.</p>
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
      {/* MODAL 2: SE CONNECTER À UNE BOUTIQUE                      */}
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
                      className="w-full text-left p-3.5 rounded-2xl border border-slate-100 hover:border-[#16A34A] hover:bg-emerald-50/20 flex items-center justify-between transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#16A34A] text-white rounded-xl flex items-center justify-center font-black text-sm">
                          {m.logo}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-950 text-xs">{m.shopName}</p>
                          <p className="text-[10px] text-slate-500">{m.location} • {m.name}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#16A34A] group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyPasswordAndLogin} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 bg-[#16A34A] text-white rounded-xl flex items-center justify-center font-black text-base">
                    {pendingLoginMerchant.logo}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">{pendingLoginMerchant.shopName}</p>
                    <p className="text-xs text-slate-500">{pendingLoginMerchant.name} • {pendingLoginMerchant.location}</p>
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
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
                    className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer text-center shadow-sm"
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
      {/* MODAL 3: AJOUT DE PRODUIT                                 */}
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
      {/* MODAL 4: UPGRADE MEMBRE VIP PREMIUM                       */}
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

      {/* ========================================================= */}
      {/* MODAL 5: SCANNER & CODE QR BOUTIQUE                        */}
      {/* ========================================================= */}
      {showQrModal && activeMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="bg-purple-100 text-[#7C3AED] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                QR Code Vendeur Certifié
              </span>
              <h3 className="font-extrabold text-slate-900 text-xl">{activeMerchant.shopName}</h3>
              <p className="text-xs text-slate-500">Pour paiements rapides et validation de retrait en boutique</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex flex-col items-center justify-center relative group">
                {/* Visual QR Code Representation */}
                <div className="w-full h-full bg-gradient-to-br from-[#16A34A] to-[#7C3AED] p-3 rounded-xl flex flex-col items-center justify-center text-white font-mono font-black text-center text-xs space-y-1">
                  <QrCode className="w-20 h-20 text-white animate-pulse" />
                  <span className="text-[10px] tracking-wider uppercase font-bold bg-black/20 px-2 py-0.5 rounded">AFRINOVA-{activeMerchant.id}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold">
                Présentez ce QR code au client pour recevoir son paiement Mobile Money direct.
              </p>
            </div>

            <button
              onClick={() => {
                alert('✓ Caméra activée ! QR Code du client scanné avec succès : Commande #CMD-1082 validée !');
                setShowQrModal(false);
              }}
              className="w-full bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white font-black text-xs py-3.5 rounded-2xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Scanner le QR Code d'un Client</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: PARTAGER LA BOUTIQUE                              */}
      {/* ========================================================= */}
      {showShareModal && activeMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="bg-emerald-100 text-[#16A34A] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                Partager la Vitrine
              </span>
              <h3 className="font-extrabold text-slate-900 text-xl">{activeMerchant.shopName}</h3>
              <p className="text-xs text-slate-500">Diffusez votre lien unique à vos clients sur WhatsApp et réseaux sociaux.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lien direct de la boutique</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://afrinova.cm/shop/${activeMerchant.id}`}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`https://afrinova.cm/shop/${activeMerchant.id}`);
                      alert('✓ Lien de la boutique copié dans le presse-papier !');
                    }}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0"
                  >
                    Copier
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Découvrez la boutique ${activeMerchant.shopName} sur AfriNova Bafoussam : https://afrinova.cm/shop/${activeMerchant.id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Partager WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    alert('Partage Facebook prêt !');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partager Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: MODIFIER LA BOUTIQUE                              */}
      {/* ========================================================= */}
      {showEditShopModal && activeMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditShopModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">Modifier le Profil de la Boutique</h3>
              <p className="text-xs text-slate-500">Mettez à jour les coordonnées visibles par vos clients.</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              alert('✓ Profil de la boutique mis à jour avec succès !');
              setShowEditShopModal(false);
            }} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nom de la boutique</label>
                <input type="text" defaultValue={activeMerchant.shopName} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nom du gérant</label>
                  <input type="text" defaultValue={activeMerchant.name} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Emplacement Bafoussam</label>
                  <input type="text" defaultValue={activeMerchant.location} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Téléphone Mobile Money</label>
                <input type="text" defaultValue={activeMerchant.phone} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditShopModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold rounded-xl shadow-sm cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: TICKET ASSISTANCE SUPPORT                         */}
      {/* ========================================================= */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative space-y-4">
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">Ouvrir un Ticket Assistance</h3>
              <p className="text-xs text-slate-500">Exposez votre demande à notre équipe basée à Bafoussam.</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              alert('✓ Votre ticket d’assistance a été transmis ! Un conseiller vous recontactera sous 15 minutes.');
              setShowSupportModal(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sujet de la demande</label>
                <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  <option>Problème de Paiement Mobile Money</option>
                  <option>Litige Commande ou Retrait</option>
                  <option>Questions sur la livraison coursier</option>
                  <option>Mise à niveau Abonnement VIP</option>
                  <option>Autre demande</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description détaillée</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Décrivez précisément votre problème ou question..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs py-3 rounded-xl transition shadow-sm cursor-pointer"
              >
                Envoyer ma demande
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PIED DE PAGE GENERAL - APPARAIT APRES TOUT LE CONTENU     */}
      {/* ========================================================= */}
      <div className="pt-10 border-t border-slate-200 mt-12">
        <AboutAfriNovaSection />
      </div>

    </div>
  );
}
