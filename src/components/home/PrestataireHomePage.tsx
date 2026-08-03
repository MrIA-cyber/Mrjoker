import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  QrCode,
  Share2,
  Download,
  Headphones,
  Navigation,
  Mic,
  Volume2,
  Paperclip,
  FileSpreadsheet,
  Maximize2,
  Eye,
  Compass
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';
import AboutAfriNovaSection from '../AboutAfriNovaSection';
import { AfriNovaLogo } from '../AfriNovaLogo';

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
  coordinates?: { lat: number; lng: number };
  distanceKm?: number;
  estimatedTimeMin?: number;
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
  provider: 'momo' | 'orange' | 'cash';
  status: 'Payé' | 'En cours';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'booking' | 'payment' | 'review' | 'system';
  unread: boolean;
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
    'accueil' | 'carte' | 'calendrier' | 'services' | 'disponibilites' | 'reservations' | 
    'finances' | 'stats' | 'messages' | 'avis' | 
    'profil' | 'abonnement' | 'support'
  >('accueil');

  // Quick Action Modals State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPdfReportModal, setShowPdfReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Availability Global Toggle & Mode
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityMode, setAvailabilityMode] = useState<'immediate' | 'appointment' | 'busy'>('immediate');
  const [radiusKm, setRadiusKm] = useState(20);
  const [lunchBreak, setLunchBreak] = useState('12:30 - 13:30');

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Nouvelle réservation urgente',
      message: 'Mme Pougoue Brigitte demande une intervention Solaire 5KVA à Tamdja.',
      time: 'Il y a 10 min',
      type: 'booking',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Paiement MTN MoMo reçu',
      message: 'Acompte de 20 000 FCFA crédité sur votre compte AfriNova.',
      time: 'Il y a 45 min',
      type: 'payment',
      unread: true
    },
    {
      id: 'notif-3',
      title: 'Avis 5 étoiles reçu ⭐',
      message: 'M. Talla Martial a laissé une excellente note sur votre dernière prestation.',
      time: 'Hier 18:30',
      type: 'review',
      unread: false
    },
    {
      id: 'notif-4',
      title: 'Rappel d\'intervention',
      message: 'Mission programmée aujourd\'hui à 14h30 chez M. Talla à Kamkop.',
      time: 'Ce matin 08:00',
      type: 'system',
      unread: false
    }
  ]);

  const unreadNotifCount = notifications.filter(n => n.unread).length;

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('✓ Toutes les notifications ont été marquées comme lues.');
  };

  // Calendar View Mode
  const [calendarViewMode, setCalendarViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState('01 Août 2026');

  // 1. SERVICES LIST (Per-user localStorage persistence, empty by default for new profile)
  const [servicesList, setServicesList] = useState<PrestataireService[]>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_prestataire_services_' + (currentUser?.id || 'guest'));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bafoussam_prestataire_services_' + (currentUser?.id || 'guest'), JSON.stringify(servicesList));
    } catch (e) {
      console.error(e);
    }
  }, [servicesList, currentUser?.id]);

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

  // 2. DISPONIBILITÉS & ZONES
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
    { name: 'Bafoussam Tamdja', active: true, extraFee: 0 },
    { name: 'Bafoussam Kamkop', active: true, extraFee: 0 },
    { name: 'Bafoussam Djeleng', active: true, extraFee: 0 },
    { name: 'Bafoussam Bamendzi', active: true, extraFee: 500 },
    { name: 'Bafoussam Haoussa', active: true, extraFee: 500 },
    { name: 'Marché A & Marché B', active: true, extraFee: 0 },
    { name: 'Kouogouo / TPO', active: true, extraFee: 1000 },
    { name: 'Mbouda (Région Ouest)', active: false, extraFee: 2500 },
    { name: 'Dschang', active: false, extraFee: 3000 },
    { name: 'Bandjoun', active: true, extraFee: 1500 },
    { name: 'Foumban', active: false, extraFee: 4000 },
  ]);
  const [newZoneInput, setNewZoneInput] = useState('');

  // 3. RÉSERVATIONS & INTERVENTIONS MAP
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
      status: 'pending',
      coordinates: { lat: 5.478, lng: 10.418 },
      distanceKm: 1.8,
      estimatedTimeMin: 6
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
      status: 'accepted',
      coordinates: { lat: 5.485, lng: 10.425 },
      distanceKm: 3.2,
      estimatedTimeMin: 10
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
      status: 'pending',
      coordinates: { lat: 5.472, lng: 10.412 },
      distanceKm: 2.1,
      estimatedTimeMin: 7
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
      status: 'completed',
      coordinates: { lat: 5.465, lng: 10.430 },
      distanceKm: 4.5,
      estimatedTimeMin: 14
    }
  ]);

  const [selectedMapPin, setSelectedMapPin] = useState<BookingRequest | null>(bookingsList[0]);
  const [mapFilterStatus, setMapFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  // Reschedule / Postpone Modal State
  const [postponeModalBooking, setPostponeModalBooking] = useState<BookingRequest | null>(null);
  const [postponeDate, setPostponeDate] = useState('03 Août 2026');
  const [postponeTime, setPostponeTime] = useState('11:00');

  // Reject Modal State
  const [rejectModalBooking, setRejectModalBooking] = useState<BookingRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('Planning complet à cette heure');

  // 4. FINANCES & REVENUS COMPARATIFS
  const [payoutAmount, setPayoutAmount] = useState('0');
  const [payoutPhone, setPayoutPhone] = useState(currentUser?.phone || '677894512');
  const [payoutProvider, setPayoutProvider] = useState<'momo' | 'orange'>('momo');

  const [revenueStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0
  });

  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);

  // 5. MESSAGES CLIENTS
  const [selectedChatIndex, setSelectedChatIndex] = useState(0);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
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
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  // 6. AVIS CLIENTS
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
    },
    {
      id: 'rev-3',
      client: 'Jean-Paul K.',
      rating: 5,
      date: '20 Juillet 2026',
      service: 'Plomberie & Sanitaires',
      text: 'Plombier très ponctuel et honnête. Pas de faux frais ajoutés.',
      reply: 'Merci Jean-Paul pour ce retour fort encourageant !'
    }
  ]);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [reviewReplyInput, setReviewReplyInput] = useState('');

  // 7. PROFIL PROFESSIONNEL (Per-user localStorage persistence)
  const [providerProfile, setProviderProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('bafoussam_prestataire_profile_' + (currentUser?.id || 'guest'));
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: currentUser?.name || 'Mon Profil Prestataire',
      tradeTitle: 'Prestataire de Services & Artisan Certifié',
      phone: currentUser?.phone || '',
      whatsapp: currentUser?.phone || '',
      email: currentUser?.email || '',
      address: currentUser?.neighborhood ? `Quartier ${currentUser.neighborhood}` : 'Bafoussam',
      city: 'Bafoussam, Ouest Cameroun',
      bio: 'Profil prestataire en cours de configuration. Décrivez vos compétences et votre expérience !',
      experienceYears: '1 an',
      diplomas: 'Prestataire Agréé AfriNova',
      photoUrl: currentUser?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('bafoussam_prestataire_profile_' + (currentUser?.id || 'guest'), JSON.stringify(providerProfile));
    } catch (e) {
      console.error(e);
    }
  }, [providerProfile, currentUser?.id]);

  // 8. ABONNEMENT PRO
  const [subscription] = useState({
    planName: 'Formule Prestataire VIP Bafoussam',
    price: 15000,
    expiryDate: '31 Août 2026',
    status: 'Actif',
    autoRenew: true
  });

  // HANDLERS
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

  const handleAcceptBooking = (id: string) => {
    setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted' } : b));
    showToast('🎉 Réservation acceptée ! Le client a été notifié.');
  };

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

  const handleCompleteMission = (id: string) => {
    setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
    showToast('✅ Prestation marquée comme terminée ! Paiement ajouté à votre solde.');
  };

  const handleSendMessageReply = (cannedText?: string) => {
    const textToSend = cannedText || messageReplyText;
    if (!textToSend.trim()) return;

    setChats(prev => prev.map((c, idx) => {
      if (idx === selectedChatIndex) {
        return {
          ...c,
          lastTime: 'À l\'instant',
          history: [...c.history, {
            sender: 'prestataire',
            text: textToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        };
      }
      return c;
    }));
    setMessageReplyText('');
    showToast('💬 Message envoyé au client.');
  };

  const handleSendVoiceNote = () => {
    setIsRecordingAudio(true);
    showToast('🎙️ Enregistrement note vocale...');
    setTimeout(() => {
      setIsRecordingAudio(false);
      handleSendMessageReply('🎵 Note vocale audio transmise (0:18)');
    }, 2000);
  };

  const handleSaveReviewReply = (reviewId: string) => {
    if (!reviewReplyInput.trim()) return;
    setReviewsList(prev => prev.map(r => r.id === reviewId ? { ...r, reply: reviewReplyInput } : r));
    setReplyingReviewId(null);
    setReviewReplyInput('');
    showToast('⭐ Votre réponse à l\'avis a été publiée !');
  };

  const handleRequestPayout = () => {
    if (!payoutAmount || Number(payoutAmount) <= 0) {
      showToast('⚠️ Saisissez un montant valide à retirer.');
      return;
    }
    showToast(`💸 Demande de retrait de ${Number(payoutAmount).toLocaleString()} FCFA envoyée vers ${payoutPhone} (${payoutProvider.toUpperCase()}).`);
  };

  const handleAddZone = () => {
    if (!newZoneInput.trim()) return;
    setInterventionZones(prev => [...prev, { name: newZoneInput.trim(), active: true, extraFee: 1000 }]);
    setNewZoneInput('');
    showToast('📍 Nouvelle zone d\'intervention ajoutée !');
  };

  // Filtered map pins
  const filteredMapBookings = bookingsList.filter(b => {
    if (mapFilterStatus === 'all') return true;
    return b.status === mapFilterStatus;
  });

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

      {/* ==================== 1. PRESTATAIRE HEADER ==================== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Prestataire Profile Badge */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('accueil')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <AfriNovaLogo size="md" variant="light" showSlogan={false} />
              <span className="bg-[#16A34A]/15 text-[#15803D] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                <Wrench className="w-3 h-3 text-[#16A34A]" />
                <span>Espace Prestataire Pro</span>
              </span>
            </div>
          </div>

          {/* Quick Prestataire Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Disponibilité Status Toggle */}
            <button
              onClick={() => {
                setIsAvailable(!isAvailable);
                showToast(isAvailable ? '🔴 Statut passé en Indisponible' : '🟢 Statut passé en En Ligne (Disponible)');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition flex items-center gap-1.5 border cursor-pointer ${
                isAvailable 
                  ? 'bg-emerald-50 text-[#15803D] border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[#16A34A] animate-pulse' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline">{isAvailable ? 'En Ligne' : 'Indisponible'}</span>
            </button>

            {/* Quick Add Service */}
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
              className="bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold px-3 py-1.5 rounded-full transition shadow-xs flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">+ Service</span>
            </button>

            {/* Notification Center Trigger */}
            <button
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              className={`p-2 rounded-full transition relative cursor-pointer ${
                showNotificationPanel ? 'bg-amber-50 text-[#D97706]' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Centre de notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadNotifCount}
                </span>
              )}
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

      {/* QUICK ACTIONS BAR (BARRE D'ACTIONS RAPIDES 1-CLIC) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm mb-6 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span>Actions Rapides Prestataire</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400">Accès direct 1-clic</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {/* Action 1: Modifier Profil */}
          <button
            onClick={() => setShowEditProfileModal(true)}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 text-slate-800 border border-slate-200/80 flex flex-col items-center justify-center gap-1 transition cursor-pointer group"
          >
            <Edit3 className="w-4 h-4 text-[#2563EB] group-hover:scale-110 transition" />
            <span className="text-[10px] font-extrabold leading-tight">Modifier Profil</span>
          </button>

          {/* Action 2: Ajouter Service */}
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
            className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] border border-emerald-200 flex flex-col items-center justify-center gap-1 transition cursor-pointer group"
          >
            <Plus className="w-4 h-4 stroke-[3] group-hover:scale-110 transition" />
            <span className="text-[10px] font-black leading-tight">+ Service</span>
          </button>

          {/* Action 3: Gérer Services */}
          <button
            onClick={() => setActiveTab('services')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80 flex flex-col items-center justify-center gap-1 transition cursor-pointer group"
          >
            <Wrench className="w-4 h-4 text-[#2563EB] group-hover:scale-110 transition" />
            <span className="text-[10px] font-extrabold leading-tight">Gérer Services</span>
          </button>

          {/* Action 4: Scanner QR Code */}
          <button
            onClick={() => setShowQrModal(true)}
            className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 flex flex-col items-center justify-center gap-1 transition cursor-pointer group"
          >
            <QrCode className="w-4 h-4 group-hover:scale-110 transition" />
            <span className="text-[10px] font-black leading-tight">Scanner QR</span>
          </button>

          {/* Action 5: Rapport PDF */}
          <button
            onClick={() => setShowPdfReportModal(true)}
            className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 flex flex-col items-center justify-center gap-1 transition cursor-pointer group"
          >
            <Download className="w-4 h-4 group-hover:scale-110 transition" />
            <span className="text-[10px] font-black leading-tight">Rapport PDF</span>
          </button>

          {/* Action 6: Partager Profil */}
          <button
            onClick={() => setShowShareModal(true)}
            className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex flex-col items-center justify-center gap-1 transition cursor-pointer group"
          >
            <Share2 className="w-4 h-4 group-hover:scale-110 transition" />
            <span className="text-[10px] font-black leading-tight">Partager Profil</span>
          </button>

          {/* Action 7: Contacter Assistance */}
          <button
            onClick={() => setShowSupportModal(true)}
            className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex flex-col items-center justify-center gap-1 transition cursor-pointer group"
          >
            <Headphones className="w-4 h-4 group-hover:scale-110 transition" />
            <span className="text-[10px] font-black leading-tight">Assistance 24/7</span>
          </button>
        </div>
      </div>

      {/* FLOATING NOTIFICATION PANEL DRAWER */}
      <AnimatePresence>
        {showNotificationPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl mb-6 relative z-30"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-extrabold text-slate-900 text-sm">Centre de Notifications ({notifications.length})</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllNotifsRead}
                  className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Tout marquer comme lu
                </button>
                <button onClick={() => setShowNotificationPanel(false)} className="p-1 text-slate-400 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pt-2 space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded-2xl flex items-start gap-3 text-xs ${n.unread ? 'bg-blue-50/50' : 'bg-slate-50'}`}>
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-[#2563EB] animate-pulse' : 'bg-slate-300'}`} />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-extrabold text-slate-900">{n.title}</p>
                    <p className="text-slate-600">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVIGATION TABS BAR PRESTATAIRE */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[57px] z-30 shadow-2xs mb-6">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-2">
          {[
            { id: 'accueil', label: 'Vue Générale', icon: Briefcase },
            { id: 'carte', label: 'Carte Interventions', icon: Navigation, badge: 'GPS' },
            { id: 'calendrier', label: 'Calendrier Planning', icon: CalendarIcon },
            { id: 'services', label: `Services (${servicesList.length})`, icon: Wrench },
            { id: 'disponibilites', label: 'Horaires & Zones', icon: Clock },
            { id: 'reservations', label: `Réservations (${bookingsList.filter(b => b.status === 'pending').length})`, icon: CalendarDays, badge: bookingsList.filter(b => b.status === 'pending').length || undefined },
            { id: 'finances', label: 'Paiements & Revenus', icon: DollarSign },
            { id: 'stats', label: 'Graphiques Performance', icon: BarChart3 },
            { id: 'messages', label: 'Messagerie', icon: MessageSquare, badge: 1 },
            { id: 'avis', label: `Avis (${reviewsList.length})`, icon: Star },
            { id: 'profil', label: 'Profil', icon: UserIcon },
            { id: 'abonnement', label: 'Abonnement VIP', icon: ShieldCheck },
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

      {/* MAIN DYNAMIC TAB CONTENTS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">

        {/* 1. ACCUEIL - VUE GÉNÉRALE */}
        {activeTab === 'accueil' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
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
                  <span>Revenus du Mois</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">{revenueStats.month.toLocaleString('fr-FR')} FCFA</p>
                <span className="text-[10px] text-[#16A34A] font-bold">+22% ce mois</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Satisfaction Client</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-black">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                </div>
                <p className="text-xl font-black text-[#0F172A]">4.95 / 5.0</p>
                <span className="text-[10px] text-slate-500 font-medium">Avis certifiés AfriNova</span>
              </div>
            </div>

            {/* Quick Map Preview */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#2563EB]" />
                    <span>Carte des Interventions du Jour</span>
                  </h3>
                  <p className="text-xs text-slate-500">Visualisez la localisation exacte de vos clients à Bafoussam.</p>
                </div>
                <button
                  onClick={() => setActiveTab('carte')}
                  className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Agrandir la Carte</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-100 rounded-2xl p-4 h-48 border border-slate-200 relative overflow-hidden flex flex-col justify-center items-center text-center space-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-blue-100/30 to-purple-100/40 pointer-events-none" />
                <Navigation className="w-10 h-10 text-[#2563EB] animate-bounce relative z-10" />
                <p className="font-bold text-xs text-slate-800 relative z-10">4 interventions répertoriées dans Bafoussam Tamdja & Kamkop</p>
                <button
                  onClick={() => setActiveTab('carte')}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-xs cursor-pointer relative z-10"
                >
                  Ouvrir la Carte Interactive GPS
                </button>
              </div>
            </div>

            {/* Upcoming Interventions List Preview */}
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

        {/* 2. CARTE INTERACTIVE DES INTERVENTIONS */}
        {activeTab === 'carte' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
              <div>
                <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#2563EB]" />
                  <span>Carte Interactive des Interventions Bafoussam</span>
                </h2>
                <p className="text-xs text-slate-500">Localisez vos clients, vérifiez l'itinéraire et gérez vos déplacements.</p>
              </div>

              {/* Filter Pins by Status */}
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'Toutes' },
                  { id: 'pending', label: 'En attente' },
                  { id: 'accepted', label: 'Confirmées' },
                  { id: 'completed', label: 'Terminées' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMapFilterStatus(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                      mapFilterStatus === f.id ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Simulated Visual Interactive Map */}
              <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 relative min-h-[420px] shadow-lg flex flex-col justify-between border border-slate-800 overflow-hidden">
                {/* Background Map Grid Effect */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 flex justify-between items-center text-white">
                  <span className="bg-blue-600/80 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                    Région Ouest • Bafoussam GPS Live
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Zoom: 14x</span>
                </div>

                {/* Pin markers on Map */}
                <div className="relative z-10 my-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredMapBookings.map((b) => {
                    const isSelected = selectedMapPin?.id === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelectedMapPin(b)}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer relative ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-400 shadow-xl scale-105' 
                            : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className={`w-4 h-4 ${b.status === 'accepted' ? 'text-emerald-400' : 'text-amber-400'}`} />
                          <span className="text-[10px] font-black uppercase truncate">{b.location.split(',')[0]}</span>
                        </div>
                        <p className="text-xs font-extrabold truncate">{b.client}</p>
                        <p className="text-[10px] text-slate-300 font-mono">{b.distanceKm} km • {b.estimatedTimeMin} min</p>
                      </button>
                    );
                  })}
                </div>

                {/* Map Footer info */}
                <div className="relative z-10 bg-slate-800/80 backdrop-blur-xs p-3 rounded-2xl text-white text-xs flex justify-between items-center">
                  <span className="text-slate-300">Sélectionnez une épingle pour afficher les détails de trajet et la fiche client.</span>
                  <span className="font-extrabold text-emerald-400">● GPS Actif</span>
                </div>
              </div>

              {/* Selected Pin Details Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                {selectedMapPin ? (
                  <>
                    <div className="border-b border-slate-100 pb-3 space-y-1">
                      <span className="bg-blue-100 text-[#2563EB] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                        Fiche Trajet Client
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base">{selectedMapPin.title}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#16A34A]" /> {selectedMapPin.location}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nom du client:</span>
                        <span className="font-extrabold text-slate-900">{selectedMapPin.client}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Téléphone:</span>
                        <span className="font-mono font-extrabold text-blue-600">{selectedMapPin.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Distance depuis votre position:</span>
                        <span className="font-extrabold text-slate-900">{selectedMapPin.distanceKm} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Temps de trajet estimé (Moto/Auto):</span>
                        <span className="font-extrabold text-emerald-600">{selectedMapPin.estimatedTimeMin} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Montant proposé:</span>
                        <span className="font-extrabold text-[#16A34A]">{selectedMapPin.budget}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => {
                          showToast(`🗺️ Navigation GPS lancée vers ${selectedMapPin.location}`);
                          window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedMapPin.location + ' Bafoussam')}`, '_blank');
                        }}
                        className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-2xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Lancer Navigation GPS (Google Maps / Waze)</span>
                      </button>

                      <a
                        href={`tel:${selectedMapPin.phone}`}
                        className="w-full bg-emerald-100 hover:bg-emerald-200 text-[#16A34A] font-extrabold text-xs py-2.5 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Appeler {selectedMapPin.client}</span>
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-10">Cliquez sur une intervention sur la carte.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. CALENDRIER DE PLANIFICATION (JOUR, SEMAINE, MOIS) */}
        {activeTab === 'calendrier' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
              <div>
                <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#2563EB]" />
                  <span>Calendrier & Planning des Interventions</span>
                </h2>
                <p className="text-xs text-slate-500">Organisez vos rendez-vous par jour, semaine ou mois.</p>
              </div>

              {/* Day / Week / Month Mode Selector */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
                {[
                  { id: 'day', label: 'Jour' },
                  { id: 'week', label: 'Semaine' },
                  { id: 'month', label: 'Mois' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setCalendarViewMode(mode.id as any)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      calendarViewMode === mode.id ? 'bg-[#0F172A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="font-extrabold text-slate-900 text-sm">{calendarSelectedDate}</span>
                <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full">
                  {bookingsList.length} interventions planifiées
                </span>
              </div>

              {/* Day View Timeline */}
              {calendarViewMode === 'day' && (
                <div className="space-y-2">
                  {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((time) => {
                    const match = bookingsList.find(b => b.time.startsWith(time.slice(0, 2)));
                    return (
                      <div key={time} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-mono font-bold text-xs text-slate-400 w-14 shrink-0 mt-1">{time}</span>
                        {match ? (
                          <div className="flex-1 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                            <span className="font-extrabold text-slate-900 block">{match.title}</span>
                            <span className="text-slate-600 block">{match.client} • {match.location}</span>
                            <span className="text-[10px] font-black text-[#16A34A]">{match.budget}</span>
                          </div>
                        ) : (
                          <div className="flex-1 text-xs text-slate-400 italic py-2">Créneau libre</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Week View Grid */}
              {calendarViewMode === 'week' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {['Lun 01', 'Mar 02', 'Mer 03', 'Jeu 04', 'Ven 05', 'Sam 06', 'Dim 07'].map((day, idx) => (
                    <div key={day} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 min-h-36">
                      <span className="font-extrabold text-xs text-slate-900 block border-b pb-1">{day}</span>
                      {idx === 0 && (
                        <div className="bg-emerald-100 p-2 rounded-xl text-[10px] font-extrabold text-emerald-900 space-y-0.5">
                          <p>10h00 Solaire 5KVA</p>
                          <p className="text-slate-600">Mme Pougoue</p>
                        </div>
                      )}
                      {idx === 1 && (
                        <div className="bg-blue-100 p-2 rounded-xl text-[10px] font-extrabold text-blue-900 space-y-0.5">
                          <p>09h00 Climatiseur</p>
                          <p className="text-slate-600">Cabinet Notarial</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Month View Grid */}
              {calendarViewMode === 'month' && (
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                    <div key={d} className="font-black text-slate-400 py-1">{d}</div>
                  ))}
                  {Array.from({ length: 31 }).map((_, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl border text-xs font-bold ${
                        i === 0 ? 'bg-[#2563EB] text-white border-blue-600 font-black' : 'bg-slate-50 text-slate-700 border-slate-200/60'
                      }`}
                    >
                      {i + 1}
                      {i === 0 && <span className="block text-[8px] mt-0.5">2 rdv</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. SERVICES LIST & ADD/EDIT */}
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
                    <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-36">
                      <img src={service.images[0] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'} alt={service.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 text-[9px] font-black text-white bg-[#0F172A]/80 backdrop-blur-xs px-2 py-0.5 rounded-full uppercase">
                        {service.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#0F172A] leading-snug">{service.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Tarif défini</span>
                      <span className="font-black text-[#16A34A] text-sm">
                        {service.pricingType === 'devis' ? 'Sur Devis' : `${service.price.toLocaleString()} FCFA`}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenEditService(service)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(service.id)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DISPONIBILITÉS, HORAIRES ET ZONES */}
        {activeTab === 'disponibilites' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Définir Horaires, Pause & Zones d'Intervention</h2>

            {/* Mode Availability Selector */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <label className="text-xs font-black uppercase text-slate-500">Mode de Disponibilité Actif</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'immediate', label: '🟢 En Ligne (Urgence 24/7)', desc: 'Interventions immédiates sous 30 min' },
                  { id: 'appointment', label: '📅 Sur Rendez-vous', desc: 'Selon planning fixé au préalable' },
                  { id: 'busy', label: '🔴 En Pause / Indisponible', desc: 'Aucune réservation acceptée' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setAvailabilityMode(mode.id as any);
                      showToast(`✓ Mode de disponibilité : ${mode.label}`);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      availabilityMode === mode.id ? 'bg-[#0F172A] text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-800 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    <p className="font-extrabold text-xs">{mode.label}</p>
                    <p className={`text-[10px] mt-0.5 ${availabilityMode === mode.id ? 'text-slate-300' : 'text-slate-500'}`}>{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Schedule */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#2563EB]" />
                    <h3 className="font-black text-sm text-[#0F172A]">Horaires d'Ouverture Hebdomadaires</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  {weeklySchedule.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs gap-2">
                      <span className="font-bold w-24 text-slate-900">{item.day}</span>
                      {item.active ? (
                        <div className="flex items-center gap-1 font-mono">
                          <span>{item.openTime}</span>
                          <span>-</span>
                          <span>{item.closeTime}</span>
                        </div>
                      ) : (
                        <span className="text-rose-500 font-bold text-[10px]">Fermé</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Zones & Radius */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin className="w-5 h-5 text-[#16A34A]" />
                  <h3 className="font-black text-sm text-[#0F172A]">Rayon Desserte & Quartiers</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Rayon d'action maximal: <strong className="text-[#2563EB]">{radiusKm} km</strong></label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full accent-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {interventionZones.map((z, idx) => (
                    <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold flex justify-between items-center">
                      <span className="truncate">{z.name}</span>
                      <span className="text-[10px] text-emerald-600 font-mono">+{z.extraFee} F</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. RÉSERVATIONS */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Gestion des Demandes Clients</h2>

            <div className="space-y-3">
              {bookingsList.map((req) => (
                <div key={req.id} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-[#0F172A]">{req.title}</h4>
                    <span className="font-black text-[#16A34A] text-sm bg-emerald-50 px-3 py-1 rounded-xl">{req.budget}</span>
                  </div>

                  <p className="text-xs text-slate-600">Client: {req.client} ({req.phone}) • Lieu: {req.location}</p>

                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    {req.status === 'pending' && (
                      <button onClick={() => handleAcceptBooking(req.id)} className="px-4 py-2 bg-[#16A34A] text-white text-xs font-black rounded-xl">
                        Accepter
                      </button>
                    )}
                    {req.status === 'accepted' && (
                      <button onClick={() => handleCompleteMission(req.id)} className="px-4 py-2 bg-[#2563EB] text-white text-xs font-black rounded-xl">
                        Terminer prestation
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. FINANCES & TABLEAU DES REVENUS (JOUR, SEMAINE, MOIS, ANNÉE) */}
        {activeTab === 'finances' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Tableau des Revenus & Encaissements</h2>

            {/* Comparative Revenues Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Aujourd'hui</span>
                <p className="text-lg font-black text-[#16A34A]">{revenueStats.today.toLocaleString()} FCFA</p>
                <span className="text-[9px] text-slate-500 font-bold">2 prestations</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cette Semaine</span>
                <p className="text-lg font-black text-[#2563EB]">{revenueStats.week.toLocaleString()} FCFA</p>
                <span className="text-[9px] text-slate-500 font-bold">8 prestations</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ce Mois</span>
                <p className="text-lg font-black text-purple-700">{revenueStats.month.toLocaleString()} FCFA</p>
                <span className="text-[9px] text-slate-500 font-bold">24 prestations</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cette Année</span>
                <p className="text-lg font-black text-slate-900">{revenueStats.year.toLocaleString()} FCFA</p>
                <span className="text-[9px] text-slate-500 font-bold">168 prestations</span>
              </div>
            </div>

            {/* Payout Box & Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-[#0F172A] text-white p-6 rounded-3xl space-y-4 shadow-xl">
                <span className="text-xs text-slate-400 font-bold uppercase block">Solde Disponible</span>
                <p className="text-3xl font-black text-[#16A34A]">{paymentTransactions.reduce((acc, t) => acc + t.amount, 0).toLocaleString('fr-FR')} FCFA</p>

                <button
                  onClick={handleRequestPayout}
                  className="w-full py-3 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  Demander le Transfert Mobile Money
                </button>
              </div>

              <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
                <h3 className="font-black text-sm text-[#0F172A] border-b pb-2">Historique des Transactions Encaissées</h3>
                {paymentTransactions.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center font-semibold">Aucune transaction enregistrée. Vos revenus s'afficheront ici au fur et à mesure de vos prestations effectuées.</p>
                ) : (
                  paymentTransactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-blue-600 text-[10px]">{tx.ref}</span>
                        <h4 className="font-bold text-[#0F172A]">{tx.serviceName}</h4>
                        <p className="text-[10px] text-slate-400">{tx.clientName} • {tx.date}</p>
                      </div>
                      <span className="font-black text-[#16A34A] text-sm">+{tx.amount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 8. GRAPHIQUES DE PERFORMANCE */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Graphiques de Performance & Analytique</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Satisfaction Client</span>
                <p className="text-3xl font-black text-[#16A34A]">98.5 %</p>
                <p className="text-[10px] text-slate-500">Note moyenne de 4.95/5 sur 32 avis.</p>
              </div>

              <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Temps de Réponse Moyen</span>
                <p className="text-3xl font-black text-[#2563EB]">8 minutes</p>
                <p className="text-[10px] text-slate-500">Moyenne calculée sur 30 jours.</p>
              </div>

              <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Missions Réalisées</span>
                <p className="text-3xl font-black text-purple-700">64 missions</p>
                <p className="text-[10px] text-slate-500">100% sans aucun litige.</p>
              </div>
            </div>

            {/* Visual Chart Bars */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Évolution des Revenus Mensuels (FCFA)</h3>
              <div className="h-40 flex items-end justify-between gap-2 pt-6 px-4 border-b pb-2">
                {[
                  { month: 'Mars', val: 0 },
                  { month: 'Avril', val: 0 },
                  { month: 'Mai', val: 0 },
                  { month: 'Juin', val: 0 },
                  { month: 'Juil', val: 0 },
                  { month: 'Août', val: 0 }
                ].map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      style={{ height: `${item.val > 0 ? (item.val / 700) * 100 : 4}%` }}
                      className="w-full bg-[#2563EB]/20 rounded-t-xl transition"
                    />
                    <span className="text-[10px] font-bold text-slate-500">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. MESSAGERIE INSTANTANÉE */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Messagerie Instantanée Client</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs min-h-[420px]">
              {/* Chat Sidebar */}
              <div className="space-y-2 border-r border-slate-100 pr-3">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-xl text-xs"
                  />
                </div>

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
                  </div>
                ))}
              </div>

              {/* Chat Window */}
              <div className="md:col-span-2 flex flex-col justify-between space-y-4 pl-2">
                <div className="border-b pb-2 flex justify-between items-center">
                  <h4 className="font-black text-xs text-[#0F172A]">{chats[selectedChatIndex].clientName}</h4>
                  <span className="text-[10px] text-[#2563EB] font-bold">{chats[selectedChatIndex].serviceTitle}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px] pr-2">
                  {chats[selectedChatIndex].history.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'prestataire' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-xs text-xs space-y-1 ${
                        m.sender === 'prestataire' ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#0F172A]'
                      }`}>
                        <p>{m.text}</p>
                        <span className={`text-[8px] block text-right ${m.sender === 'prestataire' ? 'text-blue-200' : 'text-slate-400'}`}>{m.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Canned Quick Response Chips */}
                <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                  {['Je suis en route ! 🛵', 'Pouvez-vous préciser le quartier ?', 'Prestation terminée, merci ! 🙏'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSendMessageReply(chip)}
                      className="px-2.5 py-1 bg-blue-50 text-[#2563EB] text-[10px] font-bold rounded-full hover:bg-blue-100 cursor-pointer shrink-0"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={handleSendVoiceNote}
                    className={`p-2 rounded-xl border text-slate-600 hover:bg-slate-100 cursor-pointer ${isRecordingAudio ? 'bg-rose-100 text-rose-600 animate-pulse' : ''}`}
                    title="Enregistrer note vocale"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageReplyText}
                    onChange={(e) => setMessageReplyText(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
                  />

                  <button onClick={() => handleSendMessageReply()} className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10. AVIS CLIENTS & RÉPONSES */}
        {activeTab === 'avis' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A]">Avis & Évaluations Clients</h2>

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

        {/* 11. PROFIL PROFESSIONNEL */}
        {activeTab === 'profil' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Profil Professionnel & Bio</h2>

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

                <button
                  onClick={() => showToast('✅ Profil professionnel mis à jour !')}
                  className="px-6 py-2.5 bg-[#16A34A] text-white text-xs font-black rounded-xl hover:bg-[#15803D] cursor-pointer"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </div>

            <AboutAfriNovaSection />
          </div>
        )}

        {/* 12. ABONNEMENT */}
        {activeTab === 'abonnement' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Abonnement Prestataire VIP</h2>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl space-y-4 max-w-xl shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-black text-sm">{subscription.planName}</h3>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-full uppercase">
                  {subscription.status}
                </span>
              </div>
              <p className="text-xs text-slate-300">Valide jusqu'au {subscription.expiryDate}. Visibilité prioritaire garantie à Bafoussam.</p>
            </div>
          </div>
        )}

        {/* 13. SUPPORT */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0F172A]">Support & Assistance Technique 24/7</h2>

            <div className="p-6 bg-blue-50 text-blue-950 rounded-3xl border border-blue-200 space-y-4 max-w-xl">
              <h3 className="font-black text-sm">Assistance Techniciens Bafoussam</h3>
              <p className="text-xs text-slate-700">Une question ou un litige ? Notre équipe locale vous répond par téléphone ou WhatsApp.</p>
              <a href="tel:+237677894512" className="inline-block px-4 py-2.5 bg-[#2563EB] text-white text-xs font-black rounded-xl">
                Appeler +237 677 89 45 12
              </a>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* QUICK ACTION MODALS                                        */}
      {/* ========================================================= */}

      {/* MODAL 1: MODIFIER LE PROFIL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-[#0F172A]">Modifier Profil Professionnel</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500">Nom / Raison Sociale</label>
                <input
                  type="text"
                  value={providerProfile.name}
                  onChange={(e) => setProviderProfile({ ...providerProfile, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500">Spécialité / Métier</label>
                <input
                  type="text"
                  value={providerProfile.tradeTitle}
                  onChange={(e) => setProviderProfile({ ...providerProfile, tradeTitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>

              <button
                onClick={() => {
                  showToast('✓ Profil mis à jour avec succès !');
                  setShowEditProfileModal(false);
                }}
                className="w-full py-2.5 bg-[#16A34A] text-white font-extrabold rounded-xl cursor-pointer"
              >
                Enregistrer le Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SCANNER QR CODE */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="flex justify-between items-center border-b pb-3 text-left">
              <h3 className="font-black text-sm text-[#0F172A]">Scanner un QR Code Client</h3>
              <button onClick={() => setShowQrModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-white space-y-3 relative overflow-hidden">
              <div className="w-40 h-40 mx-auto border-2 border-dashed border-emerald-400 rounded-xl flex items-center justify-center relative">
                <QrCode className="w-16 h-16 text-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-300">Pointez la caméra vers le QR code de réservation du client.</p>
            </div>

            <button
              onClick={() => {
                showToast('✓ QR Code scanné avec succès ! Réservation #REQ-201 validée.');
                setShowQrModal(false);
              }}
              className="w-full py-3 bg-[#16A34A] text-white font-extrabold text-xs rounded-xl cursor-pointer"
            >
              Simuler le Scan Réussi
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: TÉLÉCHARGER RAPPORT PDF */}
      {showPdfReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-[#0F172A]">Générer Rapport d'Activité PDF</h3>
              <button onClick={() => setShowPdfReportModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <p className="font-extrabold text-slate-900">Rapport Financier & Prestations Bafoussam</p>
              <p className="text-slate-600">Période : Août 2026</p>
              <p className="text-slate-600">Revenus cumulés : {revenueStats.month.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-slate-600">Missions terminées : 24</p>
            </div>

            <button
              onClick={() => {
                showToast('📄 Téléchargement du Rapport PDF lancé !');
                setShowPdfReportModal(false);
              }}
              className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Fichier PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: PARTAGER PROFIL */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-[#0F172A]">Partager mon Profil Professionnel</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                readOnly
                value={`https://afrinova.cm/prestataire/${currentUser?.id || 'pro-1'}`}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`https://afrinova.cm/prestataire/${currentUser?.id || 'pro-1'}`);
                    showToast('✓ Lien copié dans le presse-papier !');
                  }}
                  className="py-2.5 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Copier le Lien
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Retrouvez mes services professionnels sur AfriNova Bafoussam : https://afrinova.cm/prestataire/${currentUser?.id || 'pro-1'}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ASSISTANCE & SUPPORT */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm text-[#0F172A]">Contacter l'Assistance AfriNova</h3>
              <button onClick={() => setShowSupportModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">Ligne directe techniciens & conseillers locaux à Bafoussam.</p>

            <div className="space-y-2">
              <a href="tel:+237677894512" className="block w-full p-3 bg-blue-50 text-[#2563EB] font-bold text-xs rounded-xl text-center">
                Appel : +237 677 89 45 12
              </a>
              <button
                onClick={() => {
                  showToast('✓ Votre demande d\'assistance a été prise en compte.');
                  setShowSupportModal(false);
                }}
                className="w-full p-3 bg-emerald-50 text-[#16A34A] font-bold text-xs rounded-xl"
              >
                Envoyer un Message Prioritaire
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
