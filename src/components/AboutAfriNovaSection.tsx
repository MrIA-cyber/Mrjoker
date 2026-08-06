import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Eye, 
  Target, 
  Award, 
  ShieldCheck, 
  Globe, 
  Heart, 
  Zap, 
  Lock,
  ChevronDown,
  Info
} from 'lucide-react';
import { AfriNovaLogo } from './AfriNovaLogo';

interface AboutAfriNovaSectionProps {
  className?: string;
  isCompact?: boolean;
}

export default function AboutAfriNovaSection({ className = '' }: AboutAfriNovaSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'vision' | 'mission'>('vision');

  const values = [
    { name: 'Innovation', desc: 'Technologies adaptées aux besoins africains', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Confiance', desc: 'Relation éthique et durable avec notre communauté', icon: ShieldCheck, color: 'text-[#16A34A] bg-[#16A34A]/10' },
    { name: 'Transparence', desc: 'Opérations claires, vérifiables et honnêtes', icon: Eye, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Sécurité', desc: 'Protection rigoureuse des données et paiements', icon: Lock, color: 'text-[#7C3AED] bg-[#7C3AED]/10' },
    { name: 'Qualité', desc: 'Exigence élevée sur les services et produits', icon: Award, color: 'text-emerald-600 bg-emerald-600/10' },
    { name: 'Excellence', desc: 'Recherche permanente de la performance', icon: Sparkles, color: 'text-indigo-500 bg-indigo-500/10' },
    { name: 'Inclusion', desc: 'Accessibilité pour tous les acteurs économiques', icon: Heart, color: 'text-rose-500 bg-rose-500/10' },
    { name: 'Développement', desc: 'Propulser l\'économie continentale', icon: Globe, color: 'text-emerald-700 bg-emerald-700/10' }
  ];

  return (
    <div className={`w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-3xs overflow-hidden transition-all ${className}`}>
      
      {/* ACCORDION HEADER BAR (CLOSED BY DEFAULT) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition active:scale-[0.995] min-h-[48px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#16A34A]/15 to-[#7C3AED]/15 text-[#16A34A] dark:text-emerald-400">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                À propos, Vision & Mission AfriNova
              </h3>
              <span className="bg-emerald-100 dark:bg-emerald-950/80 text-[#16A34A] dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              Plateforme panafricaine de technologie, commerce et services interconnectés
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-[#16A34A] hover:underline hidden sm:inline">
            {isOpen ? 'Masquer' : 'En savoir plus'}
          </span>
          <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#16A34A]' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* EXPANDABLE BODY CONTENT */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-4"
          >
            {/* Header Brand Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AfriNovaLogo variant="horizontal" size="sm" showText={true} showSlogan={false} />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                  "L'Afrique connectée au monde"
                </span>
              </div>
              <span className="text-xs font-bold text-[#16A34A] dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Plateforme Officielle Certifiée
              </span>
            </div>

            {/* VISION & MISSION CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Vision */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1.5 shadow-3xs">
                <div className="flex items-center gap-2 text-[#16A34A] dark:text-emerald-400 font-extrabold text-xs">
                  <Eye className="w-4 h-4" />
                  <h4>Notre Vision</h4>
                </div>
                <p className="text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                  Connecter consommateurs, boutiques, entreprises et prestataires au sein d'un écosystème numérique africain moderne, sécurisé et innovant.
                </p>
              </div>

              {/* Mission */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-purple-200/80 dark:border-purple-800/50 space-y-1.5 shadow-3xs">
                <div className="flex items-center gap-2 text-[#7C3AED] dark:text-purple-400 font-extrabold text-xs">
                  <Target className="w-4 h-4" />
                  <h4>Notre Mission</h4>
                </div>
                <p className="text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                  Offrir un hub fiable pour acheter, vendre, promouvoir ses activités et développer sa visibilité à travers toute l'Afrique.
                </p>
              </div>
            </div>

            {/* 8 VALUES GRID */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#16A34A]" />
                <span>Les 8 Valeurs Fondamentales AfriNova</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {values.map((v) => {
                  const IconComp = v.icon;
                  return (
                    <div 
                      key={v.name}
                      className="p-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl flex flex-col justify-center space-y-0.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`p-1 rounded-md ${v.color} shrink-0`}>
                          <IconComp className="w-3 h-3" />
                        </div>
                        <strong className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 truncate">{v.name}</strong>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block truncate">{v.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


