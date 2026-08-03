import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SmartProductImage from '../SmartProductImage';
import { getMerchantCoverPhoto, getMerchantLogoUrl } from '../../utils/merchantImage';
import { 
  Search, 
  Grid, 
  Utensils, 
  Smartphone, 
  Shirt, 
  Home as HomeIcon, 
  Pill, 
  Navigation, 
  Building2, 
  MapPin, 
  Star, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Truck, 
  CheckCircle2, 
  Tag, 
  Zap, 
  Wrench, 
  Award, 
  PhoneCall, 
  MessageSquare, 
  Check, 
  Globe, 
  History, 
  CreditCard, 
  Settings, 
  LogOut, 
  HelpCircle, 
  Send, 
  ThumbsUp, 
  Trash2, 
  AlertCircle, 
  MessageCircle, 
  User as UserIcon,
  Mic,
  ScanLine,
  ChevronDown,
  Filter,
  X,
  Package,
  FileText,
  Bell,
  Download,
  Flag,
  Lock,
  Edit3,
  Calendar,
  Share2,
  CheckCircle,
  XCircle,
  Eye,
  SlidersHorizontal,
  Crown
} from 'lucide-react';
import { Product, Merchant, Order, User, AccountType } from '../../types';
import { AfriNovaLogo } from '../AfriNovaLogo';
import AboutAfriNovaSection from '../AboutAfriNovaSection';

export interface ClientHomePageProps {
  products: Product[];
  merchants: Merchant[];
  currentUser: User | null;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigateView: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  orders: Order[];
  favorites: Record<string, boolean>;
  onToggleFavorite: (e: React.MouseEvent, productId: string) => void;
  onOpenScanner?: () => void;
  onLogout?: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onSwitchRole?: (role: AccountType) => void;
}

// 1. PROMO SLIDES
const PROMO_SLIDES = [
  {
    id: 1,
    badge: 'PROMO FLASH • MARCHÉ A',
    title: "Jusqu'à -30% sur les produits frais & épices",
    subtitle: 'Livraison express en 20 min à Tamdja, Kamkop & Djeleng.',
    cta: 'Profiter des réductions',
    bgGradient: 'from-[#0F172A] via-[#1E1B4B] to-[#16A34A]',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    badge: 'AFRINOVA TECH EXPRESS',
    title: 'Smartphones & Accessoires Garantie Bafoussam',
    subtitle: 'Paiement à la livraison par Orange Money ou MTN Mobile Money.',
    cta: 'Découvrir la High-Tech',
    bgGradient: 'from-[#1E1B4B] via-[#4C1D95] to-[#9333EA]',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    badge: 'ARTISANAT & NDOP ROYAL',
    title: 'Créations authentiques de Bafoussam & Foumban',
    subtitle: 'Soutenez les artisans indépendants de l\'Ouest Cameroun.',
    cta: 'Explorer l\'artisanat',
    bgGradient: 'from-[#064E3B] via-[#047857] to-[#10B981]',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
  }
];

// 2. CATÉGORIES GRID
const CATEGORIES_GRID = [
  { id: 'Tous', name: 'Tous', icon: Grid, bg: 'bg-indigo-50 text-[#4F46E5]', categoryName: 'Tous', count: '120+' },
  { id: 'Alimentation & Épicerie', name: 'Épicerie & Repas', icon: Utensils, bg: 'bg-emerald-50 text-[#10B981]', categoryName: 'Alimentation & Épicerie', count: '45' },
  { id: 'Électronique & Tech', name: 'High-Tech & Tel', icon: Smartphone, bg: 'bg-purple-50 text-[#9333EA]', categoryName: 'Électronique & Tech', count: '32' },
  { id: 'Artisanat & Mode', name: 'Mode & Ndop', icon: Shirt, bg: 'bg-amber-50 text-[#D97706]', categoryName: 'Artisanat & Mode', count: '28' },
  { id: 'Maison & Décoration', name: 'Maison & Déco', icon: HomeIcon, bg: 'bg-blue-50 text-[#2563EB]', categoryName: 'Maison & Décoration', count: '19' },
  { id: 'Santé & Pharmacie', name: 'Santé & Soins', icon: Pill, bg: 'bg-rose-50 text-[#E11D48]', categoryName: 'Santé & Pharmacie', count: '14' },
  { id: 'Transport & Taxi', name: 'Express 20min', icon: Navigation, bg: 'bg-teal-50 text-[#0D9488]', categoryName: 'Transport & Taxi', count: '8' },
  { id: 'Prestations & Services', name: 'Services & Artisanat', icon: Wrench, bg: 'bg-slate-100 text-slate-700', categoryName: 'Prestations & Services', count: '22' }
];

// 3. SERVICES LIST
const SERVICES_DATA = [
  {
    id: 'srv-1',
    title: 'Installation & Dépannage Solaire 5KVA',
    providerName: 'Jean-Pierre Nguemo',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    category: 'Électricité & Énergie',
    rating: 4.9,
    reviewsCount: 38,
    price: 35000,
    verified: true,
    availableNow: true,
    location: 'Tamdja, Bafoussam',
    description: 'Pose complète d\'onduleur, régulateur MPPT et câblage sécurisé avec garantie 1 an.',
    phone: '+237 677 12 34 56'
  },
  {
    id: 'srv-2',
    title: 'Plomberie & Sanitaire Express 24h/24',
    providerName: 'Samuel Foka',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    category: 'Plomberie',
    rating: 4.8,
    reviewsCount: 29,
    price: 15000,
    verified: true,
    availableNow: true,
    location: 'Kamkop, Bafoussam',
    description: 'Raccordement tuyauterie PPR, chauffe-eau solaire et dépannage fuites d\'eau d\'urgence.',
    phone: '+237 699 98 76 54'
  },
  {
    id: 'srv-3',
    title: 'Traiteur Repas Traditionnels & Ndop Royal',
    providerName: 'Mme Mireille Kamdem',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    category: 'Restauration',
    rating: 5.0,
    reviewsCount: 52,
    price: 45000,
    verified: true,
    availableNow: true,
    location: 'Marché A, Bafoussam',
    description: 'Buffet taro sauce jaune, koki, poisson fumé pour cérémonies & événements.',
    phone: '+237 675 44 33 22'
  },
  {
    id: 'srv-4',
    title: 'Coiffure & Soins Esthétiques à Domicile',
    providerName: 'Nadine Beauty',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    category: 'Beauté & Bien-être',
    rating: 4.7,
    reviewsCount: 41,
    price: 12000,
    verified: true,
    availableNow: false,
    location: 'Djeleng, Bafoussam',
    description: 'Tresses africaines, maquillage événementiel & soins de peau bio.',
    phone: '+237 680 11 22 33'
  }
];

// 4. PARTNER COMPANIES
const PARTNER_COMPANIES = [
  {
    id: 'corp-1',
    name: 'West-Cameroon Agrobusiness SA',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
    industry: 'Agroalimentaire & Épices',
    branches: '3 succursales',
    verified: true,
    rating: 4.9,
    description: 'Producteur et exportateur agréé du poivre blanc Penja & Bafoussam.',
  },
  {
    id: 'corp-2',
    name: 'SOTRACAM Logistique Express',
    logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=200&q=80',
    industry: 'Transport & Fret Interurbain',
    branches: '5 succursales',
    verified: true,
    rating: 4.8,
    description: 'Livraisons lourdes et légères Ouest-Littoral avec suivi GPS en direct.',
  },
  {
    id: 'corp-3',
    name: 'Bafoussam BTP & Solaire',
    logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80',
    industry: 'Construction & Matériaux',
    branches: '2 succursales',
    verified: true,
    rating: 4.7,
    description: 'Matériaux certifiés et kits d\'énergie solaire hybrides.',
  }
];

// 5. INITIAL CLIENT REVIEWS
const INITIAL_CLIENT_REVIEWS = [
  {
    id: 'rev-1',
    productOrSeller: 'Poivre Blanc Penja Agréé',
    sellerName: 'Épices du Noun - Marché A',
    rating: 5,
    date: 'Hier à 14:30',
    comment: 'Excellente qualité de poivre moulu, parfum très intense. Livraison rapide à Tamdja !'
  },
  {
    id: 'rev-2',
    productOrSeller: 'Installation Solaire Jean-Pierre',
    sellerName: 'Jean-Pierre Nguemo',
    rating: 5,
    date: '28 Juillet 2026',
    comment: 'Installation parfaite du kit solaire hybride. Équipe très professionnelle.'
  }
];

// 6. INITIAL CLIENT MESSAGES
const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    partnerName: 'Épices du Noun (Marché A)',
    partnerRole: 'Vendeur',
    avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Bonjour ! Votre commande de poivre blanc est prête pour le coursier.',
    time: '10:15',
    unread: true,
    messagesList: [
      { sender: 'them', text: 'Bonjour ! Votre commande de poivre blanc est prête pour le coursier.', time: '10:15' },
      { sender: 'me', text: 'Merci beaucoup ! Quel est le délai estimé pour la livraison à Tamdja ?', time: '10:17' },
      { sender: 'them', text: 'Le coursier est déjà en route, environ 15 à 20 minutes maximum.', time: '10:18' }
    ]
  },
  {
    id: 'msg-2',
    partnerName: 'Jean-Pierre Nguemo',
    partnerRole: 'Prestataire Solaire',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Je peux passer ce samedi à 10h pour le devis gratuit.',
    time: 'Hier',
    unread: false,
    messagesList: [
      { sender: 'me', text: 'Bonjour Monsieur, faites-vous des devis gratuits pour kit solaire 3KVA ?', time: 'Hier 14:00' },
      { sender: 'them', text: 'Je peux passer ce samedi à 10h pour le devis gratuit.', time: 'Hier 14:30' }
    ]
  }
];

// 7. INITIAL NOTIFICATIONS
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Commande expédiée 🚚',
    message: 'Votre commande #CMD-8492 est en cours de livraison vers Carrefour Bamiléké.',
    time: 'Il y a 10 min',
    type: 'delivery',
    unread: true
  },
  {
    id: 'notif-2',
    title: 'Offre Spéciale Flash ⚡',
    message: '-20% sur la catégorie Électronique & Smartphones aujourd\'hui au Marché A.',
    time: 'Il y a 2 heures',
    type: 'promo',
    unread: true
  },
  {
    id: 'notif-3',
    title: 'Paiement Confirmé 💳',
    message: 'Votre paiement de 2 500 FCFA via MTN Mobile Money a été validé.',
    time: 'Hier',
    type: 'payment',
    unread: false
  }
];

export default function ClientHomePage({
  products,
  merchants,
  currentUser,
  onSelectProduct,
  onAddToCart,
  onNavigateView,
  selectedCategory,
  onCategoryChange,
  orders,
  favorites,
  onToggleFavorite,
  onOpenScanner,
  onLogout,
  cartCount = 0,
  onOpenCart,
  onSwitchRole
}: ClientHomePageProps) {
  // Navigation Tabs for Client Dashboard
  const [activeTab, setActiveTab] = useState<
    'explore' | 'favorites' | 'orders' | 'delivery' | 'payments' | 
    'messages' | 'notifications' | 'reviews' | 'subscription' | 'profile' | 'settings' | 'support'
  >('explore');

  // Search type filter (Produits, Services, Boutiques, Entreprises)
  const [searchFilterType, setSearchFilterType] = useState<'all' | 'products' | 'services' | 'merchants' | 'companies'>('all');

  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [recentBrowsing, setRecentBrowsing] = useState<Product[]>([]);

  // Local state for orders (to allow instant cancel, invoice download)
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);

  // Interactive Modals State
  const [selectedService, setSelectedService] = useState<typeof SERVICES_DATA[0] | null>(null);
  const [instantBuyProduct, setInstantBuyProduct] = useState<Product | null>(null);
  const [instantBuyDeliveryMode, setInstantBuyDeliveryMode] = useState<'express' | 'relais' | 'magasin'>('express');
  const [instantBuyPaymentMode, setInstantBuyPaymentMode] = useState<'momo' | 'orange' | 'card' | 'cash'>('momo');
  
  // Signalement Modal State
  const [reportingTarget, setReportingTarget] = useState<{ type: 'product' | 'boutique' | 'prestataire', name: string } | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Invoice Modal State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Review Form State
  const [newReviewItem, setNewReviewItem] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileQuarter, setProfileQuarter] = useState(currentUser?.neighborhood || 'Bafoussam');
  const [profileLandmark, setProfileLandmark] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Interactivity States
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeChatId, setActiveChatId] = useState<string | null>('msg-1');
  const [newMessageText, setNewMessageText] = useState('');
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [clientReviews, setClientReviews] = useState(INITIAL_CLIENT_REVIEWS);

  // Active delivery detection
  const activeOrder = localOrders.find(o => o.status === 'delivering' || o.status === 'preparing' || o.status === 'picked_up') || null;

  // Auto-slide banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sync orders if props change
  useEffect(() => {
    if (orders.length > 0) {
      setLocalOrders(orders);
    }
  }, [orders]);

  // Update recent browsing history when selecting a product
  const handleProductClick = (product: Product) => {
    setRecentBrowsing(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 6);
    });
    onSelectProduct(product);
  };

  // Handle voice search simulation
  const handleVoiceSearch = () => {
    setIsVoiceActive(true);
    setTimeout(() => {
      setSearchTerm('Poivre blanc Bafoussam');
      setIsVoiceActive(false);
    }, 1800);
  };

  // Search filter
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredServices = SERVICES_DATA.filter(s => {
    return !searchTerm || s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.providerName.toLowerCase().includes(searchTerm.toLowerCase()) || s.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredMerchants = merchants.filter(m => {
    return !searchTerm || m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) || m.location?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredCompanies = PARTNER_COMPANIES.filter(c => {
    return !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.industry.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Saved / Favorited Products
  const favoritedProducts = products.filter(p => favorites[p.id]);

  // Send message in chat
  const handleSendMessage = () => {
    if (!newMessageText.trim() || !activeChatId) return;
    setMessages(prev => prev.map(m => {
      if (m.id === activeChatId) {
        return {
          ...m,
          lastMessage: newMessageText,
          time: 'À l\'instant',
          messagesList: [
            ...m.messagesList,
            { sender: 'me', text: newMessageText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      }
      return m;
    }));
    setNewMessageText('');
  };

  // Cancel order function
  const handleCancelOrder = (orderId: string) => {
    setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    alert(`La commande #${orderId} a été annulée avec succès.`);
  };

  // Submit review function
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewItem.trim() || !newReviewComment.trim()) return;
    const newRev = {
      id: `rev-${Date.now()}`,
      productOrSeller: newReviewItem,
      sellerName: 'Marché A Bafoussam',
      rating: newReviewRating,
      date: 'Aujourd\'hui',
      comment: newReviewComment
    };
    setClientReviews([newRev, ...clientReviews]);
    setNewReviewItem('');
    setNewReviewComment('');
    alert('Votre avis a été publié avec succès !');
  };

  // Submit report function
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingTarget) return;
    alert(`Votre signalement concernant ${reportingTarget.name} a été transmis à l'équipe modération AfriNova.`);
    setReportingTarget(null);
    setReportReason('');
  };

  // Instant Buy Confirm
  const handleInstantBuyConfirm = () => {
    if (!instantBuyProduct) return;
    const mappedPaymentMethod: 'momo' | 'orange' | 'cash_on_delivery' = 
      instantBuyPaymentMode === 'momo' ? 'momo' : 
      instantBuyPaymentMode === 'orange' ? 'orange' : 'cash_on_delivery';

    const newOrder: Order = {
      id: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser?.id || 'client-1',
      userName: currentUser?.name || 'Paul Kamdem',
      createdAt: new Date().toISOString(),
      status: 'preparing',
      total: (instantBuyProduct.price || 0) + (instantBuyDeliveryMode === 'express' ? 1000 : 0),
      deliveryNeighborhood: profileQuarter,
      deliveryDetails: profileLandmark,
      paymentMethod: mappedPaymentMethod,
      paymentPhone: profilePhone,
      deliveryTimeEstimated: 20,
      items: [{ product: instantBuyProduct, quantity: 1 }]
    };
    setLocalOrders([newOrder, ...localOrders]);
    setInstantBuyProduct(null);
    setActiveTab('delivery');
    alert(`Achat immédiat validé ! Votre commande #${newOrder.id} est en préparation.`);
  };

  // Unread counts
  const unreadNotifCount = notifications.filter(n => n.unread).length;
  const unreadMessageCount = messages.filter(m => m.unread).length;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-24 relative selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ==================== 1. CLIENT HEADER ==================== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Client Profile Badge */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <AfriNovaLogo size="md" variant="light" showSlogan={false} />
              <span className="bg-[#16A34A]/15 text-[#15803D] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                <UserIcon className="w-3 h-3 text-[#16A34A]" />
                <span>Espace Client</span>
              </span>
            </div>
          </div>

          {/* Quick Client Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Quick Messages */}
            <button
              onClick={() => setActiveTab('messages')}
              className={`p-2 rounded-full transition relative cursor-pointer ${
                activeTab === 'messages' ? 'bg-indigo-50 text-[#4F46E5]' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Discuter avec les vendeurs & prestataires"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessageCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Quick Notifications */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`p-2 rounded-full transition relative cursor-pointer ${
                activeTab === 'notifications' ? 'bg-amber-50 text-[#D97706]' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Notifications client"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="p-2 text-slate-700 hover:text-[#16A34A] hover:bg-emerald-50 rounded-full transition cursor-pointer relative"
                title="Mon Panier"
              >
                <ShoppingBag className="w-5 h-5 stroke-[2]" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-[#16A34A] text-white font-black text-[10px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

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

      {/* ==================== 2. CLIENT SUB-NAVIGATION TABS BAR ==================== */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[57px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex items-center gap-1 py-1.5">
          {[
            { id: 'explore', label: 'Recherche & Accueil', icon: Search },
            { id: 'favorites', label: `Favoris (${favoritedProducts.length})`, icon: Heart },
            { id: 'orders', label: `Commandes (${localOrders.length})`, icon: Package },
            { id: 'delivery', label: 'Suivi Livraison', icon: Truck, badge: activeOrder ? '1' : undefined },
            { id: 'payments', label: 'Moyens de Paiement', icon: CreditCard },
            { id: 'messages', label: 'Messages Vendeurs', icon: MessageCircle, badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
            { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
            { id: 'reviews', label: 'Avis & Notes', icon: Star },
            { id: 'subscription', label: 'Abonnement VIP', icon: Crown },
            { id: 'profile', label: 'Mon Profil & Adresses', icon: UserIcon },
            { id: 'settings', label: 'Paramètres', icon: Settings },
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

      {/* ==================== MAIN TAB CONTENT ==================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">

        {/* ------------------ TAB 1: EXPLORE & SEARCH ------------------ */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            
            {/* 1. BARRE DE RECHERCHE INTELLIGENTE */}
            <div className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={isVoiceActive ? "Écoute en cours... Parlez à l'IA AfriNova Client" : "Rechercher produits, services, épicerie, boutiques Bafoussam..."}
                    className={`w-full h-11 sm:h-12 pl-11 pr-24 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition ${
                      isVoiceActive ? 'border-[#16A34A] ring-2 ring-[#16A34A]/30 animate-pulse' : ''
                    }`}
                  />

                  {/* Actions right inside input */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={handleVoiceSearch}
                      className={`p-1.5 rounded-full transition cursor-pointer ${
                        isVoiceActive ? 'text-[#16A34A] bg-emerald-50' : 'text-slate-400 hover:text-[#16A34A]'
                      }`}
                      title="Recherche vocale"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    {onOpenScanner && (
                      <button
                        onClick={onOpenScanner}
                        className="p-1.5 text-slate-400 hover:text-[#16A34A] transition cursor-pointer"
                        title="Scanner Code QR"
                      >
                        <ScanLine className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1.5 text-xs overflow-x-auto scrollbar-none pt-1">
                <span className="text-slate-400 font-extrabold uppercase text-[10px] shrink-0">Filtrer par:</span>
                {[
                  { id: 'all', label: 'Tout' },
                  { id: 'products', label: '🛍️ Produits' },
                  { id: 'services', label: '🛠️ Services' },
                  { id: 'merchants', label: '🏪 Boutiques' },
                  { id: 'companies', label: '🏢 Entreprises' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSearchFilterType(f.id as any)}
                    className={`px-3 py-1 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                      searchFilterType === f.id
                        ? 'bg-[#16A34A] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Quick Search Tags */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 overflow-x-auto scrollbar-none">
                <span className="text-slate-400 font-extrabold uppercase shrink-0">Tendances:</span>
                {['Poivre blanc Bafoussam', 'Chaussures Ndop', 'Smartphone 5G', 'Service Dépannage Solaire', 'Plantain Mbuy'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-[#16A34A] transition shrink-0 cursor-pointer border border-slate-200/60"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. PROMOTIONS BANNER */}
            <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className={`relative w-full aspect-[21/9] sm:aspect-[24/9] min-h-[140px] max-h-[220px] bg-gradient-to-r ${PROMO_SLIDES[currentSlide].bgGradient} p-4 sm:p-6 text-white flex items-center justify-between overflow-hidden`}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 opacity-25 sm:opacity-35 pointer-events-none overflow-hidden">
                    <img
                      src={PROMO_SLIDES[currentSlide].image}
                      alt="Promo"
                      className="w-full h-full object-cover filter contrast-125 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] to-transparent" />
                  </div>

                  <div className="relative z-10 max-w-lg space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-white/20">
                      <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span>{PROMO_SLIDES[currentSlide].badge}</span>
                    </div>

                    <h2 className="text-base sm:text-xl font-black font-display leading-tight text-white drop-shadow-xs">
                      {PROMO_SLIDES[currentSlide].title}
                    </h2>

                    <p className="text-xs text-slate-200 line-clamp-1 font-medium hidden sm:block">
                      {PROMO_SLIDES[currentSlide].subtitle}
                    </p>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          const el = document.getElementById('popular-products');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <span>{PROMO_SLIDES[currentSlide].cta}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#16A34A]" />
                      </button>
                    </div>
                  </div>

                  {/* Slide Indicators */}
                  <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5">
                    {PROMO_SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          i === currentSlide ? 'w-5 bg-[#16A34A]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 3. CATÉGORIES GRID */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs sm:text-sm font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-[#16A34A]" />
                  <span>Catégories & Univers Client</span>
                </h3>
                <button
                  onClick={() => onCategoryChange('Tous')}
                  className="text-xs font-extrabold text-[#16A34A] hover:underline cursor-pointer"
                >
                  Toutes les catégories
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {CATEGORIES_GRID.map((cat) => {
                  const IconComp = cat.icon;
                  const isSelected = selectedCategory === cat.categoryName;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onCategoryChange(cat.categoryName)}
                      className={`p-2.5 rounded-2xl border transition flex flex-col items-center text-center space-y-1 cursor-pointer group relative ${
                        isSelected
                          ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                          : 'bg-white border-slate-100 hover:border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${isSelected ? 'bg-white/10 text-white' : cat.bg} flex items-center justify-center transition group-hover:scale-110`}>
                        <IconComp className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <span className="font-extrabold text-[10px] sm:text-[11px] leading-tight truncate w-full">
                        {cat.name}
                      </span>
                      <span className={`text-[9px] font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. PRODUITS RECOMMANDÉS */}
            {(searchFilterType === 'all' || searchFilterType === 'products') && (
              <div id="popular-products" className="space-y-3">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-black">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-[#0F172A] font-display leading-tight">
                        Produits Recommandés ({filteredProducts.length})
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                        Sélection des meilleures offres au Marché A, Tamdja & Djeleng
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {filteredProducts.map((product, idx) => {
                    const merchant = merchants.find(m => m.id === product.merchantId);
                    const merchantName = merchant?.shopName || merchant?.name || 'Marché A Bafoussam';
                    const rating = product.rating || (4.6 + (idx % 3) * 0.1).toFixed(1);
                    const isFavorite = !!favorites[product.id];

                    return (
                      <motion.div
                        key={product.id}
                        whileHover={{ y: -3 }}
                        onClick={() => handleProductClick(product)}
                        className="bg-white rounded-[20px] border border-slate-100/90 shadow-2xs hover:shadow-lg overflow-hidden flex flex-col justify-between cursor-pointer group transition duration-200 h-full"
                      >
                        <div>
                          {/* Image box with 4:3 Aspect ratio to reduce height by ~25% */}
                          <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-100 rounded-t-[20px]">
                            <SmartProductImage
                              product={product}
                              aspectRatio="4/3"
                              containerClassName="rounded-t-[20px]"
                            />

                            <span className="absolute top-2 left-2 z-10 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-[#16A34A]" />
                              <span className="truncate max-w-[70px] sm:max-w-[100px]">{product.neighborhood || 'Bafoussam'}</span>
                            </span>

                            {/* Discrete 36px top-right buttons overlay */}
                            <div className="absolute top-2 right-2 z-10 flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReportingTarget({ type: 'product', name: product.name });
                                }}
                                className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-rose-400 transition shadow-2xs cursor-pointer"
                                title="Signaler ce produit"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => onToggleFavorite(e, product.id)}
                                className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition shadow-2xs cursor-pointer"
                                title="Favoris"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                              </button>
                            </div>
                          </div>

                          {/* Content Box */}
                          <div className="p-2.5 sm:p-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold gap-1">
                              <div className="flex items-center gap-1 truncate">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                                <span className="font-extrabold text-slate-800">{rating}</span>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 truncate max-w-[80px]">
                                {merchantName}
                              </span>
                            </div>

                            <h4 className="font-bold text-xs text-[#0F172A] group-hover:text-[#16A34A] transition line-clamp-2 leading-tight min-h-[2.1rem]">
                              {product.name}
                            </h4>

                            <div className="flex items-baseline gap-1 pt-0.5">
                              <span className="font-black text-xs sm:text-sm text-[#16A34A]">
                                {product.price ? product.price.toLocaleString('fr-FR') : '0'}
                              </span>
                              <span className="text-[9px] font-bold text-[#16A34A]">FCFA</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Quick Actions - Compact height button with min 44px target */}
                        <div className="p-2.5 sm:p-3 pt-0 flex gap-1.5 mt-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            className="flex-1 h-8 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:bg-[#166534] text-white text-[11px] font-black transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer min-h-[36px]"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Au Panier</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInstantBuyProduct(product);
                            }}
                            className="w-8 h-8 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-[10px] font-black transition flex items-center justify-center shrink-0 shadow-2xs cursor-pointer min-h-[36px]"
                            title="Acheter immédiatement"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. SERVICES RECOMMANDÉS */}
            {(searchFilterType === 'all' || searchFilterType === 'services') && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-black shrink-0">
                      <Wrench className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-[#0F172A] font-display leading-tight">
                        Services & Prestataires Recommandés ({filteredServices.length})
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                        Plomberie, électricité, traiteur, beauté & maintenance à Bafoussam
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  {filteredServices.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-4 rounded-2xl bg-white border border-slate-100/90 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3 min-h-[120px]"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100/60">
                            {srv.category}
                          </span>
                          <button
                            onClick={() => setReportingTarget({ type: 'prestataire', name: srv.providerName })}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Signaler ce prestataire"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="font-extrabold text-xs sm:text-sm text-[#0F172A] line-clamp-2 leading-snug">
                          {srv.title}
                        </h4>

                        <div className="flex items-center gap-2.5 pt-1">
                          <img src={srv.avatar} alt={srv.providerName} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">{srv.providerName}</p>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-slate-700">{srv.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-[#16A34A]">{srv.price.toLocaleString()} FCFA</span>
                        <button
                          onClick={() => setSelectedService(srv)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition cursor-pointer"
                        >
                          Détails & Réserver
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. BOUTIQUES ET PRESTATAIRES POPULAIRES */}
            {(searchFilterType === 'all' || searchFilterType === 'merchants') && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-black shrink-0">
                      <Building2 className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-[#0F172A]">
                      Boutiques Partenaires ({filteredMerchants.length})
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {filteredMerchants.slice(0, 6).map((merchant) => {
                    const coverPhoto = getMerchantCoverPhoto(merchant);
                    const logoUrl = getMerchantLogoUrl(merchant);
                    const isEmojiLogo = merchant.logo && merchant.logo.length <= 4;

                    return (
                      <div
                        key={merchant.id}
                        className="rounded-2xl bg-white border border-slate-100/90 shadow-xs hover:shadow-md transition cursor-pointer relative overflow-hidden flex flex-col justify-between group"
                      >
                        <div className="relative h-20 bg-slate-100 overflow-hidden">
                          <img 
                            src={coverPhoto} 
                            alt={merchant.shopName || merchant.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReportingTarget({ type: 'boutique', name: merchant.shopName || merchant.name });
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-rose-600 transition cursor-pointer z-10"
                            title="Signaler la boutique"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="p-3.5 pt-2 flex-1 flex flex-col justify-between space-y-2">
                          <div className="flex items-start gap-2.5 -mt-6 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white text-slate-900 border-2 border-white flex items-center justify-center font-black text-xs shrink-0 overflow-hidden shadow-sm">
                              {isEmojiLogo ? (
                                <span className="text-base">{merchant.logo}</span>
                              ) : (
                                <img src={logoUrl} alt={merchant.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="truncate pt-4">
                              <div className="flex items-center gap-1">
                                <h4 className="font-extrabold text-xs sm:text-sm text-[#0F172A] truncate group-hover:text-emerald-600 transition-colors">
                                  {merchant.shopName || merchant.name}
                                </h4>
                                <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium truncate">{merchant.location || 'Bafoussam Centre'}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">Boutique Agréée</span>
                            <span className="text-slate-500 font-bold group-hover:text-emerald-600 transition">Visiter →</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. ENTREPRISES POPULAIRES */}
            {(searchFilterType === 'all' || searchFilterType === 'companies') && (
              <div className="space-y-3 pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center font-black shrink-0">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-[#0F172A]">Entreprises Agréées ({filteredCompanies.length})</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {filteredCompanies.map((corp) => (
                    <div key={corp.id} className="p-4 rounded-2xl bg-white border border-slate-100/90 shadow-xs space-y-2.5 min-h-[105px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={corp.logo} alt={corp.name} className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-100" />
                        <div className="truncate">
                          <h4 className="font-extrabold text-xs sm:text-sm text-[#0F172A] truncate">{corp.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">{corp.industry}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">Agréée</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. HISTORIQUE DE NAVIGATION */}
            {recentBrowsing.length > 0 && (
              <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#16A34A]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Historique de navigation récents</h3>
                  </div>
                  <button
                    onClick={() => setRecentBrowsing([])}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    Effacer l'historique
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {recentBrowsing.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleProductClick(item)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 transition cursor-pointer text-center space-y-1"
                    >
                      <img src={item.images?.[0]} alt={item.name} className="w-12 h-12 object-cover rounded-lg mx-auto" />
                      <p className="text-[10px] font-extrabold text-slate-800 truncate">{item.name}</p>
                      <span className="text-[9px] font-black text-[#16A34A]">{item.price?.toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------ TAB 2: FAVORIS ------------------ */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h2 className="text-lg font-black text-[#0F172A]">Mes Produits & Services Favoris ({favoritedProducts.length})</h2>
              </div>
            </div>

            {favoritedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {favoritedProducts.map((product) => (
                  <div key={product.id} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-2 relative">
                    <img src={product.images?.[0]} alt={product.name} className="w-full h-28 object-cover rounded-xl" />
                    <h4 className="font-bold text-xs text-[#0F172A] truncate">{product.name}</h4>
                    <p className="font-black text-xs text-[#16A34A]">{product.price?.toLocaleString()} FCFA</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onAddToCart(product)}
                        className="flex-1 py-1.5 bg-[#16A34A] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        Ajouter
                      </button>
                      <button
                        onClick={(e) => onToggleFavorite(e, product.id)}
                        className="p-1.5 text-rose-500 bg-rose-50 rounded-lg cursor-pointer"
                        title="Retirer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 space-y-2">
                <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">Aucun produit dans vos favoris.</p>
                <button onClick={() => setActiveTab('explore')} className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer">
                  Découvrir les produits
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------ TAB 3: COMMANDES ------------------ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#16A34A]" />
                <h2 className="text-lg font-black text-[#0F172A]">Mes Commandes & Historique ({localOrders.length})</h2>
              </div>
            </div>

            {localOrders.length > 0 ? (
              <div className="space-y-3">
                {localOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-mono text-xs font-black text-slate-900">Commande #{order.id}</span>
                        <p className="text-[10px] text-slate-400">Passée le {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        order.status === 'delivering' ? 'bg-blue-50 text-blue-700' :
                        order.status === 'completed' ? 'bg-emerald-50 text-[#16A34A]' :
                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {order.status === 'delivering' ? '🚚 En cours de livraison' : 
                         order.status === 'completed' ? '✅ Livrée avec succès' : 
                         order.status === 'cancelled' ? '❌ Annulée' : '⏳ En préparation'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {order.items?.map((item, idx) => {
                        const itemName = item.product?.name || (item as any).name || 'Article';
                        const itemPrice = item.product?.price || (item as any).price || 0;
                        return (
                          <div key={idx} className="flex justify-between items-center text-xs text-slate-700">
                            <span>{item.quantity}x {itemName}</span>
                            <span className="font-bold">{itemPrice.toLocaleString()} FCFA</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span className="text-xs font-bold text-slate-500">Total payé ({order.paymentMethod || 'Mobile Money'}):</span>
                      <span className="text-sm font-black text-[#16A34A]">{order.total ? order.total.toLocaleString() : '0'} FCFA</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => setActiveTab('delivery')}
                        className="px-3 py-1.5 bg-[#0F172A] text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Suivre la livraison
                      </button>

                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>Télécharger Facture</span>
                      </button>

                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Annuler la commande
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 space-y-2">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">Vous n'avez pas encore passé de commande.</p>
              </div>
            )}
          </div>
        )}

        {/* ------------------ TAB 4: LIVRAISON ------------------ */}
        {activeTab === 'delivery' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Truck className="w-5 h-5 text-[#16A34A]" />
              <h2 className="text-lg font-black text-[#0F172A]">Suivi de Livraison Express Bafoussam (Temps Réel)</h2>
            </div>

            <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl space-y-5 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400">Statut en direct</span>
                  <h3 className="text-base font-black text-white">Coursier AfriNova Express en route 🛵</h3>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full border border-emerald-500/30">
                  ETA: 15-20 Min
                </span>
              </div>

              {/* Progress Steps Visualizer */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto font-black">1</div>
                  <span className="text-emerald-400">Confirmée</span>
                </div>
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto font-black">2</div>
                  <span className="text-emerald-400">Préparation</span>
                </div>
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto font-black ring-4 ring-emerald-500/30 animate-pulse">3</div>
                  <span className="text-emerald-300 font-black">En route</span>
                </div>
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center mx-auto font-black">4</div>
                  <span className="text-slate-400">Livrée</span>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Adresse de livraison:</span>
                  <span className="font-extrabold text-white">{profileQuarter} ({profileLandmark})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Nom du coursier:</span>
                  <span className="font-extrabold text-emerald-300">Paul (Coursier AfriNova Bafoussam)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Téléphone coursier:</span>
                  <a href="tel:+237677894512" className="font-mono font-bold text-amber-400 hover:underline">+237 677 89 45 12</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------ TAB 5: PAIEMENTS ------------------ */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <CreditCard className="w-5 h-5 text-[#16A34A]" />
              <h2 className="text-lg font-black text-[#0F172A]">Moyens de Paiement Sécurisés</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xl">💛</span>
                <h4 className="font-extrabold text-xs text-[#0F172A]">MTN Mobile Money</h4>
                <p className="text-[10px] text-slate-500">Paiement par code USSD (*126#)</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Configuré</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xl">🧡</span>
                <h4 className="font-extrabold text-xs text-[#0F172A]">Orange Money</h4>
                <p className="text-[10px] text-slate-500">Validation par code PIN (#150#)</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Configuré</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xl">💳</span>
                <h4 className="font-extrabold text-xs text-[#0F172A]">Carte Visa / MasterCard</h4>
                <p className="text-[10px] text-slate-500">Paiement bancaire en ligne sécurisé</p>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">Disponible</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xl">💵</span>
                <h4 className="font-extrabold text-xs text-[#0F172A]">Paiement Cash à la Livraison</h4>
                <p className="text-[10px] text-slate-500">Payez en espèces à la réception</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Disponible</span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------ TAB 6: MESSAGES ------------------ */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <MessageSquare className="w-5 h-5 text-[#16A34A]" />
              <h2 className="text-lg font-black text-[#0F172A]">Discussions Directes Vendeurs & Prestataires</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-3xl border border-slate-200 overflow-hidden min-h-[400px]">
              {/* Conversations List */}
              <div className="border-r border-slate-100 p-3 space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 px-2">Conversations</h4>
                {messages.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveChatId(m.id)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition cursor-pointer ${
                      activeChatId === m.id ? 'bg-[#0F172A] text-white' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <img src={m.avatar} alt={m.partnerName} className="w-9 h-9 rounded-full object-cover" />
                    <div className="flex-1 truncate">
                      <div className="flex justify-between items-center">
                        <h5 className="font-bold text-xs truncate">{m.partnerName}</h5>
                        <span className="text-[9px] text-slate-400">{m.time}</span>
                      </div>
                      <p className={`text-[10px] truncate ${activeChatId === m.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {m.lastMessage}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Chat Messages Box */}
              <div className="md:col-span-2 p-4 flex flex-col justify-between bg-slate-50/50">
                {activeChatId ? (
                  <>
                    <div className="space-y-3 overflow-y-auto max-h-[300px] p-2">
                      {messages.find(m => m.id === activeChatId)?.messagesList.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs px-3.5 py-2 rounded-2xl text-xs ${
                            msg.sender === 'me' ? 'bg-[#16A34A] text-white' : 'bg-white text-slate-800 border border-slate-200'
                          }`}>
                            <p>{msg.text}</p>
                            <span className="text-[8px] opacity-70 block text-right mt-0.5">{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Écrivez votre message au vendeur/prestataire..."
                        className="flex-1 h-10 px-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#16A34A]"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="h-10 px-4 bg-[#16A34A] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-slate-400 text-xs font-bold">
                    Sélectionnez une conversation pour discuter.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------ TAB 7: NOTIFICATIONS ------------------ */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#16A34A]" />
                <h2 className="text-lg font-black text-[#0F172A]">Notifications Client</h2>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
              >
                Tout marquer comme lu
              </button>
            </div>

            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3.5 rounded-2xl border transition ${n.unread ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-[#0F172A]">{n.title}</h4>
                    <span className="text-[9px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------ TAB 8: AVIS & NOTES ------------------ */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-lg font-black text-[#0F172A]">Mes Avis & Évaluations Laissés</h2>
            </div>

            {/* Formulaire de publication d'avis */}
            <form onSubmit={handleSubmitReview} className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-xs">
              <h3 className="font-black text-sm text-[#0F172A]">Donner une note et publier un avis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Produit, Service ou Boutique concerné</label>
                  <input
                    type="text"
                    value={newReviewItem}
                    onChange={(e) => setNewReviewItem(e.target.value)}
                    placeholder="Ex: Poivre Blanc Penja / Dépannage Solaire"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Note (sur 5 étoiles)</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5) Excellent</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5) Très Bon</option>
                    <option value={3}>⭐⭐⭐ (3/5) Moyen</option>
                    <option value={2}>⭐⭐ (2/5) Passable</option>
                    <option value={1}>⭐ (1/5) Insatisfaisant</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Votre commentaire détaillé</label>
                <textarea
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Partagez votre expérience sur la qualité du produit et la ponctualité de livraison..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold h-20"
                  required
                />
              </div>
              <button type="submit" className="px-5 py-2 bg-[#16A34A] text-white font-bold text-xs rounded-xl cursor-pointer">
                Publier mon Avis
              </button>
            </form>

            <div className="space-y-3">
              {clientReviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-[#0F172A]">{rev.productOrSeller}</h4>
                      <p className="text-[10px] text-slate-400">{rev.sellerName} • {rev.date}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------ TAB 9: ABONNEMENT VIP ------------------ */}
        {activeTab === 'subscription' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-[#0F172A]">Abonnement Client VIP AfriNova</h2>
            </div>

            <div className="p-6 bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] text-white rounded-3xl space-y-4 shadow-md">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 bg-amber-400/20 text-amber-300 font-black text-xs rounded-full border border-amber-400/30 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Client Privilège Bafoussam
                </span>
                <span className="text-xs font-bold text-slate-300">Statut: Actif</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black font-display">Avantages de votre Pass Client</h3>
                <ul className="text-xs text-slate-200 space-y-1.5 list-disc list-inside">
                  <li>Livraison Express 20 min prioritaire à Bafoussam</li>
                  <li>Accès aux Ventes Flash & Promos réservées</li>
                  <li>Assistance téléphonique VIP 24h/24</li>
                  <li>Paiement différé par Mobile Money autorisé</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ------------------ TAB 10: PROFIL & ADRESSES ------------------ */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <UserIcon className="w-5 h-5 text-[#16A34A]" />
              <h2 className="text-lg font-black text-[#0F172A]">Mon Profil & Bascule de Rôle</h2>
            </div>

            {/* Quick Role Switcher Banner */}
            {onSwitchRole && (
              <div className="p-5 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl space-y-3 shadow-md border border-emerald-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-black text-sm">Bascule Rapide d'Espace / Rôle</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Actuel : {currentUser?.accountType?.toUpperCase() || 'CLIENT'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Passez instantanément du profil Client vers vos espaces Vendeur, Entreprise, Prestataire ou Livreur :
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  <button
                    onClick={() => onSwitchRole('client')}
                    className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-500 transition shadow-xs"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Client</span>
                  </button>
                  <button
                    onClick={() => onSwitchRole('vendeur')}
                    className="p-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-blue-500 transition shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Vendeur</span>
                  </button>
                  <button
                    onClick={() => onSwitchRole('entreprise')}
                    className="p-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-purple-500 transition shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Entreprise</span>
                  </button>
                  <button
                    onClick={() => onSwitchRole('prestataire')}
                    className="p-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-500 transition shadow-xs"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Prestataire</span>
                  </button>
                  <button
                    onClick={() => onSwitchRole('livreur')}
                    className="p-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-teal-500 transition shadow-xs col-span-2 sm:col-span-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Livreur</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Infos Personnelles */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
                <h3 className="font-black text-sm text-[#0F172A]">Modifier Informations Personnelles</h3>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Nom Complet</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Téléphone (Mobile Money)</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                  />
                </div>
                <button
                  onClick={() => alert('Profil mis à jour avec succès !')}
                  className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Enregistrer les modifications
                </button>
              </div>

              {/* Adresse de Livraison */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
                <h3 className="font-black text-sm text-[#0F172A]">Adresse de Livraison Bafoussam</h3>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Quartier Principal</label>
                  <input
                    type="text"
                    value={profileQuarter}
                    onChange={(e) => setProfileQuarter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Point de repère pour le coursier</label>
                  <input
                    type="text"
                    value={profileLandmark}
                    onChange={(e) => setProfileLandmark(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                  />
                </div>
                <button
                  onClick={() => alert('Adresse de livraison mise à jour !')}
                  className="px-4 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Mettre à jour l'adresse
                </button>
              </div>
            </div>

            {/* Modifier le Mot de passe */}
            <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3 max-w-md">
              <h3 className="font-black text-sm text-[#0F172A] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Modifier le Mot de Passe</span>
              </h3>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Ancien Mot de passe</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">Nouveau Mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>
              <button
                onClick={() => {
                  if (!oldPassword || !newPassword) return alert('Veuillez remplir tous les champs.');
                  alert('Mot de passe modifié avec succès !');
                  setOldPassword('');
                  setNewPassword('');
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Changer le mot de passe
              </button>
            </div>
          </div>
        )}

        {/* ------------------ TAB 11: PARAMÈTRES ------------------ */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Settings className="w-5 h-5 text-[#16A34A]" />
              <h2 className="text-lg font-black text-[#0F172A]">Paramètres du Compte Client</h2>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-xs text-[#0F172A]">Langue d'affichage</h4>
                  <p className="text-[10px] text-slate-400">Français / English</p>
                </div>
                <span className="text-xs font-black text-[#16A34A]">Français (FR)</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-xs text-[#0F172A]">Notifications Push & SMS</h4>
                  <p className="text-[10px] text-slate-400">Suivi des commandes & promos flash</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Activé</span>
              </div>
            </div>

            {/* À propos d'AfriNova */}
            <AboutAfriNovaSection />
          </div>
        )}

        {/* ------------------ TAB 12: SUPPORT ------------------ */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <HelpCircle className="w-5 h-5 text-[#16A34A]" />
              <h2 className="text-lg font-black text-[#0F172A]">Assistance & Support Client 24h/24</h2>
            </div>

            <div className="p-6 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl space-y-4 text-center">
              <PhoneCall className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-black">Besoin d'aide pour une commande à Bafoussam ?</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Notre équipe support est joignable 7j/7 pour vous assister sur la livraison, les paiements Mobile Money ou les réclamations.
              </p>
              <a
                href="tel:+237677894512"
                className="inline-block px-6 py-3 bg-[#16A34A] text-white font-mono font-black text-sm rounded-2xl shadow-lg cursor-pointer"
              >
                📞 Appeler le +237 677 89 45 12
              </a>
            </div>
          </div>
        )}

      </main>

      {/* ==================== MODALS ==================== */}

      {/* MODAL DETAILS ET RESERVATION SERVICE */}
      {selectedService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-[#0F172A]">Détails du Service</h3>
              <button onClick={() => setSelectedService(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                {selectedService.category}
              </span>
              <h4 className="font-bold text-base text-[#0F172A]">{selectedService.title}</h4>
              <p className="text-xs text-slate-600">{selectedService.description}</p>
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 text-xs">
                <p><strong>Prestataire:</strong> {selectedService.providerName}</p>
                <p><strong>Zone:</strong> {selectedService.location}</p>
                <p><strong>Contact:</strong> {selectedService.phone}</p>
                <p className="text-[#16A34A] font-black text-sm pt-1">Tarif: {selectedService.price.toLocaleString()} FCFA</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setSelectedService(null)} className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">Fermer</button>
              <button
                onClick={() => {
                  alert(`Demande de réservation envoyée à ${selectedService.providerName} !`);
                  setSelectedService(null);
                  setActiveTab('messages');
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#16A34A] rounded-xl"
              >
                Réserver Maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ACHETER IMMÉDIATEMENT */}
      {instantBuyProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-[#0F172A] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Acheter Immédiatement</span>
              </h3>
              <button onClick={() => setInstantBuyProduct(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <img src={instantBuyProduct.images?.[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h4 className="font-bold text-xs text-[#0F172A]">{instantBuyProduct.name}</h4>
                <p className="font-black text-xs text-[#16A34A]">{instantBuyProduct.price?.toLocaleString()} FCFA</p>
              </div>
            </div>

            {/* Delivery mode */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Mode de livraison</label>
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                {[
                  { id: 'express', label: '🛵 Express 20m (+1000 FCFA)' },
                  { id: 'relais', label: '📦 Point Relais' },
                  { id: 'magasin', label: '🏪 Retrait Magasin' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setInstantBuyDeliveryMode(m.id as any)}
                    className={`p-2 rounded-xl text-[10px] font-bold border transition text-center cursor-pointer ${
                      instantBuyDeliveryMode === m.id ? 'bg-[#16A34A] text-white border-[#16A34A]' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment mode */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Mode de paiement</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {[
                  { id: 'momo', label: '💛 MTN Mobile Money' },
                  { id: 'orange', label: '🧡 Orange Money' },
                  { id: 'card', label: '💳 Carte Bancaire' },
                  { id: 'cash', label: '💵 Espèces à la livraison' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setInstantBuyPaymentMode(p.id as any)}
                    className={`p-2 rounded-xl text-[10px] font-bold border transition text-left cursor-pointer ${
                      instantBuyPaymentMode === p.id ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400">Total à payer:</span>
                <p className="font-black text-sm text-[#16A34A]">
                  {((instantBuyProduct.price || 0) + (instantBuyDeliveryMode === 'express' ? 1000 : 0)).toLocaleString()} FCFA
                </p>
              </div>

              <button
                onClick={handleInstantBuyConfirm}
                className="px-5 py-2.5 bg-[#16A34A] text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                Valider ma Commande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SIGNALEMENT */}
      {reportingTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitReport} className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-[#0F172A] flex items-center gap-1 text-rose-600">
                <Flag className="w-4 h-4" />
                <span>Signaler {reportingTarget.type}</span>
              </h3>
              <button type="button" onClick={() => setReportingTarget(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Signaler <strong>{reportingTarget.name}</strong> pour non-conformité, fausse information ou comportement suspect.
            </p>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400">Motif du signalement</label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Précisez la raison de votre signalement..."
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold h-20"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setReportingTarget(null)} className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">Annuler</button>
              <button type="submit" className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl">Transmettre</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL FACTURE PDF / REÇU */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-[#0F172A] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#16A34A]" />
                <span>Facture Officielle #{selectedInvoiceOrder.id}</span>
              </h3>
              <button onClick={() => setSelectedInvoiceOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <p><strong>Plateforme:</strong> AfriNova Global Tech - Bafoussam</p>
              <p><strong>Client:</strong> {currentUser?.name || 'Paul Kamdem'}</p>
              <p><strong>Date:</strong> {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</p>
              <p><strong>Mode de paiement:</strong> {selectedInvoiceOrder.paymentMethod || 'MTN Mobile Money'}</p>
              <div className="border-t pt-2 space-y-1">
                {selectedInvoiceOrder.items?.map((item, i) => {
                  const itemName = item.product?.name || (item as any).name || 'Article';
                  const itemPrice = item.product?.price || (item as any).price || 0;
                  return (
                    <div key={i} className="flex justify-between">
                      <span>{item.quantity}x {itemName}</span>
                      <span className="font-bold">{itemPrice.toLocaleString()} FCFA</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-2 flex justify-between font-black text-sm text-[#16A34A]">
                <span>Total TTC:</span>
                <span>{selectedInvoiceOrder.total?.toLocaleString()} FCFA</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Téléchargement de la facture PDF #${selectedInvoiceOrder.id} en cours...`);
                setSelectedInvoiceOrder(null);
              }}
              className="w-full py-2.5 bg-[#16A34A] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Fichier PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
