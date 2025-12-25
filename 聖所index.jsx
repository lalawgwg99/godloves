// 使用瀏覽器全域變數 (從 CDN 載入)
const React = window.React;
const { useState, useRef, useEffect } = React;
const {
  Sparkles,
  Volume2,
  StopCircle,
  Download,
  Share2,
  ChevronDown,
  Heart,
  Mic2,
  Loader2,
  Wind,
  History,
  BookOpen,

  VolumeX,
  Plus,
  Share
} = window.LucideReact;

/* ================= 全域配置 ================= */
// API 呼叫透過 Cloudflare Pages Function 代理,API Key 安全地儲存在伺服器端
const MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";
const MODEL_IMAGE = "imagen-4.0-generate-001";
const MODEL_TTS = "gemini-2.0-flash-exp"; // 只有 2.0 系列支援 TTS


// 🎨 風格錨點：確保視覺輸出的一致性與高級感
const STYLE_ANCHOR = "style: soft sacred minimalism, chiaroscuro lighting, contemplative silence, fine art photography, ethereal glow, high resolution, cinematic composition, 8k";

// 🛡️ 恩典資料庫 (Fallback Database)：當 API 失敗時的安全網
const FALLBACK_BLESSING = {
  verse: "你不要害怕，因為我與你同在；不要驚惶，因為我是你的神。",
  reference: "以賽亞書 41:10",
  part1: "孩子，我看見你此刻的重量。就算你說不出口，我仍然知道你正在努力撐著。你不是被忽略的，你的疲憊在我眼中是真實的。",
  part2: "你不需要現在就變得堅強。你能夠停下來，被我抱著，這本身就是被允許的。放下那些不屬於你的重擔吧。",
  part3: "今天，請為自己預留五分鐘，深深呼吸，讓心慢慢安靜下來，領受這份無條件的平安。",
  image_prompt: "soft sacred minimalism, warm dawn light, quiet sky, gentle horizon, cinematic lighting"
};

// --- Custom Boolean Hook for Audio ---
const useAmbientSound = () => {
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const audioRef = useRef(null); // 用來存取 HTML5 Audio Element

  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;

      // 建立 GainNode 控制音量 (淡入淡出)
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0; // 初始靜音
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // 載入自定義音效 (User Provided)
      const audioElement = new Audio('療癒 Healing 3.mp3');
      audioElement.loop = true;
      audioElement.crossOrigin = "anonymous";
      audioRef.current = audioElement;

      // 將 Audio Element 串接到 Web Audio API
      const track = ctx.createMediaElementSource(audioElement);
      track.connect(masterGain);

      // 播放 (但音量是 0)
      audioElement.play().catch(e => console.warn("Auto-play blocked:", e));

      // 開始淡入
      const now = ctx.currentTime;
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(1, now + 5); // 5秒淡入
      setIsMuted(false);

    } catch (e) {
      console.warn("Audio Context init failed", e);
    }
  };

  const toggleSound = () => {
    if (!audioCtxRef.current) {
      initAudio();
      return;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const ctx = audioCtxRef.current;
    const gainNode = gainNodeRef.current;
    const now = ctx.currentTime;

    if (isMuted) {
      // 淡入
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(1, now + 3);
      setIsMuted(false);
      // 確保有在轉
      if (audioRef.current && audioRef.current.paused) audioRef.current.play();
    } else {
      // 淡出
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 2);
      setIsMuted(true);
    }
  };

  return { isMuted, toggleSound, initAudio };
};

// --- Component: 打字機效果 (Robust Implementation) ---
const TypewriterText = ({ text, speed = 30, className, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // 立即重置，避免殘留
    setDisplayedText('');

    if (!text) return;

    let localIndex = 0;
    const timer = setInterval(() => {
      // 使用 substring 確保絕對正確的字串切片
      // 避免依賴 previous state (可能會有 race condition)
      if (localIndex < text.length) {
        setDisplayedText(text.substring(0, localIndex + 1));
        localIndex++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);

    // Cleanup: 清除 interval
    return () => clearInterval(timer);
  }, [text, speed]); // 依賴項變更時，effect 會重跑

  return <span className={className}>{displayedText}</span>;
};

// --- Component: 加入主畫面引導 ---
const InstallPrompt = () => {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 簡單判斷：如果是手機且尚未安裝 (簡易邏輯)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isMobile && !isStandalone) {
      // 延遲顯示，不要一進來就擋住
      setTimeout(() => setShow(true), 3000);
      setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-700">
      <div className="bg-[#1c1917]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">

        {/* 關閉按鈕 */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 p-2 text-stone-500 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4 rotate-45" />
        </button>

        <div className="flex items-start gap-4 pr-6">
          {/* Icon Preview */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-800 to-black flex items-center justify-center border border-white/10 shadow-lg shrink-0">
            <div className="w-6 h-6 text-amber-500">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-amber-500 font-bold text-sm tracking-wide">加入主畫面</h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              {isIOS ? (
                <>點擊下方瀏覽器選單 <Share className="w-3 h-3 inline mx-1" /> 並選擇「加入主畫面」，獲得完整的聖所體驗。</>
              ) : (
                <>點擊瀏覽器選單並選擇「安裝應用程式」或「加入主畫面」。</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SanctuaryPro = () => {
  // --- 狀態管理 ---
  const [userStory, setUserStory] = useState('');
  const [selectedMood, setSelectedMood] = useState('關於平安：當心靈感到沉重時');
  const [charCount, setCharCount] = useState(0);
  const [history, setHistory] = useState([]); // 歷史紀錄
  const [showHistory, setShowHistory] = useState(false);

  // 音效
  const { isMuted, toggleSound, initAudio } = useAmbientSound();

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const [prayer, setPrayer] = useState('');
  const [isPrayerLoading, setIsPrayerLoading] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);

  const resultRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);

  // --- 新增: 音訊載入狀態 ---
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // --- 新增: 打字機依序顯示控制 ---
  const [showPart2, setShowPart2] = useState(false);
  const [showPart3, setShowPart3] = useState(false);

  // --- 初始化：讀取歷史與自動播放音效提示 ---
  useEffect(() => {
    const saved = localStorage.getItem('sanctuary_journal');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { }
    }

    // 全域點擊一次就初始化音效引擎 (解決瀏覽器限制，但不一定馬上播放)
    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  // --- 歷史紀錄存檔 ---
  const saveToHistory = (newEntry) => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      ...newEntry
    };
    const newHistory = [entry, ...history].slice(0, 10); // 只留最近10筆
    setHistory(newHistory);
    localStorage.setItem('sanctuary_journal', JSON.stringify(newHistory));
  };

  const loadFromHistory = (entry) => {
    setResult({
      verse: entry.verse,
      reference: entry.reference,
      part1: entry.part1,
      part2: entry.part2,
      part3: entry.part3,
      image_prompt: entry.image_prompt
    });
    setPrayer('');
    setImageUrl(''); // 歷史紀錄不存圖片 Base64 以免爆掉，需重新生成或留空
    // 如果想要，可以只存 prompt 然後重新生成，或是只顯示文字
    setStatus('已載入回憶');
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    setShowHistory(false);
  };

  // --- 工具函式：JSON 清洗 ---
  const cleanJsonString = (str) => {
    if (!str) return "{}";
    return str.replace(/```json\n?|```/g, "").trim();
  };

  // --- 工具函式：輸入控制 ---
  const handleStoryChange = (e) => {
    const text = e.target.value;
    if (text.length <= 600) {
      setUserStory(text);
      setCharCount(text.length);
    }
  };

  // --- 工具函式:API 呼叫 (透過 Cloudflare Pages Function 代理) ---
  const callGemini = async (url, body, retries = 3) => {
    const delays = [1000, 2000, 4000];
    for (let i = 0; i < retries; i++) {
      try {
        // 使用 Cloudflare Pages Function 作為代理
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, body })
        });

        if (!res.ok) {
          if (res.status >= 500 || res.status === 429) throw new Error(`Server Busy ${res.status}`);
          const errData = await res.json();
          throw new Error(errData.error?.message || `HTTP Error ${res.status}`);
        }
        return await res.json();
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, delays[i]));
      }
    }
  };

  // --- 核心邏輯：靜心傾聽 (Main Flow) ---
  const handleListen = async () => {

    // 重置狀態
    setIsLoading(true);
    setResult(null);
    setPrayer('');
    setImageUrl('');
    setImageLoaded(false);
    setShowPart2(false); // 重置打字機狀態
    setShowPart3(false);
    setStatus('正在為您尋求那光中的應許...');
    stopAudio();

    let wisdomResult = FALLBACK_BLESSING;
    let apiError = false;

    try {
      // 1. 構建 Prompt (加入安全護欄 + 避免重複)
      const safetyGuardrail = "若使用者的故事涉及極端絕望、自我傷害或過度負面情緒,請務必以『純粹的陪伴與安慰』為主,嚴禁給予具體建議、批判或說教。語氣需如慈父般溫柔。";
      const diversityHint = "聖經內容豐富，請每次選擇不同的經文，避免重複使用相同章節。可從詩篇、箴言、以賽亞書、約翰福音、羅馬書等不同書卷中選擇。";
      const wisdomPrompt = `使用者狀態:${selectedMood}。${userStory ? `心事:${userStory}` : ''}。時間戳:${Date.now()}`;

      const wisdomBody = {
        contents: [{ parts: [{ text: wisdomPrompt }] }],
        systemInstruction: {
          parts: [{ text: `你是一位慈愛、溫柔、安定人心的聲音。${safetyGuardrail}\n${diversityHint}\n請輸出 JSON,包含: verse, reference, part1, part2, part3, image_prompt` }]
        },
        generationConfig: { responseMimeType: "application/json" }
      };

      // 2. 呼叫文字模型
      const wisdomData = await callGemini(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent`, wisdomBody);
      const rawText = wisdomData.candidates[0].content.parts[0].text;
      wisdomResult = JSON.parse(cleanJsonString(rawText));

    } catch (e) {
      console.error("Text API failed:", e);
      apiError = true;
      wisdomResult = FALLBACK_BLESSING;

      // 友善的錯誤提示
      if (e.message.includes('API key')) {
        setStatus('API Key 無效,已使用備用內容');
      } else if (e.message.includes('429')) {
        setStatus('請求過於頻繁,已使用備用內容');
      } else {
        setStatus('連線暫時中斷,已使用備用內容');
      }
    }

    setResult(wisdomResult);

    // 3. 呼叫圖片模型 (非阻塞,失敗不影響文字)
    if (!apiError) {
      setStatus('正在繪製專屬意境...');
      try {
        const imageBody = {
          instances: { prompt: `${STYLE_ANCHOR}, ${wisdomResult.image_prompt}` },
          parameters: { sampleCount: 1 }
        };
        const imageData = await callGemini(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_IMAGE}:predict`, imageBody);
        setImageUrl(`data:image/png;base64,${imageData.predictions[0].bytesBase64Encoded}`);
      } catch (imgError) {
        console.warn("Image API failed:", imgError);
      }
    }

    setStatus(apiError ? '已完成 (使用備用內容)' : '完成');
    setIsLoading(false);

    // 存入歷史
    if (wisdomResult && wisdomResult.verse) {
      saveToHistory(wisdomResult);
    }

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
  };

  // --- 音訊管理邏輯 ---
  const stopAudio = () => {
    // 停止 Web Speech API
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // 停止其他音訊
    if (audioSourceRef.current) {
      try {
        if (audioSourceRef.current instanceof Audio) {
          audioSourceRef.current.pause();
          audioSourceRef.current.currentTime = 0;
        } else if (typeof audioSourceRef.current.stop === 'function') {
          audioSourceRef.current.stop();
        }
      } catch (e) { }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playSoulVoice = () => {
    if (!result) return;
    if (isPlaying) {
      stopAudio();
      return;
    }

    // 🎯 使用瀏覽器內建 Web Speech API（穩定且無需 API Key）
    if (!window.speechSynthesis) {
      alert('您的瀏覽器不支援語音合成功能');
      return;
    }

    setIsPlaying(true);
    setIsAudioLoading(true);

    // 確保語音列表已載入
    const loadVoices = () => {
      const ttsText = `${result.part1} ${result.part2}`;
      const utterance = new SpeechSynthesisUtterance(ttsText);

      // 語音設定：極致優化讓聲音更接近自然人聲
      utterance.lang = 'zh-TW'; // 繁體中文
      utterance.rate = 0.7; // 語速：非常慢，更有溫度與情感
      utterance.pitch = 0.85; // 音調：較低沉，更沉穩溫暖
      utterance.volume = 1.0; // 音量

      // 🎯 智能選擇最佳語音引擎（優先女聲，更溫柔）
      const voices = window.speechSynthesis.getVoices();

      // 優先順序：Google 女聲 > Microsoft 女聲 > 任何女聲 > 其他高品質語音
      const bestVoice =
        // Google 繁中女聲
        voices.find(v => v.lang.includes('zh-TW') && v.name.includes('Google') && v.name.includes('Female')) ||
        voices.find(v => v.lang.includes('zh-TW') && v.name.includes('Google')) ||
        // Microsoft 繁中女聲
        voices.find(v => v.lang.includes('zh-TW') && v.name.includes('Microsoft') && v.name.includes('Female')) ||
        voices.find(v => v.lang.includes('zh-TW') && v.name.includes('Microsoft')) ||
        // 任何繁中女聲
        voices.find(v => v.lang.includes('zh-TW') && v.name.toLowerCase().includes('female')) ||
        voices.find(v => v.lang.includes('zh-TW')) ||
        // 簡中高品質
        voices.find(v => v.lang.includes('zh-CN') && (v.name.includes('Google') || v.name.includes('Microsoft'))) ||
        voices.find(v => v.lang.includes('zh'));

      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log('✨ 使用語音:', bestVoice.name, `(${bestVoice.lang})`);
      }

      utterance.onstart = () => {
        setIsAudioLoading(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      };

      utterance.onerror = (e) => {
        console.error('TTS Error:', e);
        setIsPlaying(false);
        setIsAudioLoading(false);
        alert('語音播放失敗，請重試');
      };

      window.speechSynthesis.speak(utterance);
      audioSourceRef.current = utterance;
    };

    // 處理語音列表載入（某些瀏覽器需要時間）
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  };

  const generatePrayer = async () => {
    if (!result) return;

    setIsPrayerLoading(true);
    try {
      const prayerBody = {
        contents: [{ parts: [{ text: `經文:${result.verse}。請寫一段約 150 字的溫柔禱告。` }] }],
      };
      const data = await callGemini(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent`, prayerBody);
      setPrayer(data.candidates[0].content.parts[0].text);
    } catch (e) {
      console.error("Prayer generation failed:", e);
      setPrayer("親愛的主,感謝祢此刻的同在。願祢的話語成為我腳前的燈,路上的光。奉主耶穌的名,阿們。");
    } finally {
      setIsPrayerLoading(false);
    }
  };

  // --- 新增功能：分享與下載 ---
  // --- 生成精美卡片圖片 ---
  const generateBlessingCard = async () => {
    if (!result) return null;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 卡片尺寸（適合社交媒體分享）
      canvas.width = 1080;
      canvas.height = 1350;

      // 背景漸層
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1c1917');
      gradient.addColorStop(1, '#0c0a09');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 如果有圖片，繪製背景圖
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
        // 深色遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let y = 80;

        // 標題「光之聖所」
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 52px serif';
        ctx.textAlign = 'center';
        ctx.fillText('光之聖所', canvas.width / 2, y);
        y += 80;

        // 經文
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px serif';
        const verseLines = wrapText(ctx, `「${result.verse}」`, canvas.width - 140, 48);
        verseLines.forEach(line => {
          ctx.fillText(line, canvas.width / 2, y);
          y += 60;
        });

        // 經文出處
        ctx.fillStyle = '#d4d4d8';
        ctx.font = '28px serif';
        ctx.fillText(`— ${result.reference}`, canvas.width / 2, y + 30);
        y += 80;

        // 底部品牌區域（移除 part1 和 part2，卡片只保留經文）
        const bottomY = canvas.height - 80;

        // 分隔線
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(200, bottomY);
        ctx.lineTo(880, bottomY);
        ctx.stroke();

        // 網站連結
        ctx.fillStyle = '#a8a29e';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('godloves.pages.dev', canvas.width / 2, bottomY + 40);

        // 轉換為圖片
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      }

      // 文字換行輔助函式
      function wrapText(context, text, maxWidth, fontSize) {
        const words = text.split('');
        const lines = [];
        let currentLine = '';

        words.forEach(char => {
          const testLine = currentLine + char;
          const metrics = context.measureText(testLine);
          if (metrics.width > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = char;
          } else {
            currentLine = testLine;
          }
        });
        lines.push(currentLine);
        return lines;
      }
    });
  };

  const handleShare = async () => {
    if (!result) return;

    try {
      // 生成卡片圖片
      const cardBlob = await generateBlessingCard();
      const file = new File([cardBlob], 'blessing.png', { type: 'image/png' });

      // 準備完整祝福文字（第二段訊息）
      const blessingText = `【光之聖所】\n\n${result.part1}\n\n${result.part2}\n\n✨ https://godloves.pages.dev`;

      if (navigator.share && navigator.canShare({ files: [file] })) {
        // 先複製文字到剪貼簿
        try {
          await navigator.clipboard.writeText(blessingText);
        } catch (e) {
          console.warn('無法自動複製文字:', e);
        }

        // 分享圖片（不帶文字，讓圖片單獨成為第一則訊息）
        await navigator.share({
          files: [file]
        });

        // 分享完成後提示用戶貼上文字
        setTimeout(() => {
          alert('📷 圖片已分享！\n\n💬 祝福文字已複製到剪貼簿\n請在對話中貼上，即可完成兩則訊息的分享。');
        }, 500);
      } else {
        // Fallback: 下載圖片並複製文字
        const url = URL.createObjectURL(cardBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `光之聖所_${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 複製祝福文字到剪貼簿
        try {
          await navigator.clipboard.writeText(blessingText);
          alert('✅ 卡片已下載\n✅ 祝福文字已複製到剪貼簿\n\n您可以一起分享給朋友。');
        } catch {
          alert('卡片已下載，請手動複製祝福文字分享。');
        }
      }
    } catch (err) {
      console.error('分享失敗:', err);
      alert('分享功能暫時無法使用，請稍後再試。');
    }
  };

  const handleDownload = async () => {
    if (!result) return;

    try {
      const cardBlob = await generateBlessingCard();
      const url = URL.createObjectURL(cardBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `光之聖所_祝福卡片_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('下載失敗:', err);
      alert('下載失敗，請稍後再試。');
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#050506] text-[#f8f8fc] font-sans selection:bg-amber-500/30 overflow-x-hidden relative pb-24">

      {/* 動態環境光背景 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-amber-900/10 blur-[150px] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-stone-900/20 blur-[120px]" style={{ animation: 'pulse 12s ease-in-out infinite reverse' }} />
      </div>

      {/* 導覽列 */}
      <header className="sticky top-0 z-50 bg-[#050506]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500/60" />
            <h1 className="font-light text-xl tracking-[0.4em] uppercase text-white/95">光之聖所</h1>
          </div>
          <div className="text-[10px] font-bold text-stone-500 tracking-[0.2em] border border-white/10 px-3 py-1 rounded-full uppercase flex items-center gap-2">
            Sanctuary Pro
            <button onClick={toggleSound} className="hover:text-amber-500 transition-colors">
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-amber-500" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-12 relative z-10">

        {/* 引導標題 */}
        <section className="mb-12 text-center sm:text-left">
          <h2 className="font-serif text-4xl font-black text-white mb-4 tracking-tight">孩子，您信教嗎？</h2>
          <p className="text-stone-400 font-light leading-relaxed text-lg">
            這裡沒有批判，只有聆聽。<br className="hidden sm:block" />
            將你的重擔寫下，或是單純地領受一份祝福。
          </p>
        </section>

        {/* 互動區塊 (Glass Panel) */}
        <section className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 sm:p-10 mb-16 shadow-2xl transition-all duration-500 hover:shadow-[0_0_50px_rgba(226,179,133,0.05)]">
          <div className="space-y-8">

            {/* 心事輸入框 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                <Mic2 className="w-3 h-3" /> 傾訴你的心事 (可選)
              </label>
              <div className="relative">
                <textarea
                  value={userStory}
                  onChange={handleStoryChange}
                  placeholder="在此寫下你的重擔、迷惘或感恩... 我會聆聽..."
                  className="w-full bg-black/20 border border-white/10 rounded-3xl p-6 text-white font-light text-lg focus:ring-1 focus:ring-amber-500/50 outline-none h-36 transition-all font-serif resize-none placeholder:text-stone-600"
                />
                <div className="absolute bottom-4 right-6 text-[10px] text-stone-600 font-mono tabular-nums">
                  {charCount}/600
                </div>
              </div>
              {charCount >= 580 && (
                <p className="text-amber-500/80 text-xs text-right animate-pulse">這段心事已經很完整了，請放心交託。</p>
              )}
            </div>

            {/* 主題選單 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                此時此刻，我需要...
              </label>
              <div className="relative group">
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-5 text-lg font-light text-stone-200 focus:ring-1 focus:ring-amber-500/50 outline-none appearance-none cursor-pointer hover:bg-white/5 transition-all font-serif"
                >
                  <optgroup label="心靈平靜" className="bg-stone-900">
                    <option>關於平安：當心靈感到沉重時</option>
                    <option>關於指引：當對未來感到迷惘時</option>
                    <option>關於安息：當身心疲憊需要休息時</option>
                  </optgroup>
                  <optgroup label="情感支持" className="bg-stone-900">
                    <option>關於安慰：當感到孤單需要擁抱時</option>
                    <option>關於勇氣：當感到無力與恐懼時</option>
                    <option>關於饒恕：需要放下與和解時</option>
                    <option>關於盼望：在黑暗中尋找光明時</option>
                  </optgroup>
                  <optgroup label="人際關係" className="bg-stone-900">
                    <option>關於愛：學習無條件的愛與接納</option>
                    <option>關於家庭：修復破碎的關係時</option>
                    <option>關於友誼：需要真誠的陪伴時</option>
                  </optgroup>
                  <optgroup label="信心成長" className="bg-stone-900">
                    <option>關於信心：當懷疑與軟弱來襲時</option>
                    <option>關於忍耐：在等候中學習交託時</option>
                    <option>關於謙卑：放下驕傲與掌控時</option>
                  </optgroup>
                  <optgroup label="療癒釋放" className="bg-stone-900">
                    <option>關於醫治：身心靈需要恢復時</option>
                    <option>關於釋放：被過去綑綁需要自由時</option>
                    <option>關於更新：想要重新開始時</option>
                  </optgroup>
                  <optgroup label="生活智慧" className="bg-stone-900">
                    <option>關於重擔：當責任壓得喘不過氣時</option>
                    <option>關於感恩：想在平淡中發現恩典時</option>
                    <option>關於智慧：面對重要抉擇時</option>
                    <option>關於豐盛：突破匱乏思維時</option>
                  </optgroup>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none w-4 h-4 group-hover:text-amber-500 transition-colors" />
              </div>
            </div>

            {/* 主要按鈕 */}
            <button
              onClick={handleListen}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black py-6 rounded-3xl shadow-lg flex justify-center items-center gap-3 transition-all active:scale-95 disabled:opacity-50 tracking-[0.2em] hover:brightness-110 hover:shadow-amber-900/30"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wind className="w-5 h-5" />}
              {isLoading ? '正在靜心尋求...' : '靜心傾聽'}
            </button>
          </div>
        </section>

        {/* 載入狀態 */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center gap-4 text-stone-500 italic animate-pulse">
            <p className="tracking-widest text-xs">{status}</p>
          </div>
        )}

        {/* 結果展示區 */}
        {result && (
          <article ref={resultRef} className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {/* 意境圖卡 */}
            <div className="rounded-[3rem] overflow-hidden shadow-2xl relative bg-stone-950 border border-white/5 group">
              <div className="aspect-[4/5] relative bg-stone-900 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    className={`w-full h-full object-cover transition-opacity duration-1000 ${imageLoaded ? 'opacity-90' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    alt="Sacred Atmosphere"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-stone-800 to-stone-950 flex items-center justify-center">
                    <Sparkles className="text-white/10 w-24 h-24" />
                  </div>
                )}

                {/* 20% 深色遮罩層 + 漸層Scim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-black/20 z-10" />

                {/* 經文展示 - 移到底部避免遮擋圖片美感 */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-10 pb-16 text-center text-white z-20">
                  <p className="font-serif text-2xl md:text-4xl font-black mb-6 leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] text-balance">
                    「{result.verse}」
                  </p>
                  <div className="w-16 h-[1px] bg-amber-500/60 mb-4 shadow-[0_0_15px_rgba(226,179,133,0.8)]"></div>
                  <div className="px-6 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                    <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-90">{result.reference}</p>
                  </div>
                </div>
              </div>

              {/* 解析內容 */}
              <div className="p-10 sm:p-16 bg-[#08080a] space-y-12">
                <section className="space-y-4">
                  <h4 className="font-serif text-amber-500 text-lg font-bold flex items-center gap-3">
                    光中的應許 <div className="h-px flex-1 bg-white/10" />
                  </h4>
                  <p className="text-stone-300 font-light leading-loose text-lg font-serif">
                    <TypewriterText
                      key={result.part1}
                      text={result.part1}
                      speed={30}
                      onComplete={() => setShowPart2(true)}
                    />
                  </p>
                </section>

                {showPart2 && (
                  <section className="space-y-4 animate-in fade-in duration-500">
                    <h4 className="font-serif text-amber-500 text-lg font-bold flex items-center gap-3">
                      愛的回應 <div className="h-px flex-1 bg-white/10" />
                    </h4>
                    <p className="text-stone-400 font-light leading-loose italic pl-6 border-l border-amber-500/20 text-lg font-serif">
                      <TypewriterText
                        key={result.part2}
                        text={result.part2}
                        speed={40}
                        onComplete={() => setShowPart3(true)}
                      />
                    </p>
                  </section>
                )}

                {showPart3 && (
                  <section className="space-y-4 animate-in fade-in duration-500">
                    <h4 className="font-serif text-amber-500 text-lg font-bold flex items-center gap-3">
                      與我同行 <div className="h-px flex-1 bg-white/10" />
                    </h4>
                    <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5">
                      <p className="text-stone-300 font-light leading-loose text-lg font-serif">
                        <TypewriterText key={result.part3} text={result.part3} speed={30} />
                      </p>
                    </div>
                  </section>
                )}

                {/* 功能按鈕區 */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={playSoulVoice}
                    disabled={isAudioLoading}
                    className={`px-8 py-4 rounded-3xl font-bold text-sm flex items-center gap-3 transition-all ${isPlaying ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 text-amber-500 hover:bg-white/10 border border-amber-500/20'} ${isAudioLoading ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {isAudioLoading ? <Loader2 className="animate-spin w-4 h-4" /> : (isPlaying ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />)}
                    {isAudioLoading ? '聲音生成中...' : (isPlaying ? '停止播放' : '聆聽應許')}
                  </button>
                  <button
                    onClick={generatePrayer}
                    disabled={isPrayerLoading}
                    className="bg-white/5 text-stone-200 px-8 py-4 rounded-3xl font-bold text-sm flex items-center gap-3 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
                  >
                    {isPrayerLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Heart className="w-4 h-4" />}
                    編織禱告
                  </button>
                </div>

                {/* 禱告生成結果 */}
                {prayer && (
                  <div className="p-8 bg-amber-900/10 rounded-3xl border border-amber-500/10 animate-in zoom-in duration-500">
                    <h5 className="font-serif text-amber-600 font-bold mb-4 text-center text-xs tracking-widest uppercase">專屬禱告</h5>
                    <p className="text-stone-300 font-light leading-loose font-serif text-center italic">
                      「<TypewriterText key={prayer} text={prayer} speed={30} />」
                    </p>
                  </div>
                )}

                {/* 溫柔的下一步 */}
                <div className="mt-16 pt-10 border-t border-white/5 text-center space-y-8">
                  <p className="text-stone-500 text-xs tracking-[0.2em] font-light">今天就到這裡也很好，願你帶著這份光走一小段路。</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleShare}
                      className="bg-[#06C755] text-white px-8 py-4 rounded-full font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-lg shadow-green-900/20 transition-all">
                      <Share2 className="w-4 h-4" /> 分享祝福卡片
                    </button>
                    <button
                      onClick={handleDownload}
                      className="bg-amber-600 text-white px-8 py-4 rounded-full font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-lg shadow-amber-900/20 transition-all">
                      <Download className="w-4 h-4" /> 下載卡片
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </article>
        )}
        {/* 恩典日記 (History) */}
      </main>

      {/* 恩典日記 (History) */}
      {history.length > 0 && (
        <section className="max-w-2xl mx-auto px-6 mt-16">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-stone-500 text-xs tracking-widest uppercase hover:text-amber-500 transition-colors mb-6 mx-auto"
          >
            <BookOpen className="w-4 h-4" />
            {showHistory ? '隱藏恩典日記' : '開啟恩典日記'}
          </button>

          {showHistory && (
            <div className="grid gap-4 animate-in fade-in duration-500">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => loadFromHistory(entry)}
                  className="bg-white/5 border border-white/5 rounded-2xl p-6 cursor-pointer hover:bg-white/10 hover:border-amber-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-amber-500/80 font-serif font-bold">{entry.reference}</span>
                    <span className="text-[10px] text-stone-600">{entry.date}</span>
                  </div>
                  <p className="text-stone-400 text-sm line-clamp-2 group-hover:text-stone-200 transition-colors">{entry.verse}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )
      }

      <footer className="mt-24 border-t border-white/5 py-16 px-8 text-center">
        <p className="text-[10px] tracking-[0.5em] font-black uppercase text-stone-700 mb-4">Sanctuary Production v2.0</p>
        <p className="text-[10px] tracking-[0.2em] text-stone-500 font-serif opacity-60 hover:opacity-100 transition-opacity">designed by 德</p>
      </footer>
      <InstallPrompt />
    </div>
  );
};

// 掛載 React 組件到 DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(SanctuaryPro));
