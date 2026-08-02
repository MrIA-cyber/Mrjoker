import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, Phone, CreditCard, Wallet, Smartphone, ArrowRight, Check, Sparkles, Loader2, X, Download, Printer, QrCode } from 'lucide-react';
import PhoneCountryInput from '../PhoneCountryInput';

interface Screen10PaiementProps {
  onPaymentSuccess?: () => void;
}

export default function Screen10Paiement({ onPaymentSuccess }: Screen10PaiementProps) {
  const [selectedMethod, setSelectedMethod] = useState<'momo' | 'orange' | 'card' | 'paypal' | 'cod'>('momo');
  const [phone, setPhone] = useState('677123456');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // USSD Push simulation states
  const [showUssdModal, setShowUssdModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Receipt state after success
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    txId: string;
    amount: number;
    methodName: string;
    phone: string;
    date: string;
  } | null>(null);

  const subtotal = 285000;
  const deliveryFee = 1000;
  const total = subtotal + deliveryFee;

  const isPhoneValid = phone.replace(/\D/g, '').length >= 8;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if ((selectedMethod === 'momo' || selectedMethod === 'orange') && !isPhoneValid) {
      return;
    }

    if (selectedMethod === 'momo' || selectedMethod === 'orange') {
      setShowUssdModal(true);
      setPinInput('');
      setPinError('');
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        completePaymentProcess('Carte / Paypal / Cash', 'N/A');
      }, 1200);
    }
  };

  const handleConfirmUssdPin = () => {
    if (pinInput.length < 4) {
      setPinError('Veuillez entrer votre code secret à 4 ou 5 chiffres');
      return;
    }

    setIsVerifyingPin(true);
    setPinError('');

    setTimeout(() => {
      setIsVerifyingPin(false);
      setShowUssdModal(false);
      const methodName = selectedMethod === 'momo' ? 'MTN Mobile Money' : 'Orange Money';
      completePaymentProcess(methodName, phone);
    }, 1500);
  };

  const completePaymentProcess = (methodName: string, phoneNum: string) => {
    const txId = 'AFR-' + Math.floor(100000 + Math.random() * 900000);
    setPaymentSuccessData({
      txId,
      amount: total,
      methodName,
      phone: phoneNum,
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    });
  };

  const paymentMethods = [
    {
      id: 'momo',
      name: 'MTN Mobile Money',
      badge: 'Instantané *126#',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      iconBg: 'bg-amber-400 text-slate-950 font-black text-xs',
      labelIcon: 'MTN',
    },
    {
      id: 'orange',
      name: 'Orange Money',
      badge: 'Instantané #150#',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      iconBg: 'bg-orange-500 text-white font-black text-xs',
      labelIcon: 'OM',
    },
    {
      id: 'card',
      name: 'Carte Visa / Mastercard',
      badge: 'International',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      iconBg: 'bg-blue-600 text-white font-black text-xs',
      labelIcon: 'CARD',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      badge: 'Global',
      badgeColor: 'bg-[#003087]/10 text-[#003087] border-[#003087]/30',
      iconBg: 'bg-[#003087] text-white font-black text-xs',
      labelIcon: 'PP',
    },
    {
      id: 'cod',
      name: 'Paiement à la livraison',
      badge: 'Espèces / Cash',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      iconBg: 'bg-[#16A34A] text-white font-black text-xs',
      labelIcon: 'CASH',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-50 text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col justify-between min-h-[620px] relative">
      
      {/* Top Bar Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#16A34A] text-white flex items-center justify-center font-black text-xs">
            P
          </div>
          <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">PAIEMENT SÉCURISÉ — BAFOUSSAM</span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cryptage SSL 256-bit</span>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[580px]">
        
        {/* Title */}
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display tracking-tight">Méthode de paiement</h2>
          <p className="text-xs text-slate-500">Sélectionnez votre mode de règlement préféré</p>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-2">
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id as any)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-white border-[#16A34A] shadow-md ring-2 ring-[#16A34A]/20'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${method.iconBg} flex items-center justify-center shadow-xs shrink-0`}>
                    {method.labelIcon}
                  </div>

                  <div>
                    <div className="text-xs font-black text-slate-900">{method.name}</div>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${method.badgeColor}`}>
                      {method.badge}
                    </span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                  isSelected ? 'bg-[#16A34A] border-[#16A34A] text-white' : 'border-slate-300 bg-slate-50'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Money Phone Input if MoMo / Orange */}
        {(selectedMethod === 'momo' || selectedMethod === 'orange') && (
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <PhoneCountryInput
              id="payment-phone"
              label={`Numéro ${selectedMethod === 'momo' ? 'MTN Mobile Money' : 'Orange Money'}`}
              required
              value={phone}
              lang="fr"
              onChange={(fullNum) => setPhone(fullNum)}
            />
            <p className="text-[10px] text-slate-500 font-medium">
              Un message USSD va apparaître sur votre téléphone pour valider le code PIN.
            </p>
          </div>
        )}

        {/* Order Summary Box */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Sous-total commande:</span>
            <span className="font-bold text-slate-900">{subtotal.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Frais de livraison Bafoussam:</span>
            <span className="font-bold text-emerald-700">{deliveryFee.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
            <span>Total à payer:</span>
            <span className="text-[#16A34A] text-base">{total.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-3 py-1 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[10px] font-bold">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Paiement 100% Sécurisé</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Garantie Bafoussam Market</span>
          </div>
        </div>

      </div>

      {/* Pay Now Button */}
      <div className="bg-white border-t border-slate-200 p-3 z-10 space-y-1">
        <button
          onClick={handlePay}
          disabled={isProcessing || ((selectedMethod === 'momo' || selectedMethod === 'orange') && !isPhoneValid)}
          className="w-full py-3.5 px-6 bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Traitement du paiement...</span>
            </>
          ) : (
            <>
              <span>Payer maintenant ({total.toLocaleString('fr-FR')} FCFA)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        {(selectedMethod === 'momo' || selectedMethod === 'orange') && !isPhoneValid && (
          <p className="text-[11px] font-semibold text-amber-600 text-center">
            Veuillez saisir un numéro Mobile Money valide (ex: 677123456)
          </p>
        )}
      </div>

      {/* USSD Push Notification Modal Simulation */}
      {showUssdModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 text-white border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4 font-sans">
            <button
              onClick={() => setShowUssdModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${selectedMethod === 'momo' ? 'bg-amber-400 text-slate-950' : 'bg-orange-500 text-white'} flex items-center justify-center font-black text-sm shrink-0`}>
                {selectedMethod === 'momo' ? 'MTN' : 'OM'}
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Prompt USSD Push Mobile Money</h3>
                <p className="text-[11px] text-slate-400">Demande de débit instantanée</p>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700 space-y-2 text-xs">
              <p className="text-slate-200">
                Afrinova demande le règlement de <strong className="text-emerald-400 font-extrabold">{total.toLocaleString('fr-FR')} FCFA</strong> sur le numéro <span className="font-mono text-amber-300 font-bold">{phone}</span>.
              </p>
              <p className="text-[11px] text-slate-400">
                Entrez votre code secret PIN à 4 ou 5 chiffres pour confirmer l'autorisation de transfert :
              </p>
            </div>

            <div className="space-y-1.5">
              <input
                type="password"
                maxLength={5}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="****"
                className="w-full text-center text-xl tracking-[0.5em] font-mono py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
              {pinError && <p className="text-[11px] text-rose-400 font-semibold text-center">{pinError}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowUssdModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmUssdPin}
                disabled={isVerifyingPin}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5"
              >
                {isVerifyingPin ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Validation...</span>
                  </>
                ) : (
                  <span>Confirmer PIN</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Receipt Modal */}
      {paymentSuccessData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5 border border-emerald-500/30">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#16A34A] mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 font-display">Paiement Réussi !</h2>
              <p className="text-xs text-slate-500">Votre reçu numérique officiel Afrinova</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Référence Tx:</span>
                <span className="font-bold text-slate-900">{paymentSuccessData.txId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Montant réglé:</span>
                <span className="font-extrabold text-[#16A34A] text-sm">{paymentSuccessData.amount.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Moyen de paiement:</span>
                <span className="font-bold text-slate-900">{paymentSuccessData.methodName}</span>
              </div>
              {paymentSuccessData.phone !== 'N/A' && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-sans">Compte débité:</span>
                  <span className="font-bold text-slate-900">{paymentSuccessData.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Date & Heure:</span>
                <span className="font-bold text-slate-800 text-[11px]">{paymentSuccessData.date}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Commande transmise au commerçant de Bafoussam</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setPaymentSuccessData(null);
                  if (onPaymentSuccess) onPaymentSuccess();
                }}
                className="w-full py-3.5 bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Accéder au suivi de commande</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
