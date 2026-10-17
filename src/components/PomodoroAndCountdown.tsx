import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Settings2, 
  Clock, 
  CloudRain, 
  Flame, 
  Coffee 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, UserSettings, VirtualPet } from '../types';
import { playChime, playSuccessSound, toggleAmbientRain } from '../utils/audio';
import { MascotAvatar } from './CuteIllustrations';

interface PomodoroAndCountdownProps {
  tasks: Task[];
  settings: UserSettings;
  pet?: VirtualPet;
  onOpenPetModal?: () => void;
  selectedTask?: Task | null;
  onCompletePomodoroSession: (focusMinutes: number) => void;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onStartFocusOverlay?: (task: Task | null) => void;
}

export const PomodoroAndCountdown: React.FC<PomodoroAndCountdownProps> = ({
  tasks,
  settings,
  pet,
  onOpenPetModal,
  selectedTask,
  onCompletePomodoroSession,
  onUpdateSettings,
  onStartFocusOverlay,
}) => {
  // Mode: 'pomodoro_work' | 'pomodoro_break' | 'task_countdown'
  const [mode, setMode] = useState<'work' | 'break' | 'long_break'>('work');
  const [activeTaskId, setActiveTaskId] = useState<string>(selectedTask ? selectedTask.id : (tasks[0]?.id || ''));

  // Duration in minutes
  const [workDuration, setWorkDuration] = useState(settings.pomodoroWork || 25);
  const [breakDuration, setBreakDuration] = useState(settings.pomodoroBreak || 5);
  const [longBreakDuration, setLongBreakDuration] = useState(settings.pomodoroLongBreak || 15);

  // Time remaining in seconds
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(2);
  const [ambientRainOn, setAmbientRainOn] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Active task object
  const activeTask = tasks.find(t => t.id === activeTaskId);

  // Switch task if parent props change
  useEffect(() => {
    if (selectedTask) {
      setActiveTaskId(selectedTask.id);
    }
  }, [selectedTask]);

  // When work duration or break duration settings change
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'work') setTimeLeft(workDuration * 60);
      else if (mode === 'break') setTimeLeft(breakDuration * 60);
      else setTimeLeft(longBreakDuration * 60);
    }
  }, [workDuration, breakDuration, longBreakDuration, mode]);

  // Main countdown ticker
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Session finished!
      setIsRunning(false);
      playSuccessSound();

      // Confetti sparkles
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF85A1', '#FFAAA6', '#FFD1DC', '#FFEE58']
      });

      if (mode === 'work') {
        onCompletePomodoroSession(workDuration);
        const nextCycles = completedCycles + 1;
        setCompletedCycles(nextCycles);
        // If 4 cycles finished -> long break, else short break
        if (nextCycles % 4 === 0) {
          setMode('long_break');
          setTimeLeft(longBreakDuration * 60);
        } else {
          setMode('break');
          setTimeLeft(breakDuration * 60);
        }
      } else {
        // Break finished -> back to work
        setMode('work');
        setTimeLeft(workDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, workDuration, breakDuration, longBreakDuration, completedCycles, onCompletePomodoroSession]);

  const toggleTimer = () => {
    if (!isRunning) {
      playChime('sweet');
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(workDuration * 60);
    else if (mode === 'break') setTimeLeft(breakDuration * 60);
    else setTimeLeft(longBreakDuration * 60);
  };

  const toggleRain = () => {
    const nextState = !ambientRainOn;
    setAmbientRainOn(nextState);
    toggleAmbientRain(nextState, 0.12);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const totalSecondsForMode = (mode === 'work' ? workDuration : mode === 'break' ? breakDuration : longBreakDuration) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSecondsForMode - timeLeft) / totalSecondsForMode) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner: Pomodoro & Active Countdown */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF0F3] border-2 border-[#FFCCD5] shadow-sm flex flex-col items-center text-center relative overflow-hidden">
        {/* Background Sparkles Decors */}
        <div className="absolute top-4 left-6 text-xl opacity-40 select-none animate-pulse">✨</div>
        <div className="absolute bottom-4 right-8 text-xl opacity-40 select-none animate-pulse">🌸</div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center p-1 bg-[#FFF0F3] rounded-2xl border border-[#FFCCD5] mb-6">
          <button
            onClick={() => {
              setIsRunning(false);
              setMode('work');
              setTimeLeft(workDuration * 60);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              mode === 'work'
                ? 'bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white shadow-xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>🎯</span>
            Tập Trung ({workDuration}p)
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setMode('break');
              setTimeLeft(breakDuration * 60);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              mode === 'break'
                ? 'bg-gradient-to-r from-[#81C784] to-[#A5D6A7] text-white shadow-xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>☕</span>
            Nghỉ Ngắn ({breakDuration}p)
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setMode('long_break');
              setTimeLeft(longBreakDuration * 60);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              mode === 'long_break'
                ? 'bg-gradient-to-r from-[#64B5F6] to-[#90CAF9] text-white shadow-xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>🌿</span>
            Nghỉ Dài ({longBreakDuration}p)
          </button>
        </div>

        {/* Selected Task for Countdown Indicator */}
        <div className="w-full max-w-md mb-4">
          <label className="text-xs font-semibold text-[#8C6D7C] mb-1.5 block">
            Công việc đang thực hiện đếm ngược:
          </label>
          <select
            value={activeTaskId}
            onChange={(e) => setActiveTaskId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#FFCCD5] text-xs sm:text-sm text-[#4A3B43] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF85A1] shadow-2xs"
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flashcardColor === 'red' ? '🔴 ' : t.flashcardColor === 'orange' ? '🟠 ' : t.flashcardColor === 'yellow' ? '🟡 ' : '⚪ '}
                {t.title} ({t.durationMinutes}p)
              </option>
            ))}
          </select>
        </div>

        {/* Big Circular Timer Display */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-3">
          {/* SVG Progress Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#FFE4E8"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={mode === 'work' ? '#FF85A1' : mode === 'break' ? '#81C784' : '#64B5F6'}
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-black text-[#4A3B43] tracking-tight">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-bold text-[#FF85A1] uppercase tracking-wider mt-1">
              {mode === 'work' ? '🔥 Đang tập trung' : mode === 'break' ? '☕ Thư giãn mắt' : '🌿 Nghỉ ngơi dài'}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#8C6D7C] mt-1.5">
              <span>Chu kỳ:</span>
              <strong className="text-[#D81B60]">#{completedCycles + 1}</strong>
            </div>
          </div>
        </div>

        {/* Controls: Play, Reset, Rain Sound, Config */}
        <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-2xl bg-white border border-[#FFCCD5] text-[#8C6D7C] hover:bg-[#FFF0F3] hover:text-[#4A3B43] flex items-center justify-center transition shadow-2xs cursor-pointer"
            title="Đặt lại thời gian"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-7 py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 transition shadow-md hover:scale-105 cursor-pointer ${
              isRunning
                ? 'bg-[#FFAAA6] text-white'
                : 'bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isRunning ? 'Tạm Dừng' : 'Bắt Đầu'}</span>
          </button>

          {/* Launch Fullscreen Focus Overlay Mode */}
          {onStartFocusOverlay && (
            <button
              onClick={() => onStartFocusOverlay(activeTask || null)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D81B60] to-[#FF85A1] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-105 transition cursor-pointer"
              title="Bật Chế Độ Khóa Màn Hình Tập Trung"
            >
              <Sparkles className="w-4 h-4" />
              <span>Bật Khóa Màn Hình (Focus Overlay)</span>
            </button>
          )}

          {/* Soothing Ambient Rain Toggle */}
          <button
            onClick={toggleRain}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition shadow-2xs cursor-pointer ${
              ambientRainOn
                ? 'bg-[#E1F5FE] border-[#4FC3F7] text-[#0288D1]'
                : 'bg-white border-[#FFCCD5] text-[#8C6D7C] hover:bg-[#FFF0F3]'
            }`}
            title={ambientRainOn ? 'Tắt tiếng mưa rơi Lofi' : 'Bật tiếng mưa rơi dịu êm'}
          >
            <CloudRain className="w-5 h-5" />
          </button>

          {/* Configure Pomodoro duration */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-12 h-12 rounded-2xl bg-white border border-[#FFCCD5] text-[#8C6D7C] hover:bg-[#FFF0F3] flex items-center justify-center transition shadow-2xs cursor-pointer"
            title="Điều chỉnh thời gian"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        {/* Adjustable time modal/drawer */}
        {showConfig && (
          <div className="mt-6 p-4 rounded-3xl bg-[#FFF9FA] border border-[#FFCCD5] w-full max-w-md animate-fadeIn text-left">
            <h4 className="text-xs font-bold text-[#7D2E49] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-[#FF85A1]" />
              Điều chỉnh thời gian làm việc & nghỉ ngơi (Phút)
            </h4>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-[#8C6D7C] block mb-1">Tập trung (p)</label>
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={workDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setWorkDuration(val);
                    onUpdateSettings({ pomodoroWork: val });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#FFCCD5] bg-white font-bold text-[#4A3B43]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#8C6D7C] block mb-1">Nghỉ ngắn (p)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={breakDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBreakDuration(val);
                    onUpdateSettings({ pomodoroBreak: val });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#FFCCD5] bg-white font-bold text-[#4A3B43]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#8C6D7C] block mb-1">Nghỉ dài (p)</label>
                <input
                  type="number"
                  min={5}
                  max={45}
                  value={longBreakDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLongBreakDuration(val);
                    onUpdateSettings({ pomodoroLongBreak: val });
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#FFCCD5] bg-white font-bold text-[#4A3B43]"
                />
              </div>
            </div>
            <p className="text-[10px] text-[#8C6D7C] mt-2 italic">
              * Mẹo sinh viên: Tỷ lệ 25/5 hoặc 50/10 giúp não bộ ghi nhớ sâu mà không bị quá tải.
            </p>
          </div>
        )}

        {/* Pet Study Companion */}
        {pet && (
          <div 
            onClick={onOpenPetModal}
            className="mt-6 p-3 sm:p-4 rounded-3xl bg-white/90 border-2 border-[#FFD1DC] flex items-center justify-between gap-3 shadow-xs hover:border-[#FF85A1] hover:shadow-md transition cursor-pointer group max-w-md w-full text-left"
            title={`Bấm để mở Thú Cưng ${pet.name}`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <MascotAvatar
                  type={pet.type}
                  mood={isRunning ? 'focused' : 'happy'}
                  equippedHat={pet.equippedHat}
                  equippedAccessory={pet.equippedAccessory}
                  size={52}
                />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-[#D81B60] group-hover:underline flex items-center gap-1.5">
                  <span>Bé {pet.name} {isRunning ? 'đang đồng hành cùng bạn tập trung! 🔥' : 'sẵn sàng vào guồng! ✨'}</span>
                </p>
                <p className="text-[11px] text-[#8C6D7C] mt-0.5">
                  {isRunning 
                    ? 'Kiên trì hoàn thành phiên để nhận thêm ⭐ Sao thưởng và EXP nhé!' 
                    : 'Bấm để đổi tên, thay trang phục hoặc nhận thưởng chuỗi ngày.'}
                </p>
              </div>
            </div>
            <span className="text-xs text-[#FF85A1] font-bold hidden sm:inline group-hover:translate-x-1 transition">
              →
            </span>
          </div>
        )}
      </div>

      {/* Countdown List for All Active Tasks */}
      <div className="p-5 rounded-3xl bg-white border border-[#FFD1DC] shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#FFE4E8]">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            <div>
              <h4 className="text-sm font-bold text-[#4A3B43]">
                Đồng Hồ Đếm Ngược Thời Gian Còn Lại
              </h4>
              <p className="text-xs text-[#8C6D7C]">
                Theo dõi thời lượng của từng công việc trong ngày
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks.filter(t => !t.completed).map((task) => (
            <div
              key={task.id}
              onClick={() => {
                setActiveTaskId(task.id);
                setWorkDuration(task.durationMinutes || 25);
                setTimeLeft((task.durationMinutes || 25) * 60);
                playChime('sweet');
              }}
              className={`p-3.5 rounded-2xl border transition cursor-pointer hover:scale-[1.02] ${
                activeTaskId === task.id
                  ? 'bg-[#FFF5F7] border-[#FF85A1] ring-2 ring-[#FFD1DC]'
                  : 'bg-white border-[#FFE4E8] hover:border-[#FFCCD5]'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-xs">
                  {task.flashcardColor === 'red' && '🔴'}
                  {task.flashcardColor === 'orange' && '🟠'}
                  {task.flashcardColor === 'yellow' && '🟡'}
                  {task.flashcardColor === 'white' && '⚪'}
                </span>
                <span className="text-xs font-bold text-[#D81B60] bg-[#FFF0F3] px-2 py-0.5 rounded-full">
                  {task.durationMinutes} phút
                </span>
              </div>
              <h5 className="text-xs font-bold text-[#4A3B43] mt-2 line-clamp-1">
                {task.title}
              </h5>
              <div className="flex items-center justify-between text-[11px] text-[#8C6D7C] mt-2 pt-1.5 border-t border-black/5">
                <span>Hạn: {task.dueTime || 'Trong ngày'}</span>
                <span className="text-[#FF85A1] font-bold">Bấm để tập trung</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
