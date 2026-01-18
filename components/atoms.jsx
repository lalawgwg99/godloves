// 0x02 Atomic Typography & Interaction Primitives
const { ArrowRight, RefreshCw, X, Share2, Sparkles, Volume2, Mic, Hammer, Feather } = window.LucideReact || {};

/**
 * 📖 TheWord: 神諭 (Serif / Bold)
 * Used for Verse and Headlines.
 */
const TheWord = ({ children, className = "", size = "xl" }) => {
    const sizeClasses = {
        sm: "text-lg md:text-xl",
        md: "text-xl md:text-2xl",
        lg: "text-2xl md:text-4xl",
        xl: "text-3xl md:text-5xl"
    };
    return (
        <h2 className={`font-serif font-bold text-white leading-tight ${sizeClasses[size]} ${className}`}>
            {children}
        </h2>
    );
};

/**
 * 🤫 TheWhisper: 微聲 (Serif / Italic / Soft)
 * Used for subtitles and reflections.
 */
const TheWhisper = ({ children, className = "" }) => (
    <p className={`font-serif italic text-stone-400 opacity-80 ${className}`}>
        {children}
    </p>
);

/**
 * 📟 TheLogic: 邏輯 (Mono / Uppercase)
 * Used for Truth Mode labels and metadata.
 */
const TheLogic = ({ children, className = "" }) => (
    <div className={`font-mono text-[10px] uppercase tracking-[0.3em] opacity-60 ${className}`}>
        {children}
    </div>
);

/**
 * 🔘 GhostButton: 幽靈按鈕 (Border / Minimal)
 */
const GhostButton = ({ onClick, icon: Icon, label, className = "" }) => (
    <button
        onClick={onClick}
        className={`group flex flex-col items-center gap-2 text-stone-500 hover:text-white transition-colors ${className}`}
    >
        <div className="p-3 md:p-4 rounded-full border border-white/10 group-hover:border-white/30 transition-all bg-black/20 backdrop-blur-sm">
            {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6" />}
        </div>
        {label && <span className="text-[9px] uppercase tracking-widest opacity-60">{label}</span>}
    </button>
);

/**
 * ✨ MainAction: 主要行動 (Glow / Solid)
 */
/**
 * ✨ RitualHoldButton: 儀式蓄力按鈕 (Long Press / Charge)
 * Replaces MainAction with a hold-to-confirm mechanism.
 */
const RitualHoldButton = ({ onComplete, children, className = "", mode = 'grace' }) => {
    const [progress, setProgress] = React.useState(0);
    const [isHolding, setIsHolding] = React.useState(false);
    const intervalRef = React.useRef(null);
    const DURATION = 2.500; // 2.5 seconds

    const startCharge = () => {
        setIsHolding(true);
        let startTime = Date.now();

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const p = Math.min((elapsed / DURATION) * 100, 100);
            setProgress(p);

            if (p >= 100) {
                clearInterval(intervalRef.current);
                setIsHolding(false);
                if (onComplete) onComplete();
            }
        }, 16);
    };

    const cancelCharge = () => {
        setIsHolding(false);
        setProgress(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const colorClass = mode === 'truth' ? "cyan" : "amber";
    // Tailwind dynamic colors need full strings to be safe, but here we use style or specific mapping
    const strokeColor = mode === 'truth' ? "#06b6d4" : "#f59e0b";

    return (
        <div className="relative group touch-none select-none w-max">
            {/* 修正：居中定位 wrapper */}

            {/* 蓄力光環 (SVG Ring) */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none scale-150 opacity-0 group-active:opacity-100 transition-opacity duration-300" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="300" strokeDashoffset={300 - (progress * 3)} className="transition-all duration-75 ease-linear" strokeLinecap="round" />
            </svg>

            <button
                onMouseDown={startCharge}
                onMouseUp={cancelCharge}
                onMouseLeave={cancelCharge}
                onTouchStart={startCharge}
                onTouchEnd={cancelCharge}
                className={`
                    relative px-10 py-4 rounded-full border border-white/10 backdrop-blur-md 
                    transition-all duration-300 active:scale-95
                    ${mode === 'truth' ? 'bg-cyan-900/20 text-cyan-50' : 'bg-amber-900/20 text-amber-50'}
                    ${isHolding ? 'animate-[pulse_0.2s_ease-in-out_infinite]' : ''}
                    ${className}
                `}
            >
                <span className={`tracking-[0.2em] font-serif ${isHolding ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
                    {isHolding ? 'HOLDING...' : children}
                </span>
            </button>
        </div>
    );
};

// Export to global scope for non-build environment
window.TheWord = TheWord;
window.TheWhisper = TheWhisper;
window.TheLogic = TheLogic;
window.GhostButton = GhostButton;
window.MainAction = RitualHoldButton; // Expose as MainAction to keep compatibility but upgrade logic
window.RitualHoldButton = RitualHoldButton;
