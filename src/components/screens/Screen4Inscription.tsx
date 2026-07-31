import React, { useState, useMemo } from 'react';
import { 
  User as UserIcon, Mail, Phone, Lock, Check, ShieldCheck, ArrowRight, Sparkles, 
  Store, Building2, Wrench, MapPin, ChevronRight, ChevronDown, X, AlertCircle, Loader2, CreditCard, RefreshCw, CheckCircle2, Globe, Truck, Headphones, MessageCircle, PhoneCall, ArrowLeft, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NeighborhoodSelectModal from '../NeighborhoodSelectModal';
import { BAFOUSSAM_NEIGHBORHOODS } from '../../data/mockData';

interface Screen4InscriptionProps {
  onSignupSuccess?: () => void;
  onGoToLogin?: () => void;
  lang?: 'fr' | 'en';
  onLangChange?: (lang: 'fr' | 'en') => void;
}

export type ProfileType = 'client' | 'vendeur' | 'entreprise' | 'prestataire';

export interface ProfileOption {
  id: ProfileType;
  title: string;
  emoji: string;
  icon: any;
  description: string;
  price: number;
  formattedPrice: string;
  trialDays: number;
  formattedTrial: string;
  badge: string;
  benefits: string[];
}

const PROFILE_OPTIONS: ProfileOption[] = [
  {
    id: 'client',
    title: 'Client',
    emoji: '👤',
    icon: UserIcon,
    description: "J'achète des produits et profite des services locaux.",
    price: 3000,
    formattedPrice: '3 000 FCFA/mois',
    trialDays: 5,
    formattedTrial: "5 jours d'essai gratuit",
    badge: 'Particulier',
    benefits: [
      "5 jours d'essai gratuit",
      'Achats sécurisés',
      'Livraison rapide',
    ]
  },
  {
    id: 'vendeur',
    title: 'Vendeur',
    emoji: '🛒',
    icon: Store,
    description: "Je vends mes produits sur le marché AfriNova.",
    price: 5000,
    formattedPrice: '5 000 FCFA/mois',
    trialDays: 10,
    formattedTrial: "10 jours d'essai",
    badge: 'Boutique',
    benefits: [
      "10 jours d'essai",
      'Boutique personnalisée',
      'Gestion des commandes',
    ]
  },
  {
    id: 'prestataire',
    title: 'Prestataire',
    emoji: '🔧',
    icon: Wrench,
    description: "Je propose mes services professionnels aux clients.",
    price: 5000,
    formattedPrice: '5 000 FCFA/mois',
    trialDays: 10,
    formattedTrial: "10 jours d'essai",
    badge: 'Services',
    benefits: [
      "10 jours d'essai",
      'Réservation en ligne',
      'Paiement sécurisé',
    ]
  },
  {
    id: 'entreprise',
    title: 'Entreprise',
    emoji: '🏢',
    icon: Building2,
    description: "Je représente une entreprise et gère une équipe.",
    price: 15000,
    formattedPrice: '15 000 FCFA/mois',
    trialDays: 10,
    formattedTrial: "10 jours d'essai",
    badge: 'Pro & B2B',
    benefits: [
      "10 jours d'essai",
      'Tableau de bord avancé',
      'Gestion multi-utilisateurs',
    ]
  },
];

export default function Screen4Inscription({ onSignupSuccess, onGoToLogin, lang = 'fr', onLangChange }: Screen4InscriptionProps) {
  const [currentLang, setCurrentLang] = useState<'fr' | 'en'>(lang);

  const toggleLanguage = () => {
    const nextLang = currentLang === 'fr' ? 'en' : 'fr';
    setCurrentLang(nextLang);
    if (onLangChange) onLangChange(nextLang);
  };
  // Process steps: 'step1' (Informations) | 'step2' (Finalisation) | 'success'
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'success'>('step1');

  // Form state
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Track field touched state for inline validations
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  // Profile selection state (default null so no profile is pre-selected)
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200', textColor: 'text-slate-400' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { score: 1, label: '🔴 Faible', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score === 2) return { score: 2, label: '🟠 Moyen', color: 'bg-amber-500', textColor: 'text-amber-500' };
    return { score: 3, label: '🟢 Fort', color: 'bg-[#16A34A]', textColor: 'text-[#16A34A]' };
  }, [formData.password]);

  // Payment state
  const [paymentOperator, setPaymentOperator] = useState<'momo' | 'orange'>('momo');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const selectedProfileObj = useMemo(() => PROFILE_OPTIONS.find(p => p.id === selectedProfile), [selectedProfile]);

  // Validations per required field (5 required criteria: Nom complet, Email, Phone, Password, Profile)
  const isLastNameValid = formData.lastName.trim().length >= 2;
  const isFirstNameValid = formData.firstName.trim().length >= 2;
  const isPhoneValid = formData.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '').length >= 8;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPasswordValid = formData.password.length >= 8;
  const isConfirmPasswordValid = formData.confirmPassword.length >= 8 && formData.confirmPassword === formData.password;
  const isProfileSelected = Boolean(selectedProfile);

  const isStep1Complete = 
    isLastNameValid && 
    isFirstNameValid && 
    isPhoneValid && 
    isEmailValid && 
    isPasswordValid && 
    isConfirmPasswordValid && 
    isProfileSelected;

  const markFieldTouched = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  // Helper function to auto-fill valid test data for easy testing
  const handleAutoFillTestData = () => {
    console.log("⚡ Auto-filling valid test data into form...");
    setFormData({
      lastName: 'Utilisateur',
      firstName: 'Test',
      phone: '670000001',
      email: 'test.user@afrinova.cm',
      password: 'Test@12345',
      confirmPassword: 'Test@12345',
    });
    setSelectedProfile('client');
    setFormError('');
  };

  // Proceed directly from Step 1 to Step 2 (Finalisation)
  const handleProceedToFinalization = () => {
    try {
      console.log("👉 [Screen4Inscription] Triggering handleProceedToFinalization...", {
        formData,
        selectedProfile,
        isLastNameValid,
        isFirstNameValid,
        isPhoneValid,
        isEmailValid,
        isPasswordValid,
        isConfirmPasswordValid,
        isProfileSelected,
        isStep1Complete
      });

      // Mark all fields as touched to display validation indicators
      setTouchedFields({
        lastName: true,
        firstName: true,
        phone: true,
        email: true,
        password: true,
        confirmPassword: true,
        profile: true,
      });

      if (!isLastNameValid || !isFirstNameValid) {
        const msg = currentLang === 'fr' ? 'Veuillez remplir votre nom et prénom (au moins 2 caractères).' : 'Please enter your last and first name (at least 2 characters).';
        console.warn("❌ [Screen4Inscription] Validation failed: name invalid", { lastName: formData.lastName, firstName: formData.firstName });
        setFormError(msg);
        return;
      }
      if (!isPhoneValid) {
        const msg = currentLang === 'fr' ? 'Veuillez entrer un numéro de téléphone valide (ex: 677894512).' : 'Please enter a valid phone number (e.g. 677894512).';
        console.warn("❌ [Screen4Inscription] Validation failed: phone invalid", formData.phone);
        setFormError(msg);
        return;
      }
      if (!isEmailValid) {
        const msg = currentLang === 'fr' ? 'Veuillez entrer une adresse email valide.' : 'Please enter a valid email address.';
        console.warn("❌ [Screen4Inscription] Validation failed: email invalid", formData.email);
        setFormError(msg);
        return;
      }
      if (!isPasswordValid) {
        const msg = currentLang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.';
        console.warn("❌ [Screen4Inscription] Validation failed: password invalid");
        setFormError(msg);
        return;
      }
      if (!isConfirmPasswordValid) {
        const msg = currentLang === 'fr' ? 'La confirmation du mot de passe ne correspond pas.' : 'Password confirmation does not match.';
        console.warn("❌ [Screen4Inscription] Validation failed: confirm password mismatch");
        setFormError(msg);
        return;
      }
      if (!isProfileSelected) {
        const msg = currentLang === 'fr' ? 'Veuillez choisir un profil d\'utilisation.' : 'Please choose a profile.';
        console.warn("❌ [Screen4Inscription] Validation failed: profile missing");
        setFormError(msg);
        return;
      }

      console.log("✅ [Screen4Inscription] All 5 required fields valid! Transitioning to step 2 Finalisation...");
      setFormError('');
      setIsNavigating(true);
      setPaymentPhone(formData.phone);
      
      // Fast transition to Step 2
      setTimeout(() => {
        setIsNavigating(false);
        setCurrentStep('step2');
        console.log("🎉 [Screen4Inscription] Successfully navigated to Step 2 (Finalisation)");
      }, 150);
    } catch (err) {
      console.error("❌ [Screen4Inscription] Error navigating to finalization:", err);
      setIsNavigating(false);
      setFormError(currentLang === 'fr' ? 'Une erreur est survenue lors de la validation.' : 'An error occurred during validation.');
    }
  };

  // Handle Payment Submission
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setCurrentStep('success');
    }, 1200);
  };

  // Step Index for progress calculation
  const stepIndex = currentStep === 'step1' ? 1 : 2;
  const progressPercent = currentStep === 'step1' ? 50 : 100;
  const stepTitle = currentStep === 'step1'
    ? (currentLang === 'fr' ? 'Informations' : 'Information')
    : (currentLang === 'fr' ? 'Finalisation' : 'Finalization');

  return (
    <div className="w-full max-w-[540px] mx-auto bg-white text-[#0F172A] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-[0_16px_48px_rgba(15,23,42,0.12)] border border-slate-200/90 p-5 sm:p-7 flex flex-col justify-between min-h-[90vh] sm:min-h-[660px] relative font-sans transition-all duration-300">
      
      {/* 1. Header with 30% Enlarged Logo, City Badge, Slogan & Language Toggle */}
      <div className="shrink-0 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
          {/* Logo & City Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#0F172A] text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/25 shrink-0 transform hover:scale-105 transition-transform duration-200">
              <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-300 animate-pulse" />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#0F172A] font-display tracking-tight leading-none">
                  Afri<span className="text-[#16A34A]">Nova</span>
                </span>
                <span className="text-[11px] font-black uppercase bg-[#16A34A] text-white px-2.5 py-0.5 rounded-lg tracking-wider shrink-0 shadow-2xs">
                  BAFOUSSAM
                </span>
              </div>
            </div>
          </div>

          {/* Right Language Selector FR/EN */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#16A34A] border border-slate-200 hover:border-emerald-300 flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0 shadow-2xs"
            title="Changer de langue / Switch language"
          >
            <Globe className="w-4 h-4 text-[#16A34A]" />
            <span className={currentLang === 'fr' ? 'text-[#16A34A] font-extrabold' : 'text-slate-400'}>FR</span>
            <span className="text-slate-300 text-[10px]">|</span>
            <span className={currentLang === 'en' ? 'text-[#16A34A] font-extrabold' : 'text-slate-400'}>EN</span>
          </button>
        </div>

        {/* Subtitle Slogan Container */}
        <div className="bg-emerald-50/70 border border-emerald-200/70 px-4 py-2.5 rounded-2xl text-left shadow-2xs flex items-center gap-2.5">
          <Sparkles className="w-4.5 h-4.5 text-[#16A34A] shrink-0 animate-spin-slow" />
          <p className="text-xs sm:text-sm text-[#16A34A] font-extrabold tracking-tight leading-relaxed">
            « {currentLang === 'fr' ? "L'Afrique connectée au monde." : "Africa connected to the world."} »
          </p>
        </div>

        {/* 3. Real Animated Progress Bar */}
        <div className="pt-2 pb-1 space-y-2">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-[#16A34A]">{currentStep === 'step1' ? '🟢 Étape 1' : '🟢 Étape 2'}</span> • {stepTitle}
            </span>
            <span className="font-mono text-[#16A34A] bg-[#DCFCE7] border border-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              {progressPercent} %
            </span>
          </div>

          {/* Fluid Progress Bar Line */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#16A34A] rounded-full shadow-xs"
              initial={{ width: '50%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          </div>

          {/* 2 Step Badges */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div className={`py-1.5 px-3 rounded-xl text-center flex items-center justify-center gap-2 transition-all duration-200 ${
              currentStep !== 'step1'
                ? 'bg-[#16A34A] text-white shadow-2xs font-extrabold'
                : 'bg-[#16A34A] text-white ring-2 ring-[#DCFCE7] shadow-md shadow-emerald-600/20 font-black'
            }`}>
              <div className="w-4 h-4 rounded-full bg-white text-[#16A34A] flex items-center justify-center text-[10px] shrink-0 font-bold">
                {currentStep !== 'step1' ? <Check className="w-3 h-3 stroke-[3]" /> : '🟢'}
              </div>
              <span className="text-xs truncate">1. Informations</span>
            </div>

            <div className={`py-1.5 px-3 rounded-xl text-center flex items-center justify-center gap-2 transition-all duration-200 ${
              currentStep === 'step2' || currentStep === 'success'
                ? 'bg-[#16A34A] text-white ring-2 ring-[#DCFCE7] shadow-md shadow-emerald-600/20 font-black'
                : 'bg-[#F8FAFC] text-slate-400 border border-slate-200 font-bold'
            }`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                currentStep === 'step2' ? 'bg-white text-[#16A34A]' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep === 'success' ? <Check className="w-3 h-3 stroke-[3]" /> : '⚪'}
              </div>
              <span className="text-xs truncate">2. Finalisation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Areas Animated by Step */}
      <div className="my-auto py-2 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INFORMATIONS */}
          {currentStep === 'step1' && (
            <motion.div
              key="step1-informations"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-3.5 pt-1"
            >

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-[16px] text-xs sm:text-sm font-extrabold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nom & Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs sm:text-[13px] font-extrabold text-slate-700 uppercase tracking-wide">
                      {currentLang === 'fr' ? 'Nom' : 'Last Name'} <span className="text-red-500">*</span>
                    </label>
                    {isLastNameValid && (
                      <span className="text-[10px] font-extrabold text-[#16A34A] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Nom valide
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onBlur={() => markFieldTouched('lastName')}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Kamdem"
                      required
                      className={`w-full h-[54px] pl-12 pr-10 bg-[#F8FAFC] focus:bg-white border rounded-[16px] text-sm text-[#0F172A] font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400 ${
                        touchedFields.lastName && !isLastNameValid ? 'border-red-500 bg-red-50/20' : 'border-[#E2E8F0]'
                      }`}
                    />
                    {isLastNameValid && (
                      <CheckCircle2 className="w-5 h-5 text-[#16A34A] absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0 animate-in fade-in" />
                    )}
                  </div>
                  {touchedFields.lastName && !isLastNameValid && (
                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{currentLang === 'fr' ? 'Au moins 2 caractères' : 'At least 2 characters'}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs sm:text-[13px] font-extrabold text-slate-700 uppercase tracking-wide">
                      {currentLang === 'fr' ? 'Prénom' : 'First Name'} <span className="text-red-500">*</span>
                    </label>
                    {isFirstNameValid && (
                      <span className="text-[10px] font-extrabold text-[#16A34A] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Prénom valide
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onBlur={() => markFieldTouched('firstName')}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Jean"
                      required
                      className={`w-full h-[54px] pl-12 pr-10 bg-[#F8FAFC] focus:bg-white border rounded-[16px] text-sm text-[#0F172A] font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400 ${
                        touchedFields.firstName && !isFirstNameValid ? 'border-red-500 bg-red-50/20' : 'border-[#E2E8F0]'
                      }`}
                    />
                    {isFirstNameValid && (
                      <CheckCircle2 className="w-5 h-5 text-[#16A34A] absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0 animate-in fade-in" />
                    )}
                  </div>
                  {touchedFields.firstName && !isFirstNameValid && (
                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{currentLang === 'fr' ? 'Au moins 2 caractères' : 'At least 2 characters'}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs sm:text-[13px] font-extrabold text-slate-700 uppercase tracking-wide">
                    {currentLang === 'fr' ? 'Téléphone (WhatsApp / MoMo / Orange)' : 'Phone (WhatsApp / MoMo / Orange)'} <span className="text-red-500">*</span>
                  </label>
                  {isPhoneValid && (
                    <span className="text-[10px] font-extrabold text-[#16A34A] flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Téléphone valide
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onBlur={() => markFieldTouched('phone')}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="677894512"
                    required
                    className={`w-full h-[54px] pl-12 pr-10 bg-[#F8FAFC] focus:bg-white border rounded-[16px] text-sm text-[#0F172A] font-mono font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400 ${
                      touchedFields.phone && !isPhoneValid ? 'border-red-500 bg-red-50/20' : 'border-[#E2E8F0]'
                    }`}
                  />
                  {isPhoneValid && (
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0 animate-in fade-in" />
                  )}
                </div>
                {touchedFields.phone && !isPhoneValid && (
                  <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{currentLang === 'fr' ? 'Numéro valide requis (ex: 677894512)' : 'Valid phone number required (e.g. 677894512)'}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs sm:text-[13px] font-extrabold text-slate-700 uppercase tracking-wide">
                    {currentLang === 'fr' ? 'Email' : 'Email address'} <span className="text-red-500">*</span>
                  </label>
                  {isEmailValid && (
                    <span className="text-[10px] font-extrabold text-[#16A34A] flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Email valide
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={formData.email}
                    onBlur={() => markFieldTouched('email')}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean.kamdem@gmail.com"
                    required
                    className={`w-full h-[54px] pl-12 pr-10 bg-[#F8FAFC] focus:bg-white border rounded-[16px] text-sm text-[#0F172A] font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400 ${
                      touchedFields.email && !isEmailValid ? 'border-red-500 bg-red-50/20' : 'border-[#E2E8F0]'
                    }`}
                  />
                  {isEmailValid && (
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0 animate-in fade-in" />
                  )}
                </div>
                {touchedFields.email && !isEmailValid && (
                  <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{currentLang === 'fr' ? 'Adresse email valide requise' : 'Valid email address required'}</span>
                  </p>
                )}
              </div>

              {/* Mot de passe & Confirmation avec indicateur de force & Toggle Mask */}
              <div className="grid grid-cols-2 gap-3">
                {/* Mot de passe */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs sm:text-[13px] font-extrabold text-slate-700 uppercase tracking-wide">
                      {currentLang === 'fr' ? 'Mot de passe' : 'Password'} <span className="text-red-500">*</span>
                    </label>
                    {formData.password && (
                      <span className={`text-[10px] font-extrabold ${passwordStrength.textColor}`}>
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onBlur={() => markFieldTouched('password')}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className={`w-full h-[54px] pl-12 pr-11 bg-[#F8FAFC] focus:bg-white border rounded-[16px] text-sm text-[#0F172A] font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400 ${
                        touchedFields.password && !isPasswordValid ? 'border-red-500 bg-red-50/20' : 'border-[#E2E8F0]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#16A34A] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {/* Visual Strength Meter */}
                  {formData.password.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                      </div>
                    </div>
                  )}
                  {touchedFields.password && !isPasswordValid && (
                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{currentLang === 'fr' ? 'Au moins 8 car.' : 'At least 8 chars.'}</span>
                    </p>
                  )}
                </div>

                {/* Confirmation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs sm:text-[13px] font-extrabold text-slate-700 uppercase tracking-wide">
                      {currentLang === 'fr' ? 'Confirmation' : 'Confirm'} <span className="text-red-500">*</span>
                    </label>
                    {isConfirmPasswordValid && (
                      <span className="text-[10px] font-extrabold text-[#16A34A] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Identique
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onBlur={() => markFieldTouched('confirmPassword')}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className={`w-full h-[54px] pl-12 pr-11 bg-[#F8FAFC] focus:bg-white border rounded-[16px] text-sm text-[#0F172A] font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400 ${
                        touchedFields.confirmPassword && !isConfirmPasswordValid ? 'border-red-500 bg-red-50/20' : 'border-[#E2E8F0]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#16A34A] transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {touchedFields.confirmPassword && !isConfirmPasswordValid && (
                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{currentLang === 'fr' ? 'Non identique' : 'Must match'}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Selected Profile Card Design */}
              <div className="pt-1">
                {!selectedProfileObj ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        markFieldTouched('profile');
                        setIsBottomSheetOpen(true);
                      }}
                      className={`w-full p-4 rounded-[18px] bg-white border-2 border-dashed transition-all duration-200 flex items-center justify-between shadow-2xs group cursor-pointer text-left active:scale-[0.98] ${
                        touchedFields.profile && !isProfileSelected
                          ? 'border-red-500 bg-red-50/20'
                          : 'border-slate-300 hover:border-[#16A34A] hover:bg-[#F0FDF4]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-lg font-bold shrink-0">
                          👤
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1 truncate">
                            {currentLang === 'fr' ? 'Choisir mon profil' : 'Choose my profile'} <span className="text-red-500">*</span>
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                            👤 Client • 🛒 Vendeur • 🏢 Entreprise • 🔧 Prestataire
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#DCFCE7] text-slate-400 group-hover:text-[#16A34A] flex items-center justify-center transition-colors shrink-0 ml-2">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </button>
                    {touchedFields.profile && !isProfileSelected && (
                      <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{currentLang === 'fr' ? 'Veuillez sélectionner un profil.' : 'Please select a profile.'}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-full p-4 rounded-[20px] bg-[#F0FDF4] border-2 border-[#16A34A] shadow-[0_4px_20px_rgba(22,163,74,0.1)] relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-emerald-200/80">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm">
                          {selectedProfileObj.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-[#15803D] uppercase tracking-wider flex items-center gap-1 shrink-0">
                              {currentLang === 'fr' ? 'Profil sélectionné' : 'Selected profile'} <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-[#16A34A] border border-emerald-200 shrink-0">
                              {selectedProfileObj.badge}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-[#0F172A] truncate mt-0.5">
                            {selectedProfileObj.title} <span className="font-mono text-xs font-extrabold text-[#15803D]">({selectedProfileObj.formattedPrice})</span>
                          </h4>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsBottomSheetOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#16A34A] border border-emerald-300 text-xs font-extrabold transition shrink-0 cursor-pointer shadow-2xs active:scale-95 ml-1"
                      >
                        {currentLang === 'fr' ? 'Modifier' : 'Modify'}
                      </button>
                    </div>

                    {/* Display Benefits Checklist */}
                    <div className="pt-2.5 space-y-1">
                      <p className="text-[11px] font-extrabold text-[#15803D] uppercase tracking-wider">
                        {currentLang === 'fr' ? 'Avantages inclus' : 'Included benefits'} ({selectedProfileObj.formattedTrial}) :
                      </p>
                      <ul className="space-y-1">
                        {selectedProfileObj.benefits.map((benefit, i) => (
                          <li key={i} className="text-xs text-slate-700 font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 8. Primary Button "Continuer vers la finalisation →" */}
              <button
                type="button"
                disabled={!isStep1Complete || isNavigating}
                onClick={(e) => {
                  e.preventDefault();
                  console.log("👉 [Screen4Inscription] 'Continuer vers la finalisation' button clicked", {
                    isStep1Complete,
                    isNavigating,
                    formData,
                    selectedProfile
                  });
                  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    try { navigator.vibrate(10); } catch (err) {}
                  }
                  handleProceedToFinalization();
                }}
                className={`w-full h-[54px] sm:h-[56px] rounded-[18px] text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                  !isStep1Complete
                    ? 'bg-[#E2E8F0] text-slate-400 opacity-60 shadow-none border border-slate-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#16A34A] hover:brightness-105 active:scale-[0.98] text-white shadow-[0_8px_24px_rgba(22,163,74,0.3)] cursor-pointer animate-in zoom-in-95'
                }`}
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{currentLang === 'fr' ? 'Chargement de la finalisation...' : 'Loading finalization...'}</span>
                  </>
                ) : (
                  <>
                    <span>{currentLang === 'fr' ? 'Continuer vers la finalisation' : 'Continue to finalization'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* 9. Premium Footer Component (5 Badges) */}
              <div className="pt-2 space-y-3">
                <div className="grid grid-cols-5 gap-1 p-2.5 rounded-[18px] bg-[#F8FAFC] border border-slate-200/80 text-[10px] font-bold text-slate-700 text-center shadow-2xs">
                  <div className="flex flex-col items-center justify-center gap-1 p-1">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                    <span className="leading-tight truncate w-full">🔒 Sécurisé</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1 p-1">
                    <Truck className="w-4 h-4 text-[#16A34A]" />
                    <span className="leading-tight truncate w-full">🚚 Rapide</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1 p-1">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span className="leading-tight truncate w-full">✔ Vérifié</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1 p-1">
                    <Headphones className="w-4 h-4 text-[#16A34A]" />
                    <span className="leading-tight truncate w-full">🎧 24/7</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1 p-1">
                    <MapPin className="w-4 h-4 text-[#16A34A]" />
                    <span className="leading-tight truncate w-full">📍 Local</span>
                  </div>
                </div>

                {/* Direct Contact Links & Copyright */}
                <div className="flex flex-col items-center gap-2 pt-1 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-3 flex-wrap justify-center font-semibold">
                    <a 
                      href="https://wa.me/237699000000" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1 text-[#16A34A] hover:underline font-extrabold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                    <span className="text-slate-300">•</span>
                    <a href="tel:+237699000000" className="flex items-center gap-1 hover:text-[#0F172A]">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                      <span>Téléphone</span>
                    </a>
                    <span className="text-slate-300">•</span>
                    <a href="mailto:support@afrinova.cm" className="flex items-center gap-1 hover:text-[#0F172A]">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email</span>
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    © 2026 AfriNova. Tous droits réservés.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: FINALISATION / PAIEMENT SÉCURISÉ */}
          {currentStep === 'step2' && (
            <motion.div
              key="step2-finalisation"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-4 py-1"
            >
              {/* Back to Step 1 Button */}
              <button
                type="button"
                onClick={() => setCurrentStep('step1')}
                className="text-xs font-extrabold text-slate-500 hover:text-[#16A34A] flex items-center gap-1 transition cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLang === 'fr' ? 'Modifier mes informations' : 'Edit my information'}</span>
              </button>

              {/* Profile Summary Card */}
              <div className="bg-[#DCFCE7]/70 border border-emerald-300/80 rounded-[20px] p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#15803D] uppercase tracking-wider">
                    {currentLang === 'fr' ? 'Résumé de votre abonnement' : 'Subscription Summary'}
                  </span>
                  <span className="text-[10px] font-extrabold bg-white text-[#16A34A] px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {currentLang === 'fr' ? "Période d'essai incluse" : 'Free trial included'}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-11 h-11 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm">
                    {selectedProfileObj?.emoji || '👤'}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-[#0F172A]">
                      {selectedProfileObj?.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#15803D] font-mono font-bold">
                      {selectedProfileObj?.formattedPrice}
                    </p>
                  </div>
                </div>

                <div className="border-t border-emerald-200/80 pt-2.5 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>{currentLang === 'fr' ? 'Titulaire :' : 'Account holder:'}</span>
                    <span className="font-bold text-[#0F172A]">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{currentLang === 'fr' ? 'Téléphone :' : 'Phone:'}</span>
                    <span className="font-mono font-bold text-[#0F172A]">{formData.phone}</span>
                  </div>
                </div>
              </div>

              {/* Select Mobile Money Operator */}
              <form onSubmit={handleProcessPayment} className="space-y-3.5">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                  {currentLang === 'fr' ? 'Moyen de paiement sécurisé' : 'Secure payment method'}
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOperator('momo')}
                    className={`p-3.5 rounded-[18px] border-2 flex flex-col items-center justify-center text-center cursor-pointer transition active:scale-[0.98] ${
                      paymentOperator === 'momo'
                        ? 'border-[#16A34A] bg-[#DCFCE7]/60 text-[#0F172A] shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-400 text-slate-900 font-black text-xs flex items-center justify-center mb-1.5 shadow-2xs">
                      MTN
                    </div>
                    <span className="text-xs font-bold">MTN MoMo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOperator('orange')}
                    className={`p-3.5 rounded-[18px] border-2 flex flex-col items-center justify-center text-center cursor-pointer transition active:scale-[0.98] ${
                      paymentOperator === 'orange'
                        ? 'border-[#16A34A] bg-[#DCFCE7]/60 text-[#0F172A] shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center mb-1.5 shadow-2xs">
                      OM
                    </div>
                    <span className="text-xs font-bold">Orange Money</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">
                    {currentLang === 'fr' ? 'Numéro de débit Mobile Money' : 'Mobile Money billing number'}
                  </label>
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    required
                    className="w-full h-[54px] sm:h-[58px] px-4 bg-[#F8FAFC] focus:bg-white border border-[#E2E8F0] rounded-[16px] sm:rounded-[18px] text-sm sm:text-base text-[#0F172A] font-mono font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full h-[54px] sm:h-[58px] px-6 bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#16A34A] hover:brightness-105 disabled:bg-slate-300 text-white font-extrabold text-sm sm:text-base rounded-[18px] shadow-[0_8px_24px_rgba(22,163,74,0.3)] flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{currentLang === 'fr' ? 'Validation du paiement USSD...' : 'Validating USSD payment...'}</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>{currentLang === 'fr' ? 'Procéder au paiement sécurisé' : 'Proceed to secure payment'}</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP SUCCESS: COMPTE CRÉÉ AVEC SUCCÈS */}
          {currentStep === 'success' && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-md">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] font-display">
                {currentLang === 'fr' ? 'Compte créé avec succès ! 🎉' : 'Account created successfully! 🎉'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                {currentLang === 'fr'
                  ? 'Bienvenue sur AfriNova Bafoussam. Votre accès est activé.'
                  : 'Welcome to AfriNova Bafoussam. Your access is active.'}
              </p>

              <div className="bg-[#F8FAFC] rounded-[18px] p-4 border border-[#E2E8F0] text-left text-xs sm:text-sm space-y-2 max-w-xs mx-auto font-medium shadow-2xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{currentLang === 'fr' ? 'Titulaire :' : 'Account holder:'}</span>
                  <span className="font-bold text-[#0F172A]">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{currentLang === 'fr' ? 'Profil :' : 'Profile:'}</span>
                  <span className="font-bold text-[#16A34A]">{selectedProfileObj?.title}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSignupSuccess) onSignupSuccess();
                }}
                className="w-full h-[54px] sm:h-[58px] bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#16A34A] hover:brightness-105 text-white font-extrabold text-sm sm:text-base rounded-[18px] shadow-[0_8px_24px_rgba(22,163,74,0.3)] transition flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-[0.98]"
              >
                <span>{currentLang === 'fr' ? 'Accéder à mon espace' : 'Go to my account'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Link to Login */}
      <div className="pt-3 border-t border-[#E2E8F0] text-center shrink-0">
        <p className="text-xs sm:text-sm text-slate-500">
          {currentLang === 'fr' ? 'Vous avez déjà un compte ?' : 'Already have an account?'}{' '}
          <button 
            type="button"
            onClick={onGoToLogin}
            className="font-black text-[#16A34A] hover:underline cursor-pointer active:scale-[0.98]"
          >
            {currentLang === 'fr' ? 'Se connecter' : 'Sign in'}
          </button>
        </p>
      </div>

      {/* Bottom Sheet for Profile Selection */}
      <AnimatePresence>
        {isBottomSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBottomSheetOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Modal Content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#FFFFFF] rounded-t-[28px] sm:rounded-[28px] p-5 shadow-2xl border-t sm:border border-[#E5E7EB] max-h-[85vh] overflow-y-auto z-10"
            >
              {/* Handle Bar */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="text-base font-black text-[#0F172A] font-display">
                    Choisissez votre profil
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Sélectionnez le type de compte correspondant à votre activité.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBottomSheetOpen(false)}
                  className="p-1.5 rounded-full bg-[#F8FAFC] hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Secure Payment Badge */}
              <div className="my-3 flex justify-start">
                <span className="text-[10px] font-extrabold text-slate-700 bg-[#F8FAFC] px-2.5 py-1 rounded-full border border-[#E5E7EB] flex items-center gap-1">
                  <span>🔒</span>
                  <span>Paiement sécurisé</span>
                </span>
              </div>

              {/* Profile Grid Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {PROFILE_OPTIONS.map((profile, index) => {
                  const isSelected = selectedProfile === profile.id;
                  const IconComponent = profile.icon;

                  return (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.05 }}
                      onClick={() => {
                        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                          try { navigator.vibrate(10); } catch (e) {}
                        }
                        setSelectedProfile(profile.id);
                        setTimeout(() => setIsBottomSheetOpen(false), 200);
                      }}
                      className={`p-4 rounded-[22px] transition-all duration-200 cursor-pointer relative flex flex-col justify-between border active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#F0FDF4] border-2 border-[#16A34A] shadow-md shadow-emerald-600/10 ring-2 ring-[#DCFCE7]'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Header with Emoji/Icon, Title & Radio Indicator */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-2xs ${
                              isSelected ? 'bg-[#16A34A] text-white' : 'bg-[#DCFCE7]/70 text-[#16A34A] border border-emerald-200/80'
                            }`}>
                              {profile.emoji}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-[#0F172A] font-display flex items-center gap-1">
                                {profile.title}
                              </h4>
                              <span className="text-[10px] font-bold text-[#16A34A] font-mono block">
                                {profile.formattedPrice}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSelected ? (
                              <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-sm animate-in zoom-in-75 duration-200">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-snug font-medium">
                          {profile.description}
                        </p>

                        {/* Benefits list */}
                        <div className="pt-1.5 border-t border-slate-100 space-y-1">
                          {profile.benefits.map((benefit, i) => (
                            <div key={i} className="text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Single Information Note */}
              <div className="mt-4 text-slate-600 text-[11px] leading-relaxed bg-[#DCFCE7]/60 border border-emerald-200/80 rounded-2xl p-3 flex items-start gap-2.5 font-medium shadow-2xs">
                <span className="text-sm shrink-0 select-none">ℹ️</span>
                <p>
                  Chaque profil bénéficie automatiquement d'une période d'essai gratuite conformément aux conditions définies pour ce type de compte. L'abonnement débute uniquement à la fin de cette période.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
