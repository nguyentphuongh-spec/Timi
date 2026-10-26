import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings,
  GraduationCap
} from 'lucide-react';

import { 
  Task, 
  ScheduleItem, 
  Appointment, 
  AlarmItem, 
  VirtualPet, 
  UserSettings, 
  UserProfile 
} from './types';

import { 
  APP_STORAGE_KEYS,
  GLOBAL_STORAGE_KEYS,
  DEFAULT_STUDENT_PROFILE,
  DEFAULT_USER_SETTINGS,
  createFreshUserData,
  loadData, 
  saveData,
  persistCustomization,
  loadSavedCustomizations,
  getUserStorageKeys,
  clearPersonalizationOnLogout
} from './utils/storage';

import { 
  listenToAuthState, 
  AUTH_STORAGE_KEY 
} from './utils/firebase';

import { 
  fetchBackendStudentProfile, 
  syncWorkspaceToBackend 
} from './utils/studentBackend';

import { playChime, playSuccessSound } from './utils/audio';

import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { ScheduleSection } from './components/ScheduleSection';
import { PomodoroAndCountdown } from './components/PomodoroAndCountdown';
import { CompletedTracker } from './components/CompletedTracker';
import { SearchAndIndexModal } from './components/SearchAndIndexModal';
import { TaskModal } from './components/TaskModal';
import { VirtualPetModal } from './components/VirtualPetModal';
import { PetGardenView } from './components/PetGardenView';
import { AlarmAndAlertsModal } from './components/AlarmAndAlertsModal';
import { SettingsAndAccountModal } from './components/SettingsAndAccountModal';
import { GoogleAccountChooserModal } from './components/GoogleAccountChooserModal';
import { RealTimeClockBanner } from './components/RealTimeClockBanner';
import { LiveAlertToast } from './components/LiveAlertToast';
import { FocusOverlay } from './components/FocusOverlay';
import { useRealTimeNotifier } from './hooks/useRealTimeNotifier';

export default function App() {
  // 1. Student Profile State (Google Firebase Auth + Local Persistence)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const cachedAuth = loadData<UserProfile | null>(AUTH_STORAGE_KEY, null) || 
      (() => {
        try {
          const s = sessionStorage.getItem(AUTH_STORAGE_KEY);
          return s ? JSON.parse(s) : null;
        } catch (e) {
          return null;
        }
      })();
    if (cachedAuth && cachedAuth.isLoggedIn) {
      // Clear legacy stuck mock test id if it matches old mock
      if (cachedAuth.id === 'google_user_phuonghang') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        return DEFAULT_STUDENT_PROFILE;
      }
      return cachedAuth;
    }
    return DEFAULT_STUDENT_PROFILE;
  });

  const activeUid = (userProfile.isLoggedIn && userProfile.id) ? userProfile.id : 'guest';
  const initialKeys = getUserStorageKeys(activeUid);

  // 2. Settings state with user-partitioned configuration
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (userProfile.isLoggedIn && userProfile.id) {
      const uKeys = getUserStorageKeys(userProfile.id);
      const saved = loadData<UserSettings | null>(uKeys.SETTINGS, null);
      if (saved) return saved;
    }
    // Guest mode ALWAYS uses default TIMI settings
    return DEFAULT_USER_SETTINGS;
  });

  // Real-time DOM CSS variable & Font Size synchronization
  useEffect(() => {
    // 1. Font size
    const basePx = settings.fontSize === 'sm' ? '14px' : settings.fontSize === 'lg' ? '18px' : '16px';
    document.documentElement.style.fontSize = basePx;

    // 2. Theme body class
    const themeClass = `theme-${settings.theme}`;
    document.body.className = `${themeClass} selection:bg-[#FFD1DC] selection:text-[#7D2E49]`;
  }, [settings.fontSize, settings.theme]);

  // 3. Main Data States - Partitioned by active UID
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = loadData<Task[] | null>(initialKeys.TASKS, null);
    return Array.isArray(saved) ? saved : [];
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = loadData<ScheduleItem[] | null>(initialKeys.SCHEDULE, null);
    return Array.isArray(saved) ? saved : [];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = loadData<Appointment[] | null>(initialKeys.APPOINTMENTS, null);
    return Array.isArray(saved) ? saved : [];
  });

  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    const saved = loadData<AlarmItem[] | null>(initialKeys.ALARMS, null);
    return Array.isArray(saved) ? saved : [];
  });

  const [pet, setPet] = useState<VirtualPet>(() => {
    const saved = loadData<VirtualPet | null>(initialKeys.PET, null);
    if (saved) return saved;
    return createFreshUserData(userProfile).pet;
  });

  // Navigation state (includes Bé Mochi & Khu Vườn dedicated tab)
  const [activeView, setActiveView] = useState<'home' | 'schedule' | 'pomodoro' | 'pet_garden' | 'completed'>('home');
  const [homeTab, setHomeTab] = useState<'work' | 'life' | 'study'>('work');
  const [selectedTaskForPomodoro, setSelectedTaskForPomodoro] = useState<Task | null>(null);

  // Focus Overlay State (Khóa màn hình làm việc khi bật Pomodoro)
  const [isFocusOverlayOpen, setIsFocusOverlayOpen] = useState(false);
  const [focusOverlayTask, setFocusOverlayTask] = useState<Task | null>(null);
  const [focusOverlayMode, setFocusOverlayMode] = useState<'work' | 'break' | 'long_break'>('work');
  const [focusOverlayDuration, setFocusOverlayDuration] = useState<number>(25);
  const [focusOverlayInitialSeconds, setFocusOverlayInitialSeconds] = useState<number | undefined>(undefined);

  // Modal open states
  const [isSearchIndexOpen, setIsSearchIndexOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskCategory, setDefaultTaskCategory] = useState<'work' | 'life' | 'study'>('work');
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isAlarmsModalOpen, setIsAlarmsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'appearance' | 'profile' | 'notifications' | 'data'>('appearance');

  // Switch to specific authenticated user
  const handleSwitchToUser = async (profile: UserProfile) => {
    // If somehow legacy dummy mock ID is passed, ignore
    if (profile.id === 'google_user_phuonghang') {
      return;
    }
    setUserProfile(profile);
    saveData(AUTH_STORAGE_KEY, profile);
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {}
    localStorage.setItem('timi_current_active_user_id', profile.id || '');

    const uKeys = getUserStorageKeys(profile.id);
    const uSettings = loadData<UserSettings | null>(uKeys.SETTINGS, null) || DEFAULT_USER_SETTINGS;
    setSettings(uSettings);
    setTasks(loadData<Task[]>(uKeys.TASKS, []));
    setSchedule(loadData<ScheduleItem[]>(uKeys.SCHEDULE, []));
    setAppointments(loadData<Appointment[]>(uKeys.APPOINTMENTS, []));
    setAlarms(loadData<AlarmItem[]>(uKeys.ALARMS, []));
    const uPet = loadData<VirtualPet | null>(uKeys.PET, null);
    setPet(uPet || createFreshUserData(profile).pet);

    // Sync from Backend to retrieve customized university, major, studentCode
    try {
      const remote = await fetchBackendStudentProfile(profile.id, profile.email);
      if (remote) {
        setUserProfile(prev => ({
          ...prev,
          ...remote,
          university: remote.university || prev.university,
          major: remote.major || prev.major,
          studentCode: remote.studentCode || prev.studentCode,
          academicYear: remote.academicYear || prev.academicYear
        }));
      }
    } catch (err) {
      console.warn('Backend profile fetch deferred:', err);
    }
  };

  // Switch to guest and completely wipe personalization
  const handleLogout = () => {
    clearPersonalizationOnLogout();
    setUserProfile(DEFAULT_STUDENT_PROFILE);
    setSettings(DEFAULT_USER_SETTINGS);
    document.documentElement.style.fontSize = '16px';
    document.body.className = 'theme-sakura selection:bg-[#FFD1DC] selection:text-[#7D2E49]';
    setTasks([]);
    setSchedule([]);
    setAppointments([]);
    setAlarms([]);
    setPet(createFreshUserData(DEFAULT_STUDENT_PROFILE).pet);
    setActiveView('home');
    setIsSettingsModalOpen(false);
  };

  // Listen to Firebase Auth state changes in real time
  useEffect(() => {
    const unsubscribe = listenToAuthState((firebaseProfile) => {
      if (firebaseProfile && firebaseProfile.isLoggedIn) {
        handleSwitchToUser(firebaseProfile);
      }
    });
    return () => unsubscribe();
  }, []);

  // AUTO-SAVE EFFECTS TO LOCAL STORAGE - Strictly partitioned by active account UID
  useEffect(() => {
    if (userProfile.isLoggedIn && userProfile.id) {
      saveData(AUTH_STORAGE_KEY, userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    const keys = getUserStorageKeys(userProfile.isLoggedIn ? userProfile.id : 'guest');
    saveData(keys.TASKS, tasks);
  }, [tasks, userProfile.id, userProfile.isLoggedIn]);

  useEffect(() => {
    const keys = getUserStorageKeys(userProfile.isLoggedIn ? userProfile.id : 'guest');
    saveData(keys.SCHEDULE, schedule);
  }, [schedule, userProfile.id, userProfile.isLoggedIn]);

  useEffect(() => {
    const keys = getUserStorageKeys(userProfile.isLoggedIn ? userProfile.id : 'guest');
    saveData(keys.APPOINTMENTS, appointments);
  }, [appointments, userProfile.id, userProfile.isLoggedIn]);

  useEffect(() => {
    const keys = getUserStorageKeys(userProfile.isLoggedIn ? userProfile.id : 'guest');
    saveData(keys.ALARMS, alarms);
  }, [alarms, userProfile.id, userProfile.isLoggedIn]);

  useEffect(() => {
    const keys = getUserStorageKeys(userProfile.isLoggedIn ? userProfile.id : 'guest');
    saveData(keys.PET, pet);
  }, [pet, userProfile.id, userProfile.isLoggedIn]);

  useEffect(() => {
    if (userProfile.isLoggedIn && userProfile.id) {
      const keys = getUserStorageKeys(userProfile.id);
      saveData(keys.SETTINGS, settings);
    }
  }, [settings, userProfile.id, userProfile.isLoggedIn]);

  // Debounced sync to Backend Express Server for this student
  useEffect(() => {
    if (userProfile.isLoggedIn && userProfile.id) {
      const timer = setTimeout(() => {
        syncWorkspaceToBackend(userProfile.id!, userProfile.email, {
          tasks,
          schedule,
          appointments,
          alarms,
          pet
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [tasks, schedule, appointments, alarms, pet, userProfile.id, userProfile.email, userProfile.isLoggedIn]);

  // Update Settings with real-time individual key persistence
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (userProfile.isLoggedIn && userProfile.id) {
        const keys = getUserStorageKeys(userProfile.id);
        saveData(keys.SETTINGS, updated);
      }
      return updated;
    });
  };

  // ================= REAL-TIME CLOCK & ALERT SYSTEM =================
  const { currentDate, activeAlerts, dismissAlert, triggerTestAlert, notifySetupEvent } = useRealTimeNotifier({
    tasks,
    schedule,
    appointments,
    alarms,
    soundEnabled: settings.soundEnabled,
    onCompleteTask: (taskId) => handleToggleTask(taskId)
  });

  // ================= TASK HANDLERS =================
  const handleToggleTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            setPet(p => ({
              ...p,
              exp: p.exp + 15,
              stars: p.stars + 10,
              happiness: Math.min(100, p.happiness + 5)
            }));
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : undefined
          };
        }
        return t;
      });
      saveData(APP_STORAGE_KEYS.TASKS, updated);
      return updated;
    });
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      setTasks(prev => {
        const updated = prev.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t);
        saveData(APP_STORAGE_KEYS.TASKS, updated);
        return updated;
      });
    } else {
      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: taskData.title || '',
        note: taskData.note,
        category: taskData.category || 'work',
        flashcardColor: taskData.flashcardColor || 'red',
        priorityLabel: taskData.priorityLabel || 'Cần hoàn thành',
        subCategory: taskData.subCategory || (taskData.category === 'life' ? 'life_dining' : taskData.category === 'study' ? 'study_assignment' : 'work_important'),
        dueTime: taskData.dueTime,
        dueDate: taskData.dueDate || 'Hôm nay',
        durationMinutes: taskData.durationMinutes || 30,
        completed: false,
        soundAlert: taskData.soundAlert ?? true,
        notifyBeforeMinutes: taskData.notifyBeforeMinutes ?? 20,
        isPinned: taskData.isPinned ?? false
      };
      setTasks(prev => {
        const updated = [newTask, ...prev];
        saveData(APP_STORAGE_KEYS.TASKS, updated);
        return updated;
      });
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);

    if (taskData.dueTime) {
      notifySetupEvent(
        taskData.title || 'Công việc mới',
        taskData.dueTime,
        taskData.notifyBeforeMinutes ?? 20
      );
    } else {
      playSuccessSound();
    }
  };

  // Immediate Task Deletion with LocalStorage sync
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== taskId);
      saveData(APP_STORAGE_KEYS.TASKS, updated);
      return updated;
    });
    playChime('sweet');
  };

  const handleClearAllCompleted = () => {
    setTasks(prev => {
      const updated = prev.filter(t => !t.completed);
      saveData(APP_STORAGE_KEYS.TASKS, updated);
      return updated;
    });
    playChime('sweet');
  };

  // ================= FOCUS OVERLAY MODE (KHÓA MÀN HÌNH LÀM VIỆC) =================
  const handleStartFocusOverlay = (
    param: Task | { mode?: 'work' | 'break' | 'long_break'; durationMinutes?: number; initialSeconds?: number; task?: Task | null } | null
  ) => {
    if (param && typeof param === 'object' && 'mode' in param) {
      const mode = param.mode || 'work';
      const duration = param.durationMinutes || (
        mode === 'break' ? settings.pomodoroBreak || 5 : mode === 'long_break' ? settings.pomodoroLongBreak || 15 : settings.pomodoroWork || 25
      );
      setFocusOverlayMode(mode);
      setFocusOverlayDuration(duration);
      setFocusOverlayInitialSeconds(param.initialSeconds);
      setFocusOverlayTask(param.task || null);
    } else {
      const task = param as Task | null;
      setFocusOverlayMode('work');
      setFocusOverlayDuration(task?.durationMinutes || settings.pomodoroWork || 25);
      setFocusOverlayInitialSeconds(undefined);
      setFocusOverlayTask(task);
    }
    setIsFocusOverlayOpen(true);
  };

  const handleFocusOverlayCancel = () => {
    setIsFocusOverlayOpen(false);
    setFocusOverlayTask(null);
  };

  const handleFocusOverlayPauseAndExit = (_remainingSeconds: number) => {
    setIsFocusOverlayOpen(false);
  };

  const handleFocusOverlayResetAndExit = () => {
    setIsFocusOverlayOpen(false);
    setFocusOverlayTask(null);
  };

  const handleFocusOverlayComplete = (
    completedTask: Task | null, 
    completedMode: 'work' | 'break' | 'long_break' = 'work'
  ) => {
    const focusMinutes = focusOverlayDuration || completedTask?.durationMinutes || settings.pomodoroWork || 25;
    
    // Reward pet & student
    handleCompletePomodoroSession(focusMinutes);

    if (completedTask && completedMode === 'work') {
      handleToggleTask(completedTask.id);
    }

    // Save focus session history in localStorage
    const existingHistory = loadData<any[]>('timi_focus_sessions', []);
    const newSession = {
      id: `foc_${Date.now()}`,
      taskTitle: completedTask ? completedTask.title : (
        completedMode === 'work' ? 'Phiên Tập Trung Pomodoro' : completedMode === 'break' ? 'Nghỉ Ngắn Thư Giãn' : 'Nghỉ Dài'
      ),
      minutes: focusMinutes,
      mode: completedMode,
      completedAt: new Date().toISOString()
    };
    saveData('timi_focus_sessions', [newSession, ...existingHistory]);

    setIsFocusOverlayOpen(false);
    setFocusOverlayTask(null);
  };

  // ================= SCHEDULE HANDLERS =================
  const handleAddScheduleItem = (item: Partial<ScheduleItem>) => {
    const newItem: ScheduleItem = {
      id: `sch_${Date.now()}`,
      dayOfWeek: item.dayOfWeek ?? 1,
      startTime: item.startTime || '08:00',
      endTime: item.endTime || '10:00',
      title: item.title || '',
      category: item.category || 'study',
      location: item.location || '',
      sticker: item.sticker || 'books',
      alertBefore: item.alertBefore ?? 30,
      reminderSound: item.reminderSound || 'sweet',
      isBookmarked: item.isBookmarked ?? true,
      completed: false
    };
    setSchedule(prev => {
      const updated = [...prev, newItem];
      saveData(APP_STORAGE_KEYS.SCHEDULE, updated);
      return updated;
    });
    notifySetupEvent(
      newItem.title,
      newItem.startTime,
      newItem.alertBefore,
      newItem.location
    );
  };

  const handleDeleteScheduleItem = (id: string) => {
    setSchedule(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveData(APP_STORAGE_KEYS.SCHEDULE, updated);
      return updated;
    });
    playChime('sweet');
  };

  const handleToggleBookmark = (id: string) => {
    setSchedule(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, isBookmarked: !s.isBookmarked } : s);
      saveData(APP_STORAGE_KEYS.SCHEDULE, updated);
      return updated;
    });
  };

  // ================= APPOINTMENTS HANDLERS =================
  const handleAddAppointment = (apt: Partial<Appointment>) => {
    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      title: apt.title || '',
      date: apt.date || new Date().toISOString().split('T')[0],
      time: apt.time || '15:00',
      location: apt.location || '',
      alertMinutesBefore: apt.alertMinutesBefore ?? 30,
      note: apt.note,
      category: apt.category || 'study',
      completed: false
    };
    setAppointments(prev => {
      const updated = [newApt, ...prev];
      saveData(APP_STORAGE_KEYS.APPOINTMENTS, updated);
      return updated;
    });
    notifySetupEvent(
      newApt.title,
      newApt.time,
      newApt.alertMinutesBefore,
      newApt.location
    );
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveData(APP_STORAGE_KEYS.APPOINTMENTS, updated);
      return updated;
    });
    playChime('sweet');
  };

  const handleToggleAppointment = (id: string) => {
    setAppointments(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a);
      saveData(APP_STORAGE_KEYS.APPOINTMENTS, updated);
      return updated;
    });
  };

  // Pomodoro session completion
  const handleCompletePomodoroSession = (focusMinutes: number) => {
    setPet(p => ({
      ...p,
      exp: p.exp + focusMinutes,
      stars: p.stars + 15,
      streak: p.streak + 1,
      happiness: Math.min(100, p.happiness + 8)
    }));
  };

  // Profile update handler
  const handleUpdateProfile = (updatedProfile: UserProfile | null) => {
    if (updatedProfile && updatedProfile.isLoggedIn) {
      handleSwitchToUser(updatedProfile);
    } else {
      handleLogout();
    }
  };

  // Reset to clean empty initial workspace
  const handleResetData = () => {
    setTasks([]);
    setSchedule([]);
    setAppointments([]);
    setAlarms([]);
    const fresh = createFreshUserData(userProfile);
    setPet(fresh.pet);
    setSettings(loadSavedCustomizations(DEFAULT_USER_SETTINGS));
    saveData(APP_STORAGE_KEYS.TASKS, []);
    saveData(APP_STORAGE_KEYS.SCHEDULE, []);
    saveData(APP_STORAGE_KEYS.APPOINTMENTS, []);
    saveData(APP_STORAGE_KEYS.ALARMS, []);
  };

  // Export data as JSON
  const handleExportData = () => {
    const backupData = {
      userProfile,
      tasks,
      schedule,
      appointments,
      alarms,
      pet,
      settings,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TIMI_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import data from JSON
  const handleImportData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.userProfile) setUserProfile(parsed.userProfile);
      if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (Array.isArray(parsed.schedule)) setSchedule(parsed.schedule);
      if (Array.isArray(parsed.appointments)) setAppointments(parsed.appointments);
      if (Array.isArray(parsed.alarms)) setAlarms(parsed.alarms);
      if (parsed.pet) setPet(parsed.pet);
      if (parsed.settings) setSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data', e);
      return false;
    }
  };

  // Theme styling helpers
  const getThemeWrapperClass = () => {
    switch (settings.theme) {
      case 'mint': return 'theme-mint';
      case 'lavender': return 'theme-lavender';
      case 'peach':
      case 'sweet_peach': return 'theme-peach';
      case 'night_pastel': return 'theme-night_pastel';
      case 'sakura':
      default: return 'theme-sakura';
    }
  };

  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'nunito': return 'font-nunito';
      case 'bevietnam': return 'font-bevietnam';
      case 'quicksand':
      default: return 'font-quicksand';
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm': return 'font-size-sm';
      case 'lg': return 'font-size-lg';
      case 'md':
      default: return 'font-size-md';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeWrapperClass()} ${getFontFamilyClass()} ${getFontSizeClass()} flex flex-col transition-colors duration-300 selection:bg-[#FFD1DC] selection:text-[#7D2E49]`}>
      {/* 1. Fullscreen Focus Overlay Mode (Khóa màn hình làm việc khi bật Pomodoro) */}
      <FocusOverlay
        isOpen={isFocusOverlayOpen}
        task={focusOverlayTask}
        mode={focusOverlayMode}
        durationMinutes={focusOverlayDuration}
        initialSeconds={focusOverlayInitialSeconds}
        pet={pet}
        onCancel={handleFocusOverlayCancel}
        onPauseAndExit={handleFocusOverlayPauseAndExit}
        onResetAndExit={handleFocusOverlayResetAndExit}
        onComplete={handleFocusOverlayComplete}
      />

      {/* 2. Live Toast Alerts Popups */}
      <LiveAlertToast
        alerts={activeAlerts}
        onDismiss={dismissAlert}
        onCompleteTask={handleToggleTask}
      />

      {/* 3. Top Navbar with Google Student Profile & Real Time */}
      <Navbar
        userProfile={userProfile}
        pet={pet}
        settings={settings}
        activeView={activeView}
        currentTime={currentDate}
        onNavigate={(view) => setActiveView(view as any)}
        onOpenSearchAndIndex={() => setIsSearchIndexOpen(true)}
        onOpenPetModal={() => setActiveView('pet_garden')}
        onOpenAlarmsModal={() => setIsAlarmsModalOpen(true)}
        onOpenSettingsModal={() => {
          setSettingsTab('appearance');
          setIsSettingsModalOpen(true);
        }}
        onOpenGoogleChooser={() => setIsGoogleChooserOpen(true)}
        onOpenProfileTab={() => {
          setSettingsTab('profile');
          setIsSettingsModalOpen(true);
        }}
      />

      {/* 4. Student Status Banner */}
      <div className="bg-white/85 border-b border-[#FFE4E8] py-1.5 px-3 sm:px-4 text-center text-xs flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap animate-fadeIn shadow-2xs">
        {userProfile.picture ? (
          <img 
            src={userProfile.picture} 
            alt={userProfile.name} 
            className="w-5 h-5 rounded-full object-cover border border-[#FF85A1]" 
          />
        ) : (
          <span className="text-base">{userProfile.avatar || '👤'}</span>
        )}
        <span className="text-[#4A3B43]">
          {userProfile.isLoggedIn ? (
            <>Không gian học tập & làm việc của <strong>{userProfile.name}</strong></>
          ) : (
            <>Không gian học tập & làm việc của <strong>Khách (Chưa Đăng Nhập)</strong></>
          )}
        </span>
        {userProfile.isLoggedIn ? (
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
            Google Verified
          </span>
        ) : (
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-[11px] text-[#D81B60] font-bold hover:underline cursor-pointer"
          >
            (Đăng nhập Google)
          </button>
        )}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="text-[#D81B60] font-bold hover:underline ml-2 cursor-pointer flex items-center gap-1"
        >
          <Settings className="w-3 h-3 inline" /> Cài đặt & Chuông báo (30)
        </button>
      </div>

      {/* 5. Main App Container (Fully Responsive: 1 col mobile, 2 col tablet, multi desktop) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Real-Time Live Clock Banner */}
        <RealTimeClockBanner
          currentDate={currentDate}
          tasks={tasks}
          schedule={schedule}
          appointments={appointments}
          alarms={alarms}
          onTriggerTestAlert={triggerTestAlert}
        />

        {/* VIEW 1: HOME (Flashcards: Work / Life / Study) */}
        {activeView === 'home' && (
          <HomeSection
            tasks={tasks}
            activeTab={homeTab}
            onTabChange={(tab) => setHomeTab(tab)}
            onToggleTask={handleToggleTask}
            onEditTask={(t) => {
              setEditingTask(t);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onAddTask={(category) => {
              setEditingTask(null);
              setDefaultTaskCategory(category);
              setIsTaskModalOpen(true);
            }}
            onStartPomodoroForTask={(task) => {
              // Directly triggers Fullscreen Focus Overlay Mode
              handleStartFocusOverlay(task);
            }}
          />
        )}

        {/* VIEW 2: SCHEDULE & APPOINTMENTS */}
        {activeView === 'schedule' && (
          <ScheduleSection
            schedule={schedule}
            appointments={appointments}
            settings={settings}
            onAddScheduleItem={handleAddScheduleItem}
            onDeleteScheduleItem={handleDeleteScheduleItem}
            onToggleBookmark={handleToggleBookmark}
            onAddAppointment={handleAddAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onToggleAppointment={handleToggleAppointment}
          />
        )}

        {/* VIEW 3: POMODORO & COUNTDOWN */}
        {activeView === 'pomodoro' && (
          <PomodoroAndCountdown
            tasks={tasks}
            settings={settings}
            pet={pet}
            onOpenPetModal={() => setActiveView('pet_garden')}
            selectedTask={selectedTaskForPomodoro}
            onCompletePomodoroSession={handleCompletePomodoroSession}
            onUpdateSettings={handleUpdateSettings}
            onStartFocusOverlay={handleStartFocusOverlay}
          />
        )}

        {/* VIEW 4: COMPLETED TASKS & ANALYTICS */}
        {activeView === 'completed' && (
          <CompletedTracker
            tasks={tasks}
            streakCount={pet.streak}
            totalFocusMinutes={pet.exp}
            onRestoreTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onClearAllCompleted={handleClearAllCompleted}
            onOpenPetModal={() => setActiveView('pet_garden')}
          />
        )}

        {/* VIEW 5: BÉ MOCHI / THÚ CƯNG & KHU VƯỜN DEDICATED TAB */}
        {activeView === 'pet_garden' && (
          <PetGardenView
            pet={pet}
            onUpdatePet={(updater) => setPet(updater)}
            onNavigateToStudy={() => setActiveView('home')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 sm:py-5 border-t border-[#FFCCD5] bg-white/70 text-center text-xs text-[#8C6D7C] space-y-1 px-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="font-bold">TIMI Student Planner</span>
          <span>•</span>
          <span>Google Firebase Auth</span>
          <span>•</span>
          <span>Focus Overlay Mode</span>
          <span>•</span>
          <span className="text-[#FF85A1]">🌸 Pastel Aesthetic</span>
        </div>
        <p className="text-[11px] text-[#A68897]">
          Ứng dụng quản lý thời gian cá nhân độc lập dành cho sinh viên Việt Nam • Tối ưu mọi thiết bị
        </p>
      </footer>

      {/* ================= ALL APP MODALS ================= */}

      {/* 1. Search and Index Modal */}
      <SearchAndIndexModal
        isOpen={isSearchIndexOpen}
        onClose={() => setIsSearchIndexOpen(false)}
        tasks={tasks}
        schedule={schedule}
        appointments={appointments}
        onNavigateTo={(view: string) => setActiveView(view as any)}
        onSelectTask={(task) => {
          setEditingTask(task);
          setIsTaskModalOpen(true);
        }}
      />

      {/* 2. Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        defaultCategory={defaultTaskCategory}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* 3. Virtual Pet Modal */}
      <VirtualPetModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        pet={pet}
        onUpdatePet={(updatedPet) => setPet(prev => ({ ...prev, ...updatedPet }))}
      />

      {/* 4. Alarm & Alerts Modal with 30 Ringtone Choices */}
      <AlarmAndAlertsModal
        isOpen={isAlarmsModalOpen}
        onClose={() => setIsAlarmsModalOpen(false)}
        alarms={alarms}
        onAddAlarm={(alm) => {
          const newAlm: AlarmItem = {
            id: `alm_${Date.now()}`,
            time: alm.time || '06:30',
            label: alm.label || 'Báo thức',
            days: alm.days || [1, 2, 3, 4, 5],
            enabled: true,
            soundType: alm.soundType || 'sweet',
            snoozeMinutes: alm.snoozeMinutes ?? 5
          };
          setAlarms(prev => {
            const updated = [...prev, newAlm];
            saveData(APP_STORAGE_KEYS.ALARMS, updated);
            return updated;
          });
          notifySetupEvent(newAlm.label, newAlm.time, 0);
        }}
        onDeleteAlarm={(id) => {
          setAlarms(prev => {
            const updated = prev.filter(a => a.id !== id);
            saveData(APP_STORAGE_KEYS.ALARMS, updated);
            return updated;
          });
        }}
        onToggleAlarm={(id) => {
          setAlarms(prev => {
            const updated = prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
            saveData(APP_STORAGE_KEYS.ALARMS, updated);
            return updated;
          });
        }}
      />

      {/* 5. Settings & Student Profile Modal (Google Firebase Auth + Real-time Customizations) */}
      <SettingsAndAccountModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userProfile={userProfile}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onUpdateProfile={handleUpdateProfile}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
        initialTab={settingsTab}
      />

      {/* 6. Root Google Account Chooser & Multi-Student Account Switcher */}
      <GoogleAccountChooserModal
        isOpen={isGoogleChooserOpen}
        onClose={() => setIsGoogleChooserOpen(false)}
        currentEmail={userProfile.isLoggedIn ? userProfile.email : undefined}
        onSelectAccount={(chosen) => {
          handleSwitchToUser(chosen);
          setIsGoogleChooserOpen(false);
        }}
      />
    </div>
  );
}
