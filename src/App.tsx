/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Product, Merchant, Order, CartItem, Review } from './types';
import { INITIAL_PRODUCTS, INITIAL_MERCHANTS, BAFOUSSAM_NEIGHBORHOODS, INITIAL_REVIEWS, INITIAL_ORDERS } from './data/mockData';
import { Language, translations } from './translations';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import WelcomeGate from './components/WelcomeGate';
import StoreHeader from './components/StoreHeader';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartDrawer from './components/CartDrawer';
import MerchantDashboard from './components/MerchantDashboard';
import DeliveryTracker from './components/DeliveryTracker';
import CityNews from './components/CityNews';
import BestMerchantWidget from './components/BestMerchantWidget';
import AdminPanel from './components/AdminPanel';
import SmartRecommendationBanner from './components/SmartRecommendationBanner';
import SubscriptionExpiredScreen from './components/SubscriptionExpiredScreen';
import PremiumSubscriptionScreen from './components/PremiumSubscriptionScreen';
import SubscriptionNotificationBanner from './components/SubscriptionNotificationBanner';
import SupportPhoneNumber from './components/SupportPhoneNumber';
import RestrictedAuthModal from './components/RestrictedAuthModal';
import SplashScreen from './components/SplashScreen';
import BafoussamMarketHomePage from './components/BafoussamMarketHomePage';
import AddProductModal from './components/AddProductModal';
import Screen2Onboarding from './components/screens/Screen2Onboarding';
import Screen3Connexion from './components/screens/Screen3Connexion';
import Screen4Inscription from './components/screens/Screen4Inscription';
import Screen5TypeCompte from './components/screens/Screen5TypeCompte';
import Screen6DashboardClient from './components/screens/Screen6DashboardClient';
import Screen7Marketplace from './components/screens/Screen7Marketplace';
import Screen8DetailProduit from './components/screens/Screen8DetailProduit';
import Screen9Panier from './components/screens/Screen9Panier';
import Screen10Paiement from './components/screens/Screen10Paiement';
import AfriNovaFooter from './components/AfriNovaFooter';
import ChatModal from './components/ChatModal';
import ChatListModal from './components/ChatListModal';
import RealtimeChatNotificationToast from './components/RealtimeChatNotificationToast';
import { ChatThread, subscribeToUserChats, createOrGetChat } from './services/chatService';
import ProtectedRoute from './components/ProtectedRoute';
import LoginAuthModal from './components/LoginAuthModal';
import {
  checkSessionStatus,
  saveWorkspaceState,
  restoreWorkspaceState,
  getTargetDashboardForRole,
  markSessionActive,
  markSessionInactive,
} from './lib/sessionManager';
import { mapAccountTypeToRole, getDashboardForRole, isViewAllowedForRole } from './lib/rbac';
import { logAuditEvent } from './lib/auditLogger';
import { Sparkles, ShoppingBag, ShieldCheck, Truck, Store, ArrowRight, HelpCircle, Bell, X, Lock, Key, Sun, Moon, AlertCircle, Clock, Smartphone, Layers, Headphones, Coins, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Mot de passe de démonstration — à changer avant toute mise en production réelle.
const ADMIN_PASSWORD = "danielle1996";

// Utility function to remove accents and convert to lowercase for robust, accent-insensitive search
export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function App() {
  // Session Persistence
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Erreur de lecture de currentUser depuis localStorage:", e);
      return null;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error("Erreur de lecture de products depuis localStorage:", e);
      return INITIAL_PRODUCTS;
    }
  });

  const [merchants, setMerchants] = useState<Merchant[]>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_merchants');
      return saved ? JSON.parse(saved) : INITIAL_MERCHANTS;
    } catch (e) {
      console.error("Erreur de lecture de merchants depuis localStorage:", e);
      return INITIAL_MERCHANTS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erreur de lecture de cart depuis localStorage:", e);
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_ORDERS;
    } catch (e) {
      console.error("Erreur de lecture de orders depuis localStorage:", e);
      return INITIAL_ORDERS;
    }
  });

  // UI Navigation states
  const [activeView, setActiveView] = useState<'shop' | 'merchant' | 'orders' | 'news' | 'admin' | 'dashboard' | 'connexion' | 'inscription'>(() => {
    const status = checkSessionStatus();
    if (status.isValid && status.savedUser) {
      return getTargetDashboardForRole(status.savedUser.accountType);
    }
    return 'connexion';
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('bafoussam_admin_unlocked') === 'true';
  });
  const [adminPasscodeError, setAdminPasscodeError] = useState('');
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('bafoussam_theme') as 'light' | 'dark') || 'light';
  });

  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('bafoussam_lang') as Language) || 'fr';
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch (e) {
      console.error("Erreur de lecture de reviews depuis localStorage:", e);
      return INITIAL_REVIEWS;
    }
  });

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('bafoussam_lang', newLang);
  };

  const handleAddReview = (orderId: string, rating: number, comment: string, clientName: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Find merchantId of the products in the order
    const merchantId = order.items[0]?.product.merchantId || '';
    if (!merchantId) return;

    const newReview: Review = {
      id: `r-${Date.now()}`,
      merchantId,
      orderId,
      clientName: clientName.trim() || 'Client anonyme',
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    setReviews(prev => [newReview, ...prev]);

    // Mark the order as reviewed so the user cannot review it again
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isReviewed: true } : o));
  };

  useEffect(() => {
    localStorage.setItem('bafoussam_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('bafoussam_theme', next);
      return next;
    });
  };
  
  // Search, Filters & Sorting
  const [searchTerm, setSearchTerm] = useState(() => restoreWorkspaceState().searchTerm);
  const [selectedCategory, setSelectedCategory] = useState(() => restoreWorkspaceState().selectedCategory);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>(() => restoreWorkspaceState().sortBy);
  const [isRestrictedAuthOpen, setIsRestrictedAuthOpen] = useState(false);
  const [isAppBooting, setIsAppBooting] = useState(true);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExpiredSession, setIsExpiredSession] = useState(false);

  // Save workspace state automatically when user modifies view, filters, or cart
  useEffect(() => {
    saveWorkspaceState({
      lastView: activeView,
      searchTerm,
      selectedCategory,
      sortBy,
      cart,
    });
  }, [activeView, searchTerm, selectedCategory, sortBy, cart]);

  const handleLoginClick = () => {
    const status = checkSessionStatus();

    if (status.isValid && status.savedUser) {
      // 1. Session is STILL VALID! Auto-connect immediately!
      markSessionActive(status.savedUser);
      setCurrentUser(status.savedUser);

      // Restore saved workspace state
      const restored = restoreWorkspaceState();
      if (restored.searchTerm) setSearchTerm(restored.searchTerm);
      if (restored.selectedCategory) setSelectedCategory(restored.selectedCategory);
      if (restored.sortBy) setSortBy(restored.sortBy);
      if (restored.cart && restored.cart.length > 0) setCart(restored.cart);

      // Calculate target dashboard view for role
      const targetDashboard = getTargetDashboardForRole(status.savedUser.accountType);
      const viewToLoad = restored.lastView && restored.lastView !== 'shop' ? restored.lastView : targetDashboard;

      setActiveView(viewToLoad);

      const roleText = status.savedUser.accountType.toUpperCase();
      triggerToast(
        lang === 'fr'
          ? `Reconnexion automatique réussie ! Redirection vers votre tableau de bord (${roleText}).`
          : `Auto-reconnection successful! Redirecting to your ${roleText} dashboard.`,
        'success'
      );
    } else {
      // 2. Session expired or no saved user -> prompt for re-authentication
      setIsExpiredSession(status.isExpired);
      if (status.isExpired) {
        triggerToast(
          lang === 'fr'
            ? 'Votre session a expiré. Veuillez saisir votre mot de passe pour restaurer vos données.'
            : 'Session expired. Please sign in to restore your saved data.',
          'info'
        );
      }
      setIsAuthModalOpen(true);
    }
  };

  const handleLoginSuccess = (user: User) => {
    markSessionActive(user);
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    // Save to all registered users list
    try {
      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      let savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      if (!savedUsers.some((u) => u.id === user.id || u.phone === user.phone)) {
        savedUsers.push(user);
        localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(savedUsers));
      }
    } catch (e) {
      console.error('Error saving registered user:', e);
    }

    // Restore workspace state
    const restored = restoreWorkspaceState();
    if (restored.searchTerm) setSearchTerm(restored.searchTerm);
    if (restored.selectedCategory) setSelectedCategory(restored.selectedCategory);
    if (restored.sortBy) setSortBy(restored.sortBy);
    if (restored.cart && restored.cart.length > 0) setCart(restored.cart);

    // Target dashboard for role
    const userRole = mapAccountTypeToRole(user.accountType);
    const targetDashboard = getTargetDashboardForRole(user.accountType);
    const viewToLoad = restored.lastView && restored.lastView !== 'shop' ? restored.lastView : targetDashboard;

    setActiveView(viewToLoad);

    logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: userRole,
      action: 'LOGIN_AUTO_REDIRECT_DASHBOARD',
      resource: `dashboard_${userRole.toLowerCase()}`,
      status: 'LOGIN',
    });

    triggerToast(
      lang === 'fr'
        ? `Connexion réussie ! Redirection vers votre tableau de bord ${user.accountType.toUpperCase()}`
        : `Signed in successfully! Redirecting to your ${user.accountType.toUpperCase()} dashboard`,
      'success'
    );
  };

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3200);
  };

  // Welcome Notification state
  const [welcomeNotification, setWelcomeNotification] = useState<{ name: string; phone: string } | null>(null);

  // Realtime Chat State
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [activeChatModal, setActiveChatModal] = useState<{
    chatId: string;
    recipientName: string;
    productName?: string;
  } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to real-time chats unread count
  useEffect(() => {
    if (!currentUser?.id) return;
    const role = currentUser.accountType === 'vendeur' ? 'vendeur' : 'client';
    const unsubscribe = subscribeToUserChats(currentUser.id, role, (threads) => {
      const totalUnread = threads.reduce((acc, t) => {
        return acc + (role === 'vendeur' ? t.unreadCountMerchant : t.unreadCountClient);
      }, 0);
      setUnreadCount(totalUnread);
    });
    return () => unsubscribe();
  }, [currentUser?.id, currentUser?.accountType]);

  const handleStartChatWithMerchant = async (
    merchantId: string, 
    merchantName: string, 
    productId?: string, 
    productName?: string
  ) => {
    if (!currentUser) {
      triggerToast("Veuillez vous connecter pour envoyer un message.", "error");
      return;
    }

    try {
      const chatId = await createOrGetChat({
        clientId: currentUser.id,
        clientName: currentUser.name,
        merchantId,
        merchantName,
        productId,
        productName
      });

      setActiveChatModal({
        chatId,
        recipientName: merchantName,
        productName
      });
      setIsChatListOpen(false);
    } catch (err) {
      console.error("Failed to start chat:", err);
      triggerToast("Erreur lors de l'ouverture du chat.", "error");
    }
  };

  // Session Expiration states (10 min autologout if no purchase)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('bafoussam_session_start_time');
    return saved ? parseInt(saved, 10) : null;
  });
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showSessionExpiredToast, setShowSessionExpiredToast] = useState(false);

  // Auto-hide welcome notification after 10 seconds
  useEffect(() => {
    if (welcomeNotification) {
      const timer = setTimeout(() => {
        setWelcomeNotification(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [welcomeNotification]);

  // Global Self-Healing Mechanism to correct display and platform anomalies instantly
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent | PromiseRejectionEvent) => {
      console.warn("Anomalie d'affichage ou plateforme détectée, tentative d'auto-correction...");
      
      try {
        const errorSessionKey = 'bafoussam_consecutive_errors';
        const consecutiveErrors = parseInt(sessionStorage.getItem(errorSessionKey) || '0', 10);
        
        if (consecutiveErrors < 3) {
          sessionStorage.setItem(errorSessionKey, (consecutiveErrors + 1).toString());
          
          // Clear potentially corrupted transient data like search or cart state
          setSearchTerm('');
          setSelectedCategory('Tous');
          
          // Clean cart if it has malformed state
          const savedCart = localStorage.getItem('bafoussam_cart');
          if (savedCart) {
            try {
              const parsed = JSON.parse(savedCart);
              if (!Array.isArray(parsed)) {
                localStorage.removeItem('bafoussam_cart');
              }
            } catch {
              localStorage.removeItem('bafoussam_cart');
            }
          }
          
          // Instantly refresh the page to correct the rendering anomaly and display a pristine UI
          window.location.reload();
        } else {
          // Deep system reset to ensure complete recovery after multiple crashes
          console.error("Multiples anomalies détectées. Réinitialisation complète de la plateforme.");
          sessionStorage.setItem(errorSessionKey, '0');
          
          // Clear all localStorage keys starting with bafoussam_ to restore clean state
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('bafoussam_')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
          
          // Reset React states
          setCurrentUser(null);
          setProducts(INITIAL_PRODUCTS);
          setMerchants(INITIAL_MERCHANTS);
          setCart([]);
          setOrders([]);
          setIsAdminUnlocked(false);
          setActiveView('shop');
          
          // Force a final reload
          window.location.reload();
        }
      } catch (err) {
        window.location.reload();
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);
    
    // Clear consecutive errors counter if the app runs successfully for 5 seconds
    const clearTimer = setTimeout(() => {
      sessionStorage.setItem('bafoussam_consecutive_errors', '0');
    }, 5000);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
      clearTimeout(clearTimer);
    };
  }, []);

  // Sync to Local Storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bafoussam_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bafoussam_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('bafoussam_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bafoussam_merchants', JSON.stringify(merchants));
  }, [merchants]);

  useEffect(() => {
    localStorage.setItem('bafoussam_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('bafoussam_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bafoussam_admin_unlocked', isAdminUnlocked ? 'true' : 'false');
  }, [isAdminUnlocked]);

  useEffect(() => {
    localStorage.setItem('bafoussam_active_view', activeView);
  }, [activeView]);

  // Auth Action handlers
  const handleUserSubscriptionSuccess = (user: User) => {
    markSessionActive(user);
    setCurrentUser(user);

    // Auto-identify unique role and load corresponding dashboard
    const userRole = mapAccountTypeToRole(user.accountType);
    const targetDashboard = getTargetDashboardForRole(user.accountType);
    setActiveView(targetDashboard);

    logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: userRole,
      action: 'LOGIN_AUTO_LOAD_ROLE_DASHBOARD',
      resource: `dashboard_${userRole.toLowerCase()}`,
      status: 'LOGIN',
    });

    // Set session start time if not already present
    const now = Date.now();
    localStorage.setItem('bafoussam_session_start_time', now.toString());
    setSessionStartTime(now);
    setShowSessionExpiredToast(false); // Clear any old expired toasts
    
    setWelcomeNotification({ name: user.name, phone: user.phone });
  };

  const handleLogout = () => {
    signOut(auth).catch((err) => console.error("Firebase signOut error:", err));
    markSessionInactive(true);
    setCurrentUser(null);
    setWelcomeNotification(null);
    setCart([]);
    setOrders([]);
    setIsAdminUnlocked(false);
    setActiveView('connexion');
    localStorage.removeItem('bafoussam_session_start_time');
    localStorage.removeItem('bafoussam_user');
    localStorage.removeItem('bafoussam_active_view');
    setSessionStartTime(null);
  };

  // Sync session start time with local storage
  useEffect(() => {
    if (currentUser) {
      if (!sessionStartTime) {
        const now = Date.now();
        localStorage.setItem('bafoussam_session_start_time', now.toString());
        setSessionStartTime(now);
      }
    } else {
      localStorage.removeItem('bafoussam_session_start_time');
      setSessionStartTime(null);
    }
  }, [currentUser]);

  // Session auto-logout 10 minutes checker (if no purchase made)
  useEffect(() => {
    if (!currentUser || !sessionStartTime) {
      setTimeRemaining(null);
      return;
    }

    // Exclude 'merchant' (la boutique) and 'admin' (l'administrateur) views from the countdown & auto-logout
    if (activeView === 'merchant' || activeView === 'admin') {
      setTimeRemaining(null);
      return;
    }

    // Check if they have ever placed an order
    const hasPurchased = orders.some(o => o.userId === currentUser.id);
    if (hasPurchased) {
      setTimeRemaining(null);
      return;
    }

    const checkTimer = () => {
      const elapsed = Date.now() - sessionStartTime;
      const remaining = Math.max(0, (10 * 60 * 1000) - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        handleLogout();
        setShowSessionExpiredToast(true);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);

    return () => clearInterval(interval);
  }, [currentUser, sessionStartTime, orders, activeView]);

  // Cart Action handlers
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    
    // Decrement local product stock temporarily
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p))
    );

    // Increment merchant clicks in real-time
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === product.merchantId ? { ...m, clicks: m.clicks + 1 } : m
      )
    );

    triggerToast(
      lang === 'fr' ? `"${product.name}" ajouté au panier !` : `"${product.name}" added to cart!`,
      'success'
    );
  };

  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      // Increment views count of its merchant in real-time
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === product.merchantId ? { ...m, views: m.views + 1 } : m
        )
      );
    }
  };

  const handleUpdateQuantityInCart = (productId: string, quantity: number) => {
    const originalItem = cart.find(i => i.product.id === productId);
    if (!originalItem) return;

    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const difference = quantity - originalItem.quantity;

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );

    // Sync product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock - difference) } : p
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    const originalItem = cart.find(i => i.product.id === productId);
    if (originalItem) {
      // Refund stock
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, stock: p.stock + originalItem.quantity } : p
        )
      );
    }
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Checkout Success handler
  const handleCheckoutSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]); // Clear cart items

    // Increment merchant sales volume dynamically in real-time
    setMerchants((prevMerchants) => {
      let updated = [...prevMerchants];
      newOrder.items.forEach((item) => {
        const itemMerchantId = item.product.merchantId;
        updated = updated.map((m) =>
          m.id === itemMerchantId
            ? { ...m, sales: m.sales + item.product.price * item.quantity }
            : m
        );
      });
      return updated;
    });

    setActiveView('orders'); // direct to tracking screen
  };

  // Order state transition triggers (from tracker to completed)
  const handleUpdateOrderStatus = (orderId: string, status: 'pending' | 'preparing' | 'picked_up' | 'delivering' | 'completed') => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          let commissionFields = {};
          if (status === 'completed' && o.status !== 'completed') {
            const currentRate = parseFloat(localStorage.getItem('bafoussam_commission_rate') || '10') / 100;
            // Delivery fee is fixed 500 FCFA. Let's make sure we exclude it!
            const subtotal = Math.max(0, o.total - 500);
            const commissionAmount = Math.round(subtotal * currentRate);
            const netToMerchant = subtotal - commissionAmount;
            commissionFields = {
              commissionRate: currentRate,
              commissionAmount,
              netToMerchant
            };
          }
          return { ...o, status, ...commissionFields };
        }
        return o;
      })
    );
  };

  // Merchant actions
  const handleAddProductAsMerchant = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProductAsMerchant = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpgradeMerchantToPremium = (merchantId: string) => {
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === merchantId
          ? {
              ...m,
              isPremium: true,
              premiumStartDate: new Date().toISOString().split('T')[0],
              premiumExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            }
          : m
      )
    );

    // Boost all products belonging to this upgraded merchant instantly!
    setProducts((prev) =>
      prev.map((p) => (p.merchantId === merchantId ? { ...p, isBoosted: true } : p))
    );
  };

  const handleBoostProduct = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            isBoosted: true,
            boostExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            boostCount: (p.boostCount || 0) + 1,
          };
        }
        return p;
      })
    );
  };

  const isMerchantSubscriptionExpired = (merchantId: string) => {
    const m = merchants.find((item) => item.id === merchantId);
    if (!m) return false;
    if (m.isPremium && m.premiumExpiryDate && new Date(m.premiumExpiryDate) < new Date()) {
      return true;
    }
    return false;
  };

  const handleRenewUserSubscription = () => {
    if (!currentUser) return;
    
    // Extend subscription expiry date to 3 months from now (90 days)
    const nextDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const updatedUser = {
      ...currentUser,
      subscriptionExpiryDate: nextDate,
    };
    
    setCurrentUser(updatedUser);
    
    // Also save in the registered users list in localStorage to persist across sessions
    try {
      const savedUsersStr = localStorage.getItem('bafoussam_all_registered_users');
      if (savedUsersStr) {
        const savedUsers = JSON.parse(savedUsersStr);
        if (Array.isArray(savedUsers)) {
          const updatedUsers = savedUsers.map((u: any) => 
            u.phone === currentUser.phone ? { ...u, subscriptionExpiryDate: nextDate } : u
          );
          localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(updatedUsers));
        }
      }
    } catch (e) {
      console.error("Erreur de sauvegarde de l'abonnement renouvelé:", e);
    }
  };

  const handleSimulateUserExpiration = () => {
    if (!currentUser) return;
    const expiredDate = '2026-01-01T00:00:00.000Z'; // definitely in the past
    const expiredUser = {
      ...currentUser,
      subscriptionExpiryDate: expiredDate,
    };
    setCurrentUser(expiredUser);
    
    try {
      const savedUsersStr = localStorage.getItem('bafoussam_all_registered_users');
      if (savedUsersStr) {
        const savedUsers = JSON.parse(savedUsersStr);
        if (Array.isArray(savedUsers)) {
          const updatedUsers = savedUsers.map((u: any) => 
            u.phone === currentUser.phone ? { ...u, subscriptionExpiryDate: expiredDate } : u
          );
          localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(updatedUsers));
        }
      }
    } catch (e) {
      console.error("Erreur de sauvegarde de l'expiration simulée:", e);
    }
  };

  const handleSimulateMerchantExpiration = (merchantId: string) => {
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === merchantId
          ? {
              ...m,
              premiumExpiryDate: '2026-01-01', // definitely in the past
            }
          : m
      )
    );
  };

  // Product List Ordering: SPONSORISED / BOOSTED PRODUCTS ALWAYS SHOWN FIRST!
  const sortedAndFilteredProducts = products
    .filter((p) => {
      // Filter out products from merchants with expired subscription!
      if (isMerchantSubscriptionExpired(p.merchantId)) {
        return false;
      }

      const normSearch = normalizeString(searchTerm);
      const matchSearch = normalizeString(p.name).includes(normSearch) ||
        normalizeString(p.description).includes(normSearch) ||
        normalizeString(p.category).includes(normSearch) ||
        normalizeString(p.merchantName).includes(normSearch);
      const matchCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);

      // Default: 'popular' - Boosted products first, then by rating
      if (a.isBoosted && !b.isBoosted) return -1;
      if (!a.isBoosted && b.isBoosted) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

  // Calculate Cart items count
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSplashComplete = () => {
    setIsAppBooting(false);
    const status = checkSessionStatus();

    if (status.isValid && status.savedUser) {
      markSessionActive(status.savedUser);
      setCurrentUser(status.savedUser);

      const targetDashboard = getTargetDashboardForRole(status.savedUser.accountType);
      const savedLastView = localStorage.getItem('bafoussam_active_view') || localStorage.getItem('bafoussam_last_view');
      const viewToLoad = (savedLastView && savedLastView !== 'shop' && savedLastView !== 'connexion' && savedLastView !== 'inscription')
        ? (savedLastView as any)
        : targetDashboard;

      setActiveView(viewToLoad);
    } else {
      setCurrentUser(null);
      markSessionInactive(true);
      setActiveView('connexion');
    }
  };

  // 1. Automatic 8K Splash Screen at App Launch
  if (isAppBooting) {
    return (
      <SplashScreen 
        onComplete={handleSplashComplete} 
        lang={lang} 
        autoComplete={true}
      />
    );
  }

  const isUserSubscriptionExpired = !!(currentUser && (currentUser.isSubscribed === false || (currentUser.subscriptionExpiryDate && new Date(currentUser.subscriptionExpiryDate) < new Date())));

  if (isUserSubscriptionExpired) {
    return (
      <SubscriptionExpiredScreen
        currentUser={currentUser}
        onRenewSuccess={handleRenewUserSubscription}
        onLogout={handleLogout}
        lang={lang}
      />
    );
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAF9] via-[#F3F0FF]/40 to-[#ECFDF5]/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-[#0F172A] dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-200 relative overflow-x-hidden" id="main-applet-wrapper">
        {/* Soft Ambient Emerald and Violet Glow Backdrops matching Registration theme */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-[#16A34A]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute top-32 right-10 w-[500px] h-[350px] bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-96 left-10 w-[400px] h-[300px] bg-[#16A34A]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subscription / Trial Expiry Top Banner */}
        <SubscriptionNotificationBanner
          currentUser={currentUser}
          onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
          lang={lang}
        />

        {/* 1. Header Navigation Block (Rendered for sub-views, as BafoussamMarketHomePage has its own reference header) */}
        {activeView !== 'shop' && activeView !== 'connexion' && activeView !== 'inscription' && (
          <StoreHeader
            currentUser={currentUser}
            activeView={activeView}
            onViewChange={(view) => {
              const exitingAdmin = activeView === 'admin' && view !== 'admin';
              setActiveView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              if (exitingAdmin) {
                setIsAdminUnlocked(false);
                localStorage.setItem('bafoussam_admin_unlocked', 'false');
                localStorage.setItem('bafoussam_active_view', view);
                window.location.reload();
              }
            }}
            cartItemsCount={cartItemsCount}
            onOpenCart={() => setIsCartOpen(true)}
            searchTerm={searchTerm}
            onSearchChange={(term) => {
              setSearchTerm(term);
              if (term.trim() !== '') {
                setSelectedCategory('Tous');
              }
            }}
            onSearchSubmit={() => {
              const checkTerm = searchTerm.trim().toLowerCase();
              if (checkTerm === 'chris237') {
                setSearchTerm('');
                setIsRestrictedAuthOpen(true);
              }
            }}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onLogout={handleLogout}
            onLoginClick={handleLoginClick}
            isAdminUnlocked={isAdminUnlocked}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onSimulateUserExpiration={handleSimulateUserExpiration}
            lang={lang}
            onLangChange={handleLangChange}
            onOpenSubscriptions={() => setIsSubscriptionModalOpen(true)}
            onOpenMessages={() => setIsChatListOpen(true)}
            unreadMessagesCount={unreadCount}
          />
        )}

        {/* Floating countdown pills removed per minimal premium UI directive */}

      {/* 2. Main Body Content Switcher */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          
          {/* Shop View Layout - Bafoussam Market Home Page */}
          {activeView === 'shop' && (
            <motion.div
              key="shop-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="shop-view-wrapper"
            >
              <BafoussamMarketHomePage
                products={sortedAndFilteredProducts}
                merchants={merchants}
                currentUser={currentUser}
                onUpdateCurrentUser={(updatedUser) => {
                  setCurrentUser(updatedUser);
                  try {
                    localStorage.setItem('bafoussam_user', JSON.stringify(updatedUser));
                  } catch (e) {
                    console.error("Error updating user in localStorage:", e);
                  }
                }}
                cartItemsCount={cartItemsCount}
                onOpenCart={() => setIsCartOpen(true)}
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
                onNavigateView={(view) => {
                  setActiveView(view);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAddModal={() => setIsAddProductOpen(true)}
                searchTerm={searchTerm}
                onSearchChange={(term) => {
                  setSearchTerm(term);
                  if (term.trim() !== '') setSelectedCategory('Tous');
                }}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                lang={lang}
                onLangChange={handleLangChange}
                onLogout={handleLogout}
                onLoginClick={handleLoginClick}
                orders={orders}
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            </motion.div>
          )}

          {/* Client Dashboard Refonte - Screen6 */}
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-2 sm:px-4 py-4"
            >
              <Screen6DashboardClient
                onNavigate={(page) => {
                  if (page === 'cart') setIsCartOpen(true);
                  else if (page === 'orders') setActiveView('orders');
                  else if (page === 'profile' || page === 'merchant') setActiveView('merchant');
                  else if (page === 'shop' || page === 'home') setActiveView('shop');
                  else if (page === 'news') setActiveView('news');
                  else if (page === 'marketplace') setActiveView('shop');
                }}
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
                currentUser={currentUser}
                lang={lang}
                cartItemsCount={cartItemsCount}
              />
            </motion.div>
          )}

          {/* OLD SHOP VIEW REMOVED */}
          {false && activeView === 'shop-old' && (
            <motion.div
              key="shop-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8"
              id="shop-view-wrapper"
            >
              {/* Premium Hero Banner & Interactive Neighborhood Badges */}
              {!searchTerm && (
                <div className="space-y-6">
                  <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-r from-[#4F46E5] via-[#3730A3] to-[#2563EB] text-white p-6 sm:p-10 shadow-2xl border border-indigo-400/30">
                    {/* Glowing Radial Halo Effect */}
                    <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-400/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
                    <div className="absolute left-1/2 -bottom-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="space-y-4 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            {lang === 'fr' ? 'Livraison Express Moto ⚡' : 'Express Moto Delivery ⚡'}
                          </span>
                          <span className="bg-white/15 backdrop-blur-md text-white text-[10px] font-extrabold px-3.5 py-1 rounded-full border border-white/20">
                            {lang === 'fr' ? '15-30 Min Garantis' : '15-30 Min Guaranteed'}
                          </span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white font-display">
                          {lang === 'fr' 
                            ? 'Vos marchés de Bafoussam livrés directement chez vous'
                            : 'Your Bafoussam markets delivered straight to your doorstep'}
                        </h1>

                        <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-xl font-medium">
                          {lang === 'fr'
                            ? 'Marché A, Marché B, Marché Congo, Tamdja & Carrefour Bamiléké. Produits frais, café Arabica, tissus Ndop et épices locales livrés en un clic.'
                            : 'Market A, Market B, Congo Market, Tamdja & Carrefour Bamiléké. Fresh products, Arabica coffee, Ndop fabrics and local spices delivered in one click.'}
                        </p>

                        {/* Neighborhood Badges */}
                        <div className="pt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 block mb-2">
                            Quartiers desservis à Bafoussam :
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            {['Marché A', 'Marché B', 'Marché Congo', 'Tamdja', 'Djeleng', 'Kamkop', 'Carrefour Bamiléké'].map((q) => (
                              <span 
                                key={q}
                                className="bg-slate-900/60 backdrop-blur-md text-indigo-100 font-extrabold text-[10px] px-3 py-1 rounded-xl border border-indigo-300/20 shadow-xs hover:bg-slate-900/80 transition cursor-pointer"
                              >
                                📍 {q}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Call To Action Button (Section 5 in Prompt) */}
                        <div className="pt-3">
                          <button
                            onClick={() => {
                              const catalogEl = document.getElementById('products-catalog-grid');
                              if (catalogEl) {
                                catalogEl.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="bg-white hover:bg-slate-100 text-[#4F46E5] font-black text-xs px-6 py-3.5 rounded-2xl shadow-xl shadow-slate-950/20 flex items-center gap-2.5 transition active:scale-95 cursor-pointer font-display"
                          >
                            <span>Commander maintenant</span>
                            <ArrowRight className="w-4 h-4 text-[#4F46E5]" />
                          </button>
                        </div>
                      </div>

                      {/* Illustration artwork & badge */}
                      <div className="shrink-0 flex items-center justify-center lg:justify-end">
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-4 flex flex-col items-center justify-center text-center space-y-2 shadow-2xl animate-ambient-halo">
                          <span className="text-5xl sm:text-6xl drop-shadow-md">🛍️</span>
                          <span className="font-black text-sm text-white font-display">Marketplace Bafoussam</span>
                          <span className="text-[10px] font-extrabold text-indigo-200 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-400/30">
                            100% Produits Locaux
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Glassmorphism Information Cards (Section 6 in Prompt) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Paiement Mobile */}
                    <div className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-[24px] p-5 shadow-lg shadow-indigo-500/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-start gap-3.5 group">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Coins className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider font-display">
                          Paiement Mobile
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                          MTN MoMo & Orange Money sécurisés en 1 clic.
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Sécurité */}
                    <div className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-[24px] p-5 shadow-lg shadow-indigo-500/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-start gap-3.5 group">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-[#10B981] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider font-display">
                          Sécurité Garantie
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                          100% Vendeurs Vérifiés & Protection Anti-Arnaque.
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Livraison Express */}
                    <div className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-[24px] p-5 shadow-lg shadow-indigo-500/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-start gap-3.5 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider font-display">
                          Livraison Express
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                          Moto-Taxi rapide 15 à 30 min dans tous les quartiers.
                        </p>
                      </div>
                    </div>

                    {/* Card 4: Support Client */}
                    <div className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-[24px] p-5 shadow-lg shadow-indigo-500/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-start gap-3.5 group">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Headphones className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider font-display">
                          Support 24/7
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                          Assistance locale immédiate par téléphone & WhatsApp.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Recommendation Engine Banner (When Searching) */}
              {searchTerm.trim() !== '' && (
                <SmartRecommendationBanner
                  searchTerm={searchTerm}
                  products={products}
                  merchants={merchants}
                  currentUser={currentUser}
                  onAddToCart={handleAddToCart}
                  onSelectProduct={handleSelectProduct}
                  lang={lang}
                />
              )}

              {/* Best Merchant Spotlight (When not searching or as feature) */}
              {!searchTerm && (
                <BestMerchantWidget
                  merchants={merchants}
                  products={products}
                  onSelectProduct={handleSelectProduct}
                  onAddToCart={handleAddToCart}
                  reviews={reviews}
                  lang={lang}
                />
              )}

              {/* Store Grid Section & Sorting Header */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">
                      {selectedCategory === 'Tous' ? (lang === 'fr' ? 'Catalogue de Bafoussam' : 'Bafoussam Catalog') : selectedCategory}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {sortedAndFilteredProducts.length} {lang === 'fr' ? 'articles disponibles en stock' : 'items available in stock'}
                    </p>
                  </div>

                  {/* Sorting & Filter controls */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
                      <button
                        onClick={() => setSortBy('popular')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                          sortBy === 'popular'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        🔥 {lang === 'fr' ? 'Populaires' : 'Popular'}
                      </button>
                      <button
                        onClick={() => setSortBy('rating')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                          sortBy === 'rating'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        ⭐ {lang === 'fr' ? 'Mieux notés' : 'Top Rated'}
                      </button>
                      <button
                        onClick={() => setSortBy('price_asc')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                          sortBy === 'price_asc'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        💰 {lang === 'fr' ? 'Prix croissant' : 'Price low-high'}
                      </button>
                      <button
                        onClick={() => setSortBy('price_desc')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                          sortBy === 'price_desc'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        📈 {lang === 'fr' ? 'Prix décroissant' : 'Price high-low'}
                      </button>
                    </div>

                    <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 py-2 px-3.5 rounded-xl shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{lang === 'fr' ? 'Paiements MoMo & Orange' : 'MoMo & Orange Payments'}</span>
                    </div>
                  </div>
                </div>

                {sortedAndFilteredProducts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm max-w-md mx-auto">
                    <span className="text-4xl">🔍</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-3">
                      {lang === 'fr' ? 'Aucun produit trouvé' : 'No products found'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {lang === 'fr' 
                        ? 'Essayez de rechercher d\'autres termes comme "café", "taro", "ndop", "épices" ou changez de catégorie.'
                        : 'Try searching for other terms like "coffee", "taro", "ndop", "spices" or change category.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="products-catalog-grid">
                    {sortedAndFilteredProducts.map((p, idx) => (
                      <ProductCard
                        key={p.id}
                        index={idx}
                        product={p}
                        isMerchantVerified={merchants.find(m => m.id === p.merchantId)?.isVerified ?? false}
                        onAddToCart={handleAddToCart}
                        onSelect={handleSelectProduct}
                        reviews={reviews}
                        lang={lang}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Merchant Workspace View Layout with Strict RBAC Guard */}
          {activeView === 'merchant' && (
            <ProtectedRoute
              currentUser={currentUser}
              allowedRoles={['BOUTIQUE', 'ADMIN']}
              resourceName="dashboard_boutique"
              onUnauthorizedRedirect={(fallback) => setActiveView('shop')}
            >
              <motion.div
                key="merchant-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MerchantDashboard
                  currentUser={currentUser}
                  products={products}
                  merchants={merchants}
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onAddProduct={handleAddProductAsMerchant}
                  onDeleteProduct={handleDeleteProductAsMerchant}
                  onUpgradeMerchant={handleUpgradeMerchantToPremium}
                  onRegisterMerchant={(newMerchant) => setMerchants((prev) => [...prev, newMerchant])}
                  onSimulateMerchantExpiration={handleSimulateMerchantExpiration}
                  onBoostProduct={handleBoostProduct}
                  onSwitchToClientSpace={() => setActiveView('shop')}
                  lang={lang}
                />
              </motion.div>
            </ProtectedRoute>
          )}

          {/* Active Delivery Tracking Map Layout */}
          {activeView === 'orders' && (
            <motion.div
              key="orders-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DeliveryTracker 
                orders={orders} 
                onUpdateOrderStatus={handleUpdateOrderStatus} 
                lang={lang}
                onAddReview={handleAddReview}
              />
            </motion.div>
          )}

          {/* Connexion & Inscription Real Auth Page View */}
          {(activeView === 'connexion' || activeView === 'inscription') && (
            <motion.div
              key="auth-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex justify-center py-4"
            >
              <WelcomeGate
                onSuccess={handleUserSubscriptionSuccess}
                lang={lang}
                onLangChange={handleLangChange}
                initialStep={activeView === 'inscription' ? 'register' : 'login'}
              />
            </motion.div>
          )}

          {/* City News Feed Layout */}
          {activeView === 'news' && (
            <motion.div
              key="news-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CityNews lang={lang} />
            </motion.div>
          )}

          {/* Admin Space View Layout */}
          {activeView === 'admin' && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isAdminUnlocked ? (
                <AdminPanel
                  onClose={() => {
                    setIsAdminUnlocked(false);
                    localStorage.setItem('bafoussam_admin_unlocked', 'false');
                    setActiveView('shop');
                    localStorage.setItem('bafoussam_active_view', 'shop');
                    window.location.reload();
                  }}
                  merchants={merchants}
                  products={products}
                  onUpdateMerchants={setMerchants}
                  onUpdateProducts={setProducts}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onUpdateCurrentUser={setCurrentUser}
                  orders={orders}
                  onUpdateOrders={setOrders}
                  lang={lang}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-8 text-center space-y-6 relative overflow-hidden" id="admin-lock-screen">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-400 via-indigo-500 to-indigo-600"></div>
                  
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Accès restreint</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                      Veuillez saisir votre mot de passe pour poursuivre.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <input
                        type="password"
                        placeholder="Mot de passe"
                        id="admin-passcode-input"
                        className="w-full text-center px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-mono tracking-widest font-bold text-slate-800 dark:text-white"
                        value={passcodeAttempt}
                        onChange={(e) => {
                          setPasscodeAttempt(e.target.value);
                          if (adminPasscodeError) setAdminPasscodeError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const code = passcodeAttempt.trim();
                            if (code === ADMIN_PASSWORD) {
                              setIsAdminUnlocked(true);
                              setAdminPasscodeError('');
                            } else {
                              setAdminPasscodeError("Mot de passe incorrect");
                            }
                          }
                        }}
                      />
                      
                      {adminPasscodeError && (
                        <p className="text-[11px] text-red-500 font-bold mt-2 flex items-center justify-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{adminPasscodeError}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const code = passcodeAttempt.trim();
                        if (code === ADMIN_PASSWORD) {
                          setIsAdminUnlocked(true);
                          setAdminPasscodeError('');
                        } else {
                          setAdminPasscodeError("Mot de passe incorrect");
                        }
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Valider</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('shop');
                        setPasscodeAttempt('');
                        setAdminPasscodeError('');
                      }}
                      className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Retourner au Marché principal
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. New AfriNova Premium Footer */}
      <AfriNovaFooter lang={lang} onNavigate={(page) => {
        if (page === 'cart') setIsCartOpen(true);
        else if (page === 'orders') setActiveView('orders');
        else if (page === 'merchant') setActiveView('merchant');
        else if (page === 'news') setActiveView('news');
        else if (page === 'dashboard') setActiveView('dashboard');
        else setActiveView('shop');
      }} />

      {/* 4. Modals and Overlays Box */}
      <AnimatePresence>
        {/* Product Details overlay */}
        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            isMerchantVerified={merchants.find(m => m.id === selectedProduct.merchantId)?.isVerified ?? false}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onBuyNow={(prod) => {
              handleAddToCart(prod);
              setIsCartOpen(true);
              setSelectedProduct(null);
            }}
            reviews={reviews}
            lang={lang}
            allProducts={products}
            merchants={merchants}
            onSelectProduct={handleSelectProduct}
            onAddReview={handleAddReview}
            onStartChat={handleStartChatWithMerchant}
          />
        )}

        {/* Shopping Cart Drawer overlay */}
        {isCartOpen && (
          <CartDrawer
            items={cart}
            onUpdateQuantity={handleUpdateQuantityInCart}
            onRemoveItem={handleRemoveFromCart}
            onClose={() => setIsCartOpen(false)}
            onCheckoutSuccess={handleCheckoutSuccess}
            currentUser={currentUser}
            lang={lang}
          />
        )}

        {/* Floating Action Toast Notification */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-[90] bg-slate-900 text-white border border-indigo-500/30 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3"
            id="action-toast-notification"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white transition cursor-pointer p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Welcome Notification Modal / Toast overlay */}
        {welcomeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 p-5 overflow-hidden"
            id="welcome-toast-notification"
          >
            {/* Top pulsing glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 animate-pulse"></div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/30">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Bienvenue ! 🎉</span>
                  <button 
                    onClick={() => setWelcomeNotification(null)}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                    title="Fermer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-extrabold text-white text-sm truncate mt-1">
                  Heureux de vous revoir, {welcomeNotification.name} !
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  Votre compte de membre actif lié au numéro <span className="font-mono text-amber-400 font-bold">{welcomeNotification.phone}</span> est connecté à Bafoussam Direct.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Accès illimité actif (3 mois)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Restricted Auth Modal triggered by search "chris237" */}
      <RestrictedAuthModal
        isOpen={isRestrictedAuthOpen}
        onClose={() => setIsRestrictedAuthOpen(false)}
        onSuccess={() => {
          setIsRestrictedAuthOpen(false);
          setIsAdminUnlocked(true);
          setActiveView('admin');
          localStorage.setItem('bafoussam_admin_unlocked', 'true');
        }}
        lang={lang}
      />

      {/* Premium Subscription Modal */}
      <AnimatePresence>
        {isSubscriptionModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 overflow-y-auto"
          >
            <div className="relative">
              <button
                onClick={() => setIsSubscriptionModalOpen(false)}
                className="fixed top-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white p-3 rounded-full hover:bg-slate-800 transition cursor-pointer shadow-2xl"
                title="Fermer"
              >
                <X className="w-6 h-6" />
              </button>

              <PremiumSubscriptionScreen
                currentUser={currentUser}
                onUpdateCurrentUser={(updated) => {
                  setCurrentUser(updated);
                  triggerToast('Abonnement activé avec succès !', 'success');
                }}
                onClose={() => setIsSubscriptionModalOpen(false)}
                lang={lang}
                initialSelectedPlan={currentUser?.accountType || 'vendeur'}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <AddProductModal
          merchant={merchants[0] || {
            id: 'm1',
            name: 'Bafoussam Commerce',
            category: 'Alimentation',
            location: 'Bafoussam Central',
            phone: '+237 600 000 000',
            rating: 4.9,
            salesCount: 150,
            isVerified: true,
            isPremium: true,
            createdAt: new Date().toISOString()
          }}
          onClose={() => setIsAddProductOpen(false)}
          onPublishProduct={(newProduct) => {
            setProducts((prev) => [newProduct, ...prev]);
            setIsAddProductOpen(false);
            triggerToast(lang === 'fr' ? 'Produit ajouté avec succès !' : 'Product published successfully!', 'success');
          }}
          lang={lang}
        />
      )}

      {/* Realtime Chat Toast Notifications */}
      {currentUser && (
        <RealtimeChatNotificationToast
          currentUserId={currentUser.id}
          currentUserRole={currentUser.accountType === 'vendeur' ? 'vendeur' : 'client'}
          onOpenChat={(chatId, recipientName, productName) => {
            setActiveChatModal({ chatId, recipientName, productName });
          }}
        />
      )}

      {/* Realtime Chat List Drawer/Modal */}
      {currentUser && isChatListOpen && (
        <ChatListModal
          isOpen={isChatListOpen}
          onClose={() => setIsChatListOpen(false)}
          currentUserId={currentUser.id}
          currentUserName={currentUser.name}
          currentUserRole={currentUser.accountType === 'vendeur' ? 'vendeur' : 'client'}
          onSelectChat={(thread) => {
            setIsChatListOpen(false);
            setActiveChatModal({
              chatId: thread.id,
              recipientName: currentUser.accountType === 'vendeur' ? thread.clientName : thread.merchantName,
              productName: thread.productName
            });
          }}
          onStartNewChatWithMerchant={(mId, mName) => handleStartChatWithMerchant(mId, mName)}
          availableMerchants={merchants.map(m => ({
            id: m.id,
            name: m.name,
            shopName: m.shopName || m.name,
            location: m.location
          }))}
        />
      )}

      {/* Realtime Active Chat Window */}
      {currentUser && activeChatModal && (
        <ChatModal
          isOpen={Boolean(activeChatModal)}
          onClose={() => setActiveChatModal(null)}
          chatId={activeChatModal.chatId}
          currentUserId={currentUser.id}
          currentUserName={currentUser.name}
          currentUserRole={currentUser.accountType === 'vendeur' ? 'vendeur' : 'client'}
          recipientName={activeChatModal.recipientName}
          productName={activeChatModal.productName}
        />
      )}

      {/* Custom session disconnection overlay notification */}
      <AnimatePresence>
        {showSessionExpiredToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[90%] bg-rose-600 text-white px-6 py-4 rounded-3xl shadow-2xl border border-rose-500/30 flex items-start gap-3.5"
            id="session-expired-overlay"
          >
            <div className="bg-white/10 p-2 rounded-2xl text-rose-100 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm">{lang === 'fr' ? 'Session Expirée ⏰' : 'Session Expired ⏰'}</h4>
                <button 
                  onClick={() => setShowSessionExpiredToast(false)}
                  className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-rose-100 leading-relaxed mt-1">
                {lang === 'fr'
                  ? "Votre session a été automatiquement déconnectée car aucun achat n'a été effectué dans le délai imparti de 10 minutes."
                  : "Your session has been automatically disconnected because no purchase was made within the allotted 10 minutes."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login & Session Restoration Modal */}
      <LoginAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
        lang={lang}
        isExpiredSession={isExpiredSession}
        savedUserPhone={checkSessionStatus().savedUser?.phone || ''}
      />

      </div>
    </div>
  );
}

