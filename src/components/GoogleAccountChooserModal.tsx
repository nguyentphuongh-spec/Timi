import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Trash2, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  School,
  GraduationCap,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';
import { playChime, playSuccessSound } from '../utils/audio';
import { signInWithGoogle, getInitialsFromName, AUTH_STORAGE_KEY } from '../utils/firebase';
import { syncGoogleLoginWithBackend } from '../utils/studentBackend';
import { saveData } from '../utils/storage';

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

const SAVED_ACCOUNTS_KEY = 'timi_saved_google_accounts';

// Clean helper to get saved Google accounts without hardcoded owner dummy
export function getSavedGoogleAccounts(): SavedGoogleAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Exclude obsolete legacy dummy mock id if present
        const cleaned = parsed.filter(
          (a) => a && a.email && a.id !== 'google_user_phuonghang'
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.warn('Error reading saved google accounts:', e);
  }
  return [];
}

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

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail?: string;
  onSelectAccount: (profile: UserProfile) => void;
}

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onSelectAccount
}) => {
  const [accounts, setAccounts] = useState<SavedGoogleAccount[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields for adding/logging in with custom Google account
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newUniversity, setNewUniversity] = useState('');
  const [newMajor, setNewMajor] = useState('');
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');

  // Load accounts whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedGoogleAccounts();
      setAccounts(saved);
      // If no accounts yet, directly open the new account login form
      if (saved.length === 0) {
        setIsAddingNew(true);
      } else {
        setIsAddingNew(false);
      }
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle selecting an existing saved Google account
  const handleChooseAccount = async (account: SavedGoogleAccount) => {
    try {
      setIsProcessing(true);
      setErrorMessage('');

      // Build student profile from chosen account
      const chosenProfile: UserProfile = {
        id: account.id || `google_${account.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: account.email.trim().toLowerCase(),
        name: account.name.trim(),
        avatar: getInitialsFromName(account.name),
        picture: account.picture || undefined,
        university: account.university || '',
        major: account.major || '',
        studentCode: account.studentCode || '',
        academicYear: account.academicYear || '',
        provider: 'google',
        isLoggedIn: true,
        linkedGoogle: true,
        canNotify: true,
        canBookmark: true,
        createdAt: new Date().toISOString()
      };

      // Sync with Express backend
      try {
        const backendResult = await syncGoogleLoginWithBackend(chosenProfile);
        if (backendResult.success && backendResult.student) {
          Object.assign(chosenProfile, backendResult.student);
        }
      } catch (err) {
        console.warn('Backend sync deferred:', err);
      }

      // Update last used
      account.lastUsed = 'Vừa đăng nhập';
      saveGoogleAccountToList(account);

      // Persist active session immediately
      saveData(AUTH_STORAGE_KEY, chosenProfile);
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(chosenProfile));
      } catch (e) {}
      localStorage.setItem('timi_current_active_user_id', chosenProfile.id || '');

      playSuccessSound();
      onSelectAccount(chosenProfile);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi đăng nhập vào tài khoản này');
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick fill helper for testing without typing
  const handleQuickFill = (preset: { name: string; email: string; university: string; major: string; studentCode: string }) => {
    setNewName(preset.name);
    setNewEmail(preset.email);
    setNewUniversity(preset.university);
    setNewMajor(preset.major);
    setNewStudentCode(preset.studentCode);
    playChime('sweet');
  };

  // Handle adding & logging in with a new Google account
  const handleSubmitNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    const name = newName.trim();

    if (!email || !email.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email Google/Gmail hợp lệ (ví dụ: yourname@gmail.com)');
      return;
    }

    if (!name) {
      setErrorMessage('Vui lòng nhập họ và tên sinh viên của bạn');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');

      const accountId = `google_${Date.now()}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const newAccountObj: SavedGoogleAccount = {
        id: accountId,
        email,
        name,
        picture: newPhotoURL.trim() || undefined,
        university: newUniversity.trim(),
        major: newMajor.trim(),
        studentCode: newStudentCode.trim(),
        academicYear: newAcademicYear.trim(),
        lastUsed: 'Vừa đăng nhập'
      };

      // Add to saved accounts list
      const updatedList = saveGoogleAccountToList(newAccountObj);
      setAccounts(updatedList);

      // Build profile & sync
      const profile: UserProfile = {
        id: newAccountObj.id,
        email: newAccountObj.email,
        name: newAccountObj.name,
        avatar: getInitialsFromName(newAccountObj.name),
        picture: newAccountObj.picture,
        university: newAccountObj.university,
        major: newAccountObj.major,
        studentCode: newAccountObj.studentCode,
        academicYear: newAccountObj.academicYear,
        provider: 'google',
        isLoggedIn: true,
        linkedGoogle: true,
        canNotify: true,
        canBookmark: true,
        createdAt: new Date().toISOString()
      };

      try {
        const backendResult = await syncGoogleLoginWithBackend(profile);
        if (backendResult.success && backendResult.student) {
          Object.assign(profile, backendResult.student);
        }
      } catch (err) {
        console.warn('Backend sync note:', err);
      }

      saveData(AUTH_STORAGE_KEY, profile);
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {}
      localStorage.setItem('timi_current_active_user_id', profile.id || '');

      playSuccessSound();
      onSelectAccount(profile);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể đăng nhập tài khoản');
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove an account from the saved device list
  const handleRemoveAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    const updated = removeGoogleAccountFromList(email);
    setAccounts(updated);
    if (updated.length === 0) {
      setIsAddingNew(true);
    }
    playChime('sweet');
  };

  // Trigger browser Google OAuth popup with account selection prompt
  const handleTriggerGooglePopup = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage('');
      const profile = await signInWithGoogle();
      
      // Save to known accounts list
      const savedAcc: SavedGoogleAccount = {
        id: profile.id || `google_${Date.now()}`,
        email: profile.email || 'student@gmail.com',
        name: profile.name,
        picture: profile.picture,
        university: profile.university,
        major: profile.major,
        studentCode: profile.studentCode,
        academicYear: profile.academicYear,
        lastUsed: 'Vừa đăng nhập'
      };
      saveGoogleAccountToList(savedAcc);
      saveData(AUTH_STORAGE_KEY, profile);
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {}
      localStorage.setItem('timi_current_active_user_id', profile.id || '');

      playSuccessSound();
      onSelectAccount(profile);
      onClose();
    } catch (err: any) {
      console.warn('Popup attempt result:', err);
      setIsAddingNew(true);
      setErrorMessage('Không thể mở popup trình duyệt (do hạn chế môi trường iframe). Vui lòng nhập địa chỉ Gmail sinh viên của bạn để đăng nhập ngay.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Google Identity Style */}
        <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            {/* Official Google G Logo */}
            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                {currentEmail ? 'Chuyển Đổi Tài Khoản Google' : 'Đăng Nhập Bằng Google'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Chọn hoặc nhập tài khoản của bạn để vào <span className="font-semibold text-[#FF85A1]">TIMI</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition cursor-pointer -mt-1 -mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {!isAddingNew && accounts.length > 0 ? (
            <>
              {/* Account Chooser List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Danh sách tài khoản Google ({accounts.length})
                  </label>
                  <span className="text-[11px] text-gray-400">Nhấp để đăng nhập</span>
                </div>

                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-2xs">
                  {accounts.map((acc) => {
                    const isCurrent = currentEmail && acc.email.toLowerCase() === currentEmail.toLowerCase();
                    const initials = getInitialsFromName(acc.name);

                    return (
                      <div
                        key={acc.email}
                        onClick={() => !isProcessing && handleChooseAccount(acc)}
                        className={`p-3.5 flex items-center justify-between gap-3 hover:bg-blue-50/60 transition cursor-pointer group ${
                          isCurrent ? 'bg-pink-50/50 border-l-4 border-[#FF85A1]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                          {/* Real Photo or Initials */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF85A1] to-[#FFAAA6] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs overflow-hidden border border-white">
                            {acc.picture ? (
                              <img src={acc.picture} alt={acc.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>

                          <div className="overflow-hidden space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition">
                                {acc.name}
                              </h4>
                              {isCurrent && (
                                <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> Đang dùng
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate">
                              {acc.email}
                            </p>
                            {(acc.university || acc.studentCode) && (
                              <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                                <span>🎓 {acc.university || 'Sinh viên'}</span>
                                {acc.studentCode && <span>• MSSV: {acc.studentCode}</span>}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleRemoveAccount(e, acc.email)}
                            title="Xóa tài khoản này khỏi máy"
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer opacity-70 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="text-gray-300 group-hover:text-blue-500 transition pl-1">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Another Google Account Button */}
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#FF85A1] hover:bg-[#FFF5F7] text-gray-700 hover:text-[#D81B60] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <UserPlus className="w-4 h-4 text-[#FF85A1]" />
                <span>➕ Đăng nhập bằng tài khoản Google khác</span>
              </button>

              {/* Or Trigger Native Google Web Popup */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleTriggerGooglePopup}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                  <span>Mở cửa sổ chọn tài khoản Google (OAuth Popup)</span>
                </button>
              </div>
            </>
          ) : (
            /* Form to Enter Student Google Account */
            <form onSubmit={handleSubmitNewAccount} className="space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#FF85A1]" />
                  <span>Nhập Thông Tin Tài Khoản Google / Gmail</span>
                </h4>
                {accounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-xs text-blue-600 hover:underline cursor-pointer font-medium"
                  >
                    ← Xem danh sách
                  </button>
                )}
              </div>

              {/* Quick Preset Samples to test with 1-click */}
              <div className="p-2.5 rounded-xl bg-[#FFF8FA] border border-[#FFCCD5] space-y-1.5">
                <span className="text-[10px] font-bold text-[#8C6D7C] block uppercase tracking-wider">
                  💡 Điền nhanh mẫu sinh viên (hoặc tự nhập tài khoản thật của bạn):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill({
                      name: 'Nguyễn Hoàng Nam',
                      email: 'hoangnam.student@gmail.com',
                      university: 'ĐH Bách Khoa',
                      major: 'Khoa học Máy tính',
                      studentCode: '2211099'
                    })}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[#FFCCD5] text-[#7D2E49] hover:bg-[#FFE4E8] transition font-medium cursor-pointer"
                  >
                    👤 Nam (BK - 2211099)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill({
                      name: 'Trần Mai Anh',
                      email: 'maianh.ueh@gmail.com',
                      university: 'ĐH Kinh Tế',
                      major: 'Marketing',
                      studentCode: '2311450'
                    })}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[#FFCCD5] text-[#7D2E49] hover:bg-[#FFE4E8] transition font-medium cursor-pointer"
                  >
                    👤 Mai Anh (UEH - 2311450)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill({
                      name: 'Lê Quốc Bảo',
                      email: 'quocbao.it@gmail.com',
                      university: 'ĐH Khoa Học Tự Nhiên',
                      major: 'Trí Tuệ Nhân Tạo',
                      studentCode: '2212780'
                    })}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[#FFCCD5] text-[#7D2E49] hover:bg-[#FFE4E8] transition font-medium cursor-pointer"
                  >
                    👤 Quốc Bảo (KHTN - 2212780)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Địa chỉ Gmail / Google Workspace của bạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ví dụ: tensinhvien@gmail.com hoặc sv@hcmus.edu.vn"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Họ và tên sinh viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ví dụ: Nguyễn Hoàng Nam"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Trường Đại học / Cao đẳng
                  </label>
                  <input
                    type="text"
                    value={newUniversity}
                    onChange={(e) => setNewUniversity(e.target.value)}
                    placeholder="ĐH Bách Khoa, Sư Phạm Kỹ Thuật..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Chuyên ngành học
                  </label>
                  <input
                    type="text"
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    placeholder="Công nghệ thông tin, Thiết kế..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Mã số sinh viên (MSSV)
                  </label>
                  <input
                    type="text"
                    value={newStudentCode}
                    onChange={(e) => setNewStudentCode(e.target.value)}
                    placeholder="ví dụ: 20231234"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    Khóa / Năm học
                  </label>
                  <input
                    type="text"
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    placeholder="ví dụ: K2023 - Năm 2"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  URL ảnh đại diện Google (Tùy chọn)
                </label>
                <input
                  type="url"
                  value={newPhotoURL}
                  onChange={(e) => setNewPhotoURL(e.target.value)}
                  placeholder="https://lh3.googleusercontent.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  Nếu để trống, TIMI sẽ tự tạo avatar theo chữ cái đầu tên của bạn.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {accounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Đang kết nối...' : 'Đăng Nhập Ngay'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Google Privacy Note */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-500 leading-normal flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600 inline flex-shrink-0" />
            <span>Mỗi tài khoản Google sở hữu không gian thời gian biểu và hồ sơ sinh viên riêng biệt.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
