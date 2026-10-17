import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Bell, 
  Volume2, 
  Sparkles, 
  Trash2, 
  Filter,
  Play,
  Flame,
  FilePlus2,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, FlashcardColor } from '../types';
import { playSuccessSound, playChime } from '../utils/audio';

interface HomeSectionProps {
  tasks: Task[];
  activeTab: 'work' | 'life' | 'study';
  onTabChange: (tab: 'work' | 'life' | 'study') => void;
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (category: 'work' | 'life' | 'study') => void;
  onStartPomodoroForTask: (task: Task) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  tasks,
  activeTab,
  onTabChange,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onStartPomodoroForTask
}) => {
  const [colorFilter, setColorFilter] = useState<FlashcardColor | 'all'>('all');
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('timi_water_glasses');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      return isNaN(parsed) ? 0 : Math.max(0, Math.min(8, parsed));
    }
    return 0; // Empty / 0ml / 0 ly default state
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUpdateWater = (newCount: number) => {
    const clamped = Math.max(0, Math.min(8, newCount));
    setWaterGlasses(clamped);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('timi_water_glasses', String(clamped));
      } catch (err) {
        console.warn('Could not save water glasses:', err);
      }
    }
    playChime('sweet');
  };

  // Filter tasks based on category and optional color filter
  const categoryTasks = tasks.filter((t) => t.category === activeTab);
  const filteredTasks = categoryTasks.filter((t) => {
    if (activeTab === 'work' && colorFilter !== 'all' && t.flashcardColor !== colorFilter) return false;
    return true;
  });

  // Handle Complete Task
  const handleCheckTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x, y },
        colors: ['#FF85A1', '#FFAAA6', '#FFD1DC', '#FFEE58', '#4CAF50']
      });
      playSuccessSound();
    }
    onToggleTask(task.id);
  };

  // Handle Delete Task with immediate visual fade-out
  const handleDeleteClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(taskId);
    setTimeout(() => {
      onDeleteTask(taskId);
      setDeletingId(null);
    }, 180);
  };

  const getFlashcardStyles = (color: FlashcardColor) => {
    switch (color) {
      case 'red':
        return {
          cardBg: 'bg-gradient-to-br from-[#FFF0F2] to-[#FFEBEF]',
          border: 'border-[#FFAAA6] hover:border-[#E53935]',
          badgeBg: 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]',
          tag: '🔴 Rất quan trọng',
          accent: '#E53935'
        };
      case 'orange':
        return {
          cardBg: 'bg-gradient-to-br from-[#FFF8F0] to-[#FFF3E6]',
          border: 'border-[#FFCC80] hover:border-[#FB8C00]',
          badgeBg: 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]',
          tag: '🟠 Thường ngày (Làm thêm & Đi học)',
          accent: '#FB8C00'
        };
      case 'yellow':
        return {
          cardBg: 'bg-gradient-to-br from-[#FFFFF2] to-[#FFFDE7]',
          border: 'border-[#FFF59D] hover:border-[#FBC02D]',
          badgeBg: 'bg-[#FFFDE7] text-[#F57F17] border border-[#FFF9C4]',
          tag: '🟡 Cần hoàn thành',
          accent: '#FBC02D'
        };
      case 'white':
      default:
        return {
          cardBg: 'bg-white',
          border: 'border-[#E0E0E0] hover:border-[#9E9E9E]',
          badgeBg: 'bg-[#F5F5F5] text-[#455A64] border border-[#E0E0E0]',
          tag: '⚪ Ghi chú nhẹ',
          accent: '#78909C'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-[#FFE4E8]">
        <div className="flex items-center p-1 bg-[#FFF0F3] rounded-2xl border border-[#FFCCD5] overflow-x-auto">
          <button
            onClick={() => { onTabChange('work'); setColorFilter('all'); }}
            className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'work'
                ? 'bg-white text-[#D81B60] shadow-xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>💼</span>
            Trang Công Việc
            <span className="text-[10px] ml-1 bg-[#FFE4E8] text-[#D81B60] px-1.5 py-0.2 rounded-full">
              {tasks.filter(t => t.category === 'work').length}
            </span>
          </button>
          <button
            onClick={() => { onTabChange('life'); setColorFilter('all'); }}
            className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'life'
                ? 'bg-white text-[#E65100] shadow-xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>🌸</span>
            Trang Đời Sống
            <span className="text-[10px] ml-1 bg-[#FFE0B2] text-[#E65100] px-1.5 py-0.2 rounded-full">
              {tasks.filter(t => t.category === 'life').length}
            </span>
          </button>
          <button
            onClick={() => { onTabChange('study'); setColorFilter('all'); }}
            className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'study'
                ? 'bg-white text-[#0277BD] shadow-xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>📚</span>
            Trang Học Tập
            <span className="text-[10px] ml-1 bg-[#E1F5FE] text-[#0277BD] px-1.5 py-0.2 rounded-full">
              {tasks.filter(t => t.category === 'study').length}
            </span>
          </button>
        </div>

        {/* Add button */}
        <button
          onClick={() => onAddTask(activeTab)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Flashcard {activeTab === 'work' ? 'Công Việc' : activeTab === 'life' ? 'Đời Sống' : 'Học Tập'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TRANG CÔNG VIỆC (WORK) */}
      {/* ========================================================================= */}
      {activeTab === 'work' && (
        <div className="space-y-4">
          {/* Color filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-semibold text-[#8C6D7C] flex items-center gap-1 pr-1">
              <Filter className="w-3.5 h-3.5 text-[#FF85A1]" /> Màu:
            </span>
            <button
              onClick={() => setColorFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                colorFilter === 'all'
                  ? 'bg-[#FF85A1] text-white shadow-xs'
                  : 'bg-white text-[#8C6D7C] border border-[#FFCCD5] hover:bg-[#FFF0F3]'
              }`}
            >
              Tất cả ({categoryTasks.length})
            </button>
            <button
              onClick={() => setColorFilter('red')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                colorFilter === 'red'
                  ? 'bg-[#E53935] text-white shadow-xs'
                  : 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#E53935]"></span>
              Đỏ: Rất quan trọng
            </button>
            <button
              onClick={() => setColorFilter('orange')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                colorFilter === 'orange'
                  ? 'bg-[#FB8C00] text-white shadow-xs'
                  : 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FB8C00]"></span>
              Cam: Thường ngày
            </button>
            <button
              onClick={() => setColorFilter('yellow')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                colorFilter === 'yellow'
                  ? 'bg-[#FBC02D] text-white shadow-xs'
                  : 'bg-[#FFFDE7] text-[#F57F17] border border-[#FFF9C4]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FBC02D]"></span>
              Vàng: Cần làm
            </button>
            <button
              onClick={() => setColorFilter('white')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                colorFilter === 'white'
                  ? 'bg-[#546E7A] text-white shadow-xs'
                  : 'bg-white text-[#455A64] border border-[#CFD8DC]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#B0BEC5]"></span>
              Trắng: Ghi chú
            </button>
          </div>

          {/* Flashcards Grid (Responsive: 1 col on mobile, 2 cols on tablet/desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.length === 0 ? (
              /* User-requested clean Empty State */
              <div 
                onClick={() => onAddTask('work')}
                className="col-span-full py-12 px-6 text-center bg-white rounded-3xl border-2 border-dashed border-[#FFCCD5] hover:border-[#FF85A1] transition cursor-pointer group shadow-2xs"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FFF0F3] text-2xl mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  📝
                </div>
                <h4 className="text-base font-bold text-[#4A3B43]">
                  Chưa có công việc nào. Bấm vào đây để thêm công việc mới!
                </h4>
                <p className="text-xs text-[#8C6D7C] mt-1 max-w-sm mx-auto">
                  Bạn có thể tự do thêm công việc, cài đặt thời gian, chọn màu flashcard và bấm Pomodoro để tập trung.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTask('work');
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#FF85A1] text-white text-xs font-bold shadow-md hover:bg-[#FF6B8B] transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm Công Việc Đầu Tiên
                </button>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const styles = getFlashcardStyles(task.flashcardColor);
                const isFading = deletingId === task.id;

                return (
                  <div
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className={`relative p-4 sm:p-5 rounded-3xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${styles.cardBg} ${styles.border} ${
                      task.completed ? 'opacity-70' : ''
                    } ${isFading ? 'animate-fade-out' : ''}`}
                  >
                    {/* Top status bar */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${styles.badgeBg}`}>
                        {styles.tag}
                      </span>

                      <div className="flex items-center gap-1 sm:gap-2">
                        {task.soundAlert && (
                          <button
                            type="button"
                            title="Có âm thanh nhắc nhở"
                            onClick={(e) => {
                              e.stopPropagation();
                              playChime('sweet');
                            }}
                            className="text-[#FF85A1] hover:scale-110 transition p-1.5 cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Explicit Working Trash / Delete Button */}
                        <button
                          type="button"
                          title="Xóa công việc này"
                          onClick={(e) => handleDeleteClick(task.id, e)}
                          className="text-[#9E9E9E] hover:text-red-500 hover:scale-115 transition p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Complete Toggle */}
                        <button
                          type="button"
                          onClick={(e) => handleCheckTask(task, e)}
                          className="hover:scale-110 transition p-1 cursor-pointer"
                          title={task.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-[#4CAF50] fill-[#E8F5E9]" />
                          ) : (
                            <Circle className="w-6 h-6 text-[#FF85A1] hover:text-[#E91E63]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title & Note */}
                    <h3 className={`text-base font-bold mb-1 ${task.completed ? 'line-through text-[#8C6D7C]' : 'text-[#4A3B43]'}`}>
                      {task.title}
                    </h3>
                    {task.note && (
                      <p className="text-xs text-[#6D5A64] line-clamp-2 mb-3">
                        {task.note}
                      </p>
                    )}

                    {/* Bottom details: Time, countdown, pomodoro quick launch */}
                    <div className="pt-2 border-t border-[#0000000d] flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2 sm:gap-3 text-[#7D5A68] font-medium flex-wrap">
                        {task.dueTime && (
                          <span className="flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-lg border border-black/5">
                            <Clock className="w-3 h-3 text-[#FF85A1]" />
                            {task.dueTime}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="text-xs">⏱️</span>
                          {task.durationMinutes} phút
                        </span>
                        {task.notifyBeforeMinutes > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-[#C2185B] bg-[#FFF0F3] px-1.5 py-0.5 rounded-md">
                            <Bell className="w-2.5 h-2.5" /> -{task.notifyBeforeMinutes}p
                          </span>
                        )}
                      </div>

                      {/* Pomodoro Focus Button for this task */}
                      {!task.completed && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartPomodoroForTask(task);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white text-[#C2185B] font-bold text-xs border border-[#FFCCD5] hover:bg-[#FFE4E8] hover:border-[#FF85A1] transition flex items-center gap-1.5 shadow-2xs cursor-pointer touch-manipulation"
                        >
                          <Play className="w-3.5 h-3.5 fill-[#C2185B]" /> Bật Pomodoro
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TRANG ĐỜI SỐNG (LIFE) */}
      {/* ========================================================================= */}
      {activeTab === 'life' && (
        <div className="space-y-6">
          {/* Quick Water Tracker Widget */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#E0F7FA] via-[#E1F5FE] to-[#FFF0F5] border border-[#B2EBF2] shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#80DEEA] flex items-center justify-center text-2xl shadow-xs">
                💧
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#006064]">
                  Nhắc nhở uống đủ 2L nước mỗi ngày cho sinh viên
                </h4>
                <p className="text-xs text-[#00838F]">
                  Đã uống: <strong className="text-sm">{waterGlasses * 250}ml</strong> / 2.000ml ({waterGlasses}/8 ly)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-[#B2EBF2]">
                <button
                  type="button"
                  onClick={() => handleUpdateWater(waterGlasses - 1)}
                  disabled={waterGlasses === 0}
                  className="w-7 h-7 rounded-lg bg-white border border-[#B2EBF2] text-[#00838F] hover:bg-[#E0F7FA] font-bold text-xs flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                  title="Giảm 1 ly (250ml)"
                >
                  -
                </button>
                <div className="flex items-center gap-1 px-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => {
                    const isFull = g <= waterGlasses;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleUpdateWater(waterGlasses === g ? g - 1 : g)}
                        className={`w-7 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                          isFull
                            ? 'bg-[#00BCD4] text-white shadow-xs scale-105'
                            : 'bg-white text-[#80DEEA] border border-[#B2EBF2] hover:bg-[#E0F7FA]'
                        }`}
                        title={`Ly ${g} (250ml)`}
                      >
                        🥤
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateWater(waterGlasses + 1)}
                  disabled={waterGlasses >= 8}
                  className="w-7 h-7 rounded-lg bg-[#00BCD4] text-white hover:bg-[#00ACC1] font-bold text-xs flex items-center justify-center transition cursor-pointer disabled:opacity-40"
                  title="Thêm 1 ly (+250ml)"
                >
                  +
                </button>
              </div>

              {waterGlasses > 0 && (
                <button
                  type="button"
                  onClick={() => handleUpdateWater(0)}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#00838F] hover:text-[#006064] hover:underline cursor-pointer"
                >
                  Đặt lại 0ml
                </button>
              )}
            </div>
          </div>

          {/* 3 Categories: Ăn uống, Giải trí, Vận động */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Ăn uống */}
            <div className="p-4 rounded-3xl bg-[#FFF9F5] border border-[#FFE0B2] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#FFE0B2] flex items-center justify-center text-lg">
                    🥗
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#E65100]">Ăn Uống</h4>
                    <p className="text-[11px] text-[#FB8C00]">Bữa chính & Dinh dưỡng</p>
                  </div>
                </div>
                <button
                  onClick={() => onAddTask('life')}
                  className="w-7 h-7 rounded-full bg-white text-[#E65100] border border-[#FFCC80] hover:bg-[#FFE0B2] flex items-center justify-center text-xs cursor-pointer"
                  title="Thêm mục ăn uống"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {tasks.filter((t) => t.category === 'life' && t.subCategory === 'life_dining').length === 0 ? (
                  <button
                    onClick={() => onAddTask('life')}
                    className="w-full py-6 px-3 border border-dashed border-[#FFE0B2] rounded-2xl text-center text-xs text-[#FB8C00] hover:bg-white transition cursor-pointer"
                  >
                    Chưa có mục ăn uống nào.<br />Bấm vào đây để thêm!
                  </button>
                ) : (
                  tasks
                    .filter((t) => t.category === 'life' && t.subCategory === 'life_dining')
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`p-3 rounded-2xl bg-white border border-[#FFE4C4] hover:border-[#FB8C00] transition cursor-pointer flex items-start justify-between gap-2 shadow-2xs ${
                          task.completed ? 'opacity-60 line-through' : ''
                        } ${deletingId === task.id ? 'animate-fade-out' : ''}`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#4A3B43] truncate">{task.title}</p>
                          {task.note && <p className="text-[11px] text-[#8C6D7C] line-clamp-1">{task.note}</p>}
                          {task.dueTime && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#E65100] mt-1">
                              <Clock className="w-2.5 h-2.5" /> {task.dueTime}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            title="Xóa thẻ này"
                            onClick={(e) => handleDeleteClick(task.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleCheckTask(task, e)}
                            className="p-1 hover:scale-110 transition cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#FFB74D]" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Column 2: Giải trí */}
            <div className="p-4 rounded-3xl bg-[#FDF7FF] border border-[#E1BEE7] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#E1BEE7] flex items-center justify-center text-lg">
                    🎮
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#6A1B9A]">Giải Trí</h4>
                    <p className="text-[11px] text-[#8E24AA]">Thư giãn, phim ảnh</p>
                  </div>
                </div>
                <button
                  onClick={() => onAddTask('life')}
                  className="w-7 h-7 rounded-full bg-white text-[#6A1B9A] border border-[#CE93D8] hover:bg-[#E1BEE7] flex items-center justify-center text-xs cursor-pointer"
                  title="Thêm mục giải trí"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {tasks.filter((t) => t.category === 'life' && t.subCategory === 'life_entertainment').length === 0 ? (
                  <button
                    onClick={() => onAddTask('life')}
                    className="w-full py-6 px-3 border border-dashed border-[#E1BEE7] rounded-2xl text-center text-xs text-[#8E24AA] hover:bg-white transition cursor-pointer"
                  >
                    Chưa có mục giải trí nào.<br />Bấm vào đây để thêm!
                  </button>
                ) : (
                  tasks
                    .filter((t) => t.category === 'life' && t.subCategory === 'life_entertainment')
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`p-3 rounded-2xl bg-white border border-[#EDE7F6] hover:border-[#AB47BC] transition cursor-pointer flex items-start justify-between gap-2 shadow-2xs ${
                          task.completed ? 'opacity-60 line-through' : ''
                        } ${deletingId === task.id ? 'animate-fade-out' : ''}`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#4A3B43] truncate">{task.title}</p>
                          {task.note && <p className="text-[11px] text-[#8C6D7C] line-clamp-1">{task.note}</p>}
                          {task.dueTime && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#8E24AA] mt-1">
                              <Clock className="w-2.5 h-2.5" /> {task.dueTime}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            title="Xóa thẻ này"
                            onClick={(e) => handleDeleteClick(task.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleCheckTask(task, e)}
                            className="p-1 hover:scale-110 transition cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#BA68C8]" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Column 3: Vận động */}
            <div className="p-4 rounded-3xl bg-[#F1F8E9] border border-[#C5E1A5] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#C5E1A5] flex items-center justify-center text-lg">
                    🏃
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#33691E]">Vận Động</h4>
                    <p className="text-[11px] text-[#558B2F]">Thể thao, đi dạo</p>
                  </div>
                </div>
                <button
                  onClick={() => onAddTask('life')}
                  className="w-7 h-7 rounded-full bg-white text-[#33691E] border border-[#AED581] hover:bg-[#C5E1A5] flex items-center justify-center text-xs cursor-pointer"
                  title="Thêm mục vận động"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {tasks.filter((t) => t.category === 'life' && t.subCategory === 'life_fitness').length === 0 ? (
                  <button
                    onClick={() => onAddTask('life')}
                    className="w-full py-6 px-3 border border-dashed border-[#C5E1A5] rounded-2xl text-center text-xs text-[#558B2F] hover:bg-white transition cursor-pointer"
                  >
                    Chưa có mục vận động nào.<br />Bấm vào đây để thêm!
                  </button>
                ) : (
                  tasks
                    .filter((t) => t.category === 'life' && t.subCategory === 'life_fitness')
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`p-3 rounded-2xl bg-white border border-[#E8F5E9] hover:border-[#7CB342] transition cursor-pointer flex items-start justify-between gap-2 shadow-2xs ${
                          task.completed ? 'opacity-60 line-through' : ''
                        } ${deletingId === task.id ? 'animate-fade-out' : ''}`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#4A3B43] truncate">{task.title}</p>
                          {task.note && <p className="text-[11px] text-[#8C6D7C] line-clamp-1">{task.note}</p>}
                          {task.dueTime && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#558B2F] mt-1">
                              <Clock className="w-2.5 h-2.5" /> {task.dueTime}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            title="Xóa thẻ này"
                            onClick={(e) => handleDeleteClick(task.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleCheckTask(task, e)}
                            className="p-1 hover:scale-110 transition cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#8BC34A]" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TRANG HỌC TẬP (STUDY) */}
      {/* ========================================================================= */}
      {activeTab === 'study' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Bài tập */}
            <div className="p-4 rounded-3xl bg-white border border-[#FFCDD2] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#FFEBEE]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#C62828] uppercase tracking-wide">Bài Tập</h4>
                    <p className="text-[10px] text-[#8C6D7C]">Tiểu luận & Deadline</p>
                  </div>
                </div>
                <button
                  onClick={() => onAddTask('study')}
                  className="w-6 h-6 rounded-full bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2] flex items-center justify-center text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {tasks.filter((t) => t.category === 'study' && t.subCategory === 'study_assignment').length === 0 ? (
                  <p className="py-4 text-center text-[11px] text-[#8C6D7C] border border-dashed border-[#FFEBEE] rounded-xl">
                    Chưa có bài tập nào
                  </p>
                ) : (
                  tasks
                    .filter((t) => t.category === 'study' && t.subCategory === 'study_assignment')
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`p-3 rounded-2xl bg-[#FFF9FA] border border-[#FFEBEE] hover:border-[#EF5350] transition cursor-pointer flex items-start justify-between gap-2 ${
                          task.completed ? 'opacity-60 line-through' : ''
                        } ${deletingId === task.id ? 'animate-fade-out' : ''}`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#4A3B43] truncate">{task.title}</p>
                          {task.note && <p className="text-[11px] text-[#8C6D7C] line-clamp-1 mt-0.5">{task.note}</p>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            title="Xóa bài tập này"
                            onClick={(e) => handleDeleteClick(task.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleCheckTask(task, e)}
                            className="p-1 hover:scale-110 transition cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#EF5350]" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* 2. Học thêm */}
            <div className="p-4 rounded-3xl bg-white border border-[#BBDEFB] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E3F2FD]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎓</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#0D47A1] uppercase tracking-wide">Học Thêm</h4>
                    <p className="text-[10px] text-[#8C6D7C]">IELTS, Tin học, Khóa học</p>
                  </div>
                </div>
                <button
                  onClick={() => onAddTask('study')}
                  className="w-6 h-6 rounded-full bg-[#E3F2FD] text-[#0D47A1] hover:bg-[#BBDEFB] flex items-center justify-center text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {tasks.filter((t) => t.category === 'study' && t.subCategory === 'study_extra').length === 0 ? (
                  <p className="py-4 text-center text-[11px] text-[#8C6D7C] border border-dashed border-[#E3F2FD] rounded-xl">
                    Chưa có mục học thêm nào
                  </p>
                ) : (
                  tasks
                    .filter((t) => t.category === 'study' && t.subCategory === 'study_extra')
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`p-3 rounded-2xl bg-[#F5F9FF] border border-[#E3F2FD] hover:border-[#42A5F5] transition cursor-pointer flex items-start justify-between gap-2 ${
                          task.completed ? 'opacity-60 line-through' : ''
                        } ${deletingId === task.id ? 'animate-fade-out' : ''}`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#4A3B43] truncate">{task.title}</p>
                          {task.note && <p className="text-[11px] text-[#8C6D7C] line-clamp-1 mt-0.5">{task.note}</p>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            title="Xóa mục này"
                            onClick={(e) => handleDeleteClick(task.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleCheckTask(task, e)}
                            className="p-1 hover:scale-110 transition cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#2196F3]" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* 3. Đọc sách */}
            <div className="p-4 rounded-3xl bg-white border border-[#FFE082] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#FFF8E1]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📖</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#E65100] uppercase tracking-wide">Đọc Sách</h4>
                    <p className="text-[10px] text-[#8C6D7C]">Mỗi ngày 20 - 30 trang</p>
                  </div>
                </div>
                <button
                  onClick={() => onAddTask('study')}
                  className="w-6 h-6 rounded-full bg-[#FFF8E1] text-[#E65100] hover:bg-[#FFE082] flex items-center justify-center text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {tasks.filter((t) => t.category === 'study' && t.subCategory === 'study_reading').length === 0 ? (
                  <p className="py-4 text-center text-[11px] text-[#8C6D7C] border border-dashed border-[#FFF8E1] rounded-xl">
                    Chưa có mục đọc sách nào
                  </p>
                ) : (
                  tasks
                    .filter((t) => t.category === 'study' && t.subCategory === 'study_reading')
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`p-3 rounded-2xl bg-[#FFFDF7] border border-[#FFF8E1] hover:border-[#FFA000] transition cursor-pointer flex items-start justify-between gap-2 ${
                          task.completed ? 'opacity-60 line-through' : ''
                        } ${deletingId === task.id ? 'animate-fade-out' : ''}`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#4A3B43] truncate">{task.title}</p>
                          {task.note && <p className="text-[11px] text-[#8C6D7C] line-clamp-1 mt-0.5">{task.note}</p>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            title="Xóa mục này"
                            onClick={(e) => handleDeleteClick(task.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleCheckTask(task, e)}
                            className="p-1 hover:scale-110 transition cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#FFA000]" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* 4. Kỹ năng mềm */}
            <div className="p-4 rounded-3xl bg-white border border-[#D1C4E9] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDE7F6]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#512DA8] uppercase tracking-wide">Kỹ Năng Mềm</h4>
                    <p className="text-[10px] text-[#8C6D7C]">Thuyết trình & Làm việc nhóm</p>
                  </div>
                </div>
                <button
                  onClick={() => onAddTask('study')}
                  className="w-6 h-6 rounded-full bg-[#EDE7F6] text-[#512DA8] hover:bg-[#D1C4E9] flex items-center justify-center text-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {tasks.filter((t) => t.category === 'study' && t.subCategory === 'study_softskills').length === 0 ? (
                  <p className="py-4 text-center text-[11px] text-[#8C6D7C] border border-dashed border-[#EDE7F6] rounded-xl">
                    Chưa có mục kỹ năng nào
                  </p>
                ) : (
                  tasks
                    .filter((t) => t.category === 'study' && t.subCategory === 'study_softskills')
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        className={`p-3 rounded-2xl bg-[#FCF8FF] border border-[#EDE7F6] hover:border-[#7E57C2] transition cursor-pointer flex items-start justify-between gap-2 ${
                          task.completed ? 'opacity-60 line-through' : ''
                        } ${deletingId === task.id ? 'animate-fade-out' : ''}`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#4A3B43] truncate">{task.title}</p>
                          {task.note && <p className="text-[11px] text-[#8C6D7C] line-clamp-1 mt-0.5">{task.note}</p>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            title="Xóa mục này"
                            onClick={(e) => handleDeleteClick(task.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleCheckTask(task, e)}
                            className="p-1 hover:scale-110 transition cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#7E57C2]" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
