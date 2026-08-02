import React from 'react';
import { 
  Sparkles, 
  Eye, 
  Target, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Globe, 
  Heart, 
  UserCheck, 
  Zap, 
  Lock, 
  Layers, 
  Building2
} from 'lucide-react';
import { AfriNovaLogo } from './AfriNovaLogo';

interface AboutAfriNovaSectionProps {
  className?: string;
  isCompact?: boolean;
}

export default function AboutAfriNovaSection({ className = '', isCompact = false }: AboutAfriNovaSectionProps) {
  const values = [
    { name: 'Innovation', desc: 'Technologies adaptées aux besoins africains', icon: Zap, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Confiance', desc: 'Relation éthique et durable avec notre communauté', icon: ShieldCheck, color: 'text-[#16A34A] bg-[#16A34A]/10' },
    { name: 'Transparence', desc: 'Opérations claires, vérifiables et honnêtes', icon: Eye, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Sécurité', desc: 'Protection rigoureuse des données et paiements', icon: Lock, color: 'text-[#7C3AED] bg-[#7C3AED]/10' },
    { name: 'Qualité', desc: 'Exigence élevée sur les services et produits', icon: Award, color: 'text-emerald-600 bg-emerald-600/10' },
    { name: 'Excellence', desc: 'Recherche permanente de la performance', icon: Sparkles, color: 'text-indigo-500 bg-indigo-500/10' },
    { name: 'Inclusion', desc: 'Accessibilité pour tous les acteurs économiques', icon: Heart, color: 'text-rose-500 bg-rose-500/10' },
    { name: 'Développement de l\'Afrique', desc: 'Propulser l\'économie continentale', icon: Globe, color: 'text-emerald-700 bg-emerald-700/10' }
  ];

  return (
    <div className={`w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8 space-y-8 font-sans ${className}`}>
      
      {/* HEADER: LOGO, NOM & VERSION */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <AfriNovaLogo variant="vertical" size="lg" showText={true} showSlogan={true} />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">AfriNova</span>
          <span className="bg-gradient-to-r from-[#16A34A] to-[#7C3AED] text-white text-xs font-black px-3 py-0.5 rounded-full shadow-sm">
            Version 1.0
          </span>
        </div>
      </div>

      {/* VISION & MISSION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* NOTRE VISION */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-slate-50 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-800/40 space-y-3 relative overflow-hidden group">
          <div className="flex items-center gap-2.5 text-[#16A34A] dark:text-emerald-400 font-extrabold text-base">
            <div className="p-2 bg-[#16A34A]/10 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
            <h3>Notre Vision</h3>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            AfriNova est une plateforme numérique africaine conçue pour connecter les consommateurs, les boutiques, les entreprises et les prestataires de services au sein d'un écosystème moderne, sécurisé et innovant.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium pt-1">
            Notre ambition est de faciliter le commerce, de valoriser les talents locaux, de promouvoir les entreprises africaines et de contribuer à la transformation numérique du continent grâce à une technologie accessible, performante et adaptée aux réalités africaines.
          </p>
        </div>

        {/* NOTRE MISSION */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50/80 to-slate-50 dark:from-purple-950/30 dark:to-slate-900 border border-purple-200/70 dark:border-purple-800/40 space-y-3 relative overflow-hidden group">
          <div className="flex items-center gap-2.5 text-[#7C3AED] dark:text-purple-400 font-extrabold text-base">
            <div className="p-2 bg-[#7C3AED]/10 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
            <h3>Notre Mission</h3>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
            Offrir une plateforme unique permettant aux particuliers et aux professionnels d'acheter, de vendre, de promouvoir leurs activités, de proposer leurs services et de développer leur visibilité à travers toute l'Afrique dans un environnement fiable, sécurisé et intuitif.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#7C3AED] dark:text-purple-300">
            <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
            <span>Marketplace & Services Interconnectés</span>
          </div>
        </div>

      </div>

      {/* NOS VALEURS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 bg-gradient-to-r from-[#16A34A] to-[#7C3AED] text-white rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Nos Valeurs</h3>
            <p className="text-xs text-slate-500">Les principes fondamentaux qui guident le développement d'AfriNova</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {values.map((v) => {
            const IconComp = v.icon;
            return (
              <div 
                key={v.name}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl transition duration-200 flex flex-col space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${v.color}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <strong className="text-xs font-black text-slate-800 dark:text-slate-200">{v.name}</strong>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{v.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SIGNATURE OFFICIELLE DU FONDATEUR */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 text-center space-y-2 bg-gradient-to-r from-slate-50 via-emerald-50/30 to-slate-50 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 p-5 rounded-2xl border">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Identité Officielle AfriNova
          </span>
        </div>

        <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
          <p className="font-extrabold text-sm text-slate-900 dark:text-white">
            © 2026 AfriNova.
          </p>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            Fondé et développé par <span className="text-[#16A34A] dark:text-emerald-400 font-black">Chris Pokam</span>.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            Tous droits réservés.
          </p>
        </div>
      </div>

    </div>
  );
}
