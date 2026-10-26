import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  UserCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { UserProfile } from '../types';
import { playChime, playSuccessSound } from '../utils/audio';
import { 
  signInWithGoogle, 
  signInWithSavedAccount, 
  getSavedGoogleAccounts, 
  removeGoogleAccountFromList, 
  SavedGoogleAccount,
  getInitialsFromName 
} from '../utils/firebase';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load saved Google accounts on open
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedGoogleAccounts();
      setAccounts(saved);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1-Click Re-login with a previously saved Google account
  const handleChooseSavedAccount = async (account: SavedGoogleAccount) => {
    try {
      setIsProcessing(true);
      setErrorMessage('');
      const profile = await signInWithSavedAccount(account);
      playSuccessSound();
      onSelectAccount(profile);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể đăng nhập vào tài khoản này');
    } finally {
      setIsProcessing(false);
    }
  };

  // Official Firebase Authentication with Google Provider (signInWithPopup with prompt: 'select_account')
  const handleOfficialGooglePopup = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage('');
      const profile = await signInWithGoogle(true);
      playSuccessSound();
      onSelectAccount(profile);
      onClose();
    } catch (err: any) {
      console.warn('Google Sign-in error:', err);
      if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('Trình duyệt của bạn đang chặn cửa sổ popup. Vui lòng cho phép popup để chọn tài khoản Google.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Bạn đã đóng cửa sổ đăng nhập Google. Hãy bấm nút dưới đây để thử lại.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setErrorMessage('Tên miền ứng dụng chưa được cấp quyền trong Firebase Authentication. Vui lòng kiểm tra Authorized Domains.');
      } else {
        setErrorMessage(err.message || 'Không thể kết nối đến tài khoản Google. Vui lòng thử lại.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove remembered account from device
  const handleRemoveSavedAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    const updated = removeGoogleAccountFromList(email);
    setAccounts(updated);
    playChime('sweet');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Official Google Identity */}
        <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="flex items-center gap-3">
            {/* Official Google G Logo */}
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-gray-200 flex items-center justify-center flex-shrink-0">
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
                Xác thực an toàn qua <span className="font-semibold text-blue-600">Firebase Auth</span>
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

        {/* Error message notification */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Modal Main Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* SECTION 1: Saved Accounts for 1-Click Re-login */}
          {accounts.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Tài khoản đã lưu (1-Click Đăng nhập)
                </label>
                <span className="text-[11px] text-gray-400">Chọn để vào ngay</span>
              </div>

              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-2xs">
                {accounts.map((acc) => {
                  const isCurrent = currentEmail && acc.email.toLowerCase() === currentEmail.toLowerCase();
                  const initials = getInitialsFromName(acc.name);

                  return (
                    <div
                      key={acc.email}
                      onClick={() => !isProcessing && handleChooseSavedAccount(acc)}
                      className={`p-3.5 flex items-center justify-between gap-3 hover:bg-blue-50/70 transition cursor-pointer group ${
                        isCurrent ? 'bg-pink-50/60 border-l-4 border-[#FF85A1]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        {/* Real Google Avatar or Initials */}
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

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSavedAccount(e, acc.email)}
                          title="Xóa tài khoản này khỏi danh sách đã lưu"
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer opacity-70 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-blue-500 group-hover:translate-x-0.5 transition pl-1">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center text-lg">
                ✨
              </div>
              <p className="text-xs font-semibold text-gray-700">
                Chưa có tài khoản nào được lưu trên thiết bị này
              </p>
              <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                Bấm nút bên dưới để đăng nhập bằng tài khoản Google. Thông tin của bạn sẽ được tự động lưu lại cho các lần đăng nhập 1-Click sau.
              </p>
            </div>
          )}

          {/* SECTION 2: Official Google Sign-In Popup Button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleOfficialGooglePopup}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-400 font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 group"
            >
              {/* Google G Logo in Button */}
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
              <span>
                {isProcessing 
                  ? 'Đang mở cửa sổ đăng nhập Google...' 
                  : accounts.length > 0 
                    ? 'Đăng nhập bằng tài khoản Google khác' 
                    : 'Đăng nhập với Google chính thức'}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span>Duy trì phiên đăng nhập tự động khi tải lại trang (F5)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
