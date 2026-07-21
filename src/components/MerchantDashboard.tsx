import React, { useState } from 'react';
import { Merchant, Product, MarketingCampaign } from '../types';
import { INITIAL_MERCHANTS } from '../data/mockData';
import { 
  Store, Sparkles, Plus, Trash2, Edit3, BarChart3, Users, LineChart, 
  MapPin, Phone, ArrowUpRight, Check, ArrowRight, Loader2, Megaphone, 
  Settings, Percent, Star, Tag, Compass, X, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VerifiedBadge from './VerifiedBadge';

interface MerchantDashboardProps {
  products: Product[];
  merchants: Merchant[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpgradeMerchant: (merchantId: string) => void;
  onRegisterMerchant?: (merchant: Merchant) => void; // clean React state propagation
  onSimulateMerchantExpiration?: (merchantId: string) => void;
}

export default function MerchantDashboard({
  products,
  merchants,
  onAddProduct,
  onDeleteProduct,
  onUpgradeMerchant,
  onRegisterMerchant,
  onSimulateMerchantExpiration,
}: MerchantDashboardProps) {
  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(null);
  
  // Password security login state
  const [pendingLoginMerchant, setPendingLoginMerchant] = useState<Merchant | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Forms & Modals states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // New product inputs
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Alimentation & Épicerie');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdDesc, setNewProdDesc] = useState('');
  
  // Upgrade payment states
  const [upgradeOperator, setUpgradeOperator] = useState<'momo' | 'orange'>('momo');
  const [upgradePhone, setUpgradePhone] = useState('');
  const [upgradeStep, setUpgradeStep] = useState<'details' | 'processing' | 'ussd' | 'success'>('details');
  const [upgradePin, setUpgradePin] = useState('');
  const [upgradeError, setUpgradeError] = useState('');

  // Merchant renewal states
  const [merchantRenewalStep, setMerchantRenewalStep] = useState<'idle' | 'phone-input' | 'processing' | 'pin-prompt'>('idle');
  const [merchantRenewalOperator, setMerchantRenewalOperator] = useState<'momo' | 'orange'>('momo');
  const [merchantRenewalPhone, setMerchantRenewalPhone] = useState('');
  const [merchantRenewalPin, setMerchantRenewalPin] = useState('');

  // New Campaign state
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignType, setCampaignType] = useState<'promo' | 'boost'>('boost');
  const [campaignTarget, setCampaignTarget] = useState<string[]>(['Tamdja']);
  const [activeCampaigns, setActiveCampaigns] = useState<MarketingCampaign[]>([
    {
      id: 'c1',
      title: 'Opération Giga Boost - Café de l\'Ouest',
      type: 'boost',
      targetNeighborhoods: ['Tamdja', 'Bamendzi'],
      status: 'active',
      views: 345,
      conversions: 89,
      startDate: '2026-07-01',
      endDate: '2026-08-01'
    }
  ]);

  // Identity Verification and Document Upload state variables
  const [regLegalName, setRegLegalName] = useState('');
  const [regCniPhoto, setRegCniPhoto] = useState<string | null>(null);
  const [regShopPhoto, setRegShopPhoto] = useState<string | null>(null);
  const [regRegistryNumber, setRegRegistryNumber] = useState('');
  const [regCniFileName, setRegCniFileName] = useState('');
  const [regShopFileName, setRegShopFileName] = useState('');

  const activeMerchant = merchants.find(m => m.id === activeMerchantId);
  const isMerchantExpired = !!(activeMerchant && activeMerchant.isPremium && activeMerchant.premiumExpiryDate && new Date(activeMerchant.premiumExpiryDate) < new Date());
  const merchantProducts = products.filter(p => p.merchantId === activeMerchantId);

  // Quick stats
  const totalStock = merchantProducts.reduce((acc, p) => acc + p.stock, 0);
  const totalSalesVolume = activeMerchant ? activeMerchant.sales : 0;
  const totalViews = activeMerchant ? activeMerchant.views : 0;
  const conversionRate = totalViews > 0 ? ((merchantProducts.length * 15) / totalViews * 100).toFixed(1) : '0';

  const handleMerchantLoginClick = (m: Merchant) => {
    setPendingLoginMerchant(m);
    setLoginPassword('');
    setLoginError('');
  };

  const handleVerifyPasswordAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLoginMerchant) return;
    
    // Check if password matches (default to 'bafoussam' for initial merchants if not specified)
    const correctPassword = pendingLoginMerchant.password || 'bafoussam';
    if (loginPassword === correctPassword) {
      setActiveMerchantId(pendingLoginMerchant.id);
      setUpgradePhone(pendingLoginMerchant.phone.replace(/[^0-9]/g, '').slice(-9));
      setPendingLoginMerchant(null);
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('Mot de passe de sécurité incorrect. Accès bloqué pour suspicion d\'arnaque !');
    }
  };

  const handleCreateMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.currentTarget.elements.namedItem('mName') as HTMLInputElement).value;
    const shopName = (e.currentTarget.elements.namedItem('mShopName') as HTMLInputElement).value;
    const location = (e.currentTarget.elements.namedItem('mLocation') as HTMLSelectElement).value;
    const phone = (e.currentTarget.elements.namedItem('mPhone') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('mPassword') as HTMLInputElement).value;

    const newM: Merchant = {
      id: `m-${Date.now()}`,
      name,
      shopName,
      location,
      phone,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@bafoussam.com`,
      password,
      isPremium: false,
      logo: shopName.slice(0, 2).toUpperCase(),
      views: 0,
      clicks: 0,
      sales: 0,
      isVerified: false,
      verificationStatus: 'pending_verification',
      legalName: regLegalName,
      cniPhoto: regCniPhoto || undefined,
      shopPhoto: regShopPhoto || undefined,
      registryNumber: regRegistryNumber || undefined,
    };

    if (onRegisterMerchant) {
      onRegisterMerchant(newM);
    } else {
      merchants.push(newM); // Simulated addition fallback
    }

    // Reset verification states
    setRegLegalName('');
    setRegCniPhoto(null);
    setRegShopPhoto(null);
    setRegRegistryNumber('');
    setRegCniFileName('');
    setRegShopFileName('');

    setActiveMerchantId(newM.id);
    setUpgradePhone(phone.replace(/[^0-9]/g, '').slice(-9));
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdStock) return;

    const fallbackImages: { [key: string]: string } = {
      'Alimentation & Épicerie': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
      'Artisanat & Mode': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
      'Électronique & Tech': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
    };

    const newProd: Product = {
      id: `p-${Date.now()}`,
      name: newProdName,
      description: newProdDesc || 'Aucune description fournie par le commerçant.',
      price: Number(newProdPrice),
      image: newProdImage || fallbackImages[newProdCategory] || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500&auto=format&fit=crop&q=60',
      category: newProdCategory,
      merchantId: activeMerchant?.id || 'm1',
      merchantName: activeMerchant?.shopName || 'Boutique',
      isBoosted: activeMerchant?.isPremium || false, // automatically boosted if premium
      stock: Number(newProdStock),
      rating: 5.0,
      reviewsCount: 0,
      origin: `Bafoussam (${activeMerchant?.location || 'Centre-ville'})`
    };

    onAddProduct(newProd);
    setShowAddProductModal(false);
    
    // reset form fields
    setNewProdName('');
    setNewProdPrice('');
    setNewProdImage('');
    setNewProdStock('10');
    setNewProdDesc('');
  };

  const handleUpgradePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (upgradePhone.length < 9) {
      setUpgradeError('Numéro de téléphone invalide.');
      return;
    }
    setUpgradeError('');
    setUpgradeStep('processing');

    // Simulate payment process
    setTimeout(() => {
      setUpgradeStep('ussd');
    }, 1500);
  };

  const handleConfirmUpgradePIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (upgradePin.length !== 4) {
      setUpgradeError('Le code PIN doit comporter 4 chiffres.');
      return;
    }
    setUpgradeError('');
    setUpgradeStep('processing');

    setTimeout(() => {
      if (activeMerchantId) {
        onUpgradeMerchant(activeMerchantId);
      }
      setUpgradeStep('success');
    }, 2000);
  };

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle) return;

    const newCampaign: MarketingCampaign = {
      id: `c-${Date.now()}`,
      title: campaignTitle,
      type: campaignType,
      targetNeighborhoods: campaignTarget,
      status: 'active',
      views: 0,
      conversions: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    setActiveCampaigns([newCampaign, ...activeCampaigns]);
    setShowCampaignModal(false);
    setCampaignTitle('');
  };

  const handleToggleTargetNeighborhood = (name: string) => {
    if (campaignTarget.includes(name)) {
      setCampaignTarget(campaignTarget.filter(t => t !== name));
    } else {
      setCampaignTarget([...campaignTarget, name]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="merchant-portal-container">
      
      {/* 1. Portal Intro / Login if not connected */}
      <AnimatePresence mode="wait">
        {!activeMerchantId ? (
          <motion.div
            key="merchant-login-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Box: Informational and Marketing Pitch */}
            <div className="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-8 lg:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-30"></div>
              
              <div className="relative z-10 space-y-6">
                <span className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full inline-block">
                  Espace Commerçants Bafoussam
                </span>

                <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  Propulsez vos ventes en ligne dans toute la capitale de l'Ouest.
                </h2>
                
                <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                  Rejoignez des centaines de commerçants du Marché A, Marché Congo, et Carrefour Bamiléké. Proposez vos produits aux résidents de Bafoussam avec paiement mobile sécurisé et une livraison en moto-taxi ultra-rapide.
                </p>

                {/* Features Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-indigo-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">Visibilité Boostée Premium</h4>
                      <p className="text-xs text-slate-400 mt-1">Vos articles affichés en tête de liste avec le badge indigo de confiance.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-indigo-400">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">Marketing Avancé</h4>
                      <p className="text-xs text-slate-400 mt-1">Générez des rapports de vente, analysez l'intérêt de vos clients à Bafoussam.</p>
                    </div>
                  </div>
                </div>

                {/* Pricing banner */}
                <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Abonnement Premium Obligatoire</span>
                    <span className="text-2xl font-extrabold text-white mt-1 block">100 000 FCFA <span className="text-xs font-medium text-slate-400">/ an</span></span>
                    <p className="text-[10px] text-slate-400 mt-1">Pour accéder aux fonctionnalités marketing avancées et au boost de visibilité.</p>
                  </div>
                  <div className="bg-indigo-600 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md">
                    Rentable dès le 1er mois
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Login / Register forms */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Login with existing profiles */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
                {!pendingLoginMerchant ? (
                  <>
                    <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                      <Store className="w-4 h-4 text-indigo-600" />
                      <span>Se connecter à votre boutique</span>
                    </h3>

                    <div className="space-y-3">
                      {merchants.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleMerchantLoginClick(m)}
                          className="w-full text-left p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/20 flex items-center justify-between transition group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-sm text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-900">
                              {m.logo}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-slate-950 text-xs">{m.shopName}</p>
                                {m.isVerified && (
                                  <VerifiedBadge id={`verified-badge-dash-login-${m.id}`} />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">{m.location} • {m.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {m.isPremium ? (
                              <span className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Premium</span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full">Standard</span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleVerifyPasswordAndLogin} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-1">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-lg text-indigo-600 font-bold">
                        {pendingLoginMerchant.logo}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">{pendingLoginMerchant.shopName}</p>
                        <p className="text-xs text-slate-400">{pendingLoginMerchant.name} • {pendingLoginMerchant.location}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Mot de passe de sécurité</span>
                        <span className="text-indigo-500 font-bold lowercase">Requis contre l'arnaque</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Entrez le mot de passe de cette boutique"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 transition"
                        autoFocus
                      />
                    </div>

                    {loginError && (
                      <div className="text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 p-3 rounded-xl text-xs font-semibold leading-relaxed">
                        ⚠️ {loginError}
                      </div>
                    )}

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPendingLoginMerchant(null);
                          setLoginPassword('');
                          setLoginError('');
                        }}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 rounded-xl cursor-pointer transition text-center"
                      >
                        Retour
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition shadow-sm"
                      >
                        Valider & Ouvrir
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Create new store profile */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Enregistrer une nouvelle boutique</h3>
                <form onSubmit={handleCreateMerchant} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nom du Gérant</label>
                    <input
                      name="mName"
                      type="text"
                      required
                      placeholder="Ex: Paul Tagne"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nom du Commerce</label>
                      <input
                        name="mShopName"
                        type="text"
                        required
                        placeholder="Ex: Épicerie Tagne & Fils"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Emplacement Bafoussam</label>
                      <select
                        name="mLocation"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 transition"
                      >
                        <option value="Marché A">Marché A (Centre)</option>
                        <option value="Marché B">Marché B</option>
                        <option value="Marché Congo">Marché Congo</option>
                        <option value="Carrefour Bamiléké">Carrefour Bamiléké</option>
                        <option value="Tamdja">Tamdja</option>
                        <option value="Bamendzi">Bamendzi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Numéro de Téléphone Mobile Money</label>
                    <input
                      name="mPhone"
                      type="tel"
                      required
                      placeholder="Ex: 677000000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 transition"
                    />
                  </div>

                  {/* ID & Business Verification Fields */}
                  <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-100 space-y-3.5">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block border-b border-slate-200/60 pb-1.5">🛡️ Étape de Vérification Obligatoire</span>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Nom légal du commerçant</span>
                        <span className="text-indigo-600 font-bold text-[9px] uppercase">Strict (CNI)</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Paul Tagne (Doit correspondre à la CNI)"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 transition"
                        value={regLegalName}
                        onChange={(e) => setRegLegalName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Numéro de Registre de Commerce</span>
                        <span className="text-slate-400 font-normal text-[9px] uppercase">Optionnel</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: RC/BAF/2026/B/142 (Si formalisé)"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 transition"
                        value={regRegistryNumber}
                        onChange={(e) => setRegRegistryNumber(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span>Photo Recto CNI / Passeport</span>
                          <span className="text-red-500 font-bold text-[9px] uppercase">Requis</span>
                        </label>
                        <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-500/50 rounded-xl p-2 bg-white text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[85px]">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setRegCniFileName(file.name);
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setRegCniPhoto(event.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {regCniPhoto ? (
                            <div className="space-y-1">
                              <img src={regCniPhoto} alt="CNI Preview" className="w-12 h-8 object-cover rounded mx-auto border border-slate-200" referrerPolicy="no-referrer" />
                              <span className="text-[9px] text-slate-500 block truncate max-w-[100px] mx-auto">{regCniFileName}</span>
                            </div>
                          ) : (
                            <div className="space-y-0.5 text-slate-400">
                              <span className="text-lg block">🪪</span>
                              <span className="text-[9px] block font-bold uppercase tracking-wider">Charger CNI</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span>Photo Boutique Physique</span>
                          <span className="text-red-500 font-bold text-[9px] uppercase">Requis</span>
                        </label>
                        <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-500/50 rounded-xl p-2 bg-white text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[85px]">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setRegShopFileName(file.name);
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setRegShopPhoto(event.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {regShopPhoto ? (
                            <div className="space-y-1">
                              <img src={regShopPhoto} alt="Shop Preview" className="w-12 h-8 object-cover rounded mx-auto border border-slate-200" referrerPolicy="no-referrer" />
                              <span className="text-[9px] text-slate-500 block truncate max-w-[100px] mx-auto">{regShopFileName}</span>
                            </div>
                          ) : (
                            <div className="space-y-0.5 text-slate-400">
                              <span className="text-lg block">🏪</span>
                              <span className="text-[9px] block font-bold uppercase tracking-wider">Charger Photo</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Mot de passe de sécurité</span>
                      <span className="text-red-500 font-bold text-[9px] uppercase">Obligatoire</span>
                    </label>
                    <input
                      name="mPassword"
                      type="password"
                      required
                      placeholder="Définissez un mot de passe solide"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 transition"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      Ce mot de passe sera obligatoire à chaque connexion pour vérifier votre identité de gérant et contrer toute tentative d'usurpation ou d'arnaque.
                    </p>
                  </div>

                  {!(regLegalName && regCniPhoto && regShopPhoto) && (
                    <div className="text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-xl text-[10px] font-extrabold leading-normal" id="registration-warning-msg">
                      ⚠️ Merci de fournir les documents requis pour valider votre boutique.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!(regLegalName && regCniPhoto && regShopPhoto)}
                    className={`w-full text-xs font-black py-3 rounded-xl cursor-pointer transition shadow-sm mt-3 uppercase tracking-wider ${
                      (regLegalName && regCniPhoto && regShopPhoto)
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    Créer ma boutique et me connecter
                  </button>
                </form>
              </div>

            </div>
          </motion.div>
        ) : (
          
          /* 2. Merchant Dashboard Logged-In View */
          <motion.div
            key="merchant-dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Merchant Dashboard Header bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 text-indigo-400 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-md">
                  {activeMerchant?.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{activeMerchant?.shopName}</h2>
                    {activeMerchant?.isVerified && (
                      <VerifiedBadge id="verified-badge-dash-header" size="md" />
                    )}
                    {activeMerchant?.isPremium ? (
                      <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 text-white fill-white animate-spin-slow" />
                        <span>MEMBRE PREMIUM</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Compte Standard
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-300" />
                    <span>{activeMerchant?.location}</span>
                    <span className="text-slate-300">•</span>
                    <Phone className="w-3.5 h-3.5 text-slate-300" />
                    <span>{activeMerchant?.phone}</span>
                  </p>
                </div>
              </div>

              {/* Upgrade or Status Controls */}
              <div className="flex items-center gap-3">
                {activeMerchant?.isPremium && !isMerchantExpired && onSimulateMerchantExpiration && (
                  <button
                    onClick={() => onSimulateMerchantExpiration(activeMerchant.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs py-2.5 px-4 rounded-xl font-bold transition cursor-pointer"
                    id="btn-simulate-merchant-expiry"
                  >
                    🧪 Expire mon Premium
                  </button>
                )}

                {!activeMerchant?.isPremium && (
                  <button
                    onClick={() => {
                      setUpgradeStep('details');
                      setShowUpgradeModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 transition"
                    id="btn-trigger-premium-upgrade"
                  >
                    <Sparkles className="w-4 h-4 fill-white stroke-none" />
                    <span>Passer au Premium (100k F/an)</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveMerchantId(null)}
                  className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 py-2.5 px-4 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Déconnexion Boutique
                </button>
              </div>
            </div>

            {/* Status alerts for Identity Verification */}
            {activeMerchant?.verificationStatus === 'pending_verification' && (
              <div className="bg-amber-500/10 border border-amber-500/25 p-5 rounded-3xl flex items-start gap-3.5" id="dash-verification-pending-banner">
                <div className="bg-amber-100 dark:bg-amber-950/20 p-2.5 rounded-2xl text-amber-700 dark:text-amber-400 shrink-0">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">Boutique en attente de vérification administrative</h4>
                  <p className="text-xs text-amber-700/80 dark:text-amber-300/90 leading-relaxed mt-1">
                    Les documents d'identité (CNI de <strong className="font-bold">{activeMerchant.legalName}</strong>) et de votre établissement physique ont été soumis avec succès. Notre équipe examine votre dossier pour valider l'activité. Votre boutique et ses produits seront visibles publiquement dès approbation.
                  </p>
                </div>
              </div>
            )}

            {activeMerchant?.verificationStatus === 'rejected' && (
              <div className="bg-red-500/10 border border-red-500/25 p-5 rounded-3xl flex items-start gap-3.5" id="dash-verification-rejected-banner">
                <div className="bg-red-100 dark:bg-red-950/20 p-2.5 rounded-2xl text-red-700 dark:text-red-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-red-900 dark:text-red-200">Dossier de vérification rejeté</h4>
                  <p className="text-xs text-red-700/80 dark:text-red-300/90 leading-relaxed mt-1">
                    Malheureusement, votre demande de vérification a été refusée par notre équipe de modération.
                  </p>
                  {activeMerchant.rejectionReason && (
                    <div className="mt-2 bg-white/65 dark:bg-slate-900/40 p-3 rounded-xl border border-red-200/50 dark:border-red-900/60 text-xs text-red-950 dark:text-red-100 font-semibold">
                      Motif du refus : "{activeMerchant.rejectionReason}"
                    </div>
                  )}
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-2">
                    Veuillez contacter l'administrateur de Bafoussam Direct ou réenregistrer votre boutique en fournissant des documents conformes.
                  </p>
                </div>
              </div>
            )}

            {isMerchantExpired ? (
              <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-md max-w-2xl mx-auto text-center space-y-6 my-8" id="merchant-expiry-blocker">
                <div className="w-16 h-16 bg-red-50 border border-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm animate-pulse">
                  <ShieldAlert className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">Abonnement Expiré</span>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Accès Boutique Bloqué ⚠️</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                    L'abonnement annuel Premium de votre boutique <strong className="text-slate-800">{activeMerchant?.shopName}</strong> a expiré. Vous n'avez plus accès au catalogue ni aux fonctionnalités de vente.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 text-xs text-slate-500 text-left space-y-2.5 border border-slate-100">
                  <p className="font-bold text-slate-800">En raison de l'expiration de votre abonnement :</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Vos articles en vente ne sont plus visibles par les acheteurs sur le marché public.</li>
                    <li>L'ajout, la modification ou la suppression de vos produits est temporairement verrouillé.</li>
                    <li>Vos campagnes publicitaires de Bafoussam sont suspendues.</li>
                  </ul>
                </div>

                {/* Simulated Renewal Flow within the block */}
                {merchantRenewalStep === 'idle' && (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 rounded-2xl p-4 flex justify-between items-center text-left border border-indigo-100/50">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest block">Tarif de Renouvellement</span>
                        <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">100 000 FCFA <span className="text-xs font-normal text-slate-500">/ an</span></span>
                        <span className="text-[10px] text-orange-600 font-bold block">Intégralité versée directement sur Orange Money : 640406412</span>
                      </div>
                      <span className="bg-indigo-600 text-white font-bold text-[10px] py-1 px-2.5 rounded-full">Renouvellement MoMo/Orange</span>
                    </div>

                    <button
                      onClick={() => setMerchantRenewalStep('phone-input')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Renouveler l'abonnement par Mobile Money</span>
                    </button>
                  </div>
                )}

                {merchantRenewalStep === 'phone-input' && (
                  <div className="space-y-4 text-left max-w-md mx-auto">
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setMerchantRenewalOperator('momo')}
                        className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                          merchantRenewalOperator === 'momo'
                            ? 'bg-amber-500/10 border-amber-400 text-amber-700 font-extrabold'
                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-6 h-6 bg-amber-400 text-slate-950 font-black rounded flex items-center justify-center text-[10px]">momo</span>
                        <span>MTN MoMo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMerchantRenewalOperator('orange')}
                        className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                          merchantRenewalOperator === 'orange'
                            ? 'bg-orange-500/10 border-orange-400 text-orange-700 font-extrabold'
                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-6 h-6 bg-orange-500 text-white font-black rounded flex items-center justify-center text-[10px]">OM</span>
                        <span>Orange</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Numéro de Téléphone de Paiement</label>
                      <input
                        type="tel"
                        value={merchantRenewalPhone || activeMerchant?.phone || ''}
                        onChange={(e) => setMerchantRenewalPhone(e.target.value)}
                        placeholder="Ex: 677894512"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 transition"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setMerchantRenewalStep('idle')}
                        className="flex-1 border border-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 text-center"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => {
                          setMerchantRenewalStep('processing');
                          setTimeout(() => {
                            setMerchantRenewalStep('pin-prompt');
                          }, 1500);
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer text-center shadow-sm"
                      >
                        Lancer le Paiement
                      </button>
                    </div>
                  </div>
                )}

                {merchantRenewalStep === 'processing' && (
                  <div className="py-8 space-y-4 text-center">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-xs text-slate-600 font-semibold">Connexion sécurisée à l'opérateur de Bafoussam...</p>
                  </div>
                )}

                {merchantRenewalStep === 'pin-prompt' && (
                  <div className="space-y-4 text-left max-w-sm mx-auto">
                    <div className="text-center space-y-1">
                      <h4 className="text-xs font-bold text-slate-700 uppercase">Saisissez votre code PIN</h4>
                      <p className="text-[10px] text-slate-400">Transfert de 100 000 FCFA directement vers le numéro Orange Money 640406412</p>
                    </div>

                    <input
                      type="password"
                      maxLength={4}
                      value={merchantRenewalPin}
                      onChange={(e) => setMerchantRenewalPin(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="••••"
                      className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xl tracking-widest font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                      autoFocus
                    />

                    <button
                      onClick={() => {
                        setMerchantRenewalStep('processing');
                        setTimeout(() => {
                          if (activeMerchant) {
                            onUpgradeMerchant(activeMerchant.id);
                          }
                          setMerchantRenewalStep('idle');
                          setMerchantRenewalPin('');
                        }, 2000);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      Confirmer le paiement de renouvellement
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Quick stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Stat 1: Sales volume */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chiffre d'Affaires</span>
                <span className="text-xl font-extrabold text-slate-950 mt-1.5 block">
                  {totalSalesVolume.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-500">FCFA</span>
                </span>
                <span className="text-[9px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+12.4% ce mois</span>
                </span>
              </div>

              {/* Stat 2: Active products */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Articles en Vente</span>
                <span className="text-xl font-extrabold text-slate-950 mt-1.5 block">
                  {merchantProducts.length} <span className="text-xs font-bold text-slate-500">références</span>
                </span>
                <span className="text-[9px] text-slate-400 mt-2 block">
                  {totalStock} unités en stock au total
                </span>
              </div>

              {/* Stat 3: Total views */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vues de la Boutique</span>
                <span className="text-xl font-extrabold text-slate-950 mt-1.5 block">
                  {totalViews.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-500">visites</span>
                </span>
                <span className="text-[9px] text-slate-400 mt-2 block">
                  Proviennent de Bafoussam et environs
                </span>
              </div>

              {/* Stat 4: Conversions */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taux de Conversion</span>
                <span className="text-xl font-extrabold text-slate-950 mt-1.5 block">
                  {conversionRate}%
                </span>
                <span className="text-[9px] text-indigo-600 font-bold mt-2 block">
                  {activeMerchant?.isPremium ? 'Maximisé par Premium' : 'Upgradez pour booster'}
                </span>
              </div>
            </div>

            {/* Dashboard main split content: Products vs Advanced Marketing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (Catalog manager) - Col 7 */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">Gestion de votre Catalogue</h3>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                    id="btn-add-product-trigger"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un Article</span>
                  </button>
                </div>

                {merchantProducts.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                    <span className="text-4xl">📦</span>
                    <p className="font-semibold text-slate-800 mt-2.5 text-sm">Aucun produit en ligne</p>
                    <p className="text-xs text-slate-400 max-w-[220px] mx-auto mt-1">
                      Commencez à ajouter vos articles pour qu'ils soient visibles par tous les clients de Bafoussam.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {merchantProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 relative group"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 text-xs truncate">{p.name}</h4>
                            {p.isBoosted && (
                              <span className="bg-indigo-100 text-indigo-800 font-extrabold text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 fill-indigo-800 stroke-none" />
                                <span>BOOST</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">{p.category}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                            <span className="font-extrabold text-slate-950">{p.price.toLocaleString('fr-FR')} F</span>
                            <span className="text-slate-300">|</span>
                            <span className="font-semibold text-slate-500">Stock: {p.stock} unités</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-400">★ {p.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Action controllers */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg border border-slate-100 cursor-pointer shadow-sm transition"
                            title="Supprimer l'article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column (Advanced Marketing / Analytics & Campaigns) - Col 5 */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Advanced Marketing Space */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                  
                  {/* Lock overlay if standard merchant */}
                  {!activeMerchant?.isPremium && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600 mb-3.5 shadow-sm">
                        <Sparkles className="w-6 h-6 fill-indigo-500 stroke-none" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight mb-1">
                        Outils Marketing Avancés Bloqués
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-5">
                        L'accès aux analyses géographiques à Bafoussam, aux campagnes promotionnelles de quartiers, et à la mise en avant de produits nécessite un abonnement obligatoire de <strong className="text-slate-800">100 000 FCFA / an</strong>.
                      </p>
                      
                      <button
                        onClick={() => {
                          setUpgradeStep('details');
                          setShowUpgradeModal(true);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-sm transition"
                      >
                        Souscrire à l'Abonnement Annuel
                      </button>
                    </div>
                  )}

                  {/* Unlocked Premium Content */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                        <Megaphone className="w-4.5 h-4.5 text-indigo-500" />
                        <span>Outils Marketing Premium</span>
                      </h3>
                      <span className="bg-indigo-100 text-indigo-900 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase">Débloqué</span>
                    </div>

                    {/* SVG Analytics Graph (Bafoussam geographic performance) */}
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">Performance par Quartier Bafoussam</h4>
                      <div className="space-y-2 text-xs">
                        {/* Tamdja */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span>Tamdja</span>
                            <span className="text-slate-500">45% de vos ventes (85 visites)</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>
                        {/* Bamendzi */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span>Bamendzi</span>
                            <span className="text-slate-500">30% de vos ventes (50 visites)</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-800 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                        </div>
                        {/* Banengo */}
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span>Banengo</span>
                            <span className="text-slate-500">15% de vos ventes (22 visites)</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-400 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Campaigns segment */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Vos Campagnes de Visibilité</h4>
                        <button
                          onClick={() => setShowCampaignModal(true)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                          Créer une campagne
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {activeCampaigns.map((c) => (
                          <div
                            key={c.id}
                            className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{c.title}</span>
                              <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full">Actif</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Cible : {c.targetNeighborhoods.join(', ')} • Fin le {new Date(c.endDate).toLocaleDateString('fr-FR')}
                            </p>
                            <div className="flex justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                              <span>Affichages: <strong className="text-slate-700">{c.views}</strong></span>
                              <span>Conversions: <strong className="text-emerald-600">{c.conversions} clics</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
            </>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Modal Add Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col relative">
            <button
              onClick={() => setShowAddProductModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-base mb-4">Mettre un produit en vente</h3>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nom du Produit *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Café Robusta de Bafoussam (500g)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 text-xs text-slate-950 transition"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Prix en FCFA *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Ex: 3500"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 text-xs text-slate-950 transition"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Quantité Stock *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 text-xs text-slate-950 transition"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catégorie *</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 text-xs text-slate-950 transition"
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                >
                  <option value="Alimentation & Épicerie">Alimentation & Épicerie</option>
                  <option value="Artisanat & Mode">Artisanat & Mode</option>
                  <option value="Électronique & Tech">Électronique & Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lien d'image du produit (Optionnel)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 text-xs text-slate-950 transition"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description du produit</label>
                <textarea
                  rows={3}
                  placeholder="Expliquez la provenance, l'utilité, ou d'autres détails de fabrication à Bafoussam..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/10 text-xs text-slate-950 transition"
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2.5 rounded-xl cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition"
                  id="btn-add-product-save"
                >
                  Publier l'Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Premium Upgrade Subscription (100,000 FCFA/year) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              {upgradeStep === 'details' && (
                <motion.div
                  key="up-details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center pb-2">
                    <span className="text-3xl">👑</span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-2">Abonnement Annuel Premium</h3>
                    <p className="text-xs text-slate-500">Rejoignez l'élite des commerçants de Bafoussam en ligne.</p>
                  </div>

                  <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4 text-xs space-y-2 text-slate-800">
                    <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />
                      <span>Boost Instantané de tous vos articles</span>
                    </p>
                    <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />
                      <span>Rapports géographiques & statistiques de vente</span>
                    </p>
                    <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />
                      <span>Campagnes ciblées par quartiers à Bafoussam</span>
                    </p>
                    <p className="font-bold text-orange-950 flex items-center gap-1.5 pt-2 border-t border-indigo-100/40 mt-1">
                      <span className="text-orange-500 text-sm">🧡</span>
                      <span>L'intégralité est versée directement sur Orange Money : 640406412</span>
                    </p>
                  </div>

                  <form onSubmit={handleUpgradePayment} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Opérateur de Paiement Mobile</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setUpgradeOperator('momo')}
                          className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition cursor-pointer ${
                            upgradeOperator === 'momo' ? 'border-indigo-400 bg-indigo-50/20 text-indigo-900' : 'border-slate-100 bg-slate-50 text-slate-500'
                          }`}
                        >
                          <span className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[8px] font-extrabold text-white">Mo</span>
                          <span>MTN MoMo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpgradeOperator('orange')}
                          className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition cursor-pointer ${
                            upgradeOperator === 'orange' ? 'border-orange-500 bg-orange-50/20 text-orange-950' : 'border-slate-100 bg-slate-50 text-slate-500'
                          }`}
                        >
                          <span className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-extrabold text-white">Om</span>
                          <span>Orange OM</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Numéro de Téléphone Mobile Money *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 677894512"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 font-mono transition"
                        value={upgradePhone}
                        onChange={(e) => setUpgradePhone(e.target.value)}
                      />
                    </div>

                    {upgradeError && (
                      <div className="text-red-600 text-xs font-semibold bg-red-50 p-2 border border-red-100 rounded-xl text-center">
                        {upgradeError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition shadow-sm"
                    >
                      Verser 100 000 FCFA directement sur Orange 640406412
                    </button>
                  </form>
                </motion.div>
              )}

              {upgradeStep === 'processing' && (
                <motion.div
                  key="up-proc"
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <Loader2 className="w-12 h-12 text-slate-800 animate-spin mb-4" />
                  <h4 className="font-bold text-slate-900 text-sm">Traitement en cours...</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
                    Envoi de la demande d'autorisation de transfert de 100 000 FCFA directement vers le numéro Orange Money 640406412.
                  </p>
                </motion.div>
              )}

              {upgradeStep === 'ussd' && (
                <motion.div
                  key="up-ussd"
                  className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl relative border border-slate-800 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                      {upgradeOperator === 'momo' ? 'MTN MOBILE MONEY' : 'ORANGE MONEY'}
                    </span>
                    <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">PIN GATEWAY</span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300">
                    Saisissez votre code PIN secret de paiement mobile pour valider le transfert annuel Premium de <strong className="text-white">100 000 FCFA</strong> vers le numéro Orange <strong className="text-white">640406412</strong> :
                  </p>

                  <form onSubmit={handleConfirmUpgradePIN} className="space-y-4">
                    <input
                      type="password"
                      maxLength={4}
                      pattern="\d{4}"
                      placeholder="****"
                      required
                      autoFocus
                      className="w-full text-center tracking-[1.5em] font-mono text-xl bg-slate-950 border border-slate-800 rounded-xl py-2 text-indigo-400 focus:outline-none"
                      value={upgradePin}
                      onChange={(e) => setUpgradePin(e.target.value.replace(/\D/g, ''))}
                    />

                    {upgradeError && (
                      <div className="text-red-400 text-[10px] text-center font-bold bg-red-950/40 border border-red-900/40 py-1.5 rounded-lg">
                        {upgradeError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUpgradeStep('details')}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-xl transition"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl transition"
                        id="btn-confirm-upgrade-momo"
                      >
                        Autoriser (100k)
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {upgradeStep === 'success' && (
                <motion.div
                  key="up-succ"
                  className="text-center py-6"
                >
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <Check className="w-8 h-8 stroke-[2.5]" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">Boutique Upgradée !</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                    Votre abonnement obligatoire de 100 000 FCFA par an a été versé avec succès directement sur le numéro Orange <strong className="text-orange-600 font-bold">640406412</strong>. Les fonctionnalités de marketing avancé et le boost de visibilité sont débloqués.
                  </p>

                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      setUpgradeStep('details');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl cursor-pointer transition text-xs shadow-sm mt-6"
                  >
                    Accéder à mon tableau de bord Premium
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 5. Modal New Campaign Wizard */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col relative">
            <button
              onClick={() => setShowCampaignModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-1.5">
              <Megaphone className="w-5 h-5 text-indigo-500" />
              <span>Créer une Campagne de Visibilité</span>
            </h3>

            <form onSubmit={handleAddCampaign} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Titre de la Campagne *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Opération Spéciale taro - Tamdja"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-xs text-slate-950 transition"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type de Campagne</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCampaignType('boost')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition cursor-pointer ${
                      campaignType === 'boost' ? 'border-indigo-400 bg-indigo-50/20 text-indigo-900' : 'border-slate-100 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Boost de Produits</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCampaignType('promo')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition cursor-pointer ${
                      campaignType === 'promo' ? 'border-indigo-400 bg-indigo-50/20 text-indigo-900' : 'border-slate-100 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Promo Quartier</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cibler des Quartiers à Bafoussam (Sélection Multi)</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50">
                  {['Tamdja', 'Bamendzi', 'Banengo', 'Djeleng', 'Famla', 'Carrefour Bamiléké'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleToggleTargetNeighborhood(n)}
                      className={`py-1.5 px-2.5 rounded-lg text-left text-xs transition flex items-center justify-between cursor-pointer ${
                        campaignTarget.includes(n) ? 'bg-indigo-100 text-indigo-900 font-bold' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/40'
                      }`}
                    >
                      <span>{n}</span>
                      {campaignTarget.includes(n) && <Check className="w-3 h-3 text-indigo-900 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2.5 rounded-xl cursor-pointer transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition"
                >
                  Lancer la Campagne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
