import { Merchant } from '../types';

// Default pool of distinct high quality Unsplash shop cover photos for fallback
const DEFAULT_SHOP_PHOTOS = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', // Maison du Café
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', // Ndop & Craft
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80', // Tech Hub
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80', // Saveurs Agricoles
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80', // Épices & Achou
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80', // Mode Boutique
  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80', // Textile Store
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80', // Épicerie fine
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80', // Électronique
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'  // Resto & Traiteur
];

const DEFAULT_SHOP_LOGOS = [
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=300&q=80'
];

/**
 * Deterministic numeric hash calculation from shop ID or name
 */
function getHashForId(id: string = ''): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a unique shop photo (cover) for a merchant.
 * Checks merchant.shopPhoto -> merchant.avatar -> deterministic fallback by merchant ID.
 */
export function getMerchantCoverPhoto(merchant?: Partial<Merchant> | null | string): string {
  if (!merchant) return DEFAULT_SHOP_PHOTOS[0];
  if (typeof merchant === 'string') {
    const hash = getHashForId(merchant);
    return DEFAULT_SHOP_PHOTOS[hash % DEFAULT_SHOP_PHOTOS.length];
  }
  
  if (merchant.shopPhoto && merchant.shopPhoto.startsWith('http')) {
    return merchant.shopPhoto;
  }
  if (merchant.avatar && merchant.avatar.startsWith('http')) {
    return merchant.avatar;
  }

  const hash = getHashForId(merchant.id || merchant.shopName || merchant.name || 'default');
  return DEFAULT_SHOP_PHOTOS[hash % DEFAULT_SHOP_PHOTOS.length];
}

/**
 * Returns a valid image URL or logo representation for a merchant avatar/logo.
 * If merchant.logo is a valid HTTP URL, returns it.
 * Otherwise returns a distinct image URL calculated by merchant ID.
 */
export function getMerchantLogoUrl(merchant?: Partial<Merchant> | null | string): string {
  if (!merchant) return DEFAULT_SHOP_LOGOS[0];
  if (typeof merchant === 'string') {
    const hash = getHashForId(merchant);
    return DEFAULT_SHOP_LOGOS[hash % DEFAULT_SHOP_LOGOS.length];
  }

  if (merchant.logo && merchant.logo.startsWith('http')) {
    return merchant.logo;
  }
  if (merchant.shopPhoto && merchant.shopPhoto.startsWith('http')) {
    return merchant.shopPhoto;
  }
  if (merchant.avatar && merchant.avatar.startsWith('http')) {
    return merchant.avatar;
  }

  const hash = getHashForId(merchant.id || merchant.shopName || merchant.name || 'default');
  return DEFAULT_SHOP_LOGOS[hash % DEFAULT_SHOP_LOGOS.length];
}
