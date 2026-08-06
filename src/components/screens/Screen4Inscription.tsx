import React, { useState, useMemo } from 'react';
import { 
  User as UserIcon, Mail, Phone, Lock, Check, ShieldCheck, ArrowRight, Sparkles, 
  Store, Building2, Wrench, ChevronRight, X, AlertCircle, Loader2, CheckCircle2, Globe, Eye, EyeOff, ArrowLeft, RefreshCw, Smartphone, Truck, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';
import { getFrenchAuthErrorMessage } from '../../utils/firebaseErrors';
import { AfriNovaLogo } from '../AfriNovaLogo';
import PhoneCountryInput from '../PhoneCountryInput';
import { Country } from '../../data/countries';
import { 
  checkAccountUniqueness, 
  normalizePhoneNumber, 
  normalizeEmail, 
  PHONE_DUPLICATE_ERROR_MSG, 
  EMAIL_DUPLICATE_ERROR_MSG 
} from '../../utils/accountValidation';
import { AccountType } from '../../types';

interface Screen4InscriptionProps {
  onSignupSuccess?: (data?: any) => void;
  onGoToLogin?: () => void;
  lang?: 'fr' | 'en';
  onLangChange?: (lang: 'fr' | 'en') => void;
}

export type ProfileType = AccountType;

export interface ProfileOption {
  id: ProfileType;
  title: string;
  emoji: string;
  icon: any;
  description: string;
  trialDays: number;
  formattedTrial: string;
  badge: string;
  benefits: string[];
}

export const PROFILE_OPTIONS: ProfileOption[] = [
  {
    id: 'client',
    title: 'Client',
    emoji: '👤',
    icon: UserIcon,
    description: "J'achète des produits et bénéficie des meilleurs services disponibles dans mon pays grâce à AfriNova.",
    trialDays: 365,
    formattedTrial: "Gratuit à vie",
    badge: 'Particulier',
    benefits: [
      'Accès 100% GRATUIT & Sans engagement à vie',
      'Accès complet au marché national & régional',
      'Paiement & livraison sécurisés'
    ]
  },
  {
    id: 'vendeur',
    title: 'Vendeur',
    emoji: '🛒',
    icon: Store,
    description: "Je vends mes produits et gère ma boutique en ligne sur AfriNova.",
    trialDays: 10,
    formattedTrial: "10 jours d'essai gratuit",
    badge: 'Boutique',
    benefits: [
      "10 jours d'essai gratuit offert",
      'Boutique virtuelle personnalisée',
      'Gestion simplifiée des stocks & commandes'
    ]
  },
  {
    id: 'entreprise',
    title: 'Entreprise',
    emoji: '🏢',
    icon: Building2,
    description: "Je représente une entreprise, PME ou marque et développe mon réseau B2B.",
    trialDays: 10,
    formattedTrial: "10 jours d'essai gratuit",
    badge: 'Pro & B2B',
    benefits: [
      "10 jours d'essai gratuit offert",
      'Offres de marché & devis B2B',
      'Gestion d\'équipe & rapports PDF'
    ]
  },
  {
    id: 'prestataire',
    title: 'Prestataire',
    emoji: '🔧',
    icon: Wrench,
    description: "Je propose mes compétences et services professionnels aux clients.",
    trialDays: 10,
    formattedTrial: "10 jours d'essai gratuit",
    badge: 'Services 24/7',
    benefits: [
      "10 jours d'essai gratuit offert",
      'Mise en relation directe avec les clients',
      'Paiement garanti après réalisation'
    ]
  },
  {
    id: 'livreur',
    title: 'Livreur',
    emoji: '🚚',
    icon: Truck,
    description: "Je livre des colis, repas et commandes express en toute rapidité.",
    trialDays: 10,
    formattedTrial: "10 jours d'essai gratuit",
    badge: 'Coursier Express',
    benefits: [
      "10 jours d'essai gratuit offert",
      'Missions de livraison géolocalisées',
      'Retrait des gains MoMo direct'
    ]
  }
];

export default function Screen4Inscription({ onSignupSuccess, onGoToLogin, lang = 'fr', onLangChange }: Screen4InscriptionProps) {
  const [currentLang, setCurrentLang] = useState<'fr' | 'en'>(lang);

  const toggleLanguage = () => {
    const nextLang = currentLang === 'fr' ? 'en' : 'fr';
    setCurrentLang(nextLang);
    if (onLangChange) onLangChange(nextLang);
  };

  // Step 1 ('step1' - Informations) or Step 2 ('step2' - Vérification et sécurité) or Success
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'success'>('step1');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    otpCode: '',
    password: '',
    confirmPassword: '',
  });

  // Track touched fields for instant inline validation
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile selection state (default 'client')
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>('client');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // OTP Simulation state
  const [simulatedOtp, setSimulatedOtp] = useState('123456');
  const [otpResent, setOtpResent] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const selectedProfileObj = useMemo(() => PROFILE_OPTIONS.find(p => p.id === selectedProfile) || PROFILE_OPTIONS[0], [selectedProfile]);

  // Real-time Field Validations
  const isFullNameValid = formData.fullName.trim().length >= 2;
  const isPhoneValid = formData.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '').length >= 8;
  const isEmailValid = !formData.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()); // Email is optional
  const isOtpValid = formData.otpCode.trim().length >= 4;
  const isPasswordValid = formData.password.length >= 8;
  const isConfirmPasswordValid = formData.confirmPassword.length >= 8 && formData.confirmPassword === formData.password;

  // Step 1 and Step 2 Overall Form Validity
  const isStep1FormValid = isFullNameValid && isPhoneValid;
  const isStep2FormValid = isOtpValid && isPasswordValid && isConfirmPasswordValid && isEmailValid;

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200', textColor: 'text-slate-400' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 1) return { score: 1, label: currentLang === 'fr' ? '🔴 Faible' : '🔴 Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score === 2) return { score: 2, label: currentLang === 'fr' ? '🟠 Moyen' : '🟠 Medium', color: 'bg-amber-500', textColor: 'text-amber-500' };
    return { score: 3, label: currentLang === 'fr' ? '🟢 Fort' : '🟢 Strong', color: 'bg-[#16A34A]', textColor: 'text-[#16A34A]' };
  }, [formData.password, currentLang]);

  const markFieldTouched = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  // Step 1 -> Step 2 Handler
  const handleProceedToStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedFields({ fullName: true, phone: true });

    if (!isFullNameValid) {
      setFormError(currentLang === 'fr' ? 'Veuillez entrer votre nom complet (au moins 2 caractères).' : 'Please enter your full name (at least 2 characters).');
      return;
    }

    if (!isPhoneValid) {
      setFormError(currentLang === 'fr' ? 'Veuillez entrer un numéro de téléphone valide (ex: 677 89 45 12).' : 'Please enter a valid phone number.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const dialCode = selectedCountry?.dialCode || '+237';

    // 1. Client-Side Phone Uniqueness Check
    try {
      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      const savedUsers: Array<{ phone?: string; email?: string }> = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

      const clientCheck = checkAccountUniqueness(formData.phone, undefined, savedUsers, dialCode);
      if (clientCheck.isPhoneDuplicate) {
        setIsSubmitting(false);
        setFormError(PHONE_DUPLICATE_ERROR_MSG);
        return;
      }
    } catch (err) {
      console.error('Error in client uniqueness check:', err);
    }

    // 2. Server-Side Phone Uniqueness Check
    try {
      const res = await fetch('/api/auth/check-uniqueness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, dialCode })
      });

      if (!res.ok) {
        const data = await res.json();
        setIsSubmitting(false);
        setFormError(data.message || PHONE_DUPLICATE_ERROR_MSG);
        return;
      }
    } catch (err) {
      console.warn('Server check offline or unavailable, client validation passed:', err);
    }

    setIsSubmitting(false);
    setCurrentStep('step2');
    setFormData(prev => ({ ...prev, otpCode: '123456' }));
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) {}
  };

  // Resend OTP
  const handleResendOtp = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(newCode);
    setFormData(prev => ({ ...prev, otpCode: newCode }));
    setOtpResent(true);
    setTimeout(() => setOtpResent(false), 3000);
  };

  // Final Signup Submission
  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedFields({ otpCode: true, password: true, confirmPassword: true, email: true });

    if (!isOtpValid) {
      setFormError(currentLang === 'fr' ? 'Veuillez saisir le code de vérification reçu par SMS.' : 'Please enter the verification code received via SMS.');
      return;
    }

    if (formData.email.trim() && !isEmailValid) {
      setFormError(currentLang === 'fr' ? 'Veuillez entrer une adresse e-mail valide.' : 'Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setFormError(currentLang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.');
      return;
    }

    if (!isConfirmPasswordValid) {
      setFormError(currentLang === 'fr' ? 'La confirmation du mot de passe ne correspond pas.' : 'Password confirmation does not match.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const dialCode = selectedCountry?.dialCode || '+237';

    // 1. Client-Side Check for BOTH Phone and Email Uniqueness
    try {
      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      const savedUsers: Array<{ phone?: string; email?: string }> = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

      const clientCheck = checkAccountUniqueness(formData.phone, formData.email, savedUsers, dialCode);
      if (clientCheck.isPhoneDuplicate || clientCheck.isEmailDuplicate) {
        setIsSubmitting(false);
        setFormError(clientCheck.errorMessage || PHONE_DUPLICATE_ERROR_MSG);
        return;
      }
    } catch (err) {
      console.error('Error in final client uniqueness check:', err);
    }

    // 2. Server-Side Registration with Strict Server Uniqueness Check
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          profile: selectedProfile,
          accountType: selectedProfile,
          password: formData.password,
          dialCode
        })
      });

      if (!res.ok) {
        const data = await res.json();
        setIsSubmitting(false);
        setFormError(data.message || (data.isEmailDuplicate ? EMAIL_DUPLICATE_ERROR_MSG : PHONE_DUPLICATE_ERROR_MSG));
        return;
      }
    } catch (err) {
      console.warn('Server registration call offline, client check passed:', err);
    }

    const normalizedPhoneVal = normalizePhoneNumber(formData.phone, dialCode);
    const normalizedEmailVal = formData.email.trim() 
      ? normalizeEmail(formData.email) 
      : `${normalizedPhoneVal.replace(/[^0-9]/g, '')}@afrinova.cm`;

    // 3. Firebase Authentication Integration
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmailVal, formData.password);
      if (userCredential.user && formData.fullName.trim()) {
        await updateProfile(userCredential.user, {
          displayName: formData.fullName.trim()
        });
      }
    } catch (fbErr: any) {
      console.warn("Firebase Auth error during signup:", fbErr);
      // If error is email in use or password invalid, display Firebase error
      if (fbErr.code) {
        setIsSubmitting(false);
        setFormError(getFrenchAuthErrorMessage(fbErr));
        return;
      }
    }

    setIsSubmitting(false);

    const createdUserData = {
      name: formData.fullName.trim(),
      phone: normalizedPhoneVal,
      email: normalizedEmailVal,
      password: formData.password,
      profile: selectedProfile,
      accountType: selectedProfile,
      isSubscribed: true,
      trialStartDate: new Date().toISOString(),
    };

    if (onSignupSuccess) {
      onSignupSuccess(createdUserData);
    } else {
      setCurrentStep('success');
    }
  };

  const progressPercent = currentStep === 'step1' ? 50 : 100;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center px-2.5 sm:px-5 md:px-6 py-1.5 sm:py-3 font-sans overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 2. BACKGROUND: Premium ambient gradient with delicate African geometric texture */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-[#FAFAF9] via-[#F3F0FF]/50 to-[#ECFDF5]/70">
        {/* Soft emerald glowing spot top-left */}
        <div className="absolute -top-20 left-1/4 w-[420px] h-[420px] bg-[#16A34A]/10 rounded-full blur-3xl pointer-events-none" />
        {/* Soft violet glowing spot bottom-right */}
        <div className="absolute -bottom-20 right-1/4 w-[420px] h-[420px] bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle, ultra-clean African Geometric Motif Pattern SVG Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035] bg-repeat pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%3C16A34A' fill-opacity='1'%3E%3Cpath d='M30 30L15 15l15-15 15 15zM30 30l15 15-15 15-15-15zM0 30L15 15 30 30 15 45zM60 30L45 15 30 30 45 45z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Main Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-[650px] bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-[0_16px_50px_-15px_rgba(15,23,42,0.08)] border border-slate-200/90 overflow-hidden flex flex-col my-auto"
      >

        {/* 1. EN-TÊTE PREMIUM */}
        <div className="bg-white px-3.5 sm:px-5 md:px-6 pt-2.5 sm:pt-3 pb-2 border-b border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
            
            {/* Official Logo AfriNova */}
            <AfriNovaLogo size="md" showSlogan={true} lang={currentLang} />

            {/* Discrete Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#16A34A] border border-slate-200 hover:border-emerald-300 flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0 shadow-2xs min-h-[36px]"
              title="Changer de langue / Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
              <span className={currentLang === 'fr' ? 'text-[#16A34A] font-black' : 'text-slate-400'}>FR</span>
              <span className="text-slate-300 text-[10px]">|</span>
              <span className={currentLang === 'en' ? 'text-[#16A34A] font-black' : 'text-slate-400'}>EN</span>
            </button>
          </div>

          {/* 4. ANIMATED PROGRESS BAR */}
          {currentStep !== 'success' && (
            <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-0.5">
              <div className="flex items-center justify-between text-xs font-extrabold gap-2">
                <span className="text-slate-700 tracking-tight flex items-center gap-1.5 min-w-0">
                  <span className="text-[#16A34A] font-black shrink-0">
                    {currentStep === 'step1' 
                      ? (currentLang === 'fr' ? 'Étape 1/2' : 'Step 1/2') 
                      : (currentLang === 'fr' ? 'Étape 2/2' : 'Step 2/2')}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-semibold truncate">
                    {currentStep === 'step1' 
                      ? (currentLang === 'fr' ? 'Informations' : 'Personal Info') 
                      : (currentLang === 'fr' ? 'Sécurité SMS & Pass' : 'Security & Verification')}
                  </span>
                </span>
                <span className="font-mono text-[#16A34A] bg-[#DCFCE7] border border-emerald-300/80 px-2 py-0.5 rounded-full text-[10.5px] font-black shrink-0 whitespace-nowrap">
                  {progressPercent} %
                </span>
              </div>

              {/* Progress Line */}
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#7C3AED] rounded-full shadow-xs"
                  initial={{ width: '50%' }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* CARD BODY CONTENT */}
        <div className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-2.5">

          {/* Global Error Message */}
          {formError && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50/95 border border-red-300 text-red-800 p-2.5 sm:p-3 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-start gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
                <span className="leading-snug">{formError}</span>
              </div>
              {onGoToLogin && (formError.includes('connecter') || formError.includes('déjà utilisé')) && (
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black transition shrink-0 cursor-pointer shadow-2xs active:scale-95 min-h-[36px]"
                >
                  {currentLang === 'fr' ? 'Se connecter' : 'Log In'}
                </button>
              )}
            </motion.div>
          )}

          <AnimatePresence mode="wait">

            {/* 5. ÉTAPE 1: INFORMATIONS PERSONNELLES (Nom complet, Téléphone, Profil) */}
            {currentStep === 'step1' && (
              <motion.form
                key="step1-form"
                noValidate
                autoComplete="off"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onSubmit={handleProceedToStep2}
                className="space-y-2 sm:space-y-2.5"
              >
                {/* Champ 1: Nom complet */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                      {currentLang === 'fr' ? 'Nom complet' : 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    {isFullNameValid && (
                      <span className="text-[11px] font-extrabold text-[#16A34A] flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {currentLang === 'fr' ? 'Valide' : 'Valid'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="off"
                      value={formData.fullName}
                      onBlur={() => markFieldTouched('fullName')}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={currentLang === 'fr' ? 'Entrez votre nom complet' : 'Enter your full name'}
                      required
                      className={`w-full h-[48px] pl-10 pr-9 bg-[#F8FAFC] focus:bg-white border rounded-xl text-sm sm:text-base text-[#0F172A] font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400 ${
                        touchedFields.fullName && !isFullNameValid ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                      }`}
                    />
                    {isFullNameValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0 animate-in fade-in" />
                    )}
                  </div>
                  {touchedFields.fullName && !isFullNameValid && (
                    <p className="text-xs text-red-500 font-bold mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{currentLang === 'fr' ? 'Au moins 2 caractères requis' : 'At least 2 characters required'}</span>
                    </p>
                  )}
                </div>

                {/* Champ 2: Numéro de téléphone */}
                <div>
                  <PhoneCountryInput
                    id="signup-phone-input"
                    label={currentLang === 'fr' ? 'Numéro de téléphone' : 'Phone Number'}
                    required
                    value={formData.phone}
                    lang={currentLang}
                    placeholder={currentLang === 'fr' ? 'Entrez votre numéro de téléphone' : 'Enter your phone number'}
                    onBlur={() => markFieldTouched('phone')}
                    onChange={(fullNumber, isValid, country) => {
                      setFormData({ ...formData, phone: fullNumber });
                      if (country) setSelectedCountry(country);
                    }}
                  />
                </div>

                {/* Champ 3: Sélection du profil */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                      {currentLang === 'fr' ? 'Profil utilisateur' : 'User Profile'} <span className="text-red-500">*</span>
                    </label>
                  </div>

                  {/* Profile Selected Card - Compact & Ultra-sleek */}
                  <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-slate-50/70 border border-emerald-300/80 shadow-2xs relative overflow-hidden transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-[#16A34A] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
                          {selectedProfileObj.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-black text-[#0F172A] truncate">
                              {selectedProfileObj.title}
                            </h4>
                            <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded-full bg-white text-[#16A34A] border border-emerald-300/80 shrink-0 shadow-3xs whitespace-nowrap">
                              {selectedProfileObj.formattedTrial}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-tight truncate">
                            {selectedProfileObj.id === 'client'
                              ? (currentLang === 'fr' 
                                  ? `Achats & services au ${selectedCountry ? `${selectedCountry.flag} ${selectedCountry.nameFr}` : 'Cameroun'}`
                                  : `Shopping & services in ${selectedCountry ? `${selectedCountry.flag} ${selectedCountry.nameEn}` : 'Cameroon'}`
                                )
                              : selectedProfileObj.description
                            }
                          </p>
                        </div>
                      </div>

                      {/* Modifier Button */}
                      <button
                        type="button"
                        onClick={() => setIsProfileModalOpen(true)}
                        className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-100 text-[#16A34A] border border-emerald-300 text-[10.5px] font-bold transition shrink-0 cursor-pointer shadow-2xs active:scale-95"
                      >
                        {currentLang === 'fr' ? 'Modifier' : 'Modify'}
                      </button>
                    </div>

                    {/* Concise Benefits Display */}
                    <div className="pt-1.5 mt-1.5 border-t border-emerald-200/60 flex flex-wrap gap-1">
                      {selectedProfileObj.benefits.slice(0, 3).map((benefit, i) => (
                        <span key={i} className="text-[9.5px] sm:text-[10px] text-slate-700 bg-white/95 border border-emerald-200/80 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-3xs max-w-full">
                          <CheckCircle2 className="w-3 h-3 text-[#16A34A] shrink-0" />
                          <span className="leading-tight">{benefit}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bouton Principal Step 1: "Continuer" */}
                <div className="space-y-0.5 pt-0.5">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting || !isStep1FormValid}
                    className="relative w-full h-[48px] rounded-xl text-sm sm:text-base font-black bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#7C3AED] text-white shadow-[0_4px_16px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_22px_rgba(22,163,74,0.45)] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none group"
                  >
                    {/* Luminous sweep animation */}
                    <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                        <span>{currentLang === 'fr' ? 'Vérification...' : 'Checking...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{currentLang === 'fr' ? 'Continuer' : 'Continue'}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
                      </>
                    )}
                  </motion.button>
                  {!isStep1FormValid && (
                    <p className="text-[10px] font-semibold text-slate-400 text-center">
                      {currentLang === 'fr' ? 'Saisissez votre nom et téléphone pour continuer' : 'Enter your name and phone number to continue'}
                    </p>
                  )}
                </div>

                {/* 8. BADGES DE CONFIANCE - Ultra-Compact Single Row / Grid */}
                <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-1 text-[9.5px] sm:text-[10px] font-extrabold text-slate-600 items-stretch">
                  <div className="py-1 px-1 rounded-lg bg-slate-50/90 border border-slate-100 flex items-center justify-center gap-1 hover:bg-emerald-50/60 transition-all text-center h-full w-full min-h-[30px] sm:min-h-[32px]">
                    <Lock className="w-3 h-3 text-[#16A34A] shrink-0" />
                    <span className="leading-tight">{currentLang === 'fr' ? 'Données chiffrées' : 'Encrypted data'}</span>
                  </div>
                  <div className="py-1 px-1 rounded-lg bg-slate-50/90 border border-slate-100 flex items-center justify-center gap-1 hover:bg-emerald-50/60 transition-all text-center h-full w-full min-h-[30px] sm:min-h-[32px]">
                    <Smartphone className="w-3 h-3 text-[#16A34A] shrink-0" />
                    <span className="leading-tight">{currentLang === 'fr' ? 'Vérification auto' : 'Auto verification'}</span>
                  </div>
                  <div className="py-1 px-1 rounded-lg bg-slate-50/90 border border-slate-100 flex items-center justify-center gap-1 hover:bg-emerald-50/60 transition-all text-center h-full w-full min-h-[30px] sm:min-h-[32px]">
                    <ShieldCheck className="w-3 h-3 text-[#16A34A] shrink-0" />
                    <span className="leading-tight">{currentLang === 'fr' ? 'Anti-fraude' : 'Anti-fraud'}</span>
                  </div>
                  <div className="py-1 px-1 rounded-lg bg-slate-50/90 border border-slate-100 flex items-center justify-center gap-1 hover:bg-emerald-50/60 transition-all text-center h-full w-full min-h-[30px] sm:min-h-[32px]">
                    <Globe className="w-3 h-3 text-[#16A34A] shrink-0" />
                    <span className="leading-tight">{currentLang === 'fr' ? 'Toute l\'Afrique' : 'All of Africa'}</span>
                  </div>
                </div>

              </motion.form>
            )}

            {/* 5. ÉTAPE 2: VÉRIFICATION ET SÉCURITÉ (OTP, Email facultative, Mot de passe) */}
            {currentStep === 'step2' && (
              <motion.form
                key="step2-form"
                noValidate
                autoComplete="off"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onSubmit={handleFinalSignup}
                className="space-y-2 sm:space-y-2.5"
              >
                {/* Back to Step 1 Button */}
                <button
                  type="button"
                  onClick={() => setCurrentStep('step1')}
                  className="text-xs font-extrabold text-slate-500 hover:text-[#16A34A] flex items-center gap-1.5 transition cursor-pointer active:scale-95 mb-0.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{currentLang === 'fr' ? 'Retour aux informations' : 'Back to info'}</span>
                </button>

                {/* Smart OTP Verification Banner */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-300/90 text-xs text-[#0F172A] space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between font-bold text-[#15803D] flex-wrap gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>{currentLang === 'fr' ? 'Code SMS envoyé' : 'SMS Code sent'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-xs text-[#16A34A] font-extrabold underline hover:text-[#15803D] flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{currentLang === 'fr' ? 'Renvoyer le code' : 'Resend code'}</span>
                    </button>
                  </div>
                  <p className="text-slate-600 font-medium text-xs leading-relaxed">
                    {currentLang === 'fr' ? 'Code de test généré pour le' : 'Generated test code for'} <strong className="font-mono text-[#0F172A]">{formData.phone}</strong> : <strong className="font-mono text-sm text-[#16A34A] bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-3xs">{simulatedOtp}</strong>
                  </p>
                  {otpResent && (
                    <p className="text-xs font-bold text-[#16A34A] animate-pulse">
                      ✓ {currentLang === 'fr' ? 'Nouveau code envoyé par SMS !' : 'New SMS code dispatched!'}
                    </p>
                  )}
                </div>

                {/* Champ 1: Code OTP */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                      {currentLang === 'fr' ? 'Code de vérification SMS' : 'SMS Verification Code'} <span className="text-red-500">*</span>
                    </label>
                    {isOtpValid && (
                      <span className="text-[11px] font-extrabold text-[#16A34A] flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {currentLang === 'fr' ? 'Code vérifié' : 'Verified'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="off"
                      value={formData.otpCode}
                      onBlur={() => markFieldTouched('otpCode')}
                      onChange={(e) => setFormData({ ...formData, otpCode: e.target.value })}
                      placeholder={currentLang === 'fr' ? 'Entrez le code à 6 chiffres' : 'Enter 6-digit code'}
                      required
                      maxLength={6}
                      className={`w-full h-[48px] pl-10 pr-9 bg-[#F8FAFC] focus:bg-white border rounded-xl text-sm sm:text-base text-[#0F172A] font-mono font-bold tracking-widest shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400 ${
                        touchedFields.otpCode && !isOtpValid ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                      }`}
                    />
                    {isOtpValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0 animate-in fade-in" />
                    )}
                  </div>
                </div>

                {/* Champ 2: Adresse e-mail (FACULTATIVE) */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                      {currentLang === 'fr' ? 'Adresse e-mail' : 'Email Address'} <span className="text-slate-400 font-semibold lowercase text-xs">(facultative)</span>
                    </label>
                    {formData.email.trim() && isEmailValid && (
                      <span className="text-[11px] font-extrabold text-[#16A34A] flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {currentLang === 'fr' ? 'Valide' : 'Valid'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      autoComplete="off"
                      value={formData.email}
                      onBlur={() => markFieldTouched('email')}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={currentLang === 'fr' ? 'Entrez votre adresse e-mail' : 'Enter your email address'}
                      className="w-full h-[48px] pl-10 pr-9 bg-[#F8FAFC] focus:bg-white border border-slate-200 rounded-xl text-sm sm:text-base text-[#0F172A] font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Champ 3 & 4: Mot de passe & Confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {/* Mot de passe */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                        {currentLang === 'fr' ? 'Mot de passe' : 'Password'} <span className="text-red-500">*</span>
                      </label>
                      {formData.password && (
                        <span className={`text-[11px] font-extrabold ${passwordStrength.textColor}`}>
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="off"
                        value={formData.password}
                        onBlur={() => markFieldTouched('password')}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={currentLang === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
                        required
                        minLength={8}
                        className={`w-full h-[48px] pl-10 pr-10 bg-[#F8FAFC] focus:bg-white border rounded-xl text-sm sm:text-base text-[#0F172A] font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400 ${
                          touchedFields.password && !isPasswordValid ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#16A34A] transition-colors cursor-pointer min-h-[36px] flex items-center justify-center"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Visual Strength Meter */}
                    {formData.password.length > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                          <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                          <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'}`} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirmation */}
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                        {currentLang === 'fr' ? 'Confirmation' : 'Confirm'} <span className="text-red-500">*</span>
                      </label>
                      {isConfirmPasswordValid && (
                        <span className="text-[11px] font-extrabold text-[#16A34A] flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {currentLang === 'fr' ? 'Identique' : 'Match'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="off"
                        value={formData.confirmPassword}
                        onBlur={() => markFieldTouched('confirmPassword')}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder={currentLang === 'fr' ? 'Confirmez votre mot de passe' : 'Confirm your password'}
                        required
                        minLength={8}
                        className={`w-full h-[48px] pl-10 pr-10 bg-[#F8FAFC] focus:bg-white border rounded-xl text-sm sm:text-base text-[#0F172A] font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition-all duration-200 placeholder:text-slate-400 ${
                          touchedFields.confirmPassword && !isConfirmPasswordValid ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#16A34A] transition-colors cursor-pointer min-h-[36px] flex items-center justify-center"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bouton Principal Step 2: "Créer mon compte" with Glow */}
                <div className="space-y-0.5 pt-0.5">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting || !isStep2FormValid}
                    className="relative w-full h-[48px] rounded-xl text-sm sm:text-base font-black bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#7C3AED] text-white shadow-[0_4px_16px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_22px_rgba(22,163,74,0.45)] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none group"
                  >
                    <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                        <span>{currentLang === 'fr' ? 'Création de votre compte...' : 'Creating account...'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        <span>{currentLang === 'fr' ? 'Créer mon compte' : 'Create my account'}</span>
                      </>
                    )}
                  </motion.button>
                  {!isStep2FormValid && (
                    <p className="text-[10px] font-semibold text-slate-400 text-center">
                      {currentLang === 'fr' ? 'Saisissez le code SMS et un mot de passe valide (8+ car.)' : 'Fill in SMS code and a valid password (8+ chars)'}
                    </p>
                  )}
                </div>

                {/* 8. BADGES DE CONFIANCE - Ultra-Compact Grid */}
                <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-1 text-[9.5px] sm:text-[10px] font-extrabold text-slate-600 items-stretch">
                  <div className="py-1 px-1 rounded-lg bg-slate-50/90 border border-slate-100 flex items-center justify-center gap-1 hover:bg-emerald-50/60 transition-all text-center h-full w-full min-h-[30px] sm:min-h-[32px]">
                    <Lock className="w-3 h-3 text-[#16A34A] shrink-0" />
                    <span className="leading-tight">{currentLang === 'fr' ? 'Données chiffrées' : 'Encrypted data'}</span>
                  </div>
                  <div className="py-1 px-1 rounded-lg bg-slate-50/90 border border-slate-100 flex items-center justify-center gap-1 hover:bg-emerald-50/60 transition-all text-center h-full w-full min-h-[30px] sm:min-h-[32px]">
                    <Smartphone className="w-3 h-3 text-[#16A34A] shrink-0" />
                    <span className="leading-tight">{currentLang === 'fr' ? 'Vérification auto' : 'Auto verification'}</span>
                  </div>
                  <div className="py-1 px-1 rounded-lg bg-slate-50/90 border border-slate-100 flex items-center justify-center gap-1 hover:bg-emerald-50/60 transition-all text-center h-full w-full min-h-[30px] sm:min-h-[32px]">
                    <ShieldCheck className="w-3 h-3 text-[#16A34A] shrink-0" />
                    <span className="leading-tight">{currentLang === 'fr' ? 'Anti-fraude' : 'Anti-fraud'}</span>
                  </div>
                  <div className="py-1 px-1 rounded-lg bg-slate-50/90 border border-slate-100 flex items-center justify-center gap-1 hover:bg-emerald-50/60 transition-all text-center h-full w-full min-h-[30px] sm:min-h-[32px]">
                    <Globe className="w-3 h-3 text-[#16A34A] shrink-0" />
                    <span className="leading-tight">{currentLang === 'fr' ? 'Toute l\'Afrique' : 'All of Africa'}</span>
                  </div>
                </div>

              </motion.form>
            )}

            {/* STEP SUCCESS: Compte créé */}
            {currentStep === 'success' && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-5 space-y-3.5"
              >
                <div className="w-14 h-14 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-md">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-[#0F172A] font-display">
                  {currentLang === 'fr' ? 'Bienvenue sur AfriNova ! 🎉' : 'Welcome to AfriNova! 🎉'}
                </h3>

                <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                  {currentLang === 'fr'
                    ? 'Votre compte a été créé avec succès. Votre période d\'essai gratuit est activée.'
                    : 'Your account has been created successfully. Your free trial is active.'}
                </p>

                <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200 text-left text-xs space-y-1.5 max-w-xs mx-auto font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{currentLang === 'fr' ? 'Titulaire :' : 'Name:'}</span>
                    <span className="text-[#0F172A]">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{currentLang === 'fr' ? 'Profil :' : 'Profile:'}</span>
                    <span className="text-[#16A34A] font-bold">{selectedProfileObj.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{currentLang === 'fr' ? 'Essai gratuit :' : 'Free trial:'}</span>
                    <span className="text-emerald-700 font-bold">{selectedProfileObj.formattedTrial}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onSignupSuccess) {
                      onSignupSuccess({
                        name: formData.fullName,
                        phone: formData.phone,
                        email: formData.email,
                        profile: selectedProfile,
                        accountType: selectedProfile,
                        isSubscribed: true,
                        trialStartDate: new Date().toISOString(),
                      });
                    }
                  }}
                  className="w-full h-[48px] bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#7C3AED] text-white font-black text-sm sm:text-base rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>{currentLang === 'fr' ? 'Accéder à la plateforme' : 'Access platform'}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Footer Link to Login */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">
              {currentLang === 'fr' ? 'Vous avez déjà un compte ?' : 'Already have an account?'}{' '}
              <button 
                type="button"
                onClick={onGoToLogin}
                className="font-black text-[#16A34A] hover:text-[#15803D] hover:underline cursor-pointer active:scale-[0.98]"
              >
                {currentLang === 'fr' ? 'Se connecter' : 'Sign in'}
              </button>
            </p>
          </div>

        </div>
      </motion.div>

      {/* Profile Modal Bottom Sheet */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg sm:max-w-2xl bg-white rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-6 shadow-2xl border-t sm:border border-slate-200 max-h-[85vh] overflow-y-auto z-10"
            >
              {/* Handle Bar */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0F172A]">
                    {currentLang === 'fr' ? 'Choisissez votre profil' : 'Choose your profile'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {currentLang === 'fr' ? 'Sélectionnez le type de compte correspondant à votre activité.' : 'Select your account type.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Grid Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {PROFILE_OPTIONS.map((profile) => {
                  const isSelected = selectedProfile === profile.id;

                  return (
                    <div
                      key={profile.id}
                      onClick={() => {
                        setSelectedProfile(profile.id);
                        setIsProfileModalOpen(false);
                      }}
                      className={`p-4 rounded-2xl transition-all duration-200 cursor-pointer border flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-2 border-[#16A34A] shadow-xs'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-2xs ${
                        isSelected ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {profile.emoji}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                            <span>{profile.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#16A34A] border border-emerald-200">
                              {profile.badge}
                            </span>
                          </h4>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />}
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-snug">
                          {profile.id === 'client'
                            ? (currentLang === 'fr' 
                                ? `J'achète des produits et bénéficie des meilleurs services disponibles dans mon pays${selectedCountry ? ` (${selectedCountry.flag} ${selectedCountry.nameFr})` : ''} grâce à AfriNova.`
                                : `I buy products and enjoy the best services available in my country${selectedCountry ? ` (${selectedCountry.flag} ${selectedCountry.nameEn})` : ''} thanks to AfriNova.`
                              )
                            : profile.description
                          }
                        </p>

                        <div className="pt-1 flex items-center gap-1.5 text-xs text-[#16A34A] font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{profile.formattedTrial}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
