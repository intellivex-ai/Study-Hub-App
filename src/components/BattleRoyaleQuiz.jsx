import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../hooks/useAuth';

export default function BattleRoyaleQuiz({
    roomId = 'public-battle',
    questions = [
        { id: 1, text: "What is the speed of light?", options: ["3x10^8 m/s", "3x10^5 m/s", "3x10^6 m/s"], correct: 0 },
        { id: 2, text: "Which element has atomic number 1?", options: ["Helium", "Hydrogen", "Oxygen"], correct: 1 }
    ]
}) {
    const { user } = useAuth();
    const [players, setPlayers] = useState({});
    const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
    const [curQuestionIdx, setCurQuestionIdx] = useState(0);
    const channelRef = useRef(null);
    const name = user?.user_metadata?.full_name || user?.email || 'Guest';

    useEffect(() => {
        if (!user) return;

        const channel = supabase.channel(`battle:${roomId}`, {
            config: { presence: { key: user.id }, broadcast: { self: true } }
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const newPlayers = {};
                for (const id in state) {
                    newPlayers[id] = { name: state[id][0].name, score: state[id][0].score || 0 };
                }
                setPlayers(newPlayers);
            })
            .on('broadcast', { event: 'game-start' }, () => {
                setCurQuestionIdx(0);
                setGameState('playing');
            })
            .on('broadcast', { event: 'answer' }, ({ payload }) => {
                setPlayers(prev => ({
                    ...prev,
                    [payload.userId]: { ...prev[payload.userId], score: (prev[payload.userId]?.score || 0) + payload.points }
                }));
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ name, score: 0 });
                }
            });

        channelRef.current = channel;

        return () => {
            channel.unsubscribe();
        };
    }, [user, roomId, name]);

    const startGame = () => {
        channelRef.current?.send({ type: 'broadcast', event: 'game-start', payload: {} });
    };

    const handleAnswer = (optionIdx) => {
        const isCorrect = optionIdx === questions[curQuestionIdx].correct;
        const points = isCorrect ? 100 : 0; // In a real app, calculate based on speed too.

        if (points > 0) {
            channelRef.current?.send({
                type: 'broadcast',
                event: 'answer',
                payload: { userId: user.id, points }
            });
            // Optimistic update for self
            setPlayers(prev => ({
                ...prev,
                [user.id]: { ...prev[user.id], score: (prev[user.id]?.score || 0) + points }
            }));
        }

        if (curQuestionIdx < questions.length - 1) {
            setCurQuestionIdx(c => c + 1);
        } else {
            setGameState('finished');
        }
    };

    const sortedPlayers = Object.entries(players).sort((a, b) => b[1].score - a[1].score);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-rose-500">local_fire_department</span>
                Battle Royale
            </h2>

            {gameState === 'waiting' && (
                <div className="text-center py-8">
                    <div className="text-4xl animate-bounce mb-4">🏆</div>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Waiting for players to join... ({Object.keys(players).length} in room)</p>
                    <button
                        onClick={startGame}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        Start Battle
                    </button>

                    <div className="mt-8">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Lobby</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {Object.values(players).map((p, i) => (
                                <div key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
                                    {p.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg">
                            Question {curQuestionIdx + 1} of {questions.length}
                        </span>
                        <span className="text-sm font-bold text-amber-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">stars</span>
                            {players[user?.id]?.score || 0} pts
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 leading-relaxed">
                        {questions[curQuestionIdx].text}
                    </h3>

                    <div className="space-y-3">
                        {questions[curQuestionIdx].options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(i)}
                                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all active:scale-[0.98] font-medium"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'finished' && (
                <div className="text-center py-8 animate-in zoom-in duration-500">
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Game Over!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Here are the final standings:</p>

                    <div className="space-y-3 max-w-sm mx-auto">
                        {sortedPlayers.map(([id, p], i) => (
                            <div key={id} className={`flex justify-between items-center p-4 rounded-2xl ${i === 0 ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 font-bold shadow-lg shadow-yellow-500/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-sm">
                                        {i + 1}
                                    </span>
                                    <span>{p.name} {id === user?.id ? '(You)' : ''}</span>
                                </div>
                                <span>{p.score} pts</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setGameState('waiting')}
                        className="mt-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline text-sm"
                    >
                        Back to Lobby
                    </button>
                </div>
            )}
        </div>
    );
}
