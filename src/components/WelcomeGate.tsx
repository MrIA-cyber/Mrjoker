import React, { useState, useEffect } from 'react';
import { User, Neighborhood } from '../types';
import { BAFOUSSAM_NEIGHBORHOODS } from '../data/mockData';
import { otpService } from '../services/otpService';
import { 
  Check, ShieldCheck, HelpCircle, Phone, ArrowRight, Loader2, Sparkles, MapPin, Mail, 
  User as UserIcon, Lock, Globe, AlertCircle, Clock, Eye, EyeOff, X, Smartphone, 
  Store, Building2, Wrench, ChevronRight, ChevronDown, CreditCard, RefreshCw, CheckCircle2,
  Truck, Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../translations';
import SupportPhoneNumber from './SupportPhoneNumber';
import NeighborhoodSelectModal from './NeighborhoodSelectModal';

interface WelcomeGateProps {
  onSuccess: (user: User) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
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
}

export const PROFILE_OPTIONS: ProfileOption[] = [
  {
    id: 'client',
    title: 'Client',
    emoji: '👤',
    icon: UserIcon,
    description: 'Achetez des produits, commandez des repas et réservez des services à Bafoussam.',
    price: 3000,
    formattedPrice: '3 000 FCFA / mois',
    trialDays: 5,
    formattedTrial: '5 jours d\'essai gratuit',
    badge: 'Particulier',
  },
  {
    id: 'vendeur',
    title: 'Vendeur',
    emoji: '🛍️',
    icon: Store,
    description: 'Créez votre boutique, gérez votre catalogue et vendez vos produits sur la marketplace.',
    price: 5000,
    formattedPrice: '5 000 FCFA / mois',
    trialDays: 10,
    formattedTrial: '10 jours d\'essai gratuit',
    badge: 'Boutique',
  },
  {
    id: 'prestataire',
    title: 'Prestataire',
    emoji: '🛠️',
    icon: Wrench,
    description: 'Proposez vos services professionnels et recevez des demandes directes de clients.',
    price: 7500,
    formattedPrice: '7 500 FCFA / mois',
    trialDays: 10,
    formattedTrial: '10 jours d\'essai gratuit',
    badge: 'Services',
  },
  {
    id: 'entreprise',
    title: 'Entreprise',
    emoji: '🏢',
    icon: Building2,
    description: 'Présentez votre entreprise, vos prestations et développez votre visibilité B2B.',
    price: 15000,
    formattedPrice: '15 000 FCFA / mois',
    trialDays: 10,
    formattedTrial: '10 jours d\'essai gratuit',
    badge: 'Pro & B2B',
  },
];

const refLat = 5.475;
const refLon = 10.475;
const rayonMaxKm = 80;

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function WelcomeGate({ onSuccess, lang, onLangChange }: WelcomeGateProps) {
  const getTranslation = (key: string, replacements: Record<string, string | number> = {}) => {
    let val = (translations[lang] as any)[key] || '';
    Object.entries(replacements).forEach(([k, v]) => {
      val = val.replace(`{${k}}`, String(v));
    });
    return val;
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    neighborhood: '',
  });

  // Profile selection state (default null so no profile is pre-selected)
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [hasChosenProfile, setHasChosenProfile] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isNeighborhoodModalOpen, setIsNeighborhoodModalOpen] = useState(false);

  // Selected neighborhood display name
  const selectedNeighborhoodObj = React.useMemo(() => {
    if (!formData.neighborhood) return null;
    return BAFOUSSAM_NEIGHBORHOODS.find(
      n => n.id === formData.neighborhood || n.name.toLowerCase() === formData.neighborhood.toLowerCase()
    );
  }, [formData.neighborhood]);

  const selectedNeighborhoodName = selectedNeighborhoodObj
    ? selectedNeighborhoodObj.name
    : formData.neighborhood;

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [gpsDetails, setGpsDetails] = useState<{ latitude?: number; longitude?: number; distance?: number } | null>(null);
  const [showBypassOption, setShowBypassOption] = useState(false);

  const [paymentOperator, setPaymentOperator] = useState<'momo' | 'orange' | null>('momo');
  const [phoneForPayment, setPhoneForPayment] = useState('');
  const [step, setStep] = useState<'form' | 'login' | 'searching-subscription' | 'payment-select' | 'processing' | 'ussd-prompt' | 'success'>('form');
  const [pin, setPin] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const markFieldTouched = (field: string) => setTouchedFields(prev => ({ ...prev, [field]: true }));

  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Rate limiting & user verification states
  const [failedLoginCount, setFailedLoginCount] = useState(0);
  const [loginLockoutEndTime, setLoginLockoutEndTime] = useState<number | null>(null);
  const [remainingLockoutSeconds, setRemainingLockoutSeconds] = useState(0);
  const [unregisteredError, setUnregisteredError] = useState(false);
  const [unverifiedError, setUnverifiedError] = useState(false);

  const selectedProfileObj = selectedProfile ? PROFILE_OPTIONS.find(p => p.id === selectedProfile) : null;
  const isProfileSelected = Boolean(selectedProfile);

  // Form field validity for smart auto-advancing
  const isNameValid = formData.name.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPhoneValid = formData.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '').length >= 8;
  const isPasswordValid = formData.password.length >= 8;
  const isConfirmPasswordValid = formData.confirmPassword.length >= 8 && formData.confirmPassword === formData.password;

  const isStep1FormComplete = 
    isNameValid && 
    isEmailValid && 
    isPhoneValid && 
    isPasswordValid && 
    isConfirmPasswordValid && 
    isProfileSelected;

  // Countdown timer for lockout
  useEffect(() => {
    if (!loginLockoutEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((loginLockoutEndTime - now) / 1000);

      if (diff <= 0) {
        setLoginLockoutEndTime(null);
        setRemainingLockoutSeconds(0);
        setFailedLoginCount(0);
      } else {
        setRemainingLockoutSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loginLockoutEndTime]);

  // Smart Auto-Advance from Step 1 Form to Finalization when all required fields are valid
  useEffect(() => {
    if (step !== 'form' || !isStep1FormComplete || isAutoAdvancing) return;

    setIsAutoAdvancing(true);
    const timer = setTimeout(() => {
      triggerFormSubmission();
    }, 350);

    return () => clearTimeout(timer);
  }, [isStep1FormComplete, step, isAutoAdvancing]);

  // Seed registered users list if empty
  useEffect(() => {
    try {
      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      if (!savedUsersRaw) {
        const today = new Date();
        const expiry = new Date();
        expiry.setMonth(today.getMonth() + 3);
        
        const seedUsers: User[] = [
          {
            id: 'u-seed-1',
            name: 'Jean Kamdem',
            email: 'jean.kamdem@mail.com',
            phone: '677894512',
            password: 'password123',
            isVerifiedPhone: true,
            isSubscribed: true,
            subscriptionDate: today.toISOString().split('T')[0],
            subscriptionExpiryDate: expiry.toISOString().split('T')[0],
            hasPaidFee: true,
            neighborhoodId: 'marche-a',
          },
          {
            id: 'u-seed-2',
            name: 'Alice Kamga',
            email: 'alice.kamga@yahoo.fr',
            phone: '690000000',
            password: 'password123',
            isVerifiedPhone: true,
            isSubscribed: true,
            subscriptionDate: today.toISOString().split('T')[0],
            subscriptionExpiryDate: expiry.toISOString().split('T')[0],
            hasPaidFee: true,
            neighborhoodId: 'marche-a',
          }
        ];
        localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(seedUsers));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleAutoFillTestData = () => {
    console.log("⚡ Auto-filling valid test data in WelcomeGate...");
    setFormData({
      name: 'Utilisateur Test',
      email: 'test.user@afrinova.cm',
      phone: '670000001',
      password: 'Test@12345',
      confirmPassword: 'Test@12345',
      neighborhood: '',
    });
    setSelectedProfile('client');
    setHasChosenProfile(true);
    setValidationError('');
  };

  const triggerFormSubmission = () => {
    try {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        setValidationError(lang === 'fr' ? 'Veuillez entrer votre nom complet (au moins 2 caractères).' : 'Please enter your full name (at least 2 characters).');
        setIsAutoAdvancing(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
        setValidationError(lang === 'fr' ? 'Veuillez entrer une adresse email valide.' : 'Please enter a valid email address.');
        setIsAutoAdvancing(false);
        return;
      }

      const cleanFormPhone = formData.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
      if (!cleanFormPhone || cleanFormPhone.length < 8) {
        setValidationError(lang === 'fr' ? 'Veuillez entrer un numéro de téléphone valide.' : 'Please enter a valid phone number.');
        setIsAutoAdvancing(false);
        return;
      }

      if (!formData.password || formData.password.length < 8) {
        setValidationError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.');
        setIsAutoAdvancing(false);
        return;
      }

      if (formData.confirmPassword !== formData.password) {
        setValidationError(lang === 'fr' ? 'La confirmation ne correspond pas au mot de passe.' : 'Password confirmation does not match.');
        setIsAutoAdvancing(false);
        return;
      }

      if (!selectedProfile) {
        setValidationError(lang === 'fr' ? 'Veuillez sélectionner un profil.' : 'Please select a profile.');
        setIsAutoAdvancing(false);
        return;
      }

      const cleanEmail = formData.email.trim().toLowerCase();

      // Check existing accounts in database
      try {
        const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
        const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

        const phoneExists = savedUsers.some(u => {
          const uClean = u.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
          return uClean === cleanFormPhone || 
                 (cleanFormPhone.length >= 8 && uClean.endsWith(cleanFormPhone)) ||
                 (uClean.length >= 8 && cleanFormPhone.endsWith(uClean));
        });
        if (phoneExists) {
          setValidationError(getTranslation('phoneAlreadyRegistered'));
          setIsAutoAdvancing(false);
          return;
        }

        const emailExists = savedUsers.some(u => u.email.trim().toLowerCase() === cleanEmail);
        if (emailExists) {
          setValidationError(getTranslation('emailAlreadyRegistered'));
          setIsAutoAdvancing(false);
          return;
        }
      } catch (err) {
        console.error("Database check error:", err);
      }

      setValidationError('');
      setShowBypassOption(false);
      setGpsDetails(null);

      // Instantly advance to Step 2 (payment-select)
      setIsVerifyingLocation(false);
      setIsAutoAdvancing(false);
      setIsNavigating(true);
      setTimeout(() => {
        setIsNavigating(false);
        const targetPhone = formData.phone;
        setPhoneForPayment(targetPhone);
        setStep('payment-select');
      }, 150);
    } catch (err) {
      console.error("Error in triggerFormSubmission:", err);
      setValidationError(lang === 'fr' ? 'Une erreur est survenue lors de la validation.' : 'An error occurred during validation.');
      setIsAutoAdvancing(false);
      setIsVerifyingLocation(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (loginLockoutEndTime && Date.now() < loginLockoutEndTime) {
      const remaining = Math.max(1, Math.ceil((loginLockoutEndTime - Date.now()) / 1000));
      setValidationError(
        lang === 'fr'
          ? `Trop de tentatives, réessayez dans quelques instants (${remaining}s).`
          : `Too many attempts, please try again in a moment (${remaining}s).`
      );
      setUnregisteredError(false);
      setUnverifiedError(false);
      return;
    }

    const cleanInputPhone = loginPhone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');

    if (!cleanInputPhone) {
      setValidationError(lang === 'fr' ? 'Veuillez entrer votre numéro de téléphone.' : 'Please enter your phone number.');
      setUnregisteredError(false);
      setUnverifiedError(false);
      return;
    }

    if (!loginPassword) {
      setValidationError(lang === 'fr' ? 'Veuillez entrer votre mot de passe.' : 'Please enter your password.');
      setUnregisteredError(false);
      setUnverifiedError(false);
      return;
    }

    setValidationError('');
    setUnregisteredError(false);
    setUnverifiedError(false);
    setStep('searching-subscription');

    setTimeout(() => {
      try {
        const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
        const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
        
        const matchedUser = savedUsers.find(u => {
          const uClean = u.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
          return uClean === cleanInputPhone || 
                 (cleanInputPhone.length >= 8 && uClean.endsWith(cleanInputPhone)) ||
                 (uClean.length >= 8 && cleanInputPhone.endsWith(uClean));
        });

        if (!matchedUser) {
          const nextFailedCount = failedLoginCount + 1;
          setFailedLoginCount(nextFailedCount);
          setStep('login');

          if (nextFailedCount >= 5) {
            const lockoutTime = Date.now() + 30000;
            setLoginLockoutEndTime(lockoutTime);
            setRemainingLockoutSeconds(30);
            setValidationError(
              lang === 'fr'
                ? 'Trop de tentatives, réessayez dans quelques instants.'
                : 'Too many attempts, please try again in a moment.'
            );
            setUnregisteredError(false);
          } else {
            setUnregisteredError(true);
            setValidationError(
              getTranslation('phoneNotFoundLoginError') ||
              (lang === 'fr' ? "Aucun compte n'est associé à ce numéro." : "No account is associated with this phone number.")
            );
          }
          return;
        }

        const expectedPassword = matchedUser.password || 'password123';
        if (loginPassword !== expectedPassword) {
          const nextFailedCount = failedLoginCount + 1;
          setFailedLoginCount(nextFailedCount);
          setStep('login');

          if (nextFailedCount >= 5) {
            const lockoutTime = Date.now() + 30000;
            setLoginLockoutEndTime(lockoutTime);
            setRemainingLockoutSeconds(30);
            setValidationError(
              lang === 'fr'
                ? 'Trop de tentatives, réessayez dans quelques instants.'
                : 'Too many attempts, please try again in a moment.'
            );
          } else {
            setValidationError(
              getTranslation('invalidCredentialsError') ||
              (lang === 'fr' ? "Numéro ou mot de passe incorrect." : "Incorrect phone number or password.")
            );
          }
          return;
        }

        setFailedLoginCount(0);
        setLoginLockoutEndTime(null);
        onSuccess(matchedUser);

      } catch (err) {
        console.error(err);
        setStep('login');
        setValidationError(lang === 'fr' ? 'Erreur lors de la vérification du compte.' : 'Error verifying account.');
      }
    }, 1200);
  };

  const handleSelectOperator = (op: 'momo' | 'orange') => {
    setPaymentOperator(op);
    setStep('processing');
    
    setTimeout(() => {
      setStep('ussd-prompt');
    }, 1500);
  };

  const handleConfirmPIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setValidationError(getTranslation('pinLengthError'));
      return;
    }
    setValidationError('');
    setStep('processing');

    setTimeout(() => {
      const ref = `TX-${paymentOperator === 'momo' ? 'MOMO' : 'OM'}-${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionRef(ref);
      setStep('success');
    }, 2000);
  };

  const handleFinish = () => {
    const today = new Date();
    const trialDays = selectedProfileObj.trialDays || 5;
    const trialExpiry = new Date();
    trialExpiry.setDate(today.getDate() + trialDays);

    const expiry = new Date();
    expiry.setMonth(today.getMonth() + 3);

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      isVerifiedPhone: true,
      accountType: selectedProfile,
      trialStartDate: today.toISOString(),
      trialExpiryDate: trialExpiry.toISOString(),
      isInTrial: true,
      hasCompletedTrial: false,
      isSubscribed: true,
      subscriptionPlan: selectedProfile,
      subscriptionDuration: 'monthly',
      subscriptionDate: today.toISOString().split('T')[0],
      subscriptionExpiryDate: expiry.toISOString().split('T')[0],
      hasPaidFee: true,
      neighborhoodId: formData.neighborhood,
    };

    try {
      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      const filtered = savedUsers.filter(u => u.phone.replace(/\s+/g, '') !== newUser.phone.replace(/\s+/g, ''));
      filtered.push(newUser);
      localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(filtered));
    } catch (err) {
      console.error(err);
    }

    onSuccess(newUser);
  };

  // Determine current active step for the 2-step progress bar
  const currentStepIndex = 
    step === 'form' ? 1 : 
    step === 'success' ? 3 : 2;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-3 sm:p-6 font-sans selection:bg-[#DCFCE7] selection:text-[#15803D] relative" id="welcome-gate-container">
      
      {/* Background soft ambient accents */}
      <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-[#DCFCE7]/60 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-emerald-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Main Container Card with White Background & Soft Shadow */}
      <div className="w-full max-w-lg bg-[#FFFFFF] rounded-[22px] shadow-xl border border-[#E5E7EB] overflow-hidden relative z-10 font-sans p-4 sm:p-6 md:p-8">
        
        {/* Language selector in top-right */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20">
          <button
            type="button"
            onClick={() => onLangChange(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#F8FAFC] hover:bg-slate-200 text-[#0F172A] border border-[#E5E7EB] text-[11px] sm:text-xs font-bold transition cursor-pointer shadow-2xs"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>{lang === 'fr' ? 'EN' : 'FR'}</span>
          </button>
        </div>

        {/* Header: Logo, Title & Subtitle with guaranteed padding for language selector */}
        <div className="flex flex-col items-center text-center mb-3 pb-2.5 border-b border-[#E8E8E8] pr-12 sm:pr-14" id="logo-header">
          <div className="flex items-center gap-2 max-w-full">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#0F172A] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-black text-[#0F172A] font-display tracking-tight leading-none">
                  Afri<span className="text-[#16A34A]">Nova</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase bg-[#16A34A] text-white px-1.5 py-0.5 rounded-md tracking-wider shrink-0">
                  Bafoussam
                </span>
              </div>
              <p className="text-[11px] sm:text-[13px] text-slate-600 font-medium tracking-tight mt-0.5 leading-snug break-words max-w-full">
                « L'Afrique connectée au monde. »
              </p>
            </div>
          </div>
        </div>

        {/* 2-Step Stepper Progress Bar (Only shown during registration steps) */}
        {step !== 'login' && step !== 'searching-subscription' && (
          <div className="mb-4 px-1">
            <div className="flex items-center justify-between relative px-4">
              {/* Line 1-2 */}
              <div className="absolute top-3.5 sm:top-4 left-10 right-10 h-[1.5px] bg-[#E8E8E8] -z-0">
                <div 
                  className="h-full bg-[#16A34A] transition-all duration-250 ease-out" 
                  style={{ width: currentStepIndex > 1 ? '100%' : '0%' }}
                />
              </div>

              {/* Step 1 Circle */}
              <div className="flex flex-col items-center gap-1 z-10 shrink-0">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-extrabold text-[11px] sm:text-xs transition-all duration-250 ease-out ${
                  currentStepIndex > 1
                    ? 'bg-[#16A34A] text-white shadow-2xs'
                    : 'bg-[#16A34A] text-[#FFFFFF] ring-4 ring-[#DCFCE7] ring-offset-1 shadow-xs'
                }`}>
                  {currentStepIndex > 1 ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" /> : '1'}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold transition-colors duration-250 text-center ${currentStepIndex === 1 ? 'text-[#16A34A]' : 'text-slate-500'}`}>
                  Informations
                </span>
              </div>

              {/* Step 2 Circle */}
              <div className="flex flex-col items-center gap-1 z-10 shrink-0">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-extrabold text-[11px] sm:text-xs transition-all duration-250 ease-out ${
                  currentStepIndex === 3
                    ? 'bg-[#16A34A] text-white shadow-2xs'
                    : currentStepIndex === 2
                    ? 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7] ring-offset-1 shadow-xs'
                    : 'bg-[#F8FAFC] text-slate-400 border border-[#E8E8E8]'
                }`}>
                  {currentStepIndex === 3 ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" /> : '2'}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold transition-colors duration-250 text-center ${currentStepIndex >= 2 ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                  Finalisation
                </span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 1: FORM (INFORMATIONS) */}
          {step === 'form' && (
            <motion.div
              key="form-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={(e) => { e.preventDefault(); if (!isAutoAdvancing) triggerFormSubmission(); }} className="space-y-3">
                


                {/* Nom complet */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    {getTranslation('fullNameLabel')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean Kamdem"
                      onBlur={() => markFieldTouched('name')}
                      className={`w-full h-[42px] pl-10 pr-3.5 bg-white border rounded-[16px] text-xs text-[#0F172A] font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${
                        touchedFields.name && !isNameValid ? 'border-red-500 bg-red-50/20' : 'border-[#E8E8E8]'
                      }`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  {touchedFields.name && !isNameValid && (
                    <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{lang === 'fr' ? 'Veuillez saisir votre nom complet (au moins 2 caractères).' : 'Please enter your full name (at least 2 chars).'}</span>
                    </p>
                  )}
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      {getTranslation('emailAddressLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="jean.kamdem@mail.com"
                        onBlur={() => markFieldTouched('email')}
                        className={`w-full h-[42px] pl-10 pr-3.5 bg-white border rounded-[16px] text-xs text-[#0F172A] font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${
                          touchedFields.email && !isEmailValid ? 'border-red-500 bg-red-50/20' : 'border-[#E8E8E8]'
                        }`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    {touchedFields.email && !isEmailValid && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{lang === 'fr' ? 'Adresse e-mail invalide.' : 'Invalid email address.'}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      {getTranslation('phoneNumberLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 677894512"
                        onBlur={() => markFieldTouched('phone')}
                        className={`w-full h-[42px] pl-10 pr-3.5 bg-white border rounded-[16px] text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${
                          touchedFields.phone && !isPhoneValid ? 'border-red-500 bg-red-50/20' : 'border-[#E8E8E8]'
                        }`}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    {touchedFields.phone && !isPhoneValid && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{lang === 'fr' ? 'Le numéro de téléphone est invalide (ex: 677894512).' : 'Invalid phone number (e.g. 677894512).'}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      {getTranslation('passwordLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        required
                        minLength={8}
                        onBlur={() => markFieldTouched('password')}
                        placeholder={getTranslation('passwordPlaceholder')}
                        className={`w-full h-[42px] pl-10 pr-10 bg-white border rounded-[16px] text-xs text-[#0F172A] font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${
                          touchedFields.password && !isPasswordValid ? 'border-red-500 bg-red-50/20' : 'border-[#E8E8E8]'
                        }`}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {touchedFields.password && !isPasswordValid && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{lang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.'}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      {getTranslation('confirmPasswordLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showRegisterConfirmPassword ? "text" : "password"}
                        required
                        minLength={8}
                        onBlur={() => markFieldTouched('confirmPassword')}
                        placeholder={getTranslation('confirmPasswordLabel')}
                        className={`w-full h-[42px] pl-10 pr-10 bg-white border rounded-[16px] text-xs text-[#0F172A] font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all duration-200 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${
                          touchedFields.confirmPassword && !isConfirmPasswordValid ? 'border-red-500 bg-red-50/20' : 'border-[#E8E8E8]'
                        }`}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showRegisterConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {touchedFields.confirmPassword && !isConfirmPasswordValid && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{lang === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.'}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Premium Profile Selection Card */}
                <div className="pt-0.5">
                  {!hasChosenProfile || !selectedProfileObj ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          markFieldTouched('profile');
                          setIsBottomSheetOpen(true);
                        }}
                        className={`w-full p-2.5 sm:p-3 rounded-[16px] bg-white border transition-all duration-200 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] group cursor-pointer text-left ${
                          touchedFields.profile && !hasChosenProfile
                            ? 'border-red-500 bg-red-50/20'
                            : 'border-[#E8E8E8] hover:border-[#16A34A] hover:bg-[#F0FDF4]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[12px] bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-sm sm:text-base font-bold shrink-0">
                            👤
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1 truncate">
                              Choisir mon profil <span className="text-red-500">*</span>
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                              Client • Vendeur • Prestataire • Entreprise
                            </p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#F8FAFC] group-hover:bg-[#DCFCE7] text-slate-400 group-hover:text-[#16A34A] flex items-center justify-center transition-colors shrink-0 ml-2">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                      {touchedFields.profile && !hasChosenProfile && (
                        <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{lang === 'fr' ? 'Veuillez sélectionner un profil.' : 'Please select a profile.'}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="w-full p-2.5 sm:p-3 rounded-[16px] bg-[#F0FDF4] border-2 border-[#16A34A] shadow-[0_2px_8px_rgba(22,163,74,0.08)] flex items-center justify-between transition-all duration-200 gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[12px] bg-[#16A34A] text-white flex items-center justify-center text-sm sm:text-base font-bold shrink-0 shadow-xs">
                          {selectedProfileObj.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black text-[#15803D] uppercase tracking-wider flex items-center gap-1 shrink-0">
                              Profil sélectionné <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white text-[#16A34A] border border-emerald-200 shrink-0">
                              {selectedProfileObj.badge}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-[#0F172A] truncate mt-0.5">
                            {selectedProfileObj.title} <span className="font-mono text-[10px] sm:text-[11px] font-extrabold text-[#15803D]">({selectedProfileObj.formattedPrice})</span>
                          </h4>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsBottomSheetOpen(true)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-[12px] bg-white hover:bg-emerald-50 text-[#16A34A] border border-emerald-300 text-[10px] sm:text-[11px] font-extrabold transition shrink-0 cursor-pointer shadow-2xs ml-1"
                      >
                        Modifier
                      </button>
                    </div>
                  )}
                </div>

                {/* Validation Errors & Geolocation Messages */}
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-xs font-semibold p-3 bg-red-50 border border-red-200 rounded-[16px] space-y-1 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p>{validationError}</p>
                      {gpsDetails?.distance !== undefined && (
                        <p className="text-[10px] text-red-500 font-normal font-mono mt-0.5">
                          Distance calculée : {gpsDetails.distance.toFixed(1)} km.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {showBypassOption && (
                  <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-3 space-y-2 mt-1">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 text-base">💡</span>
                      <div>
                        <p className="text-amber-900 font-bold text-xs">{getTranslation('manualBypassTitle')}</p>
                        <p className="text-amber-800 text-[11px] leading-snug mt-0.5">
                          {getTranslation('manualBypassDesc')}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError('');
                        setShowBypassOption(false);
                        setPhoneForPayment(formData.phone);
                        setStep('payment-select');
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-3 rounded-[12px] text-xs transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{getTranslation('manualBypassBtn')}</span>
                    </button>
                  </div>
                )}

                {/* Info Text */}
                <p className="text-center text-xs text-slate-500 font-medium pt-1">
                  Les informations seront vérifiées automatiquement avant de passer à l'étape suivante.
                </p>

                {/* Primary Button "Continuer" */}
                <button
                  type="button"
                  disabled={!isStep1FormComplete || isVerifyingLocation || isNavigating}
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                      try { navigator.vibrate(10); } catch (err) {}
                    }
                    if (isStep1FormComplete && !isVerifyingLocation && !isAutoAdvancing && !isNavigating) {
                      triggerFormSubmission();
                    }
                  }}
                  className={`w-full h-[54px] rounded-[16px] text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                    !isStep1FormComplete
                      ? 'bg-[#E2E8F0] text-slate-400 opacity-60 shadow-none border border-slate-200 cursor-not-allowed'
                      : 'bg-[#16A34A] hover:bg-[#15803D] active:bg-[#15803D] text-white shadow-[0_8px_20px_rgba(22,163,74,0.25)] active:scale-[0.98] cursor-pointer'
                  }`}
                >
                  {isVerifyingLocation || isNavigating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isNavigating ? 'Redirection vers la finalisation...' : 'Vérification de la géolocalisation...'}</span>
                    </>
                  ) : (
                    <>
                      <span>Continuer vers la finalisation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Footer Badges */}
                <div className="pt-2">
                  <div className="flex items-center justify-around gap-2 text-center text-[11px] font-semibold text-slate-600 bg-[#F8FAFC] p-2.5 sm:p-3 rounded-[16px] border border-[#E8E8E8]">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                      <span>Paiement sécurisé</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#16A34A]" />
                      <span>Livraison rapide</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-[#16A34A]" />
                      <span>Support 24/7</span>
                    </div>
                  </div>
                </div>

              </form>

              <div className="mt-3.5 text-center">
                <p className="text-xs text-slate-500">
                  {getTranslation('alreadyRegistered')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setValidationError('');
                      setUnregisteredError(false);
                      setUnverifiedError(false);
                      setStep('login');
                    }}
                    className="text-[#16A34A] font-bold hover:underline cursor-pointer"
                  >
                    {getTranslation('loginHere')}
                  </button>
                </p>
              </div>

            </motion.div>
          )}

          {/* STEP 2: FINALISATION & PAIEMENT */}
          {step === 'payment-select' && (
            <motion.div
              key="payment-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Summary Card */}
              <div className="bg-[#DCFCE7]/70 border border-emerald-300/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#15803D] uppercase tracking-wider">
                    Résumé de votre compte
                  </span>
                  <span className="text-[10px] font-extrabold bg-white text-[#16A34A] px-2 py-0.5 rounded-full border border-emerald-200">
                    Période d'essai gratuite incluse
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center text-lg font-bold shrink-0">
                    {selectedProfileObj.emoji}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#0F172A]">
                      {selectedProfileObj.title}
                    </h4>
                    <p className="text-xs text-[#15803D] font-mono font-bold">
                      {selectedProfileObj.formattedPrice}
                    </p>
                  </div>
                </div>

                <div className="border-t border-emerald-200/80 pt-2 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Abonné :</span>
                    <span className="font-bold text-[#0F172A]">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Téléphone :</span>
                    <span className="font-mono font-bold text-[#0F172A]">{formData.phone}</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1 pt-1">
                <h3 className="text-sm font-extrabold text-[#0F172A]">Choisissez votre mode de paiement</h3>
                <p className="text-xs text-slate-500">Paiement Mobile Money ultra sécurisé.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectOperator('momo')}
                  className="p-4 border-2 border-[#E5E7EB] hover:border-[#16A34A] bg-white hover:bg-[#DCFCE7]/30 rounded-2xl cursor-pointer transition flex flex-col items-center justify-center group shadow-2xs"
                >
                  <div className="w-12 h-12 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-black text-sm mb-2 group-hover:scale-105 transition">
                    MTN
                  </div>
                  <span className="font-extrabold text-[#0F172A] text-xs">MTN MoMo</span>
                </button>

                <button
                  onClick={() => handleSelectOperator('orange')}
                  className="p-4 border-2 border-[#E5E7EB] hover:border-[#16A34A] bg-white hover:bg-[#DCFCE7]/30 rounded-2xl cursor-pointer transition flex flex-col items-center justify-center group shadow-2xs"
                >
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-sm mb-2 group-hover:scale-105 transition">
                    OM
                  </div>
                  <span className="font-extrabold text-[#0F172A] text-xs">Orange Money</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setStep('form')}
                  className="text-xs text-slate-500 hover:text-[#16A34A] underline cursor-pointer"
                >
                  ← Modifier les informations
                </button>
              </div>
            </motion.div>
          )}

          {/* PROCESSING / USSD PUSH */}
          {step === 'processing' && (
            <motion.div
              key="processing-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <Loader2 className="w-10 h-10 text-[#16A34A] animate-spin mb-3" />
              <h3 className="font-extrabold text-[#0F172A] text-base">{getTranslation('processingPayment')}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {getTranslation('processingPaymentDesc')}
              </p>
            </motion.div>
          )}

          {step === 'ussd-prompt' && (
            <motion.div
              key="ussd-step"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F172A] text-white rounded-2xl p-5 shadow-2xl relative border border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#16A34A]" />
                  <span className="text-xs font-bold tracking-widest text-[#16A34A] uppercase">
                    {paymentOperator === 'momo' ? 'MTN MOBILE MONEY' : 'ORANGE MONEY CAMEROUN'}
                  </span>
                </div>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">USSD PUSH SIMULATOR</span>
              </div>

              <p className="text-xs leading-relaxed mb-4 text-slate-100">
                Notification de confirmation envoyée au {phoneForPayment || formData.phone}.
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {getTranslation('pinDescription')}
                </span>
              </p>

              <form onSubmit={handleConfirmPIN} className="space-y-3">
                <div>
                  <input
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    placeholder="****"
                    required
                    autoFocus
                    className="w-full text-center tracking-[1.5em] font-mono text-xl bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-[#16A34A] focus:outline-none focus:border-[#16A34A]"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                {validationError && (
                  <div className="text-red-400 text-xs text-center font-medium bg-red-950/40 py-1.5 rounded-lg">
                    {validationError}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('payment-select')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition text-center"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer transition shadow-md text-center"
                  >
                    Confirmer
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP SUCCESS */}
          {step === 'success' && (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4 space-y-3"
            >
              <div className="w-14 h-14 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto border border-emerald-300 shadow-xs">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <h3 className="text-xl font-black text-[#0F172A] font-display">
                Compte créé avec succès ! 🎉
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {getTranslation('paymentApprovedDesc')}
              </p>

              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E5E7EB] text-left space-y-2 text-xs max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Titulaire :</span>
                  <span className="font-bold text-[#0F172A]">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profil :</span>
                  <span className="font-bold text-[#16A34A]">{selectedProfileObj.title}</span>
                </div>
                <div className="flex justify-between border-t border-[#E5E7EB] pt-1.5 text-slate-400">
                  <span>Référence :</span>
                  <span className="font-mono text-[#0F172A] font-bold">{transactionRef}</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs py-3.5 px-6 rounded-2xl cursor-pointer transition shadow-md flex items-center justify-center gap-2 text-center"
                id="btn-finish-payment-welcome"
              >
                <span>Accéder à la plateforme</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* LOGIN SCREEN */}
          {step === 'login' && (
            <motion.div
              key="login-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-[#DCFCE7]/60 border border-emerald-200 rounded-2xl p-3.5 mb-4 text-[#0F172A] text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 bg-[#16A34A] text-white rounded-lg mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#15803D] mb-0.5">{getTranslation('subscriberLoginArea')}</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {getTranslation('subscriberLoginDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    {getTranslation('registeredPhoneLabel')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 677894512"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    {getTranslation('passwordLabel')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      placeholder={getTranslation('loginPasswordPlaceholder')}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
                    {validationError}
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setValidationError('');
                      setStep('form');
                    }}
                    className="flex-1 bg-[#F8FAFC] hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition border border-[#E5E7EB] text-center"
                  >
                    S'inscrire
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
                    id="btn-submit-login"
                  >
                    <span>{getTranslation('loginBtnWelcome')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'searching-subscription' && (
            <motion.div
              key="searching-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <Loader2 className="w-10 h-10 text-[#16A34A] animate-spin mb-3" />
              <h3 className="font-extrabold text-[#0F172A] text-sm">{getTranslation('searchingSubscription')}</h3>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Security Footer */}
        <div className="mt-5 flex justify-center gap-6 text-[11px] text-slate-400 border-t border-[#E5E7EB] pt-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>Paiement 100% Sécurisé</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
            <SupportPhoneNumber prefix="Support :" className="text-[11px]" />
          </div>
        </div>

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
              className="relative w-full max-w-lg bg-[#FFFFFF] rounded-t-[28px] sm:rounded-[28px] p-5 shadow-2xl border-t sm:border border-[#E5E7EB] max-h-[85vh] overflow-y-auto z-10 font-sans"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {PROFILE_OPTIONS.map((profile) => {
                  const isSelected = selectedProfile === profile.id;
                  const IconComponent = profile.icon;

                  return (
                    <div
                      key={profile.id}
                      onClick={() => {
                        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                          try { navigator.vibrate(10); } catch (e) {}
                        }
                        setSelectedProfile(profile.id);
                        setHasChosenProfile(true);
                        setTimeout(() => setIsBottomSheetOpen(false), 150);
                      }}
                      className={`p-3.5 rounded-[20px] transition-all duration-200 cursor-pointer relative flex flex-col justify-between border ${
                        isSelected
                          ? 'bg-[#DCFCE7]/70 border-2 border-[#16A34A] shadow-md'
                          : 'bg-[#FFFFFF] border-[#E5E7EB] hover:border-slate-300 hover:bg-[#F8FAFC] shadow-2xs'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                              isSelected ? 'bg-[#16A34A] text-white shadow-2xs' : 'bg-[#F8FAFC] text-slate-600 border border-[#E5E7EB]'
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs">{profile.emoji}</span>
                                <h4 className="text-xs font-black text-[#0F172A] truncate font-display">
                                  {profile.title}
                                </h4>
                              </div>
                              <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
                                {profile.badge}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-lg ${
                              isSelected ? 'bg-[#16A34A] text-white' : 'bg-[#F8FAFC] text-[#0F172A] border border-[#E5E7EB]'
                            }`}>
                              {profile.formattedPrice}
                            </span>
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-2xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 pt-0.5">
                          {profile.description}
                        </p>
                      </div>
                    </div>
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
