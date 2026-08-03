import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  Navigation, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  User as UserIcon, 
  HelpCircle, 
  LogOut, 
  Bell, 
  Package, 
  Check, 
  X, 
  ArrowUpRight, 
  Sparkles, 
  FileText, 
  CreditCard, 
  AlertCircle,
  Smartphone,
  CheckCircle,
  QrCode
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';
import { AfriNovaLogo } from '../AfriNovaLogo';

interface LivreurHomePageProps {
  currentUser: User | null;
  products?: Product[];
  merchants?: Merchant[];
  orders?: Order[];
  onOpenAddModal?: () => void;
  onNavigateView?: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  onSelectProduct?: (product: Product) => void;
  onLogout?: () => void;
}

export default function LivreurHomePage({
  currentUser,
  orders = [],
  onLogout
}: LivreurHomePageProps) {
  const [activeTab, setActiveTab] = useState<
    'courses' | 'disponibilite' | 'gains' | 'historique' | 'notifications' | 'documents' | 'profil' | 'support'
  >('courses');

  const [isOnline, setIsOnline] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mock Deliveries for Courier
  const [deliveries, setDeliveries] = useState([
    {
      id: 'LIV-8801',
      orderId: 'CMD-4091',
      merchantName: 'Boutique Ndop Kamdem',
      merchantPhone: '+237 677 12 34 56',
      pickupLocation: 'Marché A, Allée 4, Bafoussam',
      clientName: 'Pauline Mbouguen',
      clientPhone: '+237 699 88 77 66',
      deliveryLocation: 'Tamdja, Face Paroisse Catholique',
      itemsCount: 2,
      totalAmount: 14500,
      deliveryFee: 1500,
      status: 'assigned', // assigned -> picked_up -> delivered
      estimatedMinutes: 15,
      time: 'Il y a 5 min'
    },
    {
      id: 'LIV-8802',
      orderId: 'CMD-4098',
      merchantName: 'Épicerie Centrale Bamendzi',
      merchantPhone: '+237 675 33 22 11',
      pickupLocation: 'Bamendzi Carrefour',
      clientName: 'Marc Tagne',
      clientPhone: '+237 655 44 33 22',
      deliveryLocation: 'Kamkop 2, Entrée IUT',
      itemsCount: 1,
      totalAmount: 8000,
      deliveryFee: 1000,
      status: 'picked_up',
      estimatedMinutes: 8,
      time: 'Il y a 18 min'
    }
  ]);

  const [completedHistory, setCompletedHistory] = useState([
    {
      id: 'LIV-8790',
      orderId: 'CMD-4010',
      clientName: 'Samuel Foka',
      deliveryLocation: 'Djeleng 3',
      deliveryFee: 1200,
      completedAt: 'Aujourd\'hui 11:20',
      rating: 5
    },
    {
      id: 'LIV-8785',
      orderId: 'CMD-4002',
      clientName: 'Mireille Kamdem',
      deliveryLocation: 'Tamdja',
      deliveryFee: 1500,
      completedAt: 'Aujourd\'hui 09:45',
      rating: 5
    }
  ]);

  const handleUpdateStatus = (deliveryId: string, newStatus: 'picked_up' | 'delivered') => {
    if (newStatus === 'delivered') {
      const target = deliveries.find(d => d.id === deliveryId);
      if (target) {
        setCompletedHistory([
          {
            id: target.id,
            orderId: target.orderId,
            clientName: target.clientName,
            deliveryLocation: target.deliveryLocation,
            deliveryFee: target.deliveryFee,
            completedAt: 'À l\'instant',
            rating: 5
          },
          ...completedHistory
        ]);
        setDeliveries(prev => prev.filter(d => d.id !== deliveryId));
        showToast(`🎉 Livraison ${deliveryId} validée avec succès ! +${target.deliveryFee} FCFA crédités.`);
      }
    } else {
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: 'picked_up' } : d));
      showToast(`📦 Colis de ${deliveryId} récupéré chez le vendeur. En route vers le client !`);
    }
  };

  const todayEarnings = completedHistory.reduce((sum, h) => sum + h.deliveryFee, 0);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-24 relative selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 z-50 bg-[#0F172A] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. LIVREUR HEADER ==================== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Livreur Profile Badge */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('courses')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <AfriNovaLogo size="md" variant="light" showSlogan={false} />
              <span className="bg-[#16A34A]/15 text-[#15803D] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                <Truck className="w-3 h-3 text-[#16A34A]" />
                <span>Espace Livreur Express</span>
              </span>
            </div>
          </div>

          {/* Quick Livreur Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Disponibilité Status Toggle */}
            <button
              onClick={() => {
                setIsOnline(!isOnline);
                showToast(isOnline ? '🔴 Passé Hors Ligne (Aucune course reçue)' : '🟢 En Ligne ! Vous recevez les livraisons proches');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition flex items-center gap-1.5 border cursor-pointer ${
                isOnline 
                  ? 'bg-emerald-50 text-[#15803D] border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#16A34A] animate-pulse' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline">{isOnline ? 'En Ligne GPS' : 'Hors Ligne'}</span>
            </button>

            {/* Support Call Button */}
            <button
              onClick={() => setActiveTab('support')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Assistance</span>
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

      {/* ==================== 2. SUB-NAVIGATION TABS BAR ==================== */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[57px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex items-center gap-1 py-1.5">
          {[
            { id: 'courses', label: `Courses Active (${deliveries.length})`, icon: Truck, badge: deliveries.length > 0 ? deliveries.length : undefined },
            { id: 'disponibilite', label: 'Statut GPS & Zones', icon: Navigation },
            { id: 'gains', label: `Gains (${todayEarnings} F)`, icon: DollarSign },
            { id: 'historique', label: `Historique (${completedHistory.length})`, icon: Clock },
            { id: 'notifications', label: 'Alertes Livraisons', icon: Bell },
            { id: 'documents', label: 'Permis & Badge', icon: ShieldCheck },
            { id: 'profil', label: 'Profil Livreur', icon: UserIcon },
            { id: 'support', label: 'Support 24/7', icon: HelpCircle },
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

        {/* 1. COURSES ACTIVES */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Courses en cours</span>
                <p className="text-xl font-black text-[#0F172A]">{deliveries.length} assignées</p>
                <span className="text-[10px] text-indigo-600 font-bold">Liaisons Bafoussam</span>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Gains du jour</span>
                <p className="text-xl font-black text-[#16A34A]">{todayEarnings.toLocaleString('fr-FR')} FCFA</p>
                <span className="text-[10px] text-[#15803D] font-bold">Paiement instantané</span>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Livraisons effectuées</span>
                <p className="text-xl font-black text-[#0F172A]">{completedHistory.length} complétées</p>
                <span className="text-[10px] text-slate-500 font-bold">Aujourd'hui</span>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Statut Livreur</span>
                <p className="text-xl font-black text-[#15803D]">{isOnline ? '🟢 En Ligne' : '🔴 Hors Ligne'}</p>
                <span className="text-[10px] text-slate-500 font-bold">Moto-Taxi Certifié</span>
              </div>
            </div>

            {/* Courses List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#16A34A]" />
                  <span>Missions de Livraison Attribuées</span>
                </h2>
                <span className="text-xs font-bold text-slate-500">{deliveries.length} à effectuer</span>
              </div>

              {deliveries.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-extrabold text-[#0F172A]">Toutes les livraisons sont achevées !</p>
                  <p className="text-xs text-slate-500">Restez connecté en ligne pour recevoir automatiquement la prochaine course.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries.map((del) => (
                    <div 
                      key={del.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#0F172A] text-white font-mono text-xs font-black px-2.5 py-1 rounded-xl">
                            {del.id}
                          </span>
                          <span className="text-xs font-extrabold text-slate-700">
                            Commande {del.orderId}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            • {del.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                            + {del.deliveryFee} FCFA (Gains)
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Point de Retrait Vendeur */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">1. Point de Retrait (Vendeur)</span>
                          <p className="font-extrabold text-[#0F172A]">{del.merchantName}</p>
                          <p className="text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#16A34A]" /> {del.pickupLocation}
                          </p>
                          <a 
                            href={`tel:${del.merchantPhone}`}
                            className="text-[11px] font-extrabold text-indigo-600 hover:underline flex items-center gap-1 pt-1"
                          >
                            <PhoneCall className="w-3 h-3" /> Appeler Marchand ({del.merchantPhone})
                          </a>
                        </div>

                        {/* Point de Livraison Client */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">2. Destination (Client)</span>
                          <p className="font-extrabold text-[#0F172A]">{del.clientName}</p>
                          <p className="text-slate-600 flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5 text-indigo-600" /> {del.deliveryLocation}
                          </p>
                          <a 
                            href={`tel:${del.clientPhone}`}
                            className="text-[11px] font-extrabold text-emerald-600 hover:underline flex items-center gap-1 pt-1"
                          >
                            <PhoneCall className="w-3 h-3" /> Appeler Client ({del.clientPhone})
                          </a>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-semibold text-slate-500">
                          {del.status === 'assigned' ? '⏳ En attente de récupération du colis' : '🚚 Colis en cours d\'acheminement'}
                        </span>

                        {del.status === 'assigned' ? (
                          <button
                            onClick={() => handleUpdateStatus(del.id, 'picked_up')}
                            className="bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Package className="w-4 h-4 text-[#16A34A]" />
                            <span>Valider Prise en Charge</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(del.id, 'delivered')}
                            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirmer Livraison au Client</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. STATUT GPS & ZONES */}
        {activeTab === 'disponibilite' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 max-w-2xl">
            <h2 className="text-base font-black text-[#0F172A] flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#16A34A]" />
              <span>Paramètres de Disponibilité & Couverture Bafoussam</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs text-[#0F172A]">Mode Réception des Courses</p>
                  <p className="text-[11px] text-slate-500">Transmet votre position GPS aux acheteurs et vendeurs proches.</p>
                </div>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    isOnline ? 'bg-[#16A34A] text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {isOnline ? '🟢 En Ligne' : '🔴 Hors Ligne'}
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-extrabold text-[#0F172A] block">Zones de livraison privilégiées :</label>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium">
                Tamdja, Kamkop, Bamendzi, Djeleng, Marché A, Marché B, Banengo, Mbouda Express.
              </p>
            </div>
          </div>
        )}

        {/* 3. GAINS & RETRAITS */}
        {activeTab === 'gains' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 max-w-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#16A34A]" />
                <span>Portefeuille & Gains Livreur</span>
              </h2>
              <span className="bg-emerald-50 text-[#15803D] font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-200">
                Solde disponible: {todayEarnings} FCFA
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-extrabold text-slate-700 block">Retrait Instantané Mobile Money</span>
              <p className="text-xs text-slate-600">Transférez vos gains directement vers Orange Money ou MTN Mobile Money sans frais.</p>
              <button 
                onClick={() => showToast('Demande de retrait transmise. Fonds envoyés sur votre téléphone !')}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                Demander Retrait Instantané
              </button>
            </div>
          </div>
        )}

        {/* 4. HISTORIQUE */}
        {activeTab === 'historique' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-[#0F172A] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#16A34A]" />
              <span>Historique Récent des Livraisons</span>
            </h2>

            <div className="divide-y divide-slate-100 text-xs">
              {completedHistory.map((h) => (
                <div key={h.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-[#0F172A]">{h.id} • Client: {h.clientName}</p>
                    <p className="text-slate-500">{h.deliveryLocation} • {h.completedAt}</p>
                  </div>
                  <span className="font-black text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    +{h.deliveryFee} FCFA
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OTHER TABS PLACEHOLDERS */}
        {(activeTab === 'notifications' || activeTab === 'documents' || activeTab === 'profil' || activeTab === 'support') && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 max-w-2xl">
            <h2 className="text-base font-black text-[#0F172A] uppercase tracking-wider">
              Espace Livreur • {activeTab.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Gestion de votre profil, attestation transporteur certifié AfriNova, permis de conduire et support réactif 24/7.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
