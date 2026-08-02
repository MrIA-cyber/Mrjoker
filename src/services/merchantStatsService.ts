import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface MerchantStatsCache {
  merchantId: string;
  todaySalesTotal: number;
  monthlySalesTotal: number;
  totalRevenue: number;
  pendingOrdersCount: number;
  completedOrdersCount: number;
  totalStockCount: number;
  kpiOnlineProducts: number;
  kpiOutOfStockProducts: number;
  storefrontViews: number;
  storefrontClicks: number;
  averageRating: string;
  lastUpdated: string;
}

const STORAGE_PREFIX = 'afrinova_merchant_stats_v2_';

/**
 * Returns immediate cached stats from local storage for instant dashboard render.
 */
export function getLocalMerchantStats(merchantId: string): MerchantStatsCache | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${merchantId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.merchantId === merchantId) {
        return {
          merchantId: String(parsed.merchantId),
          todaySalesTotal: Number(parsed.todaySalesTotal) || 0,
          monthlySalesTotal: Number(parsed.monthlySalesTotal) || 0,
          totalRevenue: Number(parsed.totalRevenue) || 0,
          pendingOrdersCount: Number(parsed.pendingOrdersCount) || 0,
          completedOrdersCount: Number(parsed.completedOrdersCount) || 0,
          totalStockCount: Number(parsed.totalStockCount) || 0,
          kpiOnlineProducts: Number(parsed.kpiOnlineProducts) || 0,
          kpiOutOfStockProducts: Number(parsed.kpiOutOfStockProducts) || 0,
          storefrontViews: Number(parsed.storefrontViews) || 0,
          storefrontClicks: Number(parsed.storefrontClicks) || 0,
          averageRating: String(parsed.averageRating || '4.8'),
          lastUpdated: String(parsed.lastUpdated || new Date().toISOString())
        };
      }
    }
  } catch (e) {
    console.warn('Failed to read local merchant stats cache:', e);
  }
  return null;
}

/**
 * Saves stats locally to localStorage for immediate availability on next load.
 */
export function saveLocalMerchantStats(stats: MerchantStatsCache): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${stats.merchantId}`, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to write local merchant stats cache:', e);
  }
}

/**
 * Syncs stats to Firestore document in `merchant_stats` collection.
 */
export async function syncMerchantStatsToFirestore(stats: MerchantStatsCache): Promise<void> {
  if (!stats.merchantId) return;

  // First update local cache for instant load
  saveLocalMerchantStats(stats);

  try {
    const docRef = doc(db, 'merchant_stats', stats.merchantId);
    await setDoc(docRef, {
      ...stats,
      updatedAtFirestore: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore merchant_stats sync error (offline fallback active):', err);
  }
}

/**
 * Real-time subscription to merchant_stats doc in Firestore with local cache callback.
 */
export function subscribeMerchantStats(
  merchantId: string,
  onStatsReceived: (stats: MerchantStatsCache) => void
): () => void {
  if (!merchantId) return () => {};

  // 1. Immediately deliver local cache if present
  const localCache = getLocalMerchantStats(merchantId);
  if (localCache) {
    onStatsReceived(localCache);
  }

  // 2. Listen to real-time updates from Firestore
  try {
    const docRef = doc(db, 'merchant_stats', merchantId);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as MerchantStatsCache;
          saveLocalMerchantStats(data);
          onStatsReceived(data);
        }
      },
      (err) => {
        console.warn('Subscription error on merchant_stats:', err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to setup Firestore listener for merchant_stats:', err);
    return () => {};
  }
}
