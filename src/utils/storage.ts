import { 
  Task, 
  ScheduleItem, 
  Appointment, 
  AlarmItem, 
  VirtualPet, 
  PetItem, 
  UserSettings, 
  UserAccount,
  UserProfile,
  GardenShopItem
} from '../types';

// Expanded Pet Catalog with 20 rich student-tailored costumes, hats, and accessories
export const PET_CATALOG: PetItem[] = [
  // --- NÓN & MŨ (HATS & HEADWEAR) ---
  {
    id: 'pink_ribbon',
    name: 'Nơ Hồng Pastel',
    type: 'hat',
    icon: '🎀',
    requiredStreak: 1,
    starPrice: 15,
    description: 'Chiếc nơ hoa xinh xắn cho ngày đầu chăm chỉ học tập',
    svgLayer: 'pink_ribbon'
  },
  {
    id: 'student_cap',
    name: 'Mũ Cử Nhân Đại Học',
    type: 'hat',
    icon: '🎓',
    requiredStreak: 3,
    starPrice: 40,
    description: 'Tượng trưng cho sự chuyên cần, nỗ lực đạt học bổng',
    svgLayer: 'student_cap'
  },
  {
    id: 'strawberry_beret',
    name: 'Mũ Nồi Dâu Tây',
    type: 'hat',
    icon: '🍓',
    requiredStreak: 5,
    starPrice: 60,
    description: 'Phong cách Hàn Quốc ngọt ngào mùa ôn thi',
    svgLayer: 'strawberry_beret'
  },
  {
    id: 'angel_halo',
    name: 'Vòng Thiên Thần',
    type: 'hat',
    icon: '✨',
    requiredStreak: 7,
    starPrice: 90,
    description: 'Dành riêng cho sinh viên có chuỗi 7 ngày hoàn hảo',
    svgLayer: 'angel_halo'
  },
  {
    id: 'sunflower_band',
    name: 'Bờm Hoa Hướng Dương',
    type: 'hat',
    icon: '🌻',
    requiredStreak: 2,
    starPrice: 25,
    description: 'Mang lại tinh thần lạc quan, rạng rỡ mỗi buổi sáng',
    svgLayer: 'sunflower_band'
  },
  {
    id: 'frog_hat',
    name: 'Mũ Ếch Xanh Dễ Thương',
    type: 'hat',
    icon: '🐸',
    requiredStreak: 4,
    starPrice: 50,
    description: 'Mũ len ếch mắt tròn tinh nghịch cho bé cưng',
    svgLayer: 'frog_hat'
  },
  {
    id: 'royal_crown',
    name: 'Vương Miện Thủ Khoa',
    type: 'hat',
    icon: '👑',
    requiredStreak: 10,
    starPrice: 150,
    description: 'Đặc quyền cho sinh viên kiên trì đạt chuỗi 10 ngày',
    svgLayer: 'royal_crown'
  },
  {
    id: 'warm_beanie',
    name: 'Mũ Len Mùa Thi',
    type: 'hat',
    icon: '🧶',
    requiredStreak: 6,
    starPrice: 70,
    description: 'Giữ ấm đôi tai và tập trung ôn tập đêm khuya',
    svgLayer: 'warm_beanie'
  },
  {
    id: 'bunny_ears',
    name: 'Băng Đô Tai Thỏ',
    type: 'hat',
    icon: '🐰',
    requiredStreak: 3,
    starPrice: 35,
    description: 'Tai thỏ nhung trắng mềm mại siêu đáng yêu',
    svgLayer: 'bunny_ears'
  },

  // --- PHỤ KIỆN & ĐỒ DÙNG (ACCESSORIES & ITEMS) ---
  {
    id: 'boba_tea',
    name: 'Ly Trà Sữa Trân Châu',
    type: 'accessory',
    icon: '🧋',
    requiredStreak: 1,
    starPrice: 20,
    description: 'Tiếp thêm 100% năng lượng chạy deadline bài tập',
    svgLayer: 'boba_tea'
  },
  {
    id: 'smart_glasses',
    name: 'Kính Cận Tri Thức',
    type: 'accessory',
    icon: '👓',
    requiredStreak: 2,
    starPrice: 30,
    description: 'Tăng 200% độ tập trung khi ngồi học ở thư viện',
    svgLayer: 'smart_glasses'
  },
  {
    id: 'magic_wand',
    name: 'Bút Chì Lấp Lánh',
    type: 'accessory',
    icon: '🪄',
    requiredStreak: 4,
    starPrice: 55,
    description: 'Giải quyết mọi bài tập khó trong tích tắc',
    svgLayer: 'magic_wand'
  },
  {
    id: 'mini_laptop',
    name: 'Laptop Mini Chạy Deadline',
    type: 'accessory',
    icon: '💻',
    requiredStreak: 5,
    starPrice: 75,
    description: 'Công cụ gõ đồ án và làm bài thuyết trình nhóm',
    svgLayer: 'mini_laptop'
  },
  {
    id: 'lofi_headphones',
    name: 'Tai Nghe Chống Ồn Lofi',
    type: 'accessory',
    icon: '🎧',
    requiredStreak: 6,
    starPrice: 85,
    description: 'Cách ly tạp âm để tập trung 100% cùng Pomodoro',
    svgLayer: 'lofi_headphones'
  },
  {
    id: 'student_backpack',
    name: 'Balo Sinh Viên Đi Học',
    type: 'accessory',
    icon: '🎒',
    requiredStreak: 3,
    starPrice: 45,
    description: 'Chiếc balo đựng tài liệu và giáo trình đại học',
    svgLayer: 'student_backpack'
  },
  {
    id: 'strawberry_cake',
    name: 'Bánh Kem Dâu Sinh Nhật',
    type: 'accessory',
    icon: '🍰',
    requiredStreak: 8,
    starPrice: 110,
    description: 'Món quà ngọt ngào tự thưởng sau kỳ thi căng thẳng',
    svgLayer: 'strawberry_cake'
  },
  {
    id: 'gold_medal',
    name: 'Huy Chương Xuất Sắc',
    type: 'accessory',
    icon: '🏅',
    requiredStreak: 9,
    starPrice: 130,
    description: 'Huy chương vàng tôn vinh tinh thần tự học kỷ luật',
    svgLayer: 'gold_medal'
  },
  {
    id: 'coffee_cup',
    name: 'Cốc Cà Phê Sáng Tỉnh Táo',
    type: 'accessory',
    icon: '☕',
    requiredStreak: 2,
    starPrice: 25,
    description: 'Đánh thức não bộ cho ca học sớm lúc 7h sáng',
    svgLayer: 'coffee_cup'
  },
  {
    id: 'water_bottle',
    name: 'Bình Nước Pastel',
    type: 'accessory',
    icon: '💧',
    requiredStreak: 1,
    starPrice: 15,
    description: 'Nhắc nhở uống đủ 2 lít nước mỗi ngày thanh lọc cơ thể',
    svgLayer: 'water_bottle'
  },
  {
    id: 'bubble_tea_hat',
    name: 'Mũ Cốc Trà Sữa Ngọt Ngào',
    type: 'hat',
    icon: '🥤',
    requiredStreak: 4,
    starPrice: 50,
    description: 'Chiếc mũ trà sữa xinh xắn mang lại cảm hứng học tập',
    svgLayer: 'bubble_tea_hat'
  },
  {
    id: 'sakura_umbrella',
    name: 'Ô Hoa Anh Đào Pastel',
    type: 'accessory',
    icon: '☂️',
    requiredStreak: 7,
    starPrice: 95,
    description: 'Chiếc ô che mưa nắng lãng mạn trên con đường đến giảng đường',
    svgLayer: 'sakura_umbrella'
  },
  {
    id: 'artist_palette',
    name: 'Bảng Màu Sáng Tạo',
    type: 'accessory',
    icon: '🎨',
    requiredStreak: 5,
    starPrice: 65,
    description: 'Tăng cường tư duy sáng tạo khi làm đồ án và bài tập nhóm',
    svgLayer: 'artist_palette'
  },
  {
    id: 'angel_wings',
    name: 'Cánh Thiên Thần Pastel',
    type: 'accessory',
    icon: '🪽',
    requiredStreak: 14,
    starPrice: 200,
    description: 'Phần thưởng chuỗi 14 ngày kỷ luật học tập hoàn hảo',
    svgLayer: 'angel_wings'
  },
  {
    id: 'wizard_cape',
    name: 'Áo Choàng Phù Thủy Học Thuật',
    type: 'accessory',
    icon: '🧙‍♀️',
    requiredStreak: 21,
    starPrice: 350,
    description: 'Phần thưởng danh giá chuỗi 21 ngày hình thành thói quen vàng',
    svgLayer: 'wizard_cape'
  },
  {
    id: 'honor_trophy',
    name: 'Cúp Vàng Danh Dự TIMI',
    type: 'accessory',
    icon: '🏆',
    requiredStreak: 30,
    starPrice: 500,
    description: 'Biểu tượng tối thượng vinh danh sinh viên kiên trì 30 ngày',
    svgLayer: 'honor_trophy'
  },
  {
    id: 'detective_hat',
    name: 'Mũ Thám Tử Sherlock',
    type: 'hat',
    icon: '🕵️',
    requiredStreak: 8,
    starPrice: 120,
    description: 'Tập trung phá vỡ mọi bài toán hóc búa và đề thi khó',
    svgLayer: 'detective_hat'
  },
  {
    id: 'fox_ears',
    name: 'Bờm Tai Cáo Cam Nhí Nhảnh',
    type: 'hat',
    icon: '🦊',
    requiredStreak: 4,
    starPrice: 55,
    description: 'Bờm tai cáo thông minh lém lỉnh cho buổi học nhóm năng nổ',
    svgLayer: 'fox_ears'
  },
  {
    id: 'crystal_crown',
    name: 'Vương Miện Kim Cương Tinh Xảo',
    type: 'hat',
    icon: '💎',
    requiredStreak: 45,
    starPrice: 700,
    description: 'Phần thưởng danh giá đỉnh cao chuỗi 45 ngày kiên trì rực rỡ',
    svgLayer: 'crystal_crown'
  },
  {
    id: 'winter_scarf',
    name: 'Khăn Quàng Cổ Ấm Áp',
    type: 'accessory',
    icon: '🧣',
    requiredStreak: 5,
    starPrice: 60,
    description: 'Khăn len pastel giữ ấm cổ họng trong những ngày ôn thi trời lạnh',
    svgLayer: 'winter_scarf'
  },
  {
    id: 'stylish_shades',
    name: 'Kính Râm Idol Siêu Ngầu',
    type: 'accessory',
    icon: '🕶️',
    requiredStreak: 6,
    starPrice: 80,
    description: 'Tự tin 100% bước vào phòng thi và bảo vệ đồ án tốt nghiệp',
    svgLayer: 'stylish_shades'
  },
  {
    id: 'unicorn_wings',
    name: 'Đôi Cánh Kỳ Lân Ánh Sáng',
    type: 'accessory',
    icon: '🦄',
    requiredStreak: 60,
    starPrice: 900,
    description: 'Kỳ tích 60 ngày hoàn hảo, chấp cánh bay đến đỉnh vinh quang',
    svgLayer: 'unicorn_wings'
  },
  {
    id: 'study_lamp',
    name: 'Đèn Bàn Cú Đêm Học Giỏi',
    type: 'accessory',
    icon: '💡',
    requiredStreak: 12,
    starPrice: 160,
    description: 'Thắp sáng tri thức trong những đêm miệt mài nghiên cứu bài giảng',
    svgLayer: 'study_lamp'
  },
  {
    id: 'leather_notebook',
    name: 'Sổ Tay Bìa Da Kỷ Yếu',
    type: 'accessory',
    icon: '📓',
    requiredStreak: 15,
    starPrice: 220,
    description: 'Ghi lại mọi kiến thức quý giá và ước mơ tương lai đại học',
    svgLayer: 'leather_notebook'
  },
  {
    id: 'smart_thermos',
    name: 'Bình Giữ Nhiệt Trà Thơm',
    type: 'accessory',
    icon: '🍶',
    requiredStreak: 7,
    starPrice: 90,
    description: 'Trà nóng thanh lọc tinh thần giúp tỉnh táo suốt 4 tiết học liền',
    svgLayer: 'smart_thermos'
  }
];

// Rich Shop Catalog for Virtual Pet & Mini Garden System
export const GARDEN_SHOP_CATALOG: GardenShopItem[] = [
  // 1. THỨC ĂN (FOOD)
  {
    id: 'food_fish',
    name: 'Cá Ngừ Tươi Ngon',
    category: 'food',
    categoryLabel: 'Thức Ăn',
    icon: '🐟',
    price: 10,
    description: 'Bữa ăn giàu đạm giúp thú cưng no căng bụng',
    bonusDesc: '+35 No bụng • +15 Vui vẻ'
  },
  {
    id: 'food_boba',
    name: 'Trà Sữa Trân Châu Mini',
    category: 'food',
    categoryLabel: 'Thức Ăn',
    icon: '🧋',
    price: 15,
    description: 'Món giải khát ngọt ngào tiếp năng lượng chạy deadline',
    bonusDesc: '+25 No bụng • +30 Vui vẻ'
  },
  {
    id: 'food_cake',
    name: 'Bánh Dâu Tây Ngọt',
    category: 'food',
    categoryLabel: 'Thức Ăn',
    icon: '🍰',
    price: 18,
    description: 'Món tráng miệng sinh viên yêu thích cuối tuần',
    bonusDesc: '+30 No bụng • +25 Vui vẻ'
  },
  {
    id: 'food_sushi',
    name: 'Đĩa Sushi Nhật Bản',
    category: 'food',
    categoryLabel: 'Thức Ăn',
    icon: '🍣',
    price: 25,
    description: 'Thức ăn hảo hạng hồi phục 100% năng lượng',
    bonusDesc: '+50 No bụng • +35 Năng lượng'
  },

  // 2. ĐỒ CHƠI (TOYS)
  {
    id: 'toy_yarn',
    name: 'Cuộn Len Cầu Vồng',
    category: 'toy',
    categoryLabel: 'Đồ Chơi',
    icon: '🧶',
    price: 20,
    description: 'Bé cưng có thể vờn nghịch cả ngày không chán',
    bonusDesc: '+40 Vui vẻ • +15 Năng lượng'
  },
  {
    id: 'toy_bell',
    name: 'Quả Chuông Lục Lạc',
    category: 'toy',
    categoryLabel: 'Đồ Chơi',
    icon: '🔔',
    price: 25,
    description: 'Phát ra âm thanh lách cách vui tai',
    bonusDesc: '+35 Vui vẻ • Giảm căng thẳng'
  },
  {
    id: 'toy_duck',
    name: 'Vịt Cao Su Vàng',
    category: 'toy',
    categoryLabel: 'Đồ Chơi',
    icon: '🦆',
    price: 30,
    description: 'Chú vịt kêu bíp bíp siêu dễ thương',
    bonusDesc: '+45 Vui vẻ • +20 Năng lượng'
  },

  // 3. TRANG PHỤC & PHỤ KIỆN (COSTUMES)
  {
    id: 'pink_ribbon',
    name: 'Nơ Hồng Pastel',
    category: 'costume',
    categoryLabel: 'Trang Phục',
    icon: '🎀',
    price: 35,
    description: 'Nơ lụa thắt xinh xắn cho ngày chăm chỉ',
    bonusDesc: 'Tăng vẻ ngoài đáng yêu'
  },
  {
    id: 'student_cap',
    name: 'Mũ Cử Nhân Thủ Khoa',
    category: 'costume',
    categoryLabel: 'Trang Phục',
    icon: '🎓',
    price: 60,
    description: 'Biểu tượng học thuật xuất sắc của sinh viên',
    bonusDesc: 'Khí chất thủ khoa giảng đường'
  },
  {
    id: 'smart_glasses',
    name: 'Kính Cận Tri Thức',
    category: 'costume',
    categoryLabel: 'Trang Phục',
    icon: '👓',
    price: 45,
    description: 'Tăng 200% phong thái tập trung trong thư viện',
    bonusDesc: 'Tri thức & chăm chỉ'
  },
  {
    id: 'angel_halo',
    name: 'Vòng Thiên Thần Tinh Khôi',
    category: 'costume',
    categoryLabel: 'Trang Phục',
    icon: '✨',
    price: 90,
    description: 'Vòng hào quang lấp lánh ban phước may mắn',
    bonusDesc: 'Hào quang rực rỡ'
  },

  // 4. NHÀ CỬA & NÂNG CẤP (HOUSES)
  {
    id: 'house_wood',
    name: 'Nhà Gỗ Pastel Mini',
    category: 'house',
    categoryLabel: 'Nhà Cửa',
    icon: '🏡',
    price: 80,
    description: 'Ngôi nhà ấm cúng mái ngói hồng cho thú cưng nghỉ ngơi',
    bonusDesc: 'Hồi phục năng lượng nhanh hơn khi ngủ'
  },
  {
    id: 'house_mushroom',
    name: 'Biệt Thự Nấm Thần Tiên',
    category: 'house',
    categoryLabel: 'Nhà Cửa',
    icon: '🍄',
    price: 150,
    description: 'Ngôi nhà hình cây nấm đỏ đốm trắng phong cách cổ tích',
    bonusDesc: 'Tăng 25% điểm vui vẻ tối đa'
  },
  {
    id: 'house_castle',
    name: 'Lâu Đài Mây Bồng Bềnh',
    category: 'house',
    categoryLabel: 'Nhà Cửa',
    icon: '🏰',
    price: 300,
    description: 'Lâu đài nguy nga trôi nhẹ giữa vườn hoa',
    bonusDesc: 'Công trình kiến trúc đỉnh cao'
  },

  // 5. CÂY CỎ & TRANG TRÍ VƯỜN (GARDEN DECOR)
  {
    id: 'decor_sakura_tree',
    name: 'Cây Hoa Anh Đào Nở Rộ',
    category: 'garden',
    categoryLabel: 'Trang Trí Vườn',
    icon: '🌸',
    price: 50,
    description: 'Tán cây anh đào nở rộ thả những cánh hoa bay lãng mạn',
    bonusDesc: 'Cảnh sắc mùa xuân cho khu vườn'
  },
  {
    id: 'decor_fence',
    name: 'Hàng Rào Trắng Xinh',
    category: 'garden',
    categoryLabel: 'Trang Trí Vườn',
    icon: '🪵',
    price: 35,
    description: 'Hàng rào gỗ trắng bảo vệ khu vườn nhỏ bình yên',
    bonusDesc: 'Khuôn viên xinh xắn gọn gàng'
  },
  {
    id: 'decor_clover',
    name: 'Bãi Cỏ 4 Lá May Mắn',
    category: 'garden',
    categoryLabel: 'Trang Trí Vườn',
    icon: '🍀',
    price: 40,
    description: 'Mang lại điềm lành cho kỳ thi và bài kiểm tra tới',
    bonusDesc: 'May mắn trong học tập'
  },
  {
    id: 'decor_fountain',
    name: 'Hồ Sen Suối Nước Nhỏ',
    category: 'garden',
    categoryLabel: 'Trang Trí Vườn',
    icon: '⛲',
    price: 95,
    description: 'Tiếng nước chảy róc rách giúp thanh lọc tâm trí',
    bonusDesc: 'Âm thanh tự nhiên thư giãn'
  },

  // 6. HIỆU ỨNG THỊ GIÁC (EFFECTS)
  {
    id: 'effect_hearts',
    name: 'Hiệu Ứng Trái Tim Bay',
    category: 'effect',
    categoryLabel: 'Hiệu Ứng',
    icon: '💖',
    price: 70,
    description: 'Những trái tim hồng nhỏ bay lơ lửng quanh thú cưng',
    bonusDesc: 'Hiệu ứng tình cảm ngọt ngào'
  },
  {
    id: 'effect_sparkles',
    name: 'Bụi Sao Lấp Lánh Vàng',
    category: 'effect',
    categoryLabel: 'Hiệu Ứng',
    icon: '⭐',
    price: 85,
    description: 'Bụi sao lấp lánh tỏa sáng mỗi bước đi của bé cưng',
    bonusDesc: 'Hào quang rực rỡ kỳ ảo'
  },
  {
    id: 'effect_meteor',
    name: 'Mưa Sao Băng Bầu Trời',
    category: 'effect',
    categoryLabel: 'Hiệu Ứng',
    icon: '🌠',
    price: 180,
    description: 'Bầu trời đêm có những vệt sao băng bay ngang qua khu vườn',
    bonusDesc: 'Ước mơ thành hiện thực'
  }
];

// Default blank guest/new visitor profile when no account is logged in
export const DEFAULT_STUDENT_PROFILE: UserProfile = {
  id: '',
  name: 'Chưa Đăng Nhập',
  university: '',
  major: '',
  avatar: '👤',
  canNotify: false,
  canBookmark: false,
  email: '',
  createdAt: '',
  isLoggedIn: false
};

// Default settings template
export const DEFAULT_USER_SETTINGS: UserSettings = {
  fontSize: 'md',
  fontFamily: 'quicksand',
  theme: 'sakura',
  soundPreset: 'sweet',
  timetableDecor: 'mimi_cats',
  pomodoroWork: 25,
  pomodoroBreak: 5,
  pomodoroLongBreak: 15,
  soundEnabled: true,
  notificationsAllowed: true,
  allowScheduleBookmark: true,
  allowScheduleAlerts: true
};

// Keys specifically requested for customization persistence
export const CUSTOM_THEME_KEYS = {
  FONT_SIZE: 'saved_font_size',
  THEME_COLOR: 'saved_theme_color',
  STICKER: 'saved_sticker',
  RINGTONE: 'saved_ringtone'
};

// Load initial customizations
export function loadSavedCustomizations(defaults: UserSettings): UserSettings {
  if (typeof window === 'undefined') return defaults;
  const savedFontSize = localStorage.getItem(CUSTOM_THEME_KEYS.FONT_SIZE) as any;
  const savedThemeColor = localStorage.getItem(CUSTOM_THEME_KEYS.THEME_COLOR) as any;
  const savedSticker = localStorage.getItem(CUSTOM_THEME_KEYS.STICKER) as any;
  const savedRingtone = localStorage.getItem(CUSTOM_THEME_KEYS.RINGTONE) as any;

  return {
    ...defaults,
    fontSize: savedFontSize || defaults.fontSize,
    theme: savedThemeColor || defaults.theme,
    timetableDecor: savedSticker || defaults.timetableDecor,
    soundPreset: savedRingtone || defaults.soundPreset
  };
}

// Persist single customization in real time
export function persistCustomization(key: keyof typeof CUSTOM_THEME_KEYS, value: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_THEME_KEYS[key], value);
  } catch (err) {
    console.warn('Could not persist customization:', err);
  }
}

// Creates a fresh, clean, independent workspace with NO dummy/hardcoded starter cards
export function createFreshUserData(user?: Partial<UserAccount>) {
  const userName = user?.name && user.name !== 'Chưa Đăng Nhập' ? user.name : 'Bạn';
  const defaultPet: VirtualPet = {
    type: 'cat',
    name: `Bé Mochi của ${userName}`,
    level: 1,
    exp: 0,
    streak: 0,
    stars: 20,
    coins: 50, // 50 starting coins to buy first treat
    happiness: 85,
    hunger: 80,
    energy: 90,
    equippedHat: 'pink_ribbon',
    equippedHouse: 'house_wood',
    equippedGardenDecor: ['decor_sakura_tree', 'decor_clover'],
    equippedEffect: 'effect_sparkles',
    unlockedItems: ['pink_ribbon', 'house_wood', 'decor_sakura_tree', 'decor_clover', 'effect_sparkles'],
    inventory: {
      food_fish: 2,
      toy_yarn: 1
    }
  };

  return {
    pet: defaultPet,
    tasks: [], // Empty state as requested by user
    schedule: [],
    appointments: [],
    alarms: [],
    water: 0, // 0 glasses default
    settings: loadSavedCustomizations(DEFAULT_USER_SETTINGS)
  };
}

// User-specific storage keys generator for absolute data isolation between accounts
export const getUserStorageKeys = (userId?: string) => {
  const id = (userId && userId.trim()) ? userId.trim() : 'guest';
  return {
    SETTINGS: `user_data_${id}_settings`,
    TASKS: `user_data_${id}_tasks`,
    SCHEDULE: `user_data_${id}_schedule`,
    APPOINTMENTS: `user_data_${id}_appointments`,
    ALARMS: `user_data_${id}_alarms`,
    WATER: `user_data_${id}_water`,
    PET: `user_data_${id}_pet`,
    UNIVERSITY: `user_data_${id}_university`,
    MAJOR: `user_data_${id}_major`
  };
};

// Immediate cleanup of personal configurations on logout, restoring default guest mode
export function clearPersonalizationOnLogout(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_THEME_KEYS.FONT_SIZE);
    localStorage.removeItem(CUSTOM_THEME_KEYS.THEME_COLOR);
    localStorage.removeItem(CUSTOM_THEME_KEYS.STICKER);
    localStorage.removeItem(CUSTOM_THEME_KEYS.RINGTONE);
    localStorage.removeItem('timi_water_glasses');
    localStorage.removeItem('timi_firebase_auth_user');
    localStorage.removeItem('timi_student_profile');
    localStorage.removeItem('timi_current_active_user_id');
  } catch (err) {
    console.warn('Storage cleanup notice:', err);
  }

  // Restore DOM styles directly
  try {
    document.documentElement.style.fontSize = '16px';
    document.body.className = 'theme-sakura selection:bg-[#FFD1DC] selection:text-[#7D2E49]';
  } catch (e) {}
}

export const APP_STORAGE_KEYS = {
  PROFILE: 'timi_student_profile',
  SETTINGS: 'timi_student_settings',
  PET: 'timi_student_pet',
  TASKS: 'timi_student_tasks',
  SCHEDULE: 'timi_student_schedule',
  APPOINTMENTS: 'timi_student_appointments',
  ALARMS: 'timi_student_alarms'
};

export const GLOBAL_STORAGE_KEYS = {
  CURRENT_USER_ID: 'timi_current_active_user_id',
  REGISTERED_ACCOUNTS: 'timi_registered_accounts_list'
};

// Generic LocalStorage Loader
export function loadData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

// Generic LocalStorage Saver
export function saveData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Save error', err);
  }
}

// Remove data
export function removeData(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Remove error', err);
  }
}

// Purge all data belonging to an account
export function purgeAccountData(userId: string): void {
  const keys = getUserStorageKeys(userId);
  removeData(keys.TASKS);
  removeData(keys.SCHEDULE);
  removeData(keys.APPOINTMENTS);
  removeData(keys.ALARMS);
  removeData(keys.WATER);
  removeData(keys.PET);
  removeData(keys.UNIVERSITY);
  removeData(keys.MAJOR);
}
