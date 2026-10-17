import React from 'react';
import { 
  Search, 
  Flame, 
  Star, 
  Bell, 
  Settings, 
  User,
  GraduationCap
} from 'lucide-react';
import { UserProfile, VirtualPet, UserSettings } from '../types';
import { MascotAvatar } from './CuteIllustrations';
import { InfinityClockLogo } from './TimiBrandLogo';
import { playChime } from '../utils/audio';

interface NavbarProps {
  userProfile?: UserProfile;
  currentUser?: UserProfile | null;
  pet: VirtualPet;
  settings: UserSettings;
  activeView: string;
  currentTime?: Date;
  onNavigate: (view: string) => void;
  onOpenSearchAndIndex: () => void;
  onOpenPetModal: () => void;
  onOpenAlarmsModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  currentUser,
  pet,
  settings,
  activeView,
  currentTime,
  onNavigate,
  onOpenSearchAndIndex,
  onOpenPetModal,
  onOpenAlarmsModal,
  onOpenSettingsModal
}) => {
  const profile: UserProfile = userProfile || currentUser || {
    name: 'Chưa Đăng Nhập',
    university: '',
    major: '',
    avatar: 'PH',
    canNotify: true,
    canBookmark: true
  };

  const formattedTime = currentTime
    ? currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#FFCCD5] shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Official Brand Logo & Sub-tags */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            {/* Official Brand Logo: Clock combined with Infinity Loop & Arrow */}
            <InfinityClockLogo size={40} className="group-hover:scale-105 transition" />

            <div>
              {/* Brand Title: TIMI */}
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black themed-brand-text tracking-wider leading-none">
                  TIMI
                </span>
                {/* Brand Badges: Chủ Động • Tập Trung • Hiệu Quả */}
                <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full themed-badge-pill">
                  Chủ Động
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full themed-badge-pill">
                  Tập Trung
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full themed-badge-pill">
                  Hiệu Quả
                </span>
              </div>
              <p className="text-[10px] text-[#8C6D7C] leading-none font-semibold mt-0.5 hidden sm:block">
                Chủ Động • Tập Trung • Hiệu Quả
              </p>
            </div>
          </div>

          {/* Quick Search and Index Button */}
          <button
            onClick={onOpenSearchAndIndex}
            className="ml-1 sm:ml-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-[#FFF5F7] border border-[#FFCCD5] hover:bg-[#FFE4E8] text-xs font-semibold text-[#7D2E49] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#FF85A1]" />
            <span className="hidden md:inline">Mục lục</span>
          </button>
        </div>

        {/* Center: Navigation Shortcuts (Desktop) with Garden Tab */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FFF5F7] p-1 rounded-2xl border border-[#FFE4E8]">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'home'
                ? 'bg-white themed-brand-text shadow-2xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>🏠</span>
            Trang Chủ
          </button>
          <button
            onClick={() => onNavigate('schedule')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'schedule'
                ? 'bg-white themed-brand-text shadow-2xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>🗓️</span>
            Thời Gian Biểu
          </button>
          <button
            onClick={() => onNavigate('pomodoro')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'pomodoro'
                ? 'bg-white themed-brand-text shadow-2xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>⏱️</span>
            Pomodoro
          </button>
          <button
            onClick={() => onNavigate('pet_garden')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'pet_garden'
                ? 'bg-white themed-brand-text shadow-2xs font-black'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>🐾</span>
            Bé Mochi & Khu Vườn
          </button>
          <button
            onClick={() => onNavigate('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === 'completed'
                ? 'bg-white text-emerald-600 shadow-2xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>✅</span>
            Đã Xong
          </button>
        </nav>

        {/* Right: Virtual Pet Mini Widget + Alarms Bell + Student Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Virtual Pet Mini pill (Streak & Stars & Name) */}
          <button
            onClick={() => {
              playChime('sweet');
              onNavigate('pet_garden');
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#FFF0F3] to-[#FFE8EE] border border-[#FFCCD5] hover:border-[#FF85A1] flex items-center gap-2 transition group shadow-2xs cursor-pointer"
            title={`Bé ${pet.name} (Cấp ${pet.level} • ${pet.coins} Xu) - Bấm để vào Khu Vườn`}
          >
            <div className="relative -my-1">
              <MascotAvatar
                type={pet.type}
                mood="happy"
                equippedHat={pet.equippedHat}
                size={34}
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="hidden lg:inline text-[11px] themed-brand-text max-w-[80px] truncate font-extrabold mr-0.5">
                {pet.name}
              </span>
              <span className="text-[#E65100] flex items-center gap-0.5" title={`${pet.coins} Xu`}>
                <span className="text-xs">🪙</span>
                <span>{pet.coins || 0}</span>
              </span>
            </div>
          </button>

          {/* Alarms & Alerts Bell */}
          <button
            onClick={() => {
              playChime('sweet');
              onOpenAlarmsModal();
            }}
            className="w-9 h-9 rounded-2xl bg-[#FFF5F7] border border-[#FFCCD5] text-[#7D2E49] hover:bg-[#FFE4E8] flex items-center justify-center transition relative cursor-pointer"
            title="Báo thức & 30 tiếng chuông nhắc nhở"
          >
            <Bell className="w-4 h-4 themed-brand-text" />
            <span className="w-2 h-2 rounded-full bg-[#FF85A1] absolute top-2 right-2 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-[#FF85A1] absolute top-2 right-2"></span>
          </button>

          {/* Student Profile Pill with Real Google Avatar / Initials Fallback */}
          <button
            onClick={() => {
              playChime('sweet');
              onOpenSettingsModal();
            }}
            className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-2xl bg-white border border-[#FFCCD5] hover:border-[#FF85A1] hover:bg-[#FFF5F7] transition shadow-2xs cursor-pointer group"
            title={`${profile.name} ${profile.university ? `- ${profile.university}` : ''} (Nhấp để mở Cài đặt & Hồ sơ)`}
          >
            {/* Real Google Avatar or Name Initials */}
            <span className="w-7 h-7 rounded-xl themed-header-logo-bg text-white font-extrabold text-xs flex items-center justify-center group-hover:scale-105 transition overflow-hidden shadow-2xs">
              {profile.picture ? (
                <img src={profile.picture} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile.avatar || 'PH'}</span>
              )}
            </span>
            <div className="hidden lg:flex flex-col text-left leading-none">
              <span className="text-xs font-bold text-[#4A3B43] max-w-[85px] truncate">
                {profile.name}
              </span>
              <span className="text-[9px] text-[#8C6D7C] max-w-[85px] truncate mt-0.5">
                {profile.university || 'Chưa đặt trường'}
              </span>
            </div>
            <Settings className="w-3.5 h-3.5 text-[#8C6D7C] group-hover:themed-brand-text transition ml-0.5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-1.5 bg-[#FFF9FA] border-t border-[#FFE4E8] text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => onNavigate('home')}
          className={`px-2.5 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeView === 'home' ? 'themed-primary-btn font-bold shadow-2xs' : 'text-[#8C6D7C]'
          }`}
        >
          Trang Chủ
        </button>
        <button
          onClick={() => onNavigate('schedule')}
          className={`px-2.5 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeView === 'schedule' ? 'themed-primary-btn font-bold shadow-2xs' : 'text-[#8C6D7C]'
          }`}
        >
          Thời Gian Biểu
        </button>
        <button
          onClick={() => onNavigate('pomodoro')}
          className={`px-2.5 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeView === 'pomodoro' ? 'themed-primary-btn font-bold shadow-2xs' : 'text-[#8C6D7C]'
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => onNavigate('pet_garden')}
          className={`px-2.5 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeView === 'pet_garden' ? 'themed-primary-btn font-bold shadow-2xs' : 'text-[#8C6D7C]'
          }`}
        >
          🐾 Bé Mochi & Khu Vườn
        </button>
        <button
          onClick={() => onNavigate('completed')}
          className={`px-2.5 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeView === 'completed' ? 'themed-primary-btn font-bold shadow-2xs' : 'text-[#8C6D7C]'
          }`}
        >
          Đã Xong
        </button>
      </div>
    </header>
  );
};
