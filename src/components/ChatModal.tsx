import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, X, MessageSquare, Store, User, Sparkles, CheckCheck, Loader2, RefreshCw, ShoppingBag
} from 'lucide-react';
import { 
  ChatMessage, 
  sendChatMessage, 
  subscribeToChatMessages, 
  markChatAsRead 
} from '../services/chatService';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'client' | 'vendeur';
  recipientName: string;
  productName?: string;
  merchantLocation?: string;
}

export default function ChatModal({
  isOpen,
  onClose,
  chatId,
  currentUserId,
  currentUserName,
  currentUserRole,
  recipientName,
  productName,
  merchantLocation
}: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick message chips
  const quickChips = currentUserRole === 'client' ? [
    "Bonjour, cet article est-il disponible ?",
    "Pouvez-vous livrer au marché A ou à domicile ?",
    "Quel est votre meilleur prix pour 2 articles ?"
  ] : [
    "Bonjour ! Oui, l'article est disponible en stock.",
    "Nous pouvons livrer en 30 minutes à Bafoussam.",
    "Merci pour votre confiance, nous préparons votre commande."
  ];

  useEffect(() => {
    if (!isOpen || !chatId) return;

    setIsLoading(true);
    // Mark as read
    markChatAsRead(chatId, currentUserRole);

    // Subscribe to real-time messages
    const unsubscribe = subscribeToChatMessages(chatId, (newMsgs) => {
      setMessages(newMsgs);
      setIsLoading(false);
      markChatAsRead(chatId, currentUserRole);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, chatId, currentUserRole]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending || !chatId) return;

    setIsSending(true);
    if (!textToSend) setInputText('');

    try {
      await sendChatMessage({
        chatId,
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: currentUserRole,
        text
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[620px] max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-black shrink-0">
                {currentUserRole === 'client' ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold truncate text-white">
                    {recipientName || 'Interlocuteur Bafoussam'}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    En direct Firestore
                  </span>
                </div>

                {productName ? (
                  <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-0.5 truncate">
                    <ShoppingBag className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{productName}</span>
                  </div>
                ) : merchantLocation ? (
                  <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                    📍 {merchantLocation}
                  </p>
                ) : null}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 scrollbar-thin scrollbar-thumb-slate-300">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <p className="text-xs font-semibold">Connexion à la messagerie temps réel...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  Démarrez la conversation
                </h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Posez directement vos questions sur les articles, la livraison ou les prix avec négociation en direct.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                      {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div
                      className={`max-w-[82%] p-3.5 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div className="p-2 px-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200/80 text-[11px] font-semibold text-slate-600 rounded-full transition cursor-pointer shrink-0"
              >
                ⚡ {chip}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Écrivez un message instantané..."
                className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-md disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Envoyer</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
