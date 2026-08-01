import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Package, 
  Wrench, 
  FileText, 
  DollarSign, 
  ShoppingBag, 
  Megaphone, 
  Calendar, 
  Bell, 
  FolderCheck, 
  ShieldCheck, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  X, 
  BarChart3, 
  Layers, 
  Award, 
  CreditCard, 
  Clock, 
  Mail, 
  PhoneCall, 
  Send, 
  FilePlus, 
  Check, 
  ChevronRight, 
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';

interface EntrepriseHomePageProps {
  currentUser: User | null;
  products: Product[];
  merchants: Merchant[];
  orders: Order[];
  onOpenAddModal: () => void;
  onNavigateView?: (view: 'shop' | 'merchant' | 'orders' | 'news' | 'admin') => void;
  onSelectProduct?: (product: Product) => void;
  onLogout?: () => void;
}

export default function EntrepriseHomePage({
  currentUser,
  products,
  merchants,
  orders,
  onOpenAddModal,
  onNavigateView,
  onSelectProduct,
  onLogout
}: EntrepriseHomePageProps) {
  // Navigation active tab for Enterprise ERP
  const [activeTab, setActiveTab] = useState<
    'accueil' | 'vue_generale' | 'ca' | 'employes' | 'departements' | 'produits' | 
    'services' | 'offres' | 'commandes' | 'clients' | 'factures' | 'paiements' | 
    'stats' | 'rapports' | 'marketing' | 'campagnes' | 'publicites' | 'messagerie' | 
    'agenda' | 'notifications' | 'documents' | 'abonnement' | 'profil' | 'parametres' | 'support'
  >('accueil');

  // Enterprise specific state
  const [employees, setEmployees] = useState([
    { id: 'emp-1', name: 'Dr. Jean-Baptiste Foka', role: 'Directeur Général', dept: 'Direction', status: 'Actif', phone: '+237 677 11 22 33' },
    { id: 'emp-2', name: 'Mme Sandrine Nguemo', role: 'Chef de Projets B2B', dept: 'Commerces & Ventes', status: 'Actif', phone: '+237 699 44 55 66' },
    { id: 'emp-3', name: 'Alain Fotso', role: 'Responsable Logistique', dept: 'Supply Chain', status: 'Actif', phone: '+237 680 77 88 99' },
    { id: 'emp-4', name: 'Carine Mbassi', role: 'Comptable Senior', dept: 'Finance & Audit', status: 'Actif', phone: '+237 655 33 22 11' },
  ]);

  const [departments, setDepartments] = useState([
    { id: 'dep-1', name: 'Direction Générale', head: 'Dr. Jean-Baptiste Foka', staffCount: 3 },
    { id: 'dep-2', name: 'Commercial & Ventes B2B', head: 'Mme Sandrine Nguemo', staffCount: 5 },
    { id: 'dep-3', name: 'Logistique & Transit', head: 'Alain Fotso', staffCount: 4 },
    { id: 'dep-4', name: 'Finance & Comptabilité', head: 'Carine Mbassi', staffCount: 2 },
  ]);

  // Corporate Products & Services
  const corporateProducts = products.slice(0, 5);
  const corporateServices = [
    { id: 'cs-1', title: 'Audit & Diagnostic Énergie Solaire B2B', price: '250 000 FCFA', category: 'Ingénierie' },
    { id: 'cs-2', title: 'Maintenance Parc Informatique Entreprise', price: '180 000 FCFA/mois', category: 'Informatique' },
    { id: 'cs-3', title: 'Fourniture Gros Épices & Agroalimentaire', price: 'Sur Devis B2B', category: 'Agroalimentaire' }
  ];

  // Invoices state
  const [invoices, setInvoices] = useState([
    { id: 'FAC-2026-0041', clientName: 'Hôtel Bafoussam Palace', amount: '450 000 FCFA', date: '30 Juil 2026', status: 'Payé' },
    { id: 'FAC-2026-0040', clientName: 'Centrale Gros Marché A', amount: '890 000 FCFA', date: '28 Juil 2026', status: 'En attente' },
    { id: 'FAC-2026-0039', clientName: 'Coopérative Agricole Ouest', amount: '1 250 000 FCFA', date: '22 Juil 2026', status: 'Payé' }
  ]);

  // Offers & Quotes
  const [offers, setOffers] = useState([
    { id: 'DEV-881', client: 'Société BTP Tamdja', object: 'Fourniture Panneaux Solaires 50KVA', amount: '4 800 000 FCFA', status: 'Accepté' },
    { id: 'DEV-882', client: 'Complexe Scolaire Kamkop', object: 'Câblage Réseau & Caméras', amount: '1 650 000 FCFA', status: 'En révision' }
  ]);

  // Marketing campaigns
  const [campaigns, setCampaigns] = useState([
    { id: 'camp-1', name: 'Sponsoring Agro Bafoussam', channel: 'AfriNova Banner Top', budget: '150 000 FCFA', status: 'Actif', leads: 42 },
    { id: 'camp-2', name: 'Lancement Solar B2B', channel: 'Push SMS & Notifications', budget: '80 000 FCFA', status: 'Actif', leads: 28 }
  ]);

  // Agenda events
  const [agendaEvents, setAgendaEvents] = useState([
    { id: 'ev-1', title: 'Réunion Signature Contrat Hôtel Palace', time: 'Aujourd\'hui 14:00', location: 'Siège Bafoussam' },
    { id: 'ev-2', title: 'Comité de Direction Mensuel', time: 'Demain 09:00', location: 'Salle de Conférence 1' }
  ]);

  // Corporate Messaging
  const [activeCorporateMsg, setActiveCorporateMsg] = useState(0);
  const [corpMessages] = useState([
    { client: 'Direction Hôtel Bafoussam Palace', topic: 'Paiement Facture FAC-2026-0041', lastMsg: 'Reçu de virement envoyé. Merci !', time: '11:20' },
    { client: 'Coopérative Agricole Ouest', topic: 'Nouveau Devis Engrais & Matériel', lastMsg: 'Pouvez-vous ajuster les quantités ?', time: 'Hier' }
  ]);

  return (
    <div className="w-full bg-[#0F172A] text-slate-100 min-h-screen pb-20 font-sans">
      
      {/* HEADER ERP CORPORATE */}
      <div className="bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-[#2563EB] border-b border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Système ERP Enterprise B2B
              </span>
              <span className="text-slate-400 text-xs font-mono">Siège Social Bafoussam</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white">
              {currentUser?.name || 'West-Cameroon Corporate SA'}
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Plateforme complète de gestion d'entreprise, ressources humaines, facturation et campagnes B2B.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Créer Offre B2B</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="h-10 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ENTERPRISE SUB-NAVIGATION TABS BAR */}
      <div className="bg-slate-900/95 border-b border-slate-800 sticky top-[57px] z-30 shadow-md mb-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-2">
          {[
            { id: 'accueil', label: 'Accueil ERP', icon: Building2 },
            { id: 'vue_generale', label: 'Vue Générale', icon: Layers },
            { id: 'ca', label: 'Chiffre d\'Affaires', icon: TrendingUp },
            { id: 'employes', label: `Employés (${employees.length})`, icon: Users },
            { id: 'departements', label: `Départements (${departments.length})`, icon: Briefcase },
            { id: 'produits', label: 'Produits Corp', icon: Package },
            { id: 'services', label: 'Services B2B', icon: Wrench },
            { id: 'offres', label: 'Offres & Devis', icon: FilePlus },
            { id: 'commandes', label: 'Commandes B2B', icon: ShoppingBag },
            { id: 'clients', label: 'Clients B2B', icon: Users },
            { id: 'factures', label: `Factures (${invoices.length})`, icon: FileText },
            { id: 'paiements', label: 'Paiements', icon: DollarSign },
            { id: 'stats', label: 'Statistiques', icon: BarChart3 },
            { id: 'rapports', label: 'Rapports PDF', icon: Download },
            { id: 'marketing', label: 'Marketing', icon: Megaphone },
            { id: 'campagnes', label: 'Campagnes', icon: BarChart3 },
            { id: 'publicites', label: 'Publicités', icon: Megaphone },
            { id: 'messagerie', label: 'Messagerie B2B', icon: Mail, badge: 2 },
            { id: 'agenda', label: 'Agenda Corporate', icon: Calendar },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'documents', label: 'Documents & Contrats', icon: FolderCheck },
            { id: 'abonnement', label: 'Abonnement Corp', icon: ShieldCheck },
            { id: 'profil', label: 'Profil Entreprise', icon: Building2 },
            { id: 'parametres', label: 'Paramètres ERP', icon: Settings },
            { id: 'support', label: 'Support VIP 24/7', icon: HelpCircle },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-[#16A34A] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC ENTERPRISE TAB CONTENT */}
      <main className="max-w-7xl mx-auto px-4 space-y-6">

        {/* 1. ACCUEIL ENTERPRISE */}
        {activeTab === 'accueil' && (
          <div className="space-y-6">
            {/* KPI Executive Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Chiffre d'Affaires Mois</span>
                <p className="text-xl font-black text-[#2563EB]">8 450 000 FCFA</p>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +22.4% vs mois dernier
                </span>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Effectif Entreprise</span>
                <p className="text-xl font-black text-white">{employees.length} Employés</p>
                <span className="text-[10px] text-blue-400 font-bold">{departments.length} départements actifs</span>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Factures en Attente</span>
                <p className="text-xl font-black text-amber-400">1 340 000 FCFA</p>
                <span className="text-[10px] text-amber-300 font-bold">2 contrats à encaisser</span>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Campagnes Pubs</span>
                <p className="text-xl font-black text-purple-400">{campaigns.length} Actives</p>
                <span className="text-[10px] text-slate-400 font-medium">ROI estimé x3.2</span>
              </div>
            </div>

            {/* Quick Actions ERP */}
            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Module de Pilotage Rapide</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => setActiveTab('factures')}
                  className="p-3.5 rounded-2xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <FileText className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Facturation</p>
                    <p className="text-[10px] text-blue-400">Émettre facture PDF</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('employes')}
                  className="p-3.5 rounded-2xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <Users className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Gestion RH</p>
                    <p className="text-[10px] text-indigo-400">{employees.length} collaborateurs</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('offres')}
                  className="p-3.5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <FilePlus className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Devis & Offres</p>
                    <p className="text-[10px] text-emerald-400">Soumettre proposition</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('campagnes')}
                  className="p-3.5 rounded-2xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 transition text-left flex items-center gap-3 cursor-pointer"
                >
                  <Megaphone className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-black">Sponsoring Pub</p>
                    <p className="text-[10px] text-amber-400">Atteindre de nouveaux clients</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. VUE GÉNÉRALE */}
        {activeTab === 'vue_generale' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Vue Générale des Opérations B2B</h2>
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300">Aperçu consolidé des performances financières, ressources humaines et contrats commerciaux.</p>
            </div>
          </div>
        )}

        {/* 3. CHIFFRE D'AFFAIRES */}
        {activeTab === 'ca' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Analyse du Chiffre d'Affaires</h2>
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Cumulé 2026</span>
              <p className="text-3xl font-black text-[#16A34A]">48 200 000 FCFA</p>
              <p className="text-xs text-slate-400">Conforme au plan prévisionnel du conseil d'administration Bafoussam.</p>
            </div>
          </div>
        )}

        {/* 4. EMPLOYÉS */}
        {activeTab === 'employes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Gestion des Employés & Équipes</h2>
              <button
                onClick={() => {
                  const name = prompt('Nom de l\'employé:');
                  if (name) {
                    setEmployees(prev => [...prev, { id: `emp-${Date.now()}`, name, role: 'Collaborateur', dept: 'Commercial', status: 'Actif', phone: '+237 670 00 00 00' }]);
                  }
                }}
                className="px-3.5 py-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + Ajouter Employé
              </button>
            </div>

            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Nom & Prénom</th>
                    <th className="p-3.5">Poste / Rôle</th>
                    <th className="p-3.5">Département</th>
                    <th className="p-3.5">Téléphone</th>
                    <th className="p-3.5">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {employees.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3.5 font-bold text-white">{e.name}</td>
                      <td className="p-3.5 text-slate-300">{e.role}</td>
                      <td className="p-3.5 text-slate-400">{e.dept}</td>
                      <td className="p-3.5 font-mono text-slate-300">{e.phone}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. DÉPARTEMENTS */}
        {activeTab === 'departements' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Départements de l'Entreprise</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments.map((d) => (
                <div key={d.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-sm text-white">{d.name}</h4>
                  <p className="text-xs text-slate-400">Responsable: {d.head}</p>
                  <span className="text-[10px] font-black text-blue-400">{d.staffCount} collaborateurs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. PRODUITS CORPORATE */}
        {activeTab === 'produits' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Produits Pro & Références B2B</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {corporateProducts.map((p) => (
                <div key={p.id} className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <img src={p.images?.[0]} alt="" className="w-full h-24 object-cover rounded-xl" />
                  <h4 className="font-bold text-xs text-white truncate">{p.name}</h4>
                  <p className="text-xs font-black text-[#2563EB]">{p.price?.toLocaleString()} FCFA</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SERVICES CORPORATE */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Services B2B Offerts</h2>
            <div className="space-y-2">
              {corporateServices.map((s) => (
                <div key={s.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] font-black text-blue-400 uppercase">{s.category}</span>
                    <h4 className="font-bold text-white text-sm">{s.title}</h4>
                  </div>
                  <span className="font-black text-emerald-400">{s.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. OFFRES & DEVIS */}
        {activeTab === 'offres' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Offres Commerciales & Devis</h2>
            <div className="space-y-3">
              {offers.map((o) => (
                <div key={o.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-slate-400">{o.id} • {o.client}</span>
                    <p className="font-bold text-white">{o.object}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#2563EB]">{o.amount}</p>
                    <span className="text-[10px] font-bold text-emerald-400">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. COMMANDES B2B */}
        {activeTab === 'commandes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Commandes Entreprise B2B</h2>
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300">142 commandes B2B livrées ce trimestre dans la région de l'Ouest Cameroun.</p>
            </div>
          </div>
        )}

        {/* 10. CLIENTS B2B */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Portefeuille Clients Entreprises & Grands Comptes</h2>
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300">28 comptes entreprises sous contrat annuel Bafoussam.</p>
            </div>
          </div>
        )}

        {/* 11. FACTURES */}
        {activeTab === 'factures' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Gestion des Factures & Reçus</h2>
              <button
                onClick={() => {
                  const clientName = prompt('Nom du client:');
                  const amount = prompt('Montant FCFA:');
                  if (clientName && amount) {
                    setInvoices(prev => [{ id: `FAC-2026-00${Math.floor(Math.random()*90+10)}`, clientName, amount: `${amount} FCFA`, date: 'Aujourd\'hui', status: 'Payé' }, ...prev]);
                  }
                }}
                className="px-3.5 py-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + Créer Facture
              </button>
            </div>

            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Référence</th>
                    <th className="p-3.5">Client B2B</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Montant</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3.5 font-mono text-slate-300">{inv.id}</td>
                      <td className="p-3.5 font-bold text-white">{inv.clientName}</td>
                      <td className="p-3.5 text-slate-400">{inv.date}</td>
                      <td className="p-3.5 font-black text-emerald-400">{inv.amount}</td>
                      <td className="p-3.5 font-bold text-blue-400">{inv.status}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => alert(`Téléchargement PDF de la facture ${inv.id}`)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 12. PAIEMENTS */}
        {activeTab === 'paiements' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Journal des Règlements B2B</h2>
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300">Tous les flux bancaires et Mobile Money sont synchronisés en direct.</p>
            </div>
          </div>
        )}

        {/* 13. STATISTIQUES */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Statistiques & Croissance Entreprise</h2>
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300">Graphique d'évolution des ventes et rentabilité par département.</p>
            </div>
          </div>
        )}

        {/* 14. RAPPORTS */}
        {activeTab === 'rapports' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Téléchargement des Rapports Annuels</h2>
            <button
              onClick={() => alert('Téléchargement du Rapport d\'Activité 2026 en cours...')}
              className="px-4 py-2 bg-[#2563EB] text-white text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Générer Rapport Annuel PDF</span>
            </button>
          </div>
        )}

        {/* 15. MARKETING */}
        {activeTab === 'marketing' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Stratégie Marketing Entreprise</h2>
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800">
              <p className="text-xs text-slate-300">Outils de ciblage des commerçants et clients à Bafoussam.</p>
            </div>
          </div>
        )}

        {/* 16. CAMPAGNES */}
        {activeTab === 'campagnes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Campagnes Publicitaires Sponsorisées</h2>
            <div className="space-y-2">
              {campaigns.map((c) => (
                <div key={c.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{c.name}</h4>
                    <p className="text-slate-400">{c.channel} • Budget: {c.budget}</p>
                  </div>
                  <span className="font-black text-emerald-400">{c.leads} prospects générés</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 17. PUBLICITÉS */}
        {activeTab === 'publicites' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Espaces Bannières Publicitaires AfriNova</h2>
            <p className="text-xs text-slate-400">Vos offres sont affichées en première page sur le portail client.</p>
          </div>
        )}

        {/* 18. MESSAGERIE */}
        {activeTab === 'messagerie' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Messagerie Inter-Entreprises B2B</h2>
            <div className="space-y-2">
              {corpMessages.map((m, idx) => (
                <div key={idx} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">{m.client}</span>
                    <span className="text-slate-400">{m.time}</span>
                  </div>
                  <p className="text-xs font-semibold text-blue-400">{m.topic}</p>
                  <p className="text-xs text-slate-300">{m.lastMsg}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 19. AGENDA */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Agenda & Rendez-vous d'Affaires</h2>
            <div className="space-y-2">
              {agendaEvents.map((ev) => (
                <div key={ev.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{ev.title}</h4>
                    <p className="text-slate-400">{ev.location}</p>
                  </div>
                  <span className="font-black text-amber-400">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 20. NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Centre d'Alertes Entreprise</h2>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300">
              Alerte: Validation du contrat de fourniture Bafoussam effectuée.
            </div>
          </div>
        )}

        {/* 21. DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Coffre-fort Numérique & Contrats</h2>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300">
              Registre de Commerce (RCCM), Carte Contribuable (NIU) et Statuts certifiés.
            </div>
          </div>
        )}

        {/* 22. ABONNEMENT */}
        {activeTab === 'abonnement' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Abonnement Enterprise Corporate</h2>
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 font-black text-xs rounded-full">Licence Multi-Utilisateurs Actives</span>
              <p className="text-xs text-slate-300">Accès illimité pour 20 comptes collaborateurs jusqu'en Décembre 2026.</p>
            </div>
          </div>
        )}

        {/* 23. PROFIL ENTREPRISE */}
        {activeTab === 'profil' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Profil Juridique & Commercial</h2>
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-3 max-w-lg">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Raison Sociale</label>
                <input type="text" defaultValue={currentUser?.name || 'West-Cameroon Corporate SA'} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Numéro RCCM / Registre</label>
                <input type="text" defaultValue="RC/BAF/2024/B/1402" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white" />
              </div>
            </div>
          </div>
        )}

        {/* 24. PARAMÈTRES */}
        {activeTab === 'parametres' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Configuration ERP</h2>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300">
              Gestion des rôles, permissions d'accès et sécurité SSL.
            </div>
          </div>
        )}

        {/* 25. SUPPORT */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Support VIP Grands Comptes</h2>
            <div className="p-5 bg-blue-950/80 rounded-3xl border border-blue-800 text-blue-200 space-y-2">
              <PhoneCall className="w-6 h-6 text-[#2563EB]" />
              <h3 className="font-black text-sm">Gestionnaire de Compte Dédié</h3>
              <p className="text-xs">Ligne directe prioritaire pour les entreprises partenaires: <strong>+237 677 89 45 12</strong>.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
