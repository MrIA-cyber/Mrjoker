import React, { useState, useEffect } from 'react';
import { User, Neighborhood } from '../types';
import { BAFOUSSAM_NEIGHBORHOODS } from '../data/mockData';
import { otpService } from '../services/otpService';
import { 
  Check, ShieldCheck, HelpCircle, Phone, ArrowRight, Loader2, Sparkles, MapPin, Mail, 
  User as UserIcon, Lock, Globe, AlertCircle, Clock, Eye, EyeOff, X, Smartphone, 
  Store, Building2, Wrench, ChevronRight, CreditCard, RefreshCw, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../translations';
import SupportPhoneNumber from './SupportPhoneNumber';

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
    neighborhood: BAFOUSSAM_NEIGHBORHOODS[0].id,
  });

  // Profile selection state
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>('client');
  const [hasChosenProfile, setHasChosenProfile] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [gpsDetails, setGpsDetails] = useState<{ latitude?: number; longitude?: number; distance?: number } | null>(null);
  const [showBypassOption, setShowBypassOption] = useState(false);

  const [paymentOperator, setPaymentOperator] = useState<'momo' | 'orange' | null>('momo');
  const [phoneForPayment, setPhoneForPayment] = useState('');
  const [step, setStep] = useState<'form' | 'login' | 'searching-subscription' | 'otp-verification' | 'payment-select' | 'processing' | 'ussd-prompt' | 'success'>('form');
  const [pin, setPin] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [isOtpResending, setIsOtpResending] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [unverifiedUserToActivate, setUnverifiedUserToActivate] = useState<User | null>(null);
  const [devOtpSimStatus, setDevOtpSimStatus] = useState<'idle' | 'simulating' | 'success'>('idle');

  // Rate limiting & user verification states
  const [failedLoginCount, setFailedLoginCount] = useState(0);
  const [loginLockoutEndTime, setLoginLockoutEndTime] = useState<number | null>(null);
  const [remainingLockoutSeconds, setRemainingLockoutSeconds] = useState(0);
  const [unregisteredError, setUnregisteredError] = useState(false);
  const [unverifiedError, setUnverifiedError] = useState(false);

  const selectedProfileObj = PROFILE_OPTIONS.find(p => p.id === selectedProfile) || PROFILE_OPTIONS[0];

  // Form field validity for smart auto-advancing
  const isNameValid = formData.name.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPhoneValid = formData.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '').length >= 9;
  const isPasswordValid = formData.password.length >= 8;
  const isConfirmPasswordValid = formData.confirmPassword.length >= 8 && formData.confirmPassword === formData.password;
  const isNeighborhoodValid = Boolean(formData.neighborhood);

  const isStep1FormComplete = 
    isNameValid && 
    isEmailValid && 
    isPhoneValid && 
    isPasswordValid && 
    isConfirmPasswordValid && 
    isNeighborhoodValid && 
    hasChosenProfile;

  // Countdown timer for OTP resend (60 seconds)
  useEffect(() => {
    if (step !== 'otp-verification') return;
    if (otpCountdown <= 0) return;

    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, otpCountdown]);

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

  // Smart Auto-Advance from Step 1 Form to Step 2 OTP when all required fields are valid
  useEffect(() => {
    if (step !== 'form' || !isStep1FormComplete || isAutoAdvancing) return;

    setIsAutoAdvancing(true);
    const timer = setTimeout(() => {
      triggerFormSubmission();
    }, 350);

    return () => clearTimeout(timer);
  }, [isStep1FormComplete, step, isAutoAdvancing]);

  // Smart Auto-Advance from Step 2 OTP to Step 3 Payment when 6 digits typed
  useEffect(() => {
    if (step !== 'otp-verification') return;
    if (inputOtp.length === 6 && otpService.getMode() === 'production') {
      const targetPhone = formData.phone || (unverifiedUserToActivate ? unverifiedUserToActivate.phone : '');
      otpService.verifyOtp(targetPhone, inputOtp).then((res) => {
        if (res.success) {
          setValidationError('');
          setPhoneForPayment(targetPhone);
          setStep('payment-select');
        } else {
          setValidationError(res.message || getTranslation('incorrectCode'));
        }
      });
    }
  }, [inputOtp, step, formData.phone, unverifiedUserToActivate]);

  // Development Mode 2-second OTP Simulation & Auto-Advance
  useEffect(() => {
    if (step !== 'otp-verification') {
      setDevOtpSimStatus('idle');
      return;
    }

    if (otpService.getMode() === 'development') {
      setDevOtpSimStatus('simulating');
      console.log('[WelcomeGate] Mode DEVELOPMENT: Démarrage de la simulation 2s OTP...');

      const simTimer = setTimeout(async () => {
        const targetPhone = formData.phone || (unverifiedUserToActivate ? unverifiedUserToActivate.phone : '');
        const res = await otpService.verifyOtp(targetPhone, inputOtp || generatedOtp || '123456');

        if (res.success) {
          setDevOtpSimStatus('success');
          console.log('[WelcomeGate] Simulation OTP réussie -> Passage automatique à l\'étape suivante');

          const advanceTimer = setTimeout(() => {
            setValidationError('');
            setPhoneForPayment(targetPhone);
            setStep('payment-select');
          }, 400);

          return () => clearTimeout(advanceTimer);
        }
      }, 2000); // Exactly 2 seconds

      return () => clearTimeout(simTimer);
    }
  }, [step, formData.phone, unverifiedUserToActivate]);

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

  const triggerFormSubmission = () => {
    const cleanFormPhone = formData.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
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
      console.error(err);
    }

    setValidationError('');
    setShowBypassOption(false);
    setGpsDetails(null);
    setIsVerifyingLocation(true);

    const proceedWithOtp = async () => {
      setIsVerifyingLocation(false);
      setIsAutoAdvancing(false);
      const targetPhone = formData.phone || (unverifiedUserToActivate ? unverifiedUserToActivate.phone : '');
      const res = await otpService.sendOtp(targetPhone);
      if (res.code) {
        setGeneratedOtp(res.code);
      }
      setInputOtp('');
      setOtpCountdown(60);
      setStep('otp-verification');
    };

    if (!navigator.geolocation) {
      setIsVerifyingLocation(false);
      setIsAutoAdvancing(false);
      setValidationError(getTranslation('gpsNotSupported'));
      setShowBypassOption(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = distanceKm(latitude, longitude, refLat, refLon);
        setGpsDetails({ latitude, longitude, distance: dist });

        if (dist <= rayonMaxKm) {
          proceedWithOtp();
        } else {
          setIsVerifyingLocation(false);
          setIsAutoAdvancing(false);
          setValidationError(getTranslation('outsideWestRegion', { dist: dist.toFixed(1) }));
          setShowBypassOption(true);
        }
      },
      (error) => {
        setIsVerifyingLocation(false);
        setIsAutoAdvancing(false);
        let errMsg = lang === 'fr' ? 'Erreur de géolocalisation.' : 'Geolocation error.';
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = getTranslation('gpsDenied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errMsg = getTranslation('gpsUnavailable');
        } else if (error.code === error.TIMEOUT) {
          errMsg = getTranslation('gpsTimeout');
        }
        setValidationError(errMsg);
        setShowBypassOption(true);
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 300000 }
    );
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

        if (matchedUser.isVerifiedPhone === false) {
          setStep('login');
          setUnverifiedError(true);
          setUnverifiedUserToActivate(matchedUser);
          setValidationError(
            getTranslation('unverifiedPhoneLoginError') ||
            (lang === 'fr' ? "Veuillez confirmer votre numéro de téléphone avant de vous connecter." : "Please confirm your phone number before logging in.")
          );
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPhone = formData.phone || (unverifiedUserToActivate ? unverifiedUserToActivate.phone : '');
    const res = await otpService.verifyOtp(targetPhone, inputOtp);
    if (!res.success) {
      setValidationError(res.message || getTranslation('incorrectCode'));
      return;
    }
    setValidationError('');
    setPhoneForPayment(targetPhone);
    setStep('payment-select');
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setIsOtpResending(true);
    setValidationError('');
    const targetPhone = formData.phone || (unverifiedUserToActivate ? unverifiedUserToActivate.phone : '');
    const res = await otpService.resendOtp(targetPhone);
    if (res.code) {
      setGeneratedOtp(res.code);
    }
    setInputOtp('');
    setOtpCountdown(60);
    setIsOtpResending(false);
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

    const newUser: User = unverifiedUserToActivate ? {
      ...unverifiedUserToActivate,
      accountType: selectedProfile,
      isVerifiedPhone: true,
      isSubscribed: true,
      isInTrial: false,
    } : {
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

  // Determine current active step for the 3-step progress bar
  const currentStepIndex = 
    step === 'form' ? 1 : 
    step === 'otp-verification' ? 2 : 
    step === 'success' ? 4 : 3;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-3 sm:p-6 font-sans selection:bg-[#DCFCE7] selection:text-[#15803D] relative" id="welcome-gate-container">
      
      {/* Background soft ambient accents */}
      <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-[#DCFCE7]/60 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-emerald-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Main Container Card with White Background & Soft Shadow */}
      <div className="w-full max-w-lg bg-[#FFFFFF] rounded-[22px] shadow-xl border border-[#E5E7EB] overflow-hidden relative z-10 font-sans p-5 sm:p-8">
        
        {/* Language selector in top-right */}
        <div className="absolute top-5 right-5 z-20">
          <button
            type="button"
            onClick={() => onLangChange(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] hover:bg-slate-200 text-[#0F172A] border border-[#E5E7EB] text-xs font-bold transition cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>{lang === 'fr' ? 'EN' : 'FR'}</span>
          </button>
        </div>

        {/* Header: Logo, Title & Subtitle */}
        <div className="flex flex-col items-center text-center mb-4 pb-3 border-b border-[#E5E7EB]" id="logo-header">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#0F172A] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <Globe className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-[#0F172A] font-display tracking-tight leading-none">
                  Afri<span className="text-[#16A34A]">Nova</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase bg-[#16A34A] text-white px-1.5 py-0.5 rounded-md tracking-wider">
                  Bafoussam
                </span>
              </div>
              <p className="text-[11px] text-[#16A34A] font-extrabold tracking-tight mt-0.5">
                « L'Afrique connectée au monde. »
              </p>
            </div>
          </div>
        </div>

        {/* 3-Step Stepper Progress Bar (Only shown during registration steps) */}
        {step !== 'login' && step !== 'searching-subscription' && (
          <div className="mb-5 px-1">
            <div className="flex items-center justify-between relative">
              {/* Line 1-2 */}
              <div className="absolute top-4 left-6 right-1/2 h-0.5 bg-[#E5E7EB] -z-0">
                <div 
                  className="h-full bg-[#16A34A] transition-all duration-250 ease-out" 
                  style={{ width: currentStepIndex > 1 ? '100%' : '0%' }}
                />
              </div>

              {/* Line 2-3 */}
              <div className="absolute top-4 left-1/2 right-6 h-0.5 bg-[#E5E7EB] -z-0">
                <div 
                  className="h-full bg-[#16A34A] transition-all duration-250 ease-out" 
                  style={{ width: currentStepIndex > 2 ? '100%' : '0%' }}
                />
              </div>

              {/* Step 1 Circle */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-200 ${
                  currentStepIndex > 1
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7] ring-offset-1 shadow-sm'
                }`}>
                  {currentStepIndex > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                </div>
                <span className={`text-[10px] font-extrabold ${currentStepIndex === 1 ? 'text-[#16A34A]' : 'text-slate-500'}`}>
                  Informations
                </span>
              </div>

              {/* Step 2 Circle */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-200 ${
                  currentStepIndex > 2
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : currentStepIndex === 2
                    ? 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7] ring-offset-1 shadow-sm'
                    : 'bg-[#F8FAFC] text-slate-400 border-2 border-[#E5E7EB]'
                }`}>
                  {currentStepIndex > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                </div>
                <span className={`text-[10px] font-extrabold ${currentStepIndex === 2 ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                  Vérification
                </span>
              </div>

              {/* Step 3 Circle */}
              <div className="flex flex-col items-center gap-1 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-200 ${
                  currentStepIndex === 4
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : currentStepIndex === 3
                    ? 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7] ring-offset-1 shadow-sm'
                    : 'bg-[#F8FAFC] text-slate-400 border-2 border-[#E5E7EB]'
                }`}>
                  {currentStepIndex === 4 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                </div>
                <span className={`text-[10px] font-extrabold ${currentStepIndex >= 3 ? 'text-[#16A34A]' : 'text-slate-400'}`}>
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
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={(e) => { e.preventDefault(); if (!isAutoAdvancing) triggerFormSubmission(); }} className="space-y-3.5">
                
                {/* Nom complet */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    {getTranslation('fullNameLabel')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean Kamdem"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      {getTranslation('emailAddressLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="jean.kamdem@mail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      {getTranslation('phoneNumberLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 677894512"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      {getTranslation('passwordLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        required
                        minLength={8}
                        placeholder={getTranslation('passwordPlaceholder')}
                        className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
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
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      {getTranslation('confirmPasswordLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegisterConfirmPassword ? "text" : "password"}
                        required
                        minLength={8}
                        placeholder={getTranslation('confirmPasswordLabel')}
                        className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
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
                  </div>
                </div>

                {/* Quartier */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    {getTranslation('yourNeighborhoodLabel')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] appearance-none cursor-pointer"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    >
                      {BAFOUSSAM_NEIGHBORHOODS.map((nh) => (
                        <option key={nh.id} value={nh.id}>
                          {nh.name} ({getTranslation('deliveryTimeInMinutes', { minutes: nh.estMinutes })})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Compact Profile Banderole or Selected Summary */}
                <div className="pt-1">
                  {!hasChosenProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsBottomSheetOpen(true)}
                      className="w-full p-3.5 rounded-[18px] bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#16A34A] hover:bg-[#DCFCE7]/20 transition-all flex items-center justify-between shadow-2xs group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-lg font-bold shrink-0">
                          👤
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
                            Choisir mon profil <span className="text-red-500">*</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Client • Vendeur • Prestataire • Entreprise
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#F8FAFC] group-hover:bg-[#DCFCE7] text-slate-400 group-hover:text-[#16A34A] flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-full p-3.5 rounded-[18px] bg-[#DCFCE7]/80 border-2 border-[#16A34A] shadow-2xs flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center text-base font-bold shrink-0 shadow-2xs">
                          {selectedProfileObj.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-[#15803D] uppercase tracking-wider">
                              Profil sélectionné
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-white text-[#16A34A] border border-emerald-200">
                              {selectedProfileObj.badge}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-[#0F172A] truncate mt-0.5">
                            {selectedProfileObj.title} <span className="font-mono text-[11px] font-extrabold text-[#15803D]">({selectedProfileObj.formattedPrice})</span>
                          </h4>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsBottomSheetOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#16A34A] border border-emerald-300 text-[11px] font-extrabold transition shrink-0 cursor-pointer shadow-2xs"
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
                    className="text-red-600 text-xs font-semibold p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 flex items-start gap-2"
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
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-2 mt-1">
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
                        const code = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(code);
                        setInputOtp('');
                        setOtpCountdown(60);
                        setStep('otp-verification');
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-3 rounded-xl text-xs transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{getTranslation('manualBypassBtn')}</span>
                    </button>
                  </div>
                )}

                {/* Smart Auto-Advance Pulse Banner */}
                {isVerifyingLocation ? (
                  <div className="p-3 bg-[#DCFCE7] border border-emerald-300 rounded-2xl text-center text-[#15803D] text-xs font-bold flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#16A34A]" />
                    <span>Vérification de la géolocalisation en cours...</span>
                  </div>
                ) : isAutoAdvancing ? (
                  <div className="p-3 bg-[#DCFCE7] border border-emerald-300 rounded-2xl text-center text-[#15803D] text-xs font-bold flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#16A34A]" />
                    <span>Informations valides — Envoi du code OTP...</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 text-center font-medium pt-1">
                    Complétez tous les champs pour passer automatiquement à l'étape suivante.
                  </p>
                )}

              </form>

              <div className="mt-4 text-center">
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

          {/* STEP 2: VÉRIFICATION OTP */}
          {step === 'otp-verification' && (
            <motion.div
              key="otp-verification-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* OTP MODE BANNER */}
              {otpService.getMode() === 'development' ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 mb-4 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    {devOtpSimStatus === 'simulating' ? (
                      <>
                        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin shrink-0" />
                        <div className="text-left">
                          <p className="text-emerald-950 font-black text-xs">Simulation OTP en cours (2s)...</p>
                          <p className="text-emerald-700 text-[11px] font-medium">Mode Développement actif • Validation automatique</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="text-left">
                          <p className="text-emerald-950 font-black text-xs">Simulation OTP réussie</p>
                          <p className="text-emerald-700 text-[11px] font-medium">Redirection automatique vers le paiement...</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 mb-4 flex items-center gap-2 text-blue-900 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Mode Production • Code SMS envoyé via {otpService.getProviderType().toUpperCase()}</span>
                </div>
              )}
              {/* SMS Notification Banner */}
              <div className="bg-[#0F172A] text-white rounded-2xl p-4 mb-5 shadow-md border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#16A34A] animate-pulse" />
                <div className="flex items-start gap-3">
                  <span className="text-xl">📱</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#16A34A] uppercase tracking-wider">SMS Bafoussam Market</span>
                      <span className="text-[9px] text-slate-400">À l'instant</span>
                    </div>
                    <p className="text-xs text-slate-100 font-mono mt-1 font-semibold">
                      Votre code OTP est : <span className="text-yellow-400 text-sm font-black underline tracking-widest">{generatedOtp}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-5">
                <h3 className="font-extrabold text-[#0F172A] text-sm">Vérification de sécurité</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Code SMS envoyé au <span className="font-mono text-[#16A34A] font-bold">{formData.phone || unverifiedUserToActivate?.phone}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="000000"
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl font-black bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl py-3 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] text-[#0F172A] transition"
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                {validationError && (
                  <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                    {validationError}
                  </div>
                )}

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setValidationError('');
                      setStep('form');
                    }}
                    className="bg-[#F8FAFC] hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs cursor-pointer transition text-center border border-[#E5E7EB]"
                  >
                    Retour
                  </button>

                  <button
                    type="button"
                    disabled={isOtpResending || otpCountdown > 0}
                    onClick={handleResendOtp}
                    className="bg-[#F8FAFC] hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs cursor-pointer transition text-center border border-[#E5E7EB] disabled:opacity-50"
                  >
                    {isOtpResending ? 'Génération...' : otpCountdown > 0 ? `Renvoyer (${otpCountdown}s)` : 'Renvoyer'}
                  </button>

                  <button
                    type="submit"
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs flex-1"
                  >
                    <span>Valider</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: FINALISATION & PAIEMENT */}
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
                    <span className="font-bold text-[#0F172A]">{formData.name || unverifiedUserToActivate?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Téléphone :</span>
                    <span className="font-mono font-bold text-[#0F172A]">{formData.phone || unverifiedUserToActivate?.phone}</span>
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
                  <span className="font-bold text-[#0F172A]">{formData.name || unverifiedUserToActivate?.name}</span>
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
                        <div className="flex items-start justify-between gap-2">
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
