import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Bell, 
  Plus, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Check, 
  AlertCircle,
  Sparkles,
  Music,
  Play,
  Square,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { AlarmItem, SoundPreset } from '../types';
import { playAlarmMelody, stopAlarmMelody, playChime, SOUND_CATALOG } from '../utils/audio';

interface AlarmAndAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarms: AlarmItem[];
  onAddAlarm: (alarm: Partial<AlarmItem>) => void;
  onDeleteAlarm: (id: string) => void;
  onToggleAlarm: (id: string) => void;
}

export const AlarmAndAlertsModal: React.FC<AlarmAndAlertsModalProps> = ({
  isOpen,
  onClose,
  alarms,
  onAddAlarm,
  onDeleteAlarm,
  onToggleAlarm
}) => {
  const [modalTab, setModalTab] = useState<'alarms' | 'library'>('alarms');
  const [isAdding, setIsAdding] = useState(false);
  const [time, setTime] = useState('06:30');
  const [label, setLabel] = useState('');
  const [selectedSound, setSelectedSound] = useState<SoundPreset>('sweet');
  const [soundCategoryFilter, setSoundCategoryFilter] = useState<'all' | 'gentle' | 'cute' | 'simple' | 'powerful'>('all');
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);
  const [activePreviewSound, setActivePreviewSound] = useState<SoundPreset | null>(null);

  if (!isOpen) return null;

  const handlePreviewSound = (preset: SoundPreset) => {
    if (activePreviewSound === preset) {
      stopAlarmMelody();
      setActivePreviewSound(null);
    } else {
      stopAlarmMelody();
      setActivePreviewSound(preset);
      playChime(preset);
      setTimeout(() => {
        setActivePreviewSound((prev) => (prev === preset ? null : prev));
      }, 1500);
    }
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return;

    onAddAlarm({
      time,
      label: label.trim() || 'Báo thức học tập & làm việc',
      days: [1, 2, 3, 4, 5],
      enabled: true,
      soundType: selectedSound,
      snoozeMinutes
    });

    playChime(selectedSound);
    setLabel('');
    setIsAdding(false);
  };

  const filteredSounds = SOUND_CATALOG.filter((s) => {
    if (soundCategoryFilter === 'all') return true;
    return s.category === soundCategoryFilter;
  });

  const getSoundInfo = (preset?: SoundPreset) => {
    return SOUND_CATALOG.find((s) => s.id === preset) || SOUND_CATALOG[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-[#FFD1DC] flex flex-col overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#FFE4E8] bg-gradient-to-r from-[#FFF5F7] via-white to-[#FFF0F3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF85A1] to-[#FFAAA6] text-white flex items-center justify-center text-xl shadow-xs">
              ⏰
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#4A3B43]">
                Báo Thức & Kho 30 Tiếng Chuông Đa Dạng
              </h3>
              <p className="text-xs text-[#8C6D7C]">
                Từ đơn giản, mạnh mẽ đến dễ thương và dịu dàng cho sinh viên
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAlarmMelody();
              setActivePreviewSound(null);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white text-[#7D2E49] hover:bg-[#FFE4E8] flex items-center justify-center transition border border-[#FFCCD5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Top Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-[#FFE4E8] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-[#FFF0F3] rounded-2xl border border-[#FFCCD5]">
            <button
              onClick={() => setModalTab('alarms')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modalTab === 'alarms'
                  ? 'bg-white text-[#D81B60] shadow-xs'
                  : 'text-[#8C6D7C] hover:text-[#4A3B43]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Báo Thức Của Tôi ({alarms.length})</span>
            </button>
            <button
              onClick={() => setModalTab('library')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                modalTab === 'library'
                  ? 'bg-white text-[#D81B60] shadow-xs'
                  : 'text-[#8C6D7C] hover:text-[#4A3B43]'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Thư Viện 30 Tiếng Chuông</span>
              <span className="px-1.5 py-0.2 bg-[#FF85A1] text-white text-[9px] font-black rounded-full">
                MỚI
              </span>
            </button>
          </div>

          {modalTab === 'alarms' && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Đóng tạo mới' : 'Thêm báo thức'}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: ALARMS LIST & QUICK CREATE FORM */}
          {modalTab === 'alarms' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Form Add Alarm */}
              {isAdding && (
                <form onSubmit={handleCreateAlarm} className="p-4 sm:p-5 rounded-3xl bg-[#FFF8FA] border-2 border-[#FF85A1] space-y-4 shadow-sm animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-[#FFE4E8]">
                    <h4 className="text-xs font-black text-[#D81B60] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FF85A1]" /> Thiết Lập Báo Thức Mới
                    </h4>
                    <span className="text-[11px] text-[#8C6D7C]">Chọn giờ & tiếng chuông yêu thích</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#7D2E49] block mb-1">Giờ reo chuông:</label>
                      <input
                        type="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#FFCCD5] bg-white text-lg font-black text-[#4A3B43] focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#7D2E49] block mb-1">Báo lại (Snooze):</label>
                      <select
                        value={snoozeMinutes}
                        onChange={(e) => setSnoozeMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#FFCCD5] bg-white text-xs font-bold text-[#4A3B43] focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                      >
                        <option value={3}>3 phút (Dậy gấp)</option>
                        <option value={5}>5 phút (Tiêu chuẩn)</option>
                        <option value={10}>10 phút</option>
                        <option value={15}>15 phút</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#7D2E49] block mb-1">Nhãn / Tên ghi chú báo thức:</label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="VD: Dậy sớm đi học ca 1 (7h), Chuẩn bị đồ án..."
                      className="w-full px-3 py-2 rounded-xl border border-[#FFCCD5] bg-white text-xs font-bold text-[#4A3B43] focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
                    />
                  </div>

                  {/* Sound Picker Section */}
                  <div className="space-y-2 pt-2 border-t border-[#FFE4E8]">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-[11px] font-bold text-[#7D2E49] flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-[#FF85A1]" /> Chọn Tiếng Chuông Reo:
                      </label>
                      <span className="text-[11px] font-bold text-[#D81B60] bg-[#FFE4E8] px-2 py-0.5 rounded-full">
                        Đang chọn: {getSoundInfo(selectedSound).icon} {getSoundInfo(selectedSound).name}
                      </span>
                    </div>

                    {/* Sound Category Filter Tabs */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { id: 'all', label: 'Tất cả (30)' },
                        { id: 'gentle', label: '🌸 Dịu Dàng' },
                        { id: 'cute', label: '✨ Dễ Thương' },
                        { id: 'simple', label: '🔔 Đơn Giản' },
                        { id: 'powerful', label: '⚡ Mạnh Mẽ' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSoundCategoryFilter(cat.id as any)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                            soundCategoryFilter === cat.id
                              ? 'bg-[#FF85A1] text-white shadow-2xs'
                              : 'bg-white text-[#7D2E49] border border-[#FFCCD5] hover:bg-[#FFF0F3]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Sounds Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-white rounded-2xl border border-[#FFCCD5]">
                      {filteredSounds.map((snd) => {
                        const isSelected = selectedSound === snd.id;
                        const isPlaying = activePreviewSound === snd.id;

                        return (
                          <div
                            key={snd.id}
                            onClick={() => setSelectedSound(snd.id)}
                            className={`p-2 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#FFF0F3] border-[#FF85A1] ring-1 ring-[#FF85A1]'
                                : 'bg-[#FAFAFA] border-gray-200 hover:border-[#FFCCD5]'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-xl flex-shrink-0">{snd.icon}</span>
                              <div className="overflow-hidden">
                                <p className="text-[11px] font-bold text-[#4A3B43] truncate">{snd.name}</p>
                                <span className="text-[9px] text-[#8C6D7C]">{snd.categoryLabel}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewSound(snd.id);
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 flex-shrink-0 cursor-pointer ${
                                isPlaying
                                  ? 'bg-[#FF85A1] text-white animate-pulse'
                                  : 'bg-white border border-[#FFCCD5] text-[#D81B60] hover:bg-[#FFF0F3]'
                              }`}
                              title="Bấm để nghe thử tiếng chuông này"
                            >
                              {isPlaying ? <Square className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
                              <span>{isPlaying ? 'Dừng' : 'Thử'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#FFE4E8]">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#8C6D7C] hover:bg-gray-100 transition cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white text-xs font-black shadow-xs hover:opacity-95 transition cursor-pointer"
                    >
                      Lưu Báo Thức Này
                    </button>
                  </div>
                </form>
              )}

              {/* Alarms List */}
              <div className="space-y-2.5">
                {alarms.length === 0 ? (
                  <div className="py-12 text-center bg-[#FFFDFE] rounded-3xl border border-dashed border-[#FFCCD5] p-6 space-y-2">
                    <div className="text-3xl">⏰</div>
                    <h5 className="text-sm font-bold text-[#4A3B43]">Chưa có báo thức nào được tạo</h5>
                    <p className="text-xs text-[#8C6D7C] max-w-sm mx-auto">
                      Hãy tạo báo thức đầu tiên để thức dậy sảng khoái và không trễ giờ học ca sớm!
                    </p>
                    <button
                      onClick={() => setIsAdding(true)}
                      className="mt-2 px-4 py-1.5 rounded-xl bg-[#FF85A1] text-white text-xs font-bold shadow-2xs hover:bg-[#FF6B8B] transition cursor-pointer"
                    >
                      + Tạo báo thức ngay
                    </button>
                  </div>
                ) : (
                  alarms.map((alarm) => {
                    const soundMeta = getSoundInfo(alarm.soundType);
                    const isPlaying = activePreviewSound === alarm.soundType;

                    return (
                      <div
                        key={alarm.id}
                        className={`p-3.5 sm:p-4 rounded-3xl border transition flex items-center justify-between gap-3 ${
                          alarm.enabled
                            ? 'bg-white border-[#FFCCD5] shadow-xs'
                            : 'bg-[#FAFAFA] border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl sm:text-3xl font-black text-[#4A3B43] tracking-tight">
                            {alarm.time}
                          </span>
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-[#4A3B43]">{alarm.label}</h5>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5 text-[10px]">
                              <span className="text-[#8C6D7C]">T2 - T6</span>
                              <span>•</span>
                              <span className="text-[#D81B60] font-bold flex items-center gap-1">
                                <span>{soundMeta.icon}</span>
                                <span>{soundMeta.name}</span>
                              </span>
                              <span>•</span>
                              <span className="text-[#5D4037]">Báo lại {alarm.snoozeMinutes || 5}p</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePreviewSound(alarm.soundType)}
                            className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                              isPlaying
                                ? 'bg-[#FF85A1] text-white border-[#FF85A1] animate-pulse'
                                : 'bg-[#FFF5F7] text-[#D81B60] border-[#FFCCD5] hover:bg-[#FFE4E8]'
                            }`}
                            title="Nghe thử chuông của báo thức này"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={alarm.enabled}
                              onChange={() => onToggleAlarm(alarm.id)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-[#E0E0E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#FFAAA6] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF85A1]"></div>
                          </label>

                          <button
                            onClick={() => onDeleteAlarm(alarm.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition cursor-pointer"
                            title="Xóa báo thức"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FULL SOUND LIBRARY EXPLORER (30 SOUNDS) */}
          {modalTab === 'library' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FFF5F7] via-[#FFF0F5] to-[#FFE8EE] border border-[#FFCCD5] flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#7D2E49] flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-[#FF85A1]" /> Bộ Sưu Tập 30 Tiếng Chuông Sinh Viên
                  </h4>
                  <p className="text-xs text-[#8C6D7C] mt-0.5">
                    Khám phá và nghe thử âm thanh được thiết kế tỉ mỉ bằng Web Audio API
                  </p>
                </div>
                <span className="px-3 py-1 rounded-2xl bg-white text-[#D81B60] font-black text-xs border border-[#FFCCD5] shadow-2xs">
                  30 Âm Thanh
                </span>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'Tất cả (30)' },
                  { id: 'gentle', label: '🌸 Dịu Dàng (8)' },
                  { id: 'cute', label: '✨ Dễ Thương (10)' },
                  { id: 'simple', label: '🔔 Đơn Giản (8)' },
                  { id: 'powerful', label: '⚡ Mạnh Mẽ (8)' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSoundCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      soundCategoryFilter === cat.id
                        ? 'bg-[#FF85A1] text-white shadow-2xs'
                        : 'bg-white text-[#4A3B43] border border-[#FFCCD5] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sound Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredSounds.map((snd) => {
                  const isPlaying = activePreviewSound === snd.id;

                  return (
                    <div
                      key={snd.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isPlaying
                          ? 'bg-[#FFF0F3] border-[#FF85A1] shadow-md ring-2 ring-[#FFD1DC]'
                          : 'bg-white border-[#FFE4E8] hover:border-[#FFCCD5]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <span className="text-2xl sm:text-3xl flex-shrink-0 mt-0.5">{snd.icon}</span>
                        <div className="overflow-hidden">
                          <h5 className="text-xs font-bold text-[#4A3B43] flex items-center gap-1.5">
                            <span className="truncate">{snd.name}</span>
                          </h5>
                          <p className="text-[10px] text-[#8C6D7C] line-clamp-2 mt-0.5">
                            {snd.description}
                          </p>
                          <span className="inline-block mt-1 text-[9px] font-bold text-[#D81B60] bg-[#FFF0F3] px-2 py-0.2 rounded-full border border-[#FFCCD5]">
                            {snd.categoryLabel}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePreviewSound(snd.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition shadow-2xs cursor-pointer ${
                          isPlaying
                            ? 'bg-[#FF85A1] text-white shadow-md animate-pulse'
                            : 'bg-gradient-to-r from-[#FFF5F7] to-[#FFE4E8] text-[#D81B60] border border-[#FFCCD5] hover:bg-[#FF85A1] hover:text-white'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Dừng</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Phát</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
