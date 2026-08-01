import { Product, Order, Merchant, User } from '../types';
import { UserRole, mapAccountTypeToRole } from './rbac';

/**
 * Filter products according to logged-in user's role and identity
 */
export function filterProductsByRole(
  products: Product[],
  currentUser: User | null
): Product[] {
  if (!currentUser) {
    // Unauthenticated user sees only public catalog non-draft products
    return products.filter(p => !p.isDraft);
  }

  const role = mapAccountTypeToRole(currentUser.accountType);

  switch (role) {
    case 'BOUTIQUE': {
      // Boutique sees ONLY products published by their merchant account
      // Or if merchantId matches user id / user phone
      return products.filter(p => p.merchantId === currentUser.id || p.merchantId === currentUser.neighborhoodId || p.merchantName?.toLowerCase().includes(currentUser.name.toLowerCase()));
    }
    case 'ENTREPRISE': {
      // Enterprise sees B2B wholesale products or their own corporate listings
      return products;
    }
    case 'PRESTATAIRE': {
      // Prestataire sees service offerings
      return products;
    }
    case 'CLIENT':
    default:
      // Client sees active public products
      return products.filter(p => !p.isDraft);
  }
}

/**
 * Filter orders according to logged-in user's role and identity
 */
export function filterOrdersByRole(
  orders: Order[],
  currentUser: User | null
): Order[] {
  if (!currentUser) return [];

  const role = mapAccountTypeToRole(currentUser.accountType);

  switch (role) {
    case 'CLIENT': {
      // Client sees ONLY orders placed by themselves
      return orders.filter(o => o.userId === currentUser.id || o.paymentPhone === currentUser.phone);
    }
    case 'BOUTIQUE': {
      // Boutique sees ONLY orders that contain products from their shop
      return orders.filter(o => 
        o.items.some(item => item.product.merchantId === currentUser.id || item.product.merchantName?.toLowerCase().includes(currentUser.name.toLowerCase()))
      );
    }
    case 'ENTREPRISE': {
      // Enterprise sees corporate purchases/procurement orders
      return orders.filter(o => o.userId === currentUser.id);
    }
    case 'PRESTATAIRE': {
      // Prestataire sees bookings assigned to their provider account
      return orders.filter(o => (o as any).prestataireId === currentUser.id || o.userId === currentUser.id);
    }
    case 'ADMIN':
      return orders;
    default:
      return [];
  }
}

/**
 * Filter merchant profiles according to logged-in user's role and identity
 */
export function filterMerchantsByRole(
  merchants: Merchant[],
  currentUser: User | null
): Merchant[] {
  if (!currentUser) return merchants;

  const role = mapAccountTypeToRole(currentUser.accountType);

  if (role === 'BOUTIQUE') {
    // Return only the current merchant's profile or list
    return merchants.filter(m => m.id === currentUser.id || m.phone === currentUser.phone || m.email === currentUser.email);
  }

  return merchants;
}
