import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  increment, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'vendeur';
  text: string;
  createdAt: string;
  read?: boolean;
}

export interface ChatThread {
  id: string;
  clientId: string;
  clientName: string;
  merchantId: string;
  merchantName: string;
  productId?: string;
  productName?: string;
  lastMessage: string;
  lastMessageTime: string;
  lastSenderId: string;
  unreadCountClient: number;
  unreadCountMerchant: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Creates or retrieves an existing chat thread between a client and a merchant.
 */
export async function createOrGetChat(params: {
  clientId: string;
  clientName: string;
  merchantId: string;
  merchantName: string;
  productId?: string;
  productName?: string;
}): Promise<string> {
  const { clientId, clientName, merchantId, merchantName, productId, productName } = params;
  
  // Custom deterministic ID to avoid duplicate threads for same client & merchant (and product if specified)
  const chatId = productId 
    ? `chat_${clientId}_${merchantId}_${productId}`.replace(/[^a-zA-Z0-9_]/g, '_')
    : `chat_${clientId}_${merchantId}`.replace(/[^a-zA-Z0-9_]/g, '_');

  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);

    if (!snap.exists()) {
      const now = new Date().toISOString();
      const newThread: ChatThread = {
        id: chatId,
        clientId,
        clientName: clientName || 'Client AfriNova',
        merchantId,
        merchantName: merchantName || 'Vendeur Bafoussam',
        productId: productId || '',
        productName: productName || '',
        lastMessage: 'Discussion démarrée',
        lastMessageTime: now,
        lastSenderId: clientId,
        unreadCountClient: 0,
        unreadCountMerchant: 0,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(chatRef, newThread);
    }

    return chatId;
  } catch (error) {
    console.warn('Firestore createOrGetChat fallback:', error);
    return chatId;
  }
}

/**
 * Sends a new message in a chat thread and updates thread metadata in real time.
 */
export async function sendChatMessage(params: {
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'vendeur';
  text: string;
}): Promise<void> {
  const { chatId, senderId, senderName, senderRole, text } = params;
  const now = new Date().toISOString();

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      chatId,
      senderId,
      senderName,
      senderRole,
      text: text.trim(),
      createdAt: now,
      read: false
    });

    const chatRef = doc(db, 'chats', chatId);
    const isSenderClient = senderRole === 'client';

    await updateDoc(chatRef, {
      lastMessage: text.trim(),
      lastMessageTime: now,
      lastSenderId: senderId,
      updatedAt: now,
      ...(isSenderClient
        ? { unreadCountMerchant: increment(1) }
        : { unreadCountClient: increment(1) })
    });
  } catch (error) {
    console.error('Error sending chat message to Firestore:', error);
    throw error;
  }
}

/**
 * Subscribes in real time to all chat threads where user is either client or merchant.
 */
export function subscribeToUserChats(
  userId: string,
  userRole: 'client' | 'vendeur',
  onUpdate: (threads: ChatThread[]) => void
): () => void {
  try {
    const chatsRef = collection(db, 'chats');
    const fieldToQuery = userRole === 'vendeur' ? 'merchantId' : 'clientId';
    const q = query(chatsRef, where(fieldToQuery, '==', userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const threads: ChatThread[] = [];
        snapshot.forEach((docSnap) => {
          threads.push({ id: docSnap.id, ...docSnap.data() } as ChatThread);
        });

        // Sort by updatedAt descending
        threads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        onUpdate(threads);
      },
      (error) => {
        console.warn('Realtime chats listener error:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to user chats:', err);
    return () => {};
  }
}

/**
 * Subscribes in real time to messages of a specific chat thread.
 */
export function subscribeToChatMessages(
  chatId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
        });
        onUpdate(msgs);
      },
      (error) => {
        console.warn('Realtime messages listener error:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to messages:', err);
    return () => {};
  }
}

/**
 * Resets unread counter for the given user role when opening the chat.
 */
export async function markChatAsRead(chatId: string, role: 'client' | 'vendeur'): Promise<void> {
  try {
    const chatRef = doc(db, 'chats', chatId);
    if (role === 'vendeur') {
      await updateDoc(chatRef, { unreadCountMerchant: 0 });
    } else {
      await updateDoc(chatRef, { unreadCountClient: 0 });
    }
  } catch (err) {
    console.warn('Failed to mark chat as read:', err);
  }
}
