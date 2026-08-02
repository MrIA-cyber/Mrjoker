import React, { useState, useEffect } from 'react';
import { Merchant, Product, MarketingCampaign, Order, User, AccountType } from '../types';
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
import { ChatThread, subscribeToUserChats, sendChatMessage } from '../services/chatService';
import { MerchantStatsCache, getLocalMerchantStats, syncMerchantStatsToFirestore, subscribeMerchantStats } from '../services/merchantStatsService';
import ChatModal from './ChatModal';

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

  // Dashboard Tab state (All Quick Action sections)
  const [dashboardTab, setDashboardTab] = useState<
    'overview' | 'products' | 'categories' | 'stock' | 'orders' | 'payments' | 
    'deliveries' | 'promotions' | 'coupons' | 'messages' | 'reviews' | 
    'stats' | 'invoices' | 'calendar' | 'support' | 'profile'
  >('overview');

  // Interactive UI Dropdowns & Chart Period State
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'today' | '7days' | 'month' | 'year'>('month');

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
  const [activeProfileRoleTab, setActiveProfileRoleTab] = useState<AccountType>(() => (currentUser?.accountType || 'vendeur') as AccountType);

  // Realtime Firestore Chats
  const [realtimeChats, setRealtimeChats] = useState<ChatThread[]>([]);
  const [activeChatThread, setActiveChatThread] = useState<ChatThread | null>(null);

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
    sales: 0,
  };

  const activeMerchant = merchants.find(m => m.id === activeMerchantId) || merchants[0] || fallbackMerchant;

  useEffect(() => {
    const merchantIdToQuery = activeMerchant?.id || 'm1';
    const unsubscribe = subscribeToUserChats(merchantIdToQuery, 'vendeur', (threads) => {
      setRealtimeChats(threads);
    });
    return () => unsubscribe();
  }, [activeMerchant?.id]);

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

  // Cached Stats State (Local Storage + Firestore sync)
  const [cachedStats, setCachedStats] = useState<MerchantStatsCache | null>(() => {
    const merchantId = activeMerchantId || 'm1';
    return getLocalMerchantStats(merchantId);
  });

  // Subscribe to merchant_stats Firestore document
  useEffect(() => {
    const merchantId = activeMerchant?.id || activeMerchantId || 'm1';
    const unsubscribe = subscribeMerchantStats(merchantId, (stats) => {
      setCachedStats(stats);
    });
    return () => unsubscribe();
  }, [activeMerchant?.id, activeMerchantId]);

  // Sync fresh calculated metrics to Firestore & Local Storage
  useEffect(() => {
    const merchantId = activeMerchant?.id || activeMerchantId || 'm1';
    const computedStats: MerchantStatsCache = {
      merchantId,
      todaySalesTotal,
      monthlySalesTotal,
      totalRevenue: Math.round(monthlySalesTotal * 3.2),
      pendingOrdersCount,
      completedOrdersCount: kpiDeliveredOrders,
      totalStockCount,
      kpiOnlineProducts,
      kpiOutOfStockProducts,
      storefrontViews,
      storefrontClicks,
      averageRating,
      lastUpdated: new Date().toISOString()
    };

    setCachedStats(computedStats);
    syncMerchantStatsToFirestore(computedStats);
  }, [
    activeMerchant?.id,
    merchantProducts.length,
    merchantOrders.length,
    todaySalesTotal,
    monthlySalesTotal,
    totalStockCount,
    kpiOnlineProducts,
    kpiOutOfStockProducts,
    pendingOrdersCount,
    kpiDeliveredOrders
  ]);

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
        {/* HEADER: STORE IDENTITY & SINGLE MAIN STATUS               */}
        {/* --------------------------------------------------------- */}
        <div className="bg-white/98 backdrop-blur-md text-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#7C3AED]"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Logo, Store Details & Single Main Status Badge */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#16A34A] to-[#7C3AED] text-white rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-sm border border-emerald-300/40">
                  {activeMerchant?.logo || 'MB'}
                </div>
                {activeMerchant?.shopPhoto && (
                  <img
                    src={activeMerchant.shopPhoto}
                    alt={activeMerchant.shopName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover absolute inset-0 border-2 border-white shadow-sm"
                  />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-100 text-[#16A34A] border border-emerald-300/80 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Store className="w-3 h-3 text-[#16A34A]" /> Seller Center
                  </span>
                  <h1 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
                    {activeMerchant?.shopName || 'Boutique Royale Bafoussam'}
                  </h1>
                  <VerifiedBadge size="sm" />

                  {/* Single Main Shop Status Toggle */}
                  <div className="relative inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 ml-1">
                    <button
                      onClick={() => setShopStatus('open')}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                        shopStatus === 'open' ? 'bg-[#16A34A] text-white shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      Ouverte
                    </button>
                    <button
                      onClick={() => setShopStatus('paused')}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                        shopStatus === 'paused' ? 'bg-amber-500 text-slate-950 shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      En pause
                    </button>
                    <button
                      onClick={() => setShopStatus('closed')}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                        shopStatus === 'closed' ? 'bg-rose-600 text-white shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Fermée
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-[#16A34A]" /> {activeMerchant?.name}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" /> {activeMerchant?.location}
                  </span>
                  <span>•</span>
                  <span className="font-mono font-bold text-slate-600">
                    {activeMerchant?.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Header Primary Actions & Menu Plus */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#166534] text-white font-black text-xs py-2 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98 min-h-[40px]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Nouveau produit</span>
              </button>

              <button
                onClick={() => setDashboardTab('reviews')}
                className="bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 font-extrabold text-xs py-2 px-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer min-h-[40px]"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Avis ({reviews.length})</span>
              </button>

              {onSwitchToClientSpace && (
                <button
                  onClick={onSwitchToClientSpace}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2 px-3 rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Vitrine</span>
                </button>
              )}

              {/* Secondary Actions Menu "Plus" Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 font-extrabold text-xs py-2 px-3 rounded-xl transition flex items-center gap-1 cursor-pointer min-h-[40px]"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Plus ▾</span>
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-xs">
                    <button
                      onClick={() => { setShowQrModal(true); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-[#7C3AED]" /> Scanner Code QR
                    </button>
                    <button
                      onClick={() => { setShowShareModal(true); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-emerald-600" /> Partager la boutique
                    </button>
                    <button
                      onClick={() => { setShowUpgradeModal(true); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" /> Abonnement VIP Pro
                    </button>
                    <button
                      onClick={() => { setDashboardTab('profile'); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-600" /> Paramètres boutique
                    </button>
                    <button
                      onClick={() => { setShowSupportModal(true); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Headphones className="w-4 h-4 text-blue-600" /> Assistance 24/7
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => { setActiveMerchantId(null); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-700 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* MAIN NAVIGATION TAB BAR (UNIFIED STYLING)                 */}
        {/* --------------------------------------------------------- */}
        <div className="bg-white/98 backdrop-blur-md rounded-2xl p-2 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-max">
            
            {/* Vue Générale */}
            <button
              onClick={() => setDashboardTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                dashboardTab === 'overview'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" /> Vue Générale
            </button>

            {/* Produits */}
            <button
              onClick={() => setDashboardTab('products')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                dashboardTab === 'products'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Produits ({merchantProducts.length})
            </button>

            {/* Commandes */}
            <button
              onClick={() => setDashboardTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 relative ${
                dashboardTab === 'orders'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <PackageCheck className="w-4 h-4" /> Commandes
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* Finances */}
            <button
              onClick={() => setDashboardTab('payments')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                dashboardTab === 'payments'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-4 h-4" /> Finances & Retraits
            </button>

            {/* Avis & Messages */}
            <button
              onClick={() => setDashboardTab('messages')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                dashboardTab === 'messages' || dashboardTab === 'reviews'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Avis & Client
            </button>

            {/* Statistiques */}
            <button
              onClick={() => setDashboardTab('stats')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                dashboardTab === 'stats'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <LineChart className="w-4 h-4" /> Statistiques
            </button>

          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* OVERVIEW TAB (REDEFINED ESSENTIALS & ADVANCED WIDGETS)    */}
        {/* --------------------------------------------------------- */}
        {dashboardTab === 'overview' && (
          <div className="space-y-6">

            {/* 1. ESSENTIAL 6 STATS CARDS & "VOIR TOUTES LES STATISTIQUES" */}
            <div className="bg-white/98 rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#16A34A]" /> Indicateurs Clés de Vente
                </h3>
                
                {/* Button: Voir toutes les statistiques */}
                <button
                  onClick={() => setDashboardTab('stats')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] border border-emerald-200/80 font-black text-xs py-1.5 px-3 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Voir toutes les statistiques</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Firestore & Local Cache Fast-Load Status Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-3 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-md">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5 font-black flex-wrap">
                      <span className="text-emerald-400">⚡ Mode Instant-Load Actif</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                        Cache Firestore Local (0ms)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Vos indicateurs clés sont restaurés instantanément depuis le cache local et synchronisés en arrière-plan via Firestore.
                    </p>
                  </div>
                </div>

                {cachedStats?.lastUpdated && (
                  <div className="text-[10px] font-mono font-bold text-emerald-300 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Synchro: {new Date(cachedStats.lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                )}
              </div>

              {/* 6 Essential Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                
                {/* 1. CA (Revenue) */}
                <div onClick={() => setDashboardTab('payments')} className="afrinova-card p-3.5 transition cursor-pointer hover:border-emerald-300">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Chiffre d'Affaires</span>
                  <span className="text-base font-black text-[#0F172A] block mt-1">{(monthlySalesTotal).toLocaleString('fr-FR')} F</span>
                  <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">↑ +14.2% ce mois</span>
                </div>

                {/* 2. Commandes */}
                <div onClick={() => setDashboardTab('orders')} className="afrinova-card p-3.5 transition cursor-pointer hover:border-purple-300">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Commandes</span>
                  <span className="text-base font-black text-[#0F172A] block mt-1">{merchantOrders.length + 152}</span>
                  <span className="text-[10px] font-bold text-[#7C3AED] block mt-0.5">{pendingOrdersCount} en attente</span>
                </div>

                {/* 3. Produits */}
                <div onClick={() => setDashboardTab('products')} className="afrinova-card p-3.5 transition cursor-pointer hover:border-emerald-300">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Produits Actifs</span>
                  <span className="text-base font-black text-[#0F172A] block mt-1">{merchantProducts.length}</span>
                  <span className="text-[10px] font-bold text-amber-700 block mt-0.5">{lowStockProducts.length} stock faible</span>
                </div>

                {/* 4. Clients */}
                <div onClick={() => setDashboardTab('stats')} className="afrinova-card p-3.5 transition cursor-pointer hover:border-slate-300">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Clients Fidèles</span>
                  <span className="text-base font-black text-[#0F172A] block mt-1">{kpiNewCustomers}</span>
                  <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">82% satisfaction</span>
                </div>

                {/* 5. Note Vendeur */}
                <div onClick={() => setDashboardTab('reviews')} className="afrinova-card p-3.5 transition cursor-pointer hover:border-amber-300">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Note Boutique</span>
                  <span className="text-base font-black text-[#0F172A] block mt-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {averageRating}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 block mt-0.5">({reviews.length} avis certifiés)</span>
                </div>

                {/* 6. Visiteurs */}
                <div onClick={() => setDashboardTab('stats')} className="afrinova-card p-3.5 transition cursor-pointer hover:border-purple-300">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Visiteurs Vues</span>
                  <span className="text-base font-black text-[#0F172A] block mt-1">{storefrontViews}</span>
                  <span className="text-[10px] font-bold text-[#7C3AED] block mt-0.5">{kpiConversionRate}% conversion</span>
                </div>

              </div>
            </div>

            {/* 2. FINANCIAL BALANCE, MONTHLY GOAL & ASSISTANT IA VENDEUR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Solde Disponible & Retrait MoMo */}
              <div className="afrinova-card p-5 space-y-3 bg-gradient-to-br from-emerald-500 to-[#15803D] text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                    <CreditCard className="w-4 h-4" /> Solde Disponible
                  </span>
                  <span className="bg-emerald-400/30 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300/40">
                    SÉCURISÉ
                  </span>
                </div>

                <div>
                  <span className="text-2xl font-black block">385 000 FCFA</span>
                  <p className="text-[11px] text-emerald-100/90 mt-0.5">Disponible pour virement Mobile Money immédiat.</p>
                </div>

                <button
                  onClick={() => setDashboardTab('payments')}
                  className="w-full bg-white text-[#15803D] hover:bg-emerald-50 font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <DollarSign className="w-4 h-4 text-[#15803D]" /> Demander un Retrait MoMo / OM
                </button>
              </div>

              {/* Objectif Mensuel (Goal) */}
              <div className="afrinova-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Award className="w-4 h-4 text-[#7C3AED]" /> Objectif Mensuel
                  </span>
                  <span className="text-xs font-black text-[#7C3AED]">72.5%</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-800 mb-1.5">
                    <span>1 450 000 FCFA</span>
                    <span className="text-slate-400">Objectif: 2 000 000 F</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-gradient-to-r from-[#16A34A] to-[#7C3AED] rounded-full" style={{ width: '72.5%' }}></div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-semibold">
                  il vous reste <strong>550 000 FCFA</strong> à réaliser sous 11 jours pour valider le bonus partenaire AfriNova !
                </p>
              </div>

              {/* Assistant IA Vendeur (AfriNova AI) */}
              <div className="afrinova-card p-5 space-y-3 bg-purple-50/70 border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" /> Assistant IA Vendeur
                  </span>
                  <span className="bg-purple-200/80 text-[#7C3AED] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    RECOMMANDATION
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-purple-100 flex items-start gap-2 shadow-2xs">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-bold">Réapprovisionnement requis</strong>
                      <span className="text-[11px] text-slate-600">Le stock de <i>Piment Jaune de Penja</i> est inférieur à 5 unités.</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-purple-100 flex items-start gap-2 shadow-2xs">
                    <TrendingUp className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-bold">Heure de pointe détectée</strong>
                      <span className="text-[11px] text-slate-600">Forte demande à Tamdja Bafoussam entre 16h et 18h.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. INTERACTIVE PROFESSIONAL CHARTS */}
            <div className="afrinova-card p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-[#16A34A]" />
                  <span>Analyse Interactive des Ventes & Revenus</span>
                </h3>

                {/* Period Selector Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setChartPeriod('today')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      chartPeriod === 'today' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    onClick={() => setChartPeriod('7days')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      chartPeriod === '7days' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    7 jours
                  </button>
                  <button
                    onClick={() => setChartPeriod('month')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      chartPeriod === 'month' ? 'bg-[#16A34A] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ce mois-ci
                  </button>
                  <button
                    onClick={() => setChartPeriod('year')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      chartPeriod === 'year' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cette année
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Bar Chart */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Progression Hebdomadaire des Ventes (FCFA)</span>
                    <span className="text-[#16A34A] font-black">+28% vs mois précédent</span>
                  </div>

                  <div className="h-44 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 flex items-end justify-between gap-3">
                    {[
                      { label: 'Sem 1', val: 0, height: '4%' },
                      { label: 'Sem 2', val: 0, height: '4%' },
                      { label: 'Sem 3', val: 0, height: '4%' },
                      { label: 'Sem 4', val: 0, height: '4%' },
                      { label: 'En cours', val: activeMerchant.sales || 0, height: activeMerchant.sales > 0 ? '100%' : '4%', active: true },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <span className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono font-black text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-xs">
                          {(bar.val / 1000).toFixed(0)}k F
                        </span>
                        <div className="w-full bg-slate-200 rounded-xl h-28 flex items-end overflow-hidden p-0.5">
                          <div
                            className={`w-full rounded-lg transition-all duration-300 ${
                              bar.active
                                ? 'bg-gradient-to-t from-[#16A34A] to-[#7C3AED]'
                                : 'bg-emerald-500/80 hover:bg-emerald-600'
                            }`}
                            style={{ height: bar.height }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Répartition par Catégorie</span>
                  
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                        <span>Épices & Alimentaire</span>
                        <span>58%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '58%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                        <span>Boissons & Café Bio</span>
                        <span>26%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: '26%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                        <span>Fruits & Légumes Frais</span>
                        <span>16%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '16%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 4. KEY OPERATIONAL MODULES (GRID OF REQUIRED SECTIONS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* SECTION: STOCK FAIBLE (LOW STOCK ALERTS) */}
              <div className="afrinova-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Alerte Stock Faible</span>
                  </h3>
                  <button
                    onClick={() => setDashboardTab('stock')}
                    className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
                  >
                    Gérer tout le stock →
                  </button>
                </div>

                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-medium">
                    ✓ Tous les produits ont un niveau de stock suffisant.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {lowStockProducts.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-rose-50/50 rounded-2xl border border-rose-200/70 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{p.name}</h4>
                            <span className="text-[10px] text-rose-700 font-bold block">
                              Reste : {productStocks[p.id] ?? p.stock} unité(s)
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStockChange(p.id, 5)}
                          className="bg-[#16A34A] hover:bg-[#15803D] text-white px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer shadow-3xs shrink-0"
                        >
                          +5 Réapprov.
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: LIVRAISONS EN COURS (ONGOING DELIVERIES) */}
              <div className="afrinova-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#7C3AED]" />
                    <span>Livraisons en Cours à Bafoussam</span>
                  </h3>
                  <button
                    onClick={() => setDashboardTab('deliveries')}
                    className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
                  >
                    Suivi GPS →
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-slate-900 block">Coursier Moto #14 • Tamdja</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Client: Mme Kengne • Cmd #104</span>
                    </div>
                    <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                      En route
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-slate-900 block">Point de Retrait • Marché A</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Client: M. Talla • Cmd #103</span>
                    </div>
                    <span className="bg-purple-100 text-purple-900 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                      Prêt au Stand
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: PRODUITS LES PLUS VENDUS (TOP SELLERS) */}
              <div className="afrinova-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#16A34A]" />
                    <span>Produits les Plus Vendus</span>
                  </h3>
                  <button
                    onClick={() => setDashboardTab('products')}
                    className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
                  >
                    Catalogue complet →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {topProducts.slice(0, 3).map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#16A34A] font-black text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{p.name}</h4>
                          <span className="text-[10px] text-slate-500 font-semibold block">{p.price.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onBoostProduct && onBoostProduct(p.id)}
                        className="bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 px-3 py-1 rounded-xl text-[10px] font-black cursor-pointer shrink-0"
                      >
                        ⚡ Booster
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: CARTE / ZONES DES COMMANDES (ORDER DISTRIBUTION MAP) */}
              <div className="afrinova-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#7C3AED]" />
                    <span>Zones des Commandes à Bafoussam</span>
                  </h3>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Cartographie</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Marché A & Centre-Ville</span>
                      <span>38% (58 cmds)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '38%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Tamdja & Carrefour Bamiléké</span>
                      <span>28% (43 cmds)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Bamendzi & Tougang</span>
                      <span>18% (27 cmds)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 5. DERNIERS AVIS CLIENTS & RÉPONSES RAPIDES */}
            <div className="afrinova-card p-6 space-y-4">
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
                        <span className="bg-emerald-100 text-[#16A34A] text-[9px] font-black px-2 py-0.2 rounded-full">Client Vérifié</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">"{rev.comment}"</p>
                    <p className="text-[10px] text-slate-400">Article : <strong>{rev.productName}</strong> • {rev.date}</p>

                    {rev.reply ? (
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/70 text-xs text-emerald-900 mt-2">
                        <strong className="block text-[10px] uppercase text-[#16A34A] font-black">Votre Réponse :</strong>
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
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-lg">Messagerie Vendeur en Temps Réel</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Firestore
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Discutez instantanément avec les acheteurs et négociez en direct.</p>
                </div>
              </div>

              {realtimeChats.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto font-black">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Aucune discussion en cours</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Dès qu'un client vous contacte depuis la fiche produit ou la marketplace, sa conversation s'affichera ici en temps réel.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {realtimeChats.map((chat) => (
                    <div 
                      key={chat.id} 
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        chat.unreadCountMerchant > 0
                          ? 'bg-emerald-50/90 border-emerald-300 shadow-sm'
                          : 'bg-slate-50/80 border-slate-200/90 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900">{chat.clientName}</h4>
                            {chat.unreadCountMerchant > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500 text-white animate-pulse">
                                {chat.unreadCountMerchant} nouveau{chat.unreadCountMerchant > 1 ? 'x' : ''}
                              </span>
                            )}
                          </div>

                          {chat.productName && (
                            <p className="text-[11px] font-bold text-emerald-700 truncate mt-0.5">
                              🛍️ Produit : {chat.productName}
                            </p>
                          )}

                          <p className="text-xs text-slate-600 truncate mt-1">
                            "{chat.lastMessage}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(chat.updatedAt || chat.lastMessageTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => setActiveChatThread(chat)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Ouvrir Chat Direct</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Modal for Merchant */}
              {activeChatThread && (
                <ChatModal
                  isOpen={Boolean(activeChatThread)}
                  onClose={() => setActiveChatThread(null)}
                  chatId={activeChatThread.id}
                  currentUserId={activeMerchant?.id || 'm1'}
                  currentUserName={activeMerchant?.shopName || activeMerchant?.name || 'Vendeur Bafoussam'}
                  currentUserRole="vendeur"
                  recipientName={activeChatThread.clientName}
                  productName={activeChatThread.productName}
                />
              )}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Promotions & Codes Promo Vendeur</h3>
                  <p className="text-xs text-slate-500">Boostez vos ventes avec des remises spéciales et coupons de réduction.</p>
                </div>
              </div>

              {/* Form to Create New Promo Code */}
              <form onSubmit={handleCreatePromoCode} className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Ex: PROMO2026"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                />
                <select
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(e.target.value)}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                >
                  <option value="5%">Remise 5%</option>
                  <option value="10%">Remise 10%</option>
                  <option value="15%">Remise 15%</option>
                  <option value="20%">Remise 20%</option>
                </select>
                <button
                  type="submit"
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition shadow-2xs shrink-0"
                >
                  Créer le Code Promo
                </button>
              </form>

              {/* Active Custom Promo Codes */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Vos Codes Promos Personnalisés</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {promoCodes.map((pc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Tag className="w-4 h-4 text-[#16A34A]" />
                        <strong className="font-black text-slate-900 font-mono">{pc.code}</strong>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">{pc.discount}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{pc.uses} utilisations</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preset Campaign Cards */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Campagnes d'Ensemble Suggérées</h4>
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
                  <tbody className="divide-y divide-slate-100 font-semibold text-center">
                    <tr>
                      <td colSpan={6} className="p-4 text-xs text-slate-500">
                        Aucun reçu de facture pour le moment. Vos factures de commission s'afficheront ici lors de vos premières ventes.
                      </td>
                    </tr>
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
            <div className="space-y-6">
              {/* Header & Role Inspector Navigation */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 border border-emerald-200">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Espace Profils & Accréditations AfriNova</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-lg sm:text-xl font-display">
                      Audit & Gestion des 7 Profils Utilisateurs
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Inspectez et configurez les droits, avantages et abonnements pour chaque type de compte.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-600">Rôle Actif :</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs rounded-full uppercase">
                      {currentUser?.accountType?.toUpperCase() || 'VENDEUR'}
                    </span>
                  </div>
                </div>

                {/* 7 Profile Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                  {[
                    { id: 'client' as AccountType, label: 'Client', emoji: '👤', badge: '5j Essai' },
                    { id: 'vendeur' as AccountType, label: 'Vendeur', emoji: '🛒', badge: 'Boutique' },
                    { id: 'entreprise' as AccountType, label: 'Entreprise', emoji: '🏢', badge: 'Pro & B2B' },
                    { id: 'prestataire' as AccountType, label: 'Prestataire', emoji: '🔧', badge: 'Services' },
                    { id: 'livreur' as AccountType, label: 'Livreur', emoji: '🚚', badge: 'Express' },
                    { id: 'trader' as AccountType, label: 'Trader', emoji: '📈', badge: 'Bourse' },
                    { id: 'admin' as AccountType, label: 'Admin', emoji: '🛡️', badge: 'Système' },
                  ].map((role) => {
                    const isActive = activeProfileRoleTab === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setActiveProfileRoleTab(role.id)}
                        className={`p-2.5 rounded-2xl border transition text-left flex flex-col justify-between cursor-pointer ${
                          isActive
                            ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-md shadow-emerald-600/20'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-lg">{role.emoji}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {role.badge}
                          </span>
                        </div>
                        <span className="text-xs font-black truncate">{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Content for Selected Profile */}
              {(() => {
                // Detailed Metadata per Role
                const profileMeta: Record<AccountType, {
                  title: string;
                  badgeTitle: string;
                  badgeColor: string;
                  emoji: string;
                  priceMonthly: string;
                  priceYearly: string;
                  trialText: string;
                  benefits: string[];
                  actions: { label: string; icon: any; action?: () => void }[];
                  permissions: string[];
                }> = {
                  client: {
                    title: 'Profil Client / Acheteur',
                    badgeTitle: 'Acheteur Particulier',
                    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    emoji: '👤',
                    priceMonthly: '3 000 FCFA / mois',
                    priceYearly: '30 000 FCFA / an',
                    trialText: "5 jours d'essai gratuit offert",
                    benefits: [
                      'Accès complet au marché national & régional',
                      'Suivi en direct des livraisons de repas & colis',
                      'Paiements sécurisés MoMo, Orange Money & CB',
                      'Historique complet des factures & reçus imprimables',
                      'Messagerie directe avec les commerçants de la ville',
                      'Notations & avis certifiés sur les produits'
                    ],
                    actions: [
                      { label: 'Accéder à l\'Espace Client', icon: ShoppingBag, action: onSwitchToClientSpace },
                      { label: 'Gérer mes Adresses de Livraison', icon: MapPin },
                      { label: 'Historique des Commandes', icon: FileText }
                    ],
                    permissions: ['Achats grand public', 'Réservation de services', 'Messagerie commerçant', 'Factures personnelles']
                  },
                  vendeur: {
                    title: 'Profil Vendeur / Commerçant',
                    badgeTitle: 'Boutique VIP Premium',
                    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                    emoji: '🛒',
                    priceMonthly: '5 000 FCFA / mois',
                    priceYearly: '50 000 FCFA / an',
                    trialText: "10 jours d'essai gratuit offert",
                    benefits: [
                      'Boutique virtuelle personnalisée avec vitrine 24h/7j',
                      'Ajout illimité de produits avec médias & vidéos HD',
                      'Gestion automatisée des stocks & notifications de commandes',
                      'Paiements directs sur solde MTN MoMo / Orange Money',
                      'Création de codes promotionnels & ventes flash',
                      'Badge Boutique Vérifiée & QR Code de paiement'
                    ],
                    actions: [
                      { label: 'Ajouter un Produit', icon: Plus, action: () => setShowAddProductModal(true) },
                      { label: 'Gérer les Promotions', icon: Tag, action: () => setDashboardTab('promotions') },
                      { label: 'Gérer les Commandes', icon: ShoppingBag, action: () => setDashboardTab('orders') }
                    ],
                    permissions: ['Publication de produits', 'Gestion de stock', 'Encaissement MoMo/Orange', 'Création de coupons']
                  },
                  entreprise: {
                    title: 'Profil Entreprise / PME & B2B',
                    badgeTitle: 'Pro & B2B Certifiée',
                    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
                    emoji: '🏢',
                    priceMonthly: '15 000 FCFA / mois',
                    priceYearly: '150 000 FCFA / an',
                    trialText: "10 jours d'essai gratuit offert",
                    benefits: [
                      'Page Entreprise certifiée avec visibilité prioritaire B2B',
                      'Tableau de bord multi-collaborateurs avec gestion d\'accès',
                      'Publication d\'offres B2B, demandes de devis & appels d\'offres',
                      'Génération automatisée de rapports d\'activité PDF',
                      'Campagnes de promotions multi-canaux',
                      'Support client & assistance prioritaire 24h/7j'
                    ],
                    actions: [
                      { label: 'Statistiques & Rapport PDF', icon: BarChart3, action: () => setDashboardTab('stats') },
                      { label: 'Réseau B2B & Partenaires', icon: Users },
                      { label: 'Gestion d\'Équipe', icon: ShieldCheck }
                    ],
                    permissions: ['Publication offres B2B', 'Rapports statistiques PDF', 'Rôles multi-utilisateurs', 'Support prioritaire 24/7']
                  },
                  prestataire: {
                    title: 'Profil Prestataire de Service',
                    badgeTitle: 'Services 24/7 Agréés',
                    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
                    emoji: '🔧',
                    priceMonthly: '7 500 FCFA / mois',
                    priceYearly: '75 000 FCFA / an',
                    trialText: "10 jours d'essai gratuit offert",
                    benefits: [
                      'Vitrine professionnelle dédiée à vos compétences',
                      'Mise en relation directe avec les clients de la ville',
                      'Calendrier de disponibilité interactif & réservations',
                      'Devis en ligne & messagerie de négociation',
                      'Paiement garanti après validation de la prestation',
                      'Badge Prestataire Certifié AfriNova'
                    ],
                    actions: [
                      { label: 'Ajuster le Calendrier', icon: Calendar, action: () => setDashboardTab('calendar') },
                      { label: 'Messages & Devis', icon: MessageSquare, action: () => setDashboardTab('messages') },
                      { label: 'Mettre à jour mes Tarifs', icon: Settings }
                    ],
                    permissions: ['Vitrine de services', 'Messagerie devis', 'Calendrier réservations', 'Paiement sous séquestre']
                  },
                  livreur: {
                    title: 'Profil Livreur / Coursier Express',
                    badgeTitle: 'Transporteur Agréé',
                    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
                    emoji: '🚚',
                    priceMonthly: '6 000 FCFA / mois',
                    priceYearly: '60 000 FCFA / an',
                    trialText: "10 jours d'essai gratuit offert",
                    benefits: [
                      'Attribution automatique des courses géolocalisées',
                      'GPS Bafoussam optimisé par quartier et point de repère',
                      'Retrait instantané des revenus de livraison sur MoMo',
                      'Historique détaillé des courses & kilomètres parcourus',
                      'Badge Coursier Certifié AfriNova Express'
                    ],
                    actions: [
                      { label: 'Accéder aux Livraisons', icon: Truck, action: () => setDashboardTab('deliveries') },
                      { label: 'Retirer mes Gains MoMo', icon: DollarSign, action: () => setDashboardTab('payments') },
                      { label: 'Historique des Courses', icon: FileText }
                    ],
                    permissions: ['Dispatching de courses GPS', 'Retrait solde instantané', 'Passage En Ligne/Hors Ligne', 'Attestation de transporteur']
                  },
                  trader: {
                    title: 'Profil Trader / Opportunités & Bourse',
                    badgeTitle: 'Trader Vérifié AfriTrade',
                    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
                    emoji: '📈',
                    priceMonthly: '12 000 FCFA / mois',
                    priceYearly: '120 000 FCFA / an',
                    trialText: "10 jours d'essai gratuit offert",
                    benefits: [
                      'Accès au flux de cotations en temps réel sur les matières premières',
                      'Tableau de bord d\'opportunités d\'affaires P2P',
                      'Sécurisation des transactions par compte séquestre AfriNova',
                      'Signaux de marché & alertes automatiques de prix',
                      'Statistiques d\'évolution des cours et rapports de rentabilité'
                    ],
                    actions: [
                      { label: 'Consulter les Cotations', icon: TrendingUp },
                      { label: 'Ordres d\'Achat / Vente P2P', icon: Layers },
                      { label: 'Rapports Financiers', icon: PieChart }
                    ],
                    permissions: ['Flux boursier temps réel', 'Transactions P2P séquestre', 'Publication de signaux', 'Historique financier']
                  },
                  admin: {
                    title: 'Profil Administrateur / Super Admin',
                    badgeTitle: 'Système & Modération',
                    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
                    emoji: '🛡️',
                    priceMonthly: 'Accès Illimité (0 FCFA)',
                    priceYearly: 'Accès Illimité (0 FCFA)',
                    trialText: "Compte Administrateur Permanent",
                    benefits: [
                      'Panneau de contrôle global et accès aux logs d\'audit de sécurité',
                      'Validation des identités CNI, attestations et boutiques',
                      'Gestion des grilles tarifaires et formules d\'abonnement',
                      'Modération des litiges, remboursements et commissions MoMo',
                      'Configuration globale des paramètres système AfriNova'
                    ],
                    actions: [
                      { label: 'Ouvrir Panneau d\'Admin', icon: ShieldCheck },
                      { label: 'Journal des Logs d\'Audit', icon: FileSpreadsheet },
                      { label: 'Valider les Boutiques', icon: UserCheck }
                    ],
                    permissions: ['Accès système total', 'Modération utilisateurs', 'Approbation CNI', 'Gestion abonnements & tarifs']
                  }
                };

                const currentMeta = profileMeta[activeProfileRoleTab];

                return (
                  <div className="space-y-6">
                    {/* Top Overview Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Header Card */}
                      <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl shadow-lg shrink-0">
                              {currentMeta.emoji}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-black text-slate-900 text-base sm:text-lg font-display">{currentMeta.title}</h4>
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${currentMeta.badgeColor}`}>
                                  {currentMeta.badgeTitle}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{activeMerchant?.location || 'Bafoussam, Cameroun'}</span>
                              </p>
                            </div>
                          </div>

                          <VerifiedBadge isVerified={activeMerchant?.isVerified ?? true} role={activeProfileRoleTab} />
                        </div>

                        {/* Subscription & Trial Box */}
                        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <div>
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Formule d'Abonnement Actuelle</span>
                              <h5 className="font-black text-white text-sm sm:text-base">{currentMeta.badgeTitle}</h5>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-xs font-black text-emerald-400 block">{currentMeta.priceMonthly}</span>
                              <span className="text-[10px] text-slate-400">{currentMeta.priceYearly}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                              <Clock className="w-4 h-4 text-emerald-400" />
                              <span>{currentMeta.trialText}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowUpgradeModal(true)}
                              className="px-4 py-2 bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#166534] text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer self-start sm:self-auto"
                            >
                              Gérer mon Abonnement
                            </button>
                          </div>
                        </div>

                        {/* Role Quick Action Shortcuts */}
                        <div>
                          <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Actions Rapides du Profil</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {currentMeta.actions.map((act, i) => {
                              const ActionIcon = act.icon;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={act.action}
                                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 flex items-center justify-between cursor-pointer transition"
                                >
                                  <span className="truncate">{act.label}</span>
                                  <ActionIcon className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* Right Column: Benefits & RBAC */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
                        <div>
                          <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-emerald-600" />
                            <span>Avantages du Profil</span>
                          </h4>
                          <div className="space-y-2.5 text-xs">
                            {currentMeta.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="font-medium leading-tight">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            <span>Permissions Accordées (RBAC)</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {currentMeta.permissions.map((perm, pIdx) => (
                              <span key={pIdx} className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                                ✓ {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Editable Information Form */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="font-black text-slate-900 text-base sm:text-lg font-display">
                            Mise à jour des Coordonnées
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Ces informations seront affichées publiquement et utilisées pour vos factures d'abonnement.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            {activeProfileRoleTab === 'entreprise' ? 'Raison Sociale / Nom Entreprise' : activeProfileRoleTab === 'vendeur' ? 'Nom de la Boutique' : 'Nom Complet'}
                          </label>
                          <input
                            type="text"
                            defaultValue={activeMerchant?.shopName || currentUser?.name || 'Nom complet'}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nom du Responsable / Gérant</label>
                          <input
                            type="text"
                            defaultValue={activeMerchant?.name || currentUser?.name || 'Gérant'}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Téléphone Mobile Money (MTN / Orange)</label>
                          <input
                            type="text"
                            defaultValue={activeMerchant?.phone || currentUser?.phone || '+237 677 89 45 12'}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Adresse E-mail</label>
                          <input
                            type="email"
                            defaultValue={activeMerchant?.email || currentUser?.email || 'user@afrinova.cm'}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Emplacement / Quartier</label>
                          <input
                            type="text"
                            defaultValue={activeMerchant?.location || 'Marché A, Stand 14, Bafoussam, Cameroun'}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileSuccess(true);
                            setTimeout(() => setProfileSuccess(false), 3000);
                          }}
                          className="w-full sm:w-auto bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs py-3 px-6 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Sauvegarder les Modifications</span>
                        </button>

                        {profileSuccess && (
                          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold animate-fade-in flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Informations du profil enregistrées avec succès !</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
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
