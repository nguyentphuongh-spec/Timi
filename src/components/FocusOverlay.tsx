import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Task, VirtualPet } from '../types';
import { playSuccessSound, playChime } from '../utils/audio';

export interface FocusOverlayProps {
  isOpen: boolean;
  task: Task | null;
  mode?: 'work' | 'break' | 'long_break';
  durationMinutes: number;
  initialSeconds?: number;
  pet?: VirtualPet;
  onCancel?: () => void;
  onPauseAndExit?: (remainingSeconds: number) => void;
  onResetAndExit?: () => void;
  onComplete: (task: Task | null, mode: 'work' | 'break' | 'long_break') => void;
}

export const FocusOverlay: React.FC<FocusOverlayProps> = ({
  isOpen,
  task,
  mode = 'work',
  durationMinutes,
  initialSeconds,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(() => (initialSeconds !== undefined ? initialSeconds : durationMinutes * 60));
  const [isFinished, setIsFinished] = useState(false);

  // Screen Wake Lock API to prevent the device screen from turning off or sleeping
  const wakeLockRef = useRef<any>(null);

  // Sync initial countdown seconds when opened
  useEffect(() => {
    if (isOpen) {
      const startSecs = initialSeconds !== undefined && initialSeconds > 0 ? initialSeconds : durationMinutes * 60;
      setTimeLeft(startSecs);
      setIsFinished(false);
      playChime('sweet');
    }
  }, [isOpen, durationMinutes, initialSeconds, mode]);

  // Request & maintain Screen Wake Lock
  useEffect(() => {
    if (!isOpen || isFinished) return;

    let isSubscribed = true;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && (navigator as any).wakeLock?.request) {
        try {
          if (!wakeLockRef.current) {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            wakeLockRef.current.addEventListener('release', () => {
              wakeLockRef.current = null;
            });
          }
        } catch (err) {
          // Handled silently if Wake Lock not permitted by browser
        }
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOpen && !isFinished) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isSubscribed = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        try {
          wakeLockRef.current.release();
        } catch (e) {}
        wakeLockRef.current = null;
      }
    };
  }, [isOpen, isFinished]);

  // Lock background scroll and user interactions completely
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

  // Prevent keyboard shortcuts (Esc, Space, etc.) from interrupting strict focus mode
  useEffect(() => {
    if (!isOpen || isFinished) return;
    const blockKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', blockKeys, true);
    return () => window.removeEventListener('keydown', blockKeys, true);
  }, [isOpen, isFinished]);

  // Unstoppable countdown ticker: ticks every 1000ms until reaching 0
  useEffect(() => {
    if (!isOpen || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isFinished]);

  // When timer hits 00:00 -> celebration & automatically close overlay
  const handleFinishSession = () => {
    setIsFinished(true);

    // Audio & Confetti burst
    playSuccessSound();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FF85A1', '#FFAAA6', '#FFD1DC', '#FFEE58', '#4CAF50', '#64B5F6']
    });

    // Automatically exit the white overlay after 2 seconds and restore normal UI
    setTimeout(() => {
      onComplete(task, mode);
    }, 2200);
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
      className="fixed inset-0 z-[999999] w-screen h-[100dvh] bg-white flex flex-col items-center justify-center p-6 select-none overflow-hidden pointer-events-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        background: '#ffffff',
        userSelect: 'none',
        touchAction: 'none'
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Strict White Overlay Content: ONLY Countdown & Minimal Progress */}
      <div className="flex flex-col items-center justify-center text-center max-w-lg w-full pointer-events-none select-none">
        
        {/* Subtle Objective Heading */}
        <div className="mb-4 space-y-1">
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
            {mode === 'work' ? 'Chế Độ Tập Trung Kỷ Luật' : mode === 'break' ? 'Chế Độ Nghỉ Ngắn' : 'Chế Độ Nghỉ Dài'}
          </p>
          <h2 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-1 max-w-md">
            {task ? task.title : 'Tập trung tuyệt đối vào công việc'}
          </h2>
        </div>

        {/* Large Crisp Digital Countdown Clock */}
        <div className="py-2">
          <span className="text-7xl sm:text-9xl md:text-[10rem] font-black font-mono tracking-tighter text-gray-900 leading-none drop-shadow-xs">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Minimal Thin Progress Bar */}
        <div className="w-64 sm:w-80 mt-6 space-y-2">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden p-0">
            <div 
              className="h-full bg-gray-900 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] font-semibold text-gray-400 tracking-wider">
            {Math.round(progressPercent)}% • Màn hình tự động mở lại khi hết giờ (00:00)
          </p>
        </div>

        {/* Completion Message when 00:00 is reached */}
        {isFinished && (
          <div className="mt-8 px-6 py-3 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm font-bold animate-fadeIn">
            🎉 Hoàn thành thời gian tập trung! Đang đưa bạn trở lại ứng dụng...
          </div>
        )}
      </div>
    </div>
  );
};
