export type UserRole = 'CLIENT' | 'BOUTIQUE' | 'ENTREPRISE' | 'PRESTATAIRE' | 'LIVREUR' | 'TRADER' | 'ADMIN';

export type AccountType = 'client' | 'vendeur' | 'entreprise' | 'prestataire' | 'livreur' | 'trader' | 'admin';

export interface RBACUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType?: AccountType;
  role: UserRole;
  merchantId?: string;
  companyId?: string;
}

// Convert user accountType string to strict UserRole enum
export function mapAccountTypeToRole(accountType?: string): UserRole {
  if (!accountType) return 'CLIENT';
  const type = accountType.toLowerCase();
  switch (type) {
    case 'vendeur':
    case 'boutique':
      return 'BOUTIQUE';
    case 'entreprise':
      return 'ENTREPRISE';
    case 'prestataire':
      return 'PRESTATAIRE';
    case 'livreur':
      return 'LIVREUR';
    case 'trader':
      return 'TRADER';
    case 'admin':
      return 'ADMIN';
    case 'client':
    default:
      return 'CLIENT';
  }
}

export type Resource =
  | 'dashboard_client'
  | 'dashboard_boutique'
  | 'dashboard_entreprise'
  | 'dashboard_prestataire'
  | 'catalog_public'
  | 'cart'
  | 'my_client_orders'
  | 'boutique_products'
  | 'boutique_orders'
  | 'boutique_stats'
  | 'entreprise_procurement'
  | 'entreprise_team'
  | 'entreprise_quotes'
  | 'prestataire_interventions'
  | 'prestataire_calendar'
  | 'prestataire_services'
  | 'admin_panel'
  | 'audit_logs';

export type Action = 'read' | 'create' | 'update' | 'delete' | 'access';

// Matrix defining allowed resources and actions per Role
const ROLE_PERMISSIONS: Record<UserRole, Record<Resource, Action[]>> = {
  CLIENT: {
    dashboard_client: ['access', 'read'],
    dashboard_boutique: [],
    dashboard_entreprise: [],
    dashboard_prestataire: [],
    catalog_public: ['read'],
    cart: ['access', 'read', 'create', 'update', 'delete'],
    my_client_orders: ['access', 'read', 'create'],
    boutique_products: [],
    boutique_orders: [],
    boutique_stats: [],
    entreprise_procurement: [],
    entreprise_team: [],
    entreprise_quotes: [],
    prestataire_interventions: [],
    prestataire_calendar: [],
    prestataire_services: [],
    admin_panel: [],
    audit_logs: [],
  },
  BOUTIQUE: {
    dashboard_client: [],
    dashboard_boutique: ['access', 'read'],
    dashboard_entreprise: [],
    dashboard_prestataire: [],
    catalog_public: ['read'],
    cart: [],
    my_client_orders: [],
    boutique_products: ['access', 'read', 'create', 'update', 'delete'],
    boutique_orders: ['access', 'read', 'update'],
    boutique_stats: ['access', 'read'],
    entreprise_procurement: [],
    entreprise_team: [],
    entreprise_quotes: [],
    prestataire_interventions: [],
    prestataire_calendar: [],
    prestataire_services: [],
    admin_panel: [],
    audit_logs: [],
  },
  ENTREPRISE: {
    dashboard_client: [],
    dashboard_boutique: [],
    dashboard_entreprise: ['access', 'read'],
    dashboard_prestataire: [],
    catalog_public: ['read'],
    cart: [],
    my_client_orders: [],
    boutique_products: [],
    boutique_orders: [],
    boutique_stats: [],
    entreprise_procurement: ['access', 'read', 'create', 'update', 'delete'],
    entreprise_team: ['access', 'read', 'create', 'update', 'delete'],
    entreprise_quotes: ['access', 'read', 'create', 'update'],
    prestataire_interventions: [],
    prestataire_calendar: [],
    prestataire_services: [],
    admin_panel: [],
    audit_logs: [],
  },
  PRESTATAIRE: {
    dashboard_client: [],
    dashboard_boutique: [],
    dashboard_entreprise: [],
    dashboard_prestataire: ['access', 'read'],
    catalog_public: ['read'],
    cart: [],
    my_client_orders: [],
    boutique_products: [],
    boutique_orders: [],
    boutique_stats: [],
    entreprise_procurement: [],
    entreprise_team: [],
    entreprise_quotes: [],
    prestataire_interventions: ['access', 'read', 'update'],
    prestataire_calendar: ['access', 'read', 'update'],
    prestataire_services: ['access', 'read', 'create', 'update', 'delete'],
    admin_panel: [],
    audit_logs: [],
  },
  LIVREUR: {
    dashboard_client: [],
    dashboard_boutique: [],
    dashboard_entreprise: [],
    dashboard_prestataire: [],
    catalog_public: ['read'],
    cart: [],
    my_client_orders: [],
    boutique_products: [],
    boutique_orders: ['access', 'read', 'update'],
    boutique_stats: [],
    entreprise_procurement: [],
    entreprise_team: [],
    entreprise_quotes: [],
    prestataire_interventions: [],
    prestataire_calendar: [],
    prestataire_services: [],
    admin_panel: [],
    audit_logs: [],
  },
  TRADER: {
    dashboard_client: [],
    dashboard_boutique: [],
    dashboard_entreprise: [],
    dashboard_prestataire: [],
    catalog_public: ['read'],
    cart: [],
    my_client_orders: [],
    boutique_products: [],
    boutique_orders: [],
    boutique_stats: ['access', 'read'],
    entreprise_procurement: ['access', 'read'],
    entreprise_team: [],
    entreprise_quotes: [],
    prestataire_interventions: [],
    prestataire_calendar: [],
    prestataire_services: [],
    admin_panel: [],
    audit_logs: [],
  },
  ADMIN: {
    dashboard_client: ['access', 'read'],
    dashboard_boutique: ['access', 'read'],
    dashboard_entreprise: ['access', 'read'],
    dashboard_prestataire: ['access', 'read'],
    catalog_public: ['read'],
    cart: ['access', 'read'],
    my_client_orders: ['access', 'read'],
    boutique_products: ['access', 'read', 'create', 'update', 'delete'],
    boutique_orders: ['access', 'read', 'update'],
    boutique_stats: ['access', 'read'],
    entreprise_procurement: ['access', 'read'],
    entreprise_team: ['access', 'read'],
    entreprise_quotes: ['access', 'read'],
    prestataire_interventions: ['access', 'read'],
    prestataire_calendar: ['access', 'read'],
    prestataire_services: ['access', 'read'],
    admin_panel: ['access', 'read', 'create', 'update', 'delete'],
    audit_logs: ['access', 'read', 'delete'],
  },
};

/**
 * Strict permission check for a user against a resource and action.
 */
export function checkPermission(
  userRole: UserRole | undefined,
  resource: Resource,
  action: Action = 'access'
): boolean {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole]?.[resource] || [];
  return permissions.includes(action);
}

/**
 * Get dashboard route for a specific role
 */
export function getDashboardForRole(role: UserRole): string {
  switch (role) {
    case 'BOUTIQUE':
      return 'boutique';
    case 'ENTREPRISE':
      return 'entreprise';
    case 'PRESTATAIRE':
      return 'prestataire';
    case 'CLIENT':
    default:
      return 'client';
  }
}

/**
 * Validate that a target view belongs exclusively to the user's role
 */
export function isViewAllowedForRole(view: string, role: UserRole): boolean {
  if (role === 'ADMIN') return true;
  
  if (view === 'shop' || view === 'client' || view === 'orders') {
    return role === 'CLIENT';
  }
  if (view === 'merchant' || view === 'boutique') {
    return role === 'BOUTIQUE';
  }
  if (view === 'entreprise') {
    return role === 'ENTREPRISE';
  }
  if (view === 'prestataire') {
    return role === 'PRESTATAIRE';
  }
  if (view === 'admin' || view === 'audit') {
    return false; // Requires ADMIN
  }
  
  return false;
}
