import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Truck, 
  Users, 
  MessageSquare, 
  Tag, 
  Percent, 
  BarChart3, 
  DollarSign, 
  ArrowUpRight, 
  Star, 
  ShieldCheck, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Check, 
  X, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  Clock, 
  Sparkles, 
  Send, 
  PhoneCall, 
  FileText,
  ChevronRight,
  Layers,
  MapPin,
  RefreshCw,
  Bell,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Shield,
  Briefcase
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';
import AboutAfriNovaSection from '../AboutAfriNovaSection';
import { AfriNovaLogo } from '../AfriNovaLogo';

interface VendeurHomePageProps {
  currentUser: User | null;
  products: Product[];
  merchants: Merchant[];
  orders: Order[];
  onOpenAddModal: () => void;
  onNavigateView?: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  onSelectProduct?: (product: Product) => void;
  onLogout?: () => void;
}

export default function VendeurHomePage({
  currentUser,
  products,
  merchants,
  orders: initialOrders,
  onOpenAddModal,
  onNavigateView,
  onSelectProduct,
  onLogout
}: VendeurHomePageProps) {
  // Navigation active tab for Boutique Dashboard
  const [activeTab, setActiveTab] = useState<
    'accueil' | 'produits' | 'stocks' | 'categories' | 'commandes_recues' | 'commandes_encours' | 
    'livraisons' | 'clients' | 'messages' | 'promotions' | 'coupons' | 'stats' | 
    'revenus' | 'retraits' | 'paiements' | 'abonnement' | 'avis' | 'profil' | 'horaires' | 'informations' | 'support'
  >('accueil');

  // Filter products for connected boutique
  const myMerchant: Merchant = merchants.find(m => 
    (currentUser?.id && m.id === currentUser.id) ||
    (currentUser?.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser?.phone && m.phone && m.phone === currentUser.phone)
  ) || {
    id: currentUser?.id || 'm-user',
    name: currentUser?.name ? `Boutique ${currentUser.name}` : 'Ma Boutique',
    shopName: currentUser?.name ? `Boutique ${currentUser.name}` : 'Ma Boutique',
    ownerName: currentUser?.name || 'Vendeur',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    category: 'Commerce Général',
    location: currentUser?.neighborhood || 'Bafoussam, Centre Ville',
    rating: 5.0,
    reviewCount: 0,
    description: 'Boutique en cours de configuration. Modifiez la description et ajoutez vos produits !',
    neighborhood: currentUser?.neighborhood || 'Bafoussam',
    logo: currentUser?.avatar || 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    isPremium: true,
    views: 100,
    clicks: 45,
    sales: 150000,
    salesCount: 10
  };

  const [localProducts, setLocalProducts] = useState<Product[]>(() => {
    // Return products that belong to this seller
    return products.filter(p => p.merchantId === myMerchant.id);
  });

  // Shop Categories state
  const [shopCategories, setShopCategories] = useState<string[]>([
    'Épices & Aromates',
    'Huiles & Produits Bio',
    'Artisanat Local Bafoussam',
    'Produits Vivriers',
    'Boissons & Jus Naturels'
  ]);
  const [newCatInput, setNewCatInput] = useState('');

  // Local Orders state for this seller
  const [localOrders, setLocalOrders] = useState<Order[]>(() => {
    return initialOrders.filter(o => 
      o.items.some(item => item.product.merchantId === myMerchant.id)
    );
  });

  // Refuse Order Modal state
  const [refusingOrderId, setRefusingOrderId] = useState<string | null>(null);
  const [refusalReason, setRefusalReason] = useState('Rupture temporaire de stock');

  // Edit Product Modal / Form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editImagesInput, setEditImagesInput] = useState('');
  const [editVideosInput, setEditVideosInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Stock edit state
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Promotions & Flash Sales state
  const [promotions, setPromotions] = useState([
    { id: 'pr1', title: 'Vente Flash Marché A', discount: '15%', active: true, expires: 'Demain 18:00', productIds: ['p1', 'p2'] },
    { id: 'pr2', title: 'Pack Spécial Épices', discount: '20%', active: false, expires: '15 Août 2026', productIds: ['p1'] }
  ]);
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('10');

  // Coupon state
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'BAFOUS30', discount: '30%', usage: '18/50', expires: '31 Aug 2026', active: true },
    { id: '2', code: 'PROMO10', discount: '10%', usage: '42/100', expires: '15 Aug 2026', active: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');

  // Messages state
  const [selectedChat, setSelectedChat] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      clientName: 'Mireille Talla',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      lastTime: '10:42',
      unread: true,
      history: [
        { sender: 'client', text: 'Bonjour ! Avez-vous encore du poivre blanc de Penja en sac de 1kg ?', time: '10:38' },
        { sender: 'boutique', text: 'Bonjour Madame Talla ! Oui, stock disponible au Marché A.', time: '10:40' },
        { sender: 'client', text: 'Super, je passe commande via l\'application tout de suite.', time: '10:42' }
      ]
    },
    {
      id: 2,
      clientName: 'Emmanuel Kamga',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      lastTime: 'Hier',
      unread: false,
      history: [
        { sender: 'client', text: 'La livraison à Kamkop est-elle rapide ce samedi ?', time: 'Hier 16:20' },
        { sender: 'boutique', text: 'Oui, livraison express en moins de 25 minutes par nos livreurs AfriNova.', time: 'Hier 16:25' }
      ]
    }
  ]);
  const [replyText, setReplyText] = useState('');

  // Reviews & Replies state
  const [reviews, setReviews] = useState([
    { id: 'r1', client: 'Danielle N.', rating: 5, date: 'Hier', product: 'Poivre Blanc Penja Agréé', text: 'Excellente qualité, emballage très propre. Livraison en 15 minutes à Tamdja !', reply: 'Merci beaucoup Danielle ! Votre satisfaction est notre priorité.' },
    { id: 'r2', client: 'Arnaud K.', rating: 4, date: '29 Juil 2026', product: 'Huile de Palme Rouge Bio', text: 'Huile naturelle très bien clarifiée, emballage hermétique.', reply: '' }
  ]);
  const [reviewReplyInputs, setReviewReplyInputs] = useState<Record<string, string>>({});

  // Payout / Retrait state
  const [payoutAmount, setPayoutAmount] = useState('0');
  const [payoutPhone, setPayoutPhone] = useState('677894512');
  const [payoutProvider, setPayoutProvider] = useState<'orange' | 'momo'>('orange');
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);

  // Shop Profile & Schedule State
  const [shopName, setShopName] = useState(myMerchant?.shopName || myMerchant?.name || 'Boutique AfriNova Marché A');
  const [shopLocation, setShopLocation] = useState(myMerchant?.location || 'Marché A, Stand 14, Bafoussam');
  const [shopPhone, setShopPhone] = useState(myMerchant?.phone || '+237 677 89 45 12');
  const [shopDescription, setShopDescription] = useState('Spécialiste épices bio du Noun, huiles végétales de qualité et produits vivriers certifiés Bafoussam.');
  const [isOpenNow, setIsOpenNow] = useState(true);
  const [openingHours, setOpeningHours] = useState('Lundi - Samedi: 07h30 - 18h30 | Dimanche: 08h00 - 14h00');
  const [legalRccm, setLegalRccm] = useState('RC/BAF/2024/B/4521');

  // Support Ticket State
  const [supportMessage, setSupportMessage] = useState('');
  const [supportTickets, setSupportTickets] = useState([
    { id: 'TK-402', date: '25 Juil 2026', subject: 'Optimisation de la livraison à Tamdja', status: 'Résolu' }
  ]);

  // Handle Order Status Transitions
  const handleUpdateOrderStatus = (orderId: string, newStatus: 'preparing' | 'delivering' | 'delivered' | 'cancelled') => {
    setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  // Handle Refuse Order
  const handleConfirmRefusal = () => {
    if (!refusingOrderId) return;
    handleUpdateOrderStatus(refusingOrderId, 'cancelled');
    setRefusingOrderId(null);
  };

  // Handle Product Save Edit
  const handleSaveProductEdit = () => {
    if (!editingProduct) return;
    
    // Parse additional images / videos if provided as comma-separated
    let updatedImages = editingProduct.images || [];
    if (editImagesInput.trim()) {
      const newImgs = editImagesInput.split(',').map(s => s.trim()).filter(Boolean);
      updatedImages = Array.from(new Set([...updatedImages, ...newImgs]));
    }

    let updatedVideos = editingProduct.videos || [];
    if (editVideosInput.trim()) {
      const newVids = editVideosInput.split(',').map(s => s.trim()).filter(Boolean);
      updatedVideos = Array.from(new Set([...updatedVideos, ...newVids]));
    }

    const updated = {
      ...editingProduct,
      images: updatedImages,
      videos: updatedVideos
    };

    setLocalProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingProduct(null);
    setEditImagesInput('');
    setEditVideosInput('');
  };

  // Handle Product Delete
  const handleDeleteProduct = (id: string) => {
    setLocalProducts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirmId(null);
  };

  // Handle Stock Quick Save
  const handleSaveStock = (productId: string) => {
    const newQty = stockUpdates[productId];
    if (newQty === undefined) return;
    setLocalProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newQty } : p));
  };

  // Handle Add Category
  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    if (!shopCategories.includes(newCatInput.trim())) {
      setShopCategories([...shopCategories, newCatInput.trim()]);
    }
    setNewCatInput('');
  };

  // Handle Send Chat Reply
  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setChatMessages(prev => prev.map((chat, idx) => {
      if (idx === selectedChat) {
        return {
          ...chat,
          lastTime: 'À l\'instant',
          history: [...chat.history, { sender: 'boutique', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
        };
      }
      return chat;
    }));
    setReplyText('');
  };

  // Handle Coupon Add
  const handleAddCoupon = () => {
    if (!newCouponCode || !newCouponDiscount) return;
    setCoupons(prev => [
      ...prev,
      { id: Date.now().toString(), code: newCouponCode.toUpperCase().trim(), discount: newCouponDiscount.trim(), usage: '0/100', expires: '31 Aug 2026', active: true }
    ]);
    setNewCouponCode('');
    setNewCouponDiscount('');
  };

  // Handle Review Reply
  const handlePublishReviewReply = (reviewId: string) => {
    const text = reviewReplyInputs[reviewId];
    if (!text || !text.trim()) return;
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: text.trim() } : r));
    setReviewReplyInputs({ ...reviewReplyInputs, [reviewId]: '' });
  };

  // Filtered Orders
  const pendingOrders = localOrders.filter(o => o.status === 'pending');
  const activeOrders = localOrders.filter(o => o.status === 'preparing' || o.status === 'delivering');
  const deliveredOrders = localOrders.filter(o => o.status === 'delivered');

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-24 relative selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ==================== 1. VENDEUR HEADER ==================== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Vendeur Profile Badge */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('accueil')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <AfriNovaLogo size="md" variant="light" showSlogan={false} />
              <span className="bg-[#16A34A]/15 text-[#15803D] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                <Store className="w-3 h-3 text-[#16A34A]" />
                <span>Espace Vendeur Boutique</span>
              </span>
            </div>
          </div>

          {/* Quick Vendeur Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Add Product Trigger */}
            <button
              onClick={onOpenAddModal}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold px-3 py-1.5 rounded-full transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Nouveau Produit</span>
            </button>

            {/* Quick Messages */}
            <button
              onClick={() => setActiveTab('messages')}
              className={`p-2 rounded-full transition relative cursor-pointer ${
                activeTab === 'messages' ? 'bg-indigo-50 text-[#4F46E5]' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Messages clients"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white" />
            </button>

            {/* Support Call Button */}
            <button
              onClick={() => setActiveTab('support')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Support</span>
            </button>

            {/* Logout */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==================== 2. VENDEUR SUB-NAVIGATION TABS BAR ==================== */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[57px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex items-center gap-1 py-1.5">
          {[
            { id: 'accueil', label: 'Tableau de Bord', icon: Store },
            { id: 'produits', label: `Produits (${localProducts.length})`, icon: Package },
            { id: 'stocks', label: 'Stocks & Quantités', icon: AlertTriangle },
            { id: 'categories', label: 'Catégories', icon: Layers },
            { id: 'commandes_recues', label: `Commandes Reçues (${pendingOrders.length})`, icon: ShoppingBag, badge: pendingOrders.length > 0 ? pendingOrders.length : undefined },
            { id: 'commandes_encours', label: `En Cours (${activeOrders.length})`, icon: Clock },
            { id: 'livraisons', label: 'Livraisons', icon: Truck },
            { id: 'messages', label: 'Messages Clients', icon: MessageSquare, badge: 1 },
            { id: 'promotions', label: 'Ventes Flash', icon: Tag },
            { id: 'coupons', label: 'Coupons', icon: Percent },
            { id: 'stats', label: 'Statistiques', icon: BarChart3 },
            { id: 'revenus', label: 'Chiffre d\'Affaires', icon: DollarSign },
            { id: 'retraits', label: 'Demander Retrait', icon: CreditCard },
            { id: 'paiements', label: 'Paiements Reçus', icon: FileText },
            { id: 'abonnement', label: 'Abonnement', icon: ShieldCheck },
            { id: 'avis', label: 'Avis Clients', icon: Star },
            { id: 'profil', label: 'Profil Boutique', icon: Store },
            { id: 'horaires', label: 'Horaires', icon: Clock },
            { id: 'informations', label: 'Informations', icon: Shield },
            { id: 'support', label: 'Support Vendeur', icon: HelpCircle },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition cursor-pointer relative ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-[#16A34A] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== MAIN CONTAINER ==================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">

        {/* 1. TABLEAU DE BORD ACCUEIL */}
        {activeTab === 'accueil' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>CA Aujourd'hui</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">
                  {localOrders.filter(o => o.status === 'completed' || o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString('fr-FR')} FCFA
                </p>
                <span className="text-[10px] font-bold text-[#16A34A] flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +14.2% / hier
                </span>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Commandes à Valider</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">{pendingOrders.length} nouvelles</p>
                <span className="text-[10px] text-indigo-600 font-bold">Action requise</span>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Alerte Stock Bas</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">
                  {localProducts.filter(p => (p.stock || 10) < 5).length} articles
                </p>
                <span className="text-[10px] text-amber-600 font-bold">&lt; 5 unités</span>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Avis Clients</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-black">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">4.9 / 5.0</p>
                <span className="text-[10px] text-slate-400 font-medium">128 évaluations certifiées</span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Accès Rapide Boutique</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={onOpenAddModal}
                  className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <Plus className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Ajouter Produit</p>
                    <p className="text-[10px] text-emerald-800">Photos & Vidéos</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('commandes_recues')}
                  className="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Accepter Commandes</p>
                    <p className="text-[10px] text-indigo-800">{pendingOrders.length} en attente</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('retraits')}
                  className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <DollarSign className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Demander Retrait</p>
                    <p className="text-[10px] text-purple-800">MoMo & Orange</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Répondre Clients</p>
                    <p className="text-[10px] text-amber-900">1 message non lu</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Catalog Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Aperçu Produits Boutique</h3>
                <button onClick={() => setActiveTab('produits')} className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer">
                  Voir tout ({localProducts.length})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {localProducts.slice(0, 6).map((product) => (
                  <div key={product.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'} alt={product.name} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-[#0F172A] truncate">{product.name}</h4>
                      <p className="text-xs font-black text-[#16A34A]">{product.price?.toLocaleString()} FCFA</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>Stock: <strong className="text-slate-700">{product.stock || 10}</strong></span>
                        <span>•</span>
                        <span>{product.category || 'Général'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUITS (Ajouter, Modifier, Supprimer, Photos, Vidéos, Prix, Quantité) */}
        {activeTab === 'produits' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-black text-[#0F172A]">Catalogue des Produits ({localProducts.length})</h2>
                <p className="text-xs text-slate-500">Ajoutez, modifiez vos photos, vidéos, prix et stocks.</p>
              </div>

              <button
                onClick={onOpenAddModal}
                className="px-4 py-2.5 bg-[#16A34A] text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:bg-[#15803D]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Ajouter un Produit</span>
              </button>
            </div>

            {/* Table or Cards */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Produit</th>
                      <th className="p-4">Catégorie</th>
                      <th className="p-4">Médias</th>
                      <th className="p-4">Prix Unit.</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 flex items-center gap-3 min-w-[200px]">
                          <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'} alt={p.name} className="w-12 h-12 object-cover rounded-xl shrink-0" />
                          <div>
                            <p className="font-bold text-[#0F172A] text-xs line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.subCategory || p.neighborhood || 'Bafoussam'}</p>
                          </div>
                        </td>

                        <td className="p-4 font-semibold text-slate-600 min-w-[120px]">{p.category}</td>

                        <td className="p-4 min-w-[120px]">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-emerald-600" /> {p.images?.length || 1}
                            </span>
                            {(p.videos?.length || 0) > 0 && (
                              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <Video className="w-3 h-3 text-purple-600" /> {p.videos?.length}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 font-black text-[#16A34A] whitespace-nowrap">
                          {p.price?.toLocaleString()} FCFA
                        </td>

                        <td className="p-4 font-bold whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            (p.stock || 10) === 0 
                              ? 'bg-rose-100 text-rose-800'
                              : (p.stock || 10) < 5 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.stock || 10} unités
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setEditImagesInput(p.images?.join(', ') || '');
                              setEditVideosInput(p.videos?.join(', ') || '');
                            }}
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer font-bold inline-flex items-center gap-1 text-xs"
                            title="Modifier"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Modifier</span>
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer font-bold inline-flex items-center gap-1 text-xs"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL MODIFIER PRODUIT */}
            {editingProduct && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl my-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-sm text-[#0F172A] flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#16A34A]" /> Modifier le Produit
                    </h3>
                    <button onClick={() => setEditingProduct(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nom du Produit</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50 mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Prix (FCFA)</label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50 mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Quantité Stock</label>
                        <input
                          type="number"
                          value={editingProduct.stock || 10}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50 mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Catégorie</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl font-bold bg-slate-50 mt-1"
                      >
                        {shopCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Photos (URLs séparées par une virgule)</label>
                      <textarea
                        rows={2}
                        value={editImagesInput}
                        onChange={(e) => setEditImagesInput(e.target.value)}
                        placeholder="https://..., https://..."
                        className="w-full px-3 py-2 border rounded-xl font-mono text-[11px] bg-slate-50 mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Vidéos Démonstration (URLs séparées par une virgule)</label>
                      <textarea
                        rows={2}
                        value={editVideosInput}
                        onChange={(e) => setEditVideosInput(e.target.value)}
                        placeholder="https://..., https://..."
                        className="w-full px-3 py-2 border rounded-xl font-mono text-[11px] bg-slate-50 mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl font-medium bg-slate-50 mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button onClick={() => setEditingProduct(null)} className="px-4 py-2 text-xs font-bold text-slate-500 cursor-pointer">
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveProductEdit}
                      className="px-4 py-2 bg-[#16A34A] text-white text-xs font-black rounded-xl hover:bg-[#15803D] cursor-pointer"
                    >
                      Enregistrer les Modifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL CONFIRMATION SUPPRESSION */}
            {deleteConfirmId && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center shadow-2xl">
                  <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
                  <h3 className="font-black text-sm text-[#0F172A]">Supprimer ce produit ?</h3>
                  <p className="text-xs text-slate-500">Cette action retirera définitivement l'article de votre vitrine Bafoussam.</p>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer">
                      Annuler
                    </button>
                    <button onClick={() => handleDeleteProduct(deleteConfirmId)} className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. GESTION DES STOCKS & QUANTITÉS */}
        {activeTab === 'stocks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-black text-[#0F172A]">Gestion Précise des Stocks & Inventaire</h2>
                <p className="text-xs text-slate-500">Mettez à jour vos quantités en stock en un clic.</p>
              </div>

              {/* Filters */}
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-3 py-1 rounded-xl transition cursor-pointer ${stockFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  Tous ({localProducts.length})
                </button>
                <button
                  onClick={() => setStockFilter('low')}
                  className={`px-3 py-1 rounded-xl transition cursor-pointer ${stockFilter === 'low' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  Stock Faible ({localProducts.filter(p => (p.stock || 10) > 0 && (p.stock || 10) < 5).length})
                </button>
                <button
                  onClick={() => setStockFilter('out')}
                  className={`px-3 py-1 rounded-xl transition cursor-pointer ${stockFilter === 'out' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  Rupture ({localProducts.filter(p => (p.stock || 10) === 0).length})
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              {localProducts
                .filter(p => {
                  if (stockFilter === 'low') return (p.stock || 10) > 0 && (p.stock || 10) < 5;
                  if (stockFilter === 'out') return (p.stock || 10) === 0;
                  return true;
                })
                .map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'} alt={p.name} className="w-12 h-12 object-cover rounded-xl shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-[#0F172A]">{p.name}</p>
                        <p className="text-[10px] text-slate-500">
                          Stock actuel : <span className="font-black text-slate-900">{p.stock || 10} unités</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                        <button
                          onClick={() => {
                            const cur = stockUpdates[p.id] ?? (p.stock || 10);
                            setStockUpdates({ ...stockUpdates, [p.id]: Math.max(0, cur - 1) });
                          }}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-black cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={stockUpdates[p.id] ?? (p.stock || 10)}
                          onChange={(e) => setStockUpdates({ ...stockUpdates, [p.id]: Math.max(0, Number(e.target.value)) })}
                          className="w-16 text-center text-xs font-black py-1 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const cur = stockUpdates[p.id] ?? (p.stock || 10);
                            setStockUpdates({ ...stockUpdates, [p.id]: cur + 1 });
                          }}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-black cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleSaveStock(p.id)}
                        className="px-3 py-1.5 bg-[#16A34A] text-white text-xs font-black rounded-xl hover:bg-[#15803D] cursor-pointer shadow-xs"
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 4. ORGANISER LES CATÉGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-black text-[#0F172A]">Organiser les Catégories de votre Boutique</h2>
                <p className="text-xs text-slate-500">Créez des catégories personnalisées pour structurer votre vitrine.</p>
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Nouvelle catégorie (Ex: Spécialités Bamiléké)"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-[#16A34A] text-white text-xs font-black rounded-xl cursor-pointer hover:bg-[#15803D]"
                >
                  Ajouter
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {shopCategories.map((cat, idx) => {
                  const count = localProducts.filter(p => p.category === cat).length;
                  return (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#0F172A]">{cat}</h4>
                        <span className="text-[10px] text-slate-500">{count} produit(s) associés</span>
                      </div>
                      <button
                        onClick={() => setShopCategories(prev => prev.filter(c => c !== cat))}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Supprimer la catégorie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. COMMANDES REÇUES (Accepter ou Refuser) */}
        {activeTab === 'commandes_recues' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-black text-[#0F172A]">Commandes Reçues ({pendingOrders.length})</h2>
                <p className="text-xs text-slate-500">Acceptez ou refusez les nouvelles demandes d'achats clients.</p>
              </div>
            </div>

            {pendingOrders.length > 0 ? (
              <div className="space-y-3">
                {pendingOrders.map((o) => (
                  <div key={o.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-mono text-xs font-black text-[#0F172A]">Commande #{o.id}</span>
                        <p className="text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase">
                        En attente d'acceptation
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Client</p>
                        <p className="font-bold text-slate-800">{o.userName || 'Client Bafoussam'}</p>
                        <p className="text-slate-500">{o.deliveryNeighborhood} • {o.deliveryDetails}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Paiement</p>
                        <p className="font-black text-[#16A34A]">{o.total?.toLocaleString() || '12 500'} FCFA</p>
                        <p className="text-slate-500 uppercase">{o.paymentMethod === 'momo' ? 'MTN Mobile Money' : o.paymentMethod === 'orange' ? 'Orange Money' : 'Espèces'}</p>
                      </div>
                    </div>

                    {/* Articles ordered */}
                    <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 text-xs border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Articles Commandés :</p>
                      {o.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center font-semibold">
                          <span>{it.quantity}x {it.product?.name || (it as any).name || 'Article'}</span>
                          <span className="font-bold">{((it.product?.price || (it as any).price || 0) * it.quantity).toLocaleString()} FCFA</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons: Accept or Refuse */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'preparing')}
                        className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Accepter & Préparer</span>
                      </button>

                      <button
                        onClick={() => setRefusingOrderId(o.id)}
                        className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Refuser la commande</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-2">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">Aucune commande en attente de validation.</p>
              </div>
            )}

            {/* MODAL REFUS COMMANDE */}
            {refusingOrderId && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
                  <h3 className="font-black text-sm text-[#0F172A]">Refuser la Commande #{refusingOrderId}</h3>
                  <p className="text-xs text-slate-500">Veuillez indiquer le motif du refus pour informer le client.</p>

                  <select
                    value={refusalReason}
                    onChange={(e) => setRefusalReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50"
                  >
                    <option value="Rupture temporaire de stock">Rupture temporaire de stock</option>
                    <option value="Boutique fermée aujourd'hui">Boutique fermée aujourd'hui</option>
                    <option value="Prix ou spécification obsolète">Prix ou spécification obsolète</option>
                    <option value="Hors zone de livraison">Hors zone de livraison</option>
                  </select>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setRefusingOrderId(null)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer">
                      Annuler
                    </button>
                    <button onClick={handleConfirmRefusal} className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl cursor-pointer">
                      Confirmer Refus
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. COMMANDES EN COURS (Préparer, Expédier, Livrer) */}
        {activeTab === 'commandes_encours' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-base font-black text-[#0F172A]">Commandes en Cours de Traitement ({activeOrders.length})</h2>
              <p className="text-xs text-slate-500">Suivez la préparation, l'expédition et la livraison de vos ventes.</p>
            </div>

            {activeOrders.length > 0 ? (
              <div className="space-y-3">
                {activeOrders.map((o) => (
                  <div key={o.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-mono text-xs font-black text-[#0F172A]">Commande #{o.id}</span>
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                        o.status === 'preparing' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {o.status === 'preparing' ? 'En préparation' : 'Expédiée / En livraison'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-800">Client : {o.userName || 'Client AfriNova'}</p>
                      <p className="text-slate-500">Destination : {o.deliveryNeighborhood} ({o.deliveryDetails})</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {o.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'delivering')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Expédier / Remettre au Livreur</span>
                        </button>
                      )}

                      {o.status === 'delivering' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}
                          className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Marquer comme Livrée</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-2">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">Aucune commande en cours de livraison.</p>
              </div>
            )}
          </div>
        )}

        {/* 7. LIVRAISONS & LOGISTIQUE */}
        {activeTab === 'livraisons' && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] text-white rounded-3xl space-y-3 shadow-md">
              <Truck className="w-10 h-10 text-[#16A34A]" />
              <h3 className="font-black text-base">Service Livreurs Express AfriNova Bafoussam</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Nos coursiers certifiés récupèrent directement les paquets emballés dans votre boutique (Marché A, Kamkop, Tamdja) et assurent la livraison sécurisée au client en moins de 30 minutes.
              </p>
            </div>
          </div>
        )}

        {/* 8. MESSAGERIE CLIENTS */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-3xl border border-slate-200 space-y-2">
              <h3 className="font-black text-xs text-[#0F172A] px-2 py-1 uppercase tracking-wider">Conversations Clients</h3>
              {chatMessages.map((chat, idx) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(idx)}
                  className={`p-3 rounded-2xl cursor-pointer transition flex items-center gap-3 ${
                    selectedChat === idx ? 'bg-[#0F172A] text-white' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <img src={chat.avatar} alt={chat.clientName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold truncate">{chat.clientName}</span>
                      <span className="text-[10px] opacity-60">{chat.lastTime}</span>
                    </div>
                    <p className="text-[10px] opacity-80 truncate">{chat.history[chat.history.length - 1]?.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 flex flex-col justify-between min-h-[400px]">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <img src={chatMessages[selectedChat].avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-extrabold text-xs text-[#0F172A]">{chatMessages[selectedChat].clientName}</h4>
                    <span className="text-[10px] text-emerald-600 font-bold">• En ligne (Bafoussam Client)</span>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {chatMessages[selectedChat].history.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === 'boutique' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-[80%] text-xs ${
                        m.sender === 'boutique' ? 'bg-[#16A34A] text-white font-medium' : 'bg-slate-100 text-slate-800 font-medium'
                      }`}>
                        <p>{m.text}</p>
                        <span className="text-[8px] opacity-70 block text-right mt-1">{m.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
                  <button
                    onClick={() => setReplyText('Bonjour ! Votre commande est disponible.')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold whitespace-nowrap cursor-pointer"
                  >
                    + Disponible au stock
                  </button>
                  <button
                    onClick={() => setReplyText('Le livreur arrive dans 15 minutes.')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold whitespace-nowrap cursor-pointer"
                  >
                    + Délai livraison
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Répondre au client..."
                    className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-none"
                  />
                  <button onClick={handleSendReply} className="p-2.5 bg-[#16A34A] text-white rounded-xl hover:bg-[#15803D] cursor-pointer">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. PROMOTIONS & VENTES FLASH */}
        {activeTab === 'promotions' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-black text-[#0F172A]">Créer des Promotions & Ventes Flash</h2>
                <p className="text-xs text-slate-500">Mettez en avant vos offres spéciales pour capter l'attention des clients Bafoussam.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Titre de l'offre (Ex: Flash Poivre de Penja)"
                  value={newPromoTitle}
                  onChange={(e) => setNewPromoTitle(e.target.value)}
                  className="px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50"
                />
                <input
                  type="text"
                  placeholder="Remise (Ex: 15%)"
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(e.target.value)}
                  className="px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50"
                />
                <button
                  onClick={() => {
                    if (!newPromoTitle) return;
                    setPromotions([...promotions, { id: Date.now().toString(), title: newPromoTitle, discount: newPromoDiscount, active: true, expires: 'Dans 3 jours', productIds: [] }]);
                    setNewPromoTitle('');
                  }}
                  className="px-4 py-2 bg-[#16A34A] text-white text-xs font-black rounded-xl cursor-pointer hover:bg-[#15803D]"
                >
                  Lancer Vente Flash
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {promotions.map((p) => (
                  <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{p.title}</h4>
                      <p className="text-[10px] text-slate-500">Expiration : {p.expires}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 font-black rounded-full">
                      -{p.discount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 10. COUPONS PROMO */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-black text-[#0F172A]">Codes Promo & Distribution Coupons</h2>
                <p className="text-xs text-slate-500">Générez des coupons de réduction à distribuer à vos clients fidèles.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <input
                  type="text"
                  placeholder="Code (Ex: MARCHEA20)"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="px-3 py-2 border rounded-xl text-xs font-bold uppercase bg-slate-50"
                />
                <input
                  type="text"
                  placeholder="Remise (Ex: 20%)"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50"
                />
                <button onClick={handleAddCoupon} className="px-4 py-2 bg-[#16A34A] text-white text-xs font-black rounded-xl cursor-pointer hover:bg-[#15803D] whitespace-nowrap">
                  Créer Coupon
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {coupons.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">{c.code}</span>
                    <span className="font-bold text-[#16A34A]">{c.discount} de réduction</span>
                    <span className="text-slate-500 text-[10px]">Utilisations: {c.usage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 11. STATISTIQUES */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-base font-black text-[#0F172A]">Statistiques de Performance Boutique</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Visites Boutique ce mois</p>
                  <p className="text-2xl font-black text-indigo-600">3 420 vues</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Taux de Conversion</p>
                  <p className="text-2xl font-black text-[#16A34A]">4.8%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Satisfaction Client</p>
                  <p className="text-2xl font-black text-amber-500">98.4%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 12. CHIFFRE D'AFFAIRES & REVENUS */}
        {activeTab === 'revenus' && (
          <div className="space-y-4">
            <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-3 shadow-md border border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Compte Financier Vendeur</span>
              <h3 className="text-3xl font-black text-[#16A34A]">{((myMerchant?.salesCount || 10) * 15000).toLocaleString('fr-FR')} FCFA</h3>
              <p className="text-xs text-slate-300">Solde disponible pour retrait immédiat via MTN Mobile Money ou Orange Money.</p>
            </div>
          </div>
        )}

        {/* 13. DEMANDER UN RETRAIT */}
        {activeTab === 'retraits' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 max-w-md">
              <h2 className="text-base font-black text-[#0F172A]">Demande de Retrait vers Mobile Money</h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setPayoutProvider('orange')}
                  className={`flex-1 py-2.5 text-xs font-black rounded-xl cursor-pointer transition ${
                    payoutProvider === 'orange' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Orange Money
                </button>
                <button
                  onClick={() => setPayoutProvider('momo')}
                  className={`flex-1 py-2.5 text-xs font-black rounded-xl cursor-pointer transition ${
                    payoutProvider === 'momo' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  MTN Mobile Money
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Montant à retirer (FCFA)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Numéro de Téléphone Récepteur</label>
                <input
                  type="tel"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50 mt-1"
                />
              </div>

              <button
                onClick={() => {
                  alert(`Demande de retrait de ${payoutAmount} FCFA vers +237 ${payoutPhone} soumise !`);
                  setPayoutHistory(prev => [{
                    id: `RET-${Math.floor(Math.random()*900+100)}`,
                    amount: `${Number(payoutAmount).toLocaleString()} FCFA`,
                    date: 'Aujourd\'hui',
                    status: 'En traitement',
                    provider: payoutProvider === 'orange' ? 'Orange Money' : 'MTN Mobile Money',
                    phone: payoutPhone
                  }, ...prev]);
                }}
                className="w-full py-3 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl cursor-pointer shadow-xs"
              >
                Confirmer le Retrait
              </button>

              <div className="space-y-2 pt-3 border-t">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase">Historique des Retraits</h4>
                {payoutHistory.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{h.amount}</span>
                      <p className="text-[10px] text-slate-400">{h.provider} • {h.date}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">{h.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 14. PAIEMENTS REÇUS */}
        {activeTab === 'paiements' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-base font-black text-[#0F172A]">Historique des Paiements Reçus</h2>
              <div className="space-y-2">
                {localOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center font-semibold">Aucun paiement enregistré pour le moment. Les paiements apparaîtront automatiquement lors de vos premières ventes.</p>
                ) : (
                  localOrders.filter(o => o.status === 'completed' || o.status === 'delivered').map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{p.userName} ({p.id})</p>
                        <p className="text-[10px] text-slate-400">{p.paymentMethod?.toUpperCase() || 'MoMo'} • {p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}</p>
                      </div>
                      <span className="font-black text-[#16A34A]">{p.total?.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 15. ABONNEMENT */}
        {activeTab === 'abonnement' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 max-w-md">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#0F172A]">Abonnement Vendeur Pro</h2>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full">Actif</span>
              </div>

              <p className="text-xs text-slate-600">
                Votre abonnement mensuel Boutique Pro est valide jusqu'au <strong>31 Août 2026</strong>.
              </p>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 text-xs text-slate-700">
                <p>✓ Publication illimitée de photos & vidéos</p>
                <p>✓ Traitement prioritaire des retraits Mobile Money</p>
                <p>✓ Badge Vendeur Vérifié Marché A</p>
              </div>
            </div>
          </div>
        )}

        {/* 16. AVIS CLIENTS & RÉPONSES */}
        {activeTab === 'avis' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-base font-black text-[#0F172A]">Avis & Réponses aux Clients</h2>
              <p className="text-xs text-slate-500">Répondez directement aux évaluations de vos acheteurs.</p>
            </div>

            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#0F172A]">{r.client}</span>
                      <p className="text-[10px] text-slate-400">Produit: {r.product} • {r.date}</p>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-bold text-xs text-slate-800">{r.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">{r.text}</p>

                  {r.reply ? (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                      <span className="font-black text-[10px] uppercase text-emerald-700">Votre Réponse Officielle :</span>
                      <p>{r.reply}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <input
                        type="text"
                        placeholder="Écrire une réponse à cet avis..."
                        value={reviewReplyInputs[r.id] || ''}
                        onChange={(e) => setReviewReplyInputs({ ...reviewReplyInputs, [r.id]: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium"
                      />
                      <button
                        onClick={() => handlePublishReviewReply(r.id)}
                        className="px-3 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#15803D]"
                      >
                        Publier
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 17. PROFIL BOUTIQUE */}
        {activeTab === 'profil' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 max-w-lg">
              <h2 className="text-base font-black text-[#0F172A]">Modifier le Profil de la Boutique</h2>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nom de la Boutique</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Quartier & Emplacement</label>
                <input
                  type="text"
                  value={shopLocation}
                  onChange={(e) => setShopLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Téléphone WhatsApp</label>
                <input
                  type="text"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description de la Boutique</label>
                <textarea
                  rows={3}
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium bg-slate-50 mt-1"
                />
              </div>

              <button
                onClick={() => alert('Profil boutique mis à jour avec succès !')}
                className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl cursor-pointer shadow-xs"
              >
                Enregistrer le Profil
              </button>
            </div>
          </div>
        )}

        {/* 18. HORAIRES D'OUVERTURE */}
        {activeTab === 'horaires' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 max-w-lg">
              <h2 className="text-base font-black text-[#0F172A]">Horaires d'Ouverture Boutique</h2>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800">Statut Actuel :</span>
                <button
                  onClick={() => setIsOpenNow(!isOpenNow)}
                  className={`px-3 py-1 text-xs font-black rounded-full cursor-pointer transition ${
                    isOpenNow ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {isOpenNow ? 'Boutique Ouverte' : 'Boutique Fermée'}
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Texte des Horaires</label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50 mt-1"
                />
              </div>

              <button
                onClick={() => alert('Horaires d\'ouverture enregistrés !')}
                className="px-5 py-2.5 bg-[#16A34A] text-white text-xs font-black rounded-xl cursor-pointer hover:bg-[#15803D]"
              >
                Enregistrer Horaires
              </button>
            </div>
          </div>
        )}

        {/* 19. INFORMATIONS LÉGALES & CONDITIONS */}
        {activeTab === 'informations' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 max-w-lg">
              <h2 className="text-base font-black text-[#0F172A]">Informations Légales & Réglementaires</h2>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Numéro Registre du Commerce (RCCM)</label>
                <input
                  type="text"
                  value={legalRccm}
                  onChange={(e) => setLegalRccm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-slate-50 mt-1"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 space-y-1">
                <p>✓ Vendeur certifié sur la plateforme AfriNova.</p>
                <p>✓ Conforme aux régulations du commerce électronique au Cameroun.</p>
              </div>
            </div>

            {/* À propos d'AfriNova */}
            <AboutAfriNovaSection />
          </div>
        )}

        {/* 20. SUPPORT VENDEUR */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-200 text-[#15803D] space-y-3 shadow-xs">
              <PhoneCall className="w-8 h-8 text-[#16A34A]" />
              <h3 className="font-black text-base">Assistance & Support Vendeur AfriNova</h3>
              <p className="text-xs text-emerald-900">
                Notre équipe est disponible pour vous accompagner sur la gestion de vos retraits, commandes et publications.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="https://wa.me/237677894512"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#16A34A] text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  Contacter via WhatsApp
                </a>
                <span className="text-xs font-bold text-slate-700">+237 677 89 45 12</span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
