import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { UserRole, checkPermission, Resource } from './src/lib/rbac';
import { 
  checkAccountUniqueness, 
  normalizePhoneNumber, 
  normalizeEmail, 
  PHONE_DUPLICATE_ERROR_MSG, 
  EMAIL_DUPLICATE_ERROR_MSG 
} from './src/utils/accountValidation';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory audit logs store on server
  const serverAuditLogs: any[] = [];

  // In-memory server-side user registry store
  const serverUsers: Array<{ id: string; name: string; phone: string; email: string; accountType: string }> = [
    {
      id: 'u-seed-1',
      name: 'Jean Kamdem',
      phone: '+237677894512',
      email: 'jean.kamdem@mail.com',
      accountType: 'client'
    }
  ];

  // -------------------------------------------------------------
  // SERVER-SIDE ACCOUNT VALIDATION API ROUTES
  // -------------------------------------------------------------

  // Check account uniqueness (phone & email)
  app.post('/api/auth/check-uniqueness', (req, res) => {
    const { phone, email, dialCode = '+237' } = req.body || {};

    const checkResult = checkAccountUniqueness(phone, email, serverUsers, dialCode);

    if (checkResult.isPhoneDuplicate) {
      return res.status(400).json({
        isUnique: false,
        isPhoneDuplicate: true,
        isEmailDuplicate: false,
        message: PHONE_DUPLICATE_ERROR_MSG
      });
    }

    if (checkResult.isEmailDuplicate) {
      return res.status(400).json({
        isUnique: false,
        isPhoneDuplicate: false,
        isEmailDuplicate: true,
        message: EMAIL_DUPLICATE_ERROR_MSG
      });
    }

    res.json({ isUnique: true, message: 'Identifiants disponibles.' });
  });

  // Server-side user registration route with strict validation
  app.post('/api/auth/register', (req, res) => {
    const { fullName, phone, email, profile, accountType, password, dialCode = '+237' } = req.body || {};

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Un numéro de téléphone valide est obligatoire.'
      });
    }

    const checkResult = checkAccountUniqueness(phone, email, serverUsers, dialCode);

    if (checkResult.isPhoneDuplicate) {
      return res.status(400).json({
        success: false,
        isPhoneDuplicate: true,
        isEmailDuplicate: false,
        message: PHONE_DUPLICATE_ERROR_MSG
      });
    }

    if (checkResult.isEmailDuplicate) {
      return res.status(400).json({
        success: false,
        isPhoneDuplicate: false,
        isEmailDuplicate: true,
        message: EMAIL_DUPLICATE_ERROR_MSG
      });
    }

    const normalizedPhone = normalizePhoneNumber(phone, dialCode);
    const normalizedEmailVal = email && email.trim() ? normalizeEmail(email) : `${normalizedPhone.replace(/[^0-9]/g, '')}@afrinova.cm`;

    const newUser = {
      id: `u-srv-${Date.now()}`,
      name: (fullName || 'Utilisateur AfriNova').trim(),
      phone: normalizedPhone,
      email: normalizedEmailVal,
      accountType: profile || accountType || 'client',
      createdAt: new Date().toISOString()
    };

    serverUsers.push(newUser);

    res.json({
      success: true,
      message: 'Compte créé avec succès.',
      user: newUser
    });
  });

  // Get server registered users (for admin / sync)
  app.get('/api/auth/users', (req, res) => {
    res.json(serverUsers);
  });

  // -------------------------------------------------------------
  // SERVER-SIDE RBAC API ROUTES & PERMISSION INTERCEPTORS
  // -------------------------------------------------------------

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // IP Country Detection Endpoint
  app.get('/api/country-detect', (req, res) => {
    // Check cloud proxy headers if present
    const countryHeader = req.headers['cf-ipcountry'] || 
                          req.headers['x-country-code'] || 
                          req.headers['x-appengine-country'];
    
    if (countryHeader && typeof countryHeader === 'string' && countryHeader !== 'XX') {
      return res.json({ countryCode: countryHeader.toUpperCase(), detected: true, method: 'ip' });
    }

    // Default IP location resolution for local / preview environment (defaults to CM Cameroun)
    res.json({ countryCode: 'CM', detected: true, method: 'ip' });
  });

  // Server-side Permission Verification API
  app.post('/api/rbac/check', (req, res) => {
    const { role, resource, action } = req.body as { role: UserRole; resource: Resource; action: any };
    
    if (!role || !resource) {
      return res.status(400).json({ allowed: false, error: 'Role et resource requis.' });
    }

    const isAllowed = checkPermission(role, resource, action || 'access');
    
    if (!isAllowed) {
      const auditEntry = {
        id: `srv-audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userRole: role,
        resource,
        action: action || 'access',
        status: 'DENIED',
        reason: `Tentative d'accès serveur non autorisée pour le rôle ${role} sur ${resource}`,
        ipAddress: req.ip || '197.231.18.42',
      };
      serverAuditLogs.unshift(auditEntry);
      
      return res.status(403).json({
        allowed: false,
        error: 'Accès refusé',
        message: `Accès non autorisé pour le rôle ${role} sur la ressource ${resource}`,
      });
    }

    res.json({ allowed: true });
  });

  // Record Audit Log Endpoint
  app.post('/api/rbac/audit-log', (req, res) => {
    const entry = req.body;
    serverAuditLogs.unshift({
      ...entry,
      receivedAt: new Date().toISOString(),
    });
    res.json({ status: 'logged', total: serverAuditLogs.length });
  });

  // Fetch Server Audit Logs
  app.get('/api/rbac/audit-logs', (req, res) => {
    const userRole = (req.headers['x-user-role'] as UserRole) || 'CLIENT';
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé - Réservé aux administrateurs.' });
    }
    res.json(serverAuditLogs);
  });

  // Server-side Role-Filtered Products Endpoint
  app.get('/api/products', (req, res) => {
    const userRole = (req.headers['x-user-role'] as UserRole) || 'CLIENT';
    const userId = req.headers['x-user-id'] as string;

    // Server permission check
    if (!checkPermission(userRole, 'catalog_public', 'read') && userRole !== 'BOUTIQUE') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json({ status: 'success', roleVerified: userRole, userId });
  });

  // Server-side Create Product Endpoint (Only BOUTIQUE or ADMIN allowed)
  app.post('/api/products', (req, res) => {
    const userRole = (req.headers['x-user-role'] as UserRole) || 'CLIENT';
    
    if (userRole !== 'BOUTIQUE' && userRole !== 'ADMIN') {
      const auditEntry = {
        id: `srv-audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userRole,
        action: 'CREATE_PRODUCT',
        resource: 'boutique_products',
        status: 'DENIED',
        reason: 'Tentative de création de produit par un non-boutique',
      };
      serverAuditLogs.unshift(auditEntry);

      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Seuls les utilisateurs avec le rôle BOUTIQUE peuvent créer des produits.',
      });
    }

    res.json({ status: 'success', message: 'Produit créé avec succès.' });
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE SETUP
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RBAC Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
