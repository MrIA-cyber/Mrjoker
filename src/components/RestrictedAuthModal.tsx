import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, KeyRound, AlertCircle, Clock } from 'lucide-react';
import { Language } from '../translations';

// Mot de passe de démonstration — à changer avant toute mise en production réelle.
const ADMIN_PASSWORD = "danielle1996";

interface RestrictedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang?: Language;
}

export default function RestrictedAuthModal({
  isOpen,
  onClose,
  onSuccess,
  lang = 'fr',
}: RestrictedAuthModalProps) {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [failedCount, setFailedCount] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutEndTime) return;

    const timerInterval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((lockoutEndTime - now) / 1000);

      if (diff <= 0) {
        setLockoutEndTime(null);
        setRemainingSeconds(0);
        setFailedCount(0); // Reset consecutive failed count after lockout period ends
        setErrorMessage('');
      } else {
        setRemainingSeconds(diff);
        setErrorMessage(
          lang === 'fr'
            ? 'Trop de tentatives, réessayez dans quelques instants'
            : 'Too many attempts, please try again in a moment'
        );
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [lockoutEndTime, lang]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if locked out
    if (lockoutEndTime && Date.now() < lockoutEndTime) {
      setErrorMessage(
        lang === 'fr'
          ? 'Trop de tentatives, réessayez dans quelques instants'
          : 'Too many attempts, please try again in a moment'
      );
      return;
    }

    const trimmed = password.trim();

    if (trimmed === ADMIN_PASSWORD) {
      // Success!
      setPassword('');
      setErrorMessage('');
      setFailedCount(0);
      setLockoutEndTime(null);
      onSuccess();
    } else {
      // Failed attempt
      const nextCount = failedCount + 1;
      setFailedCount(nextCount);
      setPassword('');

      if (nextCount >= 3) {
        const lockoutEnd = Date.now() + 30000; // 30 seconds lockout
        setLockoutEndTime(lockoutEnd);
        setRemainingSeconds(30);
        setErrorMessage(
          lang === 'fr'
            ? 'Trop de tentatives, réessayez dans quelques instants'
            : 'Too many attempts, please try again in a moment'
        );
      } else {
        setErrorMessage(
          lang === 'fr' ? 'Mot de passe incorrect' : 'Incorrect password'
        );
      }
    }
  };

  const isLocked = Boolean(lockoutEndTime && Date.now() < lockoutEndTime);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {lang === 'fr' ? 'Accès restreint' : 'Restricted Access'}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} autoComplete="off" className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {lang === 'fr' ? 'Authentification requise' : 'Authentication Required'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === 'fr' 
                  ? 'Veuillez saisir votre mot de passe pour poursuivre.' 
                  : 'Please enter your password to proceed.'}
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                autoComplete="off"
                placeholder={lang === 'fr' ? "Entrez votre mot de passe" : "Enter your password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage && !isLocked) setErrorMessage('');
                }}
                disabled={isLocked}
                autoFocus
                className="w-full text-center px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 text-sm font-mono tracking-widest font-bold text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              />

              {errorMessage && (
                <div className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold ${
                  isLocked 
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50' 
                    : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                }`}>
                  {isLocked ? <Clock className="w-4 h-4 shrink-0 animate-spin" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>
                    {errorMessage} {isLocked && remainingSeconds > 0 ? `(${remainingSeconds}s)` : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer active:scale-95"
              >
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isLocked || !password.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none transition-all duration-200 shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{lang === 'fr' ? 'Valider' : 'Submit'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
