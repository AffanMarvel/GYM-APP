import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, signOutUser, initAdminAccount } from '../firebase/authService';
import {
  getUserProfile,
  updateUserProfile,
  migrateLocalStorageToFirestore,
} from '../firebase/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // Firebase Auth user
  const [userProfile, setUserProfile] = useState(null); // Firestore profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Silently create admin account on first launch if it doesn't exist
    initAdminAccount();

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load Firestore profile
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
          // Migrate localStorage data if not done yet
          const migrated = localStorage.getItem('gym_migrated_' + firebaseUser.uid);
          if (!migrated) {
            await migrateLocalStorageToFirestore(firebaseUser.uid);
          }
        } catch (err) {
          console.error('Failed to load user profile:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOutUser();
    setUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  const saveProfile = async (updates) => {
    if (user) {
      const merged = { ...userProfile, ...updates };
      await updateUserProfile(user.uid, merged);
      setUserProfile(merged);
    }
  };

  // Admin check — only Affan (weareaffanshaikh@gmail.com)
  const isAdmin = user && (
    user.email === 'weareaffanshaikh@gmail.com' ||
    user.displayName?.toLowerCase().includes('affan')
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#06060d' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #818cf8, #a855f7)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M6.5 6.5h11M6.5 17.5h11M9 3v18M15 3v18"/>
            </svg>
          </div>
          <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ border: '3px solid rgba(129,140,248,0.2)', borderTopColor: '#818cf8' }} />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      isAuthenticated: !!user,
      isAdmin,
      logout,
      refreshProfile,
      saveProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
