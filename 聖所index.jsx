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
  Wind
} = window.LucideReact;

/* ================= 全域配置 ================= */
// API 呼叫透過 Cloudflare Pages Function 代理,API Key 安全地儲存在伺服器端
const MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";
const MODEL_IMAGE = "imagen-4.0-generate-001";
const MODEL_TTS = "gemini-2.5-flash-preview-tts";


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

const SanctuaryPro = () => {
  // --- 狀態管理 ---
  const [userStory, setUserStory] = useState('');
  const [selectedMood, setSelectedMood] = useState('關於平安：當心靈感到沉重時');
  const [charCount, setCharCount] = useState(0);

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
    setStatus('正在為您尋求那光中的應許...');
    stopAudio();

    let wisdomResult = FALLBACK_BLESSING;
    let apiError = false;

    try {
      // 1. 構建 Prompt (加入安全護欄)
      const safetyGuardrail = "若使用者的故事涉及極端絕望、自我傷害或過度負面情緒,請務必以『純粹的陪伴與安慰』為主,嚴禁給予具體建議、批判或說教。語氣需如慈父般溫柔。";
      const wisdomPrompt = `使用者狀態:${selectedMood}。${userStory ? `心事:${userStory}` : ''}`;

      const wisdomBody = {
        contents: [{ parts: [{ text: wisdomPrompt }] }],
        systemInstruction: {
          parts: [{ text: `你是一位慈愛、溫柔、安定人心的聲音。${safetyGuardrail}\n請輸出 JSON,包含: verse, reference, part1, part2, part3, image_prompt` }]
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

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
  };

  // --- 音訊管理邏輯 ---
  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) { }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playSoulVoice = async () => {
    if (!result) return;
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsPlaying(true);
    try {
      // 🔥 關鍵優化：TTS 提示詞工程 🔥
      // 我們不只傳送文字，還傳送了「語氣指導」(Emotional Prompting)
      const ttsPrompt = `Speak with a very slow, gentle, and extremely loving voice, like a compassionate parent comforting a child. Use a soft tone, full of warmth and reassurance. The text is: ${result.part1} ${result.part2}`;

      const ttsBody = {
        contents: [{ parts: [{ text: ttsPrompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              // Charon 聲音低沉，適合父親形象，配合上面的 prompt 會變得非常溫柔
              // 若希望是女性聲音，可改為 "Aoede"
              prebuiltVoiceConfig: { voiceName: "Charon" }
            }
          }
        }
      };

      const data = await callGemini(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TTS}:generateContent`, ttsBody);
      const pcmData = data.candidates[0].content.parts[0].inlineData.data;
      const mimeType = data.candidates[0].content.parts[0].inlineData.mimeType;
      const sampleRate = parseInt(mimeType.split('rate=')[1]) || 24000;

      // PCM 解碼與播放
      const binaryString = window.atob(pcmData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768.0;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const buffer = audioContextRef.current.createBuffer(1, float32.length, sampleRate);
      buffer.getChannelData(0).set(float32);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => setIsPlaying(false);
      source.start();
      audioSourceRef.current = source;

    } catch (e) {
      console.error("TTS Failed", e);
      setIsPlaying(false);
      alert("語音連結暫時中斷，請稍後再試。");
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
          <div className="text-[10px] font-bold text-stone-500 tracking-[0.2em] border border-white/10 px-3 py-1 rounded-full uppercase">
            Sanctuary Pro
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
                  </optgroup>
                  <optgroup label="情感支持" className="bg-stone-900">
                    <option>關於安慰：當感到孤單需要擁抱時</option>
                    <option>關於勇氣：當感到無力與恐懼時</option>
                    <option>關於饒恕：需要放下與和解時</option>
                  </optgroup>
                  <optgroup label="生活智慧" className="bg-stone-900">
                    <option>關於重擔：當責任壓得喘不過氣時</option>
                    <option>關於感恩：想在平淡中發現恩典時</option>
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

                {/* 經文展示 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center text-white z-20">
                  <p className="font-serif text-2xl md:text-4xl font-black mb-8 leading-relaxed drop-shadow-[0_4px_10px_rgba(0,0,0,1)] text-balance">
                    「{result.verse}」
                  </p>
                  <div className="w-16 h-[1px] bg-amber-500/60 mb-6 shadow-[0_0_15px_rgba(226,179,133,0.8)]"></div>
                  <div className="px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
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
                    {result.part1}
                  </p>
                </section>

                <section className="space-y-4">
                  <h4 className="font-serif text-amber-500 text-lg font-bold flex items-center gap-3">
                    愛的回應 <div className="h-px flex-1 bg-white/10" />
                  </h4>
                  <p className="text-stone-400 font-light leading-loose italic pl-6 border-l border-amber-500/20 text-lg font-serif">
                    {result.part2}
                  </p>
                </section>

                <section className="space-y-4">
                  <h4 className="font-serif text-amber-500 text-lg font-bold flex items-center gap-3">
                    與我同行 <div className="h-px flex-1 bg-white/10" />
                  </h4>
                  <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5">
                    <p className="text-stone-300 font-light leading-loose text-lg font-serif">
                      {result.part3}
                    </p>
                  </div>
                </section>

                {/* 功能按鈕區 */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={playSoulVoice}
                    className={`px-8 py-4 rounded-3xl font-bold text-sm flex items-center gap-3 transition-all ${isPlaying ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 text-amber-500 hover:bg-white/10 border border-amber-500/20'}`}
                  >
                    {isPlaying ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    {isPlaying ? '停止播放' : '聆聽應許'}
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
                    <p className="text-stone-300 font-light leading-loose font-serif text-center italic">「{prayer}」</p>
                  </div>
                )}

                {/* 溫柔的下一步 */}
                <div className="mt-16 pt-10 border-t border-white/5 text-center space-y-8">
                  <p className="text-stone-500 text-xs tracking-[0.2em] font-light">今天就到這裡也很好，願你帶著這份光走一小段路。</p>
                  <div className="flex justify-center gap-4">
                    <button className="bg-[#06C755] text-white px-8 py-4 rounded-full font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-lg shadow-green-900/20 transition-all">
                      <Share2 className="w-4 h-4" /> 分享平安
                    </button>
                    <button className="bg-white/5 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/10 border border-white/10 transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </article>
        )}
      </main>

      <footer className="mt-24 border-t border-white/5 py-16 px-8 text-center">
        <p className="text-[10px] tracking-[0.5em] font-black uppercase text-stone-700 mb-4">Sanctuary Production v2.0</p>
      </footer>
    </div>
  );
};

// 掛載 React 組件到 DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(SanctuaryPro));
