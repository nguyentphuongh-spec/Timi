import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Flame, 
  Star, 
  Heart, 
  ShoppingBag, 
  Shirt, 
  Check, 
  Lock, 
  RotateCcw,
  Smile,
  Volume2,
  Gift,
  Edit3,
  Award,
  Coffee,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VirtualPet, PetItem } from '../types';
import { PET_CATALOG } from '../utils/storage';
import { MascotAvatar } from './CuteIllustrations';
import { playPetCuteSound, playSuccessSound, playChime, playAlarmMelody } from '../utils/audio';

interface VirtualPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: VirtualPet;
  onUpdatePet: (updatedPet: Partial<VirtualPet>) => void;
}

// 13 Rich Milestone Rewards for Streak Accomplishment
interface MilestoneReward {
  streak: number;
  title: string;
  badge: string;
  starBonus: number;
  expBonus: number;
  specialItemName?: string;
  specialItemId?: string;
  desc: string;
}

const MILESTONE_REWARDS: MilestoneReward[] = [
  {
    streak: 1,
    title: 'Quà Khởi Đầu Tân Sinh Viên',
    badge: '🌱',
    starBonus: 30,
    expBonus: 40,
    specialItemName: 'Nơ Hồng Pastel 🎀',
    specialItemId: 'pink_ribbon',
    desc: 'Hoàn thành ngày đầu tiên cùng TIMI'
  },
  {
    streak: 3,
    title: 'Hộp Quà Chăm Chỉ Học Tập',
    badge: '🎒',
    starBonus: 60,
    expBonus: 70,
    specialItemName: 'Mũ Cử Nhân Đại Học 🎓',
    specialItemId: 'student_cap',
    desc: 'Duy trì chuỗi 3 ngày liên tiếp'
  },
  {
    streak: 5,
    title: 'Hộp Quà Bứt Phá Deadline',
    badge: '⚡',
    starBonus: 90,
    expBonus: 100,
    specialItemName: 'Mũ Nồi Dâu Tây 🍓',
    specialItemId: 'strawberry_beret',
    desc: 'Vượt qua 5 ngày học tập chuyên cần'
  },
  {
    streak: 7,
    title: 'Hộp Quà 1 Tuần Kỷ Luật Vàng',
    badge: '✨',
    starBonus: 130,
    expBonus: 150,
    specialItemName: 'Vòng Thiên Thần Lấp Lánh ✨',
    specialItemId: 'angel_halo',
    desc: 'Đạt trọn vẹn 7 ngày không gián đoạn'
  },
  {
    streak: 10,
    title: 'Hộp Quà Thủ Khoa Ưu Tú',
    badge: '👑',
    starBonus: 180,
    expBonus: 220,
    specialItemName: 'Vương Miện Thủ Khoa 👑',
    specialItemId: 'royal_crown',
    desc: 'Kỷ luật thép của sinh viên xuất sắc'
  },
  {
    streak: 14,
    title: 'Hộp Quà Bậc Thầy Thời Gian',
    badge: '🪽',
    starBonus: 250,
    expBonus: 300,
    specialItemName: 'Cánh Thiên Thần Pastel 🪽',
    specialItemId: 'angel_wings',
    desc: '2 tuần làm chủ hoàn toàn thời gian biểu'
  },
  {
    streak: 21,
    title: 'Hộp Quà Thói Quen Vàng 21 Ngày',
    badge: '🧙‍♀️',
    starBonus: 380,
    expBonus: 450,
    specialItemName: 'Áo Choàng Phù Thủy Học Thuật 🧙‍♀️',
    specialItemId: 'wizard_cape',
    desc: 'Định hình thói quen thành công trọn đời'
  },
  {
    streak: 30,
    title: 'Hộp Quà Huyền Thoại TIMI Student',
    badge: '🏆',
    starBonus: 500,
    expBonus: 600,
    specialItemName: 'Cúp Vàng Danh Dự TIMI 🏆',
    specialItemId: 'honor_trophy',
    desc: 'Mốc vinh danh cao quý nhất cho 1 tháng kiên trì'
  },
  {
    streak: 45,
    title: 'Hộp Quà Vương Giả Kim Cương',
    badge: '💎',
    starBonus: 700,
    expBonus: 800,
    specialItemName: 'Vương Miện Kim Cương Tinh Xảo 💎',
    specialItemId: 'crystal_crown',
    desc: '45 ngày ý chí phi thường vượt mọi bài thi'
  },
  {
    streak: 60,
    title: 'Hộp Quà Kỳ Tích Hai Tháng Vàng',
    badge: '🦄',
    starBonus: 900,
    expBonus: 1000,
    specialItemName: 'Đôi Cánh Kỳ Lân Ánh Sáng 🦄',
    specialItemId: 'unicorn_wings',
    desc: '2 tháng không ngừng bứt phá, tiến bước vào top sinh viên ưu tú'
  },
  {
    streak: 75,
    title: 'Hộp Quà Huân Chương Đại Học',
    badge: '🎖️',
    starBonus: 1100,
    expBonus: 1200,
    specialItemName: 'Kính Râm Idol Siêu Ngầu 🕶️',
    specialItemId: 'stylish_shades',
    desc: 'Bản lĩnh vững vàng trước đồ án và các kỳ thi căng thẳng'
  },
  {
    streak: 90,
    title: 'Hộp Quà Học Kỳ Vàng Rực Rỡ',
    badge: '🌟',
    starBonus: 1400,
    expBonus: 1500,
    specialItemName: 'Mũ Thám Tử Sherlock 🕵️',
    specialItemId: 'detective_hat',
    desc: '3 tháng trọn vẹn 1 học kỳ đại học mẫu mực xuất sắc'
  },
  {
    streak: 100,
    title: 'Đại Lễ Trăm Ngày Kỷ Luật Bất Bại',
    badge: '🏛️',
    starBonus: 2000,
    expBonus: 2500,
    specialItemName: 'Khăn Quàng Cổ Ấm Áp 🧣',
    specialItemId: 'winter_scarf',
    desc: 'Thành tựu huyền thoại 100 ngày kỷ luật thép đỉnh cao'
  }
];

// Daily Lucky Wheel Prizes (12 Rich Prizes)
const LUCKY_PRIZES = [
  { label: '+25 ⭐', stars: 25, exp: 15, icon: '⭐', color: '#FFD54F' },
  { label: 'Trà Sữa Trân Châu 🧋', stars: 20, exp: 30, happiness: 25, icon: '🧋', color: '#FFB74D' },
  { label: '+40 ⭐', stars: 40, exp: 20, icon: '⭐', color: '#FFD54F' },
  { label: 'Bánh Dâu Tây 🍰', stars: 25, exp: 35, happiness: 30, icon: '🍰', color: '#FF80AB' },
  { label: '+60 ⭐', stars: 60, exp: 30, icon: '🌟', color: '#FFCA28' },
  { label: 'Kem Cá Taiyaki 🐟', stars: 30, exp: 40, happiness: 35, icon: '🐟', color: '#81C784' },
  { label: 'Cú Đêm Học Giỏi 🦉', stars: 50, exp: 60, happiness: 20, icon: '🦉', color: '#AB47BC' },
  { label: '+80 ⭐', stars: 80, exp: 50, icon: '💫', color: '#FFB300' },
  { label: 'Trà Đào Cam Sả 🍑', stars: 35, exp: 45, happiness: 35, icon: '🍑', color: '#FFA726' },
  { label: 'Bingsu Xoài Tuyết 🍧', stars: 45, exp: 55, happiness: 40, icon: '🍧', color: '#4DD0E1' },
  { label: '+120 ⭐', stars: 120, exp: 80, icon: '✨', color: '#FFB300' },
  { label: 'Rương Kim Cương 💎', stars: 200, exp: 200, happiness: 50, icon: '💎', color: '#00E5FF' }
];

// Treat Snack Items to Feed Pet (10 Delicious Treats)
interface TreatItem {
  id: string;
  name: string;
  icon: string;
  starCost: number;
  happinessBonus: number;
  expBonus: number;
  reactionMsg: string;
}

const TREAT_ITEMS: TreatItem[] = [
  {
    id: 'strawberry_shortcake',
    name: 'Bánh Kem Dâu',
    icon: '🍰',
    starCost: 10,
    happinessBonus: 15,
    expBonus: 10,
    reactionMsg: 'Ngon tuyệt cú mèo! Vị dâu tây ngọt ngào giúp tớ có thêm năng lượng! 💖'
  },
  {
    id: 'boba_milk_tea',
    name: 'Trà Sữa Trân Châu',
    icon: '🧋',
    starCost: 15,
    happinessBonus: 20,
    expBonus: 15,
    reactionMsg: 'Trà sữa 70% đường 30% đá chuẩn gu tớ luôn! Cảm ơn bạn nhiều nha! 🧋'
  },
  {
    id: 'rainbow_icecream',
    name: 'Kem Que 7 Màu',
    icon: '🍦',
    starCost: 8,
    happinessBonus: 12,
    expBonus: 8,
    reactionMsg: 'Mát lạnh sảng khoái! Ôn thi căng thẳng ăn kem là chuẩn bài! ❄️'
  },
  {
    id: 'fish_waffle',
    name: 'Bánh Cá Nướng Taiyaki',
    icon: '🐟',
    starCost: 12,
    happinessBonus: 18,
    expBonus: 12,
    reactionMsg: 'Bánh cá nhân đậu đỏ thơm phức giòn rụm! Meo meo hạnh phúc quá! 🐟'
  },
  {
    id: 'chocolate_bear_cake',
    name: 'Bánh Gấu Chocolate',
    icon: '🐻',
    starCost: 14,
    happinessBonus: 22,
    expBonus: 16,
    reactionMsg: 'Bánh gấu chocolate thơm béo ngậy! Bé cưng nạp 100% năng lượng yêu đời! 🍫'
  },
  {
    id: 'peach_orange_tea',
    name: 'Trà Đào Cam Sả',
    icon: '🍑',
    starCost: 16,
    happinessBonus: 24,
    expBonus: 18,
    reactionMsg: 'Hương đào thơm mát giòn sần sật, giải nhiệt não bộ ôn thi cả ngày! 🍑'
  },
  {
    id: 'student_ramen',
    name: 'Mì Ramen Đêm Khuya',
    icon: '🍜',
    starCost: 18,
    happinessBonus: 26,
    expBonus: 20,
    reactionMsg: 'Bát mì ramen nóng hổi cứu đói lúc 23h đêm chạy deadline! Ấm lòng sinh viên! 🍜'
  },
  {
    id: 'strawberry_crepe',
    name: 'Bánh Crepe Dâu Kem',
    icon: '🥞',
    starCost: 15,
    happinessBonus: 20,
    expBonus: 15,
    reactionMsg: 'Lớp vỏ mềm tan hòa quyện cùng kem tươi dâu tây! Ngọt ngào say đắm! 🍓'
  },
  {
    id: 'mango_bingsu',
    name: 'Bingsu Xoài Tuyết',
    icon: '🍧',
    starCost: 20,
    happinessBonus: 30,
    expBonus: 25,
    reactionMsg: 'Bingsu xoài tuyết mát lạnh đỉnh chóp! Sảng khoái tinh thần học tập gấp đôi! 🍧'
  },
  {
    id: 'french_macaron',
    name: 'Macaron Pháp 7 Màu',
    icon: '🧁',
    starCost: 22,
    happinessBonus: 32,
    expBonus: 28,
    reactionMsg: 'Bánh macaron giòn xốp sang chảnh chuẩn phong cách hoàng gia Pháp! 🧁'
  }
];

export const VirtualPetModal: React.FC<VirtualPetModalProps> = ({
  isOpen,
  onClose,
  pet,
  onUpdatePet
}) => {
  const [activeTab, setActiveTab] = useState<'closet' | 'shop' | 'rewards'>('closet');
  const [petMessage, setPetMessage] = useState('Meo! Hôm nay bạn học chăm chỉ quá, tớ rất tự hào về bạn! ✨');
  const [isPetting, setIsPetting] = useState(false);

  // Rename pet feature states
  const [isRenaming, setIsRenaming] = useState(false);
  const [newPetName, setNewPetName] = useState(pet.name);
  const [renameCategoryTab, setRenameCategoryTab] = useState<'cute' | 'student' | 'food'>('cute');

  // Daily spin wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<typeof LUCKY_PRIZES[0] | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const hasSpunToday = pet.lastSpinDate === todayStr;

  const CUTE_NAME_CATEGORIES = {
    cute: {
      label: '🌸 Dễ Thương',
      names: ['Bé Mochi 🍡', 'Trà Sữa 🧋', 'Bánh Bao 🥟', 'Thỏ Tuyết 🐰', 'Miu Miu 🐱', 'Pudding 🍮', 'Bé Bơ 🥑', 'Dâu Tây 🍓']
    },
    student: {
      label: '⚡ Sinh Viên & Học Bá',
      names: ['Thủ Khoa Cưng 🎓', 'Chiến Thần Deadline ⚡', 'Giáo Sư Nhí 👓', 'Cú Đêm Học Giỏi 🦉', 'Bậc Thầy Pomodoro 🍅', 'Hiệp Sĩ Đồ Án 🛡️']
    },
    food: {
      label: '🧋 Đồ Ăn & Nước Uống',
      names: ['Bắp Rang Bơ 🍿', 'Đậu Đậu 🫘', 'Cà Phê Muối ☕', 'Kẹo Bông Gòn 🍧', 'Bánh Cá Taiyaki 🐟', 'Kem 7 Màu 🍦', 'Trà Đào Cam Sả 🍑']
    }
  };

  const motivationalQuotes = [
    'Meo! Hôm nay bạn học chăm chỉ quá, tớ rất tự hào về bạn! ✨',
    'Cố gắng lên nào, kỳ này chắc chắn đạt học bổng sinh viên giỏi nha! 🎓',
    'Nhớ uống thêm một ngụm nước và chớp mắt thư giãn 20 giây nhé! 💧',
    'Chạy deadline xong rồi thì ngủ sớm một chút nhé bạn ơi! 🌙',
    'Chuỗi ngày liên tiếp của bạn đang cháy bùng bùng luôn nè! 🔥',
    'Tớ diện đồ này có hợp với bạn không? Meo meo đáng yêu quá! 🎀',
    'Mỗi phút tập trung Pomodoro đều đưa bạn đến gần ước mơ hơn! 🍅'
  ];

  const handlePetMascot = () => {
    setIsPetting(true);
    playPetCuteSound();

    const randomMsg = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setPetMessage(randomMsg);

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.5 },
      colors: ['#FF85A1', '#FFD1DC', '#FFAAA6']
    });

    onUpdatePet({
      happiness: Math.min(100, (pet.happiness || 80) + 5)
    });

    setTimeout(() => setIsPetting(false), 600);
  };

  // Save renamed pet
  const handleSavePetName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;

    playSuccessSound();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.5 },
      colors: ['#FF85A1', '#FFD54F', '#81C784']
    });

    const cleanName = newPetName.trim();
    onUpdatePet({ name: cleanName });
    setIsRenaming(false);
    setPetMessage(`Oa! Tên mới là "${cleanName}" nghe đáng yêu quá! Tớ thích lắm, cảm ơn bạn nha! 💖`);
  };

  const handleEquip = (item: PetItem) => {
    playChime('sweet');
    if (item.type === 'hat') {
      onUpdatePet({
        equippedHat: pet.equippedHat === item.id ? undefined : item.id
      });
    } else {
      onUpdatePet({
        equippedAccessory: pet.equippedAccessory === item.id ? undefined : item.id
      });
    }
  };

  const handleBuyItem = (item: PetItem) => {
    if (pet.streak < item.requiredStreak) {
      alert(`Bạn cần đạt Chuỗi ngày (Streak) từ ${item.requiredStreak} ngày trở lên để mở khóa món đồ này! Hãy hoàn thành công việc mỗi ngày nhé.`);
      return;
    }
    if (pet.stars < item.starPrice) {
      alert(`Bạn còn thiếu ${item.starPrice - pet.stars} Sao ⭐! Hãy hoàn thành thêm bài tập hoặc phiên Pomodoro để tích lũy thêm Sao nhé.`);
      return;
    }

    playSuccessSound();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FFD54F', '#FF85A1', '#81C784']
    });

    onUpdatePet({
      stars: pet.stars - item.starPrice,
      unlockedItems: [...(pet.unlockedItems || []), item.id],
      ...(item.type === 'hat' ? { equippedHat: item.id } : { equippedAccessory: item.id })
    });
  };

  // Claim Streak Milestone Reward
  const handleClaimMilestone = (milestone: MilestoneReward) => {
    const claimed = pet.claimedMilestones || [];
    if (claimed.includes(milestone.streak)) return;

    if (pet.streak < milestone.streak) {
      alert(`Bạn cần hoàn thành thêm ${milestone.streak - pet.streak} ngày để nhận phần thưởng này!`);
      return;
    }

    playAlarmMelody(2);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#FFD54F', '#FF85A1', '#81C784', '#00E5FF']
    });

    const newUnlocked = [...(pet.unlockedItems || [])];
    if (milestone.specialItemId && !newUnlocked.includes(milestone.specialItemId)) {
      newUnlocked.push(milestone.specialItemId);
    }

    onUpdatePet({
      stars: (pet.stars || 0) + milestone.starBonus,
      exp: (pet.exp || 0) + milestone.expBonus,
      happiness: 100,
      unlockedItems: newUnlocked,
      claimedMilestones: [...claimed, milestone.streak]
    });

    setPetMessage(`Chúc mừng bạn nhận ${milestone.title}! Được tặng +${milestone.starBonus} ⭐ và vật phẩm độc quyền! 🎁`);
  };

  // Daily Lucky Spin
  const handleSpinWheel = () => {
    if (isSpinning) return;
    if (hasSpunToday) {
      alert('Bạn đã quay thưởng ngày hôm nay rồi! Hãy quay lại vào ngày mai nhé 🌸');
      return;
    }

    setIsSpinning(true);
    setSpinResult(null);
    playChime('sweet');

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * LUCKY_PRIZES.length);
      const prize = LUCKY_PRIZES[randomIndex];
      setSpinResult(prize);
      setIsSpinning(false);
      playSuccessSound();

      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#FFD54F', '#FF85A1', '#81C784']
      });

      onUpdatePet({
        stars: (pet.stars || 0) + prize.stars,
        exp: (pet.exp || 0) + prize.exp,
        happiness: Math.min(100, (pet.happiness || 80) + (prize.happiness || 10)),
        lastSpinDate: todayStr
      });

      setPetMessage(`Bạn vừa trúng ${prize.label}! Nhận ngay +${prize.stars} Sao ⭐ và +${prize.exp} EXP! ✨`);
    }, 1800);
  };

  // Feed Snack Treat
  const handleFeedTreat = (treat: TreatItem) => {
    if ((pet.stars || 0) < treat.starCost) {
      alert(`Bạn cần ${treat.starCost} ⭐ để mua ${treat.name}! Hãy hoàn thành bài tập để nhận thêm Sao nhé.`);
      return;
    }

    playPetCuteSound();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.5 },
      colors: ['#FF85A1', '#FFD1DC']
    });

    onUpdatePet({
      stars: pet.stars - treat.starCost,
      happiness: Math.min(100, (pet.happiness || 80) + treat.happinessBonus),
      exp: (pet.exp || 0) + treat.expBonus
    });

    setPetMessage(treat.reactionMsg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-[#FFD1DC] flex flex-col overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#FFE4E8] bg-gradient-to-r from-[#FFF0F3] via-white to-[#FFF5F7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF85A1] to-[#FFAAA6] text-white flex items-center justify-center text-xl shadow-xs">
              🐱
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#4A3B43]">
                Thú Cưng Ảo TIMI & Kho Phần Thưởng
              </h3>
              <p className="text-xs text-[#8C6D7C]">
                Đổi tên bé, nhận thưởng chuỗi ngày, quay số may mắn & mở khóa trang phục
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#7D2E49] hover:bg-[#FFE4E8] flex items-center justify-center transition border border-[#FFCCD5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Top Pet Interactive Stage */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#FFF5F8] to-[#FFE8EE] border border-[#FFCCD5] flex flex-col items-center text-center relative overflow-hidden shadow-xs">
            {/* Sparkles background */}
            <div className="absolute top-3 left-6 text-sm text-[#FF85A1] select-none animate-pulse">✨</div>
            <div className="absolute bottom-3 right-6 text-sm text-[#FFAAA6] select-none animate-pulse">💖</div>

            {/* Streak & Stars Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap justify-center">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FF7043] to-[#FFA726] text-white font-black text-xs flex items-center gap-1 shadow-2xs">
                <Flame className="w-3.5 h-3.5 fill-current" /> Chuỗi {pet.streak} Ngày
              </span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FFD54F] to-[#FFCA28] text-[#5D4037] font-black text-xs flex items-center gap-1 shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-current text-[#FFA000]" /> {pet.stars} Sao Thưởng
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-[#FFCCD5] text-[#C2185B] font-bold text-xs flex items-center gap-1 shadow-2xs">
                <Heart className="w-3.5 h-3.5 fill-current text-[#E91E63]" /> {pet.happiness}% Vui vẻ
              </span>
            </div>

            {/* Pet Name with Inline Rename Button */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-black text-[#D81B60] bg-white/90 px-3 py-1 rounded-2xl border border-[#FFCCD5] shadow-2xs flex items-center gap-1.5">
                <span>{pet.name}</span>
                <span className="text-xs text-[#8C6D7C] font-semibold">(Cấp {pet.level || 1})</span>
              </span>
              <button
                onClick={() => {
                  setNewPetName(pet.name);
                  setIsRenaming(!isRenaming);
                }}
                className="px-2.5 py-1 rounded-xl bg-white border border-[#FFCCD5] hover:bg-[#FFF0F3] text-xs font-bold text-[#D81B60] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                title="Bấm để đổi tên thú cưng của bạn"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#FF85A1]" />
                <span>Đổi tên bé</span>
              </button>
            </div>

            {/* Rename Input Panel */}
            {isRenaming && (
              <form onSubmit={handleSavePetName} className="w-full max-w-lg p-4 rounded-3xl bg-white border-2 border-[#FF85A1] shadow-lg mb-3 space-y-3 animate-fadeIn text-left">
                <div className="flex items-center justify-between pb-1 border-b border-[#FFE4E8]">
                  <label className="text-xs font-black text-[#D81B60] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#FF85A1]" /> Đặt tên mới cho bé cưng của bạn:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsRenaming(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs px-2 py-0.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  >
                    Đóng ✕
                  </button>
                </div>

                <div className="flex items-center gap-2 relative">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      maxLength={30}
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                      placeholder="Nhập tên mới (VD: Bé Mochi, Trà Sữa, Thủ Khoa...)"
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-[#FFCCD5] text-xs sm:text-sm font-bold text-[#4A3B43] focus:ring-2 focus:ring-[#FF85A1] focus:outline-none bg-[#FFFDFC]"
                      autoFocus
                    />
                    {newPetName && (
                      <button
                        type="button"
                        onClick={() => setNewPetName('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] hover:bg-gray-300 transition"
                        title="Xóa trắng"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white text-xs sm:text-sm font-black shadow-xs hover:opacity-95 transition cursor-pointer flex items-center gap-1 flex-shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu tên</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8C6D7C] px-0.5">
                  <span>Tên hiển thị: <strong className="text-[#D81B60]">{newPetName || 'Chưa đặt'}</strong></span>
                  <span>{newPetName.length}/30 ký tự</span>
                </div>

                {/* Suggestions categories & tags */}
                <div className="pt-2 border-t border-[#FFF0F3] space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-[#8C6D7C] font-bold mr-1">Bộ gợi ý tên:</span>
                    {(Object.keys(CUTE_NAME_CATEGORIES) as (keyof typeof CUTE_NAME_CATEGORIES)[]).map((catKey) => (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setRenameCategoryTab(catKey)}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          renameCategoryTab === catKey
                            ? 'bg-[#FF85A1] text-white shadow-2xs'
                            : 'bg-[#FFF5F7] text-[#7D2E49] hover:bg-[#FFE4E8] border border-[#FFCCD5]'
                        }`}
                      >
                        {CUTE_NAME_CATEGORIES[catKey].label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto">
                    {CUTE_NAME_CATEGORIES[renameCategoryTab].names.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setNewPetName(sug)}
                        className="px-2.5 py-1 rounded-xl bg-[#FFF9FA] hover:bg-[#FFE4E8] hover:scale-105 active:scale-95 text-[11px] font-bold text-[#D81B60] border border-[#FFCCD5] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {/* Clickable Mascot */}
            <div 
              onClick={handlePetMascot}
              className="cursor-pointer group transform transition hover:scale-105 active:scale-95 py-1"
              title="Bấm để vuốt ve và nhận lời khen!"
            >
              <MascotAvatar
                type={pet.type}
                mood={pet.happiness > 70 ? 'happy' : 'sleepy'}
                equippedHat={pet.equippedHat}
                equippedAccessory={pet.equippedAccessory}
                size={135}
                isBouncing={isPetting}
              />
              <p className="text-[11px] font-bold text-[#FF85A1] group-hover:underline mt-1 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> Bấm để vuốt ve bé {pet.name}
              </p>
            </div>

            {/* Pet Speech Bubble */}
            <div className="mt-2.5 px-4 py-2 rounded-2xl bg-white border border-[#FFCCD5] text-xs text-[#4A3B43] max-w-md shadow-2xs relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white"></div>
              <p className="font-semibold text-[#7D2E49]">"{petMessage}"</p>
            </div>

            {/* Pet Species Switcher (Mèo, Thỏ, Gấu, Cáo, Cánh Cụt, Corgi) */}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#FFD1DC] text-xs flex-wrap justify-center">
              <span className="text-[#8C6D7C] text-[11px] font-medium mr-1">Đổi loài linh vật:</span>
              {[
                { id: 'cat', label: '🐱 Mèo Bông' },
                { id: 'rabbit', label: '🐰 Thỏ Tuyết' },
                { id: 'bear', label: '🐻 Gấu Dâu' },
                { id: 'fox', label: '🦊 Cáo Nhỏ' },
                { id: 'penguin', label: '🐧 Cánh Cụt' },
                { id: 'puppy', label: '🐶 Corgi' }
              ].map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => {
                    onUpdatePet({ type: sp.id as any });
                    playPetCuteSound();
                  }}
                  className={`px-2 py-0.5 rounded-xl font-bold border transition text-[11px] cursor-pointer ${
                    pet.type === sp.id
                      ? 'bg-[#FF85A1] text-white border-[#FF85A1] shadow-2xs'
                      : 'bg-white text-[#4A3B43] border-[#FFCCD5] hover:bg-[#FFF5F7]'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Main Tabs: Tủ đồ, Cửa Hàng, Quà Tặng & Thưởng */}
          <div>
            <div className="flex items-center justify-between border-b border-[#FFE4E8] pb-2 mb-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setActiveTab('closet')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    activeTab === 'closet'
                      ? 'bg-[#FF85A1] text-white shadow-2xs'
                      : 'bg-white text-[#8C6D7C] hover:bg-[#FFF0F3]'
                  }`}
                >
                  <Shirt className="w-3.5 h-3.5" />
                  <span>Tủ Đồ ({pet.unlockedItems?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('shop')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    activeTab === 'shop'
                      ? 'bg-[#FF85A1] text-white shadow-2xs'
                      : 'bg-white text-[#8C6D7C] hover:bg-[#FFF0F3]'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cửa Hàng ({PET_CATALOG.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    activeTab === 'rewards'
                      ? 'bg-gradient-to-r from-[#FF7043] to-[#FFA726] text-white shadow-2xs'
                      : 'bg-[#FFF9F6] text-[#E65100] border border-[#FFCC80] hover:bg-[#FFE0B2]'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Kho Phần Thưởng</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {(pet.equippedHat || pet.equippedAccessory) && activeTab === 'closet' && (
                  <button
                    onClick={() => {
                      onUpdatePet({ equippedHat: undefined, equippedAccessory: undefined });
                      playChime('sweet');
                    }}
                    className="text-[11px] text-[#8C6D7C] hover:text-[#D81B60] flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Bỏ trang bị
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1: CLOSET */}
            {activeTab === 'closet' && (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-[#8C6D7C]">
                  Bấm vào vật phẩm đã mở khóa để thử hoặc cởi đồ cho bé {pet.name}:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PET_CATALOG.filter(item => (pet.unlockedItems || []).includes(item.id)).map((item) => {
                    const isEquipped = pet.equippedHat === item.id || pet.equippedAccessory === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleEquip(item)}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between relative ${
                          isEquipped
                            ? 'bg-[#FFF0F3] border-[#FF85A1] shadow-xs ring-2 ring-[#FFCCD5]'
                            : 'bg-white border-[#FFE4E8] hover:border-[#FFAAA6] hover:bg-[#FFFBFD]'
                        }`}
                      >
                        {isEquipped && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF85A1] text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <h4 className="text-xs font-bold text-[#4A3B43] leading-snug">{item.name}</h4>
                            <span className="text-[10px] text-[#FF85A1] font-semibold">
                              {item.type === 'hat' ? 'Nón / Mũ' : 'Phụ kiện'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-[#8C6D7C] mt-2 line-clamp-2">
                          {item.description}
                        </p>

                        <button
                          className={`mt-2.5 w-full py-1 rounded-xl text-xs font-bold transition ${
                            isEquipped
                              ? 'bg-white border border-[#FF85A1] text-[#D81B60]'
                              : 'bg-[#FFF5F7] text-[#7D2E49] hover:bg-[#FFE4E8]'
                          }`}
                        >
                          {isEquipped ? 'Đang mặc' : 'Mặc ngay'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: SHOP */}
            {activeTab === 'shop' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-[#8C6D7C] flex-wrap gap-2">
                  <span>Mở khóa thêm đồ dùng & trang phục cho bé:</span>
                  <span className="text-[#D81B60] font-bold">Số Sao hiện có: {pet.stars} ⭐</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PET_CATALOG.map((item) => {
                    const isUnlocked = (pet.unlockedItems || []).includes(item.id);
                    const canAfford = pet.stars >= item.starPrice;
                    const meetsStreak = pet.streak >= item.requiredStreak;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          isUnlocked
                            ? 'bg-white/60 border-[#FFE4E8] opacity-75'
                            : meetsStreak && canAfford
                              ? 'bg-[#FFFDFE] border-[#FF85A1] shadow-2xs ring-1 ring-[#FFD1DC]'
                              : 'bg-[#FAFAFA] border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl flex-shrink-0">{item.icon}</span>
                          <div>
                            <h4 className="text-xs font-bold text-[#4A3B43] flex items-center gap-1.5">
                              <span>{item.name}</span>
                              {isUnlocked && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded-full">
                                  Đã có
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-[#8C6D7C] mt-0.5 line-clamp-1">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
                              <span className={meetsStreak ? 'text-[#E65100]' : 'text-gray-400'}>
                                🔥 Chuỗi {item.requiredStreak} ngày
                              </span>
                              <span>•</span>
                              <span className={canAfford ? 'text-[#F57F17]' : 'text-gray-400'}>
                                ⭐ {item.starPrice} Sao
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <button
                              onClick={() => handleEquip(item)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-[#FFCCD5] text-[#D81B60] text-xs font-bold hover:bg-[#FFE4E8] transition cursor-pointer"
                            >
                              Thử đồ
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuyItem(item)}
                              disabled={!meetsStreak || !canAfford}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                                meetsStreak && canAfford
                                  ? 'bg-gradient-to-r from-[#FF85A1] to-[#FFAAA6] text-white shadow-2xs hover:opacity-95 cursor-pointer'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              }`}
                            >
                              {!meetsStreak ? (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>Khóa</span>
                                </>
                              ) : (
                                <span>Mua ngay</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: REWARDS HUB (Milestone Chests, Lucky Spin & Treat Feeding) */}
            {activeTab === 'rewards' && (
              <div className="space-y-6 animate-fadeIn">
                {/* SECTION 1: DAILY LUCKY SPIN */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FFF8E1] via-[#FFFDE7] to-[#FFF3E0] border-2 border-[#FFE082] shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                        <span className="text-xl">🎰</span>
                        <h4 className="text-sm font-black text-[#5D4037]">
                          Vòng Quay May Mắn Mỗi Ngày
                        </h4>
                        <span className="px-2 py-0.2 rounded-full bg-[#FFD54F] text-[#3E2723] text-[10px] font-black uppercase">
                          FREE SPIN
                        </span>
                      </div>
                      <p className="text-xs text-[#795548]">
                        Quay mỗi ngày để nhận Sao ⭐, Hộp Trà Sữa 🧋, Bánh Dâu 🍰 và Rương EXP!
                      </p>
                    </div>

                    <div>
                      <button
                        onClick={handleSpinWheel}
                        disabled={isSpinning || hasSpunToday}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition flex items-center gap-2 ${
                          hasSpunToday
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                            : isSpinning
                              ? 'bg-[#FFB300] text-white animate-pulse'
                              : 'bg-gradient-to-r from-[#FF9800] to-[#FFB74D] text-white hover:opacity-95 shadow-orange-200 cursor-pointer active:scale-95'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{hasSpunToday ? 'Đã quay hôm nay' : isSpinning ? 'Đang quay...' : 'Quay Thưởng Ngay'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Spin Result Alert */}
                  {spinResult && (
                    <div className="mt-3 p-3 rounded-2xl bg-white/95 border border-[#FFD54F] flex items-center justify-center gap-3 animate-bounce-short">
                      <span className="text-2xl">{spinResult.icon}</span>
                      <p className="text-xs font-black text-[#E65100]">
                        Chúc mừng bạn vừa nhận: <strong className="text-sm text-[#D81B60]">{spinResult.label}</strong>!
                      </p>
                    </div>
                  )}
                </div>

                {/* SECTION 2: STREAK MILESTONE CHESTS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[#FF7043]" />
                      <h4 className="text-xs sm:text-sm font-black text-[#4A3B43] uppercase tracking-wider">
                        Hộp Quà Chuỗi Ngày Liên Tiếp ({pet.streak} ngày)
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#8C6D7C] font-semibold">
                      Chuỗi càng cao nhận càng nhiều quà
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MILESTONE_REWARDS.map((milestone) => {
                      const isClaimed = (pet.claimedMilestones || []).includes(milestone.streak);
                      const canClaim = pet.streak >= milestone.streak && !isClaimed;

                      return (
                        <div
                          key={milestone.streak}
                          className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2.5 relative overflow-hidden ${
                            isClaimed
                              ? 'bg-white/70 border-emerald-200'
                              : canClaim
                                ? 'bg-gradient-to-tr from-[#FFF5F7] via-white to-[#FFF0F5] border-2 border-[#FF85A1] shadow-md ring-2 ring-[#FFD1DC]'
                                : 'bg-white border-gray-200 opacity-90'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{milestone.badge}</span>
                              <div>
                                <h5 className="text-xs font-bold text-[#4A3B43]">
                                  {milestone.title}
                                </h5>
                                <span className="text-[10px] font-black text-[#FF7043] bg-[#FFE0B2] px-2 py-0.2 rounded-full inline-block mt-0.5">
                                  🔥 Đạt chuỗi {milestone.streak} ngày
                                </span>
                              </div>
                            </div>

                            {isClaimed && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã nhận
                              </span>
                            )}
                          </div>

                          <div className="bg-[#FFFDFE] p-2 rounded-xl border border-[#FFE4E8] text-[11px] space-y-1">
                            <p className="text-[#8C6D7C] leading-snug">{milestone.desc}</p>
                            <div className="flex items-center gap-2 font-bold text-[#D81B60] text-xs">
                              <span>⭐ +{milestone.starBonus} Sao</span>
                              <span>•</span>
                              <span>✨ +{milestone.expBonus} EXP</span>
                            </div>
                            {milestone.specialItemName && (
                              <p className="text-[10px] text-purple-700 font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-500" />
                                <span>Tặng: {milestone.specialItemName}</span>
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleClaimMilestone(milestone)}
                            disabled={isClaimed || !canClaim}
                            className={`w-full py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                              isClaimed
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : canClaim
                                  ? 'bg-gradient-to-r from-[#FF7043] to-[#FFA726] text-white shadow-md hover:opacity-95 cursor-pointer animate-pulse'
                                  : 'bg-[#FFF5F7] text-[#8C6D7C] border border-[#FFCCD5] cursor-not-allowed'
                            }`}
                          >
                            {isClaimed ? (
                              <span>Đã Nhận Thưởng</span>
                            ) : canClaim ? (
                              <>
                                <PartyPopper className="w-3.5 h-3.5" />
                                <span>Mở Hộp Quà Ngay!</span>
                              </>
                            ) : (
                              <span>Cần thêm {milestone.streak - pet.streak} ngày</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: FEEDING TREATS */}
                <div className="p-4 rounded-3xl bg-[#FFF9FA] border border-[#FFCCD5] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-[#FF85A1]" />
                      <h4 className="text-xs sm:text-sm font-bold text-[#4A3B43]">
                        Thưởng Đồ Ăn Vặt Cho Bé {pet.name}
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#8C6D7C]">
                      Tăng độ vui vẻ và EXP cho bé
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {TREAT_ITEMS.map((treat) => (
                      <button
                        key={treat.id}
                        onClick={() => handleFeedTreat(treat)}
                        className="p-3 rounded-2xl bg-white border border-[#FFE4E8] hover:border-[#FF85A1] hover:bg-[#FFF5F7] text-center transition flex flex-col items-center justify-between gap-1 shadow-2xs group cursor-pointer"
                      >
                        <span className="text-3xl group-hover:scale-110 transition">{treat.icon}</span>
                        <span className="text-xs font-bold text-[#4A3B43] mt-1">{treat.name}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">
                          +{treat.happinessBonus}% Vui vẻ
                        </span>
                        <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#FFF0F3] text-[#D81B60] text-[10px] font-black border border-[#FFCCD5]">
                          {treat.starCost} ⭐
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
