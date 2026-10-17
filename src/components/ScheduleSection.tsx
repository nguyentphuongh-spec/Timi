import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Bell, 
  Bookmark, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  AlertCircle,
  Volume2,
  CalendarCheck,
  Tag
} from 'lucide-react';
import { ScheduleItem, Appointment, UserSettings, SoundPreset } from '../types';
import { playChime, playAlarmMelody, SOUND_CATALOG } from '../utils/audio';

interface ScheduleSectionProps {
  schedule: ScheduleItem[];
  appointments: Appointment[];
  settings: UserSettings;
  onAddScheduleItem: (item: Partial<ScheduleItem>) => void;
  onDeleteScheduleItem: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onAddAppointment: (apt: Partial<Appointment>) => void;
  onDeleteAppointment: (id: string) => void;
  onToggleAppointment: (id: string) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  schedule,
  appointments,
  settings,
  onAddScheduleItem,
  onDeleteScheduleItem,
  onToggleBookmark,
  onAddAppointment,
  onDeleteAppointment,
  onToggleAppointment
}) => {
  const [activeDay, setActiveDay] = useState<number>(1); // 1 = Thứ 2
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);

  // Form states for schedule
  const [schTitle, setSchTitle] = useState('');
  const [schCategory, setSchCategory] = useState<'study' | 'work' | 'personal'>('study');
  const [schStart, setSchStart] = useState('08:00');
  const [schEnd, setSchEnd] = useState('10:30');
  const [schLocation, setSchLocation] = useState('');
  const [schSticker, setSchSticker] = useState('books');
  const [schAlertBefore, setSchAlertBefore] = useState<number>(30);
  const [schSound, setSchSound] = useState<SoundPreset>('sweet');

  // Form states for appointment (Mốc thời gian / lịch hẹn)
  const [aptTitle, setAptTitle] = useState('');
  const [aptDate, setAptDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [aptTime, setAptTime] = useState('14:30');
  const [aptLocation, setAptLocation] = useState('');
  const [aptAlert, setAptAlert] = useState<20 | 30 | 15>(30);
  const [aptNote, setAptNote] = useState('');
  const [aptCategory, setAptCategory] = useState<'study' | 'work' | 'personal'>('study');

  const daysOfWeek = [
    { num: 1, label: 'Thứ 2' },
    { num: 2, label: 'Thứ 3' },
    { num: 3, label: 'Thứ 4' },
    { num: 4, label: 'Thứ 5' },
    { num: 5, label: 'Thứ 6' },
    { num: 6, label: 'Thứ 7' },
    { num: 0, label: 'Chủ Nhật' },
  ];

  const currentDaySchedule = schedule.filter(s => s.dayOfWeek === activeDay);

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schTitle.trim()) return;

    onAddScheduleItem({
      dayOfWeek: activeDay,
      startTime: schStart,
      endTime: schEnd,
      title: schTitle.trim(),
      category: schCategory,
      location: schLocation.trim(),
      sticker: schSticker,
      alertBefore: schAlertBefore,
      reminderSound: schSound,
      isBookmarked: true
    });

    playChime(schSound);
    setSchTitle('');
    setSchLocation('');
    setIsAddingSchedule(false);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptTitle.trim()) return;

    onAddAppointment({
      title: aptTitle.trim(),
      date: aptDate,
      time: aptTime,
      location: aptLocation.trim(),
      alertMinutesBefore: aptAlert,
      note: aptNote.trim(),
      category: aptCategory,
      completed: false
    });

    playChime('sweet');
    setAptTitle('');
    setAptLocation('');
    setAptNote('');
    setIsAddingAppointment(false);
  };

  const getStickerEmoji = (sticker?: string) => {
    switch (sticker) {
      case 'books': return '📚';
      case 'boba': return '🧋';
      case 'coffee': return '☕';
      case 'laptop': return '💻';
      case 'star': return '⭐';
      case 'sparkle': return '✨';
      default: return '🌸';
    }
  };

  const upcomingAppointment = appointments.find(a => !a.completed);

  return (
    <div className="space-y-6">
      {/* 20 - 30 Minutes Alert Reminder Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FFF0F3] via-[#FFE4E8] to-[#FFF5F7] border-2 border-[#FFCCD5] shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#D81B60] flex items-center justify-center text-2xl shadow-xs animate-pulse">
            ⏰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FF85A1] text-white">
                BÁO TRƯỚC 20 - 30 PHÚT
              </span>
              <span className="text-xs text-[#7D2E49] font-medium hidden sm:inline">
                Chuẩn bị kịp thời & đúng giờ
              </span>
            </div>
            {upcomingAppointment ? (
              <>
                <p className="text-sm font-bold text-[#4A3B43] mt-0.5">
                  Lịch hẹn tiếp theo: <strong>{upcomingAppointment.title}</strong> ({upcomingAppointment.time})
                </p>
                <p className="text-xs text-[#8C6D7C]">
                  {upcomingAppointment.location ? `📍 ${upcomingAppointment.location} • ` : ''}Đã đặt báo trước {upcomingAppointment.alertMinutesBefore} phút để chuẩn bị chu đáo
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-[#4A3B43] mt-0.5">
                  Lịch hẹn tiếp theo: <strong>Chưa có lịch hẹn nào sắp tới</strong>
                </p>
                <p className="text-xs text-[#8C6D7C]">
                  Bấm nút "+" tại mục "Lịch Hẹn & Mốc Thời Gian" để tự đặt lịch hẹn và nhận chuông báo trước 20 - 30 phút!
                </p>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            playAlarmMelody(1);
          }}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#FF85A1] text-[#D81B60] hover:bg-[#FFF0F3] font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
        >
          <Volume2 className="w-4 h-4 text-[#FF85A1]" /> Thử Chuông Nhắc 30p
        </button>
      </div>

      {/* Main Grid: 2 Columns (Lập Thời Gian Biểu & Lịch Hẹn / Mốc Thời Gian) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): THỜI GIAN BIỂU (Học tập, Công việc, Cá nhân) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-[#FFD1DC] shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#FFE4E8]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🗓️</span>
                <div>
                  <h3 className="text-base font-bold text-[#4A3B43]">
                    Thời Gian Biểu Sinh Viên
                  </h3>
                  <p className="text-xs text-[#8C6D7C]">
                    Phân chia: Học tập • Công việc (Làm thêm) • Hoạt động cá nhân
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddingSchedule(!isAddingSchedule)}
                className="px-3 py-1.5 rounded-xl bg-[#FF85A1] text-white text-xs font-bold hover:bg-[#FF6B8B] transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm khung giờ
              </button>
            </div>

            {/* Day of Week Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {daysOfWeek.map((day) => (
                <button
                  key={day.num}
                  onClick={() => setActiveDay(day.num)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex-1 text-center min-w-[64px] ${
                    activeDay === day.num
                      ? 'bg-gradient-to-br from-[#FF85A1] to-[#FFAAA6] text-white shadow-xs'
                      : 'bg-[#FFF5F7] text-[#7D5A68] hover:bg-[#FFE4E8]'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>

            {/* Quick Add Form for Schedule */}
            {isAddingSchedule && (
              <form onSubmit={handleSaveSchedule} className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FFCCD5] space-y-3 animate-fadeIn">
                <h4 className="text-xs font-bold text-[#7D2E49] uppercase">
                  Thêm tiết học / ca làm cho {daysOfWeek.find(d => d.num === activeDay)?.label}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={schTitle}
                      onChange={(e) => setSchTitle(e.target.value)}
                      placeholder="Tên môn học / Ca làm thêm / Hoạt động..."
                      className="w-full px-3 py-2 rounded-xl border border-[#FFCCD5] bg-white text-xs focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                    />
                  </div>
                  <div>
                    <select
                      value={schCategory}
                      onChange={(e) => setSchCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#FFCCD5] bg-white text-xs text-[#4A3B43]"
                    >
                      <option value="study">📚 Học tập</option>
                      <option value="work">💼 Công việc</option>
                      <option value="personal">🌸 Cá nhân</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[#8C6D7C] block mb-0.5">Bắt đầu</label>
                    <input
                      type="time"
                      value={schStart}
                      onChange={(e) => setSchStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#FFCCD5] bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8C6D7C] block mb-0.5">Kết thúc</label>
                    <input
                      type="time"
                      value={schEnd}
                      onChange={(e) => setSchEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#FFCCD5] bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8C6D7C] block mb-0.5">Sticker</label>
                    <select
                      value={schSticker}
                      onChange={(e) => setSchSticker(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#FFCCD5] bg-white text-xs"
                    >
                      <option value="books">📚 Sách vở</option>
                      <option value="boba">🧋 Trà sữa</option>
                      <option value="laptop">💻 Laptop</option>
                      <option value="coffee">☕ Cà phê</option>
                      <option value="star">⭐ Ngôi sao</option>
                      <option value="sparkle">✨ Lấp lánh</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8C6D7C] block mb-0.5">Báo trước</label>
                    <select
                      value={schAlertBefore}
                      onChange={(e) => setSchAlertBefore(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#FFCCD5] bg-white text-xs"
                    >
                      <option value={30}>Trước 30p</option>
                      <option value={20}>Trước 20p</option>
                      <option value={15}>Trước 15p</option>
                      <option value={0}>Đúng giờ</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-[#8C6D7C] block mb-0.5">Tiếng chuông báo</label>
                    <select
                      value={schSound}
                      onChange={(e) => {
                        const val = e.target.value as SoundPreset;
                        setSchSound(val);
                        playChime(val);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#FFCCD5] bg-white text-xs text-[#4A3B43] font-bold"
                    >
                      {SOUND_CATALOG.map((snd) => (
                        <option key={snd.id} value={snd.id}>
                          {snd.icon} {snd.name} ({snd.categoryLabel})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => playChime(schSound)}
                    className="mt-4 px-2.5 py-1.5 rounded-lg bg-[#FFF0F3] border border-[#FFCCD5] text-[#D81B60] text-xs font-bold hover:bg-[#FFE4E8] transition flex items-center gap-1 cursor-pointer"
                    title="Nghe thử tiếng chuông đã chọn"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Thử
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={schLocation}
                    onChange={(e) => setSchLocation(e.target.value)}
                    placeholder="Địa điểm (Phòng B204, Google Meet, Tiệm trà...)"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#FFCCD5] bg-white text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingSchedule(false)}
                    className="px-3 py-1 text-xs text-[#8C6D7C]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#FF85A1] text-white text-xs font-bold"
                  >
                    Lưu khung giờ
                  </button>
                </div>
              </form>
            )}

            {/* Schedule Timeline Slots for Active Day */}
            <div className="space-y-3">
              {currentDaySchedule.length === 0 ? (
                <div className="text-center py-10 bg-[#FFFDFE] rounded-2xl border border-dashed border-[#FFCCD5]">
                  <p className="text-2xl mb-1">🎀</p>
                  <p className="text-xs text-[#8C6D7C]">Chưa có lịch trình cho ngày này</p>
                  <button
                    onClick={() => setIsAddingSchedule(true)}
                    className="mt-2 text-xs font-bold text-[#FF85A1] hover:underline"
                  >
                    + Thêm lịch học hoặc lịch làm thêm
                  </button>
                </div>
              ) : (
                currentDaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      item.category === 'study'
                        ? 'bg-[#F4F9FF] border-[#BBDEFB]'
                        : item.category === 'work'
                        ? 'bg-[#FFF8F0] border-[#FFE0B2]'
                        : 'bg-[#FCF8FF] border-[#E1BEE7]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
                        {getStickerEmoji(item.sticker)}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#4A3B43]">{item.title}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              item.category === 'study'
                                ? 'bg-[#E3F2FD] text-[#0D47A1]'
                                : item.category === 'work'
                                ? 'bg-[#FFF3E0] text-[#E65100]'
                                : 'bg-[#F3E5F5] text-[#6A1B9A]'
                            }`}
                          >
                            {item.category === 'study' ? 'Học tập' : item.category === 'work' ? 'Công việc' : 'Cá nhân'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#8C6D7C] mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-[#4A3B43]">
                            <Clock className="w-3 h-3 text-[#FF85A1]" />
                            {item.startTime} - {item.endTime}
                          </span>
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#FF85A1]" />
                              {item.location}
                            </span>
                          )}
                          {item.alertBefore > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-[#C2185B] bg-white px-1.5 py-0.5 rounded-md border border-[#FFCCD5]">
                              <Bell className="w-2.5 h-2.5" /> Báo trước {item.alertBefore}p
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleBookmark(item.id)}
                        className={`p-1.5 rounded-lg transition ${
                          item.isBookmarked
                            ? 'text-[#FF85A1] hover:text-[#C2185B]'
                            : 'text-[#B0BEC5] hover:text-[#78909C]'
                        }`}
                        title="Đánh dấu thời gian biểu"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => onDeleteScheduleItem(item.id)}
                        className="p-1.5 text-[#CFD8DC] hover:text-red-400 transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): TẠO MỐC THỜI GIAN / LỊCH HẸN & BÁO TRƯỚC 20-30 PHÚT */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-[#FFE082] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#FFF8E1]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏰</span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#E65100]">
                    Lịch Hẹn & Mốc Thời Gian
                  </h3>
                  <p className="text-[11px] text-[#8C6D7C]">Báo trước 20 - 30 phút chuẩn bị</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddingAppointment(!isAddingAppointment)}
                className="w-7 h-7 rounded-full bg-[#FFF8E1] text-[#E65100] hover:bg-[#FFE082] border border-[#FFD54F] flex items-center justify-center transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Appointment Form */}
            {isAddingAppointment && (
              <form onSubmit={handleSaveAppointment} className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#FFE082] space-y-2.5 animate-fadeIn">
                <h4 className="text-xs font-bold text-[#E65100]">Tạo Mốc Thời Gian Mới</h4>
                <input
                  type="text"
                  required
                  value={aptTitle}
                  onChange={(e) => setAptTitle(e.target.value)}
                  placeholder="Tiêu đề cuộc hẹn / Phỏng vấn / Gặp nhóm..."
                  className="w-full px-3 py-1.5 rounded-xl border border-[#FFE082] text-xs focus:ring-2 focus:ring-[#FFA000] focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-[#FFE082] text-xs"
                  />
                  <input
                    type="time"
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-[#FFE082] text-xs"
                  />
                </div>

                <input
                  type="text"
                  value={aptLocation}
                  onChange={(e) => setAptLocation(e.target.value)}
                  placeholder="Địa điểm gặp mặt..."
                  className="w-full px-3 py-1.5 rounded-xl border border-[#FFE082] text-xs"
                />

                <div>
                  <label className="text-[10px] font-bold text-[#E65100] block mb-1">
                    Báo trước để kịp chuẩn bị:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[20, 30, 15].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setAptAlert(mins as any)}
                        className={`py-1 text-xs font-bold rounded-lg border transition ${
                          aptAlert === mins
                            ? 'bg-[#FFA000] text-white border-[#FFA000]'
                            : 'bg-white text-[#8C6D7C] border-[#FFE082]'
                        }`}
                      >
                        Trước {mins}p
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingAppointment(false)}
                    className="px-2.5 py-1 text-xs text-[#8C6D7C]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 rounded-xl bg-[#FFA000] text-white text-xs font-bold"
                  >
                    Tạo lịch hẹn
                  </button>
                </div>
              </form>
            )}

            {/* List of Appointments */}
            <div className="space-y-2.5">
              {appointments.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setIsAddingAppointment(true)}
                  className="w-full py-8 px-4 rounded-2xl border-2 border-dashed border-[#FFE082] bg-[#FFFDF7] text-center hover:bg-[#FFF9E6] transition cursor-pointer"
                >
                  <span className="text-2xl block mb-1">⏰</span>
                  <p className="text-xs font-bold text-[#E65100]">Chưa có lịch hẹn nào</p>
                  <p className="text-[11px] text-[#8C6D7C] mt-0.5">
                    Bấm vào đây hoặc nút "+" bên trên để tự đặt lịch hẹn và nhận chuông báo trước 20 - 30 phút!
                  </p>
                </button>
              ) : (
                appointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-3 rounded-2xl border transition ${
                    apt.completed
                      ? 'bg-[#FAFAFA] border-[#E0E0E0] opacity-60'
                      : 'bg-[#FFFDF7] border-[#FFE082] hover:border-[#FFA000]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#E65100] bg-[#FFF3E0] px-1.5 py-0.2 rounded-md">
                          ⏰ -{apt.alertMinutesBefore}p
                        </span>
                        <h4 className={`text-xs font-bold ${apt.completed ? 'line-through text-[#8C6D7C]' : 'text-[#4A3B43]'}`}>
                          {apt.title}
                        </h4>
                      </div>

                      <p className="text-[11px] text-[#8C6D7C] mt-1 flex items-center gap-2">
                        <span>📅 {apt.date}</span>
                        <span>🕒 {apt.time}</span>
                      </p>
                      {apt.location && (
                        <p className="text-[11px] text-[#6D5A64] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-[#FFA000]" /> {apt.location}
                        </p>
                      )}
                      {apt.note && (
                        <p className="text-[10px] text-[#8C6D7C] italic mt-1 line-clamp-2">
                          "{apt.note}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onToggleAppointment(apt.id)}
                        className="p-1 hover:scale-110 transition"
                      >
                        {apt.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-[#FFA000]" />
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteAppointment(apt.id)}
                        className="p-1 text-[#CFD8DC] hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
