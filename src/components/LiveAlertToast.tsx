import React from 'react';
import { BellRing, X, CheckCircle2, Clock, Volume2 } from 'lucide-react';
import { LiveAlert } from '../types';
import { MascotAvatar } from './CuteIllustrations';
import { playChime, playSuccessSound } from '../utils/audio';

interface LiveAlertToastProps {
  alerts: LiveAlert[];
  onDismiss: (alertId: string) => void;
  onCompleteTask?: (taskId: string) => void;
}

export const LiveAlertToast: React.FC<LiveAlertToastProps> = ({
  alerts,
  onDismiss,
  onCompleteTask
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {alerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto bg-white/98 rounded-3xl border-2 border-[#FF85A1] shadow-2xl p-4 flex flex-col gap-2 animate-bounce-short backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <MascotAvatar type="rabbit" mood="sleepy" size={38} />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FF85A1] text-white flex items-center justify-center text-[10px] animate-ping"></span>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FF85A1] text-white flex items-center justify-center text-[10px]">
                  <BellRing className="w-2.5 h-2.5" />
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-[#D81B60] bg-[#FFE4E8] px-2 py-0.5 rounded-full">
                  {alert.type === 'setup'
                    ? '✨ ĐÃ CÀI ĐẶT THỜI GIAN'
                    : alert.type === 'alarm' 
                      ? '⏰ BÁO THỨC TIMI' 
                      : alert.type === 'task' 
                        ? '🔔 NHẮC HẠN CHÓT' 
                        : alert.type === 'appointment'
                          ? '📅 LỊCH HẸN'
                          : '📚 THỜI KHÓA BIỂU'}
                </span>
                <h4 className="text-xs sm:text-sm font-black text-[#4A3B43] mt-0.5 leading-tight">
                  {alert.title}
                </h4>
              </div>
            </div>

            <button
              onClick={() => onDismiss(alert.id)}
              className="text-gray-400 hover:text-[#D81B60] p-1 rounded-full transition"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#6D5A64] bg-[#FFF5F7] p-2.5 rounded-2xl border border-[#FFCCD5] leading-relaxed">
            {alert.message}
          </p>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => {
                playChime('sweet');
                onDismiss(alert.id);
              }}
              className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white text-xs font-bold shadow-xs hover:opacity-95 transition text-center"
            >
              Đã hiểu
            </button>

            <button
              onClick={() => {
                playChime('marimba');
                onDismiss(alert.id);
              }}
              className="py-1.5 px-3 rounded-xl bg-white border border-[#FFCCD5] text-[#8C6D7C] hover:bg-[#FFF0F3] text-xs font-semibold transition"
              title="Nhắc lại sau"
            >
              Hoãn 5p
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
