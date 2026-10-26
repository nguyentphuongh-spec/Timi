export type FlashcardColor = 'red' | 'orange' | 'yellow' | 'white';

export interface UserProfile {
  name: string;
  university?: string;
  major?: string;
  studentCode?: string; // Mã số sinh viên
  academicYear?: string; // Khóa / Năm học
  phone?: string;
  bio?: string;
  avatar: string;
  canNotify: boolean;
  canBookmark: boolean;
  email?: string;
  id?: string;
  createdAt?: string;
  provider?: 'google' | 'guest';
  picture?: string;
  isLoggedIn?: boolean;
  linkedGoogle?: boolean;
}

export type UserAccount = UserProfile;

export interface LiveAlert {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'schedule' | 'appointment' | 'alarm' | 'setup';
  time: string;
  timestamp: number;
  read?: boolean;
}

export interface Task {
  id: string;
  title: string;
  note?: string;
  category: 'work' | 'life' | 'study';
  flashcardColor: FlashcardColor;
  priorityLabel: string;
  subCategory: 
    | 'work_routine'       // Làm thêm, đi học thường ngày (Cam)
    | 'work_important'     // Rất quan trọng (Đỏ)
    | 'work_general'       // Cần hoàn thành (Vàng) hoặc thường (Trắng)
    | 'study_assignment'   // Bài tập
    | 'study_extra'        // Học thêm
    | 'study_reading'      // Đọc sách
    | 'study_softskills'   // Kỹ năng mềm
    | 'life_dining'        // Ăn uống
    | 'life_entertainment' // Giải trí
    | 'life_fitness';      // Vận động
  dueTime?: string; // e.g. "14:30"
  dueDate?: string; // YYYY-MM-DD
  durationMinutes: number;
  completed: boolean;
  completedAt?: string;
  soundAlert: boolean;
  notifyBeforeMinutes: number; // 0, 15, 20, 30
  isPinned?: boolean;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: number; // 0: CN, 1: T2, 2: T3, ... 6: T7
  startTime: string; // "07:00"
  endTime: string;   // "09:30"
  title: string;
  category: 'study' | 'work' | 'personal';
  location?: string;
  sticker?: string;
  alertBefore: number; // 20, 30, 15, 0
  reminderSound: string;
  isBookmarked: boolean;
  completed?: boolean;
  notes?: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // "15:00"
  location: string;
  alertMinutesBefore: 0 | 15 | 20 | 30;
  note?: string;
  category: 'study' | 'work' | 'personal';
  completed: boolean;
  dismissedAlert?: boolean;
}

export type SoundPreset = 
  // Dịu dàng & Thư thái (Gentle)
  | 'sweet' | 'gentle_chime' | 'zen_bell' | 'lofi_vibes' 
  | 'harp_glissando' | 'ocean_waves_breeze' | 'rain_on_leaves' | 'tibetan_bowl_deep'
  // Dễ thương & Nhí nhảnh (Cute)
  | 'kawaii_twinkle' | 'cat_purr' | 'marimba' | 'birds' | 'bubble_pop'
  | 'puppy_bark' | 'magic_fairy_wand' | 'music_box_lullaby' | 'baby_laugh_giggle' | 'game_coin_jump'
  // Đơn giản & Tối giản (Simple)
  | 'bell' | 'digital_beep' | 'soft_ping' | 'clock_tick'
  | 'single_tone' | 'radar_pulse' | 'typewriter_bell' | 'metronome_wood'
  // Mạnh mẽ & Quyết liệt (Powerful)
  | 'urgent_alarm' | 'drum_roll' | 'arcade_fanfare' | 'super_loud_siren'
  | 'electric_guitar_riff' | 'battle_horn' | 'emergency_buzzer' | 'epic_orchestra';

export interface SoundInfo {
  id: SoundPreset;
  name: string;
  category: 'gentle' | 'cute' | 'simple' | 'powerful';
  categoryLabel: string;
  icon: string;
  description: string;
}

export interface AlarmItem {
  id: string;
  time: string; // "06:30"
  label: string;
  days: number[]; // [1,2,3,4,5]
  enabled: boolean;
  soundType: SoundPreset;
  snoozeMinutes: number;
}

export interface PetItem {
  id: string;
  name: string;
  type: 'hat' | 'accessory' | 'costume';
  icon: string;
  requiredStreak: number;
  starPrice: number;
  description: string;
  svgLayer: string; // identifier for rendering
}

export type ShopCategory = 'food' | 'toy' | 'costume' | 'house' | 'garden' | 'effect';

export interface GardenShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  categoryLabel: string;
  icon: string;
  price: number;
  description: string;
  bonusDesc: string;
}

export interface VirtualPet {
  type: 'cat' | 'rabbit' | 'bear' | 'fox' | 'penguin' | 'puppy';
  name: string;
  level: number;
  exp: number;
  streak: number;
  stars: number;
  coins: number;      // Tiền vàng / Xu thưởng
  happiness: number;  // 0 - 100
  hunger: number;     // 0 - 100 (100 = no nê)
  energy: number;     // 0 - 100
  equippedHat?: string;
  equippedAccessory?: string;
  equippedHouse?: string;
  equippedGardenDecor?: string[];
  equippedEffect?: string;
  unlockedItems: string[];
  inventory: { [itemId: string]: number }; // Quantity of consumable items like food/toys
  claimedMilestones?: number[];
  lastSpinDate?: string;
}

export interface UserSettings {
  fontSize: 'sm' | 'md' | 'lg';
  fontFamily: 'quicksand' | 'nunito' | 'bevietnam';
  theme: 'sakura' | 'mint' | 'lavender' | 'peach' | 'sweet_peach' | 'night_pastel';
  soundPreset: SoundPreset;
  timetableDecor: 'mimi_cats' | 'study_icons' | 'cafe_aesthetic' | 'cherry_blossom' | 'sparkles' | 'strawberries' | 'boba';
  pomodoroWork: number;       // default 25
  pomodoroBreak: number;      // default 5
  pomodoroLongBreak: number;  // default 15
  soundEnabled: boolean;
  notificationsAllowed: boolean;
  allowScheduleBookmark: boolean;
  allowScheduleAlerts: boolean;
}

export interface ProductivitySummary {
  completedTodayCount: number;
  focusMinutesToday: number;
  streakCount: number;
  weeklyHistory: {
    day: string;
    completed: number;
    focusMinutes: number;
  }[];
}
