import React, { useState } from 'react';
import { User } from '../types';
import { AlertTriangle, CreditCard, ArrowRight, Loader2, Phone, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../translations';

interface SubscriptionExpiredScreenProps {
  currentUser: User;
  onRenewSuccess: () => void;
  onLogout: () => void;
  lang: Language;
}

export default function SubscriptionExpiredScreen({
  currentUser,
  onRenewSuccess,
  onLogout,
  lang,
}: SubscriptionExpiredScreenProps) {
  const [operator, setOperator] = useState<'momo' | 'orange' | null>(null);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'details' | 'payment-select' | 'processing' | 'ussd-prompt' | 'success'>('details');
  const [error, setError] = useState('');

  const handleStartRenewal = () => {
    setStep('payment-select');
  };

  const handlePaymentSelect = (selectedOp: 'momo' | 'orange') => {
    setOperator(selectedOp);
    setStep('processing');
    setError('');

    // Simulate direct request
    setTimeout(() => {
      setStep('ussd-prompt');
    }, 1500);
  };

  const handleConfirmPIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError(lang === 'fr' ? 'Le code PIN doit comporter exactement 4 chiffres.' : 'The PIN code must be exactly 4 digits.');
      return;
    }

    setError('');
    setStep('processing');

    // Simulate final transaction processing
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const handleBackToSelect = () => {
    setOperator(null);
    setPin('');
    setError('');
    setStep('payment-select');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans" id="subscription-expired-screen">
      {/* Background ambient red glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-25"></div>

      <div className="max-w-md w-full relative z-10">
        <AnimatePresence mode="wait">
          
          {/* Step 1: Details & Explanation */}
          {step === 'details' && (
            <motion.div
              key="step-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/5 animate-pulse">
                <ShieldAlert className="w-9 h-9" />
              </div>

              <div className="text-center space-y-2">
                <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">
                  {lang === 'fr' ? 'Accès Interrompu' : 'Access Interrupted'}
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {lang === 'fr' ? 'Abonnement Expiré ⚠️' : 'Subscription Expired ⚠️'}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'fr' ? (
                    <>Bonjour <strong className="text-white">{currentUser.name}</strong>, votre accès membre de 3 mois à la plateforme <strong className="text-indigo-400">Bafoussam Direct</strong> est arrivé à son terme.</>
                  ) : (
                    <>Hello <strong className="text-white">{currentUser.name}</strong>, your 3-month member access to the <strong className="text-indigo-400">Bafoussam Direct</strong> platform has come to an end.</>
                  )}
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <p className="text-[11px] text-slate-400 leading-normal">
                  {lang === 'fr' 
                    ? "Conformément aux règles de la plateforme locale, pour contrer l'arnaque et assurer le maintien du service de livraison rapide dans Bafoussam, un abonnement actif est obligatoire pour utiliser le site."
                    : "In accordance with local platform rules, to prevent scams and ensure the maintenance of fast delivery services in Bafoussam, an active subscription is required to use the site."}
                </p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">{lang === 'fr' ? 'Ancien accès expiré le :' : 'Old access expired on:'}</span>
                  <span className="font-mono text-red-400 font-bold">
                    {currentUser.subscriptionExpiryDate ? new Date(currentUser.subscriptionExpiryDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Récemment'}
                  </span>
                </div>
              </div>

               <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 flex justify-between items-center">
                 <div>
                   <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">
                     {lang === 'fr' ? 'Tarif de Renouvellement' : 'Renewal Fee'}
                   </span>
                   <span className="text-xl font-black text-white mt-0.5 block">3 000 FCFA</span>
                   <span className="text-[10px] text-orange-400 font-semibold block">
                     {lang === 'fr' ? 'Versé directement sur Orange : 640406412' : 'Paid directly on Orange: 640406412'}
                   </span>
                 </div>
                 <div className="bg-indigo-600/20 text-indigo-300 font-bold text-[10px] py-1.5 px-3 rounded-lg border border-indigo-500/30">
                   {lang === 'fr' ? 'Sécurisé MoMo/Orange' : 'Secure MoMo/Orange'}
                 </div>
               </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleStartRenewal}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Renouveler mon abonnement maintenant' : 'Renew my subscription now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onLogout}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  {lang === 'fr' ? 'Se déconnecter' : 'Log Out'}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 text-center text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {lang === 'fr' ? 'Support d\'assistance de la Mifi :' : 'Mifi support helpline:'} <a href="tel:640406412" className="text-indigo-400 underline">640 40 64 12</a>
                </span>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Payment Method */}
          {step === 'payment-select' && (
            <motion.div
              key="step-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-white">{lang === 'fr' ? 'Mode de Paiement local' : 'Local Payment Method'}</h3>
                <p className="text-xs text-slate-400">
                  {lang === 'fr' 
                    ? <>Le montant de 3 000 FCFA sera versé directement sur le numéro Orange Money <strong className="text-orange-500">640406412</strong></>
                    : <>The amount of 3,000 FCFA will be paid directly to Orange Money number <strong className="text-orange-500">640406412</strong></>}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {/* MTN MoMo Button */}
                <button
                  onClick={() => handlePaymentSelect('momo')}
                  className="w-full bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl flex items-center justify-between transition group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center text-slate-950 font-black text-base shadow-md">
                      momo
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-sm">MTN Mobile Money</p>
                      <p className="text-[10px] text-slate-400">{lang === 'fr' ? 'Paiement instantané par USSD MTN Cameroun' : 'Instant payment via MTN Cameroon USSD'}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition" />
                </button>

                {/* Orange Money Button */}
                <button
                  onClick={() => handlePaymentSelect('orange')}
                  className="w-full bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/25 p-4 rounded-2xl flex items-center justify-between transition group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                      Orange
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-sm">Orange Money</p>
                      <p className="text-[10px] text-slate-400">{lang === 'fr' ? 'Paiement rapide via USSD Orange Cameroun' : 'Fast payment via Orange Cameroon USSD'}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {lang === 'fr' ? 'Numéro de débit de la souscription' : 'Debit number for the subscription'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 677 89 45 12"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-center font-bold tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  {lang === 'fr' ? 'Retour' : 'Back'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Processing loading */}
          {step === 'processing' && (
            <motion.div
              key="step-processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6"
            >
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-white">{lang === 'fr' ? 'Connexion à la passerelle de l\'Ouest...' : 'Connecting to the West gateway...'}</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal">
                  {lang === 'fr' 
                    ? 'Génération de la facture et initialisation du prélèvement sécurisé de 3 000 FCFA. Veuillez ne pas quitter.'
                    : 'Generating bill and initiating secure collection of 3,000 FCFA. Please do not leave.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 4: USSD PIN Prompt simulated overlay */}
          {step === 'ussd-prompt' && (
            <motion.div
              key="step-ussd"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm shrink-0 ${
                  operator === 'momo' ? 'bg-amber-400 text-slate-950' : 'bg-orange-500 text-white'
                }`}>
                  {operator === 'momo' ? 'momo' : 'Orange'}
                </div>
                <div>
                  <p className="font-extrabold text-slate-200 text-xs uppercase">{lang === 'fr' ? 'Autorisation requise' : 'Authorization required'}</p>
                  <p className="text-[10px] text-slate-400">
                    {lang === 'fr'
                      ? <>Transfert de 3 000 FCFA directement vers Orange Money <span className="font-bold text-amber-400">640406412</span></>
                      : <>Transfer of 3,000 FCFA directly to Orange Money <span className="font-bold text-amber-400">640406412</span></>}
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmPIN} className="space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-white">{lang === 'fr' ? 'Saisissez votre code PIN de Test' : 'Enter your Test PIN code'}</h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'fr' 
                      ? 'Pour simuler la validation Mobile Money locale (entrez n\'importe quel code à 4 chiffres)'
                      : 'To simulate local Mobile Money validation (enter any 4-digit code)'}
                  </p>
                </div>

                <div className="relative max-w-[180px] mx-auto">
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full text-center px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xl tracking-widest font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white"
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-[11px] text-red-500 font-bold text-center animate-pulse">⚠️ {error}</p>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleBackToSelect}
                    className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    {lang === 'fr' ? "Changer d'opérateur" : "Change operator"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    {lang === 'fr' ? 'Valider le Paiement' : 'Validate Payment'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 5: Success state */}
          {step === 'success' && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">{lang === 'fr' ? 'Paiement Approuvé 🎉' : 'Payment Approved 🎉'}</span>
                <h3 className="text-xl font-black text-white">{lang === 'fr' ? 'Abonnement Réactivé !' : 'Subscription Reactivated!'}</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {lang === 'fr' ? (
                    <>Votre versement de 3 000 FCFA sur le numéro Orange <strong className="text-emerald-400">640406412</strong> a été validé avec succès. Votre accès illimité de 3 mois à Bafoussam Direct est de nouveau opérationnel !</>
                  ) : (
                    <>Your payment of 3,000 FCFA to Orange number <strong className="text-emerald-400">640406412</strong> was successfully validated. Your 3-month unlimited access to Bafoussam Direct is active once again!</>
                  )}
                </p>
              </div>

              <button
                onClick={onRenewSuccess}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{lang === 'fr' ? 'Accéder à la plateforme' : 'Access the platform'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
