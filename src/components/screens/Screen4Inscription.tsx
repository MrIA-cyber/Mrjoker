import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Lock, Check, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface Screen4InscriptionProps {
  onSignupSuccess?: () => void;
  onGoToLogin?: () => void;
}

export default function Screen4Inscription({ onSignupSuccess, onGoToLogin }: Screen4InscriptionProps) {
  const [formData, setFormData] = useState({
    lastName: 'Kamdem',
    firstName: 'Paul',
    phone: '699123456',
    email: 'paul.kamdem@gmail.com',
    password: '••••••••',
    confirmPassword: '••••••••',
    acceptedTerms: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptedTerms) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onSignupSuccess) onSignupSuccess();
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-6 flex flex-col justify-between min-h-[580px] relative">
      
      {/* Top Bar Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-black text-xs">
            B
          </div>
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">ÉCRAN 4 — INSCRIPTION</span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Création Rapide</span>
        </div>
      </div>

      <div className="my-auto py-3 space-y-4">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">Créer un compte</h2>
          <p className="text-xs text-slate-500">Rejoignez la communauté officielle Bafoussam Market</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Nom & Prénom Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Nom</label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Ex: Kamdem"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Prénom</label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Ex: Paul"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]"
                />
              </div>
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Téléphone (WhatsApp / MoMo / Orange)</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ex: 699123456"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre.email@domaine.cm"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]"
              />
            </div>
          </div>

          {/* Password & Confirm Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Confirmation</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]"
                />
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.acceptedTerms}
              onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
              className="mt-0.5 w-4 h-4 text-[#16A34A] rounded border-slate-300 focus:ring-[#16A34A]"
            />
            <span className="text-[10px] text-slate-600 leading-tight">
              J'accepte les <span className="font-bold text-slate-900 underline">conditions d'utilisation</span> et la <span className="font-bold text-slate-900 underline">politique de confidentialité</span> de Bafoussam Market.
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.acceptedTerms}
            className="w-full py-3 px-6 bg-[#16A34A] hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Créer mon compte</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Link to Login */}
      <div className="pt-3 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          Vous avez déjà un compte ?{' '}
          <button 
            onClick={onGoToLogin}
            className="font-black text-[#16A34A] hover:underline cursor-pointer"
          >
            Se connecter
          </button>
        </p>
      </div>

    </div>
  );
}
