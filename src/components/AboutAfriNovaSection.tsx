import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  Target, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Globe, 
  Heart, 
  Zap, 
  Lock
} from 'lucide-react';
import { AfriNovaLogo } from './AfriNovaLogo';

interface AboutAfriNovaSectionProps {
  className?: string;
  isCompact?: boolean;
}

export default function AboutAfriNovaSection({ className = '', isCompact = false }: AboutAfriNovaSectionProps) {
  const [mobileTab, setMobileTab] = useState<'vision' | 'mission'>('vision');

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
    <div className={`w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 font-sans ${className}`}>
      
      {/* HEADER: INLINE LOGO & TITLE */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap">
        <div className="flex items-center gap-2.5">
          <AfriNovaLogo variant="horizontal" size="sm" showText={true} showSlogan={false} />
          <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white hidden sm:inline">
            • Plateforme Officielle
          </span>
        </div>
        
        <span className="bg-gradient-to-r from-[#16A34A] to-[#7C3AED] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-3xs">
          Version 1.0
        </span>
      </div>

      {/* VISION & MISSION SECTION */}
      <div>
        {/* Desktop / Tablet Layout: Side-by-Side (2 Columns) */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-3.5">
          
          {/* NOTRE VISION */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50/80 to-slate-50 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-800/40 space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#16A34A] dark:text-emerald-400 font-extrabold text-xs sm:text-sm">
              <div className="p-1.5 bg-[#16A34A]/10 rounded-lg">
                <Eye className="w-4 h-4" />
              </div>
              <h3>Notre Vision</h3>
            </div>
            <p className="text-[11.5px] sm:text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              AfriNova est une plateforme numérique africaine conçue pour connecter consommateurs, boutiques, entreprises et prestataires au sein d'un écosystème moderne et sécurisé.
            </p>
            <p className="text-[11px] sm:text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
              Notre ambition est de valoriser les talents locaux et accélérer la transformation numérique du continent avec des outils performants adaptés aux réalités africaines.
            </p>
          </div>

          {/* NOTRE MISSION */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50/80 to-slate-50 dark:from-purple-950/30 dark:to-slate-900 border border-purple-200/70 dark:border-purple-800/40 space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#7C3AED] dark:text-purple-400 font-extrabold text-xs sm:text-sm">
              <div className="p-1.5 bg-[#7C3AED]/10 rounded-lg">
                <Target className="w-4 h-4" />
              </div>
              <h3>Notre Mission</h3>
            </div>
            <p className="text-[11.5px] sm:text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
              Offrir une plateforme unique permettant d'acheter, vendre, promouvoir ses activités et proposer des services à travers l'Afrique dans un cadre fiable et intuitif.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] font-bold text-[#7C3AED] dark:text-purple-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Marketplace & Services Interconnectés</span>
            </div>
          </div>

        </div>

        {/* Mobile Compact Tab Switcher (Saves 50%+ Vertical Height) */}
        <div className="block sm:hidden space-y-2">
          {/* Mobile Segmented Control */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setMobileTab('vision')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
                mobileTab === 'vision'
                  ? 'bg-[#16A34A] text-white shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Notre Vision</span>
            </button>

            <button
              onClick={() => setMobileTab('mission')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
                mobileTab === 'mission'
                  ? 'bg-[#7C3AED] text-white shadow-2xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Notre Mission</span>
            </button>
          </div>

          {/* Active Mobile Card */}
          {mobileTab === 'vision' ? (
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50/90 to-slate-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#16A34A] font-extrabold text-xs">
                <Eye className="w-3.5 h-3.5" />
                <span>Notre Vision</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                Connecter les consommateurs, boutiques, entreprises et prestataires au sein d'un écosystème africain moderne, sécurisé et innovant.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50/90 to-slate-50 dark:from-purple-950/40 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#7C3AED] font-extrabold text-xs">
                <Target className="w-3.5 h-3.5" />
                <span>Notre Mission</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                Offrir un hub fiable pour acheter, vendre, promouvoir ses activités et développer sa visibilité partout en Afrique.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* NOS VALEURS: COMPACT GRID (2 Cols Mobile, 4 Cols Desktop) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="p-1.5 bg-gradient-to-r from-[#16A34A] to-[#7C3AED] text-white rounded-lg">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Nos Valeurs</h3>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400">Les 8 principes fondamentaux AfriNova</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {values.map((v) => {
            const IconComp = v.icon;
            return (
              <div 
                key={v.name}
                className="p-2 sm:p-2.5 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-xl transition flex flex-col justify-center space-y-1"
              >
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 rounded-md ${v.color} shrink-0`}>
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <strong className="text-[11.5px] font-extrabold text-slate-800 dark:text-slate-200 truncate">{v.name}</strong>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block">{v.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DISCREET FOUNDER & COPYRIGHT SIGNATURE BAR */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span>© 2026 AfriNova.</span>
          <span>•</span>
          <span>Fondé et développé par <strong className="text-[#16A34A] dark:text-emerald-400 font-bold">Chris Pokam</strong>.</span>
        </div>
        <span className="text-[10px] text-slate-400">Tous droits réservés.</span>
      </div>

    </div>
  );
}

