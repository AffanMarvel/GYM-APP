import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './firestoreService';

// ─── Secret signup key (for new users) ────────────────────────
export const SIGNUP_KEY = 'AffaNqwertyuiopShaikH';

// ─── Admin Account (auto-created on first app launch) ─────────
const ADMIN_USERNAME   = 'Affan';
const ADMIN_EMAIL      = 'weareaffanshaikh@gmail.com';
const ADMIN_PASSWORD   = 'Marvel@786';
const ADMIN_WEIGHT     = 75;

// ─── Initialize Admin Account ──────────────────────────────────
// Runs silently on app start. Creates the Affan account in Firebase
// if it doesn't exist yet. Never shows errors to users.
export const initAdminAccount = async () => {
  try {
    // Try to sign in first — if account already exists, sign out and return
    const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    await signOut(auth);    // sign out silently, user hasn't logged in intentionally
    console.log('[Admin] Admin account verified.');
    return;
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      // Account doesn't exist yet — create it
      try {
        const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        await updateProfile(cred.user, { displayName: ADMIN_USERNAME });
        await createUserProfile(cred.user.uid, {
          displayName: ADMIN_USERNAME,
          email: ADMIN_EMAIL,
          weight: ADMIN_WEIGHT,
          isAdmin: true,
          createdAt: new Date().toISOString(),
        });
        await signOut(auth);
        console.log('[Admin] Admin account created successfully.');
      } catch (createErr) {
        console.error('[Admin] Failed to create admin account:', createErr);
      }
    }
    // If any other error (network etc.), silently ignore — will retry next launch
  }
};

// ─── Resolve login input: username → email ─────────────────────
// If user types "Affan" (username) instead of an email, map to admin email
export const resolveLoginEmail = (input) => {
  const trimmed = input.trim();
  if (trimmed.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
    return ADMIN_EMAIL;
  }
  return trimmed;   // normal email
};

// ─── Sign Up (for other users with signup key) ─────────────────
export const signUpWithEmail = async (email, password, displayName, weight) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  await updateProfile(user, { displayName });
  await createUserProfile(user.uid, {
    displayName,
    email,
    weight: parseFloat(weight) || 75,
    createdAt: new Date().toISOString(),
  });
  return user;
};

// ─── Sign In ───────────────────────────────────────────────────
export const signInWithEmail = async (emailOrUsername, password) => {
  const email = resolveLoginEmail(emailOrUsername);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

// ─── Sign Out ──────────────────────────────────────────────────
export const signOutUser = () => signOut(auth);

// ─── Auth State Listener ───────────────────────────────────────
export const onAuthStateChange = (callback) => onAuthStateChanged(auth, callback);

// ─── Map Firebase error codes to human-readable messages ───────
export const getAuthErrorMessage = (errorCode) => {
  const messages = {
    'auth/user-not-found':        'Incorrect username or password.',
    'auth/wrong-password':        'Incorrect password.',
    'auth/invalid-credential':    'Incorrect username or password.',
    'auth/email-already-in-use':  'An account with this email already exists.',
    'auth/weak-password':         'Password should be at least 6 characters.',
    'auth/invalid-email':         'Please enter a valid email or username.',
    'auth/too-many-requests':     'Too many attempts. Please wait and try again.',
    'auth/network-request-failed':'Network error. Check your internet connection.',
  };
  return messages[errorCode] || 'Something went wrong. Please try again.';
};
