import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Users, 
  Database, 
  Settings, 
  Search, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  Trash2, 
  TrendingUp, 
  ShieldCheck, 
  Lock,
  Plus,
  Eye,
  Key,
  ArrowRight,
  ShoppingBag,
  Tag,
  Truck,
  Package,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Store,
  Crown,
  FileText,
  Building2,
  Wrench,
  BadgeCheck,
  Globe,
  AlertCircle,
  UserCheck,
  UserX,
  Edit3,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Activity,
  Layers,
  HelpCircle,
  Bell,
  Clock,
  ShieldAlert,
  LogOut,
  Sparkles,
  BarChart3,
  Sliders
} from 'lucide-react';
import { User, Merchant, Product, Order, Review, SubscriptionPlan, AccountType } from '../types';
import { INITIAL_SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';
import { translations, Language } from '../translations';
import VerifiedBadge from './VerifiedBadge';

export type AdminRole = 
  | 'super_admin' 
  | 'certification_admin' 
  | 'marketplace_admin' 
  | 'finance_admin' 
  | 'support_admin';

interface AdminPanelProps {
  onClose: () => void;
  merchants: Merchant[];
  products: Product[];
  onUpdateMerchants: React.Dispatch<React.SetStateAction<Merchant[]>>;
  onUpdateProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currentUser?: User | null;
  onLogout?: () => void;
  onUpdateCurrentUser?: (user: User) => void;
  orders?: Order[];
  onUpdateOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  lang: Language;
}

export default function AdminPanel({ 
  onClose, 
  merchants, 
  products, 
  onUpdateMerchants, 
  onUpdateProducts,
  currentUser,
  onLogout,
  onUpdateCurrentUser,
  orders = [],
  onUpdateOrders,
  lang
}: AdminPanelProps) {
  // Active Admin Role State
  const [adminRole, setAdminRole] = useState<AdminRole>('super_admin');

  // Main 8 Category Navigation Tab State
  const [mainTab, setMainTab] = useState<
    'dashboard' | 'users' | 'verifications' | 'marketplace' | 'subscriptions' | 'orders' | 'security' | 'settings'
  >('dashboard');

  // Secondary/Hidden Sub-tabs for each Category
  const [usersSubTab, setUsersSubTab] = useState<'all' | 'client' | 'vendeur' | 'entreprise' | 'prestataire' | 'search' | 'manage'>('all');
  const [verifSubTab, setVerifSubTab] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [marketSubTab, setMarketSubTab] = useState<'products' | 'services' | 'categories' | 'flagged'>('products');
  const [subscribSubTab, setSubscribSubTab] = useState<'client' | 'vendeur' | 'entreprise' | 'prestataire' | 'history'>('vendeur');
  const [ordersSubTab, setOrdersSubTab] = useState<'all' | 'tracking' | 'couriers' | 'issues'>('all');
  const [securitySubTab, setSecuritySubTab] = useState<'reports' | 'disputes' | 'threats' | 'audit_logs'>('audit_logs');
  const [settingsSubTab, setSettingsSubTab] = useState<'roles' | 'permissions' | 'general'>('roles');

  // Interactive Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'client' | 'vendeur' | 'entreprise' | 'prestataire'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled'>('all');
  const [selectedUserModal, setSelectedUserModal] = useState<User | null>(null);
  const [editUserModal, setEditUserModal] = useState<User | null>(null);
  const [rejectionModalMerchant, setRejectionModalMerchant] = useState<Merchant | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [infoRequestText, setInfoRequestText] = useState('');
  const [selectedMerchantModal, setSelectedMerchantModal] = useState<Merchant | null>(null);

  // Platform Commission Rate State
  const [commRate, setCommRate] = useState(() => parseFloat(localStorage.getItem('bafoussam_commission_rate') || '10'));

  // Subscription Plans
  const [adminPlans] = useState<SubscriptionPlan[]>(INITIAL_SUBSCRIPTION_PLANS);

  // Registered Users Persistence
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_all_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    // Default initial mock users
    return [
      { id: 'usr-101', name: 'Danielle Nji', phone: '+237 690001122', email: 'danielle@afrinova.cm', accountType: 'vendeur', isSubscribed: true, subscriptionExpiryDate: '2026-12-31' },
      { id: 'usr-[#102]', name: 'Samuel Bafoussam', phone: '+237 677889900', email: 'samuel@gmail.com', accountType: 'client', isSubscribed: true, subscriptionExpiryDate: '2026-09-15' },
      { id: 'usr-103', name: 'Ets Bâtiment Ouest', phone: '+237 655443322', email: 'contact@batiment-ouest.cm', accountType: 'entreprise', isSubscribed: true, subscriptionExpiryDate: '2027-01-01' },
      { id: 'usr-104', name: 'Kenfack Plomberie', phone: '+237 699112233', email: 'kenfack@pro.cm', accountType: 'prestataire', isSubscribed: true, subscriptionExpiryDate: '2026-10-30' },
      { id: 'usr-105', name: 'Boutique Tamdja Mode', phone: '+237 670112244', email: 'tamdja@mode.cm', accountType: 'vendeur', isSubscribed: false },
    ];
  });

  // Admin Action Audit Logs State
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'success' | 'warn' | 'error'; admin: string }>>(() => {
    const now = new Date().toLocaleTimeString('fr-FR');
    return [
      { id: '1', time: now, msg: 'Nouvel espace Administrateur Afrinova initialisé avec succès.', type: 'success', admin: 'Super Admin' },
      { id: '2', time: now, msg: 'Passerelle de paiement MoMo & Orange Money synchronisée (100%).', type: 'info', admin: 'System' },
      { id: '3', time: now, msg: 'Module de certification Afrinova Verified opérationnel.', type: 'success', admin: 'Certification Admin' },
    ];
  });

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const now = new Date().toLocaleTimeString('fr-FR');
    const newLog = {
      id: Date.now().toString(),
      time: now,
      msg,
      type,
      admin: adminRole === 'super_admin' ? 'Super Admin' : adminRole.replace('_', ' ').toUpperCase()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Derived Statistics
  const stats = useMemo(() => {
    const clients = allUsers.filter(u => u.accountType === 'client');
    const vendeurs = merchants;
    const entreprises = allUsers.filter(u => u.accountType === 'entreprise');
    const prestataires = allUsers.filter(u => u.accountType === 'prestataire');
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenues = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const pendingVerifs = merchants.filter(m => m.verificationStatus === 'pending_verification' || (!m.isVerified && m.verificationStatus !== 'rejected'));

    return {
      clientsCount: clients.length,
      vendeursCount: vendeurs.length,
      entreprisesCount: entreprises.length,
      prestatairesCount: prestataires.length,
      productsCount: totalProducts,
      ordersCount: totalOrders,
      revenues: totalRevenues,
      pendingVerifsCount: pendingVerifs.length,
    };
  }, [allUsers, merchants, products, orders]);

  // Role Permissions Guard Matrix
  const isTabAllowedForRole = (tab: string): boolean => {
    if (adminRole === 'super_admin') return true;
    switch (adminRole) {
      case 'certification_admin':
        return ['dashboard', 'verifications', 'settings'].includes(tab);
      case 'marketplace_admin':
        return ['dashboard', 'marketplace', 'orders', 'settings'].includes(tab);
      case 'finance_admin':
        return ['dashboard', 'subscriptions', 'orders', 'settings'].includes(tab);
      case 'support_admin':
        return ['dashboard', 'users', 'security', 'settings'].includes(tab);
      default:
        return true;
    }
  };

  // User Actions
  const handleToggleSuspendUser = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextState = !u.isSubscribed; // suspended flag toggle
        addLog(`Compte utilisateur ${u.name} (${u.phone}) ${nextState ? 'réactivé' : 'suspendu'}.`, nextState ? 'success' : 'warn');
        return { ...u, isSubscribed: nextState };
      }
      return u;
    }));
  };

  const handleExtendUserSubscription = (userId: string, days: number) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const currentMs = u.subscriptionExpiryDate ? new Date(u.subscriptionExpiryDate).getTime() : Date.now();
        const baseMs = currentMs < Date.now() ? Date.now() : currentMs;
        const newExpiry = new Date(baseMs + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        addLog(`Abonnement de ${u.name} prolongé de ${days} jours. Nouvelle date : ${newExpiry}`, 'success');
        return { ...u, isSubscribed: true, subscriptionExpiryDate: newExpiry };
      }
      return u;
    }));
  };

  const handleDeleteUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    if (confirm(`⚠️ Supprimer définitivement l'utilisateur "${user.name}" ? Cette action est irréversible.`)) {
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      addLog(`Utilisateur "${user.name}" supprimé du système par l'administrateur.`, 'warn');
      if (selectedUserModal?.id === userId) setSelectedUserModal(null);
    }
  };

  // Shop & Entity Certification Actions
  const handleApproveCertification = (merchantId: string) => {
    const certDate = new Date().toISOString();
    onUpdateMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        addLog(`Certification validée pour "${m.shopName}". Status: Certifié Afrinova. Badge attribué le ${new Date().toLocaleDateString('fr-FR')}.`, 'success');
        return {
          ...m,
          isVerified: true,
          verificationStatus: 'verified',
          certificationDate: certDate,
          rejectionReason: undefined
        };
      }
      return m;
    }));

    // Also sync user state if present
    setAllUsers(prev => prev.map(u => {
      if (u.id === merchantId || u.name === merchantId || (u.phone && merchants.find(m => m.id === merchantId)?.phone === u.phone)) {
        return { ...u, isVerified: true, certificationDate: certDate };
      }
      return u;
    }));
  };

  const handleRejectCertification = (merchantId: string) => {
    if (!rejectionReasonText.trim()) {
      alert("Veuillez indiquer un motif clair de refus.");
      return;
    }
    onUpdateMerchants(prev => prev.map(m => {
      if (m.id === merchantId) {
        addLog(`Certification refusée pour "${m.shopName}". Motif : "${rejectionReasonText}"`, 'warn');
        return {
          ...m,
          isVerified: false,
          verificationStatus: 'rejected',
          rejectionReason: rejectionReasonText
        };
      }
      return m;
    }));
    setRejectionModalMerchant(null);
    setRejectionReasonText('');
  };

  const handleRevokeCertification = (merchantId: string) => {
    const m = merchants.find(item => item.id === merchantId);
    if (!m) return;
    if (confirm(`Voulez-vous vraiment passer le statut de "${m.shopName}" de Certifié à Standard ?`)) {
      onUpdateMerchants(prev => prev.map(item => {
        if (item.id === merchantId) {
          addLog(`Statut de "${m.shopName}" changé : Certifié → Standard. Badge retiré.`, 'warn');
          return { ...item, isVerified: false, certificationDate: undefined, verificationStatus: 'pending_verification' };
        }
        return item;
      }));

      // Also sync user state
      setAllUsers(prev => prev.map(u => {
        if (u.id === merchantId || u.name === m.ownerName || (u.phone && m.phone === u.phone)) {
          return { ...u, isVerified: false, certificationDate: undefined };
        }
        return u;
      }));
    }
  };

  const handleToggleUserCertification = (userId: string) => {
    const u = allUsers.find(item => item.id === userId);
    if (!u) return;

    const nextVerified = !u.isVerified;
    const certDate = nextVerified ? new Date().toISOString() : undefined;

    setAllUsers(prev => prev.map(user => {
      if (user.id === userId) {
        addLog(`Profil de "${user.name}" (${user.accountType || 'compte'}) mis à jour : ${nextVerified ? 'Standard → Certifié Afrinova' : 'Certifié → Standard'}.`, nextVerified ? 'success' : 'warn');
        return { ...user, isVerified: nextVerified, certificationDate: certDate };
      }
      return user;
    }));

    // Update merchant record if exists
    onUpdateMerchants(prev => prev.map(m => {
      if (m.id === userId || m.ownerName === u.name || (m.phone && m.phone === u.phone)) {
        return {
          ...m,
          isVerified: nextVerified,
          verificationStatus: nextVerified ? 'verified' : 'pending_verification',
          certificationDate: certDate
        };
      }
      return m;
    }));

    if (selectedUserModal?.id === userId) {
      setSelectedUserModal(prev => prev ? {
        ...prev,
        isVerified: nextVerified,
        certificationDate: certDate
      } : null);
    }
  };

  const handleRequestMoreInfo = (merchantId: string) => {
    if (!infoRequestText.trim()) return;
    const m = merchants.find(item => item.id === merchantId);
    if (m) {
      addLog(`Demande de précisions envoyée à "${m.shopName}" : "${infoRequestText}"`, 'info');
      alert(`Message transmis au responsable de ${m.shopName}.`);
      setInfoRequestText('');
    }
  };

  // Marketplace Content Control
  const handleToggleProductBoost = (productId: string) => {
    onUpdateProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextState = !p.isBoosted;
        addLog(`Produit "${p.name}" ${nextState ? 'mis en avant sur la Marketplace' : 'retiré des tendances'}.`, 'info');
        return { ...p, isBoosted: nextState };
      }
      return p;
    }));
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    if (confirm(`Supprimer le produit non conforme "${prod.name}" ?`)) {
      onUpdateProducts(prev => prev.filter(p => p.id !== productId));
      addLog(`Produit non conforme "${prod.name}" supprimé par l'administration.`, 'warn');
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = (orderId: string, status: any) => {
    if (onUpdateOrders) {
      onUpdateOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          addLog(`Commande #${orderId.slice(-6)} passée au statut : ${status}`, 'info');
          return { ...o, status };
        }
        return o;
      }));
    }
  };

  const mainNavigationItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3, badge: stats.pendingVerifsCount > 0 ? stats.pendingVerifsCount : undefined },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'verifications', label: 'Certification des boutiques', icon: BadgeCheck, badge: stats.pendingVerifsCount > 0 ? stats.pendingVerifsCount : undefined, highlight: true },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
    { id: 'orders', label: 'Commandes & Livraison', icon: Truck, badge: orders.filter(o => o.status !== 'completed').length || undefined },
    { id: 'security', label: 'Sécurité & Support', icon: ShieldCheck },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-[#16A34A] selection:text-white">
      
      {/* HEADER BAR ADMIN */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16A34A] to-emerald-400 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white font-display">Afrinova Control Center</h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                LIVE ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Centre de contrôle unifié & gestion multi-rôles</p>
          </div>
        </div>

        {/* ROLE SWITCHER & CLOSE BTN */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-2xl">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 font-bold hidden sm:inline">Rôle :</span>
            <select
              value={adminRole}
              onChange={(e) => {
                const nextRole = e.target.value as AdminRole;
                setAdminRole(nextRole);
                addLog(`Passage au rôle administrateur : ${nextRole.toUpperCase()}`, 'info');
              }}
              className="bg-slate-900 text-emerald-400 font-black text-xs border border-slate-700 rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="super_admin">👑 Super Administrateur</option>
              <option value="certification_admin">🛡️ Admin Certification</option>
              <option value="marketplace_admin">🛒 Admin Marketplace</option>
              <option value="finance_admin">💰 Admin Finance</option>
              <option value="support_admin">🎧 Admin Support</option>
            </select>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2 rounded-2xl transition cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <span>Quitter l'Admin</span>
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* 8 CATEGORY MAIN NAVIGATION BAR (RESPONSIVE HORIZONTAL PILLS) */}
        <nav className="mb-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto scrollbar-none shadow-lg">
          {mainNavigationItems.map((item) => {
            const IconComp = item.icon;
            const isSelected = mainTab === item.id;
            const isAllowed = isTabAllowedForRole(item.id);

            return (
              <button
                key={item.id}
                disabled={!isAllowed}
                onClick={() => isAllowed && setMainTab(item.id as any)}
                className={`relative px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2.5 shrink-0 transition cursor-pointer ${
                  !isAllowed 
                    ? 'opacity-40 cursor-not-allowed text-slate-500' 
                    : isSelected
                    ? 'bg-gradient-to-r from-[#16A34A] to-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>

                {!isAllowed && <Lock className="w-3 h-3 text-slate-500 ml-1" />}

                {item.badge && isAllowed && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-white text-emerald-800' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* CONTENT AREA BASED ON MAIN TAB */}
        <main>
          <AnimatePresence mode="wait">

            {/* 1. TABLEAU DE BORD */}
            {mainTab === 'dashboard' && (
              <motion.div
                key="dash-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* 8 KEY METRICS CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Clients</span>
                      <Users className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-2xl font-mono font-black text-white">{stats.clientsCount}</p>
                    <span className="text-[10px] text-slate-500 block">Comptes acheteurs</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Boutiques</span>
                      <Store className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-mono font-black text-white">{stats.vendeursCount}</p>
                    <span className="text-[10px] text-emerald-400 block">{stats.pendingVerifsCount} en attente certification</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Entreprises</span>
                      <Building2 className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-mono font-black text-white">{stats.entreprisesCount}</p>
                    <span className="text-[10px] text-slate-500 block">Comptes B2B</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Prestataires</span>
                      <Wrench className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-mono font-black text-white">{stats.prestatairesCount}</p>
                    <span className="text-[10px] text-slate-500 block">Services certifiés</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Produits</span>
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-mono font-black text-white">{stats.productsCount}</p>
                    <span className="text-[10px] text-slate-500 block">Annonces actives</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Commandes</span>
                      <ShoppingBag className="w-4 h-4 text-sky-400" />
                    </div>
                    <p className="text-2xl font-mono font-black text-white">{stats.ordersCount}</p>
                    <span className="text-[10px] text-slate-500 block">Transactions globales</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Revenus</span>
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xl font-mono font-black text-emerald-400">{stats.revenues.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">FCFA</span></p>
                    <span className="text-[10px] text-slate-500 block">Volume traité</span>
                  </div>

                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-md space-y-1 bg-amber-500/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Alertes</span>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-mono font-black text-amber-400">{stats.pendingVerifsCount}</p>
                    <span className="text-[10px] text-amber-300 block">Action requise</span>
                  </div>
                </div>

                {/* QUICK ACTION BANNER & CERTIFICATION PREVIEW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending Verifications Widget */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-extrabold text-sm text-white">Demandes de certification récentes</h3>
                      </div>
                      <button 
                        onClick={() => setMainTab('verifications')}
                        className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Tout voir</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {merchants.filter(m => !m.isVerified).slice(0, 3).map(m => (
                        <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-emerald-400 text-sm border border-slate-700">
                              {m.shopName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-white">{m.shopName}</h4>
                              <p className="text-[10px] text-slate-400">{m.ownerName} • {m.location}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedMerchantModal(m);
                              setMainTab('verifications');
                            }}
                            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 cursor-pointer transition"
                          >
                            Examiner
                          </button>
                        </div>
                      ))}
                      {merchants.filter(m => !m.isVerified).length === 0 && (
                        <p className="text-xs text-slate-500 py-4 text-center">Toutes les boutiques soumises ont été traitées !</p>
                      )}
                    </div>
                  </div>

                  {/* System Audit Activity Stream */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-extrabold text-sm text-white">Journal d'activités système</h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">EN DIRECT</span>
                    </div>

                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-none">
                      {logs.slice(0, 5).map(log => (
                        <div key={log.id} className="text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            log.type === 'success' ? 'bg-emerald-400' : log.type === 'warn' ? 'bg-amber-400' : 'bg-indigo-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-[11px] font-medium leading-snug">{log.msg}</p>
                            <div className="flex items-center gap-2 text-[9px] text-slate-500 mt-1 font-mono">
                              <span>{log.time}</span>
                              <span>•</span>
                              <span>{log.admin}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. UTILISATEURS */}
            {mainTab === 'users' && (
              <motion.div
                key="users-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* SUB-MENU TABS FOR UTILISATEURS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
                  {[
                    { id: 'all', label: 'Tous les comptes' },
                    { id: 'client', label: 'Clients' },
                    { id: 'vendeur', label: 'Boutiques / Vendeurs' },
                    { id: 'entreprise', label: 'Entreprises' },
                    { id: 'prestataire', label: 'Prestataires' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setUsersSubTab(sub.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                        usersSubTab === sub.id
                          ? 'bg-slate-100 text-slate-950 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* SEARCH & FILTERS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Rechercher nom, téléphone, e-mail..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {allUsers.length} utilisateurs enregistrés
                  </span>
                </div>

                {/* USERS TABLE */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/80 text-[10px] font-black uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">Utilisateur / Nom</th>
                          <th className="p-3.5">Téléphone</th>
                          <th className="p-3.5">Profil</th>
                          <th className="p-3.5">Statut Compte</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {allUsers
                          .filter(u => {
                            if (usersSubTab !== 'all' && u.accountType !== usersSubTab) return false;
                            const query = searchTerm.toLowerCase();
                            return u.name.toLowerCase().includes(query) || u.phone.includes(query) || (u.email && u.email.toLowerCase().includes(query));
                          })
                          .map(user => (
                            <tr key={user.id} className="hover:bg-slate-800/40 transition">
                              <td className="p-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-slate-800 font-extrabold text-emerald-400 flex items-center justify-center text-xs border border-slate-700">
                                    {user.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-extrabold text-white block">{user.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">ID: {user.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 font-mono text-slate-300">{user.phone}</td>
                              <td className="p-3.5">
                                <span className="uppercase text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                                  {user.accountType}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  user.isSubscribed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                }`}>
                                  {user.isSubscribed ? 'Actif / Validé' : 'Suspendu / Expiré'}
                                </span>
                              </td>
                              <td className="p-3.5 text-right space-x-2">
                                <button
                                  onClick={() => setSelectedUserModal(user)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg cursor-pointer transition"
                                >
                                  Voir Profil
                                </button>
                                <button
                                  onClick={() => handleToggleSuspendUser(user.id)}
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition ${
                                    user.isSubscribed ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                  }`}
                                >
                                  {user.isSubscribed ? 'Suspendre' : 'Réactiver'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer transition inline-block align-middle"
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
              </motion.div>
            )}

            {/* 3. CERTIFICATION DES BOUTIQUES */}
            {mainTab === 'verifications' && (
              <motion.div
                key="verif-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* SUB-MENU TABS */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setVerifSubTab('pending')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                      verifSubTab === 'pending'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>Demandes en attente</span>
                    <span className="bg-slate-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      {merchants.filter(m => !m.isVerified && m.verificationStatus !== 'rejected').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setVerifSubTab('verified')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                      verifSubTab === 'verified'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>Boutiques Certifiées</span>
                    <span className="bg-slate-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      {merchants.filter(m => m.isVerified).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setVerifSubTab('rejected')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                      verifSubTab === 'rejected'
                        ? 'bg-rose-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>Demandes refusées</span>
                    <span className="bg-slate-950 text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      {merchants.filter(m => m.verificationStatus === 'rejected').length}
                    </span>
                  </button>
                </div>

                {/* MERCHANT CERTIFICATION LIST */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {merchants
                    .filter(m => {
                      if (verifSubTab === 'pending') return !m.isVerified && m.verificationStatus !== 'rejected';
                      if (verifSubTab === 'verified') return m.isVerified;
                      if (verifSubTab === 'rejected') return m.verificationStatus === 'rejected';
                      return true;
                    })
                    .map(m => (
                      <div key={m.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-emerald-400 text-base">
                              {m.shopName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-white text-base">{m.shopName}</h3>
                                {m.isVerified && <VerifiedBadge isVerified={true} role="vendeur" size="sm" />}
                              </div>
                              <p className="text-xs text-slate-400">Responsable : {m.ownerName}</p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                <span>{m.location}</span>
                                <span>•</span>
                                <Phone className="w-3 h-3 text-indigo-400" />
                                <span>{m.phone}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                          <p className="text-slate-400"><strong className="text-slate-200">Statut actuel :</strong> <span className={m.isVerified ? "text-emerald-400 font-extrabold" : "text-slate-400 font-bold"}>{m.isVerified ? "PROFIL CERTIFIÉ (Afrinova Verified)" : "PROFIL STANDARD"}</span></p>
                          {m.isVerified && m.certificationDate && (
                            <p className="text-emerald-400 text-[11px] font-mono"><strong className="text-slate-200">Date de certification :</strong> {new Date(m.certificationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                          )}
                          <p className="text-slate-400"><strong className="text-slate-200">Produits publiés :</strong> {products.filter(p => p.merchantId === m.id).length} articles</p>
                          <p className="text-slate-400"><strong className="text-slate-200">Note moyenne :</strong> ⭐ {m.rating || '4.8'} / 5.0</p>
                          {m.rejectionReason && (
                            <p className="text-rose-400 font-bold"><strong className="text-slate-200">Motif du refus :</strong> {m.rejectionReason}</p>
                          )}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 flex-wrap">
                          {!m.isVerified && (
                            <button
                              onClick={() => handleApproveCertification(m.id)}
                              className="flex-1 bg-gradient-to-r from-[#16A34A] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Passer en Certifié (Standard → Certifié)</span>
                            </button>
                          )}

                          {m.isVerified && (
                            <button
                              onClick={() => handleRevokeCertification(m.id)}
                              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>Rétrograder en Standard (Certifié → Standard)</span>
                            </button>
                          )}

                          {!m.isVerified && m.verificationStatus !== 'rejected' && (
                            <button
                              onClick={() => setRejectionModalMerchant(m)}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs py-2 px-3 rounded-xl transition cursor-pointer"
                            >
                              Refuser
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* 4. MARKETPLACE */}
            {mainTab === 'marketplace' && (
              <motion.div
                key="market-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* SUB TABS */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  {[
                    { id: 'products', label: 'Produits' },
                    { id: 'services', label: 'Services' },
                    { id: 'categories', label: 'Catégories' },
                    { id: 'flagged', label: 'Annonces signalées' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setMarketSubTab(sub.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        marketSubTab === sub.id
                          ? 'bg-slate-100 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* PRODUCTS LIST CONTROL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 shadow-md">
                      <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs text-white truncate">{p.name}</h4>
                        <p className="text-[11px] font-mono font-bold text-emerald-400 mt-0.5">{p.price.toLocaleString('fr-FR')} FCFA</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.category}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleToggleProductBoost(p.id)}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition ${
                              p.isBoosted ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p.isBoosted ? '⭐ Mis en avant' : 'Normal'}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-rose-400 hover:text-rose-300 text-[10px] font-bold cursor-pointer"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 5. ABONNEMENTS */}
            {mainTab === 'subscriptions' && (
              <motion.div
                key="subscrib-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                {/* SUBSCRIPTION TABS */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  {[
                    { id: 'vendeur', label: 'Vendeurs / Boutiques' },
                    { id: 'entreprise', label: 'Entreprises' },
                    { id: 'prestataire', label: 'Prestataires' },
                    { id: 'client', label: 'Clients' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setSubscribSubTab(sub.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        subscribSubTab === sub.id
                          ? 'bg-slate-100 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* DISPLAY EXISTING PLANS WITHOUT ALTERING PRICES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {adminPlans.map(plan => (
                    <div key={plan.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          {plan.id}
                        </span>
                        <Crown className="w-4 h-4 text-amber-400" />
                      </div>
                      <h3 className="font-extrabold text-sm text-white">{plan.name}</h3>
                      <div className="text-xl font-mono font-black text-white">
                        {plan.monthlyPrice.toLocaleString('fr-FR')} <span className="text-xs text-slate-400">FCFA / mois</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{plan.description}</p>
                    </div>
                  ))}
                </div>

                {/* USER SUBSCRIBERS EXTENSION CONTROL TABLE */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-sm text-white">Gestion des abonnements actifs</h3>
                  <div className="space-y-2">
                    {allUsers.filter(u => u.accountType === subscribSubTab || (subscribSubTab === 'vendeur' && u.accountType === 'vendeur')).map(u => (
                      <div key={u.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">{u.name} ({u.phone})</p>
                          <p className="text-[10px] text-slate-400">Expiration : {u.subscriptionExpiryDate || 'Non renseignée'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExtendUserSubscription(u.id, 30)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            +30 Jours
                          </button>
                          <button
                            onClick={() => handleExtendUserSubscription(u.id, 90)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            +90 Jours
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. COMMANDES & LIVRAISON */}
            {mainTab === 'orders' && (
              <motion.div
                key="orders-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
                  <h3 className="font-extrabold text-sm text-white">Suivi centralisé des commandes & livraisons</h3>
                  
                  <div className="space-y-3">
                    {orders.map(o => (
                      <div key={o.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-emerald-400">#{o.id.slice(-6)}</span>
                          <span className="font-mono text-slate-300 font-bold">{o.total.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <p className="text-xs text-slate-300">Client : {o.userName} ({o.paymentPhone})</p>
                        <p className="text-[11px] text-slate-400">Quartier : {o.deliveryNeighborhood}</p>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400">Statut :</span>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-slate-900 text-xs text-emerald-400 border border-slate-700 rounded-lg px-2 py-1 cursor-pointer font-bold"
                          >
                            <option value="pending">En attente</option>
                            <option value="preparing">En préparation</option>
                            <option value="delivering">En livraison (Moto)</option>
                            <option value="completed">Livrée & Terminée</option>
                            <option value="cancelled">Annulée</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-xs text-slate-500 py-6 text-center">Aucune commande enregistrée pour le moment.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. SÉCURITÉ & SUPPORT */}
            {mainTab === 'security' && (
              <motion.div
                key="security-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-extrabold text-sm text-white">Journal d'Audit Administrateur</h3>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {logs.map(log => (
                      <div key={log.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs flex items-center justify-between">
                        <div>
                          <p className="text-slate-200 font-medium">{log.msg}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{log.time} • {log.admin}</span>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {log.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. PARAMÈTRES */}
            {mainTab === 'settings' && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-6"
              >
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <h3 className="font-extrabold text-base text-white">Gestion des rôles administrateurs</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="font-bold text-emerald-400 text-sm">👑 Super Administrateur</h4>
                      <p className="text-slate-400">Accès illimité à toutes les fonctionnalités et configurations système.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="font-bold text-amber-400 text-sm">🛡️ Admin Certification</h4>
                      <p className="text-slate-400">Accès restreint aux vérifications CNI et attribution des badges "Afrinova Verified".</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="font-bold text-blue-400 text-sm">🛒 Admin Marketplace</h4>
                      <p className="text-slate-400">Accès au contrôle des produits, annonces et modération du catalogue.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="font-bold text-purple-400 text-sm">💰 Admin Finance</h4>
                      <p className="text-slate-400">Accès aux abonnements, commissions et suivi des revenus.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* REJECTION MODAL */}
      {rejectionModalMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Refuser la certification de {rejectionModalMerchant.shopName}</h3>
            <textarea
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              placeholder="Saisissez le motif précis (ex: CNI lisible requise, document expiré...)"
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-3 rounded-xl h-24 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectionModalMerchant(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleRejectCertification(rejectionModalMerchant.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAIL MODAL */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Profil de {selectedUserModal.name}</h3>
                {selectedUserModal.isVerified && (
                  <VerifiedBadge isVerified={true} role={selectedUserModal.accountType} size="sm" certificationDate={selectedUserModal.certificationDate} />
                )}
              </div>
              <button onClick={() => setSelectedUserModal(null)} className="text-slate-400 hover:text-white cursor-pointer font-bold">✕</button>
            </div>
            <div className="space-y-2.5 text-slate-300">
              <p><strong>Téléphone :</strong> {selectedUserModal.phone}</p>
              <p><strong>E-mail :</strong> {selectedUserModal.email || 'Non renseigné'}</p>
              <p><strong>Type de Profil :</strong> <span className="uppercase font-bold text-emerald-400">{selectedUserModal.accountType || 'client'}</span></p>
              <p><strong>Statut Abonnement :</strong> {selectedUserModal.isSubscribed ? 'Actif' : 'Inactif / Suspendu'}</p>
              
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-400 uppercase text-[10px]">Statut Certification Afrinova</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    selectedUserModal.isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {selectedUserModal.isVerified ? 'Profil Certifié' : 'Profil Standard'}
                  </span>
                </div>
                {selectedUserModal.isVerified && selectedUserModal.certificationDate && (
                  <p className="text-[10px] text-emerald-300 font-mono">
                    Certifié le : {new Date(selectedUserModal.certificationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                )}
                <p className="text-[10px] text-slate-400">
                  {selectedUserModal.isVerified 
                    ? 'Ce profil bénéficie du badge "Afrinova Verified" et d\'une meilleure visibilité dans les recherches.'
                    : 'Profil standard sans badge. Vous pouvez lui attribuer la certification Afrinova ci-dessous.'}
                </p>
              </div>
            </div>

            {/* Certification Toggle Button */}
            {['vendeur', 'entreprise', 'prestataire'].includes(selectedUserModal.accountType || '') && (
              <button
                onClick={() => handleToggleUserCertification(selectedUserModal.id)}
                className={`w-full py-2.5 font-extrabold text-xs rounded-xl cursor-pointer transition shadow-sm flex items-center justify-center gap-2 ${
                  selectedUserModal.isVerified
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {selectedUserModal.isVerified ? 'Changer en Profil Standard (Retirer Certification)' : 'Changer en Profil Certifié (Accorder Badge Afrinova Verified)'}
                </span>
              </button>
            )}

            <button
              onClick={() => setSelectedUserModal(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
