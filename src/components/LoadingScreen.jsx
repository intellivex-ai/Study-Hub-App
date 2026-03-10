import { useState, useEffect, useRef } from "react";

const tips = [
    "Reviewing yesterday's notes boosts retention by 60%",
    "The Pomodoro technique improves focus in 25-min blocks",
    "Spaced repetition is the most effective way to memorize",
    "Teaching what you learn helps you retain it 4x better",
    "Your brain consolidates memory during sleep — rest well",
];

const makeParticles = () => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.5) % 100}%`,
    bottom: `${(i * 7) % 30}%`,
    duration: `${4 + (i % 6)}s`,
    delay: `${(i * 0.3) % 5}s`,
    color: ["#2563eb", "#7c3aed", "#0ea5e9", "#06b6d4"][i % 4],
    size: `${2 + (i % 3)}px`,
}));

function LoadingScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [dotCount, setDotCount] = useState(1);
    const [fadeOut, setFadeOut] = useState(false);
    const [particles] = useState(makeParticles);
    const doneRef = useRef(false);
    const tipIndex = useRef(0).current;

    useEffect(() => {
        doneRef.current = false;
        setProgress(0);
        setFadeOut(false);

        const dotTimer = setInterval(() => setDotCount((d) => (d % 3) + 1), 400);
        const duration = 2800, interval = 30, steps = duration / interval;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            const t = step / steps;
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            setProgress(Math.min(Math.round(eased * 100), 100));
            if (step >= steps) {
                clearInterval(timer);
                clearInterval(dotTimer);
                setProgress(100);
                doneRef.current = true;
                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(() => onComplete?.(), 500);
                }, 400);
            }
        }, interval);

        return () => { clearInterval(timer); clearInterval(dotTimer); };
    }, [onComplete]);

    return (
        <div style={{
            position: "fixed", inset: 0, background: "#0f172a",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden",
            transition: "opacity .5s ease, transform .5s ease",
            opacity: fadeOut ? 0 : 1,
            transform: fadeOut ? "scale(1.04)" : "scale(1)",
        }}>
            {/* Orbs */}
            {[
                { w: 420, h: 420, bg: "#2563eb", top: -120, left: -100, delay: 0 },
                { w: 340, h: 340, bg: "#7c3aed", bottom: -80, right: -60, delay: 1.5 },
                { w: 200, h: 200, bg: "#0ea5e9", top: "45%", left: "55%", delay: 0.8 },
            ].map((o, i) => (
                <div key={i} style={{
                    position: "absolute", borderRadius: "50%",
                    width: o.w, height: o.h, background: o.bg,
                    top: o.top, left: o.left, bottom: o.bottom, right: o.right,
                    filter: "blur(80px)", opacity: 0.18,
                    animation: `pulse-orb 4s ${o.delay}s ease-in-out infinite alternate`,
                }} />
            ))}

            {/* Grid */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
                backgroundSize: "48px 48px",
            }} />

            {/* Particles */}
            {particles.map((p) => (
                <div key={p.id} style={{
                    position: "absolute", borderRadius: "50%",
                    left: p.left, bottom: p.bottom,
                    width: p.size, height: p.size,
                    background: p.color,
                    animation: `floatUp ${p.duration} ${p.delay} linear infinite`,
                    opacity: 0,
                }} />
            ))}

            {/* Card */}
            <div style={{
                position: "relative", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 28, width: 320,
                animation: "cardIn .7s cubic-bezier(.34,1.56,.64,1) both",
            }}>
                {/* Logo */}
                <div style={{ position: "relative", width: 88, height: 88, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#2563eb", borderRightColor: "#7c3aed", animation: "spin 1.2s linear infinite" }} />
                    <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "1.5px solid transparent", borderBottomColor: "rgba(37,99,235,.5)", animation: "spin 2s linear infinite reverse" }} />
                    <div style={{
                        width: 62, height: 62,
                        background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
                        borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 24px rgba(37,99,235,.5)",
                        animation: "logoGlow 2s ease-in-out infinite alternate",
                    }}>
                        <span style={{ fontSize: 28, animation: "bookBounce 1.5s ease-in-out infinite" }}>📚</span>
                    </div>
                </div>

                {/* Brand */}
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        fontSize: 26, fontWeight: 700, letterSpacing: "-.5px",
                        background: "linear-gradient(135deg,#fff 40%,#93c5fd)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>StudyHub</div>
                    <div style={{ fontSize: 12, fontWeight: 300, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>
                        Your learning, elevated
                    </div>
                </div>

                {/* Progress */}
                <div style={{ width: "100%" }}>
                    <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,.07)", borderRadius: 999, overflow: "hidden", position: "relative" }}>
                        <div style={{
                            height: "100%", width: `${progress}%`,
                            background: "linear-gradient(90deg,#2563eb,#7c3aed,#0ea5e9)",
                            backgroundSize: "200% 100%",
                            borderRadius: 999,
                            transition: "width .05s linear",
                            animation: "shimmer 1.5s linear infinite",
                            position: "relative",
                        }}>
                            {progress > 2 && (
                                <div style={{
                                    position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
                                    width: 8, height: 8, borderRadius: "50%", background: "#fff",
                                    boxShadow: "0 0 8px #2563eb,0 0 16px #7c3aed",
                                }} />
                            )}
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                        <span style={{ fontSize: 11, color: "#475569" }}>Loading{".".repeat(dotCount)}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#93c5fd" }}>{progress}%</span>
                    </div>
                </div>
            </div>

            {/* Tip */}
            <div style={{
                position: "absolute", bottom: 40,
                width: 320, textAlign: "center",
                animation: "tipIn 1s .5s ease both",
            }}>
                <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#334155", marginBottom: 6 }}>💡 Study Tip</div>
                <div style={{ fontSize: 12.5, color: "#93c5fd", fontWeight: 400, lineHeight: 1.6 }}>{tips[tipIndex]}</div>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-orb { from { transform: scale(1); } to { transform: scale(1.2); } }
        @keyframes logoGlow { from { box-shadow: 0 0 20px rgba(37,99,235,.3); } to { box-shadow: 0 0 40px rgba(37,99,235,.7); } }
        @keyframes bookBounce { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-4px) rotate(3deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: .6; } 90% { opacity: .2; } 100% { transform: translateY(-100vh); opacity: 0; } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(30px) scale(.95); } to { opacity: 1; transform: none; } }
        @keyframes tipIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      `}</style>
        </div>
    );
}

export default LoadingScreen;