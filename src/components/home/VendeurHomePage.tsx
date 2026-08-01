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
  Bell
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';

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
  orders,
  onOpenAddModal,
  onNavigateView,
  onSelectProduct,
  onLogout
}: VendeurHomePageProps) {
  // Navigation active tab for Boutique Dashboard
  const [activeTab, setActiveTab] = useState<
    'accueil' | 'resume' | 'produits' | 'stocks' | 'commandes_recues' | 'commandes_encours' | 
    'livraisons' | 'clients' | 'messages' | 'promotions' | 'coupons' | 'stats' | 
    'revenus' | 'retraits' | 'abonnement' | 'avis' | 'profil' | 'parametres' | 'support'
  >('accueil');

  // Filter products for connected boutique
  const myMerchant = merchants.find(m => m.id === currentUser?.id) || merchants[0];
  const [localProducts, setLocalProducts] = useState<Product[]>(
    products.filter(p => p.merchantId === myMerchant?.id || p.merchantId === 'm1')
  );

  // Edit / Delete Product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Stock edit state
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});

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
        { sender: 'boutique', text: 'Oui, livraison express en moins de 25 minutes.', time: 'Hier 16:25' }
      ]
    }
  ]);
  const [replyText, setReplyText] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([
    { id: 'r1', client: 'Danielle N.', rating: 5, date: ' Hier', product: 'Poivre Blanc Penja Agréé', text: 'Excellente qualité, emballage très propre. Livraison en 15 minutes à Tamdja !', reply: 'Merci beaucoup Danielle !' },
    { id: 'r2', client: 'Arnaud K.', rating: 4, date: '29 Juil 2026', product: 'Chaussures Ndop Bafoussam', text: 'Très bel artisanat, conforme à la description.', reply: '' }
  ]);
  const [reviewReplyInput, setReviewReplyInput] = useState<Record<string, string>>({});

  // Payout / Retrait state
  const [payoutAmount, setPayoutAmount] = useState('100000');
  const [payoutPhone, setPayoutPhone] = useState('677894512');
  const [payoutProvider, setPayoutProvider] = useState<'orange' | 'momo'>('orange');
  const [payoutHistory, setPayoutHistory] = useState([
    { id: 'RET-992', amount: '250 000 FCFA', date: '28 Juil 2026', status: 'Validé', provider: 'MTN Mobile Money' },
    { id: 'RET-981', amount: '180 000 FCFA', date: '20 Juil 2026', status: 'Validé', provider: 'Orange Money' }
  ]);

  // Handle product deletion
  const handleDeleteProduct = (id: string) => {
    setLocalProducts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirmId(null);
  };

  // Handle stock update
  const handleSaveStock = (productId: string) => {
    const newQty = stockUpdates[productId];
    if (newQty === undefined) return;
    setLocalProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newQty } : p));
  };

  // Handle send chat reply
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

  // Handle coupon add
  const handleAddCoupon = () => {
    if (!newCouponCode || !newCouponDiscount) return;
    setCoupons(prev => [
      ...prev,
      { id: Date.now().toString(), code: newCouponCode.toUpperCase(), discount: newCouponDiscount, usage: '0/100', expires: '31 Aug 2026', active: true }
    ]);
    setNewCouponCode('');
    setNewCouponDiscount('');
  };

  // Filtered orders
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const deliveringOrders = orders.filter(o => o.status === 'delivering' || o.status === 'picked_up');

  return (
    <div className="w-full bg-[#F8FAFC] text-[#0F172A] min-h-screen pb-20 font-sans">
      
      {/* HEADER BANNER BOUTIQUE */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#16A34A] rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden mb-5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#16A34A] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-300/30">
                <Store className="w-3 h-3" /> Espace Vendeur Boutique
              </span>
              <span className="text-slate-300 text-xs font-semibold">Marché A • Bafoussam</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display">
              {myMerchant?.shopName || myMerchant?.name || 'Ma Boutique AfriNova'}
            </h1>
            <p className="text-xs text-slate-200 font-medium">
              Gestion centralisée des ventes, produits, stocks, retraits et avis clients.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="h-10 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ajouter un produit</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-300" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BOUTIQUE SUB-NAVIGATION TABS BAR */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[57px] z-30 shadow-2xs mb-6">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-2">
          {[
            { id: 'accueil', label: 'Accueil Vendeur', icon: Store },
            { id: 'resume', label: 'Résumé Ventes', icon: TrendingUp },
            { id: 'produits', label: `Produits (${localProducts.length})`, icon: Package },
            { id: 'stocks', label: 'Gestion Stocks', icon: AlertTriangle },
            { id: 'commandes_recues', label: `Commandes Reçues (${pendingOrders.length})`, icon: ShoppingBag, badge: pendingOrders.length > 0 ? pendingOrders.length : undefined },
            { id: 'commandes_encours', label: `En Cours (${deliveringOrders.length})`, icon: Clock },
            { id: 'livraisons', label: 'Livraisons', icon: Truck },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 1 },
            { id: 'promotions', label: 'Promotions', icon: Tag },
            { id: 'coupons', label: 'Coupons', icon: Percent },
            { id: 'stats', label: 'Statistiques', icon: BarChart3 },
            { id: 'revenus', label: 'Revenus', icon: DollarSign },
            { id: 'retraits', label: 'Retraits Momo', icon: CreditCard },
            { id: 'abonnement', label: 'Abonnement', icon: ShieldCheck },
            { id: 'avis', label: 'Avis Clients', icon: Star },
            { id: 'profil', label: 'Profil Boutique', icon: Store },
            { id: 'parametres', label: 'Paramètres', icon: Settings },
            { id: 'support', label: 'Support Vendeur', icon: HelpCircle },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-2xs'
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

      {/* DYNAMIC TAB CONTENT */}
      <main className="max-w-7xl mx-auto px-4 space-y-6">

        {/* 1. ACCUEIL VENDEUR */}
        {activeTab === 'accueil' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Chiffre d'Affaires du Jour</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">185 400 FCFA</p>
                <span className="text-[10px] font-bold text-[#16A34A] flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +14.2% aujourd'hui
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Commandes à Traiter</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">{pendingOrders.length || 4} commandes</p>
                <span className="text-[10px] text-indigo-600 font-bold">Livraison express requise</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Alerte Stock Bas</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">{localProducts.filter(p => (p.stock || 10) < 5).length || 2} articles</p>
                <span className="text-[10px] text-amber-600 font-bold">&lt; 5 unités restantes</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Avis Client Global</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-black">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">4.9 / 5.0</p>
                <span className="text-[10px] text-slate-400 font-medium">128 évaluations certifiées</span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Accès Rapide Boutique</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={onOpenAddModal}
                  className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <Plus className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Ajouter Produit</p>
                    <p className="text-[10px] text-emerald-800">En quelques clics</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('commandes_recues')}
                  className="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Commandes</p>
                    <p className="text-[10px] text-indigo-800">{pendingOrders.length} nouvelles</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('retraits')}
                  className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <DollarSign className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Retrait Momo</p>
                    <p className="text-[10px] text-purple-800">Solde dispo</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Messages Clients</p>
                    <p className="text-[10px] text-amber-900">Discuter en direct</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Top Products Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Catalogue Actif Boutique</h3>
                <button onClick={() => setActiveTab('produits')} className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer">
                  Voir tout ({localProducts.length})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {localProducts.slice(0, 6).map((product) => (
                  <div key={product.id} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
                    <img src={product.images?.[0]} alt={product.name} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-[#0F172A] truncate">{product.name}</h4>
                      <p className="text-xs font-black text-[#16A34A]">{product.price?.toLocaleString()} FCFA</p>
                      <span className="text-[10px] font-semibold text-slate-400">Stock: {product.stock || 12}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. RÉSUMÉ DES VENTES */}
        {activeTab === 'resume' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Résumé des Ventes & Performances</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Ventes ce Mois</p>
                <p className="text-2xl font-black text-[#16A34A]">2 150 000 FCFA</p>
                <p className="text-[10px] text-slate-500">148 articles vendus au Marché A & Tamdja</p>
              </div>
              <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Panier Moyen Client</p>
                <p className="text-2xl font-black text-[#0F172A]">14 500 FCFA</p>
                <p className="text-[10px] text-slate-500">En hausse de +8.5%</p>
              </div>
              <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Taux de Satisfaction</p>
                <p className="text-2xl font-black text-amber-500">98.4%</p>
                <p className="text-[10px] text-slate-500">Basé sur les avis certifiés</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRODUITS & ACTIONS (Ajouter, Modifier, Supprimer) */}
        {activeTab === 'produits' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#0F172A]">Gestion du Catalogue Produit</h2>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 bg-[#16A34A] text-white text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Produit</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Produit</th>
                    <th className="p-3.5">Catégorie</th>
                    <th className="p-3.5">Prix</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 flex items-center gap-3">
                        <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 object-cover rounded-xl" />
                        <div>
                          <p className="font-bold text-[#0F172A]">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.neighborhood || 'Bafoussam'}</p>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">{p.category}</td>
                      <td className="p-3.5 font-black text-[#16A34A]">{p.price?.toLocaleString()} FCFA</td>
                      <td className="p-3.5 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          (p.stock || 10) < 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.stock || 12} en stock
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
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

            {/* Modal Modification Produit */}
            {editingProduct && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-sm text-[#0F172A]">Modifier Produit</h3>
                    <button onClick={() => setEditingProduct(null)} className="p-1 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nom du produit</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Prix (FCFA)</label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setEditingProduct(null)} className="px-4 py-2 text-xs font-bold text-slate-500">Annuler</button>
                    <button
                      onClick={() => {
                        setLocalProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
                        setEditingProduct(null);
                      }}
                      className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Confirmation Suppression */}
            {deleteConfirmId && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center">
                  <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
                  <h3 className="font-black text-sm text-[#0F172A]">Supprimer ce produit ?</h3>
                  <p className="text-xs text-slate-500">Cette action est irréversible et retirera le produit de la vitrine Bafoussam.</p>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">Annuler</button>
                    <button onClick={() => handleDeleteProduct(deleteConfirmId)} className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl">Supprimer</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. GESTION DES STOCKS */}
        {activeTab === 'stocks' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Gestion Précise des Quantités & Stocks</h2>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
              {localProducts.map((p) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 object-cover rounded-xl" />
                    <div>
                      <p className="font-bold text-xs text-[#0F172A]">{p.name}</p>
                      <p className="text-[10px] text-slate-400">Stock actuel: <span className="font-black text-slate-700">{p.stock || 12}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Nouv. stock"
                      value={stockUpdates[p.id] ?? ''}
                      onChange={(e) => setStockUpdates({ ...stockUpdates, [p.id]: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                    />
                    <button
                      onClick={() => handleSaveStock(p.id)}
                      className="px-3 py-1 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Mettre à jour
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. COMMANDES REÇUES */}
        {activeTab === 'commandes_recues' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Commandes Reçues ({pendingOrders.length})</h2>
            {pendingOrders.length > 0 ? (
              <div className="space-y-3">
                {pendingOrders.map((o) => (
                  <div key={o.id} className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-mono text-xs font-black text-[#0F172A]">Commande #{o.id}</span>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full">À préparer</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Client: {o.userName || 'Mireille T.'}</span>
                      <span className="font-black text-[#16A34A]">{o.total ? o.total.toLocaleString() : '12 500'} FCFA</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer">
                        Accepter & Confirmer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">Toutes les commandes reçues ont été traitées !</p>
              </div>
            )}
          </div>
        )}

        {/* 6. COMMANDES EN COURS */}
        {activeTab === 'commandes_encours' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Commandes en Cours de Livraison</h2>
            {deliveringOrders.length > 0 ? (
              <div className="space-y-3">
                {deliveringOrders.map((o) => (
                  <div key={o.id} className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                    <span className="font-mono text-xs font-black">Commande #{o.id}</span>
                    <p className="text-xs text-slate-500">Livreur AfriNova en cours d'acheminement vers Tamdja.</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">Aucune livraison actuellement en cours.</p>
              </div>
            )}
          </div>
        )}

        {/* 7. LIVRAISONS */}
        {activeTab === 'livraisons' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Partenariat & Logistique Livraisons</h2>
            <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl space-y-3">
              <Truck className="w-8 h-8 text-[#16A34A]" />
              <h3 className="font-black text-sm">Service Livreurs Express Bafoussam</h3>
              <p className="text-xs text-slate-300">Les livreurs partenaires AfriNova récupèrent vos colis directement à votre boutique au Marché A ou Kamkop.</p>
            </div>
          </div>
        )}

        {/* 8. CLIENTS */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Base Clients de la Boutique</h2>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3">
              {[
                { name: 'Mireille Talla', orders: 8, location: 'Tamdja', totalSpent: '124 000 FCFA' },
                { name: 'Emmanuel Kamga', orders: 5, location: 'Kamkop', totalSpent: '82 500 FCFA' },
                { name: 'Danielle Nguemo', orders: 12, location: 'Marché A', totalSpent: '210 000 FCFA' }
              ].map((c, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#0F172A]">{c.name}</p>
                    <p className="text-[10px] text-slate-400">{c.location} • {c.orders} commandes</p>
                  </div>
                  <span className="font-black text-[#16A34A]">{c.totalSpent}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. MESSAGES */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-3xl border border-slate-100 space-y-2">
              <h3 className="font-black text-xs text-[#0F172A] px-2 py-1">Conversations Clients</h3>
              {chatMessages.map((chat, idx) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(idx)}
                  className={`p-2.5 rounded-2xl cursor-pointer transition flex items-center gap-3 ${
                    selectedChat === idx ? 'bg-[#0F172A] text-white' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <img src={chat.avatar} alt={chat.clientName} className="w-8 h-8 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold truncate">{chat.clientName}</span>
                      <span className="opacity-60">{chat.lastTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 bg-white p-4 rounded-3xl border border-slate-100 flex flex-col justify-between min-h-[350px]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <img src={chatMessages[selectedChat].avatar} alt="" className="w-8 h-8 rounded-full" />
                  <span className="font-bold text-xs">{chatMessages[selectedChat].clientName}</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {chatMessages[selectedChat].history.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === 'boutique' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-2.5 rounded-2xl max-w-[80%] text-xs ${
                        m.sender === 'boutique' ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-800'
                      }`}>
                        <p>{m.text}</p>
                        <span className="text-[8px] opacity-70 block text-right mt-1">{m.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Répondre au client..."
                  className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                />
                <button onClick={handleSendReply} className="p-2 bg-[#16A34A] text-white rounded-xl cursor-pointer">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10. PROMOTIONS */}
        {activeTab === 'promotions' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Gestion des Offres Spéciales & Ventes Flash</h2>
            <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-3xl space-y-2">
              <h3 className="font-black text-sm text-amber-900">Offre Spéciale Marché A</h3>
              <p className="text-xs text-amber-800">Bénéficiez d'une visibilité prioritaire sur la page d'accueil client en publiant une promotion.</p>
            </div>
          </div>
        )}

        {/* 11. COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Création de Codes Promo & Coupons</h2>
            <div className="p-4 bg-white rounded-3xl border border-slate-100 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code (Ex: MARCHEA20)"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="px-3 py-2 border rounded-xl text-xs font-bold uppercase"
                />
                <input
                  type="text"
                  placeholder="Remise (Ex: 20%)"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="px-3 py-2 border rounded-xl text-xs font-bold"
                />
                <button onClick={handleAddCoupon} className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer">
                  Créer Coupon
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {coupons.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                    <span className="font-mono font-black text-indigo-600">{c.code}</span>
                    <span className="font-bold text-[#16A34A]">{c.discount} de réduction</span>
                    <span className="text-slate-400">Utilisations: {c.usage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 12. STATISTIQUES */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Statistiques Détallées Boutique</h2>
            <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-500">Taux de Conversion Ventes: <span className="text-[#16A34A] font-black">4.8%</span></p>
              <p className="text-xs font-bold text-slate-500">Nombre de Visites Boutique ce mois: <span className="text-indigo-600 font-black">3,420 vues</span></p>
            </div>
          </div>
        )}

        {/* 13. REVENUS */}
        {activeTab === 'revenus' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Compte Financier & Solde Boutique</h2>
            <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-3">
              <p className="text-xs text-slate-400 font-bold uppercase">Solde Total Disponible</p>
              <p className="text-3xl font-black text-[#16A34A]">1 420 000 FCFA</p>
              <p className="text-xs text-slate-300">Paiements sécurisés via MTN Mobile Money & Orange Money Cameroun.</p>
            </div>
          </div>
        )}

        {/* 14. RETRAITS */}
        {activeTab === 'retraits' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Demande de Retrait vers compte Mobile Money</h2>
            <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-4 max-w-md">
              <div className="flex gap-2">
                <button
                  onClick={() => setPayoutProvider('orange')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl cursor-pointer ${
                    payoutProvider === 'orange' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Orange Money
                </button>
                <button
                  onClick={() => setPayoutProvider('momo')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl cursor-pointer ${
                    payoutProvider === 'momo' ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-600'
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
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Numéro de téléphone récepteur</label>
                <input
                  type="tel"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>

              <button
                onClick={() => {
                  alert(`Demande de retrait de ${payoutAmount} FCFA vers ${payoutPhone} soumise !`);
                  setPayoutHistory(prev => [{ id: `RET-${Math.floor(Math.random()*900+100)}`, amount: `${Number(payoutAmount).toLocaleString()} FCFA`, date: 'Aujourd\'hui', status: 'En traitement', provider: payoutProvider === 'orange' ? 'Orange Money' : 'MTN Momo' }, ...prev]);
                }}
                className="w-full py-3 bg-[#16A34A] text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Confirmer le Retrait
              </button>
            </div>
          </div>
        )}

        {/* 15. ABONNEMENT */}
        {activeTab === 'abonnement' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Abonnement Vendeur Pro AfriNova</h2>
            <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-3">
              <span className="px-3 py-1 bg-emerald-50 text-[#16A34A] font-black text-xs rounded-full">Statut: Actif</span>
              <p className="text-xs text-slate-600">Votre abonnement mensuel Boutique Pro est valide jusqu'au <strong>31 Août 2026</strong>.</p>
            </div>
          </div>
        )}

        {/* 16. AVIS CLIENTS */}
        {activeTab === 'avis' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Avis & Évaluations des Clients</h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#0F172A]">{r.client}</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold text-xs text-slate-800">{r.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 17. PROFIL BOUTIQUE */}
        {activeTab === 'profil' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Informations de la Boutique</h2>
            <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-3 max-w-lg">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nom de la Boutique</label>
                <input type="text" defaultValue={myMerchant?.shopName || 'Boutique AfriNova Marché A'} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Quartier & Localisation</label>
                <input type="text" defaultValue={myMerchant?.location || 'Marché A, Bafoussam'} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
              </div>
              <button className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer">Enregistrer le profil</button>
            </div>
          </div>
        )}

        {/* 18. PARAMÈTRES */}
        {activeTab === 'parametres' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Paramètres du Compte Vendeur</h2>
            <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-2">
              <p className="text-xs text-slate-600">Notifications SMS et alertes de nouvelles commandes activées.</p>
            </div>
          </div>
        )}

        {/* 19. SUPPORT VENDEUR */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Support & Assistance Vendeur AfriNova</h2>
            <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-200 text-[#15803D] space-y-2">
              <PhoneCall className="w-6 h-6 text-[#16A34A]" />
              <h3 className="font-black text-sm">Ligne Directe Assistance Vendeurs</h3>
              <p className="text-xs">Besoin d'aide pour une commande ou un paiement ? Contactez notre support au <strong>+237 677 89 45 12</strong> (WhatsApp / Appel).</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
