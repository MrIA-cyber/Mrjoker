import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Megaphone, 
  FileText, 
  BarChart3, 
  Bell, 
  Plus, 
  Edit, 
  ShieldCheck, 
  Download, 
  ChevronRight, 
  Layers, 
  ArrowUpRight,
  DollarSign,
  PackageCheck
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';

interface EntrepriseHomePageProps {
  currentUser: User | null;
  products: Product[];
  merchants: Merchant[];
  orders: Order[];
  onOpenAddModal: () => void;
  onNavigateView: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  onSelectProduct: (product: Product) => void;
}

export default function EntrepriseHomePage({
  currentUser,
  products,
  merchants,
  orders,
  onOpenAddModal,
  onNavigateView,
  onSelectProduct
}: EntrepriseHomePageProps) {
  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER ENTREPRISE B2B */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#3B82F6] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#3B82F6] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Espace Entreprise B2B & Corporate
              </span>
              <span className="text-slate-300 text-xs">Siège Bafoussam</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Tableau de Bord — {currentUser?.name || 'Entreprise Partenaire AfriNova'}
            </h1>
            <p className="text-xs text-slate-200">
              Pilotage des opérations commerciales, gestion des équipes, factures & campagnes publicitaires.
            </p>
          </div>

          {/* Corporate Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="h-10 px-4 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ajouter produit pro</span>
            </button>

            <button
              onClick={() => onNavigateView('merchant')}
              className="h-10 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black backdrop-blur-md border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Gérer l'entreprise</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. KPI TABLEAU DE BORD ENTREPRISE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Chiffre d'affaires mensuel */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Chiffre d'Affaires</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">3 450 000 FCFA</p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+22.4% ce mois</span>
            </div>
          </div>
        </div>

        {/* Commandes B2B totales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Commandes B2B</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">142 traitées</p>
            <p className="text-[11px] text-slate-500 font-medium">18 en cours de livraison</p>
          </div>
        </div>

        {/* Équipe & Employés */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Équipe & Employés</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">12 employés</p>
            <p className="text-[11px] text-emerald-600 font-bold">Tous actifs sur AfriNova</p>
          </div>
        </div>

        {/* Campagnes publicitaires */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pubs & Sponsoring</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">2 actives</p>
            <p className="text-[11px] text-amber-600 font-bold">ROI Estimé +320%</p>
          </div>
        </div>
      </div>

      {/* ACCÈS AUX FONCTIONS DE GESTION CORPORATE */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Panneau de Gestion Entreprise</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onNavigateView('merchant')}
            className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#3B82F6] transition text-left flex items-center gap-3 cursor-pointer"
          >
            <Users className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black">Gestion des équipes</p>
              <p className="text-[10px] text-blue-800">12 employés</p>
            </div>
          </button>

          <button
            onClick={() => alert('Génération du rapport PDF & Bilan Comptable AfriNova')}
            className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition text-left flex items-center gap-3 cursor-pointer"
          >
            <FileText className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black">Factures & PDF</p>
              <p className="text-[10px] text-purple-800">Télécharger bilans</p>
            </div>
          </button>

          <button
            onClick={() => alert('Campagne publicitaire sponsorisée AfriNova en cours')}
            className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition text-left flex items-center gap-3 cursor-pointer"
          >
            <Megaphone className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black">Campagnes Pubs</p>
              <p className="text-[10px] text-amber-900">Sponsoriser l'offre</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateView('merchant')}
            className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] transition text-left flex items-center gap-3 cursor-pointer"
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black">Rapports & Stats</p>
              <p className="text-[10px] text-emerald-900">Croissance globale</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. CATALOGUE DES PRODUITS & SERVICES CORPORATE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-[#16A34A]" />
            Catalogue Offres Entreprise Bafoussam
          </h3>

          <button
            onClick={() => onNavigateView('merchant')}
            className="text-xs font-black text-[#16A34A] hover:underline flex items-center gap-1"
          >
            Voir catalogue pro <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.slice(0, 6).map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition cursor-pointer flex gap-3 group"
            >
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#0F172A] group-hover:text-[#3B82F6] transition truncate">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">Référence B2B Corporate</p>
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  <span className="font-black text-xs text-[#3B82F6]">{product.price ? product.price.toLocaleString() : '0'} FCFA</span>
                  <span className="text-[9px] font-black bg-blue-50 text-[#3B82F6] px-2 py-0.5 rounded-full">Pro Approved</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. NOTIFICATIONS ET FACTURES IMPORTANTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Notifications d'Entreprise */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#3B82F6]" />
              Notifications & Contrats B2B
            </h3>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">2 NOUVELLES</span>
          </div>

          <div className="space-y-2">
            {[
              { id: 1, title: 'Validation du Contrat de Fourniture Bafoussam', desc: 'Le contrat avec la coopérative agricole a été validé.', time: 'Il y a 1h' },
              { id: 2, title: 'Rapport Mensuel de Performance B2B Disponible', desc: 'Le bilan financier de Juillet 2026 est prêt.', time: 'Il y a 3h' }
            ].map((n) => (
              <div key={n.id} className="p-3 rounded-xl bg-slate-50 flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#3B82F6] mt-1.5 shrink-0" />
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-[#0F172A]">{n.title}</p>
                    <span className="text-[9px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dernières Factures Exportables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#16A34A]" />
              Dernières Factures & Reçus Commerciaux
            </h3>
            <button className="text-[10px] font-bold text-[#16A34A] hover:underline">Tout exporter</button>
          </div>

          <div className="space-y-2">
            {[
              { ref: 'FAC-2026-0041', date: '30 Juillet 2026', client: 'Hôtel Bafoussam Palace', total: '450 000 FCFA' },
              { ref: 'FAC-2026-0040', date: '28 Juillet 2026', client: 'Marché Central Gros', total: '890 000 FCFA' }
            ].map((inv, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#0F172A]">{inv.ref} • {inv.client}</p>
                  <p className="text-[10px] text-slate-400">{inv.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#16A34A]">{inv.total}</span>
                  <button 
                    onClick={() => alert(`Téléchargement de la facture ${inv.ref} en PDF`)}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer"
                    title="Télécharger PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
