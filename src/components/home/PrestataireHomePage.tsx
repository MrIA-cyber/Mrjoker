import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Star, 
  DollarSign, 
  Plus, 
  Edit, 
  Building2, 
  ChevronRight, 
  MapPin, 
  PhoneCall, 
  User as UserIcon,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  Bell
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';

interface PrestataireHomePageProps {
  currentUser: User | null;
  products: Product[];
  merchants: Merchant[];
  orders: Order[];
  onOpenAddModal: () => void;
  onNavigateView: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  onSelectProduct: (product: Product) => void;
}

export default function PrestataireHomePage({
  currentUser,
  products,
  merchants,
  orders,
  onOpenAddModal,
  onNavigateView,
  onSelectProduct
}: PrestataireHomePageProps) {
  const [isAvailable, setIsAvailable] = useState(true);

  // Prestataire services list
  const servicesList = products.filter(p => p.category === 'Prestations & Services' || p.category === 'Maison & Décoration');

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER PRESTATAIRE DE SERVICES */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#2563EB] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Wrench className="w-3 h-3" /> Espace Prestataire de Services
              </span>
              <span className="text-slate-300 text-xs">Bafoussam & Environs</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Tableau de Bord — {currentUser?.name || 'Artisan & Expert Bafoussam'}
            </h1>
            <p className="text-xs text-slate-200">
              Gérez vos demandes de devis, vos interventions sur le terrain et vos disponibilités.
            </p>
          </div>

          {/* Toggle Availability & Publish Service */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`h-10 px-3.5 rounded-2xl text-xs font-black transition flex items-center gap-2 border cursor-pointer ${
                isAvailable 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{isAvailable ? '🟢 Disponible pour missions' : '🔴 Actuellement occupé'}</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="h-10 px-4 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Publier un service</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. TABLEAU DE BORD KPI PRESTATAIRE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Demandes de services */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Demandes récents</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">3 nouvelles</p>
            <p className="text-[11px] text-blue-600 font-bold">À répondre sous 1h</p>
          </div>
        </div>

        {/* Interventions programmées */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Réservations</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">5 prévues</p>
            <p className="text-[11px] text-slate-500 font-medium">Aujourd'hui à Bafoussam</p>
          </div>
        </div>

        {/* Revenus du mois */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Revenus Prestations</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">245 000 FCFA</p>
            <p className="text-[11px] text-[#16A34A] font-bold">+18% ce mois</p>
          </div>
        </div>

        {/* Taux de satisfaction & Avis */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Avis & Note</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">4.9 / 5.0</p>
            <p className="text-[11px] text-slate-500 font-medium">98% de satisfaction (48 avis)</p>
          </div>
        </div>
      </div>

      {/* 2. DEMANDES DE SERVICES ET DEVIS EN ATTENTE DE VALIDATION */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-black uppercase text-[#0F172A] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            Demandes d'Intervention à Bafoussam (En Attente)
          </h3>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">3 URGENTES</span>
        </div>

        <div className="space-y-2.5">
          {[
            { id: 1, title: 'Dépannage Électricité & Tableau', client: 'Jean-Paul K.', location: 'Bafoussam, Tamdja', budget: '25 000 FCFA', date: 'Aujourd\'hui à 14:00' },
            { id: 2, title: 'Installation Réseau & Wi-Fi Bureau', client: 'Cabinet Mefou', location: 'Bafoussam, Carrefour Bamiléké', budget: '60 000 FCFA', date: 'Demain à 09:30' },
            { id: 3, title: 'Entretien Plomberie & Sanitaires', client: 'Hôtel Royal', location: 'Bafoussam, Djeleng', budget: '40 000 FCFA', date: 'Aujourd\'hui à 16:30' }
          ].map((req) => (
            <div key={req.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-[#0F172A]">{req.title}</h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">{req.budget}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><UserIcon className="w-3 h-3 text-slate-400" /> {req.client}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#16A34A]" /> {req.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {req.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => alert(`Devis accepté pour ${req.title} ! Notification envoyée au client.`)}
                  className="h-8 px-3 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black transition cursor-pointer shadow-2xs"
                >
                  Accepter la mission
                </button>

                <button
                  onClick={() => alert(`Message envoyé à ${req.client}`)}
                  className="h-8 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  Discuter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CATALOGUE DES SERVICES PUBLIÉS & GESTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#16A34A]" />
            Mes Services Publiés sur AfriNova ({servicesList.length || 4})
          </h3>

          <button
            onClick={() => onNavigateView('merchant')}
            className="text-xs font-black text-[#16A34A] hover:underline flex items-center gap-1"
          >
            Modifier mes offres <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(servicesList.length > 0 ? servicesList : products.slice(0, 3)).map((service) => (
            <div
              key={service.id}
              onClick={() => onSelectProduct(service)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition cursor-pointer flex gap-3 group"
            >
              <img
                src={service.images?.[0] || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80'}
                alt={service.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#0F172A] group-hover:text-[#2563EB] transition truncate">
                    {service.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">Tarif horaire / forfait</p>
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  <span className="font-black text-xs text-[#2563EB]">{service.price ? service.price.toLocaleString() : '15 000'} FCFA</span>
                  <span className="text-[9px] font-black bg-emerald-50 text-[#16A34A] px-2 py-0.5 rounded-full">Actif</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. HISTORIQUE DES PRESTATIONS TERMINÉES */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          Historique des Prestations Réalisées avec Succès
        </h3>

        <div className="space-y-2">
          {[
            { title: 'Installation Solaire & Convertisseur', date: '28 Juillet 2026', client: 'Mme Pougoue', rating: 5, amount: '120 000 FCFA' },
            { title: 'Réparation Climatisation & Froid', date: '25 Juillet 2026', client: 'Restaurant Le Plateau', rating: 5, amount: '45 000 FCFA' }
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-[#0F172A]">{item.title}</p>
                <p className="text-[10px] text-slate-400">{item.client} • {item.date}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-[#16A34A]">{item.amount}</p>
                <div className="flex items-center justify-end gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span className="text-[10px] font-bold">5.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
