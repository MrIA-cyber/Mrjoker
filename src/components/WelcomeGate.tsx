import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Phone, Lock, Globe, AlertCircle, ShieldCheck, ArrowRight, Eye, EyeOff, HelpCircle, Loader2, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../translations';
import SupportPhoneNumber from './SupportPhoneNumber';
import Screen4Inscription from './screens/Screen4Inscription';
import { AfriNovaLogo } from './AfriNovaLogo';
import PhoneCountryInput from './PhoneCountryInput';
import { normalizePhoneNumber, normalizeEmail, arePhonesEqual } from '../utils/accountValidation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { getFrenchAuthErrorMessage } from '../utils/firebaseErrors';
import { verifyPassword, ensureAdminAccountExists } from '../utils/security';

interface WelcomeGateProps {
  onSuccess: (user: User) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  initialStep?: 'login' | 'register';
}

export default function WelcomeGate({ onSuccess, lang, onLangChange, initialStep = 'login' }: WelcomeGateProps) {
  const getTranslation = (key: string) => {
    return (translations[lang] as any)[key] || '';
  };

  const [step, setStep] = useState<'register' | 'login' | 'searching-subscription'>(initialStep);

  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [failedLoginCount, setFailedLoginCount] = useState(0);
  const [loginLockoutEndTime, setLoginLockoutEndTime] = useState<number | null>(null);

  // Seed registered users list in localStorage if empty and ensure Admin account exists
  useEffect(() => {
    try {
      ensureAdminAccountExists();
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
            accountType: 'client',
            subscriptionDate: today.toISOString().split('T')[0],
            subscriptionExpiryDate: expiry.toISOString().split('T')[0],
            hasPaidFee: true,
          }
        ];
        localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(seedUsers));
        ensureAdminAccountExists();
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Handle successful registration from Screen4Inscription
  const handleSignupSuccessFromScreen = (data: any) => {
    const today = new Date();
    const trialDays = data?.profile === 'client' ? 5 : 10;
    const trialExpiry = new Date();
    trialExpiry.setDate(today.getDate() + trialDays);

    const expiry = new Date();
    expiry.setMonth(today.getMonth() + 3);

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: data?.name || 'Membre AfriNova',
      email: data?.email || `${data?.phone || 'user'}@afrinova.cm`,
      phone: data?.phone || '670000000',
      password: data?.password || 'Password123!',
      isVerifiedPhone: true,
      accountType: data?.profile || 'client',
      trialStartDate: today.toISOString(),
      trialExpiryDate: trialExpiry.toISOString(),
      isInTrial: true,
      hasCompletedTrial: false,
      isSubscribed: true,
      subscriptionPlan: data?.profile || 'client',
      subscriptionDuration: 'monthly',
      subscriptionDate: today.toISOString().split('T')[0],
      subscriptionExpiryDate: expiry.toISOString().split('T')[0],
      hasPaidFee: true,
    };

    try {
      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      const filtered = savedUsers.filter(u => !arePhonesEqual(u.phone, newUser.phone));
      filtered.push(newUser);
      localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(filtered));
    } catch (err) {
      console.error("Erreur de sauvegarde utilisateur:", err);
    }

    onSuccess(newUser);
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (loginLockoutEndTime && Date.now() < loginLockoutEndTime) {
      const remaining = Math.max(1, Math.ceil((loginLockoutEndTime - Date.now()) / 1000));
      setValidationError(
        lang === 'fr'
          ? `Trop de tentatives, réessayez dans quelques instants (${remaining}s).`
          : `Too many attempts, please try again in a moment (${remaining}s).`
      );
      return;
    }

    const cleanInputPhone = loginPhone.trim();

    if (!cleanInputPhone) {
      setValidationError(lang === 'fr' ? 'Veuillez entrer votre numéro de téléphone.' : 'Please enter your phone number.');
      return;
    }

    if (!loginPassword) {
      setValidationError(lang === 'fr' ? 'Veuillez entrer votre mot de passe.' : 'Please enter your password.');
      return;
    }

    setValidationError('');
    setStep('searching-subscription');

    const formattedEmail = cleanInputPhone.includes('@')
      ? cleanInputPhone
      : `${cleanInputPhone.replace(/[^0-9+]/g, '')}@afrinova.cm`;

    signInWithEmailAndPassword(auth, formattedEmail, loginPassword)
      .then((cred) => {
        setFailedLoginCount(0);
        setLoginLockoutEndTime(null);

        const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
        const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
        const matchedUser = savedUsers.find(u => u.email === formattedEmail || u.phone === cleanInputPhone) || {
          id: cred.user.uid,
          name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Membre AfriNova',
          email: cred.user.email || formattedEmail,
          phone: cleanInputPhone,
          isSubscribed: true,
          hasPaidFee: true,
          accountType: 'client'
        };

        onSuccess(matchedUser);
      })
      .catch((fbErr) => {
        // Fallback to local storage lookup if Firebase user is not created yet or offline
        try {
          const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
          const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

          const matchedUser = savedUsers.find(u => 
            arePhonesEqual(u.phone, cleanInputPhone) || 
            u.phone.includes(cleanInputPhone) || 
            u.email === cleanInputPhone ||
            u.email === formattedEmail
          );

          if (!matchedUser) {
            setStep('login');
            setValidationError(getFrenchAuthErrorMessage(fbErr));
            return;
          }

          if (!verifyPassword(loginPassword, matchedUser.password)) {
            setStep('login');
            setValidationError(lang === 'fr' ? 'Mot de passe incorrect. Veuillez réessayer.' : 'Incorrect password. Please try again.');
            return;
          }

          setFailedLoginCount(0);
          setLoginLockoutEndTime(null);
          onSuccess(matchedUser);
        } catch (err) {
          setStep('login');
          setValidationError(getFrenchAuthErrorMessage(fbErr));
        }
      });
  };

  // If in register mode, render the 10/10 Refonte Premium Screen4Inscription!
  if (step === 'register') {
    return (
      <Screen4Inscription
        onSignupSuccess={handleSignupSuccessFromScreen}
        onGoToLogin={() => {
          setValidationError('');
          setStep('login');
        }}
        lang={lang}
        onLangChange={onLangChange}
      />
    );
  }

  // If in login mode or searching mode
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-x-hidden">
      {/* Background light gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-[#FAFAF9] via-[#F5F3FF]/40 to-[#ECFDF5]/60">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#16A34A]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-white rounded-[20px] shadow-[0_16px_48px_rgba(15,23,42,0.08)] border border-slate-200/80 p-4 sm:p-8 overflow-hidden space-y-5 sm:space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <AfriNovaLogo size="lg" showSlogan={true} lang={lang} />

          <button
            type="button"
            onClick={() => onLangChange(lang === 'fr' ? 'en' : 'fr')}
            className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#16A34A] border border-slate-200 text-xs font-black transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#16A34A] inline mr-1" />
            <span>{lang === 'fr' ? 'EN' : 'FR'}</span>
          </button>
        </div>

        {/* Choice between Se connecter & S'inscrire */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setValidationError('');
              setStep('login');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              step === 'login'
                ? 'bg-white text-[#0F172A] shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4 text-[#16A34A]" />
            <span>{lang === 'fr' ? 'Se connecter' : 'Sign In'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setValidationError('');
              setStep('register');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              step === 'register'
                ? 'bg-[#16A34A] text-white shadow-xs font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{lang === 'fr' ? "S'inscrire" : 'Sign Up'}</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'login' && (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-[#0F172A] text-xs space-y-1">
                <div className="flex items-center gap-2 font-black text-[#15803D]">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>{lang === 'fr' ? 'Connexion à votre compte' : 'Account Sign In'}</span>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {lang === 'fr' ? 'Entrez votre numéro de téléphone et votre mot de passe pour accéder à la plateforme.' : 'Enter your phone number and password to access the platform.'}
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <PhoneCountryInput
                    id="welcome-gate-login-phone"
                    label={lang === 'fr' ? 'Numéro de téléphone' : 'Phone Number'}
                    required
                    value={loginPhone}
                    lang={lang}
                    onChange={(fullNumber) => setLoginPhone(fullNumber)}
                    placeholder={lang === 'fr' ? 'Entrez votre numéro de téléphone' : 'Enter your phone number'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                    {lang === 'fr' ? 'Mot de passe' : 'Password'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={lang === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
                      className="w-full h-[52px] pl-12 pr-12 bg-[#F8FAFC] focus:bg-white border border-slate-200 rounded-2xl text-sm text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#16A34A] cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {validationError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-extrabold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-[52px] rounded-2xl text-base font-black bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#7C3AED] hover:brightness-105 active:scale-[0.98] text-white shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>{lang === 'fr' ? 'Se connecter' : 'Sign in'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'searching-subscription' && (
            <motion.div
              key="searching-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center space-y-3"
            >
              <Loader2 className="w-10 h-10 text-[#16A34A] animate-spin mx-auto" />
              <h4 className="text-sm font-black text-[#0F172A]">
                {lang === 'fr' ? 'Connexion en cours...' : 'Signing in...'}
              </h4>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>{lang === 'fr' ? 'Connexion sécurisée' : 'Secure Sign In'}</span>
          </div>
          <div className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <SupportPhoneNumber prefix="" className="text-xs" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
