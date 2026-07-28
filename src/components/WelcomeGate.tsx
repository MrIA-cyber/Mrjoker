import React, { useState } from 'react';
import { User, Neighborhood } from '../types';
import { BAFOUSSAM_NEIGHBORHOODS } from '../data/mockData';
import { Check, ShieldCheck, HelpCircle, Phone, ArrowRight, Loader2, Sparkles, MapPin, Mail, User as UserIcon, Lock, Globe, AlertCircle, Clock, Eye, EyeOff, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../translations';
import SupportPhoneNumber from './SupportPhoneNumber';

interface WelcomeGateProps {
  onSuccess: (user: User) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

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

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [gpsDetails, setGpsDetails] = useState<{ latitude?: number; longitude?: number; distance?: number } | null>(null);
  const [showBypassOption, setShowBypassOption] = useState(false);

  const [paymentOperator, setPaymentOperator] = useState<'momo' | 'orange' | null>(null);
  const [phoneForPayment, setPhoneForPayment] = useState('');
  const [step, setStep] = useState<'form' | 'login' | 'searching-subscription' | 'otp-verification' | 'payment-select' | 'processing' | 'ussd-prompt' | 'success'>('form');
  const [pin, setPin] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [validationError, setValidationError] = useState('');
  
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

  // Rate limiting & user verification states
  const [failedLoginCount, setFailedLoginCount] = useState(0);
  const [loginLockoutEndTime, setLoginLockoutEndTime] = useState<number | null>(null);
  const [remainingLockoutSeconds, setRemainingLockoutSeconds] = useState(0);
  const [unregisteredError, setUnregisteredError] = useState(false);
  const [unverifiedError, setUnverifiedError] = useState(false);

  // Countdown timer for OTP resend (60 seconds)
  React.useEffect(() => {
    if (step !== 'otp-verification') return;
    if (otpCountdown <= 0) return;

    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, otpCountdown]);

  // Countdown timer for lockout
  React.useEffect(() => {
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

  // Seed registered users list if empty
  React.useEffect(() => {
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if lockout is active
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
        
        // Find matching user by phone number
        const matchedUser = savedUsers.find(u => {
          const uClean = u.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
          return uClean === cleanInputPhone || 
                 (cleanInputPhone.length >= 8 && uClean.endsWith(cleanInputPhone)) ||
                 (uClean.length >= 8 && cleanInputPhone.endsWith(uClean));
        });

        if (!matchedUser) {
          // 1. Phone number does NOT exist in database!
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

        // 2. Phone exists, check if account phone is verified
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

        // 3. Check password
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

        // 4. Everything valid -> Log in user!
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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFormPhone = formData.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    const cleanEmail = formData.email.trim().toLowerCase();

    // Mandatory fields check
    if (!formData.name.trim() || !cleanEmail || !cleanFormPhone || !formData.password || !formData.confirmPassword) {
      setValidationError(getTranslation('fillRequiredFields'));
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setValidationError(lang === 'fr' ? 'Veuillez entrer une adresse e-mail valide.' : 'Please enter a valid email address.');
      return;
    }

    // Valid phone format check (at least 9 digits)
    if (cleanFormPhone.length < 9) {
      setValidationError(getTranslation('invalidPhoneError'));
      return;
    }

    // Password minimum 8 characters check
    if (formData.password.length < 8) {
      setValidationError(getTranslation('passwordMinLengthError'));
      return;
    }

    // Password confirmation match check
    if (formData.password !== formData.confirmPassword) {
      setValidationError(getTranslation('passwordsMismatchError'));
      return;
    }

    // Check existing accounts in database
    try {
      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

      // Check duplicate phone
      const phoneExists = savedUsers.some(
        u => {
          const uClean = u.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
          return uClean === cleanFormPhone || 
                 (cleanFormPhone.length >= 8 && uClean.endsWith(cleanFormPhone)) ||
                 (uClean.length >= 8 && cleanFormPhone.endsWith(uClean));
        }
      );
      if (phoneExists) {
        setValidationError(getTranslation('phoneAlreadyRegistered'));
        return;
      }

      // Check duplicate email
      const emailExists = savedUsers.some(
        u => u.email.trim().toLowerCase() === cleanEmail
      );
      if (emailExists) {
        setValidationError(getTranslation('emailAlreadyRegistered'));
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setValidationError('');
    setShowBypassOption(false);
    setGpsDetails(null);
    setIsVerifyingLocation(true);

    const proceedWithOtp = () => {
      setIsVerifyingLocation(false);
      // Generate automatic 6-digit OTP code sent by SMS
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setInputOtp('');
      setOtpCountdown(60);
      setStep('otp-verification');
    };

    // Real GPS Geolocation Check
    if (!navigator.geolocation) {
      setIsVerifyingLocation(false);
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
          setValidationError(getTranslation('outsideWestRegion', { dist: dist.toFixed(1) }));
          setShowBypassOption(true);
        }
      },
      (error) => {
        setIsVerifyingLocation(false);
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
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOtp !== generatedOtp) {
      setValidationError(getTranslation('incorrectCode'));
      return;
    }
    setValidationError('');
    setPhoneForPayment(formData.phone || (unverifiedUserToActivate ? unverifiedUserToActivate.phone : ''));
    setStep('payment-select');
  };

  const handleResendOtp = () => {
    if (otpCountdown > 0) return;
    setIsOtpResending(true);
    setValidationError('');
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setInputOtp('');
      setOtpCountdown(60);
      setIsOtpResending(false);
    }, 1000);
  };

  const handleSelectOperator = (op: 'momo' | 'orange') => {
    setPaymentOperator(op);
    setStep('processing');
    
    // Simulate sending payment request
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

    // Simulate final validation
    setTimeout(() => {
      const ref = `TX-${paymentOperator === 'momo' ? 'MOMO' : 'OM'}-${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionRef(ref);
      setStep('success');
    }, 2000);
  };

  const handleFinish = () => {
    const today = new Date();
    const trialDays = 5; // Default client trial
    const trialExpiry = new Date();
    trialExpiry.setDate(today.getDate() + trialDays);

    const expiry = new Date();
    expiry.setMonth(today.getMonth() + 3); // 3 months subscription validity

    const newUser: User = unverifiedUserToActivate ? {
      ...unverifiedUserToActivate,
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
      accountType: 'client',
      trialStartDate: today.toISOString(),
      trialExpiryDate: trialExpiry.toISOString(),
      isInTrial: true,
      hasCompletedTrial: false,
      isSubscribed: true,
      subscriptionPlan: 'client',
      subscriptionDuration: 'monthly',
      subscriptionDate: today.toISOString().split('T')[0],
      subscriptionExpiryDate: expiry.toISOString().split('T')[0],
      hasPaidFee: true,
      neighborhoodId: formData.neighborhood,
    };

    // Save newly registered user to lists
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 flex items-center justify-center p-4 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden" id="welcome-gate-container">
      {/* Background Decorative Orbs matching official palette */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4F46E5]/25 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#2563EB]/25 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-20"></div>
      
      <div className="w-full max-w-xl bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10 transition-shadow hover:shadow-indigo-500/10 duration-300">
        
        {/* Floating Language Selector at the top right of the card */}
        <div className="absolute top-5 right-6 z-20 flex gap-2 items-center">
          <button
            type="button"
            onClick={() => onLangChange(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{lang === 'fr' ? 'EN' : 'FR'}</span>
          </button>
        </div>

        {/* Banner with sleek deep violet to electric blue to emerald gradient */}
        <div className="h-3 bg-gradient-to-r from-[#4F46E5] via-[#2563EB] to-[#10B981]"></div>

        <div className="p-8">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6" id="logo-header">
            <div className="relative mb-3">
              {/* Outer soft glow ring */}
              <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-md scale-110"></div>
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-50 to-white rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm relative z-10 hover:scale-105 transition-transform duration-300 p-2">
                <img src="/logo-bafoussam-market.svg" alt="Bafoussam Market Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Live Operational Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60 mb-3 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{getTranslation('deliveryActiveBadge')}</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-display">
              Bafoussam <span className="bg-gradient-to-r from-[#4F46E5] to-[#2563EB] bg-clip-text text-transparent">Market</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">
              {getTranslation('taglineWelcome')}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div
                key="form-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleNextStep} className="space-y-4">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {getTranslation('fullNameLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <UserIcon className="h-4.5 w-4.5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Jean Kamdem"
                        className="w-full pl-10 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-950 text-sm transition focus:bg-white"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                        {formData.name.trim().length >= 2 ? (
                          <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : formData.name.length > 0 ? (
                          <span className="text-red-500 font-bold text-xs flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200/60">
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        {getTranslation('emailAddressLabel')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="h-4.5 w-4.5 text-slate-400" />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="jean.kamdem@mail.com"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-950 text-sm transition focus:bg-white"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) ? (
                            <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : formData.email.length > 0 ? (
                            <span className="text-red-500 font-bold text-xs flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200/60">
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        {getTranslation('phoneNumberLabel')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone className="h-4.5 w-4.5 text-slate-400" />
                        </div>
                        <input
                          type="tel"
                          required
                          placeholder="Ex: 677894512"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-950 text-sm transition focus:bg-white font-mono"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          {formData.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '').length >= 9 ? (
                            <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : formData.phone.length > 0 ? (
                            <span className="text-red-500 font-bold text-xs flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200/60">
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        {getTranslation('passwordLabel')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="h-4.5 w-4.5 text-slate-400" />
                        </div>
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          required
                          minLength={8}
                          placeholder={getTranslation('passwordPlaceholder')}
                          className="w-full pl-10 pr-20 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-950 text-sm transition focus:bg-white font-mono"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                          {formData.password.length >= 8 ? (
                            <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60 pointer-events-none">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : formData.password.length > 0 ? (
                            <span className="text-red-500 font-bold text-xs flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200/60 pointer-events-none">
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                          >
                            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {formData.password.length > 0 && formData.password.length < 8 && (
                        <span className="text-[10px] text-red-500 font-semibold mt-1 block">
                          {getTranslation('passwordMinLengthError')}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        {getTranslation('confirmPasswordLabel')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="h-4.5 w-4.5 text-slate-400" />
                        </div>
                        <input
                          type={showRegisterConfirmPassword ? "text" : "password"}
                          required
                          minLength={8}
                          placeholder={getTranslation('confirmPasswordLabel')}
                          className="w-full pl-10 pr-20 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-950 text-sm transition focus:bg-white font-mono"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                          {formData.confirmPassword.length >= 8 && formData.confirmPassword === formData.password ? (
                            <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60 pointer-events-none">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : formData.confirmPassword.length > 0 ? (
                            <span className="text-red-500 font-bold text-xs flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200/60 pointer-events-none">
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                          >
                            {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {formData.confirmPassword.length > 0 && formData.confirmPassword !== formData.password && (
                        <span className="text-[10px] text-red-500 font-semibold mt-1 block">
                          {getTranslation('passwordsMismatchError')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quartier */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{getTranslation('yourNeighborhoodLabel')} <span className="text-red-500">*</span></label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MapPin className="h-4.5 w-4.5 text-slate-400" />
                      </div>
                      <select
                        className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-950 text-sm transition focus:bg-white appearance-none cursor-pointer"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      >
                        {BAFOUSSAM_NEIGHBORHOODS.map((nh) => (
                          <option key={nh.id} value={nh.id}>
                            {nh.name} ({getTranslation('deliveryTimeInMinutes', { minutes: nh.estMinutes })})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {validationError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-xs font-semibold p-3.5 bg-red-50/90 border border-red-200 rounded-xl space-y-1 flex items-start gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p>{validationError}</p>
                        {gpsDetails?.distance !== undefined && (
                          <p className="text-[10px] text-red-500 font-normal font-mono mt-1">
                            Détails : Distance calculée de {gpsDetails.distance.toFixed(1)} km (Limitation de rayon de couverture de {rayonMaxKm} km). Position détectée : Lat {gpsDetails.latitude?.toFixed(4)}, Lng {gpsDetails.longitude?.toFixed(4)}.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {showBypassOption && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 mt-2">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 text-lg">💡</span>
                        <div>
                          <p className="text-amber-900 font-bold text-xs">{getTranslation('manualBypassTitle')}</p>
                          <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                            {getTranslation('manualBypassDesc')}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setValidationError('');
                          setShowBypassOption(false);
                          
                          // Proceed with 6-digit OTP verification bypass
                          const code = Math.floor(100000 + Math.random() * 900000).toString();
                          setGeneratedOtp(code);
                          setInputOtp('');
                          setOtpCountdown(60);
                          setStep('otp-verification');
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{getTranslation('manualBypassBtn')}</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingLocation}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm mt-6"
                    id="btn-submit-registration"
                  >
                    {isVerifyingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'fr' ? 'Vérification de la position (GPS)...' : 'Verifying location (GPS)...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{getTranslation('unlockAccessBtn')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-relaxed max-w-sm mx-auto">
                    {getTranslation('unlockAccessHint')}
                  </p>
                </form>

                <div className="mt-5 text-center">
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
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      {getTranslation('loginHere')}
                    </button>
                  </p>
                </div>

                <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{getTranslation('securedConnection')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
                    <SupportPhoneNumber prefix={lang === 'fr' ? 'Support Bafoussam :' : 'Bafoussam Support :'} className="text-xs" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'otp-verification' && (
              <motion.div
                key="otp-verification-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* Simulated SMS Toast notification alert */}
                <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 mb-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 animate-pulse"></div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl animate-bounce">📱</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">{getTranslation('smsNotification')}</span>
                        <span className="text-[9px] text-slate-400">{getTranslation('smsJustNow')}</span>
                      </div>
                      <p className="text-xs text-slate-100 font-mono mt-1 font-semibold">
                        {lang === 'fr' ? 'Votre code OTP Bafoussam Market à 6 chiffres est : ' : 'Your 6-digit Bafoussam Market OTP is: '}
                        <span className="text-yellow-400 text-sm font-black underline decoration-2 tracking-widest">{generatedOtp}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="font-extrabold text-slate-900 text-base">{getTranslation('securityVerification')}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {lang === 'fr' 
                      ? `Un code OTP à 6 chiffres a été envoyé par SMS au `
                      : `A 6-digit OTP code was sent via SMS to `}
                    <span className="font-mono text-indigo-600 font-extrabold">{formData.phone || unverifiedUserToActivate?.phone}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
                      {lang === 'fr' ? 'Saisissez le code OTP (6 chiffres)' : 'Enter OTP code (6 digits)'}
                    </label>
                    <div className="max-w-[240px] mx-auto">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="000000"
                        className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-950 transition"
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>

                  {validationError && (
                    <div className="text-red-600 text-xs font-semibold p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                      {validationError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError('');
                        setStep('form');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs cursor-pointer transition text-center"
                    >
                      {lang === 'fr' ? 'Retour' : 'Back'}
                    </button>
                    
                    <button
                      type="button"
                      disabled={isOtpResending || otpCountdown > 0}
                      onClick={handleResendOtp}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold py-3 px-4 rounded-xl text-xs cursor-pointer transition text-center border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isOtpResending ? (
                        lang === 'fr' ? 'Génération...' : 'Generating...'
                      ) : otpCountdown > 0 ? (
                        `${getTranslation('resendCodeBtn')} (${otpCountdown}s)`
                      ) : (
                        getTranslation('resendCodeBtn')
                      )}
                    </button>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-sm flex-1"
                    >
                      <span>{getTranslation('validateNumBtn')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{lang === 'fr' ? 'Numéro vérifié' : 'Number verified'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
                    <SupportPhoneNumber prefix={`${getTranslation('needHelp')} :`} className="text-xs" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'login' && (
              <motion.div
                key="login-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-4 mb-6 text-slate-800 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 bg-indigo-100 text-indigo-800 rounded-lg mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-indigo-900 mb-0.5">{getTranslation('subscriberLoginArea')}</p>
                      <p className="text-slate-600 leading-relaxed">
                        {getTranslation('subscriberLoginDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {getTranslation('registeredPhoneLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-4.5 w-4.5 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 677894512 ou 690000000"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-950 text-sm transition font-mono focus:bg-white"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {getTranslation('passwordLabel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4.5 w-4.5 text-slate-400" />
                      </div>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        placeholder={getTranslation('loginPasswordPlaceholder')}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-950 text-sm transition font-mono focus:bg-white"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {validationError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                        loginLockoutEndTime || remainingLockoutSeconds > 0
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-red-50 border-red-200 text-red-900'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {loginLockoutEndTime || remainingLockoutSeconds > 0 ? (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-bold leading-relaxed">
                            {validationError}
                            {(loginLockoutEndTime || remainingLockoutSeconds > 0) && remainingLockoutSeconds > 0 && (
                              <span className="block font-mono text-[11px] font-semibold text-amber-700 mt-1">
                                {lang === 'fr' ? `Veuillez patienter ${remainingLockoutSeconds}s...` : `Please wait ${remainingLockoutSeconds}s...`}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {unregisteredError && (
                        <div className="pt-2.5 border-t border-red-200/80 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-red-700 font-medium">
                            {lang === 'fr' ? "Nouveau sur Bafoussam Market ?" : "New to Bafoussam Market?"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setValidationError('');
                              setUnregisteredError(false);
                              setUnverifiedError(false);
                              setFormData(prev => ({ ...prev, phone: loginPhone }));
                              setStep('form');
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] transition shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            <span>{lang === 'fr' ? "S'inscrire maintenant" : "Register Now"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {unverifiedError && (
                        <div className="pt-2.5 border-t border-red-200/80 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-red-700 font-medium">
                            {lang === 'fr' ? "Confirmer votre numéro par SMS" : "Verify your number via SMS"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setValidationError('');
                              setUnverifiedError(false);
                              const code = Math.floor(100000 + Math.random() * 900000).toString();
                              setGeneratedOtp(code);
                              setInputOtp('');
                              setOtpCountdown(60);
                              setStep('otp-verification');
                            }}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] transition shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            <span>{lang === 'fr' ? "Renvoyer l'OTP" : "Resend OTP"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError('');
                        setUnregisteredError(false);
                        setUnverifiedError(false);
                        setStep('form');
                      }}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold py-3 px-4 rounded-xl text-xs cursor-pointer transition border border-slate-200 text-center"
                    >
                      {getTranslation('backToRegister')}
                    </button>
                    <button
                      type="submit"
                      disabled={Boolean(loginLockoutEndTime && remainingLockoutSeconds > 0)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                      id="btn-submit-login"
                    >
                      {remainingLockoutSeconds > 0 ? (
                        <span>{lang === 'fr' ? `Bloqué (${remainingLockoutSeconds}s)` : `Locked (${remainingLockoutSeconds}s)`}</span>
                      ) : (
                        <>
                          <span>{getTranslation('loginBtnWelcome')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{lang === 'fr' ? 'Connexion Cryptée' : 'Encrypted Connection'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
                    <SupportPhoneNumber prefix={lang === 'fr' ? 'Assistance :' : 'Assistance:'} className="text-xs" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'searching-subscription' && (
              <motion.div
                key="searching-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h3 className="font-bold text-slate-900 text-lg">{getTranslation('searchingSubscription')}</h3>
                <p className="text-sm text-slate-500 text-center max-w-sm mt-1">
                  {getTranslation('searchingSubscriptionDesc', { phone: `<span className="font-mono text-indigo-600 font-bold">${loginPhone}</span>` }).split('<span')[0]}
                  <span className="font-mono text-indigo-600 font-bold">{loginPhone}</span>
                  {getTranslation('searchingSubscriptionDesc', { phone: loginPhone }).split(loginPhone)[1]}
                </p>
              </motion.div>
            )}

            {step === 'payment-select' && (
              <motion.div
                key="payment-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">{getTranslation('chooseMobilePayment')}</h3>
                <p className="text-sm text-slate-500 mb-6">
                  {getTranslation('paymentInstructions')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* MTN MoMo */}
                  <button
                    onClick={() => handleSelectOperator('momo')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 rounded-2xl cursor-pointer transition group"
                  >
                    <div className="w-14 h-14 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-extrabold text-lg mb-3 shadow-sm group-hover:scale-105 transition">
                      MTN
                    </div>
                    <span className="font-bold text-slate-900 text-sm">MTN Mobile Money</span>
                    <span className="text-xs text-slate-400 mt-1">{lang === 'fr' ? 'Opérateur réseau MTN' : 'MTN network operator'}</span>
                  </button>

                  {/* Orange Money */}
                  <button
                    onClick={() => handleSelectOperator('orange')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 rounded-2xl cursor-pointer transition group"
                  >
                    <div className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center font-extrabold text-lg mb-3 shadow-sm group-hover:scale-105 transition">
                      OM
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Orange Money</span>
                    <span className="text-xs text-slate-400 mt-1">{lang === 'fr' ? 'Opérateur réseau Orange' : 'Orange network operator'}</span>
                  </button>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setStep('form')}
                    className="text-sm text-slate-500 hover:text-slate-950 underline cursor-pointer"
                  >
                    {getTranslation('backToRegister')}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h3 className="font-bold text-slate-900 text-lg">{getTranslation('processingPayment')}</h3>
                <p className="text-sm text-slate-500 text-center max-w-sm mt-1">
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
                className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl relative border border-slate-800"
              >
                {/* Simulated USSD Prompt Title */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                      {paymentOperator === 'momo' ? 'MTN MOBILE MONEY' : 'ORANGE MONEY CAMEROUN'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">USSD PUSH SIMULATOR</span>
                </div>

                <p className="text-sm leading-relaxed mb-5 text-slate-100">
                  {lang === 'fr' 
                    ? `Une notification de validation de débit a été envoyée au ${phoneForPayment}.` 
                    : `A debit validation notification has been sent to ${phoneForPayment}.`}
                  <br />
                  <span className="text-xs text-slate-400 mt-2 block">
                    {getTranslation('pinDescription')}
                  </span>
                </p>

                <form onSubmit={handleConfirmPIN} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      maxLength={4}
                      pattern="\d{4}"
                      placeholder="****"
                      required
                      autoFocus
                      className="w-full text-center tracking-[1.5em] font-mono text-2xl bg-slate-950 border border-slate-800 rounded-xl py-3 text-indigo-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  {validationError && (
                    <div className="text-red-400 text-xs text-center font-medium bg-red-950/40 border border-red-1000/50 py-2 rounded-lg">
                      {validationError}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep('payment-select')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm py-3 px-4 rounded-xl cursor-pointer transition flex items-center justify-center text-center"
                    >
                      {getTranslation('cancel') || (lang === 'fr' ? 'Annuler' : 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 font-bold text-sm py-3 px-4 rounded-xl cursor-pointer transition text-white shadow-md flex items-center justify-center text-center ${
                        paymentOperator === 'orange'
                          ? 'bg-orange-600 hover:bg-orange-500 active:bg-orange-700'
                          : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700'
                      }`}
                    >
                      {getTranslation('confirm') || (lang === 'fr' ? 'Confirmer' : 'Confirm')}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <h3 className="text-xl font-bold text-slate-900">{getTranslation('welcomeTitle')}</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                  {getTranslation('paymentApprovedDesc')}
                </p>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left my-6 space-y-2.5 text-xs max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{getTranslation('subscriberLabel')}</span>
                    <span className="font-semibold text-slate-800">{formData.name || unverifiedUserToActivate?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{getTranslation('accessDurationLabel')}</span>
                    <span className="font-semibold text-emerald-600">{getTranslation('monthsValidity')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{getTranslation('expiryDateLabel')}</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-2 text-slate-500">
                    <span>{getTranslation('referenceLabel')}</span>
                    <span className="font-mono">{transactionRef}</span>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base py-3.5 px-6 rounded-xl cursor-pointer transition shadow-md flex items-center justify-center gap-2 text-center"
                  id="btn-finish-payment-welcome"
                >
                  <span>{getTranslation('enterStoreBtn') || getTranslation('enterShopBtn') || (lang === 'fr' ? 'Entrer dans la boutique' : 'Enter the store')}</span>
                  <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
