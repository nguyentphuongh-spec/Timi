import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Clock, Calendar, CheckCircle2, Flame, Bell, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { Task, ScheduleItem, Appointment } from '../types';

interface SearchAndIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  schedule: ScheduleItem[];
  appointments: Appointment[];
  onNavigateTo: (target: string) => void;
  onSelectTask: (task: Task) => void;
}

export const SearchAndIndexModal: React.FC<SearchAndIndexModalProps> = ({
  isOpen,
  onClose,
  tasks,
  schedule,
  appointments,
  onNavigateTo,
  onSelectTask
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tasks, schedule, appointments by search query
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const q = searchTerm.toLowerCase().trim();

    const matchedTasks = tasks.filter(
      t => t.title.toLowerCase().includes(q) || (t.note && t.note.toLowerCase().includes(q))
    );
    const matchedSchedule = schedule.filter(
      s => s.title.toLowerCase().includes(q) || (s.location && s.location.toLowerCase().includes(q))
    );
    const matchedAppointments = appointments.filter(
      a => a.title.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || (a.note && a.note.toLowerCase().includes(q))
    );

    return {
      tasks: matchedTasks,
      schedule: matchedSchedule,
      appointments: matchedAppointments,
      total: matchedTasks.length + matchedSchedule.length + matchedAppointments.length
    };
  }, [searchTerm, tasks, schedule, appointments]);

  if (!isOpen) return null;

  const indexCategories = [
    {
      id: 'work',
      title: 'Trang Công Việc',
      subtitle: 'Flashcards màu: Đỏ (rất quan trọng), Cam (thường ngày: đi học, làm thêm), Vàng, Trắng',
      icon: '🔴',
      count: tasks.filter(t => t.category === 'work').length,
      badgeColor: 'bg-[#FFE4E8] text-[#D81B60]'
    },
    {
      id: 'life',
      title: 'Trang Đời Sống',
      subtitle: 'Ăn uống (dinh dưỡng, uống nước), Giải trí (xem phim, thư giãn), Vận động (thể thao, giãn cơ)',
      icon: '🍱',
      count: tasks.filter(t => t.category === 'life').length,
      badgeColor: 'bg-[#FFF3E0] text-[#E65100]'
    },
    {
      id: 'study',
      title: 'Trang Học Tập',
      subtitle: 'Bài tập trên lớp, Học thêm kỹ năng, Đọc sách chuyên sâu, Kỹ năng mềm sinh viên',
      icon: '📚',
      count: tasks.filter(t => t.category === 'study').length,
      badgeColor: 'bg-[#E1F5FE] text-[#0277BD]'
    },
    {
      id: 'schedule',
      title: 'Lập Thời Gian Biểu & Lịch Hẹn',
      subtitle: 'Lập lịch tuần học tập - công việc, mốc hẹn báo trước 20 - 30 phút',
      icon: '🗓️',
      count: schedule.length + appointments.length,
      badgeColor: 'bg-[#F3E5F5] text-[#7B1FA2]'
    },
    {
      id: 'pomodoro',
      title: 'Chế Độ Pomodoro & Đếm Ngược',
      subtitle: 'Tập trung 25 phút - nghỉ 5 phút, âm thanh dịu êm và đồng hồ đếm ngược công việc',
      icon: '⏱️',
      badgeColor: 'bg-[#FFEBEE] text-[#C62828]'
    },
    {
      id: 'pet',
      title: 'Nuôi Thú Cưng Ảo & Tủ Đồ',
      subtitle: 'Tích lũy chuỗi ngày Streak 🔥, mở khóa nơ hồng, mũ cử nhân, ly trà sữa',
      icon: '🐱',
      badgeColor: 'bg-[#FFF8E1] text-[#F57F17]'
    },
    {
      id: 'completed',
      title: 'Lịch Sử Công Việc Hoàn Thành',
      subtitle: 'Theo dõi tiến độ đã đạt được, tỷ lệ hoàn thành công việc và thống kê',
      icon: '✅',
      count: tasks.filter(t => t.completed).length,
      badgeColor: 'bg-[#E8F5E9] text-[#2E7D32]'
    },
    {
      id: 'alarms',
      title: 'Báo Thức & Cài Đặt Nhắc Nhở',
      subtitle: 'Báo thức ca học/ca làm, kiểm soát âm thanh và chuông nhắc 20 - 30 phút',
      icon: '⏰',
      badgeColor: 'bg-[#FCE4EC] text-[#AD1457]'
    },
    {
      id: 'settings',
      title: 'Cài Đặt & Quản Lý Tài Khoản',
      subtitle: 'Chỉnh font chữ, cỡ chữ, bảng màu Pastel, trang trí thời gian biểu, đổi tài khoản',
      icon: '⚙️',
      badgeColor: 'bg-[#ECEFF1] text-[#455A64]'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-[#FFD1DC] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with search input */}
        <div className="p-4 sm:p-5 border-b border-[#FFE4E8] bg-gradient-to-r from-[#FFF5F7] via-[#FFFFFF] to-[#FFF0F3]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-lg sm:text-xl font-bold text-[#4A3B43]">
                Tìm Kiếm & Mục Lục TIMI
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#FFF0F3] hover:bg-[#FFE4E8] text-[#7D2E49] flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF85A1]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm nhanh tên bài tập, ca làm thêm, lịch hẹn, môn học..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FFF9FA] border border-[#FFCCD5] focus:outline-none focus:ring-2 focus:ring-[#FF85A1] text-sm sm:text-base text-[#4A3B43] placeholder-[#B59DA8]"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7D2E49] bg-[#FFDEE9] px-2 py-0.5 rounded-full"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* If searching: show search results */}
          {searchResults ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#8C6D7C] uppercase tracking-wider">
                  Kết quả tìm kiếm ({searchResults.total})
                </p>
                {searchResults.total === 0 && (
                  <span className="text-xs text-[#FF85A1]">Không tìm thấy mục phù hợp</span>
                )}
              </div>

              {searchResults.total === 0 ? (
                <div className="text-center py-10 bg-[#FFF9FA] rounded-2xl border border-dashed border-[#FFCCD5]">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-sm font-medium text-[#4A3B43]">Chưa có kết quả nào khớp với "{searchTerm}"</p>
                  <p className="text-xs text-[#8C6D7C] mt-1">Hãy thử tìm theo "bài tập", "làm thêm", "uống nước", "học phần"...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Matched Tasks */}
                  {searchResults.tasks.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-[#FF85A1]">Công việc & Ghi chú ({searchResults.tasks.length})</p>
                      {searchResults.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => {
                            onSelectTask(task);
                            onClose();
                          }}
                          className="p-3 rounded-2xl bg-[#FFFDFE] border border-[#FFE0E6] hover:border-[#FF85A1] hover:shadow-sm cursor-pointer transition flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">
                              {task.flashcardColor === 'red' && '🔴'}
                              {task.flashcardColor === 'orange' && '🟠'}
                              {task.flashcardColor === 'yellow' && '🟡'}
                              {task.flashcardColor === 'white' && '⚪'}
                            </span>
                            <div>
                              <p className={`text-sm font-semibold ${task.completed ? 'line-through text-[#B59DA8]' : 'text-[#4A3B43]'}`}>
                                {task.title}
                              </p>
                              {task.note && (
                                <p className="text-xs text-[#8C6D7C] line-clamp-1">{task.note}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#D81B60] font-medium">
                              {task.dueTime || task.priorityLabel}
                            </span>
                            <ChevronRight className="w-4 h-4 text-[#FFCCD5] group-hover:text-[#FF85A1] transition" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matched Schedule */}
                  {searchResults.schedule.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="text-xs font-bold text-[#9C27B0]">Thời gian biểu ({searchResults.schedule.length})</p>
                      {searchResults.schedule.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            onNavigateTo('schedule');
                            onClose();
                          }}
                          className="p-3 rounded-2xl bg-[#FCF8FF] border border-[#E1BEE7] hover:border-[#AB47BC] cursor-pointer transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">🗓️</span>
                            <div>
                              <p className="text-sm font-semibold text-[#4A3B43]">{item.title}</p>
                              <p className="text-xs text-[#8C6D7C]">
                                {item.startTime} - {item.endTime} {item.location && `• ${item.location}`}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F3E5F5] text-[#7B1FA2]">
                            Thứ {item.dayOfWeek === 0 ? 'CN' : item.dayOfWeek + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matched Appointments */}
                  {searchResults.appointments.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="text-xs font-bold text-[#E65100]">Mốc thời gian / Lịch hẹn ({searchResults.appointments.length})</p>
                      {searchResults.appointments.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => {
                            onNavigateTo('schedule');
                            onClose();
                          }}
                          className="p-3 rounded-2xl bg-[#FFF8E1] border border-[#FFE082] hover:border-[#FFA000] cursor-pointer transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">⏰</span>
                            <div>
                              <p className="text-sm font-semibold text-[#4A3B43]">{apt.title}</p>
                              <p className="text-xs text-[#8C6D7C]">{apt.date} lúc {apt.time} • Báo trước {apt.alertMinutesBefore}p</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100]">
                            Lịch hẹn
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* If not searching: display the rich Mục Lục Index */
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#8C6D7C] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#FF85A1]" />
                  Mục lục các phân hệ TIMI
                </span>
                <span className="text-xs text-[#FF85A1] font-medium">Bấm để chuyển nhanh</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {indexCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      onNavigateTo(cat.id);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl bg-[#FFFDFE] border border-[#FFE4E8] hover:border-[#FF85A1] hover:bg-[#FFF5F7] hover:shadow-sm cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] border border-[#FFCCD5] flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition">
                        {cat.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#4A3B43] group-hover:text-[#D81B60] transition">
                            {cat.title}
                          </p>
                          {cat.count !== undefined && (
                            <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${cat.badgeColor}`}>
                              {cat.count} mục
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8C6D7C] line-clamp-1 mt-0.5">
                          {cat.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#FFCCD5] group-hover:text-[#FF85A1] group-hover:translate-x-0.5 transition flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-[#FFF5F7] border-t border-[#FFE4E8] text-center text-xs text-[#8C6D7C] flex items-center justify-between px-6">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF85A1]" />
            Ứng dụng quản lý thời gian sinh viên 18-23 tuổi
          </span>
          <span className="text-[#FF85A1] font-semibold">Đúng giờ • Tập trung • Hiệu quả</span>
        </div>
      </div>
    </div>
  );
};
