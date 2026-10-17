import React from 'react';

// Cute Mascot SVG Renderer with interactive mood & 20+ outfits/accessories
interface MascotProps {
  type: 'cat' | 'rabbit' | 'bear' | 'fox' | 'penguin' | 'puppy';
  mood?: 'happy' | 'focused' | 'sleepy' | 'cheering';
  equippedHat?: string;
  equippedAccessory?: string;
  size?: number;
  className?: string;
  isBouncing?: boolean;
}

export const MascotAvatar: React.FC<MascotProps> = ({
  type = 'cat',
  mood = 'happy',
  equippedHat,
  equippedAccessory,
  size = 120,
  className = '',
  isBouncing = false,
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${isBouncing ? 'animate-bounce' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Pastel Gradients */}
          <linearGradient id="bodyGradCat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF9F6" />
            <stop offset="100%" stopColor="#FFE4E8" />
          </linearGradient>
          <linearGradient id="bodyGradRabbit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFDEE9" />
          </linearGradient>
          <linearGradient id="bodyGradBear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD3B6" />
            <stop offset="100%" stopColor="#FFAAA6" />
          </linearGradient>
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF85A1" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FF85A1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ears */}
        {type === 'cat' && (
          <g id="cat-ears">
            <polygon points="26,40 18,16 42,28" fill="#FFCCD5" stroke="#FFAAA6" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="26,36 21,21 38,28" fill="#FF9EAA" />
            <polygon points="74,40 82,16 58,28" fill="#FFCCD5" stroke="#FFAAA6" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="74,36 79,21 62,28" fill="#FF9EAA" />
          </g>
        )}

        {type === 'rabbit' && (
          <g id="rabbit-ears">
            <ellipse cx="32" cy="18" rx="8" ry="18" transform="rotate(-10 32 18)" fill="#FFF0F5" stroke="#FFB6C1" strokeWidth="2.5" />
            <ellipse cx="32" cy="18" rx="4.5" ry="12" transform="rotate(-10 32 18)" fill="#FF9EAA" />
            <ellipse cx="68" cy="18" rx="8" ry="18" transform="rotate(10 68 18)" fill="#FFF0F5" stroke="#FFB6C1" strokeWidth="2.5" />
            <ellipse cx="68" cy="18" rx="4.5" ry="12" transform="rotate(10 68 18)" fill="#FF9EAA" />
          </g>
        )}

        {type === 'bear' && (
          <g id="bear-ears">
            <circle cx="26" cy="28" r="12" fill="#FFB7B2" stroke="#FF85A1" strokeWidth="2.5" />
            <circle cx="26" cy="28" r="6" fill="#FF6B8B" opacity="0.6" />
            <circle cx="74" cy="28" r="12" fill="#FFB7B2" stroke="#FF85A1" strokeWidth="2.5" />
            <circle cx="74" cy="28" r="6" fill="#FF6B8B" opacity="0.6" />
          </g>
        )}

        {type === 'fox' && (
          <g id="fox-ears">
            <polygon points="26,40 14,14 44,28" fill="#FFB74D" stroke="#F57C00" strokeWidth="2.5" />
            <polygon points="26,36 18,20 40,28" fill="#FFF3E0" />
            <polygon points="74,40 86,14 56,28" fill="#FFB74D" stroke="#F57C00" strokeWidth="2.5" />
            <polygon points="74,36 82,20 60,28" fill="#FFF3E0" />
          </g>
        )}

        {type === 'penguin' && (
          <g id="penguin-features">
            <ellipse cx="50" cy="58" rx="42" ry="36" fill="#37474F" />
            <ellipse cx="50" cy="60" rx="30" ry="26" fill="#ECEFF1" />
            <polygon points="46,59 54,59 50,67" fill="#FFA000" />
          </g>
        )}

        {type === 'puppy' && (
          <g id="puppy-ears">
            <ellipse cx="20" cy="42" rx="10" ry="18" transform="rotate(25 20 42)" fill="#D7CCC8" stroke="#8D6E63" strokeWidth="2" />
            <ellipse cx="80" cy="42" rx="10" ry="18" transform="rotate(-25 80 42)" fill="#D7CCC8" stroke="#8D6E63" strokeWidth="2" />
          </g>
        )}

        {/* Head Base */}
        <ellipse
          cx="50"
          cy="58"
          rx="38"
          ry="34"
          fill={
            type === 'cat' 
              ? 'url(#bodyGradCat)' 
              : type === 'rabbit' 
                ? 'url(#bodyGradRabbit)' 
                : type === 'bear' 
                  ? 'url(#bodyGradBear)' 
                  : type === 'fox' 
                    ? '#FFE0B2' 
                    : type === 'penguin' 
                      ? '#ECEFF1' 
                      : '#FFF8E1'
          }
          stroke="#FFB6C1"
          strokeWidth="3"
        />

        {/* Cheeks Blush */}
        <circle cx="26" cy="65" r="8" fill="url(#blushGrad)" />
        <circle cx="74" cy="65" r="8" fill="url(#blushGrad)" />

        {/* Eyes based on mood */}
        {mood === 'happy' && (
          <g id="eyes-happy">
            <path d="M 30 55 Q 36 49 42 55" stroke="#4A3B43" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 58 55 Q 64 49 70 55" stroke="#4A3B43" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {mood === 'focused' && (
          <g id="eyes-focused">
            <ellipse cx="36" cy="54" rx="4.5" ry="5.5" fill="#4A3B43" />
            <circle cx="34.5" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="38" cy="56" r="0.9" fill="#FFFFFF" />
            <ellipse cx="64" cy="54" rx="4.5" ry="5.5" fill="#4A3B43" />
            <circle cx="62.5" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="66" cy="56" r="0.9" fill="#FFFFFF" />
          </g>
        )}

        {mood === 'sleepy' && (
          <g id="eyes-sleepy">
            <path d="M 30 57 L 42 57" stroke="#4A3B43" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 58 57 L 70 57" stroke="#4A3B43" strokeWidth="3.5" strokeLinecap="round" />
            <text x="74" y="38" fill="#FF85A1" fontSize="12" fontWeight="bold" fontFamily="sans-serif">z</text>
            <text x="82" y="28" fill="#FFB6C1" fontSize="10" fontWeight="bold" fontFamily="sans-serif">z</text>
          </g>
        )}

        {mood === 'cheering' && (
          <g id="eyes-cheering">
            <path d="M 28 55 L 36 50 L 44 55" stroke="#4A3B43" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 56 55 L 64 50 L 72 55" stroke="#4A3B43" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        )}

        {/* Cute Tiny Nose */}
        <polygon points="50,62 47,59 53,59" fill="#FF6B8B" />

        {/* Smiling Mouth */}
        <path d="M 45 64 Q 50 69 55 64" stroke="#4A3B43" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Whiskers for Cat */}
        {type === 'cat' && (
          <g id="cat-whiskers" stroke="#FFAAA6" strokeWidth="1.5" strokeLinecap="round">
            <line x1="16" y1="62" x2="24" y2="64" />
            <line x1="16" y1="68" x2="24" y2="67" />
            <line x1="76" y1="64" x2="84" y2="62" />
            <line x1="76" y1="67" x2="84" y2="68" />
          </g>
        )}

        {/* Paws */}
        <ellipse cx="32" cy="85" rx="7" ry="5" fill="#FFFFFF" stroke="#FFAAA6" strokeWidth="2" />
        <ellipse cx="68" cy="85" rx="7" ry="5" fill="#FFFFFF" stroke="#FFAAA6" strokeWidth="2" />

        {/* ================= HATS & HEADWEAR LAYERS ================= */}
        {/* 1. Nơ Hồng Pastel */}
        {equippedHat === 'pink_ribbon' && (
          <g id="hat-pink-ribbon" transform="translate(40, 18) scale(0.9)">
            <ellipse cx="0" cy="0" rx="8" ry="6" fill="#FF85A1" stroke="#E64980" strokeWidth="1.5" transform="rotate(-15)" />
            <ellipse cx="20" cy="0" rx="8" ry="6" fill="#FF85A1" stroke="#E64980" strokeWidth="1.5" transform="rotate(15)" />
            <circle cx="10" cy="0" r="4.5" fill="#FFD1DC" stroke="#E64980" strokeWidth="1.5" />
          </g>
        )}

        {/* 2. Mũ Cử Nhân Đại Học */}
        {equippedHat === 'student_cap' && (
          <g id="hat-student-cap" transform="translate(18, 12)">
            <polygon points="32,2 62,14 32,24 2,14" fill="#4B306A" stroke="#2B1055" strokeWidth="1.5" />
            <rect x="18" y="16" width="28" height="9" rx="3" fill="#382054" />
            <line x1="32" y1="13" x2="16" y2="24" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="25" r="2.5" fill="#FFA500" />
          </g>
        )}

        {/* 3. Mũ Nồi Dâu Tây */}
        {equippedHat === 'strawberry_beret' && (
          <g id="hat-strawberry-beret" transform="translate(30, 14)">
            <ellipse cx="20" cy="10" rx="24" ry="12" fill="#FF5376" stroke="#D81B60" strokeWidth="2" />
            <path d="M 20 2 Q 18 -4 14 -5" stroke="#66BB6A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="12" cy="8" r="1" fill="#FFD54F" />
            <circle cx="20" cy="12" r="1" fill="#FFD54F" />
            <circle cx="28" cy="8" r="1" fill="#FFD54F" />
          </g>
        )}

        {/* 4. Vòng Thiên Thần */}
        {equippedHat === 'angel_halo' && (
          <g id="hat-angel-halo" transform="translate(50, 16)">
            <ellipse cx="0" cy="0" rx="22" ry="6" fill="none" stroke="#FFD700" strokeWidth="3.5" filter="drop-shadow(0 0 4px #FFEE58)" />
            <ellipse cx="0" cy="0" rx="20" ry="4.5" fill="none" stroke="#FFF" strokeWidth="1.5" />
          </g>
        )}

        {/* 5. Bờm Hoa Hướng Dương */}
        {equippedHat === 'sunflower_band' && (
          <g id="hat-sunflower" transform="translate(50, 24)">
            <path d="M -24 5 Q 0 -5 24 5" stroke="#8D6E63" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="0" cy="-2" r="6" fill="#FFB300" stroke="#FF8F00" strokeWidth="1.5" />
            <circle cx="0" cy="-2" r="3" fill="#5D4037" />
            <circle cx="-14" cy="1" r="4.5" fill="#FFCA28" />
            <circle cx="-14" cy="1" r="2" fill="#6D4C41" />
            <circle cx="14" cy="1" r="4.5" fill="#FFCA28" />
            <circle cx="14" cy="1" r="2" fill="#6D4C41" />
          </g>
        )}

        {/* 6. Mũ Ếch Xanh Dễ Thương */}
        {equippedHat === 'frog_hat' && (
          <g id="hat-frog" transform="translate(50, 24)">
            <path d="M -26 12 Q 0 -10 26 12" fill="#81C784" stroke="#4CAF50" strokeWidth="2.5" />
            {/* Frog big eyes */}
            <circle cx="-14" cy="-4" r="7" fill="#81C784" stroke="#4CAF50" strokeWidth="2" />
            <circle cx="-14" cy="-4" r="3.5" fill="#FFFFFF" />
            <circle cx="-14" cy="-4" r="1.5" fill="#1B5E20" />
            <circle cx="14" cy="-4" r="7" fill="#81C784" stroke="#4CAF50" strokeWidth="2" />
            <circle cx="14" cy="-4" r="3.5" fill="#FFFFFF" />
            <circle cx="14" cy="-4" r="1.5" fill="#1B5E20" />
          </g>
        )}

        {/* 7. Vương Miện Thủ Khoa */}
        {equippedHat === 'royal_crown' && (
          <g id="hat-crown" transform="translate(32, 12)">
            <polygon points="2,16 8,4 18,12 28,4 34,16" fill="#FFD54F" stroke="#FFA000" strokeWidth="2" />
            <rect x="2" y="16" width="32" height="5" rx="1.5" fill="#FFCA28" stroke="#FFA000" strokeWidth="1" />
            <circle cx="8" cy="4" r="2" fill="#E91E63" />
            <circle cx="18" cy="12" r="2" fill="#00E5FF" />
            <circle cx="28" cy="4" r="2" fill="#E91E63" />
          </g>
        )}

        {/* 8. Mũ Len Mùa Thi */}
        {equippedHat === 'warm_beanie' && (
          <g id="hat-beanie" transform="translate(24, 12)">
            <path d="M 4 20 Q 26 -6 48 20" fill="#BA68C8" stroke="#8E24AA" strokeWidth="2" />
            <rect x="2" y="18" width="48" height="7" rx="3" fill="#CE93D8" stroke="#8E24AA" strokeWidth="1.5" />
            <circle cx="26" cy="1" r="5.5" fill="#F3E5F5" stroke="#BA68C8" strokeWidth="1.5" />
          </g>
        )}

        {/* 9. Băng Đô Tai Thỏ */}
        {equippedHat === 'bunny_ears' && (
          <g id="hat-bunny-band" transform="translate(50, 24)">
            <path d="M -24 4 Q 0 -6 24 4" stroke="#F48FB1" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="-12" cy="-14" rx="5" ry="14" fill="#FFFFFF" stroke="#F48FB1" strokeWidth="2" />
            <ellipse cx="-12" cy="-14" rx="2.5" ry="9" fill="#FF80AB" />
            <ellipse cx="12" cy="-14" rx="5" ry="14" fill="#FFFFFF" stroke="#F48FB1" strokeWidth="2" />
            <ellipse cx="12" cy="-14" rx="2.5" ry="9" fill="#FF80AB" />
          </g>
        )}

        {/* 10. Mũ Cốc Trà Sữa Ngọt Ngào */}
        {equippedHat === 'bubble_tea_hat' && (
          <g id="hat-bubble-tea" transform="translate(42, 6) scale(0.65)">
            <polygon points="4,8 24,8 21,34 7,34" fill="#FFE0B2" stroke="#8D6E63" strokeWidth="2" rx="2" />
            <line x1="14" y1="8" x2="18" y2="-4" stroke="#FF85A1" strokeWidth="3" strokeLinecap="round" />
            <circle cx="11" cy="28" r="2" fill="#4E342E" />
            <circle cx="17" cy="27" r="2" fill="#4E342E" />
            <circle cx="14" cy="22" r="2" fill="#4E342E" />
          </g>
        )}

        {/* 11. Mũ Thám Tử Sherlock */}
        {equippedHat === 'detective_hat' && (
          <g id="hat-detective" transform="translate(24, 10)">
            <path d="M 6 22 Q 26 2 46 22" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
            <path d="M 0 22 Q 26 14 52 22" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="26" cy="7" r="3" fill="#D7CCC8" />
          </g>
        )}

        {/* 12. Bờm Tai Cáo Cam Nhí Nhảnh */}
        {equippedHat === 'fox_ears' && (
          <g id="hat-fox-ears" transform="translate(50, 24)">
            <path d="M -24 4 Q 0 -6 24 4" stroke="#E65100" strokeWidth="3" fill="none" strokeLinecap="round" />
            <polygon points="-18,2 -12,-16 -4,2" fill="#FF9800" stroke="#E65100" strokeWidth="2" />
            <polygon points="-16,1 -12,-11 -7,1" fill="#FFF3E0" />
            <polygon points="4,2 12,-16 18,2" fill="#FF9800" stroke="#E65100" strokeWidth="2" />
            <polygon points="7,1 12,-11 16,1" fill="#FFF3E0" />
          </g>
        )}

        {/* 13. Vương Miện Kim Cương Tinh Xảo */}
        {equippedHat === 'crystal_crown' && (
          <g id="hat-crystal" transform="translate(30, 8)">
            <polygon points="4,18 10,4 20,12 30,4 36,18" fill="#E0F7FA" stroke="#00BCD4" strokeWidth="2" />
            <rect x="2" y="18" width="36" height="5" rx="1.5" fill="#B2EBF2" stroke="#00BCD4" strokeWidth="1" />
            <circle cx="10" cy="4" r="2.5" fill="#00E5FF" />
            <circle cx="20" cy="12" r="3" fill="#E040FB" />
            <circle cx="30" cy="4" r="2.5" fill="#00E5FF" />
          </g>
        )}

        {/* ================= ACCESSORIES & ITEMS LAYERS ================= */}
        {/* Cánh Thiên Thần Pastel (Vẽ sau lưng) */}
        {equippedAccessory === 'angel_wings' && (
          <g id="acc-wings" transform="translate(50, 56)">
            <path d="M -28 -2 Q -48 -25 -32 -40 Q -20 -28 -22 -12" fill="#FFFFFF" stroke="#FF85A1" strokeWidth="2.5" />
            <path d="M 28 -2 Q 48 -25 32 -40 Q 20 -28 22 -12" fill="#FFFFFF" stroke="#FF85A1" strokeWidth="2.5" />
            <circle cx="-32" cy="-28" r="2" fill="#FFD54F" />
            <circle cx="32" cy="-28" r="2" fill="#FFD54F" />
          </g>
        )}

        {/* Áo Choàng Phù Thủy Học Thuật */}
        {equippedAccessory === 'wizard_cape' && (
          <g id="acc-cape" transform="translate(50, 78)">
            <path d="M -28 -14 Q 0 -6 28 -14 Q 32 14 0 18 Q -32 14 -28 -14" fill="#673AB7" stroke="#4527A0" strokeWidth="2" />
            <polygon points="0,-8 3,-2 9,-2 4,2 6,8 0,4 -6,8 -4,2 -9,-2 -3,-2" fill="#FFD54F" stroke="#FFA000" strokeWidth="1" />
          </g>
        )}

        {/* 1. Ly Trà Sữa Trân Châu */}
        {equippedAccessory === 'boba_tea' && (
          <g id="acc-boba-tea" transform="translate(68, 62) scale(0.7)">
            <polygon points="4,8 24,8 21,34 7,34" fill="#FFE0B2" stroke="#8D6E63" strokeWidth="2" rx="3" />
            <line x1="14" y1="8" x2="18" y2="-4" stroke="#FF85A1" strokeWidth="3" strokeLinecap="round" />
            <circle cx="11" cy="28" r="2.5" fill="#4E342E" />
            <circle cx="17" cy="27" r="2.5" fill="#4E342E" />
            <circle cx="14" cy="22" r="2.5" fill="#4E342E" />
          </g>
        )}

        {/* 2. Kính Cận Tri Thức */}
        {equippedAccessory === 'smart_glasses' && (
          <g id="acc-smart-glasses" transform="translate(26, 47)">
            <rect x="0" y="0" width="18" height="13" rx="4" fill="rgba(255,255,255,0.4)" stroke="#795548" strokeWidth="2" />
            <rect x="28" y="0" width="18" height="13" rx="4" fill="rgba(255,255,255,0.4)" stroke="#795548" strokeWidth="2" />
            <line x1="18" y1="6" x2="28" y2="6" stroke="#795548" strokeWidth="2" />
          </g>
        )}

        {/* 3. Bút Chì Màu Lấp Lánh */}
        {equippedAccessory === 'magic_wand' && (
          <g id="acc-magic-wand" transform="translate(10, 58) rotate(-25) scale(0.7)">
            <line x1="0" y1="30" x2="0" y2="0" stroke="#FFB74D" strokeWidth="3.5" strokeLinecap="round" />
            <polygon points="0,-12 4,-3 12,-3 6,2 8,10 0,6 -8,10 -6,2 -12,-3 -4,-3" fill="#FFD54F" stroke="#FFA000" strokeWidth="1" />
          </g>
        )}

        {/* 4. Laptop Mini Chạy Deadline */}
        {equippedAccessory === 'mini_laptop' && (
          <g id="acc-laptop" transform="translate(62, 68) scale(0.65)">
            <polygon points="2,14 26,4 32,24 8,30" fill="#CFD8DC" stroke="#455A64" strokeWidth="2" />
            <polygon points="8,4 30,2 32,22 10,20" fill="#90A4AE" stroke="#37474F" strokeWidth="1.5" />
            <circle cx="20" cy="11" r="2.5" fill="#ECEFF1" />
          </g>
        )}

        {/* 5. Tai Nghe Chống Ồn Lofi */}
        {equippedAccessory === 'lofi_headphones' && (
          <g id="acc-headphones" transform="translate(50, 48)">
            <path d="M -34 0 Q 0 -36 34 0" stroke="#FF85A1" strokeWidth="4" fill="none" strokeLinecap="round" />
            <ellipse cx="-34" cy="6" rx="6" ry="10" fill="#FFFFFF" stroke="#FF4081" strokeWidth="2" />
            <ellipse cx="34" cy="6" rx="6" ry="10" fill="#FFFFFF" stroke="#FF4081" strokeWidth="2" />
          </g>
        )}

        {/* 6. Balo Sinh Viên */}
        {equippedAccessory === 'student_backpack' && (
          <g id="acc-backpack" transform="translate(4, 60) scale(0.65)">
            <rect x="0" y="4" width="22" height="26" rx="6" fill="#80CBC4" stroke="#00897B" strokeWidth="2" />
            <rect x="3" y="15" width="16" height="12" rx="3" fill="#B2DFDB" stroke="#00897B" strokeWidth="1.5" />
            <path d="M 6 4 Q 11 -2 16 4" stroke="#00695C" strokeWidth="2" fill="none" />
          </g>
        )}

        {/* 7. Bánh Kem Dâu */}
        {equippedAccessory === 'strawberry_cake' && (
          <g id="acc-cake" transform="translate(8, 68) scale(0.65)">
            <polygon points="2,14 26,4 32,24 8,30" fill="#FFF8E1" stroke="#FF8A80" strokeWidth="1.5" />
            <polygon points="2,14 26,4 28,8 6,17" fill="#FF80AB" />
            <circle cx="16" cy="6" r="3.5" fill="#E91E63" />
          </g>
        )}

        {/* 8. Huy Chương Xuất Sắc */}
        {equippedAccessory === 'gold_medal' && (
          <g id="acc-medal" transform="translate(44, 72) scale(0.7)">
            <path d="M 0 0 L 8 14 L 16 0" stroke="#E53935" strokeWidth="3" fill="none" />
            <circle cx="8" cy="18" r="7" fill="#FFD54F" stroke="#FFA000" strokeWidth="2" />
            <text x="5.5" y="21" fill="#E65100" fontSize="8" fontWeight="black">1</text>
          </g>
        )}

        {/* 9. Cốc Cà Phê Sáng */}
        {equippedAccessory === 'coffee_cup' && (
          <g id="acc-coffee" transform="translate(68, 65) scale(0.65)">
            <rect x="4" y="8" width="18" height="20" rx="3" fill="#D7CCC8" stroke="#6D4C41" strokeWidth="2" />
            <path d="M 22 13 Q 28 17 22 21" stroke="#6D4C41" strokeWidth="2" fill="none" />
            <path d="M 9 4 Q 11 0 13 4" stroke="#BCAAA4" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 14 4 Q 16 0 18 4" stroke="#BCAAA4" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* 10. Bình Nước Pastel */}
        {equippedAccessory === 'water_bottle' && (
          <g id="acc-water" transform="translate(70, 62) scale(0.65)">
            <rect x="6" y="8" width="14" height="26" rx="4" fill="#B3E5FC" stroke="#0288D1" strokeWidth="2" />
            <rect x="9" y="3" width="8" height="5" rx="2" fill="#81D4FA" stroke="#0288D1" strokeWidth="1.5" />
            <line x1="8" y1="18" x2="18" y2="18" stroke="#0288D1" strokeWidth="1" strokeDasharray="2,2" />
          </g>
        )}

        {/* 11. Cúp Vàng Danh Dự */}
        {equippedAccessory === 'honor_trophy' && (
          <g id="acc-trophy" transform="translate(68, 58) scale(0.7)">
            <polygon points="4,4 20,4 16,18 8,18" fill="#FFD54F" stroke="#FFA000" strokeWidth="2" />
            <rect x="10" y="18" width="4" height="6" fill="#FFA000" />
            <rect x="6" y="24" width="12" height="4" rx="1" fill="#795548" />
            <path d="M 4 8 Q -2 11 4 14" stroke="#FFA000" strokeWidth="1.5" fill="none" />
            <path d="M 20 8 Q 26 11 20 14" stroke="#FFA000" strokeWidth="1.5" fill="none" />
          </g>
        )}

        {/* 12. Bảng Màu Sáng Tạo */}
        {equippedAccessory === 'artist_palette' && (
          <g id="acc-palette" transform="translate(8, 62) scale(0.65)">
            <path d="M 12 0 C 26 0, 32 12, 28 22 C 24 30, 10 30, 4 20 C -2 10, 4 0, 12 0 Z" fill="#FFE082" stroke="#FFA000" strokeWidth="2" />
            <circle cx="8" cy="8" r="2.5" fill="#E53935" />
            <circle cx="16" cy="6" r="2.5" fill="#43A047" />
            <circle cx="22" cy="12" r="2.5" fill="#1E88E5" />
            <circle cx="18" cy="20" r="2.5" fill="#FB8C00" />
          </g>
        )}

        {/* 13. Ô Hoa Anh Đào Pastel */}
        {equippedAccessory === 'sakura_umbrella' && (
          <g id="acc-umbrella" transform="translate(70, 42) rotate(15) scale(0.65)">
            <path d="M -16 16 Q 0 -6 16 16 Z" fill="#F8BBD0" stroke="#EC407A" strokeWidth="2" />
            <line x1="0" y1="16" x2="0" y2="40" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 0 40 Q -4 44 -8 40" stroke="#8D6E63" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {/* 14. Khăn Quàng Cổ Ấm Áp */}
        {equippedAccessory === 'winter_scarf' && (
          <g id="acc-scarf" transform="translate(50, 68)">
            <path d="M -22 -2 Q 0 8 22 -2 Q 24 6 0 10 Q -24 6 -22 -2 Z" fill="#FF80AB" stroke="#E91E63" strokeWidth="1.5" />
            <rect x="6" y="4" width="8" height="14" rx="2" fill="#FF4081" />
            <line x1="7" y1="18" x2="13" y2="18" stroke="#FFE4E8" strokeWidth="2" strokeDasharray="1,1" />
          </g>
        )}

        {/* 15. Kính Râm Idol Siêu Ngầu */}
        {equippedAccessory === 'stylish_shades' && (
          <g id="acc-shades" transform="translate(50, 49)">
            <polygon points="-24,-4 -4,-4 -6,6 -22,6" fill="#212121" stroke="#000" strokeWidth="1" />
            <polygon points="4,-4 24,-4 22,6 6,6" fill="#212121" stroke="#000" strokeWidth="1" />
            <line x1="-4" y1="-2" x2="4" y2="-2" stroke="#424242" strokeWidth="2" />
            <line x1="-22" y1="-2" x2="-8" y2="4" stroke="#FFF" strokeWidth="1" opacity="0.6" />
            <line x1="6" y1="-2" x2="20" y2="4" stroke="#FFF" strokeWidth="1" opacity="0.6" />
          </g>
        )}

        {/* 16. Đôi Cánh Kỳ Lân Ánh Sáng */}
        {equippedAccessory === 'unicorn_wings' && (
          <g id="acc-unicorn-wings" transform="translate(50, 56)">
            <path d="M -28 -4 Q -50 -30 -32 -46 Q -18 -32 -20 -12" fill="#E1F5FE" stroke="#81D4FA" strokeWidth="2.5" />
            <path d="M 28 -4 Q 50 -30 32 -46 Q 18 -32 20 -12" fill="#E1F5FE" stroke="#81D4FA" strokeWidth="2.5" />
            <path d="M -24 -2 Q -42 -22 -28 -34" stroke="#FF80AB" strokeWidth="1.5" fill="none" />
            <path d="M 24 -2 Q 42 -22 28 -34" stroke="#FF80AB" strokeWidth="1.5" fill="none" />
          </g>
        )}

        {/* 17. Đèn Bàn Cú Đêm Học Giỏi */}
        {equippedAccessory === 'study_lamp' && (
          <g id="acc-lamp" transform="translate(68, 54) scale(0.65)">
            <path d="M 12 12 Q 18 4 24 10" stroke="#FFB300" strokeWidth="3" fill="none" />
            <polygon points="18,6 30,12 24,18" fill="#FFF9C4" stroke="#F57F17" strokeWidth="1.5" />
            <circle cx="28" cy="22" r="5" fill="#FFE082" opacity="0.6" />
            <rect x="8" y="24" width="12" height="4" rx="2" fill="#757575" />
          </g>
        )}

        {/* 18. Sổ Tay Bìa Da Kỷ Yếu */}
        {equippedAccessory === 'leather_notebook' && (
          <g id="acc-notebook" transform="translate(8, 62) scale(0.65)">
            <rect x="2" y="4" width="20" height="26" rx="2" fill="#5D4037" stroke="#3E2723" strokeWidth="2" />
            <line x1="8" y1="4" x2="8" y2="30" stroke="#8D6E63" strokeWidth="1.5" />
            <line x1="12" y1="10" x2="18" y2="10" stroke="#D7CCC8" strokeWidth="1.5" />
            <line x1="12" y1="15" x2="18" y2="15" stroke="#D7CCC8" strokeWidth="1.5" />
          </g>
        )}

        {/* 19. Bình Giữ Nhiệt Trà Thơm */}
        {equippedAccessory === 'smart_thermos' && (
          <g id="acc-thermos" transform="translate(70, 60) scale(0.65)">
            <rect x="6" y="8" width="14" height="24" rx="4" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2" />
            <rect x="8" y="2" width="10" height="6" rx="2" fill="#81C784" stroke="#388E3C" strokeWidth="1.5" />
            <circle cx="13" cy="18" r="2.5" fill="#4CAF50" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Cute Header Illustration Badges
export const SectionIllustration: React.FC<{ type: 'work' | 'life' | 'study' | 'schedule' | 'pomodoro' }> = ({ type }) => {
  if (type === 'work') {
    return (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFE4E8] to-[#FFF0F3] border border-[#FFCCD5] flex items-center justify-center text-2xl shadow-sm">
        ✨
      </div>
    );
  }
  if (type === 'life') {
    return (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFF3E0] to-[#FFE0B2] border border-[#FFCC80] flex items-center justify-center text-2xl shadow-sm">
        🌸
      </div>
    );
  }
  if (type === 'study') {
    return (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E1F5FE] to-[#B3E5FC] border border-[#81D4FA] flex items-center justify-center text-2xl shadow-sm">
        📚
      </div>
    );
  }
  if (type === 'schedule') {
    return (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F3E5F5] to-[#E1BEE7] border border-[#CE93D8] flex items-center justify-center text-2xl shadow-sm">
        🗓️
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFEBEE] to-[#FFCDD2] border border-[#EF9A9A] flex items-center justify-center text-2xl shadow-sm">
      ⏳
    </div>
  );
};
