'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logOutUser,
  syncUserProfileToFirestore,
  PRIMARY_ADMIN_EMAIL
} from '@/lib/firebase';
import { UserSession, Tier, Role } from '@/types';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  loginWithGoogle: () => Promise<UserSession>;
  loginWithEmail: (email: string, pass: string) => Promise<UserSession>;
  registerWithEmail: (name: string, email: string, pass: string, role?: Role) => Promise<UserSession>;
  logout: () => Promise<void>;
  updateUserTier: (tier: Tier) => void;
  setUserDirect: (user: UserSession | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => ({} as UserSession),
  loginWithEmail: async () => ({} as UserSession),
  registerWithEmail: async () => ({} as UserSession),
  logout: async () => {},
  updateUserTier: () => {},
  setUserDirect: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and listen to Firebase auth state
  useEffect(() => {
    // Check localStorage first for instant hydration
    try {
      const stored = localStorage.getItem('eduagent_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email?.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
          parsed.role = 'SUPER_ADMIN';
          parsed.tier = 'EDUCATOR';
          parsed.subscriptionTier = 'EDUCATOR';
          parsed.subscriptionStatus = 'ACTIVE';
        }
        setUser(parsed);
      }
    } catch (e) {}

    // Listen to live Firebase auth events
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const synced = await syncUserProfileToFirestore(fbUser);
          setUser(synced);
          localStorage.setItem('eduagent_user', JSON.stringify(synced));
          document.cookie = `eduagent_role=${synced.role}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `eduagent_email=${synced.email}; path=/; max-age=86400; SameSite=Lax`;
        } catch (err) {
          console.warn('Auth sync error:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<UserSession> => {
    setLoading(true);
    try {
      const session = await signInWithGoogle();
      setUser(session);
      localStorage.setItem('eduagent_user', JSON.stringify(session));
      document.cookie = `eduagent_role=${session.role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `eduagent_email=${session.email}; path=/; max-age=86400; SameSite=Lax`;
      return session;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<UserSession> => {
    setLoading(true);
    try {
      const session = await signInWithEmail(email, pass);
      setUser(session);
      localStorage.setItem('eduagent_user', JSON.stringify(session));
      document.cookie = `eduagent_role=${session.role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `eduagent_email=${session.email}; path=/; max-age=86400; SameSite=Lax`;
      return session;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string, role: Role = 'STUDENT'): Promise<UserSession> => {
    setLoading(true);
    try {
      const session = await signUpWithEmail(name, email, pass, role);
      setUser(session);
      localStorage.setItem('eduagent_user', JSON.stringify(session));
      document.cookie = `eduagent_role=${session.role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `eduagent_email=${session.email}; path=/; max-age=86400; SameSite=Lax`;
      return session;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logOutUser();
    } catch (err) {}
    localStorage.removeItem('eduagent_user');
    document.cookie = 'eduagent_token=; Max-Age=0; path=/;';
    document.cookie = 'eduagent_role=; Max-Age=0; path=/;';
    document.cookie = 'eduagent_email=; Max-Age=0; path=/;';
    setUser(null);
  };

  const updateUserTier = (newTier: Tier) => {
    if (!user) return;
    const updated = {
      ...user,
      tier: newTier,
      subscriptionTier: newTier
    };
    setUser(updated);
    localStorage.setItem('eduagent_user', JSON.stringify(updated));
  };

  const setUserDirect = (newUser: UserSession | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('eduagent_user', JSON.stringify(newUser));
      document.cookie = `eduagent_role=${newUser.role}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `eduagent_email=${newUser.email}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      localStorage.removeItem('eduagent_user');
      document.cookie = 'eduagent_role=; Max-Age=0; path=/;';
      document.cookie = 'eduagent_email=; Max-Age=0; path=/;';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateUserTier,
        setUserDirect
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
