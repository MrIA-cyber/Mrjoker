import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Mail, Phone, Lock, Check, ShieldCheck, ArrowRight, Sparkles, 
  Store, Building2, Wrench, MapPin, ChevronRight, X, AlertCircle, Loader2, CreditCard, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Screen4InscriptionProps {
  onSignupSuccess?: () => void;
  onGoToLogin?: () => void;
}

export type ProfileType = 'client' | 'vendeur' | 'entreprise' | 'prestataire';

export const PROFILE_OPTIONS = [
  {
    id: 'client' as ProfileType,
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
    id: 'vendeur' as ProfileType,
    title: 'Vendeur',
    emoji: '🛍️',
    icon: Store,
    description: 'Créez votre boutique et vendez vos produits sur la marketplace.',
    price: 5000,
    formattedPrice: '5 000 FCFA / mois',
    trialDays: 10,
    formattedTrial: '10 jours d\'essai gratuit',
    badge: 'Boutique',
  },
  {
    id: 'prestataire' as ProfileType,
    title: 'Prestataire',
    emoji: '🛠️',
    icon: Wrench,
    description: 'Proposez vos services professionnels et recevez des commandes directes.',
    price: 7500,
    formattedPrice: '7 500 FCFA / mois',
    trialDays: 10,
    formattedTrial: '10 jours d\'essai gratuit',
    badge: 'Services',
  },
  {
    id: 'entreprise' as ProfileType,
    title: 'Entreprise',
    emoji: '🏢',
    icon: Building2,
    description: 'Présentez votre entreprise et développez votre visibilité B2B.',
    price: 15000,
    formattedPrice: '15 000 FCFA / mois',
    trialDays: 10,
    formattedTrial: '10 jours d\'essai gratuit',
    badge: 'Pro & B2B',
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

  // Profile selection state
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState('849201');
  const [inputOtp, setInputOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  // Payment state
  const [paymentOperator, setPaymentOperator] = useState<'momo' | 'orange'>('momo');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  const selectedProfileObj = PROFILE_OPTIONS.find(p => p.id === selectedProfile);

  // Validate Step 1 completeness
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

  // Smart Auto-Advance from Step 1 to Step 2 when all fields are valid
  useEffect(() => {
    if (currentStep !== 'step1' || !isStep1Complete || isAutoAdvancing) return;

    setIsAutoAdvancing(true);
    const timer = setTimeout(() => {
      // Generate OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setInputOtp('');
      setOtpCountdown(60);
      setPaymentPhone(formData.phone);
      setCurrentStep('step2');
      setIsAutoAdvancing(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [isStep1Complete, currentStep, isAutoAdvancing, formData.phone]);

  // OTP Countdown timer
  useEffect(() => {
    if (currentStep !== 'step2' || otpCountdown <= 0) return;
    const timer = setInterval(() => setOtpCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [currentStep, otpCountdown]);

  // Smart Auto-Advance from Step 2 to Step 3 when 6-digit OTP is typed
  useEffect(() => {
    if (currentStep !== 'step2') return;
    if (inputOtp.length === 6 && inputOtp === generatedOtp) {
      const timer = setTimeout(() => {
        setCurrentStep('step3');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [inputOtp, generatedOtp, currentStep]);

  // Handle manual OTP submission
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOtp === generatedOtp) {
      setCurrentStep('step3');
    }
  };

  // Handle Resend OTP
  const handleResendOtp = () => {
    if (otpCountdown > 0) return;
    setIsResendingOtp(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setInputOtp('');
      setOtpCountdown(60);
      setIsResendingOtp(false);
    }, 800);
  };

  // Handle Payment Submission
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setCurrentStep('success');
    }, 1800);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#FFFFFF] text-[#0F172A] rounded-[22px] overflow-hidden shadow-2xl border border-[#E5E7EB] p-5 sm:p-6 flex flex-col justify-between min-h-[620px] relative font-sans">
      
      {/* Header Logo + Title */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#16A34A] text-white flex items-center justify-center font-black text-sm shadow-xs">
              B
            </div>
            <div>
              <h1 className="text-sm font-black text-[#0F172A] font-display tracking-tight leading-none">
                Bafoussam <span className="text-[#16A34A]">Market</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Créer votre compte
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#16A34A]" />
            <span>Offre Spéciale</span>
          </span>
        </div>

        <div className="text-center pt-3 pb-1">
          <p className="text-xs text-slate-500 font-medium">
            Rejoignez la plus grande plateforme numérique de Bafoussam.
          </p>
        </div>

        {/* 3-Step Progress Bar Indicator */}
        <div className="my-4 px-2">
          <div className="flex items-center justify-between relative">
            {/* Background Line 1-2 */}
            <div className="absolute top-4 left-6 right-1/2 h-0.5 bg-[#E5E7EB] -z-0">
              <div 
                className="h-full bg-[#16A34A] transition-all duration-300" 
                style={{ width: currentStep !== 'step1' ? '100%' : '0%' }}
              />
            </div>
            {/* Background Line 2-3 */}
            <div className="absolute top-4 left-1/2 right-6 h-0.5 bg-[#E5E7EB] -z-0">
              <div 
                className="h-full bg-[#16A34A] transition-all duration-300" 
                style={{ width: currentStep === 'step3' || currentStep === 'success' ? '100%' : '0%' }}
              />
            </div>

            {/* Step 1 Circle */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-colors shadow-2xs ${
                currentStep !== 'step1'
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7]'
              }`}>
                {currentStep !== 'step1' ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>
              <span className={`text-[10px] font-bold ${currentStep === 'step1' ? 'text-[#16A34A]' : 'text-slate-500'}`}>
                Informations
              </span>
            </div>

            {/* Step 2 Circle */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-colors shadow-2xs ${
                currentStep === 'step3' || currentStep === 'success'
                  ? 'bg-[#16A34A] text-white'
                  : currentStep === 'step2'
                  ? 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7]'
                  : 'bg-[#F8FAFC] text-slate-400 border-2 border-[#E5E7EB]'
              }`}>
                {currentStep === 'step3' || currentStep === 'success' ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <span className={`text-[10px] font-bold ${currentStep === 'step2' ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                Vérification
              </span>
            </div>

            {/* Step 3 Circle */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-colors shadow-2xs ${
                currentStep === 'success'
                  ? 'bg-[#16A34A] text-white'
                  : currentStep === 'step3'
                  ? 'bg-[#16A34A] text-white ring-4 ring-[#DCFCE7]'
                  : 'bg-[#F8FAFC] text-slate-400 border-2 border-[#E5E7EB]'
              }`}>
                {currentStep === 'success' ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
              </div>
              <span className={`text-[10px] font-bold ${currentStep === 'step3' || currentStep === 'success' ? 'text-[#16A34A]' : 'text-slate-400'}`}>
                Finalisation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Areas Animated by Step */}
      <div className="my-auto py-2">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INFORMATIONS */}
          {currentStep === 'step1' && (
            <motion.div
              key="step1-informations"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {/* Nom & Prénom */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Ex: Kamdem"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Ex: Paul"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Téléphone (WhatsApp / MoMo / Orange) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ex: 699123456"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre.email@domaine.cm"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                  />
                </div>
              </div>

              {/* Mot de passe & Confirmation */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Confirmation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Quartier */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Quartier à Bafoussam <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] appearance-none cursor-pointer"
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

              {/* Compact Banderole / Selected Profile Summary */}
              <div className="pt-1">
                {!selectedProfileObj ? (
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

              {/* Status Note or Auto-Advancing Indicator */}
              {isAutoAdvancing ? (
                <div className="p-3 bg-[#DCFCE7] border border-emerald-300 rounded-2xl text-center text-[#15803D] text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Informations valides — Passage à la vérification...</span>
                </div>
              ) : !isStep1Complete ? (
                <p className="text-[10px] text-slate-400 text-center font-medium pt-1">
                  Remplissez tous les champs pour passer automatiquement à l'étape suivante.
                </p>
              ) : null}

            </motion.div>
          )}

          {/* STEP 2: VÉRIFICATION OTP */}
          {currentStep === 'step2' && (
            <motion.div
              key="step2-otp"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4 py-2"
            >
              {/* Simulated SMS Toast alert */}
              <div className="bg-[#0F172A] text-white rounded-2xl p-3.5 shadow-md border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#16A34A] animate-pulse"></div>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg">📱</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-[#16A34A] uppercase tracking-wider">SMS de sécurité Bafoussam Market</span>
                      <span className="text-[9px] text-slate-400">À l'instant</span>
                    </div>
                    <p className="text-xs text-slate-100 font-mono mt-0.5 font-semibold">
                      Votre code OTP est : <span className="text-yellow-400 text-sm font-black tracking-widest underline">{generatedOtp}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-extrabold text-[#0F172A] text-sm">Vérification de sécurité</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Code SMS envoyé au <span className="font-mono text-[#16A34A] font-bold">{formData.phone}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl font-black bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl py-3 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step1')}
                    className="text-slate-600 font-bold hover:underline cursor-pointer"
                  >
                    ← Modifier le profil/numéro
                  </button>

                  <button
                    type="button"
                    disabled={isResendingOtp || otpCountdown > 0}
                    onClick={handleResendOtp}
                    className="text-[#16A34A] font-bold disabled:text-slate-400 hover:underline cursor-pointer"
                  >
                    {isResendingOtp ? 'Renvoi...' : otpCountdown > 0 ? `Renvoyer (${otpCountdown}s)` : 'Renvoyer le code'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Valider l'OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: FINALISATION / PAIEMENT SÉCURISÉ */}
          {currentStep === 'step3' && (
            <motion.div
              key="step3-finalisation"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4 py-1"
            >
              {/* Profile Summary Card */}
              <div className="bg-[#DCFCE7]/70 border border-emerald-300/80 rounded-2xl p-4 space-y-2">
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
                <label className="block text-[10px] font-bold text-slate-600 uppercase">
                  Moyen de paiement sécurisé
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOperator('momo')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                      paymentOperator === 'momo'
                        ? 'border-[#16A34A] bg-[#DCFCE7]/60 text-[#0F172A]'
                        : 'border-[#E5E7EB] bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-yellow-400 text-slate-900 font-black text-xs flex items-center justify-center mb-1">
                      MTN
                    </div>
                    <span className="text-xs font-bold">MTN MoMo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOperator('orange')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                      paymentOperator === 'orange'
                        ? 'border-[#16A34A] bg-[#DCFCE7]/60 text-[#0F172A]'
                        : 'border-[#E5E7EB] bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center mb-1">
                      OM
                    </div>
                    <span className="text-xs font-bold">Orange Money</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Numéro de débit
                  </label>
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 px-6 bg-[#16A34A] hover:bg-[#15803D] disabled:bg-emerald-300 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
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
              className="text-center py-4 space-y-3"
            >
              <div className="w-14 h-14 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto border border-emerald-300 shadow-xs">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <h3 className="text-lg font-black text-[#0F172A] font-display">
                Compte créé avec succès ! 🎉
              </h3>

              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Bienvenue sur Bafoussam Market. Votre accès est activé.
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
                className="w-full py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Accéder à mon espace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Link to Login */}
      <div className="pt-3 border-t border-[#E5E7EB] text-center">
        <p className="text-xs text-slate-500">
          Vous avez déjà un compte ?{' '}
          <button 
            type="button"
            onClick={onGoToLogin}
            className="font-black text-[#16A34A] hover:underline cursor-pointer"
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
