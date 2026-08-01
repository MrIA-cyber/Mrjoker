import React, { useState } from 'react';
import { User, AccountType, SubscriptionPlan, SubscriptionInvoice } from '../types';
import { INITIAL_SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard, 
  Smartphone, 
  FileText, 
  Download, 
  X, 
  Loader2, 
  Clock, 
  HelpCircle, 
  Zap, 
  Award,
  Calendar,
  Building2,
  Store,
  Briefcase,
  User as UserIcon,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../translations';
import SupportPhoneNumber from './SupportPhoneNumber';
import PhoneCountryInput from './PhoneCountryInput';

interface PremiumSubscriptionScreenProps {
  currentUser: User | null;
  onUpdateCurrentUser: (user: User) => void;
  onClose?: () => void;
  lang: Language;
  initialSelectedPlan?: AccountType;
}

export default function PremiumSubscriptionScreen({
  currentUser,
  onUpdateCurrentUser,
  onClose,
  lang,
  initialSelectedPlan = 'vendeur',
}: PremiumSubscriptionScreenProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_custom_subscription_plans');
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTION_PLANS;
    } catch {
      return INITIAL_SUBSCRIPTION_PLANS;
    }
  });

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<AccountType>(initialSelectedPlan);
  
  // Payment Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'orange' | 'visa' | 'mastercard'>('momo');
  const [paymentPhone, setPaymentPhone] = useState(currentUser?.phone || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [pin, setPin] = useState('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [createdInvoice, setCreatedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [paymentError, setPaymentError] = useState('');

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleStartSubscribe = (planId: AccountType) => {
    setSelectedPlanId(planId);
    setPaymentStep('form');
    setPaymentError('');
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (paymentMethod === 'momo' || paymentMethod === 'orange') {
      if (!paymentPhone.trim() || paymentPhone.trim().length < 8) {
        setPaymentError(lang === 'fr' ? 'Veuillez saisir un numéro de téléphone valide.' : 'Please enter a valid phone number.');
        return;
      }
    } else {
      if (!cardNumber.trim() || cardNumber.length < 12) {
        setPaymentError(lang === 'fr' ? 'Numéro de carte bancaire invalide.' : 'Invalid credit card number.');
        return;
      }
    }

    if (pin.length !== 4) {
      setPaymentError(lang === 'fr' ? 'Le code PIN de validation doit comporter 4 chiffres.' : 'PIN code must be 4 digits.');
      return;
    }

    setPaymentStep('processing');

    // Simulate instant transaction verification
    setTimeout(() => {
      const now = new Date();
      const startDateIso = now.toISOString();
      const expiryDate = new Date(now);
      
      if (billingCycle === 'monthly') {
        expiryDate.setDate(expiryDate.getDate() + 30);
      } else {
        expiryDate.setDate(expiryDate.getDate() + 365);
      }

      const expiryDateIso = expiryDate.toISOString();
      const amount = billingCycle === 'monthly' ? activePlan.monthlyPrice : activePlan.yearlyPrice;
      const ref = `${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const newInvoice: SubscriptionInvoice = {
        id: `inv-${Date.now()}`,
        userId: currentUser?.id || 'u-guest',
        userName: currentUser?.name || 'Abonné Bafoussam',
        userPhone: paymentPhone || currentUser?.phone || '690000000',
        planId: activePlan.id,
        planName: activePlan.name,
        duration: billingCycle,
        amount,
        paymentMethod,
        paymentRef: ref,
        createdAt: startDateIso,
        startDate: startDateIso,
        expiryDate: expiryDateIso,
      };

      setCreatedInvoice(newInvoice);

      // Update user state and local storage
      if (currentUser) {
        const updatedHistory = [newInvoice, ...(currentUser.paymentHistory || [])];
        const updatedUser: User = {
          ...currentUser,
          accountType: activePlan.id,
          subscriptionPlan: activePlan.id,
          subscriptionDuration: billingCycle,
          subscriptionDate: startDateIso,
          subscriptionExpiryDate: expiryDateIso,
          isSubscribed: true,
          hasPaidFee: true,
          isInTrial: false,
          hasCompletedTrial: true,
          paymentHistory: updatedHistory,
        };

        onUpdateCurrentUser(updatedUser);

        // Update in global registered users array
        try {
          const savedUsersStr = localStorage.getItem('bafoussam_all_registered_users');
          if (savedUsersStr) {
            const savedUsers = JSON.parse(savedUsersStr);
            if (Array.isArray(savedUsers)) {
              const updatedUsers = savedUsers.map((u: any) =>
                u.id === currentUser.id || u.phone === currentUser.phone ? updatedUser : u
              );
              localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(updatedUsers));
            }
          }
        } catch (err) {
          console.error("Erreur de sauvegarde de l'utilisateur abonné:", err);
        }
      }

      setPaymentStep('success');
    }, 1800);
  };

  const handleDownloadInvoice = () => {
    if (!createdInvoice) return;

    // Trigger browser printable invoice sheet window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Veuillez autoriser les fenêtres surgissantes pour télécharger votre facture PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture d'Abonnement #${createdInvoice.id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; margin: 40px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-b: 2px solid #16a34a; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 900; color: #16a34a; }
          .badge { background: #dcfce7; color: #15803d; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; }
          .section { margin-top: 30px; }
          .grid { display: flex; justify-content: space-between; margin-top: 20px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; width: 48%; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th { background: #0f172a; color: white; text-align: left; padding: 12px; font-size: 12px; uppercase; }
          td { border-bottom: 1px solid #e2e8f0; padding: 12px; font-size: 14px; }
          .total { margin-top: 30px; text-align: right; font-size: 20px; font-weight: 900; color: #16a34a; }
          .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #64748b; border-t: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">AFRINOVA</div>
            <div style="font-size: 12px; color: #64748b;">L'Afrique connectée au monde.</div>
          </div>
          <div class="badge">PAYÉ - ACCÈS ACTIF</div>
        </div>

        <div class="section">
          <h2>FACTURE D'ABONNEMENT #${createdInvoice.id.toUpperCase()}</h2>
          <p>Date d'émission : ${new Date(createdInvoice.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <div class="grid">
          <div class="box">
            <strong>CLIENT / ABONNÉ</strong><br/>
            Nom : ${createdInvoice.userName}<br/>
            Téléphone : ${createdInvoice.userPhone}<br/>
            ID Utilisateur : ${createdInvoice.userId}
          </div>
          <div class="box">
            <strong>DÉTAILS DU PAIEMENT</strong><br/>
            Mode : ${createdInvoice.paymentMethod.toUpperCase()}<br/>
            Référence Trans. : ${createdInvoice.paymentRef}<br/>
            Période : ${createdInvoice.duration === 'monthly' ? 'Mensuel (30 Jours)' : 'Annuel (365 Jours)'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Désignation de la formule</th>
              <th>Période d'accès</th>
              <th>Montant HT</th>
              <th>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${createdInvoice.planName}</strong> (${createdInvoice.planId.toUpperCase()})</td>
              <td>Du ${new Date(createdInvoice.startDate).toLocaleDateString('fr-FR')} au ${new Date(createdInvoice.expiryDate).toLocaleDateString('fr-FR')}</td>
              <td>${createdInvoice.amount.toLocaleString('fr-FR')} FCFA</td>
              <td><strong>${createdInvoice.amount.toLocaleString('fr-FR')} FCFA</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          MONTANT TOTAL PAYÉ : ${createdInvoice.amount.toLocaleString('fr-FR')} FCFA
        </div>

        <div class="footer">
          Merci pour votre confiance en AfriNova. Ce document sert de reçu officiel de paiement.<br/>
          Support & Hotline Mifi : +237 677 89 45 12 / +237 690 00 00 00
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getPlanIcon = (planId: AccountType) => {
    switch (planId) {
      case 'client':
        return <UserIcon className="w-6 h-6 text-emerald-500" />;
      case 'vendeur':
        return <Store className="w-6 h-6 text-indigo-500" />;
      case 'prestataire':
        return <Briefcase className="w-6 h-6 text-purple-500" />;
      case 'entreprise':
        return <Building2 className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden" id="premium-subscription-screen">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Header / Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/5">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Offres d'Abonnement AfriNova</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display leading-tight">
            Choisissez la Formule Réellement Adaptée à vos Besoins
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Débloquez le plein potentiel de la plateforme AfriNova. Bénéficiez d'un essai gratuit sans engagement, puis abonnez-vous en toute sérénité.
          </p>

          {/* Toggle Mensuel / Annuel */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-2xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Paiement Mensuel (30 Jours)
              </button>

              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Paiement Annuel (365 Jours)</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Économie -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const savings = (plan.monthlyPrice * 12) - plan.yearlyPrice;
            const isCurrent = currentUser?.accountType === plan.id && currentUser?.isSubscribed;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`bg-slate-900/90 border rounded-3xl p-6 flex flex-col justify-between relative shadow-2xl overflow-hidden transition ${
                  plan.recommended
                    ? 'border-emerald-500/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Badge */}
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-teal-600 text-slate-950 font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-bl-2xl shadow-lg">
                    ★ Recommandé
                  </div>
                )}

                <div className="space-y-5">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner">
                      {getPlanIcon(plan.id)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {plan.badge || 'Formule'}
                      </span>
                      <h3 className="text-lg font-black text-white">{plan.name}</h3>
                    </div>
                  </div>

                  {/* Free Trial Tag */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-2.5 text-center text-xs font-bold flex items-center justify-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Essai Gratuit : {plan.trialDays} Jours Offerts</span>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white font-mono tracking-tight">
                        {price.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs font-extrabold text-slate-400">FCFA</span>
                      <span className="text-xs text-slate-500 font-semibold">
                        / {billingCycle === 'monthly' ? 'mois' : 'an'}
                      </span>
                    </div>

                    {billingCycle === 'yearly' && (
                      <p className="text-[10px] text-amber-400 font-bold">
                        🎉 Économisez {savings.toLocaleString('fr-FR')} FCFA par an !
                      </p>
                    )}
                  </div>

                  <hr className="border-slate-800" />

                  {/* Features List */}
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Inclus dans cette formule :
                    </p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight font-medium text-slate-200">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscribe Action Button */}
                <div className="pt-6 mt-6 border-t border-slate-800/80">
                  {isCurrent ? (
                    <div className="w-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold py-3.5 px-4 rounded-xl text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Abonnement Actuel</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartSubscribe(plan.id)}
                      className={`w-full text-xs font-black py-3.5 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                        plan.recommended
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>S'abonner Maintenant</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ & Support Section */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 text-center">
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Engagements & Sécurité des Abonnements</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Vos données et activités restent toujours conservées en toute sécurité, même en cas d'expiration. Vous pouvez renouveler ou ajuster votre formule à tout moment via Mobile Money ou Carte Bancaire.
          </p>
          <div className="pt-2">
            <SupportPhoneNumber
              prefix="Assistance abonnements & Hotline Mifi :"
              showIcon
              className="text-xs text-indigo-400 font-bold"
            />
          </div>
        </div>

      </div>

      {/* Payment Drawer / Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {paymentStep === 'form' && (
                <form onSubmit={handleProcessPayment} className="space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      Paiement Sécurisé
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Souscription au {activePlan.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Montant total : <strong className="text-white font-mono">{ (billingCycle === 'monthly' ? activePlan.monthlyPrice : activePlan.yearlyPrice).toLocaleString('fr-FR')} FCFA</strong> ({billingCycle === 'monthly' ? '30 Jours' : '365 Jours'})
                    </p>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Choisissez votre mode de paiement local
                    </label>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('momo')}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                          paymentMethod === 'momo'
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                          momo
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-white">MTN MoMo</p>
                          <p className="text-[9px] text-slate-400">Cameroon USSD</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('orange')}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                          paymentMethod === 'orange'
                            ? 'bg-orange-500/15 border-orange-500 text-orange-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          Orange
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-white">Orange Money</p>
                          <p className="text-[9px] text-slate-400">Cameroon USSD</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('visa')}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                          paymentMethod === 'visa'
                            ? 'bg-blue-500/15 border-blue-500 text-blue-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          VISA
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-white">Carte Visa</p>
                          <p className="text-[9px] text-slate-400">Internationale</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mastercard')}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                          paymentMethod === 'mastercard'
                            ? 'bg-red-500/15 border-red-500 text-red-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          MC
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-white">Mastercard</p>
                          <p className="text-[9px] text-slate-400">Internationale</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Inputs according to Payment Method */}
                  {(paymentMethod === 'momo' || paymentMethod === 'orange') ? (
                    <div>
                      <PhoneCountryInput
                        id="premium-sub-phone"
                        label="Numéro de téléphone du compte"
                        required
                        value={paymentPhone}
                        lang={lang}
                        onChange={(fullNum) => setPaymentPhone(fullNum)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Numéro de Carte Bancaire
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Expiration (MM/AA)
                          </label>
                          <input
                            type="text"
                            placeholder="12/28"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            CVC
                          </label>
                          <input
                            type="password"
                            maxLength={3}
                            placeholder="123"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PIN Code for simulated confirmation */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
                      Code PIN de Validation (Saisissez n'importe quel code à 4 chiffres)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-[140px] mx-auto block px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-center text-lg font-extrabold text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {paymentError && (
                    <p className="text-xs text-red-500 font-bold text-center animate-pulse">
                      ⚠️ {paymentError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Confirmer et Payer {(billingCycle === 'monthly' ? activePlan.monthlyPrice : activePlan.yearlyPrice).toLocaleString('fr-FR')} FCFA</span>
                  </button>
                </form>
              )}

              {paymentStep === 'processing' && (
                <div className="py-12 text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
                  <h4 className="font-extrabold text-base text-white">Traitement du Paiement en cours...</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Veuillez patienter pendant la validation auprès des serveurs de paiement de Bafoussam.
                  </p>
                </div>
              )}

              {paymentStep === 'success' && createdInvoice && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      Paiement Confirmé !
                    </span>
                    <h3 className="text-2xl font-black text-white">Abonnement Activé Avec Succès 🎉</h3>
                    <p className="text-xs text-slate-300">
                      Félicitations <strong className="text-white">{createdInvoice.userName}</strong>, votre formule <strong className="text-emerald-400">{createdInvoice.planName}</strong> est active jusqu'au <strong className="text-white font-mono">{new Date(createdInvoice.expiryDate).toLocaleDateString('fr-FR')}</strong>.
                    </p>
                  </div>

                  {/* Summary Invoice Card */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-left space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500 font-semibold">Réf. Transaction :</span>
                      <span className="font-mono font-bold text-slate-200">{createdInvoice.paymentRef}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500 font-semibold">Montant Réglé :</span>
                      <span className="font-mono font-bold text-emerald-400">{createdInvoice.amount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Mode de Règlement :</span>
                      <span className="font-bold uppercase text-slate-300">{createdInvoice.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadInvoice}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Télécharger la Facture PDF</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsPaymentModalOpen(false);
                        if (onClose) onClose();
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-lg cursor-pointer"
                    >
                      Accéder à la Plateforme Bafoussam Market
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
