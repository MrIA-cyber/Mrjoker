import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Maximize2, Layers, CheckCircle2, ShieldCheck, Download, Eye, Smartphone, ArrowRight, Grid, Filter, RefreshCw, X } from 'lucide-react';

import Screen2Onboarding from './Screen2Onboarding';
import Screen3Connexion from './Screen3Connexion';
import Screen4Inscription from './Screen4Inscription';
import Screen5TypeCompte from './Screen5TypeCompte';
import Screen6DashboardClient from './Screen6DashboardClient';
import Screen7Marketplace from './Screen7Marketplace';
import Screen8DetailProduit from './Screen8DetailProduit';
import Screen9Panier from './Screen9Panier';
import Screen10Paiement from './Screen10Paiement';

interface ShowcasePlanche8KProps {
  onSelectScreenToPreview?: (screenNumber: number) => void;
  onCloseShowcase?: () => void;
}

export default function ShowcasePlanche8K({ onSelectScreenToPreview, onCloseShowcase }: ShowcasePlanche8KProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'auth' | 'shopping' | 'checkout'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedModalScreen, setSelectedModalScreen] = useState<number | null>(null);

  const screens = [
    {
      num: 2,
      category: 'auth',
      title: 'ÉCRAN 2 — ONBOARDING',
      subtitle: '3 Slides interactifs avec illustrations vectorielles & bénéfices',
      component: <Screen2Onboarding />
    },
    {
      num: 3,
      category: 'auth',
      title: 'ÉCRAN 3 — CONNEXION',
      subtitle: 'Login Email, Password, Google, Facebook & Mot de passe oublié',
      component: <Screen3Connexion />
    },
    {
      num: 4,
      category: 'auth',
      title: 'ÉCRAN 4 — INSCRIPTION',
      subtitle: 'Formulaire de création de compte rapide & Conditions d’utilisation',
      component: <Screen4Inscription />
    },
    {
      num: 5,
      category: 'auth',
      title: 'ÉCRAN 5 — CHOIX DU TYPE DE COMPTE',
      subtitle: 'Client, Vendeur, Entreprise & Prestataire de service',
      component: <Screen5TypeCompte />
    },
    {
      num: 6,
      category: 'shopping',
      title: 'ÉCRAN 6 — TABLEAU DE BORD CLIENT',
      subtitle: 'Bannière panoramique Bafoussam, 8 Catégories & Promotions',
      component: <Screen6DashboardClient />
    },
    {
      num: 7,
      category: 'shopping',
      title: 'ÉCRAN 7 — MARKETPLACE',
      subtitle: 'Barre de recherche, Filtres, Samsung, Nike, Sac & Montre',
      component: <Screen7Marketplace />
    },
    {
      num: 8,
      category: 'shopping',
      title: 'ÉCRAN 8 — DÉTAIL PRODUIT',
      subtitle: 'Galerie HD, Vendeur vérifié, Fiche technique & Avis clients',
      component: <Screen8DetailProduit />
    },
    {
      num: 9,
      category: 'checkout',
      title: 'ÉCRAN 9 — PANIER',
      subtitle: 'Gestion des quantites, Frais de livraison & Sous-totaux',
      component: <Screen9Panier />
    },
    {
      num: 10,
      category: 'checkout',
      title: 'ÉCRAN 10 — PAIEMENT SÉCURISÉ',
      subtitle: 'MoMo, Orange Money, Visa, Mastercard, PayPal & SSL 256-bit',
      component: <Screen10Paiement />
    }
  ];

  const filteredScreens = screens.filter(s => {
    if (activeFilter === 'all') return true;
    return s.category === activeFilter;
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-8 font-sans selection:bg-[#16A34A] selection:text-white relative">
      
      {/* 8K Showcase Board Top Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        
        {/* Background Decorative Ambient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#16A34A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 text-xs font-black border border-emerald-300 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Planche de Présentation 8K • Investisseurs & Équipe Devs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              Bafoussam Market — <span className="bg-gradient-to-r from-[#16A34A] to-emerald-500 bg-clip-text text-transparent">Écrans 2 à 10</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Super App officielle de la ville de Bafoussam. Design System 2026 complet comprenant Onboarding, Authentification, Tableau de bord, Marketplace, Fiche Produit, Panier et Paiement Sécurisé.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onCloseShowcase && (
              <button
                onClick={onCloseShowcase}
                className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-2xl hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <X className="w-4 h-4" />
                <span>Quitter la planche</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Tous les 9 écrans (2-10)' },
              { id: 'auth', label: 'Auth & Onboarding (2-5)' },
              { id: 'shopping', label: 'E-Commerce (6-8)' },
              { id: 'checkout', label: 'Panier & Paiement (9-10)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-[#16A34A] text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Grid className="w-4 h-4 text-[#16A34A]" />
            <span>Affichage 8K Aligné (9 Écrans)</span>
          </div>
        </div>

      </div>

      {/* 8K Presentation Board Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredScreens.map((screen) => (
          <motion.div
            key={screen.num}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: screen.num * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition duration-300 flex flex-col justify-between group relative"
          >
            {/* Screen Header Badge */}
            <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16A34A] tracking-wider">
                  N° {screen.num} SUR 10
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white font-display">
                  {screen.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedModalScreen(screen.num)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#16A34A] hover:text-white text-slate-600 dark:text-slate-300 transition flex items-center justify-center cursor-pointer shadow-xs"
                title="Agrandir l'écran"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Smartphone Mockup Frame */}
            <div className="w-full flex justify-center my-2 scale-95 hover:scale-100 transition-transform duration-300">
              <div className="w-full max-w-[360px] rounded-[36px] bg-slate-900 p-2.5 shadow-2xl border-4 border-slate-800 relative">
                {/* Camera Hole Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-950 rounded-full z-20" />
                
                {/* Screen Component */}
                <div className="rounded-[28px] overflow-hidden bg-slate-950">
                  {screen.component}
                </div>
              </div>
            </div>

            {/* Screen Description Subtitle */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {screen.subtitle}
              </p>
              <button
                onClick={() => {
                  if (onSelectScreenToPreview) onSelectScreenToPreview(screen.num);
                  else setSelectedModalScreen(screen.num);
                }}
                className="text-xs font-black text-[#16A34A] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Tester</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </motion.div>
        ))}
      </div>

      {/* Fullscreen Interactive Modal for Screen Preview */}
      <AnimatePresence>
        {selectedModalScreen !== null && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 max-w-lg w-full relative shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-[#16A34A] uppercase">Aperçu HD Écran {selectedModalScreen}</span>
                  <h2 className="text-lg font-black text-white">Bafoussam Market Super App</h2>
                </div>
                <button
                  onClick={() => setSelectedModalScreen(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full flex justify-center py-2">
                <div className="w-full max-w-[380px] rounded-[36px] bg-slate-950 p-2 shadow-2xl border-4 border-slate-800">
                  {selectedModalScreen === 2 && <Screen2Onboarding />}
                  {selectedModalScreen === 3 && <Screen3Connexion />}
                  {selectedModalScreen === 4 && <Screen4Inscription />}
                  {selectedModalScreen === 5 && <Screen5TypeCompte />}
                  {selectedModalScreen === 6 && <Screen6DashboardClient />}
                  {selectedModalScreen === 7 && <Screen7Marketplace />}
                  {selectedModalScreen === 8 && <Screen8DetailProduit />}
                  {selectedModalScreen === 9 && <Screen9Panier />}
                  {selectedModalScreen === 10 && <Screen10Paiement />}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <button
                  onClick={() => setSelectedModalScreen(null)}
                  className="px-6 py-2.5 bg-[#16A34A] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Fermer l'aperçu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
