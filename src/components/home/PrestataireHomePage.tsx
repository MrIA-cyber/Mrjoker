import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Star, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  MapPin, 
  PhoneCall, 
  User as UserIcon, 
  ShieldCheck, 
  TrendingUp, 
  Bell, 
  LogOut, 
  X, 
  Search, 
  Filter, 
  Check, 
  Send, 
  MessageSquare, 
  CreditCard, 
  Award, 
  Settings, 
  HelpCircle, 
  Briefcase, 
  AlertCircle, 
  CalendarDays, 
  FileText, 
  BarChart3, 
  Users, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight, 
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';

interface PrestataireHomePageProps {
  currentUser: User | null;
  products: Product[];
  merchants: Merchant[];
  orders: Order[];
  onOpenAddModal: () => void;
  onNavigateView?: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  onSelectProduct?: (product: Product) => void;
  onLogout?: () => void;
}

export default function PrestataireHomePage({
  currentUser,
  products,
  merchants,
  orders,
  onOpenAddModal,
  onNavigateView,
  onSelectProduct,
  onLogout
}: PrestataireHomePageProps) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<
    'accueil' | 'mes_services' | 'disponibilites' | 'calendrier' | 'reservations' | 
    'demandes' | 'historique' | 'paiements' | 'revenus' | 'stats' | 'avis' | 
    'messages' | 'notifications' | 'abonnement' | 'profil' | 'parametres' | 'support'
  >('accueil');

  // Availability toggle
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityMode, setAvailabilityMode] = useState<'immediate' | 'appointment' | 'busy'>('immediate');

  // Services State (Filtering services from products or local list)
  const [servicesList, setServicesList] = useState<Product[]>(
    products.filter(p => p.category === 'Prestations & Services' || p.category === 'Maison & Décoration').length > 0
      ? products.filter(p => p.category === 'Prestations & Services' || p.category === 'Maison & Décoration')
      : [
          {
            id: 's-1',
            name: 'Installation & Dépannage Solaire 5KVA',
            price: 35000,
            category: 'Prestations & Services',
            images: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80'],
            merchantId: currentUser?.id || 'm1',
            description: 'Diagnostic complet, pose convertisseur et câblage sécurisé aux normes.',
            neighborhood: 'Bafoussam Tamdja'
          },
          {
            id: 's-2',
            name: 'Réparation & Maintenance Réfrigérateur',
            price: 15000,
            category: 'Prestations & Services',
            images: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80'],
            merchantId: currentUser?.id || 'm1',
            description: 'Recharge gaz R134a, réparation compresseur à domicile.',
            neighborhood: 'Bafoussam Kamkop'
          },
          {
            id: 's-3',
            name: 'Installation Plomberie & Sanitaires Villa',
            price: 45000,
            category: 'Prestations & Services',
            images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'],
            merchantId: currentUser?.id || 'm1',
            description: 'Tuyauterie PPR, pose chauffe-eau et raccordement réseau.',
            neighborhood: 'Bafoussam Djeleng'
          }
        ]
  );

  // Edit / Delete Service Modals
  const [editingService, setEditingService] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Client requests
  const [clientRequests, setClientRequests] = useState([
    { id: 'req-101', title: 'Dépannage Électricité Tableau Général', client: 'Jean-Paul K.', location: 'Bafoussam, Tamdja', budget: '25 000 FCFA', date: 'Aujourd\'hui à 14:00', phone: '+237 677 12 34 56', status: 'pending' },
    { id: 'req-102', title: 'Installation Réseau & Wi-Fi Bureau', client: 'Cabinet Mefou', location: 'Bafoussam, Carrefour Bamiléké', budget: '60 000 FCFA', date: 'Demain à 09:30', phone: '+237 699 88 77 66', status: 'pending' },
    { id: 'req-103', title: 'Entretien Plomberie & Sanitaires', client: 'Hôtel Royal', location: 'Bafoussam, Djeleng', budget: '40 000 FCFA', date: 'Aujourd\'hui à 16:30', phone: '+237 655 44 33 22', status: 'pending' }
  ]);

  // Calendar Bookings
  const [bookings, setBookings] = useState([
    { id: 'b-1', client: 'Mme Pougoue', service: 'Installation Solaire 5KVA', date: '01 Août 2026', time: '10:00 - 12:30', location: 'Tamdja, Bafoussam', status: 'Confirmed', amount: '35 000 FCFA' },
    { id: 'b-2', client: 'M. Talla Martial', service: 'Câblage Réseau Fibre', date: '01 Août 2026', time: '14:30 - 16:00', location: 'Kamkop, Bafoussam', status: 'Confirmed', amount: '25 000 FCFA' },
    { id: 'b-3', client: 'Cabinet Notarial Ouest', service: 'Maintenance Climatisation', date: '02 Août 2026', time: '09:00 - 11:00', location: 'Marché A, Bafoussam', status: 'Upcoming', amount: '30 000 FCFA' }
  ]);

  // Service History
  const [history, setHistory] = useState([
    { id: 'h-1', title: 'Pose Onduleur & Solaire Villa', date: '28 Juillet 2026', client: 'Mme Pougoue', rating: 5, amount: '120 000 FCFA' },
    { id: 'h-2', title: 'Réparation Climatisation & Froid', date: '25 Juillet 2026', client: 'Restaurant Le Plateau', rating: 5, amount: '45 000 FCFA' },
    { id: 'h-3', title: 'Dépannage Électrique d\'Urgence', date: '20 Juillet 2026', client: 'Pharmacie du Marché', rating: 5, amount: '35 000 FCFA' }
  ]);

  // Reviews
  const [reviews, setReviews] = useState([
    { id: 'r-1', client: 'Mme Pougoue', rating: 5, date: 'Hier', service: 'Installation Solaire 5KVA', text: 'Travail très soigné, ponctuel et professionnel. Mon système solaire fonctionne parfaitement !', reply: 'Merci Madame Pougoue, ravi de vous avoir servi !' },
    { id: 'r-2', client: 'Arnaud K.', rating: 5, date: '26 Juil 2026', service: 'Réparation Climatisation', text: 'Intervention rapide en moins de 30 minutes à Tamdja. Je recommande vivement.', reply: '' }
  ]);

  // Messages Chat
  const [selectedChat, setSelectedChat] = useState<number>(0);
  const [chats, setChats] = useState([
    {
      clientName: 'Mme Pougoue',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      lastTime: '11:15',
      history: [
        { sender: 'client', text: 'Bonjour ! Êtes-vous disponible ce matin pour la pose du panneau à Tamdja ?', time: '10:50' },
        { sender: 'prestataire', text: 'Bonjour Madame ! Oui je suis en route, j\'arrive dans 15 minutes.', time: '11:00' },
        { sender: 'client', text: 'Parfait, le portail vert au carrefour.', time: '11:15' }
      ]
    },
    {
      clientName: 'Jean-Paul K.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      lastTime: 'Hier',
      history: [
        { sender: 'client', text: 'Quel est votre tarif pour remplacer le disjoncteur principal ?', time: 'Hier 17:10' },
        { sender: 'prestataire', text: 'Bonsoir ! C\'est 15 000 FCFA pièces et main-d\'œuvre comprises.', time: 'Hier 17:15' }
      ]
    }
  ]);
  const [chatReply, setChatReply] = useState('');

  // Weekly Schedule Matrix
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 'Lundi', active: true, hours: '08:00 - 18:00' },
    { day: 'Mardi', active: true, hours: '08:00 - 18:00' },
    { day: 'Mercredi', active: true, hours: '08:00 - 18:00' },
    { day: 'Jeudi', active: true, hours: '08:00 - 18:00' },
    { day: 'Vendredi', active: true, hours: '08:00 - 18:00' },
    { day: 'Samedi', active: true, hours: '08:00 - 16:00' },
    { day: 'Dimanche', active: false, hours: 'Fermé' },
  ]);

  // Payout request state
  const [payoutAmount, setPayoutAmount] = useState('150000');
  const [payoutPhone, setPayoutPhone] = useState('677894512');
  const [payoutProvider, setPayoutProvider] = useState<'momo' | 'orange'>('momo');

  // Delete service
  const handleDeleteService = (id: string) => {
    setServicesList(prev => prev.filter(s => s.id !== id));
    setDeleteConfirmId(null);
  };

  // Send message reply
  const handleSendReply = () => {
    if (!chatReply.trim()) return;
    setChats(prev => prev.map((c, idx) => {
      if (idx === selectedChat) {
        return {
          ...c,
          lastTime: 'À l\'instant',
          history: [...c.history, { sender: 'prestataire', text: chatReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
        };
      }
      return c;
    }));
    setChatReply('');
  };

  return (
    <div className="w-full bg-[#F8FAFC] text-[#0F172A] min-h-screen pb-20 font-sans">
      
      {/* HEADER BANNER PRESTATAIRE */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#2563EB] rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden mb-5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-blue-300/30">
                <Wrench className="w-3 h-3" /> Profil Prestataire Pro
              </span>
              <span className="text-slate-300 text-xs font-semibold">Bafoussam & Région Ouest</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display">
              {currentUser?.name || 'Artisan & Expert Technique Bafoussam'}
            </h1>
            <p className="text-xs text-slate-200 font-medium">
              Gestion de votre planning, réservations clients, offres de services, devis et paiements.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Disponibilité Status Toggle */}
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`h-10 px-3.5 rounded-xl text-xs font-black transition flex items-center gap-2 border cursor-pointer ${
                isAvailable 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{isAvailable ? '🟢 Disponible pour missions' : '🔴 Actuellement indisponible'}</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="h-10 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Publier un service</span>
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

      {/* PRESTATAIRE SUB-NAVIGATION TABS BAR */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[57px] z-30 shadow-2xs mb-6">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-2">
          {[
            { id: 'accueil', label: 'Accueil Prestataire', icon: Briefcase },
            { id: 'mes_services', label: `Mes Services (${servicesList.length})`, icon: Wrench },
            { id: 'disponibilites', label: 'Disponibilités', icon: Clock },
            { id: 'calendrier', label: 'Calendrier & Planning', icon: CalendarIcon },
            { id: 'reservations', label: `Réservations (${bookings.length})`, icon: CalendarDays },
            { id: 'demandes', label: `Demandes Clients (${clientRequests.filter(r => r.status === 'pending').length})`, icon: Bell, badge: clientRequests.filter(r => r.status === 'pending').length || undefined },
            { id: 'historique', label: 'Historique Prestations', icon: CheckCircle2 },
            { id: 'paiements', label: 'Paiements & Momo', icon: CreditCard },
            { id: 'revenus', label: 'Revenus', icon: DollarSign },
            { id: 'stats', label: 'Statistiques', icon: BarChart3 },
            { id: 'avis', label: 'Avis Clients', icon: Star },
            { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 1 },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'abonnement', label: 'Abonnement Pro', icon: ShieldCheck },
            { id: 'profil', label: 'Profil Professionnel', icon: UserIcon },
            { id: 'parametres', label: 'Paramètres', icon: Settings },
            { id: 'support', label: 'Support 24/7', icon: HelpCircle },
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
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-[#2563EB] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
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

        {/* 1. ACCUEIL PRESTATAIRE */}
        {activeTab === 'accueil' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Demandes Nouvelles</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-black">
                    <Bell className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">{clientRequests.filter(r => r.status === 'pending').length} en attente</p>
                <span className="text-[10px] font-bold text-[#2563EB]">Réponse express conseillée</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Réservations du Jour</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">{bookings.length} prévues</p>
                <span className="text-[10px] text-slate-500 font-medium">Bafoussam & environs</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Revenus Prestations</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">345 000 FCFA</p>
                <span className="text-[10px] text-[#16A34A] font-bold">+22% ce mois</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Note Avis Client</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-black">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">4.95 / 5.0</p>
                <span className="text-[10px] text-slate-500 font-medium">54 avis certifiés</span>
              </div>
            </div>

            {/* Visual Planning Today */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-[#0F172A] tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#2563EB]" />
                  Planning Visuel des Interventions (Aujourd'hui)
                </h3>
                <button onClick={() => setActiveTab('calendrier')} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
                  Voir tout le calendrier
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-black text-[#2563EB] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {b.time}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">{b.status}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#0F172A]">{b.service}</h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-slate-400" /> Client: {b.client}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#16A34A]" /> {b.location}
                    </p>
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                      <span className="font-black text-[#16A34A]">{b.amount}</span>
                      <button onClick={() => alert(`Lancement guidage GPS vers ${b.location}`)} className="text-[10px] font-bold text-blue-700 hover:underline">
                        Itinéraire GPS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Accès Rapide Prestataire</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={onOpenAddModal}
                  className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <Plus className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Ajouter Service</p>
                    <p className="text-[10px] text-emerald-800">Publier nouvelle offre</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('disponibilites')}
                  className="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <Clock className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Disponibilités</p>
                    <p className="text-[10px] text-indigo-800">Gérer mes horaires</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('paiements')}
                  className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <CreditCard className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Retrait Momo</p>
                    <p className="text-[10px] text-purple-800">Encaisser gains</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Messages Clients</p>
                    <p className="text-[10px] text-amber-900">Discuter devis</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. MES SERVICES & GESTION (Ajouter, Modifier, Supprimer) */}
        {activeTab === 'mes_services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#0F172A]">Mes Offres de Services</h2>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 bg-[#16A34A] text-white text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {servicesList.map((service) => (
                <div key={service.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <img src={service.images?.[0]} alt={service.name} className="w-full h-32 object-cover rounded-2xl" />
                    <span className="text-[9px] font-black text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                      {service.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#0F172A]">{service.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{service.description || 'Prestation professionnelle réalisée par un expert diplômé.'}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-black text-[#16A34A] text-sm">{service.price?.toLocaleString()} FCFA</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingService(service)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 cursor-pointer"
                        title="Modifier le service"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(service.id)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 cursor-pointer"
                        title="Supprimer le service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Modification Service */}
            {editingService && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-sm text-[#0F172A]">Modifier le Service</h3>
                    <button onClick={() => setEditingService(null)} className="p-1 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Intitulé du service</label>
                      <input
                        type="text"
                        value={editingService.name}
                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tarif / Forfait (FCFA)</label>
                      <input
                        type="number"
                        value={editingService.price}
                        onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setEditingService(null)} className="px-4 py-2 text-xs font-bold text-slate-500">Annuler</button>
                    <button
                      onClick={() => {
                        setServicesList(prev => prev.map(s => s.id === editingService.id ? editingService : s));
                        setEditingService(null);
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
                  <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                  <h3 className="font-black text-sm text-[#0F172A]">Supprimer cette offre ?</h3>
                  <p className="text-xs text-slate-500">Cette action est irréversible et retirera le service de votre profil public.</p>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">Annuler</button>
                    <button onClick={() => handleDeleteService(deleteConfirmId)} className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl">Supprimer</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. DISPONIBILITÉS */}
        {activeTab === 'disponibilites' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Gestion de mes Disponibilités</h2>
            <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h3 className="font-black text-sm text-[#0F172A]">Mode d'Intervention Actuel</h3>
                  <p className="text-xs text-slate-500">Définissez la manière dont vous recevez les demandes à Bafoussam.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setAvailabilityMode('immediate')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                      availabilityMode === 'immediate' ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    🟢 Immédiat Express
                  </button>
                  <button
                    onClick={() => setAvailabilityMode('appointment')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                      availabilityMode === 'appointment' ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    📅 Sur Rendez-vous
                  </button>
                </div>
              </div>

              {/* Weekly Matrix */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-500 uppercase">Horaires Hebdomadaires Détaillés</h4>
                {weeklySchedule.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F172A] w-24">{item.day}</span>
                    <span className="font-mono text-slate-600">{item.hours}</span>
                    <button
                      onClick={() => {
                        setWeeklySchedule(prev => prev.map((s, i) => i === idx ? { ...s, active: !s.active } : s));
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                        item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.active ? 'Ouvert' : 'Fermé'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. CALENDRIER & PLANNING */}
        {activeTab === 'calendrier' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Calendrier & Planning des Rendez-vous</h2>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <button className="p-1.5 bg-slate-100 rounded-lg text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="font-black text-sm text-[#0F172A]">Août 2026</span>
                  <button className="p-1.5 bg-slate-100 rounded-lg text-slate-600"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">Vue Mensuelle</span>
              </div>

              {/* Calendar Grid Visualizer */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                  <div key={d} className="font-black text-slate-400 uppercase py-1">{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const dayNum = i + 1;
                  const hasBooking = dayNum === 1 || dayNum === 2 || dayNum === 15;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl border text-xs font-bold min-h-[60px] flex flex-col justify-between ${
                        hasBooking ? 'bg-blue-50/80 border-blue-200 text-[#2563EB]' : 'bg-slate-50/50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-black">{dayNum}</span>
                      {hasBooking && (
                        <span className="bg-[#2563EB] text-white text-[8px] font-black px-1 py-0.5 rounded-full truncate">
                          RDV
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. RÉSERVATIONS */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Réservations Confirmées ({bookings.length})</h2>
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-blue-600 font-bold">{b.date} ({b.time})</span>
                    <h4 className="font-bold text-sm text-[#0F172A]">{b.service}</h4>
                    <p className="text-slate-500">Client: {b.client} • {b.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#16A34A] text-sm block">{b.amount}</span>
                    <button
                      onClick={() => alert(`Appel client ${b.client}`)}
                      className="mt-1 px-3 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-lg"
                    >
                      Contacter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. DEMANDES CLIENTS */}
        {activeTab === 'demandes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Demandes d'Intervention en Attente</h2>
            <div className="space-y-3">
              {clientRequests.map((req) => (
                <div key={req.id} className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-[#0F172A]">{req.title}</h4>
                    <span className="font-black text-[#16A34A] bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">{req.budget}</span>
                  </div>
                  <p className="text-xs text-slate-500">Client: {req.client} • Lieu: {req.location}</p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setClientRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'accepted' } : r));
                        alert('Mission acceptée ! Ajoutée au calendrier.');
                      }}
                      className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Accepter Mission
                    </button>
                    <button
                      onClick={() => alert(`Envoi de devis personnalisé à ${req.client}`)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Envoyer Devis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. HISTORIQUE DES PRESTATIONS */}
        {activeTab === 'historique' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Historique des Missions Réalisées</h2>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-2">
              {history.map((h) => (
                <div key={h.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#0F172A]">{h.title}</h4>
                    <p className="text-[10px] text-slate-400">{h.client} • {h.date}</p>
                  </div>
                  <span className="font-black text-[#16A34A]">{h.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. PAIEMENTS & REVENUS */}
        {(activeTab === 'paiements' || activeTab === 'revenus') && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Paiements & Retraits Mobile Money</h2>
            <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-4 max-w-md">
              <span className="text-xs text-slate-400 font-bold uppercase">Solde Total Encaissé</span>
              <p className="text-3xl font-black text-[#16A34A]">345 000 FCFA</p>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Montant du retrait</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
                />
              </div>

              <button
                onClick={() => alert(`Demande de retrait de ${payoutAmount} FCFA soumise vers ${payoutPhone} !`)}
                className="w-full py-3 bg-[#16A34A] text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Effectuer le Retrait
              </button>
            </div>
          </div>
        )}

        {/* 9. STATISTIQUES */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Statistiques de Performance</h2>
            <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-500">Taux de Ponctualité: <span className="text-[#16A34A] font-black">99.2%</span></p>
              <p className="text-xs font-bold text-slate-500">Missions Réussies: <span className="text-indigo-600 font-black">48 accomplies</span></p>
            </div>
          </div>
        )}

        {/* 10. AVIS CLIENTS */}
        {activeTab === 'avis' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Avis & Évaluations Clients</h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">{r.client}</span>
                    <div className="flex text-amber-400 gap-0.5"><Star className="w-3.5 h-3.5 fill-amber-400" /><span className="text-xs font-bold text-slate-800">{r.rating}.0</span></div>
                  </div>
                  <p className="text-xs text-slate-600">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 11. MESSAGES */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-3xl border border-slate-100 space-y-2">
              <h3 className="font-black text-xs px-2">Conversations</h3>
              {chats.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedChat(idx)}
                  className={`p-2.5 rounded-2xl cursor-pointer transition flex items-center gap-3 ${
                    selectedChat === idx ? 'bg-[#0F172A] text-white' : 'hover:bg-slate-50'
                  }`}
                >
                  <img src={c.avatar} alt="" className="w-8 h-8 rounded-full" />
                  <span className="font-bold text-xs">{c.clientName}</span>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 bg-white p-4 rounded-3xl border border-slate-100 flex flex-col justify-between min-h-[300px]">
              <div className="space-y-2">
                <div className="font-bold text-xs border-b pb-2">{chats[selectedChat].clientName}</div>
                {chats[selectedChat].history.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === 'prestataire' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2.5 rounded-2xl text-xs ${m.sender === 'prestataire' ? 'bg-[#2563EB] text-white' : 'bg-slate-100'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <input
                  type="text"
                  value={chatReply}
                  onChange={(e) => setChatReply(e.target.value)}
                  placeholder="Répondre au client..."
                  className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                />
                <button onClick={handleSendReply} className="p-2 bg-[#2563EB] text-white rounded-xl">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 12. NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Centre de Notifications</h2>
            <div className="p-4 bg-white rounded-2xl border border-slate-100 text-xs">
              Nouvelle demande d'intervention d'urgence enregistrée à Tamdja.
            </div>
          </div>
        )}

        {/* 13. ABONNEMENT */}
        {activeTab === 'abonnement' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Abonnement Prestataire Pro</h2>
            <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-2">
              <span className="px-3 py-1 bg-blue-50 text-[#2563EB] font-black text-xs rounded-full">Statut: Certifié AfriNova</span>
              <p className="text-xs text-slate-600">Abonnement valide jusqu'au 31 Août 2026.</p>
            </div>
          </div>
        )}

        {/* 14. PROFIL PROFESSIONNEL */}
        {activeTab === 'profil' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Profil Professionnel Public</h2>
            <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-3 max-w-lg">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nom / Nom Commercial</label>
                <input type="text" defaultValue={currentUser?.name || 'Artisan Expert Bafoussam'} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Spécialité & Compétences</label>
                <input type="text" defaultValue="Électricité, Onduleurs Solaires & Plomberie PPR" className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
              </div>
              <button className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer">Mettre à jour le profil</button>
            </div>
          </div>
        )}

        {/* 15. PARAMÈTRES */}
        {activeTab === 'parametres' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Paramètres du Compte</h2>
            <div className="p-4 bg-white rounded-2xl border border-slate-100 text-xs">
              Zone de déplacement: Bafoussam Ville (+15 km).
            </div>
          </div>
        )}

        {/* 16. SUPPORT */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Support & Assistance Prestataires</h2>
            <div className="p-5 bg-blue-50 text-blue-900 rounded-3xl border border-blue-200 space-y-2">
              <PhoneCall className="w-6 h-6 text-[#2563EB]" />
              <h3 className="font-black text-sm">Assistance Directe Techniciens</h3>
              <p className="text-xs">Contactez l'équipe support AfriNova au <strong>+237 677 89 45 12</strong>.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
