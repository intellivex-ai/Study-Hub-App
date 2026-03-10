// src/components/NavigationProgress.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const PAGES = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/subjects", label: "Subjects", icon: "📚" },
    { path: "/practice", label: "Practice", icon: "✏️" },
    { path: "/notes", label: "Notes", icon: "📝" },
    { path: "/flashcards", label: "Flashcards", icon: "🃏" },
    { path: "/focus", label: "Focus Timer", icon: "⏱️" },
    { path: "/ai-tutor", label: "AI Tutor", icon: "🤖" },
    { path: "/analytics", label: "Analytics", icon: "📊" },
    { path: "/profile", label: "Profile", icon: "👤" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
];

export default function NavigationProgress() {
    const location = useLocation();
    const [progress, setProgress] = useState(0);
    const [barVisible, setBarVisible] = useState(false);
    const [pillVisible, setPillVisible] = useState(false);
    const [pillLabel, setPillLabel] = useState("");
    const [pillIcon, setPillIcon] = useState("");

    const timerRef = useRef(null);
    const prevPathRef = useRef(location.pathname);

    useEffect(() => {
        if (location.pathname === prevPathRef.current) return;

        // Start animation
        const page = PAGES.find(p => p.path === location.pathname) || { label: "Page", icon: "📍" };

        clearInterval(timerRef.current);
        setPillLabel(page.label);
        setPillIcon(page.icon);
        setProgress(0);
        setBarVisible(true);
        setPillVisible(true);

        // Animate bar 0 → 90
        let p = 0;
        timerRef.current = setInterval(() => {
            p += p < 60 ? 10 : p < 85 ? 3 : 0.5;
            if (p >= 90) { p = 90; clearInterval(timerRef.current); }
            setProgress(p);
        }, 30);

        // Complete bar after a short delay (simulating page load)
        const timeout = setTimeout(() => {
            clearInterval(timerRef.current);
            setProgress(100);
            setPillVisible(false);

            setTimeout(() => {
                setBarVisible(false);
                setProgress(0);
            }, 400);
        }, 400);

        prevPathRef.current = location.pathname;

        return () => {
            clearInterval(timerRef.current);
            clearTimeout(timeout);
        };
    }, [location]);

    return (
        <>
            <style>{`
                @keyframes shimmerProgress { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes pillIn    { from{opacity:0;transform:translateX(-50%) translateY(10px) scale(.92)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
                @keyframes pillOut   { from{opacity:1;transform:translateX(-50%) scale(1)} to{opacity:0;transform:translateX(-50%) scale(.92)} }
                @keyframes glowPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
            `}</style>

            {/* ── TOP PROGRESS BAR ── */}
            {barVisible && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9999, pointerEvents: "none" }}>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(37,99,235,0.08)" }} />
                    <div style={{
                        position: "absolute", top: 0, left: 0, bottom: 0,
                        width: `${progress}%`,
                        background: "linear-gradient(90deg,#1d4ed8,#2563eb,#3b82f6,#93c5fd)",
                        backgroundSize: "200% 100%",
                        animation: "shimmerProgress 1s linear infinite",
                        transition: progress >= 100 ? "width .35s cubic-bezier(.4,0,.2,1)" : "width .05s linear",
                        borderRadius: "0 3px 3px 0",
                    }}>
                        {progress > 3 && (
                            <div style={{
                                position: "absolute", right: -2, top: "50%", transform: "translateY(-50%)",
                                width: 10, height: 10, borderRadius: "50%", background: "#fff",
                                boxShadow: "0 0 0 2.5px #2563eb, 0 0 12px 3px rgba(37,99,235,.7)",
                                animation: "glowPulse .75s ease-in-out infinite",
                            }} />
                        )}
                    </div>
                </div>
            )}

            {/* ── PILL ── */}
            <div style={{
                position: "fixed", top: 14, left: "50%", zIndex: 9998, pointerEvents: "none",
                animation: pillVisible ? "pillIn .25s cubic-bezier(.34,1.4,.64,1) both" : "pillOut .2s ease forwards",
                display: (!barVisible && !pillVisible) ? "none" : "block",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "#fff",
                    border: "1px solid rgba(37,99,235,0.18)",
                    borderRadius: 999, padding: "6px 16px 6px 12px",
                    boxShadow: "0 6px 20px rgba(37,99,235,0.15), 0 1px 4px rgba(0,0,0,0.05)",
                    whiteSpace: "nowrap",
                }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563eb", animation: "glowPulse .7s ease-in-out infinite", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Going to</span>
                    <span style={{ fontSize: 15 }}>{pillIcon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{pillLabel}</span>
                </div>
            </div>
        </>
    );
}

export function PageTransitionWrapper({ children }) {
    const location = useLocation();
    const containerRef = useRef(null);

    useEffect(() => {
        // Simple CSS-only or basic JS transition can go here
        // But Layout.jsx already has GSAP, so we can either move it here or keep it there.
        // Let's make this a simple group for semantic purposes for now.
    }, [location.pathname]);

    return (
        <div className="page-transition-container">
            {children}
        </div>
    );
}
