import { useState, useEffect, useRef } from 'react';
import { Task, ScheduleItem, Appointment, AlarmItem, LiveAlert } from '../types';
import { playChime, playSuccessSound, playAlarmMelody } from '../utils/audio';

interface UseRealTimeNotifierProps {
  tasks: Task[];
  schedule: ScheduleItem[];
  appointments: Appointment[];
  alarms: AlarmItem[];
  soundEnabled: boolean;
  onCompleteTask?: (taskId: string) => void;
}

export function useRealTimeNotifier({
  tasks,
  schedule,
  appointments,
  alarms,
  soundEnabled,
  onCompleteTask
}: UseRealTimeNotifierProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [activeAlerts, setActiveAlerts] = useState<LiveAlert[]>([]);
  const notifiedKeysRef = useRef<Set<string>>(new Set());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check alerts whenever minute changes
  useEffect(() => {
    const now = currentDate;
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentDayOfWeek = now.getDay(); // 0 = Chủ Nhật, 1 = Thứ 2, ... 6 = Thứ 7
    const todayDateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    const currentMinuteKey = `${todayDateStr}_${currentHours}:${currentMinutes}`;

    const newAlerts: LiveAlert[] = [];

    // Helper: parse "HH:mm" to total minutes
    const parseTimeToMinutes = (timeStr?: string): number | null => {
      if (!timeStr || !timeStr.includes(':')) return null;
      const [h, m] = timeStr.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      return h * 60 + m;
    };

    // 1. CHECK TASKS (Công việc có giờ đến hạn & chuông)
    tasks.forEach(task => {
      if (task.completed || !task.dueTime || !task.soundAlert) return;
      // Date filter (Hôm nay or matching YYYY-MM-DD or not set)
      if (task.dueDate && task.dueDate !== 'Hôm nay' && task.dueDate !== todayDateStr) return;

      const dueMinutes = parseTimeToMinutes(task.dueTime);
      if (dueMinutes === null) return;

      const notifyBefore = task.notifyBeforeMinutes || 20;
      const targetWarningMinutes = dueMinutes - notifyBefore;

      // Exact Due Time Alert
      if (currentTotalMinutes === dueMinutes) {
        const key = `task_due_${task.id}_${currentMinuteKey}`;
        if (!notifiedKeysRef.current.has(key)) {
          notifiedKeysRef.current.add(key);
          newAlerts.push({
            id: 'alert_' + Date.now() + Math.random(),
            title: `⏰ ĐẾN HẠN: ${task.title}`,
            message: `Công việc "${task.title}" đã đến giờ hạn chót (${task.dueTime}). Hãy hoàn thành ngay nhé!`,
            type: 'task',
            time: task.dueTime,
            timestamp: Date.now()
          });
        }
      } 
      // Early Warning Alert (e.g. 20-30 min before)
      else if (notifyBefore > 0 && currentTotalMinutes === targetWarningMinutes) {
        const key = `task_warn_${task.id}_${currentMinuteKey}`;
        if (!notifiedKeysRef.current.has(key)) {
          notifiedKeysRef.current.add(key);
          newAlerts.push({
            id: 'alert_' + Date.now() + Math.random(),
            title: `🔔 SẮP ĐẾN HẠN: ${task.title}`,
            message: `Còn ${notifyBefore} phút nữa là đến hạn (${task.dueTime}). Chuẩn bị sẵn sàng nhé!`,
            type: 'task',
            time: task.dueTime,
            timestamp: Date.now()
          });
        }
      }
    });

    // 2. CHECK SCHEDULE (Thời khóa biểu theo thứ trong tuần)
    schedule.forEach(item => {
      if (item.dayOfWeek !== currentDayOfWeek || !item.startTime) return;
      const startMinutes = parseTimeToMinutes(item.startTime);
      if (startMinutes === null) return;

      const alertBefore = item.alertBefore || 30;
      const alertTargetMinutes = startMinutes - alertBefore;

      // Early Warning
      if (alertBefore > 0 && currentTotalMinutes === alertTargetMinutes) {
        const key = `sch_warn_${item.id}_${currentMinuteKey}`;
        if (!notifiedKeysRef.current.has(key)) {
          notifiedKeysRef.current.add(key);
          newAlerts.push({
            id: 'alert_' + Date.now() + Math.random(),
            title: `📚 SẮP ĐẾN GIỜ HỌC: ${item.title}`,
            message: `Tiết học "${item.title}" sẽ bắt đầu lúc ${item.startTime}${item.location ? ` tại ${item.location}` : ''} (còn ${alertBefore} phút).`,
            type: 'schedule',
            time: item.startTime,
            timestamp: Date.now()
          });
        }
      }

      // Exact Class Start Time
      if (currentTotalMinutes === startMinutes) {
        const key = `sch_start_${item.id}_${currentMinuteKey}`;
        if (!notifiedKeysRef.current.has(key)) {
          notifiedKeysRef.current.add(key);
          newAlerts.push({
            id: 'alert_' + Date.now() + Math.random(),
            title: `📚 ĐẾN GIỜ VÀO LỚP: ${item.title}`,
            message: `Tiết học "${item.title}" đang bắt đầu (${item.startTime})${item.location ? ` tại ${item.location}` : ''}. Chúc bạn học tốt!`,
            type: 'schedule',
            time: item.startTime,
            timestamp: Date.now()
          });
        }
      }
    });

    // 3. CHECK APPOINTMENTS (Lịch hẹn theo ngày cụ thể)
    appointments.forEach(apt => {
      if (apt.completed || !apt.time) return;
      // If date matches today or is not set
      if (apt.date && apt.date !== 'Hôm nay' && apt.date !== todayDateStr) return;

      const aptMinutes = parseTimeToMinutes(apt.time);
      if (aptMinutes === null) return;

      const alertBefore = apt.alertMinutesBefore ?? 30;
      const targetMinutes = aptMinutes - alertBefore;

      // Early warning
      if (alertBefore > 0 && currentTotalMinutes === targetMinutes) {
        const key = `apt_warn_${apt.id}_${currentMinuteKey}`;
        if (!notifiedKeysRef.current.has(key)) {
          notifiedKeysRef.current.add(key);
          newAlerts.push({
            id: 'alert_' + Date.now() + Math.random(),
            title: `📅 SẮP ĐẾN LỊCH HẸN: ${apt.title}`,
            message: `Lịch hẹn "${apt.title}" sẽ diễn ra lúc ${apt.time}${apt.location ? ` tại ${apt.location}` : ''} (còn ${alertBefore} phút).`,
            type: 'appointment',
            time: apt.time,
            timestamp: Date.now()
          });
        }
      }

      // Exact appointment time
      if (currentTotalMinutes === aptMinutes) {
        const key = `apt_due_${apt.id}_${currentMinuteKey}`;
        if (!notifiedKeysRef.current.has(key)) {
          notifiedKeysRef.current.add(key);
          newAlerts.push({
            id: 'alert_' + Date.now() + Math.random(),
            title: `📅 ĐẾN GIỜ HẸN: ${apt.title}`,
            message: `Lịch hẹn "${apt.title}" bắt đầu lúc này (${apt.time})${apt.location ? ` tại ${apt.location}` : ''}!`,
            type: 'appointment',
            time: apt.time,
            timestamp: Date.now()
          });
        }
      }
    });

    // 4. CHECK ALARMS (Báo thức)
    alarms.forEach(alm => {
      if (!alm.enabled || !alm.time) return;
      if (alm.days && alm.days.length > 0 && !alm.days.includes(currentDayOfWeek)) return;

      const alarmMinutes = parseTimeToMinutes(alm.time);
      if (alarmMinutes === null) return;

      if (currentTotalMinutes === alarmMinutes) {
        const key = `alm_${alm.id}_${currentMinuteKey}`;
        if (!notifiedKeysRef.current.has(key)) {
          notifiedKeysRef.current.add(key);
          newAlerts.push({
            id: 'alert_' + Date.now() + Math.random(),
            title: `⏰ BÁO THỨC: ${alm.label || 'Đến giờ rồi!'}`,
            message: `Chuông báo thức lúc ${alm.time}. Chúc bạn một ngày mới học tập thật hiệu quả!`,
            type: 'alarm',
            time: alm.time,
            timestamp: Date.now()
          });
        }
      }
    });

    // If new alerts triggered:
    if (newAlerts.length > 0) {
      if (soundEnabled) {
        playAlarmMelody(2);
      }

      // Try browser Notification API
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        newAlerts.forEach(a => {
          try {
            new Notification(a.title, {
              body: a.message,
              icon: 'https://cdn-icons-png.flaticon.com/512/3209/3209265.png'
            });
          } catch (err) {
            console.log('Notification API note:', err);
          }
        });
      }

      setActiveAlerts(prev => [...newAlerts, ...prev]);
    }
  }, [currentDate, tasks, schedule, appointments, alarms, soundEnabled]);

  const dismissAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const triggerTestAlert = () => {
    playAlarmMelody(2);
    const testAlert: LiveAlert = {
      id: 'test_' + Date.now(),
      title: '🔔 THỬ NGHIỆM THÔNG BÁO CHÍNH XÁC',
      message: `Đồng hồ thực tế: ${currentDate.toLocaleTimeString('vi-VN')}. Hệ thống báo thức & chuông nhắc nhở TIMI đang hoạt động chuẩn xác 100%!`,
      type: 'alarm',
      time: currentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };
    setActiveAlerts(prev => [testAlert, ...prev]);
  };

  const notifySetupEvent = (title: string, setupTime: string, notifyBefore?: number, note?: string) => {
    if (soundEnabled) {
      playSuccessSound();
    }
    const setupAlert: LiveAlert = {
      id: 'setup_' + Date.now() + Math.random(),
      title: `⏰ ĐÃ THIẾT LẬP THỜI GIAN THÀNH CÔNG`,
      message: `Đã cài chuông & lịch thông báo cho "${title}" vào lúc ${setupTime}${notifyBefore && notifyBefore > 0 ? ` (nhắc trước ${notifyBefore} phút)` : ''}. TIMI sẽ tự động báo bạn khi đến giờ!`,
      type: 'setup',
      time: setupTime,
      timestamp: Date.now()
    };

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(setupAlert.title, {
          body: setupAlert.message,
          icon: 'https://cdn-icons-png.flaticon.com/512/3209/3209265.png'
        });
      } catch (err) {
        console.log('Notification note:', err);
      }
    }

    setActiveAlerts(prev => [setupAlert, ...prev]);
  };

  return {
    currentDate,
    activeAlerts,
    dismissAlert,
    triggerTestAlert,
    notifySetupEvent
  };
}
