import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  Plus, 
  Edit, 
  MessageSquare, 
  Star, 
  DollarSign, 
  Store, 
  PackageCheck, 
  ChevronRight, 
  Users, 
  Eye, 
  BarChart3, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';

interface VendeurHomePageProps {
  currentUser: User | null;
  products: Product[];
  merchants: Merchant[];
  orders: Order[];
  onOpenAddModal: () => void;
  onNavigateView: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  onSelectProduct: (product: Product) => void;
}

export default function VendeurHomePage({
  currentUser,
  products,
  merchants,
  orders,
  onOpenAddModal,
  onNavigateView,
  onSelectProduct
}: VendeurHomePageProps) {
  // Merchant specific products
  const myMerchant = merchants.find(m => m.id === currentUser?.id) || merchants[0];
  const myProducts = products.filter(p => p.merchantId === myMerchant?.id || p.merchantId === 'm1');
  const lowStockProducts = myProducts.filter(p => (p.stock || 10) < 5);

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER VENDEUR */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#16A34A] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#16A34A] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Store className="w-3 h-3" /> Espace Vendeur Pro
              </span>
              <span className="text-slate-300 text-xs">Marché A • Bafoussam</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Tableau de Bord — {myMerchant?.shopName || 'Ma Boutique AfriNova'}
            </h1>
            <p className="text-xs text-slate-200">
              Gérez rapidement vos stocks, suivez vos commandes et augmentez vos ventes.
            </p>
          </div>

          {/* Quick Add Product Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="h-10 px-4 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ajouter un produit</span>
            </button>

            <button
              onClick={() => onNavigateView('merchant')}
              className="h-10 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black backdrop-blur-md border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Gérer catalogue</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. TABLEAU DE BORD KPI DE VENTES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* CA du jour */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">CA du Jour</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">185 400 FCFA</p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14.2% aujourd'hui</span>
            </div>
          </div>
        </div>

        {/* Commandes à traiter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Commandes</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">12 en cours</p>
            <p className="text-[11px] text-slate-500 font-medium">4 urgentes à expédier</p>
          </div>
        </div>

        {/* Produits en rupture de stock */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Alerte Stock</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">{lowStockProducts.length || 2} produits</p>
            <p className="text-[11px] text-amber-600 font-bold">&lt; 5 unités restantes</p>
          </div>
        </div>

        {/* Note Boutique & Avis */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Note globale</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-xl font-black text-[#0F172A]">4.9 / 5.0</p>
            <p className="text-[11px] text-slate-500 font-medium">Basé sur 128 avis client</p>
          </div>
        </div>
      </div>

      {/* ACCÈS RAPIDE AUX FONCTIONNALITÉS VENDEUR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Actions Rapides Vendeur</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={onOpenAddModal}
            className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] transition text-left flex items-center gap-3 cursor-pointer"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black">Nouveau produit</p>
              <p className="text-[10px] text-emerald-800">Mettre en vente</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateView('merchant')}
            className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] transition text-left flex items-center gap-3 cursor-pointer"
          >
            <Edit className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black">Modifier catalogue</p>
              <p className="text-[10px] text-indigo-800">Prix & descriptions</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateView('orders')}
            className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition text-left flex items-center gap-3 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black">Messages clients</p>
              <p className="text-[10px] text-purple-800">3 non lus</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateView('merchant')}
            className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition text-left flex items-center gap-3 cursor-pointer"
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black">Statistiques</p>
              <p className="text-[10px] text-amber-900">Rapports de ventes</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. PRODUITS POPULAIRES DE LA BOUTIQUE & GESTION DE STOCK */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-[#16A34A]" />
            Produits Clés de ma Boutique ({myProducts.length})
          </h3>

          <button
            onClick={() => onNavigateView('merchant')}
            className="text-xs font-black text-[#16A34A] hover:underline flex items-center gap-1"
          >
            Gérer tout <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {myProducts.slice(0, 6).map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition cursor-pointer flex gap-3 group"
            >
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#0F172A] group-hover:text-[#16A34A] transition truncate">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">Réf: {product.id.slice(0, 8)}</p>
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  <span className="font-black text-xs text-[#16A34A]">{product.price ? product.price.toLocaleString() : '0'} FCFA</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    (product.stock || 10) < 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Stock: {product.stock || 12}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MESSAGES ET REVENUS MENSUELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Messages clients récents */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#4F46E5]" />
              Derniers Messages Clients
            </h3>
            <span className="text-[10px] font-bold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded-full">3 nouveaux</span>
          </div>

          <div className="space-y-2">
            {[
              { id: 1, name: 'Danielle N.', text: 'Bonjour, avez-vous encore du poivre blanc de Penja disponible ?', time: 'Il y a 10 min' },
              { id: 2, name: 'Emmanuel K.', text: 'La livraison à Kamkop est-elle possible cet après-midi ?', time: 'Il y a 35 min' },
              { id: 3, name: 'Paul M.', text: 'Merci pour la rapidité de la livraison au Marché A !', time: 'Il y a 2h' }
            ].map(msg => (
              <div key={msg.id} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition flex items-start gap-2.5 cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white font-black text-xs flex items-center justify-center shrink-0">
                  {msg.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-[#0F172A] truncate">{msg.name}</p>
                    <span className="text-[9px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bilan des Revenus Mensuels */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#16A34A]" />
              Revenus Mensuels & Retraits
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Juillet 2026</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black">Solde disponible Orange / MTN</p>
                <p className="text-lg font-black text-emerald-400">1 420 000 FCFA</p>
              </div>
              <button className="h-8 px-3 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black transition cursor-pointer">
                Retirer vers Momo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50">
                <p className="text-[10px] text-slate-400 font-bold">Ventes totales ce mois</p>
                <p className="font-black text-[#0F172A] text-sm">2 150 000 FCFA</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <p className="text-[10px] text-slate-400 font-bold">Commissions AfriNova (10%)</p>
                <p className="font-black text-rose-600 text-sm">215 000 FCFA</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
