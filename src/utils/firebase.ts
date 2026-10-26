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
import { syncGoogleLoginWithBackend, notifyBackendLogout } from './studentBackend';

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
  const displayName = user.displayName || user.email?.split('@')[0] || 'Sinh viên';

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
    isLoggedIn: true,
    linkedGoogle: true
  };
}

/**
 * Sign in using Google Auth Provider via Popup, Redirect or Selected Google Account
 * Links directly with backend student record and retrieves saved profile
 */
export async function signInWithGoogle(chosenAccount?: { 
  id?: string; 
  email?: string; 
  name?: string; 
  picture?: string; 
  university?: string; 
  major?: string; 
  studentCode?: string 
}): Promise<UserProfile> {
  let profile: UserProfile | null = null;

  // If a specific Google account was chosen by user
  if (chosenAccount && chosenAccount.email) {
    const email = chosenAccount.email.trim().toLowerCase();
    const name = chosenAccount.name?.trim() || email.split('@')[0];
    const uid = chosenAccount.id || `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;

    profile = {
      id: uid,
      email,
      name,
      avatar: getInitialsFromName(name),
      picture: chosenAccount.picture,
      university: chosenAccount.university || loadData<string>(`university_${uid}`, ''),
      major: chosenAccount.major || loadData<string>(`major_${uid}`, ''),
      studentCode: chosenAccount.studentCode || loadData<string>(`code_${uid}`, ''),
      canNotify: true,
      canBookmark: true,
      createdAt: new Date().toISOString(),
      provider: 'google',
      isLoggedIn: true,
      linkedGoogle: true
    };
  }

  // If no account specified, try native Google popup / Firebase Auth
  if (!profile && auth && googleProvider) {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      let user: FirebaseUser | null = null;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        user = result.user;
      } catch (popupErr: any) {
        console.warn('Popup attempt note:', popupErr?.code || popupErr?.message);
        if (popupErr?.code === 'auth/popup-blocked' && isMobile) {
          await signInWithRedirect(auth, googleProvider);
          return new Promise(() => {}); // Wait for redirect
        }
      }

      if (user) {
        profile = formatFirebaseUser(user);
      }
    } catch (firebaseErr: any) {
      console.warn('Firebase Auth note:', firebaseErr);
    }
  }

  // Fallback to active saved accounts if available
  if (!profile) {
    try {
      const savedList = JSON.parse(localStorage.getItem('timi_saved_google_accounts') || '[]');
      if (Array.isArray(savedList)) {
        const acc = savedList.find((a: any) => a && a.email && a.id !== 'google_user_phuonghang');
        if (acc && acc.email) {
          const email = acc.email.trim().toLowerCase();
          const name = acc.name?.trim() || email.split('@')[0];
          const uid = acc.id || `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
          const customUni = loadData<string>(`university_${uid}`, '');
          const customMajor = loadData<string>(`major_${uid}`, '');
          const customCode = loadData<string>(`code_${uid}`, '');

          profile = {
            id: uid,
            name,
            email,
            avatar: getInitialsFromName(name),
            picture: acc.picture,
            university: customUni || acc.university || '',
            major: customMajor || acc.major || '',
            studentCode: customCode || acc.studentCode || '',
            canNotify: true,
            canBookmark: true,
            createdAt: new Date().toISOString(),
            provider: 'google',
            isLoggedIn: true,
            linkedGoogle: true
          };
        }
      }
    } catch (e) {}
  }

  if (!profile) {
    throw new Error('Vui lòng chọn hoặc nhập tài khoản Google của bạn');
  }

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
  return profile;
}

/**
 * Sign out user from Firebase Auth, Backend session, and clear state
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
 * Reset all session and local storage data
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
