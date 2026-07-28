import React from 'react';
import { User } from '../types';
import { AlertCircle, Clock, Sparkles, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../translations';

interface SubscriptionNotificationBannerProps {
  currentUser: User | null;
  onOpenSubscriptionModal: () => void;
  lang: Language;
}

export default function SubscriptionNotificationBanner({
  currentUser,
  onOpenSubscriptionModal,
  lang,
}: SubscriptionNotificationBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);

  if (!currentUser || dismissed) return null;

  // Calculate remaining trial or subscription days
  let title = '';
  let message = '';
  let isUrgent = false;
  let showBanner = false;

  const now = new Date();

  if (currentUser.isInTrial && currentUser.trialExpiryDate) {
    const trialExpiry = new Date(currentUser.trialExpiryDate);
    const diffMs = trialExpiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      showBanner = true;
      isUrgent = true;
      title = lang === 'fr' ? "Essai Gratuit Terminé" : "Free Trial Ended";
      message = lang === 'fr' 
        ? "Votre période d'essai gratuit est terminée. Abonnez-vous dès maintenant pour continuer d'en profiter." 
        : "Your free trial period has ended. Subscribe now to continue enjoying access.";
    } else if (diffDays === 1) {
      showBanner = true;
      isUrgent = true;
      title = lang === 'fr' ? "Essai Gratuit Expire Demain" : "Free Trial Expires Tomorrow";
      message = lang === 'fr' 
        ? "Attention, votre essai gratuit prend fin demain. Pensez à choisir votre abonnement !" 
        : "Warning, your free trial ends tomorrow. Choose your subscription plan!";
    } else if (diffDays <= 3) {
      showBanner = true;
      title = lang === 'fr' ? "Rappel d'Essai Gratuit" : "Free Trial Reminder";
      message = lang === 'fr' 
        ? `Il ne vous reste que ${diffDays} jours d'essai gratuit. Découvrez nos formules adaptées.` 
        : `You only have ${diffDays} days left in your free trial. Discover our suitable plans.`;
    }
  } else if (currentUser.isSubscribed && currentUser.subscriptionExpiryDate) {
    const expiry = new Date(currentUser.subscriptionExpiryDate);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      showBanner = true;
      isUrgent = true;
      title = lang === 'fr' ? "Abonnement Expiré" : "Subscription Expired";
      message = lang === 'fr' 
        ? "Votre abonnement est arrivé à son terme aujourd'hui. Renouvelez-le pour conserver tous vos avantages." 
        : "Your subscription has come to an end today. Renew it to keep all your benefits.";
    } else if (diffDays === 1) {
      showBanner = true;
      isUrgent = true;
      title = lang === 'fr' ? "Abonnement Expire Demain ⚠️" : "Subscription Expires Tomorrow ⚠️";
      message = lang === 'fr' 
        ? "Votre abonnement prend fin demain ! Effectuez votre renouvellement rapide." 
        : "Your subscription ends tomorrow! Complete your quick renewal.";
    } else if (diffDays <= 3) {
      showBanner = true;
      title = lang === 'fr' ? `Expiration dans ${diffDays} Jours` : `Expires in ${diffDays} Days`;
      message = lang === 'fr' 
        ? `Votre abonnement arrive à échéance dans ${diffDays} jours.` 
        : `Your subscription expires in ${diffDays} days.`;
    } else if (diffDays <= 7) {
      showBanner = true;
      title = lang === 'fr' ? `Pensez à votre renouvellement (${diffDays} J)` : `Renewal Reminder (${diffDays} D)`;
      message = lang === 'fr' 
        ? `Votre abonnement expire dans ${diffDays} jours.` 
        : `Your subscription expires in ${diffDays} days.`;
    }
  }

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`w-full py-3 px-4 sm:px-6 relative z-30 border-b shadow-md flex items-center justify-between gap-4 font-sans ${
          isUrgent
            ? 'bg-rose-950/90 border-rose-800 text-white'
            : 'bg-indigo-950/90 border-indigo-800 text-white'
        }`}
        id="subscription-notification-banner"
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${isUrgent ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-wide mr-2 uppercase">
                {title} :
              </span>
              <span className="text-xs text-slate-200 font-medium">{message}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <button
              onClick={onOpenSubscriptionModal}
              className={`text-xs font-black px-4 py-2 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5 ${
                isUrgent
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <span>{lang === 'fr' ? 'S\'abonner / Renouveler' : 'Subscribe / Renew'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
