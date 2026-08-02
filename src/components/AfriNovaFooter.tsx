import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Globe, 
  Sparkles, 
  X, 
  ChevronRight, 
  Heart,
  FileText,
  Eye,
  Target,
  Award,
  Users
} from 'lucide-react';
import { AfriNovaLogo } from './AfriNovaLogo';

interface AfriNovaFooterProps {
  lang?: 'fr' | 'en';
  onNavigate?: (page: string) => void;
}

export default function AfriNovaFooter({ lang = 'fr', onNavigate }: AfriNovaFooterProps) {
  const [activeModalLink, setActiveModalLink] = useState<string | null>(null);

  // 8 Official Links content data
  const officialLinksData: Record<string, { title: string; icon: React.FC<any>; content: React.ReactNode }> = {
    'apropos': {
      title: 'À propos d\'AfriNova',
      icon: Sparkles,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            <strong>AfriNova</strong> est la plateforme marketplace numérique de nouvelle génération conçue pour interconnecter les acheteurs, commerçants, prestataires de services et entreprises en Afrique.
          </p>
          <p>
            En combinant technologie de pointe, géolocalisation précise et modes de paiement locaux (MTN Mobile Money, Orange Money, Carte Bancaire), AfriNova simplifie le commerce de proximité et la visibilité des talents africains.
          </p>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
            <Globe className="w-5 h-5 shrink-0 text-[#16A34A]" />
            <span>Connecting local commerce to global markets seamlessly.</span>
          </div>
        </div>
      )
    },
    'vision': {
      title: 'Notre Vision',
      icon: Eye,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            AfriNova est une plateforme numérique africaine conçue pour connecter les consommateurs, les boutiques, les entreprises et les prestataires de services au sein d'un écosystème moderne, sécurisé et innovant.
          </p>
          <p>
            Notre ambition est de faciliter le commerce, de valoriser les talents locaux, de promouvoir les entreprises africaines et de contribuer à la transformation numérique du continent grâce à une technologie accessible, performante et adaptée aux réalités africaines.
          </p>
        </div>
      )
    },
    'mission': {
      title: 'Notre Mission',
      icon: Target,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            Offrir une plateforme unique permettant aux particuliers et aux professionnels d'acheter, de vendre, de promouvoir leurs activités, de proposer leurs services et de développer leur visibilité à travers toute l'Afrique dans un environnement fiable, sécurisé et intuitif.
          </p>
        </div>
      )
    },
    'valeurs': {
      title: 'Nos Valeurs',
      icon: Award,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="grid grid-cols-2 gap-2">
            {[
              'Innovation',
              'Confiance',
              'Transparence',
              'Sécurité',
              'Qualité',
              'Excellence',
              'Inclusion',
              'Développement de l\'Afrique'
            ].map((v) => (
              <div key={v} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 font-bold text-[#16A34A] dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    'confidentialite': {
      title: 'Politique de confidentialité',
      icon: Lock,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            AfriNova s'engage fermement à protéger la vie privée de ses utilisateurs. Toutes les informations recueillies (nom, numéro de téléphone, localisation) sont utilisées exclusivement pour le traitement des commandes et le service de livraison.
          </p>
          <p>
            Aucune donnée personnelle n'est vendue ou partagée avec des tiers non autorisés. Les communications sont chiffrées selon les standards de sécurité les plus élevés.
          </p>
        </div>
      )
    },
    'conditions': {
      title: 'Conditions d\'utilisation',
      icon: FileText,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            En utilisant la plateforme AfriNova, vous acceptez de respecter les règles de conduite communautaires, d'utiliser la plateforme à des fins légales et de fournir des informations exactes lors de vos achats ou inscriptions.
          </p>
          <p>
            Les commerçants et prestataires sont responsables de la conformité de leurs offres et de la qualité des articles délivrés.
          </p>
        </div>
      )
    },
    'support': {
      title: 'Support & Assistance 24/7',
      icon: HelpCircle,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            Notre équipe de support client est à votre disposition 7j/7 pour vous assister dans le suivi de vos commandes, vos paiements ou l'utilisation de l'application.
          </p>
          <div className="space-y-2 pt-1">
            <a 
              href="tel:+237670000000" 
              className="flex items-center gap-2 p-2.5 bg-[#16A34A]/10 hover:bg-[#16A34A]/20 text-[#16A34A] rounded-xl font-bold transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Assistance Téléphonique : +237 670 000 000</span>
            </a>
            <a 
              href="mailto:support@afrinova.cm" 
              className="flex items-center gap-2 p-2.5 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] rounded-xl font-bold transition"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support : support@afrinova.cm</span>
            </a>
          </div>
        </div>
      )
    },
    'contact': {
      title: 'Nous contacter',
      icon: Mail,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            Vous souhaitez poser une question, devenir partenaire ou inscrire votre entreprise sur AfriNova ?
          </p>
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
              <MapPin className="w-4 h-4 text-[#16A34A]" />
              <span>Siège Social : Bafoussam, Ouest Cameroun</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
              <Mail className="w-4 h-4 text-[#7C3AED]" />
              <span>Contact Général : contact@afrinova.cm</span>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <>
      <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800/80 mt-12 rounded-t-3xl overflow-hidden font-sans transition-all relative">
        
        {/* Decorative Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#16A34A] via-[#7C3AED] to-[#16A34A]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

          {/* ==================== 1. VERSION MOBILE (Android & iPhone - Very Compact) ==================== */}
          <div className="block sm:hidden space-y-4 text-center">
            
            {/* Top Row: Logo & Slogan */}
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="flex items-center gap-2">
                <AfriNovaLogo variant="horizontal" size="sm" showText={true} showSlogan={false} />
                <span className="bg-[#16A34A]/20 text-[#22C55E] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#16A34A]/30">
                  Version 1.0
                </span>
              </div>
              <p className="text-[11px] font-semibold text-purple-300 italic tracking-wide">
                "L'Afrique connectée au monde."
              </p>
            </div>

            {/* Links Horizontal Scroll Pills */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap text-[10px] font-bold text-slate-300 pt-1">
              {Object.entries(officialLinksData).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setActiveModalLink(key)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition cursor-pointer"
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Copyright & Signature */}
            <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 space-y-0.5">
              <p className="font-extrabold text-slate-200">
                © 2026 AfriNova
              </p>
              <p className="text-slate-400 font-medium">
                Fondé et développé par <strong className="text-emerald-400 font-bold">Chris Pokam</strong>
              </p>
              <p className="text-[9px] text-slate-500">Tous droits réservés.</p>
            </div>
          </div>

          {/* ==================== 2. VERSION TABLETTE (Intermediate Spacing & Grid) ==================== */}
          <div className="hidden sm:block md:hidden space-y-6">
            <div className="grid grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Brand & Slogan */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AfriNovaLogo variant="horizontal" size="md" showText={true} showSlogan={false} />
                  <span className="bg-[#16A34A]/20 text-[#22C55E] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#16A34A]/30">
                    Version 1.0
                  </span>
                </div>
                
                <p className="text-xs font-semibold text-purple-300 italic">
                  "L'Afrique connectée au monde."
                </p>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-900 space-y-1">
                  <p className="font-bold text-slate-200">© 2026 AfriNova</p>
                  <p>Fondé et développé par <span className="text-emerald-400 font-bold">Chris Pokam</span></p>
                  <p className="text-[10px] text-slate-500">Tous droits réservés.</p>
                </div>
              </div>

              {/* Right Column: Official Links Grid */}
              <div>
                <h3 className="text-xs font-black uppercase text-[#16A34A] tracking-wider mb-2.5">
                  Navigation Officielle
                </h3>
                <div className="grid grid-cols-1 gap-1.5 text-xs font-medium">
                  {Object.entries(officialLinksData).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setActiveModalLink(key)}
                      className="text-left text-slate-300 hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <ChevronRight className="w-3 h-3 text-[#16A34A]" />
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ==================== 3. VERSION PC / DESKTOP (Multi-column Premium) ==================== */}
          <div className="hidden md:grid md:grid-cols-4 gap-8">
            
            {/* Column 1: Brand & Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <AfriNovaLogo variant="horizontal" size="md" showText={true} showSlogan={false} />
                <span className="bg-[#16A34A]/20 text-[#22C55E] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#16A34A]/30 shrink-0">
                  Version 1.0
                </span>
              </div>

              <p className="text-xs font-bold text-purple-300 italic leading-relaxed">
                "L'Afrique connectée au monde."
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Plateforme Officielle Certifiée</span>
              </div>

              <div className="pt-3 border-t border-slate-900 space-y-1 text-xs">
                <p className="font-black text-slate-100">© 2026 AfriNova</p>
                <p className="text-slate-300 font-medium">
                  Fondé et développé par <strong className="text-emerald-400 font-black">Chris Pokam</strong>
                </p>
                <p className="text-[10px] text-slate-500">Tous droits réservés.</p>
              </div>
            </div>

            {/* Column 2: À propos & Engagements */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#16A34A] flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>Présentation</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {['apropos', 'vision', 'mission', 'valeurs'].map((key) => (
                  <li key={key}>
                    <button
                      onClick={() => setActiveModalLink(key)}
                      className="hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer group"
                    >
                      <ChevronRight className="w-3 h-3 text-[#16A34A] group-hover:translate-x-0.5 transition-transform" />
                      <span>{officialLinksData[key].title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Support & Légal */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Aide & Légal</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {['support', 'contact', 'confidentialite', 'conditions'].map((key) => (
                  <li key={key}>
                    <button
                      onClick={() => setActiveModalLink(key)}
                      className="hover:text-purple-400 transition flex items-center gap-1.5 cursor-pointer group"
                    >
                      <ChevronRight className="w-3 h-3 text-[#7C3AED] group-hover:translate-x-0.5 transition-transform" />
                      <span>{officialLinksData[key].title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Confiance & Sécurité */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#16A34A]" />
                <span>Garanties AfriNova</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-slate-200 block text-[11px]">Cryptage SSL 256-bit</strong>
                    <span className="text-[10px]">Transactions Mobile Money sécurisées</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <strong className="text-slate-200 block text-[11px]">Commerçants Vérifiés</strong>
                    <span className="text-[10px]">Protection contre les fraudes</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </footer>

      {/* ==================== OFFICIAL LINK MODAL OVERLAY ==================== */}
      <AnimatePresence>
        {activeModalLink && officialLinksData[activeModalLink] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 relative overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  {React.createElement(officialLinksData[activeModalLink].icon, { className: "w-5 h-5 text-[#16A34A]" })}
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {officialLinksData[activeModalLink].title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalLink(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div>
                {officialLinksData[activeModalLink].content}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <span>AfriNova Version 1.0</span>
                <button
                  onClick={() => setActiveModalLink(null)}
                  className="px-4 py-2 bg-gradient-to-r from-[#16A34A] to-[#7C3AED] text-white font-bold rounded-xl active:scale-95 transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
