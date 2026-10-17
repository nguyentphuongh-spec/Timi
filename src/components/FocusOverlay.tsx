import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  CheckCircle2,
  Clock,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, VirtualPet } from '../types';
import { playSuccessSound, playChime, toggleAmbientRain } from '../utils/audio';
import { MascotAvatar } from './CuteIllustrations';

interface FocusOverlayProps {
  isOpen: boolean;
  task: Task | null;
  durationMinutes: number;
  pet?: VirtualPet;
  onCancel: () => void;
  onComplete: (task: Task | null) => void;
}

export const FocusOverlay: React.FC<FocusOverlayProps> = ({
  isOpen,
  task,
  durationMinutes,
  pet,
  onCancel,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [ambientRainOn, setAmbientRainOn] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize time when opened
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(durationMinutes * 60);
      setIsRunning(true);
      setIsConfirmingCancel(false);
      setIsFinished(false);
      playChime('sweet');
    } else {
      if (ambientRainOn) {
        toggleAmbientRain(false);
        setAmbientRainOn(false);
      }
    }
  }, [isOpen, durationMinutes]);

  // Prevent background scrolling while overlay is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = 'manipulation';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = 'manipulation';
    };
  }, [isOpen]);

  // Main countdown timer ticker
  useEffect(() => {
    if (!isOpen || isFinished) return;

    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSessionCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, isRunning, timeLeft, isFinished]);

  // When timer hits 00:00
  const handleSessionCompleted = () => {
    setIsFinished(true);
    setIsRunning(false);
    if (ambientRainOn) {
      toggleAmbientRain(false);
      setAmbientRainOn(false);
    }

    // Play celebration audio & confetti
    playSuccessSound();
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FF85A1', '#FFAAA6', '#FFD1DC', '#FFEE58', '#4CAF50']
    });

    // Notify parent to complete task, reward pet, and save to localStorage
    setTimeout(() => {
      onComplete(task);
    }, 2800);
  };

  const handleToggleRain = () => {
    const next = !ambientRainOn;
    setAmbientRainOn(next);
    toggleAmbientRain(next, 0.15);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const totalSeconds = durationMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  return (
    <div 
      className="fixed inset-0 z-[100] w-screen h-[100dvh] flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-[#FFF0F3]/98 via-[#FFF9FA]/98 to-[#FFE4E8]/98 backdrop-blur-md select-none touch-manipulation animate-fadeIn overflow-hidden"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Top Bar: Mascot Mood & Ambient Sound Control */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#FFCCD5] shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF85A1] animate-ping"></span>
          <span className="text-xs font-bold text-[#D81B60] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-[#D81B60]" />
            Chế Độ Tập Trung Pomodoro Đang Bật
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleRain}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border shadow-xs cursor-pointer ${
            ambientRainOn
              ? 'bg-[#E0F7FA] text-[#00838F] border-[#80DEEA]'
              : 'bg-white/90 text-[#8C6D7C] border-[#FFCCD5] hover:bg-[#FFE4E8]'
          }`}
          title="Tiếng mưa rơi nhẹ nhàng lofi"
        >
          {ambientRainOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{ambientRainOn ? 'Mưa Lofi (Bật)' : 'Bật tiếng mưa'}</span>
        </button>
      </div>

      {/* Center Main Stage: Huge Timer & Mascot & Task */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center my-auto py-4">
        {/* Cute Mascot Companion */}
        <div className="relative mb-3">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/90 border-2 border-[#FF85A1] shadow-lg flex items-center justify-center p-2">
            <MascotAvatar
              type={pet?.type || 'cat'}
              mood={isFinished ? 'happy' : 'focused'}
              equippedHat={pet?.equippedHat}
              size={80}
            />
          </div>
          <span className="absolute -bottom-2 bg-[#FF85A1] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {isFinished ? '🎉 Hoàn thành!' : 'Đang cùng bạn học'}
          </span>
        </div>

        {/* Focus Task Name Pill */}
        <div className="mb-4 max-w-md px-4 py-2 rounded-2xl bg-white/95 border border-[#FFCCD5] shadow-xs">
          <span className="text-[11px] font-bold text-[#8C6D7C] uppercase tracking-wider block">
            Mục tiêu đang tập trung:
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-[#4A3B43] mt-0.5 line-clamp-2">
            {task ? task.title : 'Phiên Học Tập & Làm Việc Kỷ Luật'}
          </h2>
        </div>

        {/* Large Countdown Clock */}
        <div className="relative py-2">
          <div className="text-6xl sm:text-8xl md:text-9xl font-black font-nunito tracking-tighter text-[#D81B60] drop-shadow-sm select-none">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Sleek Progress Bar */}
        <div className="w-full max-w-xs sm:max-w-sm mt-3 space-y-1.5">
          <div className="w-full h-3 bg-white/80 rounded-full border border-[#FFCCD5] overflow-hidden p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#FF85A1] to-[#FF4D79] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6D7C] px-1">
            <span>Tiến độ: {Math.round(progressPercent)}%</span>
            <span>{Math.ceil(timeLeft / 60)} phút còn lại</span>
          </div>
        </div>

        {/* Success message banner when 00:00 reached */}
        {isFinished && (
          <div className="mt-6 p-4 rounded-2xl bg-white border-2 border-[#4CAF50] text-[#2E7D32] shadow-lg animate-fade-in-scale flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-[#4CAF50] flex-shrink-0" />
            <div className="text-left">
              <p className="font-extrabold text-sm sm:text-base">Chúc Mừng Bạn Đã Hoàn Thành!</p>
              <p className="text-xs text-[#388E3C]">Tự động lưu lịch sử, tích điểm thưởng và mở khóa màn hình...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls: Emergency Stop Button */}
      <div className="w-full max-w-md mx-auto pb-4 flex flex-col items-center">
        {!isFinished && (
          <div className="w-full">
            {isConfirmingCancel ? (
              <div className="p-4 rounded-2xl bg-white border-2 border-red-300 shadow-xl space-y-3 animate-fade-in-scale text-center">
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Bạn có chắc muốn dừng khẩn cấp phiên tập trung này?
                </div>
                <p className="text-[11px] text-[#8C6D7C]">
                  Chuỗi kỷ luật sẽ bị dừng lại nếu hủy giữa chừng.
                </p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingCancel(false)}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#FF85A1] text-white text-xs font-bold hover:bg-[#FF6B8B] shadow-sm transition cursor-pointer"
                  >
                    Tiếp Tục Tập Trung
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (ambientRainOn) toggleAmbientRain(false);
                      onCancel();
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-red-50 hover:text-red-600 border border-gray-200 transition cursor-pointer"
                  >
                    Xác Nhận Dừng
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-[#FFCCD5] text-[#7D2E49] text-xs font-bold hover:bg-[#FFE4E8] transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? 'Tạm Dừng' : 'Tiếp Tục'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmingCancel(true)}
                  className="px-4 py-2.5 rounded-2xl bg-white/80 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>Hủy / Dừng Khẩn Cấp</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
