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
  Coffee // Donation
} = window.LucideReact;

/* ================= 全域配置 ================= */
const MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";
const MODEL_IMAGE = "imagen-4.0-generate-001";

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
  { label: '等候中', icon: Hourglass, color: 'text-stone-400' },
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
  const [prayer, setPrayer] = useState('');
  const [isPrayerLoading, setIsPrayerLoading] = useState(false);
  const [showPart2, setShowPart2] = useState(false);
  const [showPart3, setShowPart3] = useState(false);

  // Cinematic Status Text State
  const [statusText, setStatusText] = useState("正在傾聽...");

  const inputRef = useRef(null);
  const audioSourceRef = useRef(null);
  const { isMuted, toggleSound, initAudio } = useAmbientSound();

  // Cinematic Text Cycling
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
        <p className="font-serif text-stone-400 tracking-[0.5em] text-sm animate-[fade-in_1s_ease-in-out] key={statusText}">
          {statusText}
        </p>
      </div>

      {/* 底部微光裝飾 */}
      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-amber-900/10 to-transparent pointer-events-none" />
    </div>
  );

  // 初始化
  useEffect(() => {
    const saved = localStorage.getItem('sanctuary_journal');
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) { }

    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  // 工具函式
  const cleanJsonString = (str) => str ? str.replace(/```json\n ?| ```/g, "").trim() : "{}";

  const saveToHistory = (newEntry) => {
    const entry = { id: Date.now(), date: new Date().toLocaleDateString(), ...newEntry };
    const newHistory = [entry, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('sanctuary_journal', JSON.stringify(newHistory));
  };

  const callGemini = async (url, body, retries = 3) => {
    const delays = [1000, 2000, 4000];
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, body })
        });
        if (!res.ok) throw new Error(`Server Busy ${res.status} `);
        return await res.json();
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, delays[i]));
      }
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
      const diversityHint = "請每次選擇不同的經文，可從詩篇、箴言、以賽亞書、約翰福音等不同書卷中選擇。";
      const wisdomPrompt = `使用者狀態:${selectedMood}。${userStory ? `心事:${userStory}` : ''}。時間戳:${Date.now()} `;

      let wisdomBody;

      if (mode === 'grace') {
        // 🕊️ 恩典模式 (原本的療癒邏輯)
        wisdomBody = {
          contents: [{ parts: [{ text: wisdomPrompt }] }],
          systemInstruction: {
            parts: [{ text: `你是慈愛溫柔的聲音。${safetyGuardrail} \n${diversityHint} \n請輸出 JSON: verse, reference, part1(150字), part2(120字), part3(80字), image_prompt` }]
          },
          generationConfig: { responseMimeType: "application/json" }
        };
      } else {
        // 🔨 真理模式 (蘇格拉底之鎚)
        const socratesPrompt = `
角色: 擁有問題之鎚的蘇格拉底(Socrates)。
性格: 執著、好奇、坦率、尋一。拒絕廢話，拒絕廉價安慰。
技能: 清空、詰問、洞察、反思。
任務: 針對使用者的心事，揮舞問題之鎚，層層剝開表象，直指核心的「第一問題」。

邏輯鏈:
1. 提純問題: 探索當前困惑背後的更基礎問題。
2. 質疑追問: 至少進行三次深入質疑。
3. 撕破假象: 找出使用者在逃避的真相。
4. 第一問題: 提出一個讓使用者靈魂震顫的根本問題。

          請輸出 JSON:
{
  "type": "truth",
    "surface_question": "表層的困惑",
      "depth_logic": ["質疑1", "質疑2", "質疑3"],
        "root_cause": "根本原因 (不留情面)",
          "first_question": "第一問題 (直擊靈魂)",
            "socrates_comment": "一句極簡的點評 (例如: '你還在騙自己。')",
              "image_prompt": "Abstract minimalistic geometric concept art, sharp lines, high contrast, black and gold, philosophical, void, clarity"
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

      const wisdomData = await callGemini(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent`, wisdomBody);
      wisdomResult = JSON.parse(cleanJsonString(wisdomData.candidates[0].content.parts[0].text));
    } catch (e) {
      console.warn("Fallback used:", e);
    }

    setResult(wisdomResult);

    // 圖片生成 (非阻塞)
    try {
      const imageBody = {
        instances: { prompt: `${STYLE_ANCHOR}, ${wisdomResult.image_prompt}` },
        parameters: { sampleCount: 1 }
      };
      const imageData = await callGemini(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_IMAGE}:predict`, imageBody);
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

    const voices = window.speechSynthesis.getVoices();
    const bestVoice = voices.find(v => v.lang.includes('zh-TW') && v.name.includes('Google')) ||
      voices.find(v => v.lang.includes('zh-TW')) ||
      voices.find(v => v.lang.includes('zh'));
    if (bestVoice) utterance.voice = bestVoice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    audioSourceRef.current = utterance;
  };

  const generatePrayer = async () => {
    if (!result) return;
    setIsPrayerLoading(true);
    try {
      let promptText;
      if (mode === 'truth') {
        promptText = `針對這個核心問題：「${result.first_question}」和根本原因：「${result.root_cause}」，請寫一段約 100 字的「哲學反思」，語氣冷靜、銳利，引導人面對真相。`;
      } else {
        promptText = `經文:${result.verse}。請寫一段約 150 字的溫柔禱告。`;
      }

      const prayerBody = {
        contents: [{ parts: [{ text: promptText }] }],
      };
      const data = await callGemini(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent`, prayerBody);
      setPrayer(data.candidates[0].content.parts[0].text);
    } catch (e) {
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

        const verseMaxWidth = canvas.width - 160;
        ctx.font = 'bold 42px serif';
        const verseLines = wrapText(ctx, `「${result.verse}」`, verseMaxWidth);
        const lineHeight = 54;
        let startY = canvas.height - 180 - verseLines.length * lineHeight - 70;
        if (startY < 200) startY = 200;

        ctx.fillStyle = '#ffffff';
        verseLines.forEach(line => {
          ctx.fillText(line, canvas.width / 2, startY);
          startY += lineHeight;
        });

        ctx.fillStyle = '#d4d4d8';
        ctx.font = '26px serif';
        ctx.fillText(`— ${result.reference}`, canvas.width / 2, startY + 30);

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
      const blessingText = `【光之聖所】\n\n${result.part1}\n\n${result.part2}\n\n✨ https://godloves.pages.dev`;

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
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 animate-in fade-in duration-1000">

      {/* 頂部品牌 */}
      <div className="absolute top-8 left-0 right-0 flex justify-center items-center gap-3 opacity-60">
        <Sun className="w-4 h-4 text-amber-500/60" />
        <span className="text-[10px] tracking-[0.4em] uppercase text-white/60 font-light">Sanctuary Ethereal</span>
      </div>

      {/* 音效控制 */}
      <button
        onClick={toggleSound}
        className="absolute top-8 right-8 p-3 text-stone-600 hover:text-amber-500 transition-colors"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-500" />}
      </button>
      {/* 恩典日記入口 */}
      {history.length > 0 && (
        <button
          onClick={() => setShowHistory(true)}
          className="absolute top-8 left-8 p-3 text-stone-600 hover:text-amber-500 transition-colors"
        >
          <BookOpen className="w-5 h-5" />
        </button>
      )}

      {/* 背景：神聖之光 (Divine Light) */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150vw] h-[80vh] bg-gradient-radial from-amber-600/10 via-amber-900/5 to-transparent blur-3xl pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />

      {/* 頂部品牌 */}
      <div className="absolute top-8 left-0 right-0 flex justify-center items-center gap-3 opacity-60 z-20">
        <Sun className="w-4 h-4 text-amber-500/60 animate-[spin_12s_linear_infinite]" />
        <span className="text-[10px] tracking-[0.4em] uppercase text-white/60 font-light">Sanctuary Ethereal</span>
      </div>

      {/* 音效控制 */}
      <button
        onClick={toggleSound}
        className="absolute top-8 right-8 p-3 text-stone-600 hover:text-amber-500 transition-colors"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-500" />}
      </button>

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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-in zoom-in-95 duration-700">

      {/* 返回按鈕 */}
      <button
        onClick={() => { setViewState('idle'); setUserStory(''); setCharCount(0); }}
        className="absolute top-8 left-8 text-stone-600 hover:text-white transition-colors p-2"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

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

        {/* 頂部導航 */}
        <div className="w-full max-w-3xl flex justify-between items-center mb-20">
          <button
            onClick={() => { setViewState('idle'); setUserStory(''); setCharCount(0); }}
            className="text-white/50 hover:text-white transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-light">Sanctuary</span>
          <button onClick={toggleSound} className="text-white/50 hover:text-amber-500 transition-colors p-2">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-500" />}
          </button>
        </div>

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

          {/* 三段式文字：像詩集 (Grace Mode ONLY) */}
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

            <button
              onClick={generatePrayer}
              disabled={isPrayerLoading}
              className="flex flex-col items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-stone-500 hover:text-white transition-all disabled:opacity-50"
            >
              <div className="p-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                {isPrayerLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
              </div>
              禱告
            </button>

            <button
              onClick={handleDownload}
              className="flex flex-col items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-stone-500 hover:text-white transition-all"
            >
              <div className="p-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                <Download className="w-5 h-5" />
              </div>
              收藏
            </button>

            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-stone-500 hover:text-white transition-all"
            >
              <div className="p-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                <Share2 className="w-5 h-5" />
              </div>
              分享
            </button>
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
