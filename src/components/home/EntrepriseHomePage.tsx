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
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  Plus, 
  Download, 
  Search, 
  X, 
  BarChart3, 
  Layers, 
  Mail, 
  PhoneCall, 
  Send, 
  FilePlus, 
  Check, 
  ChevronRight, 
  ArrowUpRight,
  UserCheck,
  Trash2,
  Edit3,
  Eye,
  Printer,
  PieChart,
  Tag,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  FileSpreadsheet,
  Sparkles,
  MapPin,
  Globe,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { Product, Merchant, Order, User } from '../../types';
import AboutAfriNovaSection from '../AboutAfriNovaSection';

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
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<
    'accueil' | 'employes' | 'departements' | 'produits' | 'services' | 
    'commandes' | 'factures' | 'paiements' | 'offres' | 'campagnes' | 
    'promotions' | 'messagerie' | 'stats' | 'rapports' | 'benefices' | 
    'performances' | 'abonnement' | 'profil' | 'coordonnees' | 'support'
  >('accueil');

  // Notifications / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. EMPLOYEES STATE (Gérer, Ajouter, Modifier, Supprimer)
  const [employees, setEmployees] = useState([
    { id: 'emp-1', name: 'Dr. Jean-Baptiste Foka', role: 'Directeur Général', dept: 'Direction', status: 'Actif', phone: '+237 677 11 22 33', email: 'j.foka@westcam-corp.cm', salary: 1200000 },
    { id: 'emp-2', name: 'Mme Sandrine Nguemo', role: 'Chef de Projets B2B', dept: 'Commercial', status: 'Actif', phone: '+237 699 44 55 66', email: 's.nguemo@westcam-corp.cm', salary: 650000 },
    { id: 'emp-3', name: 'Alain Fotso', role: 'Responsable Logistique', dept: 'Supply Chain', status: 'Actif', phone: '+237 680 77 88 99', email: 'a.fotso@westcam-corp.cm', salary: 500000 },
    { id: 'emp-4', name: 'Carine Mbassi', role: 'Comptable Senior', dept: 'Finance & Audit', status: 'Actif', phone: '+237 655 33 22 11', email: 'c.mbassi@westcam-corp.cm', salary: 580000 },
  ]);
  const [empSearch, setEmpSearch] = useState('');
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [empForm, setEmpForm] = useState({ name: '', role: '', dept: 'Commercial', phone: '', email: '', salary: '400000', status: 'Actif' });

  // 2. DEPARTMENTS STATE (Créer des départements)
  const [departments, setDepartments] = useState([
    { id: 'dep-1', name: 'Direction Générale', head: 'Dr. Jean-Baptiste Foka', staffCount: 3, budget: '15 000 000 FCFA' },
    { id: 'dep-2', name: 'Commercial & Ventes B2B', head: 'Mme Sandrine Nguemo', staffCount: 5, budget: '28 000 000 FCFA' },
    { id: 'dep-3', name: 'Logistique & Transit', head: 'Alain Fotso', staffCount: 4, budget: '12 000 000 FCFA' },
    { id: 'dep-4', name: 'Finance & Audit', head: 'Carine Mbassi', staffCount: 2, budget: '8 500 000 FCFA' },
  ]);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', head: '', budget: '10000000' });

  // 3. CORPORATE PRODUCTS STATE (Gérer les produits)
  const [corpProducts, setCorpProducts] = useState([
    { id: 'cp-1', name: 'Kit Solaire Autonome 5000W B2B', price: 1850000, category: 'Énergie', stock: 12, ref: 'SOL-5000' },
    { id: 'cp-2', name: 'Lot Café Arabica Bio Gros 500kg', price: 2400000, category: 'Agroalimentaire', stock: 45, ref: 'AGRO-CAF-500' },
    { id: 'cp-3', name: 'Transformateur Triphasé 100KVA', price: 4200000, category: 'Industrie', stock: 4, ref: 'IND-TR-100' },
  ]);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [prodForm, setProdForm] = useState({ name: '', category: 'Industrie', price: '1000000', stock: '10', ref: 'PRO-01' });

  // 4. CORPORATE SERVICES STATE (Gérer les services)
  const [corpServices, setCorpServices] = useState([
    { id: 'cs-1', title: 'Audit & Maintenance Solaire B2B', price: '250 000 FCFA/intervention', category: 'Ingénierie', description: 'Diagnostic complet des installations photovoltaïques.' },
    { id: 'cs-2', title: 'Infogérance & Réseaux d\'Entreprise', price: '350 000 FCFA/mois', category: 'Informatique', description: 'Supervision réseau, cybersécurité et assistance 24/7.' },
    { id: 'cs-3', title: 'Transit & Dédouanement Fret Ouest', price: 'Sur Devis', category: 'Logistique', description: 'Transport sécurisé Douala - Bafoussam - Bamenda.' },
  ]);
  const [isServModalOpen, setIsServModalOpen] = useState(false);
  const [servForm, setServForm] = useState({ title: '', category: 'Ingénierie', price: '150 000 FCFA', description: '' });

  // 5. B2B ORDERS STATE (Recevoir les commandes)
  const [b2bOrders, setB2bOrders] = useState([
    { id: 'ORD-B2B-901', clientName: 'Hôtel Bafoussam Palace SA', items: '2x Kit Solaire Autonome 5000W', total: 3700000, date: '01 Août 2026', status: 'En cours' },
    { id: 'ORD-B2B-902', clientName: 'Coopérative Agricole des Hauts-Plateaux', items: '1x Lot Café Arabica Bio Gros', total: 2400000, date: '29 Juil 2026', status: 'Livrée' },
    { id: 'ORD-B2B-903', clientName: 'Société BTP Tamdja & Fils', items: '1x Audit Maintenance Solaire', total: 250000, date: '25 Juil 2026', status: 'En attente' },
  ]);

  // 6. INVOICES STATE (Émettre des factures)
  const [invoices, setInvoices] = useState([
    { id: 'FAC-2026-0041', clientName: 'Hôtel Bafoussam Palace SA', clientNiu: 'M0518123984A', amountHT: 3102725, tax: 597275, amountTTC: 3700000, date: '30 Juil 2026', dueDate: '15 Août 2026', status: 'Payé' },
    { id: 'FAC-2026-0042', clientName: 'Centrale Gros Marché A', clientNiu: 'M0219837482B', amountHT: 2012578, tax: 387422, amountTTC: 2400000, date: '28 Juil 2026', dueDate: '10 Août 2026', status: 'En attente' },
    { id: 'FAC-2026-0043', clientName: 'Complexe Scolaire Kamkop', clientNiu: 'M0821948271C', amountHT: 1257861, tax: 242139, amountTTC: 1500000, date: '22 Juil 2026', dueDate: '05 Août 2026', status: 'Payé' },
  ]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invForm, setInvForm] = useState({ clientName: '', clientNiu: '', amount: '1000000', dueDate: '2026-08-30' });
  const [selectedInvoiceForPDF, setSelectedInvoiceForPDF] = useState<any>(null);

  // 7. PAYMENTS STATE (Gérer les paiements)
  const [payments, setPayments] = useState([
    { id: 'PAY-8801', ref: 'MOMO-20260730-8812', client: 'Hôtel Bafoussam Palace SA', amount: 3700000, method: 'Virement bancaire / MoMo', date: '30 Juil 2026', status: 'Validé' },
    { id: 'PAY-8802', ref: 'ORANGE-20260722-1092', client: 'Complexe Scolaire Kamkop', amount: 1500000, method: 'Orange Money B2B', date: '22 Juil 2026', status: 'Validé' },
    { id: 'PAY-8803', ref: 'CHQ-BICEC-00982', client: 'Centrale Gros Marché A', amount: 1200000, method: 'Chèque BICEC', date: '18 Juil 2026', status: 'En attente de compensation' },
  ]);

  // 8. OFFERS STATE (Publier des offres)
  const [offers, setOffers] = useState([
    { id: 'OFF-101', title: 'Appel d\'Offre: Fourniture Panneaux Solaires 50KVA', type: 'Appel d\'Offres B2B', budget: '12 000 000 FCFA', deadline: '20 Août 2026', applicants: 6, status: 'Ouvert' },
    { id: 'OFF-102', title: 'Recrutement: 2 Ingénieurs Électriciens Seniors', type: 'Offre d\'Emploi', budget: 'Selon grille RH', deadline: '15 Août 2026', applicants: 18, status: 'Ouvert' },
    { id: 'OFF-103', title: 'Consultance: Migration Informatique & ERP Cloud', type: 'Prestation B2B', budget: '3 500 000 FCFA', deadline: '05 Août 2026', applicants: 4, status: 'En cours de sélection' },
  ]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({ title: '', type: 'Appel d\'Offres B2B', budget: '5000000 FCFA', deadline: '2026-08-31' });

  // 9. MARKETING CAMPAIGNS STATE (Créer des campagnes marketing)
  const [campaigns, setCampaigns] = useState([
    { id: 'CAMP-01', name: 'Sponsoring B2B Solaire Bafoussam 2026', channel: 'AfriNova Banner Top', budget: '300 000 FCFA', status: 'Active', leads: 64, roi: 'x3.8' },
    { id: 'CAMP-02', name: 'Push SMS Pro: Produits Agroalimentaires', channel: 'SMS & WhatsApp Pro', budget: '150 000 FCFA', status: 'Active', leads: 42, roi: 'x2.5' },
    { id: 'CAMP-03', name: 'Lancement Gamme Électrique Industrie', channel: 'Emailing Massif B2B', budget: '200 000 FCFA', status: 'Planifiée', leads: 0, roi: '-' },
  ]);
  const [isCampModalOpen, setIsCampModalOpen] = useState(false);
  const [campForm, setCampForm] = useState({ name: '', channel: 'AfriNova Banner Top', budget: '200000' });

  // 10. PROMOTIONS STATE (Lancer des promotions)
  const [promotions, setPromotions] = useState([
    { id: 'PROM-01', code: 'SOLAR-B2B-10', discount: '10%', target: 'Kits Solaires Autonomes', expiry: '31 Août 2026', uses: 14, status: 'Active' },
    { id: 'PROM-02', code: 'AGRO-PRO-15', discount: '15%', target: 'Lots Café & Épices Bafoussam', expiry: '15 Août 2026', uses: 28, status: 'Active' },
  ]);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: 'B2B-FLASH-20', discount: '20%', target: 'Tous les produits', expiry: '2026-08-31' });

  // 11. MESSAGES STATE (Envoyer des messages)
  const [messages, setMessages] = useState([
    { id: 'msg-1', client: 'Hôtel Bafoussam Palace SA', topic: 'Installation Kit Solaire 5000W', lastMsg: 'Bonjour, notre équipe technique arrivera demain à 8h.', time: '10:45', unread: false, thread: [
      { sender: 'Hôtel Bafoussam Palace', text: 'Bonjour, pouvez-vous confirmer le créneau pour l\'installation ?', time: '09:12' },
      { sender: 'West-Cameroon Corp', text: 'Bonjour, notre équipe technique arrivera demain à 8h.', time: '10:45' }
    ]},
    { id: 'msg-2', client: 'Coopérative Agricole Ouest', topic: 'Règlement de la facture FAC-2026-0042', lastMsg: 'Pouvez-vous nous envoyer l\'attestation de paiement ?', time: 'Hier', unread: true, thread: [
      { sender: 'Coopérative Agricole', text: 'Pouvez-vous nous envoyer l\'attestation de paiement ?', time: 'Hier' }
    ]}
  ]);
  const [activeMsgIndex, setActiveMsgIndex] = useState(0);
  const [newMsgText, setNewMsgText] = useState('');

  // 12. PROFILE & CONTACT STATE (Modifier profil entreprise & modifier coordonnées)
  const [profile, setProfile] = useState({
    companyName: currentUser?.name || 'West-Cameroon Corporate SA',
    rccm: 'RC/BAF/2024/B/1402',
    niu: 'M0518123984A',
    legalForm: 'Société Anonyme (SA)',
    industry: 'Énergie, Agro-industrie & Services B2B',
    capital: '50 000 000 FCFA',
    description: 'Leader régional de la fourniture d\'équipements solaires, agro-alimentaires et de services d\'ingénierie B2B à Bafoussam et dans la région de l\'Ouest Cameroun.'
  });

  const [contact, setContact] = useState({
    address: 'Avenue de l\'Indépendance, Immeuble du Centre',
    cityQuarter: 'Bafoussam, Tamdja',
    primaryPhone: '+237 677 89 45 12',
    secondaryPhone: '+237 699 12 34 56',
    email: 'contact@westcam-corporate.cm',
    website: 'https://westcam-corporate.cm',
    poBox: 'B.P. 408 Bafoussam'
  });

  // 13. SUBSCRIPTION STATE (Gérer son abonnement)
  const [subscription, setSubscription] = useState({
    planName: 'Formule Enterprise Corporate VIP',
    monthlyPrice: 50000,
    status: 'Actif',
    expiryDate: '31 Décembre 2026',
    maxUsers: 20,
    activeUsers: employees.length
  });

  // 14. SUPPORT TICKETS STATE (Contacter le support)
  const [tickets, setTickets] = useState([
    { id: 'TICK-901', subject: 'Demande de relevé de facturation annuelle', dept: 'Comptabilité AfriNova', priority: 'Moyenne', status: 'Résolu', date: '25 Juil 2026' },
    { id: 'TICK-902', subject: 'Augmentation quota comptes employés ERP', dept: 'Support Technique VIP', priority: 'Haute', status: 'En cours', date: '01 Août 2026' }
  ]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', priority: 'Normale', message: '' });

  // PDF DOWNLOAD TRIGGER FUNCTION
  const handleDownloadPDF = (title: string, detailText: string) => {
    const fileContent = 
      `===================================================================\n` +
      `                   AFRINOVA ERP ENTERPRISE B2B                     \n` +
      `                   RAPPORT / DOCUMENT OFFICIEL                     \n` +
      `===================================================================\n\n` +
      `DOCUMENT: ${title.toUpperCase()}\n` +
      `DATE GÉNÉRATION: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}\n` +
      `ENTREPRISE: ${profile.companyName}\n` +
      `REGISTRE DU COMMERCE (RCCM): ${profile.rccm}\n` +
      `IDENTIFIANT FISCAL (NIU): ${profile.niu}\n` +
      `SIÈGE SOCIAL: ${contact.address}, ${contact.cityQuarter}\n` +
      `CONTACT: ${contact.primaryPhone} | ${contact.email}\n\n` +
      `-------------------------------------------------------------------\n` +
      `DETAILS & SYNTHÈSE DES DONNÉES:\n` +
      `-------------------------------------------------------------------\n\n` +
      detailText + `\n\n` +
      `===================================================================\n` +
      `Certifié conforme & extrait du système AfriNova Enterprise Cloud.\n` +
      `===================================================================`;

    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`Le rapport PDF/TXT "${title}" a été téléchargé avec succès.`);
  };

  return (
    <div className="w-full bg-[#0F172A] text-slate-100 min-h-screen pb-24 font-sans relative">
      
      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#2563EB] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400/30"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span className="text-xs font-black">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER CORPORATE ENTERPRISE */}
      <div className="bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-[#2563EB] border-b border-slate-800 p-5 sm:p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#2563EB] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Système ERP Enterprise B2B
              </span>
              <span className="text-slate-400 text-xs font-mono">{contact.cityQuarter}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              {profile.companyName}
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Système de gestion globale: Employés, Départements, Facturation, Offres & Campagnes Marketing B2B.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('offres');
                setIsOfferModalOpen(true);
              }}
              className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Publier Offre B2B</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="h-10 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Se Déconnecter</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION BAR (Enterprise Tabs Only - NO Client/Boutique/Prestataire) */}
      <div className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 shadow-md mb-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-2.5">
          {[
            { id: 'accueil', label: 'Vue Générale', icon: Building2 },
            { id: 'employes', label: `Employés (${employees.length})`, icon: Users },
            { id: 'departements', label: `Départements (${departments.length})`, icon: Briefcase },
            { id: 'produits', label: `Produits (${corpProducts.length})`, icon: Package },
            { id: 'services', label: `Services (${corpServices.length})`, icon: Wrench },
            { id: 'commandes', label: `Commandes (${b2bOrders.length})`, icon: ShoppingBag },
            { id: 'factures', label: `Factures (${invoices.length})`, icon: FileText },
            { id: 'paiements', label: 'Paiements', icon: DollarSign },
            { id: 'offres', label: `Offres (${offers.length})`, icon: FilePlus },
            { id: 'campagnes', label: `Campagnes (${campaigns.length})`, icon: Megaphone },
            { id: 'promotions', label: 'Promotions', icon: Tag },
            { id: 'messagerie', label: 'Messagerie', icon: Mail, badge: 1 },
            { id: 'stats', label: 'Statistiques', icon: BarChart3 },
            { id: 'rapports', label: 'Rapports PDF', icon: Download },
            { id: 'benefices', label: 'Bénéfices', icon: TrendingUp },
            { id: 'performances', label: 'Performances', icon: PieChart },
            { id: 'abonnement', label: 'Abonnement', icon: ShieldCheck },
            { id: 'profil', label: 'Profil Entreprise', icon: Building2 },
            { id: 'coordonnees', label: 'Coordonnées', icon: MapPin },
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
                    ? 'bg-[#2563EB] text-white shadow-md'
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

      {/* DYNAMIC TAB MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 space-y-6">

        {/* 1. VUE GÉNÉRALE / ACCUEIL */}
        {activeTab === 'accueil' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Chiffre d'Affaires Mensuel</span>
                <p className="text-xl font-black text-[#2563EB]">12 850 000 FCFA</p>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +28.5% vs mois dernier
                </span>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Masse Salariale</span>
                <p className="text-xl font-black text-white">{employees.reduce((acc, e) => acc + e.salary, 0).toLocaleString()} FCFA</p>
                <span className="text-[10px] text-blue-400 font-bold">{employees.length} employés actifs</span>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Factures à Recouvrer</span>
                <p className="text-xl font-black text-amber-400">2 400 000 FCFA</p>
                <span className="text-[10px] text-amber-300 font-bold">1 facture en attente</span>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bénéfice Net Estimé</span>
                <p className="text-xl font-black text-emerald-400">5 410 000 FCFA</p>
                <span className="text-[10px] text-emerald-300 font-bold">Marge brute 42.1%</span>
              </div>
            </div>

            {/* Quick Actions Modules */}
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Accès Rapide aux Fonctions Entreprise</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => { setActiveTab('employes'); setIsEmpModalOpen(true); }}
                  className="p-4 rounded-2xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-800/40 text-left space-y-1 transition cursor-pointer"
                >
                  <Users className="w-5 h-5 text-indigo-400" />
                  <p className="text-xs font-black">Ajouter Employé</p>
                  <p className="text-[10px] text-indigo-300">Ressources Humaines</p>
                </button>

                <button
                  onClick={() => { setActiveTab('factures'); setIsInvoiceModalOpen(true); }}
                  className="p-4 rounded-2xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-200 border border-blue-800/40 text-left space-y-1 transition cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-blue-400" />
                  <p className="text-xs font-black">Émettre Facture</p>
                  <p className="text-[10px] text-blue-300">Gestion Facturation</p>
                </button>

                <button
                  onClick={() => { setActiveTab('offres'); setIsOfferModalOpen(true); }}
                  className="p-4 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-800/40 text-left space-y-1 transition cursor-pointer"
                >
                  <FilePlus className="w-5 h-5 text-emerald-400" />
                  <p className="text-xs font-black">Publier Offre B2B</p>
                  <p className="text-[10px] text-emerald-300">Appel d'offres / Devis</p>
                </button>

                <button
                  onClick={() => { setActiveTab('campagnes'); setIsCampModalOpen(true); }}
                  className="p-4 rounded-2xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-800/40 text-left space-y-1 transition cursor-pointer"
                >
                  <Megaphone className="w-5 h-5 text-amber-400" />
                  <p className="text-xs font-black">Créer Campagne</p>
                  <p className="text-[10px] text-amber-300">Marketing & Publicité</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. GÉRER LES EMPLOYÉS (Ajouter, Modifier, Supprimer) */}
        {activeTab === 'employes' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Gestion des Employés & Ressources Humaines</h2>
                <p className="text-xs text-slate-400">Effectif total: {employees.length} collaborateurs sous contrat.</p>
              </div>

              <button
                onClick={() => {
                  setEditingEmp(null);
                  setEmpForm({ name: '', role: '', dept: 'Commercial', phone: '+237 ', email: '', salary: '400000', status: 'Actif' });
                  setIsEmpModalOpen(true);
                }}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Employé</span>
              </button>
            </div>

            {/* Filter Search input */}
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Employees Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Nom & Prénom</th>
                    <th className="p-3.5">Poste / Rôle</th>
                    <th className="p-3.5">Département</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Salaire Mensuel</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {employees
                    .filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase()) || e.role.toLowerCase().includes(empSearch.toLowerCase()))
                    .map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3.5 font-bold text-white">{emp.name}</td>
                        <td className="p-3.5 text-slate-300">{emp.role}</td>
                        <td className="p-3.5 text-blue-400 font-semibold">{emp.dept}</td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">{emp.phone}<br/>{emp.email}</td>
                        <td className="p-3.5 font-bold text-emerald-400">{emp.salary.toLocaleString()} FCFA</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingEmp(emp);
                              setEmpForm({
                                name: emp.name,
                                role: emp.role,
                                dept: emp.dept,
                                phone: emp.phone,
                                email: emp.email,
                                salary: emp.salary.toString(),
                                status: emp.status
                              });
                              setIsEmpModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400 cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Voulez-vous vraiment supprimer l'employé ${emp.name} ?`)) {
                                setEmployees(prev => prev.filter(e => e.id !== emp.id));
                                showToast(`Employé ${emp.name} supprimé.`);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950/80 rounded-lg text-rose-400 cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. CRÉER ET GÉRER LES DÉPARTEMENTS */}
        {activeTab === 'departements' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Départements & Pôles Opérationnels</h2>
                <p className="text-xs text-slate-400">Organisation de la structure d'entreprise.</p>
              </div>

              <button
                onClick={() => setIsDeptModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un Département</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <div key={dept.id} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base text-white">{dept.name}</h3>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer le département ${dept.name} ?`)) {
                          setDepartments(prev => prev.filter(d => d.id !== dept.id));
                          showToast(`Département ${dept.name} supprimé.`);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">Responsable: <strong className="text-slate-200">{dept.head}</strong></p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-blue-400 font-black">{dept.staffCount} collaborateurs</span>
                    <span className="text-emerald-400 font-mono font-bold">Budget: {dept.budget}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. GÉRER LES PRODUITS CORPORATE */}
        {activeTab === 'produits' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Catalogue Produits de l'Entreprise</h2>
                <p className="text-xs text-slate-400">Gérer les produits vendus aux partenaires B2B.</p>
              </div>
              <button
                onClick={() => setIsProdModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Produit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {corpProducts.map((p) => (
                <div key={p.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[9px] font-black font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full">{p.ref}</span>
                  <h4 className="font-bold text-sm text-white">{p.name}</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-emerald-400">{p.price.toLocaleString()} FCFA</span>
                    <span className="text-slate-400">Stock: {p.stock} unités</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        const newStock = prompt('Nouveau stock pour ' + p.name, p.stock.toString());
                        if (newStock) {
                          setCorpProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: parseInt(newStock) } : item));
                          showToast('Stock mis à jour.');
                        }
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-blue-300 rounded-lg cursor-pointer"
                    >
                      Ajuster Stock
                    </button>
                    <button
                      onClick={() => {
                        setCorpProducts(prev => prev.filter(item => item.id !== p.id));
                        showToast('Produit retiré.');
                      }}
                      className="p-1 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. GÉRER LES SERVICES B2B */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Services B2B & Prestations Entreprise</h2>
                <p className="text-xs text-slate-400">Offres de services facturables aux professionnels.</p>
              </div>
              <button
                onClick={() => setIsServModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Service B2B</span>
              </button>
            </div>

            <div className="space-y-3">
              {corpServices.map((s) => (
                <div key={s.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-blue-400 uppercase bg-blue-950 px-2 py-0.5 rounded-full">{s.category}</span>
                    <h4 className="font-bold text-white text-sm">{s.title}</h4>
                    <p className="text-slate-400 text-xs">{s.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-emerald-400 text-sm">{s.price}</span>
                    <button
                      onClick={() => {
                        setCorpServices(prev => prev.filter(item => item.id !== s.id));
                        showToast('Service retiré.');
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. RECEVOIR LES COMMANDES */}
        {activeTab === 'commandes' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Commandes B2B Reçues</h2>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Réf Commande</th>
                    <th className="p-3.5">Client B2B</th>
                    <th className="p-3.5">Articles / Prestation</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Montant Total</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Changer Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {b2bOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3.5 font-mono text-slate-300">{ord.id}</td>
                      <td className="p-3.5 font-bold text-white">{ord.clientName}</td>
                      <td className="p-3.5 text-slate-300">{ord.items}</td>
                      <td className="p-3.5 text-slate-400">{ord.date}</td>
                      <td className="p-3.5 font-black text-emerald-400">{ord.total.toLocaleString()} FCFA</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          ord.status === 'Livrée' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <select
                          value={ord.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            setB2bOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: newStatus } : o));
                            showToast(`Commande ${ord.id} passée à "${newStatus}"`);
                          }}
                          className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white cursor-pointer"
                        >
                          <option value="En attente">En attente</option>
                          <option value="En cours">En cours</option>
                          <option value="Livrée">Livrée</option>
                          <option value="Annulée">Annulée</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. ÉMETTRE DES FACTURES */}
        {activeTab === 'factures' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Facturation & Décomptes B2B</h2>
                <p className="text-xs text-slate-400">Émettre, suivre et exporter les factures réglementaires.</p>
              </div>

              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Émettre une Facture</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">N° Facture</th>
                    <th className="p-3.5">Client B2B (NIU)</th>
                    <th className="p-3.5">Émission / Échéance</th>
                    <th className="p-3.5">Montant HT</th>
                    <th className="p-3.5">TVA (19.25%)</th>
                    <th className="p-3.5">Total TTC</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3.5 font-mono text-slate-300 font-bold">{inv.id}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{inv.clientName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{inv.clientNiu}</span>
                      </td>
                      <td className="p-3.5 text-slate-400">{inv.date}<br/><span className="text-[10px] text-amber-400">Échéance: {inv.dueDate}</span></td>
                      <td className="p-3.5 font-mono text-slate-300">{inv.amountHT.toLocaleString()} FCFA</td>
                      <td className="p-3.5 font-mono text-slate-400">{inv.tax.toLocaleString()} FCFA</td>
                      <td className="p-3.5 font-black text-emerald-400">{inv.amountTTC.toLocaleString()} FCFA</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          inv.status === 'Payé' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            handleDownloadPDF(
                              `Facture_${inv.id}`,
                              `N° FACTURE: ${inv.id}\nCLIENT: ${inv.clientName} (NIU: ${inv.clientNiu})\nDATE ÉMISSION: ${inv.date}\nDATE ÉCHÉANCE: ${inv.dueDate}\nMONTANT HT: ${inv.amountHT.toLocaleString()} FCFA\nTVA 19.25%: ${inv.tax.toLocaleString()} FCFA\nMONTANT TOTAL TTC: ${inv.amountTTC.toLocaleString()} FCFA\nSTATUT REGLEMENT: ${inv.status}`
                            );
                          }}
                          className="px-2.5 py-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-300 text-xs font-bold rounded-lg flex items-center gap-1.5 ml-auto cursor-pointer border border-blue-800/50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. GÉRER LES PAIEMENTS */}
        {activeTab === 'paiements' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Journal des Règlements & Paiements B2B</h2>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Référence Réf</th>
                    <th className="p-3.5">Client / Organisme</th>
                    <th className="p-3.5">Mode de Règlement</th>
                    <th className="p-3.5">Montant Encassé</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3.5 font-mono text-slate-300">{p.ref}</td>
                      <td className="p-3.5 font-bold text-white">{p.client}</td>
                      <td className="p-3.5 text-blue-400 font-semibold">{p.method}</td>
                      <td className="p-3.5 font-black text-emerald-400">{p.amount.toLocaleString()} FCFA</td>
                      <td className="p-3.5 text-slate-400">{p.date}</td>
                      <td className="p-3.5 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. PUBLIER DES OFFRES B2B */}
        {activeTab === 'offres' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Offres Commerciales & Appels d'Offres</h2>
                <p className="text-xs text-slate-400">Publier des appels d'offres ou consulter les demandes de devis.</p>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publier une Offre</span>
              </button>
            </div>

            <div className="space-y-3">
              {offers.map((off) => (
                <div key={off.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-blue-400 uppercase bg-blue-950 px-2 py-0.5 rounded-full">{off.type}</span>
                    <h4 className="font-bold text-white text-sm">{off.title}</h4>
                    <p className="text-slate-400">Date limite: <strong className="text-slate-200">{off.deadline}</strong> • {off.applicants} candidatures / réponses</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-emerald-400 text-sm">{off.budget}</span>
                    <button
                      onClick={() => {
                        setOffers(prev => prev.filter(o => o.id !== off.id));
                        showToast('Offre retirée.');
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. CRÉER DES CAMPAGNES MARKETING */}
        {activeTab === 'campagnes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Campagnes Marketing & Sponsoring B2B</h2>
                <p className="text-xs text-slate-400">Promouvoir votre entreprise auprès des clients de Bafoussam.</p>
              </div>
              <button
                onClick={() => setIsCampModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Créer une Campagne</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-950 px-2 py-0.5 rounded-full">{camp.status}</span>
                  <h4 className="font-bold text-white text-sm">{camp.name}</h4>
                  <p className="text-slate-400">Canal: {camp.channel}</p>
                  <p className="text-slate-300 font-bold">Budget: {camp.budget}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                    <span className="text-blue-400 font-bold">{camp.leads} prospects</span>
                    <span className="text-emerald-400 font-mono">ROI: {camp.roi}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 11. LANCER DES PROMOTIONS */}
        {activeTab === 'promotions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Promotions & Codes Remises B2B</h2>
                <p className="text-xs text-slate-400">Activer des offres spéciales pour stimuler le volume des ventes.</p>
              </div>
              <button
                onClick={() => setIsPromoModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Lancer une Promotion</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {promotions.map((promo) => (
                <div key={promo.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-base font-black text-blue-400 bg-blue-950 px-3 py-1 rounded-xl border border-blue-800/50">{promo.code}</span>
                    <span className="text-lg font-black text-emerald-400">-{promo.discount}</span>
                  </div>
                  <p className="text-white font-bold">Cible: {promo.target}</p>
                  <div className="flex justify-between items-center text-slate-400 text-[11px] pt-2 border-t border-slate-800">
                    <span>Valide jusqu'au: {promo.expiry}</span>
                    <span>{promo.uses} utilisations</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12. ENVOYER DES MESSAGES */}
        {activeTab === 'messagerie' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Messagerie Inter-Entreprises & B2B</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-slate-900 rounded-3xl border border-slate-800 p-4 min-h-[400px]">
              {/* Message Contacts list */}
              <div className="space-y-2 border-r border-slate-800 pr-3">
                <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Conversations</h4>
                {messages.map((m, idx) => (
                  <div
                    key={m.id}
                    onClick={() => setActiveMsgIndex(idx)}
                    className={`p-3 rounded-2xl cursor-pointer transition ${
                      activeMsgIndex === idx ? 'bg-blue-950 border border-blue-800/60' : 'bg-slate-950/50 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white truncate max-w-[150px]">{m.client}</span>
                      <span className="text-[10px] text-slate-400">{m.time}</span>
                    </div>
                    <p className="text-[11px] text-blue-300 font-semibold truncate">{m.topic}</p>
                    <p className="text-[10px] text-slate-400 truncate">{m.lastMsg}</p>
                  </div>
                ))}
              </div>

              {/* Chat Conversation details */}
              <div className="lg:col-span-2 flex flex-col justify-between space-y-4 pl-2">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm text-white">{messages[activeMsgIndex]?.client}</h3>
                  <p className="text-xs text-blue-400 font-medium">{messages[activeMsgIndex]?.topic}</p>
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-none p-2 bg-slate-950/40 rounded-2xl">
                  {messages[activeMsgIndex]?.thread.map((t, idx) => (
                    <div key={idx} className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                      t.sender === 'West-Cameroon Corp' ? 'bg-[#2563EB] text-white ml-auto' : 'bg-slate-800 text-slate-200'
                    }`}>
                      <span className="text-[9px] block font-bold opacity-75">{t.sender} • {t.time}</span>
                      <p className="mt-1">{t.text}</p>
                    </div>
                  ))}
                </div>

                {/* Send Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Tapez votre message B2B..."
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMsgText.trim()) {
                        const updated = [...messages];
                        updated[activeMsgIndex].thread.push({ sender: 'West-Cameroon Corp', text: newMsgText, time: 'À l\'instant' });
                        updated[activeMsgIndex].lastMsg = newMsgText;
                        setMessages(updated);
                        setNewMsgText('');
                        showToast('Message envoyé !');
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (newMsgText.trim()) {
                        const updated = [...messages];
                        updated[activeMsgIndex].thread.push({ sender: 'West-Cameroon Corp', text: newMsgText, time: 'À l\'instant' });
                        updated[activeMsgIndex].lastMsg = newMsgText;
                        setMessages(updated);
                        setNewMsgText('');
                        showToast('Message envoyé !');
                      }
                    }}
                    className="px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 13. CONSULTER LES STATISTIQUES */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Statistiques de Croissance & Tableau de Bord Analyste</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">Taux de Rétention Clients B2B</span>
                <p className="text-3xl font-black text-blue-400">94.2%</p>
                <p className="text-xs text-slate-400">28 comptes grands contrats récurrents.</p>
              </div>

              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">Panier Moyen B2B</span>
                <p className="text-3xl font-black text-emerald-400">1 850 000 FCFA</p>
                <p className="text-xs text-slate-400">Moyenne par commande d'équipement.</p>
              </div>

              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">Projets Exécutés 2026</span>
                <p className="text-3xl font-black text-purple-400">38 Projets</p>
                <p className="text-xs text-slate-400">Département Ingénierie & Solaire.</p>
              </div>
            </div>
          </div>
        )}

        {/* 14. VOIR LES RAPPORTS & TÉLÉCHARGER PDF */}
        {activeTab === 'rapports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Rapports d'Activité & Bilan Financier</h2>
                <p className="text-xs text-slate-400">Télécharger les synthèses officielles certifiées.</p>
              </div>
              <button
                onClick={() => handleDownloadPDF('Rapport_Global_Entreprise_2026', `RAPPORT GLOBAL DE PERFORMANCES B2B - BAFOUSSAM\nEmployés: ${employees.length}\nChiffre d'Affaires Cumulé: 48 200 000 FCFA\nBénéfice Net: 18 400 000 FCFA\nProjets Réalisés: 38\nTaux de Rétention Clients: 94.2%`)}
                className="px-4 py-2 bg-[#2563EB] text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Rapport Annuel PDF</span>
              </button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Rapport Annuel d\'Activité & Bilan Financier 2026', date: '31 Juillet 2026', size: '2.4 Mo' },
                { title: 'Audit Ressources Humaines & Masse Salariale', date: '15 Juillet 2026', size: '1.1 Mo' },
                { title: 'Bilan Trimestriel Ventes B2B & Sponsoring', date: '30 Juin 2026', size: '1.8 Mo' },
              ].map((rep, idx) => (
                <div key={idx} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white text-sm">{rep.title}</h4>
                    <p className="text-slate-400">{rep.date} • {rep.size}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(rep.title, `TITRE DU RAPPORT: ${rep.title}\nDATE DE CLÔTURE: ${rep.date}\nTAILLE DU FICHIER: ${rep.size}\nSTATUS: Certifié conforme par la Direction Financière Bafoussam.`)}
                    className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-blue-300 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border border-blue-800/50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger PDF</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 15. VOIR LES BÉNÉFICES */}
        {activeTab === 'benefices' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Analyse des Bénéfices & Marges Réelles</h2>
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Revenus Bruts Total</span>
                  <p className="text-2xl font-black text-white">12 850 000 FCFA</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Charges & Coûts Opérationnels</span>
                  <p className="text-2xl font-black text-rose-400">7 440 000 FCFA</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Bénéfice Net Résiduel</span>
                  <p className="text-2xl font-black text-emerald-400">5 410 000 FCFA</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 border-t border-slate-800 pt-3">
                Marge nette de <strong>42.1%</strong> sur les contrats B2B exécutés ce mois dans la région de l'Ouest.
              </p>
            </div>
          </div>
        )}

        {/* 16. VOIR LES PERFORMANCES */}
        {activeTab === 'performances' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Performances par Département & Pôle</h2>
            <div className="space-y-3">
              {departments.map((d) => (
                <div key={d.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">{d.name}</span>
                    <span className="text-emerald-400 font-bold">Objectif atteint à 92%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2563EB] h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 17. GÉRER SON ABONNEMENT */}
        {activeTab === 'abonnement' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Abonnement Enterprise Corporate</h2>
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4 max-w-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-full">Statut: {subscription.status}</span>
                  <h3 className="text-lg font-black text-white mt-2">{subscription.planName}</h3>
                  <p className="text-xs text-slate-400">Expire le: {subscription.expiryDate}</p>
                </div>
                <span className="text-xl font-black text-blue-400">{subscription.monthlyPrice.toLocaleString()} FCFA/mois</span>
              </div>

              <div className="text-xs text-slate-300 space-y-1 border-t border-slate-800 pt-3">
                <p>• Comprend {subscription.maxUsers} comptes collaborateurs multi-accès ({subscription.activeUsers} actifs)</p>
                <p>• Module facturation réglementaire & export PDF illimité</p>
                <p>• Sponsoring d'offres B2B & Support VIP dédié 24/7</p>
              </div>

              <button
                onClick={() => {
                  showToast('Redirection vers le portail de renouvellement MoMo / Orange Money...');
                }}
                className="w-full py-3 bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs rounded-xl transition cursor-pointer"
              >
                Renouveler Abonnement (MTN MoMo / Orange Money)
              </button>
            </div>
          </div>
        )}

        {/* 18. MODIFIER PROFIL ENTREPRISE */}
        {activeTab === 'profil' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Modifier le Profil Entreprise</h2>
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Raison Sociale</label>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Forme Juridique</label>
                  <input
                    type="text"
                    value={profile.legalForm}
                    onChange={(e) => setProfile({ ...profile, legalForm: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">N° Registre du Commerce (RCCM)</label>
                  <input
                    type="text"
                    value={profile.rccm}
                    onChange={(e) => setProfile({ ...profile, rccm: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">N° Identifiant Fiscal (NIU)</label>
                  <input
                    type="text"
                    value={profile.niu}
                    onChange={(e) => setProfile({ ...profile, niu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Secteur d'Activité</label>
                <input
                  type="text"
                  value={profile.industry}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description de l'Entreprise</label>
                <textarea
                  rows={3}
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <button
                onClick={() => showToast('Profil entreprise mis à jour avec succès.')}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs rounded-xl transition cursor-pointer"
              >
                Enregistrer le Profil Entreprise
              </button>
            </div>

            {/* À propos d'AfriNova */}
            <AboutAfriNovaSection />
          </div>
        )}

        {/* 19. MODIFIER LES COORDONNÉES */}
        {activeTab === 'coordonnees' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Modifier les Coordonnées Officiel</h2>
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Adresse du Siège Social</label>
                  <input
                    type="text"
                    value={contact.address}
                    onChange={(e) => setContact({ ...contact, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ville & Quartier Bafoussam</label>
                  <input
                    type="text"
                    value={contact.cityQuarter}
                    onChange={(e) => setContact({ ...contact, cityQuarter: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Téléphone Principal</label>
                  <input
                    type="text"
                    value={contact.primaryPhone}
                    onChange={(e) => setContact({ ...contact, primaryPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Professionnel</label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => showToast('Coordonnées enregistrées avec succès.')}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white font-black text-xs rounded-xl transition cursor-pointer"
              >
                Enregistrer les Coordonnées
              </button>
            </div>
          </div>
        )}

        {/* 20. CONTACTER LE SUPPORT VIP */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Support VIP Grands Comptes 24/7</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-950/60 rounded-3xl border border-blue-800/80 space-y-3">
                <PhoneCall className="w-8 h-8 text-blue-400" />
                <h3 className="font-black text-base text-white">Ligne Directe Prioritaire</h3>
                <p className="text-xs text-blue-200">
                  Votre conseiller grands comptes dédié est disponible à tout moment pour la gestion de vos opérations.
                </p>
                <div className="pt-2">
                  <span className="text-lg font-black text-emerald-300 font-mono">+237 677 89 45 12</span>
                </div>
              </div>

              {/* Form submit ticket */}
              <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white">Ouvrir un Ticket de Support</h3>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Objet de la Demande</label>
                  <input
                    type="text"
                    placeholder="Ex: Assistance paramétrage factures..."
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Détails du besoin..."
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <button
                  onClick={() => {
                    if (ticketForm.subject) {
                      setTickets(prev => [{ id: `TICK-${Date.now().toString().slice(-3)}`, subject: ticketForm.subject, dept: 'Support VIP', priority: ticketForm.priority, status: 'En cours', date: 'Aujourd\'hui' }, ...prev]);
                      setTicketForm({ subject: '', priority: 'Normale', message: '' });
                      showToast('Ticket transmis à votre gestionnaire.');
                    }
                  }}
                  className="w-full py-2.5 bg-[#2563EB] text-white font-black text-xs rounded-xl cursor-pointer"
                >
                  Envoyer le Ticket
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ALL MODALS FOR ADDING / EDITING ITEMS */}

      {/* 1. EMPLOYEE MODAL */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-white">{editingEmp ? 'Modifier l\'Employé' : 'Ajouter un Employé'}</h3>
              <button onClick={() => setIsEmpModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400">Nom & Prénom</label>
                <input type="text" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">Poste / Rôle</label>
                <input type="text" value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">Département</label>
                <select value={empForm.dept} onChange={e => setEmpForm({...empForm, dept: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1">
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-400">Téléphone</label>
                <input type="text" value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">Salaire Mensuel (FCFA)</label>
                <input type="number" value={empForm.salary} onChange={e => setEmpForm({...empForm, salary: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
            </div>
            <button
              onClick={() => {
                if (empForm.name && empForm.role) {
                  if (editingEmp) {
                    setEmployees(prev => prev.map(e => e.id === editingEmp.id ? { ...e, ...empForm, salary: parseInt(empForm.salary) || 0 } : e));
                    showToast('Employé mis à jour.');
                  } else {
                    setEmployees(prev => [...prev, { id: `emp-${Date.now()}`, ...empForm, salary: parseInt(empForm.salary) || 0 }]);
                    showToast('Employé ajouté avec succès.');
                  }
                  setIsEmpModalOpen(false);
                }
              }}
              className="w-full py-3 bg-[#2563EB] text-white font-black text-xs rounded-xl cursor-pointer"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* 2. DEPARTMENT MODAL */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-white">Créer un Département</h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400">Nom du Département</label>
                <input type="text" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">Responsable / Head</label>
                <input type="text" value={deptForm.head} onChange={e => setDeptForm({...deptForm, head: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
            </div>
            <button
              onClick={() => {
                if (deptForm.name) {
                  setDepartments(prev => [...prev, { id: `dep-${Date.now()}`, name: deptForm.name, head: deptForm.head || 'À désigner', staffCount: 1, budget: `${parseInt(deptForm.budget).toLocaleString()} FCFA` }]);
                  setIsDeptModalOpen(false);
                  showToast('Département créé.');
                }
              }}
              className="w-full py-3 bg-[#2563EB] text-white font-black text-xs rounded-xl cursor-pointer"
            >
              Créer le Département
            </button>
          </div>
        </div>
      )}

      {/* 3. PRODUCT MODAL */}
      {isProdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-white">Ajouter un Produit Corporate</h3>
              <button onClick={() => setIsProdModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400">Nom du Produit</label>
                <input type="text" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">Prix unitaire FCFA</label>
                <input type="number" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
            </div>
            <button
              onClick={() => {
                if (prodForm.name) {
                  setCorpProducts(prev => [...prev, { id: `cp-${Date.now()}`, name: prodForm.name, category: prodForm.category, price: parseInt(prodForm.price) || 0, stock: parseInt(prodForm.stock) || 1, ref: prodForm.ref }]);
                  setIsProdModalOpen(false);
                  showToast('Produit ajouté au catalogue entreprise.');
                }
              }}
              className="w-full py-3 bg-[#2563EB] text-white font-black text-xs rounded-xl cursor-pointer"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* 4. SERVICE MODAL */}
      {isServModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-white">Nouveau Service B2B</h3>
              <button onClick={() => setIsServModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400">Titre du Service</label>
                <input type="text" value={servForm.title} onChange={e => setServForm({...servForm, title: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">Tarif / Prix</label>
                <input type="text" value={servForm.price} onChange={e => setServForm({...servForm, price: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
            </div>
            <button
              onClick={() => {
                if (servForm.title) {
                  setCorpServices(prev => [...prev, { id: `cs-${Date.now()}`, title: servForm.title, category: servForm.category, price: servForm.price, description: servForm.description || 'Service professionnel sur mesure.' }]);
                  setIsServModalOpen(false);
                  showToast('Service B2B créé.');
                }
              }}
              className="w-full py-3 bg-[#2563EB] text-white font-black text-xs rounded-xl cursor-pointer"
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* 5. INVOICE MODAL */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-white">Émettre une Facture B2B</h3>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400">Nom du Client B2B</label>
                <input type="text" placeholder="Ex: Hôtel Bafoussam Palace" value={invForm.clientName} onChange={e => setInvForm({...invForm, clientName: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">N° NIU du Client</label>
                <input type="text" placeholder="Ex: M0518123984A" value={invForm.clientNiu} onChange={e => setInvForm({...invForm, clientNiu: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">Montant HT (FCFA)</label>
                <input type="number" value={invForm.amount} onChange={e => setInvForm({...invForm, amount: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
            </div>
            <button
              onClick={() => {
                if (invForm.clientName) {
                  const ht = parseInt(invForm.amount) || 1000000;
                  const tva = Math.round(ht * 0.1925);
                  const ttc = ht + tva;
                  setInvoices(prev => [{
                    id: `FAC-2026-00${Math.floor(Math.random()*80 + 10)}`,
                    clientName: invForm.clientName,
                    clientNiu: invForm.clientNiu || 'M0192837482X',
                    amountHT: ht,
                    tax: tva,
                    amountTTC: ttc,
                    date: 'Aujourd\'hui',
                    dueDate: invForm.dueDate,
                    status: 'En attente'
                  }, ...prev]);
                  setIsInvoiceModalOpen(false);
                  showToast('Facture B2B émise avec succès.');
                }
              }}
              className="w-full py-3 bg-[#2563EB] text-white font-black text-xs rounded-xl cursor-pointer"
            >
              Émettre la Facture
            </button>
          </div>
        </div>
      )}

      {/* 6. OFFER MODAL */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-white">Publier une Offre / Appel d'offres</h3>
              <button onClick={() => setIsOfferModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400">Titre de l'Offre</label>
                <input type="text" value={offerForm.title} onChange={e => setOfferForm({...offerForm, title: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">Budget / Rémunération</label>
                <input type="text" value={offerForm.budget} onChange={e => setOfferForm({...offerForm, budget: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
            </div>
            <button
              onClick={() => {
                if (offerForm.title) {
                  setOffers(prev => [{ id: `OFF-${Date.now().toString().slice(-3)}`, title: offerForm.title, type: offerForm.type, budget: offerForm.budget, deadline: offerForm.deadline, applicants: 0, status: 'Ouvert' }, ...prev]);
                  setIsOfferModalOpen(false);
                  showToast('Offre publiée.');
                }
              }}
              className="w-full py-3 bg-[#2563EB] text-white font-black text-xs rounded-xl cursor-pointer"
            >
              Publier
            </button>
          </div>
        </div>
      )}

      {/* 7. CAMPAIGN MODAL */}
      {isCampModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-white">Créer une Campagne Marketing</h3>
              <button onClick={() => setIsCampModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400">Nom de la Campagne</label>
                <input type="text" value={campForm.name} onChange={e => setCampForm({...campForm, name: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">Budget FCFA</label>
                <input type="number" value={campForm.budget} onChange={e => setCampForm({...campForm, budget: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
            </div>
            <button
              onClick={() => {
                if (campForm.name) {
                  setCampaigns(prev => [{ id: `CAMP-${Date.now().toString().slice(-2)}`, name: campForm.name, channel: campForm.channel, budget: `${parseInt(campForm.budget).toLocaleString()} FCFA`, status: 'Active', leads: 0, roi: 'En attente' }, ...prev]);
                  setIsCampModalOpen(false);
                  showToast('Campagne marketing lancée.');
                }
              }}
              className="w-full py-3 bg-[#2563EB] text-white font-black text-xs rounded-xl cursor-pointer"
            >
              Lancer la Campagne
            </button>
          </div>
        </div>
      )}

      {/* 8. PROMOTION MODAL */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-white">Lancer une Promotion B2B</h3>
              <button onClick={() => setIsPromoModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-400">Code Promo</label>
                <input type="text" value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
              <div>
                <label className="font-bold text-slate-400">Pourcentage de Remise</label>
                <input type="text" value={promoForm.discount} onChange={e => setPromoForm({...promoForm, discount: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"/>
              </div>
            </div>
            <button
              onClick={() => {
                if (promoForm.code) {
                  setPromotions(prev => [{ id: `PROM-${Date.now().toString().slice(-2)}`, code: promoForm.code, discount: promoForm.discount, target: promoForm.target, expiry: promoForm.expiry, uses: 0, status: 'Active' }, ...prev]);
                  setIsPromoModalOpen(false);
                  showToast('Promotion activée.');
                }
              }}
              className="w-full py-3 bg-[#2563EB] text-white font-black text-xs rounded-xl cursor-pointer"
            >
              Activer la Promotion
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
