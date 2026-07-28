/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Product, Merchant, Order, CartItem, Review } from './types';
import { INITIAL_PRODUCTS, INITIAL_MERCHANTS, BAFOUSSAM_NEIGHBORHOODS, INITIAL_REVIEWS, INITIAL_ORDERS } from './data/mockData';
import { Language, translations } from './translations';
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
import SupportPhoneNumber from './components/SupportPhoneNumber';
import RestrictedAuthModal from './components/RestrictedAuthModal';
import SplashScreen from './components/SplashScreen';
import { Sparkles, ShoppingBag, ShieldCheck, Truck, Store, ArrowRight, HelpCircle, Bell, X, Lock, Key, Sun, Moon, AlertCircle, Clock } from 'lucide-react';
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
  const [activeView, setActiveView] = useState<'shop' | 'merchant' | 'orders' | 'news' | 'admin'>(() => {
    return (localStorage.getItem('bafoussam_active_view') as any) || 'shop';
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

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('bafoussam_theme', next);
      return next;
    });
  };
  
  // Search, Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular');
  const [isRestrictedAuthOpen, setIsRestrictedAuthOpen] = useState(false);
  const [isAppBooting, setIsAppBooting] = useState(true);

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
    setCurrentUser(user);
    setActiveView('shop');
    
    // Set session start time if not already present
    const now = Date.now();
    localStorage.setItem('bafoussam_session_start_time', now.toString());
    setSessionStartTime(now);
    setShowSessionExpiredToast(false); // Clear any old expired toasts
    
    setWelcomeNotification({ name: user.name, phone: user.phone });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setWelcomeNotification(null);
    setCart([]);
    setOrders([]);
    setIsAdminUnlocked(false);
    setActiveView('shop');
    localStorage.removeItem('bafoussam_session_start_time');
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

  // 1. Automatic 8K Splash Screen at App Launch
  if (isAppBooting) {
    return (
      <SplashScreen 
        onComplete={() => setIsAppBooting(false)} 
        lang={lang} 
        autoComplete={true}
      />
    );
  }

  // 2. If user hasn't completed paid subscription, lock site access behind WelcomeGate paywall
  if (!currentUser) {
    return (
      <div className="relative min-h-screen">
        <WelcomeGate 
          onSuccess={handleUserSubscriptionSuccess} 
          lang={lang}
          onLangChange={handleLangChange}
        />
        
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
      </div>
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200 relative overflow-x-hidden" id="main-applet-wrapper">
        {/* Continuous 8K Splash Screen Ambient Glow Backdrops */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#4F46E5]/10 dark:bg-[#4F46E5]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute top-32 right-10 w-[500px] h-[350px] bg-[#2563EB]/10 dark:bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-96 left-10 w-[400px] h-[300px] bg-[#10B981]/5 dark:bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* 1. Header Navigation Block */}
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
          isAdminUnlocked={isAdminUnlocked}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onSimulateUserExpiration={handleSimulateUserExpiration}
          lang={lang}
          onLangChange={handleLangChange}
        />

        {/* Discrete Session Expiry / Safe Badge (Top Floating Pill) */}
        <AnimatePresence>
          {currentUser && timeRemaining !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="fixed top-16 right-4 z-50 bg-slate-900/90 dark:bg-slate-950/95 text-white backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-amber-500/30 flex items-center gap-2 text-xs font-semibold"
              id="session-countdown-pill"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="text-amber-300 font-extrabold text-[11px]">Session:</span>
              <span className="font-mono bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded text-[11px] font-bold">
                {Math.floor(timeRemaining / 60000)}m {Math.floor((timeRemaining % 60000) / 1000)}s
              </span>
              <button
                onClick={() => {
                  const mockStart = Date.now() - (10 * 60 * 1000) + 15000;
                  localStorage.setItem('bafoussam_session_start_time', mockStart.toString());
                  setSessionStartTime(mockStart);
                }}
                className="ml-1 text-[9px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-2 py-0.5 rounded-full cursor-pointer transition"
                title="Simuler expiration (15s)"
              >
                15s
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Purchase Confirmation Safe Pill */}
        <AnimatePresence>
          {currentUser && orders.some(o => o.userId === currentUser.id) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="fixed top-16 right-4 z-50 bg-emerald-950/90 text-emerald-100 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold"
              id="session-safe-pill"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px]">
                ✓ <strong className="text-emerald-300">Session Illimitée Activée</strong>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

      {/* 2. Main Body Content Switcher */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          
          {/* Shop View Layout - Clean & Direct */}
          {activeView === 'shop' && (
            <motion.div
              key="shop-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8"
              id="shop-view-wrapper"
            >
              {/* Glovo / Uber Eats Style Hero Banner */}
              {!searchTerm && (
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20">
                  <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          {lang === 'fr' ? 'Express Moto-Taxi ⚡' : 'Express Moto Delivery ⚡'}
                        </span>
                        <span className="bg-white/10 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">
                          {lang === 'fr' ? '15-30 Min Garantis' : '15-30 Min Guaranteed'}
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight leading-tight text-white font-display">
                        {lang === 'fr' 
                          ? 'Vos marchés de Bafoussam livrés directement chez vous'
                          : 'Your Bafoussam markets delivered straight to your doorstep'}
                      </h1>
                      <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-xl">
                        {lang === 'fr'
                          ? 'Marché A, Marché B, Marché Congo, Tamdja & Carrefour Bamiléké. Produits frais, café, tissus Ndop et épices locales livrés en un clic.'
                          : 'Market A, Market B, Congo Market, Tamdja & Carrefour Bamiléké. Fresh products, coffee, Ndop fabrics and local spices delivered in one click.'}
                      </p>

                      {/* Market location tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-extrabold text-indigo-200">
                        <span className="bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-400/20">📍 Marché A</span>
                        <span className="bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-400/20">📍 Marché B</span>
                        <span className="bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-400/20">📍 Marché Congo</span>
                        <span className="bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-400/20">📍 Tamdja</span>
                        <span className="bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-400/20">📍 Carrefour Bamiléké</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                      <div className="bg-slate-900/80 backdrop-blur-md border border-indigo-400/30 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
                          ⚡
                        </div>
                        <div>
                          <span className="text-[10px] text-indigo-200 uppercase font-extrabold tracking-wider block">Paiement Mobile</span>
                          <span className="text-xs font-black text-white">MTN MoMo & Orange Money</span>
                        </div>
                      </div>
                      <div className="bg-slate-900/80 backdrop-blur-md border border-indigo-400/30 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold text-lg shrink-0">
                          🛡️
                        </div>
                        <div>
                          <span className="text-[10px] text-indigo-200 uppercase font-extrabold tracking-wider block">Sécurité</span>
                          <span className="text-xs font-black text-white">100% Vendeurs Vérifiés</span>
                        </div>
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

          {/* Merchant Workspace View Layout */}
          {activeView === 'merchant' && (
            <motion.div
              key="merchant-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MerchantDashboard
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

      {/* 3. Footer Block */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 py-10 transition-colors duration-200" id="bafoussam-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">🏔️</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight">Bafoussam En Ligne</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
            La plateforme d'échange et de vente connectée des résidents de Bafoussam. Accès sécurisé par inscription, abonnements commerçants, paiements MTN MoMo & Orange Money, et coursiers locaux rapides.
          </p>
          <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
            <span>Marché A</span>
            <span>•</span>
            <span>Carrefour Bamiléké</span>
            <span>•</span>
            <span>Marché Congo</span>
            <span>•</span>
            <span>Tamdja</span>
          </div>
          <div className="pt-1">
            <SupportPhoneNumber prefix="Besoin d'aide ? Support Client Bafoussam :" showIcon className="text-[10px]" />
          </div>
          <p className="text-[10px] text-slate-300 pt-3">
            &copy; 2026 Bafoussam En Ligne. Tous droits réservés. Service assuré par la communauté de l'Ouest.
          </p>
        </div>
      </footer>

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

      </div>
    </div>
  );
}

