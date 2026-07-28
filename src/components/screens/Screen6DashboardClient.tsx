import React from 'react';
import { Search, MapPin, Bell, ShoppingBag, Store, Utensils, Hotel, Pill, Car, Home, Briefcase, Wrench, Sparkles, Star, ChevronRight, User } from 'lucide-react';

interface Screen6DashboardClientProps {
  onNavigate?: (page: string) => void;
}

export default function Screen6DashboardClient({ onNavigate }: Screen6DashboardClientProps) {
  const categories = [
    { id: 'marche', label: 'Marché', icon: Store, color: 'bg-indigo-500 text-white' },
    { id: 'resto', label: 'Restaurants', icon: Utensils, color: 'bg-orange-500 text-white' },
    { id: 'hotel', label: 'Hôtels', icon: Hotel, color: 'bg-blue-500 text-white' },
    { id: 'pharmacie', label: 'Pharmacies', icon: Pill, color: 'bg-emerald-500 text-white' },
    { id: 'taxi', label: 'Taxi', icon: Car, color: 'bg-amber-500 text-slate-950' },
    { id: 'immo', label: 'Immobilier', icon: Home, color: 'bg-purple-500 text-white' },
    { id: 'emploi', label: 'Emplois', icon: Briefcase, color: 'bg-[#16A34A] text-white' },
    { id: 'services', label: 'Services', icon: Wrench, color: 'bg-rose-500 text-white' },
  ];

  const popularProducts = [
    { id: '1', name: 'Samsung Galaxy A54 5G 256Go', price: '215 000 FCFA', oldPrice: '240 000 FCFA', discount: '-10%', rating: '4.9', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80' },
    { id: '2', name: 'Chaussures Nike Air Max Bafoussam', price: '35 000 FCFA', oldPrice: '45 000 FCFA', discount: '-22%', rating: '4.8', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col justify-between min-h-[620px] relative">
      
      {/* Top Header with City Badge & Search */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-4 text-white space-y-3 shadow-md">
        
        {/* Top User Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#16A34A] to-emerald-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-xs">
                K
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-300">Bonjour, <strong className="text-white">Paul Kamdem</strong> 👋</div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Carrefour Bamiléké, Bafoussam</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/15 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Panoramic Bafoussam Banner */}
        <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80" 
            alt="Bafoussam Panorama" 
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-indigo-950/60 to-transparent p-3 flex flex-col justify-center">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400">Super App Ville de Bafoussam</span>
            <h1 className="text-base font-black text-white font-display leading-tight">Le meilleur de l'Ouest Cameroun</h1>
            <p className="text-[10px] text-slate-200 mt-0.5">Livraison garantie dans tous les quartiers en 30 min</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher produit, boutique, taxi, hôtel..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs text-white placeholder-slate-300 focus:outline-none focus:bg-white/20 transition"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[380px]">
        
        {/* 8 Main Categories Grid */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider">Catégories Principales</h2>
            <span className="text-[10px] font-bold text-[#16A34A] cursor-pointer">Tout voir</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div 
                  key={cat.id} 
                  onClick={() => onNavigate && onNavigate(cat.id)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className={`w-11 h-11 rounded-2xl ${cat.color} flex items-center justify-center shadow-md group-hover:scale-105 transition`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Products Carousel */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <h2 className="text-xs font-black uppercase text-slate-700 tracking-wider">Produits populaires à Bafoussam</h2>
            </div>
            <span className="text-[10px] font-bold text-[#16A34A] cursor-pointer">Voir tout</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {popularProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                <div className="relative h-24 rounded-xl overflow-hidden bg-slate-100 mb-2">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <span className="absolute top-1.5 left-1.5 bg-[#16A34A] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    {p.discount}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 truncate">{p.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-black text-[#16A34A]">{p.price}</span>
                  <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{p.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center text-slate-600 z-10">
        {[
          { id: 'home', label: 'Accueil', icon: Store, active: true },
          { id: 'categories', label: 'Catégories', icon: Search, active: false },
          { id: 'cart', label: 'Panier', icon: ShoppingBag, active: false, badge: '3' },
          { id: 'orders', label: 'Commandes', icon: Star, active: false },
          { id: 'profile', label: 'Profil', icon: User, active: false },
        ].map((nav) => {
          const NavIcon = nav.icon;
          return (
            <button 
              key={nav.id} 
              onClick={() => onNavigate && onNavigate(nav.id)}
              className={`flex flex-col items-center gap-0.5 relative py-1 cursor-pointer transition ${
                nav.active ? 'text-[#16A34A] font-black' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <NavIcon className="w-4 h-4" />
              <span className="text-[9px] font-bold">{nav.label}</span>
              {nav.badge && (
                <span className="absolute -top-1 -right-1 bg-[#16A34A] text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {nav.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
