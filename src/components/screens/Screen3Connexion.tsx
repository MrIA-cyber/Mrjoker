import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

interface Screen3ConnexionProps {
  onLoginSuccess?: () => void;
  onGoToSignup?: () => void;
}

export default function Screen3Connexion({ onLoginSuccess, onGoToSignup }: Screen3ConnexionProps) {
  const [email, setEmail] = useState('client@bafoussam-market.cm');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    }, 800);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-6 sm:p-8 flex flex-col justify-between min-h-[580px] relative">
      
      {/* Top Bar Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-black text-xs">
            B
          </div>
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">ÉCRAN 3 — CONNEXION</span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Accès Sécurisé</span>
        </div>
      </div>

      <div className="my-auto py-4 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#16A34A] via-emerald-500 to-green-600 p-3 shadow-lg shadow-emerald-600/20 flex items-center justify-center text-white relative">
            <span className="text-3xl font-black font-display">B</span>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-slate-900 fill-slate-900" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">Bienvenue</h2>
            <p className="text-xs text-slate-500">Connectez-vous à votre compte Bafoussam Market</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email ou Numéro de Téléphone
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: client@bafoussam-market.cm"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Mot de passe
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] font-bold text-[#16A34A] hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Green Submit Button */}
          <div className="space-y-1">
            <button
              type="submit"
              disabled={isLoading || (!email.trim() || !password.trim())}
              className="w-full py-3.5 px-6 bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {(!email.trim() || !password.trim()) && (
              <p className="text-[11px] font-semibold text-slate-400 text-center">
                Saisissez votre e-mail/téléphone et mot de passe pour continuer
              </p>
            )}
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Ou continuer avec</span></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button 
            type="button"
            onClick={onLoginSuccess}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google</span>
          </button>

          <button 
            type="button"
            onClick={onLoginSuccess}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>
        </div>
      </div>

      {/* Footer Link to Signup */}
      <div className="pt-3 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          Vous n'avez pas de compte ?{' '}
          <button 
            onClick={onGoToSignup}
            className="font-black text-[#16A34A] hover:underline cursor-pointer"
          >
            Créer un compte
          </button>
        </p>
      </div>

    </div>
  );
}
