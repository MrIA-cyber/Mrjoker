export function getFrenchAuthErrorMessage(error: any): string {
  if (!error) return "Une erreur inconnue s'est produite.";

  const code = error.code || error.message || "";

  switch (code) {
    case 'auth/email-already-in-use':
      return "Cette adresse e-mail est déjà utilisée par un autre compte.";
    case 'auth/invalid-email':
      return "L'adresse e-mail saisie n'est pas valide.";
    case 'auth/weak-password':
      return "Le mot de passe est trop court. Il doit contenir au moins 6 caractères.";
    case 'auth/user-not-found':
      return "Aucun compte n'est associé à cette adresse e-mail.";
    case 'auth/wrong-password':
      return "Mot de passe incorrect. Veuillez réessayer.";
    case 'auth/invalid-credential':
      return "Identifiants invalides (e-mail ou mot de passe incorrect).";
    case 'auth/account-exists-with-different-credential':
      return "Un compte existe déjà avec cette même adresse e-mail mais une méthode de connexion différente.";
    case 'auth/popup-closed-by-user':
      return "La fenêtre de connexion Google a été fermée avant la fin.";
    case 'auth/popup-blocked':
      return "Le navigateur a bloqué la fenêtre de connexion Google. Veuillez autoriser les popups.";
    case 'auth/too-many-requests':
      return "Trop de tentatives de connexion échouées. Veuillez réespérer dans quelques minutes.";
    case 'auth/network-request-failed':
      return "Erreur réseau. Veuillez vérifier votre connexion Internet.";
    case 'auth/operation-not-allowed':
      return "Cette méthode de connexion n'est pas activée sur Firebase pour le moment.";
    default:
      if (typeof error.message === 'string' && error.message.length > 0) {
        return error.message;
      }
      return "Une erreur est survenue lors de l'authentification. Veuillez réessayer.";
  }
}
