import React, { useState } from 'react';
import { User, Neighborhood } from '../types';
import { BAFOUSSAM_NEIGHBORHOODS } from '../data/mockData';
import { Check, ShieldCheck, HelpCircle, Phone, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeGateProps {
  onSuccess: (user: User) => void;
}

const refLat = 5.475;
const refLon = 10.475;
const rayonMaxKm = 80;

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function WelcomeGate({ onSuccess }: WelcomeGateProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    neighborhood: BAFOUSSAM_NEIGHBORHOODS[0].id,
  });

  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [gpsDetails, setGpsDetails] = useState<{ latitude?: number; longitude?: number; distance?: number } | null>(null);
  const [showBypassOption, setShowBypassOption] = useState(false);

  const [paymentOperator, setPaymentOperator] = useState<'momo' | 'orange' | null>(null);
  const [phoneForPayment, setPhoneForPayment] = useState('');
  const [step, setStep] = useState<'form' | 'login' | 'searching-subscription' | 'otp-verification' | 'payment-select' | 'processing' | 'ussd-prompt' | 'success'>('form');
  const [pin, setPin] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [isOtpResending, setIsOtpResending] = useState(false);

  // Seed registered users list if empty
  React.useEffect(() => {
    try {
      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      if (!savedUsersRaw) {
        const today = new Date();
        const expiry = new Date();
        expiry.setMonth(today.getMonth() + 3);
        
        const seedUsers: User[] = [
          {
            id: 'u-seed-1',
            name: 'Jean Kamdem',
            email: 'jean.kamdem@mail.com',
            phone: '677894512',
            isSubscribed: true,
            subscriptionDate: today.toISOString().split('T')[0],
            subscriptionExpiryDate: expiry.toISOString().split('T')[0],
            hasPaidFee: true,
            neighborhoodId: 'marche-a',
          },
          {
            id: 'u-seed-2',
            name: 'Alice Kamga',
            email: 'alice.kamga@yahoo.fr',
            phone: '640406412',
            isSubscribed: true,
            subscriptionDate: today.toISOString().split('T')[0],
            subscriptionExpiryDate: expiry.toISOString().split('T')[0],
            hasPaidFee: true,
            neighborhoodId: 'marche-a',
          }
        ];
        localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(seedUsers));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setValidationError('Veuillez entrer votre numéro de téléphone.');
      return;
    }
    setValidationError('');
    setStep('searching-subscription');

    const cleanInputPhone = loginPhone.replace(/\s+/g, '');

    setTimeout(() => {
      try {
        const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
        const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
        
        // Find matching user
        const matchedUser = savedUsers.find(
          u => u.phone.replace(/\s+/g, '') === cleanInputPhone || 
               u.phone.replace(/\s+/g, '').endsWith(cleanInputPhone) ||
               cleanInputPhone.endsWith(u.phone.replace(/\s+/g, ''))
        );

        if (matchedUser) {
          // Found! Set active user
          onSuccess(matchedUser);
        } else {
          // If not found in localStorage, simulate finding their active subscription on the central server!
          const today = new Date();
          const expiry = new Date();
          expiry.setMonth(today.getMonth() + 3);

          const autoCreatedUser: User = {
            id: `u-${Date.now()}`,
            name: `Abonné #${cleanInputPhone.slice(-4)}`,
            email: `abonne.${cleanInputPhone.slice(-4)}@bafoussam.direct`,
            phone: loginPhone,
            isSubscribed: true,
            subscriptionDate: today.toISOString().split('T')[0],
            subscriptionExpiryDate: expiry.toISOString().split('T')[0],
            hasPaidFee: true,
            neighborhoodId: 'marche-a',
          };

          // Save to local registered list
          savedUsers.push(autoCreatedUser);
          localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(savedUsers));

          onSuccess(autoCreatedUser);
        }
      } catch (err) {
        console.error(err);
        setStep('login');
        setValidationError('Erreur lors de la récupération de la session.');
      }
    }, 1500);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      setValidationError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Check if phone number is already registered
    const cleanFormPhone = formData.phone.replace(/\s+/g, '');
    try {
      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      const phoneExists = savedUsers.some(
        u => u.phone.replace(/\s+/g, '') === cleanFormPhone || 
             u.phone.replace(/\s+/g, '').endsWith(cleanFormPhone) ||
             cleanFormPhone.endsWith(u.phone.replace(/\s+/g, ''))
      );
      if (phoneExists) {
        setValidationError('Ce numéro de téléphone est déjà abonné. Veuillez utiliser un autre numéro ou vous connecter.');
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setValidationError('');
    setShowBypassOption(false);
    setGpsDetails(null);
    setIsVerifyingLocation(true);

    const proceedWithOtp = () => {
      setIsVerifyingLocation(false);
      // Generate simulated 4-digit verification code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setInputOtp('');
      setStep('otp-verification');
    };

    // Real GPS Geolocation Check
    if (!navigator.geolocation) {
      setIsVerifyingLocation(false);
      setValidationError("La géolocalisation n'est pas supportée par votre navigateur. Vous pouvez confirmer manuellement pour continuer.");
      setShowBypassOption(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Coordonnées géographiques détectées : Lat ${latitude}, Lng ${longitude}`);
        
        const dist = distanceKm(latitude, longitude, refLat, refLon);
        setGpsDetails({ latitude, longitude, distance: dist });

        if (dist <= rayonMaxKm) {
          proceedWithOtp();
        } else {
          setIsVerifyingLocation(false);
          setValidationError(`Vous semblez être en dehors de la Région de l'Ouest (à ${dist.toFixed(1)} km du centre de la zone couverte). Ce service est actuellement réservé à cette région.`);
          setShowBypassOption(true);
        }
      },
      (error) => {
        setIsVerifyingLocation(false);
        let errMsg = 'Erreur de géolocalisation.';
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = "Accès GPS refusé par le navigateur. Veuillez autoriser l'accès à votre position pour continuer ou utiliser l'option manuelle ci-dessous.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errMsg = "Position GPS indisponible. Veuillez activer votre localisation ou utiliser l'option manuelle ci-dessous.";
        } else if (error.code === error.TIMEOUT) {
          errMsg = "Le délai de détection GPS a expiré. Veuillez réessayer ou utiliser l'option manuelle ci-dessous.";
        }
        setValidationError(`Vérification de position échouée : ${errMsg}`);
        setShowBypassOption(true);
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOtp !== generatedOtp) {
      setValidationError('Le code de vérification SMS est incorrect. Veuillez réessayer ou renvoyer un code.');
      return;
    }
    setValidationError('');
    setPhoneForPayment(formData.phone);
    setStep('payment-select');
  };

  const handleResendOtp = () => {
    setIsOtpResending(true);
    setValidationError('');
    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setInputOtp('');
      setIsOtpResending(false);
    }, 1000);
  };

  const handleSelectOperator = (op: 'momo' | 'orange') => {
    setPaymentOperator(op);
    setStep('processing');
    
    // Simulate sending payment request
    setTimeout(() => {
      setStep('ussd-prompt');
    }, 1500);
  };

  const handleConfirmPIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setValidationError('Le code PIN doit comporter 4 chiffres.');
      return;
    }
    setValidationError('');
    setStep('processing');

    // Simulate final validation
    setTimeout(() => {
      const ref = `TX-${paymentOperator === 'momo' ? 'MOMO' : 'OM'}-${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionRef(ref);
      setStep('success');
    }, 2000);
  };

  const handleFinish = () => {
    const today = new Date();
    const expiry = new Date();
    expiry.setMonth(today.getMonth() + 3); // 3 months validity

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      isSubscribed: true,
      subscriptionDate: today.toISOString().split('T')[0],
      subscriptionExpiryDate: expiry.toISOString().split('T')[0],
      hasPaidFee: true,
      neighborhoodId: formData.neighborhood,
    };

    // Save newly registered user to lists
    try {
      const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
      const savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      const filtered = savedUsers.filter(u => u.phone.replace(/\s+/g, '') !== formData.phone.replace(/\s+/g, ''));
      filtered.push(newUser);
      localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(filtered));
    } catch (err) {
      console.error(err);
    }

    onSuccess(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-indigo-100 selection:text-indigo-900" id="welcome-gate-container">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60"></div>
      
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative z-10">
        
        {/* Banner with sleek indigo gradient */}
        <div className="h-3 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700"></div>

        <div className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center text-center mb-8" id="logo-header">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm mb-4">
              <span className="text-3xl">🏔️</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">Bafoussam<span className="text-indigo-600">Direct</span></h1>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              La plateforme d'achat et vente locale de la capitale de l'Ouest Cameroun.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div
                key="form-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 mb-6 text-slate-800 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-indigo-100 rounded-lg text-indigo-800 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-indigo-900 mb-1">Inscription obligatoire requise</p>
                      <p className="text-slate-600 leading-relaxed">
                        Pour visiter et utiliser tous les services de la plateforme (achat, livraison rapide à domicile, support), une participation de <strong className="text-indigo-900">4 000 FCFA</strong> (versée directement sur le numéro Orange Money <strong className="text-indigo-900">640406412</strong>) est requise pour une durée d'accès complète de <strong className="text-indigo-900">trois (3) mois</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleNextStep} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Nom Complet</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean Kamdem"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-950 text-sm transition"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Adresse E-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="jean.kamdem@mail.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-950 text-sm transition"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Numéro de Téléphone</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 677894512"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-950 text-sm transition"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Votre Quartier à Bafoussam</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-950 text-sm transition"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    >
                      {BAFOUSSAM_NEIGHBORHOODS.map((nh) => (
                        <option key={nh.id} value={nh.id}>
                          {nh.name} (Livraison sous {nh.estMinutes} min)
                        </option>
                      ))}
                    </select>
                  </div>

                  {validationError && (
                    <div className="text-red-600 text-xs font-medium p-3 bg-red-50 border border-red-100 rounded-xl space-y-1">
                      <p>{validationError}</p>
                      {gpsDetails?.distance !== undefined && (
                        <p className="text-[10px] text-red-500 font-normal">
                          Détails : Distance calculée de {gpsDetails.distance.toFixed(1)} km (Limitation de rayon de couverture de {rayonMaxKm} km). Position détectée : Lat {gpsDetails.latitude?.toFixed(4)}, Lng {gpsDetails.longitude?.toFixed(4)}.
                        </p>
                      )}
                    </div>
                  )}

                  {showBypassOption && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 mt-2">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 text-lg">💡</span>
                        <div>
                          <p className="text-amber-900 font-bold text-xs">Confirmation de position manuelle</p>
                          <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                            Si vous êtes à proximité de la Région de l'Ouest du Cameroun, ou si l'accès GPS rencontre des imprécisions (ex. refus d'autorisation, mauvaise réception), certifiez manuellement votre quartier pour continuer.
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setValidationError('');
                          setShowBypassOption(false);
                          
                          // Proceed with registration bypass
                          const code = Math.floor(1000 + Math.random() * 9000).toString();
                          setGeneratedOtp(code);
                          setInputOtp('');
                          setStep('otp-verification');
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirmer manuellement mon quartier et continuer</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingLocation}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm mt-6"
                    id="btn-submit-registration"
                  >
                    {isVerifyingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Vérification de la position (Serveur)...</span>
                      </>
                    ) : (
                      <>
                        <span>Procéder au paiement de 4 000 FCFA</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <p className="text-xs text-slate-500">
                    Déjà inscrit ?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError('');
                        setStep('login');
                      }}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      Connectez-vous à votre compte ici
                    </button>
                  </p>
                </div>

                <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Sécurisé de bout en bout</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-slate-300" />
                    <span>Support Bafoussam: 640 40 64 12</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'otp-verification' && (
              <motion.div
                key="otp-verification-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                {/* Simulated SMS Toast notification alert */}
                <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 mb-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 animate-pulse"></div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl animate-bounce">📱</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Nouveau SMS de "Bafoussam Direct"</span>
                        <span className="text-[9px] text-slate-400">À l'instant</span>
                      </div>
                      <p className="text-xs text-slate-100 font-mono mt-1 font-semibold">
                        "Votre code de validation de numéro est : <span className="text-yellow-400 text-sm font-black underline decoration-2">{generatedOtp}</span>. Ne le partagez avec personne."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="font-extrabold text-slate-900 text-base">Vérification de sécurité</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Nous avons envoyé un code de vérification au <span className="font-mono text-indigo-600 font-extrabold">{formData.phone}</span> pour nous assurer de la validité de votre numéro de téléphone.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
                      Saisissez le code à 4 chiffres reçu par SMS
                    </label>
                    <div className="max-w-[200px] mx-auto">
                      <input
                        type="text"
                        maxLength={4}
                        required
                        autoFocus
                        placeholder="0000"
                        className="w-full text-center tracking-[1em] font-mono text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-950 transition"
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>

                  {validationError && (
                    <div className="text-red-600 text-xs font-medium p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                      {validationError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError('');
                        setStep('form');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs cursor-pointer transition text-center"
                    >
                      Retour
                    </button>
                    
                    <button
                      type="button"
                      disabled={isOtpResending}
                      onClick={handleResendOtp}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold py-3 px-4 rounded-xl text-xs cursor-pointer transition text-center border border-slate-200 disabled:opacity-50"
                    >
                      {isOtpResending ? 'Génération...' : 'Renvoyer le code'}
                    </button>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-sm flex-1"
                    >
                      <span>Valider le numéro</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Numéro vérifié</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-slate-300" />
                    <span>Besoin d'aide ? 640 40 64 12</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'login' && (
              <motion.div
                key="login-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 mb-6 text-slate-800 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-indigo-100 rounded-lg text-indigo-800 mt-0.5 animate-pulse">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-indigo-900 mb-1">Espace Connexion Abonné</p>
                      <p className="text-slate-600 leading-relaxed">
                        Entrez le numéro de téléphone utilisé lors de votre inscription pour retrouver instantanément votre accès de 3 mois de manière sécurisée et éviter de repayer.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Votre Numéro de Téléphone Enregistré
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 677894512 ou 640406412"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-950 text-sm transition font-mono"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1.5 block">
                      Numéros de démo pré-enregistrés : <strong className="text-slate-600 font-semibold">677894512</strong> ou <strong className="text-slate-600 font-semibold">640406412</strong>. Vous pouvez aussi saisir n'importe quel autre numéro pour simuler une récupération automatique.
                    </span>
                  </div>

                  {validationError && (
                    <div className="text-red-600 text-xs font-medium p-3 bg-red-50 border border-red-100 rounded-xl">
                      {validationError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError('');
                        setStep('form');
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs cursor-pointer transition text-center"
                    >
                      Retour à l'inscription
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                      id="btn-submit-login"
                    >
                      <span>Se connecter</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Connexion Cryptée</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-slate-300" />
                    <span>Assistance : 640 40 64 12</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'searching-subscription' && (
              <motion.div
                key="searching-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h3 className="font-bold text-slate-900 text-lg">Recherche d'abonnement actif...</h3>
                <p className="text-sm text-slate-500 text-center max-w-sm mt-1">
                  Vérification en cours auprès de la base centrale Bafoussam Direct pour le numéro de téléphone <span className="font-mono text-indigo-600 font-bold">{loginPhone}</span>...
                </p>
              </motion.div>
            )}

            {step === 'payment-select' && (
              <motion.div
                key="payment-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">Choisir votre mode de paiement mobile</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Le montant de 4 000 FCFA sera versé directement sur le numéro Orange Money <strong className="text-indigo-600 font-bold">640406412</strong> pour activer l'accès de 3 mois.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* MTN MoMo */}
                  <button
                    onClick={() => handleSelectOperator('momo')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 rounded-2xl cursor-pointer transition group"
                  >
                    <div className="w-14 h-14 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-extrabold text-lg mb-3 shadow-sm group-hover:scale-105 transition">
                      MTN
                    </div>
                    <span className="font-bold text-slate-900 text-sm">MTN Mobile Money</span>
                    <span className="text-xs text-slate-400 mt-1">Opérateur réseau MTN</span>
                  </button>

                  {/* Orange Money */}
                  <button
                    onClick={() => handleSelectOperator('orange')}
                    className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 rounded-2xl cursor-pointer transition group"
                  >
                    <div className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center font-extrabold text-lg mb-3 shadow-sm group-hover:scale-105 transition">
                      OM
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Orange Money</span>
                    <span className="text-xs text-slate-400 mt-1">Opérateur réseau Orange</span>
                  </button>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setStep('form')}
                    className="text-sm text-slate-500 hover:text-slate-950 underline cursor-pointer"
                  >
                    Retour aux informations d'inscription
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h3 className="font-bold text-slate-900 text-lg">Traitement sécurisé...</h3>
                <p className="text-sm text-slate-500 text-center max-w-sm mt-1">
                  Connexion avec la passerelle Mobile Money locale de Bafoussam. Veuillez patienter une seconde.
                </p>
              </motion.div>
            )}

            {step === 'ussd-prompt' && (
              <motion.div
                key="ussd-step"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl relative border border-slate-800"
              >
                {/* Simulated USSD Prompt Title */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                      {paymentOperator === 'momo' ? 'MTN MOBILE MONEY' : 'ORANGE MONEY CAMEROUN'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">USSD PUSH SIMULATOR</span>
                </div>

                <p className="text-sm leading-relaxed mb-5 text-slate-100">
                  Une notification de validation de débit a été envoyée au <span className="font-mono text-indigo-300 font-bold">{phoneForPayment}</span>.
                  <br />
                  <span className="text-xs text-slate-400 mt-2 block">
                    Saisissez votre code PIN secret à 4 chiffres ci-dessous pour approuver le transfert de <strong className="text-white">4 000 FCFA</strong> directement vers le numéro Orange <strong className="text-white">640406412</strong> du promoteur de la plateforme :
                  </span>
                </p>

                <form onSubmit={handleConfirmPIN} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      maxLength={4}
                      pattern="\d{4}"
                      placeholder="****"
                      required
                      autoFocus
                      className="w-full text-center tracking-[1.5em] font-mono text-2xl bg-slate-950 border border-slate-800 rounded-xl py-3 text-indigo-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  {validationError && (
                    <div className="text-red-400 text-xs text-center font-medium bg-red-950/40 border border-red-900/50 py-2 rounded-lg">
                      {validationError}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep('payment-select')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-3 rounded-xl cursor-pointer transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3 rounded-xl cursor-pointer transition shadow-lg shadow-indigo-600/10"
                    >
                      Confirmer (4 000 F)
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <h3 className="text-xl font-bold text-slate-900">Bienvenue sur Bafoussam En Ligne !</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                  Votre paiement de 4 000 FCFA versé directement sur le numéro Orange <strong className="text-indigo-600 font-bold">640406412</strong> a été approuvé avec succès. Votre accès complet est désormais activé.
                </p>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left my-6 space-y-2.5 text-xs max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Abonné</span>
                    <span className="font-semibold text-slate-800">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Durée d'accès</span>
                    <span className="font-semibold text-emerald-600">3 Mois (Inclus)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date d'expiration</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-2 text-slate-500">
                    <span>Référence</span>
                    <span className="font-mono">{transactionRef}</span>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 px-4 rounded-xl cursor-pointer transition shadow-sm"
                >
                  Entrer dans la boutique de Bafoussam
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
