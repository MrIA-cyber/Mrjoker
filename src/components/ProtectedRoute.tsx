import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { UserRole, mapAccountTypeToRole, getDashboardForRole } from '../lib/rbac';
import { logAuditEvent } from '../lib/auditLogger';
import AccessDeniedModal from './AccessDeniedModal';

interface ProtectedRouteProps {
  currentUser: User | null;
  allowedRoles: UserRole[];
  resourceName: string;
  onUnauthorizedRedirect: (allowedView: string) => void;
  children: React.ReactNode;
}

export default function ProtectedRoute({
  currentUser,
  allowedRoles,
  resourceName,
  onUnauthorizedRedirect,
  children,
}: ProtectedRouteProps) {
  const [isDeniedModalOpen, setIsDeniedModalOpen] = useState(false);
  const userRole: UserRole = currentUser ? mapAccountTypeToRole(currentUser.accountType) : 'CLIENT';

  const isAuthorized = currentUser ? allowedRoles.includes(userRole) : false;

  useEffect(() => {
    if (currentUser && !isAuthorized) {
      // Record unauthorized attempt in security audit logs
      logAuditEvent({
        userId: currentUser.id,
        userName: currentUser.name || 'Utilisateur',
        userRole: userRole,
        action: 'ACCESS_PROTECTED_ROUTE',
        resource: resourceName,
        status: 'DENIED',
        reason: `Rôle ${userRole} non autorisé pour la ressource ${resourceName}`,
      });

      setIsDeniedModalOpen(true);
    }
  }, [currentUser, isAuthorized, userRole, resourceName]);

  if (!currentUser) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-md space-y-4">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Connexion requise</h3>
          <p className="text-xs text-slate-500">
            Veuillez vous connecter pour accéder à cet espace sécurisé par rôle.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <>
        <AccessDeniedModal
          isOpen={isDeniedModalOpen}
          userRole={userRole}
          attemptedResource={resourceName}
          onClose={() => setIsDeniedModalOpen(false)}
          onRedirectToHome={() => {
            const fallbackView = getDashboardForRole(userRole);
            onUnauthorizedRedirect(fallbackView);
          }}
        />
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="bg-rose-50 dark:bg-rose-950/40 p-8 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-xl max-w-md space-y-4">
            <span className="text-4xl">🚫</span>
            <h3 className="font-extrabold text-lg text-rose-700 dark:text-rose-300">Accès refusé</h3>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Votre rôle ({userRole}) ne dispose pas des droits d'accès à cette section.
            </p>
            <button
              onClick={() => onUnauthorizedRedirect(getDashboardForRole(userRole))}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer"
            >
              Retourner à mon tableau de bord ({userRole})
            </button>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
