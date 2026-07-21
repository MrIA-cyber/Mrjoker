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
import { Sparkles, ShoppingBag, ShieldCheck, Truck, Store, ArrowRight, HelpCircle, Bell, X, Lock, Key, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

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
      // Sort boosted products to the top
      if (a.isBoosted && !b.isBoosted) return -1;
      if (!a.isBoosted && b.isBoosted) return 1;
      return 0;
    });

  // Calculate Cart items count
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // If user hasn't completed paid subscription, lock site access behind WelcomeGate paywall
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between font-sans selection:bg-amber-100 selection:text-amber-900 transition-colors duration-200" id="main-applet-wrapper">
        
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
            const checkTerm = term.trim().toLowerCase();
            if (checkTerm === 'chris237' || checkTerm === 'chri237') {
              setIsAdminUnlocked(true);
              setActiveView('admin');
              setSearchTerm('');
              return;
            }
            setSearchTerm(term);
            if (term.trim() !== '') {
              setSelectedCategory('Tous');
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

        {/* Session Expiry Countdown Alert Banner */}
        <AnimatePresence>
          {currentUser && timeRemaining !== null && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 px-4 py-2.5 text-center text-xs text-amber-800 dark:text-amber-400 font-medium flex items-center justify-center gap-2 relative overflow-hidden"
              id="session-countdown-banner"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span className="flex items-center gap-1.5 flex-wrap justify-center">
                ⏰ <strong className="font-extrabold text-amber-900 dark:text-amber-300">Alerte Session Direct :</strong>
                Il vous reste <span className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded font-bold text-amber-950 dark:text-amber-200">{Math.floor(timeRemaining / 60000)}m {Math.floor((timeRemaining % 60000) / 1000)}s</span> pour effectuer un achat, sinon vous serez déconnecté de Bafoussam Direct.
              </span>
              
              <button
                onClick={() => {
                  const mockStart = Date.now() - (10 * 60 * 1000) + 15000;
                  localStorage.setItem('bafoussam_session_start_time', mockStart.toString());
                  setSessionStartTime(mockStart);
                }}
                className="ml-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[9px] uppercase px-2 py-0.5 rounded transition cursor-pointer shrink-0"
                title="Simuler l'expiration de session dans 15s"
              >
                Simuler Expiration (15s)
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Purchase Confirmation Safe Banner */}
        <AnimatePresence>
          {currentUser && orders.some(o => o.userId === currentUser.id) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500/10 dark:bg-emerald-500/5 border-b border-emerald-500/20 px-4 py-2 text-center text-xs text-emerald-800 dark:text-emerald-400 font-medium flex items-center justify-center gap-2 relative overflow-hidden"
              id="session-safe-banner"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 animate-pulse" />
              <span>
                ✓ <strong className="font-extrabold text-emerald-900 dark:text-emerald-300">Session Illimitée :</strong>
                Merci pour votre achat ! Votre session est désormais permanente et sécurisée sans limite de temps.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

      {/* 2. Main Body Content Switcher */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          
          {/* Shop View Layout */}
          {activeView === 'shop' && (
            <motion.div
              key="shop-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8"
              id="shop-view-wrapper"
            >
              {/* Premium Merchant Sponsored Banner Spotlight */}
              {selectedCategory === 'Tous' && !searchTerm && (
                <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg shadow-amber-500/10">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-10"></div>
                  
                  <div className="relative z-10 max-w-xl space-y-4">
                    <span className="bg-white/20 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full inline-block">
                      Spotlight Commerçants Premium Bafoussam
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                      Découvrez le café de l'Ouest & l'artisanat noble de Bafoussam
                    </h2>
                    <p className="text-amber-50 text-xs sm:text-sm leading-relaxed">
                      Commandez directement auprès des meilleurs artisans et producteurs locaux du Marché A et du Marché Congo. Livraison express garantie sous 15 à 30 minutes par nos coursiers moto.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold pt-2">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-4.5 h-4.5 text-amber-300" />
                        <span>Qualité Garantie</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Truck className="w-4.5 h-4.5 text-amber-300" />
                        <span>Livraison Rapide</span>
                      </div>
                    </div>
                  </div>

                  {/* Absolute visual float */}
                  <div className="absolute right-6 bottom-0 top-0 hidden lg:flex items-center justify-center text-8xl pointer-events-none opacity-20">
                    🏔️
                  </div>
                </div>
              )}

              {/* Best Merchant Instant Status Section */}
              {selectedCategory === 'Tous' && !searchTerm && (
                <BestMerchantWidget 
                  merchants={merchants}
                  products={products}
                  onSelectProduct={handleSelectProduct}
                  onAddToCart={handleAddToCart}
                  reviews={reviews}
                  lang={lang}
                />
              )}

              {/* Smart Search Recommendation Engine */}
              <SmartRecommendationBanner
                searchTerm={searchTerm}
                products={products}
                merchants={merchants}
                currentUser={currentUser}
                onAddToCart={handleAddToCart}
                onSelectProduct={handleSelectProduct}
                lang={lang}
              />

              {/* Recommended / Boosted Products Section */}
              {selectedCategory === 'Tous' && !searchTerm && (
                (() => {
                  const activeBoosted = products.filter(p => 
                    p.isBoosted && 
                    (!p.boostExpiryDate || new Date(p.boostExpiryDate) >= new Date()) &&
                    !isMerchantSubscriptionExpired(p.merchantId)
                  );
                  if (activeBoosted.length === 0) return null;

                  return (
                    <div className="space-y-5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 p-6 rounded-3xl border border-amber-500/10 dark:border-amber-500/20 shadow-xs" id="recommended-products-section">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-amber-500 text-white p-1.5 rounded-xl">
                            <Sparkles className="w-4 h-4 fill-white" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-1.5">
                              {translations[lang].recommendedProducts}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Sélection exclusive mise en avant par nos commerçants de confiance
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {activeBoosted.map((p) => (
                          <ProductCard
                            key={`boosted-${p.id}`}
                            product={p}
                            isMerchantVerified={merchants.find(m => m.id === p.merchantId)?.isVerified ?? false}
                            onAddToCart={handleAddToCart}
                            onSelect={handleSelectProduct}
                            reviews={reviews}
                            lang={lang}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Store Grid Section */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                      {selectedCategory === 'Tous' ? 'Tous les produits' : selectedCategory}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {sortedAndFilteredProducts.length} articles disponibles à Bafoussam
                    </p>
                  </div>

                  {/* Trust indicator */}
                  <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-100 py-1.5 px-3 rounded-xl shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Transactions MoMo & Orange 100% sécurisées</span>
                  </div>
                </div>

                {sortedAndFilteredProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
                    <span className="text-4xl">🔍</span>
                    <p className="font-bold text-slate-800 text-sm mt-3">Aucun produit trouvé</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Essayez de rechercher d'autres termes comme "café", "taro", "ndop", "épices" ou changez de catégorie.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="products-catalog-grid">
                    {sortedAndFilteredProducts.map((p) => (
                      <ProductCard
                        key={p.id}
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
                onAddProduct={handleAddProductAsMerchant}
                onDeleteProduct={handleDeleteProductAsMerchant}
                onUpgradeMerchant={handleUpgradeMerchantToPremium}
                onRegisterMerchant={(newMerchant) => setMerchants((prev) => [...prev, newMerchant])}
                onSimulateMerchantExpiration={handleSimulateMerchantExpiration}
                onBoostProduct={handleBoostProduct}
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
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-indigo-600"></div>
                  
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Espace Administrateur Sécurisé</span>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Accès Restreint de la Mifi</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                      Si vous n'avez pas saisi le code secret d'accès de Bafoussam Direct, vous n'êtes pas autorisé à accéder à cet espace de gestion et d'édition de code.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <input
                        type="password"
                        placeholder="Saisissez le code secret (ex: chris237)"
                        id="admin-passcode-input"
                        className="w-full text-center px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-mono tracking-widest font-bold text-slate-800 dark:text-white"
                        value={passcodeAttempt}
                        onChange={(e) => {
                          setPasscodeAttempt(e.target.value);
                          if (adminPasscodeError) setAdminPasscodeError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const code = passcodeAttempt.trim().toLowerCase();
                            if (code === 'chris237' || code === 'chri237') {
                              setIsAdminUnlocked(true);
                              setAdminPasscodeError('');
                            } else {
                              setAdminPasscodeError("Code secret invalide. Veuillez réessayer.");
                            }
                          }
                        }}
                      />
                      
                      {adminPasscodeError && (
                        <p className="text-[11px] text-red-500 font-bold mt-2 animate-pulse">
                          ⚠️ {adminPasscodeError}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const code = passcodeAttempt.trim().toLowerCase();
                        if (code === 'chris237' || code === 'chri237') {
                          setIsAdminUnlocked(true);
                          setAdminPasscodeError('');
                        } else {
                          setAdminPasscodeError("Code secret invalide. Veuillez réessayer.");
                        }
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Déverrouiller l'Espace</span>
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

                  <div className="pt-2 border-t border-slate-50 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Support de la Mifi : <span className="font-bold text-slate-600 dark:text-slate-300">640 40 64 12</span>
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
          <p className="text-[10px] text-slate-400 font-semibold pt-1">
            Besoin d'aide ? Support Client Bafoussam : <a href="tel:640406412" className="text-indigo-600 hover:underline">640 40 64 12</a>
          </p>
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
            reviews={reviews}
            lang={lang}
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

      </div>
    </div>
  );
}

