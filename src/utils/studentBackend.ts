import { UserProfile } from '../types';

export interface BackendLoginResponse {
  success: boolean;
  message: string;
  isNewUser?: boolean;
  student?: UserProfile;
  workspace?: {
    tasks?: any[];
    schedule?: any[];
    appointments?: any[];
    alarms?: any[];
    water?: number;
    pet?: any;
    settings?: any;
  };
  error?: string;
}

/**
 * Sends authenticated Google user credentials/profile to backend Express API.
 * The backend associates this student with their own unique student record,
 * restoring their customized university name, major, MSSV, and workspace data.
 */
export async function syncGoogleLoginWithBackend(profile: Partial<UserProfile>): Promise<BackendLoginResponse> {
  try {
    const res = await fetch('/api/auth/google/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        university: profile.university,
        major: profile.major,
        studentCode: profile.studentCode,
        academicYear: profile.academicYear
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    const data: BackendLoginResponse = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Backend sync note (running with local cache if offline):', err.message);
    return {
      success: false,
      message: err.message,
      student: profile as UserProfile
    };
  }
}

/**
 * Updates the student's personal profile (University, Major, Student ID, etc.) on the backend
 */
export async function updateBackendStudentProfile(profile: Partial<UserProfile>): Promise<boolean> {
  try {
    const res = await fetch('/api/student/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profile)
    });

    return res.ok;
  } catch (err) {
    console.warn('Failed to update profile on backend:', err);
    return false;
  }
}

/**
 * Fetches the student's profile from the backend
 */
export async function fetchBackendStudentProfile(userId?: string, email?: string): Promise<UserProfile | null> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (email) params.append('email', email);

    const res = await fetch(`/api/student/profile?${params.toString()}`);
    if (!res.ok) return null;

    const data = await res.json();
    return data.student || null;
  } catch (err) {
    console.warn('Failed to fetch profile from backend:', err);
    return null;
  }
}

/**
 * Persists workspace data (tasks, schedule, pet, appointments) to backend for this student
 */
export async function syncWorkspaceToBackend(userId: string, email: string | undefined, workspace: any): Promise<boolean> {
  try {
    const res = await fetch('/api/student/data', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        email,
        workspace
      })
    });

    return res.ok;
  } catch (err) {
    console.warn('Failed to sync workspace to backend:', err);
    return false;
  }
}

/**
 * Notifies backend when student signs out
 */
export async function notifyBackendLogout(userId?: string, email?: string): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, email })
    });
  } catch (err) {
    // Silent catch
  }
}
