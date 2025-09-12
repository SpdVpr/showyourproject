"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to create user document in Firestore
  const createUserDocument = async (firebaseUser: FirebaseUser, additionalData?: any) => {
    if (!firebaseUser) return;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = firebaseUser;
      const userData = {
        displayName: displayName || email?.split('@')[0] || 'Anonymous',
        email,
        photoURL,
        socialLinks: {},
        points: 0,
        tier: email === 'admin@showyourproject.com' ? 'admin' : 'free',
        createdAt: serverTimestamp(),
        emailVerified: firebaseUser.emailVerified,
        // Initialize points system fields
        totalPointsEarned: 0,
        totalPointsSpent: 0,
        featuredPurchases: 0,
        ...additionalData
      };

      await setDoc(userRef, userData);
      return userData;
    }

    return userSnap.data();
  };

  // Convert Firebase user to our User type
  const convertFirebaseUser = (firebaseUser: FirebaseUser, userData: any): User => ({
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: userData.displayName || firebaseUser.displayName || 'Anonymous',
    photoURL: userData.photoURL || firebaseUser.photoURL,
    socialLinks: userData.socialLinks || {},
    points: userData.points || 0,
    tier: userData.tier || 'free',
    createdAt: userData.createdAt,
    emailVerified: firebaseUser.emailVerified,
    // Points system fields with defaults
    totalPointsEarned: userData.totalPointsEarned || 0,
    totalPointsSpent: userData.totalPointsSpent || 0,
    featuredPurchases: userData.featuredPurchases || 0
  });

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        const userData = await createUserDocument(firebaseUser);
        const user = convertFirebaseUser(firebaseUser, userData);
        setUser(user);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Refresh user data from Firestore
  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedUser = convertFirebaseUser(firebaseUser, userData);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [firebaseUser]);

  const authValue: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn: async (email: string, password: string) => {
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    signUp: async (email: string, password: string, displayName: string) => {
      setLoading(true);
      try {
        const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name
        await updateProfile(firebaseUser, { displayName });

        // Create user document with display name
        await createUserDocument(firebaseUser, { displayName });
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    signInWithGoogle: async () => {
      setLoading(true);
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    signInWithGithub: async () => {
      setLoading(true);
      try {
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    logout: async () => {
      await signOut(auth);
    },
    updateUserProfile: async (data: Partial<User>) => {
      if (user && firebaseUser) {
        // Update Firestore document
        const userRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userRef, data, { merge: true });

        // Update local state
        setUser({ ...user, ...data });
      }
    },
    refreshUser,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}
