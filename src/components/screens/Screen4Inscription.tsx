import React, { useState, useEffect, useMemo } from 'react';
import { otpService } from '../../services/otpService';
import { 
  User as UserIcon, Mail, Phone, Lock, Check, ShieldCheck, ArrowRight, Sparkles, 
  Store, Building2, Wrench, MapPin, ChevronRight, X, AlertCircle, Loader2, CreditCard, RefreshCw, CheckCircle2, Globe, Truck, Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Screen4InscriptionProps {
  onSignupSuccess?: () => void;
  onGoToLogin?: () => void;
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
    benefits: [
      'Accès illimité à toute la marketplace',
      'Paiement sécurisé MTN MoMo & Orange Money',
      'Suivi en temps réel des livraisons',
    ]
  },
  {
    id: 'vendeur',
    title: 'Vendeur',
    emoji: '🛍️',
    icon: Store,
    description: 'Créez votre boutique et vendez vos produits sur la marketplace.',
    price: 5000,
    formattedPrice: '5 000 FCFA / mois',
    trialDays: 10,
    formattedTrial: '10 jours d\'essai gratuit',
    badge: 'Boutique',
    benefits: [
      'Boutique en ligne personnalisée',
      'Gestion automatisée des stocks',
      'Encaissement direct des ventes',
    ]
  },
  {
    id: 'prestataire',
    title: 'Prestataire',
    emoji: '🛠️',
    icon: Wrench,
    description: 'Proposez vos services professionnels et recevez des commandes directes.',
    price: 7500,
    formattedPrice: '7 500 FCFA / mois',
    trialDays: 10,
    formattedTrial: '10 jours d\'essai gratuit',
    badge: 'Services',
    benefits: [
      'Profil professionnel certifié',
      'Demandes de devis en direct',
      'Gestion dynamique des rendez-vous',
    ]
  },
  {
    id: 'entreprise',
    title: 'Entreprise',
    emoji: '🏢',
    icon: Building2,
    description: 'Présentez votre entreprise et développez votre visibilité B2B.',
    price: 15000,
    formattedPrice: '15 000 FCFA / mois',
    trialDays: 10,
    formattedTrial: '10 jours d\'essai gratuit',
    badge: 'Pro & B2B',
    benefits: [
      'Visibilité réseau B2B prioritaire',
      'Multicompte collaborateurs',
      'Statistiques avancées & support dédié',
    ]
  },
];

export default function Screen4Inscription({ onSignupSuccess, onGoToLogin }: Screen4InscriptionProps) {
  // Process steps: 'step1' (Informations) | 'step2' (Vérification OTP) | 'step3' (Finalisation) | 'success'
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'step3' | 'success'>('step1');

  // Form state
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    neighborhood: 'march-a',
  });

  // Track field touched state for inline validations
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Profile selection state
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>('client');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState('849201');
  const [currentDemoOtp, setCurrentDemoOtp] = useState<string>('849201');
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // Payment state
  const [paymentOperator, setPaymentOperator] = useState<'momo' | 'orange'>('momo');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  const selectedProfileObj = useMemo(() => PROFILE_OPTIONS.find(p => p.id === selectedProfile), [selectedProfile]);

  // Validations per field
  const isLastNameValid = formData.lastName.trim().length >= 2;
  const isFirstNameValid = formData.firstName.trim().length >= 2;
  const isPhoneValid = formData.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '').length >= 9;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPasswordValid = formData.password.length >= 8;
  const isConfirmPasswordValid = formData.confirmPassword.length >= 8 && formData.confirmPassword === formData.password;
  const isNeighborhoodValid = Boolean(formData.neighborhood);
  const isProfileSelected = Boolean(selectedProfile);

  const isStep1Complete = 
    isLastNameValid && 
    isFirstNameValid && 
    isPhoneValid && 
    isEmailValid && 
    isPasswordValid && 
    isConfirmPasswordValid && 
    isNeighborhoodValid && 
    isProfileSelected;

  const markFieldTouched = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  // Smart Auto-Advance from Step 1 to Step 2 when all fields are valid
  useEffect(() => {
    if (currentStep !== 'step1' || !isStep1Complete || isAutoAdvancing) return;

    setIsAutoAdvancing(true);
    const timer = setTimeout(async () => {
      // Trigger OTP service
      const res = await otpService.sendOtp(formData.phone);
      if (res.code) {
        setGeneratedOtp(res.code);
        setCurrentDemoOtp(res.code);
      }
      setOtpCountdown(60);
      setPaymentPhone(formData.phone);
      setCurrentStep('step2');
      setIsAutoAdvancing(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [isStep1Complete, currentStep, isAutoAdvancing, formData.phone]);

  // OTP Countdown timer
  useEffect(() => {
    if (currentStep !== 'step2' || otpCountdown <= 0) return;
    const timer = setInterval(() => setOtpCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [currentStep, otpCountdown]);

  // Auto-verify OTP when 6 digits are typed
  useEffect(() => {
    if (currentStep !== 'step2') return;
    if (inputOtp.length === 6) {
      otpService.verifyOtp(formData.phone, inputOtp).then((res) => {
        if (res.success) {
          setOtpError('');
          setOtpSuccess('Vérification réussie');
          setTimeout(() => {
            setOtpSuccess('');
            setCurrentStep('step3');
          }, 800);
        } else {
          setOtpSuccess('');
          setOtpError(res.message || 'Code OTP invalide');
        }
      });
    } else {
      setOtpError('');
      setOtpSuccess('');
    }
  }, [inputOtp, currentStep, formData.phone]);

  // Handle manual OTP submission
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');
    const res = await otpService.verifyOtp(formData.phone, inputOtp);
    if (res.success) {
      setOtpError('');
      setOtpSuccess('Vérification réussie');
      setTimeout(() => {
        setOtpSuccess('');
        setCurrentStep('step3');
      }, 800);
    } else {
      setOtpSuccess('');
      setOtpError(res.message || 'Code OTP invalide');
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    setIsResendingOtp(true);
    setOtpError('');
    setOtpSuccess('');
    const res = await otpService.resendOtp(formData.phone);
    if (res.code) {
      setGeneratedOtp(res.code);
      setCurrentDemoOtp(res.code);
    }
    setOtpCountdown(60);
    setIsResendingOtp(false);
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
  const stepIndex = currentStep === 'step1' ? 1 : currentStep === 'step2' ? 2 : currentStep === 'step3' ? 3 : 4;

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto bg-[#FFFFFF] text-[#0F172A] rounded-[24px] overflow-hidden shadow-xl border border-[#E5E7EB] p-4 sm:p-6 flex flex-col justify-between min-h-[600px] relative font-sans transition-all duration-300">
      
      {/* 2. Compact Header with Official AfriNova Logo & Slogan */}
      <div className="shrink-0">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            {/* AfriNova Logo Badge */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#0F172A] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              <Globe className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-[#0F172A] font-display tracking-tight leading-none">
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

          <span className="text-[10px] font-extrabold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#16A34A]" />
            <span>International</span>
          </span>
        </div>

        {/* 3. Modernized 3-Step Indicator with 60 FPS transitions */}
        <div className="pt-3 pb-1 px-1">
          <div className="flex items-center justify-between relative">
            {/* Background Step Line 1 -> 2 */}
            <div className="absolute top-4 left-6 right-1/2 h-0.5 bg-[#E5E7EB] -z-0">
              <motion.div 
                className="h-full bg-[#16A34A]" 
                initial={false}
                animate={{ width: stepIndex > 1 ? '100%' : '0%' }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
            </div>
            {/* Background Step Line 2 -> 3 */}
            <div className="absolute top-4 left-1/2 right-6 h-0.5 bg-[#E5E7EB] -z-0">
              <motion.div 
                className="h-full bg-[#16A34A]" 
                initial={false}
                animate={{ width: stepIndex > 2 ? '100%' : '0%' }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
            </div>

            {/* Step 1 Circle */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-200 ${
                stepIndex > 1
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7] ring-offset-1 shadow-sm'
              }`}>
                {stepIndex > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>
              <span className={`text-[10px] font-extrabold ${stepIndex === 1 ? 'text-[#16A34A]' : 'text-slate-500'}`}>
                Informations
              </span>
            </div>

            {/* Step 2 Circle */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-200 ${
                stepIndex > 2
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : stepIndex === 2
                  ? 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7] ring-offset-1 shadow-sm'
                  : 'bg-[#F8FAFC] text-slate-400 border-2 border-[#E5E7EB]'
              }`}>
                {stepIndex > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <span className={`text-[10px] font-extrabold ${stepIndex === 2 ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                Vérification
              </span>
            </div>

            {/* Step 3 Circle */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-200 ${
                stepIndex === 4
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : stepIndex === 3
                  ? 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7] ring-offset-1 shadow-sm'
                  : 'bg-[#F8FAFC] text-slate-400 border-2 border-[#E5E7EB]'
              }`}>
                {stepIndex === 4 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
              </div>
              <span className={`text-[10px] font-extrabold ${stepIndex >= 3 ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                Finalisation
              </span>
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
              className="space-y-3"
            >
              {/* Nom & Prénom */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onBlur={() => markFieldTouched('lastName')}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Ex: Kamdem"
                      required
                      className={`w-full h-[42px] pl-9 pr-8 bg-white border rounded-[16px] text-xs text-[#0F172A] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all duration-200 ease-out placeholder:text-slate-400 ${
                        touchedFields.lastName && !isLastNameValid ? 'border-red-400 bg-red-50/20' : 'border-[#E8E8E8]'
                      }`}
                    />
                    {isLastNameValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] absolute right-2.5 top-1/2 -translate-y-1/2 shrink-0" />
                    )}
                  </div>
                  {touchedFields.lastName && !isLastNameValid && (
                    <p className="text-[10px] text-red-500 font-bold mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Au moins 2 caractères</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onBlur={() => markFieldTouched('firstName')}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Ex: Paul"
                      required
                      className={`w-full h-[42px] pl-9 pr-8 bg-white border rounded-[16px] text-xs text-[#0F172A] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all duration-200 ease-out placeholder:text-slate-400 ${
                        touchedFields.firstName && !isFirstNameValid ? 'border-red-400 bg-red-50/20' : 'border-[#E8E8E8]'
                      }`}
                    />
                    {isFirstNameValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] absolute right-2.5 top-1/2 -translate-y-1/2 shrink-0" />
                    )}
                  </div>
                  {touchedFields.firstName && !isFirstNameValid && (
                    <p className="text-[10px] text-red-500 font-bold mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Au moins 2 caractères</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  Téléphone (WhatsApp / MoMo / Orange) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onBlur={() => markFieldTouched('phone')}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ex: 699123456"
                    required
                    className={`w-full h-[42px] pl-9 pr-8 bg-white border rounded-[16px] text-xs text-[#0F172A] font-mono shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all duration-200 ease-out placeholder:text-slate-400 ${
                      touchedFields.phone && !isPhoneValid ? 'border-red-400 bg-red-50/20' : 'border-[#E8E8E8]'
                    }`}
                  />
                  {isPhoneValid && (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] absolute right-2.5 top-1/2 -translate-y-1/2 shrink-0" />
                  )}
                </div>
                {touchedFields.phone && !isPhoneValid && (
                  <p className="text-[10px] text-red-500 font-bold mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Numéro valide (au moins 9 chiffres)</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={formData.email}
                    onBlur={() => markFieldTouched('email')}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre.email@domaine.cm"
                    required
                    className={`w-full h-[42px] pl-9 pr-8 bg-white border rounded-[16px] text-xs text-[#0F172A] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all duration-200 ease-out placeholder:text-slate-400 ${
                      touchedFields.email && !isEmailValid ? 'border-red-400 bg-red-50/20' : 'border-[#E8E8E8]'
                    }`}
                  />
                  {isEmailValid && (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] absolute right-2.5 top-1/2 -translate-y-1/2 shrink-0" />
                  )}
                </div>
                {touchedFields.email && !isEmailValid && (
                  <p className="text-[10px] text-red-500 font-bold mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Adresse email valide requise</span>
                  </p>
                )}
              </div>

              {/* Mot de passe & Confirmation */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      value={formData.password}
                      onBlur={() => markFieldTouched('password')}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className={`w-full h-[42px] pl-9 pr-8 bg-white border rounded-[16px] text-xs text-[#0F172A] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all duration-200 ease-out placeholder:text-slate-400 ${
                        touchedFields.password && !isPasswordValid ? 'border-red-400 bg-red-50/20' : 'border-[#E8E8E8]'
                      }`}
                    />
                    {isPasswordValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] absolute right-2.5 top-1/2 -translate-y-1/2 shrink-0" />
                    )}
                  </div>
                  {touchedFields.password && !isPasswordValid && (
                    <p className="text-[10px] text-red-500 font-bold mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Au moins 8 caractères</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                    Confirmation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onBlur={() => markFieldTouched('confirmPassword')}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className={`w-full h-[42px] pl-9 pr-8 bg-white border rounded-[16px] text-xs text-[#0F172A] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all duration-200 ease-out placeholder:text-slate-400 ${
                        touchedFields.confirmPassword && !isConfirmPasswordValid ? 'border-red-400 bg-red-50/20' : 'border-[#E8E8E8]'
                      }`}
                    />
                    {isConfirmPasswordValid && (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] absolute right-2.5 top-1/2 -translate-y-1/2 shrink-0" />
                    )}
                  </div>
                  {touchedFields.confirmPassword && !isConfirmPasswordValid && (
                    <p className="text-[10px] text-red-500 font-bold mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Mots de passe identiques</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Quartier */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  Quartier à Bafoussam <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full h-[42px] pl-9 pr-8 bg-white border border-[#E8E8E8] rounded-[16px] text-xs text-[#0F172A] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all duration-200 ease-out appearance-none cursor-pointer"
                  >
                    <option value="march-a">Marché A (Centre Commercial)</option>
                    <option value="march-b">Marché B (Ancien Marché)</option>
                    <option value="tamdja">Tamdja (Quartier Administratif)</option>
                    <option value="djeleng">Djeleng (Zone Résidentielle)</option>
                    <option value="houkaha">Houkaha</option>
                    <option value="kamkop">Kamkop</option>
                  </select>
                </div>
              </div>

              {/* 5. Bloc "Profil sélectionné" - Premium Card Design with Benefits */}
              <div className="pt-1">
                {!selectedProfileObj ? (
                  <button
                    type="button"
                    onClick={() => setIsBottomSheetOpen(true)}
                    className="w-full p-3 rounded-[16px] bg-white border border-[#E8E8E8] hover:border-[#16A34A] hover:bg-[#F0FDF4]/50 transition-all duration-200 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] group cursor-pointer text-left active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[12px] bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-base font-bold shrink-0">
                        👤
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1">
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
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-full p-3.5 rounded-[16px] bg-[#F0FDF4] border-2 border-[#16A34A] shadow-[0_2px_8px_rgba(22,163,74,0.08)] relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-emerald-200/80">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-[12px] bg-[#16A34A] text-white flex items-center justify-center text-base font-bold shrink-0 shadow-xs">
                          {selectedProfileObj.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-[#15803D] uppercase tracking-wider flex items-center gap-1">
                              Profil sélectionné <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
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
                        className="px-3 py-1.5 rounded-[12px] bg-white hover:bg-emerald-50 text-[#16A34A] border border-emerald-300 text-[11px] font-extrabold transition shrink-0 cursor-pointer shadow-2xs active:scale-[0.98]"
                      >
                        Modifier
                      </button>
                    </div>

                    {/* Display Benefits Checklist */}
                    <div className="pt-2 space-y-1">
                      <p className="text-[10px] font-extrabold text-[#15803D] uppercase tracking-wider">
                        Avantages exclusifs inclus ({selectedProfileObj.formattedTrial}) :
                      </p>
                      <ul className="space-y-0.5">
                        {selectedProfileObj.benefits.map((benefit, i) => (
                          <li key={i} className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Info Text */}
              <p className="text-center text-xs text-slate-500 font-medium pt-1">
                Les informations seront vérifiées automatiquement avant de passer à l'étape suivante.
              </p>

              {/* Primary Button "Continuer" */}
              <button
                type="button"
                disabled={!isStep1Complete || isAutoAdvancing}
                onClick={() => {
                  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    try { navigator.vibrate(10); } catch (e) {}
                  }
                  if (isStep1Complete && !isAutoAdvancing) {
                    setIsAutoAdvancing(true);
                    otpService.sendOtp(formData.phone).then(res => {
                      if (res.code) {
                        setGeneratedOtp(res.code);
                        if (otpService.getMode() === 'development') {
                          setInputOtp(res.code);
                        }
                      }
                      setOtpCountdown(60);
                      setPaymentPhone(formData.phone);
                      setCurrentStep('step2');
                      setIsAutoAdvancing(false);
                    });
                  }
                }}
                className={`w-full h-[54px] rounded-[16px] text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  !isStep1Complete
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                    : 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-[0_8px_20px_rgba(22,163,74,0.25)] active:scale-[0.99]'
                }`}
              >
                {isAutoAdvancing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Envoi du code OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Continuer vers la vérification</span>
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

            </motion.div>
          )}

          {/* STEP 2: VÉRIFICATION OTP */}
          {currentStep === 'step2' && (
            <motion.div
              key="step2-otp"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-4 py-2"
            >
              {/* Validation OTP Banner */}
              {otpService.getMode() === 'development' ? (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-2xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider text-amber-700">BANNIÈRE DE DÉVELOPPEMENT OTP</span>
                    </div>
                    <div className="font-mono text-sm font-black text-amber-600 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300">
                      OTP DEMO : {currentDemoOtp || generatedOtp}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center gap-2 text-blue-900 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Mode Production • Code SMS envoyé via {otpService.getProviderType().toUpperCase()}</span>
                </div>
              )}

              {/* Simulated SMS alert in Dev mode */}
              {otpService.getMode() === 'development' && (
                <div className="bg-[#0F172A] text-white rounded-2xl p-3.5 shadow-md border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#16A34A]"></div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg">🔐</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-[#16A34A] uppercase tracking-wider">SMS OTP Mode Développeur</span>
                        <span className="text-[9px] text-slate-400">À l'instant</span>
                      </div>
                      <p className="text-xs text-slate-100 font-mono mt-0.5 font-semibold">
                        Code de test : <span className="text-yellow-400 text-sm font-black tracking-widest underline">{currentDemoOtp || generatedOtp}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <h3 className="font-extrabold text-[#0F172A] text-sm">Vérification du numéro de téléphone</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Code SMS transmis au <span className="font-mono text-[#16A34A] font-bold">{formData.phone}</span>
                </p>
              </div>

              {otpSuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-2xl text-xs font-extrabold text-center flex items-center justify-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{otpSuccess}</span>
                </div>
              )}

              {otpError && (
                <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-2xl text-xs font-extrabold text-center flex items-center justify-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl font-black bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl py-3 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step1')}
                    className="text-slate-600 font-bold hover:underline cursor-pointer active:scale-[0.98]"
                  >
                    ← Modifier le profil/numéro
                  </button>

                  <button
                    type="button"
                    disabled={isResendingOtp || otpCountdown > 0}
                    onClick={handleResendOtp}
                    className="text-[#16A34A] font-bold disabled:text-slate-400 hover:underline cursor-pointer active:scale-[0.98]"
                  >
                    {isResendingOtp ? 'Renvoi...' : otpCountdown > 0 ? `Renvoyer (${otpCountdown}s)` : 'Renvoyer le code'}
                  </button>
                </div>

                {/* 7. Modernized Button with active press scale */}
                <button
                  type="submit"
                  className="w-full h-12 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <span>Valider le code OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: FINALISATION / PAIEMENT SÉCURISÉ */}
          {currentStep === 'step3' && (
            <motion.div
              key="step3-finalisation"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-4 py-1"
            >
              {/* Profile Summary Card */}
              <div className="bg-[#DCFCE7]/70 border border-emerald-300/80 rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#15803D] uppercase tracking-wider">
                    Résumé de votre abonnement
                  </span>
                  <span className="text-[10px] font-extrabold bg-white text-[#16A34A] px-2 py-0.5 rounded-full border border-emerald-200">
                    Période d'essai incluse
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-[#16A34A] text-white flex items-center justify-center text-lg font-bold shrink-0">
                    {selectedProfileObj?.emoji || '👤'}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#0F172A]">
                      {selectedProfileObj?.title}
                    </h4>
                    <p className="text-xs text-[#15803D] font-mono font-bold">
                      {selectedProfileObj?.formattedPrice}
                    </p>
                  </div>
                </div>

                <div className="border-t border-emerald-200/80 pt-2 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Titulaire :</span>
                    <span className="font-bold text-[#0F172A]">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Téléphone :</span>
                    <span className="font-mono font-bold text-[#0F172A]">{formData.phone}</span>
                  </div>
                </div>
              </div>

              {/* Select Mobile Money Operator */}
              <form onSubmit={handleProcessPayment} className="space-y-3">
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase">
                  Moyen de paiement sécurisé
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOperator('momo')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition active:scale-[0.98] ${
                      paymentOperator === 'momo'
                        ? 'border-[#16A34A] bg-[#DCFCE7]/60 text-[#0F172A] shadow-2xs'
                        : 'border-[#E5E7EB] bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-yellow-400 text-slate-900 font-black text-xs flex items-center justify-center mb-1 shadow-2xs">
                      MTN
                    </div>
                    <span className="text-xs font-bold">MTN MoMo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOperator('orange')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition active:scale-[0.98] ${
                      paymentOperator === 'orange'
                        ? 'border-[#16A34A] bg-[#DCFCE7]/60 text-[#0F172A] shadow-2xs'
                        : 'border-[#E5E7EB] bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center mb-1 shadow-2xs">
                      OM
                    </div>
                    <span className="text-xs font-bold">Orange Money</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                    Numéro de débit Mobile Money
                  </label>
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    required
                    className="w-full h-11 px-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-mono shadow-xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full h-12 px-6 bg-[#16A34A] hover:bg-[#15803D] disabled:bg-emerald-300 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validation du paiement USSD...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Procéder au paiement sécurisé</span>
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
              className="text-center py-4 space-y-3"
            >
              <div className="w-14 h-14 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto border border-emerald-300 shadow-xs">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <h3 className="text-lg font-black text-[#0F172A] font-display">
                Compte créé avec succès ! 🎉
              </h3>

              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Bienvenue sur AfriNova Bafoussam. Votre accès est activé.
              </p>

              <div className="bg-[#F8FAFC] rounded-2xl p-3 border border-[#E5E7EB] text-left text-xs space-y-1.5 max-w-xs mx-auto font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Titulaire :</span>
                  <span className="font-bold text-[#0F172A]">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profil :</span>
                  <span className="font-bold text-[#16A34A]">{selectedProfileObj?.title}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSignupSuccess) onSignupSuccess();
                }}
                className="w-full h-12 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-[0.98]"
              >
                <span>Accéder à mon espace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Link to Login */}
      <div className="pt-2.5 border-t border-[#E5E7EB] text-center shrink-0">
        <p className="text-xs text-slate-500">
          Vous avez déjà un compte ?{' '}
          <button 
            type="button"
            onClick={onGoToLogin}
            className="font-black text-[#16A34A] hover:underline cursor-pointer active:scale-[0.98]"
          >
            Se connecter
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
                        setTimeout(() => setIsBottomSheetOpen(false), 150);
                      }}
                      className={`p-3.5 rounded-[20px] transition-all duration-200 cursor-pointer relative flex flex-col justify-between border active:scale-[0.98] ${
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
