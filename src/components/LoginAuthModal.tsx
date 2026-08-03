import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { Lock, X, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Language, translations } from '../translations';
import PhoneCountryInput from './PhoneCountryInput';
import { AfriNovaLogo } from './AfriNovaLogo';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { getFrenchAuthErrorMessage } from '../utils/firebaseErrors';
import { arePhonesEqual } from '../utils/accountValidation';

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
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (savedUserPhone) {
        setLoginPhone(savedUserPhone);
      }
      setLoginPassword('');
      setValidationError('');
    }
  }, [isOpen, savedUserPhone]);

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
      // Fallback local lookup
      try {
        const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
        const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

        const matchedUser = savedUsers.find(u => arePhonesEqual(u.phone, cleanInputPhone) || u.phone.includes(cleanInputPhone) || u.email === cleanInputPhone);

        if (!matchedUser) {
          setIsLoading(false);
          setValidationError(getFrenchAuthErrorMessage(fbErr));
          return;
        }

        if (loginPassword !== matchedUser.password) {
          setIsLoading(false);
          setValidationError(getFrenchAuthErrorMessage(fbErr));
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <AfriNovaLogo size="sm" showSlogan={false} lang={lang} />
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Title / Status */}
            <div className="space-y-1 text-center">
              <h3 className="text-xl font-black text-slate-900 font-display">
                {isExpiredSession
                  ? (lang === 'fr' ? 'Session Expirée' : 'Session Expired')
                  : (lang === 'fr' ? 'Connexion à votre espace' : 'Sign in to your account')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isExpiredSession
                  ? (lang === 'fr' ? 'Veuillez ressaisir votre mot de passe pour restaurer votre session et vos travaux.' : 'Please re-enter your password to restore your active workspace.')
                  : (lang === 'fr' ? 'Entrez vos identifiants pour accéder directement à votre tableau de bord.' : 'Enter your credentials to access your dashboard.')}
              </p>
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <PhoneCountryInput
                  id="modal-login-phone"
                  label={lang === 'fr' ? 'Numéro de téléphone' : 'Phone Number'}
                  required
                  value={loginPhone}
                  lang={lang}
                  onChange={(val) => setLoginPhone(val)}
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
                    placeholder="••••••••"
                    className="w-full h-[52px] pl-12 pr-12 bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-sm text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#16A34A] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2">
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

                {onGoToSignup && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onGoToSignup();
                    }}
                    className="w-full h-[46px] rounded-2xl text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    {lang === 'fr' ? 'Créer un nouveau compte' : 'Create a new account'}
                  </button>
                )}
              </div>
            </form>
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
