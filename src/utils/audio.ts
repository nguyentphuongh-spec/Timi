/**
 * Sound synthesis engine using Web Audio API for TIMI
 * Provides 17 distinct synthesized chimes & ringtones across 4 categories:
 * - Dịu dàng & Thư thái (Gentle & Soothing)
 * - Dễ thương & Nhí nhảnh (Cute & Kawaii)
 * - Đơn giản & Tối giản (Simple & Minimalist)
 * - Mạnh mẽ & Quyết liệt (Powerful & Energetic)
 */

import { SoundPreset, SoundInfo } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Full Sound Catalog with detailed metadata for UI selectors
export const SOUND_CATALOG: SoundInfo[] = [
  // --- NHÓM 1: DỊU DÀNG & THƯ THÁI (GENTLE) ---
  {
    id: 'sweet',
    name: 'Chuông Ngọt Celesta',
    category: 'gentle',
    categoryLabel: '🌸 Dịu Dàng',
    icon: '🌸',
    description: 'Hợp âm Celesta C6 - E6 - G6 - C7 ngọt ngào, êm đềm như nắng mai'
  },
  {
    id: 'gentle_chime',
    name: 'Chuông Gió Nhật Bản',
    category: 'gentle',
    categoryLabel: '🌸 Dịu Dàng',
    icon: '🎐',
    description: 'Tiếng chuông gió mùa hè thanh khiết ngân nga, lắng đọng'
  },
  {
    id: 'zen_bell',
    name: 'Chuông Thiền Thanh Tịnh',
    category: 'gentle',
    categoryLabel: '🌸 Dịu Dàng',
    icon: '🧘',
    description: 'Tần số 432Hz xoa dịu tâm trí, giảm căng thẳng mùa thi cử'
  },
  {
    id: 'lofi_vibes',
    name: 'Hợp Âm Lofi Chiều Mưa',
    category: 'gentle',
    categoryLabel: '🌸 Dịu Dàng',
    icon: '☕',
    description: 'Hợp âm piano điện ấm áp, thư giãn lý tưởng lúc đang học bài'
  },
  {
    id: 'harp_glissando',
    name: 'Đàn Hạc Ban Mai',
    category: 'gentle',
    categoryLabel: '🌸 Dịu Dàng',
    icon: '🪕',
    description: 'Chuỗi hợp âm đàn hạc lướt nhẹ êm dịu, đánh thức tinh thần sảng khoái'
  },
  {
    id: 'ocean_waves_breeze',
    name: 'Sóng Biển Bình Yên',
    category: 'gentle',
    categoryLabel: '🌸 Dịu Dàng',
    icon: '🌊',
    description: 'Âm thanh sóng biển êm đềm kết hợp nốt chuông thanh thản'
  },
  {
    id: 'rain_on_leaves',
    name: 'Mưa Rơi Trên Tán Lá',
    category: 'gentle',
    categoryLabel: '🌸 Dịu Dàng',
    icon: '🌧️',
    description: 'Tiếng hạt mưa gõ tí tách êm ái, thanh lọc tâm trí tập trung'
  },
  {
    id: 'tibetan_bowl_deep',
    name: 'Chuông Xoay Tây Tạng',
    category: 'gentle',
    categoryLabel: '🌸 Dịu Dàng',
    icon: '🧘‍♂️',
    description: 'Tần số rung sâu 528Hz lan tỏa mở rộng luân xa, tái tạo năng lượng'
  },

  // --- NHÓM 2: DỄ THƯƠNG & NHÍ NHẢNH (CUTE) ---
  {
    id: 'kawaii_twinkle',
    name: 'Ngôi Sao Lấp Lánh',
    category: 'cute',
    categoryLabel: '✨ Dễ Thương',
    icon: '✨',
    description: 'Giai điệu ngôi sao thần tiên lấp lánh nốt cao tinh nghịch'
  },
  {
    id: 'cat_purr',
    name: 'Mèo Con Nũng Nịu',
    category: 'cute',
    categoryLabel: '✨ Dễ Thương',
    icon: '🐱',
    description: 'Tiếng bé mèo con kêu meo meo nũng nịu đánh thức bạn dậy'
  },
  {
    id: 'marimba',
    name: 'Marimba Gỗ Vui Nhộn',
    category: 'cute',
    categoryLabel: '✨ Dễ Thương',
    icon: '🪵',
    description: 'Phím gỗ marimba rộn ràng, mang lại năng lượng tích cực'
  },
  {
    id: 'birds',
    name: 'Chim Hót Bình Minh',
    category: 'cute',
    categoryLabel: '✨ Dễ Thương',
    icon: '🐦',
    description: 'Tiếng chim non hót líu lo chào đón một ngày học tập mới'
  },
  {
    id: 'bubble_pop',
    name: 'Bong Bóng Nước Pop',
    category: 'cute',
    categoryLabel: '✨ Dễ Thương',
    icon: '🫧',
    description: 'Tiếng bong bóng nước vỡ tí tách vui tai, nhẹ nhàng'
  },
  {
    id: 'puppy_bark',
    name: 'Corgi Sủa Gâu Gâu',
    category: 'cute',
    categoryLabel: '✨ Dễ Thương',
    icon: '🐶',
    description: 'Hai tiếng sủa gâu gâu nũng nịu siêu cưng của cún Corgi'
  },
  {
    id: 'magic_fairy_wand',
    name: 'Đũa Phép Phép Màu',
    category: 'cute',
    categoryLabel: '✨ Dễ Thương',
    icon: '🪄',
    description: 'Tiếng vung đũa phép thần tiên lấp lánh ban tặng phép màu'
  },
  {
    id: 'music_box_lullaby',
    name: 'Hộp Nhạc Cổ Tích',
    category: 'cute',
    categoryLabel: '✨ Dễ Thương',
    icon: '🎠',
    description: 'Giai điệu hộp nhạc dây cót trong trẻo, êm dịu tuổi thơ'
  },
  {
    id: 'baby_laugh_giggle',
    name: 'Tiếng Cười Khúc Khích',
    category: 'cute',
    categoryLabel: '✨ Dễ Thương',
    icon: '🥰',
    description: 'Tiếng cười khúc khích hồn nhiên mang lại nụ cười rạng rỡ cả ngày'
  },
  {
    id: 'game_coin_jump',
    name: 'Ăn Đồng Xu Vui Nhộn',
    category: 'cute',
    categoryLabel: '✨ Dễ Thương',
    icon: '🪙',
    description: 'Âm thanh ăn đồng xu vàng Mario cổ điển siêu bắt tai'
  },

  // --- NHÓM 3: ĐƠN GIẢN & TỐI GIẢN (SIMPLE) ---
  {
    id: 'bell',
    name: 'Chuông Kính Ding Ping',
    category: 'simple',
    categoryLabel: '🔔 Đơn Giản',
    icon: '🔔',
    description: 'Âm thanh ding trong trẻo, tiêu chuẩn, rõ ràng'
  },
  {
    id: 'digital_beep',
    name: 'Bíp Kỹ Thuật Số Digital',
    category: 'simple',
    categoryLabel: '🔔 Đơn Giản',
    icon: '📟',
    description: 'Hai nhịp bíp kỹ thuật số cổ điển, dứt khoát, chính xác'
  },
  {
    id: 'soft_ping',
    name: 'Ping Tối Giản Nhẹ Nhàng',
    category: 'simple',
    categoryLabel: '🔔 Đơn Giản',
    icon: '📍',
    description: 'Tiếng ping phẳng tinh tế, nhắc việc mà không gây giật mình'
  },
  {
    id: 'clock_tick',
    name: 'Kim Đồng Hồ Cổ Điển',
    category: 'simple',
    categoryLabel: '🔔 Đơn Giản',
    icon: '⏱️',
    description: 'Nhịp tích tắc đếm ngược nhắc nhở quý trọng từng giây phút'
  },
  {
    id: 'single_tone',
    name: 'Âm Báo Đơn Sắc 1000Hz',
    category: 'simple',
    categoryLabel: '🔔 Đơn Giản',
    icon: '🔘',
    description: 'Một nốt sine tinh khiết dứt khoát, chuẩn phong cách tối giản'
  },
  {
    id: 'radar_pulse',
    name: 'Xung Nhịp Radar',
    category: 'simple',
    categoryLabel: '🔔 Đơn Giản',
    icon: '📡',
    description: 'Xung sóng định vị không gian đều đặn, rõ ràng và hiện đại'
  },
  {
    id: 'typewriter_bell',
    name: 'Chuông Máy Đánh Chữ',
    category: 'simple',
    categoryLabel: '🔔 Đơn Giản',
    icon: '⌨️',
    description: 'Tiếng ting kết thúc dòng của máy chữ cổ điển, hoài niệm'
  },
  {
    id: 'metronome_wood',
    name: 'Máy Đếm Nhịp Gỗ',
    category: 'simple',
    categoryLabel: '🔔 Đơn Giản',
    icon: '🪵',
    description: 'Tiếng gõ nhịp gỗ chuẩn xác giúp duy trì nhịp độ làm việc tập trung'
  },

  // --- NHÓM 4: MẠNH MẼ & QUYẾT LIỆT (POWERFUL) ---
  {
    id: 'urgent_alarm',
    name: 'Báo Động Khẩn Cấp',
    category: 'powerful',
    categoryLabel: '⚡ Mạnh Mẽ',
    icon: '🚨',
    description: 'Chuông dồn dập tần số cao, đánh thức 100% không thể ngủ quên'
  },
  {
    id: 'drum_roll',
    name: 'Trống Trận Quyết Tâm',
    category: 'powerful',
    categoryLabel: '⚡ Mạnh Mẽ',
    icon: '🥁',
    description: 'Nhịp trống taiko dồn dập bùng nổ, tiếp thêm động lực chạy deadline'
  },
  {
    id: 'arcade_fanfare',
    name: 'Chiến Thần Arcade 8-Bit',
    category: 'powerful',
    categoryLabel: '⚡ Mạnh Mẽ',
    icon: '👾',
    description: 'Fanfare chiến thắng hào hùng phong cách game điện tử'
  },
  {
    id: 'super_loud_siren',
    name: 'Còi Báo Thức Siêu Vang',
    category: 'powerful',
    categoryLabel: '⚡ Mạnh Mẽ',
    icon: '📣',
    description: 'Còi hai tone luân phiên cực mạnh dành riêng cho sinh viên ngủ sâu'
  },
  {
    id: 'electric_guitar_riff',
    name: 'Guitar Rock Quyết Chiến',
    category: 'powerful',
    categoryLabel: '⚡ Mạnh Mẽ',
    icon: '🎸',
    description: 'Riff guitar điện bùng nổ, đánh thức mọi giác quan tràn trề nhiệt huyết'
  },
  {
    id: 'battle_horn',
    name: 'Tù Và Xuất Trận Oai Hùng',
    category: 'powerful',
    categoryLabel: '⚡ Mạnh Mẽ',
    icon: '📯',
    description: 'Hồi còi tù và vang dội thôi thúc đứng dậy chinh phục mọi thử thách'
  },
  {
    id: 'emergency_buzzer',
    name: 'Còi Buzzer Dậy Ngay',
    category: 'powerful',
    categoryLabel: '⚡ Mạnh Mẽ',
    icon: '🛑',
    description: 'Còi buzzer ngắt quãng tần số sắc bén, đánh thức ngay lập tức'
  },
  {
    id: 'epic_orchestra',
    name: 'Khúc Khải Hoàn Sử Thi',
    category: 'powerful',
    categoryLabel: '⚡ Mạnh Mẽ',
    icon: '🎻',
    description: 'Hợp xướng giao hưởng hoành tráng chào đón người chiến thắng deadline'
  }
];

// Main Chime Synthesizer Engine
export function playChime(preset: SoundPreset = 'sweet') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (preset) {
      // ===== 1. DỊU DÀNG & THƯ THÁI =====
      case 'sweet': {
        // Celesta C6, E6, G6, C7
        const notes = [1046.5, 1318.5, 1567.98, 2093.0];
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + index * 0.08);

          gain.gain.setValueAtTime(0.001, now + index * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + index * 0.08);
          osc.stop(now + index * 0.08 + 0.55);
        });
        break;
      }

      case 'gentle_chime': {
        // Japanese Wind Chime F6, A6, C7
        const freqs = [1396.9, 1760.0, 2093.0];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.12 + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.9);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.95);
        });
        break;
      }

      case 'zen_bell': {
        // 432Hz Tibetan Singing Bowl with 864Hz harmonic
        [432, 864].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(idx === 0 ? 0.28 : 0.09, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.85);
        });
        break;
      }

      case 'lofi_vibes': {
        // Electric Piano / Rhodes Chord: Cmaj9 (C4, E4, G4, B4, D5)
        const chord = [261.63, 329.63, 392.0, 493.88, 587.33];
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.15);
        });
        break;
      }

      // ===== 2. DỄ THƯƠNG & NHÍ NHẢNH =====
      case 'kawaii_twinkle': {
        // High sparkle arpeggio: E6, G#6, B6, E7
        const sparkle = [1318.5, 1661.2, 1975.5, 2637.0];
        sparkle.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);

          gain.gain.setValueAtTime(0.001, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.05 + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.38);
        });
        break;
      }

      case 'cat_purr': {
        // Play cute kitten meow chirp
        playPetCuteSound();
        break;
      }

      case 'marimba': {
        // Warm wooden marimba C5, E5, G5
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.06);

          gain.gain.setValueAtTime(0.2, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.3);
        });
        break;
      }

      case 'birds': {
        // Bird chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.2);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
        break;
      }

      case 'bubble_pop': {
        // Water bubble pop pitch sweep
        [0, 0.12].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const startF = idx === 0 ? 400 : 550;
          const endF = idx === 0 ? 880 : 1100;
          osc.frequency.setValueAtTime(startF, now + offset);
          osc.frequency.exponentialRampToValueAtTime(endF, now + offset + 0.08);

          gain.gain.setValueAtTime(0.001, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.22, now + offset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.16);
        });
        break;
      }

      // ===== 3. ĐƠN GIẢN & TỐI GIẢN =====
      case 'bell': {
        // Classic Glass Bell A5
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
        break;
      }

      case 'digital_beep': {
        // Retro Watch Dual Beep: 2048Hz
        [0, 0.1].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(2048, now + offset);

          gain.gain.setValueAtTime(0.08, now + offset);
          gain.gain.setValueAtTime(0.0001, now + offset + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.065);
        });
        break;
      }

      case 'soft_ping': {
        // Minimal UI Ping 1200Hz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
        break;
      }

      case 'clock_tick': {
        // Double wooden clock tick
        [0, 0.12].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(idx === 0 ? 800 : 600, now + offset);

          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.045);
        });
        break;
      }

      // ===== 4. MẠNH MẼ & QUYẾT LIỆT =====
      case 'urgent_alarm': {
        // Rapid alternating warble alarm: 900Hz <-> 1250Hz
        const warbleCount = 6;
        for (let i = 0; i < warbleCount; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(i % 2 === 0 ? 900 : 1250, now + i * 0.07);

          gain.gain.setValueAtTime(0.15, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * 0.07);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + (i + 1) * 0.07);
        }
        break;
      }

      case 'drum_roll': {
        // Punchy Taiko drum beats
        const hits = [0, 0.09, 0.18, 0.28];
        hits.forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(idx === hits.length - 1 ? 160 : 120, now + offset);
          osc.frequency.exponentialRampToValueAtTime(50, now + offset + 0.1);

          gain.gain.setValueAtTime(0.3, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.13);
        });
        break;
      }

      case 'arcade_fanfare': {
        // 8-bit game victory arpeggio: C5 - E5 - G5 - C6 - E6
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          gain.gain.setValueAtTime(0.09, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.14);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.15);
        });
        break;
      }

      case 'super_loud_siren': {
        // Two-tone high siren 850Hz -> 1450Hz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.linearRampToValueAtTime(1450, now + 0.25);
        osc.frequency.linearRampToValueAtTime(850, now + 0.5);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }

      // --- MỞ RỘNG DỊU DÀNG (GENTLE EXPANDED) ---
      case 'harp_glissando': {
        // Arpeggiated morning harp: C5, E5, G5, B5, D6, G6
        const harpNotes = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98];
        harpNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          gain.gain.setValueAtTime(0.001, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.16, now + idx * 0.07 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.65);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.7);
        });
        break;
      }

      case 'ocean_waves_breeze': {
        // Ocean wave swell with soft bell
        const freqs = [174.61, 261.63, 392.0]; // F3, C4, G4
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.12 - idx * 0.03, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.45);
        });
        break;
      }

      case 'rain_on_leaves': {
        // Rain droplets tapping on leaves
        const drops = [0, 0.06, 0.14, 0.22, 0.30];
        drops.forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const dropFreq = 900 + (idx % 3) * 350;
          osc.frequency.setValueAtTime(dropFreq, now + offset);
          osc.frequency.exponentialRampToValueAtTime(dropFreq * 0.6, now + offset + 0.04);

          gain.gain.setValueAtTime(0.14, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.07);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.08);
        });
        break;
      }

      case 'tibetan_bowl_deep': {
        // 528Hz Love Frequency & deep resonant overtones
        [264, 528, 792].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(idx === 1 ? 0.25 : 0.08, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.25);
        });
        break;
      }

      // --- MỞ RỘNG DỄ THƯƠNG (CUTE EXPANDED) ---
      case 'puppy_bark': {
        // Two playful puppy yips
        [0, 0.16].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(450, now + offset);
          osc.frequency.exponentialRampToValueAtTime(880, now + offset + 0.04);
          osc.frequency.exponentialRampToValueAtTime(550, now + offset + 0.11);

          gain.gain.setValueAtTime(0.001, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.2, now + offset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.13);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.14);
        });
        break;
      }

      case 'magic_fairy_wand': {
        // Magic fairy sparkle cascade
        const sparkleNotes = [1046.5, 1318.5, 1567.98, 2093.0, 2637.0];
        sparkleNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);

          gain.gain.setValueAtTime(0.001, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.04 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.28);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.3);
        });
        break;
      }

      case 'music_box_lullaby': {
        // Antique Music Box: E6, B5, G#5, E5, B4
        const musicBoxNotes = [1318.5, 987.77, 830.61, 659.25, 493.88];
        musicBoxNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.12 + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.55);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.6);
        });
        break;
      }

      case 'baby_laugh_giggle': {
        // Cute bubble giggle modulation
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const f = 850 + (i % 2) * 350;
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          osc.frequency.exponentialRampToValueAtTime(f + 250, now + i * 0.08 + 0.05);

          gain.gain.setValueAtTime(0.12, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.07);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.08);
        }
        break;
      }

      case 'game_coin_jump': {
        // Classic 8-bit coin sound: B5 then E6
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.5, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setValueAtTime(0.14, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }

      // --- MỞ RỘNG ĐƠN GIẢN (SIMPLE EXPANDED) ---
      case 'single_tone': {
        // Pure single 1000Hz tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }

      case 'radar_pulse': {
        // Sonar radar pulse
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.25);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.25, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }

      case 'typewriter_bell': {
        // Vintage typewriter bell ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2200, now);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }

      case 'metronome_wood': {
        // Wooden metronome block click
        [0, 0.18].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, now + offset);
          osc.frequency.exponentialRampToValueAtTime(250, now + offset + 0.025);

          gain.gain.setValueAtTime(0.25, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.035);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.04);
        });
        break;
      }

      // --- MỞ RỘNG MẠNH MẼ (POWERFUL EXPANDED) ---
      case 'electric_guitar_riff': {
        // Distorted rock guitar power-chord: E3 (164.8Hz) + B3 (246.9Hz) + E4 (329.6Hz)
        const chord = [164.81, 246.94, 329.63];
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.7);
        });
        break;
      }

      case 'battle_horn': {
        // Royal Brass Battle Horn: D4 (293.7) -> A4 (440) -> D5 (587.3)
        const hornNotes = [293.66, 440.0, 587.33];
        hornNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0.001, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.1 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + (idx === hornNotes.length - 1 ? 0.6 : 0.2));

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + (idx === hornNotes.length - 1 ? 0.65 : 0.22));
        });
        break;
      }

      case 'emergency_buzzer': {
        // Aggressive 3-pulse industrial alarm buzzer
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, now + i * 0.14);

          gain.gain.setValueAtTime(0.2, now + i * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.14);
          osc.stop(now + i * 0.14 + 0.11);
        }
        break;
      }

      case 'epic_orchestra': {
        // Triumphant orchestral fanfare: C4, G4, C5, E5
        const orchChord = [261.63, 392.0, 523.25, 659.25];
        orchChord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.15, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.9);
        });
        break;
      }

      default:
        playChime('sweet');
        break;
    }
  } catch {
    // AudioContext autoplay protection safeguard
  }
}

// Success sparkle fanfare (Task completed, level up)
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.01, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.45);
    });
  } catch {
    // ignore
  }
}

// Cute pet interaction sound (Mimi purr/meow squeak)
export function playPetCuteSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // quick pitch bend like a cute meow/squeak
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(1150, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.22);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // ignore
  }
}

// Alarm melody player (Loops selected soundType or default student alarm melody)
let activeAlarmOscillators: { stop: () => void } | null = null;
let alarmIntervalId: NodeJS.Timeout | null = null;

export function playAlarmMelody(repeatCount = 3, soundType?: SoundPreset) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopAlarmMelody();

    // If specific soundType is specified (and not urgent default), play that chime repeatedly
    if (soundType && soundType !== 'urgent_alarm') {
      let count = 0;
      playChime(soundType);
      alarmIntervalId = setInterval(() => {
        count++;
        if (count >= repeatCount) {
          stopAlarmMelody();
        } else {
          playChime(soundType);
        }
      }, 900);
      return;
    }

    const now = ctx.currentTime;
    const pattern = [587.33, 659.25, 783.99, 880, 783.99, 659.25]; // D5, E5, G5, A5, G5, E5
    const step = 0.18;
    const durationPerCycle = pattern.length * step + 0.4;

    for (let cycle = 0; cycle < repeatCount; cycle++) {
      const cycleStart = now + cycle * durationPerCycle;
      pattern.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, cycleStart + i * step);

        gain.gain.setValueAtTime(0.001, cycleStart + i * step);
        gain.gain.exponentialRampToValueAtTime(0.22, cycleStart + i * step + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, cycleStart + i * step + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(cycleStart + i * step);
        osc.stop(cycleStart + i * step + 0.18);
      });
    }

    activeAlarmOscillators = {
      stop: () => {
        // Stopped
      }
    };
  } catch {
    // ignore
  }
}

export function stopAlarmMelody() {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  if (activeAlarmOscillators) {
    activeAlarmOscillators.stop();
    activeAlarmOscillators = null;
  }
}

// Pomodoro focus ambient generator (Gentle rain simulation)
let rainSource: AudioBufferSourceNode | null = null;
let rainGain: GainNode | null = null;

export function toggleAmbientRain(play: boolean, volume = 0.15) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!play) {
      if (rainSource) {
        try { rainSource.stop(); } catch {}
        rainSource.disconnect();
        rainSource = null;
      }
      return;
    }

    if (rainSource) return;

    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(volume, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(ctx.destination);

    whiteNoise.start();
    rainSource = whiteNoise;
  } catch {
    // ignore
  }
}
