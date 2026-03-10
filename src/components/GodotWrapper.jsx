import { useEffect, useRef, useState } from 'react';

/**
 * GodotWrapper - Used to embed HTML5 exports from the Godot Engine.
 * Enables two-way communcation via the postMessage API.
 */
export default function GodotWrapper({ gameUrl = '/games/physics-sim/index.html', title = "Simulation" }) {
    const iframeRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [gameData, setGameData] = useState(null);

    useEffect(() => {
        // Listen for messages coming from the Godot iframe
        const handleMessage = (event) => {
            // In production, verify event.origin for security!

            try {
                // Godot generally sends JSON strings if formatted manually via JavaScript bridge
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                if (data.type === 'GODOT_LOADED') {
                    setIsLoaded(true);
                } else if (data.type === 'GAME_SCORE') {
                    setGameData(data.payload);
                }
            } catch (err) {
                // Ignore parsing errors for general iframe noise (like webpack-dev-server messages)
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Method to send data TO Godot
    const sendToGodot = (type, payload) => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({ type, payload }), '*');
        }
    };

    return (
        <div className="flex flex-col w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-2xl relative">
            {/* Header overlay for UI controls */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white font-bold tracking-wide">{title}</h3>

                <div className="flex gap-2">
                    {gameData && (
                        <span className="bg-indigo-500/80 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                            Score: {gameData.score}
                        </span>
                    )}
                    <button
                        onClick={() => sendToGodot('RESTART', {})}
                        className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
                    >
                        Restart
                    </button>
                    <button
                        onClick={() => {
                            if (document.fullscreenElement) {
                                document.exitFullscreen();
                            } else {
                                iframeRef.current?.parentElement?.requestFullscreen();
                            }
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
                    >
                        Fullscreen
                    </button>
                </div>
            </div>

            {/* Loading Cover */}
            {!isLoaded && (
                <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-slate-900">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mb-4" />
                    <p className="text-slate-400 animate-pulse font-medium">Loading Game Engine...</p>
                </div>
            )}

            {/* The actual Godot iframe */}
            <iframe
                ref={iframeRef}
                src={gameUrl}
                className="w-full aspect-[16/9] border-none z-1"
                allow="fullscreen; autoplay; encrypted-media"
                onLoad={() => setIsLoaded(true)} // Fallback if Godot doesn't emit GODOT_LOADED
            />
        </div>
    );
}
