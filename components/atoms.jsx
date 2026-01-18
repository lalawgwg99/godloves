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
const MainAction = ({ onClick, children, className = "", mode = 'grace' }) => {
    const bgClass = mode === 'truth'
        ? "bg-cyan-900/20 hover:bg-cyan-800/30 border-cyan-500/30 text-cyan-100"
        : "bg-amber-900/20 hover:bg-amber-800/30 border-amber-500/30 text-amber-100";

    return (
        <button
            onClick={onClick}
            className={`px-8 py-3 rounded-full border backdrop-blur-md transition-all duration-500 ${bgClass} ${className}`}
        >
            {children}
        </button>
    );
};

// Export to global scope for non-build environment
window.TheWord = TheWord;
window.TheWhisper = TheWhisper;
window.TheLogic = TheLogic;
window.GhostButton = GhostButton;
window.MainAction = MainAction;
