import React, { useState, useEffect } from 'react';
import { X, Clock, Bell, Trash2, Sparkles, Check, Bookmark } from 'lucide-react';
import { Task, FlashcardColor } from '../types';
import { playChime } from '../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultCategory?: 'work' | 'life' | 'study';
  onSave: (task: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  defaultCategory = 'work',
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<'work' | 'life' | 'study'>('work');
  const [flashcardColor, setFlashcardColor] = useState<FlashcardColor>('red');
  const [subCategory, setSubCategory] = useState<Task['subCategory']>('work_important');
  const [dueTime, setDueTime] = useState('15:00');
  const [dueDate, setDueDate] = useState('Hôm nay');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [soundAlert, setSoundAlert] = useState(true);
  const [notifyBeforeMinutes, setNotifyBeforeMinutes] = useState(20);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNote(task.note || '');
      setCategory(task.category);
      setFlashcardColor(task.flashcardColor);
      setSubCategory(task.subCategory);
      setDueTime(task.dueTime || '15:00');
      setDueDate(task.dueDate || 'Hôm nay');
      setDurationMinutes(task.durationMinutes || 30);
      setSoundAlert(task.soundAlert);
      setNotifyBeforeMinutes(task.notifyBeforeMinutes || 20);
      setIsPinned(task.isPinned || false);
    } else {
      setTitle('');
      setNote('');
      setCategory(defaultCategory);
      // default colors per requirement
      if (defaultCategory === 'work') {
        setFlashcardColor('red');
        setSubCategory('work_important');
      } else if (defaultCategory === 'life') {
        setFlashcardColor('orange');
        setSubCategory('life_dining');
      } else {
        setFlashcardColor('yellow');
        setSubCategory('study_assignment');
      }
      setDueTime('15:00');
      setDueDate('Hôm nay');
      setDurationMinutes(45);
      setSoundAlert(true);
      setNotifyBeforeMinutes(20);
      setIsPinned(false);
    }
  }, [task, defaultCategory, isOpen]);

  // When changing color on Work tab, adjust subcategory hint
  const handleColorChange = (c: FlashcardColor) => {
    setFlashcardColor(c);
    if (c === 'red') {
      setSubCategory('work_important');
    } else if (c === 'orange') {
      setSubCategory('work_routine'); // "ở flashcard màu cam để ghi chú các công việc thường ngày (làm thêm và đi học)"
    } else if (c === 'yellow') {
      setSubCategory('work_general');
    } else {
      setSubCategory('work_general');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let priorityLabel = 'Cần hoàn thành';
    if (flashcardColor === 'red') priorityLabel = 'Rất quan trọng';
    else if (flashcardColor === 'orange') priorityLabel = 'Thường ngày (Làm thêm & Đi học)';
    else if (flashcardColor === 'yellow') priorityLabel = 'Cần hoàn thành';
    else if (flashcardColor === 'white') priorityLabel = 'Ghi chú nhẹ';

    onSave({
      ...(task ? { id: task.id } : {}),
      title: title.trim(),
      note: note.trim(),
      category,
      flashcardColor,
      priorityLabel,
      subCategory,
      dueTime,
      dueDate,
      durationMinutes: Number(durationMinutes),
      soundAlert,
      notifyBeforeMinutes: Number(notifyBeforeMinutes),
      isPinned
    });

    playChime('sweet');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#FFD1DC] flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#FFE4E8] bg-gradient-to-r from-[#FFF5F7] to-[#FFF0F3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="text-base sm:text-lg font-bold text-[#4A3B43]">
              {task ? 'Chỉnh Sửa Flashcard Công Việc' : 'Tạo Flashcard Công Việc Mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#7D2E49] hover:bg-[#FFE4E8] flex items-center justify-center transition border border-[#FFCCD5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Main Category */}
          <div>
            <label className="block text-xs font-bold text-[#7D2E49] uppercase tracking-wider mb-1.5">
              Phân loại khu vực
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('work')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                  category === 'work'
                    ? 'bg-[#FFE4E8] border-[#FF85A1] text-[#C2185B]'
                    : 'bg-[#FFFDFE] border-[#FFE4E8] text-[#8C6D7C]'
                }`}
              >
                💼 Công Việc
              </button>
              <button
                type="button"
                onClick={() => setCategory('life')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                  category === 'life'
                    ? 'bg-[#FFF3E0] border-[#FFA726] text-[#E65100]'
                    : 'bg-[#FFFDFE] border-[#FFE4E8] text-[#8C6D7C]'
                }`}
              >
                🌸 Đời Sống
              </button>
              <button
                type="button"
                onClick={() => setCategory('study')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                  category === 'study'
                    ? 'bg-[#E1F5FE] border-[#4FC3F7] text-[#0277BD]'
                    : 'bg-[#FFFDFE] border-[#FFE4E8] text-[#8C6D7C]'
                }`}
              >
                📚 Học Tập
              </button>
            </div>
          </div>

          {/* Flashcard Color selector (Specific user requirement!) */}
          <div>
            <label className="block text-xs font-bold text-[#7D2E49] uppercase tracking-wider mb-1.5">
              Màu Flashcard Mức Độ Quan Trọng
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Red */}
              <button
                type="button"
                onClick={() => handleColorChange('red')}
                className={`p-2.5 rounded-2xl border text-left transition relative ${
                  flashcardColor === 'red'
                    ? 'bg-[#FFEBEE] border-[#E53935] ring-2 ring-[#FFCDD2]'
                    : 'bg-[#FFF8F8] border-[#FFCDD2] hover:border-[#E53935]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#E53935] shadow-xs"></span>
                  <span className="text-xs font-bold text-[#C62828]">Đỏ</span>
                </div>
                <p className="text-[10px] text-[#D32F2F] leading-tight">Rất quan trọng / Gấp</p>
                {flashcardColor === 'red' && (
                  <Check className="w-3.5 h-3.5 text-[#C62828] absolute top-2 right-2" />
                )}
              </button>

              {/* Orange - routine work, study & part-time */}
              <button
                type="button"
                onClick={() => handleColorChange('orange')}
                className={`p-2.5 rounded-2xl border text-left transition relative ${
                  flashcardColor === 'orange'
                    ? 'bg-[#FFF3E0] border-[#FB8C00] ring-2 ring-[#FFE0B2]'
                    : 'bg-[#FFFBF5] border-[#FFE0B2] hover:border-[#FB8C00]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FB8C00] shadow-xs"></span>
                  <span className="text-xs font-bold text-[#E65100]">Cam</span>
                </div>
                <p className="text-[10px] text-[#EF6C00] leading-tight">Thường ngày (Học & Làm thêm)</p>
                {flashcardColor === 'orange' && (
                  <Check className="w-3.5 h-3.5 text-[#E65100] absolute top-2 right-2" />
                )}
              </button>

              {/* Yellow */}
              <button
                type="button"
                onClick={() => handleColorChange('yellow')}
                className={`p-2.5 rounded-2xl border text-left transition relative ${
                  flashcardColor === 'yellow'
                    ? 'bg-[#FFFDE7] border-[#FBC02D] ring-2 ring-[#FFF9C4]'
                    : 'bg-[#FFFFF8] border-[#FFF59D] hover:border-[#FBC02D]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FBC02D] shadow-xs"></span>
                  <span className="text-xs font-bold text-[#F57F17]">Vàng</span>
                </div>
                <p className="text-[10px] text-[#F57F17] leading-tight">Cần hoàn thành</p>
                {flashcardColor === 'yellow' && (
                  <Check className="w-3.5 h-3.5 text-[#F57F17] absolute top-2 right-2" />
                )}
              </button>

              {/* White */}
              <button
                type="button"
                onClick={() => handleColorChange('white')}
                className={`p-2.5 rounded-2xl border text-left transition relative ${
                  flashcardColor === 'white'
                    ? 'bg-white border-[#B0BEC5] ring-2 ring-[#ECEFF1]'
                    : 'bg-[#FAFAFA] border-[#CFD8DC] hover:border-[#90A4AE]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-[#90A4AE] shadow-xs"></span>
                  <span className="text-xs font-bold text-[#455A64]">Trắng</span>
                </div>
                <p className="text-[10px] text-[#546E7A] leading-tight">Ghi chú thông thường</p>
                {flashcardColor === 'white' && (
                  <Check className="w-3.5 h-3.5 text-[#455A64] absolute top-2 right-2" />
                )}
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#7D2E49] uppercase tracking-wider mb-1.5">
              Tiêu đề công việc <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Ca làm thêm tiệm trà sữa, Hoàn thành bài tập môn Kinh tế..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#FFCCD5] bg-[#FFF9FA] text-sm text-[#4A3B43] focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
            />
          </div>

          {/* Subcategory specific selector */}
          {category === 'life' && (
            <div>
              <label className="block text-xs font-bold text-[#7D2E49] uppercase tracking-wider mb-1.5">
                Chuyên mục Đời Sống
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSubCategory('life_dining')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border ${
                    subCategory === 'life_dining' ? 'bg-[#FFE0B2] border-[#FB8C00] text-[#E65100]' : 'bg-white border-[#FFE4E8]'
                  }`}
                >
                  🥗 Ăn uống / Nước
                </button>
                <button
                  type="button"
                  onClick={() => setSubCategory('life_entertainment')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border ${
                    subCategory === 'life_entertainment' ? 'bg-[#FFE0B2] border-[#FB8C00] text-[#E65100]' : 'bg-white border-[#FFE4E8]'
                  }`}
                >
                  🎮 Giải trí / Phim
                </button>
                <button
                  type="button"
                  onClick={() => setSubCategory('life_fitness')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border ${
                    subCategory === 'life_fitness' ? 'bg-[#FFE0B2] border-[#FB8C00] text-[#E65100]' : 'bg-white border-[#FFE4E8]'
                  }`}
                >
                  🏃 Vận động / Yoga
                </button>
              </div>
            </div>
          )}

          {category === 'study' && (
            <div>
              <label className="block text-xs font-bold text-[#7D2E49] uppercase tracking-wider mb-1.5">
                Chuyên mục Học Tập
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSubCategory('study_assignment')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border ${
                    subCategory === 'study_assignment' ? 'bg-[#BBDEFB] border-[#2196F3] text-[#0D47A1]' : 'bg-white border-[#FFE4E8]'
                  }`}
                >
                  📝 Bài tập
                </button>
                <button
                  type="button"
                  onClick={() => setSubCategory('study_extra')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border ${
                    subCategory === 'study_extra' ? 'bg-[#BBDEFB] border-[#2196F3] text-[#0D47A1]' : 'bg-white border-[#FFE4E8]'
                  }`}
                >
                  🎓 Học thêm
                </button>
                <button
                  type="button"
                  onClick={() => setSubCategory('study_reading')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border ${
                    subCategory === 'study_reading' ? 'bg-[#BBDEFB] border-[#2196F3] text-[#0D47A1]' : 'bg-white border-[#FFE4E8]'
                  }`}
                >
                  📖 Đọc sách
                </button>
                <button
                  type="button"
                  onClick={() => setSubCategory('study_softskills')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border ${
                    subCategory === 'study_softskills' ? 'bg-[#BBDEFB] border-[#2196F3] text-[#0D47A1]' : 'bg-white border-[#FFE4E8]'
                  }`}
                >
                  💡 Kỹ năng mềm
                </button>
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-[#7D2E49] uppercase tracking-wider mb-1.5">
              Ghi chú chi tiết
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Phòng B204, mang theo máy tính cầm tay, in tài liệu trước khi tới..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#FFCCD5] bg-[#FFF9FA] text-xs sm:text-sm text-[#4A3B43] focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
            />
          </div>

          {/* Time & Duration row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#7D2E49] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FF85A1]" />
                Giờ cần làm / Hạn
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#FFCCD5] bg-[#FFF9FA] text-xs sm:text-sm text-[#4A3B43] focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#7D2E49] uppercase tracking-wider mb-1.5">
                Thời lượng ước tính (phút)
              </label>
              <input
                type="number"
                min={5}
                max={480}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#FFCCD5] bg-[#FFF9FA] text-xs sm:text-sm text-[#4A3B43] focus:ring-2 focus:ring-[#FF85A1] focus:outline-none"
              />
            </div>
          </div>

          {/* Notification & Sound */}
          <div className="p-3 bg-[#FFF5F7] rounded-2xl border border-[#FFE4E8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A3B43] flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#FF85A1]" />
                Thông báo bằng âm thanh
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundAlert}
                  onChange={(e) => setSoundAlert(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#FFCCD5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#FFAAA6] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF85A1]"></div>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#8C6D7C] mb-1">
                Báo trước để chuẩn bị:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: 0, label: 'Đúng giờ' },
                  { value: 15, label: 'Trước 15p' },
                  { value: 20, label: 'Trước 20p' },
                  { value: 30, label: 'Trước 30p' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setNotifyBeforeMinutes(item.value)}
                    className={`py-1 px-2 rounded-lg text-xs font-medium border transition ${
                      notifyBeforeMinutes === item.value
                        ? 'bg-[#FF85A1] text-white border-[#FF85A1]'
                        : 'bg-white text-[#8C6D7C] border-[#FFCCD5]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {task && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa flashcard này?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#FFE4E8] text-[#8C6D7C] text-xs font-bold hover:bg-[#FFF5F7] transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {task ? 'Cập Nhật Flashcard' : 'Lưu Flashcard'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
