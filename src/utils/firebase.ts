import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { UserProfile } from '../types';
import { loadData, saveData, removeData, clearPersonalizationOnLogout } from './storage';
import { syncGoogleLoginWithBackend, notifyBackendLogout } from './studentBackend';

export interface SavedGoogleAccount {
  id: string;
  email: string;
  name: string;
  picture?: string;
  university?: string;
  major?: string;
  studentCode?: string;
  academicYear?: string;
  lastUsed?: string;
}

export const SAVED_ACCOUNTS_KEY = 'timi_saved_google_accounts';
export const AUTH_STORAGE_KEY = 'timi_firebase_auth_user';

// Real Firebase Project Config provided for timi-3e5b2
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCbHsRmmPBC_XhUeCv8m8XZItOD0pQb5Ck",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "timi-3e5b2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "timi-3e5b2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "timi-3e5b2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "351393400014",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:351393400014:web:13d8440985d7d44de17c9f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-N7JPT2RRHV"
};

// Initialize Firebase App safely
let app: FirebaseApp;
export let auth: Auth | null = null;
export let googleProvider: GoogleAuthProvider | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  // Requirement: Thiết lập setPersistence(auth, browserLocalPersistence) của Firebase Auth
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Set persistence note:', err);
  });
} catch (error) {
  console.warn('Firebase initialization note:', error);
}

// Check redirect result on initialization if redirect flow was used
if (auth) {
  getRedirectResult(auth)
    .then((result) => {
      if (result && result.user) {
        const profile = formatFirebaseUser(result.user);
        saveData(AUTH_STORAGE_KEY, profile);
        try {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        } catch (e) {}
      }
    })
    .catch((err) => {
      console.warn('Redirect result note:', err);
    });
}

// Helper to compute initials from name (e.g. "Phương Hằng" -> "PH")
export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Get all saved accounts for 1-Click re-login
 */
export function getSavedGoogleAccounts(): SavedGoogleAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Exclude obsolete legacy dummy mock id if present
        const cleaned = parsed.filter((a) => a && a.email && a.id !== 'google_user_phuonghang');
        return cleaned;
      }
    }
  } catch (e) {
    console.warn('Error reading saved accounts:', e);
  }
  return [];
}

/**
 * Save account into remembered accounts list
 */
export function saveGoogleAccountToList(account: SavedGoogleAccount): SavedGoogleAccount[] {
  const current = getSavedGoogleAccounts();
  const filtered = current.filter(
    (a) => a.email.toLowerCase() !== account.email.toLowerCase() && a.id !== account.id
  );
  const updated = [account, ...filtered];
  try {
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

/**
 * Remove remembered account
 */
export function removeGoogleAccountFromList(emailOrId: string): SavedGoogleAccount[] {
  const current = getSavedGoogleAccounts();
  const updated = current.filter(
    (a) => a.email.toLowerCase() !== emailOrId.toLowerCase() && a.id !== emailOrId
  );
  try {
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

/**
 * Convert Firebase User to TIMI UserProfile format & automatically remember for 1-Click login
 */
export function formatFirebaseUser(user: FirebaseUser): UserProfile {
  const customUni = loadData<string>(`university_${user.uid}`, '') || loadData<string>(`university_${user.email}`, '');
  const customMajor = loadData<string>(`major_${user.uid}`, '') || loadData<string>(`major_${user.email}`, '');
  const customCode = loadData<string>(`code_${user.uid}`, '') || loadData<string>(`code_${user.email}`, '');
  const customYear = loadData<string>(`year_${user.uid}`, '') || loadData<string>(`year_${user.email}`, '');
  const displayName = user.displayName || user.email?.split('@')[0] || 'Sinh viên';

  const profile: UserProfile = {
    id: user.uid,
    name: displayName,
    email: user.email || '',
    avatar: getInitialsFromName(displayName),
    picture: user.photoURL || undefined,
    university: customUni,
    major: customMajor,
    studentCode: customCode,
    academicYear: customYear,
    canNotify: true,
    canBookmark: true,
    createdAt: user.metadata.creationTime || new Date().toISOString(),
    provider: 'google',
    isLoggedIn: true,
    linkedGoogle: true
  };

  // Automatically remember account for 1-Click re-login
  saveGoogleAccountToList({
    id: user.uid,
    email: user.email || '',
    name: displayName,
    picture: user.photoURL || undefined,
    university: customUni,
    major: customMajor,
    studentCode: customCode,
    academicYear: customYear,
    lastUsed: 'Vừa đăng nhập'
  });

  return profile;
}

/**
 * Sign in using official Firebase Google Auth Provider via Popup or Redirect
 * Calls Google Auth with prompt: 'select_account'
 */
export async function signInWithGoogle(promptSelectAccount: boolean = true): Promise<UserProfile> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth chưa được khởi tạo');
  }

  if (promptSelectAccount) {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }

  // Ensure browserLocalPersistence is active
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) {}

  let user: FirebaseUser | null = null;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  try {
    const result = await signInWithPopup(auth, googleProvider);
    user = result.user;
  } catch (popupErr: any) {
    console.warn('Popup attempt result:', popupErr?.code, popupErr?.message);
    if ((popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/cancelled-popup-request') && isMobile) {
      await signInWithRedirect(auth, googleProvider);
      return new Promise(() => {}); // Wait for redirect
    }
    throw popupErr;
  }

  if (!user) {
    throw new Error('Không nhận được thông tin tài khoản Google');
  }

  let profile = formatFirebaseUser(user);

  // Sync with Backend Express server
  try {
    const backendResult = await syncGoogleLoginWithBackend(profile);
    if (backendResult.success && backendResult.student) {
      profile = {
        ...profile,
        ...backendResult.student,
        isLoggedIn: true,
        linkedGoogle: true
      };
    }
  } catch (err) {
    console.warn('Backend sync deferred:', err);
  }

  saveData(AUTH_STORAGE_KEY, profile);
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {}
  localStorage.setItem('timi_current_active_user_id', profile.id || '');

  return profile;
}

/**
 * 1-Click Re-login with a previously remembered account without re-entering credentials
 */
export async function signInWithSavedAccount(account: SavedGoogleAccount): Promise<UserProfile> {
  const email = account.email.trim().toLowerCase();
  const name = account.name?.trim() || email.split('@')[0];
  const uid = account.id || `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const customUni = loadData<string>(`university_${uid}`, '') || account.university || '';
  const customMajor = loadData<string>(`major_${uid}`, '') || account.major || '';
  const customCode = loadData<string>(`code_${uid}`, '') || account.studentCode || '';
  const customYear = loadData<string>(`year_${uid}`, '') || account.academicYear || '';

  let profile: UserProfile = {
    id: uid,
    name,
    email,
    avatar: getInitialsFromName(name),
    picture: account.picture,
    university: customUni,
    major: customMajor,
    studentCode: customCode,
    academicYear: customYear,
    canNotify: true,
    canBookmark: true,
    createdAt: new Date().toISOString(),
    provider: 'google',
    isLoggedIn: true,
    linkedGoogle: true
  };

  // Update last used timestamp
  account.lastUsed = 'Vừa đăng nhập';
  saveGoogleAccountToList(account);

  // Sync with backend Express server
  try {
    const backendResult = await syncGoogleLoginWithBackend(profile);
    if (backendResult.success && backendResult.student) {
      profile = {
        ...profile,
        ...backendResult.student,
        isLoggedIn: true,
        linkedGoogle: true
      };
    }
  } catch (err) {
    console.warn('Backend sync deferred:', err);
  }

  saveData(AUTH_STORAGE_KEY, profile);
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {}
  localStorage.setItem('timi_current_active_user_id', profile.id || '');

  return profile;
}

/**
 * Sign out user from Firebase Auth and clear active session,
 * BUT retains remembered accounts in localStorage so the user can 1-Click log back in!
 */
export async function signOutGoogle(userProfile?: UserProfile | null): Promise<void> {
  try {
    if (userProfile?.id || userProfile?.email) {
      await notifyBackendLogout(userProfile.id, userProfile.email);
    }
    if (auth) {
      await signOut(auth);
    }
  } catch (err) {
    console.error('Sign out error:', err);
  } finally {
    removeData(AUTH_STORAGE_KEY);
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
    removeData('timi_current_active_user_id');
    removeData('timi_student_profile');
    clearPersonalizationOnLogout();
  }
}

/**
 * Reset all session and local storage data completely
 */
export function resetSession(): void {
  removeData(AUTH_STORAGE_KEY);
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {}
  removeData('timi_student_profile');
  removeData('timi_current_active_user_id');
  clearPersonalizationOnLogout();
}

/**
 * Subscribe to Auth state changes with persistence
 */
export function listenToAuthState(callback: (profile: UserProfile | null) => void): () => void {
  if (auth) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile = formatFirebaseUser(firebaseUser);
        saveData(AUTH_STORAGE_KEY, profile);
        try {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        } catch (e) {}
        callback(profile);
      } else {
        // Fallback to local storage cached session if available
        const cached = loadData<UserProfile | null>(AUTH_STORAGE_KEY, null);
        if (cached && cached.isLoggedIn && cached.id !== 'google_user_phuonghang') {
          callback(cached);
        } else {
          callback(null);
        }
      }
    });
  }

  const cached = loadData<UserProfile | null>(AUTH_STORAGE_KEY, null);
  if (cached && cached.isLoggedIn && cached.id !== 'google_user_phuonghang') {
    callback(cached);
  } else {
    callback(null);
  }

  return () => {};
}
