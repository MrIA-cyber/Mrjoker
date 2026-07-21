import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Code, 
  Users, 
  Database, 
  Settings, 
  Cpu, 
  Radio, 
  FileCode, 
  Search, 
  Save, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  PhoneCall, 
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
  Trash,
  Truck,
  Bike,
  Clock,
  Package
} from 'lucide-react';
import { User, Merchant, Product, Order } from '../types';
import VerifiedBadge from './VerifiedBadge';

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
  onUpdateOrders
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'merchants' | 'products' | 'logs' | 'settings' | 'verifications' | 'orders'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [merchantSearchTerm, setMerchantSearchTerm] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState<{[mId: string]: string}>({});

  const pendingVerificationsCount = merchants.filter(m => m.verificationStatus === 'pending_verification').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'completed').length;

  const handleApproveVerification = (mId: string) => {
    onUpdateMerchants(prev => {
      return prev.map(m => {
        if (m.id === mId) {
          const now = new Date().toLocaleTimeString('fr-FR');
          setLogs(prevLogs => [
            { id: Date.now().toString(), time: now, msg: `Boutique "${m.shopName}" approuvée avec succès. Statut de vérification mis à jour.`, type: 'success' },
            ...prevLogs
          ]);
          return { 
            ...m, 
            verificationStatus: 'verified', 
            isVerified: true 
          };
        }
        return m;
      });
    });
  };

  const handleRejectVerification = (mId: string) => {
    const reason = rejectionReasons[mId]?.trim();
    if (!reason) {
      alert("Veuillez indiquer un motif de refus pour guider le commerçant.");
      return;
    }

    onUpdateMerchants(prev => {
      return prev.map(m => {
        if (m.id === mId) {
          const now = new Date().toLocaleTimeString('fr-FR');
          setLogs(prevLogs => [
            { id: Date.now().toString(), time: now, msg: `Boutique "${m.shopName}" rejetée : "${reason}"`, type: 'warn' },
            ...prevLogs
          ]);
          return { 
            ...m, 
            verificationStatus: 'rejected', 
            isVerified: false,
            rejectionReason: reason 
          };
        }
        return m;
      });
    });
  };

  const handleUpdateOrderCourier = (orderId: string, name: string, phone: string) => {
    if (onUpdateOrders) {
      onUpdateOrders(prev => {
        return prev.map(o => {
          if (o.id === orderId) {
            return {
              ...o,
              courierName: name,
              courierPhone: phone
            };
          }
          return o;
        });
      });
    }
  };

  const handleUpdateOrderStatusDirect = (orderId: string, status: any) => {
    if (onUpdateOrders) {
      onUpdateOrders(prev => {
        return prev.map(o => {
          if (o.id === orderId) {
            const now = new Date().toLocaleTimeString('fr-FR');
            setLogs(prevLogs => [
              { id: Date.now().toString(), time: now, msg: `Statut de la commande #${orderId.slice(-6)} changé en "${status}" par l'administrateur.`, type: 'info' },
              ...prevLogs
            ]);
            return {
              ...o,
              status
            };
          }
          return o;
        });
      });
    }
  };

  // Simulated general settings
  const [serverPort, setServerPort] = useState('3000');
  const [isCachingEnabled, setIsCachingEnabled] = useState(true);
  const [logLevel, setLogLevel] = useState<'debug' | 'info' | 'warn' | 'error'>('info');
  const [paymentApiKey, setPaymentApiKey] = useState('momo_live_key_bafoussam_640406412');

  // Simulated file explorer
  const [selectedFileName, setSelectedFileName] = useState<'App.tsx' | 'StoreHeader.tsx' | 'DeliveryTracker.tsx' | 'types.ts'>('App.tsx');
  const [codeDrafts, setCodeDrafts] = useState<{ [key: string]: string }>({
    'App.tsx': `// Bafoussam Direct - Application principale
import React, { useState, useEffect } from 'react';
import { StoreHeader } from './components/StoreHeader';
import { DeliveryTracker } from './components/DeliveryTracker';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);
  
  // Moteur d'acheminement et fluidité automatique
  const optimizeRendering = () => {
    console.log("Fluidité de l'application optimisée à 100%");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHeader />
      <main className="max-w-7xl mx-auto py-6">
        {/* Navigation interactive du Marché A et Tamdja */}
      </main>
    </div>
  );
}`,
    'StoreHeader.tsx': `// En-tête de navigation de Bafoussam Direct
import React from 'react';
import { MapPin, ShoppingCart } from 'lucide-react';

export default function StoreHeader({ cartCount }) {
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
        <span className="font-bold">Bafoussam Direct</span>
        <div className="flex items-center gap-4">
          <span>Marché A • Support: 640 40 64 12</span>
        </div>
      </div>
    </header>
  );
}`,
    'DeliveryTracker.tsx': `// Suivi GPS en direct des livreurs par moto-taximan
import React, { useState, useEffect } from 'react';

export default function DeliveryTracker({ orders }) {
  const [motoPos, setMotoPos] = useState({ x: 150, y: 180 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animation de la moto sur la carte de Bafoussam
    const timer = setInterval(() => {
      setProgress(p => p < 100 ? p + 1 : 100);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-900 text-white p-6 rounded-3xl">
      <h3>Suivi de livraison en temps réel</h3>
    </div>
  );
}`,
    'types.ts': `// Définition des structures TypeScript pour la Mifi
export interface User {
  id: string;
  name: string;
  phone: string;
  isSubscribed: boolean;
}

export interface Merchant {
  id: string;
  shopName: string;
  location: string;
  isPremium: boolean;
}`
  });

  const [currentCodeContent, setCurrentCodeContent] = useState('');

  // Sync selected draft code
  useEffect(() => {
    setCurrentCodeContent(codeDrafts[selectedFileName]);
  }, [selectedFileName]);

  // Compiler states
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState('');
  const [compileSuccess, setCompileSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Local storage lists
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'success' | 'warn' | 'error' }>>([]);

  // Load registered users and set up mock logs
  useEffect(() => {
    const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
    if (savedUsersRaw) {
      setAllUsers(JSON.parse(savedUsersRaw));
    }

    // Set initial system logs
    const now = new Date().toLocaleTimeString('fr-FR');
    setLogs([
      { id: '1', time: now, msg: 'Système Bafoussam Direct initialisé.', type: 'success' },
      { id: '2', time: now, msg: 'Connexion sécurisée établie via le terminal administrateur Chris.', type: 'info' },
      { id: '3', time: now, msg: 'Passerelle de paiement MTN Mobile Money & Orange Money en ligne (100%).', type: 'success' },
      { id: '4', time: now, msg: 'Moteur de recommandation de la meilleure boutique de la Mifi opérationnel.', type: 'info' },
    ]);
  }, []);

  // System statistics
  const totalUsersCount = allUsers.length;
  const totalSalesVal = merchants.reduce((acc, m) => acc + m.sales, 0);
  const totalViewsVal = merchants.reduce((acc, m) => acc + m.views, 0);
  const totalClicksVal = merchants.reduce((acc, m) => acc + m.clicks, 0);

  // User management updates
  const handleToggleSub = (userId: string) => {
    const updated = allUsers.map(u => {
      if (u.id === userId) {
        const nextState = !u.isSubscribed;
        const now = new Date().toLocaleTimeString('fr-FR');
        
        // If enabling, extend date. If disabling, expire date.
        const nextDate = nextState 
          ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // yesterday

        setLogs(prev => [
          { id: Date.now().toString(), time: now, msg: `Abonnement de l'utilisateur ${u.name} mis à jour: ${nextState ? 'Actif' : 'Inactif'}`, type: 'info' },
          ...prev
        ]);
        
        const updatedUser = { 
          ...u, 
          isSubscribed: nextState,
          subscriptionExpiryDate: nextDate,
          hasPaidFee: nextState
        };

        if (currentUser && currentUser.id === userId && onUpdateCurrentUser) {
          onUpdateCurrentUser(updatedUser);
        }

        return updatedUser;
      }
      return u;
    });
    setAllUsers(updated);
    localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(updated));
  };

  const handleExtendSub = (userId: string, days: number) => {
    const updated = allUsers.map(u => {
      if (u.id === userId) {
        const currentExpiry = u.subscriptionExpiryDate ? new Date(u.subscriptionExpiryDate).getTime() : Date.now();
        const baseTime = currentExpiry < Date.now() ? Date.now() : currentExpiry;
        const nextDate = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString();
        const now = new Date().toLocaleTimeString('fr-FR');
        
        setLogs(prev => [
          { id: Date.now().toString(), time: now, msg: `Abonnement de l'utilisateur ${u.name} prolongé de ${days} jours.`, type: 'success' },
          ...prev
        ]);
        
        const updatedUser = {
          ...u,
          isSubscribed: true,
          subscriptionExpiryDate: nextDate,
          hasPaidFee: true
        };

        if (currentUser && currentUser.id === userId && onUpdateCurrentUser) {
          onUpdateCurrentUser(updatedUser);
        }

        return updatedUser;
      }
      return u;
    });
    setAllUsers(updated);
    localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(updated));
  };

  const handleExpireSub = (userId: string) => {
    const updated = allUsers.map(u => {
      if (u.id === userId) {
        const nextDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // yesterday
        const now = new Date().toLocaleTimeString('fr-FR');
        
        setLogs(prev => [
          { id: Date.now().toString(), time: now, msg: `Abonnement de l'utilisateur ${u.name} expiré immédiatement par l'administrateur.`, type: 'warn' },
          ...prev
        ]);
        
        const updatedUser = {
          ...u,
          isSubscribed: false,
          subscriptionExpiryDate: nextDate,
          hasPaidFee: false
        };

        if (currentUser && currentUser.id === userId && onUpdateCurrentUser) {
          onUpdateCurrentUser(updatedUser);
        }

        return updatedUser;
      }
      return u;
    });
    setAllUsers(updated);
    localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(updated));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Êtes-vous sûr de vouloir révoquer l'accès de cet abonné ?")) {
      const u = allUsers.find(item => item.id === userId);
      const updated = allUsers.filter(item => item.id !== userId);
      setAllUsers(updated);
      localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(updated));
      const now = new Date().toLocaleTimeString('fr-FR');
      setLogs(prev => [
        { id: Date.now().toString(), time: now, msg: `Compte de l'utilisateur ${u?.name || userId} supprimé définitivement.`, type: 'warn' },
        ...prev
      ]);
      
      // Si l'administrateur supprime son propre compte, le déconnecter
      if (currentUser && currentUser.id === userId && onLogout) {
        alert("Votre compte abonné actuel a été supprimé. Vous allez être déconnecté.");
        onLogout();
      }
    }
  };

  // Merchant space boost management
  const handleUpgradeMerchant = (mId: string) => {
    onUpdateMerchants(prev => {
      return prev.map(m => {
        if (m.id === mId) {
          const nextState = !m.isPremium;
          const now = new Date().toLocaleTimeString('fr-FR');
          setLogs(prevLogs => [
            { id: Date.now().toString(), time: now, msg: `Boutique ${m.shopName} mise à niveau: ${nextState ? 'MEMBRE ÉLITE' : 'CLASSIQUE'}`, type: 'success' },
            ...prevLogs
          ]);
          return { ...m, isPremium: nextState };
        }
        return m;
      });
    });

    // Also upgrade product boosts automatically if upgraded
    onUpdateProducts(prev => {
      return prev.map(p => {
        if (p.merchantId === mId) {
          return { ...p, isBoosted: true };
        }
        return p;
      });
    });
  };

  const handleToggleVerifyMerchant = (mId: string) => {
    onUpdateMerchants(prev => {
      return prev.map(m => {
        if (m.id === mId) {
          const nextState = !m.isVerified;
          const now = new Date().toLocaleTimeString('fr-FR');
          setLogs(prevLogs => [
            { id: Date.now().toString(), time: now, msg: `Statut vérification de la boutique "${m.shopName}" mis à jour : ${nextState ? 'VÉRIFIÉE' : 'NON VÉRIFIÉE'}.`, type: 'info' },
            ...prevLogs
          ]);
          return { ...m, isVerified: nextState };
        }
        return m;
      });
    });
  };

  const handleAdjustSales = (mId: string, amount: number) => {
    onUpdateMerchants(prev => {
      return prev.map(m => {
        if (m.id === mId) {
          return { ...m, sales: Math.max(0, m.sales + amount) };
        }
        return m;
      });
    });
  };

  const handleDeleteMerchant = (mId: string) => {
    const merchant = merchants.find(m => m.id === mId);
    if (!merchant) return;
    if (confirm(`⚠️ ATTENTION: Êtes-vous sûr de vouloir supprimer définitivement la boutique "${merchant.shopName}" ainsi que tous ses produits associés ? Cette action est irréversible.`)) {
      onUpdateMerchants(prev => prev.filter(m => m.id !== mId));
      onUpdateProducts(prev => prev.filter(p => p.merchantId !== mId));
      
      const now = new Date().toLocaleTimeString('fr-FR');
      setLogs(prev => [
        { id: Date.now().toString(), time: now, msg: `Boutique "${merchant.shopName}" et ses produits ont été supprimés de la base de données par l'administrateur.`, type: 'warn' },
        ...prev
      ]);
    }
  };

  const handleDeleteProduct = (pId: string) => {
    const product = products.find(p => p.id === pId);
    if (!product) return;
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      onUpdateProducts(prev => prev.filter(p => p.id !== pId));
      
      const now = new Date().toLocaleTimeString('fr-FR');
      setLogs(prev => [
        { id: Date.now().toString(), time: now, msg: `Produit "${product.name}" supprimé par l'administrateur.`, type: 'warn' },
        ...prev
      ]);
    }
  };

  const handleUpdateProductPrice = (pId: string, nextPrice: number) => {
    if (isNaN(nextPrice) || nextPrice < 0) {
      alert("Veuillez entrer un prix valide supérieur ou égal à 0.");
      return;
    }
    
    onUpdateProducts(prev => {
      return prev.map(p => {
        if (p.id === pId) {
          const now = new Date().toLocaleTimeString('fr-FR');
          setLogs(prevLogs => [
            { id: Date.now().toString(), time: now, msg: `Prix du produit "${p.name}" mis à jour: ${p.price.toLocaleString('fr-FR')} F ➔ ${nextPrice.toLocaleString('fr-FR')} F`, type: 'info' },
            ...prevLogs
          ]);
          return { ...p, price: nextPrice };
        }
        return p;
      });
    });
  };

  const handleSaveCode = () => {
    setCodeDrafts(prev => ({
      ...prev,
      [selectedFileName]: currentCodeContent
    }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);

    const now = new Date().toLocaleTimeString('fr-FR');
    setLogs(prev => [
      { id: Date.now().toString(), time: now, msg: `Fichier source "${selectedFileName}" modifié et sauvegardé avec succès par l'administrateur.`, type: 'success' },
      ...prev
    ]);
  };

  const handleCompileCode = () => {
    setIsCompiling(true);
    setCompileSuccess(false);
    
    const steps = [
      "Vérification des dépendances et imports NPM (Vite & React 18)...",
      "Contrôle de fluidité et élimination des fuites mémoire...",
      "Exécution de l'analyseur statique TypeScript (tsc --noEmit)...",
      "Compilation JIT de la configuration Tailwind CSS...",
      "Création du paquet de production dist/server.cjs via esbuild...",
      "Lancement du conteneur optimisé Cloud Run sur le port 3000..."
    ];

    let currentStepIndex = 0;
    setCompileStep(steps[0]);

    const interval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setCompileStep(steps[currentStepIndex]);
      } else {
        clearInterval(interval);
        setIsCompiling(false);
        setCompileSuccess(true);
        setTimeout(() => setCompileSuccess(false), 3500);

        const now = new Date().toLocaleTimeString('fr-FR');
        setLogs(prev => [
          { id: Date.now().toString(), time: now, msg: `COMPILATION RÉUSSIE : Build de production B${Date.now().toString().slice(-4)} déployé avec succès. Application active sur le port ${serverPort}.`, type: 'success' },
          ...prev
        ]);
      }
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="admin-panel-container">
      {/* Admin Title Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden mb-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                Espace Super-Administrateur
              </span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white font-display flex items-center gap-2">
              <Terminal className="w-8 h-8 text-indigo-400" />
              <span>Console Centrale "chris237"</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Vous êtes connecté sur le serveur d'administration de Bafoussam Direct. Gérez les droits d'accès des abonnés et surveillez le trafic des boutiques de la Mifi en direct.
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl cursor-pointer transition shadow-lg shadow-indigo-600/15 shrink-0 flex items-center gap-2"
          >
            <span>Retourner aux Achats</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Stats Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Volume Total Échangé</span>
          <p className="text-base sm:text-xl font-mono font-black text-slate-900 leading-none">
            {totalSalesVal.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-500">FCFA</span>
          </p>
          <span className="text-[9px] text-emerald-600 font-bold block">100% Transactions Sécurisées</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Abonnés Validés</span>
          <p className="text-base sm:text-xl font-mono font-black text-slate-900 leading-none">
            {totalUsersCount} <span className="text-xs font-bold text-slate-500">Comptes</span>
          </p>
          <span className="text-[9px] text-indigo-600 font-bold block">SMS OTP Actif en temps réel</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Intérêt de la Mifi</span>
          <p className="text-base sm:text-xl font-mono font-black text-slate-900 leading-none">
            {totalClicksVal.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-500">Clics</span>
          </p>
          <span className="text-[9px] text-amber-500 font-bold block">Vendeurs réactifs</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">État Réseau d'Hébergement</span>
          <p className="text-base sm:text-xl font-mono font-black text-emerald-600 leading-none flex items-center gap-1.5">
            <Radio className="w-4 h-4 animate-pulse shrink-0" />
            <span>EXCELLENT</span>
          </p>
          <span className="text-[9px] text-slate-400 block">Europe-West2 (Cloud Run container)</span>
        </div>
      </div>

      {/* Admin Panel Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left tabs menu selection */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-2xs space-y-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 block mb-2">Navigation Console</span>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs cursor-pointer transition ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Base Abonnés</span>
              </span>
              <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-mono">{totalUsersCount}</span>
            </button>

            <button
              onClick={() => setActiveTab('merchants')}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs cursor-pointer transition ${
                activeTab === 'merchants'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Database className="w-4 h-4" />
                <span>Boutiques de la Ville</span>
              </span>
              <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-mono">{merchants.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs cursor-pointer transition ${
                activeTab === 'products'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Catalogue Produits</span>
              </span>
              <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-mono">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('verifications')}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs cursor-pointer transition ${
                activeTab === 'verifications'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Demandes en attente</span>
              </span>
              {pendingVerificationsCount > 0 ? (
                <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">{pendingVerificationsCount}</span>
              ) : (
                <span className="bg-slate-100 text-slate-400 text-[9px] px-1.5 py-0.5 rounded font-mono">0</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs cursor-pointer transition ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Truck className="w-4 h-4" />
                <span>Suivi des commandes</span>
              </span>
              {activeOrdersCount > 0 ? (
                <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">{activeOrdersCount}</span>
              ) : (
                <span className="bg-slate-100 text-slate-400 text-[9px] px-1.5 py-0.5 rounded font-mono">0</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs cursor-pointer transition ${
                activeTab === 'logs'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4" />
                <span>Logs Système</span>
              </span>
              <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold">LIVE</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs cursor-pointer transition ${
                activeTab === 'settings'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Paramètres & Code</span>
              </span>
              <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded font-black">CODE</span>
            </button>
          </div>

          <div className="bg-indigo-950 text-white rounded-2xl p-5 space-y-4 shadow-sm border border-indigo-900 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 text-5xl opacity-5">🔑</div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />
              <h4 className="font-extrabold text-[11px] uppercase tracking-wider">Sécurité des Paramètres</h4>
            </div>
            <p className="text-[10px] text-indigo-200 leading-relaxed">
              Bafoussam Direct applique un filtrage strict : seul l'administrateur connecté au compte principal a le droit de cliquer sur l'onglet Paramètres, de modifier la configuration système et de re-compiler le code source de l'application.
            </p>
          </div>
        </div>

        {/* Right side interactive content frame */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            


            {/* TAB USERS DATABASE */}
            {activeTab === 'users' && (
              <motion.div
                key="tab-users-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Abonnés Bafoussam Direct</h3>
                    <p className="text-xs text-slate-500">Mettez à jour le statut d'accès de vos utilisateurs et gérez la facturation</p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Chercher par nom, téléphone..."
                      className="pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-lg text-slate-950 text-xs w-full sm:w-56 transition"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3">Abonné / Nom</th>
                        <th className="px-5 py-3">Téléphone</th>
                        <th className="px-5 py-3">Adresse E-mail</th>
                        <th className="px-5 py-3">Abonnement</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {allUsers
                        .filter(u => {
                          const query = searchTerm.toLowerCase();
                          return u.name.toLowerCase().includes(query) || u.phone.includes(query) || u.email.toLowerCase().includes(query);
                        })
                        .map(user => (
                          <tr key={user.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-[10px] flex items-center justify-center">
                                  {user.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900 block">{user.name}</span>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                    <span className="font-mono">ID: {user.id}</span>
                                    <span>•</span>
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                      Expire: {user.subscriptionExpiryDate ? new Date(user.subscriptionExpiryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Jamais'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-mono font-semibold text-slate-600">
                              {user.phone}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500">
                              {user.email}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleSub(user.id)}
                                    className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase cursor-pointer transition ${
                                      user.isSubscribed
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}
                                  >
                                    {user.isSubscribed ? 'Actif (Payé)' : 'Suspendu'}
                                  </button>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleExtendSub(user.id, 30)}
                                    className="bg-indigo-50 hover:bg-indigo-150 border border-indigo-100 text-indigo-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition"
                                    title="Prolonger de 30 jours"
                                  >
                                    +30J
                                  </button>
                                  <button
                                    onClick={() => handleExtendSub(user.id, 90)}
                                    className="bg-indigo-50 hover:bg-indigo-150 border border-indigo-100 text-indigo-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition"
                                    title="Prolonger de 90 jours"
                                  >
                                    +90J
                                  </button>
                                  <button
                                    onClick={() => handleExpireSub(user.id)}
                                    className="bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition"
                                    title="Forcer l'expiration"
                                  >
                                    Expirer
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                                title="Révoquer l'abonnement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB MERCHANTS WEIGHTS */}
            {activeTab === 'merchants' && (
              <motion.div
                key="tab-merchants-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Trafic & Rang des Boutiques</h3>
                    <p className="text-xs text-slate-500">Ajustez les volumes de ventes, activez le statut Membre Élite, ou gérez la vérification officielle</p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Chercher une boutique..."
                      className="pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-lg text-slate-950 text-xs w-full sm:w-56 transition"
                      value={merchantSearchTerm}
                      onChange={(e) => setMerchantSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {merchants
                    .filter(m => {
                      const query = merchantSearchTerm.toLowerCase();
                      return m.shopName.toLowerCase().includes(query) || m.name.toLowerCase().includes(query);
                    })
                    .map(m => (
                    <div 
                      key={m.id}
                      className="border border-slate-100 rounded-2xl p-4.5 flex flex-col xl:flex-row xl:items-center justify-between gap-5 hover:border-slate-200 transition bg-slate-50/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shadow-2xs shrink-0">
                          {m.logo || '🏪'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                            <span>{m.shopName}</span>
                            {m.isVerified && (
                              <VerifiedBadge id={`verified-badge-admin-${m.id}`} />
                            )}
                            {m.isPremium && (
                              <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                                ÉLITE N°1
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-slate-500">Propriétaire : {m.name} • {m.location}</span>
                        </div>
                      </div>

                      {/* Verification Status & Toggle Switch */}
                      <div className="flex items-center gap-3 bg-white border border-slate-100 px-3 py-2 rounded-xl shadow-2xs shrink-0">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Statut Officiel</span>
                          {m.isVerified ? (
                            <span className="text-[10px] font-extrabold text-blue-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                              Vérifiée
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Non vérifiée
                            </span>
                          )}
                        </div>

                        {/* Toggle switch track */}
                        <button
                          onClick={() => handleToggleVerifyMerchant(m.id)}
                          className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 relative focus:outline-none ${
                            m.isVerified ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                          aria-label={`Toggle verification status for ${m.shopName}`}
                          title={m.isVerified ? "Désactiver la vérification" : "Activer la vérification"}
                        >
                          <div
                            className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${
                              m.isVerified ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Display / control views, sales, clicks weights */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="bg-white border border-slate-100 p-2 rounded-xl text-center min-w-[70px] shadow-2xs">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Visites (V)</span>
                          <span className="font-mono text-[11px] font-bold text-slate-800 block">{m.views}</span>
                        </div>

                        <div className="bg-white border border-slate-100 p-2 rounded-xl text-center min-w-[70px] shadow-2xs">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Clics (C)</span>
                          <span className="font-mono text-[11px] font-bold text-slate-800 block">{m.clicks}</span>
                        </div>

                        <div className="bg-white border border-slate-100 p-2 rounded-xl text-center min-w-[120px] shadow-2xs">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Ventes directes</span>
                          <span className="font-mono text-[11.5px] font-black text-slate-900 block">{m.sales.toLocaleString('fr-FR')} F</span>
                        </div>
                      </div>

                      {/* Upgrade Elite and Sales injector controls */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <button
                          onClick={() => handleAdjustSales(m.id, 50000)}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition shadow-3xs flex items-center gap-1"
                          title="Injecter 50k FCFA de ventes"
                        >
                          <Plus className="w-3 h-3 text-emerald-600" />
                          <span>+50k FCFA</span>
                        </button>

                        <button
                          onClick={() => handleUpgradeMerchant(m.id)}
                          className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg border cursor-pointer transition shadow-3xs flex items-center gap-1.5 ${
                            m.isPremium
                              ? 'bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white'
                          }`}
                        >
                          <span>{m.isPremium ? 'Rétrograder' : 'Mettre Élite'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteMerchant(m.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition shadow-3xs flex items-center gap-1.5"
                          title="Supprimer définitivement la boutique"
                        >
                          <Trash className="w-3.5 h-3.5" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB PRODUCTS MANAGEMENT */}
            {activeTab === 'products' && (
              <motion.div
                key="tab-products-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Catalogue & Prix des Produits</h3>
                    <p className="text-xs text-slate-500">Gérez le catalogue de Bafoussam Direct : modifiez les prix en direct ou supprimez des produits</p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Chercher un produit..."
                      className="pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-lg text-slate-950 text-xs w-full sm:w-56 transition"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products
                    .filter(p => {
                      const query = searchTerm.toLowerCase();
                      const merchant = merchants.find(m => m.id === p.merchantId);
                      return p.name.toLowerCase().includes(query) || 
                             (p.description && p.description.toLowerCase().includes(query)) ||
                             (merchant && merchant.shopName.toLowerCase().includes(query));
                    })
                    .map(product => {
                      const merchant = merchants.find(m => m.id === product.merchantId);
                      return (
                        <div 
                          key={product.id}
                          className="border border-slate-100 rounded-2xl p-4 flex gap-4 hover:border-slate-200 transition bg-slate-50/40 relative overflow-hidden"
                        >
                          <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-2xl relative shadow-3xs">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="bg-slate-200/60 text-slate-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                                  {merchant?.shopName || 'Boutique Inconnue'}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">ID: {product.id}</span>
                              </div>
                              <h4 className="font-extrabold text-slate-900 text-xs truncate mt-1">
                                {product.name}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between gap-3 mt-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-bold">Prix:</span>
                                <input
                                  type="number"
                                  className="w-20 bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                                  defaultValue={product.price}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (val !== product.price) {
                                      handleUpdateProductPrice(product.id, val);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = parseInt((e.target as HTMLInputElement).value, 10);
                                      handleUpdateProductPrice(product.id, val);
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }}
                                />
                                <span className="text-[10px] text-slate-500 font-bold">F</span>
                              </div>

                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg cursor-pointer transition border border-red-100"
                                title="Supprimer ce produit"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* TAB SYSTEM LOGS */}
            {activeTab === 'logs' && (
              <motion.div
                key="tab-logs-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-900 p-5 shadow-md flex flex-col font-mono text-xs min-h-[400px]"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Console de diagnostic en direct</span>
                  </div>
                  <button
                    onClick={() => {
                      const now = new Date().toLocaleTimeString('fr-FR');
                      setLogs(prev => [
                        { id: Date.now().toString(), time: now, msg: 'Diagnostic système manuel demandé. Tous les noeuds sont opérationnels.', type: 'info' },
                        ...prev
                      ]);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] font-bold px-3 py-1 rounded-md border border-slate-800 transition cursor-pointer"
                  >
                    Lancer Diagnostic
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[350px] pr-2 no-scrollbar">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 leading-relaxed text-slate-300">
                      <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                        log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        log.type === 'warn' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        log.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {log.type.toUpperCase()}
                      </span>
                      <p className="flex-1 text-slate-300 select-all font-mono">{log.msg}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-slate-900 pt-3 text-[10px] text-slate-500 flex justify-between">
                  <span>Hôte : nginx-reverse-proxy:3000</span>
                  <span>SSL : Activé</span>
                </div>
              </motion.div>
            )}

            {/* TAB SETTINGS & CODE */}
            {activeTab === 'settings' && (
              <motion.div
                key="tab-settings-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* 1. System Config Parameters */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Settings className="w-4 h-4 text-indigo-600" />
                      <span>Paramètres Systèmes de l'Application</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Configuration en temps réel du serveur et des intégrations de paiement mobile money</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Port d'Hébergement Ingress</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono font-bold w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                            value={serverPort}
                            onChange={(e) => setServerPort(e.target.value)}
                          />
                          <span className="bg-slate-100 border border-slate-200 text-slate-500 px-3.5 py-2 rounded-xl text-xs font-mono font-bold shrink-0 flex items-center justify-center">
                            PORT
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-1 leading-relaxed">Fixé par l'infrastructure reverse proxy nginx sur l'hôte :3000.</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mise en cache serveur (Varnish JIT)</label>
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                            checked={isCachingEnabled}
                            onChange={(e) => setIsCachingEnabled(e.target.checked)}
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">Cache de fluidité active</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Optimise le temps de chargement des images de l'Ouest.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Niveau de Journalisation (Log Level)</label>
                        <select
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                          value={logLevel}
                          onChange={(e) => setLogLevel(e.target.value as any)}
                        >
                          <option value="debug">DEBUG (Journal complet)</option>
                          <option value="info">INFO (Journal standard)</option>
                          <option value="warn">WARN (Erreurs & Alertes uniquement)</option>
                          <option value="error">ERROR (Erreurs fatales)</option>
                        </select>
                        <span className="text-[9px] text-slate-400 block mt-1 leading-relaxed">Filtre les événements affichés dans la console système en direct.</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Clé API d'Intégration MTN & Orange Money</label>
                        <input
                          type="password"
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                          value={paymentApiKey}
                          onChange={(e) => setPaymentApiKey(e.target.value)}
                        />
                        <span className="text-[9px] text-slate-400 block mt-1 leading-relaxed">Secret d'authentification crypté utilisé pour intercepter les transactions Momo.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Code Editor Panel */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Code className="w-4 h-4 text-indigo-600" />
                        <span>Éditeur de Code Source de l'Application</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Visualisez et éditez directement le code TypeScript de l'application</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Fichier :</span>
                      <select
                        className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none"
                        value={selectedFileName}
                        onChange={(e) => {
                          // Save current to draft before switching
                          setCodeDrafts(prev => ({
                            ...prev,
                            [selectedFileName]: currentCodeContent
                          }));
                          setSelectedFileName(e.target.value as any);
                        }}
                      >
                        <option value="App.tsx">App.tsx</option>
                        <option value="StoreHeader.tsx">StoreHeader.tsx</option>
                        <option value="DeliveryTracker.tsx">DeliveryTracker.tsx</option>
                        <option value="types.ts">types.ts</option>
                      </select>
                    </div>
                  </div>

                  {/* Textarea Code block styling */}
                  <div className="relative border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition">
                    <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold select-none border-b border-slate-800">
                      <span className="flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                        <span>src/components/{selectedFileName}</span>
                      </span>
                      <span>TypeScript (TSX)</span>
                    </div>

                    <textarea
                      className="w-full h-80 p-4 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed select-all"
                      value={currentCodeContent}
                      onChange={(e) => setCurrentCodeContent(e.target.value)}
                      spellCheck={false}
                    />

                    {/* Compile step loading display overlay */}
                    <AnimatePresence>
                      {isCompiling && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6"
                        >
                          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4" />
                          <h4 className="font-mono text-xs font-bold text-white mb-1.5 uppercase tracking-wider">Compilation du build en cours...</h4>
                          <p className="font-mono text-[11px] text-indigo-400 animate-pulse">{compileStep}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                    <p className="text-[10px] text-slate-400 font-medium leading-normal text-center sm:text-left">
                      💡 Seul le super-administrateur a le droit d'exécuter un build de production. Toute modification du code sera appliquée à chaud sur les serveurs de la Mifi.
                    </p>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={handleSaveCode}
                        disabled={isCompiling}
                        className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700">Sauvegardé !</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Enregistrer</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleCompileCode}
                        disabled={isCompiling}
                        className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5"
                      >
                        {compileSuccess ? (
                          <>
                            <Check className="w-4 h-4 animate-bounce" />
                            <span>Build Réussi !</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className={`w-4 h-4 ${isCompiling ? 'animate-spin' : ''}`} />
                            <span>Compiler & Appliquer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'verifications' && (
              <motion.div
                key="tab-verifications-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Demandes de Vérification d'Identité</h3>
                  <p className="text-xs text-slate-500">Examinez les documents officiels des commerçants de Bafoussam pour autoriser leur activité publique</p>
                </div>

                {merchants.filter(m => m.verificationStatus === 'pending_verification').length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 font-bold">Aucune demande de vérification en attente pour le moment.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Toutes les boutiques opérationnelles sont déjà validées.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {merchants
                      .filter(m => m.verificationStatus === 'pending_verification')
                      .map(m => (
                        <div key={m.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{m.logo || '🏪'}</span>
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm">{m.shopName}</h4>
                                <p className="text-[10px] text-slate-500">Enregistré par {m.name} • Tel: {m.phone} • Secteur: {m.location}</p>
                              </div>
                            </div>
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">En attente de revue</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Legal Identity details */}
                            <div className="space-y-2.5">
                              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Informations Soumises</h5>
                              <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-2 text-xs font-sans">
                                <div>
                                  <span className="text-slate-400 block text-[9px] font-bold uppercase font-sans">Nom légal (CNI) :</span>
                                  <span className="font-extrabold text-slate-900 font-sans">{m.legalName || 'Non spécifié'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[9px] font-bold uppercase font-sans">N° Registre de Commerce :</span>
                                  <span className="font-mono font-bold text-slate-700">{m.registryNumber || 'Non formalisé (Individuel)'}</span>
                                </div>
                              </div>

                              {/* Rejection form container */}
                              <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-3">
                                <h6 className="text-[9.5px] font-extrabold text-red-600 uppercase tracking-wider">Refus de validation</h6>
                                <textarea
                                  placeholder="Indiquez le motif précis du refus (ex: Photo CNI illisible, nom légal incorrect, etc.)"
                                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                                  rows={2}
                                  value={rejectionReasons[m.id] || ''}
                                  onChange={(e) => setRejectionReasons(prev => ({ ...prev, [m.id]: e.target.value }))}
                                />
                                <button
                                  onClick={() => handleRejectVerification(m.id)}
                                  className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[10px] font-extrabold py-2 rounded-lg cursor-pointer transition uppercase tracking-wider"
                                >
                                  ❌ Rejeter le dossier
                                </button>
                              </div>
                            </div>

                            {/* Documents photo gallery */}
                            <div className="space-y-2.5">
                              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Documents Pièces Jointes</h5>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="text-[9px] text-slate-500 font-bold block mb-1">Recto CNI / Passeport</span>
                                  {m.cniPhoto ? (
                                    <div className="relative group border border-slate-200 rounded-xl overflow-hidden bg-white h-28 flex items-center justify-center">
                                      <img src={m.cniPhoto} alt="CNI Recto" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      <a href={m.cniPhoto} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-[10px] font-bold">Ouvrir l'image ↗</a>
                                    </div>
                                  ) : (
                                    <div className="border border-dashed border-slate-200 rounded-xl h-28 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">Non fournie</div>
                                  )}
                                </div>

                                <div>
                                  <span className="text-[9px] text-slate-500 font-bold block mb-1">Photo Boutique Physique</span>
                                  {m.shopPhoto ? (
                                    <div className="relative group border border-slate-200 rounded-xl overflow-hidden bg-white h-28 flex items-center justify-center">
                                      <img src={m.shopPhoto} alt="Façade Boutique" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      <a href={m.shopPhoto} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-[10px] font-bold">Ouvrir l'image ↗</a>
                                    </div>
                                  ) : (
                                    <div className="border border-dashed border-slate-200 rounded-xl h-28 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">Non fournie</div>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleApproveVerification(m.id)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black py-3 rounded-xl cursor-pointer transition uppercase tracking-wider shadow-sm mt-2"
                              >
                                ✓ Approuver & Publier la Boutique
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="tab-orders-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Suivi & Logistique des Livraisons</h3>
                  <p className="text-xs text-slate-500">Supervisez l'acheminement des commandes en cours, affectez des livreurs motos, et mettez à jour la timeline client</p>
                </div>

                {(!orders || orders.length === 0) ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 font-bold">Aucune commande en cours dans la base de données.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Faites des achats fictifs ou connectez-vous comme client pour initier une commande.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice().reverse().map(order => (
                      <div key={order.id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 hover:border-slate-200 transition space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Commande #{order.id.slice(-6)}</span>
                            <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">Destinataire : {order.userName} ({order.deliveryNeighborhood})</h4>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10.5px] font-mono font-bold text-slate-500">{order.total.toLocaleString('fr-FR')} F</span>
                            <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                              order.status === 'completed' 
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'delivering'
                                ? 'bg-blue-100 text-blue-800 animate-pulse'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {order.status === 'pending' && 'Commande reçue'}
                              {order.status === 'preparing' && 'En préparation'}
                              {order.status === 'picked_up' && 'Récupérée'}
                              {order.status === 'delivering' && 'En route'}
                              {order.status === 'completed' && 'Livrée ✓'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                          {/* Left: items details and delivery coordinates */}
                          <div className="lg:col-span-4 space-y-2 text-xs">
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Détails de livraison & Articles</p>
                            <div className="bg-white border border-slate-100 p-3 rounded-xl space-y-1 text-[11px] leading-relaxed font-sans">
                              <p className="font-semibold text-slate-800">📍 Quartier : {order.deliveryNeighborhood}</p>
                              <p className="text-slate-500">📞 Tél Paiement : {order.paymentPhone} ({order.paymentMethod === 'momo' ? 'MTN MoMo' : 'Orange Money'})</p>
                              {order.deliveryDetails && <p className="text-slate-500 italic mt-1">« {order.deliveryDetails} »</p>}
                              
                              <div className="border-t border-slate-100 pt-2.5 mt-2.5 space-y-1">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between text-slate-600">
                                    <span>{it.product.name} <strong className="text-slate-900 font-bold font-sans">x{it.quantity}</strong></span>
                                    <span>{(it.product.price * it.quantity).toLocaleString('fr-FR')} F</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Middle: change status dropdown */}
                          <div className="lg:col-span-4 space-y-2">
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Changer le statut logistique</p>
                            <div className="bg-white border border-slate-100 p-3 rounded-xl space-y-2.5">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Statut actuel</label>
                                <select
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatusDirect(order.id, e.target.value as any)}
                                >
                                  <option value="pending">Commande reçue</option>
                                  <option value="preparing">En préparation par le commerçant</option>
                                  <option value="picked_up">Récupérée par le livreur</option>
                                  <option value="delivering">En route vers le client</option>
                                  <option value="completed">Livrée à destination</option>
                                </select>
                              </div>

                              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                                En changeant ce statut, la timeline du client se mettra à jour instantanément sur son écran de suivi de commande.
                              </p>
                            </div>
                          </div>

                          {/* Right: courier name and phone number fields */}
                          <div className="lg:col-span-4 space-y-2">
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Livreur assigné (Moto-taximan)</p>
                            <div className="bg-white border border-slate-100 p-3 rounded-xl space-y-2.5">
                              <div className="grid grid-cols-2 gap-2 font-sans">
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Nom du coursier</label>
                                  <input
                                    type="text"
                                    placeholder="Paul, Jean-Baptiste..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                                    value={order.courierName || ''}
                                    onChange={(e) => handleUpdateOrderCourier(order.id, e.target.value, order.courierPhone || '')}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Téléphone</label>
                                  <input
                                    type="tel"
                                    placeholder="Ex: 640406412"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                                    value={order.courierPhone || ''}
                                    onChange={(e) => handleUpdateOrderCourier(order.id, order.courierName || '', e.target.value)}
                                  />
                                </div>
                              </div>
                              <p className="text-[9.5px] text-slate-400 leading-normal font-sans">
                                Le nom et téléphone saisis s'afficheront sur la fiche du client dès que la commande passe à "Récupérée par le livreur" (étape 3).
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
