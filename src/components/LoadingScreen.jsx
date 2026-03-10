// src/components/LoadingScreen.jsx
import { useState, useEffect, useRef, useCallback } from "react";

const TIPS = [
    "Reviewing yesterday's notes boosts retention by 60%",
    "The Pomodoro technique improves focus in 25-minute blocks",
    "Spaced repetition is the most effective way to memorize",
    "Teaching what you learn helps you retain it 4× better",
    "Your brain consolidates memory during sleep — rest well",
    "Active recall beats re-reading by a factor of 3",
];

const STEPS = [
    { label: "Connecting to StudyHub", icon: "🔗", dur: 0.25 },
    { label: "Loading your subjects", icon: "📖", dur: 0.55 },
    { label: "Syncing flashcards", icon: "🃏", dur: 0.78 },
    { label: "Preparing AI tutor", icon: "🤖", dur: 0.92 },
    { label: "Ready!", icon: "✅", dur: 1.00 },
];

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${(i * 7.14) % 100}%`,
    bottom: `${(i * 9) % 45}%`,
    duration: `${5 + (i % 5)}s`,
    delay: `${(i * 0.38) % 4}s`,
    color: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"][i % 4],
    size: `${2 + (i % 2)}px`,
}));

export default function LoadingScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [dotCount, setDotCount] = useState(1);
    const [fadeOut, setFadeOut] = useState(false);
    const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
    const [tipVisible, setTipVisible] = useState(true);
    const doneRef = useRef(false);

    // Rotate tips every 2.5s with a fade transition
    useEffect(() => {
        const id = setInterval(() => {
            setTipVisible(false);
            setTimeout(() => {
                setTipIdx(i => (i + 1) % TIPS.length);
                setTipVisible(true);
            }, 350);
        }, 2500);
        return () => clearInterval(id);
    }, []);

    const handleComplete = useCallback(() => onComplete?.(), [onComplete]);

    useEffect(() => {
        doneRef.current = false;
        const dotTimer = setInterval(() => setDotCount(d => (d % 3) + 1), 500);
        const DURATION = 2800, TICK = 28, STEPS_COUNT = DURATION / TICK;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            const t = step / STEPS_COUNT;
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            setProgress(Math.min(Math.round(eased * 100), 100));

            if (step >= STEPS_COUNT) {
                clearInterval(timer);
                clearInterval(dotTimer);
                setProgress(100);
                doneRef.current = true;
                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(handleComplete, 550);
                }, 450);
            }
        }, TICK);

        return () => { clearInterval(timer); clearInterval(dotTimer); };
    }, [handleComplete]);

    const currentStep = STEPS.findIndex(s => progress / 100 < s.dur);
    const activeStep = currentStep === -1 ? STEPS.length - 1 : currentStep;

    return (
        <div style={{
            position: "fixed", inset: 0,
            background: "linear-gradient(160deg, #f0f4ff 0%, #f8fafc 60%, #eef2ff 100%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            overflow: "hidden",
            transition: "opacity .55s cubic-bezier(.4,0,.2,1), transform .55s cubic-bezier(.4,0,.2,1)",
            opacity: fadeOut ? 0 : 1,
            transform: fadeOut ? "scale(1.04)" : "scale(1)",
            zIndex: 9999,
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                @keyframes spin      { to { transform: rotate(360deg); } }
                @keyframes spinR     { to { transform: rotate(-360deg); } }
                @keyframes book      { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-5px) rotate(5deg)} }
                @keyframes glow      { from{box-shadow:0 4px 12px rgba(37,99,235,.25)} to{box-shadow:0 4px 28px rgba(37,99,235,.6)} }
                @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes floatUp   { 0%{transform:translateY(0);opacity:0} 10%{opacity:.55} 90%{opacity:.15} 100%{transform:translateY(-100vh);opacity:0} }
                @keyframes cardIn    { from{opacity:0;transform:translateY(28px) scale(.96)} to{opacity:1;transform:none} }
                @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:.25} }
                @keyframes fadeSlide { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
                @keyframes pulse     { 0%,100%{opacity:.6} 50%{opacity:1} }
                @keyframes topbar    { 0%{background-position:0% 0} 100%{background-position:200% 0} }
            `}</style>

            {/* Shimmer top bar */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "linear-gradient(90deg, #1d4ed8 0%, #3b82f6 40%, #60a5fa 70%, #1d4ed8 100%)",
                backgroundSize: "200% 100%",
                animation: "topbar 2s linear infinite",
            }} />

            {/* Ambient glow */}
            <div style={{
                position: "absolute",
                width: 600, height: 600,
                background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)",
                borderRadius: "50%",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                animation: "pulse 3.5s ease-in-out infinite",
                pointerEvents: "none",
            }} />

            {/* Floating particles */}
            {PARTICLES.map(p => (
                <div key={p.id} style={{
                    position: "absolute", borderRadius: "50%",
                    left: p.left, bottom: p.bottom,
                    width: p.size, height: p.size,
                    background: p.color, opacity: 0,
                    animation: `floatUp ${p.duration} ${p.delay} linear infinite`,
                    pointerEvents: "none",
                }} />
            ))}

            {/* Card */}
            <div style={{
                background: "#ffffff",
                borderRadius: 24,
                padding: "40px 36px 32px",
                width: 360,
                boxShadow: "0 8px 40px rgba(37,99,235,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 0,
                animation: "cardIn .65s cubic-bezier(.34,1.4,.64,1) both",
                position: "relative", zIndex: 1,
            }}>

                {/* Logo */}
                <div style={{ position: "relative", width: 76, height: 76, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        border: "2.5px solid transparent",
                        borderTopColor: "#2563eb", borderRightColor: "#93c5fd",
                        animation: "spin 1.1s linear infinite",
                    }} />
                    <div style={{
                        position: "absolute", inset: 8, borderRadius: "50%",
                        border: "1.5px solid transparent",
                        borderBottomColor: "rgba(37,99,235,0.3)",
                        animation: "spinR 2s linear infinite",
                    }} />
                    <div style={{
                        width: 52, height: 52,
                        background: "linear-gradient(145deg, #1d4ed8, #2563eb)",
                        borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center",
                        animation: "glow 2s ease-in-out infinite alternate",
                    }}>
                        <span style={{ fontSize: 24, animation: "book 1.8s ease-in-out infinite" }}>📚</span>
                    </div>
                </div>

                {/* Brand */}
                <div style={{ marginBottom: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.4px" }}>
                        <span style={{ color: "#2563eb" }}>Study</span>Hub
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: "1.8px", textTransform: "uppercase", marginTop: 3, fontWeight: 400 }}>
                        Preparing your workspace
                    </div>
                </div>

                {/* Divider */}
                <div style={{ width: "100%", height: 1, background: "#f1f5f9", margin: "18px 0 16px" }} />

                {/* Step list */}
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {STEPS.map((s, i) => {
                        const done = i < activeStep;
                        const active = i === activeStep;
                        return (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                opacity: done || active ? 1 : 0.35,
                                transition: "opacity .4s ease",
                            }}>
                                <div style={{
                                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 13,
                                    background: done ? "#eff6ff" : active ? "#dbeafe" : "#f8fafc",
                                    border: `1.5px solid ${done ? "#bfdbfe" : active ? "#2563eb" : "#e2e8f0"}`,
                                    transition: "all .3s ease",
                                    animation: active ? "pulse 1.2s ease-in-out infinite" : "none",
                                }}>
                                    {s.icon}
                                </div>
                                <span style={{
                                    fontSize: 12.5, fontWeight: active ? 600 : 400,
                                    color: active ? "#1e40af" : done ? "#64748b" : "#94a3b8",
                                    transition: "all .3s ease",
                                }}>
                                    {s.label}
                                </span>
                                {done && (
                                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#22c55e", fontWeight: 600 }}>✓</span>
                                )}
                                {active && (
                                    <span style={{ marginLeft: "auto", fontSize: 10, color: "#2563eb", fontWeight: 500, animation: "pulse 1s ease-in-out infinite" }}>
                                        Loading{".".repeat(dotCount)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%" }}>
                    <div style={{
                        width: "100%", height: 6,
                        background: "#e2e8f0",
                        borderRadius: 999, overflow: "hidden",
                        position: "relative",
                    }}>
                        <div style={{
                            height: "100%", width: `${progress}%`,
                            background: "linear-gradient(90deg, #1d4ed8, #2563eb, #3b82f6)",
                            backgroundSize: "200% 100%",
                            borderRadius: 999,
                            transition: "width .04s linear",
                            animation: "shimmer 2s linear infinite",
                            position: "relative",
                        }}>
                            {progress > 3 && (
                                <div style={{
                                    position: "absolute", right: -1, top: "50%",
                                    transform: "translateY(-50%)",
                                    width: 10, height: 10, borderRadius: "50%",
                                    background: "#fff",
                                    boxShadow: "0 0 0 2.5px #2563eb, 0 0 10px rgba(37,99,235,0.6)",
                                }} />
                            )}
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{
                                display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                                background: "#2563eb",
                                animation: "blink 1s ease-in-out infinite",
                            }} />
                            Initializing
                        </span>
                        <span style={{
                            fontSize: 12, fontWeight: 700, color: "#2563eb",
                            fontVariantNumeric: "tabular-nums",
                            minWidth: 38, textAlign: "right",
                        }}>{progress}%</span>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ width: "100%", height: 1, background: "#f1f5f9", margin: "18px 0 16px" }} />

                {/* Rotating tip */}
                <div style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
                    borderRadius: 12, padding: "10px 14px",
                    borderLeft: "3px solid #2563eb",
                    minHeight: 58,
                    display: "flex", flexDirection: "column", justifyContent: "center",
                }}>
                    <div style={{ fontSize: 10, color: "#2563eb", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5 }}>
                        💡 Study Tip
                    </div>
                    <div style={{
                        fontSize: 12, color: "#475569", lineHeight: 1.6, fontWeight: 400,
                        transition: "opacity .35s ease, transform .35s ease",
                        opacity: tipVisible ? 1 : 0,
                        transform: tipVisible ? "none" : "translateY(4px)",
                    }}>
                        {TIPS[tipIdx]}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                position: "absolute", bottom: 24,
                fontSize: 10, color: "#cbd5e1",
                letterSpacing: "1px", fontFamily: "monospace",
                userSelect: "none",
            }}>
                StudyHub v1.0 • intellivex-ai
            </div>
        </div>
    );
}