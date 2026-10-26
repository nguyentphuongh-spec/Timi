import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  User, 
  Palette, 
  Type, 
  Bell, 
  Bookmark, 
  Volume2, 
  Sparkles,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  RotateCcw,
  CheckCircle2,
  Check
} from 'lucide-react';
import { UserProfile, UserSettings } from '../types';
import { playChime, playSuccessSound, SOUND_CATALOG } from '../utils/audio';
import { signInWithGoogle, signOutGoogle, resetSession, getInitialsFromName } from '../utils/firebase';
import { updateBackendStudentProfile } from '../utils/studentBackend';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';

interface SettingsAndAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onUpdateProfile: (profile: UserProfile | null) => void;
  onResetData?: () => void;
  onExportData?: () => void;
  onImportData?: (jsonData: string) => boolean;
  initialTab?: 'appearance' | 'profile' | 'notifications' | 'data';
}

export const SettingsAndAccountModal: React.FC<SettingsAndAccountModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  settings,
  onUpdateSettings,
  onUpdateProfile,
  onResetData,
  onExportData,
  onImportData,
  initialTab = 'appearance'
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'profile' | 'notifications' | 'data'>(initialTab);
  const [soundCategoryTab, setSoundCategoryTab] = useState<'all' | 'gentle' | 'cute' | 'simple' | 'powerful'>('all');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isChooserOpen, setIsChooserOpen] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [uniInput, setUniInput] = useState(userProfile.university || '');
  const [majorInput, setMajorInput] = useState(userProfile.major || '');
  const [studentCodeInput, setStudentCodeInput] = useState(userProfile.studentCode || '');
  const [academicYearInput, setAcademicYearInput] = useState(userProfile.academicYear || '');
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [isSavingBackend, setIsSavingBackend] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if userProfile changes
  useEffect(() => {
    setUniInput(userProfile.university || '');
    setMajorInput(userProfile.major || '');
    setStudentCodeInput(userProfile.studentCode || '');
    setAcademicYearInput(userProfile.academicYear || '');
  }, [userProfile.university, userProfile.major, userProfile.studentCode, userProfile.academicYear]);

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBackend(true);

    const updatedProfile: UserProfile = {
      ...userProfile,
      university: uniInput.trim(),
      major: majorInput.trim(),
      studentCode: studentCodeInput.trim(),
      academicYear: academicYearInput.trim()
    };
    onUpdateProfile(updatedProfile);

    const uid = userProfile.id || 'guest';
    localStorage.setItem(`university_${uid}`, uniInput.trim());
    localStorage.setItem(`major_${uid}`, majorInput.trim());
    localStorage.setItem(`code_${uid}`, studentCodeInput.trim());
    localStorage.setItem(`year_${uid}`, academicYearInput.trim());

    // Sync to backend Express server
    try {
      await updateBackendStudentProfile({
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        university: uniInput.trim(),
        major: majorInput.trim(),
        studentCode: studentCodeInput.trim(),
        academicYear: academicYearInput.trim()
      });
    } catch (err) {
      console.warn('Backend update note:', err);
    } finally {
      setIsSavingBackend(false);
      setIsEditingSchool(false);
      playSuccessSound();
    }
  };

  if (!isOpen) return null;

  // Real-time update handler for theme/font/sound/sticker
  const handleSelectFontSize = (size: 'sm' | 'md' | 'lg') => {
    onUpdateSettings({ fontSize: size });
    playChime('sweet');
  };

  const handleSelectTheme = (theme: 'sakura' | 'mint' | 'lavender' | 'peach') => {
    onUpdateSettings({ theme });
    playChime('sweet');
  };

  const handleSelectSticker = (decor: any) => {
    onUpdateSettings({ timetableDecor: decor });
    playChime('sweet');
  };

  const handleSelectSound = (soundId: any) => {
    onUpdateSettings({ soundPreset: soundId });
    playChime(soundId);
  };

  // Google Sign-in Handler: Open Google Account Chooser
  const handleGoogleLogin = () => {
    setIsChooserOpen(true);
  };

  const handleAccountChosen = (profile: UserProfile) => {
    onUpdateProfile(profile);
    setIsChooserOpen(false);
    setActiveTab('profile');
    setIsEditingSchool(false);
  };

  // Google Sign-out Handler
  const handleGoogleLogout = async () => {
    try {
      await signOutGoogle(userProfile);
      onUpdateProfile(null);
      playChime('sweet');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Reset Session Handler
  const handleResetSession = () => {
    resetSession();
    if (onResetData) onResetData();
    onUpdateProfile(null);
    playChime('sweet');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && onImportData) {
        const success = onImportData(content);
        if (success) {
          playSuccessSound();
          alert('Khôi phục dữ liệu từ tệp thành công!');
        } else {
          alert('Tệp dữ liệu không hợp lệ hoặc bị lỗi định dạng.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isLoggedIn = !!(userProfile?.isLoggedIn || userProfile?.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-[#FFD1DC] flex flex-col overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#FFE4E8] bg-gradient-to-r from-[#FFF5F7] to-[#FFF0F3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#4A3B43]">
                Cài Đặt & Hồ Sơ Sinh Viên
              </h3>
              <p className="text-xs text-[#8C6D7C]">
                Tùy chỉnh thời gian thực bảng màu Pastel, cỡ chữ & Đăng nhập Google
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#7D2E49] hover:bg-[#FFE4E8] flex items-center justify-center transition border border-[#FFCCD5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center px-4 pt-3 pb-2 border-b border-[#FFE4E8] bg-[#FFFDFE] gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-[#FF85A1] text-white shadow-2xs'
                : 'bg-[#FFF0F3] text-[#7D2E49] hover:bg-[#FFE4E8]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Giao Diện & Âm Thanh
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#FF85A1] text-white shadow-2xs'
                : 'bg-[#FFF0F3] text-[#7D2E49] hover:bg-[#FFE4E8]'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Hồ Sơ Sinh Viên
            {isLoggedIn && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-[#FF85A1] text-white shadow-2xs'
                : 'bg-[#FFF0F3] text-[#7D2E49] hover:bg-[#FFE4E8]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Quyền & Thông Báo
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'data'
                ? 'bg-[#FF85A1] text-white shadow-2xs'
                : 'bg-[#FFF0F3] text-[#7D2E49] hover:bg-[#FFE4E8]'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Dữ Liệu
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* TAB 1: GIAO DIỆN & ÂM THANH (CẬP NHẬT THỜI GIAN THỰC) */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Cỡ chữ */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#7D2E49] uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-[#FF85A1]" /> Cỡ Chữ Hiển Thị
                  </label>
                  <span className="text-[11px] font-bold text-[#D81B60] bg-[#FFE4E8] px-2 py-0.5 rounded-md">
                    {settings.fontSize === 'sm' ? 'Nhỏ 14px' : settings.fontSize === 'lg' ? 'Lớn 18px' : 'Vừa 16px'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sm', label: 'Nhỏ (14px)', desc: 'Gọn gàng' },
                    { id: 'md', label: 'Vừa (16px)', desc: 'Chuẩn sinh viên' },
                    { id: 'lg', label: 'Lớn (18px)', desc: 'Dễ đọc' }
                  ].map((size) => {
                    const isSelected = settings.fontSize === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => handleSelectFontSize(size.id as any)}
                        className={`p-2.5 rounded-2xl border text-center transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#FFF0F3] border-[#FF85A1] ring-2 ring-[#FF85A1] shadow-xs'
                            : 'bg-[#FFFDFE] border-[#FFE4E8] hover:border-[#FFCCD5]'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] bg-[#FF85A1] text-white px-1.5 py-0.2 rounded-full font-bold">
                            Đang dùng
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#4A3B43] block mt-1">{size.label}</span>
                        <span className="text-[10px] text-[#8C6D7C]">{size.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bảng màu Pastel */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#7D2E49] uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#FF85A1]" /> Bảng Màu Chủ Đạo Pastel
                  </label>
                  <span className="text-[11px] font-bold text-[#D81B60] bg-[#FFE4E8] px-2 py-0.5 rounded-md">
                    Áp dụng tức thì
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'sakura', label: '🌸 Hoa Anh Đào', bg: 'bg-[#FFF0F3]', border: 'border-[#FFCCD5]' },
                    { id: 'mint', label: '🌿 Bạc Hà Dịu Mát', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]' },
                    { id: 'lavender', label: '💜 Oải Hương Mộng Mơ', bg: 'bg-[#FAF5FF]', border: 'border-[#E9D5FF]' },
                    { id: 'peach', label: '🍑 Cam Đào Nắng Ấm', bg: 'bg-[#FFF7ED]', border: 'border-[#FED7AA]' }
                  ].map((thm) => {
                    const isSelected = settings.theme === thm.id || (thm.id === 'peach' && settings.theme === 'sweet_peach');
                    return (
                      <button
                        key={thm.id}
                        type="button"
                        onClick={() => handleSelectTheme(thm.id as any)}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer relative ${thm.bg} ${
                          isSelected
                            ? 'ring-2 ring-[#FF85A1] border-transparent shadow-md scale-102 font-extrabold'
                            : `${thm.border} opacity-85 hover:opacity-100`
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1 right-1 text-[9px] bg-[#FF85A1] text-white px-1.5 py-0.2 rounded-full font-bold">
                            Đang dùng
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#4A3B43] block mt-1">{thm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trang trí Thời Gian Biểu */}
              <div>
                <label className="block text-xs font-bold text-[#7D2E49] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF85A1]" /> Sticker Trang Trí Thời Gian Biểu
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'mimi_cats', label: 'Mèo Mimi Đáng Yêu', icon: '🐾' },
                    { id: 'study_icons', label: 'Dụng Cụ Học Tập', icon: '🎒' },
                    { id: 'cafe_aesthetic', label: 'Quán Cà Phê Chill', icon: '🧋' },
                    { id: 'cherry_blossom', label: 'Cánh Hoa Rơi', icon: '🌸' }
                  ].map((decor) => {
                    const isSelected = settings.timetableDecor === decor.id;
                    return (
                      <button
                        key={decor.id}
                        type="button"
                        onClick={() => handleSelectSticker(decor.id)}
                        className={`p-2.5 rounded-2xl border text-center transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#FFF0F3] border-[#FF85A1] ring-2 ring-[#FF85A1] shadow-xs'
                            : 'bg-[#FFFDFE] border-[#FFE4E8] hover:border-[#FFCCD5]'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1 right-1 text-[9px] bg-[#FF85A1] text-white px-1.5 py-0.2 rounded-full font-bold">
                            Đang dùng
                          </span>
                        )}
                        <span className="text-2xl block mb-1">{decor.icon}</span>
                        <span className="text-xs font-bold text-[#4A3B43]">{decor.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tiếng Chuông Mặc Định (30 Âm Thanh) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-[#7D2E49] uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#FF85A1]" /> Tiếng Chuông & Báo Thức (30 Âm Thanh)
                  </label>
                  <span className="text-[11px] font-bold text-[#D81B60] bg-[#FFE4E8] px-2.5 py-0.5 rounded-full">
                    Đang chọn: {SOUND_CATALOG.find(s => s.id === settings.soundPreset)?.name || 'Chuông Ngọt'}
                  </span>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Tất cả (30)' },
                    { id: 'gentle', label: '🌸 Dịu Dàng (8)' },
                    { id: 'cute', label: '✨ Dễ Thương (10)' },
                    { id: 'simple', label: '🔔 Đơn Giản (8)' },
                    { id: 'powerful', label: '⚡ Mạnh Mẽ (8)' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSoundCategoryTab(cat.id as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        soundCategoryTab === cat.id
                          ? 'bg-[#FF85A1] text-white shadow-2xs'
                          : 'bg-white text-[#7D2E49] border border-[#FFCCD5] hover:bg-[#FFF0F3]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Sounds grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-[#FFFDFE] rounded-2xl border border-[#FFCCD5]">
                  {SOUND_CATALOG.filter(s => soundCategoryTab === 'all' || s.category === soundCategoryTab).map((snd) => {
                    const isSelected = settings.soundPreset === snd.id;

                    return (
                      <button
                        key={snd.id}
                        type="button"
                        onClick={() => handleSelectSound(snd.id)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFF0F3] border-[#FF85A1] ring-2 ring-[#FF85A1]'
                            : 'bg-white border-[#FFE4E8] hover:border-[#FFCCD5]'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-xl flex-shrink-0">{snd.icon}</span>
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-[#4A3B43] block truncate">{snd.name}</span>
                            <span className="text-[10px] text-[#8C6D7C] line-clamp-1">{snd.description}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                          isSelected ? 'bg-[#FF85A1] text-white' : 'bg-[#FFF5F7] text-[#D81B60]'
                        }`}>
                          {isSelected ? 'Đang dùng' : 'Nghe thử'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HỒ SƠ SINH VIÊN - LIÊN KẾT GOOGLE AUTH & FIREBASE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {isLoggedIn ? (
                /* Giao diện sau khi đăng nhập thành công */
                <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FFF0F3] via-white to-[#FFE8EE] border-2 border-[#FFCCD5] shadow-sm space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-[#4CAF50] bg-[#E8F5E9] px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#C8E6C9]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã Liên Kết Google Firebase
                      </span>
                      <span className="text-[11px] font-bold text-[#7D2E49] bg-[#FFF0F3] px-2 py-0.5 rounded-full border border-[#FFCCD5]">
                        💾 Backend Riêng Từng Sinh Viên
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C6D7C]">Tài khoản cá nhân</span>
                  </div>

                  <div className="flex items-start sm:items-center gap-4">
                    {/* Real Avatar from Google or Initials */}
                    <div className="w-16 h-16 rounded-2xl themed-header-logo-bg text-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0 font-black text-xl">
                      {userProfile.picture ? (
                        <img 
                          src={userProfile.picture} 
                          alt={userProfile.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span>{userProfile.avatar || getInitialsFromName(userProfile.name || 'SV')}</span>
                      )}
                    </div>

                    <div className="overflow-hidden space-y-1 flex-1">
                      <h4 className="text-base font-extrabold text-[#4A3B43] truncate">
                        {userProfile.name}
                      </h4>
                      <p className="text-xs themed-brand-text font-medium truncate">
                        {userProfile.email}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8C6D7C] pt-0.5">
                        <span className="font-semibold text-[#4A3B43]">
                          {userProfile.university ? `🎓 ${userProfile.university}` : 'Chưa cập nhật trường học'}
                        </span>
                        {userProfile.major && (
                          <span>• {userProfile.major}</span>
                        )}
                        {userProfile.studentCode && (
                          <span className="bg-[#FFF0F3] text-[#D81B60] px-1.5 py-0.2 rounded font-bold text-[10px]">
                            MSSV: {userProfile.studentCode}
                          </span>
                        )}
                        {userProfile.academicYear && (
                          <span className="text-[11px] text-[#8C6D7C]">
                            ({userProfile.academicYear})
                          </span>
                        )}
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => setIsEditingSchool(!isEditingSchool)}
                          className="text-[11px] font-bold themed-brand-text hover:underline cursor-pointer inline-flex items-center gap-1 mt-1"
                        >
                          {isEditingSchool ? '✕ Đóng biểu mẫu' : '✏️ Chỉnh sửa thông tin trường học & MSSV'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* University, Major, Student ID & Academic Year Customizer */}
                  {isEditingSchool && (
                    <form onSubmit={handleSaveSchool} className="p-4 rounded-2xl bg-white border-2 border-[#FFCCD5] space-y-3.5 animate-fadeIn shadow-xs">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-[#7D2E49] uppercase tracking-wide flex items-center gap-1.5">
                          🎓 Hồ Sơ Sinh Viên Cá Nhân (Lưu Máy Chủ Backend)
                        </h5>
                        <span className="text-[10px] text-[#8C6D7C]">Đồng bộ theo tài khoản Google</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-[#4A3B43] block mb-1">
                            Trường Đại học / Cao đẳng <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={uniInput}
                            onChange={(e) => setUniInput(e.target.value)}
                            placeholder="Ví dụ: ĐH Bách Khoa, ĐH Kinh Tế..."
                            className="w-full px-3 py-2 rounded-xl border border-[#FFCCD5] text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none bg-[#FFFDFE]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#4A3B43] block mb-1">
                            Chuyên ngành học
                          </label>
                          <input
                            type="text"
                            value={majorInput}
                            onChange={(e) => setMajorInput(e.target.value)}
                            placeholder="Ví dụ: Công nghệ thông tin, Quản trị..."
                            className="w-full px-3 py-2 rounded-xl border border-[#FFCCD5] text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none bg-[#FFFDFE]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#4A3B43] block mb-1">
                            Mã số sinh viên (MSSV)
                          </label>
                          <input
                            type="text"
                            value={studentCodeInput}
                            onChange={(e) => setStudentCodeInput(e.target.value)}
                            placeholder="Ví dụ: 21127000..."
                            className="w-full px-3 py-2 rounded-xl border border-[#FFCCD5] text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none bg-[#FFFDFE]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#4A3B43] block mb-1">
                            Khóa học / Niên khóa
                          </label>
                          <input
                            type="text"
                            value={academicYearInput}
                            onChange={(e) => setAcademicYearInput(e.target.value)}
                            placeholder="Ví dụ: K2023 - Năm 2"
                            className="w-full px-3 py-2 rounded-xl border border-[#FFCCD5] text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none bg-[#FFFDFE]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#8C6D7C]">
                          Dữ liệu sẽ được lưu riêng cho tài khoản Google của bạn
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingSchool(false)}
                            className="px-3 py-1.5 text-xs text-[#8C6D7C] hover:text-[#4A3B43] cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingBackend}
                            className="px-4 py-2 rounded-xl themed-primary-btn text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isSavingBackend ? 'Đang lưu...' : 'Lưu Thông Tin Lên Máy Chủ'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Actions: Switch Account, Sign Out and Reset */}
                  <div className="pt-2.5 border-t border-[#FFE4E8] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsChooserOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {/* Google Mini Icon */}
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                        <span>Đổi Tài Khoản Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGoogleLogout}
                        className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng Xuất</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetSession}
                      className="px-3 py-2 rounded-xl bg-gray-50 text-[#8C6D7C] border border-gray-200 hover:bg-gray-100 text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Xóa Phiên / Reset</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Giao diện khi chưa đăng nhập */
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF0F3] border-2 border-[#FFCCD5] shadow-sm text-center space-y-5 animate-fadeIn">
                  <div className="w-16 h-16 rounded-3xl bg-[#FFF0F3] border border-[#FFCCD5] mx-auto flex items-center justify-center text-3xl shadow-xs">
                    🎓
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base sm:text-lg font-bold text-[#4A3B43]">
                      Đăng Nhập Tài Khoản Sinh Viên
                    </h4>
                    <p className="text-xs text-[#8C6D7C] max-w-sm mx-auto">
                      Đăng nhập bằng tài khoản Google liên kết Firebase Auth để tự động đồng bộ thời gian biểu, thú cưng và danh sách công việc.
                    </p>
                  </div>

                  {/* Google Sign-in Button Styled in Pastel Pink */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isLoggingIn}
                      onClick={handleGoogleLogin}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 hover:shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      {/* Google G Icon */}
                      <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
                      <span>{isLoggingIn ? 'Đang kết nối Google...' : 'Đăng nhập bằng Google'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetSession}
                      className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-[#FFF5F7] border border-[#FFCCD5] text-[#7D2E49] hover:bg-[#FFE4E8] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Xóa Phiên / Reset</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-[#A68A98] pt-1">
                    Bảo mật bằng Firebase Auth v9+ với Google Identity Provider.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUYỀN ĐÁNH DẤU VÀ NHẬN THÔNG BÁO */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FFCCD5] space-y-3">
                <h4 className="text-xs font-bold text-[#7D2E49] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF85A1]" />
                  Quyền Hạn Thời Gian Biểu & Chuông Báo
                </h4>
                <p className="text-xs text-[#8C6D7C]">
                  Cài đặt quyền hạn cho phép ghim bookmark và nhận thông báo trước 20 - 30 phút theo yêu cầu.
                </p>

                {/* 1. Quyền đánh dấu thời gian biểu */}
                <div className="p-3 bg-white rounded-xl border border-[#FFE4E8] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-[#FF85A1]" />
                    <div>
                      <p className="text-xs font-bold text-[#4A3B43]">Quyền Đánh Dấu Thời Gian Biểu</p>
                      <p className="text-[10px] text-[#8C6D7C]">Cho phép ghim bookmark các tiết học và ca làm việc ưu tiên</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowScheduleBookmark}
                      onChange={(e) => onUpdateSettings({ allowScheduleBookmark: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#E0E0E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#FFAAA6] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF85A1]"></div>
                  </label>
                </div>

                {/* 2. Quyền nhận thông báo */}
                <div className="p-3 bg-white rounded-xl border border-[#FFE4E8] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-[#FF85A1]" />
                    <div>
                      <p className="text-xs font-bold text-[#4A3B43]">Quyền Nhận Cảnh Báo Chuông Báo</p>
                      <p className="text-[10px] text-[#8C6D7C]">Nhận cảnh báo âm thanh và pop-up trước 20 - 30 phút chuẩn bị</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowScheduleAlerts}
                      onChange={(e) => onUpdateSettings({ allowScheduleAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#E0E0E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#FFAAA6] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF85A1]"></div>
                  </label>
                </div>

                {/* 3. Âm thanh thông báo bật/tắt */}
                <div className="p-3 bg-white rounded-xl border border-[#FFE4E8] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-[#FF85A1]" />
                    <div>
                      <p className="text-xs font-bold text-[#4A3B43]">Bật Âm Thanh Báo Thức & Chuông</p>
                      <p className="text-[10px] text-[#8C6D7C]">Phát tiếng chuông đã chọn khi đến giờ hẹn hoặc báo thức</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#E0E0E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#FFAAA6] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF85A1]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAO LƯU & DỮ LIỆU */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FFCCD5] space-y-4">
                <h4 className="text-xs font-bold text-[#7D2E49] uppercase tracking-wider flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#FF85A1]" />
                  Sao Lưu & Quản Lý Dữ Liệu Cá Nhân
                </h4>
                <p className="text-xs text-[#8C6D7C]">
                  Toàn bộ dữ liệu của bạn thuộc quyền sở hữu của bạn. Bạn có thể xuất bản sao lưu JSON để chuyển sang máy tính khác hoặc khôi phục bất cứ lúc nào.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Export */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onExportData) onExportData();
                      playSuccessSound();
                    }}
                    className="p-3 rounded-2xl bg-white border border-[#FFCCD5] hover:border-[#FF85A1] hover:bg-[#FFF5F7] transition text-left flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FFE4E8] flex items-center justify-center text-[#D81B60]">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#4A3B43]">Xuất Dữ Liệu JSON</p>
                      <p className="text-[10px] text-[#8C6D7C]">Tải tệp sao lưu về thiết bị</p>
                    </div>
                  </button>

                  {/* Import */}
                  <label className="p-3 rounded-2xl bg-white border border-[#FFCCD5] hover:border-[#FF85A1] hover:bg-[#FFF5F7] transition text-left flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] flex items-center justify-center text-[#0284C7]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#4A3B43]">Khôi Phục Dữ Liệu</p>
                      <p className="text-[10px] text-[#8C6D7C]">Nạp tệp JSON đã sao lưu</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Reset Data */}
                <div className="pt-3 border-t border-[#FFE4E8]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Xóa Trắng Dữ Liệu
                      </p>
                      <p className="text-[10px] text-[#8C6D7C]">
                        Thiết lập lại danh sách công việc thành trạng thái ban đầu trống hoàn toàn
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onResetData) onResetData();
                        playSuccessSound();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition cursor-pointer"
                    >
                      Xóa Dữ Liệu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Account Chooser Modal */}
      <GoogleAccountChooserModal
        isOpen={isChooserOpen}
        onClose={() => setIsChooserOpen(false)}
        currentEmail={userProfile.email}
        onSelectAccount={handleAccountChosen}
      />
    </div>
  );
};
