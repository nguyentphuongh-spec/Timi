import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Bell, 
  BellRing, 
  Volume2, 
  Sparkles, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Task, ScheduleItem, Appointment, AlarmItem } from '../types';

interface RealTimeClockBannerProps {
  currentDate: Date;
  tasks: Task[];
  schedule: ScheduleItem[];
  appointments: Appointment[];
  alarms: AlarmItem[];
  onTriggerTestAlert: () => void;
}

export const RealTimeClockBanner: React.FC<RealTimeClockBannerProps> = ({
  currentDate,
  tasks,
  schedule,
  appointments,
  alarms,
  onTriggerTestAlert
}) => {
  const [notificationState, setNotificationState] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationState(perm);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Format date in Vietnamese
  const daysOfWeekVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeekVi[currentDate.getDay()];
  const dateFormatted = `${currentDate.getDate()} tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;
  
  // Format live time: HH:mm:ss
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');

  // Count active scheduled items today
  const currentDayOfWeek = currentDate.getDay();
  const classesToday = schedule.filter(s => s.dayOfWeek === currentDayOfWeek);
  const pendingTasksWithTime = tasks.filter(t => !t.completed && t.dueTime);
  const enabledAlarms = alarms.filter(a => a.enabled);

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FFF5F7] via-white to-[#FFF0F5] border-2 border-[#FFCCD5] shadow-sm relative overflow-hidden transition-all">
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCCD5]/20 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        {/* Left: Real-time Date & Clock */}
        <div className="flex items-center gap-4">
          {/* Animated Clock Circle */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-[#FF85A1] shadow-xs flex flex-col items-center justify-center text-[#D81B60] flex-shrink-0 group hover:rotate-3 transition">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF85A1] -mb-1">
              LIVE
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight leading-none text-[#D81B60]">
              {hours}:{minutes}
            </span>
            <span className="text-[10px] font-bold text-[#8C6D7C] leading-none mt-0.5">
              :{seconds}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFE4E8] text-[#C2185B] text-xs font-black uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {dayName}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#4A3B43]">
                {dateFormatted}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Đồng hồ thực tế
              </span>
            </div>

            <p className="text-xs text-[#6D5A64] mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Hôm nay bạn có:</span>
              <strong className="text-[#D81B60]">{pendingTasksWithTime.length} việc cần xong</strong>
              <span>•</span>
              <strong className="text-[#9C27B0]">{classesToday.length} tiết học</strong>
              <span>•</span>
              <strong className="text-[#0288D1]">{enabledAlarms.length} chuông báo</strong>
            </p>
          </div>
        </div>

        {/* Right: Actions & Live Notification controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Browser Notification Status / Toggle */}
          {notificationState !== 'granted' && notificationState !== 'unsupported' && (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Bật quyền thông báo đẩy trên trình duyệt để không bỏ lỡ hạn chót"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span>Bật thông báo nhắc giờ</span>
            </button>
          )}

          {notificationState === 'granted' && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Thông báo sẵn sàng</span>
            </div>
          )}

          {/* Quick Sound/Chime Test Button */}
          <button
            onClick={onTriggerTestAlert}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF0F3] border border-[#FFCCD5] text-[#7D2E49] text-xs font-bold flex items-center gap-1.5 transition shadow-2xs group cursor-pointer"
            title="Thử nghiệm chuông và thông báo trực quan trên màn hình"
          >
            <BellRing className="w-3.5 h-3.5 text-[#FF85A1] group-hover:scale-110 transition" />
            <span>Thử chuông báo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
