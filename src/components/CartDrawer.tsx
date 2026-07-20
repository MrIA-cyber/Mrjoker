import React, { useState } from 'react';
import { CartItem, Order, Neighborhood, User } from '../types';
import { BAFOUSSAM_NEIGHBORHOODS } from '../data/mockData';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, MapPin, Phone, Loader2, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClose: () => void;
  onCheckoutSuccess: (order: Order) => void;
  currentUser: User;
}

export default function CartDrawer({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClose,
  onCheckoutSuccess,
  currentUser,
}: CartDrawerProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>(BAFOUSSAM_NEIGHBORHOODS[0].id);
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [paymentOperator, setPaymentOperator] = useState<'momo' | 'orange'>('momo');
  const [paymentPhone, setPaymentPhone] = useState(currentUser.phone);
  
  const [step, setStep] = useState<'cart' | 'checkout' | 'processing' | 'ussd-prompt' | 'success'>('cart');
  const [pin, setPin] = useState('');
  const [validationError, setValidationError] = useState('');

  const currentNeighborhood = BAFOUSSAM_NEIGHBORHOODS.find(n => n.id === selectedNeighborhood) || BAFOUSSAM_NEIGHBORHOODS[0];
  const itemsTotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const grandTotal = itemsTotal + currentNeighborhood.deliveryFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryDetails.trim()) {
      setValidationError('Veuillez préciser l\'adresse de livraison.');
      return;
    }
    if (!paymentPhone.trim()) {
      setValidationError('Veuillez spécifier le numéro de téléphone pour le paiement.');
      return;
    }
    setValidationError('');
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
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        items: [...items],
        total: grandTotal,
        status: 'pending',
        deliveryNeighborhood: currentNeighborhood.name,
        deliveryDetails: deliveryDetails,
        paymentMethod: paymentOperator,
        paymentPhone: paymentPhone,
        createdAt: new Date().toISOString(),
        deliveryTimeEstimated: currentNeighborhood.estMinutes,
        currentLocation: { x: 120, y: 150 }, // Starts near Marché A (the center)
      };

      onCheckoutSuccess(newOrder);
      setStep('success');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans" id="cart-drawer-container">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-100">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h3 className="font-bold text-slate-900 text-lg">Votre Panier</h3>
            <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Cart Items */}
            {step === 'cart' && (
              <motion.div
                key="step-cart"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-between"
              >
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                    <span className="text-5xl mb-4">🛍️</span>
                    <p className="font-semibold text-slate-800 mb-1">Votre panier est vide</p>
                    <p className="text-xs max-w-[240px]">
                      Parcourez la boutique et ajoutez des spécialités de Bafoussam à votre panier.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-6 bg-slate-900 text-white font-medium text-xs py-2.5 px-5 rounded-xl cursor-pointer"
                    >
                      Découvrir les produits
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Items List */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 relative group"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 text-sm truncate leading-snug">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5">Par {item.product.merchantName}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="font-bold text-xs text-slate-950">
                                {item.product.price.toLocaleString('fr-FR')} F
                              </span>
                              
                              {/* Quantity controls */}
                              <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200/80 p-0.5">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                  className="p-1 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-xs text-slate-800 w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                  className="p-1 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Delete Item button */}
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded-lg cursor-pointer transition absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Delivery summary selector */}
                    <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100/70 p-4 mt-6">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4.5 h-4.5 text-indigo-600 mt-0.5" />
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5">Quartier de Livraison</label>
                          <select
                            className="w-full px-3 py-2 bg-white border border-indigo-200/80 rounded-xl focus:outline-none text-slate-950 text-xs font-semibold"
                            value={selectedNeighborhood}
                            onChange={(e) => setSelectedNeighborhood(e.target.value)}
                          >
                            {BAFOUSSAM_NEIGHBORHOODS.map((nh) => (
                              <option key={nh.id} value={nh.id}>
                                {nh.name} (+{nh.deliveryFee} F • {nh.estMinutes} min)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {items.length > 0 && (
                  <div className="border-t border-slate-100 pt-5 mt-6 space-y-4">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Sous-total articles</span>
                        <span className="font-semibold text-slate-800">{itemsTotal.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Frais de livraison ({currentNeighborhood.name})</span>
                        <span className="font-semibold text-slate-800">{currentNeighborhood.deliveryFee.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-100 text-slate-900">
                        <span className="font-bold">Total Général</span>
                        <span className="font-extrabold text-slate-950">{grandTotal.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep('checkout')}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                      id="btn-goto-checkout"
                    >
                      <span>Passer la Commande</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Checkout details */}
            {step === 'checkout' && (
              <motion.div
                key="step-checkout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                    <h4 className="font-bold text-slate-800 mb-2">Récapitulatif de Livraison</h4>
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Destinataire :</span>
                      <span className="font-semibold text-slate-800">{currentUser.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Quartier :</span>
                      <span className="font-semibold text-slate-800">{currentNeighborhood.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Délai estimé :</span>
                      <span className="font-semibold text-emerald-600">~{currentNeighborhood.estMinutes} minutes</span>
                    </div>
                    <div className="flex justify-between text-slate-500 pt-1.5 border-t border-slate-200 mt-1.5 font-bold text-slate-800 text-[13px]">
                      <span>Montant total :</span>
                      <span>{grandTotal.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>

                  {/* Delivery Address Details */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Adresse Précise & Indications de repère *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Ex: Entrée Famla, en face de la pharmacie, portail noir à gauche."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-950 text-xs transition"
                      value={deliveryDetails}
                      onChange={(e) => setDeliveryDetails(e.target.value)}
                    />
                  </div>

                  {/* Payment Operator Toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Opérateur de paiement mobile *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentOperator('momo')}
                        className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition cursor-pointer ${
                          paymentOperator === 'momo'
                            ? 'border-indigo-400 bg-indigo-50/20 text-indigo-900 font-extrabold'
                            : 'border-slate-100 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-[9px] text-white">MoMo</span>
                        <span>MTN MoMo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentOperator('orange')}
                        className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition cursor-pointer ${
                          paymentOperator === 'orange'
                            ? 'border-orange-400 bg-orange-50/20 text-orange-900 font-extrabold'
                            : 'border-slate-100 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center font-bold text-[9px] text-white">OM</span>
                        <span>Orange Money</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Numéro de Compte Mobile Money *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 677894512"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl text-slate-950 text-xs transition font-mono"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {validationError && (
                    <div className="text-red-600 text-xs font-medium p-3 bg-red-50 border border-red-100 rounded-xl">
                      {validationError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep('cart')}
                      className="flex-1 py-3 text-slate-500 hover:text-slate-950 text-xs font-bold transition cursor-pointer"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                      id="btn-confirm-checkout"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Payer {grandTotal.toLocaleString('fr-FR')} F</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Processing Payment */}
            {step === 'processing' && (
              <motion.div
                key="step-processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <Loader2 className="w-12 h-12 text-slate-800 animate-spin mb-4" />
                <h4 className="font-bold text-slate-900 text-base">Traitement du paiement mobile...</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Établissement d'une connexion sécurisée avec {paymentOperator === 'momo' ? 'MTN Cameroun' : 'Orange Cameroun'} pour le débit de {grandTotal.toLocaleString('fr-FR')} FCFA.
                </p>
              </motion.div>
            )}

            {/* Step 4: USSD Pop-up Input */}
            {step === 'ussd-prompt' && (
              <motion.div
                key="step-ussd"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 text-white rounded-2xl p-5 shadow-2xl relative border border-slate-800"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-bold tracking-wider text-indigo-400">
                      {paymentOperator === 'momo' ? 'MTN MOBILE MONEY' : 'ORANGE MONEY'}
                    </span>
                  </div>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">SYSTEM PUSH</span>
                </div>

                <p className="text-xs leading-relaxed mb-4 text-slate-300">
                  Veuillez confirmer l'achat de <strong className="text-white">{items.length} articles Bafoussam En Ligne</strong> d'un montant de <strong className="text-white">{grandTotal.toLocaleString('fr-FR')} FCFA</strong>.
                  <br />
                  <span className="text-slate-400 mt-2 block">
                    Saisissez votre code PIN secret de paiement à 4 chiffres :
                  </span>
                </p>

                <form onSubmit={handleConfirmPIN} className="space-y-4">
                  <input
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    placeholder="****"
                    required
                    autoFocus
                    className="w-full text-center tracking-[1.5em] font-mono text-xl bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-indigo-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  />

                  {validationError && (
                    <div className="text-red-400 text-[11px] text-center font-semibold bg-red-950/40 border border-red-900/40 py-1.5 rounded-lg">
                      {validationError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('checkout')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl cursor-pointer transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition"
                      id="btn-submit-momo-pin"
                    >
                      Payer (MTN/OM)
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 5: Order Checkout Success */}
            {step === 'success' && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">Commande Confirmée !</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  Le paiement de {grandTotal.toLocaleString('fr-FR')} FCFA a été traité. Un coursier moto-taxi de Bafoussam récupère actuellement vos articles.
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left my-5 space-y-2 text-xs max-w-xs mx-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quartier</span>
                    <span className="font-semibold text-slate-800">{currentNeighborhood.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Temps estimé</span>
                    <span className="font-semibold text-emerald-600">~{currentNeighborhood.estMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Statut de Livraison</span>
                    <span className="font-semibold text-indigo-600">En cours de préparation...</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl cursor-pointer transition text-xs shadow-sm"
                  id="btn-finish-checkout-success"
                >
                  Suivre la livraison en direct
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
