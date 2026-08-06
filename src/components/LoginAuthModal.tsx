import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { Lock, X, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Loader2, RefreshCw, User as UserIcon } from 'lucide-react';
import { Language, translations } from '../translations';
import PhoneCountryInput from './PhoneCountryInput';
import { AfriNovaLogo } from './AfriNovaLogo';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { getFrenchAuthErrorMessage } from '../utils/firebaseErrors';
import { arePhonesEqual } from '../utils/accountValidation';
import { verifyPassword, ensureAdminAccountExists } from '../utils/security';

interface LoginAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  lang?: Language;
  isExpiredSession?: boolean;
  savedUserPhone?: string;
  onGoToSignup?: () => void;
}

export default function LoginAuthModal({
  isOpen,
  onClose,
  onSuccess,
  lang = 'fr',
  isExpiredSession = false,
  savedUserPhone = '',
  onGoToSignup,
}: LoginAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('login');
      setLoginPhone('');
      setLoginPassword('');
      setValidationError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    setIsLoading(true);

    // Ensure admin account exists in local database
    ensureAdminAccountExists();

    const formattedEmail = cleanInputPhone.includes('@')
      ? cleanInputPhone
      : `${cleanInputPhone.replace(/[^0-9+]/g, '')}@afrinova.cm`;

    try {
      const cred = await signInWithEmailAndPassword(auth, formattedEmail, loginPassword);
      setIsLoading(false);

      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      const matchedUser = savedUsers.find(u => u.email === formattedEmail || u.phone === cleanInputPhone || arePhonesEqual(u.phone, cleanInputPhone)) || {
        id: cred.user.uid,
        name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Membre AfriNova',
        email: cred.user.email || formattedEmail,
        phone: cleanInputPhone,
        isSubscribed: true,
        hasPaidFee: true,
        accountType: 'client'
      };

      onSuccess(matchedUser);
    } catch (fbErr) {
      // Fallback local lookup with secure password verification
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
          setIsLoading(false);
          setValidationError(getFrenchAuthErrorMessage(fbErr));
          return;
        }

        if (!verifyPassword(loginPassword, matchedUser.password)) {
          setIsLoading(false);
          setValidationError(lang === 'fr' ? 'Mot de passe incorrect. Veuillez réessayer.' : 'Incorrect password. Please try again.');
          return;
        }

        setIsLoading(false);
        onSuccess(matchedUser);
      } catch (err) {
        setIsLoading(false);
        setValidationError(getFrenchAuthErrorMessage(fbErr));
      }
    }
  };

  const handleSwitchTab = (tab: 'login' | 'register') => {
    setValidationError('');
    if (tab === 'register') {
      if (onGoToSignup) {
        onClose();
        onGoToSignup();
      } else {
        setActiveTab('register');
      }
    } else {
      setActiveTab('login');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 relative my-auto"
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-login-title"
            className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80"
          >
            <AfriNovaLogo size="sm" showSlogan={false} lang={lang} />
            <button
              type="button"
              onClick={onClose}
              aria-label={lang === 'fr' ? 'Fermer la fenêtre de connexion' : 'Close login modal'}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Tab Selection Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleSwitchTab('login')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'login'
                    ? 'bg-white text-[#0F172A] shadow-xs border border-slate-200/80 font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4 text-[#16A34A]" />
                <span>{lang === 'fr' ? 'Se connecter' : 'Sign in'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab('register')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'register'
                    ? 'bg-[#16A34A] text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>{lang === 'fr' ? "S'inscrire" : 'Sign up'}</span>
              </button>
            </div>

            {/* Expired Session Alert Banner */}
            {isExpiredSession && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                <span>
                  {lang === 'fr'
                    ? 'Vos filtres, panier et brouillons ont été automatiquement sauvegardés.'
                    : 'Your active filters, cart, and drafts have been safely preserved.'}
                </span>
              </div>
            )}

            {/* Error Message */}
            {validationError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="modal-login-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <PhoneCountryInput
                        id="modal-login-phone"
                        label={lang === 'fr' ? 'Numéro de téléphone' : 'Phone Number'}
                        required
                        value={loginPhone}
                        lang={lang}
                        onChange={(val) => setLoginPhone(val)}
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
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder={lang === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
                          className="w-full h-[52px] pl-12 pr-12 bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-sm text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? (lang === 'fr' ? 'Masquer le mot de passe' : 'Hide password') : (lang === 'fr' ? 'Afficher le mot de passe' : 'Show password')}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#16A34A] cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[52px] rounded-2xl text-base font-black bg-gradient-to-r from-[#16A34A] via-emerald-600 to-indigo-600 hover:brightness-105 active:scale-[0.98] text-white shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <span>{lang === 'fr' ? 'Se connecter' : 'Sign in'}</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="modal-register-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="space-y-4 text-center py-4"
                >
                  <p className="text-xs text-slate-600 font-semibold">
                    {lang === 'fr'
                      ? 'Rejoignez la communauté AfriNova et profitez de tous nos services.'
                      : 'Join the AfriNova community and access all features.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (onGoToSignup) {
                        onClose();
                        onGoToSignup();
                      }
                    }}
                    className="w-full h-[52px] rounded-2xl text-base font-black bg-gradient-to-r from-[#16A34A] via-emerald-600 to-indigo-600 hover:brightness-105 active:scale-[0.98] text-white shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>{lang === 'fr' ? 'Créer mon compte' : 'Create my account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Session & Données Sécurisées</span>
            </div>
            <span>AfriNova Bafoussam</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
