import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Utensils, 
  Gamepad2, 
  Moon, 
  ShoppingBag, 
  Package, 
  Check, 
  Plus, 
  Flame, 
  Star, 
  Coins, 
  Home, 
  Palette,
  Flower2,
  TreeDeciduous,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VirtualPet, GardenShopItem, ShopCategory } from '../types';
import { GARDEN_SHOP_CATALOG } from '../utils/storage';
import { playSuccessSound, playChime } from '../utils/audio';
import { MascotAvatar } from './CuteIllustrations';

interface PetGardenViewProps {
  pet: VirtualPet;
  onUpdatePet: (updater: (prev: VirtualPet) => VirtualPet) => void;
  onNavigateToStudy?: () => void;
}

export const PetGardenView: React.FC<PetGardenViewProps> = ({
  pet,
  onUpdatePet,
  onNavigateToStudy
}) => {
  const [activeTab, setActiveTab] = useState<'garden' | 'shop' | 'inventory'>('garden');
  const [shopCategory, setShopCategory] = useState<ShopCategory | 'all'>('all');
  const [interactionToast, setInteractionToast] = useState<string | null>(null);

  // Trigger floating interaction toast
  const showToast = (msg: string) => {
    setInteractionToast(msg);
    setTimeout(() => {
      setInteractionToast(null);
    }, 2400);
  };

  // Quick Action: Feed Pet
  const handleQuickFeed = () => {
    // Check if food in inventory
    const foodItems = Object.keys(pet.inventory || {}).filter(k => k.startsWith('food_') && pet.inventory[k] > 0);
    if (foodItems.length > 0) {
      const firstFood = foodItems[0];
      const itemInfo = GARDEN_SHOP_CATALOG.find(i => i.id === firstFood);
      onUpdatePet(prev => ({
        ...prev,
        hunger: Math.min(100, prev.hunger + 30),
        happiness: Math.min(100, prev.happiness + 15),
        exp: prev.exp + 10,
        inventory: {
          ...prev.inventory,
          [firstFood]: prev.inventory[firstFood] - 1
        }
      }));
      playSuccessSound();
      showToast(`Đã cho bé ăn ${itemInfo?.name || 'món ngon'}! +30 no bụng 😋`);
    } else {
      if (pet.coins >= 10) {
        // Direct buy treat
        onUpdatePet(prev => ({
          ...prev,
          coins: prev.coins - 10,
          hunger: Math.min(100, prev.hunger + 30),
          happiness: Math.min(100, prev.happiness + 15),
          exp: prev.exp + 10
        }));
        playSuccessSound();
        showToast('Mua nhanh cá ngừ tươi ngon (-10 xu). Bé ăn rất vui! 🐟');
      } else {
        showToast('Bạn chưa có thức ăn trong kho! Hãy hoàn thành bài tập để nhận thêm xu nhé. 🪙');
      }
    }
  };

  // Quick Action: Play with Pet
  const handleQuickPlay = () => {
    if (pet.energy < 15) {
      showToast('Bé cưng đang mệt, hãy cho bé chợp mắt nghỉ ngơi một lát nhé! 💤');
      return;
    }
    onUpdatePet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 25),
      energy: Math.max(0, prev.energy - 10),
      exp: prev.exp + 12
    }));
    playChime('sweet');
    showToast('Bé cưng rất thích chơi đùa cùng bạn! +25 vui vẻ 🥰');
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  // Quick Action: Pet Sleep / Rest
  const handleQuickRest = () => {
    onUpdatePet(prev => ({
      ...prev,
      energy: Math.min(100, prev.energy + 35),
      happiness: Math.min(100, prev.happiness + 10)
    }));
    playChime('zen_bell');
    showToast('Bé đã ngủ ngon trong nhà gỗ! Hồi phục +35 năng lượng 💤');
  };

  // Buy Item in Shop
  const handleBuyItem = (item: GardenShopItem) => {
    if (pet.coins < item.price) {
      showToast(`Bạn cần thêm ${item.price - pet.coins} xu nữa để mua món này! Hoàn thành thêm task nhé.`);
      return;
    }

    onUpdatePet(prev => {
      const nextCoins = prev.coins - item.price;
      const nextUnlocked = prev.unlockedItems.includes(item.id) 
        ? prev.unlockedItems 
        : [...prev.unlockedItems, item.id];

      // Handle consumable foods and toys
      if (item.category === 'food' || item.category === 'toy') {
        const curQty = prev.inventory?.[item.id] || 0;
        return {
          ...prev,
          coins: nextCoins,
          exp: prev.exp + 15,
          inventory: {
            ...prev.inventory,
            [item.id]: curQty + 1
          }
        };
      }

      // Handle house
      if (item.category === 'house') {
        return {
          ...prev,
          coins: nextCoins,
          equippedHouse: item.id,
          unlockedItems: nextUnlocked
        };
      }

      // Handle garden decor
      if (item.category === 'garden') {
        const decors = prev.equippedGardenDecor || [];
        return {
          ...prev,
          coins: nextCoins,
          equippedGardenDecor: decors.includes(item.id) ? decors : [...decors, item.id],
          unlockedItems: nextUnlocked
        };
      }

      // Handle effect
      if (item.category === 'effect') {
        return {
          ...prev,
          coins: nextCoins,
          equippedEffect: item.id,
          unlockedItems: nextUnlocked
        };
      }

      // Handle costume
      return {
        ...prev,
        coins: nextCoins,
        equippedHat: item.id,
        unlockedItems: nextUnlocked
      };
    });

    playSuccessSound();
    showToast(`Đã mua thành công ${item.name}! 🎉`);
  };

  // Toggle Equip Garden Decor
  const handleToggleDecor = (itemId: string) => {
    onUpdatePet(prev => {
      const current = prev.equippedGardenDecor || [];
      const exists = current.includes(itemId);
      const next = exists ? current.filter(i => i !== itemId) : [...current, itemId];
      return {
        ...prev,
        equippedGardenDecor: next
      };
    });
    playChime('sweet');
  };

  const filteredShopItems = GARDEN_SHOP_CATALOG.filter(i => 
    shopCategory === 'all' ? true : i.category === shopCategory
  );

  return (
    <div className="space-y-6">
      {/* Top Header Navigation for Garden System */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-[#FFE4E8]">
        <div className="flex items-center p-1 bg-white rounded-2xl border border-[#FFCCD5] shadow-2xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('garden')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'garden'
                ? 'themed-primary-btn shadow-xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>🏡</span>
            Khu Vườn Của Bé
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'shop'
                ? 'themed-primary-btn shadow-xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>🛍️</span>
            Cửa Hàng ({GARDEN_SHOP_CATALOG.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'themed-primary-btn shadow-xs'
                : 'text-[#8C6D7C] hover:text-[#4A3B43]'
            }`}
          >
            <span>🎒</span>
            Kho Đồ Của Bạn
          </button>
        </div>

        {/* Currency & Level Pill */}
        <div className="flex items-center gap-2 justify-end">
          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{pet.coins || 0} Xu</span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-[#FFF0F3] border border-[#FFCCD5] text-[#D81B60] text-xs font-black flex items-center gap-1 shadow-2xs">
            <Flame className="w-4 h-4 text-[#FF85A1] fill-[#FF85A1]" />
            <span>Cấp {pet.level || 1}</span>
          </div>
        </div>
      </div>

      {/* Floating Interaction Feedback Toast */}
      {interactionToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#4A3B43] text-white text-xs font-bold shadow-xl animate-fade-in-scale flex items-center gap-2">
          <span>✨</span>
          <span>{interactionToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. KHU VƯỜN THÚ CƯNG INTERACTIVE VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'garden' && (
        <div className="space-y-6">
          {/* Main Visual Garden Stage */}
          <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-[#FFCCD5] shadow-md bg-gradient-to-b from-[#EBF8FF] via-[#F0FDF4] to-[#DCFCE7] flex flex-col justify-between p-4 sm:p-6 select-none">
            {/* Top Garden Sky: Sun & Clouds & Sakura Petals */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs text-xs font-bold text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Khu vườn rực rỡ nắng ấm</span>
              </div>

              {/* Equipped Effect: Hearts / Sparkles / Meteors */}
              <div className="flex items-center gap-2">
                {pet.equippedEffect === 'effect_hearts' && (
                  <span className="text-xl animate-bounce">💖 💕 💗</span>
                )}
                {pet.equippedEffect === 'effect_sparkles' && (
                  <span className="text-xl animate-pulse">✨ ⭐ 🌟</span>
                )}
                {pet.equippedEffect === 'effect_meteor' && (
                  <span className="text-xl animate-pulse">🌠 💫 ⭐</span>
                )}
              </div>
            </div>

            {/* Middle Stage: House & Garden Decorations & Animated Pet */}
            <div className="relative w-full flex-1 flex items-end justify-between px-4 sm:px-12 pb-6 z-10">
              {/* House on the Left */}
              <div className="flex flex-col items-center">
                <div className="text-5xl sm:text-6xl filter drop-shadow-md hover:scale-105 transition cursor-pointer">
                  {pet.equippedHouse === 'house_mushroom' ? '🍄' : pet.equippedHouse === 'house_castle' ? '🏰' : '🏡'}
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-white/70 px-2 py-0.5 rounded-full mt-1">
                  Nhà của bé
                </span>
              </div>

              {/* Center: Walking & Bouncing Mascot Pet */}
              <div className="flex flex-col items-center justify-center animate-pet-wander">
                <div 
                  onClick={handleQuickPlay}
                  className="relative cursor-pointer transition transform hover:scale-110 active:scale-95 animate-pet-bounce group"
                  title="Nhấp để chơi đùa cùng bé cưng!"
                >
                  <MascotAvatar
                    type={pet.type || 'cat'}
                    mood={pet.happiness > 70 ? 'happy' : 'focused'}
                    equippedHat={pet.equippedHat}
                    size={95}
                  />

                  {/* Floating heart icon on hover */}
                  <div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition animate-float-heart text-lg">
                    💖
                  </div>
                </div>

                <div className="mt-2 px-3 py-0.5 rounded-full bg-white/90 border border-[#FFCCD5] text-[11px] font-black text-[#D81B60] shadow-xs">
                  {pet.name} (Lv.{pet.level || 1})
                </div>
              </div>

              {/* Right: Garden Trees & Decors */}
              <div className="flex items-end gap-2 sm:gap-4">
                {(pet.equippedGardenDecor || ['decor_sakura_tree']).map((decorId) => {
                  const item = GARDEN_SHOP_CATALOG.find(i => i.id === decorId);
                  return (
                    <div key={decorId} className="flex flex-col items-center text-4xl sm:text-5xl filter drop-shadow-sm">
                      <span>{item?.icon || '🌸'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Ground & Grass border */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-emerald-200 to-transparent pointer-events-none"></div>
          </div>

          {/* Pet Status Dashboard (Hunger, Happiness, Energy, XP) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Độ No Bụng */}
            <div className="p-4 rounded-3xl bg-white border border-amber-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4A3B43] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-500" /> Độ No Bụng
                </span>
                <span className="font-black text-amber-600">{pet.hunger || 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-amber-50 rounded-full overflow-hidden p-0.5 border border-amber-200">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pet.hunger || 0}%` }}
                />
              </div>
              <button
                onClick={handleQuickFeed}
                className="w-full mt-1 py-1.5 rounded-xl bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🐟</span> Cho Bé Ăn
              </button>
            </div>

            {/* 2. Độ Vui Vẻ */}
            <div className="p-4 rounded-3xl bg-white border border-rose-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4A3B43] flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Độ Vui Vẻ
                </span>
                <span className="font-black text-rose-600">{pet.happiness || 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-rose-50 rounded-full overflow-hidden p-0.5 border border-rose-200">
                <div 
                  className="h-full bg-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${pet.happiness || 0}%` }}
                />
              </div>
              <button
                onClick={handleQuickPlay}
                className="w-full mt-1 py-1.5 rounded-xl bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🧶</span> Chơi Cùng Bé
              </button>
            </div>

            {/* 3. Năng Lượng */}
            <div className="p-4 rounded-3xl bg-white border border-indigo-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4A3B43] flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-500" /> Năng Lượng
                </span>
                <span className="font-black text-indigo-600">{pet.energy || 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-indigo-50 rounded-full overflow-hidden p-0.5 border border-indigo-200">
                <div 
                  className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${pet.energy || 0}%` }}
                />
              </div>
              <button
                onClick={handleQuickRest}
                className="w-full mt-1 py-1.5 rounded-xl bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>💤</span> Nghỉ Ngơi
              </button>
            </div>

            {/* 4. Tiến Độ Cấp Độ & XP */}
            <div className="p-4 rounded-3xl bg-white border border-emerald-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4A3B43] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" /> Cấp Độ & XP
                </span>
                <span className="font-black text-emerald-600">{pet.exp || 0}/100 XP</span>
              </div>
              <div className="w-full h-2.5 bg-emerald-50 rounded-full overflow-hidden p-0.5 border border-emerald-200">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (pet.exp || 0) % 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-[#8C6D7C] text-center font-medium pt-1">
                Lên cấp tăng sức khỏe & thưởng xu
              </div>
            </div>
          </div>

          {/* Motivational Study & Task Earning Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FFF5F8] via-[#FFF0F3] to-[#FFE8EE] border-2 border-[#FFD1DC] shadow-xs flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-2xl flex items-center justify-center shadow-xs">
                🪙
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#4A3B43]">
                  Cách kiếm thêm Xu & XP chăm sóc thú cưng
                </h4>
                <p className="text-xs text-[#8C6D7C] mt-0.5">
                  Hoàn thành 1 Task (+10 Xu • +15 XP) • Hoàn thành Pomodoro (+20 Xu • +25 XP) • Uống đủ nước (+5 Xu).
                </p>
              </div>
            </div>

            {onNavigateToStudy && (
              <button
                onClick={onNavigateToStudy}
                className="px-4 py-2 rounded-xl themed-primary-btn text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Làm Việc & Học Tập Ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CỬA HÀNG THÚ CƯNG & KHU VƯỜN (SHOP) */}
      {/* ========================================================================= */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'food', label: '🐟 Thức Ăn' },
              { id: 'toy', label: '🧶 Đồ Chơi' },
              { id: 'costume', label: '🎀 Trang Phục' },
              { id: 'house', label: '🏡 Nhà Cửa' },
              { id: 'garden', label: '🌸 Cây Cối & Vườn' },
              { id: 'effect', label: '✨ Hiệu Ứng' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setShopCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  shopCategory === cat.id
                    ? 'themed-primary-btn shadow-xs'
                    : 'bg-white text-[#8C6D7C] border border-[#FFCCD5] hover:bg-[#FFF0F3]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Shop Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredShopItems.map((item) => {
              const isUnlocked = pet.unlockedItems.includes(item.id);
              const isEquipped = pet.equippedHat === item.id || 
                                 pet.equippedHouse === item.id || 
                                 pet.equippedEffect === item.id || 
                                 (pet.equippedGardenDecor || []).includes(item.id);
              const inventoryQty = pet.inventory?.[item.id] || 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-3xl bg-white border border-[#FFCCD5] hover:border-[#FF85A1] shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#FFF5F7] mx-auto flex items-center justify-center text-3xl mb-2.5 shadow-xs">
                      {item.icon}
                    </div>

                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-[#8C6D7C] bg-gray-100 px-2 py-0.5 rounded-md">
                        {item.categoryLabel}
                      </span>
                      <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 fill-amber-500" />
                        {item.price} Xu
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-[#4A3B43] mt-1">{item.name}</h4>
                    <p className="text-[11px] text-[#8C6D7C] line-clamp-2 mt-0.5">{item.description}</p>
                    <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-2">
                      {item.bonusDesc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#FFE4E8]">
                    {item.category === 'food' || item.category === 'toy' ? (
                      <button
                        onClick={() => handleBuyItem(item)}
                        className="w-full py-2 rounded-xl themed-primary-btn text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Mua Thêm ({inventoryQty} đang có)
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          if (item.category === 'garden') {
                            handleToggleDecor(item.id);
                          } else {
                            handleBuyItem(item); // Equip
                          }
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          isEquipped
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-gray-100 text-[#4A3B43] hover:bg-gray-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isEquipped ? 'Đang Dùng' : 'Mặc / Đặt Lên'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyItem(item)}
                        className="w-full py-2 rounded-xl themed-primary-btn text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Mua Ngay ({item.price} Xu)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. KHO ĐỒ CÁ NHÂN (INVENTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#FFCCD5] shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#4A3B43] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FF85A1]" />
              Kho Đồ & Vật Phẩm Đang Sở Hữu
            </h4>

            {/* Consumable food & toys */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(pet.inventory || {}).filter(([_, qty]) => qty > 0).map(([itemId, qty]) => {
                const item = GARDEN_SHOP_CATALOG.find(i => i.id === itemId);
                if (!item) return null;

                return (
                  <div key={itemId} className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-[#FFCCD5] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h5 className="text-xs font-bold text-[#4A3B43]">{item.name}</h5>
                        <p className="text-[10px] text-[#8C6D7C]">Số lượng: <strong>{qty} món</strong></p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (item.category === 'food') {
                          handleQuickFeed();
                        } else {
                          handleQuickPlay();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl themed-primary-btn text-xs font-bold transition cursor-pointer"
                    >
                      Dùng Ngay
                    </button>
                  </div>
                );
              })}
            </div>

            {Object.entries(pet.inventory || {}).filter(([_, qty]) => qty > 0).length === 0 && (
              <div className="text-center py-10 bg-[#FFFDFE] rounded-2xl border border-dashed border-[#FFCCD5]">
                <p className="text-2xl mb-1">🧺</p>
                <p className="text-xs text-[#8C6D7C]">Kho đồ ăn & đồ chơi hiện đang trống</p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="mt-2 text-xs font-bold text-[#FF85A1] hover:underline"
                >
                  Ghé thăm Cửa Hàng để mua sắm cho bé cưng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
