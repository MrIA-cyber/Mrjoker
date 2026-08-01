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
  SlidersHorizontal,
  ChevronLeft,
  Video,
  Image as ImageIcon,
  Upload,
  Play,
  RefreshCw,
  AlertTriangle,
  ThumbsUp,
  ExternalLink,
  CheckCircle
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

export interface PrestataireService {
  id: string;
  name: string;
  category: string;
  price: number;
  pricingType: 'fixe' | 'horaire' | 'devis';
  description: string;
  images: string[];
  videoUrl?: string;
  zones: string[];
  duration: string;
}

export interface BookingRequest {
  id: string;
  title: string;
  client: string;
  phone: string;
  location: string;
  budget: string;
  date: string;
  time: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'postponed' | 'completed';
  postponeDate?: string;
  postponeTime?: string;
  rejectReason?: string;
}

export interface ReviewItem {
  id: string;
  client: string;
  rating: number;
  date: string;
  service: string;
  text: string;
  reply?: string;
}

export interface PaymentTransaction {
  id: string;
  ref: string;
  date: string;
  clientName: string;
  serviceName: string;
  amount: number;
  provider: 'momo' | 'orange';
  status: 'Payé' | 'En cours';
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
  // Toast Alert Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'accueil' | 'services' | 'disponibilites' | 'reservations' | 
    'finances' | 'stats' | 'messages' | 'avis' | 
    'profil' | 'abonnement' | 'support'
  >('accueil');

  // Availability Global Toggle & Mode
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityMode, setAvailabilityMode] = useState<'immediate' | 'appointment' | 'busy'>('immediate');

  // 1. SERVICES LIST (Ajouter, Modifier, Supprimer, Tarifs, Photos, Vidéos)
  const [servicesList, setServicesList] = useState<PrestataireService[]>([
    {
      id: 'srv-101',
      name: 'Installation & Dépannage Solaire 5KVA',
      category: 'Électricité & Énergie Solaire',
      price: 35000,
      pricingType: 'fixe',
      description: 'Diagnostic complet, pose convertisseur hybride, régulateur MPPT et câblage sécurisé aux normes CE.',
      images: [
        'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=demo_solaire_bafoussam',
      zones: ['Bafoussam Tamdja', 'Bafoussam Kamkop', 'Bafoussam Djeleng'],
      duration: '2h - 4h'
    },
    {
      id: 'srv-102',
      name: 'Réparation & Entretien Réfrigérateur & Froid',
      category: 'Froid & Climatisation',
      price: 15000,
      pricingType: 'horaire',
      description: 'Recharge en gaz R134a, réparation compresseur, débouchage circuit et thermostat à domicile.',
      images: [
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80'
      ],
      videoUrl: '',
      zones: ['Bafoussam Tamdja', 'Marché A', 'Marché B', 'Bamendzi'],
      duration: '1h - 2h'
    },
    {
      id: 'srv-103',
      name: 'Installation Plomberie PPR & Chauffe-eau Villa',
      category: 'Plomberie & Sanitaires',
      price: 45000,
      pricingType: 'devis',
      description: 'Pose tuyauterie polypropylène PPR, installation chauffe-eau solaire et raccordement fosse septique.',
      images: [
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=plomberie_demo',
      zones: ['Bafoussam Ville', 'Kouogouo', 'Haoussa'],
      duration: 'Demi-journée'
    }
  ]);

  // Modal Service Add / Edit
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<PrestataireService | null>(null);
  const [serviceForm, setServiceForm] = useState<{
    name: string;
    category: string;
    price: number;
    pricingType: 'fixe' | 'horaire' | 'devis';
    description: string;
    imagesText: string;
    videoUrl: string;
    zonesText: string;
    duration: string;
  }>({
    name: '',
    category: 'Électricité & Énergie Solaire',
    price: 25000,
    pricingType: 'fixe',
    description: '',
    imagesText: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    videoUrl: '',
    zonesText: 'Bafoussam Tamdja, Kamkop, Djeleng',
    duration: '2 heures'
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 2. DISPONIBILITÉS, HORAIRES & ZONES D'INTERVENTION
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 'Lundi', active: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'Mardi', active: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'Mercredi', active: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'Jeudi', active: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'Vendredi', active: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'Samedi', active: true, openTime: '08:00', closeTime: '16:00' },
    { day: 'Dimanche', active: false, openTime: '09:00', closeTime: '13:00' },
  ]);

  const [interventionZones, setInterventionZones] = useState([
    { name: 'Bafoussam Tamdja', active: true },
    { name: 'Bafoussam Kamkop', active: true },
    { name: 'Bafoussam Djeleng', active: true },
    { name: 'Bafoussam Bamendzi', active: true },
    { name: 'Bafoussam Haoussa', active: true },
    { name: 'Marché A & Marché B', active: true },
    { name: 'Kouogouo / TPO', active: true },
    { name: 'Mbouda (Région Ouest)', active: false },
    { name: 'Dschang', active: false },
    { name: 'Bandjoun', active: true },
    { name: 'Foumban', active: false },
  ]);
  const [newZoneInput, setNewZoneInput] = useState('');

  // 3. RÉSERVATIONS & DEMANDES CLIENTS (Accepter, Refuser, Reporter, Terminer)
  const [bookingsList, setBookingsList] = useState<BookingRequest[]>([
    {
      id: 'req-201',
      title: 'Installation Système Solaire Hybride 5KVA',
      client: 'Mme Pougoue Brigitte',
      phone: '+237 677 88 99 00',
      location: 'Bafoussam Tamdja, près du Collège',
      budget: '35 000 FCFA',
      date: '01 Août 2026',
      time: '10:00',
      notes: 'Besoin urgent avant la coupure d\'électricité du soir.',
      status: 'pending'
    },
    {
      id: 'req-202',
      title: 'Dépannage Électrique Tableau Principal',
      client: 'M. Talla Martial',
      phone: '+237 699 11 22 33',
      location: 'Bafoussam Kamkop',
      budget: '20 000 FCFA',
      date: '01 Août 2026',
      time: '14:30',
      notes: 'Court-circuit sur le disjoncteur général.',
      status: 'accepted'
    },
    {
      id: 'req-203',
      title: 'Entretien & Nettoyage Climatiseur Bureau',
      client: 'Cabinet Notarial Ouest',
      phone: '+237 655 44 33 22',
      location: 'Bafoussam Marché A',
      budget: '30 000 FCFA',
      date: '02 Août 2026',
      time: '09:00',
      notes: 'Intervention programmée le matin.',
      status: 'pending'
    },
    {
      id: 'req-204',
      title: 'Raccordement Plomberie PPR Douche',
      client: 'Jean-Paul K.',
      phone: '+237 670 00 11 22',
      location: 'Bafoussam Djeleng',
      budget: '18 000 FCFA',
      date: '28 Juillet 2026',
      time: '11:00',
      status: 'completed'
    }
  ]);

  // Reschedule / Postpone Modal State
  const [postponeModalBooking, setPostponeModalBooking] = useState<BookingRequest | null>(null);
  const [postponeDate, setPostponeDate] = useState('03 Août 2026');
  const [postponeTime, setPostponeTime] = useState('11:00');

  // Reject Modal State
  const [rejectModalBooking, setRejectModalBooking] = useState<BookingRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Planning complet à cette heure');

  // 4. FINANCES (Paiements, Revenus, Retrait MoMo)
  const [payoutAmount, setPayoutAmount] = useState('150000');
  const [payoutPhone, setPayoutPhone] = useState(currentUser?.phone || '677894512');
  const [payoutProvider, setPayoutProvider] = useState<'momo' | 'orange'>('momo');

  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([
    {
      id: 'tx-1',
      ref: 'MOMO-9831024',
      date: '31 Juillet 2026',
      clientName: 'Mme Pougoue Brigitte',
      serviceName: 'Acompte Solaire 5KVA',
      amount: 20000,
      provider: 'momo',
      status: 'Payé'
    },
    {
      id: 'tx-2',
      ref: 'OM-7781923',
      date: '28 Juillet 2026',
      clientName: 'Jean-Paul K.',
      serviceName: 'Raccordement Plomberie',
      amount: 18000,
      provider: 'orange',
      status: 'Payé'
    },
    {
      id: 'tx-3',
      ref: 'MOMO-6625101',
      date: '25 Juillet 2026',
      clientName: 'Restaurant Le Plateau',
      serviceName: 'Réparation Climatiseur',
      amount: 45000,
      provider: 'momo',
      status: 'Payé'
    }
  ]);

  // 5. MESSAGES CLIENTS
  const [selectedChatIndex, setSelectedChatIndex] = useState(0);
  const [chats, setChats] = useState([
    {
      id: 'chat-1',
      clientName: 'Mme Pougoue Brigitte',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      serviceTitle: 'Installation Solaire 5KVA',
      lastTime: '11:15',
      history: [
        { sender: 'client' as const, text: 'Bonjour ! Êtes-vous disponible ce matin pour la pose du panneau à Tamdja ?', time: '10:50' },
        { sender: 'prestataire' as const, text: 'Bonjour Madame Brigitte ! Oui mon matériel est prêt, je peux arriver dans 30 minutes.', time: '11:00' },
        { sender: 'client' as const, text: 'Parfait, c\'est le portail vert en face du carrefour Tamdja.', time: '11:15' }
      ]
    },
    {
      id: 'chat-2',
      clientName: 'M. Talla Martial',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      serviceTitle: 'Dépannage Tableau Électrique',
      lastTime: 'Hier',
      history: [
        { sender: 'client' as const, text: 'Quel est votre tarif pour remplacer le disjoncteur principal ?', time: 'Hier 17:10' },
        { sender: 'prestataire' as const, text: 'Bonsoir M. Talla ! C\'est 15 000 FCFA pièces et main-d\'œuvre garanties.', time: 'Hier 17:15' }
      ]
    }
  ]);
  const [messageReplyText, setMessageReplyText] = useState('');

  // 6. AVIS CLIENTS (Consulter et Répondre)
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      client: 'Mme Pougoue Brigitte',
      rating: 5,
      date: '31 Juillet 2026',
      service: 'Installation Solaire 5KVA',
      text: 'Super professionnel ! Il a installé nos panneaux solaires avec beaucoup de rigueur. Tout fonctionne très bien à Tamdja.',
      reply: 'Merci infiniment Madame Brigitte, ravi de vous savoir satisfaite !'
    },
    {
      id: 'rev-2',
      client: 'Arnaud K. (Restaurant Le Plateau)',
      rating: 5,
      date: '26 Juillet 2026',
      service: 'Réparation Climatisation',
      text: 'Intervention d\'urgence ultra rapide en moins de 30 minutes. Tarifs clairs et travail propre.',
      reply: ''
    }
  ]);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [reviewReplyInput, setReviewReplyInput] = useState('');

  // 7. PROFIL PROFESSIONNEL & INFORMATIONS
  const [providerProfile, setProviderProfile] = useState({
    name: currentUser?.name || 'Artisan & Tech Bafoussam',
    tradeTitle: 'Électricien, Installateur Solaire & Frigoriste Certifié',
    phone: currentUser?.phone || '+237 677 89 45 12',
    whatsapp: '+237 699 88 77 66',
    email: currentUser?.email || 'prestataire.bafoussam@afrinova.cm',
    address: 'Carrefour Express, Quartier Tamdja',
    city: 'Bafoussam, Ouest Cameroun',
    bio: 'Artisan qualifié avec plus de 8 ans d\'expérience dans les installations électriques résidentielles, le solaire photovoltaïque hybride et la réparation d\'équipements de froid.',
    experienceYears: '8 ans',
    diplomas: 'CAP Électricité Bâtiment, Habilitation Solaire Hybride Schneider',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
  });

  // 8. ABONNEMENT PRO
  const [subscription, setSubscription] = useState({
    planName: 'Formule Prestataire VIP Bafoussam',
    price: 15000,
    expiryDate: '31 Août 2026',
    status: 'Actif',
    autoRenew: true
  });

  // HANDLERS
  // Add new service
  const handleSaveService = () => {
    if (!serviceForm.name.trim()) {
      showToast('⚠️ Veuillez saisir le titre du service');
      return;
    }
    const newSrv: PrestataireService = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      name: serviceForm.name,
      category: serviceForm.category,
      price: Number(serviceForm.price) || 0,
      pricingType: serviceForm.pricingType,
      description: serviceForm.description,
      images: serviceForm.imagesText.split(',').map(s => s.trim()).filter(Boolean),
      videoUrl: serviceForm.videoUrl,
      zones: serviceForm.zonesText.split(',').map(s => s.trim()).filter(Boolean),
      duration: serviceForm.duration
    };

    if (editingService) {
      setServicesList(prev => prev.map(s => s.id === editingService.id ? newSrv : s));
      showToast('✅ Service modifié avec succès !');
    } else {
      setServicesList(prev => [newSrv, ...prev]);
      showToast('✅ Nouveau service publié avec succès !');
    }

    setIsAddServiceModalOpen(false);
    setEditingService(null);
  };

  const handleOpenEditService = (service: PrestataireService) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      category: service.category,
      price: service.price,
      pricingType: service.pricingType,
      description: service.description,
      imagesText: service.images.join(', '),
      videoUrl: service.videoUrl || '',
      zonesText: service.zones.join(', '),
      duration: service.duration
    });
    setIsAddServiceModalOpen(true);
  };

  const handleDeleteService = (id: string) => {
    setServicesList(prev => prev.filter(s => s.id !== id));
    setDeleteConfirmId(null);
    showToast('🗑️ Service supprimé de votre profil.');
  };

  // Accept booking
  const handleAcceptBooking = (id: string) => {
    setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted' } : b));
    showToast('🎉 Réservation acceptée ! Le client a été notifié.');
  };

  // Confirm postpone
  const handleConfirmPostpone = () => {
    if (!postponeModalBooking) return;
    setBookingsList(prev => prev.map(b => b.id === postponeModalBooking.id ? { 
      ...b, 
      status: 'postponed', 
      postponeDate, 
      postponeTime 
    } : b));
    showToast(`📅 Réservation reportée au ${postponeDate} à ${postponeTime}.`);
    setPostponeModalBooking(null);
  };

  // Confirm reject
  const handleConfirmReject = () => {
    if (!rejectModalBooking) return;
    setBookingsList(prev => prev.map(b => b.id === rejectModalBooking.id ? { 
      ...b, 
      status: 'rejected', 
      rejectReason 
    } : b));
    showToast('❌ Réservation refusée.');
    setRejectModalBooking(null);
  };

  // Mark mission completed
  const handleCompleteMission = (id: string) => {
    setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
    showToast('✅ Prestation marquée comme terminée ! Paiement ajouté à votre solde.');
  };

  // Reply to chat message
  const handleSendMessageReply = () => {
    if (!messageReplyText.trim()) return;
    setChats(prev => prev.map((c, idx) => {
      if (idx === selectedChatIndex) {
        return {
          ...c,
          lastTime: 'À l\'instant',
          history: [...c.history, {
            sender: 'prestataire',
            text: messageReplyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        };
      }
      return c;
    }));
    setMessageReplyText('');
    showToast('💬 Message envoyé au client.');
  };

  // Reply to review
  const handleSaveReviewReply = (reviewId: string) => {
    if (!reviewReplyInput.trim()) return;
    setReviewsList(prev => prev.map(r => r.id === reviewId ? { ...r, reply: reviewReplyInput } : r));
    setReplyingReviewId(null);
    setReviewReplyInput('');
    showToast('⭐ Votre réponse à l\'avis a été publiée !');
  };

  // Request payout
  const handleRequestPayout = () => {
    if (!payoutAmount || Number(payoutAmount) <= 0) {
      showToast('⚠️ Saisissez un montant valide à retirer.');
      return;
    }
    showToast(`💸 Demande de retrait de ${Number(payoutAmount).toLocaleString()} FCFA envoyée vers ${payoutPhone} (${payoutProvider.toUpperCase()}).`);
  };

  // Add new zone
  const handleAddZone = () => {
    if (!newZoneInput.trim()) return;
    setInterventionZones(prev => [...prev, { name: newZoneInput.trim(), active: true }]);
    setNewZoneInput('');
    showToast('📍 Nouvelle zone d\'intervention ajoutée !');
  };

  return (
    <div className="w-full bg-[#F8FAFC] text-[#0F172A] min-h-screen pb-20 font-sans">
      
      {/* TOAST NOTIFICATION FLOATING */}
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

      {/* HEADER BANNER PRESTATAIRE */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#2563EB] rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden mb-5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-blue-300/30">
                <Wrench className="w-3 h-3" /> Espace Prestataire Pro
              </span>
              <span className="text-slate-300 text-xs font-semibold">{providerProfile.city}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display">
              {providerProfile.name}
            </h1>
            <p className="text-xs text-slate-200 font-medium">
              {providerProfile.tradeTitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Disponibilité Status Toggle */}
            <button
              onClick={() => {
                setIsAvailable(!isAvailable);
                showToast(isAvailable ? '🔴 Statut passé en Indisponible' : '🟢 Statut passé en Disponible');
              }}
              className={`h-10 px-3.5 rounded-xl text-xs font-black transition flex items-center gap-2 border cursor-pointer ${
                isAvailable 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{isAvailable ? '🟢 En ligne (Disponible)' : '🔴 Indisponible'}</span>
            </button>

            <button
              onClick={() => {
                setEditingService(null);
                setServiceForm({
                  name: '',
                  category: 'Électricité & Énergie Solaire',
                  price: 25000,
                  pricingType: 'fixe',
                  description: '',
                  imagesText: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
                  videoUrl: '',
                  zonesText: 'Bafoussam Tamdja, Kamkop, Djeleng',
                  duration: '2 heures'
                });
                setIsAddServiceModalOpen(true);
              }}
              className="h-10 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-black transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ajouter un service</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4 text-rose-300" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRESTATAIRE EXCLUSIVE NAVIGATION TABS BAR */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[57px] z-30 shadow-2xs mb-6">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-2">
          {[
            { id: 'accueil', label: 'Vue Générale', icon: Briefcase },
            { id: 'services', label: `Mes Services (${servicesList.length})`, icon: Wrench },
            { id: 'disponibilites', label: 'Horaires & Zones', icon: Clock },
            { id: 'reservations', label: `Réservations (${bookingsList.filter(b => b.status === 'pending').length} attente)`, icon: CalendarDays, badge: bookingsList.filter(b => b.status === 'pending').length || undefined },
            { id: 'finances', label: 'Paiements & Revenus', icon: DollarSign },
            { id: 'stats', label: 'Statistiques', icon: BarChart3 },
            { id: 'messages', label: 'Messages Directs', icon: MessageSquare, badge: 1 },
            { id: 'avis', label: `Avis Clients (${reviewsList.length})`, icon: Star },
            { id: 'profil', label: 'Profil & Infos', icon: UserIcon },
            { id: 'abonnement', label: 'Abonnement Pro', icon: ShieldCheck },
            { id: 'support', label: 'Support 24/7', icon: HelpCircle },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-[#2563EB] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ml-0.5 animate-pulse">
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

        {/* 1. ACCUEIL - VUE GÉNÉRALE PRESTATAIRE */}
        {activeTab === 'accueil' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Demandes en attente</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-black">
                    <Bell className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">{bookingsList.filter(b => b.status === 'pending').length} urgentes</p>
                <button onClick={() => setActiveTab('reservations')} className="text-[10px] font-bold text-[#2563EB] hover:underline">
                  Traiter maintenant &rarr;
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Missions Confirmées</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">{bookingsList.filter(b => b.status === 'accepted').length} programmées</p>
                <span className="text-[10px] text-slate-500 font-medium">Bafoussam & Région</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Revenus Encaissés</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">345 000 FCFA</p>
                <span className="text-[10px] text-[#16A34A] font-bold">+22% ce mois</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Note Globale Client</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-black">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">4.95 / 5.0</p>
                <span className="text-[10px] text-slate-500 font-medium">Avis certifiés AfriNova</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Accès Rapide Prestataire</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setEditingService(null);
                    setServiceForm({
                      name: '',
                      category: 'Électricité & Énergie Solaire',
                      price: 25000,
                      pricingType: 'fixe',
                      description: '',
                      imagesText: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
                      videoUrl: '',
                      zonesText: 'Bafoussam Tamdja, Kamkop',
                      duration: '2 heures'
                    });
                    setIsAddServiceModalOpen(true);
                  }}
                  className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <Plus className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Nouveau Service</p>
                    <p className="text-[10px] text-emerald-800">Ajouter tarif & vidéos</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('disponibilites')}
                  className="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <Clock className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Horaires & Zones</p>
                    <p className="text-[10px] text-indigo-800">Gérer mes créneaux</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('finances')}
                  className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <CreditCard className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Retrait MoMo / OM</p>
                    <p className="text-[10px] text-purple-800">Voir les paiements</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Messages Directs</p>
                    <p className="text-[10px] text-amber-900">Répondre aux clients</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Interventions Preview */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-[#0F172A] tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#2563EB]" />
                  Prochaines Interventions Programmées
                </h3>
                <button onClick={() => setActiveTab('reservations')} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
                  Gérer toutes les réservations
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bookingsList.filter(b => b.status === 'accepted').map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-black text-[#2563EB] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {b.date} à {b.time}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">Mission Confirmée</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#0F172A]">{b.title}</h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-slate-400" /> Client: {b.client} ({b.phone})
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#16A34A]" /> {b.location}
                    </p>
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                      <span className="font-black text-[#16A34A]">{b.budget}</span>
                      <button 
                        onClick={() => handleCompleteMission(b.id)} 
                        className="px-3 py-1 bg-[#16A34A] text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-[#15803D]"
                      >
                        Terminer prestation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. SERVICES (Ajouter, Modifier, Supprimer, Photos, Vidéos, Tarifs) */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
              <div>
                <h2 className="text-lg font-black text-[#0F172A]">Mes Services Offerts</h2>
                <p className="text-xs text-slate-500">Définissez vos tarifs, ajoutez des photos/vidéos de vos réalisations et vos zones.</p>
              </div>

              <button
                onClick={() => {
                  setEditingService(null);
                  setServiceForm({
                    name: '',
                    category: 'Électricité & Énergie Solaire',
                    price: 25000,
                    pricingType: 'fixe',
                    description: '',
                    imagesText: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
                    videoUrl: '',
                    zonesText: 'Bafoussam Tamdja, Kamkop',
                    duration: '2 heures'
                  });
                  setIsAddServiceModalOpen(true);
                }}
                className="px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Ajouter un Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {servicesList.map((service) => (
                <div key={service.id} className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between hover:border-blue-300 transition">
                  <div className="space-y-2">
                    {/* Image / Photo carousel preview */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-36">
                      <img src={service.images[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'} alt={service.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 text-[9px] font-black text-white bg-[#0F172A]/80 backdrop-blur-xs px-2 py-0.5 rounded-full uppercase">
                        {service.category}
                      </span>
                      {service.videoUrl && (
                        <span className="absolute top-2 right-2 text-[9px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <Play className="w-2.5 h-2.5 fill-white" /> Vidéo Pro
                        </span>
                      )}
                      {service.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 text-[9px] font-black text-white bg-slate-900/80 px-2 py-0.5 rounded-full">
                          +{service.images.length - 1} photos
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-[#0F172A] leading-snug">{service.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{service.description}</p>

                    {/* Zones badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {service.zones.slice(0, 3).map((z, idx) => (
                        <span key={idx} className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-[#16A34A]" /> {z}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Tarif défini</span>
                      <span className="font-black text-[#16A34A] text-sm">
                        {service.pricingType === 'devis' ? 'Sur Devis' : `${service.price.toLocaleString()} FCFA`}
                        {service.pricingType === 'horaire' && ' / heure'}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenEditService(service)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition cursor-pointer"
                        title="Modifier ce service"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(service.id)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition cursor-pointer"
                        title="Supprimer ce service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL FORM: AJOUTER / MODIFIER UN SERVICE */}
            {isAddServiceModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl my-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-[#2563EB]" />
                      <h3 className="font-black text-sm text-[#0F172A]">
                        {editingService ? 'Modifier le Service' : 'Ajouter un Nouveau Service'}
                      </h3>
                    </div>
                    <button onClick={() => setIsAddServiceModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Intitulé du service *</label>
                      <input
                        type="text"
                        placeholder="Ex: Installation Solaire 5KVA, Réparation Climatisation..."
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-[#0F172A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Catégorie</label>
                        <select
                          value={serviceForm.category}
                          onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-[#0F172A]"
                        >
                          <option value="Électricité & Énergie Solaire">Électricité & Solaire</option>
                          <option value="Froid & Climatisation">Froid & Climatisation</option>
                          <option value="Plomberie & Sanitaires">Plomberie & Sanitaires</option>
                          <option value="Menuiserie & Charpente">Menuiserie & Charpente</option>
                          <option value="Peinture & Décoration">Peinture & Décoration</option>
                          <option value="Mécanique Auto & Moto">Mécanique Auto & Moto</option>
                          <option value="Informatique & Réseaux">Informatique & Réseaux</option>
                          <option value="Beauté & Coiffure Pro">Beauté & Coiffure Pro</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Type de Tarif</label>
                        <select
                          value={serviceForm.pricingType}
                          onChange={(e) => setServiceForm({ ...serviceForm, pricingType: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-[#0F172A]"
                        >
                          <option value="fixe">Forfait Fixe</option>
                          <option value="horaire">Tarif Horaire</option>
                          <option value="devis">Sur Devis Personnalisé</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tarif (FCFA)</label>
                      <input
                        type="number"
                        placeholder="Ex: 25000"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Description du travail</label>
                      <textarea
                        rows={3}
                        placeholder="Expliquez votre procédure d'intervention, garanties et pièces fournies..."
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Ajouter des Photos (URLs séparées par des virgules)
                      </label>
                      <input
                        type="text"
                        placeholder="https://image1.jpg, https://image2.jpg"
                        value={serviceForm.imagesText}
                        onChange={(e) => setServiceForm({ ...serviceForm, imagesText: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-rose-600" /> Ajouter une Vidéo de Démo (Lien YouTube / MP4)
                      </label>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=xxx ou lien mp4"
                        value={serviceForm.videoUrl}
                        onChange={(e) => setServiceForm({ ...serviceForm, videoUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Zones Couvertes</label>
                      <input
                        type="text"
                        placeholder="Bafoussam Tamdja, Kamkop, Djeleng, Bamendzi"
                        value={serviceForm.zonesText}
                        onChange={(e) => setServiceForm({ ...serviceForm, zonesText: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button onClick={() => setIsAddServiceModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveService}
                      className="px-5 py-2.5 bg-[#16A34A] text-white text-xs font-black rounded-xl hover:bg-[#15803D] cursor-pointer"
                    >
                      {editingService ? 'Enregistrer les modifications' : 'Publier le Service'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIRMATION SUPPRESSION */}
            {deleteConfirmId && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center shadow-2xl">
                  <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                  <h3 className="font-black text-sm text-[#0F172A]">Supprimer ce service ?</h3>
                  <p className="text-xs text-slate-500">Cette offre sera définitivement retirée de votre profil public.</p>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl">
                      Annuler
                    </button>
                    <button onClick={() => handleDeleteService(deleteConfirmId)} className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. DISPONIBILITÉS, HORAIRES ET ZONES D'INTERVENTION */}
        {activeTab === 'disponibilites' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Définir Horaires & Zones d'Intervention</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Horaires et Jours Disponibles */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#2563EB]" />
                    <h3 className="font-black text-sm text-[#0F172A]">Jours & Horaires d'Ouverture</h3>
                  </div>
                  <button
                    onClick={() => {
                      setWeeklySchedule(prev => prev.map(s => ({ ...s, active: true, openTime: '08:00', closeTime: '18:00' })));
                      showToast('⏰ Horaires réinitialisés (Lun-Dim 8h-18h).');
                    }}
                    className="text-[10px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Toujours Ouvert
                  </button>
                </div>

                <div className="space-y-2">
                  {weeklySchedule.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 w-28">
                        <button
                          onClick={() => {
                            setWeeklySchedule(prev => prev.map((s, i) => i === idx ? { ...s, active: !s.active } : s));
                          }}
                          className={`w-4 h-4 rounded-md flex items-center justify-center cursor-pointer ${
                            item.active ? 'bg-[#16A34A] text-white' : 'bg-slate-300'
                          }`}
                        >
                          {item.active && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span className={`font-bold ${item.active ? 'text-[#0F172A]' : 'text-slate-400 line-through'}`}>{item.day}</span>
                      </div>

                      {item.active ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={item.openTime}
                            onChange={(e) => setWeeklySchedule(prev => prev.map((s, i) => i === idx ? { ...s, openTime: e.target.value } : s))}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                          <span className="text-slate-400 font-bold">-</span>
                          <input
                            type="time"
                            value={item.closeTime}
                            onChange={(e) => setWeeklySchedule(prev => prev.map((s, i) => i === idx ? { ...s, closeTime: e.target.value } : s))}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>
                      ) : (
                        <span className="text-rose-500 font-bold text-[10px] bg-rose-50 px-2 py-0.5 rounded-full">Fermé / Repos</span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => showToast('✅ Planning hebdomadaire mis à jour !')}
                  className="w-full py-2.5 bg-[#0F172A] text-white text-xs font-black rounded-xl hover:bg-[#1E293B] cursor-pointer"
                >
                  Enregistrer les Horaires
                </button>
              </div>

              {/* Zones d'Intervention */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin className="w-5 h-5 text-[#16A34A]" />
                  <h3 className="font-black text-sm text-[#0F172A]">Zones d'Intervention Desserte</h3>
                </div>

                <p className="text-xs text-slate-500">Cochez les quartiers et villes où vous acceptez de vous déplacer pour intervenir.</p>

                <div className="grid grid-cols-2 gap-2">
                  {interventionZones.map((z, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInterventionZones(prev => prev.map((item, i) => i === idx ? { ...item, active: !item.active } : item))}
                      className={`p-2.5 rounded-2xl border text-xs font-bold text-left flex items-center justify-between transition cursor-pointer ${
                        z.active ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="truncate">{z.name}</span>
                      <span className={`w-2 h-2 rounded-full ${z.active ? 'bg-[#16A34A]' : 'bg-slate-300'}`} />
                    </button>
                  ))}
                </div>

                {/* Add Custom Zone */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Ajouter une autre localité (ex: Mbouda...)"
                    value={newZoneInput}
                    onChange={(e) => setNewZoneInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                  <button onClick={handleAddZone} className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer">
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. RÉSERVATIONS (Accepter, Refuser, Reporter, Terminer) */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Gestion des Réservations & Prestations</h2>

            <div className="space-y-3">
              {bookingsList.map((req) => (
                <div key={req.id} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'postponed' ? 'bg-indigo-100 text-indigo-800' :
                          req.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status === 'pending' ? '⏳ En Attente' :
                           req.status === 'accepted' ? '✅ Acceptée' :
                           req.status === 'postponed' ? '📅 Reportée' :
                           req.status === 'completed' ? '🎉 Terminée' : '❌ Refusée'}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-400">{req.date} à {req.time}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#0F172A]">{req.title}</h4>
                    </div>

                    <span className="font-black text-[#16A34A] text-base bg-emerald-50 px-3 py-1 rounded-xl self-start sm:self-center">
                      {req.budget}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      Client: <strong className="text-[#0F172A]">{req.client}</strong> ({req.phone})
                    </p>
                    <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      Lieu: <strong className="text-[#0F172A]">{req.location}</strong>
                    </p>
                    {req.notes && (
                      <p className="col-span-full text-slate-500 italic pt-1 border-t border-slate-200/60">
                        "{req.notes}"
                      </p>
                    )}
                    {req.status === 'postponed' && (
                      <p className="col-span-full font-bold text-indigo-700 pt-1">
                        Reporté au: {req.postponeDate} à {req.postponeTime}
                      </p>
                    )}
                  </div>

                  {/* Actions according to status */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptBooking(req.id)}
                          className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Accepter la réservation</span>
                        </button>

                        <button
                          onClick={() => setPostponeModalBooking(req)}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <CalendarIcon className="w-4 h-4" />
                          <span>Reporter</span>
                        </button>

                        <button
                          onClick={() => setRejectModalBooking(req)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Refuser</span>
                        </button>
                      </>
                    )}

                    {req.status === 'accepted' && (
                      <button
                        onClick={() => handleCompleteMission(req.id)}
                        className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Terminer la prestation</span>
                      </button>
                    )}

                    <a
                      href={`tel:${req.phone}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 ml-auto"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Appeler Client</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL REPORTER RÉSERVATION */}
            {postponeModalBooking && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-black text-sm text-[#0F172A]">Reporter la Réservation</h3>
                    <button onClick={() => setPostponeModalBooking(null)} className="p-1 text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">Proposez une nouvelle date et heure d'intervention à {postponeModalBooking.client}.</p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nouvelle Date</label>
                      <input
                        type="text"
                        value={postponeDate}
                        onChange={(e) => setPostponeDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nouvel Horaire</label>
                      <input
                        type="text"
                        value={postponeTime}
                        onChange={(e) => setPostponeTime(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setPostponeModalBooking(null)} className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">
                      Annuler
                    </button>
                    <button onClick={handleConfirmPostpone} className="flex-1 py-2 text-xs font-black text-white bg-indigo-600 rounded-xl">
                      Confirmer le Report
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL REFUSER RÉSERVATION */}
            {rejectModalBooking && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-black text-sm text-[#0F172A]">Refuser la Réservation</h3>
                    <button onClick={() => setRejectModalBooking(null)} className="p-1 text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Motif du refus</label>
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#0F172A] mt-1"
                    >
                      <option value="Planning complet à cette heure">Planning déjà complet</option>
                      <option value="Lieu hors zone d'intervention">Lieu trop éloigné / Hors zone</option>
                      <option value="Compétence technique spécifique indisponible">Matériel / Pièce spécifique non disponible</option>
                      <option value="Autre motif">Autre motif</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setRejectModalBooking(null)} className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">
                      Annuler
                    </button>
                    <button onClick={handleConfirmReject} className="flex-1 py-2 text-xs font-black text-white bg-rose-600 rounded-xl">
                      Confirmer le Refus
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. FINANCES (Voir les paiements, Voir les revenus, Retrait MoMo) */}
        {activeTab === 'finances' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Paiements, Revenus & Retraits Mobile Money</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Box Solde & Retrait */}
              <div className="bg-[#0F172A] text-white p-6 rounded-3xl space-y-4 shadow-xl">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Solde Total Disponible</span>
                <p className="text-3xl font-black text-[#16A34A]">345 000 FCFA</p>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Numéro Mobile Money / Orange</label>
                    <input
                      type="text"
                      value={payoutPhone}
                      onChange={(e) => setPayoutPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPayoutProvider('momo')}
                      className={`py-2 rounded-xl text-xs font-black cursor-pointer ${
                        payoutProvider === 'momo' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      MTN MoMo
                    </button>
                    <button
                      onClick={() => setPayoutProvider('orange')}
                      className={`py-2 rounded-xl text-xs font-black cursor-pointer ${
                        payoutProvider === 'orange' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Orange Money
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Montant à encaisser (FCFA)</label>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white mt-1"
                    />
                  </div>

                  <button
                    onClick={handleRequestPayout}
                    className="w-full py-3 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md"
                  >
                    Demander le Transfert Immédiat
                  </button>
                </div>
              </div>

              {/* Historique des Paiements */}
              <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <h3 className="font-black text-sm text-[#0F172A] border-b pb-3">Historique des Transactions Encaissées</h3>

                <div className="space-y-2">
                  {paymentTransactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-blue-600 text-[10px]">{tx.ref}</span>
                        <h4 className="font-bold text-[#0F172A]">{tx.serviceName}</h4>
                        <p className="text-[10px] text-slate-400">{tx.clientName} • {tx.date}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-[#16A34A] text-sm block">+{tx.amount.toLocaleString()} FCFA</span>
                        <span className="text-[9px] font-bold uppercase text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                          {tx.provider}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. STATISTIQUES */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Statistiques de Performance Prestataire</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Taux d'Acceptation</span>
                <p className="text-2xl font-black text-[#16A34A]">98.5 %</p>
                <p className="text-[10px] text-slate-500">Excellente réactivité sur la région de Bafoussam.</p>
              </div>

              <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Temps Moyen de Réponse</span>
                <p className="text-2xl font-black text-[#2563EB]">8 minutes</p>
                <p className="text-[10px] text-slate-500">Moyenne des 30 derniers jours.</p>
              </div>

              <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Missions Réussies</span>
                <p className="text-2xl font-black text-purple-600">64 prestations</p>
                <p className="text-[10px] text-slate-500">Aucun litige signalé.</p>
              </div>
            </div>
          </div>
        )}

        {/* 7. MESSAGES (Répondre aux messages) */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Messagerie Directe Client</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs min-h-[420px]">
              {/* Conversation List */}
              <div className="space-y-2 border-r border-slate-100 pr-3">
                <h3 className="font-black text-xs text-slate-400 uppercase px-2 mb-2">Discussions Récentes</h3>
                {chats.map((c, idx) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedChatIndex(idx)}
                    className={`p-3 rounded-2xl cursor-pointer transition flex items-center gap-3 ${
                      selectedChatIndex === idx ? 'bg-[#0F172A] text-white shadow-xs' : 'hover:bg-slate-50 text-[#0F172A]'
                    }`}
                  >
                    <img src={c.avatar} alt={c.clientName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div className="truncate flex-1">
                      <p className="font-bold text-xs truncate">{c.clientName}</p>
                      <p className={`text-[10px] truncate ${selectedChatIndex === idx ? 'text-slate-300' : 'text-slate-500'}`}>{c.serviceTitle}</p>
                    </div>
                    <span className="text-[9px] text-slate-400">{c.lastTime}</span>
                  </div>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="md:col-span-2 flex flex-col justify-between space-y-4 pl-2">
                <div className="border-b pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={chats[selectedChatIndex].avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h4 className="font-black text-xs text-[#0F172A]">{chats[selectedChatIndex].clientName}</h4>
                      <p className="text-[10px] text-[#2563EB] font-bold">{chats[selectedChatIndex].serviceTitle}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px] pr-2">
                  {chats[selectedChatIndex].history.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'prestataire' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-xs text-xs space-y-1 ${
                        m.sender === 'prestataire' ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#0F172A]'
                      }`}>
                        <p>{m.text}</p>
                        <span className={`text-[8px] block text-right font-mono ${m.sender === 'prestataire' ? 'text-blue-200' : 'text-slate-400'}`}>{m.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <input
                    type="text"
                    value={messageReplyText}
                    onChange={(e) => setMessageReplyText(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                  <button onClick={handleSendMessageReply} className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. AVIS CLIENTS (Consulter & Répondre) */}
        {activeTab === 'avis' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Consulter & Répondre aux Avis Clients</h2>

            <div className="space-y-3">
              {reviewsList.map((rev) => (
                <div key={rev.id} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-[#0F172A]">{rev.client}</h4>
                      <p className="text-[10px] text-slate-400">{rev.service} • {rev.date}</p>
                    </div>
                    <div className="flex text-amber-400 items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="text-xs font-black text-slate-900">{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 italic">"{rev.text}"</p>

                  {/* Provider Reply */}
                  {rev.reply ? (
                    <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100 space-y-1 text-xs">
                      <span className="text-[10px] font-black text-[#2563EB] uppercase block">Votre réponse:</span>
                      <p className="text-slate-800 font-medium">{rev.reply}</p>
                    </div>
                  ) : (
                    <div>
                      {replyingReviewId === rev.id ? (
                        <div className="space-y-2 pt-2 border-t">
                          <textarea
                            rows={2}
                            value={reviewReplyInput}
                            onChange={(e) => setReviewReplyInput(e.target.value)}
                            placeholder="Rédigez votre réponse publique..."
                            className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setReplyingReviewId(null)} className="px-3 py-1 text-xs font-bold text-slate-500">Annuler</button>
                            <button onClick={() => handleSaveReviewReply(rev.id)} className="px-4 py-1.5 bg-[#16A34A] text-white text-xs font-bold rounded-xl">Publier la réponse</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingReviewId(rev.id)}
                          className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition cursor-pointer"
                        >
                          Répondre à cet avis
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. PROFIL & INFORMATIONS */}
        {activeTab === 'profil' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Modifier Profil Professionnel & Informations</h2>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4 max-w-2xl">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nom / Raison Sociale</label>
                  <input
                    type="text"
                    value={providerProfile.name}
                    onChange={(e) => setProviderProfile({ ...providerProfile, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Spécialité / Métier Principal</label>
                  <input
                    type="text"
                    value={providerProfile.tradeTitle}
                    onChange={(e) => setProviderProfile({ ...providerProfile, tradeTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#0F172A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Téléphone MoMo Pro</label>
                    <input
                      type="text"
                      value={providerProfile.phone}
                      onChange={(e) => setProviderProfile({ ...providerProfile, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Numéro WhatsApp</label>
                    <input
                      type="text"
                      value={providerProfile.whatsapp}
                      onChange={(e) => setProviderProfile({ ...providerProfile, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#0F172A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Adresse / Quartier Général</label>
                  <input
                    type="text"
                    value={providerProfile.address}
                    onChange={(e) => setProviderProfile({ ...providerProfile, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Diplômes & Habilitations</label>
                  <input
                    type="text"
                    value={providerProfile.diplomas}
                    onChange={(e) => setProviderProfile({ ...providerProfile, diplomas: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Bio & Présentation de l'atelier</label>
                  <textarea
                    rows={3}
                    value={providerProfile.bio}
                    onChange={(e) => setProviderProfile({ ...providerProfile, bio: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-medium text-[#0F172A]"
                  />
                </div>

                <button
                  onClick={() => showToast('✅ Profil professionnel mis à jour avec succès !')}
                  className="px-6 py-2.5 bg-[#16A34A] text-white text-xs font-black rounded-xl hover:bg-[#15803D] cursor-pointer"
                >
                  Enregistrer les Informations
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10. ABONNEMENT PRO */}
        {activeTab === 'abonnement' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Gérer son Abonnement Prestataire Pro</h2>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl space-y-4 max-w-xl shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#16A34A]" />
                  <h3 className="font-black text-sm">{subscription.planName}</h3>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black rounded-full uppercase">
                  {subscription.status}
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Abonnement mensuel certifié vous donnant droit à la visibilité prioritaire à Bafoussam et 0% de commission sur vos devis clients.
              </p>

              <div className="space-y-2 text-xs font-bold text-slate-200">
                <p>• Valide jusqu'au: <strong className="text-emerald-400">{subscription.expiryDate}</strong></p>
                <p>• Tarif de renouvellement: <strong>15 000 FCFA / mois</strong></p>
              </div>

              <button
                onClick={() => showToast('💳 Renouvellement d\'abonnement initié via MoMo !')}
                className="w-full py-3 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl transition cursor-pointer"
              >
                Renouveler mon Abonnement
              </button>
            </div>
          </div>
        )}

        {/* 11. SUPPORT */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Support & Assistance Technique 24/7</h2>

            <div className="p-6 bg-blue-50 text-blue-950 rounded-3xl border border-blue-200 space-y-4 max-w-xl shadow-2xs">
              <div className="flex items-center gap-3">
                <PhoneCall className="w-8 h-8 text-[#2563EB]" />
                <div>
                  <h3 className="font-black text-sm">Assistance Ligne Directe Techniciens</h3>
                  <p className="text-xs text-blue-800">Assistance prioritaire AfriNova Bafoussam</p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-700">
                Une question sur un paiement Mobile Money ou un litige avec un client ? Contactez notre équipe locale basée à Bafoussam Tamdja.
              </p>

              <div className="flex gap-3">
                <a
                  href="tel:+237677894512"
                  className="px-4 py-2.5 bg-[#2563EB] text-white text-xs font-black rounded-xl flex items-center gap-2 hover:bg-blue-700"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>+237 677 89 45 12</span>
                </a>

                <button
                  onClick={() => showToast('💬 Ouverture WhatsApp Support AfriNova...')}
                  className="px-4 py-2.5 bg-[#16A34A] text-white text-xs font-black rounded-xl flex items-center gap-2 hover:bg-[#15803D] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Support</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
