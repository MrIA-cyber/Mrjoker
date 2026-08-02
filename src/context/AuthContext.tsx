import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { auth } from '../firebase';
import { User as AppUser, AccountType } from '../types';
import { getFrenchAuthErrorMessage } from '../utils/firebaseErrors';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: AppUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signupWithEmail: (email: string, password: string, fullName?: string, accountType?: AccountType) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('bafoussam_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Sync Firebase user with AppUser state
        const savedAppUserRaw = localStorage.getItem('bafoussam_user');
        let savedAppUser: AppUser | null = null;
        if (savedAppUserRaw) {
          try {
            savedAppUser = JSON.parse(savedAppUserRaw);
          } catch {
            savedAppUser = null;
          }
        }

        const updatedUser: AppUser = {
          id: user.uid,
          name: user.displayName || savedAppUser?.name || user.email?.split('@')[0] || 'Utilisateur',
          email: user.email || savedAppUser?.email || '',
          phone: savedAppUser?.phone || user.phoneNumber || '',
          accountType: savedAppUser?.accountType || 'client',
          isSubscribed: savedAppUser?.isSubscribed ?? true,
          hasPaidFee: savedAppUser?.hasPaidFee ?? true,
          isInTrial: savedAppUser?.isInTrial ?? true,
          trialStartDate: savedAppUser?.trialStartDate || new Date().toISOString()
        };

        setCurrentUser(updatedUser);
        localStorage.setItem('bafoussam_user', JSON.stringify(updatedUser));
      } else {
        // User logged out
        // Note: We retain currentUser if offline or explicitly cleared
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (email: string, password: string, fullName?: string, accountType: AccountType = 'client') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName && cred.user) {
      await updateProfile(cred.user, { displayName: fullName });
    }
    
    // Create local user profile
    const newUser: AppUser = {
      id: cred.user.uid,
      name: fullName || cred.user.email?.split('@')[0] || 'Utilisateur',
      email: cred.user.email || email,
      phone: '',
      accountType,
      isSubscribed: true,
      hasPaidFee: true,
      isInTrial: true,
      trialStartDate: new Date().toISOString()
    };
    
    setCurrentUser(newUser);
    localStorage.setItem('bafoussam_user', JSON.stringify(newUser));
    return cred;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    
    if (cred.user) {
      const gUser: AppUser = {
        id: cred.user.uid,
        name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Utilisateur Google',
        email: cred.user.email || '',
        phone: cred.user.phoneNumber || '',
        accountType: 'client',
        isSubscribed: true,
        hasPaidFee: true,
        isInTrial: true,
        trialStartDate: new Date().toISOString()
      };
      setCurrentUser(gUser);
      localStorage.setItem('bafoussam_user', JSON.stringify(gUser));
    }
    return cred;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    localStorage.removeItem('bafoussam_user');
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        loading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        setCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
