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
  ChevronDown,
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
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

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
              'Développement'
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

  const toggleAccordion = (section: string) => {
    setOpenAccordion(prev => prev === section ? null : section);
  };

  return (
    <>
      <footer className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-t border-slate-200/90 dark:border-slate-800 mt-4 sm:mt-6 font-sans transition-all relative pb-20 sm:pb-6 shadow-xs">
        
        {/* Top Gradient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#16A34A] via-[#7C3AED] to-[#16A34A]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3">

          {/* SINGLE UNIFIED HEADER: BRAND LOGO + VERSION + QUICK ASSISTANCE */}
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200/80 dark:border-slate-800 flex-wrap">
            <div className="flex items-center gap-2.5">
              <AfriNovaLogo variant="horizontal" size="sm" showText={true} showSlogan={false} />
              <span className="bg-emerald-100 dark:bg-emerald-950 text-[#16A34A] dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300/80 dark:border-emerald-800 shadow-3xs">
                v1.0
              </span>
            </div>

            <p className="text-xs font-bold text-[#7C3AED] dark:text-purple-400 italic hidden sm:block">
              "L'Afrique connectée au monde"
            </p>

            <a
              href="tel:+237670000000"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition min-h-[36px] cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Support : +237 670 000 000</span>
            </a>
          </div>

          {/* UNIFIED ACCORDIONS SECTION (CLOSED BY DEFAULT) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
            
            {/* ACCORDION 1: Présentation & Vision */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-3xs">
              <button
                onClick={() => toggleAccordion('presentation')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-black text-[#16A34A] dark:text-emerald-400 uppercase tracking-wider cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-slate-800 min-h-[44px] transition"
                aria-expanded={openAccordion === 'presentation'}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#16A34A] dark:text-emerald-400" />
                  <span>À propos, Vision & Mission</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openAccordion === 'presentation' ? 'rotate-180 text-[#16A34A]' : ''}`} />
              </button>

              <AnimatePresence>
                {openAccordion === 'presentation' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-2.5 pb-2.5 pt-1 space-y-1 border-t border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900"
                  >
                    {['apropos', 'vision', 'mission', 'valeurs'].map((key) => (
                      <button
                        key={key}
                        onClick={() => setActiveModalLink(key)}
                        className="w-full min-h-[40px] py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-[#16A34A] dark:hover:text-emerald-400 text-xs font-bold flex items-center justify-between border border-slate-200/60 dark:border-slate-700 transition active:scale-[0.99] cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>{officialLinksData[key].title}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Consulter</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ACCORDION 2: Aide, Support & Contact */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-3xs">
              <button
                onClick={() => toggleAccordion('support')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-black text-[#7C3AED] dark:text-purple-400 uppercase tracking-wider cursor-pointer hover:bg-purple-50/50 dark:hover:bg-slate-800 min-h-[44px] transition"
                aria-expanded={openAccordion === 'support'}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#7C3AED] dark:text-purple-400" />
                  <span>Aide, Support & Contact</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openAccordion === 'support' ? 'rotate-180 text-[#7C3AED]' : ''}`} />
              </button>

              <AnimatePresence>
                {openAccordion === 'support' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-2.5 pb-2.5 pt-1 space-y-1 border-t border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900"
                  >
                    {['support', 'contact'].map((key) => (
                      <button
                        key={key}
                        onClick={() => setActiveModalLink(key)}
                        className="w-full min-h-[40px] py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-[#7C3AED] dark:hover:text-purple-400 text-xs font-bold flex items-center justify-between border border-slate-200/60 dark:border-slate-700 transition active:scale-[0.99] cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-[#7C3AED]" />
                          <span>{officialLinksData[key].title}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Consulter</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ACCORDION 3: Légal, Sécurité & Garanties */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-3xs">
              <button
                onClick={() => toggleAccordion('legal')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider cursor-pointer hover:bg-amber-50/50 dark:hover:bg-slate-800 min-h-[44px] transition"
                aria-expanded={openAccordion === 'legal'}
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Légal, Sécurité & Garanties</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openAccordion === 'legal' ? 'rotate-180 text-amber-600' : ''}`} />
              </button>

              <AnimatePresence>
                {openAccordion === 'legal' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-2.5 pb-2.5 pt-1 space-y-1 border-t border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900"
                  >
                    {['confidentialite', 'conditions'].map((key) => (
                      <button
                        key={key}
                        onClick={() => setActiveModalLink(key)}
                        className="w-full min-h-[40px] py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-bold flex items-center justify-between border border-slate-200/60 dark:border-slate-700 transition active:scale-[0.99] cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                          <span>{officialLinksData[key].title}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Consulter</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* SINGLE UNIFIED FOOTER COPYRIGHT LINE */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
            <p className="font-extrabold text-[#0F172A] dark:text-slate-200">
              © 2026 AfriNova • Fondé par <strong className="text-[#16A34A] dark:text-emerald-400 font-black">Chris Pokam</strong> • Tous droits réservés.
            </p>
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
