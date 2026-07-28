import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight, CheckCircle2, Building2, Store, Truck, Sparkles, ShieldCheck, Car, Coffee, Hotel, Pill, Scissors, Wallet, Briefcase, MapPin, ChevronRight } from 'lucide-react';

interface Screen2OnboardingProps {
  onNext?: () => void;
  onSkip?: () => void;
}

export default function Screen2Onboarding({ onNext, onSkip }: Screen2OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: "Marketplace locale • Bafoussam",
      title: "Tout Bafoussam à portée de clic",
      subtitle: "Achetez rapidement dans les meilleures boutiques locales.",
      illustration: (
        <div className="relative w-full h-56 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-blue-950 rounded-3xl p-6 border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />

          {/* Central Shop & Phone Graphic */}
          <div className="relative z-10 flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-32 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow-xl flex flex-col items-center justify-between"
            >
              <div className="w-8 h-1 bg-white/40 rounded-full" />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                B
              </div>
              <div className="w-full bg-emerald-500/20 rounded-lg p-1.5 flex items-center justify-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] text-white font-semibold">Boutique</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-2"
            >
              <div className="p-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 text-white flex items-center gap-2 shadow-lg">
                <Store className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold">Commerce Local</div>
                  <div className="text-[10px] text-slate-300">Marché A & B Bafoussam</div>
                </div>
              </div>
              <div className="p-3 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 text-white flex items-center gap-2 shadow-lg">
                <Truck className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold">Livraison Express</div>
                  <div className="text-[10px] text-slate-300">En 30 minutes chez vous</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      badge: "Services & Réservations",
      title: "Réservez vos services",
      subtitle: "Trouvez et réservez facilement vos services au quotidien.",
      illustration: (
        <div className="relative w-full h-56 bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 rounded-3xl p-6 border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
          
          <div className="grid grid-cols-3 gap-3 relative z-10 w-full max-w-xs">
            {[
              { icon: Car, label: "Taxi Bafoussam", color: "from-amber-500 to-amber-600" },
              { icon: Coffee, label: "Restaurant", color: "from-orange-500 to-red-500" },
              { icon: Hotel, label: "Hôtel & Sejour", color: "from-blue-500 to-indigo-600" },
              { icon: Pill, label: "Pharmacie 24/7", color: "from-emerald-500 to-teal-600" },
              { icon: Scissors, label: "Coiffeur & Beauté", color: "from-pink-500 to-rose-600" },
              { icon: Wallet, label: "MoMo & Orange", color: "from-emerald-600 to-green-700" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center group hover:bg-white/20 transition cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-1 shadow-md`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-slate-200 leading-tight">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 3,
      badge: "Écosystème Numérique Global",
      title: "Une Super App pour toute la ville",
      subtitle: "L'écosystème numérique complet réunissant commerces, services, opportunités et paiements.",
      illustration: (
        <div className="relative w-full h-56 bg-gradient-to-br from-[#4F46E5]/40 via-slate-900 to-[#10B981]/30 rounded-3xl p-6 border border-white/10 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Glowing central Bafoussam Shield */}
          <div className="relative z-10 flex items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4F46E5] via-[#2563EB] to-[#10B981] p-0.5 shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-2xl font-black text-white">BAF</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Super App Officielle</span>
              <span className="text-lg font-bold text-white">Bafoussam Market</span>
              <span className="text-[11px] text-slate-300">Marketplace • IA • Emplois • Immobilier</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5 relative z-10">
            {['Marketplace', 'Paiement', 'IA', 'Livraison', 'Emploi', 'Immobilier', 'Événements'].map((tag, i) => (
              <span key={i} className="text-[10px] font-semibold bg-white/10 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-slate-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )
    }
  ];

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 p-6 flex flex-col justify-between min-h-[580px] relative">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-xs shadow-md">
            B
          </div>
          <span className="text-xs font-bold tracking-wider text-slate-300">ÉCRAN 2 — ONBOARDING</span>
        </div>
        {onSkip && (
          <button 
            onClick={onSkip}
            className="text-xs text-slate-400 hover:text-white transition cursor-pointer px-3 py-1 rounded-full bg-white/5 border border-white/10"
          >
            Passer
          </button>
        )}
      </div>

      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
          className="my-auto py-4 space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slides[currentSlide].badge}</span>
          </div>

          {/* Illustration Graphic */}
          {slides[currentSlide].illustration}

          {/* Title & Description */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black text-white font-display leading-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              {slides[currentSlide].subtitle}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Pagination & Next Button */}
      <div className="space-y-4 pt-2 z-10">
        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-md shadow-emerald-500/30' 
                  : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNextSlide}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-[#16A34A] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 border border-emerald-400/20"
        >
          <span>{currentSlide === slides.length - 1 ? "Commencer l'expérience" : "Suivant"}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
