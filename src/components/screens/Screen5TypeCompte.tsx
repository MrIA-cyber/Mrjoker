import React, { useState } from 'react';
import { User, Store, Building2, Briefcase, Truck, TrendingUp, ShieldCheck, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { AccountType } from '../../types';

interface Screen5TypeCompteProps {
  onSelectAccountType?: (type: AccountType) => void;
  onContinue?: () => void;
}

export default function Screen5TypeCompte({ onSelectAccountType, onContinue }: Screen5TypeCompteProps) {
  const [selectedType, setSelectedType] = useState<AccountType>('client');

  const accountTypes = [
    {
      id: 'client' as AccountType,
      title: 'Client / Acheteur',
      subtitle: 'Achetez, commandez et faites-vous livrer rapidement',
      badge: 'Recommandé',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: User,
      iconBg: 'bg-gradient-to-tr from-emerald-500 to-green-600',
      description: 'Commandez des produits, réservez des services et bénéficiez de la livraison express dans votre pays grâce à AfriNova.',
    },
    {
      id: 'vendeur' as AccountType,
      title: 'Vendeur / Commerçant',
      subtitle: 'Boutique physique ou virtuelle',
      badge: 'Pro & Ventes',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: Store,
      iconBg: 'bg-gradient-to-tr from-[#4F46E5] to-[#2563EB]',
      description: 'Vendez vos articles dans votre pays, gérez votre stock, vos commandes et boostez votre visibilité sur AfriNova.',
    },
    {
      id: 'entreprise' as AccountType,
      title: 'Entreprise & Marque',
      subtitle: 'Société, PME, Marque locale ou Institution',
      badge: 'B2B & PME',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Building2,
      iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
      description: 'Publiez des offres institutionnelles, gagnez des marchés et promouvez vos services aux clients et partenaires.',
    },
    {
      id: 'prestataire' as AccountType,
      title: 'Prestataire de Service',
      subtitle: 'Artisan, Indépendant, Taxi, Pharmacie, Restaurant...',
      badge: 'Services 24/7',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: Briefcase,
      iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-700',
      description: 'Proposez vos compétences, vos trajets taxi, réservations de chambres ou consultations de santé directement sur la Super App.',
    },
    {
      id: 'livreur' as AccountType,
      title: 'Livreur / Coursier Express',
      subtitle: 'Transporteur, Moto Taxi ou Livraison de colis',
      badge: 'Express & Logistique',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Truck,
      iconBg: 'bg-gradient-to-tr from-blue-500 to-sky-600',
      description: 'Prenez en charge les livraisons en ville, optimisez vos trajets et recevez vos gains instantanément via Mobile Money.',
    },
    {
      id: 'trader' as AccountType,
      title: 'Trader & Opportunités',
      subtitle: 'Négociation d\'actifs, matières premières & P2P',
      badge: 'Bourse & P2P',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      icon: TrendingUp,
      iconBg: 'bg-gradient-to-tr from-cyan-600 to-teal-700',
      description: 'Accédez au flux des cours en direct, échangez des opportunités commerciales et sécurisez vos transactions P2P.',
    },
    {
      id: 'admin' as AccountType,
      title: 'Administrateur Système',
      subtitle: 'Gestion globale, Modération & Validation CNI',
      badge: 'Super Admin',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: ShieldCheck,
      iconBg: 'bg-gradient-to-tr from-rose-600 to-red-700',
      description: 'Supervisez l\'ensemble du réseau AfriNova, validez les vérifications de boutiques et configurez le système.',
    },
  ];

  const handleSelect = (id: any) => {
    setSelectedType(id);
    if (onSelectAccountType) onSelectAccountType(id);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 flex flex-col justify-between min-h-[580px] relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-black text-xs">
            B
          </div>
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">ÉCRAN 5 — TYPE DE COMPTE</span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-300">
          <Sparkles className="w-3 h-3 text-emerald-700" />
          <span>Sur Mesure</span>
        </div>
      </div>

      <div className="my-auto py-3 space-y-3.5">
        {/* Title */}
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display tracking-tight">Choisissez votre profil</h2>
          <p className="text-xs text-slate-500">Sélectionnez le type de compte correspondant à votre utilisation</p>
        </div>

        {/* Account Types Options */}
        <div className="space-y-2.5">
          {accountTypes.map((type) => {
            const isSelected = selectedType === type.id;
            const IconComponent = type.icon;

            return (
              <div
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-white border-[#16A34A] shadow-md ring-2 ring-[#16A34A]/20'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${type.iconBg} flex items-center justify-center text-white shadow-md shrink-0 mt-0.5`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="text-xs font-black text-slate-900 truncate">{type.title}</h3>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${type.badgeColor}`}>
                        {type.badge}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-700 leading-tight mb-1">
                      {type.subtitle}
                    </p>

                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      {type.description}
                    </p>
                  </div>

                  {/* Radio Indicator */}
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 transition ${
                    isSelected ? 'bg-[#16A34A] border-[#16A34A] text-white' : 'border-slate-300 bg-slate-50'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 fill-white text-[#16A34A]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Continue Button */}
      <div className="pt-3 border-t border-slate-200">
        <button
          onClick={onContinue}
          className="w-full py-3 px-6 bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
        >
          <span>Continuer en tant que {selectedType.toUpperCase()}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
