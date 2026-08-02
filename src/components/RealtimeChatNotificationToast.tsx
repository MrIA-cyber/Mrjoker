import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, ArrowRight, BellRing } from 'lucide-react';
import { ChatThread, subscribeToUserChats } from '../services/chatService';

interface RealtimeChatNotificationToastProps {
  currentUserId: string;
  currentUserRole: 'client' | 'vendeur';
  onOpenChat: (chatId: string, recipientName: string, productName?: string) => void;
}

export default function RealtimeChatNotificationToast({
  currentUserId,
  currentUserRole,
  onOpenChat
}: RealtimeChatNotificationToastProps) {
  const [activeToast, setActiveToast] = useState<{
    chatId: string;
    senderName: string;
    messageText: string;
    productName?: string;
  } | null>(null);

  const prevUnreadCountsRef = useRef<Record<string, number>>({});
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = subscribeToUserChats(currentUserId, currentUserRole, (threads) => {
      if (initialLoadRef.current) {
        // Record initial counts
        threads.forEach((t) => {
          const count = currentUserRole === 'vendeur' ? t.unreadCountMerchant : t.unreadCountClient;
          prevUnreadCountsRef.current[t.id] = count;
        });
        initialLoadRef.current = false;
        return;
      }

      // Detect new unread messages
      threads.forEach((t) => {
        const currentCount = currentUserRole === 'vendeur' ? t.unreadCountMerchant : t.unreadCountClient;
        const prevCount = prevUnreadCountsRef.current[t.id] || 0;

        if (currentCount > prevCount && t.lastSenderId !== currentUserId) {
          const senderName = currentUserRole === 'client' ? t.merchantName : t.clientName;
          
          setActiveToast({
            chatId: t.id,
            senderName,
            messageText: t.lastMessage,
            productName: t.productName
          });

          // Auto hide toast after 8 seconds
          setTimeout(() => {
            setActiveToast((curr) => (curr?.chatId === t.id ? null : curr));
          }, 8000);
        }

        prevUnreadCountsRef.current[t.id] = currentCount;
      });
    });

    return () => unsubscribe();
  }, [currentUserId, currentUserRole]);

  if (!activeToast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-4 right-4 z-[9999] max-w-sm w-full bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md flex flex-col gap-2.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Nouveau Message
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <h4 className="text-xs font-black text-white truncate">
                {activeToast.senderName}
              </h4>
            </div>
          </div>

          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {activeToast.productName && (
          <p className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40 truncate">
            🛍️ Produit : {activeToast.productName}
          </p>
        )}

        <p className="text-xs text-slate-200 line-clamp-2 bg-slate-800/60 p-2.5 rounded-xl border border-white/5">
          "{activeToast.messageText}"
        </p>

        <button
          onClick={() => {
            const toastInfo = activeToast;
            setActiveToast(null);
            onOpenChat(toastInfo.chatId, toastInfo.senderName, toastInfo.productName);
          }}
          className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
        >
          <span>Répondre en direct</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
