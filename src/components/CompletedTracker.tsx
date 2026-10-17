import React from 'react';
import { CheckCircle2, RotateCcw, Flame, Trophy, Clock, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { playChime } from '../utils/audio';

interface CompletedTrackerProps {
  tasks: Task[];
  streakCount: number;
  totalFocusMinutes: number;
  onRestoreTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onClearAllCompleted: () => void;
  onOpenPetModal?: () => void;
}

export const CompletedTracker: React.FC<CompletedTrackerProps> = ({
  tasks,
  streakCount,
  totalFocusMinutes,
  onRestoreTask,
  onDeleteTask,
  onClearAllCompleted,
  onOpenPetModal
}) => {
  const completedTasks = tasks.filter(t => t.completed);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Productivity Highlights Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Hoàn thành */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border border-[#A5D6A7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#2E7D32] flex items-center justify-center text-2xl shadow-xs">
            <Trophy className="w-6 h-6 text-[#2E7D32]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1B5E20] uppercase">Tiến Độ Hôm Nay</p>
            <h4 className="text-xl sm:text-2xl font-black text-[#1B5E20]">
              {completedTasks.length} / {totalTasks} <span className="text-sm font-bold">({completionRate}%)</span>
            </h4>
          </div>
        </div>

        {/* Metric 2: Chuỗi ngày */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] border border-[#FFCC80] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#E65100] flex items-center justify-center text-2xl shadow-xs">
            <Flame className="w-6 h-6 text-[#E65100]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#E65100] uppercase">Chuỗi Ngày Hoàn Thành</p>
            <h4 className="text-xl sm:text-2xl font-black text-[#E65100]">
              {streakCount} Ngày <span className="text-sm font-bold">🔥</span>
            </h4>
          </div>
        </div>

        {/* Metric 3: Thời gian tập trung */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#E1F5FE] to-[#B3E5FC] border border-[#81D4FA] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#0277BD] flex items-center justify-center text-2xl shadow-xs">
            <Clock className="w-6 h-6 text-[#0277BD]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#01579B] uppercase">Thời Gian Tập Trung</p>
            <h4 className="text-xl sm:text-2xl font-black text-[#01579B]">
              {totalFocusMinutes} <span className="text-sm font-bold">phút Pomodoro</span>
            </h4>
          </div>
        </div>
      </div>

      {/* Rewards Banner Connecting Streak to Pet Outfits */}
      {onOpenPetModal && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FFF5F8] via-[#FFF0F3] to-[#FFE8EE] border-2 border-[#FFD1DC] shadow-xs flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#4A3B43]">
                Chuỗi {streakCount} ngày của bạn đang mở khóa nhiều phần thưởng & trang phục!
              </h4>
              <p className="text-xs text-[#8C6D7C]">
                Đổi tên bé cưng, mở Hộp Quà Chuỗi Ngày, quay số may mắn và sắm đồ thời trang sinh viên.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPetModal}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white text-xs font-bold shadow-xs hover:opacity-95 transition cursor-pointer"
          >
            Mở Kho Quà & Thú Cưng 🐾
          </button>
        </div>
      )}

      {/* List of Completed Tasks */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#FFD1DC] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#FFE4E8] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="text-base font-bold text-[#4A3B43]">
                Lịch Sử Các Công Việc Đã Hoàn Thành
              </h3>
              <p className="text-xs text-[#8C6D7C]">
                Bạn đã nỗ lực rất tuyệt vời! Thú cưng TIMI đang rất tự hào về bạn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9]">
              {completedTasks.length} nhiệm vụ đã xong
            </span>
            {completedTasks.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn dọn sạch toàn bộ các công việc đã hoàn thành không?')) {
                    onClearAllCompleted();
                  }
                }}
                className="px-3 py-1 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition flex items-center gap-1"
                title="Xóa vĩnh viễn các mục đã xong"
              >
                <Trash2 className="w-3.5 h-3.5" /> Dọn sạch
              </button>
            )}
          </div>
        </div>

        {completedTasks.length === 0 ? (
          <div className="text-center py-12 bg-[#FFFDFE] rounded-2xl border border-dashed border-[#FFCCD5]">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-sm font-bold text-[#4A3B43]">Chưa có công việc nào được hoàn thành hôm nay</p>
            <p className="text-xs text-[#8C6D7C] mt-1">
              Hãy bấm vào ô tròn ở flashcard công việc sau khi bạn hoàn thành nhé!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E0E0E0] flex items-center justify-between gap-3 group hover:border-[#81C784] transition"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#4CAF50] fill-[#E8F5E9] flex-shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#4A3B43] line-through">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#8C6D7C] mt-0.5">
                      <span>{task.completedAt ? `Xong lúc ${task.completedAt}` : 'Hôm nay'}</span>
                      <span>•</span>
                      <span>{task.category === 'work' ? 'Công việc' : task.category === 'life' ? 'Đời sống' : 'Học tập'}</span>
                      <span>•</span>
                      <span className="text-[#FF85A1] font-semibold">+{task.durationMinutes} exp</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onRestoreTask(task.id);
                      playChime('sweet');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#BDBDBD] text-[#616161] hover:bg-white text-xs font-medium flex items-center gap-1 transition shadow-2xs"
                    title="Chuyển lại về việc cần làm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
                  </button>
                  <button
                    onClick={() => {
                      onDeleteTask(task.id);
                    }}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Xóa công việc này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
