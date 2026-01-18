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
  ChevronRight
} = window.LucideReact;

/* ================= 全域配置 ================= */
// ☁️ Cloud Sanctuary (Supabase)
const SUPABASE_URL = "https://twtfdaglknppkdgihjfe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RQL4WxJyav143AUD0jvyFw_6RX4l-fj";

// 🤖 AI Model Configuration (2026 Standards)
const MODELS_TEXT = ["gemini-3-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
const MODELS_IMAGE = ["imagen-4.0-generate-001", "imagen-3.0-generate-001"];
let supabase = null;
if (window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("☁️ Supabase Client Initialized");
}

// 🎨 風格錨點：確保視覺輸出的一致性與高級感
const STYLE_ANCHOR = "style: soft sacred minimalism, chiaroscuro lighting, contemplative silence, fine art photography, ethereal glow, high resolution, cinematic composition, 8k";

// 🌈 情緒關鍵字（漂浮 Mood Pills）
const MOOD_PILLS = [
  { label: '感到沉重', icon: CloudRain, color: 'text-slate-400' },
  { label: '迷失方向', icon: Compass, color: 'text-cyan-400' },
  { label: '需要勇氣', icon: Shield, color: 'text-amber-600' },
  { label: '尋求安慰', icon: Heart, color: 'text-rose-400' },
  { label: '渴望平靜', icon: Feather, color: 'text-teal-300' },
  { label: '想要感恩', icon: Sun, color: 'text-yellow-300' },
  { label: '關係修復', icon: Users, color: 'text-pink-300' },
  { label: '身心疲憊', icon: Moon, color: 'text-indigo-300' },
  { label: '等候途中', icon: Hourglass, color: 'text-stone-400' },
  { label: '重新開始', icon: Sprout, color: 'text-emerald-400' }
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
      // 🔥 Volume Reduced to 0.3
      masterGain.gain.linearRampToValueAtTime(0.3, now + 5);
      setIsMuted(false);
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

// --- Component: 打字機效果 ---
const TypewriterText = ({ text, speed = 30, className, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    setDisplayedText('');
    if (!text) return;
    let localIndex = 0;
    const timer = setInterval(() => {
      if (localIndex < text.length) {
        setDisplayedText(text.substring(0, localIndex + 1));
        localIndex++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return <span className={className}>{displayedText}</span>;
};

// --- Component: 粒子背景 (星塵效果) ---
const ParticleField = ({ viewState }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 創建粒子
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const isConverging = viewState === 'processing';

      particles.forEach(p => {
        if (isConverging) {
          // 匯聚模式：加速飛向中心
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          p.x += dx * 0.02;
          p.y += dy * 0.02;
          p.opacity = Math.min(p.opacity + 0.01, 0.8); // 變亮
        } else {
          // 飄游模式
          p.x += p.speedX;
          p.y -= p.speedY; // 微微上升

          // 邊界檢查
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`; // Amber-500
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [viewState]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-1000" />;
};

// --- Main Component ---
const SanctuaryEthereal = () => {
  // 狀態機：idle -> input -> processing -> result
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

  // 🤝 Phase 2: Communion (Realtime)
  const [onlineCount, setOnlineCount] = useState(1);
  const [meteors, setMeteors] = useState([]); // Array of timestamps for meteors

  // Cinematic Status Text State
  const [statusText, setStatusText] = useState("正在傾聽...");

  const inputRef = useRef(null);
  const audioSourceRef = useRef(null);
  const { isMuted, toggleSound, initAudio } = useAmbientSound();

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
  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">

      {/* 靈魂呼吸光球 (Breathing Orb) */}
      <div className="relative flex items-center justify-center">
        {/* 外層光暈：緩慢擴散 */}
        <div className="absolute w-64 h-64 bg-amber-600/10 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />

        {/* 中層光暈：主要呼吸 */}
        <div className="absolute w-32 h-32 bg-amber-500/20 rounded-full animate-[pulse_3s_ease-in-out_infinite] blur-xl" />

        {/* 核心光點 */}
        <div className="relative w-2 h-2 bg-white/90 rounded-full shadow-[0_0_40px_rgba(245,158,11,0.8)] animate-pulse" />
      </div>

      {/* 情境式獨白文字 */}
      <div className="mt-24 h-8 flex items-center justify-center">
        <p key={statusText} className="font-serif text-stone-400 tracking-[0.5em] text-sm animate-in fade-in duration-1000 slide-in-from-bottom-2">
          {statusText}
        </p>
      </div>

      {/* 底部微光裝飾 */}
      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-amber-900/10 to-transparent pointer-events-none" />
    </div>
  );

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
  const cleanJsonString = (str) => str ? str.replace(/```json\n ?| ```/g, "").trim() : "{}";

  const saveToHistory = (newEntry) => {
    const entry = { id: Date.now(), date: new Date().toLocaleDateString(), ...newEntry };
    const newHistory = [entry, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('sanctuary_journal', JSON.stringify(newHistory));
  };

  const callGemini = async (urls, body, retries = 3) => {
    const delays = [1000, 2000, 4000];
    const urlList = Array.isArray(urls) ? urls : [urls];

    for (const url of urlList) {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, body })
          });
          if (!res.ok) {
            const errData = await res.json();
            console.error(`❌ Model ${url.split('/').slice(-1)} failed:`, errData.error);
            throw new Error(errData.error || `HTTP ${res.status}`);
          }
          const data = await res.json();
          if (data.error) {
            console.error(`❌ Model API Error:`, data.error);
            throw new Error(data.error.message || "Model Error");
          }
          return data;
        } catch (e) {
          console.warn(`Attempt failed for ${url}:`, e.message);
          if (i === retries - 1) continue; // Try next URL/Model
          await new Promise(r => setTimeout(r, delays[i]));
        }
      }
    }
    throw new Error("所有模型調用均失敗，請檢查 API Key 或端點設定。");
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
      const atmospheres = ["深淵中的迴聲", "黎明前的微光", "荒原上的星火", "廢墟中的詠嘆", "極北的孤寂"];
      const randomAtmosphere = atmospheres[Math.floor(Math.random() * atmospheres.length)];
      const wisdomPrompt = `[當前氛圍:${randomAtmosphere}] [使用者狀態:${selectedMood}] ${userStory ? `[心事:${userStory}]` : ''} [隨機偏移量:${Math.random().toString(36).substring(7)}] `;

      let wisdomBody;

      if (mode === 'grace') {
        // 🕊️ 恩典模式 (深層靈魂共鳴)
        wisdomBody = {
          contents: [{ parts: [{ text: wisdomPrompt }] }],
          systemInstruction: {
            parts: [{
              text: `
你是守望靈魂的聖所主人，筆觸融合 C.S. Lewis 的奇幻神聖感與奧古斯丁《懺悔錄》的深切真摯。
${safetyGuardrail} 
${diversityHint}

內容要求：
1. 長度：part1(300字以上), part2(250字以上), part3(200字以上)。總長度需展現「榮耀感」。
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
3. root_cause (200字以上): 這裡必須是一場「靈魂手術」。不留情面地指出使用者在逃避的終極真相（例如：虛榮、恐懼死亡、對權力的病態渴求、或對自由的畏縮）。
4. first_question (100字內): 一個讓使用者無法迴避、必須用餘生去回答的「第一哲學問題」。
5. socrates_comment (80字以上): 一句如尼采般狂放、又如基克果般憂鬱的終極點評。

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

      let modelUrls = MODELS_TEXT.map(m => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`);
      const wisdomData = await callGemini(modelUrls, wisdomBody);
      wisdomResult = JSON.parse(cleanJsonString(wisdomData.candidates[0].content.parts[0].text));
    } catch (e) {
      console.error("AI Connection Failed:", e);
      // 可視化錯誤提示，方便除錯
      if (viewState === 'processing') {
        setStatusText(`斷開與聖域的連結: ${e.message.slice(0, 20)}...`);
        setTimeout(() => setViewState('idle'), 3000);
      }
    }

    setResult(wisdomResult);

    // 圖片生成 (非阻塞)
    try {
      const imageBody = {
        instances: { prompt: `${STYLE_ANCHOR}, ${wisdomResult.image_prompt}` },
        parameters: { sampleCount: 1 }
      };
      let imageUrls = MODELS_IMAGE.map(m => `https://generativelanguage.googleapis.com/v1beta/models/${m}:predict`);
      const imageData = await callGemini(imageUrls, imageBody);
      setImageUrl(`data:image/png;base64,${imageData.predictions[0].bytesBase64Encoded}`);
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
        4. 字數：300-500字。讓文字成為一把手術刀。`;
      } else {
        promptText = `經文:${result.verse}。請寫一段「靈魂深處的禱告」。
        要求：
        1. 角色設定：你是守望靈魂的牧者，語氣要極度溫柔、神聖、充滿榮光。
        2. 文學風格：請模仿 C.S. Lewis 或 奧古斯丁《懺悔錄》的筆觸。
        3. 結構：
           - 呼求：在深淵中的呼求。
           - 轉折：看見微光。
           - 昇華：靈魂的飛升與安息。
        4. 字數：400-600字。這必須是一篇可以流傳的禱告文。`;
      }

      const prayerBody = {
        contents: [{ parts: [{ text: promptText }] }],
      };

      let modelUrls = MODELS_TEXT.map(m => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`);
      const data = await callGemini(modelUrls, prayerBody);
      const generatedText = data.candidates[0].content.parts[0].text;
      setPrayer(generatedText);

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
          // Hammer of Truth Rendering
          ctx.fillStyle = '#f59e0b';
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

          ctx.fillStyle = '#f59e0b';
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
            <span className="text-xs tracking-widest font-serif">恩典</span>
          </button>
          <button
            onClick={() => setMode('truth')}
            className={`relative z-10 px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-500 ${mode === 'truth' ? 'text-amber-200' : 'text-stone-500 hover:text-stone-300'}`}
          >
            <Hammer className="w-4 h-4" />
            <span className="text-xs tracking-widest font-serif">真理</span>
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
          {MOOD_PILLS.map(({ label, icon: Icon, color }) => (
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
              <span className="tracking-widest">{label}</span>
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
        <label className="block text-center text-amber-500/90 font-serif text-base tracking-[0.25em] mb-10 drop-shadow-md">
          ✦ 關於「{selectedMood}」✦
        </label>

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
            placeholder="在這裡輕聲說⋯⋯&#10;&#10;你可以寫下任何事，或什麼都不寫。"
            className="relative w-full bg-black/40 backdrop-blur-md text-center text-xl md:text-2xl text-white/90 font-serif placeholder:text-stone-500 focus:placeholder:text-stone-600 outline-none resize-none min-h-[260px] leading-relaxed border border-white/10 rounded-2xl p-8 focus:border-amber-500/40 focus:bg-black/60 transition-all duration-500 shadow-inner"
          />
        </div>

        {/* 字數計數 */}
        <div className="text-center mt-6 text-stone-700 text-xs font-mono tracking-wider">{charCount}/600</div>

        {/* 交付按鈕 - 光暈效果 */}
        <div className="mt-20 flex justify-center">
          <button
            onClick={handleListen}
            className="group relative px-14 py-5"
          >
            {/* 光暈背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-700/30 via-amber-600/20 to-amber-700/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-60 group-hover:opacity-100" />

            {/* 按鈕內容 */}
            <div className="relative flex items-center gap-4 text-amber-200 font-serif tracking-[0.25em] text-lg group-hover:text-white transition-colors">
              <Wind className="w-5 h-5 opacity-70" />
              交付與聆聽
            </div>
          </button>
        </div>

        {/* 跳過文字直接進入 */}
        <p className="text-center mt-12 text-stone-600 text-xs">
          不想寫也沒關係，<button onClick={handleListen} className="text-amber-600/70 hover:text-amber-500 underline underline-offset-4">直接領受祝福</button>
        </p>
      </div>
    </div>
  );

  // 3. 連結中：只有呼吸的光

  // 4. 應許顯現：全螢幕沉浸式 (Cinematic Result)
  const renderResult = () => (
    <div className="relative min-h-screen w-full overflow-hidden bg-black animate-in fade-in duration-1000">

      {/* 背景層：圖片即背景 (Ken Burns Effect) */}
      <div className="absolute inset-0 z-0">
        {imageUrl && (
          <img
            src={imageUrl}
            className={`w-full h-full object-cover transition-all duration-[5s] ease-out ${imageLoaded ? 'opacity-50 scale-110' : 'opacity-0 scale-100'}`}
            onLoad={() => setImageLoaded(true)}
            alt="Atmosphere"
          />
        )}
        {/* 電影感遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* 內容層 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center py-16 px-6 overflow-y-auto">

        <div className="max-w-2xl w-full space-y-20 pb-32">

          {/* 經文：像電影標題 (Grace Mode ONLY) */}
          {mode === 'grace' && result.verse && (
            <div className="text-center space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300">
              <div className="inline-block px-5 py-2 border border-white/20 rounded-full text-[10px] tracking-[0.3em] text-white/60">
                {result.reference}
              </div>
              <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-light text-white leading-snug drop-shadow-2xl">
                「{result.verse}」
              </h2>
            </div>
          )}

          {/* 真理卡片 (Truth Mode) */}
          {result.first_question && (
            <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-[#0c0a09] border border-amber-900/30 p-8 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-1000 delay-300 group">
              {/* 裝飾線 */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-amber-500/50" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-amber-500/50" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-amber-500/50" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-amber-500/50" />

              {/* 標題 */}
              <h3 className="text-amber-500/80 font-serif tracking-[0.5em] text-xs mb-8 uppercase border-b border-amber-900/30 pb-4 w-1/2">
                Hammer of Truth
              </h3>

              {/* 內容 */}
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <p className="text-stone-500 text-xs tracking-widest uppercase">Root Cause</p>
                <p className="text-white/80 font-serif text-lg">{result.root_cause}</p>

                <div className="w-8 h-px bg-amber-900/50 mx-auto my-6" />

                <p className="text-amber-500 text-xs tracking-widest uppercase">The First Question</p>
                <h2 className="text-2xl md:text-3xl font-serif text-white font-bold leading-relaxed">
                  {result.first_question}
                </h2>
              </div>

              {/* 底部點評 */}
              <div className="mt-8 pt-6 border-t border-amber-900/30 w-full">
                <p className="text-stone-400 font-serif italic text-sm">
                  "{result.socrates_comment}"
                </p>
              </div>

              {/* 懸停發光 */}
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </div>
          )}

          {/* 三段式文字：像詩集 (Grace Mode) */}
          {mode === 'grace' && (
            <div className="space-y-16">
              <div className="group">
                <h3 className="text-amber-500/70 font-serif text-xs tracking-[0.3em] mb-5 flex items-center gap-4 opacity-80">
                  光中的應許 <div className="h-px w-12 bg-amber-500/30" />
                </h3>
                <p className="text-white/85 font-serif text-lg md:text-xl leading-loose font-light">
                  <TypewriterText key={result.part1} text={result.part1} speed={25} onComplete={() => setShowPart2(true)} />
                </p>
              </div>

              {showPart2 && (
                <div className="group animate-in fade-in duration-700">
                  <h3 className="text-amber-500/70 font-serif text-xs tracking-[0.3em] mb-5 flex items-center gap-4 opacity-80">
                    靈魂的指引 <div className="h-px w-12 bg-amber-500/30" />
                  </h3>
                  <p className="text-white/85 font-serif text-lg md:text-xl leading-loose font-light">
                    <TypewriterText key={result.part2} text={result.part2} speed={25} onComplete={() => setShowPart3(true)} />
                  </p>
                </div>
              )}

              {showPart3 && (
                <div className="group animate-in fade-in duration-700">
                  <h3 className="text-amber-500/70 font-serif text-xs tracking-[0.3em] mb-5 flex items-center gap-4 opacity-80">
                    最終的祝福 <div className="h-px w-12 bg-amber-500/30" />
                  </h3>
                  <p className="text-white/85 font-serif text-lg md:text-xl leading-loose font-light">
                    <TypewriterText key={result.part3} text={result.part3} speed={25} />
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 真理模式 (Truth Mode) */}
          {mode === 'truth' && (
            <div className="space-y-16">
              <div className="group">
                <h3 className="text-cyan-500/70 font-serif text-xs tracking-[0.3em] mb-5 flex items-center gap-4 opacity-80">
                  核心叩問 <div className="h-px w-12 bg-cyan-500/30" />
                </h3>
                <h2 className="text-3xl md:text-4xl font-serif text-white/90 leading-relaxed tracking-wider">
                  <TypewriterText key={result.first_question} text={result.first_question} speed={40} onComplete={() => setShowPart2(true)} />
                </h2>
              </div>

              {showPart2 && (
                <div className="group animate-in fade-in duration-700 py-8 border-l-2 border-cyan-500/30 pl-8">
                  <h3 className="text-cyan-500/70 font-serif text-xs tracking-[0.3em] mb-5 flex items-center gap-4 opacity-80">
                    根本原因 <div className="h-px w-12 bg-cyan-500/30" />
                  </h3>
                  <p className="text-white/80 font-serif text-lg md:text-xl leading-loose font-light italic">
                    <TypewriterText key={result.root_cause} text={result.root_cause} speed={30} onComplete={() => setShowPart3(true)} />
                  </p>
                </div>
              )}

              {showPart3 && (
                <div className="group animate-in fade-in duration-700">
                  <h3 className="text-cyan-500/70 font-serif text-xs tracking-[0.3em] mb-5 flex items-center gap-4 opacity-80">
                    蘇格拉底的指引 <div className="h-px w-12 bg-cyan-500/30" />
                  </h3>
                  <p className="text-white/85 font-serif text-lg md:text-xl leading-loose font-light">
                    <TypewriterText key={result.socrates_comment} text={result.socrates_comment} speed={25} />
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 禱告區 */}
          {prayer && (
            <div className="p-8 bg-amber-900/10 rounded-2xl border border-amber-500/10 animate-in zoom-in duration-500">
              <h5 className="font-serif text-amber-600/80 font-bold mb-5 text-center text-[10px] tracking-[0.3em] uppercase">專屬禱告</h5>
              <p className="text-white/70 font-light leading-loose font-serif text-center italic">
                「<TypewriterText key={prayer} text={prayer} speed={25} />」
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
              <span className="font-bold">禱告</span>
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
              onClick={() => { setViewState('idle'); setUserStory(''); setCharCount(0); }}
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

  // 5. 恩典日記浮層
  const renderHistory = () => (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-xl text-amber-500/80 tracking-[0.2em]">恩典日記</h2>
          <button onClick={() => setShowHistory(false)} className="text-stone-500 hover:text-white transition-colors p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {history.map((entry) => (
            <button
              key={entry.id}
              onClick={() => {
                setResult(entry);
                setImageUrl('');
                setShowHistory(false);
                setViewState('result');
              }}
              className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-amber-500/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-amber-500/60 text-xs tracking-wider">{entry.date}</span>
                <span className="text-stone-500 text-xs">{entry.reference}</span>
              </div>
              <p className="text-white/90 font-serif leading-relaxed line-clamp-2">
                {entry.verse}
              </p>
            </button>
          ))}
          {history.length === 0 && (
            <div className="text-center text-stone-600 font-serif mt-20">
              <Feather className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p>還沒有日記，試著開始第一次傾訴吧。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ================================================================
  // 🎬 MAIN RENDER
  // ================================================================
  return (
    <div className="relative min-h-screen bg-[#050506] text-stone-200 overflow-hidden font-sans selection:bg-amber-900/30 selection:text-amber-100">
      {/* 粒子背景 (Pass viewState) */}
      <ParticleField viewState={viewState} />

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
              <h2 className="text-xl font-serif text-amber-100/90 tracking-[0.3em]">聖所門戶</h2>
              <button onClick={() => setShowPortal(false)} className="p-2 text-stone-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
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
      )}

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
              <span className="text-[9px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-60 -translate-x-2 group-hover:translate-x-0 transition-all">離開聖所</span>
            </button>
          )}
        </div>

        {/* Right: Unified Portal Trigger */}
        <div className="pointer-events-auto">
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
      {showStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-[#0c0a09] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            <button onClick={() => setShowStory(false)} className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-8 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
              <div className="text-center space-y-4">
                <Feather className="w-12 h-12 text-amber-500/50 mx-auto" />
                <h2 className="text-3xl font-serif text-amber-100 tracking-widest">關於聖所</h2>
                <p className="text-xs text-amber-500/60 uppercase tracking-[0.3em]">The Story of Sanctuary</p>
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
                  <h3 className="text-amber-500/80 tracking-[0.4em] text-sm font-bold uppercase mb-8">⎯ 領受指引 ⎯</h3>

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
                  <p className="text-amber-500/50 text-sm italic tracking-widest animate-pulse">
                    "願你在這片光中，尋得永恆的安息。"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 視圖切換 */}
      <div className="relative z-10">
        {viewState === 'idle' && renderIdle()}
        {viewState === 'input' && renderInput()}
        {viewState === 'processing' && renderProcessing()}
        {viewState === 'result' && result && renderResult()}
      </div>

      {/* 浮層 */}
      {showHistory && renderHistory()}

    </div>
  );
};

// 掛載 React 組件到 DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(SanctuaryEthereal));
