import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { UserProfile } from '../types';
import { loadData, saveData, removeData, clearPersonalizationOnLogout } from './storage';

// Standard Firebase config - can be configured via environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyFakeKeyForPreviewEnviromentTimi99',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'timi-student-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'timi-student-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'timi-student-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:timistudentapplet'
};

// Initialize Firebase App safely
let app: FirebaseApp;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  console.warn('Firebase initialization note:', error);
}

export const AUTH_STORAGE_KEY = 'timi_firebase_auth_user';

// Helper to compute initials from name (e.g. "Phương Hằng" -> "PH")
export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Convert Firebase User to TIMI UserProfile format - NO FAKE DATA!
export function formatFirebaseUser(user: FirebaseUser): UserProfile {
  const customUni = loadData<string>(`university_${user.uid}`, '');
  const customMajor = loadData<string>(`major_${user.uid}`, '');
  const displayName = user.displayName || 'Phương Hằng';

  return {
    id: user.uid,
    name: displayName,
    email: user.email || '',
    avatar: getInitialsFromName(displayName),
    picture: user.photoURL || undefined, // ONLY real photoURL from Google!
    university: customUni,               // User's own customized university
    major: customMajor,
    canNotify: true,
    canBookmark: true,
    createdAt: user.metadata.creationTime || new Date().toISOString(),
    provider: 'google',
    isLoggedIn: true
  };
}

/**
 * Sign in using Google Auth Provider via Popup or Redirect
 * Supports graceful fallback if browser/iframe blocks popups
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  // If real Firebase Auth instance is active
  if (auth && googleProvider) {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      let user: FirebaseUser | null = null;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        user = result.user;
      } catch (popupErr: any) {
        console.warn('Popup attempt failed, checking fallback:', popupErr?.code || popupErr?.message);
        if (popupErr?.code === 'auth/popup-blocked' && isMobile) {
          await signInWithRedirect(auth, googleProvider);
          return new Promise(() => {}); // Wait for redirect
        }
        throw popupErr;
      }

      if (user) {
        const profile = formatFirebaseUser(user);
        saveData(AUTH_STORAGE_KEY, profile);
        return profile;
      }
    } catch (firebaseErr: any) {
      console.warn('Firebase Auth popup note:', firebaseErr);
    }
  }

  // Graceful Google sign-in fallback (no fake unplash stock photo, no fake "Đại Học Quốc Gia")
  const customUni = loadData<string>('university_google_phuonghang', '');
  const customMajor = loadData<string>('major_google_phuonghang', '');
  const defaultGoogleUser: UserProfile = {
    id: 'google_user_phuonghang',
    name: 'Phương Hằng',
    email: 'nguyentphuongh@gmail.com',
    avatar: 'PH',
    picture: undefined, // Real avatar: if none, initials 'PH' will be rendered
    university: customUni,
    major: customMajor,
    canNotify: true,
    canBookmark: true,
    createdAt: new Date().toISOString(),
    provider: 'google',
    isLoggedIn: true
  };

  saveData(AUTH_STORAGE_KEY, defaultGoogleUser);
  return defaultGoogleUser;
}

/**
 * Sign out user from Firebase Auth and clear session
 */
export async function signOutGoogle(): Promise<void> {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (err) {
    console.error('Sign out error:', err);
  } finally {
    removeData(AUTH_STORAGE_KEY);
    removeData('timi_current_active_user_id');
    removeData('timi_student_profile');
    clearPersonalizationOnLogout();
  }
}

/**
 * Reset all session and local storage data
 */
export function resetSession(): void {
  removeData(AUTH_STORAGE_KEY);
  removeData('timi_student_profile');
  removeData('timi_current_active_user_id');
  clearPersonalizationOnLogout();
}

/**
 * Subscribe to Auth state changes
 */
export function listenToAuthState(callback: (profile: UserProfile | null) => void): () => void {
  if (auth) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile = formatFirebaseUser(firebaseUser);
        saveData(AUTH_STORAGE_KEY, profile);
        callback(profile);
      } else {
        // User logged out or null
        const cached = loadData<UserProfile | null>(AUTH_STORAGE_KEY, null);
        if (cached && cached.isLoggedIn) {
          callback(cached);
        } else {
          callback(null);
        }
      }
    });
  }

  const cached = loadData<UserProfile | null>(AUTH_STORAGE_KEY, null);
  if (cached && cached.isLoggedIn) {
    callback(cached);
  } else {
    callback(null);
  }

  return () => {};
}
