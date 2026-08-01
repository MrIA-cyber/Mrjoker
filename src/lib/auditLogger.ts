import { UserRole } from './rbac';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole | string;
  action: string;
  resource: string;
  status: 'ALLOWED' | 'DENIED' | 'LOGIN' | 'LOGOUT' | 'DATA_FILTER';
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

const AUDIT_STORAGE_KEY = 'bafoussam_audit_logs';

/**
 * Log a security or access event to local audit store and server endpoint
 */
export function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const fullEntry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ipAddress: '197.231.18.42', // Simulated Bafoussam IP
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Client',
    ...entry,
  };

  try {
    const existingRaw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const logs: AuditLogEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
    // Keep max 200 audit entries
    const updated = [fullEntry, ...logs].slice(0, 200);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));

    // Also send to backend audit endpoint if available
    if (typeof window !== 'undefined' && window.fetch) {
      fetch('/api/rbac/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEntry),
      }).catch(() => {
        // Silently ignore if mock server endpoint isn't listening yet
      });
    }
  } catch (e) {
    console.error('Erreur d\'enregistrement du journal d\'audit:', e);
  }

  return fullEntry;
}

/**
 * Get all stored audit logs
 */
export function getAuditLogs(): AuditLogEntry[] {
  try {
    const existingRaw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return existingRaw ? JSON.parse(existingRaw) : [];
  } catch (e) {
    console.error('Erreur de lecture des journaux d\'audit:', e);
    return [];
  }
}

/**
 * Clear audit logs (Admin only)
 */
export function clearAuditLogs(): void {
  try {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  } catch (e) {
    console.error('Erreur de nettoyage des journaux d\'audit:', e);
  }
}
