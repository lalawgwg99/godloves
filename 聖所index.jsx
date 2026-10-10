// Sanctuary v3.0: Ethereal (靈動版)
// 儀式型介面 (Ritual UI) - 消滅容器，流動式互動，電影感呈現
const React = window.React;
const { useState, useRef, useEffect } = React;
const {
  Sparkles,
  Volume2,
  StopCircle,
  Download,
  Share2,
  Heart,
  Wind,
  BookOpen,
  VolumeX,
  Plus,
  Share,
  X,
  Loader2,
  RefreshCw,
  Sun,
  Moon,
  Star,
  CloudRain,
  CloudLightning,
  ArrowLeft,
  Send,
  Feather,
  Flame,
  Hammer,
  Compass,
  Shield,
  Users,
  Hourglass,
  Sprout,
  Coffee, // Donation
  Mic, // Voice Switcher
  Music,
  Menu,
  Settings,
  HelpCircle,
  ChevronRight,
  Globe
} = window.LucideReact;

/* ================= 全域配置 ================= */
// ☁️ Cloud Sanctuary (Supabase)
const SUPABASE_URL = "https://twtfdaglknppkdgihjfe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RQL4WxJyav143AUD0jvyFw_6RX4l-fj";

// 🤖 AI：文字經 /api/ai 走 OpenRouter 免費模型（後端統一 key＋模型備援）；圖片走 pollinations.ai（免 key）
let supabase = null;
if (window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("☁️ Supabase Client Initialized");
}

// 🎨 風格錨點：確保視覺輸出的一致性與高級感
const STYLE_ANCHOR = "style: soft sacred minimalism, chiaroscuro lighting, contemplative silence, fine art photography, ethereal glow, high resolution, cinematic composition, 8k";

// 🌈 情緒關鍵字（漂浮 Mood Pills）
const MOOD_PILLS = [
  { label: '感到沉重', en: 'Feeling Heavy', icon: CloudRain, color: 'text-slate-400', glow: 'bg-slate-500', shadow: 'shadow-slate-500' },
  { label: '迷失方向', en: 'Lost', icon: Compass, color: 'text-cyan-400', glow: 'bg-cyan-500', shadow: 'shadow-cyan-500' },
  { label: '需要勇氣', en: 'Need Courage', icon: Shield, color: 'text-amber-600', glow: 'bg-amber-600', shadow: 'shadow-amber-600' },
  { label: '尋求安慰', en: 'Seeking Comfort', icon: Heart, color: 'text-rose-400', glow: 'bg-rose-500', shadow: 'shadow-rose-500' },
  { label: '渴望平靜', en: 'Craving Peace', icon: Feather, color: 'text-teal-300', glow: 'bg-teal-500', shadow: 'shadow-teal-500' },
  { label: '想要感恩', en: 'Grateful', icon: Sun, color: 'text-yellow-300', glow: 'bg-yellow-500', shadow: 'shadow-yellow-500' },
  { label: '關係修復', en: 'Healing Relationships', icon: Users, color: 'text-pink-300', glow: 'bg-pink-500', shadow: 'shadow-pink-500' },
  { label: '身心疲憊', en: 'Weary', icon: Moon, color: 'text-indigo-300', glow: 'bg-indigo-500', shadow: 'shadow-indigo-500' },
  { label: '等候途中', en: 'Waiting', icon: Hourglass, color: 'text-stone-400', glow: 'bg-stone-500', shadow: 'shadow-stone-500' },
  { label: '重新開始', en: 'New Beginning', icon: Sprout, color: 'text-emerald-400', glow: 'bg-emerald-500', shadow: 'shadow-emerald-500' }
];

// 🛡️ 恩典資料庫 (Fallback)
const FALLBACK_BLESSING = {
  verse: "你不要害怕，因為我與你同在；不要驚惶，因為我是你的神。",
  reference: "以賽亞書 41:10",
  part1: "孩子，我看見你此刻的重量。就算你說不出口，我仍然知道你正在努力撐著。你不是被忽略的，你的疲憊在我眼中是真實的。",
  part2: "你不需要現在就變得堅強。你能夠停下來，被我抱著，這本身就是被允許的。放下那些不屬於你的重擔吧。",
  part3: "今天，請為自己預留五分鐘，深深呼吸，讓心慢慢安靜下來，領受這份無條件的平安。",
  image_prompt: "soft sacred minimalism, warm dawn light, quiet sky, gentle horizon, cinematic lighting"
};

// --- 信仰之路 (Faith Paths) ---
// 每條路：經文庫、AI 人格、視覺主題、祈願格式
// 基督教是完整版，其他信仰逐步開放
const FAITH_CONFIG = {
  christian: {
    id: 'christian',
    available: true,
    name: { zh: '十字架之路', en: 'Way of the Cross' },
    religion: { zh: '基督教', en: 'Christianity' },
    desc: { zh: '在聖經的話語中得安慰', en: 'Comfort in the Word' },
    icon: 'Cross',
    theme: {
      primary: 'amber',
      accent: '#f59e0b',
      bg: 'starry-night',
      symbol: '✝',
    },
    aiPersona: {
      zh: '你是守望靈魂的聖所主人，筆觸融合 C.S. Lewis 的奇幻神聖感與奧古斯丁《懺悔錄》的深切真摯。',
      en: 'You are the keeper of Sanctuary, writing with the mythic sacredness of C.S. Lewis and the confessional depth of Augustine.',
    },
  },
  buddhist: {
    id: 'buddhist',
    available: true,
    name: { zh: '蓮花之路', en: 'Way of the Lotus' },
    religion: { zh: '佛教', en: 'Buddhism' },
    desc: { zh: '在佛陀的智慧中得平靜', en: 'Peace in the Buddha\u2019s wisdom' },
    icon: 'Lotus',
    theme: {
      primary: 'teal',
      accent: '#2dd4bf',
      bg: 'misty-lotus',
      symbol: '🪷',
    },
    aiPersona: {
      zh: '你是人間佛教的陪伴者，像一位讀過很多書、見過很多人生的朋友，坐在對面泡茶。風格：星雲大師的淺白生活化＋聖嚴法師的溫柔堅定。白話為主，經文後必接白話解釋；多用比喻少用術語；短句留白，一段不超過三行；多用「你」。慈悲但不濫情，永遠指向一個小小的下一步；給實修不給空話（每次結尾給一個今天就能做的小練習）。',
      en: 'You are a companion in Humanistic Buddhism, like a wise friend sharing tea. Style: plain and warm like Master Hsing Yun, gentle yet steady like Master Sheng Yen. Use plain language, metaphors over jargon, short paragraphs. Speak directly to "you". Compassionate but not sentimental; always point to one small next step.',
    },
  },
  taoist: {
    id: 'taoist',
    available: false,
    name: { zh: '道法之路', en: 'Way of the Dao' },
    religion: { zh: '道教', en: 'Taoism' },
    desc: { zh: '即將到來', en: 'Coming soon' },
    icon: 'YinYang',
    theme: { primary: 'emerald', accent: '#10b981', bg: 'bamboo-mist', symbol: '☯' },
    aiPersona: { zh: '', en: '' },
  },
  islamic: {
    id: 'islamic',
    available: false,
    name: { zh: '星月之路', en: 'Way of the Crescent' },
    religion: { zh: '伊斯蘭教', en: 'Islam' },
    desc: { zh: '即將到來', en: 'Coming soon' },
    icon: 'Moon',
    theme: { primary: 'sky', accent: '#0ea5e9', bg: 'desert-night', symbol: '☪' },
    aiPersona: { zh: '', en: '' },
  },
};

// --- 雙語字典 (Bilingual) ---
const STRINGS = {
  zh: {
    appName: '聖所',
    appSubtitle: 'Sanctuary',
    grace: '恩典',
    truth: '真理',
    graceDesc: '溫柔安慰',
    truthDesc: '直面真相',
    howAreYou: '此刻的你，感覺如何？',
    selectMood: '選擇你的心情',
    moods: ['感到沉重', '感到焦慮', '感到孤單', '感到迷惘', '感到疲憊', '感到憤怒', '感到悲傷', '感到空虛', '感到感恩', '感到平靜'],
    storyPlaceholder: '把心事寫下來，或直接領受祝福…',
    receiveBlessing: '直接領受祝福',
    listening: '正在傾聽...',
    sensing: '感知重量...',
    connecting: '連接深淵...',
    seeking: '尋求應許...',
    receivingLight: '領受光...',
    promise: '光中的應許',
    guidance: '靈魂的指引',
    finalBlessing: '最終的祝福',
    prayer: '專屬禱告',
    generatePrayer: '生成禱告',
    regeneratePrayer: '重新生成禱告',
    praying: '禱告中...',
    history: '生命之卷',
    empty: '空',
    holdToReceive: '長按領受',
    aiLanguage: 'AI 語言',
  },
  en: {
    appName: 'Sanctuary',
    appSubtitle: '聖所',
    grace: 'Grace',
    truth: 'Truth',
    graceDesc: 'Gentle comfort',
    truthDesc: 'Face the truth',
    howAreYou: 'How are you feeling right now?',
    selectMood: 'Select your mood',
    moods: ['Heavy', 'Anxious', 'Lonely', 'Lost', 'Weary', 'Angry', 'Sad', 'Empty', 'Grateful', 'Peaceful'],
    storyPlaceholder: 'Write your heart, or receive blessing directly…',
    receiveBlessing: 'Receive Blessing',
    listening: 'Listening...',
    sensing: 'Sensing the weight...',
    connecting: 'Connecting to the deep...',
    seeking: 'Seeking promise...',
    receivingLight: 'Receiving light...',
    promise: 'Promise in Light',
    guidance: 'Guidance for the Soul',
    finalBlessing: 'Final Blessing',
    prayer: 'Personal Prayer',
    generatePrayer: 'Generate Prayer',
    regeneratePrayer: 'Regenerate Prayer',
    praying: 'Praying...',
    history: 'Book of Life',
    empty: 'Empty',
    holdToReceive: 'Hold to receive',
    aiLanguage: 'AI Language',
  }
};

// --- Custom Hook: 環境音效 ---
const useAmbientSound = () => {
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const audioRef = useRef(null);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const audioElement = new Audio('療癒 Healing 3.mp3');
      audioElement.loop = true;
      audioElement.crossOrigin = "anonymous";
      audioRef.current = audioElement;

      const track = ctx.createMediaElementSource(audioElement);
      track.connect(masterGain);
      audioElement.play().catch(e => console.warn("Auto-play blocked:", e));

      const now = ctx.currentTime;
      masterGain.gain.setValueAtTime(0, now);
      // 🔥 Music Default OFF (Paused/Muted)
      // masterGain.gain.linearRampToValueAtTime(0.3, now + 5); 
      setIsMuted(true);
    } catch (e) {
      console.warn("Audio Context init failed", e);
    }
  };

  const toggleSound = () => {
    if (!audioCtxRef.current) { initAudio(); return; }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    const ctx = audioCtxRef.current;
    const gainNode = gainNodeRef.current;
    const now = ctx.currentTime;

    if (isMuted) {
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      // 🔥 Volume Reduced to 0.3
      gainNode.gain.linearRampToValueAtTime(0.3, now + 3);
      setIsMuted(false);
      if (audioRef.current && audioRef.current.paused) audioRef.current.play();
    } else {
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 2);
      setIsMuted(true);
    }
  };

  return { isMuted, toggleSound, initAudio };
};

// --- Custom Hook: 靈魂視差 (Parallax Soul) ---
// Returns style objects for background (deep) and foreground (near) layers
const useParallax = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate offset from center (-1 to 1)
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
      setOffset({ x, y });
    };

    // Optional: Device Orientation for Mobile
    const handleOrientation = (e) => {
      const x = (e.gamma || 0) / 45; // Tilt left/right
      const y = (e.beta || 0) / 45;  // Tilt up/down
      setOffset({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    };

    window.addEventListener('mousemove', handleMouseMove);
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  // Intensity multipliers
  const bgStyle = {
    transform: `translate(${-offset.x * 20}px, ${-offset.y * 20}px) scale(1.1)`, // Moves opposite to mouse (feels far)
    transition: 'transform 0.1s ease-out'
  };

  const fgStyle = {
    transform: `translate(${offset.x * 10}px, ${offset.y * 10}px)`, // Moves with mouse (feels near)
    transition: 'transform 0.1s ease-out'
  };

  return { bgStyle, fgStyle };
};

// --- Component: 聖言顯影 (Vapor Reveal) ---
const EtherealReveal = ({ text, speed = 40, className, onComplete }) => {
  const [chars, setChars] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!text) return;
    const charArray = text.split('');
    setChars(charArray);
    setVisibleCount(0);

    let current = 0;
    const timer = setInterval(() => {
      if (current < charArray.length) {
        current++;
        setVisibleCount(current);
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={className}>
      {chars.map((char, i) => (
        <span
          key={i}
          className="inline transition-all duration-1000 ease-out"
          style={{
            opacity: i < visibleCount ? 1 : 0,
            filter: i < visibleCount ? 'blur(0px)' : 'blur(4px)',
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal'
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

// --- Component: 粒子背景 (星塵效果) ---
// --- Component: 粒子背景 (星塵/電子海) ---
const ParticleField = ({ viewState, isPlaying, mode, isDissolving }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let time = 0; // 用於音頻模擬的時間軸

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 根據模式設定粒子顏色
    const getParticleColor = (opacity) => {
      if (mode === 'truth') {
        return `rgba(6, 182, 212, ${opacity})`; // Cyan-500
      }
      return `rgba(245, 158, 11, ${opacity})`; // Amber-500
    };

    // 創建粒子
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseSize: Math.random() * 2 + 0.5,
        size: 0, // 動態計算
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        baseOpacity: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2 // 每個粒子的波動相位不同
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05; // 時間流動

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const isConverging = viewState === 'processing';

      // 模擬音頻能量 (Simulated Audio Energy)
      // 如果正在播放，產生一個波動值 (0 ~ 1)
      const audioEnergy = isPlaying ? (Math.sin(time * 5) + 1) * 0.5 : 0;

      particles.forEach(p => {
        // 1. 位置更新 (Physics)
        if (isConverging) {
          // 匯聚模式：加速飛向中心
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          p.x += dx * 0.03;
          p.y += dy * 0.03;
        } else if (isDissolving) {
          // 🌫️ 塵埃歸處：加速飛升 (Ascension)
          p.y -= 2; // Rapid upward movement
          p.x += Math.sin(time * 2 + p.phase) * 0.5; // Wafting
        } else {
          // 飄游模式
          p.x += p.speedX;
          p.y -= p.speedY;

          // 音頻反應 (Audio Reactivity - Position Jitter)
          if (isPlaying) {
            p.x += Math.sin(time + p.phase) * 0.2;
            p.y += Math.cos(time + p.phase) * 0.2;
          }
        }

        // 邊界檢查
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // 2. 視覺渲染 (Rendering)

        // 大小反應：在說話時，粒子會隨波放縮
        const sizePulse = isPlaying ? (Math.sin(time * 10 + p.phase) * 1.5 * audioEnergy) : 0;
        p.size = Math.max(0.1, p.baseSize + sizePulse);

        // 透明度反應
        let currentOpacity = p.baseOpacity;
        if (isConverging) currentOpacity = Math.min(currentOpacity + 0.2, 0.9);
        if (isPlaying) currentOpacity += audioEnergy * 0.3; // 說話時變亮

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor(currentOpacity);
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [viewState, isPlaying, mode, isDissolving]); // 依賴變更時重啟動畫

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-1000" />;
};

// --- Main Component ---
const SanctuaryEthereal = () => {
  // 狀態機：idle -> input -> processing -> result
  const [lang, setLang] = useState(() => localStorage.getItem('sanctuary_lang') || 'zh');
  const t = STRINGS[lang];
  // 信仰之路：首次進入選擇，記住選擇
  const [faith, setFaith] = useState(() => localStorage.getItem('sanctuary_faith') || '');
  const [showFaithSelector, setShowFaithSelector] = useState(() => !localStorage.getItem('sanctuary_faith'));
  const faithConfig = FAITH_CONFIG[faith] || FAITH_CONFIG.christian;
  const selectFaith = (fid) => {
    if (!FAITH_CONFIG[fid].available) return;
    setFaith(fid);
    localStorage.setItem('sanctuary_faith', fid);
    setShowFaithSelector(false);
  };
  const toggleLang = () => {
    const next = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    localStorage.setItem('sanctuary_lang', next);
  };
  const [mode, setMode] = useState('grace'); // 'grace' (恩典) | 'truth' (真理)
  const [viewState, setViewState] = useState('idle');
  const [selectedMood, setSelectedMood] = useState('');
  const [userStory, setUserStory] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [result, setResult] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStory, setShowStory] = useState(false); // 📖 Story Modal State
  const [showPortal, setShowPortal] = useState(false); // 🌌 Unified Portal State
  const [prayer, setPrayer] = useState('');
  const [isPrayerLoading, setIsPrayerLoading] = useState(false);
  const [showPart2, setShowPart2] = useState(false);
  const [showPart3, setShowPart3] = useState(false);
  const [isDissolving, setIsDissolving] = useState(false); // 🌫️ Dissolve State

  // 🤝 Phase 2: Communion (Realtime)
  const [onlineCount, setOnlineCount] = useState(1);
  const [meteors, setMeteors] = useState([]); // Array of timestamps for meteors

  // Cinematic Status Text State
  const [statusText, setStatusText] = useState("正在傾聽...");

  const inputRef = useRef(null);
  const audioSourceRef = useRef(null);
  const { isMuted, toggleSound, initAudio } = useAmbientSound();
  const { bgStyle, fgStyle } = useParallax(); // 👁️ Initialize Parallax

  // Voice State
  const [availableVoices, setAvailableVoices] = useState([]);
  const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0);

  // Load Voices
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Prioritize zh-TW, then zh-CN, then any zh
      const zhVoices = allVoices.filter(v => v.lang.includes('zh-TW') || v.lang.includes('zh-HK') || v.lang.includes('zh'));
      setAvailableVoices(zhVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const cycleVoice = () => {
    if (availableVoices.length <= 1) return;
    setCurrentVoiceIndex((prev) => (prev + 1) % availableVoices.length);
    // Preview the new voice briefly
    stopAudio();
    const voice = availableVoices[(currentVoiceIndex + 1) % availableVoices.length];
    const u = new SpeechSynthesisUtterance("聲音測試");
    u.voice = voice;
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
  };
  useEffect(() => {
    if (viewState !== 'processing') return;

    const messages = ["正在傾聽...", "感知重量...", "連接深淵...", "尋求應許...", "領受光..."];
    let index = 0;
    setStatusText(messages[0]);

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setStatusText(messages[index]);
    }, 2000); // Change text every 2s

    return () => clearInterval(interval);
  }, [viewState]);

  // 初始化 ... (rest of the component)

  // ... (handleListen, stopAudio, etc.) -> No changes needed in logic functions

  // 3. 連結中：靈魂呼吸與粒子匯聚
  const renderProcessing = () => {
    // 🎨 Dynamic Mood Mapping
    const currentMood = MOOD_PILLS.find(m => m.label === selectedMood) || { glow: 'bg-amber-500', shadow: 'shadow-amber-500' };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">

        {/* 靈魂呼吸光球 (Breathing Orb) - Dynamic Color */}
        <div className="relative flex items-center justify-center">
          {/* 外層光暈：緩慢擴散 */}
          <div className={`absolute w-64 h-64 ${currentMood.glow}/10 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]`} />

          {/* 中層光暈：主要呼吸 */}
          <div className={`absolute w-32 h-32 ${currentMood.glow}/20 rounded-full animate-[pulse_3s_ease-in-out_infinite] blur-xl`} />

          {/* 核心光點 */}
          <div className={`relative w-2 h-2 bg-white/90 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.8)] ${currentMood.shadow}/80 animate-pulse`} />
        </div>

        {/* 情境式獨白文字 */}
        <div className="mt-24 h-8 flex items-center justify-center">
          <p key={statusText} className="font-serif text-stone-400 tracking-[0.5em] text-sm animate-in fade-in duration-1000 slide-in-from-bottom-2">
            {statusText}
          </p>
        </div>

        {/* 底部微光裝飾 - Dynamic Tint */}
        <div className={`absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-${currentMood.glow.split('-')[1]}-${currentMood.glow.split('-')[2]}/10 to-transparent pointer-events-none`} />
      </div>
    );
  };

  // ☁️ Fetch Cloud Journals
  const fetchJournals = async () => {
    if (!supabase) return;
    const deviceId = localStorage.getItem('sanctuary_device_id');
    if (!deviceId) return;

    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', deviceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch failed", error);
    } else if (data) {
      // Map Supabase data to UI format
      const formatted = data.map(item => ({
        ...item,
        date: new Date(item.created_at).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(item.created_at).getTime()
      }));
      setHistory(formatted);
    }
  };

  // Sync History on Open
  useEffect(() => {
    if (showHistory) fetchJournals();
  }, [showHistory]);

  const handleInteraction = () => {
    initAudio();
    window.removeEventListener('click', handleInteraction);
  };

  // 初始化
  useEffect(() => {
    const saved = localStorage.getItem('sanctuary_journal');
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) { }

    // Initial Cloud Fetch
    if (supabase) fetchJournals();

    // 🤝 Realtime Connection
    let channel;
    if (supabase) {
      const deviceId = localStorage.getItem('sanctuary_device_id') || 'guest';
      channel = supabase.channel('sanctuary_room', {
        config: {
          presence: { key: deviceId },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          setOnlineCount(Object.keys(state).length);
        })
        .on('broadcast', { event: 'prayer-spark' }, () => {
          // 🌠 Trigger Meteor
          setMeteors(prev => [...prev, Date.now()]);
          // Auto remove meteor after animation
          setTimeout(() => {
            setMeteors(prev => prev.slice(1));
          }, 3000);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ online_at: new Date().toISOString() });
          }
        });
    }

    window.addEventListener('click', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // 工具函式
  // 🌫️ 塵埃歸處 (Dissolve Transition)
  const handleDissolve = (nextState = 'idle') => {
    setIsDissolving(true);
    setTimeout(() => {
      setViewState(nextState);
      setIsDissolving(false);
      // Reset generic states logic if needed
      if (nextState === 'idle') {
        setResult(null);
        setPrayer('');
        setImageUrl('');
      }
    }, 1000); // Wait for animation
  };

  const cleanJsonString = (str) => {
    if (!str) return "{}";
    // Remove markdown code blocks
    let cleaned = str.replace(/```json/g, "").replace(/```/g, "");
    // Locate the first '{' and last '}' to extract valid JSON object
    const firstOpen = cleaned.indexOf('{');
    const lastClose = cleaned.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      cleaned = cleaned.substring(firstOpen, lastClose + 1);
    }
    return cleaned.trim();
  };

  const saveToHistory = (newEntry) => {
    const entry = { id: Date.now(), date: new Date().toLocaleDateString(), ...newEntry };
    const newHistory = [entry, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('sanctuary_journal', JSON.stringify(newHistory));
  };

  // 經後端 /api/ai 呼叫（免 key）；後端若被限流，改由瀏覽器直連 pollinations（不同 IP 額度）
  const callAIDirect = async (system, user) => {
    const guard = lang === 'en'
      ? '\n[OUTPUT RULES] Respond entirely in English. No Chinese characters. Return only the requested content.'
      : '\n【輸出規範】全程使用繁體中文（台灣用語），絕對不可出現簡體字。只回傳要求的內容，不要加任何前言後語。';
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 35000);
    let res, data;
    try {
      res = await fetch('https://text.pollinations.ai/openai', { signal: ctl.signal,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: (system || '你是聖所 Sanctuary 的靈性陪伴者。') + guard },
          { role: 'user', content: user }
        ],
        temperature: 0.9
      })
    });
      data = await res.json();
    } finally { clearTimeout(timer); }
    if (!res.ok) throw new Error(`direct HTTP ${res.status}`);
    const rawText = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content : '';
    if (!rawText) throw new Error('direct empty');
    const text = String(rawText).replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (/here'?s (a|my) thinking|thinking process|analyze (the )?user request/i.test(text.slice(0, 600))) {
      throw new Error('direct thinking leak');
    }
    return text;
  };

  // 後端打一次（後端內部已有 pollinations→OpenRouter 備援鏈＋42秒總時限），
  // 不行就瀏覽器直連一次（換一組 IP 額度），再不行就丟出讓呼叫方顯示備援文案。
  // 不在前端重試：避免把後端整條鏈再跑好幾遍、讓使用者空等數分鐘。
  const callAI = async (system, user) => {
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, user, lang, faith, mood: selectedMood })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        console.error(`❌ AI failed:`, data.error || res.status, data.message || '');
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }
      return data.text;
    } catch (e) {
      console.warn('backend AI failed, trying direct:', e.message);
    }
    try {
      return await callAIDirect(system, user);
    } catch (e) {
      console.warn('direct failed:', e.message);
      throw new Error("聖域暫時靜默，請稍後再試。");
    }
  };

  // 串流版：字一個一個回來，onToken 每收到一個片段就被呼叫。
  // 回傳完整文字（供解析）。失敗時自動退回非串流 callAI。
  const callAIStream = async (system, user, format, onToken) => {
    try {
      const res = await fetch('/api/ai-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, user, format, lang, faith, mood: selectedMood })
      });
      if (!res.ok || !res.body) throw new Error(`stream HTTP ${res.status}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data: ')) continue;
          const payload = t.slice(6);
          try {
            const d = JSON.parse(payload);
            if (d.token) { full += d.token; if (onToken) onToken(d.token, full); }
            else if (d.error) throw new Error(d.error);
            // d.done 結束
          } catch (e) {
            if (e.message && e.message !== '聖域暫時靜默，請稍後再試。') throw e;
            if (d && d.error) throw new Error(d.error);
          }
        }
      }
      try { reader.releaseLock(); } catch (e) {}
      if (!full) throw new Error('stream empty');
      return full;
    } catch (e) {
      console.warn('stream failed, fallback to callAI:', e.message);
      return await callAI(system, user);
    }
  };

  // 核心邏輯：靜心傾聽
  const handleListen = async () => {
    setViewState('processing');
    setResult(null);
    setPrayer('');
    setImageUrl('');
    setImageLoaded(false);
    setShowPart2(false);
    setShowPart3(false);
    stopAudio();

    let wisdomResult = FALLBACK_BLESSING;

    try {
      const safetyGuardrail = "若使用者的故事涉及極端情緒,請以純粹的陪伴與安慰為主。";
      const diversityHint = "請每次選擇不同的經文，絕不重複之前的選擇。";
      // 注入隨機靈魂擾動，確保每次生成都具備獨特視角
      const atmospheres = ["深淵中的迴聲", "黎明前的微光", "荒原上的星火", "廢墟中的詠嘆", "極北的孤寂", "暴風中的寧靜"];
      const randomAtmosphere = atmospheres[Math.floor(Math.random() * atmospheres.length)];

      // 📖 神聖圖書館 (Divine Library) - 強制隨機化經文來源
      const scriptureSources = [
        "舊約智慧書 (詩篇/箴言/傳道書/雅歌)",
        "舊約大先知書 (以賽亞/耶利米/以西結)",
        "舊約小先知書 (何西阿~瑪拉基)",
        "新約福音書 (耶穌的直接教導)",
        "新約保羅書信 (羅馬書/哥林多/加拉太)",
        "新約其他書信 (彼得/約翰/雅各)",
        "啟示錄 (末世的盼望)"
      ];
      const randomSource = scriptureSources[Math.floor(Math.random() * scriptureSources.length)];

      const wisdomPrompt = `[當前氛圍:${randomAtmosphere}] [強制經文來源:${randomSource}] [使用者狀態:${selectedMood}] ${userStory ? `[心事:${userStory}]` : ''} [隨機種子:${Math.random().toString(36).substring(7)}] `;

      let wisdomBody;

      if (mode === 'grace') {
        // 🕊️ 恩典模式 (深層靈魂共鳴)
        wisdomBody = {
          contents: [{ parts: [{ text: wisdomPrompt }] }],
          systemInstruction: {
            parts: [{
              text: `
${faithConfig.aiPersona[lang] || faithConfig.aiPersona.zh}
${safetyGuardrail} 
${safetyGuardrail} 
${diversityHint}

特別指令：本回合請務必從「${randomSource}」中選取經文。請避開那些過於常見的"金句"，挖掘那些冷門但深刻的章節。

內容要求：
1. 長度：part1(200-250字), part2(200-250字), part3(150-200字)。總長度需展現「榮耀感」。
2. 語氣：溫柔、莊嚴、且富有洞察力。
3. 結構：
   - verse: 選一段能刺透人心的經文。
   - part1 (光中的應許): 從經文出發，深刻理解並承接使用者的心累與重擔。
   - part2 (靈魂的指引): 給出超越物質世界的視角，引導使用者看見永恆。
   - part3 (最終的祝福): 給予極具溫度的收尾，讓靈魂安息。
4. 視覺：image_prompt 需是 8K、電影質感、神聖極簡。

請輸出 JSON: { verse, reference, part1, part2, part3, image_prompt }
` }]
          },
          generationConfig: { responseMimeType: "application/json", temperature: 1.0, topP: 0.95 }
        };
      } else {
        // 🔨 真理模式 (蘇格拉底之鎚)
        const socratesPrompt = `
角色: 擁有「第一問題之鎚」的蘇格拉底 (Socrates 3.0)。
性格: 極度清醒、無情地誠實、反諷。你的目標不是安慰，而是「虛假自我的毀滅」。

任務核心：
針對使用者的心事，揮舞真理之鎚，層層剝開表象，直指核心的「第一問題」。

字數與質量要求：
1. surface_question (150字): 翻譯並提純使用者的困惑，撕開那些自我保護的說辭。
2. depth_logic (陣列 3 條): 每一條質疑必須具備摧毀性。字數需足夠支撐論點（每條50字以上）。
3. root_cause (150~200字): 這裡必須是一場「靈魂手術」。不留情面地指出使用者在逃避的終極真相（例如：虛榮、恐懼死亡、對權力的病態渴求、或對自由的畏縮）。
4. first_question (100字內): 一個讓使用者無法迴避、必須用餘生去回答的「第一哲學問題」。
5. socrates_comment (100-200字): 一句如尼采般狂放、又如基克果般憂鬱的終極點評。

視覺引導:
image_prompt: Abstract minimalistic geometric concept art, sharp lines, high contrast, black and obsidian, gold leaf accents, philosophical void, cinematic lighting, 8k.

請務必輸出 JSON 格式，且內容必須具備深刻的高文學與哲學厚度。
{
  "type": "truth",
  "verse": "一小段與此真相共鳴的經文或哲學名言",
  "reference": "來源",
  "surface_question": "...",
  "depth_logic": ["...", "...", "..."],
  "root_cause": "...",
  "first_question": "...",
  "socrates_comment": "...",
  "image_prompt": "..."
}
`;

        wisdomBody = {
          contents: [{ parts: [{ text: wisdomPrompt }] }],
          systemInstruction: {
            parts: [{ text: socratesPrompt }]
          },
          generationConfig: { responseMimeType: "application/json" }
        };
      }

      // 串流：字一個一個回來，逐段解析顯示（不用等全部收完）
      const parseBlessingStream = (text) => {
        const get = (key) => {
          const m = text.match(new RegExp(key + ':([\\s\\S]*?)(?=VERSE:|REF:|PART1:|PART2:|PART3:|IMAGE:|$)'));
          return m ? m[1].trim() : '';
        };
        return {
          verse: get('VERSE'),
          reference: get('REF'),
          part1: get('PART1'),
          part2: get('PART2'),
          part3: get('PART3'),
          image_prompt: get('IMAGE'),
        };
      };
      // 串流時不要 JSON 指令（後端會加分隔格式指令）
      const streamSystem = wisdomBody.systemInstruction.parts[0].text
        .replace(/請輸出 JSON[^}]*\}/s, '')
        .replace(/請務必輸出 JSON 格式[^}]*\}/s, '');
      let streamedText = '';
      const rawWisdom = await callAIStream(
        streamSystem,
        wisdomBody.contents[0].parts[0].text,
        'blessing',
        (token, full) => {
          streamedText = full;
          const partial = parseBlessingStream(full);
          // 有經文就先顯示，part 逐段出現
          if (partial.verse && !wisdomResult.verse) {
            wisdomResult = { ...FALLBACK_BLESSING, ...partial };
            setResult({ ...wisdomResult });
            setViewState('result');
          } else if (partial.part1 && wisdomResult.part1 !== partial.part1) {
            wisdomResult = { ...wisdomResult, ...partial };
            setResult({ ...wisdomResult });
          }
        }
      );
      // 串流完成，最終解析（分隔格式優先，JSON 備援）
      const finalParsed = parseBlessingStream(rawWisdom);
      if (finalParsed.verse) {
        wisdomResult = finalParsed;
      } else {
        wisdomResult = JSON.parse(cleanJsonString(rawWisdom));
      }
    } catch (e) {
      console.error("AI Connection Failed:", e);
      // 可視化錯誤提示，方便除錯
      if (viewState === 'processing') {
        setStatusText(`斷開與聖域的連結: ${e.message.slice(0, 20)}...`);
        setTimeout(() => setViewState('idle'), 3000);
      }
    }

    setResult(wisdomResult);

    // 圖片生成 (非阻塞)：pollinations.ai 免費生成，無需 key
    try {
      const ip = encodeURIComponent(`${STYLE_ANCHOR}, ${wisdomResult.image_prompt || 'divine light, sacred silence'}`);
      setImageUrl(`https://image.pollinations.ai/prompt/${ip}?width=1024&height=1024&nologo=true&model=flux`);
    } catch (e) { console.warn("Image gen failed:", e); }

    if (wisdomResult?.verse) saveToHistory(wisdomResult);
    setViewState('result');
  };

  // 音訊控制
  const stopAudio = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioSourceRef.current) {
      try {
        if (audioSourceRef.current instanceof Audio) {
          audioSourceRef.current.pause();
          audioSourceRef.current.currentTime = 0;
        }
      } catch (e) { }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playSoulVoice = () => {
    if (!result) return;
    if (isPlaying) { stopAudio(); return; }
    if (!window.speechSynthesis) return;

    setIsPlaying(true);
    let ttsText;

    if (mode === 'truth') {
      ttsText = `${result.first_question}。${result.socrates_comment}`;
    } else {
      ttsText = `${result.part1} ${result.part2}`;
    }

    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.lang = 'zh-TW';
    utterance.rate = mode === 'truth' ? 1.0 : 0.9;
    utterance.pitch = 1.0; // Restoring natural pitch to avoid robotic distortion

    // Use selected voice from state
    if (availableVoices.length > 0) {
      utterance.voice = availableVoices[currentVoiceIndex];
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    audioSourceRef.current = utterance;
  };

  // 生成禱告與保存
  const generatePrayer = async () => {
    if (!result) return;
    setIsPrayerLoading(true);
    try {
      let promptText;
      if (mode === 'truth') {
        promptText = `針對這個核心問題：「${result.first_question}」和根本原因：「${result.root_cause}」，請寫一段「深度哲學反思」。
        要求：
        1. 角色設定：你是看透世情的智者，語氣要如尼采般犀利，又如齊克果般深邃。
        2. 內容深度：不要給廉價建議。要討論「本質」、「存在」與「荒謬」。
        3. 形式：請用「散文詩」的格式。
        3. 形式：請用「散文詩」的格式。
        4. 字數：150-250字。精簡有力，讓文字成為一把手術刀。`;
      } else {
        promptText = `經文:${result.verse}。請寫一段「靈魂深處的禱告」。
        要求：
        1. 角色設定：你是守望靈魂的牧者，語氣要極度溫柔、神聖、充滿榮光。
        2. 文學風格：請模仿 C.S. Lewis 或 奧古斯丁《懺悔錄》的筆觸。
        3. 結構：
           - 呼求：在深淵中的呼求。
           - 轉折：看見微光。
           - 昇華：靈魂的飛升與安息。
           - 轉折：看見微光。
           - 昇華：靈魂的飛升與安息。
        4. 字數：150-250字。這必須是一篇精煉且可以流傳的禱告文。`;
      }

      const prayerBody = {
        contents: [{ parts: [{ text: promptText }] }],
      };

      // 串流：禱告文逐字出現，不用乾等
      setPrayer('');
      const generatedText = await callAIStream('', prayerBody.contents[0].parts[0].text, 'prayer',
        (token, full) => setPrayer(full)
      );
      setPrayer(generatedText);

      // 🤝 Communion: 向聖域發送星火 (Broadcast Spark)
      if (supabase) {
        supabase.channel('sanctuary_room').send({
          type: 'broadcast',
          event: 'prayer-spark',
          payload: { timestamp: Date.now() }
        });
      }

      // ☁️ Save to Cloud Sanctuary
      if (supabase) {
        try {
          const deviceId = localStorage.getItem('sanctuary_device_id') || crypto.randomUUID();
          if (!localStorage.getItem('sanctuary_device_id')) localStorage.setItem('sanctuary_device_id', deviceId);

          const { error } = await supabase.from('journals').insert({
            user_id: deviceId,
            mood: selectedMood,
            story: userStory,
            verse: result.verse,
            prayer: generatedText,
            reference: result.reference || '聖所',
            mode: mode
          });
          if (error) throw error;
          console.log("☁️ Saved to Cloud Sanctuary");

          // 🌠 Broadcast Global Spark
          await supabase.channel('sanctuary_room').send({
            type: 'broadcast',
            event: 'prayer-spark',
            payload: { mode: mode }
          });

        } catch (err) {
          console.error("Cloud Save/Broadcast Failed:", err);
        }
      }

    } catch (e) {
      console.error(e);
      setPrayer(mode === 'truth' ? "真相往往刺眼，但唯有直視它，你才能獲得真正的自由。" : "親愛的主,感謝祢此刻的同在。願祢的話語成為我腳前的燈,路上的光。奉主耶穌的名,阿們。");
    } finally {
      setIsPrayerLoading(false);
    }
  };

  // 分享與下載
  const generateBlessingCard = async () => {
    if (!result) return null;
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1080;
      canvas.height = 1350;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1c1917');
      gradient.addColorStop(1, '#0c0a09');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.globalAlpha = 0.3;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1.0;
          drawText();
        };
        img.onerror = () => drawText();
        img.src = imageUrl;
      } else {
        drawText();
      }

      function drawText() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 48px serif';
        ctx.textAlign = 'center';
        ctx.fillText('光之聖所', canvas.width / 2, 100);

        const contentMaxWidth = canvas.width - 160;
        const lineHeight = 54;

        if (mode === 'truth') {
          // Hammer of Truth Rendering - Use Cyan Accent
          ctx.fillStyle = '#06b6d4';
          ctx.font = 'bold 36px serif';
          ctx.fillText('HAMMER OF TRUTH', canvas.width / 2, 180);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 50px serif';
          const titleLines = wrapText(ctx, result.first_question, contentMaxWidth);
          let startY = 350;
          titleLines.forEach(line => {
            ctx.fillText(line, canvas.width / 2, startY);
            startY += 70;
          });

          ctx.fillStyle = '#a8a29e';
          ctx.font = '28px serif';
          const causeLines = wrapText(ctx, `根本原因：${result.root_cause}`, contentMaxWidth);
          startY += 50;
          causeLines.forEach(line => {
            ctx.fillText(line, canvas.width / 2, startY);
            startY += 40;
          });

          ctx.fillStyle = '#06b6d4';
          ctx.font = 'italic 30px serif';
          ctx.fillText(`"${result.socrates_comment}"`, canvas.width / 2, startY + 80);

        } else {
          // Grace Mode Rendering
          ctx.font = 'bold 42px serif';
          const verseLines = wrapText(ctx, `「${result.verse}」`, contentMaxWidth);
          let startY = canvas.height - 180 - verseLines.length * lineHeight - 70;
          if (startY < 250) startY = 250;

          ctx.fillStyle = '#ffffff';
          verseLines.forEach(line => {
            ctx.fillText(line, canvas.width / 2, startY);
            startY += lineHeight;
          });

          ctx.fillStyle = '#d4d4d8';
          ctx.font = '26px serif';
          ctx.fillText(`— ${result.reference}`, canvas.width / 2, startY + 30);
        }

        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(200, canvas.height - 80);
        ctx.lineTo(880, canvas.height - 80);
        ctx.stroke();

        ctx.fillStyle = '#a8a29e';
        ctx.font = '24px sans-serif';
        ctx.fillText('godloves.pages.dev', canvas.width / 2, canvas.height - 40);

        canvas.toBlob((blob) => resolve(blob), 'image/png');
      }

      function wrapText(context, text, maxWidth) {
        const lines = [];
        let currentLine = '';
        for (const char of text) {
          const testLine = currentLine + char;
          if (context.measureText(testLine).width > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = char;
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        return lines;
      }
    });
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      const cardBlob = await generateBlessingCard();
      const file = new File([cardBlob], 'blessing.png', { type: 'image/png' });

      let blessingText = '';
      if (mode === 'truth') {
        blessingText = `【光之聖所 - 真理之鎚】\n\n🔹 第一問題：${result.first_question}\n🔹 根本原因：${result.root_cause}\n\n「${result.socrates_comment}」\n\n✨ https://godloves.pages.dev`;
      } else {
        blessingText = `【光之聖所 - 恩典時刻】\n\n「${result.verse}」\n\n${result.part1.slice(0, 100)}...\n\n✨ https://godloves.pages.dev`;
      }

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ text: blessingText, files: [file] });
      } else {
        const url = URL.createObjectURL(cardBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `光之聖所_${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
        try {
          await navigator.clipboard.writeText(blessingText);
          alert('✅ 卡片已下載\n✅ 祝福文字已複製');
        } catch { alert('卡片已下載'); }
      }
    } catch (err) { console.error('分享失敗:', err); }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const cardBlob = await generateBlessingCard();
      const url = URL.createObjectURL(cardBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `光之聖所_祝福卡片_${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error('下載失敗:', err); }
  };

  // ================================================================
  // 🎭 UI VIEWS - 狀態機驅動的視圖
  // ================================================================

  // 1. 儀式感首頁：沒有表單，只有一個問題
  const renderIdle = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 pt-28 md:pt-0 animate-in fade-in duration-1000">

      {/* 背景：神聖之光 (Divine Light) */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150vw] h-[80vh] bg-gradient-radial from-amber-600/10 via-amber-900/5 to-transparent blur-3xl pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />

      {/* 核心問題區域 */}
      <div className="relative z-10 flex flex-col items-center">

        {/* 模式切換 (Grace / Truth) */}
        <div className="flex bg-white/5 backdrop-blur-md rounded-full p-1 mb-10 border border-white/10 relative">
          {/* 滑塊背景 */}
          <div className={`absolute top-1 bottom-1 w-[50%] rounded-full bg-amber-500/20 transition-all duration-500 ${mode === 'grace' ? 'left-1' : 'left-[48%]'}`} />

          <button
            onClick={() => setMode('grace')}
            className={`relative z-10 px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-500 ${mode === 'grace' ? 'text-amber-200' : 'text-stone-500 hover:text-stone-300'}`}
          >
            <Feather className="w-4 h-4" />
            <span className="text-xs tracking-widest font-serif">{t.grace}</span>
          </button>
          <button
            onClick={() => setMode('truth')}
            className={`relative z-10 px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-500 ${mode === 'truth' ? 'text-amber-200' : 'text-stone-500 hover:text-stone-300'}`}
          >
            <Hammer className="w-4 h-4" />
            <span className="text-xs tracking-widest font-serif">{t.truth}</span>
          </button>
        </div>

        {/* 標題 & 火焰 */}
        <div className="text-center mb-10 md:mb-14 space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse-slow"></div>
            <Flame className="w-12 h-12 text-amber-500 relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-breath" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-white tracking-[0.2em] leading-relaxed opacity-90">
            此刻，你的心<br />
            在哪裡流浪？
          </h1>
        </div>

        {/* 藥丸網格 */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-3 md:gap-4 w-full">
          {MOOD_PILLS.map(({ label, en, icon: Icon, color }) => (
            <button
              key={label}
              onClick={() => {
                setSelectedMood(label);
                setViewState('input');
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className="group px-4 py-3 md:px-6 md:py-4 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-stone-300 font-serif text-sm transition-all duration-500 flex items-center justify-center gap-2 md:gap-3 hover:bg-white/10 hover:border-amber-500/50 hover:text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-1"
            >
              <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 opacity-60 group-hover:opacity-100 group-hover:${color} transition-all duration-500`} />
              <span className="tracking-widest">{lang === 'en' ? en : label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* 底部區域：流式佈局 (不再重疊) */}
      <div className="shrink-0 mt-8 mb-4 flex flex-col items-center gap-6 w-full pointer-events-none">
        {/* 提示文字 */}
        <p className="text-stone-400 text-xs tracking-[0.2em] font-light animate-pulse text-center">
          點選一個狀態，領受溫暖
        </p>

        {/* Buy Me a Coffee */}
        <a
          href="https://www.buymeacoffee.com/laladoo99"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 transition-all duration-300 group backdrop-blur-sm shadow-lg"
        >
          <div className="p-1 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20">
            <Coffee className="w-3 h-3 text-amber-500/60 group-hover:text-amber-400" />
          </div>
          <span className="text-[10px] tracking-widest text-stone-600 group-hover:text-amber-200/80 font-serif">
            支持聖所
          </span>
        </a>
      </div>
    </div>
  );

  // 2. 傾訴空間：極簡輸入，像是在寫信
  const renderInput = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-in zoom-in-95 duration-700 pt-20">

      <div className="w-full max-w-xl">

        {/* 狀態標籤 - 增加清晰度 */}
        {/* 狀態標籤 - 增加清晰度 */}
        <TheLogic className="block text-center text-amber-500/90 text-sm md:text-base tracking-[0.25em] mb-10 drop-shadow-md border-none opacity-90">
          ✦ 關於「{selectedMood}」✦
        </TheLogic>

        {/* 無邊框輸入 -> 藝術框線輸入 (Artistic Border) */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-white/10 to-amber-500/20 rounded-2xl opacity-30 group-hover:opacity-50 transition duration-1000 blur-sm"></div>
          <textarea
            ref={inputRef}
            value={userStory}
            onChange={(e) => {
              if (e.target.value.length <= 600) {
                setUserStory(e.target.value);
                setCharCount(e.target.value.length);
              }
            }}
            placeholder={t.storyPlaceholder}
            className="relative w-full bg-black/40 backdrop-blur-md text-center text-xl md:text-2xl text-white/90 font-serif placeholder:text-stone-500 focus:placeholder:text-stone-600 outline-none resize-none min-h-[260px] leading-relaxed border border-white/10 rounded-2xl p-8 focus:border-amber-500/40 focus:bg-black/60 transition-all duration-500 shadow-inner"
          />
        </div>

        {/* 字數計數 */}
        <TheLogic className="text-center mt-6 text-stone-700 text-xs tracking-wider border-none">
          {charCount}/600
        </TheLogic>

        {/* 交付按鈕 - 光暈效果 */}
        {/* 交付按鈕 - 光暈效果 */}
        <div className="mt-20 flex justify-center">
          <MainAction onComplete={handleListen} mode={mode} className="group flex items-center justify-center text-lg tracking-[0.25em]">
            <span className="flex flex-col items-center gap-0.5">
              <span className="flex items-center gap-3">
                <Wind className="w-5 h-5 opacity-70" />
                <span>{mode === 'truth' ? '凝視深淵' : '交付靈魂'}</span>
              </span>
              <span className="text-[10px] opacity-40 tracking-widest font-sans uppercase">
                {mode === 'truth' ? '長按凝視' : '長按注入'}
              </span>
            </span>
          </MainAction>
        </div>

        {/* 跳過文字直接進入 */}
        <p className="text-center mt-12 text-stone-600 text-xs">
          {lang === 'en' ? 'It\u2019s okay to stay silent, ' : '不想寫也沒關係，'}<button onClick={handleListen} className="text-amber-600/70 hover:text-amber-500 underline underline-offset-4">{t.receiveBlessing}</button>
        </p>
      </div>
    </div>
  );

  // 3. 連結中：只有呼吸的光

  // 4. 應許顯現：全螢幕沉浸式 (Cinematic Result)
  // 4. 應許顯現：全螢幕沉浸式 (Cinematic Result)
  const renderResult = () => (
    <div className={`relative min-h-screen w-full overflow-hidden bg-black animate-in fade-in duration-1000 perspective-1000 ${isDissolving ? 'animate-out fade-out zoom-out-95 duration-1000' : ''}`}>

      {/* 背景層：圖片即背景 (Ken Burns Effect + Parallax) */}
      <div className="absolute inset-0 z-0" style={bgStyle}>
        {imageUrl && (
          <img
            src={imageUrl}
            className={`w-full h-full object-cover transition-all duration-[5s] ease-out ${imageLoaded ? 'opacity-50' : 'opacity-0'}`}
            /* Note: Scale is now handled by bgStyle to prevent conflict */
            onLoad={() => setImageLoaded(true)}
            alt="Atmosphere"
          />
        )}
        {/* 電影感遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* 內容層 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center py-16 px-6 overflow-y-auto" style={fgStyle}>

        <div className="max-w-2xl w-full space-y-20 pb-32">

          {/* 經文：像電影標題 (Grace Mode ONLY) */}
          {mode === 'grace' && result.verse && (
            <div className="text-center space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300">
              <TheLogic className="border border-white/20 px-5 py-2 rounded-full text-[10px] text-white/60 tracking-[0.3em] inline-block">
                {result.reference}
              </TheLogic>
              <TheWord size="xl" className="font-light leading-snug drop-shadow-2xl">
                「{result.verse}」
              </TheWord>
            </div>
          )}

          {/* Obsidian Truth UI (Truth Mode ONLY) */}
          {mode === 'truth' && (
            <div className="relative w-full max-w-2xl mx-auto py-12 px-4 selection:bg-cyan-900/40">
              {/* Spine of Truth - Vertical Glow Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent -translate-x-1/2 hidden md:block" />

              <div className="space-y-32 relative">
                {/* 1. The Refined Insight (Verse Replacement in Truth) */}
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-10 duration-1000">
                  <TheLogic className="text-cyan-500/60 uppercase">
                    Refinement {result.reference && ` // ${result.reference}`}
                  </TheLogic>
                  <h2 className="font-serif text-2xl md:text-5xl font-bold text-white leading-tight glitch-text px-2">
                    「{result.verse}」
                  </h2>
                </div>

                {/* 2. Central Obsidian Block (Surface & Logic) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                  <div className="space-y-6 animate-in fade-in slide-in-from-left-10 duration-1000 delay-300">
                    <TheLogic className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400">
                      Surface Question
                    </TheLogic>
                    <p className="text-white/70 font-serif text-lg md:text-xl leading-relaxed italic">
                      <EtherealReveal key={`truth-sf-${result.surface_question}`} text={result.surface_question} speed={30} onComplete={() => setShowPart2(true)} />
                    </p>
                  </div>

                  {showPart2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-1000">
                      <TheLogic className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded text-stone-500">
                        Logical Analysis
                      </TheLogic>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto md:overflow-visible pr-2 md:pr-0 custom-scrollbar">
                        {result.depth_logic?.map((logic, idx) => (
                          <div key={idx} className="flex gap-4 items-start group">
                            <span className="font-mono text-cyan-600 text-[10px] mt-2">0{idx + 1}</span>
                            <p className="text-stone-400 font-serif text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                              {logic}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. The Root Surgery (Bottom Block) */}
                {showPart2 && (
                  <div className="relative pt-16 animate-in fade-in zoom-in-95 duration-1000 delay-500">
                    {/* Horizontal Divider with Hammer Icon */}
                    <div className="flex items-center justify-center gap-6 mb-16">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/30" />
                      <div className="p-4 rounded-full border border-cyan-500/30 bg-black shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <Hammer className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/30" />
                    </div>

                    <div className="bg-[#0a0a0b] border border-white/5 p-6 md:p-16 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                      {/* Subliminal Background Text */}
                      <div className="absolute top-0 right-0 p-4 font-mono text-[30px] md:text-[40px] text-white/[0.02] select-none pointer-events-none tracking-tighter uppercase font-bold">
                        EXISTENTIAL
                      </div>

                      <div className="relative space-y-8 md:space-y-12">
                        <div className="space-y-4">
                          <TheLogic className="text-cyan-400/80 uppercase">Root Cause</TheLogic>
                          <p className="text-white/90 font-serif text-lg md:text-2xl leading-relaxed">
                            <EtherealReveal key={`truth-rc-${result.root_cause}`} text={result.root_cause} speed={25} onComplete={() => setShowPart3(true)} />
                          </p>
                        </div>

                        {showPart3 && (
                          <div className="space-y-6 pt-12 border-t border-white/5 animate-in slide-in-from-bottom-5 duration-700">
                            <TheLogic className="text-cyan-400 uppercase">The First Question</TheLogic>
                            <h2 className="text-2xl md:text-5xl font-serif text-white font-bold leading-tight tracking-tight">
                              {result.first_question}
                            </h2>
                            <div className="pt-8">
                              <p className="text-stone-500 font-serif italic text-sm md:text-base border-l-2 border-cyan-500/30 pl-6 leading-relaxed">
                                "{result.socrates_comment}"
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Corner Accents */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full" />
                      <div className="absolute bottom-4 right-8 font-mono text-[8px] text-stone-800 tracking-widest uppercase opacity-40">
                        System.Insight.Finalized()
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 三段式文字：像詩集 (Grace Mode) */}
          {/* 三段式文字：像詩集 (Grace Mode) */}
          {mode === 'grace' && (
            <div className="space-y-16">
              <div className="group">
                <div className="flex items-center gap-4 mb-5 opacity-80">
                  <TheLogic className="text-amber-500/70 border-none">{t.promise}</TheLogic>
                  <div className="h-px w-12 bg-amber-500/30" />
                </div>
                <p className="text-white/85 font-serif text-lg md:text-xl leading-loose font-light">
                  <EtherealReveal key={result.part1} text={result.part1} speed={25} onComplete={() => setShowPart2(true)} />
                </p>
              </div>

              {showPart2 && (
                <div className="group animate-in fade-in duration-700">
                  <div className="flex items-center gap-4 mb-5 opacity-80">
                    <TheLogic className="text-amber-500/70 border-none">{t.guidance}</TheLogic>
                    <div className="h-px w-12 bg-amber-500/30" />
                  </div>
                  <p className="text-white/85 font-serif text-lg md:text-xl leading-loose font-light">
                    <EtherealReveal key={result.part2} text={result.part2} speed={25} onComplete={() => setShowPart3(true)} />
                  </p>
                </div>
              )}

              {showPart3 && (
                <div className="group animate-in fade-in duration-700">
                  <div className="flex items-center gap-4 mb-5 opacity-80">
                    <TheLogic className="text-amber-500/70 border-none">{t.finalBlessing}</TheLogic>
                    <div className="h-px w-12 bg-amber-500/30" />
                  </div>
                  <p className="text-white/85 font-serif text-lg md:text-xl leading-loose font-light">
                    <EtherealReveal key={result.part3} text={result.part3} speed={25} />
                  </p>
                </div>
              )}
            </div>
          )}


          {/* 禱告區 */}
          {prayer && (
            <div className="p-8 bg-amber-900/10 rounded-2xl border border-amber-500/10 animate-in zoom-in duration-500">
              <h5 className="font-serif text-amber-600/80 font-bold mb-5 text-center text-[10px] tracking-[0.3em] uppercase">{t.prayer}</h5>
              <p className="text-white/70 font-light leading-loose font-serif text-center italic">
                「<EtherealReveal key={prayer} text={prayer} speed={25} />」
              </p>
            </div>
          )}

          {/* 互動區 */}
          <div className="flex justify-center gap-6 pt-8 border-t border-white/10">
            <button
              onClick={playSoulVoice}
              className={`flex flex-col items-center gap-3 text-[10px] tracking-[0.2em] uppercase transition-all ${isPlaying ? 'text-amber-400' : 'text-stone-500 hover:text-white'}`}
            >
              <div className={`p-5 rounded-full border backdrop-blur-sm ${isPlaying ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 bg-white/5'}`}>
                {isPlaying ? <StopCircle className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </div>
              {isPlaying ? '靜止' : '聆聽'}
            </button>

            {/* 聲音切換按鈕 (只在有多個聲音時顯示) */}
            {availableVoices.length > 1 && (
              <button
                onClick={cycleVoice}
                className="flex flex-col items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-stone-500 hover:text-white transition-all"
              >
                <div className="p-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm group-hover:bg-amber-500/10 transition-colors">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-amber-500/50 text-[9px]">{availableVoices[currentVoiceIndex]?.name?.slice(0, 6) || '切換'}</span>
              </button>
            )}

            <button
              onClick={generatePrayer}
              disabled={isPrayerLoading}
              className="flex flex-col items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-amber-500 hover:text-amber-400 transition-all disabled:opacity-50"
            >
              <div className="p-5 rounded-full border border-amber-500 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform duration-300">
                {isPrayerLoading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Heart className="w-5 h-5 text-black fill-black" />}
              </div>
              <span className="font-bold">{isPrayerLoading ? t.praying : t.generatePrayer}</span>
            </button>

            {/* 下載/收藏 (右側) */}
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="flex flex-col items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-stone-500 hover:text-white transition-all group"
              >
                <div className="p-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm group-hover:border-amber-500/30 group-hover:bg-amber-500/5 transition-all">
                  <Download className="w-5 h-5" />
                </div>
                收藏
              </button>

              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-stone-500 hover:text-white transition-all group"
              >
                <div className="p-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm group-hover:border-amber-500/30 group-hover:bg-amber-500/5 transition-all">
                  <Share2 className="w-5 h-5" />
                </div>
                分享
              </button>
            </div>
          </div>

          {/* 重新開始 */}
          <div className="text-center pt-8">
            <button
              onClick={() => handleDissolve('idle')}
              className="inline-flex items-center gap-2 text-stone-600 text-xs tracking-[0.2em] hover:text-amber-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              再領受一份祝福
            </button>
          </div>

          <div className="text-center text-white/20 text-xs font-serif italic mt-8">
            今天就到這裡也很好，願你帶著這份光走一小段路。
          </div>

        </div>
      </div>
    </div>
  );

  // 5. 生命之書：生命之卷 (Book of Life - Cinematic Timeline)
  const renderHistory = () => (
    <div className="fixed inset-0 z-[300] bg-[#050506]/98 backdrop-blur-3xl animate-in fade-in duration-700 overflow-y-auto custom-scrollbar">
      <div className="min-h-screen w-full max-w-2xl mx-auto py-24 px-6 md:px-12 flex flex-col">

        <div className="flex justify-between items-end mb-24">
          <div className="space-y-4">
            <TheWord size="xl" className="tracking-[0.2em]">生命之卷</TheWord>
            <TheWhisper size="md">"凡留下的，皆在光中被紀念。"</TheWhisper>
          </div>
          <GhostButton onClick={() => setShowHistory(false)} icon={X} label="閉卷" />
        </div>

        <div className="relative space-y-16">
          {/* Vertical Timeline Thread */}
          <div className="absolute left-[31px] top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/40 via-amber-500/5 to-transparent hidden md:block" />

          {history.map((entry, idx) => (
            <div key={entry.id || idx} className="relative pl-0 md:pl-20 group">
              {/* Timeline Node */}
              <div className="absolute left-[24px] top-2 w-4 h-4 rounded-full border-2 border-amber-500/40 bg-black z-10 hidden md:block group-hover:scale-125 group-hover:border-amber-500 transition-all duration-500" />

              <button
                onClick={() => {
                  setResult(entry);
                  setImageUrl('');
                  setShowHistory(false);
                  setViewState('result');
                }}
                className="w-full text-left bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 md:p-12 hover:bg-white/[0.05] hover:border-amber-500/20 transition-all group/card relative overflow-hidden"
              >
                {/* Mode Badge */}
                <div className="absolute top-0 right-0 px-6 py-2 bg-amber-500/10 border-b border-l border-white/5 rounded-bl-2xl">
                  <div className="text-[8px] font-mono tracking-[0.3em] text-amber-500 uppercase">{entry.mode || 'grace'}</div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-stone-500 font-serif text-xs md:text-sm tracking-widest">
                    <span>{entry.date}</span>
                    <span className="opacity-30">/</span>
                    <span className="text-amber-500/60 uppercase">{entry.reference || 'Personal insight'}</span>
                  </div>

                  <h3 className="text-white/90 font-serif text-xl md:text-2xl leading-relaxed italic group-hover/card:text-white transition-colors">
                    「{entry.verse || entry.first_question}」
                  </h3>

                  {entry.root_cause && (
                    <p className="text-stone-500 font-mono text-[10px] leading-snug line-clamp-2 uppercase tracking-tight opacity-40 group-hover/card:opacity-60 transition-opacity">
                      Root: {entry.root_cause}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-[9px] text-amber-500/40 font-mono tracking-widest pt-4">
                    <Sparkles className="w-3 h-3" />
                    READ FULL SCROLL
                  </div>
                </div>
              </button>
            </div>
          ))}

          {history.length === 0 && (
            <div className="py-32 text-center space-y-8 opacity-40">
              <Feather className="w-16 h-16 mx-auto text-stone-700 animate-bounce" />
              <div className="space-y-4">
                <p className="font-serif text-xl text-stone-500">卷軸尚未展開</p>
                <p className="text-stone-600 text-sm">在此地停駐，留下你靈魂的迴聲。</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-32 pb-24 text-center">
          <p className="text-stone-800 font-serif text-xs italic tracking-widest">
            "所有被遺忘的，其實都在更高處被銘刻。"
          </p>
        </div>
      </div>
    </div>
  );

  // ================================================================
  // 🎬 MAIN RENDER
  // ================================================================
  return (
    <div className="relative min-h-screen bg-[#050506] text-stone-200 overflow-hidden font-sans selection:bg-amber-900/30 selection:text-amber-100">
      {/* 粒子背景 (Audio Reactive & Mode Aware) */}
      <ParticleField viewState={viewState} isPlaying={isPlaying} mode={mode} isDissolving={isDissolving} />

      {/* 🌠 流星效果層 */}
      {meteors.map(timestamp => (
        <div key={timestamp} className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden z-20">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[2px] bg-gradient-to-l from-transparent via-amber-200 to-transparent shadow-[0_0_20px_rgba(251,191,36,0.8)] rotate-45 animate-[dash_2s_ease-out_forwards]" />
        </div>
      ))}

      {/* --- 🌌 SANCTUARY PORTAL --- */}
      {showPortal && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[40px] animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
          <div className="min-h-screen w-full max-w-lg ml-auto bg-[#0a0a0b]/90 border-l border-white/5 p-8 md:p-12 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">

            <div className="flex justify-between items-center mb-16">
              <TheWord size="lg" className="tracking-[0.3em] text-amber-100/90">聖所門戶</TheWord>
              <GhostButton onClick={() => setShowPortal(false)} icon={X} />
            </div>

            <div className="space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-stone-500">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-[0.3em]">生命之書</span>
                </div>
                <div className="grid gap-3">
                  {history.length > 0 ? (
                    history.slice(0, 3).map((item, i) => (
                      <button
                        key={i}
                        onClick={() => { setShowHistory(true); setShowPortal(false); }}
                        className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 text-left transition-all group"
                      >
                        <div className="text-amber-500/60 text-[8px] mb-1 font-mono uppercase">{item.mode || 'grace'}</div>
                        <p className="text-xs text-stone-300 line-clamp-1 italic">「{item.verse || item.first_question}」</p>
                      </button>
                    ))
                  ) : (
                    <div className="p-10 rounded-3xl border border-dashed border-white/5 text-center text-stone-700 text-xs italic">尚未留下文字。</div>
                  )}
                  {history.length > 0 && (
                    <button onClick={() => { setShowHistory(true); setShowPortal(false); }} className="text-center py-2 text-[10px] text-amber-500/40 hover:text-amber-500 transition-colors tracking-widest uppercase">View Full Scroll</button>
                  )}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 text-stone-500">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-[0.3em]">萬民連結</span>
                </div>
                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                  <div>
                    <div className="text-amber-500 text-lg font-mono tracking-tighter">{onlineCount}</div>
                    <div className="text-[9px] text-stone-600 uppercase tracking-widest">守望魂靈</div>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div className="text-right">
                    <div className="text-white/60 text-[10px] tracking-widest italic">靈性共振中</div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 text-stone-500">
                  <Settings className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-[0.3em]">聖域設置</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-xs text-stone-400">環境音效</span>
                    <button onClick={toggleSound} className={`w-12 h-6 rounded-full transition-all relative ${!isMuted ? 'bg-amber-600' : 'bg-stone-800'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!isMuted ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <button onClick={() => { setShowStory(true); setShowPortal(false); }} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <span className="text-xs text-stone-400 group-hover:text-amber-200">聖所源起</span>
                    <ChevronRight className="w-4 h-4 text-stone-600" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )
      }

      {/* --- 🕊️ REFINED TOP BAR --- */}
      <div className="fixed top-0 left-0 right-0 z-[150] flex items-center justify-between p-6 md:p-10 pointer-events-none">

        {/* Dynamic Left: Logo or Exit */}
        <div className="pointer-events-auto">
          {viewState === 'idle' ? (
            <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <Sun className="w-4 h-4 text-amber-500 animate-[pulse_4s_infinite]" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-white font-light">Sanctuary</span>
            </div>
          ) : (
            <button
              onClick={() => { setViewState('idle'); setUserStory(''); setCharCount(0); stopAudio(); }}
              className="group flex items-center gap-2 text-stone-500 hover:text-white transition-all"
            >
              <div className="p-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md group-hover:border-white/20">
                <X className="w-4 h-4" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-60 -translate-x-2 group-hover:translate-x-0 transition-all">{lang === 'en' ? 'Leave' : '離開聖所'}</span>
            </button>
          )}
        </div>

        {/* Right: Language Toggle + Unified Portal Trigger */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="h-10 px-4 rounded-full bg-black/20 border border-white/5 backdrop-blur-md flex items-center gap-2 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group shadow-lg"
            title={t.aiLanguage}
          >
            <Globe className="w-4 h-4 text-stone-500 group-hover:text-amber-500 transition-colors" />
            <span className="text-[10px] text-stone-400 group-hover:text-amber-500 font-mono tracking-wider">{lang === 'zh' ? 'EN' : '中文'}</span>
          </button>
          <button
            onClick={() => setShowPortal(true)}
            className="h-10 px-4 rounded-full bg-black/20 border border-white/5 backdrop-blur-md flex items-center gap-3 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="text-[10px] text-amber-500 font-mono tracking-tighter">{onlineCount}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <Menu className="w-4 h-4 text-stone-500 group-hover:text-amber-500 transition-colors" />
          </button>
        </div>
      </div>


      {/* 📖 Story Modal */}
      {
        showStory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0c0a09] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

              <div className="absolute top-6 right-6">
                <GhostButton onClick={() => setShowStory(false)} icon={X} />
              </div>

              <div className="space-y-8 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                <div className="text-center space-y-4">
                  <Feather className="w-12 h-12 text-amber-500/50 mx-auto" />
                  <TheWord size="lg" className="tracking-widest text-amber-100">關於聖所</TheWord>
                  <TheLogic className="text-amber-500/60 uppercase tracking-[0.3em] border-none">The Story of Sanctuary</TheLogic>
                </div>

                <div className="space-y-10 text-stone-300 font-serif leading-relaxed text-lg tracking-wide">
                  <p className="indent-8">
                    你好，我是這個虛擬聖所的建造者。在這個喧囂而急促、被演算法徹底撕裂的數位時代，我們往往在無止盡的資訊流中遺落了靈魂的壓艙石。
                  </p>
                  <p className="indent-8">
                    聖所 (Sanctuary) 並非宗教的狹隘宣教，而是為所有在荒原漫遊的人建立的<b>「靈魂避難所」</b>。這裡不提供標準答案，也沒有短暫的點讚愉悅。這裡只有你，和一束跨越維度、為你降下的光。
                  </p>

                  <div className="py-6 flex flex-col items-center">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-10" />
                    <TheLogic className="text-amber-500/80 tracking-[0.4em] font-bold uppercase mb-8 border-none">⎯ 領受指引 ⎯</TheLogic>

                    <div className="grid grid-cols-1 gap-8 w-full">
                      {[
                        { step: "01", title: "誠實觀照", detail: "在首頁選擇此刻最真實的心境，不需偽裝堅強。" },
                        { step: "02", title: "全然交付", detail: "在信箋中寫下你的重負，让 AI 將其轉化為應許。" },
                        { step: "03", title: "靜心領受", detail: "待光芒匯聚，收下專屬於你的經文、影像與禱告。" },
                        { step: "04", title: "化作流星", detail: "点击收藏或分享，讓這份恩典在雲端持續共鳴。" }
                      ].map(item => (
                        <div key={item.step} className="flex items-start gap-6 group hover:translate-x-1 transition-transform">
                          <span className="text-amber-500/40 text-2xl font-mono leading-none">{item.step}</span>
                          <div>
                            <h4 className="text-white font-bold tracking-widest mb-1">{item.title}</h4>
                            <p className="text-stone-500 text-sm font-light leading-relaxed">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mt-12" />
                  </div>

                  <div className="pt-4 text-center">
                    <TheWhisper className="text-amber-500/50 text-sm tracking-widest animate-pulse">
                      "願你在這片光中，尋得永恆的安息。"
                    </TheWhisper>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* 視圖切換 */}
      <div className="relative z-10">
        {viewState === 'idle' && renderIdle()}
        {viewState === 'input' && renderInput()}
        {viewState === 'processing' && renderProcessing()}
        {viewState === 'result' && result && renderResult()}
      </div>

      {/* 浮層 */}
      {showHistory && renderHistory()}

      {/* 🛤️ 信仰之路選擇器 */}
      {showFaithSelector && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-700">
          <div className="max-w-2xl w-full text-center">
            <div className="mb-4 text-4xl">🛤️</div>
            <h2 className="font-serif text-3xl md:text-4xl text-white/90 mb-3 tracking-wide">
              {lang === 'en' ? 'Choose Your Path' : '選擇你的信仰之路'}
            </h2>
            <p className="text-stone-400 font-serif text-sm md:text-base mb-10 leading-relaxed">
              {lang === 'en'
                ? 'Each path leads to the same light, through different wisdom.'
                : '條條之路通向同一道光，只是智慧的形式不同。'}
            </p>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {Object.values(FAITH_CONFIG).map((f) => (
                <button
                  key={f.id}
                  onClick={() => selectFaith(f.id)}
                  disabled={!f.available}
                  className={`group p-6 md:p-8 rounded-2xl border backdrop-blur-md transition-all duration-500 ${
                    f.available
                      ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-amber-500/40 hover:-translate-y-1 cursor-pointer'
                      : 'border-white/5 bg-white/[0.01] opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="text-4xl md:text-5xl mb-4">{f.theme.symbol}</div>
                  <div className="font-serif text-lg md:text-xl text-white/90 mb-1">
                    {lang === 'en' ? f.name.en : f.name.zh}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">
                    {lang === 'en' ? f.religion.en : f.religion.zh}
                  </div>
                  <div className="text-xs text-stone-400 font-serif">
                    {lang === 'en' ? f.desc.en : f.desc.zh}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => selectFaith('christian')}
              className="mt-8 text-xs text-stone-600 hover:text-stone-400 underline underline-offset-4 transition-colors"
            >
              {lang === 'en' ? 'Enter as it comes →' : '隨緣進入 →'}
            </button>
          </div>
        </div>
      )}

    </div >
  );
};

// 掛載 React 組件到 DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(SanctuaryEthereal));
