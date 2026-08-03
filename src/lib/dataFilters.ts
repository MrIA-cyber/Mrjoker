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
    return products.filter(p => !p.isDraft);
  }

  const role = mapAccountTypeToRole(currentUser.accountType);

  switch (role) {
    case 'BOUTIQUE': {
      const sellerProducts = products.filter(
        p => p.merchantId === currentUser.id ||
             p.merchantId === currentUser.neighborhoodId ||
             (p.merchantName && p.merchantName.toLowerCase().includes(currentUser.name.toLowerCase()))
      );
      return sellerProducts.length > 0 ? sellerProducts : products;
    }
    case 'ENTREPRISE':
    case 'PRESTATAIRE':
    case 'LIVREUR':
    case 'CLIENT':
    default:
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
  if (!currentUser) return orders;

  const role = mapAccountTypeToRole(currentUser.accountType);

  switch (role) {
    case 'CLIENT': {
      const userOrders = orders.filter(o => o.userId === currentUser.id || o.paymentPhone === currentUser.phone);
      return userOrders.length > 0 ? userOrders : orders;
    }
    case 'BOUTIQUE': {
      const shopOrders = orders.filter(o => 
        o.items.some(item => item.product.merchantId === currentUser.id || (item.product.merchantName && item.product.merchantName.toLowerCase().includes(currentUser.name.toLowerCase())))
      );
      return shopOrders.length > 0 ? shopOrders : orders;
    }
    case 'ENTREPRISE': {
      const corpOrders = orders.filter(o => o.userId === currentUser.id);
      return corpOrders.length > 0 ? corpOrders : orders;
    }
    case 'PRESTATAIRE': {
      const serviceOrders = orders.filter(o => (o as any).prestataireId === currentUser.id || o.userId === currentUser.id);
      return serviceOrders.length > 0 ? serviceOrders : orders;
    }
    case 'LIVREUR': {
      return orders;
    }
    case 'ADMIN':
      return orders;
    default:
      return orders;
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
    const matchedMerchants = merchants.filter(m => m.id === currentUser.id || m.phone === currentUser.phone || m.email === currentUser.email);
    return matchedMerchants.length > 0 ? matchedMerchants : merchants;
  }

  return merchants;
}
