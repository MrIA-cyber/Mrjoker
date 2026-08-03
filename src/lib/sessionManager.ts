import { User, AccountType } from '../types';
import { mapAccountTypeToRole, UserRole } from './rbac';

export interface WorkspaceState {
  lastView: 'shop' | 'merchant' | 'orders' | 'news' | 'admin' | 'dashboard';
  searchTerm: string;
  selectedCategory: string;
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'rating';
  cart: any[];
  productDraft: any | null;
  selectedNeighborhood: string;
}

// 7 days max inactivity before session expires
const MAX_SESSION_INACTIVITY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Checks if a session is active and valid.
 */
export function checkSessionStatus(): {
  isConnected: boolean;
  isValid: boolean;
  isExpired: boolean;
  savedUser: User | null;
} {
  try {
    const savedUserStr = localStorage.getItem('bafoussam_user');
    const sessionActiveStr = localStorage.getItem('bafoussam_session_active');
    const timestampStr = localStorage.getItem('bafoussam_session_timestamp');

    if (!savedUserStr) {
      return { isConnected: false, isValid: false, isExpired: false, savedUser: null };
    }

    const savedUser: User = JSON.parse(savedUserStr);
    const sessionActive = sessionActiveStr === 'true';

    if (timestampStr) {
      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      if (now - timestamp > MAX_SESSION_INACTIVITY_MS) {
        return {
          isConnected: false,
          isValid: false,
          isExpired: true,
          savedUser,
        };
      }
    }

    return {
      isConnected: sessionActive,
      isValid: true,
      isExpired: false,
      savedUser,
    };
  } catch (err) {
    console.error('Failed checking session status:', err);
    return { isConnected: false, isValid: false, isExpired: false, savedUser: null };
  }
}

/**
 * Saves current workspace state (page view, search filters, cart, drafts)
 */
export function saveWorkspaceState(state: Partial<WorkspaceState>) {
  try {
    if (state.lastView) {
      localStorage.setItem('bafoussam_last_view', state.lastView);
    }
    if (state.searchTerm !== undefined) {
      localStorage.setItem('bafoussam_search_term', state.searchTerm);
    }
    if (state.selectedCategory !== undefined) {
      localStorage.setItem('bafoussam_selected_category', state.selectedCategory);
    }
    if (state.sortBy !== undefined) {
      localStorage.setItem('bafoussam_sort_by', state.sortBy);
    }
    if (state.cart !== undefined) {
      localStorage.setItem('bafoussam_cart', JSON.stringify(state.cart));
    }
    if (state.productDraft !== undefined) {
      if (state.productDraft) {
        localStorage.setItem('bafoussam_product_draft', JSON.stringify(state.productDraft));
      } else {
        localStorage.removeItem('bafoussam_product_draft');
      }
    }
    if (state.selectedNeighborhood !== undefined) {
      localStorage.setItem('bafoussam_selected_neighborhood', state.selectedNeighborhood);
    }
  } catch (err) {
    console.error('Failed saving workspace state:', err);
  }
}

/**
 * Restores workspace state from localStorage.
 */
export function restoreWorkspaceState(): WorkspaceState {
  let lastView: any = 'shop';
  let searchTerm = '';
  let selectedCategory = 'Tous';
  let sortBy: any = 'popular';
  let cart: any[] = [];
  let productDraft: any = null;
  let selectedNeighborhood = 'Bafoussam, Tamdja';

  try {
    const savedView = localStorage.getItem('bafoussam_last_view');
    if (savedView) lastView = savedView;

    const savedSearch = localStorage.getItem('bafoussam_search_term');
    if (savedSearch) searchTerm = savedSearch;

    const savedCat = localStorage.getItem('bafoussam_selected_category');
    if (savedCat) selectedCategory = savedCat;

    const savedSort = localStorage.getItem('bafoussam_sort_by');
    if (savedSort) sortBy = savedSort;

    const savedCartStr = localStorage.getItem('bafoussam_cart');
    if (savedCartStr) {
      const parsed = JSON.parse(savedCartStr);
      if (Array.isArray(parsed)) cart = parsed;
    }

    const savedDraftStr = localStorage.getItem('bafoussam_product_draft');
    if (savedDraftStr) {
      productDraft = JSON.parse(savedDraftStr);
    }

    const savedNeigh = localStorage.getItem('bafoussam_selected_neighborhood');
    if (savedNeigh) selectedNeighborhood = savedNeigh;
  } catch (err) {
    console.error('Failed restoring workspace state:', err);
  }

  return {
    lastView,
    searchTerm,
    selectedCategory,
    sortBy,
    cart,
    productDraft,
    selectedNeighborhood,
  };
}

/**
 * Returns the default dashboard view for a given account type.
 */
export function getTargetDashboardForRole(accountType: AccountType): 'shop' | 'merchant' | 'orders' | 'news' | 'admin' | 'dashboard' {
  switch (accountType) {
    case 'vendeur':
      return 'merchant';
    case 'admin':
      return 'admin';
    case 'entreprise':
    case 'prestataire':
    case 'livreur':
    case 'client':
    default:
      return 'dashboard';
  }
}

/**
 * Marks session as active upon login / auto-connect and updates timestamp.
 */
export function markSessionActive(user: User) {
  try {
    localStorage.setItem('bafoussam_user', JSON.stringify(user));
    localStorage.setItem('bafoussam_session_timestamp', Date.now().toString());
    localStorage.setItem('bafoussam_session_active', 'true');
  } catch (err) {
    console.error('Failed marking session active:', err);
  }
}

/**
 * Marks session as inactive (on explicit logout or session expiry).
 */
export function markSessionInactive(clearUser: boolean = false) {
  try {
    localStorage.setItem('bafoussam_session_active', 'false');
    if (clearUser) {
      localStorage.removeItem('bafoussam_user');
      localStorage.removeItem('bafoussam_session_timestamp');
    }
  } catch (err) {
    console.error('Failed marking session inactive:', err);
  }
}
